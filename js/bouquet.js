// js/bouquet.js
// Bouquet composition, stem updates, wind dynamics, and layered rendering
// Coordinates in normalized space [0, 1] x [0, Hu]

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./botanic.js'));
  } else {
    root.BouquetScene = factory(root.BotanicEngine);
  }
}(typeof self !== 'undefined' ? self : this, function (BotanicEngine) {
  'use strict';

  var createFlower = BotanicEngine.createFlower;
  var drawSunflowerLeaf = BotanicEngine.drawSunflowerLeaf;
  var drawFlowerHead = BotanicEngine.drawFlowerHead;
  var bez = BotanicEngine.bez;
  var clamp = BotanicEngine.clamp;
  var lerp = BotanicEngine.lerp;
  var eo = BotanicEngine.eo;
  var mulberry32 = BotanicEngine.mulberry32;
  var LEAF_COL = BotanicEngine.LEAF_COL;

  function buildBouquet(seed) {
    var rnd = mulberry32(seed || 5521);

    var flowers = [
      // Puky na vrchole (najneskorší rozkvet d: 0.66 - 0.78)
      createFlower({ t: 'bud', x: 0.51, y: 0.14, r: 0.042, rot: 0.04,  d: 0.72, c: ['#78350f', '#d97706', '#fef08a'], spread: 0.22 }, 101),
      createFlower({ t: 'bud', x: 0.40, y: 0.18, r: 0.038, rot: -0.15, d: 0.78, c: ['#1e3a8a', '#3b82f6', '#93c5fd'], spread: 0.20 }, 102),
      createFlower({ t: 'bud', x: 0.75, y: 0.22, r: 0.036, rot: 0.35,  d: 0.66, c: ['#7f1d1d', '#ef4444', '#fca5a5'], spread: 0.24 }, 103),

      // Fialové levandule na bokoch
      createFlower({ t: 'lavender', x: 0.18, y: 0.32, r: 0.065, rot: -0.42, d: 0.60, c: ['#3b0764', '#9333ea', '#e9d5ff'] }, 201),
      createFlower({ t: 'lavender', x: 0.81, y: 0.33, r: 0.065, rot: 0.38,  d: 0.58, c: ['#3b0764', '#9333ea', '#e9d5ff'] }, 202),

      // Modré nevädze (vysoký kontrast k žltým slnečniciam)
      createFlower({ t: 'cornflower', x: 0.34, y: 0.29, r: 0.082, rot: -0.18, d: 0.52, c: ['#1e1b4b', '#3b82f6', '#bfdbfe'] }, 301),
      createFlower({ t: 'cornflower', x: 0.24, y: 0.47, r: 0.094, rot: -0.32, d: 0.32, c: ['#172554', '#2563eb', '#93c5fd'] }, 302),

      // Hero slnečnica 2 (horná pravá, orientovaná k svetlu)
      createFlower({
        t: 'sunflower',
        x: 0.68, y: 0.39,
        r: 0.135,
        rot: 0.22,
        d: 0.42,
        c: ['#854d0e', '#f59e0b', '#fffbeb'],
        centerCol: ['#1e0d05', '#48200c', '#8a4312', '#eab308']
      }, 401),

      // Hero slnečnica 1 (Hlavná dominantná slnečnica)
      createFlower({
        t: 'sunflower',
        x: 0.44, y: 0.54,
        r: 0.165,
        rot: -0.05,
        d: 0.28,
        c: ['#78350f', '#eab308', '#fef08a'],
        centerCol: ['#1c0c05', '#451f0c', '#9c4d16', '#ffcf33']
      }, 402),

      // Sýtočervený divý mak
      createFlower({ t: 'poppy', x: 0.63, y: 0.73, r: 0.108, rot: 0.18, d: 0.18, c: ['#7f1d1d', '#ef4444', '#fca5a5'] }, 501),

      // Biele margaréty so zlatým terčíkom (skorý rozkvet d: 0.08 - 0.14)
      createFlower({ t: 'daisy', x: 0.26, y: 0.75, r: 0.076, rot: -0.28, d: 0.14, c: ['#64748b', '#f8fafc', '#ffffff'] }, 601),
      createFlower({ t: 'daisy', x: 0.44, y: 0.83, r: 0.068, rot: 0.05,  d: 0.08, c: ['#64748b', '#f8fafc', '#ffffff'] }, 602)
    ];

    // Zoradenie hlávok podľa vertikálnej osi Y pre prirodzenú hĺbku (zadné sa kreslia prvé)
    var headOrder = flowers.slice().sort(function (a, b) {
      return a.y - b.y;
    });

    // Listy slnečnice a lúčnej zelene
    var leaves = [];
    var leafCount = 36;
    for (var i = 0; i < leafCount; i++) {
      var isLower = i < 24;
      var si = Math.floor(rnd() * flowers.length);
      var tt = isLower ? (0.04 + rnd() * 0.32) : (0.32 + rnd() * 0.35);

      var L = {
        si: si,
        tt: tt,
        side: rnd() < 0.5 ? -1 : 1,
        ang: isLower ? (0.35 + rnd() * 0.80) : (0.50 + rnd() * 0.55),
        len: isLower ? (0.16 + rnd() * 0.15) : (0.09 + rnd() * 0.09),
        wid: isLower ? (0.045 + rnd() * 0.035) : (0.028 + rnd() * 0.020),
        ph: rnd() * 6.28,
        front: rnd() < 0.42,
        c: LEAF_COL[Math.floor(rnd() * LEAF_COL.length)]
      };
      // Čas rastu odvodený od stonky
      L.d = flowers[si].d * 1.6 + tt * 1.1 + 0.06;
      leaves.push(L);
    }

    return {
      flowers: flowers,
      headOrder: headOrder,
      leaves: leaves
    };
  }

  function updateStems(flowers, time, wind) {
    for (var i = 0; i < flowers.length; i++) {
      var f = flowers[i];
      var h = clamp((f.by - f.y) / 1.15);
      var sx = wind * (0.015 * Math.sin(time * 1.15 + f.ph) + 0.006 * Math.sin(time * 2.3 + f.ph * 1.7)) * (0.35 + h * 0.9);
      f.sw = sx;
      f.hx = f.x + sx;
      f.hy = f.y + wind * 0.0035 * Math.sin(time * 1.6 + f.ph);
      f.cx = lerp(f.bx, f.x, 0.28) + (f.bow || 0) + sx * 0.45;
      f.cy = lerp(f.by, f.y, 0.62);
    }
  }

  function drawStems(octx, flowers, T) {
    octx.lineCap = 'round';
    octx.lineJoin = 'round';

    for (var i = 0; i < flowers.length; i++) {
      var f = flowers[i];
      var g = eo(clamp((T - f.d * 1.8) / 1.4));
      if (g <= 0.002) continue;

      octx.strokeStyle = f.stemCol;
      octx.lineWidth = f.stemW;
      octx.beginPath();
      var segments = 28;
      for (var k = 0; k <= segments; k++) {
        var p = bez(f, (g * k) / segments);
        if (k === 0) octx.moveTo(p.x, p.y);
        else octx.lineTo(p.x, p.y);
      }
      octx.stroke();

      // Jemný lesk na stonkách pre plastickosť
      octx.strokeStyle = '#a3e635';
      octx.globalAlpha = 0.25;
      octx.lineWidth = f.stemW * 0.35;
      octx.stroke();
      octx.globalAlpha = 1;
    }
  }

  function renderBouquetScene(octx, bouquet, T, time, SW, SH, Hu) {
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.globalAlpha = 1;
    octx.fillStyle = '#000000';
    octx.fillRect(0, 0, SW, SH);

    // Škálovanie do botanického priestoru [0, 1] x [0, Hu]
    octx.setTransform(SW, 0, 0, SH / Hu, 0, 0);

    // Organický vánok
    var wind = 0.55 * (0.65 + 0.35 * Math.sin(time * 0.37) * Math.sin(time * 0.11 + 1.3));
    updateStems(bouquet.flowers, time, wind);

    var i;
    // 1. Zadné listy
    for (i = 0; i < bouquet.leaves.length; i++) {
      var Lb = bouquet.leaves[i];
      if (!Lb.front) {
        drawSunflowerLeaf(octx, Lb, T, time, wind, bouquet.flowers[Lb.si]);
      }
    }

    // 2. Stonky kvetov
    drawStems(octx, bouquet.flowers, T);

    // 3. Predné listy
    for (i = 0; i < bouquet.leaves.length; i++) {
      var Lf = bouquet.leaves[i];
      if (Lf.front) {
        drawSunflowerLeaf(octx, Lf, T, time, wind, bouquet.flowers[Lf.si]);
      }
    }

    // 4. Kvetné hlávky (zoradené od zadných po predné)
    for (i = 0; i < bouquet.headOrder.length; i++) {
      drawFlowerHead(octx, bouquet.headOrder[i], T, time);
    }
  }

  return {
    buildBouquet: buildBouquet,
    updateStems: updateStems,
    drawStems: drawStems,
    renderBouquetScene: renderBouquetScene
  };
}));
