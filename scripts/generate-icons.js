/**
 * Generuje PWA ikonky (favicon, apple-touch-icon, Android/manifest ikonky)
 * renderovaním malej HTML šablóny v headless Chrome.
 *
 * Použitie:
 *   node scripts/generate-icons.js                 -> varianta "heart" do assets/icons/
 *   node scripts/generate-icons.js --variant=star  -> iná varianta
 *   node scripts/generate-icons.js --preview=DIR   -> všetky varianty do DIR (na porovnanie)
 *
 * Potrebuje Google Chrome a internet (font JetBrains Mono sa načíta z Google Fonts).
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const BG = '#030205';
const GOLD = '#fbbf24';
const INK = '#fbf6e2';

/* Kvetinová silueta z pôvodného faviconu (viewBox 0 0 32 32). */
const FLOWER_PATH = 'M 26.80 16.29 C 26.48 16.57, 26.09 16.83, 25.74 17.07 C 25.39 17.31, 25.04 17.52, 24.68 17.71 C 24.32 17.90, 23.61 17.96, 23.59 18.20 C 23.57 18.44, 24.16 18.77, 24.55 19.14 C 24.94 19.51, 25.53 19.97, 25.95 20.42 C 26.38 20.87, 26.81 21.39, 27.10 21.86 C 27.39 22.33, 27.58 22.81, 27.70 23.26 C 27.83 23.71, 27.86 24.15, 27.85 24.57 C 27.84 24.99, 27.77 25.40, 27.64 25.76 C 27.51 26.12, 27.29 26.45, 27.04 26.73 C 26.79 27.01, 26.46 27.23, 26.16 27.46 C 25.86 27.69, 25.58 27.93, 25.25 28.11 C 24.92 28.29, 24.57 28.47, 24.19 28.57 C 23.81 28.67, 23.40 28.72, 22.99 28.73 C 22.58 28.74, 22.15 28.72, 21.73 28.64 C 21.30 28.56, 20.87 28.43, 20.44 28.26 C 20.01 28.09, 19.57 27.84, 19.17 27.60 C 18.77 27.36, 18.39 27.11, 18.03 26.84 C 17.67 26.57, 17.32 26.27, 17.01 25.97 C 16.70 25.67, 16.41 25.35, 16.15 25.06 C 15.89 24.77, 15.65 24.45, 15.44 24.24 C 15.23 24.03, 15.05 23.79, 14.86 23.79 C 14.67 23.79, 14.51 24.06, 14.32 24.24 C 14.13 24.42, 13.93 24.63, 13.70 24.86 C 13.47 25.09, 13.24 25.31, 12.96 25.59 C 12.68 25.88, 12.38 26.25, 12.04 26.57 C 11.70 26.90, 11.33 27.24, 10.94 27.54 C 10.55 27.84, 10.14 28.14, 9.72 28.37 C 9.30 28.60, 8.86 28.80, 8.44 28.92 C 8.02 29.04, 7.61 29.09, 7.20 29.11 C 6.79 29.13, 6.40 29.08, 6.00 29.04 C 5.60 29.00, 5.17 28.96, 4.78 28.86 C 4.39 28.76, 4.02 28.61, 3.68 28.42 C 3.34 28.23, 3.04 27.98, 2.74 27.74 C 2.44 27.50, 2.11 27.27, 1.87 26.97 C 1.63 26.67, 1.42 26.34, 1.29 25.96 C 1.16 25.59, 1.10 25.16, 1.11 24.72 C 1.11 24.28, 1.19 23.81, 1.32 23.35 C 1.45 22.89, 1.62 22.42, 1.87 21.96 C 2.12 21.50, 2.47 21.02, 2.79 20.59 C 3.11 20.16, 3.41 19.77, 3.78 19.39 C 4.15 19.01, 4.58 18.65, 5.00 18.33 C 5.42 18.01, 6.05 17.70, 6.31 17.45 C 6.57 17.20, 6.67 17.04, 6.58 16.85 C 6.49 16.66, 6.03 16.49, 5.78 16.29 C 5.53 16.08, 5.28 15.86, 5.06 15.62 C 4.84 15.38, 4.66 15.13, 4.48 14.87 C 4.30 14.61, 4.14 14.33, 4.00 14.04 C 3.86 13.75, 3.73 13.44, 3.66 13.15 C 3.59 12.85, 3.56 12.56, 3.56 12.27 C 3.56 11.98, 3.58 11.69, 3.64 11.41 C 3.70 11.13, 3.81 10.87, 3.90 10.60 C 3.99 10.33, 4.05 10.03, 4.18 9.78 C 4.31 9.53, 4.50 9.30, 4.70 9.09 C 4.89 8.88, 5.11 8.70, 5.35 8.53 C 5.59 8.36, 5.84 8.21, 6.12 8.10 C 6.40 7.99, 6.70 7.91, 7.01 7.87 C 7.32 7.83, 7.67 7.81, 8.00 7.84 C 8.33 7.87, 8.69 7.95, 9.02 8.02 C 9.35 8.10, 9.67 8.18, 9.98 8.29 C 10.29 8.40, 10.59 8.52, 10.88 8.66 C 11.17 8.79, 11.45 8.96, 11.70 9.10 C 11.95 9.24, 12.19 9.41, 12.40 9.51 C 12.61 9.61, 12.81 9.83, 12.95 9.69 C 13.09 9.56, 13.14 9.05, 13.26 8.70 C 13.38 8.35, 13.53 7.99, 13.69 7.60 C 13.85 7.21, 14.03 6.75, 14.25 6.36 C 14.47 5.97, 14.72 5.58, 14.99 5.25 C 15.26 4.92, 15.55 4.64, 15.85 4.40 C 16.15 4.16, 16.48 3.97, 16.80 3.83 C 17.12 3.69, 17.44 3.63, 17.77 3.57 C 18.10 3.51, 18.45 3.45, 18.77 3.47 C 19.09 3.49, 19.40 3.59, 19.70 3.68 C 20.00 3.77, 20.30 3.89, 20.58 4.03 C 20.86 4.18, 21.13 4.36, 21.38 4.55 C 21.63 4.74, 21.89 4.93, 22.09 5.18 C 22.29 5.43, 22.50 5.69, 22.59 6.06 C 22.68 6.43, 22.67 6.92, 22.63 7.38 C 22.59 7.83, 22.53 8.29, 22.37 8.79 C 22.21 9.29, 21.73 10.01, 21.64 10.38 C 21.55 10.75, 21.51 10.99, 21.84 11.03 C 22.17 11.08, 23.02 10.74, 23.62 10.65 C 24.22 10.56, 24.96 10.47, 25.45 10.52 C 25.94 10.57, 26.26 10.77, 26.58 10.96 C 26.90 11.15, 27.14 11.39, 27.34 11.65 C 27.54 11.91, 27.67 12.21, 27.79 12.51 C 27.91 12.81, 28.03 13.12, 28.07 13.43 C 28.11 13.75, 28.10 14.08, 28.03 14.40 C 27.96 14.72, 27.84 15.07, 27.64 15.38 C 27.44 15.69, 27.12 16.01, 26.80 16.29 Z M 16 12.35 A 3.65 3.65 0 1 0 16 19.65 A 3.65 3.65 0 1 0 16 12.35 Z';

