// Para el menú responsive
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        // Crear overlay
        const newOverlay = document.createElement('div');
        newOverlay.classList.add('sidebar-overlay');
        document.body.appendChild(newOverlay);
        
        // Para cerrar al hacer clic en el overlay
        newOverlay.addEventListener('click', closeSidebar);
    }
    
    sidebar.classList.toggle('open');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('open');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Event listeners para la sidebar
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para el botón de menú
    const menuBtn = document.getElementById('menu-toggle');
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleSidebar);
    }
    
    // Cerrar sidebar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
    
    // Cerrar sidebar cuando se hace clic en un enlace del menú (opcional)
    const menuLinks = document.querySelectorAll('.Menú a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Solo cerrar en móviles
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Cerrar sidebar cuando se redimensiona la ventana a desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
});
