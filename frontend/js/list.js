document.addEventListener('DOMContentLoaded', async () => {
  const lista = document.getElementById('eventos-list');
  const mensaje = document.getElementById('mensaje');

  try {
    const response = await fetch('http://localhost:8000/api/eventos/');
    if (!response.ok) throw new Error('Error al obtener eventos');

    const eventos = await response.json();

    if (eventos.length === 0) {
      lista.innerHTML = '<li>No hay eventos disponibles.</li>';
      return;
    }

    eventos.forEach(evento => {
      const li = document.createElement('li');
      li.innerHTML = `
        <h3>${evento.titulo}</h3>
        <p>${evento.descripcion}</p>
        <p><strong>Fecha:</strong> ${evento.fecha}</p>
        ${evento.imagen ? `<img src="${evento.imagen}" alt="${evento.titulo}" width="200">` : ''}
      `;
      lista.appendChild(li);
    });

  } catch (error) {
    mensaje.innerText = `❌ ${error.message}`;
  }
});
