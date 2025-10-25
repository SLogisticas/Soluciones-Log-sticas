// ========== SISTEMA DE VISTAS ==========
function initViewSystem() {
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    
    // Función para cambiar de vista
    function showView(viewId) {
        // Ocultar todas las vistas
        views.forEach(view => {
            view.classList.remove('active');
        });
        
        // Mostrar la vista seleccionada
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Actualizar enlaces activos
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === viewId) {
                link.classList.add('active');
            }
        });
        
        // Scroll al inicio de la página
        window.scrollTo(0, 0);
        
        // Actualizar URL PERO NO PERMITIR QUE AFECTE AL RECARGAR
        history.replaceState(null, null, `#${viewId}`);
    }
    
    // Event listeners para los enlaces de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetView = this.getAttribute('data-section');
            showView(targetView);
        });
    });
    
    // Manejar navegación con botones de retroceso/avance
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            showView(hash);
        }
    });
    
    // MOSTRAR SIEMPRE INICIO AL RECARGAR - IGNORAR HASH
    showView('inicio');
    
    // Limpiar hash de la URL - CAMBIO RECOMENDADO:
    setTimeout(() => {
        history.replaceState(null, null, ' ');
    }, 100);
}

// ========== LOADER ==========
function initLoader() {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }, 2000);

    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    });
}

// ========== MODO OSCURO ==========
function initDarkMode() {
    const modeToggle = document.getElementById('mode-toggle');
    
    if (!modeToggle) return;

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.textContent = '☀️';
    }

    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        modeToggle.textContent = isDarkMode ? '☀️' : '☾';
        localStorage.setItem('darkMode', isDarkMode);
    });
}

// ========== GALERÍA DE IMÁGENES ==========
function initImageGallery() {
    const images = document.querySelectorAll('#image-carousel img');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    let currentImageIndex = 0;

    window.openImageModal = function(index) {
        if (images[index]) {
            currentImageIndex = index;
            modalImage.src = images[currentImageIndex].src;
            modal.style.display = 'flex';
        }
    };

    window.closeImageModal = function() {
        modal.style.display = 'none';
        modalImage.classList.remove('zoomed');
    };

    window.changeImage = function(direction) {
        currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
        if (images[currentImageIndex]) {
            modalImage.src = images[currentImageIndex].src;
            modalImage.classList.remove('zoomed');
        }
    };

    window.toggleZoom = function(img) {
        img.classList.toggle('zoomed');
    };

    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') window.changeImage(-1);
            if (e.key === 'ArrowRight') window.changeImage(1);
            if (e.key === 'Escape') window.closeImageModal();
        }
    });
}

// ========== MODALES ==========
function initModals() {
    window.abrirModal = function(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) {
            modal.classList.remove('oculto');
        }
    };

    window.cerrarModal = function(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) {
            modal.classList.add('oculto');
        }
    };

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-curso')) {
            e.target.classList.add('oculto');
        }
    });
}

// ========== TESTIMONIOS ==========
function initTestimonials() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxM0X03HgejXJ9bVTbLcedDM-e-x04IK_Jd6Hg92DlTftxjR8chQtoah2KyjNpAH6f4/exec';
    const form = document.getElementById('reviewForm');
    const feedback = document.getElementById('formFeedback');
    const btnMostrar = document.getElementById('mostrarFormulario');
    const contenedor = document.getElementById('contenedor-testimonios');

    if (!form || !btnMostrar || !contenedor) return;

    btnMostrar.addEventListener('click', function() {
        form.classList.toggle('oculto');
        btnMostrar.textContent = form.classList.contains('oculto') ? 
            'Calificar' : 'Ocultar Formulario';
        feedback.textContent = '';
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        feedback.textContent = 'Enviando...';
        feedback.style.color = '#5e2ca5';

        fetch(scriptURL, {
            method: 'POST',
            body: new FormData(form)
        })
        .then(response => {
            if (response.ok) {
                form.reset();
                feedback.textContent = '¡Gracias por tu testimonio!';
                feedback.style.color = 'green';
                cargarTestimonios();
                setTimeout(() => {
                    form.classList.add('oculto');
                    btnMostrar.textContent = 'Calificar';
                }, 2000);
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            feedback.textContent = 'Hubo un problema. Intenta de nuevo.';
            feedback.style.color = 'red';
        });
    });

    function generarEstrellas(calificacion) {
        let estrellas = '';
        for (let i = 1; i <= 5; i++) {
            estrellas += i <= calificacion ? '⭐' : '☆';
        }
        return estrellas;
    }

    window.cargarTestimonios = async function() {
        try {
            const respuesta = await fetch(scriptURL);
            const testimonios = await respuesta.json();
            
            contenedor.innerHTML = '';
            
            if (testimonios && testimonios.length > 0) {
                testimonios.forEach(t => {
                    const tarjeta = document.createElement('div');
                    tarjeta.className = 'testimonio';
                    tarjeta.innerHTML = `
                        <h3>${t.nombre || 'Anónimo'}</h3>
                        ${t.correo ? `<h6>${t.correo}</h6>` : ''}
                        <p class="mensaje-corto">"${(t.mensaje || '').slice(0, 100)}..."</p>
                        <p class="mensaje-completo" style="display:none;">"${t.mensaje || ''}"</p>
                        <p class="estrellas">${generarEstrellas(parseInt(t.calificacion) || 5)}</p>
                        <small>${t.fecha ? new Date(t.fecha).toLocaleDateString() : 'Fecha no disponible'}</small>
                    `;
                    
                    tarjeta.addEventListener('click', function() {
                        const corto = this.querySelector('.mensaje-corto');
                        const completo = this.querySelector('.mensaje-completo');
                        if (completo.style.display === 'none') {
                            corto.style.display = 'none';
                            completo.style.display = 'block';
                        } else {
                            corto.style.display = 'block';
                            completo.style.display = 'none';
                        }
                    });
                    
                    contenedor.appendChild(tarjeta);
                });
            } else {
                contenedor.innerHTML = '<p>Aún no hay testimonios. ¡Sé el primero en dejar uno!</p>';
            }
        } catch (err) {
            console.error('Error cargando testimonios:', err);
            contenedor.innerHTML = '<p>Error al cargar los testimonios. Intenta recargar la página.</p>';
        }
    };
    
    cargarTestimonios();
}

// ========== FORMULARIO DE CONTACTO ==========
function initContactForm() {
    const formularioContacto = document.getElementById('formulario-contacto');
    const mensajeEnviadoContacto = document.getElementById('mensaje-enviado-contacto');
    const mensajeErrorContacto = document.getElementById('mensaje-error-contacto');
    
    if (!formularioContacto) return;
    
    formularioContacto.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        mensajeEnviadoContacto.classList.add('oculto');
        mensajeErrorContacto.classList.add('oculto');
        
        const formData = new FormData(formularioContacto);
        
        try {
            const response = await fetch(formularioContacto.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                mensajeEnviadoContacto.classList.remove('oculto');
                mensajeErrorContacto.classList.add('oculto');
                formularioContacto.reset();
                
                setTimeout(() => {
                    mensajeEnviadoContacto.classList.add('oculto');
                }, 5000);
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            mensajeErrorContacto.classList.remove('oculto');
            mensajeEnviadoContacto.classList.add('oculto');
        }
    });
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando página...');
    
    initLoader();
    initViewSystem();
    initDarkMode();
    initImageGallery();
    initModals();
    initTestimonials();
    initContactForm();
    
    console.log('Página inicializada correctamente');
});

// Fallback global
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader && loader.style.display !== 'none') {
        loader.style.display = 'none';
    }
}, 3000);
