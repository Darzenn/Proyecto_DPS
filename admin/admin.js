
// ==========================================================
// HOTEL CASANOVA - ADMIN (LOGIN + PANEL)
// Archivo: js/admin.js
// ==========================================================

const STORAGE_KEY_RESERVAS = "reservas_casanova_front_demo";

// Mapa de tarifas (igual que en reservas.js)
const tarifasHorasAdmin = {
    "Junior Suite": {
        LJ: { 6: 85, 12: 119 },
        VD: { 5: 90, 8: 129 }
    },
    "Ejecutiva": {
        LJ: { 6: 60, 12: 85 },
        VD: { 5: 65, 8: 95 }
    },
    "Matrimonial": {
        LJ: { 6: 50, 12: 75 },
        VD: { 5: 55, 8: 85 }
    },
    "Panorámica": {
        LJ: { 6: 45, 12: 65 },
        VD: { 5: 50, 8: 80 }
    },
    "Clásica": {
        LJ: { 6: 40, 12: 60 },
        VD: { 5: 45, 8: 70 }
    },
    "Estándar": {
        LJ: { 6: 35, 12: 55 },
        VD: { 5: 40, 8: 65 }
    },
    "Infinity Suite": {
        LV: { 5: 160, 8: 199 }
    },
    "Golden Suite": {
        LV: { 5: 140, 8: 209 }
    },
    "Nova Suite": {
        LV: { 5: 130, 8: 199 }
    },
    "Play Station": {
        LV: { 5: 130, 8: 199 }
    },
    "Cinema Suite": {
        LV: { 5: 125 }
    },
    "Nintendo Suite": {
        LV: { 5: 110 }
    },
    "Black Suite": {
        LV: { 5: 85 }
    }
};

const tiposHabitacionAdmin = [
    { nombre: "Junior Suite", clasificacion: "Básica (con jacuzzi)" },
    { nombre: "Ejecutiva", clasificacion: "Básica" },
    { nombre: "Matrimonial", clasificacion: "Básica" },
    { nombre: "Panorámica", clasificacion: "Básica" },
    { nombre: "Clásica", clasificacion: "Básica" },
    { nombre: "Estándar", clasificacion: "Básica económica" },
    { nombre: "Infinity Suite", clasificacion: "Temática" },
    { nombre: "Golden Suite", clasificacion: "Temática" },
    { nombre: "Nova Suite", clasificacion: "Temática" },
    { nombre: "Play Station", clasificacion: "Temática gamer" },
    { nombre: "Cinema Suite", clasificacion: "Temática cine" },
    { nombre: "Nintendo Suite", clasificacion: "Temática gamer" },
    { nombre: "Black Suite", clasificacion: "Temática" }
];

// ---------- helpers ----------
function leerReservasDemo() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_RESERVAS);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        console.warn("No se pudieron leer reservas del storage:", e);
        return [];
    }
}

// ---------- LOGIN ----------
function initLoginAdmin() {
    const form = document.getElementById("form-login-admin");
    const estado = document.getElementById("login-admin-estado");
    if (!form) return; // no estamos en login.html

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("adminEmail").value.trim();
        const pass = document.getElementById("adminPassword").value.trim();

        if (!email || !pass) {
            estado.textContent = "Ingresa tu correo y contraseña.";
            estado.classList.remove("estado-ok");
            estado.classList.add("estado-error");
            return;
        }

        // Credenciales DEMO
        const demoEmail = "admin@casanova.pe";
        const demoPass = "admin123";

        if (email === demoEmail && pass === demoPass) {
            estado.textContent = "✔ Acceso correcto. Redirigiendo al panel de administrador...";
            estado.classList.remove("estado-error");
            estado.classList.add("estado-ok");

            setTimeout(() => {
                window.location.href = "panel.html";
            }, 900);
        } else {
            estado.textContent = "Correo o contraseña incorrectos (simulación).";
            estado.classList.remove("estado-ok");
            estado.classList.add("estado-error");
        }
    });
}

// ---------- PANEL ----------
function pintarResumen(reservas) {
    const spanRes = document.getElementById("adm-reservas");
    const spanIng = document.getElementById("adm-ingreso");
    const spanTem = document.getElementById("adm-tematicas");
    const spanBas = document.getElementById("adm-basicas");

    if (spanRes) spanRes.textContent = reservas.length.toString();

    let total = 0;
    reservas.forEach(r => {
        if (typeof r.total === "number") total += r.total;
    });
    if (spanIng) spanIng.textContent = `S/ ${total.toFixed(2)}`;

    let tem = 0;
    let bas = 0;
    tiposHabitacionAdmin.forEach(t => {
        if (t.clasificacion.toLowerCase().includes("temática")) tem++;
        else bas++;
    });
    if (spanTem) spanTem.textContent = tem.toString();
    if (spanBas) spanBas.textContent = bas.toString();
}

function pintarTiposHabitacion() {
    const tbody = document.getElementById("tabla-tipos-hab");
    if (!tbody) return;

    tbody.innerHTML = "";
    tiposHabitacionAdmin.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="padding:0.4rem; border-bottom:1px solid #eee;">${t.nombre}</td>
            <td style="padding:0.4rem; border-bottom:1px solid #eee;">${t.clasificacion}</td>
        `;
        tbody.appendChild(tr);
    });
}

function pintarTarifas() {
    const tbody = document.getElementById("tabla-tarifas");
    if (!tbody) return;

    tbody.innerHTML = "";
    Object.keys(tarifasHorasAdmin).forEach(tipo => {
        const rangos = tarifasHorasAdmin[tipo];
        Object.keys(rangos).forEach(rango => {
            const horasObj = rangos[rango];
            Object.keys(horasObj).forEach(horas => {
                const precio = horasObj[horas];
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="padding:0.4rem; border-bottom:1px solid #eee;">${tipo}</td>
                    <td style="padding:0.4rem; border-bottom:1px solid #eee;">${rango}</td>
                    <td style="padding:0.4rem; border-bottom:1px solid #eee;">${horas} H</td>
                    <td style="padding:0.4rem; border-bottom:1px solid #eee;">S/ ${precio.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        });
    });
}

function initPanelAdmin() {
    // Si no existe uno de estos elementos, significa que no estamos en panel.html
    const spanRes = document.getElementById("adm-reservas");
    if (!spanRes) return;

    const reservas = leerReservasDemo();
    pintarResumen(reservas);
    pintarTiposHabitacion();
    pintarTarifas();
}

// ---------- INICIALIZAR SEGÚN LA PÁGINA ----------
document.addEventListener("DOMContentLoaded", () => {
    initLoginAdmin();
    initPanelAdmin();
});
