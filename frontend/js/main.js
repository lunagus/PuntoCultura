document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('eventoForm');
  const mensaje = document.getElementById('mensaje');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch('http://localhost:8000/api/eventos/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        mensaje.innerText = '✅ Evento creado correctamente.';
        form.reset();
      } else {
        mensaje.innerText = `❌ Error: ${JSON.stringify(data)}`;
      }

    } catch (error) {
      mensaje.innerText = `❌ Error de red: ${error.message}`;
    }
  });
});
