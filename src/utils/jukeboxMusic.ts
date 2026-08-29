// Procedural Web Audio Synthesizer for Valkyrie Hologram Jukebox
import { initAudio } from './audio';

export interface JukeboxTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  category: 'SWING' | 'FLEET' | 'SYNTH' | 'ALIEN';
  description: string;
  bpm: number;
  color: string;
}

export const JUKEBOX_TRACKS: JukeboxTrack[] = [
  // ── Fleet Anthems & Star-Exploration Orchestral ─────────────────
  {
    id: 'final_frontier',
    title: 'Beyond the Final Frontier',
    artist: 'Star-Surveyor Exploratory Ensemble',
    genre: 'Classic Exploration Fanfare',
    category: 'FLEET',
    description: 'Iconic, soaring exploratory soprano & brass fanfare evoking the dawn of interstellar exploration.',
    bpm: 92,
    color: '#ffcc00',
  },
  {
    id: 'flagship_warp',
    title: 'Flagship Warp Vector',
    artist: 'Federation Philharmonic of Vega',
    genre: 'Majestic Warp Fanfare',
    category: 'FLEET',
    description: 'Heroic, sweeping brass theme with galloping rhythm and majestic galactic resolution.',
    bpm: 118,
    color: '#ff3333',
  },
  {
    id: 'deep_outpost',
    title: 'Deep Outpost Hymn',
    artist: 'Bajoran Chamber Collective',
    genre: 'Stately Station Symphony',
    category: 'FLEET',
    description: 'Noble, contemplative French horn hymn celebrating the lonely majesty of distant frontier space stations.',
    bpm: 74,
    color: '#6699ff',
  },
  {
    id: 'delta_odyssey',
    title: 'Delta Quadrant Odyssey',
    artist: 'Intrepid Stellar Wind Ensemble',
    genre: 'Heroic Quadrant Voyage',
    category: 'FLEET',
    description: 'Adventurous, sweeping orchestral horn leaps and driving rhythm across uncharted stellar sectors.',
    bpm: 106,
    color: '#00e5ff',
  },
  {
    id: 'khorvath_chant',
    title: 'Khorvath Warrior Anthem',
    artist: 'Imperial Warfleet Brass & Drums',
    genre: 'Martial Fleet Battle Hymn',
    category: 'FLEET',
    description: 'Heavy martial brass stabs, aggressive driving percussion, and proud warrior battle cadences.',
    bpm: 124,
    color: '#ff6600',
  },

  // ── Space Swing & Big Band ──────────────────────────────────────
  {
    id: 'boogie_droid',
    title: 'Dustcloud Boogie',
    artist: 'Zorblax & The Quad-Strummers',
    genre: 'Galactic Jump Boogie',
    category: 'SWING',
    description: 'High-octane 8-to-the-bar boogie-woogie with syncopated horn triplets and swinging snare.',
    bpm: 146,
    color: '#ffaa00',
  },
  {
    id: 'in_the_mood_orbit',
    title: 'Orbital Promenade',
    artist: 'Grand Archon Val-Kree',
    genre: 'Station Big Band Swing',
    category: 'SWING',
    description: 'Classic station big band swing featuring rolling brass riffs and smooth walking upright bass.',
    bpm: 132,
    color: '#00ffff',
  },
  {
    id: 'beyond_the_stars',
    title: 'Starlight Serenade',
    artist: 'Priestess Syl-Vera of Vega 9',
    genre: 'Cosmic Sweetheart Ballad',
    category: 'SWING',
    description: 'Tender, sentimental wartime carrier ballad echoing through the quiet observation decks.',
    bpm: 78,
    color: '#ff55ff',
  },
  {
    id: 'fighter_ace',
    title: 'Vanguard Squadron March',
    artist: 'High Command Brass Corps',
    genre: 'Fleet Aviator Fanfare',
    category: 'SWING',
    description: 'Triumphant brass fanfare with driving military snare cadence celebrating fighter victories.',
    bpm: 114,
    color: '#ff4444',
  },
  {
    id: 'sing_singularity',
    title: 'Singularity Stomp',
    artist: 'Klaatu & The Dark Matter Quintet',
    genre: 'High-Energy Pulsar Swing',
    category: 'SWING',
    description: 'Fiery 1940s-style swing powerhouse driven by pounding floor toms and roaring clarinet synth leads.',
    bpm: 154,
    color: '#00ff88',
  },

  // ── Retro Synthesizer & Space Lounge ─────────────────────────────
  {
    id: 'cantina',
    title: 'Mos Oasis Bop',
    artist: 'The Bitharian Five',
    genre: 'Outer-Rim Ragtime',
    category: 'SYNTH',
    description: 'Upbeat syncopated alien horn ragtime with walking bass and bouncy swing rhythm.',
    bpm: 138,
    color: '#ffbb33',
  },
  {
    id: 'red_dwarf',
    title: 'Jupiter Mining Hop',
    artist: 'Deck 16 Smelter Droids',
    genre: 'Retro Space-Hop',
    category: 'SYNTH',
    description: 'Catchy retro space-hop with punchy slap bass and optimistic brass synth arpeggios.',
    bpm: 122,
    color: '#33ccff',
  },
  {
    id: 'space_quest',
    title: 'Nebula Janitor Blues',
    artist: 'Two-Headed Xenon Duo',
    genre: '16-Bit Planetary FM',
    category: 'SYNTH',
    description: 'Quirky alien adventure funk with staccato FM chimes and playful synth leads.',
    bpm: 116,
    color: '#22ffaa',
  },
  {
    id: 'wing_commander',
    title: 'Terran Wing Suite',
    artist: 'Cruiser Orion Philharmonic',
    genre: 'Orchestral Space Opera',
    category: 'SYNTH',
    description: 'Heroic orchestral space opera brass fanfare with driving rhythmic timpani and snare.',
    bpm: 108,
    color: '#ff5555',
  },
  {
    id: 'cyber_chill',
    title: 'Neon Cyber-Drift',
    artist: 'Vektor-9 Synthesis Unit',
    genre: 'Cyberpunk Lo-Fi Ambient',
    category: 'SYNTH',
    description: 'Warm analog chords, smooth pentatonic lead, and relaxed lo-fi pulse for late night drinks.',
    bpm: 88,
    color: '#e066ff',
  },

  // ── Exotic & Atonal Alien Soundscapes ────────────────────────────
  {
    id: 'xylar_rite',
    title: 'Xylar-4 Hive Ceremony',
    artist: 'Xylar Drone Collective',
    genre: 'Atonal Xenobiology / Microtonal',
    category: 'ALIEN',
    description: 'Eerie, otherworldly microtonal frequency sweeps with dissonant tritones and erratic bio-clicks.',
    bpm: 94,
    color: '#bb33ff',
  },
  {
    id: 'glitch_subspace',
    title: 'Sub-Spacial Anomaly',
    artist: 'Entity Null-7',
    genre: 'Atonal Quantum Noise',
    category: 'ALIEN',
    description: 'Complex whole-tone clusters, resonant alien filter chirps, and strange asymmetrical pulses.',
    bpm: 128,
    color: '#00ffcc',
  },
];

