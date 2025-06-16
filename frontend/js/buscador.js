const buscador = document.getElementById("buscador");

    buscador.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const termino = buscador.value.trim();
        if (termino !== "") {
        // Redirigir a eventos.html con el término como parámetro en la URL
        window.location.href = `/pages/eventos.html?busqueda=${encodeURIComponent(termino)}`;
        }
    }
    });