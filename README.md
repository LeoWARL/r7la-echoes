# R7LA · ECHOES — First Interactive Mission: Surveyor 3

An interactive cinematic storytelling prototype for school-age audiences.
A visitor boards an exploration spacecraft with the robot guide ECHO, explores a
stylized space environment, selects the Moon, discovers NASA's Surveyor 3, and
experiences its verified historical story — from launch (April 17, 1967) to the
Apollo 12 reunion (November 20, 1969).

**Run it:** serve this folder with any static server and open `index.html`.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step. No API keys. No backend. Works on desktop and mobile browsers
(touch orbit, swipe between story chapters).

## What's inside

- 7-chapter cinematic story (Welcome → Space Exploration → Moon approach →
  Surveyor 3 discovery → 7 story chapters → Return to Exploration)
- Continuous launch sequence (pad → ignition → liftoff → cloud layer → orbit)
  with no black cut between scenes
- Detailed procedural 3D Surveyor 3 with four documented-equipment hotspots
  (TV camera, surface sampler scoop, landing legs, solar panel)
- Interactive mission quiz, Apollo 12 reveal, and clickable two-event timeline
- Compact ECHO companion UI, always-on subtitles, optional ambient audio
  (off by default), scene play/pause motion control
- Bottom scene navigation with dots, arrows, and left/right swipe
- Reduced-motion support via `prefers-reduced-motion`

## Accuracy notes

- Historical facts, dates, coordinates (3.01° S, 336.66° E), and component
  details follow the NASA sources below. Surveyor 3 is never described as the
  first Moon lander, and only its retrieved components — not the spacecraft —
  returned to Earth.
- **Named stars** use real catalog positions (RA/Dec, J2000) for ~60 of the
  brightest stars; faint background stars are decorative.
- **Planet distances and sizes in the space scene are schematic** (compressed
  for readability) and labeled as such in the experience. They are not true
  scale or ephemeris positions.
- All spacecraft and robots are **stylized 3D recreations**, labeled in the UI.
  Authentic imagery appears only as **credited NASA photography** with source
  links, tagged differently from recreations.
- ECHO's dialogue is fictional guide narration, never presented as historical
  quotation.

## NASA photographs used (public domain, with source links)

- AS12-48-7110 — Surveyor 3 photographed by Alan Bean, Nov 20, 1969
- AS12-48-7121 — Surveyor 3 in its crater, Apollo 12, Nov 1969
- AS12-48-7134 — Alan Bean with Surveyor 3, Apollo 12 LM beyond, Nov 20, 1969
- AS12-48-7149 — Charles Conrad during lunar EVA, Apollo 12, Nov 1969

## Historical sources

1. https://science.nasa.gov/mission/surveyor-3/
2. https://science.nasa.gov/resource/apollo-12-and-surveyor-3/
3. https://science.nasa.gov/solar-system/moon/footpads-and-footprints-humans-and-machine-meet-on-the-moon/
4. https://nssdc.gsfc.nasa.gov/planetary/lunar/surveyor.html
5. https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon/
6. https://ntrs.nasa.gov/citations/19710024418
7. https://images.nasa.gov/

## Dependencies

- three.js r160 — vendored locally in `js/vendor/` (MIT). No runtime CDN needed
  for the 3D engine.
- Google Fonts CDN (Space Grotesk, IBM Plex Mono) with system-font fallback;
  the experience degrades gracefully if fonts cannot load.

## Credits & license

- R7LA is an independent editorial project by AFTERLIGHT; not affiliated with
  or endorsed by NASA.
- Brand direction, story brief and revision notes: Leo / R7LA team.
- The R7LA logo mark here is an SVG recreation from the team's deck branding —
  replace `assets/logo.svg` with the original artwork when available.
- three.js © three.js authors, MIT license.
