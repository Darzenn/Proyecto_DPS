// UBICACIÓN: config/conexion.js
const mysql = require("mysql2");

const conexion = mysql.createConnection({
    host: "localhost",
    database: "hotel_nova", // <--- Asegúrate que este sea el nombre real en MySQL
    user: "root",
    password: "root" // <--- Tu contraseña (cámbiala si es diferente)
});

conexion.connect(function(err){
    if(err){
        console.error("❌ Error conectando a la BD: " + err.stack);
        return;
    }
    console.log("✅ Conexión exitosa a la Base de Datos 'hotel_nova'");
});

module.exports = conexion;