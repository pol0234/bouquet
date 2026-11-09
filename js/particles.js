// js/particles.js
// Atmospheric particles: golden sunflower pollen and twinkling background stars

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ParticleSystem = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function createParticleSystem(seed) {
    var rnd = mulberry32(seed || 3829);

    // 1. Pozadie: ambientné jemné hviezdy / textúry
    var stars = [];
    for (var i = 0; i < 46; i++) {
      stars.push({
        x: rnd(),
        y: rnd() * 0.92,
        ch: ['.', ':', '*', '+', "'"][Math.floor(rnd() * 5)],
        ph: rnd() * 6.28,
        speed: 0.6 + rnd() * 1.6,
        c: rnd() < 0.35 ? '#715a3a' : '#3c3747'
      });
    }

    // 2. Popredie: poletujúci zlatý peľ zo slnečníc
    var pollen = [];
    for (var j = 0; j < 32; j++) {
      pollen.push({
        x: 0.2 + rnd() * 0.6,
        y: 0.2 + rnd() * 0.7,
        vy: 0.015 + rnd() * 0.025,
        swaySpeed: 1.2 + rnd() * 2.0,
        swayAmp: 0.015 + rnd() * 0.025,
        ph: rnd() * 6.28,
        ch: ['*', '.', '°', '·', 'o'][Math.floor(rnd() * 5)],
        c: rnd() < 0.5 ? '#fde047' : '#fbbf24',
        alphaBase: 0.35 + rnd() * 0.45
      });
    }

    function drawBackground(ctx, cols, rows, cw, ch, time) {
      for (var s = 0; s < stars.length; s++) {
        var st = stars[s];
        var alpha = 0.18 + 0.5 * (0.5 + 0.5 * Math.sin(time * st.speed + st.ph));
        ctx.fillStyle = st.c;
        ctx.globalAlpha = alpha;
        var col = Math.floor(st.x * cols);
        var row = Math.floor(st.y * rows);
        ctx.fillText(st.ch, col * cw, row * ch + ch * 0.8);
      }
      ctx.globalAlpha = 1;
    }

    function drawForeground(ctx, cols, rows, cw, ch, time) {
      for (var p = 0; p < pollen.length; p++) {
        var pt = pollen[p];
        // Pomaly stúpajúci peľ s cyklickým návratom
        var py = ((pt.y - time * pt.vy) % 0.85);
        if (py < 0) py += 0.85;
        py += 0.1; // Udržiavať v oblasti kytice

        var px = pt.x + pt.swayAmp * Math.sin(time * pt.swaySpeed + pt.ph);
        var alpha = pt.alphaBase * (0.6 + 0.4 * Math.sin(time * 3.0 + pt.ph));

        ctx.fillStyle = pt.c;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.9, alpha));
        var col = Math.floor(px * cols);
        var row = Math.floor(py * rows);
        ctx.fillText(pt.ch, col * cw, row * ch + ch * 0.8);
      }
      ctx.globalAlpha = 1;
    }

    return {
      drawBackground: drawBackground,
      drawForeground: drawForeground
    };
  }

  return {
    createParticleSystem: createParticleSystem
  };
}));

