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

  /* ── Form submit helper (Google Apps Script) ─────────────── */
  // Apps Script web apps don't support CORS preflight, so we use
  // mode:'no-cors' with URLSearchParams (simple request, no preflight).
  // The response is opaque — we show success after the fetch resolves.
  async function submitToAppsScript(scriptUrl, formEl, extraFields) {
    const params = new URLSearchParams(new FormData(formEl));
    if (extraFields) {
      Object.entries(extraFields).forEach(([k, v]) => params.append(k, v));
    }
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: params
    });
    // With no-cors the response is always opaque (indistinguishable from
    // success/failure). The Apps Script processes the data server-side.
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

      // Google Apps Script deployment URL
      // Set data-script-url="https://script.google.com/macros/s/.../exec" on the <form>
      const SCRIPT_URL = contactForm.dataset.scriptUrl || '';

      try {
        if (SCRIPT_URL) {
          await submitToAppsScript(SCRIPT_URL, contactForm, { form_type: 'contact' });
        } else {
          // Static success state for local dev / pre-deployment
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

  /* ── URL parameter pre-selection for engagement type ──────── */
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  if (typeParam) {
    const dropdown = document.getElementById('contact-type');
    if (dropdown) {
      const paramMap = {
        'ai-snapshot': 'ai-snapshot',
        'scope-review': 'social-science-field'
      };
      const mappedValue = paramMap[typeParam];
      if (mappedValue) {
        dropdown.value = mappedValue;
      }
    }
  }

  /* ── Start Here CTA: scroll to contact + pre-select type ─── */
  document.querySelectorAll('.start-here__cta').forEach(function(cta) {
    cta.addEventListener('click', function(e) {
      e.preventDefault();
      var dataType = cta.getAttribute('data-type');
      var dropdown = document.getElementById('contact-type');
      if (dropdown && dataType) {
        var paramMap = {
          'ai-snapshot': 'ai-snapshot',
          'scope-review': 'social-science-field'
        };
        var mappedValue = paramMap[dataType];
        if (mappedValue) {
          dropdown.value = mappedValue;
        }
      }
      scrollToSection('#contact');
    });
  });

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
    '.area-card, .feature-card, .leader-profile, .advisory-card, .work-card, .pathway-step, .trigger-item, .brief-card, .start-here__card, .evidence-block'
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
