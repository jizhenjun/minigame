// Mulberry32 — fast 32-bit seeded PRNG
export function createRNG(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state |= 0;
      state = state + 0x6D2B79F5 | 0;
      let t = Math.imul(state ^ state >>> 15, 1 | state);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    },
    nextInt(min, max) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    getSeed() { return state; }
  };
}

// Shared game RNG instance
let _rng = createRNG(Date.now());
export function getRNG() { return _rng; }
export function setRNG(rng) { _rng = rng; }
export function reseedRNG(seed) { _rng = createRNG(seed); }
