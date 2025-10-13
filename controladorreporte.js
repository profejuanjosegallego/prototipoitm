document.addEventListener("DOMContentLoaded", () => {
  const botonPDF = document.getElementById("botonDescargarPDF");
  if (!botonPDF) return;

  botonPDF.addEventListener("click", async () => {
    // 1️⃣ Obtener datos desde sessionStorage
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
    } else {
      return Swal.fire({
        title: "Sin datos",
        text: "No hay información para generar el reporte.",
        icon: "warning",
      });
    }

    // 2️⃣ Crear PDF con jsPDF
    const doc = new window.jspdf.jsPDF();

    // 🔵 Título principal (azul ITM)
    doc.setFontSize(18);
    doc.setTextColor(1, 28, 91);
    doc.text("Informe de Diagnóstico Empresarial", 15, 20);

    // 🟠 Subtítulo tipo de valoración (naranja ITM)
    doc.setFontSize(12);
    doc.setTextColor(241, 152, 0);
    doc.text(`Tipo de valoración: ${tipo}`, 15, 30);

    // ⚫ Contenido principal
    doc.setTextColor(0, 0, 0);
    let y = 40;

    // Tabla de resultados
    doc.setFontSize(10);
    doc.text("Subcategoría", 15, y);
    doc.text("Resultado", 100, y);
    y += 10;

    Object.entries(datos).forEach(([subcategoria, valor]) => {
      doc.text(subcategoria, 15, y);
      doc.text(valor.toFixed(2).toString(), 100, y);
      y += 8;
    });

    // 🟠 Subtítulo análisis de resultados
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(241, 152, 0);
    doc.text("Análisis de resultados:", 15, y);

    // ⚫ Texto del análisis
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

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

      const lineas = doc.splitTextToSize(texto, 180);
      lineas.forEach(linea => {
        doc.text(linea, 15, y);
        y += 7;
      });

      y += 5;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    // 🖼️ Logo ITM primero
    try {
      const logoResponse = await fetch("./img/logoitm.png");
      const blob = await logoResponse.blob();
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;

        // Centrado horizontal del logo
        const imgWidth = 90;
        const imgHeight = 25;
        const x = (pageWidth - imgWidth) / 2;
        const yLogo = pageHeight - 45; // ligeramente más arriba para dejar espacio al texto

        doc.addImage(base64data, "PNG", x, yLogo, imgWidth, imgHeight);

        // 🧩 Mensaje institucional debajo del logo
        const textoPie =
          "Proyecto desarrollado por la Facultad de Ciencias Económicas y Administrativas del ITM, " +
          "como parte de su compromiso con la innovación, el emprendimiento y la transformación digital " +
          "en las organizaciones del territorio.";

        doc.setFontSize(10);
        doc.setTextColor(85, 85, 85); // gris elegante
        const textoDividido = doc.splitTextToSize(textoPie, 180);
        const yTexto = yLogo + imgHeight + 8; // justo debajo del logo
        doc.text(textoDividido, pageWidth / 2, yTexto, { align: "center" });

        // Guardar PDF
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
