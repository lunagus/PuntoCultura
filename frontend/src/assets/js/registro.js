document.getElementById('formularioRegistro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = document.getElementById('usuario').value.trim();
  const clave = document.getElementById('clave').value;

  try {
    const respuesta = await fetch(`${window.API_BASE_URL}/api/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: usuario, password: clave }),
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      document.getElementById('mensaje').textContent = 'Usuario registrado exitosamente.';
    } else {
      document.getElementById('mensaje').textContent = datos.detail || 'Error en el registro.';
    }
  } catch (error) {
    console.error(error);
    document.getElementById('mensaje').textContent = 'Error de red. Intenta nuevamente.';
  }
});
