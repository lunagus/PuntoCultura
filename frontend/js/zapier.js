async function enviarEventoAZapier(evento) {
  const webhookURL = "https://hooks.zapier.com/hooks/catch/25170606/ui86l44/"; 

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fecha: evento.fecha,
        imagen: evento.imagen, 
        categoria: evento.categoria
      })
    });

    if (response.ok) {
      console.log("Evento enviado a Zapier correctamente");
    } else {
      console.error("Error al enviar a Zapier:", response.status);
    }
  } catch (error) {
    console.error("Error en la conexión con Zapier:", error);
  }
}

