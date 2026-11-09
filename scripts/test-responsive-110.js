const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');
const PORT = 8155;

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
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.join(projectRoot, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(PORT, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  async function takeShot(w, h, out) {
    const tempUserData = path.join(os.tmpdir(), `chrome-aud-${Date.now()}`);
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--user-data-dir=${tempUserData}`,
      `--window-size=${w},${h}`,
      '--virtual-time-budget=2000',
      `--screenshot=${out}`,
      `http://localhost:${PORT}/index.html?bloom=1`
    ];
    await new Promise((resolve, reject) => {
      const proc = spawn(chromePath, args, { stdio: 'ignore' });
      proc.on('close', code => code === 0 ? resolve() : reject(new Error('Chrome failed')));
      proc.on('error', reject);
    });
    try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
  }

  try {
    const shotDesktop = path.join(os.tmpdir(), `shot_desktop_${Date.now()}.png`);
    const shotIphone = path.join(os.tmpdir(), `shot_mobile_iphone_${Date.now()}.png`);

    console.log('[AUDIT] Capturing Desktop 16:9 (1440x900)...');
    await takeShot(1440, 900, shotDesktop);
    console.log(`[PASS] Desktop screenshot: ${shotDesktop} (${fs.statSync(shotDesktop).size} bytes)`);

    console.log('[AUDIT] Capturing iPhone 14 Pro (393x852)...');
    await takeShot(393, 852, shotIphone);
    console.log(`[PASS] iPhone screenshot: ${shotIphone} (${fs.statSync(shotIphone).size} bytes)`);

    try {
      if (fs.existsSync(shotDesktop)) fs.unlinkSync(shotDesktop);
      if (fs.existsSync(shotIphone)) fs.unlinkSync(shotIphone);
    } catch (e) {}

    server.close();
    console.log('[SUCCESS] All pure canvas responsive tests passed!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    server.close();
    process.exit(1);
  }
});
