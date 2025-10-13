// frontend/js/calendario.js
// Este script inicializa y gestiona el calendario de eventos utilizando FullCalendar.

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar'); // Obtiene el elemento donde se renderizará el calendario.

  // Si el elemento del calendario no se encuentra, muestra una advertencia y sale.
  if (!calendarEl) {
    console.warn("Elemento del calendario no encontrado.");
    return;
  }

  // Inicializa una nueva instancia de FullCalendar.
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth', // Vista inicial: mes con cuadrícula de días.
    locale: 'es', // Establece el idioma del calendario a español.
    headerToolbar: { // Configuración de la barra de herramientas del calendario.
      left: 'prev,next today', // Botones a la izquierda: anterior, siguiente, hoy.
      center: 'title', // Título del calendario en el centro.
      right: 'dayGridMonth,timeGridWeek,timeGridDay' // Vistas a la derecha: mes, semana, día.
    },
    buttonText: { // Texto personalizado para los botones de la barra de herramientas.
      today:    'Hoy',
      month:    'Mes',
      week:     'Semana',
      day:      'Día',
      list:     'Agenda'
    },
    // Función para cargar los eventos del calendario desde una fuente externa (API).
    events: function(fetchInfo, successCallback, failureCallback) {
      fetch(`${window.API_BASE_URL}/api/eventos/`) // Realiza una solicitud a tu API de eventos.
        .then(response => {
          // Verifica si la respuesta de la red fue exitosa.
          if (!response.ok) throw new Error('Error en la respuesta de la API');
          return response.json(); // Parsea la respuesta como JSON.
        })
        .then(data => {
          // Filtra los eventos para incluir solo aquellos que están 'publicado'.
          const publishedEvents = data.filter(evento => evento.publicado);
          // Mapea los datos de los eventos de la API al formato que FullCalendar espera.
          const events = publishedEvents.map(evento => ({
            title: evento.titulo,       // Título del evento.
            start: evento.fecha_inicio, // Fecha de inicio del evento.
            // Si hay fecha_fin, la usa; de lo contrario, usa fecha_inicio para eventos de un solo día.
            end: evento.fecha_fin ? evento.fecha_fin : evento.fecha_inicio,
            // Puedes añadir una URL si quieres que el evento sea clicable, por ejemplo, a una página de detalle:
            // url: `/frontend/pages/evento-detalle.html?id=${evento.id}`
          }));
          successCallback(events); // Llama a successCallback con los eventos formateados.
        })
        .catch(error => {
          // Captura y registra cualquier error que ocurra durante la carga de eventos.
          console.error('Error al cargar eventos para el calendario:', error);
          failureCallback(error); // Llama a failureCallback para informar a FullCalendar del error.
        });
    }
  });

  calendar.render(); // Renderiza el calendario en la página.
});
