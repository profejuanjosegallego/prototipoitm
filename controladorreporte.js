document.addEventListener("DOMContentLoaded", () => {
  // 🔹 1. traer lo que haya en sesión
  const datosFinancieros = JSON.parse(sessionStorage.getItem("valoracionFinanciera"));
  const datosCapitalHumano = JSON.parse(sessionStorage.getItem("valoracionCapitalHumano"));

  let datos = null;
  let tipo = "";

  if (datosFinancieros) {
    datos = datosFinancieros;
    tipo = "Contabilidad y Finanzas";
  } else if (datosCapitalHumano) {
    datos = datosCapitalHumano;
    tipo = "Capital Humano";
  }

  // 🔹 2. si hay datos, los dejamos globales para la IA
  if (datos) {
    // la IA lo va a leer como objeto { "subcategoria": valor }
    window.resultadosAreas = datos;

    // opcional: guardar versión unificada
    sessionStorage.setItem(
      "diagnosticoIA",
      JSON.stringify({
        area: tipo,
        resultados: datos,
      })
    );
  }

  // 🔹 3. tu código de PDF tal cual
  const botonPDF = document.getElementById("botonDescargarPDF");
  if (!botonPDF) return;

  botonPDF.addEventListener("click", async () => {
    if (!datos) {
      return Swal.fire({
        title: "Sin datos",
        text: "No hay información para generar el reporte.",
        icon: "warning",
      });
    }

    const doc = new window.jspdf.jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(1, 28, 91);
    doc.text("Informe de Diagnóstico Empresarial", 15, 20);

    doc.setFontSize(12);
    doc.setTextColor(241, 152, 0);
    doc.text(`Tipo de valoración: ${tipo}`, 15, 30);

    doc.setTextColor(0, 0, 0);
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

    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(241, 152, 0);
    doc.text("Análisis de resultados:", 15, y);

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    Object.entries(datos).forEach(([subcategoria, valor]) => {
      let texto = "";
      if (valor < 2) {
        texto = `Bajo desempeño en ${subcategoria}. Se recomienda revisar procesos y establecer planes de acción.`;
      } else if (valor < 3) {
        texto = `Desempeño medio en ${subcategoria}. Priorizar iniciativas para cerrar brechas.`;
      } else if (valor < 4) {
        texto = `Buen desempeño en ${subcategoria}. Consolidar y documentar prácticas.`;
      } else {
        texto = `Excelente desempeño en ${subcategoria}. Mantener y usarlo como referencia.`;
      }

      const lineas = doc.splitTextToSize(texto, 180);
      lineas.forEach((linea) => {
        doc.text(linea, 15, y);
        y += 7;
      });

      y += 5;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    try {
      const logoResponse = await fetch("./img/logoitm.png");
      const blob = await logoResponse.blob();
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;

        const imgWidth = 90;
        const imgHeight = 25;
        const x = (pageWidth - imgWidth) / 2;
        const yLogo = pageHeight - 45;

        doc.addImage(base64data, "PNG", x, yLogo, imgWidth, imgHeight);

        const textoPie =
          "Proyecto desarrollado por la Facultad de Ciencias Económicas y Administrativas del ITM.";
        doc.setFontSize(10);
        doc.setTextColor(85, 85, 85);
        const textoDividido = doc.splitTextToSize(textoPie, 180);
        const yTexto = yLogo + imgHeight + 8;
        doc.text(textoDividido, pageWidth / 2, yTexto, { align: "center" });

        doc.save(`Reporte_${tipo.replace(/\s+/g, "_")}.pdf`);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("No se pudo cargar el logo:", error);
      Swal.fire({
        title: "Advertencia",
        text: "El reporte se generó, pero no se pudo incluir el logo ITM.",
        icon: "info",
      });
      doc.save(`Reporte_${tipo.replace(/\s+/g, "_")}.pdf`);
    }
  });
});
