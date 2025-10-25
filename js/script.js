// ========== LOADER ==========
function initLoader() {
    // Ocultar loader inmediatamente como fallback
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }, 2000);

    // Ocultar cuando la página cargue
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
    
    if (!modeToggle) {
        console.error('No se encontró el botón de modo oscuro');
        return;
    }

    // Cargar preferencia guardada
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.textContent = '☀️';
    }

    // Toggle al hacer clic
    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        modeToggle.textContent = isDarkMode ? '☀️' : '☾';
        localStorage.setItem('darkMode', isDarkMode);
    });
}

// ========== ANIMACIÓN DE SECCIONES ==========
function initScrollAnimation() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });
}

// ========== GALERÍA DE IMÁGENES ==========
function initImageGallery() {
    const images = document.querySelectorAll('#image-carousel img');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    let currentImageIndex = 0;

    // Funciones globales
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

    // Navegación con teclado
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

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-curso') || e.target.classList.contains('modal-taller')) {
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

    if (!form || !btnMostrar || !contenedor) {
        console.warn('Elementos de testimonios no encontrados');
        return;
    }

    // Mostrar/ocultar formulario
    btnMostrar.addEventListener('click', function() {
        form.classList.toggle('oculto');
        btnMostrar.textContent = form.classList.contains('oculto') ? 
            'Calificar' : 'Ocultar Formulario';
        feedback.textContent = '';
    });

    // Enviar testimonio
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

    // Función para generar estrellas
    function generarEstrellas(calificacion) {
        let estrellas = '';
        for (let i = 1; i <= 5; i++) {
            estrellas += i <= calificacion ? '⭐' : '☆';
        }
        return estrellas;
    }

    // Cargar testimonios
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
                    
                    // Expandir/contraer mensaje
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
    
    // Cargar testimonios al inicio
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
        
        // Ocultar mensajes anteriores
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
                
                // Ocultar mensaje después de 5 segundos
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
    initDarkMode();
    initScrollAnimation();
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
