document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector("form");

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("emailLogin").value.trim();
    const password = document.getElementById("passwordLogin").value;

    if (!correo || !password) {
      return Swal.fire({
        title: "Campos incompletos",
        text: "Por favor ingresa tu correo y contraseña.",
        icon: "warning",
      });
    }

    try {
      // ⚡ Mostrar mensaje de carga antes del fetch
      Swal.fire({
        title: "Consultando base de datos...",
        text: "Estamos verificando tus credenciales, por favor espera.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const respuesta = await fetch("https://apidiagnostico.vercel.app/empresas");
      const data = await respuesta.json();

      // Cerrar el loader antes de mostrar resultado
      Swal.close();

      const empresas = data.empresas || [];

      const empresaEncontrada = empresas.find(
        (emp) => emp.correo === correo && emp.password === password
      );

      if (empresaEncontrada) {
        sessionStorage.setItem("nombreUsuario", empresaEncontrada.nombreResponsable);

        await Swal.fire({
          title: "Bienvenido",
          text: `Hola, ${empresaEncontrada.nombreResponsable}`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        location.replace("./valoracion.html");
      } else {
        Swal.fire({
          title: "Credenciales incorrectas",
          text: "El correo o la contraseña no coinciden con nuestros registros.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error al consultar el API:", error);
      Swal.close();
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudo contactar con el servidor.",
        icon: "error",
      });
    }
  });
});
