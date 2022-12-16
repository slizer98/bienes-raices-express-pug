import express from 'express';
import { inicio, categoria, buscador, noEncontrado } from '../controllers/appController.js';

const router = express.Router();

// Pagina de inico 
router.get('/', inicio);

// Categorias
router.get('/categoria/:id', categoria);

// Buscador
router.post('buscador', buscador);
// pagina 404
router.get('/404', noEncontrado);


export default router;