// Note frequencies map (Hz)
const NOTE_FREQS: Record<string, number> = {
  G1: 49.00, Ab1: 51.91, A1: 55.00, Bb1: 58.27, B1: 61.74,
  C2: 65.41, Cs2: 69.30, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, Ab2: 103.83, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Ab5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
  C6: 1046.50, Cs6: 1108.73, D6: 1174.66, Eb6: 1244.51, E6: 1318.51, F6: 1396.91, Fs6: 1479.98, G6: 1567.98, Ab6: 1661.22, A6: 1760.00,
  
  // Microtonal / Atonal Alien Specific Frequencies
  X1: 93.18, X2: 121.45, X3: 171.22, X4: 242.15, X5: 351.84, X6: 497.66, X7: 703.88, X8: 995.42,
  Q1: 114.2, Q2: 161.5, Q3: 228.4, Q4: 323.0, Q5: 456.8, Q6: 646.0, Q7: 913.6,
  REST: 0,
};

type Note = [string, number]; // [noteName, durationInBeats]

interface TrackScore {
  bpm: number;
  melody: Note[];
  bass: Note[];
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  swing?: boolean;
  alienPercussion?: boolean;
}

const SCORES: Record<string, TrackScore> = {
  // ── Star Exploration / Fleet Anthems ────────────────────────────

  // 1. Beyond the Final Frontier (Classic Exploratory Fanfare)
  final_frontier: {
    bpm: 92,
    swing: false,
    leadWave: 'sine',
    bassWave: 'triangle',
    melody: [
      // Iconic soaring fifth leap & minor seventh exploratory theme
      ['Bb4', 1.0], ['F5', 1.5], ['Eb5', 0.5], ['D5', 2.0],
      ['C5', 1.0], ['Eb5', 1.0], ['G5', 1.5], ['F5', 0.5], ['D5', 2.0],
      ['G4', 1.0], ['Bb4', 1.5], ['C5', 0.5], ['D5', 2.0],
      ['Eb5', 1.0], ['C5', 1.0], ['F5', 2.5], ['REST', 0.5],
      // Second phrase
      ['Bb4', 1.0], ['F5', 1.5], ['Eb5', 0.5], ['D5', 2.0],
      ['G5', 1.5], ['F5', 0.5], ['Eb5', 1.0], ['D5', 1.0], ['C5', 2.0],
      ['Bb4', 3.0], ['REST', 1.0]
    ],
    bass: [
      ['Bb2', 2.0], ['D3', 2.0],
      ['G2', 2.0], ['Eb2', 2.0],
      ['Eb2', 2.0], ['F2', 2.0],
      ['Bb2', 2.0], ['F2', 2.0],
      ['Bb2', 2.0], ['D3', 2.0],
      ['Eb2', 2.0], ['F2', 2.0],
      ['Bb2', 3.0], ['REST', 1.0]
    ]
  },

  // 2. Flagship Warp Vector (Majestic Warp Fanfare)
  flagship_warp: {
    bpm: 118,
    swing: false,
    leadWave: 'sawtooth',
    bassWave: 'sawtooth',
    melody: [
      // Heroic rising French Horn / Trumpet fanfare
      ['C4', 0.5], ['G4', 1.0], ['C5', 1.5], ['B4', 0.5], ['A4', 1.0],
      ['G4', 1.0], ['F4', 0.5], ['G4', 0.5], ['A4', 1.0], ['G4', 2.0],
      ['E4', 0.5], ['G4', 0.5], ['C5', 1.0], ['D5', 1.5], ['E5', 0.5],
      ['D5', 2.0], ['G4', 2.0],
      // Triumph
      ['C5', 1.0], ['G5', 1.5], ['F5', 0.5], ['E5', 1.0], ['D5', 1.0],
      ['C5', 1.5], ['D5', 0.5], ['E5', 1.0], ['D5', 1.0], ['C5', 2.0],
      ['C5', 3.0], ['REST', 1.0]
    ],
    bass: [
      ['C2', 1.0], ['G2', 1.0], ['C3', 1.0], ['E3', 1.0],
      ['F2', 1.0], ['C3', 1.0], ['G2', 1.0], ['D3', 1.0],
      ['A2', 1.0], ['E3', 1.0], ['F2', 1.0], ['C3', 1.0],
      ['G2', 2.0], ['G2', 2.0],
      ['C2', 1.0], ['G2', 1.0], ['A2', 1.0], ['E3', 1.0],
      ['F2', 1.0], ['C3', 1.0], ['G2', 1.0], ['G2', 1.0],
      ['C2', 3.0], ['REST', 1.0]
    ]
  },

  // 3. Deep Outpost Hymn (Stately Frontier Station Symphony)
  deep_outpost: {
    bpm: 74,
    swing: false,
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    melody: [
      // Noble, contemplative French Horn solo
      ['D4', 1.5], ['A4', 1.5], ['B4', 1.0],
      ['G4', 2.0], ['F4', 1.0], ['G4', 1.0],
      ['A4', 2.0], ['D4', 2.0],
      ['F4', 1.5], ['G4', 0.5], ['A4', 1.0], ['C5', 1.0],
      ['B4', 2.5], ['REST', 0.5],
      // Resonant harmonic resolution
      ['D4', 1.5], ['A4', 1.5], ['D5', 1.0],
      ['C5', 1.5], ['B4', 0.5], ['A4', 1.0], ['G4', 1.0],
      ['F4', 1.5], ['G4', 0.5], ['E4', 2.0],
      ['D4', 3.0], ['REST', 1.0]
    ],
    bass: [
      ['D2', 2.0], ['G2', 2.0],
      ['E2', 2.0], ['B2', 2.0],
      ['F2', 2.0], ['D2', 2.0],
      ['G2', 2.0], ['A2', 2.0],
      ['D2', 2.0], ['F2', 2.0],
      ['G2', 2.0], ['C3', 2.0],
      ['A2', 2.0], ['A2', 2.0],
      ['D2', 3.0], ['REST', 1.0]
    ]
  },

  // 4. Delta Quadrant Odyssey (Sweeping Voyage Fanfare)
  delta_odyssey: {
    bpm: 106,
    swing: false,
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    melody: [
      // Rising fourths & fifths sweeping theme
      ['G4', 1.0], ['C5', 1.5], ['D5', 0.5], ['E5', 2.0],
      ['D5', 1.0], ['C5', 1.0], ['A4', 1.5], ['B4', 0.5], ['C5', 2.0],
      ['D5', 1.0], ['G4', 1.0], ['B4', 1.5], ['C5', 0.5], ['D5', 2.0],
      ['E5', 1.5], ['F5', 0.5], ['G5', 2.0],
      // Return
      ['C5', 1.0], ['E5', 1.0], ['G5', 1.5], ['F5', 0.5], ['E5', 1.0], ['D5', 1.0],
      ['C5', 1.5], ['D5', 0.5], ['E5', 1.0], ['D5', 1.0],
      ['C5', 3.0], ['REST', 1.0]
    ],
    bass: [
      ['C2', 1.0], ['G2', 1.0], ['C3', 1.0], ['E3', 1.0],
      ['F2', 1.0], ['C3', 1.0], ['A2', 1.0], ['E3', 1.0],
      ['G2', 1.0], ['D3', 1.0], ['B2', 1.0], ['G2', 1.0],
      ['C3', 1.0], ['G2', 1.0], ['C3', 2.0],
      ['C2', 1.0], ['G2', 1.0], ['F2', 1.0], ['C3', 1.0],
      ['G2', 1.0], ['D3', 1.0], ['G2', 2.0],
      ['C2', 3.0], ['REST', 1.0]
    ]
  },

  // 5. Khorvath Warrior Anthem (Martial Fleet Battle Hymn)
  khorvath_chant: {
    bpm: 124,
    swing: false,
    leadWave: 'sawtooth',
    bassWave: 'sawtooth',
    melody: [
      // Aggressive martial brass stabs
      ['D4', 1.0], ['D4', 0.5], ['A4', 1.0], ['Ab4', 0.5], ['G4', 1.0],
      ['F4', 1.0], ['D4', 2.0], ['REST', 0.5],
      ['D4', 0.5], ['F4', 0.5], ['G4', 0.5], ['Ab4', 1.0], ['A4', 1.0],
      ['D5', 1.5], ['C5', 0.5], ['A4', 2.0],
      // Battle Climax
      ['D5', 1.0], ['A4', 1.0], ['Ab4', 1.0], ['F4', 1.0],
      ['G4', 1.5], ['F4', 0.5], ['D4', 2.0],
      ['D4', 3.0], ['REST', 1.0]
    ],
    bass: [
      ['D2', 1.0], ['D2', 0.5], ['D2', 1.0], ['D2', 0.5], ['G2', 1.0],
      ['F2', 1.0], ['D2', 2.0], ['REST', 0.5],
      ['D2', 0.5], ['F2', 0.5], ['G2', 0.5], ['Ab2', 1.0], ['A2', 1.0],
      ['D3', 1.5], ['C3', 0.5], ['A2', 2.0],
      ['D2', 1.0], ['A2', 1.0], ['Ab2', 1.0], ['F2', 1.0],
      ['G2', 1.5], ['F2', 0.5], ['D2', 2.0],
      ['D2', 3.0], ['REST', 1.0]
    ]
  },

  // ── Space Swing & Big Band ──────────────────────────────────────

  // 6. Dustcloud Boogie (1940s Jump Boogie in C Major)
  boogie_droid: {
    bpm: 146,
    swing: true,
    leadWave: 'square',
    bassWave: 'triangle',
    melody: [
      ['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 1.0], ['E5', 0.5], ['C5', 1.0],
      ['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 1.0],
      ['C5', 0.5], ['C5', 0.5], ['A4', 0.5], ['C5', 0.5], ['D5', 0.5], ['Eb5', 0.5], ['E5', 1.0],
      ['G5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 0.5], ['C5', 1.5],
      ['F5', 0.5], ['F5', 0.5], ['D5', 0.5], ['F5', 0.5], ['G5', 0.5], ['Ab5', 0.5], ['A5', 1.0],
      ['C6', 0.5], ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], ['D5', 0.5], ['F5', 1.5],
      ['G5', 0.5], ['G5', 0.5], ['F5', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 0.5], ['G4', 0.5], ['A4', 0.5],
      ['C5', 0.5], ['D5', 0.5], ['Eb5', 0.5], ['E5', 0.5], ['C5', 1.5], ['REST', 0.5],
    ],
    bass: [
      ['C3', 0.5], ['E3', 0.5], ['G3', 0.5], ['A3', 0.5], ['Bb3', 0.5], ['A3', 0.5], ['G3', 0.5], ['E3', 0.5],
      ['C3', 0.5], ['E3', 0.5], ['G3', 0.5], ['A3', 0.5], ['Bb3', 0.5], ['A3', 0.5], ['G3', 0.5], ['E3', 0.5],
      ['C3', 0.5], ['E3', 0.5], ['G3', 0.5], ['A3', 0.5], ['Bb3', 0.5], ['A3', 0.5], ['G3', 0.5], ['E3', 0.5],
      ['C3', 0.5], ['E3', 0.5], ['G3', 0.5], ['A3', 0.5], ['Bb3', 0.5], ['A3', 0.5], ['G3', 0.5], ['E3', 0.5],
      ['F2', 0.5], ['A2', 0.5], ['C3', 0.5], ['D3', 0.5], ['Eb3', 0.5], ['D3', 0.5], ['C3', 0.5], ['A2', 0.5],
      ['F2', 0.5], ['A2', 0.5], ['C3', 0.5], ['D3', 0.5], ['Eb3', 0.5], ['D3', 0.5], ['C3', 0.5], ['A2', 0.5],
      ['G2', 0.5], ['B2', 0.5], ['D3', 0.5], ['F3', 0.5], ['F2', 0.5], ['A2', 0.5], ['C3', 0.5], ['Eb3', 0.5],
      ['C3', 0.5], ['E3', 0.5], ['G3', 0.5], ['A3', 0.5], ['C3', 1.5], ['REST', 0.5],
    ]
  },

  // 7. Orbital Promenade (1940s Big Band Swing)
  in_the_mood_orbit: {
    bpm: 132,
    swing: true,
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    melody: [
      ['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5],
      ['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5],
      ['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5],
      ['D5', 0.5], ['Eb5', 0.5], ['E5', 1.0], ['C5', 1.5], ['REST', 0.5],
      ['A4', 0.5], ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['B5', 0.5], ['A5', 0.5], ['F5', 0.5], ['D5', 0.5],
      ['A4', 0.5], ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['B5', 0.5], ['A5', 0.5], ['F5', 0.5], ['D5', 0.5],
      ['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5],
      ['G5', 0.5], ['F5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 1.5], ['REST', 0.5],
    ],
    bass: [
      ['C3', 1.0], ['E3', 1.0], ['G3', 1.0], ['A3', 1.0],
      ['C3', 1.0], ['E3', 1.0], ['G3', 1.0], ['A3', 1.0],
      ['C3', 1.0], ['E3', 1.0], ['G3', 1.0], ['A3', 1.0],
      ['C3', 1.0], ['E3', 1.0], ['G3', 1.0], ['C3', 1.0],
      ['F2', 1.0], ['A2', 1.0], ['C3', 1.0], ['D3', 1.0],
      ['F2', 1.0], ['A2', 1.0], ['C3', 1.0], ['F2', 1.0],
      ['C3', 1.0], ['E3', 1.0], ['G3', 1.0], ['A3', 1.0],
      ['G2', 1.0], ['B2', 1.0], ['D3', 1.0], ['C3', 1.0],
    ]
  },

  // 8. Starlight Serenade (Wartime Sweetheart Ballad)
  beyond_the_stars: {
    bpm: 78,
    swing: false,
    leadWave: 'sine',
    bassWave: 'triangle',
    melody: [
      ['G4', 1.0], ['B4', 1.5], ['D5', 0.5], ['E5', 1.5], ['D5', 0.5],
      ['B4', 2.0], ['A4', 1.0], ['G4', 1.0],
      ['E4', 1.0], ['G4', 1.5], ['A4', 0.5], ['B4', 1.5], ['A4', 0.5],
      ['G4', 2.5], ['REST', 0.5],
      ['G4', 1.0], ['B4', 1.5], ['D5', 0.5], ['E5', 1.5], ['D5', 0.5],
      ['B4', 2.0], ['D5', 1.0], ['B4', 1.0],
      ['A4', 1.5], ['B4', 0.5], ['A4', 1.0], ['G4', 1.0],
      ['G4', 3.0], ['REST', 1.0]
    ],
    bass: [
      ['G2', 2.0], ['B2', 2.0],
      ['E3', 2.0], ['C3', 2.0],
      ['A2', 2.0], ['D3', 2.0],
      ['G2', 3.0], ['REST', 1.0],
      ['G2', 2.0], ['B2', 2.0],
      ['E3', 2.0], ['C3', 2.0],
      ['D3', 2.0], ['D2', 2.0],
      ['G2', 3.0], ['REST', 1.0]
    ]
  },

  // 9. Vanguard Squadron March (Naval Aviator March)
  fighter_ace: {
    bpm: 114,
    swing: false,
    leadWave: 'sawtooth',
    bassWave: 'sawtooth',
    melody: [
      ['D4', 0.75], ['D4', 0.25], ['G4', 1.5], ['B4', 0.5], ['D5', 2.0],
      ['C5', 0.75], ['B4', 0.25], ['A4', 1.0], ['B4', 1.0], ['G4', 2.0],
      ['A4', 0.75], ['B4', 0.25], ['C5', 1.0], ['D5', 1.0], ['E5', 1.5], ['D5', 0.5],
      ['A4', 2.5], ['REST', 0.5],
      ['D5', 1.0], ['B4', 1.0], ['G4', 1.5], ['A4', 0.5], ['B4', 2.0],
      ['C5', 1.0], ['A4', 1.0], ['F4', 1.5], ['G4', 0.5], ['A4', 2.0],
      ['G4', 1.0], ['B4', 1.0], ['D5', 1.5], ['C5', 0.5], ['B4', 1.0], ['A4', 1.0],
      ['G4', 3.0], ['REST', 1.0]
    ],
    bass: [
      ['G2', 1.0], ['D3', 1.0], ['G2', 1.0], ['D3', 1.0],
      ['C3', 1.0], ['G2', 1.0], ['C3', 1.0], ['G2', 1.0],
      ['D3', 1.0], ['A2', 1.0], ['D3', 1.0], ['A2', 1.0],
      ['D3', 1.0], ['A2', 1.0], ['D2', 2.0],
      ['G2', 1.0], ['D3', 1.0], ['G2', 1.0], ['D3', 1.0],
      ['F2', 1.0], ['C3', 1.0], ['F2', 1.0], ['C3', 1.0],
      ['G2', 1.0], ['B2', 1.0], ['D3', 1.0], ['D2', 1.0],
      ['G2', 3.0], ['REST', 1.0]
    ]
  },

  // 10. Singularity Stomp (Benny Goodman Style Tom-Tom Swing)
  sing_singularity: {
    bpm: 154,
    swing: true,
    leadWave: 'square',
    bassWave: 'sawtooth',
    melody: [
      ['D4', 0.5], ['F4', 0.5], ['A4', 0.5], ['D5', 1.0], ['A4', 0.5], ['F4', 0.5], ['D4', 0.5],
      ['D4', 0.5], ['F4', 0.5], ['A4', 0.5], ['D5', 1.0], ['A4', 0.5], ['F4', 0.5], ['D4', 0.5],
      ['E4', 0.5], ['G4', 0.5], ['Bb4', 0.5], ['E5', 1.0], ['Bb4', 0.5], ['G4', 0.5], ['E4', 0.5],
      ['D4', 0.5], ['F4', 0.5], ['A4', 1.0], ['D5', 1.5], ['REST', 0.5],
      ['D5', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 1.0], ['G4', 0.5], ['F4', 0.5], ['D4', 0.5],
      ['F4', 0.5], ['G4', 0.5], ['A4', 1.0], ['C5', 1.0], ['D5', 2.0],
      ['D4', 0.5], ['F4', 0.5], ['G4', 0.5], ['A4', 0.5], ['D5', 2.5], ['REST', 0.5]
    ],
    bass: [
      ['D2', 0.5], ['D2', 0.5], ['F2', 0.5], ['A2', 0.5], ['D3', 0.5], ['A2', 0.5], ['F2', 0.5], ['D2', 0.5],
      ['D2', 0.5], ['D2', 0.5], ['F2', 0.5], ['A2', 0.5], ['D3', 0.5], ['A2', 0.5], ['F2', 0.5], ['D2', 0.5],
      ['G2', 0.5], ['G2', 0.5], ['Bb2', 0.5], ['D3', 0.5], ['G3', 0.5], ['D3', 0.5], ['Bb2', 0.5], ['G2', 0.5],
      ['A2', 0.5], ['A2', 0.5], ['C3', 0.5], ['E3', 0.5], ['D2', 1.5], ['REST', 0.5],
      ['D2', 0.5], ['D2', 0.5], ['F2', 0.5], ['A2', 0.5], ['C3', 0.5], ['A2', 0.5], ['F2', 0.5], ['D2', 0.5],
      ['G2', 0.5], ['Bb2', 0.5], ['C3', 0.5], ['D3', 0.5], ['D2', 2.0],
      ['D2', 1.0], ['F2', 1.0], ['A2', 1.0], ['D2', 1.0]
    ]
  },

  // ── Retro Synthesizers & Space Lounge ─────────────────────────────

  // 11. Mos Oasis Bop (Alien Ragtime Swing)
  cantina: {
    bpm: 138,
    swing: true,
    leadWave: 'square',
    bassWave: 'triangle',
    melody: [
      ['A4', 0.5], ['D5', 0.5], ['A4', 0.5], ['D5', 0.5], ['A4', 0.5], ['D5', 0.5], ['Ab4', 0.5], ['A4', 0.5],
      ['A4', 0.5], ['Ab4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['D4', 1.0], ['REST', 0.5],
      ['A4', 0.5], ['D5', 0.5], ['A4', 0.5], ['D5', 0.5], ['A4', 0.5], ['D5', 0.5], ['Ab4', 0.5], ['A4', 0.5],
      ['G4', 0.5], ['F4', 0.5], ['D4', 0.5], ['C4', 0.5], ['D4', 1.5], ['REST', 0.5],
      ['F4', 0.5], ['G4', 0.5], ['Ab4', 0.5], ['A4', 1.0], ['F4', 0.5], ['D4', 1.0], ['REST', 0.5],
      ['F4', 0.5], ['G4', 0.5], ['Ab4', 0.5], ['A4', 0.5], ['C5', 0.5], ['D5', 1.5], ['REST', 0.5],
    ],
    bass: [
      ['D3', 1.0], ['F3', 1.0], ['G3', 1.0], ['Ab3', 1.0],
      ['A3', 1.0], ['G3', 1.0], ['F3', 1.0], ['D3', 1.0],
      ['D3', 1.0], ['F3', 1.0], ['G3', 1.0], ['Ab3', 1.0],
      ['G3', 1.0], ['F3', 1.0], ['D3', 1.5], ['REST', 0.5],
      ['Bb2', 1.0], ['D3', 1.0], ['F3', 1.0], ['G3', 1.0],
      ['A2', 1.0], ['C3', 1.0], ['D3', 1.5], ['REST', 0.5],
    ]
  },

  // 12. Jupiter Mining Hop (Retro Space Funk)
  red_dwarf: {
    bpm: 122,
    swing: false,
    leadWave: 'sawtooth',
    bassWave: 'sawtooth',
    melody: [
      ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['A4', 1.0], ['G4', 0.5], ['E4', 1.0],
      ['C4', 0.5], ['D4', 0.5], ['E4', 0.5], ['D4', 1.5], ['REST', 0.5],
      ['E4', 0.5], ['G4', 0.5], ['A4', 0.5], ['C5', 1.0], ['B4', 0.5], ['A4', 0.5], ['G4', 0.5],
      ['E4', 0.5], ['G4', 0.5], ['A4', 1.0], ['C5', 1.5], ['REST', 0.5],
      ['D5', 0.5], ['C5', 0.5], ['A4', 0.5], ['G4', 1.0], ['E4', 0.5], ['C4', 1.5],
    ],
    bass: [
      ['C3', 0.5], ['C3', 0.5], ['E3', 0.5], ['G3', 0.5], ['A2', 0.5], ['A2', 0.5], ['C3', 0.5], ['E3', 0.5],
      ['D3', 0.5], ['D3', 0.5], ['F3', 0.5], ['A3', 0.5], ['G2', 0.5], ['G2', 0.5], ['B2', 0.5], ['D3', 0.5],
      ['C3', 0.5], ['C3', 0.5], ['E3', 0.5], ['G3', 0.5], ['F2', 0.5], ['F2', 0.5], ['A2', 0.5], ['C3', 0.5],
      ['G2', 0.5], ['G2', 0.5], ['B2', 0.5], ['D3', 0.5], ['C3', 1.5], ['REST', 0.5],
    ]
  },

  // 13. Nebula Janitor Blues (16-Bit Sierra Style FM Synth)
  space_quest: {
    bpm: 116,
    swing: false,
    leadWave: 'square',
    bassWave: 'triangle',
    melody: [
      ['D4', 0.5], ['F4', 0.5], ['A4', 0.75], ['D5', 0.25], ['C5', 1.0], ['A4', 0.5], ['F4', 0.5],
      ['G4', 0.5], ['Bb4', 0.5], ['D5', 1.0], ['C5', 0.5], ['A4', 1.0], ['REST', 0.5],
      ['D4', 0.5], ['F4', 0.5], ['A4', 0.5], ['C5', 0.5], ['D5', 0.75], ['F5', 0.25], ['E5', 1.0],
      ['D5', 0.5], ['Bb4', 0.5], ['G4', 0.5], ['A4', 1.5], ['D4', 1.0], ['REST', 0.5],
    ],
    bass: [
      ['D3', 0.5], ['D3', 0.5], ['A2', 0.5], ['D3', 0.5], ['C3', 0.5], ['C3', 0.5], ['G2', 0.5], ['C3', 0.5],
      ['G2', 0.5], ['G2', 0.5], ['D2', 0.5], ['G2', 0.5], ['A2', 0.5], ['A2', 0.5], ['E2', 0.5], ['A2', 0.5],
      ['D3', 0.5], ['D3', 0.5], ['A2', 0.5], ['D3', 0.5], ['Bb2', 0.5], ['Bb2', 0.5], ['F2', 0.5], ['Bb2', 0.5],
      ['G2', 0.5], ['G2', 0.5], ['A2', 1.0], ['D2', 1.5], ['REST', 0.5],
    ]
  },

  // 14. Terran Wing Suite (Orchestral Space March)
  wing_commander: {
    bpm: 108,
    swing: false,
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    melody: [
      ['D4', 1.0], ['D4', 0.5], ['D4', 0.5], ['G4', 2.0],
      ['D5', 1.5], ['C5', 0.5], ['B4', 1.0], ['C5', 1.0], ['D5', 2.0],
      ['B4', 1.0], ['G4', 1.0], ['A4', 1.5], ['B4', 0.5], ['C5', 1.0], ['A4', 1.0],
      ['G4', 2.5], ['REST', 0.5],
      ['D4', 1.0], ['G4', 1.0], ['B4', 1.5], ['C5', 0.5], ['D5', 2.0],
      ['E5', 1.5], ['D5', 0.5], ['C5', 1.0], ['B4', 1.0], ['A4', 2.0],
      ['G4', 3.0], ['REST', 1.0]
    ],
    bass: [
      ['G2', 1.0], ['G2', 0.5], ['G2', 0.5], ['G2', 2.0],
      ['G2', 1.0], ['B2', 1.0], ['C3', 1.0], ['D3', 1.0],
      ['E3', 1.0], ['C3', 1.0], ['D3', 1.0], ['D2', 1.0],
      ['G2', 2.0], ['G2', 1.0], ['REST', 1.0],
      ['G2', 1.0], ['B2', 1.0], ['D3', 1.0], ['G3', 1.0],
      ['C3', 1.0], ['E3', 1.0], ['D3', 1.0], ['D2', 1.0],
      ['G2', 3.0], ['REST', 1.0]
    ]
  },

  // 15. Neon Cyber-Drift (Lo-Fi Chill)
  cyber_chill: {
    bpm: 88,
    swing: false,
    leadWave: 'sine',
    bassWave: 'triangle',
    melody: [
      ['Eb4', 1.0], ['G4', 1.0], ['Bb4', 1.5], ['C5', 0.5], ['Bb4', 2.0],
      ['G4', 1.0], ['F4', 1.0], ['Eb4', 1.5], ['F4', 0.5], ['G4', 2.0],
      ['C5', 1.0], ['Bb4', 1.0], ['G4', 1.5], ['F4', 0.5], ['Eb4', 2.0],
      ['F4', 1.0], ['G4', 1.0], ['Bb4', 1.5], ['Eb4', 2.5], ['REST', 1.0]
    ],
    bass: [
      ['Eb2', 2.0], ['Bb2', 2.0],
      ['C2', 2.0], ['G2', 2.0],
      ['Ab2', 2.0], ['Eb2', 2.0],
      ['F2', 2.0], ['Bb2', 2.0]
    ]
  },

  // ── Exotic & Atonal Alien Soundscapes ────────────────────────────

  // 16. Xylar-4 Hive Ceremony (Atonal / Microtonal Alien Rite)
  xylar_rite: {
    bpm: 94,
    swing: false,
    alienPercussion: true,
    leadWave: 'sawtooth',
    bassWave: 'sine',
    melody: [
      ['X3', 0.75], ['X4', 0.25], ['X5', 1.0], ['X2', 0.5], ['X6', 1.5],
      ['X5', 0.5], ['X3', 0.5], ['X1', 1.0], ['X4', 1.0], ['REST', 0.5],
      ['X6', 0.75], ['X7', 0.25], ['X5', 0.5], ['X4', 1.5], ['X3', 0.5],
      ['X2', 1.0], ['X5', 0.5], ['X1', 2.0], ['REST', 1.0]
    ],
    bass: [
      ['X1', 2.0], ['X2', 2.0],
      ['X3', 1.5], ['X1', 2.5],
      ['X2', 2.0], ['X3', 2.0],
      ['X1', 3.0], ['REST', 1.0]
    ]
  },

  // 17. Sub-Spacial Anomaly (Atonal Whole-Tone Quantum Glitch)
  glitch_subspace: {
    bpm: 128,
    swing: false,
    alienPercussion: true,
    leadWave: 'triangle',
    bassWave: 'sawtooth',
    melody: [
      ['Q3', 0.25], ['Q4', 0.25], ['Q5', 0.5], ['Q6', 0.5], ['Q4', 0.5],
      ['Q7', 0.5], ['Q5', 0.25], ['Q3', 0.25], ['Q2', 1.0], ['REST', 0.5],
      ['Q6', 0.5], ['Q4', 0.25], ['Q5', 0.25], ['Q3', 0.5], ['Q7', 0.5],
      ['Q2', 0.5], ['Q4', 0.5], ['Q1', 1.5], ['REST', 0.5]
    ],
    bass: [
      ['Q1', 1.0], ['Q2', 1.0], ['Q3', 1.0], ['Q1', 1.0],
      ['Q2', 1.0], ['Q4', 1.0], ['Q1', 1.0], ['Q2', 1.0],
      ['Q3', 1.0], ['Q2', 1.0], ['Q1', 2.0]
    ]
  }
};

class JukeboxSynthesizer {
  private ctx: AudioContext | null = null;
  private jukeGain: GainNode | null = null;
  private isPlaying = false;
  private currentTrackId: string | null = null;
  private currentScore: TrackScore | null = null;
  private timerId: any = null;
  private step = 0;
  private melodyIdx = 0;
  private bassIdx = 0;
  private nextMelodyTime = 0;
  private nextBassTime = 0;
  private nextDrumTime = 0;
  private volume = 0.5;
  private onBeatCallbacks: Set<(beat: number, spectrum: number[]) => void> = new Set();
  private onTrackChangeCallbacks: Set<(trackId: string | null, isPlaying: boolean) => void> = new Set();

  private init() {
    initAudio();
    const win = window as any;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || win.webkitAudioContext)();
      this.jukeGain = this.ctx.createGain();
      this.jukeGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.jukeGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.jukeGain && this.ctx) {
      this.jukeGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public subscribeBeat(cb: (beat: number, spectrum: number[]) => void) {
    this.onBeatCallbacks.add(cb);
    return () => {
      this.onBeatCallbacks.delete(cb);
    };
  }

  public subscribeTrack(cb: (trackId: string | null, isPlaying: boolean) => void) {
    this.onTrackChangeCallbacks.add(cb);
    cb(this.currentTrackId, this.isPlaying);
    return () => {
      this.onTrackChangeCallbacks.delete(cb);
    };
  }

  private notifyTrackChange() {
    this.onTrackChangeCallbacks.forEach(cb => cb(this.currentTrackId, this.isPlaying));
  }

  public play(trackId: string) {
    this.init();
    if (!this.ctx || !this.jukeGain) return;

    if (this.currentTrackId === trackId && this.isPlaying) {
      return;
    }

    this.stop();

    const score = SCORES[trackId];
    if (!score) return;

    this.currentTrackId = trackId;
    this.currentScore = score;
    this.isPlaying = true;
    this.melodyIdx = 0;
    this.bassIdx = 0;
    this.step = 0;

    const now = this.ctx.currentTime + 0.1;
    this.nextMelodyTime = now;
    this.nextBassTime = now;
    this.nextDrumTime = now;

    this.notifyTrackChange();
    this.scheduleLoop();
  }

  public playRandom(excludeCurrent: boolean = true) {
    let pool = JUKEBOX_TRACKS;
    if (excludeCurrent && this.currentTrackId && pool.length > 1) {
      pool = pool.filter(t => t.id !== this.currentTrackId);
    }
    const rand = pool[Math.floor(Math.random() * pool.length)];
    this.play(rand.id);
  }

  public togglePlayPause(trackId?: string) {
    if (this.isPlaying) {
      if (trackId && trackId !== this.currentTrackId) {
        this.play(trackId);
      } else {
        this.pause();
      }
    } else {
      if (trackId) {
        this.play(trackId);
      } else if (this.currentTrackId) {
        this.resume();
      } else {
        this.play(JUKEBOX_TRACKS[0].id);
      }
    }
  }

  public nextTrack() {
    const currentIndex = JUKEBOX_TRACKS.findIndex(t => t.id === this.currentTrackId);
    const nextIndex = (currentIndex + 1) % JUKEBOX_TRACKS.length;
    this.play(JUKEBOX_TRACKS[nextIndex].id);
  }

  public prevTrack() {
    const currentIndex = JUKEBOX_TRACKS.findIndex(t => t.id === this.currentTrackId);
    const prevIndex = (currentIndex - 1 + JUKEBOX_TRACKS.length) % JUKEBOX_TRACKS.length;
    this.play(JUKEBOX_TRACKS[prevIndex].id);
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notifyTrackChange();
  }

  public resume() {
    if (this.currentTrackId && !this.isPlaying) {
      this.isPlaying = true;
      if (this.ctx) {
        const now = this.ctx.currentTime + 0.05;
        this.nextMelodyTime = now;
        this.nextBassTime = now;
        this.nextDrumTime = now;
        this.notifyTrackChange();
        this.scheduleLoop();
      }
    }
  }

  public stop() {
    this.isPlaying = false;
    this.currentTrackId = null;
    this.currentScore = null;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notifyTrackChange();
  }

  public getCurrentTrack(): string | null {
    return this.currentTrackId;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private scheduleLoop() {
    if (!this.isPlaying || !this.ctx || !this.currentScore) return;

    const ctx = this.ctx;
    const score = this.currentScore;
    const secPerBeat = 60 / score.bpm;
    const scheduleAheadTime = 0.25;

    const now = ctx.currentTime;

    // 1. Schedule Melody Notes
    while (this.nextMelodyTime < now + scheduleAheadTime) {
      const note = score.melody[this.melodyIdx];
      const noteName = note[0];
      const durationBeats = note[1];
      const durSec = durationBeats * secPerBeat;

      if (noteName !== 'REST' && NOTE_FREQS[noteName]) {
        this.playLeadNote(NOTE_FREQS[noteName], this.nextMelodyTime, durSec * 0.88, score.leadWave, score.alienPercussion);
      }

      this.nextMelodyTime += durSec;
      this.melodyIdx = (this.melodyIdx + 1) % score.melody.length;
    }

    // 2. Schedule Bass Notes
    while (this.nextBassTime < now + scheduleAheadTime) {
      const note = score.bass[this.bassIdx];
      const noteName = note[0];
      const durationBeats = note[1];
      const durSec = durationBeats * secPerBeat;

      if (noteName !== 'REST' && NOTE_FREQS[noteName]) {
        this.playBassNote(NOTE_FREQS[noteName], this.nextBassTime, durSec * 0.85, score.bassWave);
      }

      this.nextBassTime += durSec;
      this.bassIdx = (this.bassIdx + 1) % score.bass.length;
    }

    // 3. Schedule Drums / Percussion
    while (this.nextDrumTime < now + scheduleAheadTime) {
      const beatInBar = this.step % 4;
      
      if (score.alienPercussion) {
        // Alien bio-clicks & resonance bursts
        this.playAlienClick(this.nextDrumTime);
        if (beatInBar === 0 || beatInBar === 2) {
          this.playAlienThump(this.nextDrumTime);
        }
      } else {
        // Classic / Swing Drums
        if (beatInBar === 0 || beatInBar === 2) {
          this.playKick(this.nextDrumTime);
        }
        if (beatInBar === 1 || beatInBar === 3) {
          this.playSnare(this.nextDrumTime);
        }
        this.playHiHat(this.nextDrumTime);
        if (score.swing) {
          this.playHiHat(this.nextDrumTime + secPerBeat * 0.66);
        }
      }

      // Emit beat event for visualizer
      const spectrum = [
        Math.random() * 0.6 + (beatInBar === 0 ? 0.45 : 0.1),
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.75 + (beatInBar === 1 ? 0.35 : 0.1),
        Math.random() * 0.9 + 0.1,
        Math.random() * 0.55 + 0.3,
        Math.random() * 0.7 + 0.2,
      ];
      this.onBeatCallbacks.forEach(cb => cb(this.step, spectrum));

      this.nextDrumTime += secPerBeat;
      this.step++;
    }

    this.timerId = setTimeout(() => this.scheduleLoop(), 50);
  }

  // --- Instrument Synthesizers ---

  private playLeadNote(freq: number, startTime: number, duration: number, wave: OscillatorType, isAlien?: boolean) {
    if (!this.ctx || !this.jukeGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = wave;
    osc.frequency.setValueAtTime(freq, startTime);
    if (isAlien) {
      // Microtonal pitch glide / vibrato
      osc.frequency.exponentialRampToValueAtTime(freq * (Math.random() > 0.5 ? 1.05 : 0.95), startTime + duration);
    }

    filter.type = isAlien ? 'bandpass' : 'lowpass';
    filter.frequency.setValueAtTime(isAlien ? 1200 : (wave === 'square' ? 1900 : 2500), startTime);
    filter.Q.value = isAlien ? 4.0 : 1.8;

    const noteGain = isAlien ? 0.038 : 0.048;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(noteGain, startTime + 0.015);
    gain.gain.setValueAtTime(noteGain, startTime + duration - 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.jukeGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playBassNote(freq: number, startTime: number, duration: number, wave: OscillatorType) {
    if (!this.ctx || !this.jukeGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = wave;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, startTime);
    filter.Q.value = 1.2;

    const noteGain = 0.058;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(noteGain, startTime + 0.015);
    gain.gain.setValueAtTime(noteGain * 0.7, startTime + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.jukeGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playKick(startTime: number) {
    if (!this.ctx || !this.jukeGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, startTime);
    osc.frequency.exponentialRampToValueAtTime(36, startTime + 0.09);

    gain.gain.setValueAtTime(0.055, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);

    osc.connect(gain);
    gain.connect(this.jukeGain);

    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }

  private playSnare(startTime: number) {
    if (!this.ctx || !this.jukeGain) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.026, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.075);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.jukeGain);

    noise.start(startTime);
    noise.stop(startTime + 0.08);
  }

  private playHiHat(startTime: number) {
    if (!this.ctx || !this.jukeGain) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 0.035;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.012, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.jukeGain);

    noise.start(startTime);
    noise.stop(startTime + 0.035);
  }

  private playAlienClick(startTime: number) {
    if (!this.ctx || !this.jukeGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, startTime);
    osc.frequency.exponentialRampToValueAtTime(450, startTime + 0.02);

    gain.gain.setValueAtTime(0.018, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.02);

    osc.connect(gain);
    gain.connect(this.jukeGain);

    osc.start(startTime);
    osc.stop(startTime + 0.025);
  }

  private playAlienThump(startTime: number) {
    if (!this.ctx || !this.jukeGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(85, startTime);
    osc.frequency.exponentialRampToValueAtTime(28, startTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.value = 160;

    gain.gain.setValueAtTime(0.045, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.jukeGain);

    osc.start(startTime);
    osc.stop(startTime + 0.13);
  }
}

export const jukeboxSynth = new JukeboxSynthesizer();
