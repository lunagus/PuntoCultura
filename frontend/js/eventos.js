document.addEventListener("DOMContentLoaded", () => {
  cargarOpciones();
  cargarEventos();
});

const inputBusqueda = document.getElementById("busqueda");
const selectAnio = document.getElementById("filtro-anio");

inputBusqueda.addEventListener("input", cargarEventos);
selectAnio.addEventListener("change", cargarEventos);

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
      const media = document.createElement(archivo.type.startsWith("image/") ? "img" : "video");
      media.src = e.target.result;
      media.controls = archivo.type.startsWith("video/");
      media.style.maxWidth = "200px";
      preview.appendChild(media);
    };
    reader.readAsDataURL(archivo);
  }
}

async function agregarEvento(event) {
  event.preventDefault();

  const data = new FormData();
  data.append("titulo", document.getElementById("nombre").value);
  data.append("fecha_inicio", document.getElementById("fecha").value);
  const fechaFinInput = document.getElementById("fecha_fin");

  if (fechaFinInput && fechaFinInput.value) {
    data.append("fecha_fin", fechaFinInput.value);
  }

  data.append("descripcion", document.getElementById("descripcion").value);
  data.append("imagen", document.getElementById("multimedia").files[0]);
  data.append("centro_cultural", document.getElementById("centro_cultural").value);
  data.append("categoria", document.getElementById("categoria").value);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/eventos/", {
      method: "POST",
      body: data,
    });

    if (response.ok) {
      alert("¡Evento creado con éxito!");
      document.querySelector("form").reset();
      cerrarFormulario();
      cargarEventos();
    } else {
      alert("Error al crear el evento");
    }
  } catch (error) {
    console.error("Error al enviar el evento:", error);
  }
}

function formatearFecha(fechaStr) {
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  return new Date(fechaStr).toLocaleDateString("es-ES", opciones);
}

async function cargarEventos() {
  const contenedor = document.getElementById("eventos");
  contenedor.innerHTML = "";

  const texto = inputBusqueda?.value?.toLowerCase() || "";
  const anio = selectAnio?.value || "";

  try {
    const response = await fetch("http://127.0.0.1:8000/api/eventos/");
    const eventos = await response.json();

    const filtrados = eventos.filter((evento) => {
      const coincideTexto =
        evento.titulo.toLowerCase().includes(texto) ||
        evento.descripcion.toLowerCase().includes(texto);
      const coincideAnio = anio
        ? new Date(evento.fecha_inicio).getFullYear().toString() === anio
        : true;
      return coincideTexto && coincideAnio;
    });

    if (filtrados.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron eventos.</p>";
      return;
    }

    filtrados.forEach((evento) => {
      const fechaInicio = formatearFecha(evento.fecha_inicio);
      const fechaFin = evento.fecha_fin && evento.fecha_fin !== evento.fecha_inicio
        ? ` al ${formatearFecha(evento.fecha_fin)}`
        : "";
      const fechaTexto = fechaFin ? `Del ${fechaInicio}${fechaFin}` : fechaInicio;

      const eventoHTML = document.createElement("div");
      eventoHTML.classList.add("event");
      eventoHTML.innerHTML = `
        <span><strong>${evento.titulo}</strong> - ${fechaTexto}</span>
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
    const centros = await fetch("http://127.0.0.1:8000/api/centros/").then((res) => res.json());
    const categorias = await fetch("http://127.0.0.1:8000/api/categorias/").then((res) => res.json());

    const centroSelect = document.getElementById("centro_cultural");
    centros.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.nombre;
      centroSelect.appendChild(option);
    });

    const categoriaSelect = document.getElementById("categoria");
    categorias.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nombre;
      categoriaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar centros y categorías:", error);
  }
}