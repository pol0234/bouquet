// test/test-bouquet.js
const assert = require('assert');
const Bouquet = require('../js/bouquet.js');

console.log('Testing Bouquet Scene & Composition...');

const bq = Bouquet.buildBouquet(42);

assert(Array.isArray(bq.flowers), 'Bouquet must have flowers array');
assert(bq.flowers.length >= 10, 'Bouquet must contain at least 10 flower entities');
assert(Array.isArray(bq.leaves), 'Bouquet must have leaves array');
assert(bq.leaves.length >= 10 && bq.leaves.length <= 16, 'Bouquet must have 10-16 sculpted leaves with negative space');

// Verify sunflower presence
const sunflowers = bq.flowers.filter(f => f.t === 'sunflower');
assert(sunflowers.length >= 2, 'Bouquet must have at least 2 sunflowers');

// Verify complementary flowers
const cornflowers = bq.flowers.filter(f => f.t === 'cornflower');
assert(cornflowers.length >= 2, 'Bouquet must have blue cornflowers');

const poppies = bq.flowers.filter(f => f.t === 'poppy');
assert(poppies.length >= 1, 'Bouquet must have scarlet poppies');

const daisies = bq.flowers.filter(f => f.t === 'daisy');
assert(daisies.length >= 2, 'Bouquet must have daisies');

const lavender = bq.flowers.filter(f => f.t === 'lavender');
assert(lavender.length >= 2, 'Bouquet must have lavender spikes');

// Check Y-sorting of headOrder (back flowers drawn before front flowers)
for (let i = 1; i < bq.headOrder.length; i++) {
  assert(bq.headOrder[i].y >= bq.headOrder[i - 1].y, 'Head order must be strictly sorted by Y ascending');
}

// Check anchor origin points
bq.flowers.forEach(f => {
  assert(f.by > 1.1, `Flower stem origin must be anchored at the bottom: ${f.by} > 1.1`);
  assert(f.d >= 0.05 && f.d <= 0.85, `Bloom delay d within [0.05, 0.85]: ${f.d}`);
});

console.log('✓ All Bouquet Scene tests passed!');

