/* ============================================================
   NEXUS AI — Business Logic & WebGL/Canvas Particle Engines
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. Loading Screen & Boot Sequence ───────────────────────
  const bootScreen = document.getElementById('bootScreen');
  const bootLog = document.getElementById('bootLog');
  const progressFill = document.getElementById('progressFill');

  const bootSteps = [
    { text: "SYSTEM STATUS: BOOT_INITIALIZATION_STARTED", delay: 100 },
    { text: "> Allocating synaptic matrix blocks [VRAM: 96GB]... [OK]", delay: 300 },
    { text: "> Connecting local Ollama channels on ports 11434... [CONNECTED]", delay: 500 },
    { text: "> Loading Heuristic Synaptic Models (Nexus-ASI-v9.2)... [100%]", delay: 800 },
    { text: "> Calibrating Quantum Entanglement Transceiver... [OK]", delay: 1000 },
    { text: "> Initializing Neural network layers... [1,024 layers]", delay: 1200 },
    { text: "> [WARNING] Security firewall handshake requested.", delay: 1400 },
    { text: "> Authorizing access token... [CODE: 0x8F0FF2] [GRANTED]", delay: 1600 },
    { text: "> Running diagnostic network tests... latency: 0.82ms", delay: 1800 },
    { text: "> ALL SYSTEMS STABLE. STARTING INTERFACE CORE...", delay: 2100 }
  ];

  function runBootSequence() {
    if (!bootLog || !progressFill || !bootScreen) return;

    let currentStep = 0;
    const totalDuration = 2400; // ms
    const intervalTime = totalDuration / bootSteps.length;

    const timer = setInterval(() => {
      if (currentStep < bootSteps.length) {
        const logLine = document.createElement('div');
        logLine.innerHTML = bootSteps[currentStep].text;
        bootLog.appendChild(logLine);
        bootLog.scrollTop = bootLog.scrollHeight;

        // Progress bar calculation
        const percent = Math.min(((currentStep + 1) / bootSteps.length) * 100, 100);
        progressFill.style.width = `${percent}%`;

        currentStep++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          bootScreen.classList.add('loaded');
          // Start other canvas animations
          initHeroFace();
          initBrainNetwork();
          initGlobalNetworkMap();
        }, 300);
      }
    }, intervalTime);
  }

  runBootSequence();


  // ─── 2. Responsive Navigation Toggle ───────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // Navbar Scroll Accent
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });


  // ─── 3. WebGL/Canvas Interactive Hero AI Face ─────────────────
  let faceCanvas, faceCtx, faceParticles = [];
  
  function initHeroFace() {
    faceCanvas = document.getElementById('heroFaceCanvas');
    if (!faceCanvas) return;

    faceCtx = faceCanvas.getContext('2d');
    resizeFaceCanvas();
    window.addEventListener('resize', resizeFaceCanvas);

    // Generate Face Particle Matrix
    const particleCount = 180;
    faceParticles = [];
    for (let i = 0; i < particleCount; i++) {
      faceParticles.push({
        baseX: faceCanvas.width / 2,
        baseY: faceCanvas.height / 2,
        x: Math.random() * faceCanvas.width,
        y: Math.random() * faceCanvas.height,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 120 + 20,
        speed: Math.random() * 0.02 + 0.005,
        size: Math.random() * 2 + 0.5,
        pulseOffset: Math.random() * 100,
        color: Math.random() > 0.4 ? '0, 240, 255' : '255, 0, 85' // cyan or pink
      });
    }

    animateHeroFace();
  }

  function resizeFaceCanvas() {
    if (!faceCanvas) return;
    faceCanvas.width = faceCanvas.parentElement.clientWidth;
    faceCanvas.height = faceCanvas.parentElement.clientHeight;
  }

  function animateHeroFace() {
    if (!faceCanvas || !faceCtx) return;
    
    // Clear canvas with subtle trail effect
    faceCtx.fillStyle = 'rgba(5, 7, 10, 0.2)';
    faceCtx.fillRect(0, 0, faceCanvas.width, faceCanvas.height);

    const centerX = faceCanvas.width / 2;
    const centerY = faceCanvas.height / 2;
    const time = Date.now() * 0.001;

    // Draw grid lines in the background
    drawDigitalGrid(faceCtx, faceCanvas.width, faceCanvas.height, time);

    // Render Face Hologram Shape
    faceParticles.forEach((p, idx) => {
      // Calculate circular movements mapped into a "face" profile
      p.angle += p.speed;
      
      // Morph factors using trig equations to create details (eyes, jaw outline)
      const morphX = Math.sin(p.angle * 3 + time) * 20;
      const morphY = Math.cos(p.angle * 2 + time * 1.5) * 45;
      
      // Standard nose and eye clusters
      let finalRadiusX = p.radius + morphX;
      let finalRadiusY = p.radius * 1.3 + morphY;

      if (p.radius < 50) {
        // Core cluster (eyes)
        finalRadiusX = (p.radius + Math.sin(time * 3 + idx) * 10) * 0.8;
        finalRadiusY = (p.radius + Math.cos(time * 2 + idx) * 10) * 0.8;
      }

      const tx = centerX + Math.cos(p.angle) * finalRadiusX;
      const ty = centerY + Math.sin(p.angle) * finalRadiusY;

      // Elastic easing to target coordinate
      p.x += (tx - p.x) * 0.08;
      p.y += (ty - p.y) * 0.08;

      // Draw particle dot
      const pulseSize = p.size + Math.sin(time * 5 + p.pulseOffset) * 0.5;
      faceCtx.beginPath();
      faceCtx.arc(p.x, p.y, Math.max(0.2, pulseSize), 0, Math.PI * 2);
      faceCtx.fillStyle = `rgba(${p.color}, ${0.5 + Math.sin(time * 2 + p.pulseOffset) * 0.3})`;
      faceCtx.fill();

      // Connect lines to nearby neighbors
      for (let j = idx + 1; j < faceParticles.length; j++) {
        const neighbor = faceParticles[j];
        const dx = p.x - neighbor.x;
        const dy = p.y - neighbor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 45) {
          faceCtx.beginPath();
          faceCtx.moveTo(p.x, p.y);
          faceCtx.lineTo(neighbor.x, neighbor.y);
          faceCtx.strokeStyle = `rgba(0, 240, 255, ${0.08 * (1 - dist / 45)})`;
          faceCtx.lineWidth = 0.5;
          faceCtx.stroke();
        }
      }
    });

    requestAnimationFrame(animateHeroFace);
  }

  function drawDigitalGrid(ctx, w, h, time) {
    // Scrollable matrix digital lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.01)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // Horizontal scrolling lines
    const offset = (time * 20) % 60;
    for (let y = offset; y < h; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }


  // ─── 4. Interactive 3D Brain Neural Network Canvas ───────────
  let brainCanvas, brainCtx, brainNodes = [];
  const logHud = document.getElementById('logHud');

  function initBrainNetwork() {
    brainCanvas = document.getElementById('brainCanvas');
    if (!brainCanvas) return;

    brainCtx = brainCanvas.getContext('2d');
    resizeBrainCanvas();
    window.addEventListener('resize', resizeBrainCanvas);

    // Create Neural Network nodes
    const nodeCount = 50;
    brainNodes = [];
    
    const logs = [
      "SYNAPTIC PATHWAY ACTIVE", "PROCESSING HEURISTIC MODEL", "OLLAMA TELEMETRY SYNCHRONIZED",
      "QUANTUM CHANNEL VERIFIED", "SCHEMATIC VECTOR LOADED", "NEURAL THREAD POOL STABLE"
    ];

    for (let i = 0; i < nodeCount; i++) {
      brainNodes.push({
        x: Math.random() * brainCanvas.width,
        y: Math.random() * brainCanvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 3 + 1.5,
        color: Math.random() > 0.4 ? '0, 240, 255' : '189, 0, 255', // cyan or purple
        label: logs[Math.floor(Math.random() * logs.length)],
        id: `node_0x${Math.floor(Math.random() * 9999).toString(16).toUpperCase()}`,
        latency: (Math.random() * 1.5 + 0.1).toFixed(2)
      });
    }

    // Hover Interaction
    let mouse = { x: null, y: null };
    brainCanvas.addEventListener('mousemove', (e) => {
      const rect = brainCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    brainCanvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    animateBrainNetwork(mouse);
  }

  function resizeBrainCanvas() {
    if (!brainCanvas) return;
    brainCanvas.width = brainCanvas.clientWidth;
    brainCanvas.height = brainCanvas.clientHeight;
  }

  function animateBrainNetwork(mouse) {
    if (!brainCanvas || !brainCtx) return;

    brainCtx.clearRect(0, 0, brainCanvas.width, brainCanvas.height);
    const time = Date.now() * 0.001;

    let hoveredNode = null;

    brainNodes.forEach((node, idx) => {
      // Coordinate Update
      node.x += node.vx;
      node.y += node.vy;

      // Wall Bounds bounce
      if (node.x < 10 || node.x > brainCanvas.width - 10) node.vx *= -1;
      if (node.y < 10 || node.y > brainCanvas.height - 10) node.vy *= -1;

      // Mouse Proximity calculation
      let distToMouse = Infinity;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        distToMouse = Math.sqrt(dx * dx + dy * dy);
      }

      // Draw Connection lines
      for (let j = idx + 1; j < brainNodes.length; j++) {
        const other = brainNodes[j];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          brainCtx.beginPath();
          brainCtx.moveTo(node.x, node.y);
          brainCtx.lineTo(other.x, other.y);
          brainCtx.strokeStyle = `rgba(0, 240, 255, ${0.08 * (1 - dist / 100)})`;
          brainCtx.lineWidth = 0.5;
          brainCtx.stroke();
        }
      }

      // Draw Node dot
      const isHovered = distToMouse < 60;
      const sizePulse = node.radius + (isHovered ? Math.sin(time * 10) * 1.5 : 0);

      brainCtx.beginPath();
      brainCtx.arc(node.x, node.y, sizePulse, 0, Math.PI * 2);
      brainCtx.fillStyle = isHovered ? 'rgba(255, 0, 85, 0.9)' : `rgba(${node.color}, 0.75)`;
      brainCtx.shadowColor = `rgb(${node.color})`;
      brainCtx.shadowBlur = isHovered ? 15 : 0;
      brainCtx.fill();
      brainCtx.shadowBlur = 0; // reset

      // Node label popups
      if (isHovered && !hoveredNode) {
        hoveredNode = node;
        
        // Draw interactive ring around hovered node
        brainCtx.beginPath();
        brainCtx.arc(node.x, node.y, 25, 0, Math.PI * 2);
        brainCtx.strokeStyle = 'rgba(255, 0, 85, 0.4)';
        brainCtx.lineWidth = 1;
        brainCtx.setLineDash([4, 4]);
        brainCtx.stroke();
        brainCtx.setLineDash([]);
      }
    });

    // Update telemetry HUD
    if (hoveredNode && logHud) {
      logHud.innerHTML = `
        <span>VAULT NODE: ${hoveredNode.id}</span>
        <span>LATENCY: ${hoveredNode.latency}ms</span>
        <span style="color:var(--neon-pink);">${hoveredNode.label}</span>
      `;
    }

    requestAnimationFrame(() => animateBrainNetwork(mouse));
  }


  // ─── 5. WebGL Global Network Map ─────────────────────────────
  let mapCanvas, mapCtx, mapPoints = [];

  function initGlobalNetworkMap() {
    mapCanvas = document.getElementById('mapCanvas');
    if (!mapCanvas) return;

    mapCtx = mapCanvas.getContext('2d');
    resizeMapCanvas();
    window.addEventListener('resize', resizeMapCanvas);

    // Global Node coordinates
    const cities = [
      { name: "NEOM", x: 0.58, y: 0.45 },
      { name: "TOKYO", x: 0.82, y: 0.35 },
      { name: "SILICON_VALLEY", x: 0.22, y: 0.38 },
      { name: "REYKJAVIK", x: 0.45, y: 0.22 },
      { name: "SINGAPORE", x: 0.75, y: 0.62 },
      { name: "FRANKFURT", x: 0.49, y: 0.30 },
      { name: "SYDNEY", x: 0.85, y: 0.78 }
    ];

    mapPoints = cities.map(city => ({
      name: city.name,
      x: city.x,
      y: city.y,
      pulse: Math.random() * Math.PI,
      speed: Math.random() * 0.05 + 0.02
    }));

    animateGlobalMap();
  }

  function resizeMapCanvas() {
    if (!mapCanvas) return;
    mapCanvas.width = mapCanvas.clientWidth;
    mapCanvas.height = mapCanvas.clientHeight;
  }

  function animateGlobalMap() {
    if (!mapCanvas || !mapCtx) return;

    mapCtx.fillStyle = 'rgba(5, 7, 10, 0.15)';
    mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
    const time = Date.now() * 0.001;

    // Draw pseudo world outlines/grids
    mapCtx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
    mapCtx.lineWidth = 1;
    for (let x = 0; x < mapCanvas.width; x += 40) {
      mapCtx.beginPath();
      mapCtx.moveTo(x, 0);
      mapCtx.lineTo(x, mapCanvas.height);
      mapCtx.stroke();
    }

    // Render city nodes
    mapPoints.forEach((p, idx) => {
      p.pulse += p.speed;
      const px = p.x * mapCanvas.width;
      const py = p.y * mapCanvas.height;

      // Glowing circle
      const glowSize = 4 + Math.sin(p.pulse) * 4;
      mapCtx.beginPath();
      mapCtx.arc(px, py, glowSize, 0, Math.PI * 2);
      mapCtx.fillStyle = 'rgba(57, 255, 20, 0.3)'; // Green glow
      mapCtx.fill();

      // Core point
      mapCtx.beginPath();
      mapCtx.arc(px, py, 3, 0, Math.PI * 2);
      mapCtx.fillStyle = 'var(--neon-green)';
      mapCtx.fill();

      // Pulsing data vectors between nodes
      for (let j = idx + 1; j < mapPoints.length; j++) {
        const target = mapPoints[j];
        const tx = target.x * mapCanvas.width;
        const ty = target.y * mapCanvas.height;

        // Draw static connector line
        mapCtx.beginPath();
        mapCtx.moveTo(px, py);
        mapCtx.lineTo(tx, ty);
        mapCtx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        mapCtx.lineWidth = 0.5;
        mapCtx.stroke();

        // Pulsing dot riding along vector line
        const progress = (time * 0.2 + idx * 0.1) % 1.0;
        const dx = tx - px;
        const dy = ty - py;
        const xdot = px + dx * progress;
        const ydot = py + dy * progress;

        mapCtx.beginPath();
        mapCtx.arc(xdot, ydot, 1.5, 0, Math.PI * 2);
        mapCtx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        mapCtx.fill();
      }
    });

    requestAnimationFrame(animateGlobalMap);
  }


  // ─── 6. Custom Stats Scroll Counter ──────────────────────────
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetText = el.getAttribute('data-target');
        const num = parseFloat(targetText.replace(/[^0-9.]/g, ''));
        const suffix = targetText.replace(/[0-9.]/g, '');
        
        animateStat(el, num, suffix);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.6 });

  statNumbers.forEach(el => statsObserver.observe(el));

  function animateStat(element, targetNum, suffix) {
    const duration = 1800; // ms
    const startTime = performance.now();
    const isFloat = targetNum % 1 !== 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = targetNum * ease;

      element.textContent = isFloat 
        ? `${current.toFixed(3)}${suffix}`
        : `${Math.round(current)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetNum + suffix;
      }
    }
    requestAnimationFrame(update);
  }


  // ─── 7. Interactive AI Chat Assistant ────────────────────────
  const chatInput = document.getElementById('chatInput');
  const chatHistory = document.getElementById('chatHistory');
  const submitChat = document.getElementById('submitChat');
  const waveBars = document.querySelectorAll('.waveform-bar');

  // Simulated AI response library
  const replies = [
    "NEURAL_LOG: Quantum core pathways optimized. Synaptic nodes aligned. Input identified.",
    "SYSTEM_PROMPT: Heuristics resolving... We are currently processing 1B+ parameter blocks locally. Safe channels established.",
    "WARNING: Matrix scanlines detect high visual processing thresholds. Switching thread load to core VRAM.",
    "CORE_METRIC: All system networks operational. No latency spikes detected across Tokyo, Singapore, or Frankfurt nodes.",
    "TERMINAL_REPLY: Initializing requested AI subroutines. Welcome to the classified NEXUS Superintelligence interface."
  ];

  function handleChatSubmit() {
    if (!chatInput || !chatHistory) return;
    const userText = chatInput.value.trim();
    if (!userText) return;

    // 1. Append User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = userText;
    chatHistory.appendChild(userBubble);
    chatInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // 2. Waveform speaks animation
    animateWaveform(true);

    // 3. Simulated Thinking and Bot Reply
    setTimeout(() => {
      const botBubble = document.createElement('div');
      botBubble.className = 'chat-bubble bot';
      botBubble.innerHTML = `> Processing synaptic vectors... <span class="blink">_</span>`;
      chatHistory.appendChild(botBubble);
      chatHistory.scrollTop = chatHistory.scrollHeight;

      setTimeout(() => {
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        botBubble.innerHTML = `> ${randomReply}`;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        animateWaveform(false);
      }, 1200);

    }, 600);
  }

  function animateWaveform(active) {
    waveBars.forEach(bar => {
      if (active) {
        bar.style.animationPlayState = 'running';
        bar.style.height = `${Math.random() * 20 + 8}px`;
      } else {
        bar.style.animationPlayState = 'paused';
        bar.style.height = '8px';
      }
    });
  }

  // Bind chatbot events
  if (submitChat) submitChat.addEventListener('click', handleChatSubmit);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleChatSubmit();
    });
  }


  // ─── 8. Reveal On Scroll Observer ────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

});
