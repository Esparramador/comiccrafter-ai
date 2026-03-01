/* ═══════════════════════════════════════════════════
   COMIC CRAFTER — Dynamic Gallery Background + UI
   ═══════════════════════════════════════════════════ */

(function() {
  'use strict';

  const CC = {
    init() {
      this.galleryBg();
      this.galleryScroll();
      this.mobileMenu();
      this.quantityButtons();
      this.smoothAnchors();
      this.observeAnimations();
    },

    galleryBg() {
      const container = document.querySelector('.cc-gallery-bg__grid');
      if (!container) return;

      const images = JSON.parse(container.dataset.images || '[]');
      if (!images.length) return;

      const speed = parseInt(container.dataset.speed || '4', 10) * 1000;
      const opacity = parseInt(container.dataset.opacity || '12', 10) / 100;
      const cells = container.querySelectorAll('.cc-gallery-bg__item');

      container.style.opacity = opacity;

      let offset = 0;

      function cycleImages() {
        offset = (offset + 1) % images.length;
        cells.forEach((cell, i) => {
          const img = cell.querySelector('img');
          if (!img) return;
          const idx = (offset + i) % images.length;
          const newSrc = images[idx];
          if (img.src !== newSrc) {
            cell.style.animation = 'none';
            cell.offsetHeight;
            img.src = newSrc;
            cell.style.animationDelay = (i * 150) + 'ms';
            cell.style.animation = 'cc-gallery-fade 1.2s ease-out forwards';
          }
        });
      }

      setInterval(cycleImages, speed);
    },

    galleryScroll() {
      const track = document.querySelector('.cc-gallery-scroll__track');
      if (!track) return;

      const items = track.querySelectorAll('.cc-gallery-scroll__item');
      if (!items.length) return;

      const itemWidth = 100 / 5;
      let offset = 0;
      const totalItems = items.length / 2;

      setInterval(() => {
        offset = (offset + 1) % totalItems;
        track.style.transform = `translateX(-${offset * itemWidth}%)`;
      }, 3000);
    },

    mobileMenu() {
      const toggle = document.querySelector('.cc-header__menu-toggle');
      const nav = document.querySelector('.cc-mobile-nav');
      if (!toggle || !nav) return;

      toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        const isOpen = nav.classList.contains('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
        toggle.innerHTML = isOpen
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
      });

      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('is-open');
        });
      });
    },

    quantityButtons() {
      document.querySelectorAll('.cc-product__quantity').forEach(wrapper => {
        const input = wrapper.querySelector('.cc-product__quantity-input');
        if (!input) return;

        wrapper.querySelectorAll('.cc-product__quantity-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            let val = parseInt(input.value || '1', 10);
            if (btn.dataset.action === 'increase') val++;
            if (btn.dataset.action === 'decrease' && val > 1) val--;
            input.value = val;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          });
        });
      });
    },

    smoothAnchors() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    },

    observeAnimations() {
      if (!('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cc-animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.cc-animate-on-scroll').forEach(el => {
        observer.observe(el);
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CC.init());
  } else {
    CC.init();
  }
})();
