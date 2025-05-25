// Detectar cuál valoración está presente
const datosFinancieros = JSON.parse(sessionStorage.getItem("valoracionFinanciera"));
const datosCapitalHumano = JSON.parse(sessionStorage.getItem("valoracionCapitalHumano"));

let resultados = null;
let tipo = "";

if (datosFinancieros) {
  resultados = datosFinancieros;
  tipo = "Financiera";
} else if (datosCapitalHumano) {
  resultados = datosCapitalHumano;
  tipo = "Capital Humano";
} else {
  // Si no hay datos, redirige
  Swal.fire({
    title: "Sin datos",
    text: "No se encontró ninguna valoración registrada.",
    icon: "warning",
    confirmButtonText: "Volver"
  }).then(() => {
    window.location.href = "./valoracion.html";
  });
  throw new Error("No hay datos para graficar.");
}

// DOM Elements
const cuerpoTabla = document.querySelector("#tablaSubcategorias tbody");
const etiquetas = [];
const valores = [];
const azulInstitucional = "#003863";

// Título dinámico (opcional)
const titulo = document.getElementById("tituloResultado");
if (titulo) {
  titulo.textContent = `Resultados: Valoración ${tipo}`;
}

// Renderizar tabla
Object.entries(resultados).forEach(([subcategoria, valor]) => {
  const fila = document.createElement("tr");

  const colCategoria = document.createElement("td");
  colCategoria.textContent = subcategoria;

  const colValor = document.createElement("td");
  colValor.textContent = valor.toFixed(2);

  fila.appendChild(colCategoria);
  fila.appendChild(colValor);
  cuerpoTabla.appendChild(fila);

  etiquetas.push(subcategoria);
  valores.push(valor);
});

// Gráfico Radar
new Chart(document.getElementById("graficoRadar"), {
  type: "radar",
  data: {
    labels: etiquetas,
    datasets: [{
      label: `Resultado por subcategoría (${tipo})`,
      data: valores,
      backgroundColor: azulInstitucional + "33",
      borderColor: azulInstitucional,
      borderWidth: 2,
      pointBackgroundColor: azulInstitucional
    }]
  },
  options: {
    responsive: true,
    scales: {
      r: {
        min: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  }
});

// Gráfico Barras
new Chart(document.getElementById("graficoBarras"), {
  type: "bar",
  data: {
    labels: etiquetas,
    datasets: [{
      label: `Resultado por subcategoría (${tipo})`,
      data: valores,
      backgroundColor: azulInstitucional
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  }
});
