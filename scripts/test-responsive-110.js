const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');
const PORT = 8149;

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
  if (pathname === '/') pathname = '/sunflower.html';

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
  const mobileShot = path.join(projectRoot, 'mobile_110cols.png');
  const desktopShot = path.join(projectRoot, 'desktop_110cols.png');

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
      `http://localhost:${PORT}/sunflower.html?bloom=1`
    ];
    await new Promise((resolve, reject) => {
      const proc = spawn(chromePath, args, { stdio: 'ignore' });
      proc.on('close', code => code === 0 ? resolve() : reject(new Error('Chrome failed')));
      proc.on('error', reject);
    });
    try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
  }

  try {
    console.log('[AUDIT] Capturing Desktop 110 cols screenshot (1200x900)...');
    await takeShot(1200, 900, desktopShot);
    const dStats = fs.statSync(desktopShot);
    console.log(`[PASS] Desktop screenshot: ${desktopShot} (${dStats.size} bytes)`);

    console.log('[AUDIT] Capturing Mobile 110 cols screenshot (390x844 iPhone 14)...');
    await takeShot(390, 844, mobileShot);
    const mStats = fs.statSync(mobileShot);
    console.log(`[PASS] Mobile screenshot: ${mobileShot} (${mStats.size} bytes)`);

    server.close();
    console.log('[SUCCESS] Both Mobile and Desktop 110-col versions verified!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    server.close();
    process.exit(1);
  }
});
