const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const assert = require('assert');

console.log('[TEST] Starting Browser Integration & Headless Chrome Audit...');

const projectRoot = path.resolve(__dirname, '..');
const PORT = 8139;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = urlObj.pathname;
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(projectRoot, pathname);
  if (!filePath.startsWith(projectRoot)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not Found: ' + pathname);
  }
});

server.listen(PORT, async () => {
  console.log(`[INFO] Test server listening on http://localhost:${PORT}`);

  try {
    const endpoints = [
      '/',
      '/index.html',
      '/gallery.html',
      '/sunflower.html',
      '/js/botanic.js',
      '/js/bouquet.js',
      '/js/ascii-render.js',
      '/js/particles.js',
      '/index.html?bloom=1'
    ];

    for (const ep of endpoints) {
      await new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}${ep}`, (res) => {
          assert.strictEqual(res.statusCode, 200, `Endpoint ${ep} returned status ${res.statusCode}`);
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            assert(data.length > 0, `Endpoint ${ep} returned empty body`);
            resolve();
          });
        }).on('error', reject);
      });
    }
    console.log('[PASS] All HTTP static endpoints and scripts resolved with HTTP 200');

    // Launch headless Chrome if available
    const chromeCandidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];

    let browserPath = chromeCandidates.find(p => fs.existsSync(p));

    if (browserPath) {
      console.log('[INFO] Found browser at:', browserPath);
      const testUrl = `http://localhost:${PORT}/index.html?bloom=1`;
      const tempUserData = path.join(os.tmpdir(), `browser-audit-${Date.now()}`);

      const args = [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        `--user-data-dir=${tempUserData}`,
        '--virtual-time-budget=2000',
        '--dump-dom',
        testUrl
      ];

      const dumpOutput = await new Promise((resolve, reject) => {
        const proc = spawn(browserPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', chunk => stdout += chunk);
        proc.stderr.on('data', chunk => stderr += chunk);
        proc.on('close', code => {
          if (code === 0) resolve(stdout);
          else reject(new Error(`Browser exited with code ${code}: ${stderr}`));
        });
        proc.on('error', reject);
      });

      assert(dumpOutput.includes('<canvas id="art"'), 'Canvas element is present in DOM');
      assert(!dumpOutput.includes('<button'), 'Pure index.html must have zero buttons');
      assert(!dumpOutput.includes('<nav'), 'Pure index.html must have zero navigation bars');
      console.log('[PASS] Browser headless DOM dump verified pure canvas structure with zero buttons or clutter!');

      // Also test gallery dedication page
      const galleryUrl = `http://localhost:${PORT}/gallery.html?to=Anna&msg=Krasny+den&from=Peter`;
      const galleryDump = await new Promise((resolve, reject) => {
        const proc = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', '--dump-dom', galleryUrl]);
        let stdout = '';
        proc.stdout.on('data', chunk => stdout += chunk);
        proc.on('close', code => resolve(stdout));
      });
      assert(galleryDump.includes('Pre Anna'), 'Gallery page preserves dedication parameter "to=Anna"');
      console.log('[PASS] Gallery dedication page also verified!');

      // Cleanup temp user data
      try {
        fs.rmSync(tempUserData, { recursive: true, force: true });
      } catch (e) {}
    } else {
      console.log('[WARN] No Chrome or Edge executable found for headless dump test, skipping browser test');
    }

    console.log('[SUCCESS] All browser integration checks passed successfully!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('[FAIL]', err);
    server.close();
    process.exit(1);
  }
});

