// test/test-botanic.js
const assert = require('assert');
const Botanic = require('../js/botanic.js');

console.log('Testing Botanic Engine Math & Geometry...');

// 1. Easing functions
assert.strictEqual(Botanic.eo(0), 0, 'eo(0) == 0');
assert.strictEqual(Botanic.eo(1), 1, 'eo(1) == 1');
assert(Botanic.eo(0.5) > 0.5, 'eo(0.5) must ease out rapidly');

assert.strictEqual(Botanic.eb(0), 0, 'eb(0) == 0');
assert.strictEqual(Botanic.eb(1), 1, 'eb(1) == 1');
// Ease back overshoot: at ~0.7-0.9 it reaches > 1
let foundOvershoot = false;
for (let t = 0.5; t < 1.0; t += 0.05) {
  if (Botanic.eb(t) > 1.0) foundOvershoot = true;
}
assert(foundOvershoot, 'eb(t) must have an organic bloom overshoot > 1');

// 2. Deterministic Hash
const h1 = Botanic.hash(42);
const h2 = Botanic.hash(42);
const h3 = Botanic.hash(43);
assert.strictEqual(h1, h2, 'hash must be deterministic');
assert.notStrictEqual(h1, h3, 'different inputs yield different hashes');

// 3. Bezier calculations
const f = { bx: 0.5, by: 1.25, cx: 0.48, cy: 0.8, hx: 0.44, hy: 0.54 };
const p0 = Botanic.bez(f, 0);
const p1 = Botanic.bez(f, 1);
assert.strictEqual(p0.x, f.bx, 'bez at 0 matches origin bx');
assert.strictEqual(p0.y, f.by, 'bez at 0 matches origin by');
assert.strictEqual(p1.x, f.hx, 'bez at 1 matches head hx');
assert.strictEqual(p1.y, f.hy, 'bez at 1 matches head hy');

console.log('✓ All Botanic Engine tests passed!');
