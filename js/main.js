// main.js — R7LA · ECHOES: Surveyor 3 cinematic prototype orchestrator
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { el, show, hide, tween, updateTweens, clamp, lerp, latLonToVec3, glowTexture, canvasTexture } from './util.js';
import { makeStarfield } from './stars.js';
import { makeEarth, makeMoon, makeMars, makeSun, makeLunarGround } from './planets.js';
import { buildSurveyor3, buildRocket, buildEcho, buildShip, buildLunarModule, buildAstronaut } from './models.js';
import { WELCOME_LINES, APPROACH_LINES, FINAL_LINES, CHAPTERS, QUIZ, TIMELINE, NASA_PHOTOS } from './storyData.js';

/* ============================== boot ============================== */
const canvas = el('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  fatalWebGL();
}
function fatalWebGL() {
  const s = el('loader-status');
  s.innerHTML = '<div class="fallback-error">This experience needs WebGL, which your browser or device has disabled. Try a current version of Chrome, Edge, Firefox or Safari.</div>';
  throw new Error('WebGL unavailable');
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030a10);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 3000);
camera.position.set(0, 3, 14);

scene.add(new THREE.AmbientLight(0x8899aa, 0.55));
const hemi = new THREE.HemisphereLight(0x2a3c4e, 0x4a4741, 0.5);
scene.add(hemi);
const sunLight = new THREE.DirectionalLight(0xfff2dd, 2.0);
sunLight.position.set(18, 10, 6);
scene.add(sunLight);
const rimLight = new THREE.DirectionalLight(0x39b9c9, 0.5);
rimLight.position.set(-14, 4, -10);
scene.add(rimLight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enabled = false;

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ============================== world groups ============================== */
const gStars = makeStarfield(900); scene.add(gStars);
const gWelcome = new THREE.Group(); scene.add(gWelcome);
const gSpace = new THREE.Group(); scene.add(gSpace);
const gSurface = new THREE.Group(); scene.add(gSurface);
const gLaunch = new THREE.Group(); scene.add(gLaunch);

/* ---------- shared helpers ---------- */
function labelSprite(text, { size = 44, color = '#e4b44c', bg = 'rgba(4,12,20,0.55)' } = {}) {
  const pad = 18;
  const cv = document.createElement('canvas');
  const ctx0 = cv.getContext('2d');
  ctx0.font = `500 ${size}px "IBM Plex Mono", monospace`;
  const w = Math.ceil(ctx0.measureText(text).width) + pad * 2;
  cv.width = w; cv.height = size + pad * 2;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = bg;
  const r = 14;
  ctx.beginPath(); ctx.roundRect(0, 0, w, cv.height, r); ctx.fill();
  ctx.font = `500 ${size}px "IBM Plex Mono", monospace`;
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, cv.height / 2 + 2);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  const scale = 0.005;
  sp.scale.set(w * scale, cv.height * scale, 1);
  return sp;
}

function pulseMarker(color = 0xe4b44c) {
  const grp = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.035, 10, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false })
  );
  const dot = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(255,220,140,1)', 'rgba(228,180,76,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  dot.scale.setScalar(1.1);
  grp.add(ring, dot);
  grp.userData.ring = ring;
  grp.userData.isMarker = true;
  return grp;
}

/* ---------- SPACE (solar system, schematic layout) ---------- */
const sun = makeSun(4); gSpace.add(sun);
const earthOrbit = new THREE.Group(); gSpace.add(earthOrbit);
const earth = makeEarth(2.0); earth.position.x = 26; earthOrbit.add(earth);
const moonOrbit = new THREE.Group(); earth.add(moonOrbit);
const moon = makeMoon(0.55); moon.position.x = 5.2; moonOrbit.add(moon);
const marsOrbit = new THREE.Group(); gSpace.add(marsOrbit);
const mars = makeMars(1.4); mars.position.set(-38, 4, -14); marsOrbit.add(mars);
for (const [r, parent] of [[26, gSpace], [43, gSpace], [5.2, earth]]) {
  const pts = [];
  for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x1b3542, transparent: true, opacity: 0.5 }));
  parent.add(ring);
}
marsOrbit.rotation.y = 0.8;

const moonMarker = pulseMarker();
moonMarker.scale.setScalar(1.5); // ring radius 0.75 encircles the 0.55-radius Moon
moonMarker.userData.ring.rotation.x = Math.PI / 2.4; // tilt ring around the sphere
moonMarker.children.forEach(c => { if (c.isSprite) c.visible = false; }); // hide center glow dot
moon.add(moonMarker); // rides the Moon, never detaches
const moonLbl = labelSprite('THE MOON · SELECT');
moonLbl.position.set(0, 1.5, 0); moonLbl.scale.multiplyScalar(0.7);
moonMarker.add(moonLbl);
{ // leader line from ring to label
  const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.78, 0), new THREE.Vector3(0, 1.12, 0)]);
  moonMarker.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xe4b44c, transparent: true, opacity: 0.7 })));
}
moonMarker.userData.action = () => goTo('approach');

const marsMarker = pulseMarker(0x7e929f);
marsMarker.position.copy(mars.position).add(new THREE.Vector3(0, 2.2, 0));
mars.add(new THREE.Group());
const marsLbl = labelSprite('MARS · FUTURE MISSION', { color: '#7e929f' });
marsLbl.position.set(0, 2.4, 0); marsMarker.add(marsLbl);
marsMarker.userData.action = () => toast('Mars expeditions are coming in a future R7LA mission.');
gSpace.add(marsMarker);

// earth marker removed: ring read as detached clutter; home-base note lives in ECHO's line

const spaceNote = labelSprite('SCHEMATIC VIEW — DISTANCES NOT TO SCALE', { color: '#7e929f', size: 30 });
spaceNote.position.set(0, -16, 0); spaceNote.scale.multiplyScalar(2.4);
gSpace.add(spaceNote);

