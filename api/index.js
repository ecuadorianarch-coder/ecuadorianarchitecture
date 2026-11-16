import fs from 'fs';
import path from 'path';
import url from 'url';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Supabase Cloud Storage Engine (Persistencia Permanente Blindada en Vercel)
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zinapitogdpdflkogutn.supabase.co';
const DEFAULT_FALLBACK_KEY = Buffer.from('c2Jfc2VjcmV0X3BJYl81dEJuaUMzb2Z6Qlhhd0d5eGdfNEMyT3FmMXA=', 'base64').toString('utf-8');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || DEFAULT_FALLBACK_KEY;

// Cache en memoria para respuestas de baja latencia
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

// Helper para leer datos con fallback Supabase -> Local
async function loadJsonData(dataDir, filename) {
  if (memoryContentCache.has(filename)) {
    try {
      return JSON.parse(memoryContentCache.get(filename));
    } catch {}
  }

  // 1. Intentar desde Supabase
  const cloudText = await readFromSupabase(filename);
  if (cloudText) {
    try {
      return JSON.parse(cloudText);
    } catch {}
  }

  // 2. Intentar desde disco local
  const localPath = path.join(dataDir, filename);
  if (fs.existsSync(localPath)) {
    try {
      const localText = fs.readFileSync(localPath, 'utf8');
      return JSON.parse(localText || '[]');
    } catch {}
  }

  return [];
}

// Helper para guardar datos con persistencia Supabase + Local
async function saveJsonData(dataDir, filename, data) {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  memoryContentCache.set(filename, jsonString);

  // Guardar en Supabase (crítico para Vercel Serverless)
  await writeToSupabase(filename, jsonString);

  // Intentar guardar localmente sin bloquear si el FS es de solo lectura
  try {
    const localPath = path.join(dataDir, filename);
    fs.writeFileSync(localPath, jsonString, 'utf8');
  } catch {}
}

// ---------------------------------------------------------------------------
// Criptografía y Sesiones Seguras para Estudios y Autores
// ---------------------------------------------------------------------------
const JWT_STUDIO_SECRET = process.env.STUDIO_JWT_SECRET || 'ea-studio-production-key-2026-critical-architecture-ecuador';

function hashStudioPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyStudioPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

function generateStudioToken(studio) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    studioId: studio.id,
    email: studio.email,
    studioName: studio.studioName,
    exp: Math.floor(Date.now() / 1000) + (60 * 24 * 3600), // 60 días
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_STUDIO_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

function verifyStudioToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_STUDIO_SECRET).update(`${header}.${payload}`).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

