document.addEventListener('DOMContentLoaded', () => {
  cargarOpciones();
  cargarEventos();
});

function mostrarFormulario() {
  document.getElementById("modal-formulario").style.display = "flex";
}

function cerrarFormulario() {
  document.getElementById("modal-formulario").style.display = "none";
}

function previsualizarArchivo() {
  let archivo = document.getElementById("multimedia").files[0];
  let preview = document.getElementById("preview");
  preview.innerHTML = "";

  if (archivo) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const media = document.createElement(archivo.type.startsWith('image/') ? 'img' : 'video');
      media.src = e.target.result;
      media.controls = archivo.type.startsWith('video/');
      media.style.maxWidth = '200px';
      preview.appendChild(media);
    };
    reader.readAsDataURL(archivo);
  }
}

async function agregarEvento(event) {
  event.preventDefault(); // Evita recargar la página

  const data = new FormData();
  data.append("titulo", document.getElementById("nombre").value);
  data.append("fecha", document.getElementById("fecha").value);
  data.append("descripcion", document.getElementById("descripcion").value);
  data.append("imagen", document.getElementById("multimedia").files[0]);
  data.append("centro_cultural", document.getElementById("centro_cultural").value);
  data.append("categoria", document.getElementById("categoria").value);

  try {
    const response = await fetch('http://127.0.0.1:8000/api/eventos/', {
      method: 'POST',
      body: data,
    });

    if (response.ok) {
      alert("¡Evento creado con éxito!");
      document.querySelector("form").reset();
      cerrarFormulario();
      cargarEventos(); // recarga los eventos después de agregar
    } else {
      alert("Error al crear el evento");
    }
  } catch (error) {
    console.error("Error al enviar el evento:", error);
  }
}

async function cargarEventos() {
  const contenedor = document.getElementById("eventos");
  contenedor.innerHTML = "";

  try {
    const eventos = await fetch("http://127.0.0.1:8000/api/eventos/").then(res => res.json());

    eventos.forEach(evento => {
      const eventoHTML = document.createElement("div");
      eventoHTML.classList.add("event");
      eventoHTML.innerHTML = `
        <span><strong>${evento.titulo}</strong> - ${evento.fecha}</span>
        <p>${evento.descripcion}</p>
        ${evento.imagen ? `<img src="${evento.imagen}" style="max-width: 200px; border-radius: 8px;">` : ""}
        <div class="icons">
          <a href="#"><img src="img/editar.png" alt="Editar"></a>
          <a href="#" onclick="eliminarEvento(${evento.id})"><img src="img/delete.png" alt="Eliminar"></a>
        </div>
      `;
      contenedor.appendChild(eventoHTML);
    });

  } catch (error) {
    console.error("Error al cargar eventos:", error);
  }
}

async function eliminarEvento(id) {
  const confirmacion = confirm("¿Seguro que quieres eliminar este evento?");
  if (!confirmacion) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/eventos/${id}/`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Evento eliminado correctamente.");
      cargarEventos();
    } else {
      alert("No se pudo eliminar el evento.");
    }
  } catch (error) {
    console.error("Error al eliminar evento:", error);
  }
}

async function cargarOpciones() {
  try {
    const centros = await fetch("http://127.0.0.1:8000/api/centros/").then(res => res.json());
    const categorias = await fetch("http://127.0.0.1:8000/api/categorias/").then(res => res.json());

    const centroSelect = document.getElementById("centro_cultural");
    centros.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.nombre;
      centroSelect.appendChild(option);
    });

    const categoriaSelect = document.getElementById("categoria");
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nombre;
      categoriaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar centros y categorías:", error);
  }
}