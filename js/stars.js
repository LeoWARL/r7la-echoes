// stars.js — real bright-star positions (RA/Dec, J2000) + faint procedural background.
// Named-star layout is astronomically real; faint background stars are decorative.
import * as THREE from 'three';

// [name, RA hours, Dec deg, magnitude]
const BRIGHT_STARS = [
  ['Sirius', 6.752, -16.716, -1.46], ['Canopus', 6.399, -52.696, -0.74],
  ['Arcturus', 14.261, 19.182, -0.05], ['Vega', 18.616, 38.784, 0.03],
  ['Capella', 5.278, 45.998, 0.08], ['Rigel', 5.242, -8.202, 0.13],
  ['Procyon', 7.655, 5.225, 0.34], ['Achernar', 1.629, -57.237, 0.46],
  ['Betelgeuse', 5.919, 7.407, 0.50], ['Hadar', 14.064, -60.373, 0.61],
  ['Altair', 19.846, 8.868, 0.76], ['Acrux', 12.443, -63.099, 0.76],
  ['Aldebaran', 4.599, 16.509, 0.86], ['Antares', 16.490, -26.432, 0.96],
  ['Spica', 13.420, -11.161, 0.97], ['Pollux', 7.755, 28.026, 1.14],
  ['Fomalhaut', 22.961, -29.622, 1.16], ['Deneb', 20.690, 45.280, 1.25],
  ['Mimosa', 12.795, -59.689, 1.25], ['Regulus', 10.140, 11.967, 1.35],
  ['Adhara', 6.977, -28.972, 1.50], ['Castor', 7.577, 31.888, 1.58],
  ['Gacrux', 12.519, -57.113, 1.64], ['Shaula', 17.560, -37.104, 1.62],
  ['Bellatrix', 5.418, 6.350, 1.64], ['Elnath', 5.438, 28.608, 1.65],
  ['Miaplacidus', 9.220, -69.717, 1.68], ['Alnilam', 5.604, -1.202, 1.69],
  ['Alnair', 22.137, -46.961, 1.74], ['Alnitak', 5.679, -1.943, 1.77],
  ['Alioth', 12.900, 55.960, 1.77], ['Dubhe', 11.062, 61.751, 1.79],
  ['Mirfak', 3.405, 49.861, 1.79], ['Wezen', 7.140, -26.393, 1.83],
  ['Sargas', 17.622, -42.998, 1.87], ['Kaus Australis', 18.403, -34.385, 1.85],
  ['Avior', 8.375, -59.510, 1.86], ['Alkaid', 13.792, 49.313, 1.86],
  ['Menkalinan', 5.992, 44.947, 1.90], ['Atria', 16.811, -69.028, 1.91],
  ['Alhena', 6.629, 16.399, 1.92], ['Peacock', 20.428, -56.735, 1.94],
  ['Alsephina', 8.745, -54.709, 1.96], ['Mirzam', 6.378, -17.956, 1.98],
  ['Alphard', 9.460, -8.659, 1.98], ['Polaris', 2.530, 89.264, 1.98], ['Gamma Cas', 0.945, 60.717, 2.47], ['Ruchbah', 1.430, 60.235, 2.68], ['Segin', 1.907, 63.670, 3.37],
  ['Hamal', 2.120, 23.463, 2.00], ['Algol', 3.136, 40.956, 2.12],
  ['Diphda', 0.726, -17.987, 2.04], ['Mizar', 13.399, 54.925, 2.04],
  ['Almach', 2.065, 42.330, 2.06], ['Caph', 0.153, 59.150, 2.27],
  ['Schedar', 0.675, 56.537, 2.24], ['Naos', 8.060, -40.003, 2.25],
  ['Alpheratz', 0.140, 29.091, 2.06], ['Rasalhague', 17.582, 12.560, 2.07],
  ['Kochab', 14.845, 74.156, 2.08], ['Saiph', 5.796, -9.670, 2.09],
  ['Denebola', 11.818, 14.572, 2.11], ['Merak', 11.031, 56.382, 2.37],
  ['Phecda', 11.897, 53.695, 2.44], ['Megrez', 12.257, 57.033, 3.31],
];

// a few recognizable constellation figures (star-name pairs)
const CONSTELLATION_LINES = [
  // Orion
  ['Betelgeuse', 'Bellatrix'], ['Betelgeuse', 'Alnitak'], ['Bellatrix', 'Alnilam'],
  ['Alnitak', 'Alnilam'], ['Alnilam', 'Saiph'], ['Alnitak', 'Rigel'], ['Saiph', 'Rigel'],
  // Ursa Major (Big Dipper)
  ['Dubhe', 'Merak'], ['Merak', 'Phecda'], ['Phecda', 'Megrez'], ['Megrez', 'Dubhe'],
  ['Megrez', 'Alioth'], ['Alioth', 'Mizar'], ['Mizar', 'Alkaid'],
  // Cassiopeia (W)
  ['Caph', 'Schedar'], ['Schedar', 'Gamma Cas'], ['Gamma Cas', 'Ruchbah'], ['Ruchbah', 'Segin'],
];

function raDecToVec(raHours, decDeg, r) {
  const ra = raHours * 15 * Math.PI / 180;
  const dec = decDeg * Math.PI / 180;
  return new THREE.Vector3(
    r * Math.cos(dec) * Math.cos(ra),
    r * Math.sin(dec),
    -r * Math.cos(dec) * Math.sin(ra)
  );
}

export function makeStarfield(radius = 900) {
  const group = new THREE.Group();
  group.name = 'starfield';

  // --- real bright stars ---
  const n = BRIGHT_STARS.length;
  const pos = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  const byName = {};
  BRIGHT_STARS.forEach(([name, ra, dec, mag], i) => {
    const v = raDecToVec(ra, dec, radius);
    pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    sizes[i] = Math.max(2.2, 7.5 - mag * 2.6);
    byName[name] = v;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.PointsMaterial({ color: 0xdfeaf2, size: 3.2, sizeAttenuation: false, transparent: true, opacity: 0.95 });
  group.add(new THREE.Points(geo, mat));

  // --- faint procedural background (decorative, seeded) ---
  let seed = 42;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const m = 2600;
  const bp = new Float32Array(m * 3);
  for (let i = 0; i < m; i++) {
    const u = rand() * 2 - 1, th = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u), rr = radius * (0.92 + rand() * 0.12);
    bp[i * 3] = rr * s * Math.cos(th);
    bp[i * 3 + 1] = rr * u;
    bp[i * 3 + 2] = rr * s * Math.sin(th);
  }
  const bgeo = new THREE.BufferGeometry();
  bgeo.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  const bmat = new THREE.PointsMaterial({ color: 0x9fb4c4, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.55 });
  group.add(new THREE.Points(bgeo, bmat));

  // --- constellation lines (subtle) ---
  const lp = [];
  for (const [a, b] of CONSTELLATION_LINES) {
    if (byName[a] && byName[b]) lp.push(byName[a], byName[b]);
  }
  if (lp.length) {
    const lgeo = new THREE.BufferGeometry().setFromPoints(lp);
    const lmat = new THREE.LineBasicMaterial({ color: 0x2b5262, transparent: true, opacity: 0.35 });
    group.add(new THREE.LineSegments(lgeo, lmat));
  }
  return group;
}