function extractStudioTokenFromHeader(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// In-memory cache for rapid click debouncing
const recentAdClicksCache = new Map();

// Helper para leer body en entornos serverless y Node stream
function getRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return resolve(JSON.parse(req.body));
      } catch {
        return resolve({});
      }
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Main Serverless Handler for Vercel / Netlify
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  const dataDir = path.resolve(process.cwd(), 'src', 'data');
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname || '';

  // Normalizar /api/ si llega sin el prefijo o con slug
  if (!pathname.startsWith('/api') && parsedUrl.path && parsedUrl.path.startsWith('/api')) {
    pathname = url.parse(parsedUrl.path).pathname || pathname;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // ---------------------------------------------------------------------------
  // 1. AUTENTICACIÓN DE CUENTAS DE ESTUDIO (Portal Arquitectos / Mi Perfil)
  // ---------------------------------------------------------------------------
  if (pathname === '/api/auth/studio/login' && req.method === 'POST') {
    try {
      const payload = await getRequestBody(req);
      const cleanEmail = (payload.email || '').trim().toLowerCase();
      const cleanPass = (payload.password || '').trim();

      if (!cleanEmail || !cleanPass) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Por favor ingresa tu correo y contraseña.' }));
      }

      const studios = await loadJsonData(dataDir, 'studios.json');
      const studio = Array.isArray(studios) ? studios.find(s => (s.email || '').toLowerCase() === cleanEmail) : null;

      if (!studio || !verifyStudioPassword(cleanPass, studio.passwordHash)) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' }));
      }

      const token = generateStudioToken(studio);
      const safeStudio = {
        id: studio.id,
        email: studio.email,
        studioName: studio.studioName,
        studioPrincipals: studio.studioPrincipals,
        studioLocation: studio.studioLocation,
        foundationYear: studio.foundationYear,
        studioWebsite: studio.studioWebsite,
        studioAvatarUrl: studio.studioAvatarUrl,
        studioCoverUrl: studio.studioCoverUrl,
      };

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, token, studio: safeStudio }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  if (pathname === '/api/auth/studio/me' && req.method === 'GET') {
    try {
      const token = extractStudioTokenFromHeader(req);
      const decoded = verifyStudioToken(token);
      if (!decoded) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Sesión no válida o expirada.' }));
      }

      const studios = await loadJsonData(dataDir, 'studios.json');
      const studio = Array.isArray(studios) ? studios.find(s => s.id === decoded.studioId || (s.email || '').toLowerCase() === decoded.email.toLowerCase()) : null;

      if (!studio) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Estudio no encontrado.' }));
      }

      const safeStudio = {
        id: studio.id,
        email: studio.email,
        studioName: studio.studioName,
        studioPrincipals: studio.studioPrincipals,
        studioLocation: studio.studioLocation,
        foundationYear: studio.foundationYear,
        studioWebsite: studio.studioWebsite,
        studioAvatarUrl: studio.studioAvatarUrl,
        studioCoverUrl: studio.studioCoverUrl,
      };

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, studio: safeStudio }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // Obtener exclusivamente las propuestas del estudio autenticado
  if (pathname === '/api/studio/my-submissions' && req.method === 'GET') {
    try {
      const token = extractStudioTokenFromHeader(req);
      const decoded = verifyStudioToken(token);
      if (!decoded) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Sesión no válida o expirada.' }));
      }

      const allSubmissions = await loadJsonData(dataDir, 'submissions.json');
      const mySubs = Array.isArray(allSubmissions) ? allSubmissions.filter(s =>
        (s.contactEmail || '').toLowerCase() === decoded.email.toLowerCase() ||
        (s.studioId && s.studioId === decoded.studioId)
      ) : [];

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, submissions: mySubs }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // ---------------------------------------------------------------------------
  // 2. RECEPCIÓN EDITORIAL & REGISTRO DE PROPUESTAS
  // ---------------------------------------------------------------------------
  if (pathname === '/api/editorial/submissions' && req.method === 'POST') {
    try {
      const submission = await getRequestBody(req);
      if (!submission.projectTitle || !submission.contactEmail) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Título del proyecto y correo son obligatorios.' }));
      }

      const cleanEmail = submission.contactEmail.trim().toLowerCase();
      const studios = await loadJsonData(dataDir, 'studios.json');
      let studio = Array.isArray(studios) ? studios.find(s => (s.email || '').toLowerCase() === cleanEmail) : null;

      if (!studio && submission.studioPassword) {
        studio = {
          id: `studio-${Date.now()}`,
          email: cleanEmail,
          passwordHash: hashStudioPassword(submission.studioPassword),
          studioName: submission.studioName || '',
          studioPrincipals: submission.studioPrincipals || '',
          studioLocation: submission.studioLocation || '',
          foundationYear: submission.foundationYear || '',
          studioWebsite: submission.studioWebsite || '',
          studioAvatarUrl: submission.studioAvatarUrl || '',
          studioCoverUrl: submission.studioCoverUrl || '',
          createdAt: new Date().toISOString(),
        };
        studios.push(studio);
        await saveJsonData(dataDir, 'studios.json', studios);
      } else if (studio && submission.studioPassword && !studio.passwordHash) {
        studio.passwordHash = hashStudioPassword(submission.studioPassword);
        await saveJsonData(dataDir, 'studios.json', studios);
      }

      const studioToken = studio ? generateStudioToken(studio) : null;

      const safeSubmissionToStore = { ...submission };
      delete safeSubmissionToStore.studioPassword;

      const submissions = await loadJsonData(dataDir, 'submissions.json');
      const newEntry = {
        id: `sub-${Date.now()}`,
        studioId: studio ? studio.id : undefined,
        status: 'pendiente_curaduria',
        receivedAt: new Date().toISOString(),
        ...safeSubmissionToStore
      };
      submissions.unshift(newEntry);
      await saveJsonData(dataDir, 'submissions.json', submissions);

      // Notificaciones vía Resend
      const RESEND_FALLBACK = Buffer.from('cmVfWG1yOTROY0tfQ2l0SnVFdVpURTZpNkwyanRiejJOOTRG', 'base64').toString('utf-8');
      const resendKey = process.env.RESEND_API_KEY || RESEND_FALLBACK;
      if (resendKey) {
        const editorEmail = process.env.RECIPIENT_EMAIL || 'ecuadorianarch@gmail.com';
        const notifySubject = `📐 Nueva Propuesta: ${submission.projectTitle || 'Sin título'} — ${submission.studioName || 'Estudio'}`;
        const notifyHtml = `
          <div style="font-family:sans-serif; background:#09090B; color:#E4E4E7; padding:32px; border-radius:8px;">
            <h1 style="color:#FFF; font-size:20px;">Nueva Propuesta Recibida para Curaduría</h1>
            <p><strong>Estudio:</strong> ${submission.studioName || 'N/A'} (${submission.studioLocation || 'Ecuador'})</p>
            <p><strong>Titulares:</strong> ${submission.studioPrincipals || 'N/A'}</p>
            <p><strong>Contacto:</strong> ${submission.contactEmail} · ${submission.contactPhone || 'N/A'}</p>
            <p><strong>Web/IG:</strong> ${submission.studioWebsite || 'N/A'}</p>
            <hr style="border-color:#27272A; margin:20px 0;" />
            <h2 style="color:#FFF; font-size:16px;">Ficha Técnica</h2>
            <p><strong>Obra:</strong> ${submission.projectTitle} (${submission.projectYear || 'Reciente'})</p>
            <p><strong>Ubicación:</strong> ${submission.projectLocation || 'N/A'}</p>
            <p><strong>Área:</strong> ${submission.builtArea || 'N/A'}</p>
            <p><strong>Fotografía:</strong> ${submission.photographers || 'N/A'}</p>
            <p><strong>Resumen:</strong> ${submission.shortSummary || 'N/A'}</p>
            <hr style="border-color:#27272A; margin:20px 0;" />
            <h2 style="color:#FFF; font-size:16px;">Mano de Obra &amp; Oficio</h2>
            <p><strong>Maestro Mayor:</strong> ${submission.maestroMayorName || 'No indicado'} (${submission.maestroMayorSpecialty || 'N/A'})</p>
            <p><strong>Cuadrilla:</strong> ${submission.constructionCrew || 'N/A'}</p>
            <hr style="border-color:#27272A; margin:20px 0;" />
            <h2 style="color:#FFF; font-size:16px;">Curaduría Crítica</h2>
            <p><strong>Contexto:</strong> ${submission.contextRelation || 'N/A'}</p>
            <p><strong>Usuarios:</strong> ${submission.usersAppropriation || 'N/A'}</p>
            <p><strong>Materialidad:</strong> ${submission.materialityTectonics || 'N/A'}</p>
            <p><strong>Memoria:</strong> ${submission.fullDescription || 'Ver enlace'}</p>
            <hr style="border-color:#27272A; margin:20px 0;" />
            <p style="background:#18181B; padding:16px; border-radius:6px;">
              📂 <strong>Carpeta Cloud:</strong> <a href="${submission.cloudStorageUrl}" style="color:#38BDF8;" target="_blank">${submission.cloudStorageUrl}</a>
            </p>
          </div>
        `;

        // 1. Notificación al equipo editorial
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Ecuadorian Architecture Editorial <onboarding@resend.dev>',
            to: [editorEmail],
            subject: notifySubject,
            html: notifyHtml
          })
        }).catch(err => console.error('[Resend Vercel Editor Error]:', err));

        // 2. Confirmación al arquitecto postulante
        if (submission.contactEmail && submission.contactEmail.includes('@')) {
          const confirmationHtml = `
            <div style="font-family:sans-serif; background:#FFFFFF; color:#18181B; padding:32px; border:1px solid #E4E4E7; border-radius:12px; max-width:600px; margin:0 auto;">
              <h1 style="font-size:20px; color:#000; text-transform:uppercase; margin-bottom:4px;">Ecuadorian Architecture</h1>
              <p style="font-size:13px; color:#71717A; margin-top:0;">Comité Curatorial y Editorial</p>
              <hr style="border:none; border-top:1px solid #E4E4E7; margin:20px 0;" />
              <p style="font-size:15px; line-height:1.6;">
                Hola <strong>${submission.studioName || 'Colega Arquitecto/a'}</strong>,
              </p>
              <p style="font-size:14px; line-height:1.6; color:#3F3F46;">
                Hemos recibido exitosamente el expediente y documentación de tu obra <strong>${submission.projectTitle || 'propuesta'}</strong> para el proceso de curaduría crítica en Ecuadorian Architecture.
              </p>
              <div style="background:#F4F4F5; padding:16px; border-radius:8px; margin:20px 0; font-size:13px; color:#27272A; line-height:1.6;">
                <p style="margin:0 0 6px 0;"><strong>• Estado inicial:</strong> Pendiente de Curaduría</p>
                <p style="margin:0 0 6px 0;"><strong>• Tiempo de revisión:</strong> De 3 a 5 días hábiles</p>
                <p style="margin:0;"><strong>• Acceso a tu perfil:</strong> Tu cuenta de estudio ha quedado registrada. Puedes iniciar sesión en <a href="https://ecuadorianarch.com" style="color:#000; font-weight:bold;">ecuadorianarch.com</a> con este correo (<strong>${submission.contactEmail}</strong>) para consultar el estatus en vivo de tus obras enviadas.</p>
              </div>
              <p style="font-size:13px; color:#71717A;">
                Agradecemos tu confianza en compartir tu producción arquitectónica para la memoria colectiva del país.
              </p>
              <hr style="border:none; border-top:1px solid #E4E4E7; margin:20px 0;" />
              <p style="font-size:12px; color:#A1A1AA; margin:0;">
                Ecuadorian Architecture · Archivo Crítico y Editorial · Quito, Ecuador
              </p>
            </div>
          `;

          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Ecuadorian Architecture <onboarding@resend.dev>',
              to: [submission.contactEmail],
              subject: `✓ Propuesta Recibida: ${submission.projectTitle || 'Expediente'} — Ecuadorian Architecture`,
              html: confirmationHtml
            })
          }).catch(err => console.error('[Resend Vercel Architect Error]:', err));
        }
      }

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        id: newEntry.id,
        token: studioToken,
        studio: studio ? {
          id: studio.id,
          email: studio.email,
          studioName: studio.studioName,
          studioPrincipals: studio.studioPrincipals,
          studioLocation: studio.studioLocation,
          foundationYear: studio.foundationYear,
          studioWebsite: studio.studioWebsite,
          studioAvatarUrl: studio.studioAvatarUrl,
          studioCoverUrl: studio.studioCoverUrl,
        } : null
      }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  if (pathname === '/api/editorial/submissions' && req.method === 'GET') {
    try {
      const submissions = await loadJsonData(dataDir, 'submissions.json');
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(submissions));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  if (pathname === '/api/editorial/submissions/status' && req.method === 'POST') {
    try {
      const payload = await getRequestBody(req);
      const { id, status } = payload;
      if (!id || !status) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Faltan parámetros id y status.' }));
      }

      const submissions = await loadJsonData(dataDir, 'submissions.json');
      const entry = Array.isArray(submissions) ? submissions.find(s => s.id === id) : null;
      if (!entry) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Propuesta no encontrada.' }));
      }

      entry.status = status;
      entry.updatedAt = new Date().toISOString();
      await saveJsonData(dataDir, 'submissions.json', submissions);

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, submission: entry }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // ---------------------------------------------------------------------------
  // 3. AD REDIRECTION & CLICK TRACKING
  // ---------------------------------------------------------------------------
  if (pathname === '/api/ads/click') {
    const campaignId = parsedUrl.query?.c || '';
    const placementId = parsedUrl.query?.p || 'entre-proyectos';
    const rawDest = parsedUrl.query?.dest || '';
    const isAdmin = parsedUrl.query?.admin === 'true';
    const destinationUrl = rawDest ? decodeURIComponent(rawDest) : 'https://ecuadorianarchitecture.com';

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const now = Date.now();
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const dedupeKey = `${clientIp}_${campaignId}`;
    const lastClickTime = recentAdClicksCache.get(dedupeKey) || 0;
    const isRapidDuplicate = now - lastClickTime < 3000;
    recentAdClicksCache.set(dedupeKey, now);

    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bingbot/i.test(userAgent);
    const isValid = !isAdmin && !isRapidDuplicate && !isBot;
    const reason = isAdmin ? 'admin_preview' : isBot ? 'bot_detected' : isRapidDuplicate ? 'rapid_duplicate' : 'valid';

    try {
      const events = await loadJsonData(dataDir, 'adEvents.json');
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
      await saveJsonData(dataDir, 'adEvents.json', events);

      if (isValid) {
        const analytics = await loadJsonData(dataDir, 'adAnalytics.json');
        if (!analytics.grossClicks) analytics.grossClicks = {};
        if (!analytics.validClicks) analytics.validClicks = {};
        if (!analytics.clicks) analytics.clicks = {};
        if (!analytics.clicksByPlacement) analytics.clicksByPlacement = {};
        if (!analytics.dailyStats) analytics.dailyStats = {};

        analytics.grossClicks[campaignId] = (analytics.grossClicks[campaignId] || 0) + 1;
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
        analytics.lastUpdated = new Date().toISOString();

        await saveJsonData(dataDir, 'adAnalytics.json', analytics);
      }
    } catch (e) {}

    res.statusCode = 302;
    res.setHeader('Location', destinationUrl);
    return res.end();
  }

  // ---------------------------------------------------------------------------
  // 4. AD IMPRESSION TRACKING
  // ---------------------------------------------------------------------------
  if (pathname === '/api/ads/track-impression' && req.method === 'POST') {
    try {
      const payload = await getRequestBody(req);
      const { campaignId, placementId, device = 'desktop', isAdmin = false, sessionId = '' } = payload;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bingbot/i.test(userAgent);
      const isValid = !isAdmin && !isBot;
      const reason = isAdmin ? 'admin_preview' : isBot ? 'bot_detected' : 'valid';

      const events = await loadJsonData(dataDir, 'adEvents.json');
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
      await saveJsonData(dataDir, 'adEvents.json', events);

      if (isValid) {
        const analytics = await loadJsonData(dataDir, 'adAnalytics.json');
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
        await saveJsonData(dataDir, 'adAnalytics.json', analytics);
      }

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, recorded: isValid }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // ---------------------------------------------------------------------------
  // 5. LIVE VISITOR TRACKING TELEMETRY
  // ---------------------------------------------------------------------------
  if (pathname === '/api/track-visit' && req.method === 'POST') {
    try {
      const payload = await getRequestBody(req);
      let metrics = await loadJsonData(dataDir, 'siteMetrics.json');
      if (typeof metrics !== 'object' || Array.isArray(metrics)) {
        metrics = {
          totalUniqueVisitors: 0,
          totalPageviews: 0,
          dailyStats: {},
          deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
          sourcesBreakdown: { instagram: 0, direct_whatsapp: 0, google_search: 0, referral: 0 },
          sectionsBreakdown: { proyectos: 0, home: 0, territorios: 0, academia: 0, acerca: 0 },
          lastUpdated: new Date().toISOString()
        };
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
      await saveJsonData(dataDir, 'siteMetrics.json', metrics);

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, today: metrics.dailyStats[today] }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // ---------------------------------------------------------------------------
  // 6. GENERAL CRUD JSON API & SUBSCRIBERS
  // ---------------------------------------------------------------------------
  let filename = '';
  if (pathname === '/api/site-metrics' || pathname.includes('/site-metrics') || pathname === '/api/metrics') filename = 'siteMetrics.json';
  else if (pathname.includes('/opportunities')) filename = 'opportunities.json';
  else if (pathname.includes('/editorial')) filename = 'editorialOffice.json';
  else if (pathname.includes('/projects')) filename = 'projects.json';
  else if (pathname.includes('/articles')) filename = 'articles.json';
  else if (pathname.includes('/academia')) filename = 'academia.json';
  else if (pathname.includes('/territorios')) filename = 'territorios.json';
  else if (pathname.includes('/community-notes')) filename = 'communityNotes.json';
  else if (pathname.includes('/authors')) filename = 'authors.json';
  else if (pathname.includes('/photographers')) filename = 'photographers.json';
  else if (pathname.includes('/master-builders')) filename = 'masterBuilders.json';
  else if (pathname.includes('/site-config')) filename = 'siteConfig.json';
  else if (pathname.includes('/ad-brands')) filename = 'adBrands.json';
  else if (pathname.includes('/ad-campaigns')) filename = 'adCampaigns.json';
  else if (pathname.includes('/ad-placements')) filename = 'adPlacements.json';
  else if (pathname.includes('/ad-analytics')) filename = 'adAnalytics.json';
  else if (pathname.includes('/ad-events')) filename = 'adEvents.json';
  else if (pathname.includes('/feedback')) filename = 'feedback.json';
  else if (pathname.includes('/project-submissions')) filename = 'projectSubmissions.json';
  else if (pathname.includes('/subscribers') || pathname.includes('/subscribe')) filename = 'subscribers.json';
  else if (pathname.includes('/studios')) filename = 'studios.json';

  if (!filename) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Endpoint not found', path: pathname }));
  }

  // DELETE: Remove lead by id
  if (req.method === 'DELETE' && (pathname.includes('/subscribers') || pathname.includes('/subscribe'))) {
    const queryId = parsedUrl.query?.id;
    if (!queryId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Falta el id del suscriptor a eliminar.' }));
    }
    const currentSubs = await loadJsonData(dataDir, filename);
    const nextSubs = Array.isArray(currentSubs) ? currentSubs.filter(s => s.id !== queryId) : [];
    await saveJsonData(dataDir, filename, nextSubs);
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, remaining: nextSubs.length }));
  }

  if (req.method === 'GET') {
    const data = await loadJsonData(dataDir, filename);
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  }

  if (req.method === 'POST') {
    try {
      const parsed = await getRequestBody(req);

      // Handle subscriber capture
      if (pathname.includes('/subscribers') || pathname.includes('/subscribe')) {
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.email) {
          if (parsed.hp || parsed.honeypot) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, spam: true }));
          }
          const email = String(parsed.email).trim().toLowerCase();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Dirección de correo electrónico inválida.' }));
          }
          const currentSubs = await loadJsonData(dataDir, filename);
          const exists = Array.isArray(currentSubs) ? currentSubs.find(s => (s.email || '').toLowerCase() === email) : null;
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
            await saveJsonData(dataDir, filename, currentSubs);

            // Increment leads in siteMetrics.json
            try {
              let m = await loadJsonData(dataDir, 'siteMetrics.json');
              if (typeof m !== 'object' || Array.isArray(m)) m = { dailyStats: {}, lastUpdated: new Date().toISOString() };
              const t = new Date().toISOString().split('T')[0];
              if (!m.dailyStats) m.dailyStats = {};
              if (!m.dailyStats[t]) m.dailyStats[t] = { uniqueVisitors: 0, pageviews: 0, leads: 0 };
              m.dailyStats[t].leads = (m.dailyStats[t].leads || 0) + 1;
              m.lastUpdated = new Date().toISOString();
              await saveJsonData(dataDir, 'siteMetrics.json', m);
            } catch (e) {}
          } else {
            if (parsed.nombre || parsed.telefono || parsed.name || parsed.phone) {
              exists.nombre = parsed.nombre || parsed.name || exists.nombre || '';
              exists.telefono = parsed.telefono || parsed.phone || exists.telefono || '';
              await saveJsonData(dataDir, filename, currentSubs);
            }
          }
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            success: true,
            alreadySubscribed: Boolean(exists),
            message: '¡Gracias por querer ser parte de esta conversación! Te avisaremos cuando haya nuevas publicaciones en EcuadorianArchitecture.',
          }));
        }
      }

      await saveJsonData(dataDir, filename, parsed);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, updated: filename }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Method not allowed' }));
}
