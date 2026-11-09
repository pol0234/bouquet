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
      r: 0.16,
      rot: 0,
      sq: 0.94, // Jemné eliptické skreslenie pre 3D natočenie
      d: 0.25,
      ph: rnd() * 6.28,
      bx: 0.5 + (rnd() - 0.5) * 0.05,
      by: 1.26,
      bow: (rnd() - 0.5) * 0.10,
      a0: rnd() * 1.0,
      stemCol: STEM_COL[Math.floor(rnd() * STEM_COL.length)],
      stemW: 0.009 + rnd() * 0.003,
      c: ['#854d0e', '#f59e0b', '#fef08a'],
      centerCol: ['#120602', '#3d1706', '#9a3412', '#f59e0b']
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
     - Dvojvrstvové usporiadanie lupeňov, ktoré sa prekrývajú bez čiernych dier
     - Každý lupeň má nádherný tvar slnečného lúča s jantárovou bázou a zlatým hrotom
     - Pozdĺžna centrálna žilka s vysokým jasom pre 3D reliéf
     - Veľký centrálny terč s bohatým Fibonacciho vzorom semien a zlatým peľovým vencom
     - Zelený zákrov (involucre)
  ------------------------------------------------------------- */
  function drawSunflower(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    octx.save();
    octx.scale(1, f.sq || 0.94);

    var discRadius = R * 0.42;

    // A. Zelený zákrov pod kvetom (Involucral bracts)
    var numBracts = 18;
    for (var s = 0; s < numBracts; s++) {
      var sang = f.a0 + s * (Math.PI * 2 / numBracts) + 0.08;
      var slen = R * 0.68;
      var swid = slen * 0.18;
      octx.save();
      octx.rotate(sang);
      octx.beginPath();
      octx.moveTo(discRadius * 0.6, 0);
      octx.quadraticCurveTo(slen * 0.5, -swid, slen, 0);
      octx.quadraticCurveTo(slen * 0.5, swid, discRadius * 0.6, 0);
      octx.fillStyle = (s % 2 === 0) ? '#163c0e' : '#225516';
      octx.fill();
      octx.restore();
    }

    // B. Plné, žiarivé okvetné lupene (Ray florets)
    // 2 vrstvy: Pass 0 (spodná/vonkajšia, 24 lupeňov), Pass 1 (vrchná/vnútorná, 24 lupeňov s posunom)
    var petalsPerTier = 24;
    for (var pass = 0; pass < 2; pass++) {
      var isInner = (pass === 1);
      var pLen = isInner ? (R * 0.92) : R;
      var pWid = pLen * 0.155; // Plný, veľkorysý tvar lupeňa
      var angStep = (Math.PI * 2) / petalsPerTier;
      var angOffset = isInner ? (angStep * 0.5) : 0;

      for (var i = 0; i < petalsPerTier; i++) {
        var baseAng = f.a0 + i * angStep + angOffset;
        var flutter = 0.02 * Math.sin(time * 1.8 + f.ph + i * 0.6 + pass * 2.5);
        var curLen = pLen * (1 + 0.035 * Math.sin(i * 3.5 + f.ph));

        octx.save();
        octx.rotate(baseAng + flutter);

        // Tvar lupeňa slnečnice: začína pod okrajom terča, rozširuje sa a končí elegantnou špičkou
        octx.beginPath();
        octx.moveTo(discRadius * 0.75, 0);
        // Spodná krivka
        octx.bezierCurveTo(
          discRadius + curLen * 0.18, -pWid * 1.15,
          curLen * 0.72, -pWid * 0.85,
          curLen, 0
        );
        // Horná krivka
        octx.bezierCurveTo(
          curLen * 0.72, pWid * 0.85,
          discRadius + curLen * 0.18, pWid * 1.15,
          discRadius * 0.75, 0
        );
        octx.closePath();

        // Farba: Hlboký jantár pri báze -> Sýte teplé zlato -> Žiarivá žltá
        var grad = octx.createLinearGradient(discRadius * 0.7, 0, curLen, 0);
        if (!isInner) {
          // Vonkajšia vrstva: sýte zlato s jasným hrotom
          grad.addColorStop(0, '#92400e');   // Teplá jantárová báza
          grad.addColorStop(0.28, '#d97706'); // Teplé zlato
          grad.addColorStop(0.70, '#f59e0b'); // Žiarivé zlato
          grad.addColorStop(1.0, '#fef08a');  // Slnečný hrot
        } else {
          // Vnútorná vrstva: jasnejšie tóny vystupujúce dopredu
          grad.addColorStop(0, '#b45309');
          grad.addColorStop(0.35, '#f59e0b');
          grad.addColorStop(0.80, '#fde047');
          grad.addColorStop(1.0, '#fef9c3');
        }
        octx.fillStyle = grad;
        octx.fill();

        // Jemný separačný obrys medzi lupeňmi (teplý mahagón)
        octx.strokeStyle = '#451a03';
        octx.globalAlpha = 0.55;
        octx.lineWidth = 0.0022;
        octx.stroke();

        // Centrálna svetelná žilka (specular ridge) pre 3D plasticitu
        octx.beginPath();
        octx.moveTo(discRadius * 0.85, 0);
        octx.lineTo(curLen * 0.90, 0);
        octx.strokeStyle = '#fffde0';
        octx.globalAlpha = isInner ? 0.65 : 0.45;
        octx.lineWidth = 0.0026;
        octx.stroke();

        octx.globalAlpha = 1;
        octx.restore();
      }
    }

    // C. Veľký centrálny terč slnečnice (Phyllotaxis Disc)
    // 1. Podkladový radiálny gradient (čokoládový stred až zlatohnedý okraj)
    var discGrad = octx.createRadialGradient(0, 0, 0, 0, 0, discRadius);
    var cc = f.centerCol || ['#120602', '#3d1706', '#9a3412', '#f59e0b'];
    discGrad.addColorStop(0, cc[0]);        // Zamatový espresso stred
    discGrad.addColorStop(0.40, cc[1]);     // Tmavé semienka
    discGrad.addColorStop(0.72, cc[2]);     // Jantárové pásmo otvárania kvetov
    discGrad.addColorStop(0.92, '#b45309'); // Teplý bronz
    discGrad.addColorStop(1.0, '#f59e0b');  // Zlaté rozhranie prechádzajúce do lupeňov

    octx.beginPath();
    octx.arc(0, 0, discRadius, 0, Math.PI * 2);
    octx.fillStyle = discGrad;
    octx.fill();

    // 2. Fibonacciho semienka podľa Vogelovho modelu (Phyllotaxis) - 150 bodov
    var numSeeds = 150;
    for (var k = 1; k <= numSeeds; k++) {
      var rFrac = Math.sqrt(k / numSeeds);
      var rk = discRadius * rFrac * 0.96;
      var thetak = k * PHI_ANGLE + f.a0;
      var sx = Math.cos(thetak) * rk;
      var sy = Math.sin(thetak) * rk;

      if (rFrac > 0.70) {
        // Otvorené kvietky na okraji terča so zlatým peľom
        octx.fillStyle = (k % 2 === 0) ? '#fde047' : '#f59e0b';
        octx.globalAlpha = 0.95;
        var sz = 0.0044;
        octx.beginPath();
        octx.arc(sx, sy, sz, 0, Math.PI * 2);
        octx.fill();
      } else if (rFrac > 0.35) {
        // Stredné pásmo semienok
        octx.fillStyle = (k % 2 === 0) ? '#9a3412' : '#78350f';
        octx.globalAlpha = 0.75;
        octx.beginPath();
        octx.arc(sx, sy, 0.0034, 0, Math.PI * 2);
        octx.fill();
      } else {
        // Zamatový čokoládový stred
        octx.fillStyle = (k % 3 === 0) ? '#451a03' : '#1c0c04';
        octx.globalAlpha = 0.60;
        octx.beginPath();
        octx.arc(sx, sy, 0.0030, 0, Math.PI * 2);
        octx.fill();
      }
    }

    // 3. Vonkajší veniec peľu (Floret Crown)
    var pollenCount = 36;
    for (var p = 0; p < pollenCount; p++) {
      var pa = f.a0 + p * (Math.PI * 2 / pollenCount);
      var pr = discRadius * (0.91 + 0.05 * Math.sin(p * 2.5));
      octx.fillStyle = '#fef08a';
      octx.globalAlpha = 0.92;
      octx.beginPath();
      octx.arc(Math.cos(pa) * pr, Math.sin(pa) * pr, 0.0038, 0, Math.PI * 2);
      octx.fill();
    }

    octx.globalAlpha = 1;
    octx.restore();
  }

  /* -------------------------------------------------------------
     2. NEVÄDZA POĽNÁ / MODRÁ CHRPA (Centaurea cyanus)
     - Výrazné zúbkované trojcípe kvietky (trident lobes)
     - Sýtomodrá až nebeská azúrová s fialovým stredom
  ------------------------------------------------------------- */
  function drawCornflower(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var numFlorets = 12;
    for (var i = 0; i < numFlorets; i++) {
      var ang = f.a0 + i * (Math.PI * 2 / numFlorets) + 0.03 * Math.sin(time * 1.5 + i);
      var L = R * (0.90 + 0.10 * Math.sin(i * 2.3 + f.ph));
      var w = L * 0.26;

      octx.save();
      octx.rotate(ang);

      octx.beginPath();
      octx.moveTo(R * 0.15, 0);
      octx.lineTo(L * 0.50, -w * 0.70);
      octx.lineTo(L * 0.85, -w);
      octx.lineTo(L * 0.88, -w * 0.35);
      octx.lineTo(L, 0); // Stredný hrot
      octx.lineTo(L * 0.88, w * 0.35);
      octx.lineTo(L * 0.85, w);
      octx.lineTo(L * 0.50, w * 0.70);
      octx.closePath();

      var g = octx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, '#0f172a');   // Hlboká indigo
      g.addColorStop(0.35, '#1d4ed8'); // Kráľovská modrá
      g.addColorStop(0.80, '#38bdf8'); // Žiarivá azúrová
      g.addColorStop(1.0, '#bae6fd');  // Zúbky
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#08142b';
      octx.globalAlpha = 0.65;
      octx.lineWidth = 0.0024;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    // Fialovo-modrý stred s drobnými tyčinkami
    octx.fillStyle = '#1e1035';
    octx.beginPath();
    octx.arc(0, 0, R * 0.22, 0, Math.PI * 2);
    octx.fill();

    for (var j = 0; j < 9; j++) {
      var ja = j * (Math.PI * 2 / 9) + f.a0;
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
     - Veľké jemne zvlnené hodvábne lupene s čiernymi bazálnymi škvrnami
     - Zelená makovica a veniec žltých tyčiniek
  ------------------------------------------------------------- */
  function drawPoppy(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var numPetals = 4;
    for (var i = 0; i < numPetals; i++) {
      var ang = f.a0 + i * (Math.PI / 2) + 0.04 * Math.sin(time * 1.6 + i);
      var L = R * 1.18;
      var w = L * 0.74;

      octx.save();
      octx.rotate(ang);

      octx.beginPath();
      octx.moveTo(0, 0);
      octx.bezierCurveTo(L * 0.35, -w * 1.1, L * 0.85, -w * 0.85, L, 0);
      octx.bezierCurveTo(L * 0.85, w * 0.85, L * 0.35, w * 1.1, 0, 0);

      var g = octx.createRadialGradient(0, 0, L * 0.08, 0, 0, L);
      g.addColorStop(0, '#090204'); // Čierna báza lupienka maku
      g.addColorStop(0.20, '#450a0a');
      g.addColorStop(0.65, '#dc2626'); // Sýta maková červená
      g.addColorStop(1.0, '#f87171');  // Svetlý koralový okraj
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#1f0407';
      octx.globalAlpha = 0.65;
      octx.lineWidth = 0.0028;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    // Makovica a tyčinky
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
     4. POĽNÁ MARGARÉTA / RUMANČEK (Daisy)
     - 16 bielych lupeňov s ostrými separačnými hranami
     - Klenutý žltý terčík
  ------------------------------------------------------------- */
  function drawDaisy(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var petalCount = 16;
    for (var i = 0; i < petalCount; i++) {
      var ang = f.a0 + i * (Math.PI * 2 / petalCount) + 0.02 * Math.sin(time * 1.4 + i);
      var L = R;
      var w = L * 0.16;

      octx.save();
      octx.rotate(ang);

      octx.beginPath();
      octx.moveTo(R * 0.20, 0);
      octx.quadraticCurveTo(L * 0.5, -w, L, 0);
      octx.quadraticCurveTo(L * 0.5, w, R * 0.20, 0);

      var g = octx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, '#64748b'); // Tieň pri báze
      g.addColorStop(0.35, '#f1f5f9');
      g.addColorStop(1, '#ffffff'); // Čistá biela
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#1e293b';
      octx.globalAlpha = 0.55;
      octx.lineWidth = 0.0022;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    // Žltý terčík
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
    var L = f.r * b * 3.0;
    if (L <= 0.002) return;

    var tiers = 7;
    for (var tier = 0; tier < tiers; tier++) {
      var ty = -L * (tier / (tiers - 1));
      var floretCount = 4 + (tier % 2);
      var tierWidth = f.r * b * (0.42 - tier * 0.03);

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
    var L = f.r * b * 2.2;
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
     - Klenuté listy do strán s negatívnym priestorom
     - Výrazná stredová a bočná žilnatina
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

    // Stredová žila
    octx.beginPath();
    octx.moveTo(0, 0);
    octx.lineTo(0, len * 0.90);
    octx.strokeStyle = '#bbf7d0';
    octx.globalAlpha = 0.65;
    octx.lineWidth = 0.0026;
    octx.stroke();

    // Bočné žilky
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
