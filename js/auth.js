const API_URL = "http://146.190.165.82";
const KEY_TOKEN = "token";
const KEY_USUARIO = "usuarioLogueado";

const PAGINAS_ADMIN = ["inventario.html", "almacen.html", "usuarios.html"];

function verificarToken() {
    const token = localStorage.getItem(KEY_TOKEN);
    const usuario = localStorage.getItem(KEY_USUARIO);
    
    if (!token || !usuario) {
        window.location.href = "login.html";
        return null;
    }

    try {
        return JSON.parse(usuario);
    } catch (error) {
        console.error("Error parseando usuario:", error);
        cerrarSesion();
        return null;
    }
}

function cerrarSesion() {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USUARIO);
    window.location.href = "login.html";
}

function obtenerPaginaActual() {
    return window.location.href.split("/").pop();
}

function init() {
    const usuario = verificarToken();
    
    if (!usuario) return;

    const paginaActual = obtenerPaginaActual();

    if (usuario.rol === "empleado" && PAGINAS_ADMIN.includes(paginaActual)) {
        window.location.href = "index.html";
        return;
    }

    if (usuario.rol === "empleado") {
        ocultarMenusAdmin();
    }

    actualizarNombreUsuario(usuario);
}

function ocultarMenusAdmin() {
    const items = document.querySelectorAll(".nav-item");
    
    items.forEach(item => {
        const link = item.querySelector(".nav-link");
        if (link) {
            const href = link.getAttribute("href");
            if (PAGINAS_ADMIN.includes(href)) {
                item.style.display = "none";
            }
        }
    });
}

function actualizarNombreUsuario(usuario) {
    const nombreElement = document.getElementById("nombreUsuario");
    if (nombreElement && usuario.nombre_usuario) {
        nombreElement.textContent = usuario.nombre_usuario;
    }
}

document.addEventListener("DOMContentLoaded", init);