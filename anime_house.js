/* ============================================================
   LOFI ANIME HOUSE — Interactive Animations & Sound System
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── CLOCK & DATE MODULE ───────────────────────────────────
  const timeDisplay = document.getElementById('timeDisplay');
  const dateDisplay = document.getElementById('dateDisplay');

  function updateClock() {
    const now = new Date();
    if (timeDisplay) {
      timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }
    if (dateDisplay) {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      dateDisplay.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ─── AMBIANCE ATMOSPHERE FILTERS ───────────────────────────
  const body = document.body;
  const btnSunset = document.getElementById('btnSunset');
  const btnNight = document.getElementById('btnNight');
  const btnDay = document.getElementById('btnDay');
  const buttons = [btnSunset, btnNight, btnDay];

  buttons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        buttons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const filter = e.target.getAttribute('data-filter');
        body.className = ''; // Reset classes
        body.classList.add(filter);
      });
    }
  });

  // ─── PARALLAX MOUSE EFFECT ─────────────────────────────────
  const parallaxWrap = document.querySelector('.parallax-wrap');
  
  if (parallaxWrap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('mousemove', (e) => {
      const xOffset = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const yOffset = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      // Translate limited to max 1.5% drift to avoid background edge gaps
      const xTranslate = xOffset * -1.5;
      const yTranslate = yOffset * -1.5;

      parallaxWrap.style.transform = `translate(${xTranslate}%, ${yTranslate}%)`;
    });
  }

  // ─── COZY QUOTE CYCLER ─────────────────────────────────────
  const quotes = [
    "\"Coding in the quiet shade of the sakura.\"",
    "\"Sunset warmth and glowing compiled code lines.\"",
    "\"Raindrops on the roof, local model loading in.\"",
    "\"Ambient lofi beats and discrete math algorithms.\"",
    "\"Zero cloud API bills. Just local intelligence cottage.\"",
    "\"Midnight compiler handshakes under neon lanterns.\""
  ];
  let quoteIndex = 0;
  const quotePanel = document.getElementById('cozyQuote');

  if (quotePanel) {
    setInterval(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      quotePanel.style.opacity = '0';
      setTimeout(() => {
        quotePanel.textContent = quotes[quoteIndex];
        quotePanel.style.opacity = '1';
      }, 500);
    }, 15000);
  }

  // ─── DOUBLE PARTICLE CANVAS SYSTEM ─────────────────────────
  const sakuraCanvas = document.getElementById('sakuraCanvas');
  const rainCanvas = document.getElementById('rainCanvas');
  
  const sCtx = sakuraCanvas.getContext('2d');
  const rCtx = rainCanvas.getContext('2d');

  function resizeCanvases() {
    sakuraCanvas.width = window.innerWidth;
    sakuraCanvas.height = window.innerHeight;
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // 🌸 Sakura Particle Class
  class SakuraPetal {
    constructor() {
      this.reset();
      // Start randomly on screen on init
      this.y = Math.random() * sakuraCanvas.height;
    }

    reset() {
      this.x = Math.random() * sakuraCanvas.width + (sakuraCanvas.width * 0.1); // Spawns right
      this.y = -20;
      this.size = Math.random() * 8 + 4;
      this.speedX = (Math.random() - 0.7) * 1.5 - 1; // Drifts leftwards
      this.speedY = Math.random() * 1.2 + 0.8; // Drifts down
      this.rotation = Math.random() * Math.PI;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      this.opacity = Math.random() * 0.4 + 0.3;
      this.swaySpeed = Math.random() * 0.02 + 0.005;
      this.swayAngle = Math.random() * Math.PI;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.swayAngle) * 0.3;
      this.swayAngle += this.swaySpeed;
      this.rotation += this.rotationSpeed;

      // Reset when boundaries crossed
      if (this.y > sakuraCanvas.height || this.x < -10 || this.x > sakuraCanvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      sCtx.save();
      sCtx.translate(this.x, this.y);
      sCtx.rotate(this.rotation);
      sCtx.beginPath();
      
      // Draw sakura petal shape (oval with small notch)
      sCtx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
      sCtx.fillStyle = `rgba(255, 183, 197, ${this.opacity})`;
      sCtx.shadowBlur = 4;
      sCtx.shadowColor = 'rgba(255, 183, 197, 0.4)';
      sCtx.fill();
      sCtx.restore();
    }
  }

  // 🌧️ Rain Drop Particle Class
  class RainDrop {
    constructor() {
      this.reset();
      this.y = Math.random() * rainCanvas.height;
    }

    reset() {
      this.x = Math.random() * rainCanvas.width * 1.2; // Compensate for angle
      this.y = -50;
      this.length = Math.random() * 25 + 15;
      this.speedY = Math.random() * 12 + 10;
      this.speedX = -2; // Drifts slightly left
      this.opacity = Math.random() * 0.15 + 0.05;
      this.width = Math.random() * 0.8 + 0.4;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      if (this.y > rainCanvas.height || this.x < -20) {
        this.reset();
      }
    }

    draw() {
      rCtx.beginPath();
      rCtx.moveTo(this.x, this.y);
      rCtx.lineTo(this.x + this.speedX * 1.5, this.y + this.length);
      rCtx.strokeStyle = `rgba(174, 219, 255, ${this.opacity})`;
      rCtx.lineWidth = this.width;
      rCtx.stroke();
    }
  }

  // Instantiate particles
  const sakuraPetals = [];
  const rainDrops = [];
  const SAKURA_COUNT = 30;
  const RAIN_COUNT = 120;

  for (let i = 0; i < SAKURA_COUNT; i++) {
    sakuraPetals.push(new SakuraPetal());
  }

  for (let i = 0; i < RAIN_COUNT; i++) {
    rainDrops.push(new RainDrop());
  }

  // Animation Loops
  function loopSakura() {
    sCtx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);
    sakuraPetals.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loopSakura);
  }

  let isRaining = false;
  function loopRain() {
    if (!isRaining) return;
    rCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    rainDrops.forEach(d => {
      d.update();
      d.draw();
    });
    requestAnimationFrame(loopRain);
  }

  // Start initial animation
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loopSakura();
  }

  // ─── RAIN SYSTEM WEATHER BUTTON CONTROLLER ────────────────
  const btnRain = document.getElementById('btnRain');
  const btnRainSound = document.getElementById('btnRainSound');

  if (btnRain) {
    btnRain.addEventListener('click', () => {
      isRaining = !isRaining;
      btnRain.classList.toggle('active', isRaining);
      btnRain.textContent = isRaining ? "RAIN: ON" : "RAIN: OFF";

      if (isRaining) {
        rainCanvas.classList.add('visible');
        loopRain();
        if (btnRainSound) btnRainSound.removeAttribute('disabled');
      } else {
        rainCanvas.classList.remove('visible');
        setTimeout(() => {
          rCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
        }, 1500);
        
        // Pause sound if rain is toggled off
        if (btnRainSound) {
          btnRainSound.setAttribute('disabled', 'true');
          btnRainSound.classList.remove('active');
          btnRainSound.textContent = 'PLAY';
          audioRain.pause();
        }
      }
    });
  }

  // ─── AUDIO ENGINE MODULE ───────────────────────────────────
  const audioLofi = document.getElementById('audioLofi');
  const audioRain = document.getElementById('audioRain');
  const btnMusic = document.getElementById('btnMusic');

  // Set initial volumes
  if (audioLofi) audioLofi.volume = 0.35;
  if (audioRain) audioRain.volume = 0.5;

  function toggleAudio(audioEl, buttonEl) {
    if (audioEl.paused) {
      audioEl.play().then(() => {
        buttonEl.classList.add('active');
        buttonEl.textContent = 'MUTE';
      }).catch(err => {
        console.error('Audio playback failed:', err);
      });
    } else {
      audioEl.pause();
      buttonEl.classList.remove('active');
      buttonEl.textContent = 'PLAY';
    }
  }

  if (btnMusic && audioLofi) {
    btnMusic.addEventListener('click', () => {
      toggleAudio(audioLofi, btnMusic);
    });
  }

  if (btnRainSound && audioRain) {
    btnRainSound.addEventListener('click', () => {
      toggleAudio(audioRain, btnRainSound);
    });
  }

});
