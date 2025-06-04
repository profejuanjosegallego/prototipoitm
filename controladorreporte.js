document.addEventListener("DOMContentLoaded", () => {
  const botonPDF = document.getElementById("botonDescargarPDF");
  if (!botonPDF) return;

  botonPDF.addEventListener("click", () => {
    // 1. Obtener datos desde sessionStorage
    const datosFinancieros = JSON.parse(sessionStorage.getItem("valoracionFinanciera"));
    const datosCapitalHumano = JSON.parse(sessionStorage.getItem("valoracionCapitalHumano"));
    let datos = null;
    let tipo = "";

    if (datosFinancieros) {
      datos = datosFinancieros;
      tipo = "Financiera";
    } else if (datosCapitalHumano) {
      datos = datosCapitalHumano;
      tipo = "Capital Humano";
    } else {
      Swal.fire({
        title: "Sin datos",
        text: "No hay datos para generar el reporte.",
        icon: "warning"
      });
      return;
    }

    // 2. Crear el PDF usando la versión UMD de jsPDF
    const doc = new window.jspdf.jsPDF();
    doc.setFontSize(18);
    doc.text("Informe de Diagnóstico Empresarial", 15, 20);

    doc.setFontSize(12);
    doc.text(`Tipo de valoración: ${tipo}`, 15, 30);

    // 3. Generar tabla de resultados
    let y = 40;
    doc.setFontSize(10);
    doc.text("Subcategoría", 15, y);
    doc.text("Resultado", 100, y);
    y += 10;

    Object.entries(datos).forEach(([subcategoria, valor]) => {
      doc.text(subcategoria, 15, y);
      doc.text(valor.toFixed(2).toString(), 100, y);
      y += 8;
    });

    // 4. Agregar análisis personalizado
    y += 10;
    doc.setFontSize(12);
    doc.text("Análisis de resultados:", 15, y);
    y += 10;
    doc.setFontSize(10);

    Object.entries(datos).forEach(([subcategoria, valor]) => {
      let texto = "";
      if (valor < 2) {
        texto = `Bajo desempeño en ${subcategoria}. Se recomienda revisar procesos y establecer planes de acción para mejorar significativamente esta área. Es clave identificar causas raíz y plantear estrategias de fortalecimiento.`;
      } else if (valor < 3) {
        texto = `Desempeño medio en ${subcategoria}. Se han dado algunos pasos, pero aún existen áreas importantes por consolidar. Se aconseja un análisis detallado y priorizar iniciativas que contribuyan a cerrar las brechas.`;
      } else if (valor < 4) {
        texto = `Buen desempeño en ${subcategoria}. Se están consolidando prácticas que fortalecen esta área. Para avanzar al siguiente nivel, se recomienda profundizar la implementación y garantizar la sostenibilidad de los resultados.`;
      } else {
        texto = `Excelente desempeño en ${subcategoria}. Este resultado refleja el compromiso y la calidad en la gestión de esta área. Es importante continuar con la mejora continua y servir de ejemplo para otras áreas de la organización.`;
      }

      // 🟡 Dividir texto en líneas de ancho máximo (180px)
      const lineas = doc.splitTextToSize(texto, 180);

      lineas.forEach(linea => {
        doc.text(linea, 15, y);
        y += 7;
      });

      y += 5; // Espacio extra entre subcategorías

      // ⚡ Saltar página si se sale del margen
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // 5. Descargar
    doc.save(`Reporte_${tipo}.pdf`);
  });
});
