const express = require('express');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9999;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const emailSchema = Joi.object({
smtp: Joi.object({
host: Joi.string().required(),
port: Joi.number().required(),
secure: Joi.boolean().default(false),
auth: Joi.object({
user: Joi.string().required(),
pass: Joi.string().required()
}).required()
}).required(),
from: Joi.string().email().required(),
to: Joi.string().required(),
cc: Joi.string().allow('', null),
bcc: Joi.string().allow('', null),
subject: Joi.string().required(),
text: Joi.string().allow('', null),
html: Joi.string().allow('', null),
attachments: Joi.array().items(
Joi.object({
filename: Joi.string().required(),
content: Joi.alternatives().conditional(Joi.string(), {
then: Joi.string(),
otherwise: Joi.binary()
}).required(),
encoding: Joi.string().valid('base64', 'utf-8').default('utf-8'),
contentType: Joi.string().allow('', null)
})
).default([])
});

app.post('/send', async (req, res) => {
const { error, value } = emailSchema.validate(req.body, { abortEarly: false });

if (error) {
return res.status(400).json({
success: false,
message: 'Validação falhou',
details: error.details.map(d => d.message)
});
}

const { smtp, from, to, cc, bcc, subject, text, html, attachments } = value;

const transporter = nodemailer.createTransport({
host: smtp.host,
port: smtp.port,
secure: smtp.secure,
auth: smtp.auth
});

const processedAttachments = await Promise.all(attachments.map(async (att) => {
if (fs.existsSync(att.content)) {
return {
filename: att.filename,
path: att.content,
contentType: att.contentType
};
}
return {
filename: att.filename,
content: att.content,
encoding: att.encoding,
contentType: att.contentType
};
}));

const mailOptions = {
from,
to: to.split(',').map(s => s.trim()),
subject,
text: text || '',
html: html || '',
attachments: processedAttachments
};

if (cc) mailOptions.cc = cc.split(',').map(s => s.trim());
if (bcc) mailOptions.bcc = bcc.split(',').map(s => s.trim());

try {
const info = await transporter.sendMail(mailOptions);
res.json({
success: true,
message: 'Email enviado com sucesso',
messageId: info.messageId,
accepted: info.accepted,
rejected: info.rejected
});
} catch (err) {
res.status(500).json({
success: false,
message: 'Falha no envio',
error: err.message
});
}
});

app.listen(PORT, () => {
console.log(`Api na porta ${PORT}`);
});
