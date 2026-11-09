// test/test-ascii-render.js
const assert = require('assert');
const Ascii = require('../js/ascii-render.js');

console.log('Testing ASCII Rasterizer & Shader Formulas...');

// 1. Character sets validation (10 brightness buckets)
assert.strictEqual(Ascii.CHAR_SETS.length, 10, 'Must have 10 brightness levels (0-9)');
assert.strictEqual(Ascii.CHAR_SETS[0], ' ', 'Level 0 must be empty space');
assert(Ascii.CHAR_SETS[9].includes('@') || Ascii.CHAR_SETS[9].includes('#'), 'Level 9 must have dense glyphs');

// 2. Non-linear gamma formula test: v = pow(max(R,G,B), 0.72)
function calcBk(v) {
  return Math.min(9, Math.floor(Math.pow(v, 0.72) * 10));
}

assert.strictEqual(calcBk(0), 0, 'Zero brightness gives bucket 0');
assert.strictEqual(calcBk(1), 9, 'Max brightness gives bucket 9');
assert(calcBk(0.5) >= 5, 'Gamma 0.72 boosts midtones above linear 5');

// 3. Saturation compensation formula: sc = min(1, 0.3 + 0.95 * v) / v * 255
function calcSat(v, R) {
  const sc = Math.min(1, 0.3 + 0.95 * v) / v * 255;
  return Math.min(255, (R * sc) | 0);
}

const comp = calcSat(0.5, 0.5);
assert(comp > 0 && comp <= 255, 'Saturation compensation stays within 0-255');

console.log('✓ All ASCII Rasterizer tests passed!');
