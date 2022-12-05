import nodemailer from 'nodemailer';

const emailRegistro = async(datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const { nombre, email, token } = datos;

      // enviar el correo
      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta de BienesRaices.com',
        text: 'Confirma tu cuenta de BienesRaices.com',
        html: `
            <h3>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</h3>
            <p>Tu cuenta ya esta, lista solo debes confirmarla en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta </a></p>
            <p> Si no has creado una cuenta en BienesRaices.com, ignora este correo</p>
        `
      });
};

export { 
    emailRegistro 
};