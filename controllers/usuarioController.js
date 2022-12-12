import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { generarId, generarJWT } from '../helpers/token.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken(),
    });
};

const autenticar = async(req, res) => {
    // validacion 
    await check('email', 'El email no es valildo').isEmail().run(req);
    await check('password', 'El password es obligatorio').notEmpty().run(req);

    let resultado = validationResult(req);
    // imprimir errores
    
    if(!resultado.isEmpty()){
        return res.render('auth/login', { 
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    // Comprobar si el usuario existe
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({where:{email}});
    if(!usuario){
        return res.render('auth/login', { 
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario No existe'}],
        });
    }
    // comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login', { 
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}],
        });
    }

    // comprobar el password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', { 
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El password es incorrecto'}],
        });
    }

    // autenticar al usuario
    const token = generarJWT({id:usuario.id, nombre: usuario.nombre});

    // Almacenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true
    }).redirect('/mis-propiedades');
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', { 
        pagina: 'Crear Cuenta' ,
        csrfToken: req.csrfToken()
    });
};

const registrar = async(req, res) => {
    await check('nombre', 'El nombre es obligatorio').notEmpty().run(req);
    await check('email', 'El email no es valildo').isEmail().run(req);
    await check('password', 'El password debe tener al menos 6 caracteres').isLength({min: 6}).run(req);
    await check('repetir_password', 'Los passwords no coinciden').equals(req.body.password).run(req);

    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        return res.render('auth/registro', { 
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
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
            csrfToken: req.csrfToken(),
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
        pagina: 'Recuperar acceso',
        csrfToken: req.csrfToken(),
    });
};

const resetPassword = async(req, res) => {
    // validaciones
    await check('email', 'El email no es valildo').isEmail().run(req);
    let resultado = validationResult(req);
    // imprimir errores
    
    if(!resultado.isEmpty()){
        return res.render('auth/olvide-password', { 
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    // Buscar el usuario
    const { email } = req.body;
    const usuario = await Usuario.findOne({where:{email}});
    if(!usuario){
        return res.render('auth/olvide-password', { 
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'No existe la cuenta con ese email'}],
        });
    }

    // generar un token y enviar email
    usuario.token = generarId();
    await usuario.save();

    // enviar email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token 
    })
    // renderizar mensaje
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu password',
        mensaje: 'Hemos enviado un email con las instrucciones para recuperar tu acceso'
    });
};

const comprobarToken = async(req, res) => {
    const { token } = req.params;
    const usuario = await Usuario.findOne({where:{token}});

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'reestablece tu password',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true
        });
    }

    // mostrar formulario para reestablecer password
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu password',
        csrfToken: req.csrfToken(),
    });
};

const nuevoPassword = async(req, res) => {
    // validar el password
    await check('password', 'El password debe tener al menos 6 caracteres').isLength({min: 6}).run(req);
    let resultado = validationResult(req);
    // imprimir errores
    if(!resultado.isEmpty()){
        return res.render('auth/reset-password', { 
            pagina: 'Reestablece tu password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }
    // identificar quien hace el cambio
    const { token } = req.params;
    const { password } = req.body;
    const usuario = await Usuario.findOne({where:{token}});
    
    // hashear el password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    // redireccionar
    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Actualizado',
        mensaje: 'El password se actualizo correctamente',
    });
};

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar
}