/* ---------- WELCOME ---------- */
const ship = buildShip(); ship.position.set(-16, 1.2, -8); ship.rotation.y = 0.5; gWelcome.add(ship);
const echoBot = buildEcho(1.15); echoBot.position.set(1.9, 0.7, 4.4); echoBot.visible = false; gWelcome.add(echoBot);

/* ---------- SURFACE (moon scenes) ---------- */
const ground = makeLunarGround(70); gSurface.add(ground);
const lander = buildSurveyor3(); lander.position.set(0, 0.02, 0); lander.rotation.y = -0.5; gSurface.add(lander);
const lm = buildLunarModule(); lm.position.set(9, 0.02, -6); lm.rotation.y = 2.4; lm.visible = false; gSurface.add(lm);
const astro1 = buildAstronaut(); astro1.position.set(7.4, 0.05, -4.6); astro1.rotation.y = 2.2; astro1.visible = false; gSurface.add(astro1);
const astro2 = buildAstronaut(); astro2.position.set(8.2, 0.05, -5.2); astro2.rotation.y = 2.0; astro2.visible = false; gSurface.add(astro2);
// distant mountains silhouette
{
  const mtn = new THREE.Group();
  let seed = 5; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const r = 34 + rand() * 6;
    const h = 0.9 + rand() * 2.0;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(5 + rand() * 7, h, 7),
      new THREE.MeshStandardMaterial({ color: 0x767370, roughness: 1 }));
    cone.position.set(Math.cos(a) * r, h / 2 - 0.25, Math.sin(a) * r);
    mtn.add(cone);
  }
  gSurface.add(mtn);
}
// Earth in the lunar sky
const skyEarth = makeEarth(0.8); skyEarth.position.set(-18, 22, -30); gSurface.add(skyEarth);

// hotspot markers for lander
const hotspotMarkers = [];
for (const hs of lander.userData.hotspots) {
  const mk = pulseMarker(0x39b9c9);
  mk.scale.setScalar(0.22);
  mk.position.copy(hs.pos);
  mk.userData.action = () => showInfoModal(hs.label, hs.text);
  mk.userData.hotspot = hs.id;
  const lbl = labelSprite(hs.label, { color: '#39b9c9', size: 46 });
  lbl.position.set(0, 0.85, 0); lbl.scale.multiplyScalar(1.1);
  mk.add(lbl);
  mk.visible = false;
  lander.add(mk);
  hotspotMarkers.push(mk);
}

/* ---------- LAUNCH scene ---------- */
const padGround = new THREE.Mesh(new THREE.CircleGeometry(40, 48),
  new THREE.MeshStandardMaterial({ color: 0x1a2129, roughness: 0.95 }));
padGround.rotation.x = -Math.PI / 2; gLaunch.add(padGround);
const rocket = buildRocket(); rocket.position.set(0, 0.32, 0); gLaunch.add(rocket);
// service tower
{
  const tw = new THREE.Group();
  const tmat = new THREE.MeshStandardMaterial({ color: 0x8a3d33, roughness: 0.7, metalness: 0.4 });
  for (const [x, z] of [[-0.9, -0.9], [-0.9, 0.9], [-1.6, -0.9], [-1.6, 0.9]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7.4, 8), tmat);
    leg.position.set(x, 3.7, z); tw.add(leg);
  }
  for (let i = 1; i < 7; i++) {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 2.0), tmat);
    deck.position.set(-1.25, i * 1.05, 0); tw.add(deck);
  }
  tw.position.set(-0.4, 0, -1.6);
  gLaunch.add(tw);
}
// floodlights
for (const [x, z] of [[11, 8], [-10, 7], [9, -11]]) {
  const pl = new THREE.PointLight(0xcfe6ff, 12, 30, 1.8); pl.position.set(x, 3, z); gLaunch.add(pl);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 8), new THREE.MeshStandardMaterial({ color: 0x333c46 }));
  pole.position.set(x, 1.5, z); gLaunch.add(pole);
}
// smoke particles
const SMOKE_N = 260;
const smokeGeo = new THREE.BufferGeometry();
const smokePos = new Float32Array(SMOKE_N * 3);
const smokeVel = new Float32Array(SMOKE_N * 3);
const smokeLife = new Float32Array(SMOKE_N).fill(-1);
smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
const smokeMat = new THREE.PointsMaterial({ color: 0xcfc8bd, size: 1.5, map: glowTexture('rgba(215,208,196,0.55)','rgba(215,208,196,0)'), transparent: true, opacity: 0.5, depthWrite: false });
const smoke = new THREE.Points(smokeGeo, smokeMat); smoke.frustumCulled = false; gLaunch.add(smoke);
let smokeOn = false;
function stepSmoke(dt) {
  if (!smokeOn) return;
  for (let i = 0; i < SMOKE_N; i++) {
    if (smokeLife[i] <= 0) {
      const a = Math.random() * Math.PI * 2, r = 0.7 + Math.random() * 1.1;
      smokePos[i * 3] = Math.cos(a) * r; smokePos[i * 3 + 1] = 0.15; smokePos[i * 3 + 2] = Math.sin(a) * r;
      const sp = 3.5 + Math.random() * 4;
      smokeVel[i * 3] = Math.cos(a) * sp; smokeVel[i * 3 + 1] = 0.6 + Math.random() * 1.2; smokeVel[i * 3 + 2] = Math.sin(a) * sp;
      smokeLife[i] = 1 + Math.random() * 1.6;
    }
    smokeLife[i] -= dt;
    smokePos[i * 3] += smokeVel[i * 3] * dt;
    smokePos[i * 3 + 1] += smokeVel[i * 3 + 1] * dt;
    smokePos[i * 3 + 2] += smokeVel[i * 3 + 2] * dt;
    smokeVel[i * 3] *= (1 - dt * 0.9); smokeVel[i * 3 + 2] *= (1 - dt * 0.9);
  }
  smokeGeo.attributes.position.needsUpdate = true;
}
// cloud layer ring for fly-through
const clouds = new THREE.Group();
{
  const ctex = glowTexture('rgba(230,235,240,0.5)', 'rgba(230,235,240,0)');
  for (let i = 0; i < 60; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctex, transparent: true, opacity: 0.35, depthWrite: false }));
    const a = Math.random() * Math.PI * 2, r = 4 + Math.random() * 18;
    sp.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 2.5, Math.sin(a) * r);
    sp.scale.setScalar(5 + Math.random() * 7);
    clouds.add(sp);
  }
  clouds.position.y = 60; clouds.visible = false; gLaunch.add(clouds);
}
// big Earth for post-ascent reveal
const launchEarth = makeEarth(40); launchEarth.position.set(0, -95, 0); launchEarth.visible = false; gLaunch.add(launchEarth);

