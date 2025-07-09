document.addEventListener('DOMContentLoaded', function() {

    // Función para obtener datos de una API
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Error al cargar datos de ${url}: ${response.statusText}`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error de conexión con ${url}:`, error);
            return null;
        }
    }

    // Función para cargar estadísticas y hacerla global para que otros scripts la puedan llamar
    window.loadStats = async function() {
        const totalEventosEl = document.getElementById('totalEventos');
        const totalCategoriasEl = document.getElementById('totalCategorias');
        const totalEspaciosEl = document.getElementById('totalEspacios');

        // Obtener la cantidad de eventos
        const eventos = await fetchData("http://127.0.0.1:8000/api/eventos/");
        // Obtener la cantidad de categorías
        const categorias = await fetchData("http://127.0.0.1:8000/api/categorias/");
        // Obtener la cantidad de espacios
        const espacios = await fetchData("http://127.0.0.1:8000/api/espacios/");

        // Actualizar los elementos del DOM con las cantidades
        if (eventos) totalEventosEl.textContent = eventos.length;
        if (categorias) totalCategoriasEl.textContent = categorias.length;
        if (espacios) totalEspaciosEl.textContent = espacios.length;
    };

    // Cargar actividad reciente para eventos, categorías y espacios culturales
    async function loadRecentActivity() {
        const recentEventsList = document.getElementById('recentEventsList');
        const recentCategoriasList = document.getElementById('recentCategoriasList');
        const recentEspaciosList = document.getElementById('recentEspaciosList');

        // Función auxiliar para renderizar listas de actividad reciente
        function renderList(element, items, displayKey, linkPrefix = '') {
            element.innerHTML = ''; // Limpiar la lista actual
            if (items && items.length > 0) {
                // Tomar los últimos 5 elementos, ordenados del más nuevo al más antiguo
                const recentItems = items.slice(-5).reverse(); 
                recentItems.forEach(item => {
                    const li = document.createElement('li');
                    let itemText = item[displayKey];
                    if (item.fecha_inicio) { // Para eventos, añadir la fecha
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

        const eventos = await fetchData("http://127.0.0.1:8000/api/eventos/");
        const categorias = await fetchData("http://127.0.0.1:8000/api/categorias/");
        const espacios = await fetchData("http://127.0.0.1:8000/api/espacios/");

        // Renderizar las listas de actividad reciente
        // Asumiendo que los enlaces del editor van a las mismas páginas de administración por ahora
        renderList(recentEventsList, eventos, 'titulo', '/Frontend/Vista Admin-Editores/editor/eventos-editor.html'); 
        renderList(recentCategoriasList, categorias, 'nombre', '/Frontend/Vista Admin-Editores/editor/categorias-editor.html'); 
        renderList(recentEspaciosList, espacios, 'nombre', '/Frontend/Vista Admin-Editores/editor/espacios-editor.html'); 
    }

    // Cargar todas las estadísticas y actividad reciente al inicializar la página
    window.loadStats(); // Llamada inicial a las estadísticas
    loadRecentActivity(); // Llamada inicial a la actividad reciente
});
