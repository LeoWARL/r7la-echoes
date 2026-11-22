// models.js — detailed procedural models. All are STYLIZED 3D RECREATIONS,
// labeled as such in the UI; authentic imagery is shown as credited NASA photography.
import * as THREE from 'three';
import { glowTexture } from './util.js';

const M = {
  metal: new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.42, metalness: 0.85 }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x4a4e55, roughness: 0.55, metalness: 0.7 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.6, metalness: 0.15 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd8a940, roughness: 0.32, metalness: 0.9 }),
  goldFoil: new THREE.MeshStandardMaterial({ color: 0xc9973a, roughness: 0.5, metalness: 0.75 }),
  black: new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.8, metalness: 0.3 }),
  panelBlue: new THREE.MeshStandardMaterial({ color: 0x16324e, roughness: 0.35, metalness: 0.6, emissive: 0x0a1c2c, emissiveIntensity: 0.4 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x86c5d8, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 }),
};

function cyl(r1, r2, h, mat, seg = 20) { return new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); }
function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
function sph(r, mat, w = 20, hseg = 14) { return new THREE.Mesh(new THREE.SphereGeometry(r, w, hseg), mat); }
function strut(a, b, r, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = cyl(r, r, len, mat, 8);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

/* =============== SURVEYOR 3 (3 m class lunar lander) =============== */
export function buildSurveyor3() {
  const g = new THREE.Group(); g.name = 'surveyor3';
  const hotspots = [];

  // -- triangular tubular frame (bus), ~1.4 m wide
  const tri = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    tri.push(new THREE.Vector3(Math.cos(a) * 0.72, 1.05, Math.sin(a) * 0.72));
  }
  for (let i = 0; i < 3; i++) {
    g.add(strut(tri[i], tri[(i + 1) % 3], 0.035, M.metal));
    g.add(strut(tri[i], tri[i].clone().setY(1.75), 0.03, M.metal));
  }
  const triTop = tri.map(v => v.clone().setY(1.75));
  for (let i = 0; i < 3; i++) g.add(strut(triTop[i], triTop[(i + 1) % 3], 0.035, M.metal));

  // -- thermal compartments (electronics boxes, white/gold insulation)
  const compA = box(0.62, 0.42, 0.5, M.white); compA.position.set(0.18, 1.28, 0.28); g.add(compA);
  const compB = box(0.55, 0.38, 0.45, M.goldFoil); compB.position.set(-0.28, 1.26, -0.2); g.add(compB);

  // -- three landing legs with crushable blocks + footpads
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const hip = new THREE.Vector3(Math.cos(a) * 0.72, 1.05, Math.sin(a) * 0.72);
    const foot = new THREE.Vector3(Math.cos(a) * 1.35, 0.12, Math.sin(a) * 1.35);
    g.add(strut(hip, foot, 0.045, M.metal));
    g.add(strut(hip.clone().setY(1.05), foot.clone().multiplyScalar(0.62).setY(0.55), 0.028, M.metalDark));
    const pad = cyl(0.16, 0.19, 0.07, M.metal); pad.position.copy(foot); g.add(pad);
    const block = box(0.14, 0.14, 0.14, M.metalDark); block.position.copy(foot).setY(0.32); g.add(block);
  }

  // -- vernier engines (3 small nozzles under frame)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const noz = cyl(0.05, 0.09, 0.18, M.metalDark);
    noz.position.set(Math.cos(a) * 0.45, 0.86, Math.sin(a) * 0.45);
    g.add(noz);
  }

  // -- central mast -> solar panel (top) + planar high-gain antenna
  const mast = cyl(0.045, 0.045, 1.15, M.metal); mast.position.y = 2.3; g.add(mast);
  const panel = box(1.15, 0.03, 0.85, M.panelBlue);
  panel.position.set(0.16, 2.92, 0); panel.rotation.z = -0.12; g.add(panel);
  // cell grid on panel
  const grid = new THREE.Group();
  for (let i = 1; i < 6; i++) { const l = box(0.004, 0.034, 0.85, M.tealLine || M.metalDark); l.position.set(-0.575 + i * 0.192, 0, 0); grid.add(l); }
  for (let i = 1; i < 4; i++) { const l = box(1.15, 0.034, 0.004, M.metalDark); l.position.set(0, 0, -0.425 + i * 0.2125); grid.add(l); }
  panel.add(grid);
  const antenna = cyl(0.34, 0.34, 0.02, M.white, 24);
  antenna.position.set(-0.3, 2.6, 0.12); antenna.rotation.set(0.5, 0, 0.9); g.add(antenna);

  // -- TV camera (cylindrical, hooded mirror) on frame edge
  const camBody = cyl(0.09, 0.09, 0.3, M.white); camBody.position.set(0.78, 1.55, 0.0); camBody.rotation.z = 0.5; g.add(camBody);
  const camHood = cyl(0.11, 0.13, 0.12, M.black); camHood.position.set(0.88, 1.68, 0.0); camHood.rotation.z = 0.5; g.add(camHood);
  const camLens = sph(0.045, M.glass); camLens.position.set(0.92, 1.73, 0); g.add(camLens);

  // -- surface sampler: pantograph arm + scoop (articulated, right side)
  const armBase = new THREE.Vector3(0.5, 1.0, 0.55);
  const arm = new THREE.Group(); arm.position.copy(armBase);
  const segA = strut(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.55, -0.35, 0.35), 0.03, M.metal);
  const segB = strut(new THREE.Vector3(0.55, -0.35, 0.35), new THREE.Vector3(0.95, -0.85, 0.55), 0.026, M.metal);
  const scoop = box(0.16, 0.07, 0.12, M.metalDark); scoop.position.set(0.98, -0.9, 0.58);
  const scoopJaw = box(0.16, 0.1, 0.02, M.metalDark); scoopJaw.position.set(0.98, -0.86, 0.64);
  arm.add(segA, segB, scoop, scoopJaw);
  g.add(arm);
  g.userData.samplerArm = arm;

  // -- alpha-scattering instrument head (deployed beside footpad)
  const alphaBox = box(0.16, 0.12, 0.16, M.goldFoil); alphaBox.position.set(-0.85, 0.1, 0.6); g.add(alphaBox);

  // -- omni antenna boom
  g.add(strut(new THREE.Vector3(0, 1.75, 0), new THREE.Vector3(0.5, 2.5, -0.35), 0.016, M.metalDark));
  const omni = sph(0.05, M.metal); omni.position.set(0.5, 2.52, -0.35); g.add(omni);

  hotspots.push(
    { id: 'camera', label: 'TELEVISION CAMERA', pos: new THREE.Vector3(0.9, 1.72, 0),
      text: 'Surveyor 3 carried a television camera with a movable mirror. It transmitted more than 6,000 images of the surrounding lunar surface back to Earth. Apollo 12 astronauts later removed this camera and returned it to Earth for scientific examination.' },
    { id: 'scoop', label: 'SURFACE SAMPLER', pos: new THREE.Vector3(1.48, 0.15, 1.13),
      text: 'A remotely operated mechanical arm with a scoop dug trenches and manipulated lunar soil. Its tests helped scientists measure the strength and bearing properties of the surface — key evidence that the ground could support an Apollo Lunar Module.' },
    { id: 'legs', label: 'LANDING LEGS', pos: new THREE.Vector3(1.17, 0.2, 0.67),
      text: 'Three shock-absorbing legs with wide footpads cushioned the April 20, 1967 soft landing in Oceanus Procellarum. Surveyor 3 actually bounced twice on touchdown before settling onto the surface.' },
    { id: 'solar', label: 'SOLAR PANEL', pos: new THREE.Vector3(0.16, 2.95, 0),
      text: 'A single photovoltaic panel on the central mast powered the spacecraft through the lunar day. When NASA last communicated with Surveyor 3 on May 4, 1967, the mission had completed its primary objectives.' },
  );
  g.userData.hotspots = hotspots;
  return g;
}

