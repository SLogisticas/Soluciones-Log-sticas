// Funcionalidad de loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500); // Coincide con la duración de la transición
});

// Funcionalidad de aparición de secciones
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 }); // La sección se considera visible cuando el 10% de ella está en el viewport

    sections.forEach(section => {
        observer.observe(section);
    });
});

// Funcionalidad del modo oscuro
const modeToggle = document.getElementById('mode-toggle');
modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    modeToggle.textContent = isDarkMode ? '☀️' : '☾';
    localStorage.setItem('darkMode', isDarkMode);
});

// Cargar preferencia de modo oscuro al iniciar
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    modeToggle.textContent = '☀️';
} else {
    modeToggle.textContent = '☾';
}

// Funcionalidad de la galería de imágenes (modal)
const images = document.querySelectorAll('#image-carousel img');
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
let currentImageIndex = 0;

function openImageModal(index) {
    currentImageIndex = index;
    modalImage.src = images[currentImageIndex].src;
    modal.style.display = 'flex';
}

function closeImageModal() {
    modal.style.display = 'none';
    modalImage.classList.remove('zoomed'); // Asegura que no quede "zoomed" al cerrar
    modalImage.style.transformOrigin = 'center center'; // Restablece el origen del zoom
}

function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) {
        currentImageIndex = images.length - 1;
    } else if (currentImageIndex >= images.length) {
        currentImageIndex = 0;
    }
    modalImage.src = images[currentImageIndex].src;
    modalImage.classList.remove('zoomed'); // Quita el zoom al cambiar de imagen
    modalImage.style.transformOrigin = 'center center'; // Restablece el origen del zoom
}

function toggleZoom(img) {
    img.classList.toggle('zoomed');
    if (img.classList.contains('zoomed')) {
        // Si está ampliada, permite arrastrar
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;

        img.style.cursor = 'grab';

        img.onmousedown = (e) => {
            isDragging = true;
            startX = e.pageX - img.offsetLeft;
            startY = e.pageY - img.offsetTop;
            scrollLeft = modal.scrollLeft;
            scrollTop = modal.scrollTop;
            img.style.cursor = 'grabbing';
        };

        img.onmouseup = () => {
            isDragging = false;
            img.style.cursor = 'grab';
        };

        img.onmousemove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - img.offsetLeft;
            const y = e.pageY - img.offsetTop;
            const walkX = (x - startX) * 2; // Factor de velocidad de arrastre
            const walkY = (y - startY) * 2;
            modal.scrollLeft = scrollLeft - walkX;
            modal.scrollTop = scrollTop - walkY;
        };

        // Centrar la imagen ampliada
        img.onload = () => {
            if (img.classList.contains('zoomed')) {
                centerImageInModal();
            }
        };

        function centerImageInModal() {
            const imgRect = img.getBoundingClientRect();
            const modalRect = modal.getBoundingClientRect();

            modal.scrollLeft = (imgRect.width - modalRect.width) / 2;
            modal.scrollTop = (imgRect.height - modalRect.height) / 2;
        }

    } else {
        img.style.cursor = 'zoom-in';
        // Restablece los eventos de arrastre si no está ampliada
        img.onmousedown = null;
        img.onmouseup = null;
        img.onmousemove = null;
    }
}

modalImage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const currentScale = modalImage.classList.contains('zoomed') ? 2 : 1;
    const newScale = e.deltaY < 0 ? currentScale * 1.1 : currentScale / 1.1; // Zoom in/out

    if (newScale >= 1 && newScale <= 3) { // Limita el zoom entre 1x y 3x
        if (newScale > 1) {
            modalImage.classList.add('zoomed');
            modalImage.style.transform = `scale(${newScale})`;

            const rect = modalImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            modalImage.style.transformOrigin = `${x}px ${y}px`;
        } else {
            modalImage.classList.remove('zoomed');
            modalImage.style.transform = 'scale(1)';
            modalImage.style.transformOrigin = 'center center';
        }
    }
});

// Scripts para los modales de cursos y talleres
function abrirModal(idModal) {
    document.getElementById(idModal).classList.remove('oculto');
}

function cerrarModal(idModal) {
    document.getElementById(idModal).classList.add('oculto');
}

