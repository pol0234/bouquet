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

  function buildBouquet(seed, Hu) {
    var rnd = mulberry32(seed || 5521);
    Hu = (Hu && Hu > 0.8) ? Hu : 1.36;

    // Kotva spodku kytice tesne nad spodným okrajom obrazovky
    var baseBy = Hu - 0.04;

    // Vertikálne rozloženie je škálované priamo podľa pomeru displeja Hu.
    // Na mobile (Hu ~ 2.16) kvety prirodzene vyplnia výšku od 0.20 do 1.55.
    // Na desktope (Hu ~ 1.36) kvety vyplnia výšku od 0.14 do 0.96.
    var flowers = [
      // 1. Puky na vrchole kytice (prirodzená výška 12% - 18% výšky)
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

      // 2. Fialové levandule na krídlach (vertikálna elegancia)
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

      // 3. Kobaltové nevädze (kontrastné sýto-modré kvety)
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

      // 4. Hero slnečnica 2 (horná pravá, orientovaná k svetlu, s vlastným priestorom)
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

      // 5. Hero slnečnica 1 (KRÁĽOVNÁ KYTICE: dominantný, veľký, detailný kvet v strede)
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

      // 6. Sýtočervený vlčí mak (kontrastný akcent vpravo dole)
      createFlower({
        t: 'poppy',
        x: 0.71, y: Hu * 0.58,
        r: 0.138, rot: 0.18,
        d: 0.20, by: baseBy, bx: 0.52,
        c: ['#450a0a', '#dc2626', '#f87171']
      }, 501),

      // 7. Biele lúčne margaréty so zlatým očkom (dolné orámovanie)
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

    // Zoradenie hlávok podľa vertikálnej osi Y pre prirodzenú hĺbku
    var headOrder = flowers.slice().sort(function (a, b) {
      return a.y - b.y;
    });

    // Bohaté botanické lístie vytvárajúce prirodzenú siluetu kytice
    var leaves = [
      // 1. Veľké dominantné listy slnečnice klenúce sa do strán
      { si: 7, tt: 0.32, side: -1, ang: 0.85, len: 0.23, wid: 0.054, ph: 1.1, front: false, c: LEAF_COL[0], d: 0.25 },
      { si: 8, tt: 0.34, side: 1,  ang: 0.88, len: 0.24, wid: 0.054, ph: 2.3, front: false, c: LEAF_COL[1], d: 0.30 },
      { si: 6, tt: 0.44, side: -1, ang: 0.72, len: 0.19, wid: 0.044, ph: 3.5, front: true,  c: LEAF_COL[2], d: 0.38 },
      { si: 9, tt: 0.42, side: 1,  ang: 0.76, len: 0.20, wid: 0.044, ph: 4.7, front: true,  c: LEAF_COL[3], d: 0.22 },

      // 2. Lístky pri horných pukoch (odstraňujú dojem holých tyčiek!)
      { si: 0, tt: 0.48, side: -1, ang: 0.50, len: 0.09, wid: 0.020, ph: 1.5, front: false, c: LEAF_COL[1], d: 0.65 },
      { si: 0, tt: 0.62, side: 1,  ang: 0.55, len: 0.08, wid: 0.018, ph: 2.7, front: true,  c: LEAF_COL[2], d: 0.70 },
      { si: 1, tt: 0.55, side: -1, ang: 0.45, len: 0.08, wid: 0.018, ph: 3.2, front: true,  c: LEAF_COL[0], d: 0.68 },
      { si: 2, tt: 0.52, side: 1,  ang: 0.48, len: 0.08, wid: 0.018, ph: 4.1, front: true,  c: LEAF_COL[3], d: 0.64 },

      // 3. Stredné lístie vypĺňajúce stred kytice
      { si: 5, tt: 0.52, side: -1, ang: 0.60, len: 0.16, wid: 0.038, ph: 0.8, front: false, c: LEAF_COL[1], d: 0.48 },
      { si: 7, tt: 0.58, side: 1,  ang: 0.65, len: 0.16, wid: 0.038, ph: 1.9, front: false, c: LEAF_COL[0], d: 0.45 },
      { si: 3, tt: 0.48, side: -1, ang: 0.52, len: 0.13, wid: 0.030, ph: 2.8, front: true,  c: LEAF_COL[2], d: 0.55 },
      { si: 4, tt: 0.53, side: 1,  ang: 0.56, len: 0.13, wid: 0.030, ph: 3.9, front: true,  c: LEAF_COL[3], d: 0.52 },

      // 4. Spodné framing listy
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

      // 1. Tmavý separačný tieň okolo každej stonky
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

      // 3. Pozdĺžny svetelný pás na stonke
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

  /* Elegantné floristické previazanie stoniek (rafiová stužka v páse kytice) */
  function drawBouquetTie(octx, Hu, T, time, wind) {
    var g = eo(clamp((T - 0.40) / 1.2));
    if (g <= 0.01) return;

    var tieY = Hu * 0.74;
    var tieW = 0.085 * g;
    var tieH = 0.022 * g;
    var sx = wind * 0.006 * Math.sin(time * 1.2);

    octx.save();
    octx.translate(0.49 + sx, tieY);

    // 1. Tmavý separačný podklad pod mašľou
    octx.fillStyle = '#1c0a02';
    octx.fillRect(-tieW * 1.05, -tieH * 1.05, tieW * 2.1, tieH * 2.1);

    // 2. Teplý jantárovo-zlatý viazací pás
    var grad = octx.createLinearGradient(0, -tieH, 0, tieH);
    grad.addColorStop(0, '#9a3412');
    grad.addColorStop(0.35, '#f59e0b');
    grad.addColorStop(0.70, '#d97706');
    grad.addColorStop(1, '#78350f');

    octx.fillStyle = grad;
    octx.fillRect(-tieW, -tieH, tieW * 2, tieH * 2);

    // 3. Krížové previazanie zlatou šnúrkou (rafia cord)
    octx.strokeStyle = '#fef08a';
    octx.globalAlpha = 0.85;
    octx.lineWidth = 0.0030;

    octx.beginPath();
    octx.moveTo(-tieW * 0.85, -tieH);
    octx.lineTo(tieW * 0.85, tieH);
    octx.moveTo(-tieW * 0.85, tieH);
    octx.lineTo(tieW * 0.85, -tieH);
    octx.stroke();

    // 4. Stredový uzol a visiace konce stužiek
    octx.fillStyle = '#f59e0b';
    octx.beginPath();
    octx.ellipse(0, 0, tieW * 0.24, tieH * 1.15, 0, 0, Math.PI * 2);
    octx.fill();

    var tailLen = 0.065 * g;
    octx.strokeStyle = '#fbbf24';
    octx.lineWidth = 0.0035;
    octx.beginPath();
    octx.moveTo(-0.008, tieH);
    octx.quadraticCurveTo(-0.020, tieH + tailLen * 0.5, -0.015 + sx * 2, tieH + tailLen);
    octx.moveTo(0.008, tieH);
    octx.quadraticCurveTo(0.020, tieH + tailLen * 0.5, 0.018 + sx * 2, tieH + tailLen * 0.95);
    octx.stroke();

    octx.globalAlpha = 1;
    octx.restore();
  }

  function renderBouquetScene(octx, bouquet, T, time, SW, SH, Hu, extraWind, cw, ch) {
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.globalAlpha = 1;
    octx.fillStyle = '#000000';
    octx.fillRect(0, 0, SW, SH);

    // DÔLEŽITÁ MATEMATIKA:
    // Aby kruh v normalized priestore bol dokonalým kruhom aj na obrazovke,
    // vertikálne škálovanie v octx MUSÍ rešpektovať pomer písma cw / ch!
    var charAspect = (cw && ch) ? (cw / ch) : 0.5;
    var scaleY = SW * charAspect;
    octx.setTransform(SW, 0, 0, scaleY, 0, 0);

    // Vánok
    var baseWind = 0.50 * (0.65 + 0.35 * Math.sin(time * 0.37) * Math.sin(time * 0.11 + 1.3));
    var wind = baseWind + (extraWind || 0);
    updateStems(bouquet.flowers, time, wind);

    var i;
    // 1. Zadné listy
    for (i = 0; i < bouquet.leaves.length; i++) {
      var Lb = bouquet.leaves[i];
      if (!Lb.front) {
        drawSunflowerLeaf(octx, Lb, T, time, wind, bouquet.flowers[Lb.si]);
      }
    }

    // 2. Stonky
    drawStems(octx, bouquet.flowers, T);

    // 3. Ozdobné viazanie kytice v páse
    drawBouquetTie(octx, Hu, T, time, wind);

    // 4. Predné listy
    for (i = 0; i < bouquet.leaves.length; i++) {
      var Lf = bouquet.leaves[i];
      if (Lf.front) {
        drawSunflowerLeaf(octx, Lf, T, time, wind, bouquet.flowers[Lf.si]);
      }
    }

    // 5. Kvetné hlávky
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
