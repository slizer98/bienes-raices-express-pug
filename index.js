import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import db from "./config/db.js";

const app = express();

try {
    await db.authenticate();
    console.log('Base de datos conectada');
} catch (error) {
    console.log(error);
}

// Habilitar pug
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

// Routing
app.use('/auth', usuarioRoutes);

app.use((req, res, next) => {
    res.status(404).send('<h1>Page not found</h1>');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor funcionando en el puerto: ${port}, http://localhost:${port}/auth/login`);
});