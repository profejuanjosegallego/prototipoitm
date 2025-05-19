// Leer datos desde sessionStorage
const resultados = JSON.parse(sessionStorage.getItem("valoracionFinanciera"));

const cuerpoTabla = document.querySelector("#tablaSubcategorias tbody");
const etiquetas = [];
const valores = [];

// Color institucional
const azulInstitucional = "#003863";

// Construir la tabla
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

// Gráfico de Radar
new Chart(document.getElementById("graficoRadar"), {
  type: "radar",
  data: {
    labels: etiquetas,
    datasets: [{
      label: "Resultado por categoría",
      data: valores,
      backgroundColor: azulInstitucional + "33", // Opacidad baja
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

// Gráfico de Barras
new Chart(document.getElementById("graficoBarras"), {
  type: "bar",
  data: {
    labels: etiquetas,
    datasets: [{
      label: "Resultado por categoría",
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