/* =============== ATLAS-CENTAUR class launcher (stylized) =============== */
export function buildRocket() {
  const g = new THREE.Group(); g.name = 'rocket';
  const H = 6;
  const booster = cyl(0.32, 0.32, H * 0.62, M.white, 24); booster.position.y = H * 0.31; g.add(booster);
  const inter = cyl(0.32, 0.32, H * 0.06, M.black, 24); inter.position.y = H * 0.65; g.add(inter);
  const centaur = cyl(0.3, 0.3, H * 0.18, M.metal, 24); centaur.position.y = H * 0.77; g.add(centaur);
  const fair = cyl(0.02, 0.3, H * 0.16, M.white, 24); fair.position.y = H * 0.94; g.add(fair);
  // Atlas balloon-tank banding + engine skirt
  for (let i = 1; i < 5; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.008, 8, 32), M.metalDark);
    ring.rotation.x = Math.PI / 2; ring.position.y = i * H * 0.12; g.add(ring);
  }
  const skirt = cyl(0.36, 0.4, 0.3, M.metalDark, 24); skirt.position.y = 0.15; g.add(skirt);
  // booster engines: central + two outboard bells
  for (const [x, z] of [[0, 0], [0.3, 0], [-0.3, 0]]) {
    const bell = cyl(0.05, 0.14, 0.3, M.metalDark, 16);
    bell.position.set(x, -0.08, z); g.add(bell);
  }
  // engine flame (hidden until ignition)
  const flame = new THREE.Group();
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.6, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.rotation.x = Math.PI; core.position.y = -1.0;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,180,80,0.9)', 'rgba(255,120,20,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(2.6); halo.position.y = -0.9;
  flame.add(core, halo); flame.visible = false;
  g.add(flame);
  g.userData.flame = flame;
  const engineLight = new THREE.PointLight(0xffa040, 0, 30, 1.6);
  engineLight.position.y = -1; g.add(engineLight);
  g.userData.engineLight = engineLight;
  return g;
}

