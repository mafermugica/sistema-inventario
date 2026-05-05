const API_URL = "http://146.190.165.82";
const KEY_TOKEN = "token";
const KEY_USUARIO = "usuarioLogueado";

const PAGINAS_ADMIN = ["inventario.html", "almacen.html", "usuarios.html"];

async function verificarToken() {
    const token = localStorage.getItem(KEY_TOKEN);
    
    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/api/verificar-usuario`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            cerrarSesion();
            return null;
        }

        return result.data;
    } catch (error) {
        console.error("Error verificando token:", error);
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

async function init() {
    const usuario = await verificarToken();
    
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
    if (nombreElement && usuario.nombre) {
        nombreElement.textContent = usuario.nombre;
    }
}

document.addEventListener("DOMContentLoaded", init);