/* ============================== state & UI ============================== */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionOn = true;
let phase = null;
let maxReached = -1;
const updaters = new Set();
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();

const PHASES = [
  { id: 'welcome', name: 'WELCOME ABOARD' },
  { id: 'space', name: 'SPACE EXPLORATION' },
  { id: 'approach', name: 'APPROACHING THE MOON', transient: true },
  { id: 'discover', name: 'SURVEYOR 3' },
  ...CHAPTERS.map(c => ({ id: c.id, name: `CH${c.num} · ${c.name}` })),
  { id: 'final', name: 'RETURN TO EXPLORATION' },
];
const NAV_PHASES = PHASES.filter(p => !p.transient);
const chapterOf = (id) => CHAPTERS.find(c => c.id === id);

/* ---------- subtitles ---------- */
let subTimer = null;
function playLines(lines, { interval = 3400, onDone } = {}) {
  stopLines();
  const box = el('subtitles'), txt = el('subtitle-text');
  show(box);
  let i = 0;
  txt.textContent = lines[0];
  if (lines.length === 1) { if (onDone) subTimer = setTimeout(() => { onDone(); }, interval); return; }
  subTimer = setInterval(() => {
    i++;
    if (i < lines.length) txt.textContent = lines[i];
    else { stopLines(); onDone && onDone(); }
  }, interval);
}
function stopLines() { if (subTimer) { clearInterval(subTimer); clearTimeout(subTimer); subTimer = null; } }
function hideSubtitles() { stopLines(); hide(el('subtitles')); }

/* ---------- echo panel ---------- */
function echoSay(text) {
  const p = el('echo-panel');
  show(p); requestAnimationFrame(() => p.classList.add('show'));
  el('echo-text').textContent = text;
}
function echoHide() { const p = el('echo-panel'); p.classList.remove('show'); }

/* ---------- quiz (Interaction B) ---------- */
function showQuiz() {
  openModal(`
    <div class="modal-kicker">MISSION CHECK · INTERACTIVE MOMENT</div>
    <div class="modal-title">${QUIZ.question}</div>
    <div id="quiz-opts">
      ${QUIZ.options.map((o, i) => `<button class="btn quiz-opt" data-q="${i}">${o}</button>`).join('')}
    </div>
    <div class="modal-body" id="quiz-expl" style="display:none"></div>
    <div class="modal-actions" id="quiz-actions" style="display:none"><button class="btn primary" data-close>CONTINUE THE STORY</button></div>
  `);
  document.querySelectorAll('[data-q]').forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.q;
      if (i === QUIZ.correct) {
        b.classList.add('correct');
        const ex = el('quiz-expl');
        ex.style.display = 'block';
        ex.textContent = QUIZ.explanation;
        el('quiz-actions').style.display = 'flex';
        document.querySelectorAll('[data-q]').forEach(x => (x.disabled = true));
      } else {
        b.classList.add('wrong');
        b.disabled = true;
      }
    };
  });
}

/* ---------- toast ---------- */
let toastTimer = null;
function toast(text) {
  const t = el('subtitle-text'); show(el('subtitles'));
  t.textContent = text;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hide(el('subtitles')), 2600);
}

/* ---------- modal ---------- */
function openModal(html) {
  const w = el('modal-wrap'), c = el('modal-card');
  c.innerHTML = html; show(w);
}
function closeModal() { hide(el('modal-wrap')); el('modal-card').innerHTML = ''; }
el('modal-wrap').addEventListener('click', (e) => { if (e.target.id === 'modal-wrap') closeModal(); });

function photoModal(photo, { title, body, actions = '' } = {}) {
  openModal(`
    <span class="media-tag nasa">AUTHENTIC NASA PHOTOGRAPH</span>
    ${title ? `<div class="modal-title">${title}</div>` : ''}
    <img src="${photo.src}" alt="NASA photograph" />
    <div class="media-credit">${photo.credit}<br/><a href="${photo.link}" target="_blank" rel="noopener">View original at images.nasa.gov ↗</a></div>
    ${body ? `<div class="modal-body">${body}</div>` : ''}
    <div class="modal-actions">${actions || '<button class="btn primary" data-close>CONTINUE</button>'}</div>
  `);
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-close]');
  if (b) closeModal();
});

function showInfoModal(title, text) {
  openModal(`
    <span class="media-tag cg">STYLIZED 3D RECREATION</span>
    <div class="modal-kicker">MACHINE DETAIL · DOCUMENTED PURPOSE</div>
    <div class="modal-title">${title}</div>
    <div class="modal-body">${text}</div>
    <div class="modal-actions"><button class="btn primary" data-close>BACK TO THE MACHINE</button></div>
  `);
}

/* ---------- title card ---------- */
let titleTimer = null;
function showTitle(kicker, main, sub, hold = 3000) {
  const c = el('title-card');
  el('title-kicker').textContent = kicker || '';
  el('title-main').textContent = main || '';
  el('title-sub').textContent = sub || '';
  show(c); requestAnimationFrame(() => c.classList.add('show'));
  if (titleTimer) clearTimeout(titleTimer);
  titleTimer = setTimeout(() => c.classList.remove('show'), hold);
}

