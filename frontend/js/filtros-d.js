document.addEventListener('DOMContentLoaded', () => {
    const selectorAno = document.getElementById('filtro-ano');
    const botonesCategoria = document.querySelectorAll('.filtro-btn');
    const eventos = document.querySelectorAll('.evento-card');
    const mensajeNoEventos = document.getElementById('mensaje-no-eventos');

    // Leer término de búsqueda desde la URL
    const parametrosURL = new URLSearchParams(window.location.search);
    const terminoBusqueda = parametrosURL.get('busqueda')?.toLowerCase() || '';

    function filtrarEventos() {
        const anoSeleccionado = selectorAno.value;
        const categoriaActiva = document.querySelector('.filtro-btn.activo').dataset.categoria;
        let eventosVisibles = 0;

        eventos.forEach(evento => {
            const anoDelEvento = evento.dataset.year;
            const categoriaDelEvento = evento.dataset.categoria;
            const titulo = evento.querySelector('.evento-titulo')?.textContent.toLowerCase() || '';
            const descripcion = evento.querySelector('.evento-descripcion')?.textContent.toLowerCase() || '';

            const coincideAno = (anoSeleccionado === 'todos' || anoDelEvento === anoSeleccionado);
            const coincideCategoria = (categoriaActiva === 'todos' || categoriaDelEvento === categoriaActiva);
            const coincideBusqueda = titulo.includes(terminoBusqueda) || descripcion.includes(terminoBusqueda);

            if (coincideAno && coincideCategoria && coincideBusqueda) {
                evento.style.display = 'flex';
                eventosVisibles++;
            } else {
                evento.style.display = 'none';
            }
        });

        mensajeNoEventos.style.display = eventosVisibles === 0 ? 'block' : 'none';
    }

    selectorAno.addEventListener('change', filtrarEventos);

    botonesCategoria.forEach(boton => {
        boton.addEventListener('click', () => {
            document.querySelector('.filtro-btn.activo').classList.remove('activo');
            boton.classList.add('activo');
            filtrarEventos();
        });
    });

    filtrarEventos();
});
