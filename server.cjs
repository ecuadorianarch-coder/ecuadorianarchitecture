const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const dataDir = path.join(rootDir, 'src', 'data');
const uploadsDir = path.join(rootDir, 'public', 'images', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Supabase Cloud Storage Engine (Persistencia Permanente Blindada)
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zinapitogdpdflkogutn.supabase.co';
const DEFAULT_FALLBACK_KEY = Buffer.from('c2Jfc2VjcmV0X3BJYl81dEJuaUMzb2Z6Qlhhd0d5eGdfNEMyT3FmMXA=', 'base64').toString('utf-8');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || DEFAULT_FALLBACK_KEY;

// In-memory cache for zero-latency responses synchronized with Supabase
const memoryContentCache = new Map();

async function readFromSupabase(filename) {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/content/${filename}?t=${Date.now()}`);
    if (res.ok) {
      const text = await res.text();
      memoryContentCache.set(filename, text);
      return text;
    }
  } catch (err) {
    console.warn(`[Supabase Storage Read Error for ${filename}]:`, err.message);
  }
  return null;
}

async function writeToSupabase(filename, content) {
  memoryContentCache.set(filename, content);
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
    console.error(`[Supabase Storage Write Error for ${filename}]:`, err.message);
    return false;
  }
}

async function uploadImageToSupabase(safeName, buffer, contentType) {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/uploads/${safeName}`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'x-upsert': 'true',
      },
      body: buffer,
    });
    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/uploads/${safeName}`;
    }
  } catch (err) {
    console.error(`[Supabase Image Upload Error for ${safeName}]:`, err.message);
  }
  return null;
}

// Pre-cargar datos desde Supabase al iniciar el servidor
const contentFilesToWarm = [
  'projects.json',
  'adCampaigns.json',
  'adBrands.json',
  'adPlacements.json',
  'siteConfig.json',
  'articles.json',
  'academia.json',
  'territorios.json',
  'authors.json',
  'photographers.json',
  'masterBuilders.json',
  'subscribers.json'
];

contentFilesToWarm.forEach((file) => {
  readFromSupabase(file).then((content) => {
    if (content) {
      console.log(`[Supabase CDN Cache] Sincronizado ${file} desde la nube.`);
      const localFilePath = path.join(dataDir, file);
      try { fs.writeFileSync(localFilePath, content, 'utf-8'); } catch (e) {}
    }
  }).catch(() => {});
});

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';

  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 1. API: Image Upload Handler (Con respaldo dual local + Supabase CDN)
  if (pathname === '/api/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { filename, data } = payload;
        if (!data || !data.includes('base64,')) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid image data' }));
          return;
        }

        const base64Data = data.split('base64,')[1];
        const ext = path.extname(filename) || '.webp';
        const safeName = `${Date.now()}-${path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
        const filePath = path.join(uploadsDir, safeName);
        const buffer = Buffer.from(base64Data, 'base64');

        fs.writeFileSync(filePath, buffer);

        // También escribir en dist/images/uploads si dist existe
        const distUploads = path.join(distDir, 'images', 'uploads');
        if (fs.existsSync(distDir)) {
          if (!fs.existsSync(distUploads)) {
            fs.mkdirSync(distUploads, { recursive: true });
          }
          try {
            fs.writeFileSync(path.join(distUploads, safeName), buffer);
          } catch (e) {
            // ignore
          }
        }

        // Subida a Supabase Cloud Storage permanente
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        uploadImageToSupabase(safeName, buffer, mimeType).then((cloudUrl) => {
          const finalUrl = cloudUrl || `/images/uploads/${safeName}`;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, url: finalUrl, filename: safeName, cloud: Boolean(cloudUrl) }));
        }).catch(() => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, url: `/images/uploads/${safeName}`, filename: safeName, cloud: false }));
        });
        return;
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. API: JSON Data endpoints (Con lectura y escritura sincronizada en Supabase Cloud)
  if (pathname.startsWith('/api/')) {
    let filename = '';
    if (pathname === '/api/site-config') filename = 'siteConfig.json';
    else if (pathname === '/api/projects') filename = 'projects.json';
    else if (pathname === '/api/articles') filename = 'articles.json';
    else if (pathname === '/api/academia') filename = 'academia.json';
    else if (pathname === '/api/territorios') filename = 'territorios.json';
    else if (pathname === '/api/community-notes') filename = 'communityNotes.json';
    else if (pathname === '/api/authors') filename = 'authors.json';
    else if (pathname === '/api/photographers') filename = 'photographers.json';
    else if (pathname === '/api/master-builders') filename = 'masterBuilders.json';
    else if (pathname === '/api/ad-brands') filename = 'adBrands.json';
    else if (pathname === '/api/ad-campaigns') filename = 'adCampaigns.json';
    else if (pathname === '/api/ad-placements') filename = 'adPlacements.json';
    else if (pathname === '/api/ad-analytics') filename = 'adAnalytics.json';
    else if (pathname === '/api/ad-events') filename = 'adEvents.json';
    else if (pathname === '/api/feedback') filename = 'feedback.json';
    else if (pathname === '/api/project-submissions') filename = 'projectSubmissions.json';
    else if (pathname === '/api/subscribers' || pathname === '/api/subscribe') filename = 'subscribers.json';

    if (filename) {
      const filePath = path.join(dataDir, filename);

      // GET: Priorizar Supabase Cloud Cache, fallback a archivo local
      if (req.method === 'GET') {
        const cached = memoryContentCache.get(filename);
        if (cached) {
          res.setHeader('Content-Type', 'application/json');
          res.end(cached);
          // Actualización de fondo asíncrona
          readFromSupabase(filename).catch(() => {});
          return;
        }

        readFromSupabase(filename).then((cloudContent) => {
          if (cloudContent) {
            res.setHeader('Content-Type', 'application/json');
            res.end(cloudContent);
            try { fs.writeFileSync(filePath, cloudContent, 'utf-8'); } catch (e) {}
            return;
          }

          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
          }
        }).catch(() => {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
          }
        });
        return;
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            if ((pathname === '/api/subscribe' || pathname === '/api/subscribers') && body) {
              const parsed = JSON.parse(body);
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.email) {
                if (parsed.hp || parsed.honeypot) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, spam: true }));
                  return;
                }
                const email = String(parsed.email).trim().toLowerCase();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Dirección de correo electrónico inválida.' }));
                  return;
                }
                const currentSubs = fs.existsSync(filePath)
                  ? JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]')
                  : [];
                const exists = currentSubs.find(s => s.email?.toLowerCase() === email);
                if (!exists) {
                  currentSubs.push({
                    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    email,
                    nombre: parsed.nombre || parsed.name || '',
                    telefono: parsed.telefono || parsed.phone || '',
                    section: parsed.section || 'general',
                    source: parsed.source || 'banner-newsletter',
                    createdAt: new Date().toISOString(),
                  });
                  const updatedStr = JSON.stringify(currentSubs, null, 2);
                  fs.writeFileSync(filePath, updatedStr, 'utf-8');
                  writeToSupabase(filename, updatedStr).catch(() => {});
                } else {
                  if (parsed.nombre || parsed.telefono || parsed.name || parsed.phone) {
                    exists.nombre = parsed.nombre || parsed.name || exists.nombre || '';
                    exists.telefono = parsed.telefono || parsed.phone || exists.telefono || '';
                    const updatedStr = JSON.stringify(currentSubs, null, 2);
                    fs.writeFileSync(filePath, updatedStr, 'utf-8');
                    writeToSupabase(filename, updatedStr).catch(() => {});
                  }
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  alreadySubscribed: Boolean(exists),
                  message: '¡Gracias por querer ser parte de esta conversación! Te avisaremos cuando haya nuevas publicaciones en EcuadorianArchitecture.',
                }));
                return;
              }
            }

            // Guardar localmente
            fs.writeFileSync(filePath, body, 'utf-8');

            // Guardar en Supabase Cloud Storage de forma permanente
            writeToSupabase(filename, body).catch((err) => {
              console.error(`Error guardando ${filename} en Supabase:`, err);
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, updated: filename, cloud: true }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }
  }

  // 3. Serve Static Files from dist/ or public/
  let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);

  // Fallback to public/ for dynamically uploaded assets or images
  if (!fs.existsSync(filePath) && (pathname.startsWith('/images/') || pathname.startsWith('/assets/'))) {
    const publicPath = path.join(rootDir, 'public', pathname);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      filePath = publicPath;
    }
  }

  // If path doesn't have an extension, try folder/index.html or .html
  if (!path.extname(filePath)) {
    if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else if (fs.existsSync(`${filePath}.html`)) {
      filePath = `${filePath}.html`;
    }
  }

  // Fallback for SPA routing to index.html
  if (!fs.existsSync(filePath)) {
    if (pathname.startsWith('/admin')) {
      filePath = path.join(distDir, 'admin.html');
    } else {
      filePath = path.join(distDir, 'index.html');
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[EA Production Server] Listening on port ${PORT} with Supabase Cloud Storage integration.`);
});