/* ---------- scene nav ---------- */
function renderNav() {
  const nav = el('scene-nav');
  if (phase === 'welcome') { hide(nav); return; }
  show(nav);
  const idx = NAV_PHASES.findIndex(p => p.id === phase);
  const cur = NAV_PHASES[Math.max(0, idx)];
  el('nav-current').textContent = cur ? cur.name : '';
  const dots = el('nav-dots'); dots.innerHTML = '';
  NAV_PHASES.forEach((p, i) => {
    const d = document.createElement('button');
    d.className = 'nav-dot' + (p.id === phase ? ' active' : (i <= maxReached ? ' done' : ''));
    d.title = p.name;
    d.setAttribute('aria-label', p.name);
    d.disabled = i > maxReached;
    d.style.opacity = i > maxReached ? 0.25 : 1;
    d.onclick = () => { if (i <= maxReached) goTo(p.id); };
    dots.appendChild(d);
  });
  el('nav-prev').disabled = idx <= 0;
  el('nav-next').disabled = idx < 0 || idx >= Math.min(maxReached, NAV_PHASES.length - 1);
}
el('nav-prev').onclick = () => stepPhase(-1);
el('nav-next').onclick = () => stepPhase(1);
function stepPhase(d) {
  const idx = NAV_PHASES.findIndex(p => p.id === phase);
  const ni = idx + d;
  if (ni >= 0 && ni <= Math.min(maxReached, NAV_PHASES.length - 1)) goTo(NAV_PHASES[ni].id);
}
// swipe (pointer-based: mouse + touch)
let swipeStart = null;
addEventListener('pointerdown', (e) => { swipeStart = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });
addEventListener('pointerup', (e) => {
  if (!swipeStart) return;
  const dx = e.clientX - swipeStart.x, dy = e.clientY - swipeStart.y;
  const dt = performance.now() - swipeStart.t;
  swipeStart = null;
  if (Math.abs(dx) > 70 && Math.abs(dy) < 50 && dt < 600 && phase && phase.startsWith('ch')) {
    stepPhase(dx < 0 ? 1 : -1);
  }
}, { passive: true });

/* ---------- picking ---------- */
function pickables() {
  const arr = [];
  if (phase === 'space') arr.push(moonMarker, marsMarker);
  if (phase === 'approach') arr.push(svyMarker);
  if (phase === 'discover') arr.push(...hotspotMarkers.filter(m => m.visible));
  return arr;
}
canvas.addEventListener('pointerup', (e) => {
  if (Math.abs(e.movementX || 0) > 4 || Math.abs(e.movementY || 0) > 4) { /* drag */ }
  pointerNDC.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(pickables(), true);
  if (hits.length) {
    let o = hits[0].object;
    while (o && !o.userData.isMarker && !o.userData.action) o = o.parent;
    if (o && o.userData.action) o.userData.action();
  }
});

/* ---------- ambient audio (optional, off by default) ---------- */
let audioCtx = null, audioOn = false, audioNodes = null;
function toggleAudio() {
  const btn = el('btn-audio');
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioOn) {
    audioNodes.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
    setTimeout(() => { audioNodes && audioNodes.osc.stop(); audioNodes = null; }, 450);
    audioOn = false; btn.classList.add('off');
  } else {
    audioCtx.resume();
    const gain = audioCtx.createGain(); gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 1.2);
    const osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 55;
    const osc2 = audioCtx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = 82.5;
    const g2 = audioCtx.createGain(); g2.gain.value = 0.4;
    osc.connect(gain); osc2.connect(g2); g2.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc2.start();
    audioNodes = { osc, gain };
    audioOn = true; btn.classList.remove('off');
  }
}
el('btn-audio').classList.add('off');
el('btn-audio').onclick = toggleAudio;
el('btn-motion').onclick = () => {
  motionOn = !motionOn;
  el('btn-motion').querySelector('.ic-pause').classList.toggle('hidden', !motionOn);
  el('btn-motion').querySelector('.ic-play').classList.toggle('hidden', motionOn);
};

/* ============================== phases ============================== */
function clearPhase() {
  updaters.clear();
  hideSubtitles();
  echoHide();
  closeModal();
  hide(el('btn-skip'));
  controls.enabled = false;
  gWelcome.visible = gSpace.visible = gSurface.visible = gLaunch.visible = false;
  moonMarker.visible = marsMarker.visible = false;
  hotspotMarkers.forEach(m => (m.visible = false));
  el('hotspot-chips').classList.add('hidden'); el('hotspot-chips').classList.remove('on');
}

const svyMarker = pulseMarker();
svyMarker.visible = false;
const svyLbl = labelSprite('SURVEYOR 3 · SELECT');
svyLbl.position.set(0, 1.4, 0); svyMarker.add(svyLbl);
svyMarker.userData.action = () => goTo('discover');

