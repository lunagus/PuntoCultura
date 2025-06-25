document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

buttonText: {
  today:    'Hoy',
  month:    'Mes',
  week:     'Semana',
  day:      'Día',
  list:     'Agenda'
},

    events: function(fetchInfo, successCallback, failureCallback) {
      fetch('http://127.0.0.1:8000/api/eventos/')
        .then(response => {
          if (!response.ok) throw new Error('Error en la respuesta de la API');
          return response.json();
        })
        .then(data => {
          const events = data.map(evento => ({
            title: evento.titulo,       // Asegúrate que tu API devuelve un campo "titulo"
            start: evento.fecha_inicio,
            end: evento.fecha_fin        // Asegúrate que es una fecha en formato ISO o compatible
            // Puedes agregar más campos como "end", "url", "color", etc.
          }));
          successCallback(events);
        })
        .catch(error => {
          console.error('Error al cargar eventos:', error);
          failureCallback(error);
        });
    }
  });

  calendar.render();
});