/* =============== ECHO — compact robot companion =============== */
export function buildEcho(scale = 1) {
  const g = new THREE.Group(); g.name = 'echo';
  const body = sph(0.16, M.white); body.scale.y = 1.12; g.add(body);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.145, 24, 16, -Math.PI * 0.36, Math.PI * 0.72, Math.PI * 0.28, Math.PI * 0.42), M.black);
  visor.position.z = 0.035; g.add(visor);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x39b9c9 });
  const eyeL = sph(0.022, eyeMat); eyeL.position.set(-0.045, 0.02, 0.145); g.add(eyeL);
  const eyeR = sph(0.022, eyeMat); eyeR.position.set(0.045, 0.02, 0.145); g.add(eyeR);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 10, 40), new THREE.MeshStandardMaterial({ color: 0x39b9c9, emissive: 0x1a7a8c, emissiveIntensity: 1.2, roughness: 0.4 }));
  ring.rotation.x = Math.PI / 2.2; ring.position.y = -0.02; g.add(ring);
  const ant = cyl(0.006, 0.006, 0.1, M.metalDark); ant.position.set(0.08, 0.2, 0); g.add(ant);
  const antTip = sph(0.016, new THREE.MeshBasicMaterial({ color: 0xe4b44c })); antTip.position.set(0.08, 0.26, 0); g.add(antTip);
  const thr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(57,185,201,0.8)', 'rgba(57,185,201,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  thr.scale.setScalar(0.22); thr.position.y = -0.2; g.add(thr);
  g.scale.setScalar(scale);
  g.userData = { eyeMat, thr, baseY: 0 };
  return g;
}

