

// ==========================================================
// HOTEL CASANOVA - LÓGICA PARA HABITACIONES
// Archivo: js/habitaciones.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    // Hacer que toda la tarjeta de habitación sea clickeable
    const cards = document.querySelectorAll(".room-card");

    cards.forEach(card => {
        const reservarBtn = card.querySelector("button");

        if (!reservarBtn) return;

        // Cambiar cursor para dar feedback visual
        card.style.cursor = "pointer";

        card.addEventListener("click", function (e) {
            // Si el usuario hizo clic directamente en el botón, dejamos que el botón haga su trabajo
            if (e.target === reservarBtn || reservarBtn.contains(e.target)) {
                return;
            }

            // Si hizo clic en cualquier otra parte de la card,
            // simulamos click en el botón "Reservar"
            reservarBtn.click();
        });
    });
});

