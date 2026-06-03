


case 'send':          
  try {
   const posting = await axios.post('http://localhost:9999/send', {
            smtp: {
              host: "smtp.gmail.com",
              port: 587,
              secure: false,
              auth: {
                user: "seu user da pass",
                pass: "sua pass"
             }                    
            },                        
            from: "seu user da pass",
            to: "enviarpara@gmail.com",
            subject: "Mensagem By Gusxtyz",
            text: "É o Gusxtyz via API"
            })
                        // send Message 
    await client.sendMessage(from, {text: `By gusxtyz`}, {quoted: info})
     // console log
     console.log("Email enviado com sucesso:", posting.data)
     }catch (err) {
    console.error("Falha ao enviar email:", err.message)
  }
break
