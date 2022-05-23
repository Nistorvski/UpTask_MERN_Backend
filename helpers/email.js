import nodemailer from 'nodemailer';

export const emailRegistro =  async(datos) => {
    
    const { email, nombre, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <lucian.nistorvsky@gmail.com>',
        to:email,
        subject:"UpTask - Comprueba tu cuenta",
        text : "Comprueba tu cuenta de UpTask",
        html : `
            <p> Hola ${nombre} Comprueba tu cuenta en UpTask </p>

            <p> Tu cuenta ya está casi lista, solo debes comprobar en el siguiente  enlace : </p>
        
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}" >Comprobar Centa</a>

            <p>Si tu no creaste esta cuneta puedes ignorar el mensaje</p>
        `
    })
    
}


export const emailOlvidePassword =  async(datos) => {
    
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
    });

  const info = await transport.sendMail({
      from: '"UpTask - Administrador de Proyectos" <lucian.nistorvsky@gmail.com>',
      to:email,
      subject:"UpTask - Reestablece tu Password",
      text : "Reestablece tu Password",
      html : `
          <p> Hola ${nombre} has solicitado reestablecer tu password </p>

          <p> Sigue el siguiente enlace para generar un nuevo password: </p>
      
          <a href="${process.env.FRONTEND_URL}/olvide-password/${token}" >Reestablecer password</a>

          <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
      `
  })
  
}