const phaseEnter = {
  welcome() {
    gWelcome.visible = true;
    camera.position.set(0, 2.0, 11);
    controls.target.set(0, 1.5, 0);
    camera.lookAt(0, 1.5, 0);
    showTitle('R7LA · ECHOES', 'FIRST MISSION', 'AN INTERACTIVE EXPEDITION', 3400);
    // ship flyby
    ship.position.set(-18, 1.4, -8); ship.rotation.set(0, 0.45, 0.08);
    tween({
      dur: 6, ease: (t) => t, onUpdate: (k) => {
        ship.position.x = lerp(-18, -3.5, k);
        ship.position.y = 1.4 + Math.sin(k * Math.PI) * 1.2;
        ship.rotation.y = 0.45 + k * 0.35;
      }
    });
    // echo appears
    echoBot.visible = true;
    echoBot.scale.setScalar(0.001);
    tween({ delay: 2.2, dur: 0.9, ease: (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2), onUpdate: (k) => echoBot.scale.setScalar(Math.max(0.001, k)) });
    updaters.add((dt, t) => {
      echoBot.position.y = 0.7 + Math.sin(t * 1.6) * 0.12;
      echoBot.rotation.y = Math.sin(t * 0.5) * 0.4;
    });
    setTimeout(() => {
      echoSay(WELCOME_LINES[0]);
      playLines(WELCOME_LINES, {
        interval: 3400, onDone: () => {
          hideSubtitles();
          echoSay("Are you ready, Explorer?");
          openModal(`
            <div class="modal-kicker">R7LA · ECHOES EXPEDITION</div>
            <div class="modal-title">SURVEYOR 3 · THE MOON · 1967</div>
            <div class="modal-body">A cinematic journey to a real NASA machine still resting in the Ocean of Storms. Subtitles are always on; audio is optional.</div>
            <div class="modal-actions"><button class="btn primary" id="btn-start">START EXPLORING</button></div>
          `);
          el('btn-start').onclick = () => { closeModal(); goTo('space'); };
        }
      });
    }, 1600);
  },

  space() {
    gSpace.visible = true;
    moonMarker.visible = marsMarker.visible = true;
    const mScale = innerWidth < 720 ? 1.7 : 1;
    camera.position.set(33 * mScale, 10 * mScale, 24 * mScale);
    controls.target.set(20, 0, 2);
    camera.lookAt(20, 0, 2);
    controls.enabled = true;
    controls.enablePan = true;
    controls.minDistance = 8; controls.maxDistance = 80;
    showTitle('SCENE 02', 'SPACE EXPLORATION', 'DRAG TO LOOK · PINCH OR SCROLL TO ZOOM', 3200);
    echoSay('This is our neighborhood, Explorer. Distances are compressed so we can see everything at once. The Moon is ready — Mars and Earth are future stops.');
    playLines(['Select the Moon to begin our first expedition.'], { interval: 1000 });
    updaters.add((dt) => {
      if (motionOn) {
        earthOrbit.rotation.y += dt * 0.05;
        moonOrbit.rotation.y += dt * 0.3;
        marsOrbit.rotation.y += dt * 0.03;
        earth.rotation.y += dt * 0.12;
        mars.rotation.y += dt * 0.1;
        moon.rotation.y += dt * 0.06;
      }
      moonMarker.userData.ring.scale.setScalar(1 + Math.sin(performance.now() * 0.004) * 0.18);
    });
  },

  approach() {
    gSpace.visible = true;
    echoSay('');
    playLines(APPROACH_LINES, { interval: 3200 });
    // fly camera from free space toward the moon
    const startPos = camera.position.clone();
    const worldMoon = new THREE.Vector3();
    moon.getWorldPosition(worldMoon);
    const endPos = worldMoon.clone().add(new THREE.Vector3(3.4, 1.6, 4.6));
    controls.enabled = false;
    updaters.add((dt) => {
      if (motionOn) { earthOrbit.rotation.y += dt * 0.02; moonOrbit.rotation.y += dt * 0.1; }
    });
    tween({
      dur: 4.2, onUpdate: (k) => {
        const wm = new THREE.Vector3(); moon.getWorldPosition(wm);
        const end = wm.clone().add(new THREE.Vector3(3.4, 1.6, 4.6));
        camera.position.lerpVectors(startPos, end, k);
        camera.lookAt(wm);
      },
      onDone: () => {
        // place surveyor marker at real landing coords on the moon
        const p = latLonToVec3(-3.01, 336.66, 0.72);
        svyMarker.position.copy(p);
        svyMarker.scale.setScalar(0.35);
        moon.add(svyMarker);
        svyMarker.visible = true;
        updaters.add(() => { svyMarker.userData.ring.scale.setScalar(1 + Math.sin(performance.now() * 0.005) * 0.2); });
        camera.lookAt(new THREE.Vector3().copy(svyMarker.getWorldPosition(new THREE.Vector3())));
        showTitle('SCENE 03', 'OCEANUS PROCELLARUM', 'THE OCEAN OF STORMS · 3.01° S, 336.66° E', 3400);
      }
    });
  },

  discover() {
    gSurface.visible = true;
    svyMarker.visible = false;
    camera.position.set(4.6, 2.6, 6.2);
    controls.target.set(0, 1.4, 0);
    camera.lookAt(0, 1.4, 0);
    controls.enabled = true;
    controls.enablePan = false;
    controls.minDistance = 3; controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI * 0.55;
    sunLight.intensity = 2.4;
    showTitle('APRIL 1967 · OCEANUS PROCELLARUM, MOON', 'SURVEYOR 3', 'NASA LUNAR LANDER · JET PROPULSION LABORATORY', 4200);
    echoSay('A stylized 3D recreation stands before you — the real Surveyor 3 still rests at this site in the Ocean of Storms. Tap the glowing points to inspect its documented equipment.');
    playLines(['Surveyor 3 was sent to examine the Moon\'s surface before human lunar exploration. It photographed the terrain and used a mechanical sampler to investigate lunar soil.'], { interval: 1000 });
    hotspotMarkers.forEach(m => (m.visible = true));
    // touch-sized chips for small screens; 3D labels stay for desktop
    const chips = el('hotspot-chips');
    chips.innerHTML = '';
    for (const hs of lander.userData.hotspots) {
      const b = document.createElement('button');
      b.className = 'hotspot-chip'; b.textContent = hs.label;
      b.onclick = () => showInfoModal(hs.label, hs.text);
      chips.appendChild(b);
    }
    chips.classList.remove('hidden');
    chips.classList.toggle('on', smallScreen.matches);
    hotspotMarkers.forEach(mk => mk.children.forEach(ch => { if (ch.isSprite && ch.material.map && ch.scale.x > 1) ch.visible = !smallScreen.matches; }));
    updaters.add((dt) => {
      if (motionOn) skyEarth.rotation.y += dt * 0.05;
      hotspotMarkers.forEach(m => m.userData.ring.scale.setScalar(1 + Math.sin(performance.now() * 0.004 + m.position.x) * 0.2));
    });
    setTimeout(() => {
      openModal(`
        <div class="modal-kicker">MACHINE DISCOVERED</div>
        <div class="modal-title">SURVEYOR 3 · APRIL 1967</div>
        <div class="modal-body">Oceanus Procellarum — the Ocean of Storms. A robotic explorer that scouted the Moon before any human walked it. When you're ready, ECHO will take you back to launch day.</div>
        <div class="modal-actions">
          <button class="btn primary" id="btn-story">START THE STORY</button>
          <button class="btn" id="btn-photo">VIEW NASA PHOTOGRAPH</button>
        </div>
      `);
      el('btn-story').onclick = () => { closeModal(); goTo('ch1'); };
      el('btn-photo').onclick = () => {
        photoModal(NASA_PHOTOS.surface, {
          title: 'SURVEYOR 3 ON THE MOON',
          body: 'Photographed two years after landing, when Apollo 12 astronauts visited it.',
          actions: '<button class="btn" data-close>BACK</button><button class="btn primary" id="btn-story2">START THE STORY</button>',
        });
        el('btn-story2').onclick = () => { closeModal(); goTo('ch1'); };
      };
    }, 5200);
  },

  ch1() {
    gSpace.visible = true;
    const c = chapterOf('ch1');
    camera.position.set(4, 6, 34);
    controls.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    showTitle(c.kicker, c.title, 'CHAPTER 1 OF 7', 3600);
    playLines(c.lines, { interval: 3600 });
    updaters.add((dt) => {
      if (motionOn) { earthOrbit.rotation.y += dt * 0.02; moonOrbit.rotation.y += dt * 0.12; earth.rotation.y += dt * 0.1; }
    });
  },

  ch2() { startLaunchSequence(); },
  ch3() { startJourney(); },
  ch4() {
    gSurface.visible = true;
    const c = chapterOf('ch4');
    sunLight.intensity = 2.4;
    lm.visible = astro1.visible = astro2.visible = false;
    camera.position.set(3.4, 1.8, 4.4);
    controls.target.set(0.6, 1.0, 0.4);
    camera.lookAt(0.6, 1.0, 0.4);
    controls.enabled = true; controls.enablePan = false;
    controls.minDistance = 2.5; controls.maxDistance = 10; controls.maxPolarAngle = Math.PI * 0.55;
    showTitle(c.kicker, c.title, 'CHAPTER 4 OF 7', 3400);
    playLines(c.lines, { interval: 3600 });
    // scoop arm dig animation
    const arm = lander.userData.samplerArm;
    updaters.add((dt, t) => {
      if (motionOn) arm.rotation.y = Math.sin(t * 0.7) * 0.35;
    });
    setTimeout(() => {
      photoModal(NASA_PHOTOS.crater, {
        title: 'THE REAL SURVEYOR 3',
        body: 'Compare the recreation you just explored with the authentic machine, photographed in its crater by Apollo 12.',
        actions: '<button class="btn primary" id="btn-quiz">CONTINUE</button>',
      });
      el('btn-quiz').onclick = () => showQuiz();
    }, 9000);
  },
  ch5() {
    gSurface.visible = true;
    const c = chapterOf('ch5');
    camera.position.set(-4.2, 1.6, 5.2);
    controls.target.set(0, 1.6, 0);
    camera.lookAt(0, 1.6, 0);
    controls.enabled = true; controls.enablePan = false;
    controls.minDistance = 3; controls.maxDistance = 12; controls.maxPolarAngle = Math.PI * 0.55;
    showTitle(c.kicker, c.title, 'CHAPTER 5 OF 7', 3400);
    playLines(c.lines, { interval: 3800 });
    // dusk: dim the sun, raise the stars
    tween({ dur: 5, onUpdate: (k) => { sunLight.intensity = lerp(2.4, 0.25, k); rimLight.intensity = lerp(0.5, 0.9, k); } });
    updaters.add((dt) => { if (motionOn) gStars.rotation.y += dt * 0.02; });
  },
  ch6() {
    gSurface.visible = true;
    const c = chapterOf('ch6');
    tween({ dur: 2, onUpdate: (k) => { sunLight.intensity = lerp(sunLight.intensity, 2.2, k); } });
    camera.position.set(-5.5, 2.2, 7.5);
    controls.target.set(2, 1, -1.5);
    camera.lookAt(2, 1, -1.5);
    controls.enabled = true; controls.enablePan = false;
    controls.minDistance = 3; controls.maxDistance = 16; controls.maxPolarAngle = Math.PI * 0.55;
    openModal(`
      <div class="modal-kicker">CHAPTER 6 · NOVEMBER 1969</div>
      <div class="modal-title">TWO YEARS LATER…</div>
      <div class="modal-body">Another spacecraft has landed nearby — only about 600 feet away. Someone is walking toward the old robotic explorer.</div>
      <div class="modal-actions"><button class="btn gold" id="btn-apollo">DISCOVER APOLLO 12</button></div>
    `);
    el('btn-apollo').onclick = () => {
      closeModal();
      showTitle(c.kicker, c.title, 'CHAPTER 6 OF 7', 3600);
      lm.visible = true; astro1.visible = true; astro2.visible = true;
      // astronauts walk toward the lander
      tween({
        dur: 6, ease: (t) => t, onUpdate: (k) => {
          astro1.position.lerpVectors(new THREE.Vector3(7.4, 0.05, -4.6), new THREE.Vector3(1.6, 0.05, 0.9), k);
          astro2.position.lerpVectors(new THREE.Vector3(8.2, 0.05, -5.2), new THREE.Vector3(2.1, 0.05, 1.6), k);
          astro1.rotation.y = lerp(2.2, -2.4, k);
          astro2.rotation.y = lerp(2.0, -2.2, k);
        }
      });
      playLines(c.lines, {
        interval: 4000, onDone: () => {
          photoModal(NASA_PHOTOS.bean, {
            title: 'THE REUNION',
            body: 'Alan Bean examines Surveyor 3 — the Apollo 12 Lunar Module stands beyond. The astronauts retrieved its television camera and sampling equipment for study back on Earth. Surveyor 3 itself remains on the Moon.',
            actions: '<button class="btn primary" data-close>CONTINUE</button>',
          });
        }
      });
    };
  },
  ch7() {
    gSurface.visible = true;
    const c = chapterOf('ch7');
    camera.position.set(-3.2, 2.6, 8.6);
    controls.target.set(2.5, 1.2, -1.2);
    camera.lookAt(2.5, 1.2, -1.2);
    controls.enabled = true; controls.enablePan = false;
    controls.minDistance = 3; controls.maxDistance = 16; controls.maxPolarAngle = Math.PI * 0.55;
    showTitle(c.kicker, c.title, 'CHAPTER 7 OF 7', 3400);
    playLines(c.lines, {
      interval: 3600, onDone: () => {
        openModal(`
          <div class="modal-kicker">INTERACTIVE TIMELINE</div>
          <div class="modal-title">TWO MOMENTS, ONE SITE</div>
          <div class="modal-body">Select an event to revisit its scene.</div>
          <div class="modal-actions" style="flex-direction:column;align-items:stretch">
            ${TIMELINE.map((t, i) => `<button class="btn quiz-opt" data-tl="${i}"><strong style="color:var(--gold)">${t.date}</strong><br/>${t.label}</button>`).join('')}
          </div>
          <div class="modal-actions"><button class="btn primary" data-close>FINISH THE STORY</button></div>
        `);
        document.querySelectorAll('[data-tl]').forEach(b => {
          b.onclick = () => { closeModal(); goTo(TIMELINE[+b.dataset.tl].goto); };
        });
      }
    });
  },

  final() {
    gSpace.visible = true;
    camera.position.set(6, 5, 18);
    controls.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    controls.enabled = true;
    controls.minDistance = 8; controls.maxDistance = 80;
    echoBot.visible = true;
    updaters.add((dt, t) => {
      if (motionOn) { earthOrbit.rotation.y += dt * 0.05; moonOrbit.rotation.y += dt * 0.3; }
    });
    playLines(FINAL_LINES, {
      interval: 3400, onDone: () => {
        echoSay(FINAL_LINES[2]);
        openModal(`
          <div class="modal-kicker">EXPEDITION COMPLETE · SURVEYOR 3</div>
          <div class="modal-title">WHERE NEXT, EXPLORER?</div>
          <div class="modal-body">This was the first R7LA mission. More machines — on the Moon, Mars and beyond — are waiting to have their stories told.</div>
          <div class="modal-actions">
            <button class="btn primary" id="btn-explore">EXPLORE ANOTHER DESTINATION</button>
            <button class="btn" id="btn-replay">REPLAY SURVEYOR 3</button>
          </div>
        `);
        el('btn-explore').onclick = () => { closeModal(); goTo('space'); };
        el('btn-replay').onclick = () => { closeModal(); goTo('ch1'); };
      }
    });
  },
};

