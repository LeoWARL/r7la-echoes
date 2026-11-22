// storyData.js — all narration text. Historical facts follow the NASA sources
// listed in README.md. ECHO's lines are fictional guide dialogue and are never
// presented as historical quotation.

export const WELCOME_LINES = [
  "Welcome, Explorer! I'm ECHO, your exploration companion.",
  "Our mission is to discover the machines that helped humanity explore space.",
  "Some travelled to distant planets. Some landed on the Moon. Some have been silent for decades.",
  "Today, we're starting with a special discovery. Are you ready?",
];

export const APPROACH_LINES = [
  "We've arrived at the Moon!",
  "Before astronauts explored this surface, NASA sent robotic machines to understand what they would find.",
  "One of those machines was Surveyor 3. Let's discover its story.",
];

export const FINAL_LINES = [
  "That was Surveyor 3!",
  "It explored the Moon before humans arrived, and two years later, astronauts came back to study it.",
  "But there are many more stories waiting for us. Where should we explore next?",
];

export const CHAPTERS = [
  {
    id: 'ch1', num: 1, name: 'THE MISSION',
    title: 'WHY SEND A MACHINE TO THE MOON?',
    kicker: 'APRIL 1967 — A ROBOTIC EXPLORER ARRIVES',
    lines: [
      "Before astronauts could safely explore the Moon, scientists needed to understand its surface.",
      "NASA sent Surveyor 3 to investigate the terrain, photograph the surroundings, and examine the lunar soil.",
      "Its findings would help prepare for future human missions.",
    ],
  },
  {
    id: 'ch2', num: 2, name: 'THE LAUNCH',
    title: 'APRIL 17, 1967 — LAUNCH DAY',
    kicker: 'CHAPTER 2 · THE LAUNCH',
    lines: [
      "April 17, 1967. An Atlas-Centaur rocket stands ready at Cape Kennedy, Florida.",
      "Its payload: a three-legged robotic explorer named Surveyor 3.",
    ],
  },
  {
    id: 'ch3', num: 3, name: 'THE JOURNEY',
    title: 'THE JOURNEY TO THE MOON',
    kicker: 'CHAPTER 3 · THREE DAYS TO THE MOON',
    lines: [
      "Surveyor 3 launched on April 17, 1967.",
      "Three days later, on April 20, it successfully landed in the Ocean of Storms — Oceanus Procellarum.",
      "Its landing site: about 3.01° South, 336.66° East, as recorded by NASA's NSSDC.",
    ],
  },
  {
    id: 'ch4', num: 4, name: 'EXPLORING THE SURFACE',
    title: 'WHAT DID IT FIND?',
    kicker: 'CHAPTER 4 · EXPLORING THE SURFACE',
    lines: [
      "Surveyor 3 photographed its surroundings and used a mechanical scoop to examine lunar soil.",
      "It sent more than 6,000 images back to Earth.",
      "Its surface experiments helped scientists understand whether the Moon's terrain could support an Apollo Lunar Module.",
    ],
  },
  {
    id: 'ch5', num: 5, name: 'THE SILENCE',
    title: 'THE LAST SIGNAL',
    kicker: 'CHAPTER 5 · THE SILENCE',
    lines: [
      "Surveyor 3 continued operating after its landing.",
      "NASA last communicated with the spacecraft on May 4, 1967.",
      "Its mission had ended, but the machine remained on the Moon. For more than two years, it stayed at its landing site.",
    ],
  },
  {
    id: 'ch6', num: 6, name: 'AN UNEXPECTED VISITOR',
    title: 'APOLLO 12 RETURNS TO SURVEYOR 3',
    kicker: 'CHAPTER 6 · NOVEMBER 1969',
    lines: [
      "In November 1969, another NASA mission arrived at the Moon.",
      "Apollo 12 landed in the Ocean of Storms, only about 600 feet from Surveyor 3.",
      "Astronauts Charles Conrad and Alan Bean walked to the old robotic explorer.",
      "They photographed it and retrieved several of its components — including its television camera and sampling equipment — which returned to Earth for scientific examination.",
    ],
  },
  {
    id: 'ch7', num: 7, name: "A MACHINE'S LEGACY",
    title: 'MORE THAN A MACHINE',
    kicker: "CHAPTER 7 · A MACHINE'S LEGACY",
    lines: [
      "Surveyor 3 helped scientists understand the lunar environment before humans explored it.",
      "A machine sent to investigate the Moon became part of a later human mission.",
      "Its journey reminds us that space exploration is built through discoveries made one mission at a time.",
    ],
  },
];

export const QUIZ = {
  question: 'What was Surveyor 3 sent to investigate?',
  options: ['The lunar surface and soil', 'The atmosphere of Jupiter', 'The surface of Mars'],
  correct: 0,
  explanation: "Correct — Surveyor 3 was sent to investigate the Moon's surface and soil: photographing the terrain and testing the ground with its mechanical scoop, to help prepare for human missions.",
};

export const TIMELINE = [
  { date: 'APRIL 20, 1967', label: 'Surveyor 3 lands on the Moon', goto: 'ch3' },
  { date: 'NOVEMBER 20, 1969', label: 'Apollo 12 astronauts visit Surveyor 3 and retrieve components', goto: 'ch6' },
];

export const NASA_PHOTOS = {
  surface: {
    src: 'assets/nasa/surveyor3-surface.jpg',
    credit: 'NASA photo AS12-48-7110 · Surveyor 3 photographed by Apollo 12 astronaut Alan Bean, November 20, 1969',
    link: 'https://images.nasa.gov/details/as12-48-7110',
  },
  crater: {
    src: 'assets/nasa/surveyor3-crater.jpg',
    credit: 'NASA photo AS12-48-7121 · Surveyor 3 in its crater, Apollo 12 mission, November 1969',
    link: 'https://images.nasa.gov/details/as12-48-7121',
  },
  bean: {
    src: 'assets/nasa/apollo12-bean-surveyor3.jpg',
    credit: 'NASA photo AS12-48-7134 · Astronaut Alan L. Bean with Surveyor 3; Apollo 12 Lunar Module beyond, November 20, 1969',
    link: 'https://images.nasa.gov/details/AS12-48-7134',
  },
  conrad: {
    src: 'assets/nasa/apollo12-conrad-eva.jpg',
    credit: 'NASA photo AS12-48-7149 · Astronaut Charles Conrad during lunar surface EVA, Apollo 12, November 1969',
    link: 'https://images.nasa.gov/details/AS12-48-7149',
  },
};
