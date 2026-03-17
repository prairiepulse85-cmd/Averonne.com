/* ============================================================
   AVERONNE RESEARCH AND CONSULTING — main.js
   Navigation, forms, modals, scroll behaviour
   ============================================================ */

(function () {
  'use strict';

  /* ── Smooth anchor scrolling ──────────────────────────────── */
  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72'
  );

  function scrollToSection(id) {
    const target = document.querySelector(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      closeMobileMenu();
      scrollToSection(href);
    });
  });

  /* ── Nav: scroll class + active link ─────────────────────── */
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav__link');

  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + NAV_HEIGHT + 60;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }

  window.addEventListener('scroll', () => {
    updateNav();
    updateActiveLink();
  }, { passive: true });

  updateNav();

  /* ── Mobile hamburger ─────────────────────────────────────── */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');

  function closeMobileMenu() {
    if (hamburger) hamburger.classList.remove('open');
    if (mobileMenu) mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  /* ── Contact form ─────────────────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  const formWrapper = document.querySelector('.contact-form__form-wrap');
  const formSuccess = document.querySelector('.form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      const btn = contactForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      // Formspree endpoint — replace FORM_ID with actual ID once deployed
      const FORMSPREE_ENDPOINT = contactForm.dataset.formspree || '';

      try {
        if (FORMSPREE_ENDPOINT) {
          const data = new FormData(contactForm);
          const res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: data,
            headers: { Accept: 'application/json' }
          });
          if (!res.ok) throw new Error('Server error');
        } else {
          // Static success state for dev / pre-deployment
          await new Promise(r => setTimeout(r, 600));
        }

        if (formWrapper) formWrapper.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('visible');

      } catch {
        btn.textContent = 'Failed — Please Try Again';
        btn.disabled = false;
        setTimeout(() => {
          btn.textContent = originalText;
        }, 3000);
      }
    });
  }

  /* ── Internship modal ─────────────────────────────────────── */
  const internshipBtn = document.getElementById('internship-btn');
  const internshipModal = document.getElementById('internship-modal');
  const internshipForm = document.getElementById('internship-form');
  const internshipSuccess = document.querySelector('#internship-modal .form-success');
  const internshipFormWrap = document.querySelector('#internship-modal .modal__form-wrap');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (internshipBtn) {
    internshipBtn.addEventListener('click', () => openModal(internshipModal));
  }

  document.querySelectorAll('.modal__close, .modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target === el) {
        const modal = el.closest('.modal-overlay') || document.querySelector('.modal-overlay');
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m));
    }
  });

  if (internshipForm) {
    internshipForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = internshipForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      await new Promise(r => setTimeout(r, 600));

      if (internshipFormWrap) internshipFormWrap.style.display = 'none';
      if (internshipSuccess) internshipSuccess.classList.add('visible');
    });
  }

  /* ── Intersection Observer: fade-in on scroll ─────────────── */
  const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(
    '.area-card, .feature-card, .leader-card, .leader-card--featured, .work-card, .pathway-step'
  ).forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    el.classList.add('fade-up');
    observer.observe(el);
  });

  /* ── Animate-in CSS injected via JS ─────────────────────── */
  const animStyle = document.createElement('style');
  animStyle.textContent = `
    .fade-up {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .fade-up.in-view {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(animStyle);

})();
