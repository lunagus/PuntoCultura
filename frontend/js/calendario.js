const mesActual = document.getElementById("mesActual");
const prevMes = document.getElementById("prevMes");
const nextMes = document.getElementById("nextMes");
const diasContenedor = document.getElementById("dias");

let fecha = new Date();
let mes = fecha.getMonth();
let año = fecha.getFullYear();

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio","Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function cargarCalendario() {
    mesActual.textContent = `${meses[mes]} ${año}`;
    diasContenedor.innerHTML = "";

    let primerDia = new Date(año, mes, 1).getDay();
    let totalDias = new Date(año, mes + 1, 0).getDate();

    for (let i = 0; i < primerDia; i++) {
        let espacio = document.createElement("div");
        diasContenedor.appendChild(espacio);
    }

    for (let i = 1; i <= totalDias; i++) {
        let dia = document.createElement("div");
        dia.textContent = i;
        dia.addEventListener("click", () => alert(`Evento para el día ${i}`));
        diasContenedor.appendChild(dia);
    }
}

prevMes.addEventListener("click", () => {
    mes--;
    if (mes < 0) {
        mes = 11;
        año--;
    }
    cargarCalendario();
});

nextMes.addEventListener("click", () => {
    mes++;
    if (mes > 11) {
        mes = 0;
        año++;
    }
    cargarCalendario();
});

cargarCalendario();
