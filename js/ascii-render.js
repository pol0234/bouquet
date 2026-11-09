// js/ascii-render.js
// High-performance ASCII Rasterizer & Shader Engine
// 3x3 box-sampling supersampling, nonlinear gamma mapping, and saturation compensation

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AsciiRasterizer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CHAR_SETS = [
    ' ',          // 0: Pozadie
    '.,',         // 1: Najjemnejší obrys
    ":;'",        // 2: Slabý tieň
    '-~=',        // 3: Plochy a žilky
    '+il!',       // 4: Stonky a stredné tóny
    '()[]{}',     // 5: Zakrivené okraje
    'xzsc/\\',    // 6: Textúra lupeňov
    '0oea<>',     // 7: Svetlejšie plochy lupeňov
    '%$&8?',      // 8: Jasné svetlá a tyčinky
    '#@WM'        // 9: Maximálny lesk a stredy
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

      // Získanie miniatúrneho obrazového buffera
      var img = octx.getImageData(0, 0, SW, SH).data;

      // Vyčistenie a nastavenie cieľového canvasu
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, Wd, Hd);

      // Kreslenie okolitých častíc / hviezd na pozadí pred kvetmi
      if (particles && typeof particles.drawBackground === 'function') {
        particles.drawBackground(ctx, cols, rows, cw, ch, time);
      }

      var inv = 1 / (S * S * 255);
      var activeCount = 0;

      for (var r = 0; r < rows; r++) {
        var rowOffset = r * cols;
        for (var c = 0; c < cols; c++) {
          var R = 0, G = 0, B = 0;

          // 3x3 priemerovanie pixelov z offscreen buffera
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
          if (v < 0.035) continue; // Prah pozadia

          // Nelineárne mapovanie jasu (gamma korekcia nadvihuje polotóny)
          var bk = Math.min(9, Math.floor(Math.pow(v, 0.72) * 10));
          if (bk === 0) continue;

          var chars = CHAR_SETS[bk];
          var h = hashes[rowOffset + c];
          var k = h % chars.length;

          // Jemný digitálny shimmer na 1 zo 16 buniek
          if (!reduceMotion && ((h >>> 9) & 15) === 0) {
            k = (k + (frameNo >> 3)) % chars.length;
          }

          // Kompenzácia saturácie zabraňuje šednutiu tmavých tónov
          var sc = Math.min(1, 0.3 + 0.95 * v) / v * 255;
          var cr = Math.min(255, (R * sc) | 0);
          var cg = Math.min(255, (G * sc) | 0);
          var cb = Math.min(255, (B * sc) | 0);

          ctx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
          ctx.fillText(chars.charAt(k), c * cw, r * ch + ch * 0.8);
          activeCount++;
        }
      }

      // Kreslenie zlatého peľu a poletujúcich svetlušiek v popredí
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

