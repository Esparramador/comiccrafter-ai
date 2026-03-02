/* ═══════════════════════════════════════════════════
   COMIC CRAFTER — Dynamic Gallery Background + UI + PWA Bridge
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
      this.pwaInstallBanner();
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
    },

    pwaInstallBanner() {
      var dismissed = localStorage.getItem('cc_pwa_banner_dismissed');
      if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

      var isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || navigator.standalone === true;
      if (isStandalone) return;

      var deferredPrompt = null;
      var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

      function showBanner() {
        var banner = document.createElement('div');
        banner.id = 'cc-pwa-banner';
        banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:16px;animation:cc-slide-up 0.5s ease-out;';
        banner.innerHTML = '<div style="max-width:480px;margin:0 auto;background:linear-gradient(135deg,#111322,#1a1d35);border:1px solid rgba(147,51,234,0.2);border-radius:16px;padding:16px;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 30px rgba(0,0,0,0.5)">'
          + '<div style="width:48px;height:48px;border-radius:12px;background:rgba(147,51,234,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
          + '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          + '<div style="font-size:14px;font-weight:700;color:#fff">Instalar Comic Crafter</div>'
          + '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">Accede más rápido desde tu pantalla de inicio</div>'
          + '</div>'
          + '<button id="cc-pwa-install" style="background:#9333ea;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">Instalar</button>'
          + '<button id="cc-pwa-close" style="background:none;border:none;color:rgba(255,255,255,0.2);cursor:pointer;padding:4px;font-size:18px">&times;</button>'
          + '</div>';

        document.body.appendChild(banner);

        document.getElementById('cc-pwa-install').addEventListener('click', function() {
          if (isIOS) {
            banner.querySelector('div > div:nth-child(2)').innerHTML = '<div style="font-size:12px;font-weight:700;color:#fff">Instalar en iOS</div>'
              + '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;line-height:1.5">'
              + '1. Pulsa ⬆️ <b>Compartir</b> en Safari<br>'
              + '2. Pulsa <b>Añadir a pantalla de inicio</b><br>'
              + '3. Pulsa <b>Añadir</b></div>';
            return;
          }
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(r) {
              if (r.outcome === 'accepted') banner.remove();
              deferredPrompt = null;
            });
          }
        });

        document.getElementById('cc-pwa-close').addEventListener('click', function() {
          banner.remove();
          localStorage.setItem('cc_pwa_banner_dismissed', String(Date.now()));
        });
      }

      if (isIOS) {
        setTimeout(showBanner, 3000);
      } else {
        window.addEventListener('beforeinstallprompt', function(e) {
          e.preventDefault();
          deferredPrompt = e;
          setTimeout(showBanner, 2000);
        });
      }

      var style = document.createElement('style');
      style.textContent = '@keyframes cc-slide-up{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}';
      document.head.appendChild(style);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CC.init());
  } else {
    CC.init();
  }
})();
