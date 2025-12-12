// Slider for margin example on Dropshipping
document.addEventListener('DOMContentLoaded', function () {
    var cardsSlider = document.getElementById('cards-slider');
    var indicators = document.querySelector('.slider-indicators');
    if (!cardsSlider || !indicators) return;
    var panels = Array.prototype.slice.call(cardsSlider.querySelectorAll('.panel'));
    var dots = Array.prototype.slice.call(indicators.querySelectorAll('.dot'));
    var counter = indicators.querySelector('.counter');
    var prevBtn = cardsSlider.querySelector('.slider-btn.transparent.prev');
    var nextBtn = cardsSlider.querySelector('.slider-btn.transparent.next');

    function updateActive() {
        var scrollLeft = cardsSlider.scrollLeft;
        var width = cardsSlider.clientWidth;
        var index = Math.round(scrollLeft / width);
        dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
        if (counter) counter.textContent = (index + 1) + '/' + panels.length;
    }

    // Initialize
    updateActive();

    // Listen to scroll to update indicators
    cardsSlider.addEventListener('scroll', function () {
        window.requestAnimationFrame(updateActive);
    }, { passive: true });

    function scrollBy(delta) {
        cardsSlider.scrollTo({ left: cardsSlider.scrollLeft + delta, behavior: 'smooth' });
    }
    var width = cardsSlider.clientWidth;
    if (prevBtn) prevBtn.addEventListener('click', function(){ scrollBy(-width); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ scrollBy(width); });

    // Swipe/drag support (Instagram-like)
    var isDown = false;
    var startX = 0;
    var startScrollLeft = 0;
    var lastX = 0;
    var velocity = 0;
    var lastTime = 0;

    function onPointerDown(e){
        isDown = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startScrollLeft = cardsSlider.scrollLeft;
        lastX = startX;
        lastTime = performance.now();
        cardsSlider.classList.add('dragging');
    }
    function onPointerMove(e){
        if(!isDown) return;
        var x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        var dx = x - lastX;
        var now = performance.now();
        var dt = Math.max(1, now - lastTime);
        velocity = dx / dt; // px per ms
        lastX = x;
        lastTime = now;
        var delta = startX - x;
        cardsSlider.scrollLeft = startScrollLeft + delta;
        e.preventDefault();
    }
    function onPointerUp(){
        if(!isDown) return;
        isDown = false;
        cardsSlider.classList.remove('dragging');
        // Snap to nearest panel
        var index = Math.round(cardsSlider.scrollLeft / cardsSlider.clientWidth);
        cardsSlider.scrollTo({ left: index * cardsSlider.clientWidth, behavior: 'smooth' });
    }

    // Mouse
    cardsSlider.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    // Touch
    cardsSlider.addEventListener('touchstart', onPointerDown, { passive: true });
    cardsSlider.addEventListener('touchmove', onPointerMove, { passive: false });
    cardsSlider.addEventListener('touchend', onPointerUp);
});
// Slider for testimonials (horizontal carousel)
document.addEventListener('DOMContentLoaded', function () {
    var tSlider = document.getElementById('testimonials-slider');
    if (!tSlider) return;
    var tCards = Array.prototype.slice.call(tSlider.querySelectorAll('.t-card'));
    var prevBtn = tSlider.querySelector('.slider-btn.transparent.prev');
    var nextBtn = tSlider.querySelector('.slider-btn.transparent.next');
    var counter = document.querySelector('#testimonios .t-indicators .counter');

    function updateCounter() {
        var idx = Math.round(tSlider.scrollLeft / tSlider.clientWidth);
        if (counter) counter.textContent = (idx + 1) + '/' + tCards.length;
    }

    updateCounter();
    tSlider.addEventListener('scroll', function(){ window.requestAnimationFrame(updateCounter); }, { passive: true });

    function scrollBy(delta) {
        tSlider.scrollTo({ left: tSlider.scrollLeft + delta, behavior: 'smooth' });
    }
    var width = tSlider.clientWidth;
    if (prevBtn) prevBtn.addEventListener('click', function(){ scrollBy(-width); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ scrollBy(width); });

    // Swipe/drag support
    var isDown = false;
    var startX = 0; var startScrollLeft = 0;
    function onPointerDown(e){
        isDown = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startScrollLeft = tSlider.scrollLeft;
        tSlider.classList.add('dragging');
    }
    function onPointerMove(e){
        if(!isDown) return;
        var x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        var delta = startX - x;
        tSlider.scrollLeft = startScrollLeft + delta;
        e.preventDefault();
    }
    function onPointerUp(){
        if(!isDown) return;
        isDown = false; tSlider.classList.remove('dragging');
        var index = Math.round(tSlider.scrollLeft / tSlider.clientWidth);
        tSlider.scrollTo({ left: index * tSlider.clientWidth, behavior: 'smooth' });
    }
    tSlider.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    tSlider.addEventListener('touchstart', onPointerDown, { passive: true });
    tSlider.addEventListener('touchmove', onPointerMove, { passive: false });
    tSlider.addEventListener('touchend', onPointerUp);
});
/*
 * =================================================================
 * landing.js - Funcionalidad básica y mejoras de UX para Woz Marketplace
 * Incluye Smooth Scrolling y Simulación de Validación.
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. --- Implementación de Desplazamiento Suave (Smooth Scrolling) ---
    // Esto mejora la experiencia al hacer clic en enlaces internos (como la navegación o los botones CTA)
    
    // Selecciona todos los enlaces que contienen un hash (#) en su href
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Previene el comportamiento de salto predeterminado
            e.preventDefault();

            // Obtiene el ID del elemento de destino (ej: #marketplace)
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Realiza el desplazamiento suave hasta el elemento de destino
                window.scrollTo({
                    top: targetElement.offsetTop - 50, // Ajusta 50px para dejar espacio por encima
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. --- Simulación de Funcionalidad para Botones de Acción ---
    // Simula la acción de registro/inicio de sesión y muestra una alerta para futuras integraciones
    
    const registrationButton = document.querySelector('a[href="#registro"] button');
    const loginButton = document.querySelector('a[href="#inicio-sesion"] button');

    // Función que simula el proceso
    function simulateAction(actionType) {
        // En una aplicación real, aquí iría la lógica de API, validación real, etc.
        const message = `Éxito. Redirigiendo a la página de ${actionType}...\n(Esta es una simulación JS. En producción, aquí se procesaría el formulario.)`;
        
        // Muestra un mensaje al usuario
        alert(message);
        
        // Simula la redirección después de un breve tiempo
        // setTimeout(() => {
        //     window.location.href = `/${actionType}.html`; 
        // }, 500);
    }

    if (registrationButton) {
        registrationButton.addEventListener('click', function(e) {
            e.preventDefault();
            simulateAction('registro');
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            simulateAction('inicio de sesión');
        });
    }

    // 3. --- Efecto Sutil al Cargar la Página (Mejora Estética) ---
    // Agrega una clase al body después de la carga para permitir transiciones de entrada suaves si se define en CSS
    document.body.classList.add('js-loaded');
});

// Nota: Para ver el efecto de 'js-loaded' necesitarías añadir CSS como:
/*
body { opacity: 0; transition: opacity 0.5s ease; }
body.js-loaded { opacity: 1; }
*/
// FAQ accordion: hide/show answers on question click
document.addEventListener('DOMContentLoaded', function(){
    var faq = document.querySelector('#faq');
    if (!faq) return;
    var items = faq.querySelectorAll('dl dt');
    items.forEach(function(dt){
        var dd = dt.nextElementSibling;
        if (!dd || dd.tagName.toLowerCase() !== 'dd') return;
        dd.style.display = 'none';
        dt.setAttribute('tabindex', '0');
        dt.setAttribute('role', 'button');
        dt.setAttribute('aria-expanded', 'false');
        function toggle(){
            var open = dt.classList.toggle('open');
            dd.style.display = open ? 'block' : 'none';
            dd.classList.toggle('open', open);
            dt.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        dt.addEventListener('click', toggle);
        dt.addEventListener('keydown', function(e){
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    });
});