
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

  function buildBouquet(seed, Hu, opts) {
    var rnd = mulberry32(seed || 5521);
    Hu = (Hu && Hu > 0.8) ? Hu : 1.36;

    var baseBy = (opts && opts.bleed) ? Hu + 0.01 : Hu - 0.04;

    var flowers = [
      createFlower({
        t: 'bud',
        x: 0.48, y: Hu * 0.12,
        r: 0.040, rot: 0.03,
        d: 0.76, by: baseBy, bx: 0.49,
        c: ['#78350f', '#d97706', '#fef08a'],
        spread: 0.22
      }, 101),
      createFlower({
        t: 'bud',
        x: 0.36, y: Hu * 0.17,
        r: 0.036, rot: -0.15,
        d: 0.78, by: baseBy, bx: 0.48,
        c: ['#1e3a8a', '#3b82f6', '#93c5fd'],
        spread: 0.20
      }, 102),
      createFlower({
        t: 'bud',
        x: 0.63, y: Hu * 0.18,
        r: 0.035, rot: 0.20,
        d: 0.72, by: baseBy, bx: 0.51,
        c: ['#7f1d1d', '#ef4444', '#fca5a5'],
        spread: 0.22
      }, 103),

      createFlower({
        t: 'lavender',
        x: 0.14, y: Hu * 0.22,
        r: 0.065, rot: -0.35,
        d: 0.62, by: baseBy, bx: 0.46,
        c: ['#3b0764', '#9333ea', '#f5d0fe']
      }, 201),
      createFlower({
        t: 'lavender',
        x: 0.85, y: Hu * 0.24,
        r: 0.065, rot: 0.35,
        d: 0.60, by: baseBy, bx: 0.54,
        c: ['#3b0764', '#9333ea', '#f5d0fe']
      }, 202),

      createFlower({
        t: 'cornflower',
        x: 0.29, y: Hu * 0.30,
        r: 0.098, rot: -0.16,
        d: 0.52, by: baseBy, bx: 0.47,
        c: ['#0c1b3f', '#2563eb', '#60a5fa']
      }, 301),
      createFlower({
        t: 'cornflower',
        x: 0.19, y: Hu * 0.44,
        r: 0.112, rot: -0.28,
        d: 0.36, by: baseBy, bx: 0.46,
        c: ['#0f172a', '#2563eb', '#38bdf8']
      }, 302),

      createFlower({
        t: 'sunflower',
        x: 0.68, y: Hu * 0.32,
        r: 0.168,
        rot: 0.20,
        sq: 1.0,
        d: 0.44,
        by: baseBy, bx: 0.53,
        c: ['#9a3412', '#f59e0b', '#fef08a'],
        centerCol: ['#381604', '#652a0a', '#9a3412', '#facc15']
      }, 401),

      createFlower({
        t: 'sunflower',
        x: 0.46, y: Hu * 0.45,
        r: 0.210,
        rot: -0.04,
        sq: 1.0,
        d: 0.28,
        by: baseBy, bx: 0.49,
        c: ['#9a3412', '#f59e0b', '#fef08a'],
        centerCol: ['#381604', '#652a0a', '#9a3412', '#facc15']
      }, 402),

      createFlower({
        t: 'poppy',
        x: 0.71, y: Hu * 0.58,
        r: 0.138, rot: 0.18,
        d: 0.20, by: baseBy, bx: 0.52,
        c: ['#450a0a', '#dc2626', '#f87171']
      }, 501),

      createFlower({
        t: 'daisy',
        x: 0.23, y: Hu * 0.61,
        r: 0.090, rot: -0.22,
        d: 0.16, by: baseBy, bx: 0.47,
        c: ['#475569', '#f8fafc', '#ffffff']
      }, 601),
      createFlower({
        t: 'daisy',
        x: 0.43, y: Hu * 0.66,
        r: 0.084, rot: 0.04,
        d: 0.10, by: baseBy, bx: 0.49,
        c: ['#475569', '#f8fafc', '#ffffff']
      }, 602),
      createFlower({
        t: 'daisy',
        x: 0.58, y: Hu * 0.68,
        r: 0.078, rot: 0.16,
        d: 0.12, by: baseBy, bx: 0.51,
        c: ['#475569', '#f8fafc', '#ffffff']
      }, 603)
    ];

    var headOrder = flowers.slice().sort(function (a, b) {
      return a.y - b.y;
    });

    var leaves = [
      { si: 7, tt: 0.32, side: -1, ang: 0.85, len: 0.23, wid: 0.054, ph: 1.1, front: false, c: LEAF_COL[0], d: 0.25 },
      { si: 8, tt: 0.34, side: 1,  ang: 0.88, len: 0.24, wid: 0.054, ph: 2.3, front: false, c: LEAF_COL[1], d: 0.30 },
      { si: 6, tt: 0.44, side: -1, ang: 0.72, len: 0.19, wid: 0.044, ph: 3.5, front: true,  c: LEAF_COL[2], d: 0.38 },
      { si: 9, tt: 0.42, side: 1,  ang: 0.76, len: 0.20, wid: 0.044, ph: 4.7, front: true,  c: LEAF_COL[3], d: 0.22 },

      { si: 0, tt: 0.48, side: -1, ang: 0.50, len: 0.09, wid: 0.020, ph: 1.5, front: false, c: LEAF_COL[1], d: 0.65 },
      { si: 0, tt: 0.62, side: 1,  ang: 0.55, len: 0.08, wid: 0.018, ph: 2.7, front: true,  c: LEAF_COL[2], d: 0.70 },
      { si: 1, tt: 0.55, side: -1, ang: 0.45, len: 0.08, wid: 0.018, ph: 3.2, front: true,  c: LEAF_COL[0], d: 0.68 },
      { si: 2, tt: 0.52, side: 1,  ang: 0.48, len: 0.08, wid: 0.018, ph: 4.1, front: true,  c: LEAF_COL[3], d: 0.64 },

      { si: 5, tt: 0.52, side: -1, ang: 0.60, len: 0.16, wid: 0.038, ph: 0.8, front: false, c: LEAF_COL[1], d: 0.48 },
      { si: 7, tt: 0.58, side: 1,  ang: 0.65, len: 0.16, wid: 0.038, ph: 1.9, front: false, c: LEAF_COL[0], d: 0.45 },
      { si: 3, tt: 0.48, side: -1, ang: 0.52, len: 0.13, wid: 0.030, ph: 2.8, front: true,  c: LEAF_COL[2], d: 0.55 },
      { si: 4, tt: 0.53, side: 1,  ang: 0.56, len: 0.13, wid: 0.030, ph: 3.9, front: true,  c: LEAF_COL[3], d: 0.52 },

      { si: 10, tt: 0.20, side: -1, ang: 1.05, len: 0.18, wid: 0.042, ph: 0.4, front: false, c: LEAF_COL[0], d: 0.18 },
      { si: 9,  tt: 0.18, side: 1,  ang: 1.10, len: 0.18, wid: 0.042, ph: 5.1, front: false, c: LEAF_COL[1], d: 0.15 },
      { si: 11, tt: 0.24, side: -1, ang: 0.95, len: 0.16, wid: 0.038, ph: 2.1, front: true,  c: LEAF_COL[2], d: 0.12 },
      { si: 10, tt: 0.27, side: 1,  ang: 0.98, len: 0.16, wid: 0.038, ph: 4.2, front: true,  c: LEAF_COL[3], d: 0.10 }
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

      octx.strokeStyle = '#051206';
      octx.lineWidth = f.stemW + 0.0035;
      octx.beginPath();
      for (var k0 = 0; k0 <= segments; k0++) {
        var p0 = bez(f, (g * k0) / segments);
        if (k0 === 0) octx.moveTo(p0.x, p0.y);
        else octx.lineTo(p0.x, p0.y);
      }
      octx.stroke();

      octx.strokeStyle = f.stemCol;
      octx.lineWidth = f.stemW;
      octx.beginPath();
      for (var k = 0; k <= segments; k++) {
        var p = bez(f, (g * k) / segments);
        if (k === 0) octx.moveTo(p.x, p.y);
        else octx.lineTo(p.x, p.y);
      }
      octx.stroke();

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

  function renderBouquetScene(octx, bouquet, T, time, SW, SH, Hu, extraWind, cw, ch, layoutInfo) {
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.globalAlpha = 1;
    octx.fillStyle = '#000000';
    octx.fillRect(0, 0, SW, SH);

    var charAspect = (cw && ch) ? (cw / ch) : 0.5;
    var S_val = (layoutInfo && layoutInfo.S) ? layoutInfo.S : 3;
    var bX = layoutInfo ? (layoutInfo.colOffset * S_val) : 0;
    var bY = layoutInfo ? (layoutInfo.rowOffset * S_val) : 0;
    var bSW = layoutInfo ? (layoutInfo.bouquetCols * S_val) : SW;
    var scaleY = bSW * charAspect;
    octx.setTransform(bSW, 0, 0, scaleY, bX, bY);

    var baseWind = 0.50 * (0.65 + 0.35 * Math.sin(time * 0.37) * Math.sin(time * 0.11 + 1.3));
    var wind = baseWind + (extraWind || 0);
    updateStems(bouquet.flowers, time, wind);

    var i;
    for (i = 0; i < bouquet.leaves.length; i++) {
      var Lb = bouquet.leaves[i];
      if (!Lb.front) {
        drawSunflowerLeaf(octx, Lb, T, time, wind, bouquet.flowers[Lb.si]);
      }
    }

    drawStems(octx, bouquet.flowers, T);

    for (i = 0; i < bouquet.leaves.length; i++) {
      var Lf = bouquet.leaves[i];
      if (Lf.front) {
        drawSunflowerLeaf(octx, Lf, T, time, wind, bouquet.flowers[Lf.si]);
      }
    }

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
