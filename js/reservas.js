
// ==========================================================
// HOTEL CASANOVA - LÓGICA DE RESERVAS POR HORAS
// Archivo: js/reservas.js
// Depende de: reservar.html + css/styles.css + js/app.js
// ==========================================================

// Tabla de tarifas por horas (simulación de la BD tarifas_horas)
// Valores tomados de la idea del tarifario (puedes ajustarlos)
const tarifasHoras = {
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

    // Temáticas: usamos rango LV (Lunes a Viernes) como simplificación
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

// Simulación de "BD" en localStorage para reservas creadas
const STORAGE_KEY_RESERVAS = "reservas_casanova_front_demo";

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

// Determina rango de días para habitaciones NO temáticas
// LJ = Lunes-Jueves, VD = Viernes-Domingo
function obtenerRangoDiasNoTematica(fechaStr) {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return null;

    const dia = fecha.getDay(); // 0 = Dom, 1 = Lun, ... 6 = Sáb
    if (dia >= 1 && dia <= 4) {
        return "LJ";
    }
    return "VD"; // viernes (5), sábado (6), domingo (0)
}

// Aplica descuento por código promocional
function aplicarDescuento(total, codigoPromo) {
    if (!codigoPromo) return total;

    const code = codigoPromo.trim().toUpperCase();

    // Ejemplo: 10% menos
    if (code === "SANVALEN") {
        return total * 0.9;
    }

    // Ejemplo: -20 soles
    if (code === "BIENVENIDO") {
        const nuevo = total - 20;
        return nuevo > 0 ? nuevo : 0;
    }

    // Códigos desconocidos no modifican el total
    return total;
}

// Convierte fecha+hora del input a objeto Date
function combinarFechaHora(fechaStr, horaStr) {
    if (!fechaStr || !horaStr) return null;

    // Formato: "2025-11-26T14:00"
    const full = `${fechaStr}T${horaStr}:00`;
    const d = new Date(full);
    if (isNaN(d.getTime())) return null;
    return d;
}

// Suma horas a una fecha
function sumarHoras(fecha, horas) {
    const nueva = new Date(fecha.getTime());
    nueva.setHours(nueva.getHours() + horas);
    return nueva;
}

// Formatea fecha/hora para mostrar en el resumen
function formatearFechaHora(fecha) {
    if (!fecha || isNaN(fecha.getTime())) return "—";
    const opcionesFecha = { year: "numeric", month: "2-digit", day: "2-digit" };
    const opcionesHora = { hour: "2-digit", minute: "2-digit" };
    const parteFecha = fecha.toLocaleDateString("es-PE", opcionesFecha);
    const parteHora = fecha.toLocaleTimeString("es-PE", opcionesHora);
    return `${parteFecha} ${parteHora}`;
}

// Guarda la reserva simulada en localStorage (solo demo)
function guardarReservaDemo(reserva) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_RESERVAS);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push(reserva);
        localStorage.setItem(STORAGE_KEY_RESERVAS, JSON.stringify(arr));
    } catch (e) {
        // Si falla localStorage, no rompemos nada: solo log
        console.warn("No se pudo guardar en localStorage:", e);
    }
}

// Actualiza todos los campos del resumen
function actualizarResumen(datos, total, fechaSalidaObj) {
    const set = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor || "—";
    };

    set("resumen-cliente", datos.nombre);
    set("resumen-doc", `${datos.docTipo} ${datos.docNumero}`);
    set("resumen-email", datos.email);
    set("resumen-telefono", datos.telefono);

    set("resumen-habitacion", datos.tipoHabitacion);
    set(
        "resumen-ingreso",
        formatearFechaHora(combinarFechaHora(datos.fechaEntrada, datos.horaEntrada))
    );
    set("resumen-salida", formatearFechaHora(fechaSalidaObj));
    set("resumen-duracion", `${datos.duracionHoras} horas`);
    set("resumen-metodo", datos.metodoPago || "—");
    set("resumen-promo", datos.codigoPromo || "—");

    const totalEl = document.getElementById("resumen-total");
    if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

// ----------------------------------------------------------
// Lógica principal del formulario
// ----------------------------------------------------------

const formReserva = document.getElementById("form-reserva");
const mensajeReserva = document.getElementById("mensaje-reserva");