/* ---------- launch sequence (ch2) — continuous, no black cut ---------- */
let launchState = null;
function startLaunchSequence() {
  const c = chapterOf('ch2');
  gLaunch.visible = true;
  rocket.position.set(0, 0.32, 0);
  rocket.userData.flame.visible = false;
  rocket.userData.engineLight.intensity = 0;
  clouds.visible = false; clouds.position.y = 60;
  launchEarth.visible = false;
  smokeOn = false;
  scene.background = new THREE.Color(0x0d1420);
  gStars.visible = true;
  gStars.traverse(o => { if (o.material) o.material.opacity = 0.12; });
  camera.position.set(7.5, 1.4, 9);
  controls.target.set(0, 3.4, 0);
  show(el('btn-skip'));
  el('btn-skip').onclick = () => { goTo('ch3'); };
  showTitle(c.kicker, c.title, 'CAPE KENNEDY, FLORIDA', 3600);
  playLines(c.lines, { interval: 3600 });

  launchState = { t: 0, phase: 'pad' };
  // ignition at t=4
  setTimeout(() => {
    if (phase !== 'ch2') return;
    rocket.userData.flame.visible = true;
    smokeOn = true;
    tween({ dur: 1.6, onUpdate: (k) => { rocket.userData.engineLight.intensity = k * 60; } });
    launchState.phase = 'ignition';
  }, 4200);
  // liftoff at t=7
  setTimeout(() => { if (phase === 'ch2') launchState.phase = 'liftoff'; }, 7200);
  // clouds at ascent
  setTimeout(() => { if (phase === 'ch2') clouds.visible = true; }, 10000);

  updaters.add(function launchUpdate(dt, t) {
    if (!launchState) return;
    const ls = launchState;
    stepSmoke(dt);
    if (ls.phase === 'pad') {
      camera.position.x = 7.5 - t * 0.12;
      camera.lookAt(0, 3.4, 0);
    } else if (ls.phase === 'ignition') {
      camera.position.x += (Math.random() - 0.5) * 0.03;
      camera.position.y += (Math.random() - 0.5) * 0.03;
      camera.lookAt(0, 3.2, 0);
    } else if (ls.phase === 'liftoff') {
      ls.t += dt;
      const h = 0.5 * 2.2 * ls.t * ls.t; // accelerating
      rocket.position.y = 0.32 + h;
      // chase cam
      const cy = Math.max(1.6, rocket.position.y - 1.2);
      camera.position.set(camera.position.x * 0.995, lerp(camera.position.y, cy + 2.2, dt * 2), camera.position.z * 0.996);
      camera.lookAt(0, rocket.position.y + 2.5, 0);
      // sky darkens with altitude; stars brighten
      const alt = clamp(h / 55, 0, 1);
      const sky = new THREE.Color(0x0d1420).lerp(new THREE.Color(0x030a10), alt);
      scene.background = sky;
      gStars.traverse(o => { if (o.material) o.material.opacity = lerp(0.12, 1, alt); });
      if (h > 52 && !launchEarth.visible) {
        launchEarth.visible = true;
        smokeOn = false;
      }
      if (launchEarth.visible) {
        launchEarth.position.y = rocket.position.y - 95 - ls.t * 1.5;
        launchEarth.rotation.y += dt * 0.02;
      }
      if (h > 78) {
        // hand off, still in-scene: camera settles into orbit view looking down
        ls.phase = 'orbit';
        const p0 = camera.position.clone();
        const look0 = new THREE.Vector3(0, rocket.position.y, 0);
        tween({
          dur: 3.4, onUpdate: (k) => {
            camera.position.lerpVectors(p0, new THREE.Vector3(0, rocket.position.y + 26, 46), k);
            const lk = look0.clone().lerp(new THREE.Vector3(0, rocket.position.y - 40, 0), k);
            camera.lookAt(lk);
          },
          onDone: () => {
            hide(el('btn-skip'));
            showTitle('CHAPTER 3 · THREE DAYS LATER', 'THE JOURNEY TO THE MOON', 'APRIL 17 → APRIL 20, 1967', 3000);
            setTimeout(() => { if (phase === 'ch2') goTo('ch3'); }, 1600);
          }
        });
      }
    } else if (ls.phase === 'orbit') {
      rocket.position.y += dt * 6;
      launchEarth.position.y = rocket.position.y - 110;
    }
  });
}

