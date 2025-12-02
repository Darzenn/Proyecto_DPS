const express = require('express');
const router = express.Router();
const path = require('path');

// 1. Inicio
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// 2. Catálogo
router.get('/habitaciones', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/habitaciones.html'));
});

// 3. Reservar
router.get('/reservar', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/reservar.html'));
});

// 4. Login
router.get('/login', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/perfil');
    } else {
        res.sendFile(path.join(__dirname, '../views/login.html'));
    }
});

// 5. Perfil
router.get('/perfil', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, '../views/perfil.html'));
    } else {
        res.redirect('/login');
    }
});

// 6. Boleta
router.get('/boleta', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, '../views/boleta.html'));
    } else {
        res.redirect('/login');
    }
});

// 7. Cerrar Sesión
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 8. REGISTRO (¡AQUÍ ESTÁ LA CORRECCIÓN!)
// Antes decía: res.send('Construcción...')
// Ahora dice: res.sendFile('registro.html')
router.get('/registro', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/'); // Si ya está logueado, no necesita registrarse
    } else {
        res.sendFile(path.join(__dirname, '../views/registro.html'));
    }
});

module.exports = router;