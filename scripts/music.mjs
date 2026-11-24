// Generates an original, calm ambient bed (no samples, no licensing): public/music/ambient.wav
// Usage: node scripts/music.mjs [seconds]
import { writeFile, mkdir } from 'node:fs/promises';

const SECONDS = Number(process.argv[2] || 150);
const RATE = 44100;
const N = Math.floor(SECONDS * RATE);
const L = new Float32Array(N);
const R = new Float32Array(N);

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
// Cmaj7 - Am7 - Fmaj7 - G6, 8 s per chord, voiced around middle C
const CHORDS = [
  [48, 55, 59, 64, 67],
  [45, 52, 55, 60, 64],
  [41, 48, 52, 57, 64],
  [43, 50, 55, 59, 64],
];
const CHORD_SEC = 8;

// Pads: detuned sine pairs with a soft 2nd harmonic, long crossfading envelopes.
for (let c = 0; c * CHORD_SEC < SECONDS; c++) {
  const notes = CHORDS[c % CHORDS.length];
  const start = c * CHORD_SEC - 1.5; // overlap neighbours
  const len = CHORD_SEC + 3;
  for (let i = Math.max(0, Math.floor(start * RATE)); i < Math.min(N, Math.floor((start + len) * RATE)); i++) {
    const t = i / RATE - start;
    const env = Math.sin(Math.PI * Math.min(1, t / len)) ** 2; // smooth swell in and out
    let l = 0, r = 0;
    notes.forEach((m, k) => {
      const f = hz(m);
      const a = (k === 0 ? 0.55 : 0.32) / notes.length;
      const s1 = Math.sin(2 * Math.PI * f * 0.998 * t + k);
      const s2 = Math.sin(2 * Math.PI * f * 1.002 * t + k * 1.7);
      const h2 = 0.12 * Math.sin(2 * Math.PI * f * 2 * t);
      l += a * (s1 + h2);
      r += a * (s2 + h2);
    });
    L[i] += env * l;
    R[i] += env * r;
  }
}

// Sparse melody: soft sine "plucks" on chord tones, roughly every 2 beats at 72 bpm.
const beat = 60 / 72;
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let t0 = 6; t0 < SECONDS - 8; t0 += beat * (rand() < 0.5 ? 2 : 3)) {
  const chord = CHORDS[Math.floor(t0 / CHORD_SEC) % CHORDS.length];
  const m = chord[1 + Math.floor(rand() * (chord.length - 1))] + 12;
  const f = hz(m);
  const pan = 0.35 + rand() * 0.3;
  const dur = 2.2;
  for (let i = Math.floor(t0 * RATE); i < Math.min(N, Math.floor((t0 + dur) * RATE)); i++) {
    const t = i / RATE - t0;
    const env = Math.min(1, t / 0.015) * Math.exp(-t * 2.4);
    const s = 0.07 * env * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2 * t));
    L[i] += s * (1 - pan);
    R[i] += s * pan;
  }
}

// Gentle stereo echo for space.
const d1 = Math.floor(0.37 * RATE), d2 = Math.floor(0.53 * RATE);
for (let i = 0; i < N; i++) {
  if (i >= d1) L[i] += 0.28 * R[i - d1];
  if (i >= d2) R[i] += 0.28 * L[i - d2];
}

// One-pole low-pass to soften, master fade in/out, normalise to a quiet peak.
let pl = 0, pr = 0;
const k = 0.18;
let peak = 0;
for (let i = 0; i < N; i++) {
  pl += k * (L[i] - pl); pr += k * (R[i] - pr);
  const t = i / RATE;
  const fade = Math.min(1, t / 3) * Math.min(1, (SECONDS - t) / 5);
  L[i] = pl * fade; R[i] = pr * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.5 / peak;

const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
await mkdir('public/music', { recursive: true });
await writeFile('public/music/ambient.wav', buf);
console.log(`public/music/ambient.wav  ${SECONDS}s  peak-normalised to -6 dBFS`);
