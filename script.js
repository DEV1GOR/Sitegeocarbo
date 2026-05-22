(function() {
  'use strict';

  var raf = window.requestAnimationFrame || function(fn) { setTimeout(fn, 16); };
  var isPassive = false;
  try {
    window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
      get: function() { isPassive = true; }
    }));
  } catch(e) {}
  var opts = isPassive ? { passive: true } : false;

  var navbar = document.getElementById('navbar');
  var ticking = false;

  function updateNav() {
    var y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      raf(updateNav);
      ticking = true;
    }
  }, opts);

  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  var tickingActive = false;

  function updateActiveLink() {
    var scrollY = window.scrollY + 120;
    var current = '';
    sections.forEach(function(s) {
      var top = s.offsetTop;
      var height = s.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = s.getAttribute('id');
      }
    });
    navLinks.forEach(function(l) {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
    tickingActive = false;
  }

  window.addEventListener('scroll', function() {
    if (!tickingActive) {
      raf(updateActiveLink);
      tickingActive = true;
    }
  }, opts);
  updateActiveLink();

  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function(el) {
    revealObserver.observe(el);
  });

  var counters = document.querySelectorAll('[data-count]');
  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = parseInt(el.getAttribute('data-duration')) || 2000;
        var start = performance.now();
        var isInt = target % 1 === 0;

        function animate(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = eased * target;
          if (isInt) {
            el.textContent = Math.round(current) + suffix;
          } else {
            el.textContent = current.toFixed(1).replace('.', ',') + suffix;
          }
          if (progress < 1) {
            raf(animate);
          }
        }
        raf(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(function(el) {
    counterObserver.observe(el);
  });

  var hero = document.getElementById('inicio');
  var glow = document.createElement('div');
  glow.className = 'mouse-glow';
  glow.style.display = 'none';
  document.body.appendChild(glow);

  var tickingGlow = false;

  if (hero) {
    hero.addEventListener('mouseenter', function() {
      glow.style.display = 'block';
    }, opts);
    hero.addEventListener('mouseleave', function() {
      glow.style.display = 'none';
    }, opts);
  }

  document.addEventListener('mousemove', function(e) {
    if (!tickingGlow && glow.style.display !== 'none') {
      raf(function() {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        tickingGlow = false;
      });
      tickingGlow = true;
    }
  }, opts);



  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      menuToggle.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        menuToggle.classList.remove('active');
      });
    });
  }

  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      var data = {
        nome: form.nome.value,
        email: form.email.value,
        empresa: form.empresa.value || 'Nao informado',
        _subject: 'Novo contato SECCO GeoCarbo'
      };

      fetch('https://formsubmit.co/ajax/gruposeccolab@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function(r) { return r.json(); })
      .then(function() {
        document.getElementById('success-modal').classList.add('active');
        form.reset();
      })
      .catch(function() {
        alert('Erro ao enviar. Tente novamente mais tarde.');
      })
      .finally(function() {
        btn.textContent = original;
        btn.disabled = false;
      });
    });
  }
})();