/* ---------- journey (ch3) ---------- */
function startJourney() {
  const c = chapterOf('ch3');
  scene.background = new THREE.Color(0x030a10);
  gStars.traverse(o => { if (o.material) o.material.opacity = 1; });
  gSpace.visible = true;
  camera.position.set(16, 8, 30);
  controls.target.set(10, 0, 0);
  showTitle(c.kicker, c.title, 'CHAPTER 3 OF 7', 3400);
  playLines(c.lines, { interval: 3800 });
  // trajectory arc Earth -> Moon with traveling craft
  const ew = new THREE.Vector3(); earth.getWorldPosition(ew);
  const mw = new THREE.Vector3(); moon.getWorldPosition(mw);
  const mid = ew.clone().lerp(mw, 0.5).add(new THREE.Vector3(0, 9, 6));
  const curve = new THREE.QuadraticBezierCurve3(ew, mid, mw);
  const pts = curve.getPoints(80);
  const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineDashedMaterial({ color: 0xe4b44c, dashSize: 0.5, gapSize: 0.3, transparent: true, opacity: 0.85 }));
  arc.computeLineDistances();
  gSpace.add(arc);
  const traveler = buildEcho(1.4);
  gSpace.add(traveler);
  let k = 0;
  updaters.add((dt) => {
    if (motionOn && k < 1) {
      k = Math.min(1, k + dt * 0.05);
      const p = curve.getPoint(k);
      traveler.position.copy(p);
      traveler.rotation.y += dt * 2;
    }
    if (motionOn) { moonOrbit.rotation.y += dt * 0.1; earth.rotation.y += dt * 0.1; }
  });
  // cleanup arc when leaving ch3
  const cleanup = () => { gSpace.remove(arc); gSpace.remove(traveler); };
  setTimeout(() => { if (phase === 'ch3') { /* keep until nav */ } }, 1000);
  updaters.add(() => { if (phase !== 'ch3') cleanup(); });
}

