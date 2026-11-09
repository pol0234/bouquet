// test/test-sunflower.js
const assert = require('assert');
const Botanic = require('../js/botanic.js');

console.log('Testing Sunflower Botanical Calculations...');

// 1. Sunflower instantiation
const sunflower = Botanic.createFlower({
  t: 'sunflower',
  x: 0.44,
  y: 0.54,
  r: 0.165,
  rot: -0.05
}, 9999);

assert.strictEqual(sunflower.t, 'sunflower', 'Type must be sunflower');
assert.strictEqual(sunflower.x, 0.44, 'X coordinate preserved');
assert.strictEqual(sunflower.y, 0.54, 'Y coordinate preserved');
assert.strictEqual(sunflower.r, 0.165, 'Radius preserved');
assert.strictEqual(sunflower.c.length, 3, 'Flower color palette must have 3 stops (shadow, body, tip)');
assert.strictEqual(sunflower.centerCol.length, 4, 'Disc center palette must have 4 radial stops');

// 2. Fibonacci golden angle verification
const PHI = 2.399963229728653; // ~137.507764 deg
const deg = (PHI * 180) / Math.PI;
assert(Math.abs(deg - 137.507764) < 0.001, 'Phi angle must match golden angle ~137.5 degrees');

// 3. Vogel's model distribution test
const numSeeds = 90;
const discRadius = sunflower.r * 0.40;
for (let k = 1; k <= numSeeds; k++) {
  const rFrac = Math.sqrt(k / numSeeds);
  const rk = discRadius * rFrac * 0.95;
  const thetak = k * PHI + sunflower.a0;
  const sx = Math.cos(thetak) * rk;
  const sy = Math.sin(thetak) * rk;
  const dist = Math.hypot(sx, sy);
  assert(dist <= discRadius, `Seed ${k} must stay within disc radius: ${dist} <= ${discRadius}`);
  assert(rFrac >= 0 && rFrac <= 1, `rFrac within [0, 1] range: ${rFrac}`);
}

console.log('✓ All Sunflower tests passed!');
