/* ============================================================
   CYBERPUNK PORTFOLIO — Interactive Scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Terminal Boot Log Animation ─────────────────────────
  const bootLines = [
    { text: "> initializing nexus_core...", delay: 0 },
    { text: "> loading profile: anurag.dev", delay: 250 },
    { text: "> [<span class='ok'>OK</span>] language models: connected", delay: 500 },
    { text: "> [<span class='ok'>OK</span>] portfolio: compiled", delay: 750 },
    { text: "> tags detected: <span class='tag'>#ai</span> <span class='tag'>#automation</span> <span class='tag'>#chatbots</span>", delay: 1000 },
    { text: "> status: available for freelance work", delay: 1300 },
    { text: "> ready.", delay: 1600 }
  ];

  const logContainer = document.getElementById('bootLog');
  const heroIdentity = document.querySelector('.hero-identity');

  if (logContainer) {
    bootLines.forEach((line) => {
      const el = document.createElement('div');
      el.className = 'boot-line mono';
      el.innerHTML = line.text;
      logContainer.appendChild(el);

      // Trigger visibility after delay
      setTimeout(() => {
        el.classList.add('visible');
      }, line.delay);
    });

    // Make the identity block visible after terminal boots
    setTimeout(() => {
      if (heroIdentity) {
        heroIdentity.classList.add('active');
      }
    }, 2200);
  }


  // ─── Navbar Scroll Effect ──────────────────────────────────
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });


  // ─── Mobile Navbar Toggle ──────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  // ─── Active Nav Link Scroll Tracker ────────────────────────
  const sections = document.querySelectorAll('section');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const tracker = () => {
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  };

  window.addEventListener('scroll', tracker, { passive: true });


  // ─── Scroll Reveal Observer ────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));


  // ─── Dynamic Particle Network Background ───────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:-2;pointer-events:none;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 45;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.3 + 0.1;
      this.color = Math.random() > 0.5 ? '63, 221, 196' : '255, 176, 0'; // teal or amber
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(63, 221, 196, ${0.05 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(loop);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loop();
  }

});