/* =============== Visitor exploration spacecraft (stylized) =============== */
export function buildShip() {
  const g = new THREE.Group(); g.name = 'ship';
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x9aa8b5, roughness: 0.35, metalness: 0.85 });
  const hull = cyl(0.5, 0.72, 2.2, hullMat, 10); hull.rotation.z = Math.PI / 2; g.add(hull);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 10), hullMat);
  nose.rotation.z = -Math.PI / 2; nose.position.x = 1.55; g.add(nose);
  const cabin = sph(0.34, M.glass); cabin.scale.set(1.15, 0.7, 0.9); cabin.position.set(0.55, 0.4, 0); g.add(cabin);
  // side fins
  const finMat = new THREE.MeshStandardMaterial({ color: 0x0b7a8f, roughness: 0.45, metalness: 0.6 });
  for (const s of [-1, 1]) {
    const fin = box(0.9, 0.05, 0.65, finMat); fin.position.set(-0.8, 0, s * 0.85); fin.rotation.x = s * 0.15; g.add(fin);
  }
  const tail = box(0.55, 0.6, 0.06, finMat); tail.position.set(-1.0, 0.42, 0); g.add(tail);
  // engines
  for (const [y, z] of [[0.18, 0.3], [0.18, -0.3], [-0.16, 0]]) {
    const noz = cyl(0.1, 0.16, 0.3, M.metalDark, 12);
    noz.rotation.z = Math.PI / 2; noz.position.set(-1.15, y, z); g.add(noz);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(90,200,255,0.85)', 'rgba(40,120,255,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    gl.scale.setScalar(0.55); gl.position.set(-1.4, y, z); g.add(gl);
  }
  const stripe = box(2.0, 0.06, 1.0, new THREE.MeshStandardMaterial({ color: 0xe4b44c, roughness: 0.5, metalness: 0.4 }));
  stripe.position.y = -0.28; g.add(stripe);
  return g;
}

/* =============== Apollo Lunar Module (stylized) =============== */
export function buildLunarModule() {
  const g = new THREE.Group(); g.name = 'lm';
  const desc = box(1.1, 0.7, 1.1, M.goldFoil); desc.position.y = 0.95; g.add(desc);
  for (const [x, z] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) {
    const pan = box(0.32, 0.34, 0.32, Math.random() > 0.5 ? M.goldFoil : M.black);
    pan.position.set(x, 0.95, z); g.add(pan);
  }
  const asc = cyl(0.42, 0.5, 0.62, M.metal, 8); asc.position.y = 1.62; g.add(asc);
  const ascTop = sph(0.34, M.white); ascTop.scale.y = 0.75; ascTop.position.y = 2.0; g.add(ascTop);
  for (const s of [-1, 1]) {
    const win = box(0.16, 0.12, 0.02, M.black); win.position.set(s * 0.2, 1.72, 0.5); g.add(win);
  }
  const noz = cyl(0.1, 0.24, 0.35, M.metalDark, 14); noz.position.y = 0.5; g.add(noz);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const hip = new THREE.Vector3(Math.cos(a) * 0.55, 0.85, Math.sin(a) * 0.55);
    const foot = new THREE.Vector3(Math.cos(a) * 1.15, 0.06, Math.sin(a) * 1.15);
    g.add(strut(hip, foot, 0.035, M.metal));
    const pad = cyl(0.14, 0.17, 0.05, M.gold); pad.position.copy(foot); g.add(pad);
  }
  const dish = cyl(0.22, 0.22, 0.02, M.white, 20); dish.position.set(0, 2.32, 0.1); dish.rotation.x = -0.5; g.add(dish);
  return g;
}

/* =============== Astronaut (simple, friendly figure) =============== */
export function buildAstronaut() {
  const g = new THREE.Group(); g.name = 'astro';
  const suit = new THREE.MeshStandardMaterial({ color: 0xf0efe9, roughness: 0.7 });
  const torso = box(0.3, 0.4, 0.2, suit); torso.position.y = 0.85; g.add(torso);
  const helm = sph(0.14, suit); helm.position.y = 1.18; g.add(helm);
  const visor = sph(0.11, new THREE.MeshStandardMaterial({ color: 0xd8a940, roughness: 0.15, metalness: 0.9 }));
  visor.position.set(0, 1.18, 0.045); visor.scale.z = 0.75; g.add(visor);
  const pack = box(0.26, 0.34, 0.14, suit); pack.position.set(0, 0.9, -0.17); g.add(pack);
  for (const s of [-1, 1]) {
    const armL = cyl(0.05, 0.05, 0.34, suit, 10); armL.position.set(s * 0.2, 0.85, 0); armL.rotation.z = s * 0.25; g.add(armL);
    const leg = cyl(0.06, 0.07, 0.5, suit, 10); leg.position.set(s * 0.09, 0.35, 0); g.add(leg);
  }
  return g;
}

export const MATERIALS = M;
