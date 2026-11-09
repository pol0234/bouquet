// js/botanic.js
// Procedural botanical geometry and sunflower bouquet engine
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
    var c1 = 1.4, c3 = c1 + 1;
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

  // Color palettes for stems and leaves
  var STEM_COL = ['#4f8c32', '#62a83e', '#3d7225', '#74b848'];
  var LEAF_COL = [
    ['#18451c', '#439436'],
    ['#1d5324', '#58ac42'],
    ['#133816', '#357d2a'],
    ['#24662d', '#72c458']
  ];

  /* Factory for a flower definition */
  function createFlower(def, seed) {
    var rnd = mulberry32(seed || 9411);
    var f = {
      t: 'sunflower',
      x: 0.5,
      y: 0.5,
      r: 0.14,
      rot: 0,
      d: 0.25,
      ph: rnd() * 6.28,
      bx: 0.5 + (rnd() - 0.5) * 0.08,
      by: 1.25,
      bow: (rnd() - 0.5) * 0.12,
      a0: rnd() * 1.0,
      stemCol: STEM_COL[Math.floor(rnd() * STEM_COL.length)],
      stemW: 0.010 + rnd() * 0.004,
      c: ['#854d0e', '#eab308', '#fef08a'],
      centerCol: ['#1e0d05', '#52250d', '#a15814', '#eab308']
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

  /* 1. SLNEČNICA (Sunflower - Helianthus annuus) */
  function drawSunflower(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var numPetals = 28;
    var discRadius = R * 0.40;

    // A. Zákrov / Zelené sepaly pod kvetom (Involucral bracts)
    octx.save();
    var sepalCount = 14;
    for (var s = 0; s < sepalCount; s++) {
      var sang = f.a0 + s * (Math.PI * 2 / sepalCount) + 0.05;
      var slen = R * 0.55;
      var swid = slen * 0.26;
      octx.save();
      octx.rotate(sang);
      octx.beginPath();
      octx.moveTo(0, 0);
      octx.quadraticCurveTo(slen * 0.5, -swid, slen, 0);
      octx.quadraticCurveTo(slen * 0.5, swid, 0, 0);
      octx.fillStyle = (s % 2 === 0) ? '#1b4012' : '#2b5a1c';
      octx.fill();
      octx.restore();
    }
    octx.restore();

    // B. Okvetné lupene (Ray florets) - 2 vrstvy pre prirodzenú hĺbku
    // Pass 0: Vonkajšia vrstva (dlhšia, sýtejšia)
    // Pass 1: Vnútorná vrstva (posunutá, jasnejšia, svetlejšia)
    for (var pass = 0; pass < 2; pass++) {
      var passLen = (pass === 0) ? R : R * 0.88;
      var passWidth = passLen * 0.17;
      var passOffset = pass * (Math.PI / numPetals);

      for (var i = 0; i < numPetals; i++) {
        var baseAng = f.a0 + i * (Math.PI * 2 / numPetals) + passOffset;
        // Jemný organický vánok na lupeňoch
        var sway = 0.024 * Math.sin(time * 1.8 + f.ph + i * 0.8 + pass * 2.1);
        var ang = baseAng + sway;
        var pLen = passLen * (1 + 0.04 * Math.sin(i * 3 + f.ph));

        octx.save();
        octx.rotate(ang);

        octx.beginPath();
        octx.moveTo(discRadius * 0.7, 0);
        // Lanceolátny tvar lupienka slnečnice s jemnou špičkou
        octx.bezierCurveTo(
          pLen * 0.35, -passWidth * 1.15,
          pLen * 0.75, -passWidth * 0.85,
          pLen, 0
        );
        octx.bezierCurveTo(
          pLen * 0.75, passWidth * 0.85,
          pLen * 0.35, passWidth * 1.15,
          discRadius * 0.7, 0
        );

        // Prechod od jantárovej bázy po slnečne žiarivý hrot
        var grad = octx.createLinearGradient(discRadius * 0.7, 0, pLen, 0);
        if (pass === 0) {
          grad.addColorStop(0, f.c[0]);   // '#854d0e' tmavý jantár pri báze
          grad.addColorStop(0.35, f.c[1]);// '#eab308' zlatá žltá
          grad.addColorStop(1, f.c[2]);   // '#fef08a' svetlá špička
        } else {
          grad.addColorStop(0, f.c[1]);
          grad.addColorStop(0.4, f.c[2]);
          grad.addColorStop(1, '#fffde0');
        }

        octx.fillStyle = grad;
        octx.fill();

        // Tmavý separačný obrys
        octx.strokeStyle = '#231206';
        octx.globalAlpha = 0.45;
        octx.lineWidth = 0.0022;
        octx.stroke();

        // Pozdĺžna stredová ryha lupienka (vein crease)
        octx.beginPath();
        octx.moveTo(discRadius * 0.85, 0);
        octx.lineTo(pLen * 0.82, 0);
        octx.strokeStyle = '#fff5a0';
        octx.globalAlpha = (pass === 1) ? 0.45 : 0.28;
        octx.lineWidth = 0.0024;
        octx.stroke();

        octx.globalAlpha = 1;
        octx.restore();
      }
    }

    // C. Centrálny terč s Fibonacciho špirálami (Disc Florets - Phyllotaxis)
    // Základné podfarbenie terča radiálnym gradientom
    var discGrad = octx.createRadialGradient(0, 0, 0, 0, 0, discRadius);
    var cc = f.centerCol || ['#1c0c05', '#48200c', '#8a4312', '#d97706'];
    discGrad.addColorStop(0, cc[0]);      // Hlboký zamatový čokoládový stred
    discGrad.addColorStop(0.45, cc[1]);   // Tmavé semienka v jadre
    discGrad.addColorStop(0.80, cc[2]);   // Zlatohnedý prstenec otvárajúcich sa kvietkov
    discGrad.addColorStop(1.0, cc[3]);    // Zlatý prstenec peľu na obvode

    octx.beginPath();
    octx.arc(0, 0, discRadius, 0, Math.PI * 2);
    octx.fillStyle = discGrad;
    octx.fill();

    // Fibonacciho semenné body (Vogel's spiral pattern)
    // Tieto body v nízko-rozlíšenom vzorkovači generujú dokonalú organickú textúru slnečnice
    var numSeeds = 90;
    for (var k = 1; k <= numSeeds; k++) {
      var rFrac = Math.sqrt(k / numSeeds);
      var rk = discRadius * rFrac * 0.95;
      var thetak = k * PHI_ANGLE + f.a0;
      var sx = Math.cos(thetak) * rk;
      var sy = Math.sin(thetak) * rk;

      // Farba peľu / floretu podľa vzdialenosti od stredu
      if (rFrac > 0.72) {
        octx.fillStyle = '#ffcf33'; // Zlatý peľ na okraji
        octx.globalAlpha = 0.85;
      } else if (rFrac > 0.4) {
        octx.fillStyle = '#9c4d16'; // Hnedasto-jantárové puky
        octx.globalAlpha = 0.65;
      } else {
        octx.fillStyle = '#2f1509'; // Tmavý stred
        octx.globalAlpha = 0.50;
      }

      var seedSize = 0.0035 * (0.6 + 0.6 * rFrac);
      octx.beginPath();
      octx.arc(sx, sy, seedSize, 0, Math.PI * 2);
      octx.fill();
    }
    octx.globalAlpha = 1;
  }

  /* 2. NEVÄDZA / MODRÁ CHRPA (Cornflower - Centaurea cyanus) */
  function drawCornflower(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var petalCount = 10;
    for (var i = 0; i < petalCount; i++) {
      var ang = f.a0 + i * (Math.PI * 2 / petalCount) + 0.03 * Math.sin(time * 1.5 + i);
      var L = R * (0.85 + 0.15 * Math.sin(i * 2 + f.ph));
      var w = L * 0.28;

      octx.save();
      octx.rotate(ang);

      // Zúbkovaný, strapkatý okraj nevädze
      octx.beginPath();
      octx.moveTo(0, 0);
      octx.lineTo(L * 0.5, -w * 0.7);
      octx.lineTo(L * 0.85, -w);
      octx.lineTo(L * 0.9, -w * 0.4);
      octx.lineTo(L, 0); // Centrálny hrot
      octx.lineTo(L * 0.9, w * 0.4);
      octx.lineTo(L * 0.85, w);
      octx.lineTo(L * 0.5, w * 0.7);
      octx.closePath();

      var g = octx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, f.c[0]);   // Hlboká indigo modrá pri báze
      g.addColorStop(0.5, f.c[1]); // Sýta kráľovská modrá
      g.addColorStop(1, f.c[2]);   // Nebeská azúrová na zúbkoch
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#051126';
      octx.globalAlpha = 0.5;
      octx.lineWidth = 0.0024;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    // Fialovo-modrý stred s drobnými tyčinkami
    octx.fillStyle = '#311042';
    octx.beginPath();
    octx.arc(0, 0, R * 0.22, 0, Math.PI * 2);
    octx.fill();

    for (var j = 0; j < 8; j++) {
      var ja = j * (Math.PI * 2 / 8);
      var jx = Math.cos(ja) * R * 0.16;
      var jy = Math.sin(ja) * R * 0.16;
      octx.fillStyle = '#a78bfa';
      octx.beginPath();
      octx.arc(jx, jy, 0.0032, 0, Math.PI * 2);
      octx.fill();
    }
  }

  /* 3. POĽNÝ MAK (Wild Poppy - Papaver rhoeas) */
  function drawPoppy(octx, f, b, time) {
    var R = f.r * b;
    if (R <= 0.001) return;

    var numPetals = 4;
    for (var i = 0; i < numPetals; i++) {
      var ang = f.a0 + i * (Math.PI / 2) + 0.04 * Math.sin(time * 1.6 + i);
      var L = R * 1.1;
      var w = L * 0.75;

      octx.save();
      octx.rotate(ang);

      // Veľký jemne zvlnený hodvábny lupeň maku
      octx.beginPath();
      octx.moveTo(0, 0);
      octx.bezierCurveTo(L * 0.3, -w * 1.1, L * 0.8, -w * 0.9, L, 0);
      octx.bezierCurveTo(L * 0.8, w * 0.9, L * 0.3, w * 1.1, 0, 0);

      var g = octx.createRadialGradient(0, 0, L * 0.1, 0, 0, L);
      g.addColorStop(0, '#150305'); // Čierna škvrna pri báze maku
      g.addColorStop(0.25, f.c[0]);// '#7f1d1d' rubínový tieň
      g.addColorStop(0.65, f.c[1]);// '#ef4444' jasná maková červená
      g.addColorStop(1.0, f.c[2]); // '#fca5a5' teplá svetlá linka okraja
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#2b070b';
      octx.globalAlpha = 0.55;
      octx.lineWidth = 0.0026;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    // Makovica v strede (tmavá kapsula a žlté peľnice)
    octx.fillStyle = '#0f1710';
    octx.beginPath();
    octx.arc(0, 0, R * 0.18, 0, Math.PI * 2);
    octx.fill();

    octx.fillStyle = '#fde047';
    for (var p = 0; p < 12; p++) {
      var pa = p * (Math.PI * 2 / 12);
      var px = Math.cos(pa) * R * 0.22;
      var py = Math.sin(pa) * R * 0.22;
      octx.beginPath();
      octx.arc(px, py, 0.0028, 0, Math.PI * 2);
      octx.fill();
    }
  }

  /* 4. KAMILKA / SEDMOKRÁSKA (Daisy / Chamomile) */
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
      octx.moveTo(R * 0.2, 0);
      octx.quadraticCurveTo(L * 0.5, -w, L, 0);
      octx.quadraticCurveTo(L * 0.5, w, R * 0.2, 0);

      var g = octx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, '#94a3b8'); // Jemný tieň pri báze
      g.addColorStop(0.3, '#f1f5f9');
      g.addColorStop(1, '#ffffff'); // Čistá žiarivá biela
      octx.fillStyle = g;
      octx.fill();

      octx.strokeStyle = '#334155';
      octx.globalAlpha = 0.35;
      octx.lineWidth = 0.002;
      octx.stroke();

      octx.globalAlpha = 1;
      octx.restore();
    }

    // Žltý klenutý terčík
    var dg = octx.createRadialGradient(0, 0, 0, 0, 0, R * 0.26);
    dg.addColorStop(0, '#ca8a04');
    dg.addColorStop(0.7, '#eab308');
    dg.addColorStop(1, '#fde047');
    octx.beginPath();
    octx.arc(0, 0, R * 0.26, 0, Math.PI * 2);
    octx.fillStyle = dg;
    octx.fill();
  }

  /* 5. LEVANDUĽA / ŠALVIA (Lavender / Salvia Spike) */
  function drawLavender(octx, f, b, time) {
    var L = f.r * b * 2.8;
    if (L <= 0.002) return;

    var tiers = 7;
    for (var tier = 0; tier < tiers; tier++) {
      var ty = -L * (tier / (tiers - 1));
      var floretCount = 4 + (tier % 2);
      var tierWidth = f.r * b * (0.45 - tier * 0.035);

      for (var fl = 0; fl < floretCount; fl++) {
        var side = (fl % 2 === 0) ? -1 : 1;
        var offX = side * tierWidth * (0.4 + (fl / floretCount) * 0.6);
        var offY = ty + (fl - floretCount / 2) * 0.006;

        octx.save();
        octx.translate(offX, offY);
        octx.rotate(side * 0.35 + 0.04 * Math.sin(time * 1.5 + tier + fl));

        octx.beginPath();
        octx.ellipse(0, 0, 0.012 * b, 0.006 * b, 0, 0, Math.PI * 2);

        var g = octx.createLinearGradient(0, 0, side * 0.012 * b, 0);
        g.addColorStop(0, f.c[0]); // '#4a154b'
        g.addColorStop(0.5, f.c[1]); // '#9333ea'
        g.addColorStop(1, f.c[2]); // '#e9d5ff'
        octx.fillStyle = g;
        octx.fill();
        octx.restore();
      }
    }
  }

  /* 6. PUK (Botanical Bud) */
  function drawBud(octx, f, b, time) {
    var L = f.r * b * 2.2;
    var w = L * 0.26;
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
      octx.globalAlpha = 0.75;
      octx.lineWidth = 0.003;
      octx.stroke();

      octx.beginPath();
      octx.moveTo(0, -L * 0.1);
      octx.lineTo(0, -L * 0.85);
      octx.strokeStyle = f.c[2];
      octx.globalAlpha = 0.4;
      octx.lineWidth = 0.0026;
      octx.stroke();
      octx.globalAlpha = 1;
      octx.restore();
    }
  }

  /* 7. ŠIROKÝ SRDCOVITÝ LIST SLNEČNICE (Helianthus Foliage) */
  function drawSunflowerLeaf(octx, L, T, time, wind, flowerRef) {
    var g = eo(clamp((T - L.d) / 1.3));
    if (g <= 0.02) return;

    var p = bez(flowerRef, L.tt);
    var th = L.side * L.ang + wind * 0.06 * Math.sin(time * 1.25 + L.ph);
    var len = L.len * g;
    var wid = L.wid * (0.45 + 0.55 * g);

    octx.save();
    octx.translate(p.x, p.y);
    octx.rotate(th - Math.PI / 2);

    // Srdcovitý, robustný list slnečnice s bočnými žilkami
    octx.beginPath();
    octx.moveTo(0, 0);
    // Ľavá polovička čepele
    octx.bezierCurveTo(-wid * 0.8, len * 0.2, -wid * 1.1, len * 0.6, 0, len);
    // Pravá polovička čepele
    octx.bezierCurveTo(wid * 1.1, len * 0.6, wid * 0.8, len * 0.2, 0, 0);
    octx.closePath();

    var gr = octx.createLinearGradient(0, 0, 0, len);
    gr.addColorStop(0, L.c[0]); // Tmavozelená báza listu
    gr.addColorStop(1, L.c[1]); // Svieža botanická zeleň na špičke
    octx.fillStyle = gr;
    octx.fill();

    octx.strokeStyle = '#071809';
    octx.globalAlpha = 0.55;
    octx.lineWidth = 0.0028;
    octx.stroke();

    // Hlavná stredná žila (midrib)
    octx.beginPath();
    octx.moveTo(0, 0);
    octx.lineTo(0, len * 0.92);
    octx.strokeStyle = L.c[1];
    octx.globalAlpha = 0.6;
    octx.lineWidth = 0.0026;
    octx.stroke();

    // Bočné bohato vetvené žilky
    var veinCount = 4;
    for (var v = 1; v <= veinCount; v++) {
      var vy = len * (v / (veinCount + 1));
      var vw = wid * Math.sin(Math.PI * (v / (veinCount + 1))) * 0.65;
      octx.beginPath();
      octx.moveTo(0, vy);
      octx.lineTo(-vw, vy + len * 0.12);
      octx.moveTo(0, vy);
      octx.lineTo(vw, vy + len * 0.12);
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
    octx.rotate(f.rot + f.sw * 3.0);

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
