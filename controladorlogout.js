// logout.js

if (!sessionStorage.getItem("nombreUsuario")) {
    location.replace("./index.html");
}

document.addEventListener("DOMContentLoaded", () => {
  const spanUsuario = document.getElementById("nombreUsuarioNavbar");
  const botonSalir = document.getElementById("cerrarSesion");
  const nombre = sessionStorage.getItem("nombreUsuario");

  if (nombre && spanUsuario) {
    spanUsuario.textContent = `🧑‍💼 ${nombre}`;
  }

  if (botonSalir) {
    botonSalir.addEventListener("click", () => {
      Swal.fire({
        title: "¿Deseas salir?",
        text: "Se cerrará la sesión actual.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          sessionStorage.clear();
          window.location.href = "./index.html";
        }
      });
    });
  }
});
