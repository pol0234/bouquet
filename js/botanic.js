// js/botanic.js
// Procedural botanical geometry and high-detail sunflower bouquet engine
// Mathematical modeling of Helianthus annuus, Centaurea, Papaver & meadow flora

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BotanicEngine = factory();
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

  function hash(n) {
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    return (n ^ (n >>> 16)) >>> 0;
  }

  function clamp(x, a, b) {
    a = a === undefined ? 0 : a;
    b = b === undefined ? 1 : b;
    return Math.min(b, Math.max(a, x));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function eo(x) {
    return 1 - Math.pow(1 - clamp(x), 3);
  }

  function eb(x) {
    x = clamp(x);
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var c1 = 1.45, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function bez(f, t) {
    var u = 1 - t;
    return {
      x: u * u * f.bx + 2 * u * t * f.cx + t * t * f.hx,
      y: u * u * f.by + 2 * u * t * f.cy + t * t * f.hy
    };
  }

  // Golden ratio angle in radians for sunflower seed phyllotaxis (~137.507764 deg)
  var PHI_ANGLE = 2.399963229728653;

  var STEM_COL = ['#447d2b', '#579c36', '#3b6c23', '#68ad42'];
  var LEAF_COL = [
    ['#153e19', '#3f8c32'],
    ['#1b4820', '#4ea43c'],
    ['#113214', '#307527'],
    ['#225829', '#66be4f']
  ];

  function createFlower(def, seed) {
    var rnd = mulberry32(seed || 9411);
    var f = {
      t: 'sunflower',
      x: 0.5,
      y: 0.5,
      r: 0.155,
      rot: 0,
      sq: 1.0, // Izotropné proporcie pre dokonalú kruhovitosť
      d: 0.25,
      ph: rnd() * 6.28,
      bx: 0.5 + (rnd() - 0.5) * 0.04,
      by: 1.25,
      bow: (rnd() - 0.5) * 0.08,
      a0: rnd() * 1.0,
      stemCol: STEM_COL[Math.floor(rnd() * STEM_COL.length)],
      stemW: 0.0085 + rnd() * 0.0025,
      c: ['#9a3412', '#f59e0b', '#fef08a'],
      centerCol: ['#3d1a08', '#6b2d08', '#b45309', '#facc15']
    };
    for (var k in def) {
      f[k] = def[k];
    }
    f.hx = f.x;
    f.hy = f.y;
    f.sw = 0;
    f.cx = lerp(f.bx, f.x, 0.28) + (f.bow || 0);
    f.cy = lerp(f.by, f.y, 0.62);
    return f;
  }

  /* -------------------------------------------------------------
     1. VYSOKO DETAILNÁ SLNEČNICA (Helianthus annuus)
     - 16 vonkajších + 14 vnútorných kopijovitých lupeňov s negatívnym priestorom
     - Výrazné biele centrálne žilky pre 3D lúčovitý ASCII profil
     - Zamatovo-bronzový terč s bohatým zlatým peľovým vencom a 84 Fibonacciho floretmi
  ------------------------------------------------------------- */
  function drawSunflower(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    octx.save();
    if (f.sq && f.sq !== 1.0) {
      octx.scale(1, f.sq);
    }

    var discRadius = R * 0.35;

    // A. Zákrovové zelené sepaly pod kvetom (Involucre)
    var numBracts = 16;
    for (var s = 0; s < numBracts; s++) {
      var sang = f.a0 + s * (Math.PI * 2 / numBracts) + 0.1;
      var slen = R * 0.62;
      var swid = slen * 0.16;
      octx.save();
      octx.rotate(sang);
      octx.beginPath();
      octx.moveTo(discRadius * 0.6, 0);
      octx.quadraticCurveTo(slen * 0.45, -swid, slen, 0);
      octx.quadraticCurveTo(slen * 0.45, swid, discRadius * 0.6, 0);
      octx.fillStyle = (s % 2 === 0) ? '#163c0e' : '#235c17';
      octx.fill();
      octx.restore();
    }

    // B. Jednotlivé, ostro oddelené okvetné lístky (Ray florets)
    // Tier 0: 16 vonkajších dlhých lúčov (lenRatio = 1.00)
    // Tier 1: 14 vnútorných lúčov s posunom (lenRatio = 0.88)
    var tiers = [
      { count: 16, lenRatio: 1.00, widRatio: 0.19, offset: 0 },
      { count: 14, lenRatio: 0.88, widRatio: 0.17, offset: Math.PI / 16 }
    ];

    for (var t = 0; t < tiers.length; t++) {
      var tier = tiers[t];
      var isInner = (t === 1);
      var pLen = R * tier.lenRatio;
      var pWid = pLen * tier.widRatio;
      var angStep = (Math.PI * 2) / tier.count;

      for (var i = 0; i < tier.count; i++) {
        var baseAng = f.a0 + i * angStep + tier.offset;
        var flutter = 0.015 * Math.sin(time * 1.6 + f.ph + i * 0.7 + t * 2.1);
        var curLen = pLen * (1 + 0.03 * Math.sin(i * 3.7 + f.ph));

        octx.save();
        octx.rotate(baseAng + flutter);

        // Kopijovitý tvar lupeňa: rozširuje sa v prvej tretine a končí v ostrej špičke
        var petalSpan = curLen - discRadius * 0.90;
        octx.beginPath();
        octx.moveTo(discRadius * 0.90, 0);
        octx.bezierCurveTo(
          discRadius * 0.90 + petalSpan * 0.35, -pWid,
          curLen - petalSpan * 0.25, -pWid * 0.60,
          curLen, 0
        );
        octx.bezierCurveTo(
          curLen - petalSpan * 0.25, pWid * 0.60,
          discRadius * 0.90 + petalSpan * 0.35, pWid,
          discRadius * 0.90, 0
        );
        octx.closePath();

        // Teplý gradient: jantárová báza -> sýta marigold žltá -> svetlý slnečný hrot
        var grad = octx.createLinearGradient(discRadius * 0.85, 0, curLen, 0);
        if (!isInner) {
          grad.addColorStop(0, '#9a3412');    // Hlboký jantár
          grad.addColorStop(0.28, '#f59e0b'); // Sýte zlato
          grad.addColorStop(0.80, '#fde047'); // Žiarivá žltá
          grad.addColorStop(1.0, '#fef08a');  // Špička
        } else {
          grad.addColorStop(0, '#b45309');
          grad.addColorStop(0.32, '#fbbf24');
          grad.addColorStop(0.82, '#fef08a');
          grad.addColorStop(1.0, '#fffbeb');
        }
        octx.fillStyle = grad;
        octx.fill();

        // Tmavý obrys pre separáciu lístkov (zaručuje, že susedné lupene nesplynú)
        octx.strokeStyle = '#220901';
        octx.globalAlpha = 0.70;
        octx.lineWidth = 0.0030;
        octx.stroke();

        // Žiarivá centrálna žilka (specular spine pre vysoký ASCII kontrast)
        octx.beginPath();
        octx.moveTo(discRadius * 0.95, 0);
        octx.lineTo(curLen * 0.92, 0);
        octx.strokeStyle = '#ffffff';
        octx.globalAlpha = isInner ? 0.75 : 0.55;
        octx.lineWidth = 0.0026;
        octx.stroke();

        octx.globalAlpha = 1;
        octx.restore();
      }
    }

    // C. Zamatovo-bronzový terč slnečnice (Žiadna čierna diera!)
    var discGrad = octx.createRadialGradient(0, 0, 0, 0, 0, discRadius);
    discGrad.addColorStop(0, '#381604');    // Teplá zamatová čokoláda v strede
    discGrad.addColorStop(0.50, '#652a0a'); // Bohatý jantár
    discGrad.addColorStop(0.80, '#9a3412'); // Hrejivý bronz
    discGrad.addColorStop(1.0, '#d97706');  // Prechod do žiarivých lupeňov

    octx.beginPath();
    octx.arc(0, 0, discRadius, 0, Math.PI * 2);
    octx.fillStyle = discGrad;
    octx.fill();

    // D. Fibonacciho semenný vzor (Phyllotaxis disk florets)
    // Zlatý peľový veniec na okraji terča
    var numSeeds = 84;
    for (var k = 1; k <= numSeeds; k++) {
      var rFrac = Math.sqrt(k / numSeeds);
      var rk = discRadius * rFrac * 0.95;
      var thetak = k * PHI_ANGLE + f.a0;
      var sx = Math.cos(thetak) * rk;
      var sy = Math.sin(thetak) * rk;

      if (rFrac > 0.68) {
        octx.fillStyle = (k % 2 === 0) ? '#fde047' : '#f59e0b';
        octx.globalAlpha = 0.95;
        octx.beginPath();
        octx.arc(sx, sy, 0.0042, 0, Math.PI * 2);
        octx.fill();
      } else if (rFrac > 0.32) {
        octx.fillStyle = '#f59e0b';
        octx.globalAlpha = 0.85;
        octx.beginPath();
        octx.arc(sx, sy, 0.0036, 0, Math.PI * 2);
        octx.fill();
      } else {
        octx.fillStyle = '#b45309';
        octx.globalAlpha = 0.70;
        octx.beginPath();
        octx.arc(sx, sy, 0.0030, 0, Math.PI * 2);
        octx.fill();
      }
    }

    // Peľový prstenec po obvode terča
    var pollenCount = 28;
    for (var p = 0; p < pollenCount; p++) {
      var pa = f.a0 + p * (Math.PI * 2 / pollenCount);
      var pr = discRadius * (0.91 + 0.05 * Math.sin(p * 2.5));
      octx.fillStyle = '#fef08a';
      octx.globalAlpha = 0.95;
      octx.beginPath();
      octx.arc(Math.cos(pa) * pr, Math.sin(pa) * pr, 0.0036, 0, Math.PI * 2);
      octx.fill();
    }

    octx.globalAlpha = 1;
    octx.restore();
  }

  /* -------------------------------------------------------------
     2. NEVÄDZA POĽNÁ (Centaurea cyanus)
  ------------------------------------------------------------- */
  function drawCornflower(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var numFlorets = 10;
    for (var i = 0; i < numFlorets; i++) {
      var ang = f.a0 + i * (Math.PI * 2 / numFlorets) + 0.03 * Math.sin(time * 1.5 + i);
      var L = R * (0.90 + 0.10 * Math.sin(i * 2.3 + f.ph));
      var w = L * 0.28;

      octx.save();
      octx.rotate(ang);

      octx.beginPath();
      octx.moveTo(R * 0.15, 0);
      octx.lineTo(L * 0.50, -w * 0.70);
      octx.lineTo(L * 0.85, -w);
      octx.lineTo(L * 0.88, -w * 0.35);
      octx.lineTo(L, 0);
      octx.lineTo(L * 0.88, w * 0.35);
      octx.lineTo(L * 0.85, w);
      octx.lineTo(L * 0.50, w * 0.70);
      octx.closePath();

      var g = octx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, '#0f172a');
      g.addColorStop(0.35, '#1d4ed8');
      g.addColorStop(0.80, '#38bdf8');
      g.addColorStop(1.0, '#bae6fd');
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#08142b';
      octx.globalAlpha = 0.65;
      octx.lineWidth = 0.0026;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    octx.fillStyle = '#1e1035';
    octx.beginPath();
    octx.arc(0, 0, R * 0.22, 0, Math.PI * 2);
    octx.fill();

    for (var j = 0; j < 8; j++) {
      var ja = j * (Math.PI * 2 / 8) + f.a0;
      var jx = Math.cos(ja) * R * 0.16;
      var jy = Math.sin(ja) * R * 0.16;
      octx.fillStyle = '#c4b5fd';
      octx.beginPath();
      octx.arc(jx, jy, 0.0034, 0, Math.PI * 2);
      octx.fill();
    }
  }

  /* -------------------------------------------------------------
     3. DIVÝ POĽNÝ MAK (Papaver rhoeas)
  ------------------------------------------------------------- */
  function drawPoppy(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var numPetals = 4;
    for (var i = 0; i < numPetals; i++) {
      var ang = f.a0 + i * (Math.PI / 2) + 0.04 * Math.sin(time * 1.6 + i);
      var L = R * 1.15;
      var w = L * 0.74;

      octx.save();
      octx.rotate(ang);

      octx.beginPath();
      octx.moveTo(0, 0);
      octx.bezierCurveTo(L * 0.35, -w * 1.1, L * 0.85, -w * 0.85, L, 0);
      octx.bezierCurveTo(L * 0.85, w * 0.85, L * 0.35, w * 1.1, 0, 0);

      var g = octx.createRadialGradient(0, 0, L * 0.08, 0, 0, L);
      g.addColorStop(0, '#090204');
      g.addColorStop(0.20, '#450a0a');
      g.addColorStop(0.65, '#dc2626');
      g.addColorStop(1.0, '#f87171');
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#1f0407';
      octx.globalAlpha = 0.65;
      octx.lineWidth = 0.0028;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    octx.fillStyle = '#0a120b';
    octx.beginPath();
    octx.arc(0, 0, R * 0.20, 0, Math.PI * 2);
    octx.fill();

    octx.fillStyle = '#fde047';
    for (var p = 0; p < 12; p++) {
      var pa = p * (Math.PI * 2 / 12) + 0.2;
      var px = Math.cos(pa) * R * 0.24;
      var py = Math.sin(pa) * R * 0.24;
      octx.beginPath();
      octx.arc(px, py, 0.003, 0, Math.PI * 2);
      octx.fill();
    }
  }

  /* -------------------------------------------------------------
     4. POĽNÁ MARGARÉTA (Daisy)
  ------------------------------------------------------------- */
  function drawDaisy(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var petalCount = 14;
    for (var i = 0; i < petalCount; i++) {
      var ang = f.a0 + i * (Math.PI * 2 / petalCount) + 0.02 * Math.sin(time * 1.4 + i);
      var L = R;
      var w = L * 0.17;

      octx.save();
      octx.rotate(ang);

      octx.beginPath();
      octx.moveTo(R * 0.20, 0);
      octx.quadraticCurveTo(L * 0.5, -w, L, 0);
      octx.quadraticCurveTo(L * 0.5, w, R * 0.20, 0);

      var g = octx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, '#64748b');
      g.addColorStop(0.35, '#f1f5f9');
      g.addColorStop(1, '#ffffff');
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#1e293b';
      octx.globalAlpha = 0.55;
      octx.lineWidth = 0.0022;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    var dg = octx.createRadialGradient(0, 0, 0, 0, 0, R * 0.28);
    dg.addColorStop(0, '#b45309');
    dg.addColorStop(0.65, '#eab308');
    dg.addColorStop(1, '#fef08a');
    octx.beginPath();
    octx.arc(0, 0, R * 0.28, 0, Math.PI * 2);
    octx.fillStyle = dg;
    octx.fill();
  }

  /* -------------------------------------------------------------
     5. LEVANDUĽA (Lavandula Spike)
  ------------------------------------------------------------- */
  function drawLavender(octx, f, b, time) {
    var L = f.r * b * 2.8;
    if (L <= 0.002) return;

    var tiers = 6;
    for (var tier = 0; tier < tiers; tier++) {
      var ty = -L * (tier / (tiers - 1));
      var floretCount = 4 + (tier % 2);
      var tierWidth = f.r * b * (0.40 - tier * 0.03);

      for (var fl = 0; fl < floretCount; fl++) {
        var side = (fl % 2 === 0) ? -1 : 1;
        var offX = side * tierWidth * (0.35 + (fl / floretCount) * 0.65);
        var offY = ty + (fl - floretCount / 2) * 0.006;

        octx.save();
        octx.translate(offX, offY);
        octx.rotate(side * 0.35 + 0.04 * Math.sin(time * 1.5 + tier + fl));

        octx.beginPath();
        octx.ellipse(0, 0, 0.012 * b, 0.0065 * b, 0, 0, Math.PI * 2);

        var g = octx.createLinearGradient(0, 0, side * 0.012 * b, 0);
        g.addColorStop(0, '#3b0764');
        g.addColorStop(0.5, '#9333ea');
        g.addColorStop(1, '#f5d0fe');
        octx.fillStyle = g;
        octx.fill();

        octx.strokeStyle = '#1e0538';
        octx.lineWidth = 0.002;
        octx.stroke();

        octx.restore();
      }
    }
  }

  /* -------------------------------------------------------------
     6. PUK (Bud)
  ------------------------------------------------------------- */
  function drawBud(octx, f, b, time) {
    var L = f.r * b * 2.1;
    var w = L * 0.24;
    var sp = f.spread || 0.22;
    var angs = [-sp, sp, 0];

    for (var i = 0; i < angs.length; i++) {
      octx.save();
      octx.rotate(angs[i] + 0.04 * Math.sin(time * 1.5 + f.ph + i));
      octx.beginPath();
      octx.moveTo(0, 0);
      octx.bezierCurveTo(-w * 1.1, -L * 0.28, -w * 0.95, -L * 0.78, 0, -L);
      octx.bezierCurveTo(w * 0.95, -L * 0.78, w * 1.1, -L * 0.28, 0, 0);

      var g = octx.createLinearGradient(0, 0, 0, -L);
      g.addColorStop(0, f.c[0]);
      g.addColorStop(0.5, f.c[1]);
      g.addColorStop(1, f.c[2]);
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#06030a';
      octx.globalAlpha = 0.8;
      octx.lineWidth = 0.003;
      octx.stroke();

      octx.beginPath();
      octx.moveTo(0, -L * 0.1);
      octx.lineTo(0, -L * 0.85);
      octx.strokeStyle = f.c[2];
      octx.globalAlpha = 0.45;
      octx.lineWidth = 0.0026;
      octx.stroke();
      octx.globalAlpha = 1;
      octx.restore();
    }
  }

  /* -------------------------------------------------------------
     7. PREPRACOVANÉ BOTANICKÉ LISTY
  ------------------------------------------------------------- */
  function drawSunflowerLeaf(octx, L, T, time, wind, flowerRef) {
    var g = eo(clamp((T - L.d) / 1.3));
    if (g <= 0.02) return;

    var p = bez(flowerRef, L.tt);
    var th = L.side * L.ang + wind * 0.05 * Math.sin(time * 1.2 + L.ph);
    var len = L.len * g;
    var wid = L.wid * (0.35 + 0.65 * g);

    octx.save();
    octx.translate(p.x, p.y);
    octx.rotate(th - Math.PI / 2);

    octx.beginPath();
    octx.moveTo(0, 0);
    octx.bezierCurveTo(-wid * 0.85, len * 0.25, -wid * 0.95, len * 0.65, 0, len);
    octx.bezierCurveTo(wid * 0.95, len * 0.65, wid * 0.85, len * 0.25, 0, 0);
    octx.closePath();

    var gr = octx.createLinearGradient(0, 0, 0, len);
    gr.addColorStop(0, L.c[0]);
    gr.addColorStop(0.5, L.c[1]);
    gr.addColorStop(1, '#86efac');
    octx.fillStyle = gr;
    octx.fill();

    octx.strokeStyle = '#051407';
    octx.globalAlpha = 0.75;
    octx.lineWidth = 0.003;
    octx.stroke();

    octx.beginPath();
    octx.moveTo(0, 0);
    octx.lineTo(0, len * 0.90);
    octx.strokeStyle = '#bbf7d0';
    octx.globalAlpha = 0.65;
    octx.lineWidth = 0.0026;
    octx.stroke();

    var veinCount = 3;
    for (var v = 1; v <= veinCount; v++) {
      var vy = len * (v / (veinCount + 1));
      var vw = wid * Math.sin(Math.PI * (v / (veinCount + 1))) * 0.55;
      octx.beginPath();
      octx.moveTo(0, vy);
      octx.lineTo(-vw, vy + len * 0.10);
      octx.moveTo(0, vy);
      octx.lineTo(vw, vy + len * 0.10);
      octx.strokeStyle = '#86efac';
      octx.globalAlpha = 0.5;
      octx.lineWidth = 0.0020;
      octx.stroke();
    }

    octx.globalAlpha = 1;
    octx.restore();
  }

  /* 8. HLAVNÝ VÝKRES HLÁVKY KVETU */
  function drawFlowerHead(octx, f, T, time) {
    var b = eb(clamp((T - f.d * 1.8 - 1.2) / 1.4));
    if (b <= 0.01) return;

    octx.save();
    octx.translate(f.hx, f.hy);
    octx.rotate(f.rot + f.sw * 2.8);

    switch (f.t) {
      case 'sunflower':
        drawSunflower(octx, f, b, time);
        break;
      case 'cornflower':
        drawCornflower(octx, f, b, time);
        break;
      case 'poppy':
        drawPoppy(octx, f, b, time);
        break;
      case 'daisy':
        drawDaisy(octx, f, b, time);
        break;
      case 'lavender':
        drawLavender(octx, f, b, time);
        break;
      case 'bud':
      default:
        drawBud(octx, f, b, time);
        break;
    }

    octx.restore();
  }

  return {
    mulberry32: mulberry32,
    hash: hash,
    clamp: clamp,
    lerp: lerp,
    eo: eo,
    eb: eb,
    bez: bez,
    createFlower: createFlower,
    drawSunflower: drawSunflower,
    drawCornflower: drawCornflower,
    drawPoppy: drawPoppy,
    drawDaisy: drawDaisy,
    drawLavender: drawLavender,
    drawBud: drawBud,
    drawSunflowerLeaf: drawSunflowerLeaf,
    drawFlowerHead: drawFlowerHead,
    STEM_COL: STEM_COL,
    LEAF_COL: LEAF_COL
  };
}));
