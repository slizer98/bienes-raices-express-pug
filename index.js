import express from "express";
import scrf from  'csurf';
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import db from "./config/db.js";

const app = express();
app.use(express.urlencoded({ extended: true }));

// habilitar cookie parser
app.use(cookieParser());

// habilitar crsf
app.use(scrf({cookie: true}));

try {
    await db.authenticate();
    db.sync();
    console.log('Base de datos conectada');
} catch (error) {
    console.log(error);
}

// Habilitar pug
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

// Routing
app.use('/', appRoutes);
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);

app.use((req, res, next) => {
    res.status(404).send('<h1>Page not found</h1>');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor funcionando en el puerto: ${port}, http://localhost:${port}/auth/login`);
});