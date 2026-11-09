// js/bouquet.js
// Bouquet composition, stem updates, wind dynamics, and airy botanical layout
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
      // 1. Puky na vrchole
      createFlower({ t: 'bud', x: 0.50, y: 0.13, r: 0.042, rot: 0.04,  d: 0.72, c: ['#78350f', '#d97706', '#fef08a'], spread: 0.22 }, 101),
      createFlower({ t: 'bud', x: 0.38, y: 0.17, r: 0.038, rot: -0.15, d: 0.78, c: ['#1e3a8a', '#3b82f6', '#93c5fd'], spread: 0.20 }, 102),
      createFlower({ t: 'bud', x: 0.74, y: 0.21, r: 0.036, rot: 0.35,  d: 0.66, c: ['#7f1d1d', '#ef4444', '#fca5a5'], spread: 0.24 }, 103),

      // 2. Fialové levandule na okrajoch (vertikálna elegancia)
      createFlower({ t: 'lavender', x: 0.16, y: 0.30, r: 0.068, rot: -0.42, d: 0.60, c: ['#3b0764', '#9333ea', '#f5d0fe'] }, 201),
      createFlower({ t: 'lavender', x: 0.82, y: 0.31, r: 0.068, rot: 0.40,  d: 0.58, c: ['#3b0764', '#9333ea', '#f5d0fe'] }, 202),

      // 3. Modré nevädze (vysoko kontrastné kobaltové akcenty)
      createFlower({ t: 'cornflower', x: 0.32, y: 0.28, r: 0.084, rot: -0.18, d: 0.52, c: ['#0c1b3f', '#2563eb', '#60a5fa'] }, 301),
      createFlower({ t: 'cornflower', x: 0.21, y: 0.46, r: 0.096, rot: -0.32, d: 0.32, c: ['#0f172a', '#2563eb', '#38bdf8'] }, 302),

      // 4. Hero slnečnica 2 (horná pravá, orientovaná k svetlu, bohaté zlato)
      createFlower({
        t: 'sunflower',
        x: 0.69, y: 0.37,
        r: 0.138,
        rot: 0.22,
        sq: 0.90,
        d: 0.42,
        c: ['#854d0e', '#f59e0b', '#fef08a'],
        centerCol: ['#120602', '#3d1706', '#9a3412', '#f59e0b']
      }, 401),

      // 5. Hero slnečnica 1 (Hlavná dominantná slnečnica v strede)
      createFlower({
        t: 'sunflower',
        x: 0.44, y: 0.51,
        r: 0.186,
        rot: -0.04,
        sq: 0.94,
        d: 0.28,
        c: ['#78350f', '#f59e0b', '#fef08a'],
        centerCol: ['#100502', '#361506', '#854d0e', '#fde047']
      }, 402),

      // 6. Sýtočervený divý mak
      createFlower({ t: 'poppy', x: 0.66, y: 0.70, r: 0.110, rot: 0.20, d: 0.18, c: ['#450a0a', '#dc2626', '#f87171'] }, 501),

      // 7. Biele margaréty so žltým terčíkom
      createFlower({ t: 'daisy', x: 0.23, y: 0.74, r: 0.078, rot: -0.28, d: 0.14, c: ['#475569', '#f8fafc', '#ffffff'] }, 601),
      createFlower({ t: 'daisy', x: 0.42, y: 0.82, r: 0.068, rot: 0.06,  d: 0.08, c: ['#475569', '#f8fafc', '#ffffff'] }, 602)
    ];

    // Zoradenie hlávok podľa vertikálnej osi Y pre prirodzenú hĺbku
    var headOrder = flowers.slice().sort(function (a, b) {
      return a.y - b.y;
    });

    // Botanicky navrhnuté listy s negatívnym priestorom (iba 12 listov namiesto 36!)
    // Žiadna zelená stena - stonky zostávajú voľné a viditeľné!
    var leaves = [
      // Veľké dominantné listy slnečnice klenúce sa do strán
      { si: 7, tt: 0.32, side: -1, ang: 0.85, len: 0.21, wid: 0.048, ph: 1.1, front: false, c: LEAF_COL[0], d: 0.25 },
      { si: 8, tt: 0.34, side: 1,  ang: 0.88, len: 0.22, wid: 0.048, ph: 2.3, front: false, c: LEAF_COL[1], d: 0.30 },
      { si: 6, tt: 0.45, side: -1, ang: 0.70, len: 0.17, wid: 0.038, ph: 3.5, front: true,  c: LEAF_COL[2], d: 0.38 },
      { si: 9, tt: 0.42, side: 1,  ang: 0.75, len: 0.18, wid: 0.038, ph: 4.7, front: true,  c: LEAF_COL[3], d: 0.22 },

      // Stredné listy
      { si: 5, tt: 0.50, side: -1, ang: 0.60, len: 0.13, wid: 0.030, ph: 0.8, front: false, c: LEAF_COL[1], d: 0.48 },
      { si: 7, tt: 0.58, side: 1,  ang: 0.65, len: 0.14, wid: 0.030, ph: 1.9, front: false, c: LEAF_COL[0], d: 0.45 },
      { si: 3, tt: 0.48, side: -1, ang: 0.55, len: 0.11, wid: 0.024, ph: 2.8, front: true,  c: LEAF_COL[2], d: 0.55 },
      { si: 4, tt: 0.52, side: 1,  ang: 0.58, len: 0.11, wid: 0.024, ph: 3.9, front: true,  c: LEAF_COL[3], d: 0.52 },

      // Spodné framing listy (odklonené od zväzku, aby neodkrývali stonky do bloku)
      { si: 10, tt: 0.18, side: -1, ang: 1.05, len: 0.15, wid: 0.036, ph: 0.4, front: false, c: LEAF_COL[0], d: 0.18 },
      { si: 9,  tt: 0.16, side: 1,  ang: 1.10, len: 0.15, wid: 0.036, ph: 5.1, front: false, c: LEAF_COL[1], d: 0.15 },
      { si: 11, tt: 0.22, side: -1, ang: 0.95, len: 0.13, wid: 0.032, ph: 2.1, front: true,  c: LEAF_COL[2], d: 0.12 },
      { si: 10, tt: 0.25, side: 1,  ang: 0.98, len: 0.13, wid: 0.032, ph: 4.2, front: true,  c: LEAF_COL[3], d: 0.10 }
    ];

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
      var sx = wind * (0.014 * Math.sin(time * 1.15 + f.ph) + 0.005 * Math.sin(time * 2.3 + f.ph * 1.7)) * (0.35 + h * 0.9);
      f.sw = sx;
      f.hx = f.x + sx;
      f.hy = f.y + wind * 0.0035 * Math.sin(time * 1.6 + f.ph);
      // Pôvabné prehnutie stonky (bow)
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

      var segments = 28;

      // 1. Tmavý separačný tieň okolo každej stonky (oddeľuje susedné stonky v ASCII)
      octx.strokeStyle = '#051206';
      octx.lineWidth = f.stemW + 0.0035;
      octx.beginPath();
      for (var k0 = 0; k0 <= segments; k0++) {
        var p0 = bez(f, (g * k0) / segments);
        if (k0 === 0) octx.moveTo(p0.x, p0.y);
        else octx.lineTo(p0.x, p0.y);
      }
      octx.stroke();

      // 2. Hlavné telo stonky
      octx.strokeStyle = f.stemCol;
      octx.lineWidth = f.stemW;
      octx.beginPath();
      for (var k = 0; k <= segments; k++) {
        var p = bez(f, (g * k) / segments);
        if (k === 0) octx.moveTo(p.x, p.y);
        else octx.lineTo(p.x, p.y);
      }
      octx.stroke();

      // 3. Pozdĺžny svetelný pás na stonke (3D valcový profil v ASCII)
      octx.strokeStyle = '#bef264';
      octx.globalAlpha = 0.35;
      octx.lineWidth = f.stemW * 0.32;
      octx.beginPath();
      for (var k2 = 0; k2 <= segments; k2++) {
        var p2 = bez(f, (g * k2) / segments);
        if (k2 === 0) octx.moveTo(p2.x, p2.y);
        else octx.lineTo(p2.x, p2.y);
      }
      octx.stroke();
      octx.globalAlpha = 1;
    }
  }

  function renderBouquetScene(octx, bouquet, T, time, SW, SH, Hu, extraWind) {
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.globalAlpha = 1;
    octx.fillStyle = '#000000';
    octx.fillRect(0, 0, SW, SH);

    // Škálovanie do botanického priestoru [0, 1] x [0, Hu]
    octx.setTransform(SW, 0, 0, SH / Hu, 0, 0);

    // Jemný organický vánok + interaktívny vánok myši
    var baseWind = 0.50 * (0.65 + 0.35 * Math.sin(time * 0.37) * Math.sin(time * 0.11 + 1.3));
    var wind = baseWind + (extraWind || 0);
    updateStems(bouquet.flowers, time, wind);

    var i;
    // 1. Zadné listy (iba 6 listov)
    for (i = 0; i < bouquet.leaves.length; i++) {
      var Lb = bouquet.leaves[i];
      if (!Lb.front) {
        drawSunflowerLeaf(octx, Lb, T, time, wind, bouquet.flowers[Lb.si]);
      }
    }

    // 2. Jednotlivé elegantné stonky s negatívnym priestorom medzi nimi
    drawStems(octx, bouquet.flowers, T);

    // 3. Predné listy (iba 6 listov)
    for (i = 0; i < bouquet.leaves.length; i++) {
      var Lf = bouquet.leaves[i];
      if (Lf.front) {
        drawSunflowerLeaf(octx, Lf, T, time, wind, bouquet.flowers[Lf.si]);
      }
    }

    // 4. Kvetné hlávky (precízne zoradené od zadných po predné)
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
