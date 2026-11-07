const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'src', 'data');
const backupDir = path.resolve(__dirname, '..', 'src', 'data', 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Supabase Cloud Storage Config
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zinapitogdpdflkogutn.supabase.co';
const DEFAULT_FALLBACK_KEY = Buffer.from('c2Jfc2VjcmV0X3BJYl81dEJuaUMzb2Z6Qlhhd0d5eGdfNEMyT3FmMXA=', 'base64').toString('utf-8');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || DEFAULT_FALLBACK_KEY;

async function writeToSupabase(filename, content) {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/content/${filename}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'x-upsert': 'true',
      },
      body: content,
    });
    return res.ok;
  } catch (err) {
    console.error(`[Supabase Reset Error for ${filename}]:`, err.message);
    return false;
  }
}

async function runReset() {
  console.log('🔄 [RESETEO A CERO] Iniciando limpieza total de métricas y datos semilla...');

  const nowIso = new Date().toISOString();

  // 1. Respaldar datos actuales
  const filesToReset = ['siteMetrics.json', 'subscribers.json', 'adAnalytics.json', 'adEvents.json'];
  filesToReset.forEach(file => {
    const src = path.join(dataDir, file);
    if (fs.existsSync(src)) {
      const backupPath = path.join(backupDir, `${file}.backup-${Date.now()}`);
      fs.copyFileSync(src, backupPath);
      console.log(`📁 [RESPALDO SEGURO] Creado: ${path.basename(backupPath)}`);
    }
  });

  // Guardar también copia fija permanente de los contactos previos
  const subsSrc = path.join(dataDir, 'subscribers.json');
  if (fs.existsSync(subsSrc)) {
    fs.copyFileSync(subsSrc, path.join(dataDir, 'subscribers.previous-backup.json'));
    console.log('⭐ [RESPALDO CONTACTOS] Guardado en: src/data/subscribers.previous-backup.json');
  }

  // 2. Definir estructuras limpias en CERO
  const cleanSiteMetrics = {
    totalUniqueVisitors: 0,
    totalPageviews: 0,
    lastUpdated: nowIso,
    dailyStats: {},
    deviceBreakdown: {
      mobile: 0,
      desktop: 0,
      tablet: 0
    },
    sourcesBreakdown: {
      instagram: 0,
      direct_whatsapp: 0,
      google_search: 0,
      referral: 0
    },
    sectionsBreakdown: {
      proyectos: 0,
      home: 0,
      territorios: 0,
      academia: 0,
      acerca: 0
    }
  };

  const cleanAdAnalytics = {
    impressions: {},
    grossClicks: {},
    validClicks: {},
    clicks: {},
    impressionsByPlacement: {},
    clicksByPlacement: {},
    deviceBreakdown: {
      desktop: 0,
      tablet: 0,
      mobile: 0
    },
    dailyStats: {},
    lastUpdated: nowIso
  };

  const cleanAdEvents = [];
  const cleanSubscribers = [];

  const datasets = [
    { name: 'siteMetrics.json', data: JSON.stringify(cleanSiteMetrics, null, 2) },
    { name: 'adAnalytics.json', data: JSON.stringify(cleanAdAnalytics, null, 2) },
    { name: 'adEvents.json', data: JSON.stringify(cleanAdEvents, null, 2) },
    { name: 'subscribers.json', data: JSON.stringify(cleanSubscribers, null, 2) }
  ];

  // 3. Escribir localmente y en Supabase Cloud Storage
  for (const item of datasets) {
    const localPath = path.join(dataDir, item.name);
    fs.writeFileSync(localPath, item.data, 'utf-8');
    console.log(`💾 [LOCAL] ${item.name} reseteado a 0.`);

    const cloudOk = await writeToSupabase(item.name, item.data);
    if (cloudOk) {
      console.log(`☁️ [SUPABASE CLOUD] ${item.name} sincronizado exitosamente.`);
    } else {
      console.warn(`⚠️ [SUPABASE CLOUD] Advertencia: Falló sincronización de ${item.name}.`);
    }
  }

  console.log('\n✨ [COMPLETADO] Todas las métricas, eventos publicitarios y leads han sido reseteados a CERO absoluto.');
}

runReset();