// Funcionalidad de testimonios
document.addEventListener('DOMContentLoaded', async () => {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzzW4pWj_f_yL7o89y93XQ9fLqJv2t2qF0_g_F_x/exec'; // Reemplaza con tu URL de Google Apps Script
    const form = document.getElementById('reviewForm');
    const formFeedback = document.getElementById('formFeedback');
    const contenedorTestimonios = document.getElementById('contenedor-testimonios');
    const mostrarFormularioBtn = document.getElementById('mostrarFormulario');

    // Función para generar estrellas
    function generarEstrellas(calificacion) {
        let estrellasHtml = '';
        for (let i = 0; i < calificacion; i++) {
            estrellasHtml += '⭐';
        }
        return estrellasHtml;
    }

    // Cargar testimonios existentes
    async function cargarTestimonios() {
        try {
            const response = await fetch(`${scriptURL}?action=getReviews`);
            const data = await response.json();
            contenedorTestimonios.innerHTML = '';
            if (data && data.length > 0) {
                data.forEach(t => {
                    const tarjeta = document.createElement('div');
                    tarjeta.classList.add('testimonio');
                    tarjeta.innerHTML = `
                        <h3>${t.nombre}</h3>
                        <p>"${t.mensaje}"</p>
                        <div class="estrellas">${generarEstrellas(parseInt(t.Calificación))}</div>
                        <small>${new Date(t.fecha).toLocaleDateString()}</small>
                    `;
                    contenedorTestimonios.prepend(tarjeta); // Añadir los más recientes al principio
                });
            } else {
                contenedorTestimonios.innerHTML = '<p>Aún no hay testimonios. ¡Sé el primero en dejar uno!</p>';
            }
        } catch (error) {
            console.error('Error al cargar testimonios:', error);
            contenedorTestimonios.innerHTML = '<p>Error al cargar los testimonios.</p>';
        }
    }

    // Enviar nuevo testimonio
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formFeedback.textContent = 'Enviando...';
        formFeedback.style.color = 'blue';

        const formData = new FormData(form);
        formData.append('action', 'submitReview');

        try {
            const response = await fetch(scriptURL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                formFeedback.textContent = '¡Gracias por tu testimonio!';
                formFeedback.style.color = 'green';
                form.reset();
                form.classList.add('oculto'); // Ocultar el formulario después de enviar
                mostrarFormularioBtn.textContent = 'Calificar';
                await cargarTestimonios(); // Recargar testimonios para mostrar el nuevo
            } else {
                formFeedback.textContent = 'Error: ' + (result.message || 'No se pudo enviar el testimonio.');
                formFeedback.style.color = 'red';
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            formFeedback.textContent = 'Ocurrió un error al enviar el testimonio.';
            formFeedback.style.color = 'red';
        }
    });

    // Mostrar/ocultar formulario de testimonio
    mostrarFormularioBtn.addEventListener('click', () => {
        form.classList.toggle('oculto');
        if (form.classList.contains('oculto')) {
            mostrarFormularioBtn.textContent = 'Calificar';
        } else {
            mostrarFormularioBtn.textContent = 'Ocultar Formulario';
        }
        formFeedback.textContent = ''; // Limpiar mensaje de feedback al mostrar/ocultar
    });

    // Cargar testimonios al cargar la página
    cargarTestimonios();
});

// Funcionalidad para el formulario de contacto
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('formulario-contacto');
    const contactFormSuccess = document.getElementById('mensaje-enviado-contacto');
    const contactFormError = document.getElementById('mensaje-error-contacto');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        contactFormSuccess.classList.add('oculto');
        contactFormError.classList.add('oculto');

        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                contactFormSuccess.classList.remove('oculto');
                contactForm.reset();
            } else {
                contactFormError.classList.remove('oculto');
            }
        } catch (error) {
            console.error('Error al enviar el formulario de contacto:', error);
            contactFormError.classList.remove('oculto');
        }
    });
});

// Funcionalidad adicional para la galería de imágenes
let currentImageIndex = 0;
const images = Array.from(document.querySelectorAll("#image-carousel img"));
const modal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const toggleBtn = document.getElementById("mode-toggle");
const darkModeClass = "dark-mode";

function openImageModal(index) {
    currentImageIndex = index;
    updateModalImage();
    modal.style.display = "flex";
}

function closeImageModal() {
    modal.style.display = "none";
    modalImage.classList.remove('zoomed');
    modalImage.style.left = '0px';
    modalImage.style.top = '0px';
}

function changeImage(step) {
    currentImageIndex = (currentImageIndex + step + images.length) % images.length;
    updateModalImage();
}

function updateModalImage() {
    modalImage.src = images[currentImageIndex].src;
    modalImage.classList.remove('zoomed');
}

function toggleZoom(img) {
    img.classList.toggle('zoomed');
}

document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') changeImage(-1);
        if (e.key === 'ArrowRight') changeImage(1);
        if (e.key === 'Escape') closeImageModal();
    }
});

