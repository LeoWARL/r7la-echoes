// R7LA · ECHOES — reader-led story engine (v2, no WebGL).
// One state object drives everything; every screen re-renders from it.
// Nothing outlives its screen, so replay and back-navigation can't leak state.
(function () {
'use strict';

/* ---------- inline scene art (SVG line illustrations) ---------- */
const S = 'stroke="#39b9c9" fill="none" stroke-width="1.6"';
const G = 'stroke="#e4b44c" fill="none" stroke-width="1.6"';
const D = 'stroke="#c9d3dd" fill="none" stroke-width="1.2" opacity="0.55"';
function stars(n, w, h, seed) {
  let r = '', x = seed;
  const rnd = () => (x = (x * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const cx = (rnd() * w).toFixed(0), cy = (rnd() * h).toFixed(0), rr = (0.6 + rnd() * 1.3).toFixed(1);
    r += `<circle class="tw" style="animation-delay:${(rnd() * 4).toFixed(1)}s" cx="${cx}" cy="${cy}" r="${rr}" fill="#c9d3dd" opacity="${(0.25 + rnd() * 0.55).toFixed(2)}"/>`;
  }
  return r;
}
const ART = {
  ch1: `<svg viewBox="0 0 600 340" class="art">${stars(40, 600, 340, 11)}
    <circle cx="470" cy="180" r="58" fill="#0a1a27" ${S}/>
    <path d="M440 160 q20 -12 45 -4 M455 205 q25 10 50 -6" ${D}/>
    <circle cx="470" cy="180" r="58" ${S}/>
    <circle cx="130" cy="150" r="26" fill="#0a1a27" ${D}/>
    <circle cx="122" cy="143" r="5" ${D}/><circle cx="140" cy="158" r="3.5" ${D}/>
    <path d="M410 165 Q 270 60 160 140" stroke="#e4b44c" stroke-width="1.4" fill="none" stroke-dasharray="5 7"/>
    <circle class="drift" cx="285" cy="98" r="5" fill="#e4b44c"/>
    <text x="470" y="262" fill="#39b9c9" font-size="12" text-anchor="middle" letter-spacing="2" opacity="0.8">EARTH</text>
    <text x="130" y="200" fill="#c9d3dd" font-size="12" text-anchor="middle" letter-spacing="2" opacity="0.6">MOON</text></svg>`,
  ch2: `<svg viewBox="0 0 600 340" class="art">${stars(26, 600, 200, 22)}
    <line x1="40" y1="300" x2="560" y2="300" ${S}/>
    <rect x="288" y="120" width="24" height="140" fill="#0a1a27" ${S}/>
    <path d="M288 120 L300 84 L312 120" fill="#0a1a27" ${S}/>
    <path d="M288 260 L272 300 L288 300 Z M312 260 L328 300 L312 300 Z" fill="#0a1a27" ${S}/>
    <rect x="246" y="140" width="6" height="160" ${D}/><line x1="252" y1="170" x2="288" y2="170" ${D}/><line x1="252" y1="220" x2="288" y2="220" ${D}/>
    <path class="flame" d="M292 300 q-6 26 8 34 q14 -8 8 -34 Z" fill="#e4b44c" opacity="0.9"/>
    <path class="flame f2" d="M295 300 q-3 16 5 21 q8 -5 5 -21 Z" fill="#fff" opacity="0.8"/>
    <circle class="puff" cx="262" cy="292" r="10" fill="#c9d3dd" opacity="0.12"/>
    <circle class="puff p2" cx="338" cy="294" r="12" fill="#c9d3dd" opacity="0.12"/>
    <text x="300" y="66" fill="#e4b44c" font-size="13" text-anchor="middle" letter-spacing="3" opacity="0.9">ATLAS-CENTAUR · APR 17 1967</text></svg>`,
  ch3: `<svg viewBox="0 0 600 340" class="art">${stars(48, 600, 340, 33)}
    <circle cx="170" cy="160" r="86" fill="#0a1a27" ${D}/>
    <circle cx="140" cy="130" r="14" ${D}/><circle cx="200" cy="180" r="9" ${D}/><circle cx="165" cy="205" r="6" ${D}/>
    <path d="M470 300 Q 430 160 262 150" stroke="#e4b44c" stroke-width="1.4" fill="none" stroke-dasharray="5 7"/>
    <circle class="drift" cx="360" cy="196" r="5" fill="#e4b44c"/>
    <circle cx="470" cy="300" r="22" fill="#0a1a27" ${S}/>
    <path d="M262 150 l-14 -4 m14 4 l-4 -14" ${G}/>
    <text x="170" y="285" fill="#c9d3dd" font-size="12" text-anchor="middle" letter-spacing="2" opacity="0.7">OCEANUS PROCELLARUM</text></svg>`,
  ch4: `<svg viewBox="0 0 600 340" class="art">${stars(22, 600, 140, 44)}
    <path d="M40 300 q120 -18 260 -6 q160 12 260 -4" ${D}/>
    <ellipse cx="120" cy="292" rx="26" ry="6" ${D}/><ellipse cx="480" cy="288" rx="18" ry="5" ${D}/>
    <rect x="270" y="150" width="60" height="62" fill="#0a1a27" ${S}/>
    <line x1="282" y1="212" x2="248" y2="296" ${S}/><line x1="300" y1="212" x2="300" y2="300" ${S}/><line x1="318" y1="212" x2="352" y2="296" ${S}/>
    <ellipse cx="248" cy="299" rx="9" ry="3.4" ${S}/><ellipse cx="300" cy="303" rx="9" ry="3.4" ${S}/><ellipse cx="352" cy="299" rx="9" ry="3.4" ${S}/>
    <line x1="300" y1="150" x2="300" y2="104" ${S}/>
    <ellipse cx="300" cy="96" rx="17" ry="9" ${S}/>
    <rect x="336" y="158" width="52" height="26" fill="#0a1a27" ${S}/>
    <path class="scoop" d="M270 190 Q 218 220 214 268" ${G}/>
    <path class="scoop" d="M214 268 l-8 10 l14 4 Z" fill="#e4b44c"/>
    <text x="300" y="66" fill="#39b9c9" font-size="13" text-anchor="middle" letter-spacing="3" opacity="0.9">6,000+ IMAGES · SOIL SCOOP</text></svg>`,
  ch5: `<svg viewBox="0 0 600 340" class="art">${stars(70, 600, 340, 55)}
    <path d="M40 300 q120 -18 260 -6 q160 12 260 -4" ${D} opacity="0.3"/>
    <g opacity="0.45"><rect x="270" y="170" width="60" height="52" fill="#0a1a27" ${D}/>
    <line x1="282" y1="222" x2="252" y2="296" ${D}/><line x1="318" y1="222" x2="348" y2="296" ${D}/><line x1="300" y1="222" x2="300" y2="300" ${D}/>
    <line x1="300" y1="170" x2="300" y2="130" ${D}/><ellipse cx="300" cy="123" rx="15" ry="8" ${D}/></g>
    <g stroke="#e4b44c" stroke-width="1.6" fill="none" opacity="0.9">
      <path class="sig" d="M316 108 a22 22 0 0 1 14 12"/>
      <path class="sig s2" d="M326 94 a40 40 0 0 1 24 22"/>
      <line x1="330" y1="128" x2="356" y2="96" stroke-dasharray="4 5"/>
    </g>
    <text x="300" y="66" fill="#c9d3dd" font-size="13" text-anchor="middle" letter-spacing="3" opacity="0.75">LAST SIGNAL · MAY 4 1967</text></svg>`,
  ch6: `<svg viewBox="0 0 600 340" class="art">${stars(40, 600, 340, 66)}
    <path d="M40 300 q120 -18 260 -6 q160 12 260 -4" ${D}/>
    <rect x="200" y="180" width="52" height="46" fill="#0a1a27" ${S}/>
    <line x1="210" y1="226" x2="184" y2="292" ${S}/><line x1="226" y1="226" x2="226" y2="296" ${S}/><line x1="242" y1="226" x2="268" y2="292" ${S}/>
    <line x1="226" y1="180" x2="226" y2="142" ${S}/><ellipse cx="226" cy="135" rx="14" ry="7.5" ${S}/>
    <g ${D}><rect x="400" y="196" width="34" height="26"/><line x1="406" y1="222" x2="390" y2="290"/><line x1="428" y1="222" x2="444" y2="290"/><path d="M400 196 L417 172 L434 196"/></g>
    <path d="M390 268 Q 320 240 262 246" stroke="#e4b44c" stroke-width="1.4" fill="none" stroke-dasharray="2 8" stroke-linecap="round"/>
    <circle class="drift" cx="322" cy="248" r="4.4" fill="#e4b44c"/>
    <text x="330" y="96" fill="#e4b44c" font-size="13" text-anchor="middle" letter-spacing="3" opacity="0.9">APOLLO 12 · ONLY 600 FT AWAY</text></svg>`,
  ch7: `<svg viewBox="0 0 600 340" class="art">${stars(56, 600, 340, 77)}
    <path d="M40 300 q120 -18 260 -6 q160 12 260 -4" ${D}/>
    <rect x="274" y="180" width="52" height="46" fill="#0a1a27" ${S}/>
    <line x1="284" y1="226" x2="258" y2="292" ${S}/><line x1="300" y1="226" x2="300" y2="296" ${S}/><line x1="316" y1="226" x2="342" y2="292" ${S}/>
    <line x1="300" y1="180" x2="300" y2="142" ${S}/><ellipse cx="300" cy="135" rx="14" ry="7.5" ${S}/>
    <ellipse class="drift" cx="300" cy="216" rx="92" ry="106" stroke="#e4b44c" fill="none" stroke-width="1" stroke-dasharray="3 9" opacity="0.55"/>
    <line x1="150" y1="72" x2="450" y2="72" ${D}/>
    <circle cx="180" cy="72" r="5" fill="#39b9c9"/><circle cx="420" cy="72" r="5" fill="#e4b44c"/>
    <text x="180" y="52" fill="#39b9c9" font-size="12" text-anchor="middle" letter-spacing="2">1967</text>
    <text x="420" y="52" fill="#e4b44c" font-size="12" text-anchor="middle" letter-spacing="2">1969</text></svg>`,
};

/* ---------- state ---------- */
function freshState() {
  return { screen: 'cover', ch: 0, beat: 0, maxCh: 0, completed: false, motion: true, quizDone: false };
}
let state = freshState();
const totalBeats = STORY.chapters.reduce((a, c) => a + c.beats.length, 0);

const app = document.getElementById('app');
const bar = document.getElementById('progress-fill');

/* ---------- helpers ---------- */
function esc(s) { return s; } // all content is ours; no user/HTML injection source
function progress() {
  if (state.screen === 'cover') return 0;
  if (state.screen === 'epilogue') return 1;
  let done = 0;
  for (let i = 0; i < state.ch; i++) done += STORY.chapters[i].beats.length;
  return (done + state.beat + 1) / (totalBeats + 1);
}
function photoFig(key, extraClass) {
  const p = STORY.photos[key];
  return `<figure class="photo ${extraClass || ''}">
    <a href="${p.link}" target="_blank" rel="noopener" title="View at NASA Images">
      <img src="${p.src}" alt="${p.credit}" />
    </a>
    <figcaption><span class="nasa-tag">NASA ARCHIVE</span>${p.credit}</figcaption>
  </figure>`;
}
function echoRow(line) {
  return `<div class="echo-row"><div class="echo-orb"><div class="echo-eye"></div></div><p class="echo-line">${line}</p></div>`;
}
function beatDots(ch) {
  return `<div class="beat-dots">${ch.beats.map((_, i) =>
    `<span class="bdot${i < state.beat ? ' done' : i === state.beat ? ' now' : ''}"></span>`).join('')}</div>`;
}
function chapterDots() {
  return `<div class="ch-dots">${STORY.chapters.map((c, i) => {
    const locked = !state.completed && i > state.maxCh;
    return `<button class="cdot${i === state.ch && state.screen === 'chapter' ? ' now' : ''}${i < state.maxCh || state.completed ? ' done' : ''}" data-goto="${i}" ${locked ? 'disabled' : ''} aria-label="Chapter ${c.num}: ${c.name}"></button>`;
  }).join('')}</div>`;
}

/* ---------- screens ---------- */
function renderCover() {
  app.innerHTML = `
  <section class="screen cover">
    <img class="cover-logo" src="assets/logo.svg" alt="R7LA"/>
    <div class="cover-kicker">AN R7LA · ECHOES STORY</div>
    <h1 class="cover-title">${STORY.title}</h1>
    <p class="cover-tag">${STORY.tagline}</p>
    <div class="cover-meta">${STORY.meta}</div>
    ${echoRow(STORY.coverEcho)}
    <button class="btn primary big" id="btn-begin">${STORY.begin} ›</button>
    <div class="cover-note">Historical content follows NASA sources · Prototype, not affiliated with NASA</div>
  </section>`;
  document.getElementById('btn-begin').onclick = () => { state.screen = 'chapter'; state.ch = 0; state.beat = 0; state.maxCh = Math.max(state.maxCh, 0); render(); };
}

function renderChapter() {
  const ch = STORY.chapters[state.ch];
  const lastBeat = state.beat === ch.beats.length - 1;
  const lastChapter = state.ch === STORY.chapters.length - 1;
  const visual = ch.photo && state.beat >= ch.beats.length - 2
    ? photoFig(ch.photo)
    : `<div class="art-wrap">${ART[ch.art] || ART.ch1}${hotspotMarkers(ch)}</div>${hotspotCard(ch)}`;
  const btnLabel = lastBeat ? (lastChapter ? 'FINISH THE STORY' : 'NEXT CHAPTER ›') : 'CONTINUE';
  app.innerHTML = `
  <section class="screen chapter">
    <div class="ch-head">
      <div class="ch-kicker">${ch.kicker}</div>
      <div class="ch-date">${ch.date}</div>
    </div>
    <h2 class="ch-title">${ch.title}</h2>
    ${visual}
    ${echoRow(ch.echo)}
    <p class="beat-text" id="beat-text">${ch.beats[state.beat]}</p>
    ${beatDots(ch)}
    <button class="btn primary" id="btn-next">${btnLabel}</button>
    ${navHTML()}
  </section>`;
  document.getElementById('btn-next').onclick = next;
  app.querySelectorAll('[data-hs]').forEach(b => {
    b.onclick = () => { const i = +b.dataset.hs; state.hotspot = state.hotspot === i ? null : i; render(); };
  });
  bindNav();
}

function renderEpilogue() {
  const ep = STORY.epilogue;
  app.innerHTML = `
  <section class="screen epilogue">
    <div class="ch-kicker">${ep.kicker}</div>
    <h2 class="ch-title gold">${ep.title}</h2>
    ${echoRow(ep.echo)}
    <div class="facts-hint">TAP A DATE TO REVISIT THAT CHAPTER</div>
    <div class="facts">${ep.facts.map((f, i) => `<button class="fact" data-jump="${[1, 2, 4, 5][i]}"><div class="fact-date">${f[0]}</div><div class="fact-label">${f[1]}</div></button>`).join('')}</div>
    <div class="archive">
      <div class="archive-head">FROM THE NASA ARCHIVE</div>
      <div class="archive-grid">${photoFig('crater')}${photoFig('conrad')}</div>
    </div>
    <div class="quiz" id="quiz">
      <div class="quiz-kicker">${ep.quiz.kicker}</div>
      <div class="quiz-q">${ep.quiz.question}</div>
      <div class="quiz-opts">${ep.quiz.options.map((o, i) => `<button class="btn quiz-opt" data-q="${i}">${o}</button>`).join('')}</div>
      <div class="quiz-fb" id="quiz-fb"></div>
    </div>
    <p class="ep-more">${ep.more}</p>
    <div class="ep-actions">
      <button class="btn primary" id="btn-again">${ep.again}</button>
      ${chapterDots()}
    </div>
    <div class="cover-note">Photographs: NASA (public domain), credited above with source links · Historical text follows the sources in the project README</div>
  </section>`;
  document.getElementById('btn-again').onclick = () => { state = freshState(); applyMotion(); render(); };
  app.querySelectorAll('[data-q]').forEach(b => {
    b.onclick = () => {
      const ok = +b.dataset.q === ep.quiz.correct;
      app.querySelectorAll('[data-q]').forEach(x => x.disabled = true);
      b.classList.add(ok ? 'right' : 'wrong');
      document.getElementById('quiz-fb').textContent = ok ? ep.quiz.right : ep.quiz.wrong;
      state.quizDone = true;
    };
  });
  app.querySelectorAll('[data-goto]').forEach(b => {
    b.onclick = () => { state.hotspot = null; state.screen = 'chapter'; state.ch = +b.dataset.goto; state.beat = 0; render(); };
  });
  app.querySelectorAll('[data-jump]').forEach(b => {
    b.onclick = () => { state.hotspot = null; state.screen = 'chapter'; state.ch = +b.dataset.jump; state.beat = 0; render(); };
  });
}

function hotspotMarkers(ch) {
  if (!ch.hotspots) return '';
  return ch.hotspots.map((h, i) =>
    `<button class="hs-marker${state.hotspot === i && state.screen === 'chapter' ? ' open' : ''}" style="left:${h.x}%;top:${h.y}%" data-hs="${i}" aria-label="${h.label}">${i + 1}</button>`).join('');
}
function hotspotCard(ch) {
  if (!ch.hotspots || state.hotspot == null) return '';
  const h = ch.hotspots[state.hotspot];
  return `<div class="hs-card"><div class="hs-label">${h.label}</div><p class="hs-text">${h.text}</p></div>`;
}
function navHTML() {
  const ch = STORY.chapters[state.ch];
  const canPrev = state.ch > 0;
  const canNext = state.completed || state.ch < state.maxCh;
  return `<nav class="story-nav" aria-label="Chapter navigation">
    <button class="nav-arrow" id="nav-prev" ${canPrev ? '' : 'disabled'} aria-label="Previous chapter">‹</button>
    <div class="nav-mid">
      <div class="nav-label">CH${ch.num} · ${ch.name}</div>
      ${chapterDots()}
    </div>
    <button class="nav-arrow" id="nav-next" ${canNext ? '' : 'disabled'} aria-label="Next chapter">›</button>
  </nav>`;
}
function bindNav() {
  const p = document.getElementById('nav-prev'), n = document.getElementById('nav-next');
  if (p) p.onclick = prevChapter;
  if (n) n.onclick = () => { if (state.completed || state.ch < state.maxCh) { state.ch++; state.beat = 0; state.screen = 'chapter'; render(); } };
  app.querySelectorAll('.ch-dots [data-goto]').forEach(b => {
    b.onclick = () => { const i = +b.dataset.goto; if (state.completed || i <= state.maxCh) { state.hotspot = null; state.screen = 'chapter'; state.ch = i; state.beat = 0; render(); } };
  });
}

/* ---------- transitions ---------- */
function next() {
  state.hotspot = null;
  if (state.screen === 'cover') { state.screen = 'chapter'; render(); return; }
  if (state.screen !== 'chapter') return;
  const ch = STORY.chapters[state.ch];
  if (state.beat < ch.beats.length - 1) { state.beat++; render(); return; }
  // chapter finished
  if (state.ch > state.maxCh) state.maxCh = state.ch;
  if (state.ch === STORY.chapters.length - 1) {
    state.completed = true; state.screen = 'epilogue';
  } else {
    state.maxCh = Math.max(state.maxCh, state.ch + 1);
    state.ch++; state.beat = 0;
  }
  render();
}
function prevChapter() {
  state.hotspot = null;
  if (state.screen === 'chapter' && state.ch > 0) { state.ch--; state.beat = 0; render(); }
}
function prev() {
  if (state.screen === 'chapter' && state.beat > 0) { state.beat--; render(); }
  else prevChapter();
}

let popping = false;
function snapshot() {
  return { screen: state.screen, ch: state.ch, beat: state.beat, maxCh: state.maxCh, completed: state.completed, quizDone: state.quizDone };
}
function render() {
  bar.style.transform = `scaleX(${progress()})`;
  if (state.screen === 'cover') renderCover();
  else if (state.screen === 'chapter') renderChapter();
  else renderEpilogue();
  window.scrollTo(0, 0);
  if (!popping) history.pushState(snapshot(), '');
  syncHooks();
}
window.addEventListener('popstate', (e) => {
  popping = true;
  if (e.state && typeof e.state.ch === 'number') {
    const keepMotion = state.motion;
    state = Object.assign(freshState(), e.state);
    state.motion = keepMotion;
  } else {
    const keepMotion = state.motion;
    state = freshState(); state.motion = keepMotion;
  }
  render();
  popping = false;
});
history.replaceState(snapshot(), '');

/* ---------- motion toggle ---------- */
function applyMotion() {
  document.body.classList.toggle('motion-paused', !state.motion);
  document.getElementById('btn-motion').setAttribute('aria-pressed', String(!state.motion));
  document.getElementById('btn-motion').classList.toggle('paused', !state.motion);
}
document.getElementById('btn-motion').onclick = () => { state.motion = !state.motion; applyMotion(); };

/* ---------- keyboard + swipe ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
    const b = document.getElementById('btn-next') || document.getElementById('btn-begin');
    if (b) { e.preventDefault(); b.click(); }
  } else if (e.key === 'ArrowLeft') prev();
});
let tsX = 0, tsY = 0, tsT = 0;
document.addEventListener('touchstart', (e) => { const t = e.changedTouches[0]; tsX = t.clientX; tsY = t.clientY; tsT = e.timeStamp; }, { passive: true });
document.addEventListener('touchend', (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - tsX, dy = t.clientY - tsY;
  if (e.timeStamp - tsT > 800 || Math.abs(dx) < 48 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
  if (dx < 0) { const b = document.getElementById('btn-next') || document.getElementById('btn-begin'); if (b) b.click(); }
  else prev();
}, { passive: true });

/* ---------- test hooks ---------- */
function syncHooks() {
  window.__state = { screen: state.screen, ch: state.ch, beat: state.beat, maxCh: state.maxCh, completed: state.completed, quizDone: state.quizDone };
}
window.__next = () => { next(); return window.__state; };
window.__prev = () => { prev(); return window.__state; };
window.__goto = (i) => { if (state.completed || i <= state.maxCh) { state.screen = 'chapter'; state.ch = i; state.beat = 0; render(); } return window.__state; };
window.__reset = () => { state = freshState(); applyMotion(); render(); return window.__state; };

render();
window.__r7laBooted = true;
})();
