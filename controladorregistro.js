document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector("form");

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
      nombreEmpresa: document.getElementById("empresa").value.trim(),
      sector: document.getElementById("sector").value.trim().split(". ")[1] || "",
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

    // Validación
    if (Object.values(datos).some(v => v === "" || v === false)) {
      return Swal.fire({
        title: "Faltan respuestas",
        text: "Por favor completa todos los campos antes de enviar.",
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

    delete datos.confirmPassword;

    try {
      // ⚡ Mostrar alerta de carga mientras se hace el fetch
      Swal.fire({
        title: "Registrando empresa...",
        text: "Estamos guardando tu información en la base de datos.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const respuesta = await fetch("https://apidiagnostico.vercel.app/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      // Cierra el loader
      Swal.close();

      if (!respuesta.ok) {
        return Swal.fire({
          title: "Error en el registro",
          text: resultado.mensaje || "Hubo un problema al registrar los datos.",
          icon: "error",
        });
      }

      // 🎉 Éxito
      await Swal.fire({
        title: "Registro exitoso",
        text: "Tu empresa ha sido registrada correctamente.",
        icon: "success",
        confirmButtonText: "Continuar",
      });

      sessionStorage.setItem("nombreUsuario", datos.nombreResponsable);
      location.replace("./valoracion.html");

    } catch (error) {
      console.error(error);
      Swal.close();
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        icon: "error",
      });
    }
  });
});