if (formReserva) {
    formReserva.addEventListener("submit", function (e) {
        e.preventDefault();

        if (mensajeReserva) {
            mensajeReserva.textContent = "";
            mensajeReserva.classList.remove("estado-ok", "estado-error");
        }

        // Capturamos datos
        const datos = {
            nombre: document.getElementById("nombre")?.value.trim(),
            email: document.getElementById("email")?.value.trim(),
            telefono: document.getElementById("telefono")?.value.trim(),
            docTipo: document.getElementById("docTipo")?.value,
            docNumero: document.getElementById("docNumero")?.value.trim(),
            tipoHabitacion: document.getElementById("tipoHabitacion")?.value,
            fechaEntrada: document.getElementById("fechaEntrada")?.value,
            horaEntrada: document.getElementById("horaEntrada")?.value,
            duracionHoras: parseInt(document.getElementById("duracion")?.value || "0", 10),
            metodoPago: document.getElementById("metodoPago")?.value,
            codigoPromo: document.getElementById("codigoPromo")?.value.trim(),
            observaciones: document.getElementById("observaciones")?.value.trim()
        };

        // Validaciones básicas
        if (
            !datos.nombre ||
            !datos.email ||
            !datos.telefono ||
            !datos.docNumero ||
            !datos.tipoHabitacion ||
            !datos.fechaEntrada ||
            !datos.horaEntrada ||
            !datos.duracionHoras ||
            !datos.metodoPago
        ) {
            if (mensajeReserva) {
                mensajeReserva.textContent = "Por favor completa todos los campos obligatorios (*)";
                mensajeReserva.classList.add("estado-error");
            }
            return;
        }

        // Validar formato email básico
        if (!datos.email.includes("@")) {
            if (mensajeReserva) {
                mensajeReserva.textContent = "Ingresa un correo electrónico válido.";
                mensajeReserva.classList.add("estado-error");
            }
            return;
        }

        // Calcular fecha/hora de salida
        const fechaEntradaObj = combinarFechaHora(datos.fechaEntrada, datos.horaEntrada);
        if (!fechaEntradaObj) {
            if (mensajeReserva) {
                mensajeReserva.textContent = "La fecha u hora de ingreso no es válida.";
                mensajeReserva.classList.add("estado-error");
            }
            return;
        }

        const fechaSalidaObj = sumarHoras(fechaEntradaObj, datos.duracionHoras);

        // Buscar tarifa en la tabla JS
        const configTipo = tarifasHoras[datos.tipoHabitacion];
        if (!configTipo) {
            if (mensajeReserva) {
                mensajeReserva.textContent =
                    "No se encontró una tarifa configurada para este tipo de habitación.";
                mensajeReserva.classList.add("estado-error");
            }
            return;
        }

        let rango;

        // Si la habitación tiene tarifa LV (temáticas) → usamos LV
        if (configTipo.LV) {
            rango = "LV";
        } else {
            // Caso habitaciones clásicas → LJ o VD según el día
            rango = obtenerRangoDiasNoTematica(datos.fechaEntrada);
        }

        if (!rango || !configTipo[rango]) {
            if (mensajeReserva) {
                mensajeReserva.textContent =
                    "No hay tarifa disponible para este tipo de habitación en este día.";
                mensajeReserva.classList.add("estado-error");
            }
            return;
        }

        const tablaRango = configTipo[rango];
        const precioBase = tablaRango[datos.duracionHoras];

        if (!precioBase) {
            if (mensajeReserva) {
                mensajeReserva.textContent =
                    "No hay tarifa configurada para esa cantidad de horas. Prueba con otra duración.";
                mensajeReserva.classList.add("estado-error");
            }
            return;
        }

        // Total final con posible descuento
        let total = precioBase;
        total = aplicarDescuento(total, datos.codigoPromo);

        // Actualizamos resumen visual
        actualizarResumen(datos, total, fechaSalidaObj);

        // Simulamos guardar reserva
        const reservaDemo = {
            id_reserva: Date.now(),
            ...datos,
            fechaSalida: fechaSalidaObj.toISOString(),
            total,
            rangoTarifa: rango
        };
        guardarReservaDemo(reservaDemo);

        if (mensajeReserva) {
            mensajeReserva.textContent =
                "✔ Reserva simulada correctamente. En un sistema real, esto se guardaría en la base de datos.";
            mensajeReserva.classList.add("estado-ok");
        }
    });
}


