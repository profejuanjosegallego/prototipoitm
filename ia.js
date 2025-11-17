const GEMINI_API_KEY = "AIzaSyCfrUZ4e49gzReVGz4ODCLoxS4o-mTidUo"; // ⚠️ Para producción, mover a backend.

// 1. Enganchar el botón
const boton = document.getElementById("btnIA");

if (boton) {
  boton.addEventListener("click", () => {
    const diag = JSON.parse(sessionStorage.getItem("diagnosticoIA") || "null");

    if (!diag && !window.resultadosAreas) {
      console.log("no hay datos para IA");
      const estado = document.getElementById("iaStatus");
      if (estado) estado.textContent = "No hay datos para analizar todavía.";
      return;
    }

    console.log("analizando...");
    interpretarConIA(diag);
  });
}

// Helper: intentar sacar solo el JSON por si viene con ```json ... ```
function extraerJSONPlano(texto) {
  if (!texto) return texto;
  const match = texto.match(/\{[\s\S]*\}/);
  return match ? match[0] : texto;
}

// 2. Función que llama a Gemini y pinta
async function interpretarConIA(diag) {
  const resultados = window.resultadosAreas || diag;
  const estado = document.getElementById("iaStatus");

  if (estado) estado.textContent = "Consultando IA 🤖...";

  if (!resultados || Object.keys(resultados).length === 0) {
    console.warn("No hay resultados para analizar");
    if (estado) estado.textContent = "No hay datos para analizar";
    return;
  }

 
  const prompt = `
Eres un consultor empresarial especializado en diagnóstico organizacional para pymes.
Recibirás los resultados de un diagnóstico de áreas clave en una escala de 0 a 100.
Con base en estos datos, realiza lo siguiente:

1. Calcula una nota global de 1.0 a 5.0 (puede tener decimales) donde:
   - 1.0 = situación con muchas oportunidades de mejora.
   - 3.0 = situación intermedia, con fortalezas y aspectos por ajustar.
   - 5.0 = situación muy sólida y consistente.
   La nota debe calcularse de forma coherente con los resultados recibidos (no uses un valor fijo).

2. Escribe un resumen breve, claro y constructivo (máximo 6 líneas) que:
   - Comience explícitamente con una oración similar a:
     "Con base en las respuestas suministradas en el diagnóstico, una herramienta de análisis basada en IA de Google ha elaborado la siguiente interpretación de los resultados."
   - Felicite a la empresa por realizar el diagnóstico.
   - Destaque de manera equilibrada los avances y el potencial de mejora.
   - Evite palabras rudas, alarmantes o catastrofistas (por ejemplo: “crisis”, “grave”, “fracaso”, “deficiente”).
   - Use un tono respetuoso, cercano y profesional.

3. Identifica entre 3 y 5 oportunidades clave de mejora, escritas en tono positivo y orientadas a la acción, usando verbos como “fortalecer”, “consolidar”, “optimizar”, “ajustar”, “profundizar” o “estructurar”.

4. Incluye un mensaje de cierre motivador para la empresa, resaltando que:
   - El diagnóstico es un punto de partida para seguir mejorando.
   - Los resultados sirven como guía para tomar decisiones y planear acciones futuras.
   - Se reconoce el esfuerzo de la organización por medir y gestionar su desempeño.

Devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin comentarios, sin encabezados, sin backticks y sin bloques de código, con esta estructura exacta (el valor de notaGlobal debe ser el que tú calcules a partir de los datos):

{
  "notaGlobal": 4.2,
  "resumen": "Texto breve...",
  "oportunidades": ["Oportunidad 1", "Oportunidad 2", "Oportunidad 3"],
  "mensajeCierre": "Mensaje motivador final..."
}

Resultados del diagnóstico (0-100):
${Object.entries(resultados)
  .map(([a, v]) => `- ${a}: ${v}%`)
  .join("\\n")}
`.trim();



  try {
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!resp.ok) {
      console.error("Error HTTP:", resp.status, await resp.text());
      if (estado) {
        if (resp.status === 429) {
          estado.textContent =
            "Se alcanzó el límite de consultas de IA por ahora. Intenta más tarde 🙏";
        } else {
          estado.textContent =
            "Error consultando IA (" + resp.status + ") ⚠️";
        }
      }
      return;
    }

    const data = await resp.json();
    const txtCrudo =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const txtLimpio = extraerJSONPlano(txtCrudo);

    let parsed = {
      notaGlobal: null,
      resumen: "",
      oportunidades: [],
      mensajeCierre: "",
    };

    try {
      parsed = JSON.parse(txtLimpio);
    } catch (e) {
      console.warn("No se pudo parsear JSON, uso texto plano como resumen.");
      parsed.resumen = txtCrudo;
    }

    // Elementos de la interfaz
    const card = document.getElementById("iaCard");
    const resEl = document.getElementById("iaResumen");
    const oppEl = document.getElementById("iaOportunidades");
    const notaEl = document.getElementById("iaNota"); // crea este div en el HTML si quieres mostrar la nota

    // Nota global con estrellas
    if (notaEl && typeof parsed.notaGlobal === "number") {
      const nota = parsed.notaGlobal;
      const estrellas = "⭐".repeat(Math.round(nota));
      notaEl.innerHTML = `
        <h5>📌 Calificación general del diagnóstico</h5>
        <p><strong>${nota.toFixed(1)} / 5</strong> ${estrellas}</p>
      `;
      notaEl.classList.remove("d-none");
    }

    // Resumen + mensaje de cierre
    if (resEl) {
      const resumenTexto =
        parsed.resumen || "La IA no devolvió un resumen claro.";
      const mensajeCierre = parsed.mensajeCierre || "";

      resEl.innerHTML = `
        <h5>📊 Resumen ejecutivo</h5>
        <p>${resumenTexto}</p>
        ${
          mensajeCierre
            ? `<p>💡 <strong>Recomendaciones de la IA:</strong> ${mensajeCierre}</p>`
            : ""
        }
      `;
    }

    // Oportunidades clave
    if (oppEl) {
      oppEl.innerHTML = "";
      (parsed.oportunidades || []).forEach((o) => {
        const li = document.createElement("li");
        li.textContent = "✅ " + o;
        oppEl.appendChild(li);
      });

      if ((parsed.oportunidades || []).length === 0) {
        const li = document.createElement("li");
        li.textContent =
          "La IA no identificó oportunidades específicas en esta consulta.";
        oppEl.appendChild(li);
      }
    }

    if (card) card.classList.remove("d-none");
    if (estado) estado.textContent = "Interpretación generada ✅";
  } catch (error) {
    console.error(error);
    if (estado)
      estado.textContent = "Error de conexión con la IA. Intenta de nuevo ⚠️";
  }
}