/*
 * Každá varianta vracia obsah ikony. `scale` = aká časť plochy sa môže použiť
 * (maskable ikonky na Androide musia mať motív v strednom "safe zone").
 */
const VARIANTS = {
  // "<3" vysádzané v JetBrains Mono, zlaté na čiernom (rovnaké ako ASCII na stránke)
  heart: (size, scale) =>
    `<div class="txt" style="font-size:${size * 0.40 * scale}px;color:${GOLD};letter-spacing:-0.06em">&lt;3</div>`,
  // to isté v krémovej farbe textu
  'heart-ink': (size, scale) =>
    `<div class="txt" style="font-size:${size * 0.40 * scale}px;color:${INK};letter-spacing:-0.06em">&lt;3</div>`,
  // geometrický ASCII "*" ako malý kvet / slnko
  star: (size, scale) => {
    const r = 150 * scale, w = 46 * scale;
    const lines = [0, 60, 120].map(a =>
      `<line x1="256" y1="${256 - r}" x2="256" y2="${256 + r}" transform="rotate(${a} 256 256)"/>`).join('');
    return `<svg viewBox="0 0 512 512" width="${size}" height="${size}"><g stroke="${GOLD}" stroke-width="${w}" stroke-linecap="round">${lines}</g></svg>`;
  },
  // pôvodná kvetinová silueta
  flower: (size, scale) => {
    const s = 0.62 * scale, off = 16 - 16 / s;
    return `<svg viewBox="${off} ${off} ${32 / s} ${32 / s}" width="${size}" height="${size}"><path fill="${GOLD}" fill-rule="evenodd" d="${FLOWER_PATH}"/></svg>`;
  }
};

