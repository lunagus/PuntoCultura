function previewImage(event) {
  const file = event.target.files[0];
  const img = document.getElementById("preview");
  if (file) {
    img.src = URL.createObjectURL(file);
    img.classList.remove("hidden");
  } else {
    img.classList.add("hidden");
  }
}

document.getElementById("eventoLargo").addEventListener("change", function () {
  const fechaFin = document.getElementById("fechaFinContainer");
  fechaFin.classList.toggle("hidden", !this.checked);
});

document.getElementById("eventoForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  if (!document.getElementById("eventoLargo").checked) {
    data.delete("fecha_fin");
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/eventos/", {
      method: "POST",
      body: data,
    });

    if (response.ok) {
      showToast("✅ Evento creado correctamente");
      form.reset();
      document.getElementById("preview").classList.add("hidden");
      document.getElementById("fechaFinContainer").classList.add("hidden");
    } else {
      const errData = await response.json();
      alert("Error al crear el evento: " + JSON.stringify(errData));
    }
  } catch (error) {
    alert("Error en la conexión: " + error.message);
  } finally {
    submitBtn.disabled = false;
  }
});

async function cargarOpciones() {
  const centros = await fetch("http://127.0.0.1:8000/api/centros/").then((r) => r.json());
  const categorias = await fetch("http://127.0.0.1:8000/api/categorias/").then((r) => r.json());

  const centroSelect = document.querySelector('select[name="centro_cultural"]');
  centros.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.nombre;
    centroSelect.appendChild(option);
  });

  const categoriaSelect = document.querySelector('select[name="categoria"]');
  categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.nombre;
    categoriaSelect.appendChild(option);
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000);
}

cargarOpciones();

