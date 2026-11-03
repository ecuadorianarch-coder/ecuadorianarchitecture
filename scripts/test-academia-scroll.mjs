import { spawn } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9337;
const USER_DATA_DIR = path.join(os.tmpdir(), `chrome-test-${Date.now()}`);

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=1200,800',
    '--disable-gpu',
    'http://localhost:5173/academia/ciudad-y-rio'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const list = await fetchJson(`http://127.0.0.1:${PORT}/json`);
    const page = list.find(t => t.type === 'page');
    if (!page) throw new Error('No page target');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE [', msg.params.type, ']:', msg.params.args?.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', msg.params.exceptionDetails);
      }
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise(resolve => ws.onopen = resolve);

    const send = (method, params = {}) => new Promise((resolve) => {
      const currentId = id++;
      callbacks.set(currentId, resolve);
      ws.send(JSON.stringify({ id: currentId, method, params }));
    });

    await send('Console.enable');
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:5173/academia/ciudad-y-rio' });

    await new Promise(r => setTimeout(r, 2000));

    const getScroll = async () => {
      const res = await send('Runtime.evaluate', {
        expression: `({ scrollY: window.scrollY, scrollHeight: document.body.scrollHeight, href: window.location.href })`,
        returnByValue: true
      });
      return res.result?.result?.value;
    };

    console.log('Initial:', await getScroll());

    for (let y = 3000; y <= 9800; y += 400) {
      await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` });
      await new Promise(r => setTimeout(r, 100));
      const current = await getScroll();
      if (current.scrollY < y - 50 && current.scrollY === 0) {
        console.error(`🚨 JUMPED TO TOP at target ${y}! Current state:`, current);
        break;
      } else {
        console.log(`Target ${y} -> actual: ${current.scrollY}`);
      }
    }

    ws.close();
  } finally {
    chrome.kill();
    try { fs.rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch {}
  }
}

main().catch(console.error);