/* name, px, shape: 'square' (plný štvorec – iOS/Android si zaobľujú sami) | 'rounded' (favicon v tabe) */
const OUTPUTS = [
  { file: 'favicon-32.png', size: 32, shape: 'rounded', scale: 1.15 },
  { file: 'apple-touch-icon.png', size: 180, shape: 'square', scale: 1 },
  { file: 'icon-192.png', size: 192, shape: 'square', scale: 1 },
  { file: 'icon-512.png', size: 512, shape: 'square', scale: 1 },
  { file: 'icon-maskable-512.png', size: 512, shape: 'square', scale: 0.78 }
];

function pageHtml(variant, size, shape, scale) {
  const radius = shape === 'rounded' ? Math.round(size * 0.22) : 0;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&display=block" rel="stylesheet">
<style>
  html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}
  .bg{width:${size}px;height:${size}px;background:${BG};border-radius:${radius}px;
      display:flex;align-items:center;justify-content:center}
  .txt{font-family:"JetBrains Mono",monospace;font-weight:600;line-height:1;
       /* opticky vycentruj – mono glyfy sedia trochu nízko */ transform:translate(-0.02em,-0.04em)}
  svg{display:block}
</style></head><body><div class="bg">${VARIANTS[variant](size, scale)}</div></body></html>`;
}

function render(html, size, outFile) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-'));
  const htmlFile = path.join(tmp, 'icon.html');
  fs.writeFileSync(htmlFile, html);
  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--user-data-dir=${path.join(tmp, 'profile')}`,
    `--window-size=${size},${size}`,
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    '--virtual-time-budget=4000',
    `--screenshot=${outFile}`,
    'file:///' + htmlFile.replace(/\\/g, '/')
  ];
  return new Promise((resolve, reject) => {
    const proc = spawn(CHROME, args, { stdio: 'ignore' });
    proc.on('error', reject);
    proc.on('close', code => {
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
      code === 0 ? resolve() : reject(new Error(`Chrome exited with code ${code}`));
    });
  });
}

async function main() {
  const arg = name => (process.argv.find(a => a.startsWith(`--${name}=`)) || '').split('=')[1];
  const previewDir = arg('preview');

  if (previewDir) {
    fs.mkdirSync(previewDir, { recursive: true });
    for (const v of Object.keys(VARIANTS)) {
      for (const o of [OUTPUTS[0], OUTPUTS[1]]) {
        const out = path.join(previewDir, `${v}-${o.file}`);
        await render(pageHtml(v, o.size, o.shape, o.scale), o.size, out);
        console.log('[OK]', out);
      }
    }
    return;
  }

  const variant = arg('variant') || 'heart';
  if (!VARIANTS[variant]) throw new Error(`Neznáma varianta "${variant}". Možnosti: ${Object.keys(VARIANTS).join(', ')}`);
  const outDir = path.join(projectRoot, 'assets', 'icons');
  fs.mkdirSync(outDir, { recursive: true });
  for (const o of OUTPUTS) {
    const out = path.join(outDir, o.file);
    await render(pageHtml(variant, o.size, o.shape, o.scale), o.size, out);
    console.log('[OK]', path.relative(projectRoot, out));
  }
}

main().catch(err => { console.error('[ERROR]', err.message); process.exit(1); });
