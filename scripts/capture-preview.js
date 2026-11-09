const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const PORT = 8146;

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
  const screenshotPath = path.join(projectRoot, 'preview.png');
  const tempUserData = path.join(os.tmpdir(), `chrome-prev-${Date.now()}`);

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${tempUserData}`,
    '--window-size=1200,980',
    '--virtual-time-budget=6000',
    `--screenshot=${screenshotPath}`,
    `http://localhost:${PORT}/index.html?bloom=1`
  ];

  try {
    await new Promise((resolve, reject) => {
      const proc = spawn(chromePath, args, { stdio: 'ignore' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Chrome exited with code ${code}`));
      });
      proc.on('error', reject);
    });

    const stats = fs.statSync(screenshotPath);
    console.log(`[SUCCESS] Preview captured: ${screenshotPath} (${stats.size} bytes)`);

    try {
      fs.rmSync(tempUserData, { recursive: true, force: true });
    } catch (e) {}

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('[ERROR]', err);
    server.close();
    process.exit(1);
  }
});
