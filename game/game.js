/* ============================================================
   NEXUS SHADOW — 3D tactical battleground engine (Three.js)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── WEB AUDIO SOUND EFFECTS SYNTHESIZER ──────────────────
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playShootSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }

  function playHitSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc.frequency.setValueAtTime(120, audioCtx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function playReloadSound() {
    if (!audioCtx) return;
    // Step 1: sliding sound
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc1.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.2);
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.2);

    // Step 2: click sound
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(900, audioCtx.currentTime);
      gain2.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.05);
    }, 250);
  }

  function playDeathSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.45, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  }

  function playPlayerHitSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }


  // ─── THREE.JS GAME ENVIRONMENT SETUP ────────────────────────
  const container = document.getElementById('gameContainer');
  const blocker = document.getElementById('blocker');
  const playBtn = document.getElementById('playBtn');

  // Scene globals
  let scene, camera, renderer;
  let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
  let canJump = false;
  let prevTime = performance.now();
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  // PointerLock parameters
  let isLocked = false;
  let pitchObject = new THREE.Object3D();
  let yawObject = new THREE.Object3D();
  const PI_2 = Math.PI / 2;

  // Obstacles, hostiles, laser lasers
  const obstacles = [];
  const hostiles = [];
  const activeLasers = [];
  const activeParticles = [];

  // Game state values
  let score = 0;
  let health = 100;
  let ammo = 30;
  let isReloading = false;

  // Setup main scene
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080c);
    scene.fog = new THREE.FogExp2(0x06080c, 0.015);

    // Camera setup using nesting for rotation controls
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    pitchObject.add(camera);
    yawObject.add(pitchObject);
    yawObject.position.y = 1.8; // Player height
    scene.add(yawObject);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x0a0d14, 
      roughness: 0.8, 
      metalness: 0.2 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor Grid Helper
    const grid = new THREE.GridHelper(200, 40, 0x3fddc4, 0x1a2130);
    grid.position.y = 0.01;
    scene.add(grid);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Resize listener
    window.addEventListener('resize', onWindowResize);

    // Build Obstacles map
    buildObstacles();

    // Spawn Hostile bots
    spawnHostiles();
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ─── SCENERY BUILDER ───────────────────────────────────────
  function buildObstacles() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x10141d,
      roughness: 0.5,
      metalness: 0.1,
      bumpScale: 0.05
    });

    const borderMat = new THREE.MeshBasicMaterial({ color: 0x3fddc4, wireframe: true });

    // Helper to spawn columns
    function spawnColumn(x, z, width, height, depth) {
      const geo = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, height / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Add a thin glowing wireframe border
      const wire = new THREE.Mesh(geo, borderMat);
      wire.position.copy(mesh.position);
      wire.scale.multiplyScalar(1.002);
      scene.add(wire);

      // Save bounding box for physics collision checks
      obstacles.push(new THREE.Box3().setFromObject(mesh));
    }

    // Custom helper generators
    function createRoad(x, z, width, length, isVertical) {
      const roadGeo = new THREE.PlaneGeometry(isVertical ? width : length, isVertical ? length : width);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x151821, roughness: 0.95, metalness: 0.1 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.012, z);
      road.receiveShadow = true;
      scene.add(road);

      // White/Yellow dividing line markers
      const lineGeo = new THREE.PlaneGeometry(0.18, 1.8);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffb000 });
      if (isVertical) {
        for (let d = -length / 2 + 3; d < length / 2; d += 6) {
          const line = new THREE.Mesh(lineGeo, lineMat);
          line.rotation.x = -Math.PI / 2;
          line.position.set(x, 0.015, z + d);
          scene.add(line);
        }
      } else {
        for (let d = -length / 2 + 3; d < length / 2; d += 6) {
          const line = new THREE.Mesh(lineGeo, lineMat);
          line.rotation.x = -Math.PI / 2;
          line.rotation.z = Math.PI / 2;
          line.position.set(x + d, 0.015, z);
          scene.add(line);
        }
      }
    }

    function createTree(x, z) {
      const treeGroup = new THREE.Group();
      
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.22, 0.35, 2.8, 5);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x47321e, roughness: 0.92 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.4;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);

      // Foliage layers (Cone stacked modules)
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1a4628, roughness: 0.85 });
      
      const bGeo = new THREE.ConeGeometry(1.6, 2.4, 5);
      const bLeaves = new THREE.Mesh(bGeo, leavesMat);
      bLeaves.position.y = 3.0;
      bLeaves.castShadow = true;
      treeGroup.add(bLeaves);

      const mGeo = new THREE.ConeGeometry(1.15, 1.9, 5);
      const mLeaves = new THREE.Mesh(mGeo, leavesMat);
      mLeaves.position.y = 4.15;
      mLeaves.castShadow = true;
      treeGroup.add(mLeaves);

      const tGeo = new THREE.ConeGeometry(0.75, 1.4, 5);
      const tLeaves = new THREE.Mesh(tGeo, leavesMat);
      tLeaves.position.y = 5.0;
      tLeaves.castShadow = true;
      treeGroup.add(tLeaves);

      // Add tech wireframe borders
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x3fddc4, wireframe: true, transparent: true, opacity: 0.12 });
      const w1 = new THREE.Mesh(bGeo, wireMat); w1.position.y = 3.0; treeGroup.add(w1);
      const w2 = new THREE.Mesh(mGeo, wireMat); w2.position.y = 4.15; treeGroup.add(w2);
      const w3 = new THREE.Mesh(tGeo, wireMat); w3.position.y = 5.0; treeGroup.add(w3);

      treeGroup.position.set(x, 0, z);
      scene.add(treeGroup);

      // Only the trunk physically collides with the player
      obstacles.push(new THREE.Box3().setFromObject(trunk));
    }

    function createHouse(x, z, rot) {
      const houseGroup = new THREE.Group();
      
      // Walls
      const wallsGeo = new THREE.BoxGeometry(12, 6.5, 9);
      const wallsMat = new THREE.MeshStandardMaterial({ color: 0x1f2733, roughness: 0.72 });
      const walls = new THREE.Mesh(wallsGeo, wallsMat);
      walls.position.y = 3.25;
      walls.castShadow = true;
      walls.receiveShadow = true;
      houseGroup.add(walls);

      // Roof
      const roofGeo = new THREE.ConeGeometry(10.2, 4.5, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x8a2b1a, roughness: 0.8 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 8.5;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      houseGroup.add(roof);

      // Door (front entrance)
      const doorGeo = new THREE.BoxGeometry(2.2, 4.2, 0.2);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x06080c });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 2.1, 4.51);
      houseGroup.add(door);

      // Tech wireframes
      const borderMat = new THREE.MeshBasicMaterial({ color: 0xffb000, wireframe: true, transparent: true, opacity: 0.1 });
      const wWalls = new THREE.Mesh(wallsGeo, borderMat); wWalls.position.y = 3.25; houseGroup.add(wWalls);
      const wRoof = new THREE.Mesh(roofGeo, borderMat); wRoof.position.y = 8.5; wRoof.rotation.y = Math.PI / 4; houseGroup.add(wRoof);

      houseGroup.rotation.y = rot;
      houseGroup.position.set(x, 0, z);
      scene.add(houseGroup);

      // Physical cover obstacle bounding box
      obstacles.push(new THREE.Box3().setFromObject(walls));
    }

    function createSupplyCrate(x, z, rot) {
      const crateGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
      const crateMat = new THREE.MeshStandardMaterial({ color: 0x6e522f, roughness: 0.95 });
      const crate = new THREE.Mesh(crateGeo, crateMat);
      
      // Reinforcement bands
      const bandGeo = new THREE.BoxGeometry(2.45, 0.35, 2.45);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x1a212c, metalness: 0.75, roughness: 0.3 });
      const band1 = new THREE.Mesh(bandGeo, bandMat); band1.position.y = 0.55; crate.add(band1);
      const band2 = new THREE.Mesh(bandGeo, bandMat); band2.position.y = -0.55; crate.add(band2);

      crate.position.set(x, 1.2, z);
      crate.rotation.y = rot;
      crate.castShadow = true;
      crate.receiveShadow = true;
      scene.add(crate);

      obstacles.push(new THREE.Box3().setFromObject(crate));
    }

    // ─── SPAWN SCENERY MAP ELEMENTS ───

    // 1. Asphalt Roads
    createRoad(0, 0, 16, 200, true);  // North-South Road
    createRoad(0, 0, 16, 200, false); // East-West Road

    // 2. Tactical Houses
    createHouse(-30, -35, Math.PI / 6);
    createHouse(45, -45, -Math.PI / 4);
    createHouse(-50, 40, Math.PI / 3);
    createHouse(35, 45, 0);

    // 3. Foliage Trees
    const treePlacements = [
      [-60, -60], [-65, -55], [-55, -65],
      [60, -60], [65, -55], [55, -65],
      [-60, 60], [-65, 55], [-55, 65],
      [60, 60], [65, 55], [55, 65],
      [-25, -75], [25, -75], [-75, -25], [75, -25],
      [-75, 25], [75, 25], [-25, 75], [25, 75],
      [40, 15], [-40, 15], [15, 60], [-15, -60]
    ];
    treePlacements.forEach(pos => createTree(pos[0], pos[1]));

    // 4. Wooden Supply Crates
    createSupplyCrate(-10, -12, Math.PI / 4);
    createSupplyCrate(22, -18, Math.PI / 8);
    createSupplyCrate(-18, 26, -Math.PI / 5);
    createSupplyCrate(15, 22, Math.PI / 3);

    // Spawn tactical walls across the grid (remaining from original)
    spawnColumn(-15, 15, 6, 8, 6);
    spawnColumn(15, 25, 8, 12, 4);

    // Outer boundary barriers (invisible plane box boundaries)
    const boundsGeo = new THREE.BoxGeometry(202, 30, 2);
    const topBound = new THREE.Mesh(boundsGeo);
    topBound.position.set(0, 15, -100);
    obstacles.push(new THREE.Box3().setFromObject(topBound));

    const bottomBound = new THREE.Mesh(boundsGeo);
    bottomBound.position.set(0, 15, 100);
    obstacles.push(new THREE.Box3().setFromObject(bottomBound));

    const sideBoundsGeo = new THREE.BoxGeometry(2, 30, 202);
    const leftBound = new THREE.Mesh(sideBoundsGeo);
    leftBound.position.set(-100, 15, 0);
    obstacles.push(new THREE.Box3().setFromObject(leftBound));

    const rightBound = new THREE.Mesh(sideBoundsGeo);
    rightBound.position.set(100, 15, 0);
    obstacles.push(new THREE.Box3().setFromObject(rightBound));
  }

  // ─── HOSTILE BOTS CONTROLLER ──────────────────────────────
  function spawnHostiles() {
    const scale = 1.0;
    
    for (let i = 0; i < 3; i++) {
      const botGroup = new THREE.Group();
      
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xff5f56,
        emissive: 0x66110e,
        roughness: 0.4,
        metalness: 0.5
      });
      const jointMat = new THREE.MeshStandardMaterial({ color: 0x1a212d });
      
      // Torso
      const torsoGeo = new THREE.BoxGeometry(0.9, 1.3, 0.5);
      const torso = new THREE.Mesh(torsoGeo, bodyMat);
      torso.position.y = 1.45;
      torso.castShadow = true;
      torso.receiveShadow = true;
      botGroup.add(torso);

      // Head
      const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 2.3, 0);
      head.castShadow = true;
      botGroup.add(head);

      // Glowing Visor
      const visorGeo = new THREE.BoxGeometry(0.48, 0.15, 0.38);
      const visorMat = new THREE.MeshBasicMaterial({ color: 0xffb000 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 2.3, 0.2);
      botGroup.add(visor);

      // Left Leg
      const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.28);
      const leftLeg = new THREE.Mesh(legGeo, jointMat);
      leftLeg.position.set(-0.25, 0.45, 0);
      leftLeg.castShadow = true;
      botGroup.add(leftLeg);

      // Right Leg
      const rightLeg = new THREE.Mesh(legGeo, jointMat);
      rightLeg.position.set(0.25, 0.45, 0);
      rightLeg.castShadow = true;
      botGroup.add(rightLeg);

      // Left Arm
      const armGeo = new THREE.BoxGeometry(0.22, 1.0, 0.22);
      const leftArm = new THREE.Mesh(armGeo, bodyMat);
      leftArm.position.set(-0.6, 1.35, 0);
      leftArm.castShadow = true;
      botGroup.add(leftArm);

      // Right Arm
      const rightArm = new THREE.Mesh(armGeo, bodyMat);
      rightArm.position.set(0.6, 1.35, 0);
      rightArm.castShadow = true;
      botGroup.add(rightArm);

      // Store references for running leg/arm swing animations
      botGroup.leftLeg = leftLeg;
      botGroup.rightLeg = rightLeg;
      botGroup.leftArm = leftArm;
      botGroup.rightArm = rightArm;

      // Random position
      resetBotPosition(botGroup);

      // Custom attributes
      botGroup.hp = 35;
      botGroup.maxHp = 35;
      botGroup.moveAngle = Math.random() * Math.PI * 2;
      botGroup.speed = Math.random() * 5 + 6; // units/sec
      botGroup.animTime = Math.random() * 100;

      scene.add(botGroup);
      hostiles.push(botGroup);
    }
  }

  function resetBotPosition(bot) {
    bot.position.set(
      (Math.random() - 0.5) * 130,
      0, // Position on the floor plane
      (Math.random() - 0.5) * 130
    );
    bot.hp = bot.maxHp;
    
    // Ensure we don't spawn inside an obstacle collision
    const botBox = new THREE.Box3().setFromObject(bot);
    let collides = true;
    while (collides) {
      collides = false;
      obstacles.forEach(obs => {
        if (botBox.intersectsBox(obs)) {
          bot.position.set((Math.random() - 0.5) * 130, 0, (Math.random() - 0.5) * 130);
          botBox.setFromObject(bot);
          collides = true;
        }
      });
    }
  }

  // ─── POINTERLOCK MOUSE & KEYBOARD HOOKS ────────────────────
  
  // Register click lock request
  playBtn.addEventListener('click', () => {
    initAudio();
    container.requestPointerLock();
  });

  // Track lock status
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === container) {
      isLocked = true;
      blocker.style.opacity = '0';
      setTimeout(() => { blocker.style.display = 'none'; }, 500);
      initAudio();
    } else {
      isLocked = false;
      blocker.style.display = 'flex';
      setTimeout(() => { blocker.style.opacity = '1'; }, 10);
    }
  });

  // Mouse Look Movements
  document.addEventListener('mousemove', (e) => {
    if (!isLocked) return;

    const movementX = e.movementX || 0;
    const movementY = e.movementY || 0;

    yawObject.rotation.y -= movementX * 0.0022;
    pitchObject.rotation.x -= movementY * 0.0022;

    // Clamp vertical look
    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  });

  // Keyboard Keys
  const onKeyDown = (e) => {
    switch (e.code) {
      case 'KeyW': moveForward = true; break;
      case 'KeyA': moveLeft = true; break;
      case 'KeyS': moveBackward = true; break;
      case 'KeyD': moveRight = true; break;
      case 'Space':
        if (canJump) {
          velocity.y += 180; // Jump force
          canJump = false;
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

  // ─── WEAPONS SHOOTING RAYCAST ─────────────────────────────
  document.addEventListener('mousedown', (e) => {
    if (!isLocked) return;
    if (e.button === 0) { // Left click
      fireWeapon();
    }
  });

  function fireWeapon() {
    if (isReloading) return;
    if (ammo <= 0) {
      const rPrompt = document.getElementById('reloadPrompt');
      rPrompt.textContent = "OUT_OF_AMMO [PRESS_R]";
      rPrompt.classList.add('reloading');
      return;
    }

    ammo--;
    document.getElementById('ammoVal').textContent = ammo;
    playShootSound();

    // Set up raycaster from center of screen view
    const raycaster = new THREE.Raycaster();
    const centerMouse = new THREE.Vector2(0, 0); // Center of screen coordinate
    raycaster.setFromCamera(centerMouse, camera);

    // Draw bullet tracer line (laser)
    // Extract start origin from camera world position offset slightly
    const startPoint = new THREE.Vector3();
    camera.getWorldPosition(startPoint);
    
    // Laser direction
    const directionVec = new THREE.Vector3();
    camera.getWorldDirection(directionVec);

    // Laser endpoint
    const endPoint = new THREE.Vector3().copy(startPoint).addScaledVector(directionVec, 80);

    // Check Raycast hits recursively on bot groups
    const intersects = raycaster.intersectObjects(hostiles, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      
      // Traverse up to find the root bot group in hostiles
      let bot = hit.object;
      while (bot.parent && !hostiles.includes(bot)) {
        bot = bot.parent;
      }
      
      // Update endpoint to hit location
      endPoint.copy(hit.point);

      // Deduct bot hp
      bot.hp -= 15;
      playHitSound();
      spawnHitParticles(hit.point);

      if (bot.hp <= 0) {
        score += 100;
        document.getElementById('scoreVal').textContent = String(score).padStart(3, '0');
        playDeathSound();
        resetBotPosition(bot);
      }
    }

    drawLaserTracer(startPoint, endPoint);
  }

  function drawLaserTracer(from, to) {
    const points = [from, to];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x3fddc4, 
      linewidth: 3, 
      transparent: true,
      opacity: 0.8
    });
    
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    
    activeLasers.push({
      mesh: line,
      spawnTime: performance.now(),
      lifetime: 80 // ms
    });
  }

  function spawnHitParticles(point) {
    const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xff5f56 });

    for (let i = 0; i < 8; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.copy(point);
      
      // Velocity vectors
      p.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 4 + 2,
        (Math.random() - 0.5) * 6
      );

      scene.add(p);
      activeParticles.push({
        mesh: p,
        spawnTime: performance.now(),
        lifetime: 400 // ms
      });
    }
  }

  function performReload() {
    if (isReloading || ammo === 30) return;
    isReloading = true;
    playReloadSound();

    const rPrompt = document.getElementById('reloadPrompt');
    rPrompt.textContent = "RELOADING...";
    rPrompt.classList.add('reloading');

    setTimeout(() => {
      ammo = 30;
      document.getElementById('ammoVal').textContent = ammo;
      isReloading = false;
      rPrompt.textContent = "READY";
      rPrompt.classList.remove('reloading');
    }, 1500);
  }

  // ─── COLLISION DETECTION ENGINE ───────────────────────────
  function checkCollision(nextPos) {
    // Create bounding box for player
    const playerBox = new THREE.Box3(
      new THREE.Vector3(nextPos.x - 1.2, nextPos.y - 1.8, nextPos.z - 1.2),
      new THREE.Vector3(nextPos.x + 1.2, nextPos.y + 0.2, nextPos.z + 1.2)
    );

    let collides = false;
    obstacles.forEach(box => {
      if (playerBox.intersectsBox(box)) {
        collides = true;
      }
    });

    return collides;
  }

  // ─── MAIN ANIMATION RUNTIME LOOP ───────────────────────────
  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000; // seconds

    if (isLocked) {
      // 1. Friction / deceleration calculation
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      
      // Gravity deceleration
      velocity.y -= 9.8 * 50.0 * delta; // 50 units multiplier for fast drop

      // Movement vector direction
      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize(); // Ensure uniform movement speeds

      const speedMultiplier = 400.0;
      if (moveForward || moveBackward) velocity.z -= direction.z * speedMultiplier * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * speedMultiplier * delta;

      // 2. Physics calculations & collision check
      // Apply movement relative to player yaw heading rotation
      const nextXOffset = (velocity.x * delta * Math.cos(yawObject.rotation.y) - velocity.z * delta * Math.sin(yawObject.rotation.y));
      const nextZOffset = (velocity.x * delta * Math.sin(yawObject.rotation.y) + velocity.z * delta * Math.cos(yawObject.rotation.y));

      const currentPos = yawObject.position.clone();
      
      // Calculate next position coordinates separately to slide along walls
      const nextPosX = currentPos.clone().setX(currentPos.x + nextXOffset);
      if (!checkCollision(nextPosX)) {
        yawObject.position.x += nextXOffset;
      } else {
        velocity.x = 0; // stop sliding movement on crash
      }

      const nextPosZ = currentPos.clone().setZ(currentPos.z + nextZOffset);
      if (!checkCollision(nextPosZ)) {
        yawObject.position.z += nextZOffset;
      } else {
        velocity.z = 0; // stop sliding movement on crash
      }

      // Vertical jumping movement
      yawObject.position.y += velocity.y * delta;
      
      // Check floor intersection
      if (yawObject.position.y < 1.8) {
        velocity.y = 0;
        yawObject.position.y = 1.8;
        canJump = true;
      }

      // 3. Move enemy bot targets
      updateHostileBots(time, delta);
    }

    // 4. Update dynamic line tracers and hit particles
    updateEffects(time);

    prevTime = time;
    renderer.render(scene, camera);
  }

  function updateHostileBots(time, delta) {
    hostiles.forEach(bot => {
      // Move bot forwards along current direction angle
      const dx = Math.cos(bot.moveAngle) * bot.speed * delta;
      const dz = Math.sin(bot.moveAngle) * bot.speed * delta;
      
      const prevPos = bot.position.clone();
      bot.position.x += dx;
      bot.position.z += dz;

      // Check wall collisions for bots, bounce on collision
      const botBox = new THREE.Box3().setFromObject(bot);
      let hitWall = false;
      
      // Check map limits
      if (Math.abs(bot.position.x) > 95 || Math.abs(bot.position.z) > 95) {
        hitWall = true;
      }
      
      obstacles.forEach(obs => {
        if (botBox.intersectsBox(obs)) {
          hitWall = true;
        }
      });

      if (hitWall) {
        // Rollback position and choose random new angle
        bot.position.copy(prevPos);
        bot.moveAngle = Math.random() * Math.PI * 2;
      }

      // Align facing direction of bot
      bot.rotation.y = Math.atan2(dx, dz);

      // Running animations
      bot.animTime += delta * bot.speed * 2.2;
      const swingAngle = Math.sin(bot.animTime) * 0.6; // swing amplitude
      
      if (bot.leftLeg) bot.leftLeg.rotation.x = swingAngle;
      if (bot.rightLeg) bot.rightLeg.rotation.x = -swingAngle;
      if (bot.leftArm) bot.leftArm.rotation.x = -swingAngle * 0.8;
      if (bot.rightArm) bot.rightArm.rotation.x = swingAngle * 0.8;

      // 4. Check bot collision with Player (Vitals impact)
      const playerPos = yawObject.position;
      const dist = bot.position.distanceTo(playerPos);
      if (dist < 3.2) { // Hit distance range
        applyPlayerDamage(20);
        
        // Push bot back after hit
        bot.moveAngle = Math.random() * Math.PI * 2;
        bot.position.x -= Math.cos(bot.moveAngle) * 8;
        bot.position.z -= Math.sin(bot.moveAngle) * 8;
      }
    });
  }

  function applyPlayerDamage(amount) {
    if (health <= 0) return;
    health = Math.max(0, health - amount);
    
    // Update vitals panel UI
    const hBar = document.getElementById('healthBar');
    hBar.style.width = health + '%';
    document.getElementById('healthVal').textContent = health + ' HP';
    playPlayerHitSound();

    if (health <= 0) {
      handleGameOver();
    }
  }

  function handleGameOver() {
    // Blocker overlays
    document.exitPointerLock();
    const inst = document.getElementById('instructions');
    inst.innerHTML = `
      <div class="glitch-title mono" data-text="GAME OVER">GAME OVER</div>
      <p class="subtitle mono">YOUR SYSTEM WAS DE-COMPILED BY RED BOTS</p>
      <button class="play-btn mono" id="restartBtn">RE-BOOT_ARENA</button>
      <div class="controls-guide" style="text-align: center;">
        <span class="mono" style="color:var(--teal);">SCORE LOGGED: ${score}</span>
      </div>
    `;

    document.getElementById('restartBtn').addEventListener('click', () => {
      // Reset variables
      score = 0;
      health = 100;
      ammo = 30;
      
      document.getElementById('scoreVal').textContent = "000";
      document.getElementById('healthBar').style.width = "100%";
      document.getElementById('healthVal').textContent = "100 HP";
      document.getElementById('ammoVal').textContent = "30";
      
      // Reset player position coordinates
      yawObject.position.set(0, 1.8, 0);
      velocity.set(0, 0, 0);

      // Restore instructions box
      location.reload();
    });
  }

  function updateEffects(time) {
    // Bullet tracer lines cleanup
    for (let i = activeLasers.length - 1; i >= 0; i--) {
      const laser = activeLasers[i];
      if (time - laser.spawnTime > laser.lifetime) {
        scene.remove(laser.mesh);
        laser.mesh.geometry.dispose();
        laser.mesh.material.dispose();
        activeLasers.splice(i, 1);
      }
    }

    // Impact debris particles animation
    for (let i = activeParticles.length - 1; i >= 0; i--) {
      const p = activeParticles[i];
      const age = time - p.spawnTime;
      
      if (age > p.lifetime) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        activeParticles.splice(i, 1);
      } else {
        // Apply gravity & velocity drift
        p.mesh.position.addScaledVector(p.velocity, 0.016); // ~60fps step
        p.velocity.y -= 9.8 * 0.016; // gravity fall
        p.mesh.scale.multiplyScalar(0.95); // fade shrink size
      }
    }
  }

  // ─── INITIALIZE GAME ───
  initScene();
  animate();

});
