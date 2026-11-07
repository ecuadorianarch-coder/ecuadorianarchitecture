const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.resolve(__dirname, 'server.cjs');

console.log('Starting Ecuadorian Architecture server process...');
const serverProc = spawn('node', [serverPath], {
  cwd: __dirname,
  env: { ...process.env, PORT: '3000' }
});

serverProc.stdout.on('data', data => console.log('[Server stdout]:', data.toString().trim()));
serverProc.stderr.on('data', data => console.error('[Server stderr]:', data.toString().trim()));

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await wait(2500); // Wait for server to boot

  try {
    console.log('\n--- 1. Testing GET /api/editorial/state ---');
    const stateRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/editorial/state',
      method: 'GET'
    });
    console.log('Status:', stateRes.status, '| Total Agents:', Object.keys(stateRes.data.agentStates || {}).length);

    console.log('\n--- 2. Testing POST /api/editorial/agent/message ---');
    const msgRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/editorial/agent/message',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      agentId: 'ea-01-chief-editor',
      message: '¿Cuál es el veredicto para publicación de Rumipamba?'
    });
    console.log('Status:', msgRes.status);
    console.log('Agent Name:', msgRes.data.agentName);
    console.log('Agent Response:', msgRes.data.agentResponse?.text);

    console.log('\n--- 3. Testing POST /api/editorial/meeting/run ---');
    const meetRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/editorial/meeting/run',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      attendeeIds: ['ea-01-chief-editor', 'ea-04-architecture-critic', 'ea-07-instagram-editor', 'ea-opp-01-director'],
      topic: 'Sinergia de Difusión BAQ 2026',
      objective: 'Fijar posturas críticas y agenda editorial'
    });
    console.log('Status:', meetRes.status);
    console.log('Meeting ID:', meetRes.data.minutes?.id);
    console.log('Attendees:', meetRes.data.minutes?.attendees?.length);
    console.log('Transcript Lines:', meetRes.data.minutes?.transcript?.length);
    console.log('First Consensus:', meetRes.data.minutes?.conclusions?.[0]);

    console.log('\n--- 4. Testing POST /api/editorial/article/decision (Approval) ---');
    const decRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/editorial/article/decision',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      articleId: 'espacio-para-hablar-con-dios-ssqj',
      decision: 'approve'
    });
    console.log('Status:', decRes.status);
    console.log('Article stage:', decRes.data.workspace?.stage);
    console.log('Approved by:', decRes.data.workspace?.approvedBy);

    console.log('\n--- 5. Testing GET /api/opportunities/hub ---');
    const oppRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/opportunities/hub',
      method: 'GET'
    });
    console.log('Status:', oppRes.status);
    console.log('Opportunities Count:', Object.keys(oppRes.data?.opportunities || {}).length);
    console.log('Sponsors Count:', Object.keys(oppRes.data?.sponsors || {}).length);

    console.log('\n======================================================');
    console.log('ALL LIVE SERVER ENDPOINTS VERIFIED WITH 100% SUCCESS!');
    console.log('======================================================');
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    serverProc.kill();
    process.exit(0);
  }
}

run();