// Dark mode toggle functionality
function enableDarkMode() {
    document.body.classList.add(darkModeClass);
    toggleBtn.innerHTML = '🔆';
    localStorage.setItem('darkMode', 'enabled');
}

function disableDarkMode() {
    document.body.classList.remove(darkModeClass);
    toggleBtn.innerHTML = '☾';
    localStorage.setItem('darkMode', 'disabled');
}

const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'enabled') {
    enableDarkMode();
} else {
    disableDarkMode();
}

toggleBtn.addEventListener("click", () => {
    if (document.body.classList.contains(darkModeClass)) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

// Loader
window.addEventListener("load", () => {
    document.getElementById("loader").classList.add("hidden");
});

// Funciones para los modales de Cursos y Talleres
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex'; // Cambiado a flex para centrado
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Cierra el modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal-curso')) {
        const modals = document.querySelectorAll('.modal-curso');
        modals.forEach(modal => {
            modal.style.display = "none";
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const formularioContacto = document.getElementById('formulario-contacto');
    const mensajeEnviadoContacto = document.getElementById('mensaje-enviado-contacto');
    const mensajeErrorContacto = document.getElementById('mensaje-error-contacto');
    const formspreeEndpoint = 'https://formspree.io/f/xnndpolz';

    formularioContacto.addEventListener('submit', async function(event) {
        event.preventDefault(); // <---- Asegurarse de prevenir la acción por defecto al inicio

        const formData = new FormData(formularioContacto);

        try {
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Mensaje enviado a Formspree:', data);
                mensajeEnviadoContacto.classList.remove('oculto');
                mensajeErrorContacto.classList.add('oculto');
                formularioContacto.reset();
                setTimeout(() => {
                    mensajeEnviadoContacto.classList.add('oculto');
                }, 5000);
            } else {
                const errorData = await response.json();
                console.error('Error al enviar a Formspree:', errorData);
                mensajeErrorContacto.classList.remove('oculto');
                mensajeEnviadoContacto.classList.add('oculto');
            }
        } catch (error) {
            console.error('Error de red al enviar a Formspree:', error);
            mensajeErrorContacto.classList.remove('oculto');
            mensajeEnviadoContacto.classList.add('oculto');
        }
    });
});

const scriptURL = 'https://script.google.com/macros/s/AKfycbxM0X03HgejXJ9bVTbLcedDM-e-x04IK_Jd6Hg92DlTftxjR8chQtoah2KyjNpAH6f4/exec';
const form = document.getElementById('reviewForm');
const feedback = document.getElementById('formFeedback');
const btnMostrar = document.getElementById('mostrarFormulario');
const contenedor = document.getElementById("contenedor-testimonios");

// Mostrar/Ocultar formulario
btnMostrar.addEventListener('click', () => {
    form.classList.toggle('oculto');
    btnMostrar.textContent = form.classList.contains('oculto') ? 'Calificar' : 'Ocultar formulario';
});

// Enviar testimonio
form.addEventListener('submit', e => {
    e.preventDefault();
    feedback.textContent = 'Enviando...';
    feedback.style.color = '#5e2ca5';

    fetch(scriptURL, {
        method: 'POST',
        body: new FormData(form)
    })
        .then(response => {
            form.reset();
            feedback.textContent = '¡Gracias por tu testimonio!';
            feedback.style.color = 'green';
            cargarTestimonios(); // Recargar testimonios
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

// Cargar testimonios desde Google Sheets
async function cargarTestimonios() {
    contenedor.innerHTML = ''; // Limpiar antes de cargar
    try {
        const respuesta = await fetch(scriptURL);
        const testimonios = await respuesta.json();

        testimonios.forEach(t => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "testimonio";
            tarjeta.innerHTML = `
                <h3>${t.nombre}</h3>
                <h6>${t.correo}</h6>
                <p class="mensaje-corto">"${t.mensaje.slice(0, 100)}..."</p>
                <p class="mensaje-completo" style="display:none;">"${t.mensaje}"</p>
                <p>${generarEstrellas(parseInt(t.calificacion))}</p>
                <small>${new Date(t.fecha).toLocaleDateString()}</small>
            `;

            // Expandir/contraer mensaje
            tarjeta.addEventListener('click', () => {
                const corto = tarjeta.querySelector('.mensaje-corto');
                const completo = tarjeta.querySelector('.mensaje-completo');
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
    } catch (err) {
        console.error("Error cargando testimonios", err);
    }
}

cargarTestimonios();
