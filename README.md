# R7LA · ECHOES — First Interactive Mission: Surveyor 3

A light, reader-led storytelling prototype about NASA's Surveyor 3 — the robotic
lander that scouted the Moon in 1967 and was visited by Apollo 12 astronauts two
years later. Built for school-age audiences; narrated by the robot guide ECHO.

**Run it:** serve this folder with any static server and open `index.html`.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step, no dependencies, no API keys, no backend. Plain HTML/CSS/JS
(~40 KB of code) plus four credited NASA photographs. Works on desktop and
mobile; text advances only when the reader asks (button, tap, swipe, arrow keys).

## Design

- **Reader-led pacing** — each chapter's text is split into short beats that
  advance only on the reader's action. Beat indicators, a "Chapter X of 7"
  label, and a top progress bar make it clear where you are and when a part
  is finished.
- **Clear beginning and end** — a cover screen opens the story and an
  epilogue closes it with a mission timeline, NASA archive photos, an optional
  quiz, and a replay button. Replay fully resets the story state.
- **Light visuals** — inline SVG line illustrations and credited NASA archive
  photography instead of a 3D engine. Subtle CSS motion (stars, flame, signal)
  with a pause/play control and `prefers-reduced-motion` support.
- **State lifecycle** — one immutable-style state object drives every screen;
  each render rebuilds the DOM from it, so back-navigation and replay cannot
  leak visuals or dialogue from later chapters.

## Accuracy notes

- Historical facts, dates, coordinates (3.01° S, 336.66° E), and component
  details follow the NASA sources below. Surveyor 3 is never described as the
  first Moon lander, and only its retrieved components — not the spacecraft —
  returned to Earth.
- Scene illustrations are stylized line art, not depictions of exact geometry.
  Authentic imagery appears only as credited NASA photography with source links.
- ECHO's dialogue is fictional guide narration, never presented as historical
  quotation.

## NASA photographs used (public domain, with source links)

- `assets/nasa/surveyor3-surface.jpg` — AS12-48-7110, Surveyor 3 photographed by
  Alan Bean (https://images.nasa.gov/details/as12-48-7110)
- `assets/nasa/surveyor3-crater.jpg` — AS12-48-7121, Surveyor 3 in its crater
  (https://images.nasa.gov/details/as12-48-7121)
- `assets/nasa/apollo12-bean-surveyor3.jpg` — AS12-48-7134, Alan Bean with
  Surveyor 3 (https://images.nasa.gov/details/AS12-48-7134)
- `assets/nasa/apollo12-conrad-eva.jpg` — AS12-48-7149, Charles Conrad on EVA
  (https://images.nasa.gov/details/as12-48-7149)

## Sources

- NASA NSSDC — Surveyor 3 mission record (launch/landing dates, coordinates)
- NASA — Apollo 12 mission history (landing ~600 ft from Surveyor 3, component
  retrieval, November 20, 1969 surface operations)
- NASA Images — the four photographs above

## Files

- `index.html` — shell (progress bar, top bar, app mount)
- `css/main.css` — all styling and animation
- `js/storyData.js` — every word of narration and chapter content
- `js/main.js` — state engine, rendering, navigation, inline SVG art
- `assets/` — R7LA logo and the four NASA photographs
