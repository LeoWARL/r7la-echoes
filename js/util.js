// util.js — helpers
import * as THREE from 'three';

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// Simple tween manager driven by the render loop
const tweens = new Set();
export function tween({ dur = 1, delay = 0, ease = easeInOut, onUpdate, onDone }) {
  const tw = { t: -delay, dur, ease, onUpdate, onDone, dead: false };
  tweens.add(tw);
  return tw;
}
export function updateTweens(dt) {
  for (const tw of tweens) {
    tw.t += dt;
    if (tw.t < 0) continue;
    const k = clamp(tw.t / tw.dur, 0, 1);
    tw.onUpdate && tw.onUpdate(tw.ease(k), k);
    if (k >= 1) { tweens.delete(tw); tw.onDone && tw.onDone(); }
  }
}
export function killTweens() { tweens.clear(); }

export function el(id) { return document.getElementById(id); }
export function show(node) { node.classList.remove('hidden'); }
export function hide(node) { node.classList.add('hidden'); }

// Canvas texture helper
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// lat/lon (deg, lon east) -> point on sphere radius r (Y up, lon 0 at +X, eastward CCW seen from +Y)
export function latLonToVec3(lat, lon, r) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lam = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    r * Math.cos(phi) * Math.cos(lam),
    r * Math.sin(phi),
    -r * Math.cos(phi) * Math.sin(lam)
  );
}

// soft round sprite texture for particles/glows
export function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  return canvasTexture(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
}
