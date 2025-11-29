
// ==========================================================
// HOTEL CASANOVA - JS GENERAL
// Archivo: js/app.js
// Proyecto académico UTP
// ==========================================================

// 1) Año dinámico en el footer
(function setYearFooter() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
})();

// 2) Obtener parámetros de la URL (ej: ?tipo=junior)
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1); // sin '?'
    const pairs = queryString.split("&").filter(Boolean);

    for (const p of pairs) {
        const [key, value] = p.split("=");
        if (key) {
            params[decodeURIComponent(key)] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
        }
    }
    return params;
}

// 3) Prefijar tipo de habitación en reservar.html
(function prefillTipoHabitacion() {
    // Solo tiene sentido en reservar.html
    if (!window.location.pathname.endsWith("reservar.html")) return;

    const params = getQueryParams();
    if (!params.tipo) return;

    const mapaTipos = {
        "junior": "Junior Suite",
        "ejecutiva": "Ejecutiva",
        "matrimonial": "Matrimonial",
        "panoramica": "Panorámica",
        "clasica": "Clásica",
        "estandar": "Estándar",
        "infinity": "Infinity Suite",
        "golden": "Golden Suite",
        "nova": "Nova Suite",
        "play": "Play Station",
        "cinema": "Cinema Suite",
        "nintendo": "Nintendo Suite",
        "black": "Black Suite"
    };

    const tipoTexto = mapaTipos[params.tipo.toLowerCase()];
    if (!tipoTexto) return;

    const select = document.getElementById("tipoHabitacion");
    if (!select) return;

    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text === tipoTexto || select.options[i].value === tipoTexto) {
            select.selectedIndex = i;
            break;
        }
    }
})();


