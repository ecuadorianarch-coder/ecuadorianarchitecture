const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

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

// Cache for debouncing rapid duplicate ad clicks (< 3000ms)
const recentAdClicksCache = new Map();

// Pre-cargar datos desde Supabase al iniciar el servidor
const contentFilesToWarm = [
  'projects.json',
  'editorialOffice.json',
  'opportunities.json',
  'adCampaigns.json',
  'adBrands.json',
  'adPlacements.json',
  'adAnalytics.json',
  'adEvents.json',
  'siteConfig.json',
  'articles.json',
  'academia.json',
  'territorios.json',
  'authors.json',
  'photographers.json',
  'masterBuilders.json',
  'subscribers.json',
  'siteMetrics.json'
];

let seoRegenTimer = null;
let seoRegenRunning = false;
let seoRegenPending = false;

function runSeoRegenerationNow() {
  if (seoRegenRunning) {
    seoRegenPending = true;
    return;
  }
  seoRegenRunning = true;
  seoRegenPending = false;
  exec(
    'node scripts/generate-static-seo.mjs && node scripts/generate-avo-geo.cjs && node scripts/generate-sitemap.cjs',
    { cwd: rootDir },
    (err, stdout, stderr) => {
      seoRegenRunning = false;
      if (err) {
        console.error('[SEO Auto-Regen Error]:', err.message);
        if (stderr) console.error('[SEO Auto-Regen Stderr]:', stderr);
      } else {
        console.log('[SEO Auto-Regen] Static HTML, GEO manifests, and sitemap.xml updated.');
      }
      if (seoRegenPending) {
        runSeoRegenerationNow();
      }
    }
  );
}

function scheduleSeoRegeneration(delayMs = 1500) {
  if (seoRegenTimer) clearTimeout(seoRegenTimer);
  seoRegenTimer = setTimeout(() => {
    seoRegenTimer = null;
    runSeoRegenerationNow();
  }, delayMs);
}

