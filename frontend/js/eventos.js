document.addEventListener("DOMContentLoaded", () => {
  cargarEventos();
  document.getElementById("filtro-texto").addEventListener("input", () => {paginaActual = 1; filtrarYRenderizar();});
  document.getElementById("filtro-categoria").addEventListener("change", () => {paginaActual = 1; filtrarYRenderizar();});
});

let eventosGlobal = [];
let categoriasGlobal = [];
let paginaActual = 1;
const eventosPorPagina = 9;

async function cargarEventos() {
  // Obtener eventos y categorías
  eventosGlobal = await fetch("http://127.0.0.1:8000/api/eventos/").then(r => r.json());
  categoriasGlobal = await fetch("http://127.0.0.1:8000/api/categorias/").then(r => r.json());

  // Llenar el dropdown de categorías
  const selectCat = document.getElementById("filtro-categoria");
  selectCat.innerHTML = '<option value="">Todas las categorías</option>';
  categoriasGlobal.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.nombre;
    selectCat.appendChild(opt);
  });

  // Ordenar eventos: futuros primero, luego presentes, luego pasados (por fecha de inicio descendente)
  const hoy = new Date();
  eventosGlobal = eventosGlobal.filter(ev => ev.publicado);
  eventosGlobal.sort((a, b) => {
    const fechaA = new Date(a.fecha_inicio);
    const fechaB = new Date(b.fecha_inicio);
    if (fechaA > hoy && fechaB <= hoy) return -1;
    if (fechaA <= hoy && fechaB > hoy) return 1;
    return fechaB - fechaA;
  });

  filtrarYRenderizar();
}

function filtrarYRenderizar() {
  const texto = (document.getElementById("filtro-texto").value || "").toLowerCase();
  const categoria = document.getElementById("filtro-categoria").value;
  let eventosFiltrados = eventosGlobal.filter(ev => {
    const coincideTexto = ev.titulo.toLowerCase().includes(texto) || ev.descripcion.toLowerCase().includes(texto);
    const coincideCat = categoria ? (ev.categoria === parseInt(categoria)) : true;
    return coincideTexto && coincideCat;
  });
  renderEventos(eventosFiltrados);
}

function getCategoriaClass(nombre) {
  if (!nombre) return "cat-otros";
  const map = {
    "Música": "cat-musica",
    "Literatura": "cat-literatura",
    "Artesanías": "cat-artesanias",
    "Cine y Audiovisual": "cat-cine",
    "Plástica": "cat-plastica",
    "Religiosidad": "cat-religiosidad",
    "Teatro": "cat-teatro",
    "Mitos y Leyendas": "cat-mitos",
    "Identidad": "cat-identidad",
    "Gastronomía": "cat-gastronomia",
    "Danzas Folklóricas": "cat-danzas"
  };
  return map[nombre] || "cat-otros";
}

function renderPaginacion(totalPaginas) {
  const pagDiv = document.getElementById("paginacion");
  pagDiv.innerHTML = "";
  if (totalPaginas <= 1) return;
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = (i === paginaActual) ? "activo" : "";
    btn.onclick = () => { paginaActual = i; filtrarYRenderizar(); };
    pagDiv.appendChild(btn);
  }
}

function renderEventos(eventos) {
  const grid = document.getElementById("eventos-grid");
  grid.innerHTML = "";
  document.getElementById("mensaje-no-eventos").style.display = eventos.length === 0 ? "block" : "none";
  if (eventos.length === 0) return;
  // Paginación
  const totalPaginas = Math.ceil(eventos.length / eventosPorPagina);
  renderPaginacion(totalPaginas);
  const inicio = (paginaActual - 1) * eventosPorPagina;
  const fin = inicio + eventosPorPagina;
  eventos.slice(inicio, fin).forEach(ev => {
    const catObj = categoriasGlobal.find(c => c.id === ev.categoria);
    const catNombre = catObj ? catObj.nombre : "";
    const catClass = getCategoriaClass(catNombre);
    const fechaInicio = new Date(ev.fecha_inicio).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
    const fechaFin = ev.fecha_fin && ev.fecha_fin !== ev.fecha_inicio
      ? ` al ${new Date(ev.fecha_fin).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}`
      : "";
    const fechaTexto = fechaFin ? `Del ${fechaInicio}${fechaFin}` : fechaInicio;
    const card = document.createElement("div");
    card.className = `evento-card`;
    card.innerHTML = `
      ${ev.imagen ? `<img src="${ev.imagen}" alt="${ev.titulo}">` : ""}
      <div class="evento-card-content">
        <span class="evento-fecha">${fechaTexto}</span>
        <h3 class="evento-titulo">${ev.titulo}</h3>
        <p class="evento-descripcion">${ev.descripcion}</p>
        <span class="evento-categoria-badge ${catClass}">${catNombre}</span>
      </div>
    `;
    grid.appendChild(card);
  });
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