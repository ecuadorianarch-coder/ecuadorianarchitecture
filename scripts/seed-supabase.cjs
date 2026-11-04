const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zinapitogdpdflkogutn.supabase.co';
const DEFAULT_FALLBACK_KEY = Buffer.from('c2Jfc2VjcmV0X3BJYl81dEJuaUMzb2Z6Qlhhd0d5eGdfNEMyT3FmMXA=', 'base64').toString('utf-8');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || DEFAULT_FALLBACK_KEY;

const dataFiles = [
  'siteConfig.json',
  'projects.json',
  'articles.json',
  'academia.json',
  'territorios.json',
  'authors.json',
  'photographers.json',
  'masterBuilders.json',
  'adBrands.json',
  'adCampaigns.json',
  'adPlacements.json',
  'adAnalytics.json',
  'adEvents.json',
  'communityNotes.json',
  'feedback.json',
  'projectSubmissions.json',
  'subscribers.json'
];

async function seed() {
  console.log('--- Iniciando Seeding de Supabase Cloud Storage ---');
  for (const filename of dataFiles) {
    const localPath = path.join(__dirname, '..', 'src', 'data', filename);
    if (!fs.existsSync(localPath)) continue;

    // Verificar si ya existe en Supabase
    const checkRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/content/${filename}`);
    if (checkRes.ok) {
      console.log(`[Supabase] ${filename} ya existe en la nube, preservando.`);
      continue;
    }

    const content = fs.readFileSync(localPath, 'utf-8');
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/content/${filename}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'x-upsert': 'true',
      },
      body: content,
    });
    if (uploadRes.ok) {
      console.log(`[Supabase] Sincronizado ${filename} en cloud storage.`);
    } else {
      console.error(`[Supabase] Error sincronizando ${filename}:`, await uploadRes.text());
    }
  }

  // Migrar imágenes locales de uploads a Supabase Storage
  const uploadsDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      if (fs.statSync(filePath).isFile()) {
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(file).toLowerCase();
        const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
        await fetch(`${SUPABASE_URL}/storage/v1/object/uploads/${file}`, {
          method: 'POST',
          headers: {
            'Content-Type': mime,
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'x-upsert': 'true',
          },
          body: fileBuffer,
        });
        console.log(`[Supabase] Imagen subida a Cloud Storage: ${file}`);
      }
    }
  }
  console.log('--- Seeding de Supabase Finalizado Exitosamente ---');
}

seed().catch(console.error);
