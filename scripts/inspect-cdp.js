const http = require('http');
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempUserData = path.join(os.tmpdir(), 'chrome-ins-' + Date.now());

// Start local static server
const PORT = 8166;
const projectRoot = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = urlObj.pathname;
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(projectRoot, pathname);
  if (require('fs').existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': pathname.endsWith('.js') ? 'application/javascript' : 'text/html' });
    require('fs').createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(PORT, async () => {
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9233',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${tempUserData}`,
    '--window-size=393,852',
    `http://localhost:${PORT}/index.html?bloom=1`
  ]);

  setTimeout(async () => {
    try {
      const tabs = await new Promise((resolve, reject) => {
        http.get('http://localhost:9233/json', res => {
          let buf = '';
          res.on('data', c => buf += c);
          res.on('end', () => resolve(JSON.parse(buf)));
        }).on('error', reject);
      });
      const pageTab = tabs.find(t => t.type === 'page');
      const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `({
              innerWidth: window.innerWidth,
              innerHeight: window.innerHeight,
              canvas: {
                width: document.getElementById('art').width,
                height: document.getElementById('art').height,
                styleWidth: document.getElementById('art').style.width,
                styleHeight: document.getElementById('art').style.height,
                boundingClientRect: document.getElementById('art').getBoundingClientRect()
              }
            })`,
            returnByValue: true
          }
        }));
      };

      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === 1) {
          console.log('DOM & Canvas Metrics:', JSON.stringify(msg.result.result ? msg.result.result.value : msg, null, 2));
          ws.close();
          proc.kill();
          server.close();
          try { require('fs').rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
          process.exit(0);
        }
      };
    } catch (err) {
      console.error(err);
      proc.kill();
      server.close();
      process.exit(1);
    }
  }, 1800);
});
