const GEMINI_API_KEY = "AIzaSyCd_ihjZnDCxfUHhC64pulhpY_RiDkMHEg";

// 1. enganchar el botón
let boton = document.getElementById("btnIA");

boton.addEventListener("click", () => {
  const diag = JSON.parse(sessionStorage.getItem("diagnosticoIA") || "null");
  if (!diag) {
    console.log("no hay datos para IA");
    return;
  }
  console.log("analizando...")
  interpretarConIA(diag);
});

// 2. función que llama a Gemini y pinta
async function interpretarConIA() {
  const resultados = window.resultadosAreas;
  const estado = document.getElementById("iaStatus");
  if (estado) estado.textContent = "Consultando IA...";

  if (!resultados) {
    console.warn("No hay resultados en window.resultadosAreas");
    if (estado) estado.textContent = "No hay datos para analizar";
    return;
  }

  const prompt = `
Eres un consultor empresarial. Analiza estos resultados (0-100) y devuelve JSON, evita en el mensaje utilizar palabras alarmantes y JSON:
{
  "resumen": "...",
  "oportunidades": ["...", "...", "..."]
}
Resultados:
${Object.entries(resultados).map(([a, v]) => `- ${a}: ${v}%`).join("\n")}
  `.trim();

  try {
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await resp.json();
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(txt);
    } catch (e) {
      parsed = { resumen: txt, oportunidades: [] };
    }

    const card = document.getElementById("iaCard");
    const resEl = document.getElementById("iaResumen");
    const oppEl = document.getElementById("iaOportunidades");

    if (resEl) resEl.textContent = parsed.resumen || "IA no devolvió resumen.";
    if (oppEl) {
      oppEl.innerHTML = "";
      (parsed.oportunidades || []).forEach((o) => {
        const li = document.createElement("li");
        li.textContent = o;
        oppEl.appendChild(li);
      });
    }
    if (card) card.classList.remove("d-none");
    if (estado) estado.textContent = "Interpretación generada ✅";
  } catch (error) {
    console.error(error);
    if (estado) estado.textContent = "Error consultando IA";
  }
}
