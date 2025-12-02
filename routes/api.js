const express = require('express');
const router = express.Router();
const db = require('../config/conexion');

// --------------------------------------------------------------------------------
// 1. DISPONIBILIDAD (El cerebro que actualiza MySQL automáticamente)
// --------------------------------------------------------------------------------
router.get('/disponibilidad', (req, res) => {
    const { checkin, checkout } = req.query;

    // CASO A: Si el cliente busca fechas específicas (Futuro)
    if (checkin && checkout) {
        const sql = `
            SELECT tipo, COUNT(*) as total 
            FROM habitaciones 
            WHERE id NOT IN (
                SELECT id_habitacion FROM reservas 
                WHERE (? < fecha_checkout AND ? > fecha_checkin)
            )
            GROUP BY tipo
        `;
        db.query(sql, [checkin, checkout], (err, resultados) => {
            if (err) return res.status(500).json([]);
            res.json(resultados);
        });

    } else {
        // CASO B: Estado Actual ("HOY")
        // Aquí es donde hacemos que MySQL se actualice solo
        
        // 1. Primero liberamos TODO preventivamente
        db.query("UPDATE habitaciones SET estado = 'disponible'", (err) => {
            if (err) console.error("Error reset:", err);

            // 2. Buscamos qué reservas están activas HOY y bloqueamos esas habitaciones
            const sqlActualizar = `
                UPDATE habitaciones SET estado = 'ocupado' 
                WHERE id IN (
                    SELECT id_habitacion FROM reservas 
                    WHERE CURDATE() >= fecha_checkin AND CURDATE() < fecha_checkout
                )
            `;

            db.query(sqlActualizar, (err) => {
                if (err) console.error("Error update:", err);

                // 3. Finalmente devolvemos el conteo real de hoy
                const sqlContar = "SELECT tipo, COUNT(*) as total FROM habitaciones WHERE estado = 'disponible' GROUP BY tipo";
                db.query(sqlContar, (err, resultados) => {
                    if (err) return res.status(500).json([]);
                    res.json(resultados);
                });
            });
        });
    }
});

// --------------------------------------------------------------------------------
// 2. USUARIO ACTUAL
// --------------------------------------------------------------------------------
router.get('/usuario_actual', (req, res) => {
    if (req.session.loggedin) res.json(req.session.usuario);
    else res.status(401).json(null);
});

// --------------------------------------------------------------------------------
// 3. MIS RESERVAS
// --------------------------------------------------------------------------------
router.get('/mis_reservas', (req, res) => {
    if (!req.session.loggedin) return res.status(401).json([]);
    const sql = `SELECT r.*, h.nombre as nombre_habitacion, h.tipo FROM reservas r JOIN habitaciones h ON r.id_habitacion = h.id WHERE r.id_usuario = ? ORDER BY r.id DESC`;
    db.query(sql, [req.session.usuario.id], (err, rows) => res.json(err ? [] : rows));
});

// --------------------------------------------------------------------------------
// 4. DETALLE BOLETA
// --------------------------------------------------------------------------------
router.get('/reserva_detalle/:id', (req, res) => {
    if (!req.session.loggedin) return res.status(401).send("No autorizado");
    const sql = `SELECT r.*, h.nombre as nombre_habitacion, h.tipo, u.nombre_completo, u.email FROM reservas r JOIN habitaciones h ON r.id_habitacion = h.id JOIN usuarios u ON r.id_usuario = u.id WHERE r.id = ? AND r.id_usuario = ?`;
    db.query(sql, [req.params.id, req.session.usuario.id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json(null);
        res.json(result[0]);
    });
});

// --------------------------------------------------------------------------------
// 5. LOGIN
// --------------------------------------------------------------------------------
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM usuarios WHERE email = ? AND password = ?", [email, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            req.session.loggedin = true;
            req.session.usuario = result[0];
            res.redirect('/');
        } else {
            res.send('<script>alert("Credenciales incorrectas"); window.location="/login";</script>');
        }
    });
});

// --------------------------------------------------------------------------------
// 6. GUARDAR RESERVA
// --------------------------------------------------------------------------------
router.post('/reservar', (req, res) => {
    if (!req.session.loggedin) return res.redirect('/login');

    const { tipo_habitacion, checkin, checkout } = req.body;
    const id_usuario = req.session.usuario.id;

    // Validar fechas
    const f1 = new Date(checkin);
    const f2 = new Date(checkout);
    const dias = Math.ceil((f2 - f1) / (1000 * 60 * 60 * 24));

    if (dias <= 0) return res.send("<h1>Fechas inválidas</h1><a href='/reservar'>Volver</a>");

    // BUSCAR HABITACIÓN DISPONIBLE POR FECHAS
    const sqlBuscar = `
        SELECT id, precio, nombre 
        FROM habitaciones 
        WHERE tipo = ? 
        AND id NOT IN (
            SELECT id_habitacion FROM reservas 
            WHERE (fecha_checkin < ? AND fecha_checkout > ?)
        )
        LIMIT 1
    `;
    
    db.query(sqlBuscar, [tipo_habitacion, checkout, checkin], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const habitacion = result[0];
            const total_pago = dias * habitacion.precio;

            const sqlInsert = "INSERT INTO reservas (id_usuario, id_habitacion, fecha_checkin, fecha_checkout, total_pago, estado_reserva) VALUES (?, ?, ?, ?, ?, 'confirmada')";
            
            db.query(sqlInsert, [id_usuario, habitacion.id, checkin, checkout, total_pago], (err, resultInsert) => {
                if (err) throw err;
                res.redirect('/boleta?id=' + resultInsert.insertId);
            });
        } else {
            res.send(`
                <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                    <h1>⚠️ Lo sentimos</h1>
                    <p>No hay habitaciones "${tipo_habitacion}" disponibles para las fechas: <br> 
                    <b>${checkin}</b> al <b>${checkout}</b>.</p>
                    <a href='/habitaciones'>Intentar otras fechas</a>
                </div>
            `);
        }
    });
});

// --------------------------------------------------------------------------------
// 7. REGISTRAR USUARIO NUEVO (¡NUEVO!)
// --------------------------------------------------------------------------------
router.post('/registro', (req, res) => {
    const { nombre, email, password, telefono } = req.body;
    
    // 1. Verificar si el correo ya existe
    db.query("SELECT email FROM usuarios WHERE email = ?", [email], (err, result) => {
        if(err) throw err;
        
        if(result.length > 0) {
            return res.send('<script>alert("Este correo ya está registrado"); window.location="/registro";</script>');
        }
        
        // 2. Crear usuario
        const sqlInsert = "INSERT INTO usuarios (nombre_completo, email, password, telefono, rol) VALUES (?, ?, ?, ?, 'cliente')";
        db.query(sqlInsert, [nombre, email, password, telefono], (err) => {
            if(err) throw err;
            res.send('<script>alert("¡Cuenta creada con éxito! Ahora inicia sesión."); window.location="/login";</script>');
        });
    });
});

module.exports = router;