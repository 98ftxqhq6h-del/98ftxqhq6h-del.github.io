/* ============================================================
   NEXUS AI — Business Logic & Three.js 3D WebGL / Speech Engines
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. Spotlight Mouse Follow Effect ──────────────────────
  const spotlight = document.getElementById('spotlight');
  if (spotlight) {
    window.addEventListener('mousemove', (e) => {
      spotlight.style.left = `${e.clientX}px`;
      spotlight.style.top = `${e.clientY}px`;
    }, { passive: true });
  }


  // ─── 2. Loading Screen & Boot Sequence ──────────────────────
  const bootScreen = document.getElementById('bootScreen');
  const bootLog = document.getElementById('bootLog');
  const progressFill = document.getElementById('progressFill');

  const bootSteps = [
    { text: "SYSTEM STATUS: BOOT_INITIALIZATION_STARTED", delay: 100 },
    { text: "> Allocating synaptic matrix blocks [VRAM: 96GB]... [OK]", delay: 200 },
    { text: "> Establishing connection to openbb MCP server... [CONNECTED]", delay: 400 },
    { text: "> Loading Heuristic Synaptic Models (Nexus-ASI-v9.2)... [100%]", delay: 600 },
    { text: "> Calibrating Quantum Entanglement Transceiver... [OK]", delay: 800 },
    { text: "> Initializing Three.js WebGL graphics core... [ACTIVE]", delay: 1000 },
    { text: "> Launching GSAP animation timeline modules... [OK]", delay: 1200 },
    { text: "> Authorizing access token... [CODE: 0x8F0FF2] [GRANTED]", delay: 1400 },
    { text: "> Synaptic connections mapped. Latency stable at 0.75ms", delay: 1600 },
    { text: "> ALL SYSTEMS ONLINE. ACTIVATING CLASSICAL INTERFACE...", delay: 1800 }
  ];

  function runBootSequence() {
    if (!bootLog || !progressFill || !bootScreen) return;

    let currentStep = 0;
    const totalDuration = 2200; // ms
    const intervalTime = totalDuration / bootSteps.length;

    const timer = setInterval(() => {
      if (currentStep < bootSteps.length) {
        const logLine = document.createElement('div');
        logLine.innerHTML = bootSteps[currentStep].text;
        bootLog.appendChild(logLine);
        bootLog.scrollTop = bootLog.scrollHeight;

        const percent = Math.min(((currentStep + 1) / bootSteps.length) * 100, 100);
        progressFill.style.width = `${percent}%`;

        currentStep++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          bootScreen.classList.add('loaded');
          // Launch all 3D renders and physics
          initHeroFace();
          init3DBrainCore();
          init3DGlobeNetwork();
          spawnMegacityVehicles();
          initGSAPAnimations();
        }, 300);
      }
    }, intervalTime);
  }

  runBootSequence();


  // ─── 3. Flying Vehicles Generator (Megacity Backdrop) ──────
  function spawnMegacityVehicles() {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;

    for (let i = 0; i < 8; i++) {
      const vehicle = document.createElement('div');
      vehicle.className = 'flying-vehicle';
      vehicle.style.setProperty('--y', `${Math.random() * 60 + 30}%`);
      vehicle.style.animationDelay = `${Math.random() * 15}s`;
      vehicle.style.animationDuration = `${Math.random() * 10 + 10}s`;
      
      // randomize vehicle glowing color
      const color = Math.random() > 0.5 ? 'var(--neon-pink)' : 'var(--neon-cyan)';
      vehicle.style.backgroundColor = color;
      vehicle.style.boxShadow = `0 0 8px ${color}`;

      container.appendChild(vehicle);
    }
  }


  // ─── 4. Responsive Navigation Toggle ───────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // Active Nav Link Highlight on Scroll
  const sections = document.querySelectorAll('section, header');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });

    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });


  // ─── 5. Canvas Hero Particle AI Face ────────────────────────
  let faceCanvas, faceCtx, faceParticles = [];
  
  function initHeroFace() {
    faceCanvas = document.getElementById('heroFaceCanvas');
    if (!faceCanvas) return;

    faceCtx = faceCanvas.getContext('2d');
    resizeFaceCanvas();
    window.addEventListener('resize', resizeFaceCanvas);

    const particleCount = 180;
    faceParticles = [];
    for (let i = 0; i < particleCount; i++) {
      faceParticles.push({
        x: Math.random() * faceCanvas.width,
        y: Math.random() * faceCanvas.height,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 110 + 20,
        speed: Math.random() * 0.015 + 0.005,
        size: Math.random() * 2 + 0.5,
        pulseOffset: Math.random() * 100,
        color: Math.random() > 0.4 ? '0, 240, 255' : '255, 0, 85'
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
    
    faceCtx.fillStyle = 'rgba(5, 7, 10, 0.2)';
    faceCtx.fillRect(0, 0, faceCanvas.width, faceCanvas.height);

    const centerX = faceCanvas.width / 2;
    const centerY = faceCanvas.height / 2;
    const time = Date.now() * 0.001;

    faceParticles.forEach((p, idx) => {
      p.angle += p.speed;
      
      const morphX = Math.sin(p.angle * 3 + time) * 15;
      const morphY = Math.cos(p.angle * 2 + time * 1.2) * 35;
      
      let finalRadiusX = p.radius + morphX;
      let finalRadiusY = p.radius * 1.35 + morphY;

      if (p.radius < 50) {
        finalRadiusX = (p.radius + Math.sin(time * 3 + idx) * 8) * 0.8;
        finalRadiusY = (p.radius + Math.cos(time * 2 + idx) * 8) * 0.8;
      }

      const tx = centerX + Math.cos(p.angle) * finalRadiusX;
      const ty = centerY + Math.sin(p.angle) * finalRadiusY;

      p.x += (tx - p.x) * 0.08;
      p.y += (ty - p.y) * 0.08;

      const sizePulse = p.size + Math.sin(time * 5 + p.pulseOffset) * 0.4;
      faceCtx.beginPath();
      faceCtx.arc(p.x, p.y, Math.max(0.2, sizePulse), 0, Math.PI * 2);
      faceCtx.fillStyle = `rgba(${p.color}, ${0.55 + Math.sin(time * 2 + p.pulseOffset) * 0.35})`;
      faceCtx.fill();

      // Connect vectors
      for (let j = idx + 1; j < faceParticles.length; j++) {
        const neighbor = faceParticles[j];
        const dx = p.x - neighbor.x;
        const dy = p.y - neighbor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 40) {
          faceCtx.beginPath();
          faceCtx.moveTo(p.x, p.y);
          faceCtx.lineTo(neighbor.x, neighbor.y);
          faceCtx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 40)})`;
          faceCtx.lineWidth = 0.5;
          faceCtx.stroke();
        }
      }
    });

    requestAnimationFrame(animateHeroFace);
  }


  // ─── 6. Real 3D Neural Brain Core (Three.js WebGL) ──────────
  function init3DBrainCore() {
    const container = document.getElementById('brainCanvas3D');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Neural brain particle vertices
    const particleCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const nodesArray = [];

    for (let i = 0; i < particleCount; i++) {
      // Shape points into a complex overlapping spherical layout (neural lobes)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const r = 85 + (Math.sin(theta * 4) * Math.cos(phi * 3) * 20); // shape morphing
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      nodesArray.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Glowing cyan particle material
    const material = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 3,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const brainParticles = new THREE.Points(geometry, material);
    scene.add(brainParticles);

    // Dynamic Connections line mesh
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xbd00ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    const lineGeom = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * particleCount * 2 * 3);
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMesh = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lineMesh);

    // Mouse Tracking to rotate brain slightly
    let mouse = { x: 0, y: 0 };
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
    });

    const logHud = document.getElementById('logHud');
    const nodesNames = [
      "SYNAPSE_CORE", "DECISION_TREE_A", "TENSOR_BUFFER_9", "NEURAL_LINK_7X",
      "QUANTUM_GATE_0", "HEURISTIC_STACK", "VECTOR_STORE_2", "OLLAMA_BRIDGE_V"
    ];

    function animate3DBrain() {
      requestAnimationFrame(animate3DBrain);

      // Rotate particle network
      brainParticles.rotation.y += 0.002;
      brainParticles.rotation.x += 0.001;
      lineMesh.rotation.y = brainParticles.rotation.y;
      lineMesh.rotation.x = brainParticles.rotation.x;

      // Mouse interactive tilt
      scene.rotation.y += (mouse.x * 0.2 - scene.rotation.y) * 0.05;
      scene.rotation.x += (-mouse.y * 0.2 - scene.rotation.x) * 0.05;

      const posAttr = geometry.attributes.position;
      let lineIndex = 0;

      // Update particle offsets
      for (let i = 0; i < particleCount; i++) {
        const n = nodesArray[i];
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        // Keep inside bounds
        const d = Math.sqrt(n.x*n.x + n.y*n.y + n.z*n.z);
        if (d > 95) {
          n.vx *= -1; n.vy *= -1; n.vz *= -1;
        }

        posAttr.setXYZ(i, n.x, n.y, n.z);

        // Find connections to draw lines
        for (let j = i + 1; j < particleCount; j++) {
          const other = nodesArray[j];
          const dx = n.x - other.x;
          const dy = n.y - other.y;
          const dz = n.z - other.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

          if (dist < 40 && lineIndex < particleCount * 20) {
            linePositions[lineIndex * 6] = n.x;
            linePositions[lineIndex * 6 + 1] = n.y;
            linePositions[lineIndex * 6 + 2] = n.z;
            linePositions[lineIndex * 6 + 3] = other.x;
            linePositions[lineIndex * 6 + 4] = other.y;
            linePositions[lineIndex * 6 + 5] = other.z;
            lineIndex++;
          }
        }
      }

      posAttr.needsUpdate = true;
      lineGeom.attributes.position.needsUpdate = true;
      lineGeom.setDrawRange(0, lineIndex * 2);

      // Periodically update brain telemetry log
      if (logHud && Math.random() > 0.98) {
        const id = `0x${Math.floor(Math.random()*9999).toString(16).toUpperCase()}`;
        const name = nodesNames[Math.floor(Math.random() * nodesNames.length)];
        const latency = (Math.random()*1.2 + 0.1).toFixed(2);
        logHud.innerHTML = `
          <span>VAULT NODE: ${name}_${id}</span>
          <span>LATENCY: ${latency}ms</span>
          <span style="color:var(--neon-green);">DYNAMIC VECTOR SYNC SUCCESSFUL</span>
        `;
      }

      renderer.render(scene, camera);
    }

    animate3DBrain();

    // Resize Handler
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }


  // ─── 7. Rotating 3D WebGL Earth Globe (Global Network) ─────────
  function init3DGlobeNetwork() {
    const container = document.getElementById('mapCanvas3D');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Globe Particle Sphere Geometry
    const pointsCount = 450;
    const globeGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsCount * 3);

    for (let i = 0; i < pointsCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2 * Math.PI;
      const phi = Math.acos(2 * v - 1);
      
      const radius = 70; // Globe shell size
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    globeGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x39ff14, // neon green particles
      size: 2.2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const globe = new THREE.Points(globeGeom, material);
    scene.add(globe);

    // Vector connections between cities
    const arcsMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15
    });

    const arcGeom = new THREE.BufferGeometry();
    const arcPositions = new Float32Array(120 * 6);
    let arcIdx = 0;

    // Pick random points on globe to simulate interlinked city server channels
    const posAttr = globeGeom.attributes.position;
    for (let i = 0; i < 20; i++) {
      const p1 = Math.floor(Math.random() * pointsCount);
      const p2 = Math.floor(Math.random() * pointsCount);

      const x1 = posAttr.getX(p1), y1 = posAttr.getY(p1), z1 = posAttr.getZ(p1);
      const x2 = posAttr.getX(p2), y2 = posAttr.getY(p2), z2 = posAttr.getZ(p2);

      arcPositions[arcIdx * 6] = x1;
      arcPositions[arcIdx * 6 + 1] = y1;
      arcPositions[arcIdx * 6 + 2] = z1;
      arcPositions[arcIdx * 6 + 3] = x2;
      arcPositions[arcIdx * 6 + 4] = y2;
      arcPositions[arcIdx * 6 + 5] = z2;
      arcIdx++;
    }

    arcGeom.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    const lines = new THREE.LineSegments(arcGeom, arcsMat);
    scene.add(lines);

    function animateGlobe() {
      requestAnimationFrame(animateGlobe);
      globe.rotation.y += 0.003;
      lines.rotation.y = globe.rotation.y;
      renderer.render(scene, camera);
    }

    animateGlobe();

    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }


  // ─── 8. Custom GSAP Interactive Timelines & Magnetic Hover ────
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // GSAP ScrollTrigger reveals
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%'
          }
        });
      });
    }

    // Magnetic Button pull logic
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        // GSAP animate button slightly toward the mouse
        gsap.to(btn, {
          x: mouseX * 0.35,
          y: mouseY * 0.35,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }


  // ─── 9. Stats Counter ───────────────────────────────────────
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


  // ─── 10. AI Chatbot with Web Speech API Voice ──────────────────
  const chatInput = document.getElementById('chatInput');
  const chatHistory = document.getElementById('chatHistory');
  const submitChat = document.getElementById('submitChat');
  const voiceToggle = document.getElementById('voiceToggle');
  const waveBars = document.querySelectorAll('.waveform-bar');

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

    // 2. Waveform active
    animateWaveform(true);

    // 3. Bot reply step
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
        
        // Speak response out loud using Web Speech Synthesis
        speakText(randomReply);
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

  // Speak Synthesis
  function speakText(text) {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel(); // cancel current speech
      const cleanText = text.replace(/[^A-Za-z0-9_.\s]/g, ''); // strip out tags
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 0.85; // robotic voice
      
      utterance.onend = () => {
        animateWaveform(false);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => animateWaveform(false), 2000);
    }
  }

  // Voice Speech Recognition (Mic Toggle)
  let recognition;
  if (typeof webkitSpeechRecognition !== 'undefined') {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      voiceToggle.classList.add('active');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (chatInput) {
        chatInput.value = transcript;
        handleChatSubmit();
      }
    };

    recognition.onerror = () => {
      voiceToggle.classList.remove('active');
    };

    recognition.onend = () => {
      voiceToggle.classList.remove('active');
    };
  }

  if (voiceToggle) {
    voiceToggle.addEventListener('click', () => {
      if (!recognition) {
        alert("Web Speech recognition not supported in this browser. Try Chrome or Safari.");
        return;
      }
      try {
        recognition.start();
      } catch (e) {
        recognition.stop();
      }
    });
  }

  // Chat submit bindings
  if (submitChat) submitChat.addEventListener('click', handleChatSubmit);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleChatSubmit();
    });
  }

});
