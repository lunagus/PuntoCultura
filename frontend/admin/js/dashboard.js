document.addEventListener('DOMContentLoaded', function() {

    // Función para obtener datos de una API con autenticación
    async function fetchData(url) {
        try {
            const response = await authenticatedFetch(url);
            if (!response || !response.ok) {
                console.error(`Error al cargar datos de ${url}: ${response ? response.statusText : 'No response'}`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error en la conexión con ${url}:`, error);
            return null;
        }
    }

    // Cargar estadísticas y hacerla global para que otros scripts la puedan llamar
    window.loadStats = async function() {
        const totalEventosEl = document.getElementById('totalEventos');
        const totalCategoriasEl = document.getElementById('totalCategorias');
        const totalEspaciosEl = document.getElementById('totalEspacios');
        const totalUsuariosEl = document.getElementById('totalUsuarios');

        const eventos = await fetchData(`${window.API_BASE_URL}/api/eventos/`);
        const categorias = await fetchData(`${window.API_BASE_URL}/api/categorias/`);
        const espacios = await fetchData(`${window.API_BASE_URL}/api/centros/`);
        const usuarios = await fetchData(`${window.API_BASE_URL}/api/users/`);

        if (eventos) totalEventosEl.textContent = eventos.length;
        if (categorias) totalCategoriasEl.textContent = categorias.length;
        if (espacios) totalEspaciosEl.textContent = espacios.length;
        if (usuarios) totalUsuariosEl.textContent = usuarios.length;
    };

    // Cargar actividad reciente
    async function loadRecentActivity() {
        const recentEventsList = document.getElementById('recentEventsList');
        const recentEspaciosList = document.getElementById('recentEspaciosList');
        const recentCategoriasList = document.getElementById('recentCategoriasList');

        // Función auxiliar para renderizar listas
        function renderList(element, items, displayKey, linkPrefix = '') {
            element.innerHTML = ''; // Limpiar lista
            if (items && items.length > 0) {
                // Tomar los últimos 5 elementos
                const recentItems = items.slice(-5).reverse(); // Últimos 5, ordenados del más nuevo al más viejo
                recentItems.forEach(item => {
                    const li = document.createElement('li');
                    let itemText = item[displayKey];
                    if (item.fecha_inicio) { // Para eventos
                        itemText += ` (${new Date(item.fecha_inicio).toLocaleDateString()})`;
                    }
                    if (linkPrefix) {
                        li.innerHTML = `<a href="${linkPrefix}">${itemText}</a>`;
                    } else {
                        li.textContent = itemText;
                    }
                    element.appendChild(li);
                });
            } else {
                element.innerHTML = '<li>No hay actividad reciente.</li>';
            }
        }

        const eventos = await fetchData(`${window.API_BASE_URL}/api/eventos/`);
        const categorias = await fetchData(`${window.API_BASE_URL}/api/categorias/`);
        const espacios = await fetchData(`${window.API_BASE_URL}/api/centros/`);

        renderList(recentEventsList, eventos, 'titulo', 'eventos.html'); // Asume que 'titulo' es el campo de nombre
        renderList(recentCategoriasList, categorias, 'nombre', 'categorias.html'); // Asume que 'nombre' es el campo de nombre
        renderList(recentEspaciosList, espacios, 'nombre', 'espacios.html'); // Asume que 'nombre' es el campo de nombre
    }

    // Cargar todo al inicio
    window.loadStats(); // Llamada inicial a las estadísticas
    loadRecentActivity();
});
