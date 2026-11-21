const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const BG = '#030205';
const CREAM = '#efe7d6';

function phyllotaxis({ n, spread, dot, scale = 1 }) {
  const ga = Math.PI * (3 - Math.sqrt(5));
  let circles = '';
  for (let i = 1; i <= n; i++) {
    const r = spread * Math.sqrt(i) * scale;
    const t = i * ga;
    const s = (dot[0] + (dot[1] - dot[0]) * (i / n)) * scale;
    circles += `<circle cx="${(50 + r * Math.cos(t)).toFixed(2)}" cy="${(50 + r * Math.sin(t)).toFixed(2)}" r="${s.toFixed(2)}"/>`;
  }
  return `<g fill="${CREAM}">${circles}</g>`;
}

const DETAIL = {
  large: { n: 160, spread: 2.55, dot: [0.55, 1.7] },
  small: { n: 34, spread: 5.6, dot: [1.6, 3.4] }
};

const OUTPUTS = [
  { file: 'favicon-32.png', size: 32, shape: 'rounded', detail: 'small' },
  { file: 'apple-touch-icon.png', size: 180, shape: 'square', detail: 'large' },
  { file: 'icon-192.png', size: 192, shape: 'square', detail: 'large' },
  { file: 'icon-512.png', size: 512, shape: 'square', detail: 'large' },
  { file: 'icon-maskable-512.png', size: 512, shape: 'square', detail: 'large', scale: 0.8 }
];

function iconSvg(o) {
  const radius = o.shape === 'rounded' ? 22 : 0;
  const motif = phyllotaxis({ ...DETAIL[o.detail], scale: o.scale || 1 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${o.size}" height="${o.size}">` +
    `<rect width="100" height="100" rx="${radius}" fill="${BG}"/>${motif}</svg>`;
}

function pageHtml(o) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:${o.size}px;height:${o.size}px;overflow:hidden;background:transparent}
  svg{display:block}
</style></head><body>${iconSvg(o)}</body></html>`;
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
  const outDir = path.join(projectRoot, 'assets', 'icons');
  fs.mkdirSync(outDir, { recursive: true });
  for (const o of OUTPUTS) {
    const out = path.join(outDir, o.file);
    await render(pageHtml(o), o.size, out);
    console.log('[OK]', path.relative(projectRoot, out));
  }
}

main().catch(err => { console.error('[ERROR]', err.message); process.exit(1); });
