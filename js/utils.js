
// ==========================================================
// HOTEL CASANOVA - UTILIDADES GENERALES
// Archivo: js/utils.js
// Proyecto académico UTP
// ==========================================================

/* ----------------------------------------------------------
   1) Obtener parámetros de la URL (ej: ?tipo=junior)
---------------------------------------------------------- */
function getQueryParams() {
    const params = {};
    const query = window.location.search.substring(1).split("&");

    for (let param of query) {
        if (!param) continue;
        const [key, value] = param.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent((value || "").replace(/\+/g, " "));
    }
    return params;
}

/* ----------------------------------------------------------
   2) Generar un ID único (para simulación de reservas)
---------------------------------------------------------- */
function generarIdUnico(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

/* ----------------------------------------------------------
   3) Combinar fecha + hora a objeto Date
---------------------------------------------------------- */
function combinarFechaHora(fechaStr, horaStr) {
    if (!fechaStr || !horaStr) return null;
    const date = new Date(`${fechaStr}T${horaStr}:00`);
    return isNaN(date.getTime()) ? null : date;
}

/* ----------------------------------------------------------
   4) Sumar horas a un objeto Date
---------------------------------------------------------- */
function sumarHoras(fecha, horas) {
    const nueva = new Date(fecha.getTime());
    nueva.setHours(nueva.getHours() + horas);
    return nueva;
}

/* ----------------------------------------------------------
   5) Formatear fecha y hora -> "26/11/2025 14:00"
---------------------------------------------------------- */
function formatearFechaHora(date) {
    if (!date || isNaN(date.getTime())) return "—";
    const fecha = date.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
    const hora = date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    return `${fecha} ${hora}`;
}

/* ----------------------------------------------------------
   6) Validaciones
---------------------------------------------------------- */
function validarEmail(email) {
    return email.includes("@") && email.includes(".");
}

function validarTelefono(tel) {
    return /^[0-9]{6,12}$/.test(tel);
}

function validarDNI(dni) {
    return /^[0-9]{8}$/.test(dni);
}

/* ----------------------------------------------------------
   7) Guardar y leer JSON del localStorage
---------------------------------------------------------- */
function guardarEnStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.warn("Error guardando en storage:", e);
        return false;
    }
}

function leerDeStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn("Error leyendo storage:", e);
        return null;
    }
}

/* ----------------------------------------------------------
   8) Mostrar alertas en la página (sin librerías)
---------------------------------------------------------- */
function mostrarAlerta(mensaje, tipo = "info", tiempo = 2500) {
    const alert = document.createElement("div");
    alert.textContent = mensaje;
    alert.className = `alerta alerta-${tipo}`;
    document.body.appendChild(alert);

    setTimeout(() => alert.classList.add("show"), 10);
    setTimeout(() => {
        alert.classList.remove("show");
        setTimeout(() => alert.remove(), 300);
    }, tiempo);
}

/* ----------------------------------------------------------
   9) Detectar rango de días (L-J / V-D)
---------------------------------------------------------- */
function obtenerRangoDias(fechaStr) {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return null;

    const dia = fecha.getDay(); // 0 domingo, 1 lunes...
    return (dia >= 1 && dia <= 4) ? "LJ" : "VD";
}

/* ----------------------------------------------------------
   10) Determinar si una habitación es temática
---------------------------------------------------------- */
function esHabitacionTematica(tipo) {
    const tematicas = [
        "Infinity Suite",
        "Golden Suite",
        "Nova Suite",
        "Play Station",
        "Cinema Suite",
        "Nintendo Suite",
        "Black Suite"
    ];
    return tematicas.includes(tipo);
}

