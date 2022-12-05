import { check, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import { generarId } from '../helpers/token.js'
import { emailRegistro } from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    });
};
const formularioRegistro = (req, res) => {
    res.render('auth/registro', { 
        pagina: 'Crear Cuenta' 
    });
};

const registrar = async(req, res) => {
    await check('nombre', 'El nombre es obligatorio').notEmpty().run(req);
    await check('email', 'El email no es valildo').isEmail().run(req);
    await check('password', 'El password debe tener al menos 6 caracteres').isLength({min: 6}).run(req);
    await check('repetir_password', 'Los passwords no coinciden').equals(req.body.password).run(req);

    let resultado = validationResult(req);
    // imprimir errores
    
    if(!resultado.isEmpty()){
        return res.render('auth/registro', { 
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        });
    }

    const { nombre, email, password } = req.body;
    
    // verificar que el usuario no exista
    const existeUsuario = await Usuario.findOne({where:{email}});
    if(existeUsuario){
        return res.render('auth/registro', { 
            pagina: 'Crear Cuenta',
            errores: [{msg: 'El usuario ya esta registrado'}],
            usuario: {
                nombre,
                email
            }
        });
    }
    
    // almacenar usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId(),
    });

    //  enviar email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un correo de confirmacion. preciona en el enlace'
    });

};

const confirmar = async(req, res) => {
    const { token } = req.params;
    
    // verificar que el token es valido
    const usuario = await Usuario.findOne({where:{token}});
    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al Confirmar tu Cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        });
    }

    // confirmar cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();
    
    return res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente',
    });
};

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recuperar acceso'
    });
};


export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar
}