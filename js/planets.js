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
  const tex = canvasTexture(2048, 1024, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#082b47'); g.addColorStop(0.5, '#0d4a73'); g.addColorStop(1, '#07273f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // deep-ocean variation
    noisePatches(ctx, w, h, 60, ['#0a3a5c', '#0e5482', '#093352'], 60, 220, 5);
    // continents: layered irregular patches with coastline shading
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let c = 0; c < 14; c++) {
      const cx = rand() * w, cy = h * 0.18 + rand() * h * 0.64;
      const base = 40 + rand() * 110;
      for (let l = 0; l < 3; l++) {
        ctx.fillStyle = l === 0 ? '#173f2e' : (l === 1 ? '#1f6b45' : ['#2a7d52', '#3d8a5c', '#b8a06b'][Math.floor(rand() * 3)]);
        ctx.globalAlpha = l === 0 ? 0.9 : 0.75;
        for (let i = 0; i < 9; i++) {
          ctx.beginPath();
          ctx.ellipse(cx + (rand() - 0.5) * base * 1.6, cy + (rand() - 0.5) * base * 0.9,
            base * (0.32 + rand() * 0.42) * (1 - l * 0.18), base * (0.22 + rand() * 0.3) * (1 - l * 0.18), rand() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
    // cloud swirls
    noisePatches(ctx, w, h, 120, ['#ffffff', '#eef6fb'], 6, 30, 23);
    for (let i = 0; i < 26; i++) {
      let s2 = 97 + i; const r2 = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4 + r2() * 8; ctx.lineCap = 'round';
      ctx.beginPath();
      const x0 = r2() * w, y0 = r2() * h;
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(x0 + 60, y0 - 20, x0 + 120, y0 + 20, x0 + 200, y0 - 10);
      ctx.stroke();
    }
    // polar caps with soft edge
    const capT = ctx.createLinearGradient(0, 0, 0, 60);
    capT.addColorStop(0, 'rgba(245,250,253,0.95)'); capT.addColorStop(1, 'rgba(245,250,253,0)');
    ctx.fillStyle = capT; ctx.fillRect(0, 0, w, 60);
    const capB = ctx.createLinearGradient(0, h - 60, 0, h);
    capB.addColorStop(0, 'rgba(245,250,253,0)'); capB.addColorStop(1, 'rgba(245,250,253,0.95)');
    ctx.fillStyle = capB; ctx.fillRect(0, h - 60, w, 60);
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62, metalness: 0.08 });
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
  const tex = canvasTexture(2048, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#8a8885'; ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 14, ['#6e6c68', '#75736f'], 60, 170, 47); // maria
    // craters with rim and floor shading
    let seed = 31;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 420; i++) {
      const x = rand() * w, y = rand() * h, rr = 1.5 + rand() * 24;
      ctx.fillStyle = 'rgba(70,68,64,0.5)';
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(180,178,172,0.55)'; ctx.lineWidth = Math.max(1, rr * 0.18);
      ctx.beginPath(); ctx.arc(x - rr * 0.12, y - rr * 0.12, rr * 0.9, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke();
      ctx.strokeStyle = 'rgba(60,58,54,0.5)';
      ctx.beginPath(); ctx.arc(x, y, rr, Math.PI * 1.9, Math.PI * 0.9); ctx.stroke();
    }
    noisePatches(ctx, w, h, 200, ['#7a7874', '#9c9a95'], 1, 5, 91);
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
  return new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), mat);
}

export function makeMars(r = 1) {
  const tex = canvasTexture(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#a85a38'); g.addColorStop(0.5, '#c27146'); g.addColorStop(1, '#96522f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 30, ['#7e3f26', '#8f4c30'], 30, 130, 53); // dark maria
    noisePatches(ctx, w, h, 70, ['#9c5436', '#d8916a', '#b3653d'], 10, 50, 59);
    noisePatches(ctx, w, h, 160, ['#8a4527', '#c97a4e'], 2, 12, 61);
    const capM = ctx.createLinearGradient(0, 0, 0, 46);
    capM.addColorStop(0, 'rgba(248,244,240,0.95)'); capM.addColorStop(1, 'rgba(248,244,240,0)');
    ctx.fillStyle = capM; ctx.fillRect(0, 0, w, 46);
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
