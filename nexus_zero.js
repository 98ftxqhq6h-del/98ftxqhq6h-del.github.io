document.addEventListener('DOMContentLoaded', () => {

  // ─── STAGE CONFIGURATIONS ──────────────────────────────────
  let scene, camera, renderer;
  let yawObject, pitchObject;
  let isLocked = false;
  let isHackingMode = false;
  let timeScale = 1.0; // Dynamic speed modifier (slow-motion during hack)

  // Player Stats
  let health = 100;
  let ammo = 30;
  let isReloading = false;
  let battery = 100; // Cyberdeck cells capacity
  let score = 0;

  // Movement Physics
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let canJump = true;

  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  let prevTime = performance.now();

  const PI_2 = Math.PI / 2;

  // Game Entities & Systems
  const obstacles = [];
  const networkNodes = [];
  const hostiles = [];
  const activeLasers = [];
  const activeParticles = [];
  let pingRings = [];

  // Hijack Camera Variables
  let isHijacked = false;
  let originalCameraPos = new THREE.Vector3();
  let hijackedCameraNode = null;

  // Web Audio Synth Variables
  let audioCtx = null;
  let synthInterval = null;

  // HTML Reference Nodes
  const gameContainer = document.getElementById('gameContainer');
  const blocker = document.getElementById('blocker');
  const playBtn = document.getElementById('playBtn');
  const logConsole = document.getElementById('logConsole');
  const cyberdeckOverlay = document.getElementById('cyberdeckOverlay');
  const hackMenu = document.getElementById('hackMenu');
  const batteryIndicator = document.getElementById('batteryIndicator');
  const healthBar = document.getElementById('healthBar');
  const ammoGrid = document.getElementById('ammoGrid');

  // Initialize Ammo Grid Cells
  function updateAmmoUI() {
    ammoGrid.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const cell = document.createElement('div');
      cell.classList.add('ammo-cell');
      if (i >= ammo) {
        cell.classList.add('empty');
      }
      ammoGrid.appendChild(cell);
    }
    document.getElementById('ammoVal').textContent = ammo;
  }
  updateAmmoUI();

  function logMessage(text, color = '#fff') {
    const div = document.createElement('div');
    div.textContent = `> ${text}`;
    div.style.color = color;
    logConsole.appendChild(div);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  // ─── SYSTEM INITIALIZATION ──────────────────────────────────
  function init() {
    // 1. Core Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.025);

    // 2. Camera Rigging (Manually tracking yaw/pitch)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    pitchObject = new THREE.Group();
    pitchObject.add(camera);

    yawObject = new THREE.Group();
    yawObject.position.set(0, 1.8, 0); // Eye-level height
    yawObject.add(pitchObject);
    scene.add(yawObject);

    // 3. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0a1424);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Dynamic red neon utility light
    const redLight = new THREE.PointLight(0xff3b30, 2.5, 30);
    redLight.position.set(0, 8, 0);
    scene.add(redLight);

    // 4. Floor Grid
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(200, 50, 0x00f0ff, 0x0c1424);
    grid.position.y = 0.01;
    scene.add(grid);

    // 5. Build Environment Obstacles (Cyberpunk Servers & Terminals)
    buildFacility();

    // 6. Spawn Interactive Net Nodes
    spawnNetworkNodes();

    // 7. Spawn patrolled corporate soldier bots
    spawnGuardBots();

    // 8. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameContainer.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ─── PROCEDURAL SCENERY BUILDER ────────────────────────────
  function buildFacility() {
    // Helper to spawn modular glowing server arrays
    function spawnServerCluster(x, z, rotY) {
      const group = new THREE.Group();
      
      const serverGeo = new THREE.BoxGeometry(4, 9, 3);
      const serverMat = new THREE.MeshStandardMaterial({
        color: 0x0b0e14,
        roughness: 0.5,
        metalness: 0.6
      });
      const rack = new THREE.Mesh(serverGeo, serverMat);
      rack.castShadow = true;
      rack.receiveShadow = true;
      group.add(rack);

      // Neon LED indicators
      const ledGeo = new THREE.BoxGeometry(4.05, 0.15, 3.05);
      const ledMatCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const ledMatRed = new THREE.MeshBasicMaterial({ color: 0xff3b30 });

      for (let y = -3.5; y < 4; y += 1.5) {
        const led = new THREE.Mesh(ledGeo, Math.random() > 0.4 ? ledMatCyan : ledMatRed);
        led.position.y = y;
        group.add(led);
      }

      // Tech outer border wireframe
      const wireGeo = new THREE.BoxGeometry(4.02, 9.02, 3.02);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.1 });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      group.add(wire);

      group.position.set(x, 4.5, z);
      group.rotation.y = rotY;
      scene.add(group);

      obstacles.push(new THREE.Box3().setFromObject(rack));
    }

    // Place server cluster blocks around the core
    spawnServerCluster(-15, -15, 0);
    spawnServerCluster(15, -25, Math.PI / 4);
    spawnServerCluster(-25, 20, Math.PI / 2);
    spawnServerCluster(20, 20, -Math.PI / 6);
    spawnServerCluster(-35, -5, Math.PI / 3);
    spawnServerCluster(35, -10, -Math.PI / 4);

    // Inner security columns
    const colGeo = new THREE.BoxGeometry(2, 12, 2);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.7 });
    
    function spawnColumn(x, z) {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(x, 6, z);
      col.castShadow = true;
      col.receiveShadow = true;
      scene.add(col);

      // Core glow collar
      const collarGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 8);
      const collarMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.position.set(x, 8, z);
      scene.add(collar);

      obstacles.push(new THREE.Box3().setFromObject(col));
    }

    spawnColumn(0, -35);
    spawnColumn(-40, 40);
    spawnColumn(40, 40);

    // Outer boundary walls (Box bounds)
    const wallGeo = new THREE.BoxGeometry(202, 30, 2);
    const topW = new THREE.Mesh(wallGeo); topW.position.set(0, 15, -100); scene.add(topW); obstacles.push(new THREE.Box3().setFromObject(topW));
    const botW = new THREE.Mesh(wallGeo); botW.position.set(0, 15, 100); scene.add(botW); obstacles.push(new THREE.Box3().setFromObject(botW));

    const sideGeo = new THREE.BoxGeometry(2, 30, 202);
    const leftW = new THREE.Mesh(sideGeo); leftW.position.set(-100, 15, 0); scene.add(leftW); obstacles.push(new THREE.Box3().setFromObject(leftW));
    const rightW = new THREE.Mesh(sideGeo); rightW.position.set(100, 15, 0); scene.add(rightW); obstacles.push(new THREE.Box3().setFromObject(rightW));
  }

  // ─── NETWORKS QUANTUM NODES ───────────────────────────────
  function spawnNetworkNodes() {
    const nodePlacements = [
      { x: -15, z: -15, label: "Geothermal Core [A]" },
      { x: 15, z: -25, label: "Mainframe Terminal [B]" },
      { x: -25, z: 20, label: "Cyberdeck Linker [C]" },
      { x: 20, z: 20, label: "Satellite Relay [D]" }
    ];

    nodePlacements.forEach((data, index) => {
      const nodeGroup = new THREE.Group();
      
      // Floating glowing sphere representing the data node
      const sphereGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x39ff14,
        wireframe: true
      });
      const core = new THREE.Mesh(sphereGeo, sphereMat);
      nodeGroup.add(core);

      // Neon bracket frame surrounding it
      const frameGeo = new THREE.BoxGeometry(2.0, 2.0, 2.0);
      const frameMat = new THREE.MeshBasicMaterial({
        color: 0x39ff14,
        transparent: true,
        opacity: 0.15,
        wireframe: true
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      nodeGroup.add(frame);

      // Light glow emitter
      const light = new THREE.PointLight(0x39ff14, 1.5, 8);
      nodeGroup.add(light);

      nodeGroup.position.set(data.x, 8.0, data.z); // Positioned high above clusters
      scene.add(nodeGroup);

      // Custom parameters
      nodeGroup.label = data.label;
      nodeGroup.baseY = 8.0;
      nodeGroup.offset = Math.random() * 100;
      nodeGroup.isNode = true;
      nodeGroup.index = index;

      networkNodes.push(nodeGroup);
    });
  }

  // ─── PATROL SECURITY SOLDIER BOTS ──────────────────────────
  function spawnGuardBots() {
    for (let i = 0; i < 3; i++) {
      const botGroup = new THREE.Group();
      
      const armorMat = new THREE.MeshStandardMaterial({
        color: 0xff3b30,
        emissive: 0x440805,
        roughness: 0.3,
        metalness: 0.6
      });
      const chassisMat = new THREE.MeshStandardMaterial({ color: 0x0d1117 });
      
      // Torso
      const bodyGeo = new THREE.BoxGeometry(0.9, 1.3, 0.5);
      const body = new THREE.Mesh(bodyGeo, armorMat);
      body.position.y = 1.45;
      body.castShadow = true;
      body.receiveShadow = true;
      botGroup.add(body);

      // Helmet head
      const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const head = new THREE.Mesh(headGeo, armorMat);
      head.position.set(0, 2.3, 0);
      head.castShadow = true;
      botGroup.add(head);

      // Visor panel
      const visorGeo = new THREE.BoxGeometry(0.48, 0.12, 0.38);
      const visorMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 2.3, 0.22);
      botGroup.add(visor);

      // Left leg
      const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.28);
      const leftLeg = new THREE.Mesh(legGeo, chassisMat);
      leftLeg.position.set(-0.25, 0.45, 0);
      leftLeg.castShadow = true;
      botGroup.add(leftLeg);

      // Right leg
      const rightLeg = new THREE.Mesh(legGeo, chassisMat);
      rightLeg.position.set(0.25, 0.45, 0);
      rightLeg.castShadow = true;
      botGroup.add(rightLeg);

      // Left Arm
      const armGeo = new THREE.BoxGeometry(0.22, 1.0, 0.22);
      const leftArm = new THREE.Mesh(armGeo, armorMat);
      leftArm.position.set(-0.6, 1.35, 0);
      leftArm.castShadow = true;
      botGroup.add(leftArm);

      // Right Arm
      const rightArm = new THREE.Mesh(armGeo, armorMat);
      rightArm.position.set(0.6, 1.35, 0);
      rightArm.castShadow = true;
      botGroup.add(rightArm);

      botGroup.leftLeg = leftLeg;
      botGroup.rightLeg = rightLeg;
      botGroup.leftArm = leftArm;
      botGroup.rightArm = rightArm;
      botGroup.visor = visor;

      // Assign position
      resetBotPosition(botGroup);

      // Stats configuration
      botGroup.hp = 40;
      botGroup.maxHp = 40;
      botGroup.moveAngle = Math.random() * Math.PI * 2;
      botGroup.speed = Math.random() * 4 + 5; // Patrolling walk speed
      botGroup.animTime = Math.random() * 100;

      scene.add(botGroup);
      hostiles.push(botGroup);
    }
  }

  function resetBotPosition(bot) {
    bot.position.set(
      (Math.random() - 0.5) * 140,
      0,
      (Math.random() - 0.5) * 140
    );
    bot.hp = bot.maxHp;
    
    // Safety check: avoid spawning inside columns/racks
    const botBox = new THREE.Box3().setFromObject(bot);
    let collides = true;
    while (collides) {
      collides = false;
      obstacles.forEach(obs => {
        if (botBox.intersectsBox(obs)) {
          bot.position.set((Math.random() - 0.5) * 140, 0, (Math.random() - 0.5) * 140);
          botBox.setFromObject(bot);
          collides = true;
        }
      });
    }
  }

  // ─── AUDIO ENGINE SYNTHESIS ───────────────────────────────
  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Start background synth pulse loop
    synthInterval = setInterval(playBackgroundDrone, 1600);
  }

  function playBackgroundDrone() {
    if (!audioCtx || audioCtx.state === 'suspended') return;

    // Generate heavy low frequency grid hum
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, audioCtx.currentTime); // A1 note
    osc.frequency.exponentialRampToValueAtTime(27.5, audioCtx.currentTime + 1.5); // slide down

    // lowpass filter to make it warm and moody
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  }

  function playShootSound() {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.18);
  }

  function playHitSound() {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  }

  function playDeathSound() {
    if (!audioCtx) return;

    // Noise buffer generation for explosion
    const bufferSize = audioCtx.sampleRate * 0.4; // 0.4 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.4);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
    noise.stop(audioCtx.currentTime + 0.4);
  }

  function playHackingModeSound(isOpen) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    if (isOpen) {
      osc.frequency.setValueAtTime(330, audioCtx.currentTime);
      osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.08);
    } else {
      osc.frequency.setValueAtTime(660, audioCtx.currentTime);
      osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.08);
    }

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }

  // ─── POINTERLOCK MOUSE MOVEMENT HOOKS ──────────────────────
  playBtn.addEventListener('click', () => {
    initAudio();
    gameContainer.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === gameContainer) {
      isLocked = true;
      blocker.style.opacity = '0';
      setTimeout(() => { blocker.style.display = 'none'; }, 500);
      initAudio();
    } else {
      isLocked = false;
      blocker.style.display = 'flex';
      setTimeout(() => { blocker.style.opacity = '1'; }, 10);
      exitHackingMode();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isLocked || isHijacked) return; // Freeze look during hijack

    const mx = e.movementX || 0;
    const my = e.movementY || 0;

    yawObject.rotation.y -= mx * 0.0022;
    pitchObject.rotation.x -= my * 0.0022;

    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  });

  // ─── KEYBOARD BINDINGS ─────────────────────────────────────
  const onKeyDown = (e) => {
    switch (e.code) {
      case 'KeyW': moveForward = true; break;
      case 'KeyA': moveLeft = true; break;
      case 'KeyS': moveBackward = true; break;
      case 'KeyD': moveRight = true; break;
      case 'Space':
        if (canJump && !isHackingMode) {
          velocity.y += 180; // Jump force
          canJump = false;
        }
        break;
      case 'KeyQ':
      case 'Tab':
        e.preventDefault();
        if (isLocked) {
          toggleHackingMode();
        }
        break;
      case 'KeyR':
        performReload();
        break;
    }
  };

  const onKeyUp = (e) => {
    switch (e.code) {
      case 'KeyW': moveForward = false; break;
      case 'KeyA': moveLeft = false; break;
      case 'KeyS': moveBackward = false; break;
      case 'KeyD': moveRight = false; break;
    }
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // ─── COMBAT RAILGUN DISCHARGE ──────────────────────────────
  document.addEventListener('mousedown', (e) => {
    if (!isLocked) return;
    if (isHackingMode) {
      handleHackingRaycast(e);
    } else if (e.button === 0) {
      fireRailgun();
    }
  });

  function fireRailgun() {
    if (isReloading || isHijacked) return;
    if (ammo <= 0) {
      logMessage("OUT OF AMMO CELLS. PRESS [R] TO RELOAD", "#ff3b30");
      return;
    }

    ammo--;
    updateAmmoUI();
    playShootSound();

    // Spawn camera muzzle shaking recoil
    pitchObject.rotation.x += 0.015;

    const raycaster = new THREE.Raycaster();
    const center = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(center, camera);

    const from = new THREE.Vector3();
    camera.getWorldPosition(from);

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const to = new THREE.Vector3().copy(from).addScaledVector(dir, 100);

    const intersects = raycaster.intersectObjects(hostiles, true);
    if (intersects.length > 0) {
      const hit = intersects[0];
      to.copy(hit.point);

      // Find core bot group
      let bot = hit.object;
      while (bot.parent && !hostiles.includes(bot)) {
        bot = bot.parent;
      }

      bot.hp -= 20;
      playHitSound();
      spawnHitExplosion(hit.point, 0xff3b30);

      logMessage(`COGNITIVE DAMAGE APPLIED: -20 HP to security unit`, "#ff3b30");

      if (bot.hp <= 0) {
        score += 100;
        logMessage(`SECURITY PROTOCOL DE-COMPILED // REWARD +100 E$`, "#39ff14");
        playDeathSound();
        resetBotPosition(bot);
      }
    }

    drawRailgunTracer(from, to);
  }

  function drawRailgunTracer(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.9
    });
    const line = new THREE.Line(geo, mat);
    scene.add(line);

    activeLasers.push({
      mesh: line,
      spawnTime: performance.now(),
      lifetime: 90
    });
  }

  function spawnHitExplosion(point, colorHex) {
    const pGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const pMat = new THREE.MeshBasicMaterial({ color: colorHex });

    for (let i = 0; i < 10; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.copy(point);
      p.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        Math.random() * 4 + 2,
        (Math.random() - 0.5) * 5
      );
      scene.add(p);

      activeParticles.push({
        mesh: p,
        spawnTime: performance.now(),
        lifetime: 350
      });
    }
  }

  function performReload() {
    if (isReloading || ammo === 30) return;
    isReloading = true;
    logMessage("RE-SHUFFLING NEURAL ENERGY CELLS...");

    setTimeout(() => {
      ammo = 30;
      updateAmmoUI();
      isReloading = false;
      logMessage("RAILGUN CELLS FULLY CHARGED", "#00f0ff");
    }, 1500);
  }

  // ─── CYBERDECK HACKING CONTROLLER ──────────────────────────
  let selectedNode = null;

  function toggleHackingMode() {
    if (isHackingMode) {
      exitHackingMode();
    } else {
      enterHackingMode();
    }
  }

  function enterHackingMode() {
    isHackingMode = true;
    timeScale = 0.2; // Slow time scale to 20%
    cyberdeckOverlay.style.display = 'block';
    hackMenu.style.display = 'none'; // Hidden until a node is clicked
    playHackingModeSound(true);
    logMessage("CYBERDECK SHIFT: TIME DILATION MODULE ACTIVE", "#39ff14");
  }

  function exitHackingMode() {
    isHackingMode = false;
    timeScale = 1.0; // Restore standard time
    cyberdeckOverlay.style.display = 'none';
    selectedNode = null;
    playHackingModeSound(false);
  }

  function handleHackingRaycast(e) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);

    // Target network nodes
    const intersects = raycaster.intersectObjects(networkNodes, true);
    if (intersects.length > 0) {
      // Find node group
      let node = intersects[0].object;
      while (node.parent && !networkNodes.includes(node)) {
        node = node.parent;
      }

      selectedNode = node;
      logMessage(`SELECTED TARGET NODE: [${node.label}]`, "#39ff14");

      // Position the popup menu near the click location
      hackMenu.style.display = 'flex';
    } else {
      hackMenu.style.display = 'none';
    }
  }

  // Cyberdeck Button Subroutine Handlers
  document.getElementById('btnPing').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!selectedNode) return;
    if (battery < 15) {
      logMessage("INSUFFICIENT DECK BATTERY CELLS", "#ff3b30");
      return;
    }
    
    battery -= 15;
    updateBatteryUI();
    executePingSubroutine(selectedNode);
    hackMenu.style.display = 'none';
  });

  document.getElementById('btnOverload').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!selectedNode) return;
    if (battery < 40) {
      logMessage("INSUFFICIENT DECK BATTERY CELLS", "#ff3b30");
      return;
    }

    battery -= 40;
    updateBatteryUI();
    executeOverloadSubroutine(selectedNode);
    hackMenu.style.display = 'none';
  });

  document.getElementById('btnHijack').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!selectedNode) return;
    if (battery < 50) {
      logMessage("INSUFFICIENT DECK BATTERY CELLS", "#ff3b30");
      return;
    }

    battery -= 50;
    updateBatteryUI();
    executeHijackSubroutine(selectedNode);
    hackMenu.style.display = 'none';
  });

  document.getElementById('btnCancel').addEventListener('click', (e) => {
    e.stopPropagation();
    exitHackingMode();
  });

  function updateBatteryUI() {
    batteryIndicator.style.width = battery + '%';
    document.getElementById('battVal').textContent = Math.round(battery) + '%';
  }

  // 1. PING SUBROUTINE
  function executePingSubroutine(node) {
    logMessage(`EXECUTING PING ON Node [${node.index}]...`, "#39ff14");
    
    // Spawn expanding vector wireframe ring in 3D scene
    const ringGeo = new THREE.RingGeometry(0.1, 1.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(node.position);
    scene.add(ring);

    pingRings.push({
      mesh: ring,
      scale: 1.0,
      spawnTime: performance.now()
    });

    // Temporarily highlight all hostiles (golden visors)
    hostiles.forEach(bot => {
      bot.visor.material.color.setHex(0x39ff14);
      bot.speed *= 0.5; // Stun their motors slightly
    });

    setTimeout(() => {
      hostiles.forEach(bot => {
        bot.visor.material.color.setHex(0xffcc00);
        bot.speed *= 2;
      });
    }, 4000);

    exitHackingMode();
  }

  // 2. OVERLOAD SUBROUTINE
  function executeOverloadSubroutine(node) {
    logMessage(`DISCHARGING CAPACITOR OVERLOAD ON Node [${node.index}]!`, "#ffcc00");

    // Spawn localized blast sphere
    const blastGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const blastMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.6
    });
    const blast = new THREE.Mesh(blastGeo, blastMat);
    blast.position.copy(node.position);
    scene.add(blast);

    // Blast animations
    const animBlast = {
      mesh: blast,
      scale: 1.0,
      lifetime: 500,
      spawnTime: performance.now()
    };
    activeLasers.push({
      mesh: blast,
      spawnTime: performance.now(),
      lifetime: 500,
      customTick: (age) => {
        const factor = age / 500;
        blast.scale.setScalar(1.0 + factor * 14.0); // Expand wide
        blastMat.opacity = 0.6 * (1.0 - factor);
      }
    });

    playDeathSound(); // Explode sound
    spawnHitExplosion(node.position, 0xffaa00);

    // Damage all nearby hostiles within 18 units radius
    hostiles.forEach(bot => {
      const d = bot.position.distanceTo(node.position);
      if (d < 18.0) {
        bot.hp -= 35;
        logMessage(`OVERLOAD BLAST HIT GUARD: -35 HP`, "#ff3b30");
        if (bot.hp <= 0) {
          score += 100;
          playDeathSound();
          resetBotPosition(bot);
        }
      }
    });

    exitHackingMode();
  }

  // 3. HIJACK SUBROUTINE (Taking over high-level node camera views)
  function executeHijackSubroutine(node) {
    if (isHijacked) {
      // Return to body
      isHijacked = false;
      yawObject.add(pitchObject); // Re-nest pitch camera back to player
      pitchObject.position.set(0, 0, 0);
      pitchObject.rotation.set(0, 0, 0);
      logMessage("DISCONNECTING CAM LINK // RETURNING TO RETINAL FEED");
    } else {
      isHijacked = true;
      hijackedCameraNode = node;
      
      // Detach camera from player rig
      scene.add(pitchObject);
      pitchObject.position.copy(node.position).add(new THREE.Vector3(0, -0.5, 0.2));
      pitchObject.lookAt(new THREE.Vector3(0, 0, 0)); // look at center map

      logMessage(`HIJACKED FEED SYSTEM: Node [${node.label}] CONNECTED`, "#39ff14");
    }
    exitHackingMode();
  }

  // ─── PLAYER VITALS HANDLING ──────────────────────────────
  function damagePlayer(val) {
    if (health <= 0) return;
    health = Math.max(0, health - val);
    healthBar.style.width = health + '%';
    document.getElementById('healthVal').textContent = health + ' HP';
    
    // Play structural damage grunt sound
    playHitSound();

    if (health <= 0) {
      triggerGameOver();
    }
  }

  function triggerGameOver() {
    document.exitPointerLock();
    const inst = document.getElementById('instructions');
    inst.innerHTML = `
      <h1 class="logo-title mono" style="color:var(--neon-red); text-shadow:0 0 10px var(--neon-red);">PROTOCOL FAILURE</h1>
      <p class="guide-text mono" style="margin-top:10px;">YOUR NEURAL NET WAS OVERWRITTEN BY CORPORATE PROTOCOLS</p>
      <div class="mono" style="margin:20px 0; color:var(--neon-yellow);">SCORE LOGGED: ${score} E$</div>
      <button class="btn-primary mono" id="restartBtn">RE-BOOT_PROTOCOL</button>
      <a href="index.html" class="back-link mono">← ABORT_MISSION_EXIT</a>
     Pacifying local cells...`;

    document.getElementById('restartBtn').addEventListener('click', () => {
      location.reload();
    });
  }

  // ─── TICK & ANIMATION CYCLE ────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    let delta = (time - prevTime) / 1000;
    
    // Apply Hacking state slow-motion
    delta *= timeScale;

    if (isLocked) {
      // 1. Recover Deck battery slowly
      if (battery < 100) {
        battery = Math.min(100, battery + delta * 3.5);
        updateBatteryUI();
      }

      // 2. Render Node hover floating oscillations
      networkNodes.forEach(node => {
        node.position.y = node.baseY + Math.sin((time * 0.002) + node.offset) * 0.4;
        node.rotation.y += 0.02 * timeScale;
      });

      // 3. Move Guard Patrol units
      hostiles.forEach(bot => {
        const dx = Math.cos(bot.moveAngle) * bot.speed * delta;
        const dz = Math.sin(bot.moveAngle) * bot.speed * delta;

        const prevPos = bot.position.clone();
        bot.position.x += dx;
        bot.position.z += dz;

        // Check layout boundary collisions
        let hitBarrier = false;
        const botBox = new THREE.Box3().setFromObject(bot);

        if (Math.abs(bot.position.x) > 95 || Math.abs(bot.position.z) > 95) {
          hitBarrier = true;
        }
        obstacles.forEach(obs => {
          if (botBox.intersectsBox(obs)) {
            hitBarrier = true;
          }
        });

        if (hitBarrier) {
          bot.position.copy(prevPos);
          bot.moveAngle = Math.random() * Math.PI * 2;
        }

        // Align facing angle
        bot.rotation.y = Math.atan2(dx, dz);

        // Sway limbs in walking cycle
        bot.animTime += delta * bot.speed * 2.5;
        const swing = Math.sin(bot.animTime) * 0.6;
        if (bot.leftLeg) bot.leftLeg.rotation.x = swing;
        if (bot.rightLeg) bot.rightLeg.rotation.x = -swing;
        if (bot.leftArm) bot.leftArm.rotation.x = -swing * 0.8;
        if (bot.rightArm) bot.rightArm.rotation.x = swing * 0.8;

        // Verify distance to Player body
        if (!isHijacked) {
          const dist = bot.position.distanceTo(yawObject.position);
          if (dist < 3.0) {
            damagePlayer(15);
            // Push bot back slightly
            bot.moveAngle = Math.random() * Math.PI * 2;
            bot.position.x -= Math.cos(bot.moveAngle) * 5;
            bot.position.z -= Math.sin(bot.moveAngle) * 5;
            logMessage(`ALERT: SECURITY CONTACT DAMAGE -15 HP`, "#ff3b30");
          }
        }
      });

      // 4. Update Ping scan rings
      for (let i = pingRings.length - 1; i >= 0; i--) {
        const ring = pingRings[i];
        ring.scale += delta * 45; // Expand fast
        ring.mesh.scale.set(ring.scale, ring.scale, 1.0);
        ring.mesh.material.opacity = Math.max(0, 1.0 - (ring.scale / 60));

        if (ring.scale > 60) {
          scene.remove(ring.mesh);
          ring.mesh.geometry.dispose();
          ring.mesh.material.dispose();
          pingRings.splice(i, 1);
        }
      }

      // 5. Player translation physics (Frozen during Camera Hijack)
      if (!isHijacked) {
        // Friction dampening
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 60.0 * delta; // Gravity scale

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        // Apply physical boundaries check before shifting player coordinates
        const currentPos = yawObject.position.clone();
        
        const nextXOffset = -velocity.x * delta;
        const nextZOffset = -velocity.z * delta;

        const nextPosX = currentPos.clone().setX(currentPos.x + nextXOffset);
        
        // Custom box check
        function checkCollision(pos) {
          const pBox = new THREE.Box3(
            new THREE.Vector3(pos.x - 1.2, pos.y - 1.7, pos.z - 1.2),
            new THREE.Vector3(pos.x + 1.2, pos.y + 0.4, pos.z + 1.2)
          );
          let collided = false;
          obstacles.forEach(obs => {
            if (pBox.intersectsBox(obs)) collided = true;
          });
          return collided;
        }

        if (!checkCollision(nextPosX)) {
          yawObject.position.x += nextXOffset;
        } else {
          velocity.x = 0;
        }

        const nextPosZ = currentPos.clone().setZ(currentPos.z + nextZOffset);
        if (!checkCollision(nextPosZ)) {
          yawObject.position.z += nextZOffset;
        } else {
          velocity.z = 0;
        }

        // Jump physics & floor rest
        yawObject.position.y += velocity.y * delta;
        if (yawObject.position.y < 1.8) {
          velocity.y = 0;
          yawObject.position.y = 1.8;
          canJump = true;
        }
      }
    }

    // 6. Clean lasers & debris updates
    for (let i = activeLasers.length - 1; i >= 0; i--) {
      const laser = activeLasers[i];
      const age = time - laser.spawnTime;
      if (laser.customTick) {
        laser.customTick(age);
      }
      if (age > laser.lifetime) {
        scene.remove(laser.mesh);
        laser.mesh.geometry.dispose();
        laser.mesh.material.dispose();
        activeLasers.splice(i, 1);
      }
    }

    for (let i = activeParticles.length - 1; i >= 0; i--) {
      const p = activeParticles[i];
      const age = time - p.spawnTime;
      if (age > p.lifetime) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        activeParticles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.velocity, 0.016);
        p.velocity.y -= 9.8 * 0.016; // gravity
        p.mesh.scale.multiplyScalar(0.96);
      }
    }

    prevTime = time;
    renderer.render(scene, camera);
  }

  // ─── LAUNCH GAME ───
  init();
  animate();

});
