import express from 'express';
import { body } from 'express-validator'
import { 
    admin, 
    agregarImagen, 
    almacenarImagen, 
    crear, 
    editar, 
    eliminar,
    guardar,
    guardarCambios,     
    mostrarPropiedad
} from '../controllers/propiedadesController.js';
import protegerRuta from '../middleware/protegerRuta.js';
import upload from '../middleware/subirImagen.js';

const router = express.Router();

router.get('/mis-propiedades',protegerRuta, admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripcion del anuncio es obligatoria')
        .isLength({max: 200}).withMessage('La descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona el numero de habitaciones'),
    body('estacionamientos').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('La Ubicaion en el mapa es obligatoria'),
    guardar
    )
router.get('/propiedades/agregar-imagen/:id', protegerRuta ,agregarImagen)    
router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)    

router.get('/propiedades/editar/:id', protegerRuta, editar)
router.post('/propiedades/editar/:id',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripcion del anuncio es obligatoria')
        .isLength({max: 200}).withMessage('La descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona el numero de habitaciones'),
    body('estacionamientos').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('La Ubicaion en el mapa es obligatoria'),
    guardarCambios
    )

router.post('/propiedades/eliminar/:id', protegerRuta, eliminar)

// Area publica
router.get('/propiedad/:id', mostrarPropiedad)

export default router;