const { spawn } = require('child_process');
const http = require('http');
const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9244',
  '--no-sandbox',
  '--disable-gpu',
  'about:blank'
]);

setTimeout(async () => {
  const tabs = await new Promise((res, rej) => http.get('http://localhost:9244/json', r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
  }));
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const c = document.createElement('canvas');
          const ctx = c.getContext('2d');
          ctx.font = '500 100px "JetBrains Mono", monospace';
          const m = ctx.measureText('M');
          return { width: m.width, font: ctx.font };
        })()`,
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

