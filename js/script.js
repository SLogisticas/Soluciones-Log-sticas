// Solución mejorada para el problema de carga
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado');
    
    // Inicializar todas las funcionalidades
    initLoader();
    initDarkMode();
    initScrollAnimation();
    initImageGallery();
    initModals();
    initTestimonials();
    initContactForm();
});

// ========== LOADER ==========
function initLoader() {
    const loader = document.getElementById('loader');
    
    // Ocultar loader después de un tiempo máximo (fallback)
    const maxLoadTime = 5000; // 5 segundos máximo
    
    const hideLoader = () => {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    };
    
    // Intentar ocultar cuando la página esté completamente cargada
    window.addEventListener('load', function() {
        console.log('Página completamente cargada');
        setTimeout(hideLoader, 500); // Pequeño delay para mejor UX
    });
    
    // Fallback: ocultar después del tiempo máximo
    setTimeout(hideLoader, maxLoadTime);
}

// ========== MODO OSCURO ==========
function initDarkMode() {
    const modeToggle = document.getElementById('mode-toggle');
    const darkModeClass = 'dark-mode';
    
    function enableDarkMode() {
        document.body.classList.add(darkModeClass);
        modeToggle.textContent = '☀️';
        localStorage.setItem('darkMode', 'enabled');
    }
    
    function disableDarkMode() {
        document.body.classList.remove(darkModeClass);
        modeToggle.textContent = '☾';
        localStorage.setItem('darkMode', 'disabled');
    }
    
    // Cargar preferencia guardada
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    
    // Toggle al hacer clic
    modeToggle.addEventListener('click', function() {
        if (document.body.classList.contains(darkModeClass)) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });
}

// ========== ANIMACIÓN DE SCROLL ==========
function initScrollAnimation() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
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
    
    // Precargar imágenes para mejor rendimiento
    images.forEach(img => {
        const tempImg = new Image();
        tempImg.src = img.src;
    });
    
    // Funciones de la galería
    window.openImageModal = function(index) {
        currentImageIndex = index;
        modalImage.src = images[currentImageIndex].src;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };
    
    window.closeImageModal = function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modalImage.classList.remove('zoomed');
    };
    
    window.changeImage = function(direction) {
        currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
        modalImage.src = images[currentImageIndex].src;
        modalImage.classList.remove('zoomed');
    };
    
    window.toggleZoom = function(img) {
        img.classList.toggle('zoomed');
    };
    
    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') changeImage(-1);
            if (e.key === 'ArrowRight') changeImage(1);
            if (e.key === 'Escape') closeImageModal();
        }
    });
    
    // Cerrar modal al hacer clic fuera de la imagen
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
}

// ========== MODALES DE CURSOS Y TALLERES ==========
function initModals() {
    window.abrirModal = function(idModal) {
        const modal = document.getElementById(idModal);
        modal.classList.remove('oculto');
        modal.style.display = 'flex';
    };
    
    window.cerrarModal = function(idModal) {
        const modal = document.getElementById(idModal);
        modal.classList.add('oculto');
        modal.style.display = 'none';
    };
    
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-curso') || e.target.classList.contains('modal-taller')) {
            e.target.classList.add('oculto');
            e.target.style.display = 'none';
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

// ========== MANEJO DE ERRORES GLOBALES ==========
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Forzar la ocultación del loader si algo sale mal
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader && !loader.classList.contains('hidden')) {
        console.warn('Forzando ocultación del loader después del timeout');
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}, 10000); // 10 segundos como máximo absoluto
