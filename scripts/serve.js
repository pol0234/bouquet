/**
 * Jednoduchý lokálny server na test na mobile cez Wi-Fi.
 *   npm run serve        (alebo: node scripts/serve.js 8080)
 * Vypíše adresy, ktoré otvoríš v Safari / Chrome na telefóne (musí byť na rovnakej Wi-Fi).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2]) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.normalize(path.join(root, pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); return res.end('Not Found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Server beží. Na PC: http://localhost:${PORT}/`);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family === 'IPv4' && !a.internal) console.log(`Na mobile (rovnaká Wi-Fi): http://${a.address}:${PORT}/`);
    }
  }
  console.log('Zastavíš cez Ctrl+C.');
});
