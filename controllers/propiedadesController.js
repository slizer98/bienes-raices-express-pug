import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator';
import { Categoria, Precio, Propiedad } from '../models/index.js';

const admin = async(req, res) => {
    const { id } = req.usuario;

    const propiedades = await Propiedad.findAll({
        where:{
            usuarioId: id
        },
        include: [
            {model: Categoria, as: 'categoria'},
            {model: Precio, as: 'precio'}
        ]
    });
        
    res.render('propiedades/admin', {
        pagina: 'Mis Propiedades',
        propiedades,
        csrfToken: req.csrfToken()
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
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: []
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
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    // Crear un registro en la base de datos
    const { 
        titulo, 
        descripcion, 
        habitaciones, 
        estacionamientos, 
        wc, 
        calle,
        lat, 
        lng,
        precio: precioId, 
        categoria: categoriaId, 
    } = req.body;

    const {id: usuarioId} = req.usuario;
    
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: '',
        })

        const { id } = propiedadGuardada;
        res.redirect(`/propiedades/agregar-imagen/${id}`);
        
    } catch (error) {
        console.log(error)
    }
}

const agregarImagen = async(req, res) => {
    const { id } = req.params;
    
    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }

    // validar que la propiedad pertenezca al usuario
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }
    
    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    });
}

const almacenarImagen = async(req, res, next) => {
    const { id } = req.params;
    
    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }

    // validar que la propiedad pertenezca al usuario
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }
    try {
        const imagen = req.file;
        propiedad.imagen = imagen.filename;
        propiedad.publicado = true;
        await propiedad.save();
        setTimeout(() => {
            next();
        }, 3000);
        
    } catch (error) {
        console.log(error)
    }
}

const editar = async(req, res) => {

    const { id } = req.params;

    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }
    
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    
    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    });
}

const guardarCambios = async(req, res) => {
    
    // Verificar validacion
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias, 
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }
    const { id } = req.params;
    const propiedad = await Propiedad.findByPk(id);
    
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Reescribir  los valores
    try {
        const { 
            titulo, 
            descripcion, 
            habitaciones, 
            estacionamientos, 
            wc, 
            calle,
            lat, 
            lng,
            precio: precioId, 
            categoria: categoriaId, 
        } = req.body;

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
        })

        await propiedad.save();
        res.redirect('/mis-propiedades');
        
    } catch (error) {
        console.log(error)
    }
}

const eliminar = async(req, res) => {
    const { id } = req.params;
    const propiedad = await Propiedad.findByPk(id);
    
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }
    // Eliminar la imagen
    await unlink(`public/uploads/${propiedad.imagen}`);

    // Eliminar la propiedad
    await propiedad.destroy();
    res.redirect('/mis-propiedades');
}

export {
    admin,
    agregarImagen,
    almacenarImagen,
    crear,
    editar,
    eliminar,
    guardar,
    guardarCambios
}