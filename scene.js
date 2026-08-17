/* ============================================================
   3D Background Scene — Three.js
   Subtle floating geometry, particles and a digital grid.
   Respects prefers-reduced-motion and scales down on mobile.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof THREE === 'undefined') return; // static gradient fallback

  var canvas = document.getElementById('bg3d');
  if (!canvas) return;

  var isMobile = window.matchMedia('(max-width: 900px)').matches ||
                 /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (e) { return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070f, 0.028);

  var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0.6, 14);

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0x223055, 1.1));

  var keyLight = new THREE.PointLight(0x38bdf8, 30, 60, 1.8);
  keyLight.position.set(6, 5, 8);
  scene.add(keyLight);

  var fillLight = new THREE.PointLight(0x8b7cf6, 18, 50, 1.8);
  fillLight.position.set(-8, -3, 6);
  scene.add(fillLight);

  /* ---------- digital grid floor ---------- */
  var grid = new THREE.GridHelper(90, isMobile ? 34 : 60, 0x1c3a66, 0x122142);
  grid.material.transparent = true;
  grid.material.opacity = 0.32;
  grid.position.y = -6.5;
  scene.add(grid);

  /* ---------- floating geometric objects ---------- */
  var group = new THREE.Group();
  scene.add(group);

  var matGlassCyan = new THREE.MeshStandardMaterial({
    color: 0x0e2a4a, metalness: 0.6, roughness: 0.25,
    emissive: 0x0a3a5e, emissiveIntensity: 0.55,
    transparent: true, opacity: 0.9
  });
  var matGlassPurple = new THREE.MeshStandardMaterial({
    color: 0x1a1640, metalness: 0.55, roughness: 0.3,
    emissive: 0x3b2d7a, emissiveIntensity: 0.5,
    transparent: true, opacity: 0.9
  });
  var matWireCyan = new THREE.MeshBasicMaterial({
    color: 0x2f9fe0, wireframe: true, transparent: true, opacity: 0.28
  });
  var matWirePurple = new THREE.MeshBasicMaterial({
    color: 0x7a6cf0, wireframe: true, transparent: true, opacity: 0.22
  });

  var floaters = [];

  function addFloater(mesh, x, y, z, speed, amp, rot) {
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    group.add(mesh);
    floaters.push({
      mesh: mesh, baseY: y, baseX: x,
      speed: speed, amp: amp, rot: rot,
      phase: Math.random() * Math.PI * 2
    });
  }

  // solid shapes
  addFloater(new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 0), matGlassCyan),   -7.5,  2.4, -4, 0.45, 0.55, 0.15);
  addFloater(new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), matGlassPurple),   7.8,  3.2, -5, 0.5,  0.5,  0.2);
  addFloater(new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.28, 16, 42), matGlassCyan), 8.6, -2.6, -3, 0.4, 0.45, 0.12);
  addFloater(new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), matGlassPurple), -8.6, -3.0, -2, 0.55, 0.5,  0.18);

  // wireframe accents
  addFloater(new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), matWireCyan),      5.6,  0.4, -9, 0.3, 0.7, 0.06);
  addFloater(new THREE.Mesh(new THREE.SphereGeometry(1.8, 14, 14), matWirePurple),   -5.8, -0.8, -10, 0.32, 0.6, 0.05);
  if (!isMobile) {
    addFloater(new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.22, 72, 12), matWireCyan), 0.4, 4.6, -11, 0.28, 0.5, 0.08);
    addFloater(new THREE.Mesh(new THREE.TetrahedronGeometry(0.55, 0), matGlassCyan), 3.4, -4.2, -4, 0.6, 0.55, 0.22);
    addFloater(new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), matGlassPurple), -3.6, 4.4, -6, 0.65, 0.6, 0.25);
  }

  /* ---------- glowing particles ---------- */
  var COUNT = isMobile ? 220 : 480;
  var positions = new Float32Array(COUNT * 3);
  var seeds = new Float32Array(COUNT);
  for (var i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 46;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 2] = -Math.random() * 28 + 4;
    seeds[i] = Math.random() * Math.PI * 2;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // soft round sprite via canvas
  var spr = document.createElement('canvas');
  spr.width = spr.height = 64;
  var g = spr.getContext('2d');
  var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(160,220,255,1)');
  grad.addColorStop(0.35, 'rgba(90,180,255,0.55)');
  grad.addColorStop(1, 'rgba(60,140,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  var sprite = new THREE.CanvasTexture(spr);

  var pMat = new THREE.PointsMaterial({
    size: isMobile ? 0.35 : 0.3,
    map: sprite,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0x7cc7ff,
    sizeAttenuation: true
  });
  var points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* ---------- interaction state ---------- */
  var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  var scrollT = 0;

  if (!isMobile) {
    window.addEventListener('pointermove', function (e) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  window.addEventListener('scroll', function () {
    var max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    scrollT = window.scrollY / max;
  }, { passive: true });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- render loop (paused when tab hidden) ---------- */
  var clock = new THREE.Clock();
  var running = true;

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { clock.getDelta(); tick(); }
  });

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);

    var t = clock.getElapsedTime();

    // smooth mouse easing
    mouseX += (targetX - mouseX) * 0.045;
    mouseY += (targetY - mouseY) * 0.045;

    // camera drift: mouse parallax + slow idle sway + scroll descent
    camera.position.x = mouseX * 1.4 + Math.sin(t * 0.12) * 0.35;
    camera.position.y = 0.6 - mouseY * 0.9 - scrollT * 2.2 + Math.cos(t * 0.1) * 0.2;
    camera.lookAt(0, -scrollT * 1.6, 0);

    // floaters bob and spin
    for (var i = 0; i < floaters.length; i++) {
      var f = floaters[i];
      f.mesh.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * f.amp;
      f.mesh.position.x = f.baseX + Math.cos(t * f.speed * 0.7 + f.phase) * f.amp * 0.4;
      f.mesh.rotation.x += f.rot * 0.004;
      f.mesh.rotation.y += f.rot * 0.006;
    }

    // gentle particle drift
    points.rotation.y = t * 0.008 + mouseX * 0.03;
    points.position.y = Math.sin(t * 0.15) * 0.4;

    // light breathing
    keyLight.intensity = 26 + Math.sin(t * 0.8) * 5;

    grid.position.z = (t * 0.35) % 1.5; // slow forward glide

    renderer.render(scene, camera);
  }
  tick();
})();
