// ControladorUno.js
import { preguntasFinancieras } from "./valoracionUno.js";

const formulario = document.getElementById("formularioUno");

// Subcategorías de Contabilidad y Finanzas
const subcategorias = [
  "Monitoreo de Costos y Contabilidad",
  "Administración Financiera",
  "Normas Legales y Tributarias",
];

// 🧠 Recuperar progreso previo del usuario (si existe)
const progresoGuardado = JSON.parse(localStorage.getItem("respuestasFinancieras")) || {};

// Render dinámico de preguntas
preguntasFinancieras.forEach((pregunta, index) => {
  const grupo = document.createElement("div");
  grupo.className = "mb-3";

  const label = document.createElement("label");
  label.className = "form-label";
  label.htmlFor = `item_${pregunta.id}`;
  label.textContent = `${index + 1}. ${pregunta.texto}`;
  grupo.appendChild(label);

  const select = document.createElement("select");
  select.className = "form-select";
  select.name = `item_${pregunta.id}`;
  select.id = `item_${pregunta.id}`;

  const opciones = [
    "Seleccione una opción",
    "1 - No aplica",
    "2 - Bajo cumplimiento",
    "3 - Cumplimiento parcial",
    "4 - Cumplimiento alto",
  ];

  opciones.forEach((texto, i) => {
    const option = document.createElement("option");
    option.value = i || "";
    option.textContent = texto;
    option.disabled = i === 0;
    select.appendChild(option);
  });

  // 🔁 Restaurar valor si estaba guardado
  if (progresoGuardado[`item_${pregunta.id}`]) {
    select.value = progresoGuardado[`item_${pregunta.id}`];
  } else {
    select.selectedIndex = 0;
  }

  // 💾 Guardar automáticamente al cambiar
  select.addEventListener("change", () => {
    progresoGuardado[`item_${pregunta.id}`] = select.value;
    localStorage.setItem("respuestasFinancieras", JSON.stringify(progresoGuardado));
  });

  // Ayuda contextual
  const alerta = document.createElement("div");
  alerta.className = "alert alert-secondary mt-2";
  alerta.setAttribute("role", "alert");
  alerta.style.display = "none";
  alerta.textContent = pregunta.ayuda;

  select.addEventListener("focus", () => {
    document.querySelectorAll(".alert-secondary").forEach((a) => (a.style.display = "none"));
    alerta.style.display = "block";
  });
  select.addEventListener("blur", () => {
    setTimeout(() => (alerta.style.display = "none"), 200);
  });

  grupo.appendChild(select);
  grupo.appendChild(alerta);
  formulario.appendChild(grupo);
});

// Botón enviar
const boton = document.createElement("button");
boton.type = "submit";
boton.className = "btn btn-primary mt-4";
boton.textContent = "Enviar valoración";
formulario.appendChild(boton);

// Validación, cálculo y envío
formulario.addEventListener("submit", function (e) {
  e.preventDefault();

  const resultadosPorSubcategoria = {};
  let incompletas = [];

  // Inicializar acumuladores por subcategoría
  subcategorias.forEach((sub) => (resultadosPorSubcategoria[sub] = 0));

  // Recorrer y validar respuestas
  preguntasFinancieras.forEach((pregunta) => {
    const valorStr = document.getElementById(`item_${pregunta.id}`).value;

    if (valorStr === "") {
      incompletas.push(pregunta.id);
    } else {
      const valor = parseInt(valorStr, 10);
      const porcentajeDecimal = parseFloat(pregunta.porcentaje.replace("%", "")) / 100;
      const resultado = valor * porcentajeDecimal;
      resultadosPorSubcategoria[pregunta.subcategoria] += resultado;
    }
  });

  if (incompletas.length > 0) {
    Swal.fire({
      title: "Faltan respuestas",
      text: "Por favor responde todas las preguntas antes de enviar.",
      icon: "warning",
    });
    return;
  }

  // Guardar resultados finales de esta área
  sessionStorage.removeItem("valoracionCapitalHumano");
  sessionStorage.setItem("valoracionFinanciera", JSON.stringify(resultadosPorSubcategoria));
  sessionStorage.setItem("areaSeleccionada", "Contabilidad y Finanzas");

  Swal.fire({
    title: "Buen trabajo",
    text: "Formulario enviado exitosamente",
    icon: "success",
  });

  // 👇 Importante: NO borramos localStorage aquí (para que si vuelve, conserve selección)
  setTimeout(() => {
    window.location.href = "./competitividad.html";
  }, 1200);
});
