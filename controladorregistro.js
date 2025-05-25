document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector("form");

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Captura de campos
    const datos = {
      nombreEmpresa: document.getElementById("empresa").value.trim(),
      sector: document.getElementById("sector").value.trim().split(". ")[1] || "", // Limpia el número del select
      tamanoEmpresa: document.getElementById("tamano").value.trim(),
      ubicacion: document.getElementById("ubicacion").value.trim(),
      nombreResponsable: document.getElementById("nombre").value.trim(),
      cargoResponsable: document.getElementById("cargo").value.trim(),
      correo: document.getElementById("email").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      terminos: document.getElementById("terminos").checked,
    };

    // Validación de campos requeridos
    if (
      !datos.nombreEmpresa ||
      !datos.sector ||
      !datos.tamanoEmpresa ||
      !datos.ubicacion ||
      !datos.nombreResponsable ||
      !datos.cargoResponsable ||
      !datos.telefono ||
      !datos.correo ||
      !datos.password ||
      !datos.confirmPassword ||
      !datos.terminos
    ) {
      return Swal.fire({
        title: "Faltan respuestas",
        text: "Por favor responde todas las preguntas antes de enviar.",
        icon: "warning",
      });
    }

    if (datos.password !== datos.confirmPassword) {
      return Swal.fire({
        title: "Contraseñas no coinciden",
        text: "Verifica que ambas contraseñas sean iguales.",
        icon: "error",
      });
    }

    // Eliminamos confirmPassword del objeto a enviar
    delete datos.confirmPassword;

    try {
        console.log(datos)
      const respuesta = await fetch("https://apidiagnostico.vercel.app/empresas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        return Swal.fire({
          title: "Error en el registro",
          text: resultado.mensaje || "Hubo un problema al registrar los datos.",
          icon: "error",
        });
      }

      // Éxito
      await Swal.fire({
        title: "Registro exitoso",
        text: "Tu empresa ha sido registrada correctamente.",
        icon: "success",
        confirmButtonText: "Continuar",
      });

      // Redirigir
      sessionStorage.setItem("nombreUsuario", datos.nombreResponsable);
      setTimeout(function(){
       location.replace("./valoracion.html");
      },500)
      
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        icon: "error",
      });
    }
  });
});
