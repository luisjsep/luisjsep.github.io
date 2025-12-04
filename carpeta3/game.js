/**
 * Función que se ejecuta al presionar el botón "Comenzar".
 * * CORRECCIÓN CLAVE:
 * Usamos window.location.href para navegar. La ruta '/nombre-de-la-pagina.html'
 * debe ser reemplazada por el nombre de tu siguiente página, y debe ser
 * una ruta RELATIVA o compatible con el subdirectorio de GitHub Pages.
 */
function comenzarApp() {
    console.log("Iniciando la aplicación...");
    
    // ---------------------------------------------------------------------
    // IMPORTANTE PARA GITHUB PAGES: 
    // Si tu proyecto está en https://usuario.github.io/mi-repo/, y tu
    // siguiente página es 'main.html', usa la ruta relativa:
    // ---------------------------------------------------------------------
    
    // 1. **Opción Recomendada (Ruta Relativa Simple):** //    Si 'main.html' está en la misma carpeta que 'index.html'.
    window.location.href = 'main.html'; 

    // 2. **Opción para Subdirectorios:**
    //    Si la siguiente página está en una subcarpeta (ej: pages/main.html):
    // window.location.href = 'pages/main.html';
    
    // **Asegúrate de cambiar 'main.html' por el nombre de tu siguiente página.**
    // ---------------------------------------------------------------------
}

// Puedes agregar más lógica de inicio o efectos aquí si es necesario.
document.addEventListener('DOMContentLoaded', () => {
    // Código que se ejecuta cuando la página está completamente cargada
    console.log("Página de bienvenida cargada.");
});