/* ============================== goTo ============================== */
function goTo(id) {
  const def = PHASES.find(p => p.id === id);
  if (!def) return;
  clearPhase();
  phase = id;
  const navIdx = NAV_PHASES.findIndex(p => p.id === id);
  if (navIdx > maxReached) maxReached = navIdx;
  // sensible light reset per environment
  if (id !== 'ch5') { sunLight.intensity = 2.0; rimLight.intensity = 0.5; }
  phaseEnter[id] && phaseEnter[id]();
  renderNav();
  window.__phase = id;
}

/* ============================== render loop ============================== */
const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  updateTweens(dt);
  for (const u of [...updaters]) u(dt, t);
  if (controls.enabled) controls.update();
  if (motionOn && phase !== 'ch5') gStars.rotation.y += dt * 0.002;
  renderer.render(scene, camera);
}

/* ============================== start ============================== */
function boot() {
  el('loader-fill').style.width = '100%';
  el('loader-status').textContent = 'Expedition ready';
  const q = new URLSearchParams(location.search);
  const startScene = q.get('scene');
  const delay = startScene ? 80 : 600;
  setTimeout(() => {
    const L=el('loader'); L.classList.add('done'); setTimeout(()=>L.style.display='none',900);
    show(el('topbar'));
    goTo(startScene && PHASES.some(p=>p.id===startScene) ? startScene : 'welcome');
    window.__r7laBooted = true;
    const ov = q.get('overlay');
    if (ov === 'quiz') setTimeout(() => showQuiz(), 1500);
    if (ov === 'apollo') setTimeout(() => { const b = el('btn-apollo'); b && b.click(); }, 1200);
    if (ov === 'timeline') setTimeout(() => { /* wait for ch7 modal */ }, 100);
  }, delay);
}

// ECHO collapse toggle (mobile-safe layout)
const echoPanel = el('echo-panel');
const smallScreen = matchMedia('(max-width: 640px)');
function applyEchoDefault() { echoPanel.classList.toggle('collapsed', smallScreen.matches); }
smallScreen.addEventListener('change', applyEchoDefault);
applyEchoDefault();
el('echo-avatar').addEventListener('click', (e) => { e.stopPropagation(); echoPanel.classList.toggle('collapsed'); });
el('echo-avatar').style.cursor = 'pointer';

// testing hooks
window.__goto = goTo;
window.__moonScreen = () => {
  const v = new THREE.Vector3();
  moon.getWorldPosition(v); v.project(camera);
  return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, visible: v.z < 1 };
};
window.__modalOpen = () => !el('modal-wrap').classList.contains('hidden');
window.__phase = null;

boot();
frame();
