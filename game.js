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

    // Spawn tactical walls across the grid
    spawnColumn(-15, -15, 6, 8, 6);
    spawnColumn(15, -25, 8, 12, 4);
    spawnColumn(-25, 20, 4, 10, 8);
    spawnColumn(20, 20, 6, 6, 6);
    spawnColumn(0, -35, 12, 5, 2);
    spawnColumn(-35, -5, 4, 14, 4);

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
    const hostileGeo = new THREE.BoxGeometry(3, 3, 3);
    const hostileMat = new THREE.MeshStandardMaterial({
      color: 0xff5f56,
      emissive: 0x99201a,
      roughness: 0.3,
      metalness: 0.7
    });

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff5f56, wireframe: true });

    for (let i = 0; i < 3; i++) {
      const bot = new THREE.Mesh(hostileGeo, hostileMat);
      const wire = new THREE.Mesh(hostileGeo, glowMat);
      bot.add(wire);
      wire.scale.multiplyScalar(1.05);

      bot.castShadow = true;
      bot.receiveShadow = true;

      // Random position
      resetBotPosition(bot);

      // Custom attributes
      bot.hp = 35;
      bot.maxHp = 35;
      bot.moveAngle = Math.random() * Math.PI * 2;
      bot.speed = Math.random() * 4 + 4; // units/sec

      scene.add(bot);
      hostiles.push(bot);
    }
  }

  function resetBotPosition(bot) {
    bot.position.set(
      (Math.random() - 0.5) * 120,
      1.5,
      (Math.random() - 0.5) * 120
    );
    bot.hp = bot.maxHp;
    
    // Ensure we don't spawn inside a wall collision
    const botBox = new THREE.Box3().setFromObject(bot);
    let collides = true;
    while (collides) {
      collides = false;
      obstacles.forEach(obs => {
        if (botBox.intersectsBox(obs)) {
          bot.position.set((Math.random() - 0.5) * 120, 1.5, (Math.random() - 0.5) * 120);
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

    // Check Raycast hits
    const intersects = raycaster.intersectObjects(hostiles);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const bot = hit.object;
      
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

      // Gently rotate bot mesh for extra visual movement
      bot.rotation.y += 1 * delta;
      bot.rotation.x += 0.5 * delta;

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
