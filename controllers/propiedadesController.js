import { validationResult } from 'express-validator';
import Categoria from "../models/Categoria.js";
import Precio from "../models/Precio.js";

const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina: 'Mis Propiedades',
        barra: true
    });
}

const crear = async(req, res) => {
    // consultar modelo de precio y categorias 
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    
    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios
    });
}

const guardar = async(req, res) => {
    // Validacion 
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            barra: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array()
        })
    }
}

export {
    admin,
    crear,
    guardar
}