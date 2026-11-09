// test/test-particles.js
const assert = require('assert');
const Particles = require('../js/particles.js');

console.log('Testing Particle & Ambient System...');

const ps = Particles.createParticleSystem(1234);
assert(typeof ps.drawBackground === 'function', 'drawBackground function exists');
assert(typeof ps.drawForeground === 'function', 'drawForeground function exists');

// Mock 2D canvas context
const mockCtx = {
  fillTextCalls: 0,
  fillStyle: '',
  globalAlpha: 1,
  fillText: function () {
    this.fillTextCalls++;
  }
};

ps.drawBackground(mockCtx, 100, 70, 7.2, 14.4, 1.0);
assert(mockCtx.fillTextCalls > 0, 'Ambient stars rendered');

const bgCalls = mockCtx.fillTextCalls;
ps.drawForeground(mockCtx, 100, 70, 7.2, 14.4, 1.0);
assert(mockCtx.fillTextCalls > bgCalls, 'Pollen particles rendered');

console.log('✓ All Particle System tests passed!');
