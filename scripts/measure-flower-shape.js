const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9245',
  '--no-sandbox',
  '--disable-gpu',
  'about:blank'
]);

setTimeout(async () => {
  const tabs = await new Promise((res, rej) => http.get('http://localhost:9245/json', r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
  }));
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  const imgBase64 = fs.readFileSync(path.resolve(__dirname, '..', 'shot_mobile_iphone.png')).toString('base64');

  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const c = document.createElement('canvas');
              c.width = img.width; c.height = img.height;
              const ctx = c.getContext('2d');
              ctx.drawImage(img, 0, 0);
              const data = ctx.getImageData(0, 0, c.width, c.height).data;

              // Find golden pixels around center sunflower (y between 300 and 550, x between 50 and 350)
              let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
              for (let y = 300; y < 550; y++) {
                for (let x = 50; x < 350; x++) {
                  const idx = (y * c.width + x) * 4;
                  const r = data[idx], g = data[idx+1], b = data[idx+2];
                  // Golden yellow color (r > 180, g > 130, b < 100)
                  if (r > 180 && g > 130 && b < 100) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                  }
                }
              }
              resolve({
                width: maxX - minX,
                height: maxY - minY,
                ratio: (maxX - minX) / (maxY - minY),
                bbox: { minX, maxX, minY, maxY }
              });
            };
            img.src = 'data:image/png;base64,' + "${imgBase64}";
          });
        })()`,
        awaitPromise: true,
        returnByValue: true
      }
    }));
  };
  ws.onmessage = evt => {
    console.log(JSON.parse(evt.data).result.result.value);
    ws.close();
    proc.kill();
    process.exit(0);
  };
}, 1000);