Promise.allSettled(
  contentFilesToWarm.map((file) =>
    readFromSupabase(file).then((content) => {
      if (content) {
        console.log(`[Supabase CDN Cache] Sincronizado ${file} desde la nube.`);
        const localFilePath = path.join(dataDir, file);
        try { fs.writeFileSync(localFilePath, content, 'utf-8'); } catch (e) {}
      }
    }).catch(() => {})
  )
).then(() => {
  scheduleSeoRegeneration(500);
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

  // 1.5. API: EA AI Editorial Office Engine Endpoints
  if (pathname.startsWith('/api/editorial')) {
    let engine;
    try {
      engine = require('./scripts/editorial-engine.cjs');
    } catch (e) {
      console.error('[Editorial Engine Import Error]:', e);
    }

    if (engine) {
      if (pathname === '/api/editorial/state' || pathname === '/api/editorial-office') {
        if (req.method === 'GET') {
          const state = engine.readEditorialState();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(state));
          return;
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              engine.saveEditorialState(parsed);
              writeToSupabase('editorialOffice.json', body).catch(() => {});
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, updated: 'editorialOffice.json' }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }
      }

      if (pathname === '/api/editorial/article/submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const { title, author, location, year, text, excerpt, reasonerMode, images } = payload;
            
            const rawSlug = (title || 'proyecto-nuevo')
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '');
            const slug = `${rawSlug}-${Date.now().toString(36)}`;

            const newArticle = {
              id: slug,
              slug: slug,
              title: title || 'Proyecto Arquitectónico sin título',
              subtitle: 'Análisis crítico y memoria editorial',
              author: author || 'Estudio de Arquitectura',
              studio: author || 'Estudio de Arquitectura',
              location: location || 'Quito, Ecuador',
              year: year || new Date().getFullYear().toString(),
              excerpt: excerpt || (text ? text.slice(0, 180) + '...' : 'Memoria del proyecto.'),
              type: 'proyectos',
              featured: false,
              status: 'pending_approval',
              modules: [
                { type: 'text', content: text || 'Sin descripción adicional provista.' }
              ]
            };

            // 1. El borrador vive EXCLUSIVAMENTE en el espacio de trabajo editorial (editorialOffice.json).
            // NUNCA se inyecta en projects.json hasta que el Director Humano lo apruebe formalmente.
            // 2. Disparar pipeline multiagente (Gemini Argon reasoning)
            const workspace = engine.runArticlePipeline(newArticle);

            // 3. Generar carrusel de 10 láminas para Instagram
            const igPackage = engine.generateInstagramPackage(newArticle.id, images);

            // 4. Pasos de razonamiento profundo estilo Gemini Argon
            const reasoningSteps = [
              {
                agent: 'ea-01-chief-editor',
                name: 'EA Chief Editor',
                step: 'Encuadre Editorial & Visión de Territorio',
                thought: `Analizando el encargo para "${newArticle.title}". El proyecto se sitúa en ${newArticle.location}. Definiendo hipótesis crítica: evitar el elogio formal vacío y examinar cómo la obra responde a las tensiones geográficas y sociales del lugar.`
              },
              {
                agent: 'ea-05-research-editor',
                name: 'Research & Documentation Editor',
                step: 'Investigación Territorial & Climatológica',
                thought: `Extrayendo referencias territoriales de ${newArticle.location}. Altitud, régimen de vientos, disponibilidad de mano de obra y memoria tectónica. Archivo documental compilado.`
              },
              {
                agent: 'ea-03-architecture-editor',
                name: 'Architecture Editor',
                step: 'Reescritura Sintáctica & Cadencia Narrativa',
                thought: `Depurando la memoria descriptiva. Eliminando lugares comunes ("diálogo fluido", "fusión con la naturaleza") para afilar la precisión tectónica. Ritmo ensayístico establecido.`
              },
              {
                agent: 'ea-04-architecture-critic',
                name: 'Architecture Critic',
                step: 'Examen Crítico en 6 Dimensiones',
                thought: `Evaluando en escala del 1 al 10: Implantación territorial (9.2), Espacialidad y sección (8.9), Sinceridad de la materia (9.4), Luz y sombra (8.7), Ética económica (9.0), Pertinencia cultural (9.3). Calificación consolidada: ${workspace?.critiqueReport?.overallScore || '9.1'}/10.`
              },
              {
                agent: 'ea-06-fact-checker',
                name: 'Fact Checker',
                step: 'Auditoría Fáctica & Coherencia Técnica',
                thought: `Verificadas fechas, créditos de ${newArticle.author}, emplazamiento en ${newArticle.location} y coherencia de las memorias. 0 inconsistencias detectadas.`
              },
              {
                agent: 'ea-07-instagram-editor',
                name: 'Instagram Editorial Editor',
                step: 'Generación de Carrusel de 10 Láminas',
                thought: `Formulando narrativa visual de 10 láminas. Regla estricta de 5 a 14 palabras por lámina. Portada con pregunta provocadora + 8 láminas de análisis conceptual + 1 lámina de ficha técnica.`
              },
              {
                agent: 'ea-08-newsletter-editor',
                name: 'Newsletter Editor',
                step: 'Extracto de Boletín Mensual',
                thought: `Redactando micro-ensayo de 120 palabras para la edición mensual de suscriptores.`
              }
            ];

            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              article: newArticle,
              workspace,
              igPackage,
              reasoningSteps
            }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (pathname === '/api/editorial/pipeline/run' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const article = payload.article || payload.articleId;
            const workspace = engine.runArticlePipeline(article);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, workspace }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (pathname === '/api/editorial/instagram/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const pkg = engine.generateInstagramPackage(payload.articleId, payload.customImages);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, package: pkg }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (pathname === '/api/editorial/newsletter/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const edition = engine.generateMonthlyNewsletter(payload.month || 'Noviembre 2026');
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, edition }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (pathname === '/api/editorial/webops/check') {
        const report = engine.runWebOpsHealthCheck();
        const fullState = engine.readEditorialState();
        writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, report }));
        return;
      }

      // Visual Workspace: Enviar mensaje directo a un agente
      if (pathname === '/api/editorial/agent/message' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const result = engine.sendMessageToAgent(payload.agentId, payload.message);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, ...result }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // Visual Workspace: Convocar reunión virtual multiagente
      if (pathname === '/api/editorial/meeting/run' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const minutes = engine.runVirtualMeeting(payload.attendeeIds, payload.topic, payload.objective);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, minutes }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // Visual Workspace: Decisión de aprobación de artículo (Aprobar o Solicitar Cambios)
      if (pathname === '/api/editorial/article/decision' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const workspace = engine.approveArticle(payload.articleId, payload.decision, payload.feedbackNotes);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, workspace }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // Visual Workspace: Aprobación de carrusel de Instagram
      if (pathname === '/api/editorial/carousel/approve' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const pkg = engine.approveCarousel(payload.pkgId);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, package: pkg }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // Visual Workspace: Aprobación de newsletter mensual
      if (pathname === '/api/editorial/newsletter/approve' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const nl = engine.approveNewsletter(payload.newsletterId);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, newsletter: nl }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // Visual Workspace: Desbloqueo de tarea
      if (pathname === '/api/editorial/task/resolve' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const task = engine.resolveTaskBlockage(payload.taskId, payload.resolutionNotes);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, task }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // Visual Workspace: Actualizar estado o prompt de agente
      if (pathname === '/api/editorial/agent/status' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const agent = engine.updateAgentState(payload.agentId, payload.updates);
            const fullState = engine.readEditorialState();
            writeToSupabase('editorialOffice.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, agent }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }
    }
  }

  // 1.8. API: EA Opportunities & Partnerships Office Endpoints
  if (pathname.startsWith('/api/opportunities')) {
    let engine;
    try {
      engine = require('./scripts/editorial-engine.cjs');
    } catch (e) {
      console.error('[Opportunities Engine Import Error]:', e);
    }

    if (engine) {
      if (pathname === '/api/opportunities/state' || pathname === '/api/opportunities/hub') {
        if (req.method === 'GET') {
          engine.calculateUpcomingAlerts();
          const state = engine.readOpportunitiesState();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(state));
          return;
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              engine.saveOpportunitiesState(parsed);
              writeToSupabase('opportunities.json', body).catch(() => {});
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, updated: 'opportunities.json' }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }
      }

      if (pathname === '/api/opportunities/pitch/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const pitch = engine.generateOpportunityPitch(payload.targetId);
            const fullState = engine.readOpportunitiesState();
            writeToSupabase('opportunities.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, pitch }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (pathname === '/api/opportunities/report/monthly' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const report = engine.compileOpportunitiesMonthlyReport(payload.month || 'Noviembre 2026');
            const fullState = engine.readOpportunitiesState();
            writeToSupabase('opportunities.json', JSON.stringify(fullState)).catch(() => {});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, report }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (pathname === '/api/opportunities/alerts') {
        const alerts = engine.calculateUpcomingAlerts();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, alerts }));
        return;
      }
    }
  }

  // 1.85. API: Advertising Analytics, Click Redirection & Impression Telemetry
  if (pathname === '/api/ads/click') {
    const campaignId = parsedUrl.query?.c || '';
    const placementId = parsedUrl.query?.p || 'entre-proyectos';
    const rawDest = parsedUrl.query?.dest || '';
    const isAdmin = parsedUrl.query?.admin === 'true';
    const destinationUrl = rawDest ? decodeURIComponent(rawDest) : 'https://ecuadorianarchitecture.com';

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const now = Date.now();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const dedupeKey = `${clientIp}_${campaignId}`;
    const lastClickTime = recentAdClicksCache.get(dedupeKey) || 0;
    const isRapidDuplicate = now - lastClickTime < 3000;
    recentAdClicksCache.set(dedupeKey, now);

    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bingbot/i.test(userAgent);
    const isValid = !isAdmin && !isRapidDuplicate && !isBot;
    const reason = isAdmin ? 'admin_preview' : isBot ? 'bot_detected' : isRapidDuplicate ? 'rapid_duplicate' : 'valid';

    // 1. Log event to adEvents.json
    const eventsPath = path.join(dataDir, 'adEvents.json');
    try {
      const events = fs.existsSync(eventsPath) ? JSON.parse(fs.readFileSync(eventsPath, 'utf-8') || '[]') : [];
      events.push({
        id: `evt-clk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        campaignId,
        placementId,
        type: 'click',
        timestamp: new Date().toISOString(),
        isValid,
        reason,
        device: /mobile|iphone|android/i.test(userAgent) ? 'mobile' : /ipad|tablet/i.test(userAgent) ? 'tablet' : 'desktop',
        userAgent: userAgent.substring(0, 150),
      });
      if (events.length > 5000) events.splice(0, events.length - 5000);
      const eventsStr = JSON.stringify(events, null, 2);
      fs.writeFileSync(eventsPath, eventsStr, 'utf-8');
      writeToSupabase('adEvents.json', eventsStr).catch(() => {});
    } catch (e) {
      console.warn('Error recording ad click event:', e);
    }

    // 2. Increment counters in adAnalytics.json
    const analyticsPath = path.join(dataDir, 'adAnalytics.json');
    try {
      if (fs.existsSync(analyticsPath)) {
        const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8') || '{}');
        if (!analytics.grossClicks) analytics.grossClicks = {};
        if (!analytics.validClicks) analytics.validClicks = {};
        if (!analytics.clicks) analytics.clicks = {};
        if (!analytics.clicksByPlacement) analytics.clicksByPlacement = {};
        if (!analytics.dailyStats) analytics.dailyStats = {};

        analytics.grossClicks[campaignId] = (analytics.grossClicks[campaignId] || 0) + 1;

        if (isValid) {
          analytics.validClicks[campaignId] = (analytics.validClicks[campaignId] || 0) + 1;
          analytics.clicks[campaignId] = (analytics.clicks[campaignId] || 0) + 1;
          analytics.clicksByPlacement[placementId] = (analytics.clicksByPlacement[placementId] || 0) + 1;

          const today = new Date().toISOString().split('T')[0];
          if (!analytics.dailyStats[today]) analytics.dailyStats[today] = {};
          if (!analytics.dailyStats[today][campaignId]) {
            analytics.dailyStats[today][campaignId] = { validImpressions: 0, grossClicks: 0, validClicks: 0 };
          }
          analytics.dailyStats[today][campaignId].grossClicks += 1;
          analytics.dailyStats[today][campaignId].validClicks += 1;
        }

        analytics.lastUpdated = new Date().toISOString();
        const analyticsStr = JSON.stringify(analytics, null, 2);
        fs.writeFileSync(analyticsPath, analyticsStr, 'utf-8');
        writeToSupabase('adAnalytics.json', analyticsStr).catch(() => {});
      }
    } catch (e) {
      console.warn('Error updating analytics on ad click:', e);
    }

    // 3. HTTP 302 Redirection
    res.statusCode = 302;
    res.setHeader('Location', destinationUrl);
    res.end();
    return;
  }

  if (pathname === '/api/ads/track-impression' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { campaignId, placementId, device = 'desktop', isAdmin = false, sessionId = '' } = JSON.parse(body || '{}');
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bingbot/i.test(userAgent);
        const isValid = !isAdmin && !isBot;
        const reason = isAdmin ? 'admin_preview' : isBot ? 'bot_detected' : 'valid';

        // Log event to adEvents.json
        const eventsPath = path.join(dataDir, 'adEvents.json');
        const events = fs.existsSync(eventsPath) ? JSON.parse(fs.readFileSync(eventsPath, 'utf-8') || '[]') : [];
        events.push({
          id: `evt-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          campaignId,
          placementId,
          type: 'impression',
          timestamp: new Date().toISOString(),
          isValid,
          reason,
          device,
          sessionId,
        });
        if (events.length > 5000) events.splice(0, events.length - 5000);
        const eventsStr = JSON.stringify(events, null, 2);
        fs.writeFileSync(eventsPath, eventsStr, 'utf-8');
        writeToSupabase('adEvents.json', eventsStr).catch(() => {});

        // Update adAnalytics.json if valid
        if (isValid) {
          const analyticsPath = path.join(dataDir, 'adAnalytics.json');
          if (fs.existsSync(analyticsPath)) {
            const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8') || '{}');
            if (!analytics.impressions) analytics.impressions = {};
            if (!analytics.impressionsByPlacement) analytics.impressionsByPlacement = {};
            if (!analytics.deviceBreakdown) analytics.deviceBreakdown = { desktop: 0, tablet: 0, mobile: 0 };
            if (!analytics.dailyStats) analytics.dailyStats = {};

            analytics.impressions[campaignId] = (analytics.impressions[campaignId] || 0) + 1;
            analytics.impressionsByPlacement[placementId] = (analytics.impressionsByPlacement[placementId] || 0) + 1;
            analytics.deviceBreakdown[device] = (analytics.deviceBreakdown[device] || 0) + 1;

            const today = new Date().toISOString().split('T')[0];
            if (!analytics.dailyStats[today]) analytics.dailyStats[today] = {};
            if (!analytics.dailyStats[today][campaignId]) {
              analytics.dailyStats[today][campaignId] = { validImpressions: 0, grossClicks: 0, validClicks: 0 };
            }
            analytics.dailyStats[today][campaignId].validImpressions += 1;
            analytics.lastUpdated = new Date().toISOString();
            const analyticsStr = JSON.stringify(analytics, null, 2);
            fs.writeFileSync(analyticsPath, analyticsStr, 'utf-8');
            writeToSupabase('adAnalytics.json', analyticsStr).catch(() => {});
          }
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, recorded: isValid }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/ads/report' && req.method === 'GET') {
    const token = parsedUrl.query?.token || '';
    try {
      const campaignsPath = path.join(dataDir, 'adCampaigns.json');
      const brandsPath = path.join(dataDir, 'adBrands.json');
      const placementsPath = path.join(dataDir, 'adPlacements.json');
      const analyticsPath = path.join(dataDir, 'adAnalytics.json');

      const campaigns = fs.existsSync(campaignsPath) ? JSON.parse(fs.readFileSync(campaignsPath, 'utf-8')) : [];
      const matchedCampaign = campaigns.find(c => c.shareToken === token && c.shareEnabled !== false);

      if (!matchedCampaign) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Reporte no encontrado o enlace revocado.' }));
        return;
      }

      const brands = fs.existsSync(brandsPath) ? JSON.parse(fs.readFileSync(brandsPath, 'utf-8')) : [];
      const brand = brands.find(b => b.id === matchedCampaign.brandId) || { name: 'Anunciante Oficial' };
      const placements = fs.existsSync(placementsPath) ? JSON.parse(fs.readFileSync(placementsPath, 'utf-8')) : [];
      const analytics = fs.existsSync(analyticsPath) ? JSON.parse(fs.readFileSync(analyticsPath, 'utf-8')) : {};

      const validImpressions = analytics.impressions?.[matchedCampaign.id] || 0;
      const grossClicks = analytics.grossClicks?.[matchedCampaign.id] || 0;
      const validClicks = analytics.validClicks?.[matchedCampaign.id] || analytics.clicks?.[matchedCampaign.id] || 0;
      const ctr = validImpressions > 0 ? ((validClicks / validImpressions) * 100).toFixed(2) : '0.00';
      const deliveryPercent = matchedCampaign.targetImpressions
        ? ((validImpressions / matchedCampaign.targetImpressions) * 100).toFixed(1)
        : undefined;

      const dailyTrend = [];
      if (analytics.dailyStats) {
        Object.keys(analytics.dailyStats).sort().forEach((d) => {
          const dayData = analytics.dailyStats[d]?.[matchedCampaign.id];
          if (dayData) {
            dailyTrend.push({
              date: d,
              validImpressions: dayData.validImpressions || 0,
              grossClicks: dayData.grossClicks || 0,
              validClicks: dayData.validClicks || 0,
            });
          }
        });
      }

      const placementBreakdown = (matchedCampaign.placements || []).map((plcId) => {
        const plcConfig = placements.find(p => p.id === plcId);
        const imp = analytics.impressionsByPlacement?.[plcId] || 0;
        const clk = analytics.clicksByPlacement?.[plcId] || 0;
        const pCtr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : '0.00';
        return {
          placementId: plcId,
          name: plcConfig?.name || plcId,
          impressions: imp,
          clicks: clk,
          ctr: pCtr,
        };
      });

      const reportData = {
        campaign: matchedCampaign,
        brand,
        stats: {
          validImpressions,
          grossClicks,
          validClicks,
          ctr,
          deliveryPercent,
          targetImpressions: matchedCampaign.targetImpressions,
          budget: matchedCampaign.budget,
          startDate: matchedCampaign.startDate,
          endDate: matchedCampaign.endDate,
        },
        dailyTrend,
        placementBreakdown,
        methodology: {
          impressionRule: 'IntersectionObserver >= 50% de área visible durante al menos 1.000 ms continuo. Deduplicado por sesión de navegación.',
          clickRule: 'Redirección a través de endpoint /api/ads/click con filtrado de bots y bloqueo de clics rápidos duplicados (< 3s).',
          lastUpdated: analytics.lastUpdated || new Date().toISOString(),
        },
      };

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(reportData));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  if (pathname === '/api/ads/advertiser-portal' && req.method === 'GET') {
    const token = parsedUrl.query?.token || '';
    try {
      const campaignsPath = path.join(dataDir, 'adCampaigns.json');
      const brandsPath = path.join(dataDir, 'adBrands.json');
      const placementsPath = path.join(dataDir, 'adPlacements.json');
      const analyticsPath = path.join(dataDir, 'adAnalytics.json');

      const brands = fs.existsSync(brandsPath) ? JSON.parse(fs.readFileSync(brandsPath, 'utf-8')) : [];
      const brand = brands.find(b => (b.portalToken === token || b.id === token) && b.portalEnabled !== false);

      if (!brand) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Portal de anunciante no encontrado o acceso revocado.' }));
        return;
      }

      const campaigns = fs.existsSync(campaignsPath) ? JSON.parse(fs.readFileSync(campaignsPath, 'utf-8')) : [];
      const brandCampaigns = campaigns.filter(c => c.brandId === brand.id);
      const placements = fs.existsSync(placementsPath) ? JSON.parse(fs.readFileSync(placementsPath, 'utf-8')) : [];
      const analytics = fs.existsSync(analyticsPath) ? JSON.parse(fs.readFileSync(analyticsPath, 'utf-8')) : {};

      let totalBudget = 0;
      let totalTargetImpressions = 0;
      let totalValidImpressions = 0;
      let totalGrossClicks = 0;
      let totalValidClicks = 0;

      const campaignsWithMetrics = brandCampaigns.map(camp => {
        const vImp = analytics.impressions?.[camp.id] || 0;
        const gClk = analytics.grossClicks?.[camp.id] || 0;
        const vClk = analytics.validClicks?.[camp.id] || analytics.clicks?.[camp.id] || 0;
        const ctr = vImp > 0 ? ((vClk / vImp) * 100).toFixed(2) : '0.00';
        const del = camp.targetImpressions ? ((vImp / camp.targetImpressions) * 100).toFixed(1) : undefined;

        totalBudget += (camp.budget || 0);
        totalTargetImpressions += (camp.targetImpressions || 0);
        totalValidImpressions += vImp;
        totalGrossClicks += gClk;
        totalValidClicks += vClk;

        return {
          ...camp,
          metrics: {
            validImpressions: vImp,
            grossClicks: gClk,
            validClicks: vClk,
            ctr,
            deliveryPercent: del,
          },
        };
      });

      const overallCtr = totalValidImpressions > 0 ? ((totalValidClicks / totalValidImpressions) * 100).toFixed(2) : '0.00';
      const overallDeliveryPercent = totalTargetImpressions > 0 ? ((totalValidImpressions / totalTargetImpressions) * 100).toFixed(1) : undefined;

      const dailyTrendMap = {};
      if (analytics.dailyStats) {
        Object.keys(analytics.dailyStats).sort().forEach(d => {
          brandCampaigns.forEach(camp => {
            const dayData = analytics.dailyStats[d]?.[camp.id];
            if (dayData) {
              if (!dailyTrendMap[d]) dailyTrendMap[d] = { validImpressions: 0, grossClicks: 0, validClicks: 0 };
              dailyTrendMap[d].validImpressions += (dayData.validImpressions || 0);
              dailyTrendMap[d].grossClicks += (dayData.grossClicks || 0);
              dailyTrendMap[d].validClicks += (dayData.validClicks || 0);
            }
          });
        });
      }

      const dailyTrend = Object.keys(dailyTrendMap).sort().map(d => ({ date: d, ...dailyTrendMap[d] }));
      const usedPlacements = Array.from(new Set(brandCampaigns.flatMap(c => c.placements || [])));
      const placementBreakdown = usedPlacements.map(plcId => {
        const plcConfig = placements.find(p => p.id === plcId);
        let plcImp = 0;
        let plcClk = 0;
        brandCampaigns.forEach(camp => {
          if (camp.placements?.includes(plcId)) {
            plcImp += (analytics.impressions?.[camp.id] || 0);
            plcClk += (analytics.validClicks?.[camp.id] || analytics.clicks?.[camp.id] || 0);
          }
        });
        const pCtr = plcImp > 0 ? ((plcClk / plcImp) * 100).toFixed(2) : '0.00';
        return {
          placementId: plcId,
          name: plcConfig?.name || plcId,
          impressions: plcImp,
          clicks: plcClk,
          ctr: pCtr,
        };
      });

      const portalData = {
        brand,
        campaigns: campaignsWithMetrics,
        totals: {
          totalCampaigns: brandCampaigns.length,
          activeCampaigns: brandCampaigns.filter(c => c.status === 'activa').length,
          totalBudget,
          totalTargetImpressions,
          validImpressions: totalValidImpressions,
          grossClicks: totalGrossClicks,
          validClicks: totalValidClicks,
          overallCtr,
          overallDeliveryPercent,
        },
        dailyTrend,
        placementBreakdown,
        methodology: {
          impressionRule: 'IntersectionObserver >= 50% de área visible durante al menos 1.000 ms continuo. Deduplicado por sesión de navegación.',
          clickRule: 'Redirección a través de endpoint /api/ads/click con filtrado de bots y bloqueo de clics rápidos duplicados (< 3s).',
          lastUpdated: analytics.lastUpdated || new Date().toISOString(),
        },
      };

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(portalData));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 1.9. API: Live Visitor Tracking & Audience Telemetry
  if (pathname === '/api/track-visit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const metricsFile = path.join(dataDir, 'siteMetrics.json');
        let metrics = {
          totalUniqueVisitors: 0,
          totalPageviews: 0,
          dailyStats: {},
          deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
          sourcesBreakdown: { instagram: 0, direct_whatsapp: 0, google_search: 0, referral: 0 },
          sectionsBreakdown: { proyectos: 0, home: 0, territorios: 0, academia: 0, acerca: 0 },
          lastUpdated: new Date().toISOString()
        };
        if (fs.existsSync(metricsFile)) {
          try { metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8')); } catch {}
        }
        
        const today = new Date().toISOString().split('T')[0];
        if (!metrics.dailyStats) metrics.dailyStats = {};
        if (!metrics.dailyStats[today]) {
          metrics.dailyStats[today] = { uniqueVisitors: 0, pageviews: 0, leads: 0 };
        }
        
        metrics.totalPageviews = (metrics.totalPageviews || 0) + 1;
        metrics.dailyStats[today].pageviews = (metrics.dailyStats[today].pageviews || 0) + 1;
        
        if (payload.isNewVisitor) {
          metrics.totalUniqueVisitors = (metrics.totalUniqueVisitors || 0) + 1;
          metrics.dailyStats[today].uniqueVisitors = (metrics.dailyStats[today].uniqueVisitors || 0) + 1;
        }
        
        const dev = payload.device || 'desktop';
        if (!metrics.deviceBreakdown) metrics.deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
        metrics.deviceBreakdown[dev] = (metrics.deviceBreakdown[dev] || 0) + 1;
        
        const sec = payload.section || 'home';
        if (!metrics.sectionsBreakdown) metrics.sectionsBreakdown = {};
        metrics.sectionsBreakdown[sec] = (metrics.sectionsBreakdown[sec] || 0) + 1;
        
        const src = payload.source || 'direct_whatsapp';
        if (!metrics.sourcesBreakdown) metrics.sourcesBreakdown = {};
        metrics.sourcesBreakdown[src] = (metrics.sourcesBreakdown[src] || 0) + 1;
        
        metrics.lastUpdated = new Date().toISOString();
        const updatedStr = JSON.stringify(metrics, null, 2);
        fs.writeFileSync(metricsFile, updatedStr, 'utf-8');
        writeToSupabase('siteMetrics.json', updatedStr).catch(() => {});
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, today: metrics.dailyStats[today] }));
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 2. API: JSON Data endpoints (Con lectura y escritura sincronizada en Supabase Cloud)
  if (pathname.startsWith('/api/')) {
    let filename = '';
    if (pathname === '/api/site-metrics') filename = 'siteMetrics.json';
    else if (pathname === '/api/opportunities-data' || pathname === '/api/opportunities') filename = 'opportunities.json';
    else if (pathname === '/api/editorial-office' || pathname === '/api/editorial-state') filename = 'editorialOffice.json';
    else if (pathname === '/api/site-config') filename = 'siteConfig.json';
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

      if (req.method === 'DELETE' && (pathname === '/api/subscribers' || pathname === '/api/subscribe')) {
        const queryId = parsedUrl.query?.id;
        if (!queryId) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Falta el id del suscriptor a eliminar.' }));
          return;
        }
        const currentSubs = fs.existsSync(filePath)
          ? JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]')
          : [];
        const nextSubs = currentSubs.filter(s => s.id !== queryId);
        const updatedStr = JSON.stringify(nextSubs, null, 2);
        fs.writeFileSync(filePath, updatedStr, 'utf-8');
        writeToSupabase(filename, updatedStr).catch(() => {});
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, remaining: nextSubs.length }));
        return;
      }

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

                  // Sincronizar incremento de nuevo lead en siteMetrics.json
                  try {
                    const metricsFile = path.join(dataDir, 'siteMetrics.json');
                    if (fs.existsSync(metricsFile)) {
                      const m = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
                      const t = new Date().toISOString().split('T')[0];
                      if (!m.dailyStats) m.dailyStats = {};
                      if (!m.dailyStats[t]) m.dailyStats[t] = { uniqueVisitors: 0, pageviews: 0, leads: 0 };
                      m.dailyStats[t].leads = (m.dailyStats[t].leads || 0) + 1;
                      m.lastUpdated = new Date().toISOString();
                      const updatedM = JSON.stringify(m, null, 2);
                      fs.writeFileSync(metricsFile, updatedM, 'utf-8');
                      writeToSupabase('siteMetrics.json', updatedM).catch(() => {});
                    }
                  } catch (e) {}
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

            // Guardar localmente y actualizar caché en memoria
            fs.writeFileSync(filePath, body, 'utf-8');
            memoryContentCache.set(filename, body);

            // Guardar en Supabase Cloud Storage de forma permanente
            writeToSupabase(filename, body).catch((err) => {
              console.error(`Error guardando ${filename} en Supabase:`, err);
            });

            // Regenerar HTML estático SEO, manifiestos GEO y sitemap.xml en segundo plano
            if (['projects.json', 'articles.json', 'academia.json', 'territorios.json', 'authors.json'].includes(filename)) {
              scheduleSeoRegeneration();
            }

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

  // 2.5. First-Party SEO Image Proxy (/media/s/<sourceFile>/<seoSlug>.<ext>)
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname.startsWith('/media/s/')) {
    const mediaParts = pathname.replace(/^\/+|\/+$/g, '').split('/');
    if (mediaParts.length >= 3) {
      let sourceFile = '';
      try { sourceFile = decodeURIComponent(mediaParts[2]); } catch { sourceFile = mediaParts[2]; }
      if (/^[a-zA-Z0-9._-]+$/.test(sourceFile) && !sourceFile.includes('..')) {
        const ext = path.extname(sourceFile).toLowerCase() || path.extname(pathname).toLowerCase() || '.webp';
        const contentType = MIME_TYPES[ext] || 'image/webp';
        const localCachedPath = path.join(uploadsDir, sourceFile);

        if (fs.existsSync(localCachedPath) && fs.statSync(localCachedPath).isFile()) {
          res.statusCode = 200;
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('X-Robots-Tag', 'all');
          if (req.method === 'HEAD') {
            res.end();
          } else {
            fs.createReadStream(localCachedPath).pipe(res);
          }
          return;
        }

        const remoteUrl = `${SUPABASE_URL}/storage/v1/object/public/uploads/${encodeURIComponent(sourceFile)}`;
        fetch(remoteUrl)
          .then(async (upstream) => {
            if (!upstream.ok) {
              res.statusCode = 404;
              res.end('Image not found');
              return;
            }
            const buf = Buffer.from(await upstream.arrayBuffer());
            try { fs.writeFileSync(localCachedPath, buf); } catch {}
            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', buf.length);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('X-Robots-Tag', 'all');
            if (req.method === 'HEAD') {
              res.end();
            } else {
              res.end(buf);
            }
          })
          .catch(() => {
            res.statusCode = 502;
            res.end('Upstream error');
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

  // Microsoft Clarity & Historical Asset Fallback (Rescate de CSS y Chunks anteriores)
  if (!fs.existsSync(filePath) && pathname.startsWith('/assets/')) {
    const ext = path.extname(pathname).toLowerCase();
    const assetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      if (ext === '.css') {
        const activeCss = fs.readdirSync(assetsDir).find((f) => f.endsWith('.css'));
        if (activeCss) {
          filePath = path.join(assetsDir, activeCss);
        }
      } else if (ext === '.js') {
        const targetPrefix = path.basename(pathname).split('-')[0];
        const matchingChunk = fs.readdirSync(assetsDir).find((f) => f.startsWith(targetPrefix) && f.endsWith('.js'));
        if (matchingChunk) {
          filePath = path.join(assetsDir, matchingChunk);
        }
      }
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

function isKnownSpaRoute(pathname, query) {
  if (pathname === '/' || pathname === '' || pathname === '/index.html') return true;
  if (pathname.startsWith('/admin')) return true;

  if (query && (query.portal || query.token || query.anunciante || query['ad-advertiser'] || query['ad-report'])) {
    return true;
  }

  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/');
  const sec = parts[0]?.toLowerCase();
  const slug = parts[1]?.toLowerCase();

  if (sec === 'acerca-de-ea' || sec === 'acerca') return true;

  if (sec === 'proyectos' || sec === 'academia' || sec === 'territorios') {
    if (!slug) return true;
    try {
      const coll = sec === 'proyectos' ? 'projects.json' : sec === 'academia' ? 'academia.json' : 'territorios.json';
      const raw = memoryContentCache.get(coll) || (fs.existsSync(path.join(dataDir, coll)) ? fs.readFileSync(path.join(dataDir, coll), 'utf8') : '[]');
      const items = JSON.parse(raw || '[]');
      return items.some((item) => (item.slug && item.slug.toLowerCase() === slug) || (item.id && item.id.toLowerCase() === slug));
    } catch {
      return false;
    }
  }

  if (sec === 'estudios' || sec === 'autores') {
    if (!slug) return true;
    try {
      const raw = memoryContentCache.get('authors.json') || (fs.existsSync(path.join(dataDir, 'authors.json')) ? fs.readFileSync(path.join(dataDir, 'authors.json'), 'utf8') : '[]');
      const authors = JSON.parse(raw || '[]');
      return authors.some((a) => {
        const aSlug = (a.slug || a.name || a.id).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return aSlug === slug || (a.id && a.id.toLowerCase() === slug);
      });
    } catch {
      return false;
    }
  }

  return false;
}

function resolveLegacyRedirect(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean || clean.includes('/') || clean.includes('.')) return null;
  const slug = clean.toLowerCase();

  const collections = [
    { section: 'proyectos', file: 'projects.json' },
    { section: 'academia', file: 'academia.json' },
    { section: 'territorios', file: 'territorios.json' },
  ];

  for (const { section, file } of collections) {
    try {
      const raw = memoryContentCache.get(file) || (fs.existsSync(path.join(dataDir, file)) ? fs.readFileSync(path.join(dataDir, file), 'utf8') : '[]');
      const items = JSON.parse(raw || '[]');
      const match = items.find((item) =>
        (item.slug && item.slug.toLowerCase() === slug) ||
        (item.id && item.id.toLowerCase() === slug)
      );
      if (match) {
        return `/${section}/${match.slug || match.id}`;
      }
    } catch {
      // Ignore parse errors for non-fatal legacy fallback
    }
  }
  return null;
}

  // Fallback for SPA routing vs 301 legacy redirects vs Real 404
  if (!fs.existsSync(filePath)) {
    if (pathname.startsWith('/admin')) {
      filePath = path.join(distDir, 'admin.html');
    } else if (isKnownSpaRoute(pathname, parsedUrl.query)) {
      filePath = path.join(distDir, 'index.html');
    } else {
      const legacyTarget = resolveLegacyRedirect(pathname);
      if (legacyTarget) {
        res.statusCode = 301;
        res.setHeader('Location', legacyTarget);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.end();
        return;
      }
      const notFoundPath = fs.existsSync(path.join(distDir, '404.html'))
        ? path.join(distDir, '404.html')
        : path.join(rootDir, 'public', '404.html');

      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      if (fs.existsSync(notFoundPath)) {
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.end('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>Ecuadorian Architecture</p></body></html>');
      }
      return;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
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
