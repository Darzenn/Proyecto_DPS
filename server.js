// UBICACIÓN: server.js
const express = require('express');
const path = require('path');
const session = require('express-session'); // 1. Importar librería
const app = express();

// --- 2. MIDDLEWARES (Configuraciones básicas) ---
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. CONFIGURACIÓN DE SESIÓN (¡OBLIGATORIO ANTES DE LAS RUTAS!) ---
// Si pones esto después de las rutas, el login NO funcionará.
app.use(session({
    secret: 'secreto_hotel_casanova',
    resave: false,
    saveUninitialized: true
}));

// --- 4. IMPORTAR Y USAR RUTAS ---
const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api'); 

app.use('/', indexRoutes);      // Rutas de Vistas (HTML)
app.use('/api', apiRoutes);     // Rutas de Datos (Base de Datos)

// --- 5. INICIAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🎮 Servidor del Hotel Casanova listo!`);
    console.log(`👉 Entra aquí: http://localhost:${PORT}`);
});