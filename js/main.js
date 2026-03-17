/* ============================================
   AVERONNE.COM — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- Navbar scroll effect ---
  var navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- Mobile hamburger ---
  var hamburger = document.querySelector('.hamburger');
  var navLinks = document.querySelector('.nav-links');

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // --- Active nav highlighting ---
  var sections = document.querySelectorAll('section[id]');
  var navItems = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    var scrollPos = window.scrollY + 100;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(function (item) {
          item.classList.remove('active');
          if (item.getAttribute('href') === '#' + id) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // --- Contact form ---
  var contactForm = document.getElementById('contact-form');
  var formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      contactForm.style.display = 'none';
      formSuccess.classList.add('visible');
    });
  }

  // --- Sticky CTA visibility ---
  var stickyCta = document.getElementById('sticky-cta');
  if (stickyCta) {
    window.addEventListener('scroll', function () {
      // Show sticky CTA after scrolling past the hero section
      if (window.scrollY > window.innerHeight * 0.8) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }

      // Hide when contact section is in view
      var contactSection = document.getElementById('contact');
      if (contactSection) {
        var contactTop = contactSection.offsetTop;
        var scrollBottom = window.scrollY + window.innerHeight;
        if (scrollBottom > contactTop + 100) {
          stickyCta.classList.remove('visible');
        }
      }
    });
  }
})();
