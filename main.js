/* ============================================================
   UI interactions — nav, reveals, tilt, form, back-to-top
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- nav: scrolled state ---------- */
  var nav = document.querySelector('.nav');
  function onScrollNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- nav: mobile toggle ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- nav: active link via scroll spy ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var navAnchors = Array.prototype.slice.call(links.querySelectorAll('a'));

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = '#' + entry.target.id;
        navAnchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal, .goals');
  if (reduced) {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  // stagger children of grids automatically
  ['.skills-grid', '.learn-grid', '.timeline'].forEach(function (sel) {
    var wrap = document.querySelector(sel);
    if (!wrap) return;
    Array.prototype.forEach.call(wrap.children, function (child, i) {
      child.style.setProperty('--rd', (i * 0.08) + 's');
    });
  });

  /* ---------- 3D tilt on hover ---------- */
  if (!reduced && !isTouch) {
    var tilts = document.querySelectorAll('.tilt');
    tilts.forEach(function (card) {
      var max = parseFloat(card.getAttribute('data-tilt-max') || '8');
      var raf = null;

      function onMove(e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        // glow position for .skill cards
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        var rx = (0.5 - py) * max;
        var ry = (px - 0.5) * max;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(6px)';
        });
      }
      function onLeave() {
        if (raf) cancelAnimationFrame(raf);
        card.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        setTimeout(function () { card.style.transition = ''; }, 600);
      }
      card.addEventListener('pointerenter', function () { card.style.transition = 'transform 0.15s ease-out'; setTimeout(function(){ card.style.transition = ''; }, 150); });
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
    });
  }

  /* ---------- back to top ---------- */
  var toTop = document.getElementById('toTop');
  function onScrollTop() {
    toTop.classList.toggle('is-visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScrollTop, { passive: true });
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- contact form (client-side, mailto fallback) ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var msg = form.message.value.trim();

    if (!name || !email || !msg) {
      status.textContent = 'Please fill in all fields.';
      status.style.color = '#f87171';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.style.color = '#f87171';
      return;
    }

    var subject = encodeURIComponent('Portfolio inquiry from ' + name);
    var body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:gjohnemerson@gmail.com?subject=' + subject + '&body=' + body;

    status.style.color = '#34d399';
    status.textContent = 'Opening your email app… Thank you for reaching out!';
    form.reset();
  });
})();
