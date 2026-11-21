
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AsciiRasterizer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CHAR_SETS = [
    ' ',
    '.,',
    ":;'",
    '-~=',
    '+il!',
    '()[]{}',
    'xzsc/\\',
    '0oea<>',
    '%$&8?',
    '#@WM'
  ];

  function createAsciiRenderer(options) {
    options = options || {};
    var S = options.samplesPerCell || 3;
    var bg = options.background || '#030205';

    function renderAscii(octx, ctx, params) {
      var SW = params.SW;
      var SH = params.SH;
      var cols = params.cols;
      var rows = params.rows;
      var cw = params.cw;
      var ch = params.ch;
      var Wd = params.Wd;
      var Hd = params.Hd;
      var dpr = params.dpr || 1;
      var hashes = params.hashes;
      var frameNo = params.frameNo || 0;
      var reduceMotion = params.reduceMotion || false;
      var particles = params.particles || null;
      var time = params.time || 0;

      var img = octx.getImageData(0, 0, SW, SH).data;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, Wd, Hd);

      if (particles && typeof particles.drawBackground === 'function') {
        particles.drawBackground(ctx, cols, rows, cw, ch, time);
      }

      var inv = 1 / (S * S * 255);
      var activeCount = 0;

      for (var r = 0; r < rows; r++) {
        var rowOffset = r * cols;
        for (var c = 0; c < cols; c++) {
          var R = 0, G = 0, B = 0;

          for (var sy = 0; sy < S; sy++) {
            var idx = ((r * S + sy) * SW + c * S) * 4;
            for (var sx = 0; sx < S; sx++) {
              R += img[idx];
              G += img[idx + 1];
              B += img[idx + 2];
              idx += 4;
            }
          }

          R *= inv;
          G *= inv;
          B *= inv;

          var v = Math.max(R, G, B);
          if (v < 0.035) continue;

          var bk = Math.min(9, Math.floor(Math.pow(v, 0.72) * 10));
          if (bk === 0) continue;

          var chars = CHAR_SETS[bk];
          var h = hashes[rowOffset + c];
          var k = h % chars.length;

          if (!reduceMotion && ((h >>> 9) & 15) === 0) {
            k = (k + (frameNo >> 3)) % chars.length;
          }

          var sc = Math.min(1, 0.3 + 0.95 * v) / v * 255;
          var cr = Math.min(255, (R * sc) | 0);
          var cg = Math.min(255, (G * sc) | 0);
          var cb = Math.min(255, (B * sc) | 0);

          ctx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
          ctx.fillText(chars.charAt(k), c * cw, r * ch + ch * 0.8);
          activeCount++;
        }
      }

      if (particles && typeof particles.drawForeground === 'function') {
        particles.drawForeground(ctx, cols, rows, cw, ch, time);
      }

      return activeCount;
    }

    return {
      renderAscii: renderAscii,
      CHAR_SETS: CHAR_SETS
    };
  }

  return {
    createAsciiRenderer: createAsciiRenderer,
    CHAR_SETS: CHAR_SETS
  };
}));

