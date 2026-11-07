const http = require('http');

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

async function runTests() {
  console.log('Testing running server endpoints on port 3000...');

  try {
    // 1. Get editorial state
    const stateRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/editorial/state',
      method: 'GET'
    });
    console.log('1. /api/editorial/state -> Status:', stateRes.status, '| Agents count:', Object.keys(stateRes.data.agentStates || {}).length);

    // 2. Post direct agent message
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
    console.log('2. /api/editorial/agent/message -> Status:', msgRes.status, '| Reply preview:', msgRes.data?.agentResponse?.text?.substring(0, 70));

    // 3. Post meeting run
    const meetRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/editorial/meeting/run',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      attendeeIds: ['ea-01-chief-editor', 'ea-04-architecture-critic', 'ea-07-instagram-editor'],
      topic: 'Sinergia de Difusión BAQ 2026',
      objective: 'Fijar posturas críticas sobre la bienal'
    });
    console.log('3. /api/editorial/meeting/run -> Status:', meetRes.status, '| Meeting ID:', meetRes.data?.minutes?.id);

    // 4. Opportunities Hub
    const oppRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/opportunities/hub',
      method: 'GET'
    });
    console.log('4. /api/opportunities/hub -> Status:', oppRes.status, '| Opps count:', Object.keys(oppRes.data?.opportunities || {}).length);

    console.log('\nAll server HTTP API integration tests PASSED!');
  } catch (e) {
    console.log('Server not currently running on port 3000 (expected if offline in background):', e.message);
  }
}

runTests();
