// Nice Home Care - JavaScript Principal

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Menú móvil
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // 2. Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('#mobileMenu a').forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });
    });
    
    // 3. Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // 4. Cambiar estilo del header al hacer scroll
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > 50) {
            if (header) {
                header.classList.add('shadow-lg');
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        } else {
            if (header) {
                header.classList.remove('shadow-lg');
                header.style.background = 'rgba(255, 255, 255, 0.9)';
            }
        }
        
        lastScroll = currentScroll;
    });
    
    // 5. Formulario de contacto - Envío
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envío
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
            submitBtn.disabled = true;
            
            // Obtener datos del formulario
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            console.log('Datos del formulario:', data);
            
            // Simular respuesta del servidor
            setTimeout(() => {
                if (formSuccess) {
                    formSuccess.classList.remove('hidden');
                }
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                this.reset();
                
                // Ocultar mensaje después de 5 segundos
                setTimeout(() => {
                    if (formSuccess) {
                        formSuccess.classList.add('hidden');
                    }
                }, 5000);
            }, 1500);
        });
    }
    
    // 6. Formulario rápido (hero)
    const quickForm = document.getElementById('quickForm');
    
    if (quickForm) {
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('¡Gracias por tu interés! Te contactaremos en las próximas 24 horas.');
            this.reset();
        });
    }
    
    // 7. Detectar si el usuario está en móvil
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Ajustes para móvil
        document.querySelectorAll('.service-card .text-xl').forEach(el => {
            el.style.fontSize = '1.1rem';
        });
    }
    
    // 8. Lazy loading de imágenes (si las agregas)
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // 9. Contador de visitas (simulado)
    console.log('✅ Nice Home Care - Sitio cargado correctamente');
    console.log('📊 Visitas aproximadas:', Math.floor(Math.random() * 1000) + 100);
});

// 10. Funciones globales útiles
window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.openWhatsApp = function() {
    const phone = '1234567890';
    const message = 'Hola, me gustaría obtener información sobre los servicios de Nice Home Care.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};