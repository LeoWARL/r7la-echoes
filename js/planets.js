// planets.js — stylized procedural planets. Solar-system layout is SCHEMATIC:
// distances and sizes are compressed for readability, not true scale or ephemeris.
// Named stars (stars.js) use real catalog positions.
import * as THREE from 'three';
import { canvasTexture } from './util.js';

function noisePatches(ctx, w, h, n, colors, rMin, rMax, seedStart = 7) {
  let seed = seedStart;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.globalAlpha = 0.25 + rand() * 0.5;
    ctx.beginPath();
    ctx.ellipse(rand() * w, rand() * h, rMin + rand() * (rMax - rMin), rMin + rand() * (rMax - rMin) * 0.7, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function makeEarth(r = 1) {
  const tex = canvasTexture(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0d3a5c'); g.addColorStop(0.5, '#10557f'); g.addColorStop(1, '#0b3350');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 26, ['#1f6b45', '#2a7d52', '#3d8a5c', '#c9b489'], 30, 120, 11); // continents
    noisePatches(ctx, w, h, 90, ['#ffffff', '#eef6fb'], 5, 26, 23); // clouds
    // polar caps
    ctx.fillStyle = 'rgba(240,248,252,0.9)';
    ctx.fillRect(0, 0, w, 22); ctx.fillRect(0, h - 22, w, 22);
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.05 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), mat);
  // atmosphere rim
  const atm = new THREE.Mesh(
    new THREE.SphereGeometry(r * 1.06, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x4d9fd1, transparent: true, opacity: 0.16, side: THREE.BackSide })
  );
  mesh.add(atm);
  return mesh;
}

export function makeMoon(r = 1) {
  const tex = canvasTexture(1024, 512, (ctx, w, h) => {
    ctx.fillStyle = '#8f8d89'; ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 240, ['#7a7874', '#6b6965', '#9c9a95', '#5d5b57'], 2, 26, 31); // craters/maria
    noisePatches(ctx, w, h, 12, ['#63615d'], 40, 90, 47); // maria
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
  return new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), mat);
}

export function makeMars(r = 1) {
  const tex = canvasTexture(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#b96b43'); g.addColorStop(0.5, '#c97a4e'); g.addColorStop(1, '#a85f3c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 40, ['#8f4c30', '#9c5436', '#d8916a'], 16, 70, 53);
    ctx.fillStyle = 'rgba(245,240,235,0.85)'; ctx.fillRect(0, 0, w, 14);
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
  return new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), mat);
}

export function makeSun(r = 1) {
  const tex = canvasTexture(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#ffd98a'); g.addColorStop(0.5, '#ffb84d'); g.addColorStop(1, '#ff9a2e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 60, ['#ffe9b8', '#e8912f'], 8, 30, 67);
  });
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(r, 48, 32),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: canvasTexture(256, 256, (ctx) => {
      const gg = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
      gg.addColorStop(0, 'rgba(255,190,90,0.85)'); gg.addColorStop(0.4, 'rgba(255,150,50,0.25)'); gg.addColorStop(1, 'rgba(255,150,50,0)');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, 256, 256);
    }),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  glow.scale.setScalar(r * 3.4);
  mesh.add(glow);
  const light = new THREE.PointLight(0xffe2b0, 2.2, 0, 0);
  mesh.add(light);
  return mesh;
}

// Lunar ground tile for surface scenes
export function makeLunarGround(size = 60, segs = 96) {
  const tex = canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#7e7c78'; ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 500, ['#6d6b67', '#8a8884', '#5c5a56', '#94928e'], 1, 18, 71);
    noisePatches(ctx, w, h, 40, ['#54524e'], 10, 40, 73);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  const p = geo.attributes.position;
  let seed = 91;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const d = Math.sqrt(x * x + y * y);
    p.setZ(i, (rand() - 0.5) * 0.14 + Math.sin(x * 0.35) * Math.cos(y * 0.3) * 0.22 + d * 0.004);
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}
