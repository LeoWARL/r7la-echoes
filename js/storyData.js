// storyData.js — all narration text and chapter content.
// Historical facts follow the NASA sources listed in README.md.
// ECHO's lines are fictional guide dialogue, never presented as historical quotation.

const STORY = {
  title: 'ECHOES OF SURVEYOR 3',
  tagline: 'The true story of the little robot that waited on the Moon — told in seven short chapters, at your pace.',
  meta: '7 CHAPTERS · ~4 MIN · NASA ARCHIVE PHOTOS',
  coverEcho: "I'm ECHO, your guide. Nothing moves on without you — tap when you're ready for more.",
  begin: 'BEGIN THE STORY',

  chapters: [
    {
      id: 'ch1', num: 1, name: 'THE MISSION', date: 'APRIL 1967',
      kicker: 'CHAPTER 1 OF 7 · WHY SEND A MACHINE?',
      title: 'BEFORE FOOTPRINTS, WHEELS AND LEGS',
      art: 'ch1',
      echo: "Before boots ever touched the Moon, we sent machines ahead. Here's why.",
      beats: [
        'Before astronauts could safely explore the Moon, scientists needed to understand its surface.',
        'NASA sent Surveyor 3 to investigate the terrain, photograph the surroundings, and examine the lunar soil.',
        'Its findings would help prepare for the human missions being planned right behind it.',
      ],
    },
    {
      id: 'ch2', num: 2, name: 'THE LAUNCH', date: 'APRIL 17, 1967',
      kicker: 'CHAPTER 2 OF 7 · CAPE KENNEDY, FLORIDA',
      title: 'LAUNCH DAY',
      art: 'ch2',
      echo: 'I still get chills at a countdown. Every single time.',
      beats: [
        'April 17, 1967. An Atlas-Centaur rocket stands ready at Cape Kennedy, Florida.',
        'Its payload: a three-legged robotic explorer named Surveyor 3.',
      ],
    },
    {
      id: 'ch3', num: 3, name: 'THE JOURNEY', date: 'APRIL 20, 1967',
      kicker: 'CHAPTER 3 OF 7 · THREE DAYS TO THE MOON',
      title: 'A CRATER IN THE OCEAN OF STORMS',
      art: 'ch3',
      echo: 'Three days from Florida to a crater with no name, in a sea with no water.',
      beats: [
        'Surveyor 3 launched on April 17, 1967, and flew for three days.',
        'On April 20 it landed in the Ocean of Storms — Oceanus Procellarum.',
        "Its landing site: about 3.01° South, 336.66° East, as recorded by NASA's NSSDC.",
      ],
    },
    {
      id: 'ch4', num: 4, name: 'THE WORK', date: 'APRIL–MAY 1967',
      kicker: 'CHAPTER 4 OF 7 · EXPLORING THE SURFACE',
      title: 'WHAT DID IT FIND?',
      art: 'ch4',
      echo: 'Six thousand photos and one busy little scoop. Tap the numbered markers to meet the machine.',
      hotspots: [
        { x: 50.0, y: 28, label: 'TELEVISION CAMERA',
          text: 'A television camera with a movable mirror transmitted more than 6,000 images of the lunar surface to Earth. Apollo 12 astronauts later removed it and brought it home for study.' },
        { x: 60.3, y: 50, label: 'SOLAR PANEL',
          text: 'A single photovoltaic panel on the mast powered the spacecraft through the lunar day, until NASA last heard from it on May 4, 1967.' },
        { x: 35.7, y: 80, label: 'SURFACE SAMPLER',
          text: 'A remote-controlled arm with a scoop dug trenches and tested the soil. Its measurements showed the ground could bear an Apollo Lunar Module.' },
        { x: 58.7, y: 88, label: 'LANDING LEGS',
          text: 'Three shock-absorbing legs with wide footpads cushioned the April 20, 1967 landing. Surveyor 3 actually bounced twice before settling.' },
      ],
      beats: [
        'Surveyor 3 photographed its surroundings and used a mechanical scoop to dig and examine lunar soil.',
        'It sent more than 6,000 images back to Earth.',
        "Its surface experiments helped scientists judge whether the Moon's terrain could support an Apollo Lunar Module.",
      ],
    },
    {
      id: 'ch5', num: 5, name: 'THE SILENCE', date: 'MAY 4, 1967',
      kicker: 'CHAPTER 5 OF 7 · THE LAST SIGNAL',
      title: 'AND THEN, QUIET',
      art: 'ch5',
      echo: 'The quietest part of the story. Stay with me — it gets better.',
      beats: [
        'Surveyor 3 kept operating after its landing, through the lunar day.',
        'NASA last communicated with the spacecraft on May 4, 1967.',
        'The mission was over, but the machine stayed where it landed — for more than two years.',
      ],
    },
    {
      id: 'ch6', num: 6, name: 'THE VISITORS', date: 'NOVEMBER 20, 1969',
      kicker: 'CHAPTER 6 OF 7 · AN UNEXPECTED REUNION',
      title: 'SOMEONE CAME BACK',
      art: 'ch6',
      photo: 'bean',
      echo: 'Two years of silence — then footsteps, only 600 feet away. I love this part.',
      beats: [
        'In November 1969, another NASA mission arrived at the Moon: Apollo 12.',
        'It landed in the Ocean of Storms, only about 600 feet from Surveyor 3.',
        'Astronauts Charles Conrad and Alan Bean walked over to the old robotic explorer.',
        'They photographed it and retrieved several of its components — including its television camera and sampling equipment — which returned to Earth for study. Surveyor 3 itself remains on the Moon.',
      ],
    },
    {
      id: 'ch7', num: 7, name: 'THE LEGACY', date: 'ONE SITE, TWO ERAS',
      kicker: "CHAPTER 7 OF 7 · A MACHINE'S LEGACY",
      title: 'MORE THAN A MACHINE',
      art: 'ch7',
      photo: 'surface',
      echo: 'One little machine, visited by history twice.',
      beats: [
        'Surveyor 3 helped scientists understand the lunar environment before humans explored it.',
        'A machine sent to investigate the Moon became part of a later human mission.',
        'Its journey is how space exploration really works — discoveries made one mission at a time.',
      ],
    },
  ],

  epilogue: {
    kicker: 'EXPEDITION COMPLETE · SURVEYOR 3',
    title: 'YOU WALKED THE WHOLE STORY',
    echo: "From a Florida launchpad to a crater that got visitors — you saw it all. Thanks for staying to the end, Explorer.",
    facts: [
      ['APR 17, 1967', 'Launches from Cape Kennedy on an Atlas-Centaur'],
      ['APR 20, 1967', 'Lands in the Ocean of Storms (3.01° S, 336.66° E)'],
      ['MAY 4, 1967', 'Last signal received by NASA'],
      ['NOV 20, 1969', 'Apollo 12 astronauts visit and retrieve components'],
    ],
    quiz: {
      kicker: 'ECHO ASKS',
      question: 'What was Surveyor 3 sent to investigate?',
      options: ['The lunar surface and soil', 'The atmosphere of Jupiter', 'The surface of Mars'],
      correct: 0,
      right: "Exactly — it photographed the terrain and tested the ground with its scoop, to prepare for human missions.",
      wrong: 'Not quite — it was sent to study the Moon\u2019s surface and soil, to prepare for human missions.',
    },
    again: 'READ THE STORY AGAIN',
    more: 'This was the first R7LA mission. More machines — on the Moon, Mars and beyond — are waiting to have their stories told.',
  },

  photos: {
    bean: {
      src: 'assets/nasa/apollo12-bean-surveyor3.jpg',
      credit: 'NASA photo AS12-48-7134 · Astronaut Alan L. Bean examines Surveyor 3; the Apollo 12 Lunar Module beyond, November 20, 1969',
      link: 'https://images.nasa.gov/details/AS12-48-7134',
    },
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
    conrad: {
      src: 'assets/nasa/apollo12-conrad-eva.jpg',
      credit: 'NASA photo AS12-48-7149 · Astronaut Charles Conrad during lunar surface EVA, Apollo 12, November 1969',
      link: 'https://images.nasa.gov/details/as12-48-7149',
    },
  },
};
