

// ==========================================================
// HOTEL CASANOVA - PANEL DE RECEPCIÓN
// Archivo: js/recepcion.js
// ==========================================================

const STORAGE_KEY_RESERVAS = "reservas_casanova_front_demo";

// Habitaciones base (igual que en la BD de ejemplo)
const habitacionesBase = [
    { numero: "J101", tipo: "Junior Suite", piso: 1 },
    { numero: "J102", tipo: "Junior Suite", piso: 1 },
    { numero: "E201", tipo: "Ejecutiva", piso: 2 },
    { numero: "M301", tipo: "Matrimonial", piso: 3 },
    { numero: "P401", tipo: "Panorámica", piso: 4 },
    { numero: "C501", tipo: "Clásica", piso: 5 },
    { numero: "ST601", tipo: "Estándar", piso: 6 },
    { numero: "INF1", tipo: "Infinity Suite", piso: 2 },
    { numero: "GOLD1", tipo: "Golden Suite", piso: 2 },
    { numero: "NOVA1", tipo: "Nova Suite", piso: 2 },
    { numero: "PS1", tipo: "Play Station", piso: 2 },
    { numero: "CIN1", tipo: "Cinema Suite", piso: 3 },
    { numero: "NINT1", tipo: "Nintendo Suite", piso: 3 },
    { numero: "BLK1", tipo: "Black Suite", piso: 3 }
];

// Helpers locales (para no depender de otros archivos)
function combinarFechaHora(fechaStr, horaStr) {
    if (!fechaStr || !horaStr) return null;
    const d = new Date(`${fechaStr}T${horaStr}:00`);
    return isNaN(d.getTime()) ? null : d;
}

function formatearFechaHora(date) {
    if (!date || isNaN(date.getTime())) return "—";
    const f = date.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
    const h = date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    return `${f} ${h}`;
}

// Cargar reservas desde localStorage
function cargarReservas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_RESERVAS);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        console.warn("No se pudieron leer las reservas del storage:", e);
        return [];
    }
}

// Construir estado de habitaciones a partir de base + reservas
function construirEstadoHabitaciones() {
    const reservas = cargarReservas();

    // Copiamos habitaciones base y agregamos campos de estado
    const habitaciones = habitacionesBase.map(h => ({
        ...h,
        estado: "DISPONIBLE",
        huesped: null,
        ingreso: null,
        salida: null
    }));

    // Por cada reserva simulada, asignamos una habitación del tipo
    reservas.forEach(res => {
        const tipo = res.tipoHabitacion;
        if (!tipo) return;

        // Buscamos una habitación de ese tipo
        const hab = habitaciones.find(h => h.tipo === tipo);
        if (!hab) return;

        // Reconstruimos fecha/hora de ingreso y de salida
        const ingreso = combinarFechaHora(res.fechaEntrada, res.horaEntrada);
        const salida = res.fechaSalida ? new Date(res.fechaSalida) : null;

        hab.estado = "OCUPADA";
        hab.huesped = res.nombre || "Huésped";
        hab.ingreso = ingreso;
        hab.salida = salida;
    });

    return habitaciones;
}

// Pintar tabla en el panel
function renderizarTabla(habitaciones) {
    const tbody = document.getElementById("tabla-recepcion");
    const estadoPanel = document.getElementById("estado-panel");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!habitaciones.length) {
        if (estadoPanel) {
            estadoPanel.textContent = "No hay habitaciones registradas.";
            estadoPanel.classList.add("estado-error");
        }
        return;
    }

    let disponibles = 0;
    let ocupadas = 0;
    let limpieza = 0;

    habitaciones.forEach(h => {
        if (h.estado === "DISPONIBLE") disponibles++;
        else if (h.estado === "OCUPADA") ocupadas++;
        else if (h.estado === "LIMPIEZA" || h.estado === "MANTENIMIENTO") limpieza++;

        const tr = document.createElement("tr");

        // Color de estado
        let colorEstado = "#1d8d42"; // verde
        if (h.estado === "OCUPADA") colorEstado = "#c62828";
        if (h.estado === "LIMPIEZA" || h.estado === "MANTENIMIENTO") colorEstado = "#f4b41a";

        tr.innerHTML = `
            <td style="padding:0.4rem; border-bottom:1px solid #eee;">${h.numero}</td>
            <td style="padding:0.4rem; border-bottom:1px solid #eee;">${h.tipo}</td>
            <td style="padding:0.4rem; border-bottom:1px solid #eee;">
                <span style="font-weight:600; color:${colorEstado};">${h.estado}</span>
            </td>
            <td style="padding:0.4rem; border-bottom:1px solid #eee;">${h.huesped || "—"}</td>
            <td style="padding:0.4rem; border-bottom:1px solid #eee;">${formatearFechaHora(h.ingreso)}</td>
            <td style="padding:0.4rem; border-bottom:1px solid #eee;">${formatearFechaHora(h.salida)}</td>
        `;

        tbody.appendChild(tr);
    });

    // Actualizar resumen
    const spanDisp = document.getElementById("resumen-disponibles");
    const spanOcup = document.getElementById("resumen-ocupadas");
    const spanLimp = document.getElementById("resumen-limpieza");

    if (spanDisp) spanDisp.textContent = disponibles;
    if (spanOcup) spanOcup.textContent = ocupadas;
    if (spanLimp) spanLimp.textContent = limpieza;

    if (estadoPanel) {
        estadoPanel.textContent = "Panel cargado correctamente. Datos basados en reservas simuladas.";
        estadoPanel.classList.remove("estado-error");
        estadoPanel.classList.add("estado-ok");
    }
}

// Inicializar panel al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const habitaciones = construirEstadoHabitaciones();
    renderizarTabla(habitaciones);
});

