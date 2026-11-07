const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const TEST_PORT = 3089;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
const dataDir = path.join(__dirname, 'src', 'data');

// Backup files to restore after audit test
const backups = {};
const filesToBackup = ['siteMetrics.json', 'subscribers.json', 'adAnalytics.json', 'adEvents.json'];

filesToBackup.forEach(file => {
  const fp = path.join(dataDir, file);
  if (fs.existsSync(fp)) {
    backups[file] = fs.readFileSync(fp, 'utf-8');
  }
});

function restoreBackups() {
  filesToBackup.forEach(file => {
    const fp = path.join(dataDir, file);
    if (backups[file]) {
      fs.writeFileSync(fp, backups[file], 'utf-8');
    }
  });
}

function doRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          json: () => {
            try { return JSON.parse(data); } catch { return null; }
          }
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('🚀 [AUDITORÍA] Iniciando servidor de prueba en puerto', TEST_PORT);
  const serverProc = spawn('node', ['server.cjs'], {
    env: { ...process.env, PORT: String(TEST_PORT) },
    cwd: __dirname,
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => {
    // console.log('[Server stdout]:', d.toString().trim());
  });
  serverProc.stderr.on('data', d => {
    console.error('[Server stderr]:', d.toString().trim());
  });

  // Wait for server to boot
  await new Promise(r => setTimeout(r, 2000));

  let auditPassed = true;
  const results = [];

  function recordResult(testName, passed, details) {
    results.push({ testName, passed, details });
    if (!passed) auditPassed = false;
    const icon = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} | ${testName}${details ? ` (${details})` : ''}`);
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Track Visit - Nuevo Visitante Único (Móvil, Instagram)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. AUDITORÍA DE TRACKING DE VISITANTES ---');
    const visit1 = await doRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/track-visit',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      isNewVisitor: true,
      device: 'mobile',
      source: 'instagram',
      section: 'proyectos',
      path: '/proyectos'
    });
    recordResult('Track Visit 1 (Nuevo Visitante Móvil)', visit1.statusCode === 200 && visit1.json()?.success === true);

    // -------------------------------------------------------------------------
    // TEST 2: Track Visit - Página Vista Recurrente (Desktop, Google)
    // -------------------------------------------------------------------------
    const visit2 = await doRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/track-visit',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      isNewVisitor: false,
      device: 'desktop',
      source: 'google_search',
      section: 'academia',
      path: '/academia'
    });
    recordResult('Track Visit 2 (Página Vista Recurrente)', visit2.statusCode === 200 && visit2.json()?.success === true);

    // -------------------------------------------------------------------------
    // TEST 3: Verificar Métricas Globales (/api/site-metrics)
    // -------------------------------------------------------------------------
    const metricsRes = await doRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/site-metrics',
      method: 'GET'
    });
    const metricsData = metricsRes.json();
    const today = new Date().toISOString().split('T')[0];
    const todayStats = metricsData?.dailyStats?.[today];

    const hasTodayStats = Boolean(todayStats && todayStats.pageviews >= 2 && todayStats.uniqueVisitors >= 1);
    recordResult('Verificación de siteMetrics.json (Stats de hoy presentes)', hasTodayStats, `Páginas: ${todayStats?.pageviews}, Visitantes: ${todayStats?.uniqueVisitors}`);
    const hasDeviceStats = Boolean(metricsData?.deviceBreakdown?.mobile > 0);
    recordResult('Desglose por Dispositivos (Móvil detectado)', hasDeviceStats, `Móviles: ${metricsData?.deviceBreakdown?.mobile}`);
    const hasSourceStats = Boolean(metricsData?.sourcesBreakdown?.instagram > 0);
    recordResult('Desglose por Fuentes (Instagram detectado)', hasSourceStats, `Instagram: ${metricsData?.sourcesBreakdown?.instagram}`);

    // -------------------------------------------------------------------------
    // TEST 4: Suscripción y Captura de Lead (/api/subscribe)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. AUDITORÍA DE CAPTURA DE DATOS (LEADS) ---');
    const testEmail = `audit.test.${Date.now()}@ecuadorianarch.test`;
    const subRes = await doRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/subscribe',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      nombre: 'Arq. Pruebas Audit',
      telefono: '0991234567',
      email: testEmail,
      source: 'banner-publicitario',
      section: 'entre-proyectos'
    });
    const subJson = subRes.json();
    recordResult('Captura de Lead (/api/subscribe)', subRes.statusCode === 200 && subJson?.success === true);

    // Verificar en subscribers.json
    const subsPath = path.join(dataDir, 'subscribers.json');
    const allSubs = JSON.parse(fs.readFileSync(subsPath, 'utf-8'));
    const foundSub = allSubs.find(s => s.email === testEmail);
    recordResult('Lead Persistido en subscribers.json con Nombre y Teléfono', Boolean(foundSub && foundSub.nombre === 'Arq. Pruebas Audit' && foundSub.telefono === '0991234567'));

    // Verificar incremento automático de leads en siteMetrics.json
    const metricsAfterLead = await doRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/site-metrics',
      method: 'GET'
    });
    const todayLeads = metricsAfterLead.json()?.dailyStats?.[today]?.leads;
    recordResult('Incremento automático de Lead en siteMetrics.json', Boolean(todayLeads && todayLeads > 0), `Leads hoy: ${todayLeads}`);

    // Eliminar el contacto de prueba
    if (foundSub) {
      const delRes = await doRequest({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: `/api/subscribers?id=${encodeURIComponent(foundSub.id)}`,
        method: 'DELETE'
      });
      recordResult('Eliminación Limpia de Contacto (/api/subscribers DELETE)', delRes.statusCode === 200 && delRes.json()?.success === true);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Auditoría de Banners Publicitarios (Impresiones y Clics)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. AUDITORÍA DE BANNERS DE PUBLICIDAD ---');
    const adCampaigns = JSON.parse(fs.readFileSync(path.join(dataDir, 'adCampaigns.json'), 'utf-8'));
    const testCampaign = adCampaigns[0] || { id: 'camp-01' };

    // 5.1 Impresión
    const impRes = await doRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/ads/track-impression',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      campaignId: testCampaign.id,
      placementId: 'entre-proyectos',
      device: 'mobile',
      isAdmin: false,
      sessionId: 'sess-audit-123'
    });
    recordResult('Tracking de Impresión de Banner (/api/ads/track-impression)', impRes.statusCode === 200 && impRes.json()?.recorded === true);

    // 5.2 Clic con Redirección 302
    const targetDest = 'https://ecuadorianarchitecture.com/proyectos';
    const clickRes = await doRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/ads/click?c=${encodeURIComponent(testCampaign.id)}&p=entre-proyectos&dest=${encodeURIComponent(targetDest)}`,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' }
    });
    recordResult('Tracking de Clic con Redirección HTTP 302', clickRes.statusCode === 302 && clickRes.headers.location === targetDest, `Location: ${clickRes.headers.location}`);

    // 5.3 Verificar adAnalytics.json
    const adAnalytics = JSON.parse(fs.readFileSync(path.join(dataDir, 'adAnalytics.json'), 'utf-8'));
    const impCount = adAnalytics?.impressions?.[testCampaign.id] || 0;
    const clkCount = adAnalytics?.validClicks?.[testCampaign.id] || adAnalytics?.clicks?.[testCampaign.id] || 0;
    recordResult('Persistencia en adAnalytics.json (Impresiones y Clics registrados)', impCount > 0 && clkCount > 0, `Impresiones: ${impCount}, Clics: ${clkCount}`);

    // 5.4 Reporte de Anunciante (/api/ads/report)
    if (testCampaign.shareToken) {
      const repRes = await doRequest({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: `/api/ads/report?token=${encodeURIComponent(testCampaign.shareToken)}`,
        method: 'GET'
      });
      const repData = repRes.json();
      recordResult('Reporte de Rendimiento de Campaña (/api/ads/report)', repRes.statusCode === 200 && Boolean(repData?.stats?.ctr !== undefined), `CTR: ${repData?.stats?.ctr}%`);
    }

    // 5.5 Portal de Marca (/api/ads/advertiser-portal)
    const adBrands = JSON.parse(fs.readFileSync(path.join(dataDir, 'adBrands.json'), 'utf-8'));
    const testBrand = adBrands.find(b => b.portalToken) || adBrands[0];
    if (testBrand) {
      const token = testBrand.portalToken || testBrand.id;
      const portalRes = await doRequest({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: `/api/ads/advertiser-portal?token=${encodeURIComponent(token)}`,
        method: 'GET'
      });
      const portalData = portalRes.json();
      recordResult('Portal Consolidado de Marca (/api/ads/advertiser-portal)', portalRes.statusCode === 200 && portalData?.brand?.id === testBrand.id, `Marca: ${portalData?.brand?.name}`);
    }

  } catch (err) {
    console.error('❌ Error durante la auditoría:', err);
    auditPassed = false;
  } finally {
    console.log('\n🧹 Restaurando archivos de datos de prueba...');
    restoreBackups();
    serverProc.kill();
  }

  console.log('\n======================================================');
  console.log(`RESULTADO DE AUDITORÍA: ${auditPassed ? '✅ TODOS LOS TESTS PASARON EXITOSAMENTE (100%)' : '❌ HUBO FALLOS EN LA AUDITORÍA'}`);
  console.log('======================================================\n');
  process.exit(auditPassed ? 0 : 1);
}

runAudit();
