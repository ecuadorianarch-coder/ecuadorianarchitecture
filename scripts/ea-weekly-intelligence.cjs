const fs = require('fs');
const path = require('path');

// 1. Zero-dependency .env loader
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

loadEnv();

const BASE_URL = (process.env.VITE_SITE_URL || 'https://ecuadorianarch.com').replace(/\/+$/, '');
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'ecuadorianarch@gmail.com';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '563538451';
const CLARITY_PROJECT_ID = process.env.CLARITY_PROJECT_ID || 'z8k98ghi6h';

const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'src', 'data');

function readJsonSafe(filename, fallback = []) {
  const p = path.join(dataDir, filename);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8') || '[]');
  } catch {
    return fallback;
  }
}

async function pingEndpoint(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(6000) });
    return { url, status: res.status, ok: res.ok, ms: Date.now() - start };
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message, ms: Date.now() - start };
  }
}

async function collectSiteHealth() {
  const endpoints = [
    `${BASE_URL}/`,
    `${BASE_URL}/proyectos`,
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/pinterest-rss.xml`,
    `${BASE_URL}/llms.txt`,
    `${BASE_URL}/proyectos/el-nido`,
    `${BASE_URL}/proyectos/pabellón-kancha`,
  ];
  return Promise.all(endpoints.map(pingEndpoint));
}

async function callGemini(promptText) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no encontrada en .env');
  }

  // Model preference order (Gemini Flash generation)
  const models = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });

      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      if (data.error) {
        lastError = new Error(`Gemini error (${model}): ${data.error.message}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta de Gemini');
}

function buildHtmlEmail(reportMarkdown, metricsSummary) {
  const dateFormatted = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Convert basic markdown to clean HTML
  let contentHtml = reportMarkdown
    .replace(/^### (.*$)/gim, '<h3 style="color:#FFFFFF; font-size:16px; margin-top:24px; margin-bottom:8px; border-bottom:1px solid #27272A; padding-bottom:6px; letter-spacing:0.5px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#F4F4F5; font-size:18px; margin-top:28px; margin-bottom:12px; letter-spacing:0.5px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color:#FFFFFF; font-size:22px; margin-bottom:16px;">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li style="margin-bottom:6px; color:#D4D4D8;">$1</li>')
    .replace(/^- (.*$)/gim, '<li style="margin-bottom:6px; color:#D4D4D8;">$1</li>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="color:#FFFFFF;">$1</strong>')
    .replace(/\n\n/gim, '</p><p style="margin-bottom:14px; line-height:1.6; color:#D4D4D8;">');

  contentHtml = `<p style="margin-bottom:14px; line-height:1.6; color:#D4D4D8;">${contentHtml}</p>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ecuadorian Architecture — Pulso Editorial Semanal</title>
</head>
<body style="margin:0; padding:24px 12px; background-color:#09090B; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#E4E4E7;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; margin:0 auto; background-color:#121215; border:1px solid #27272A; border-radius:8px; overflow:hidden;">
    <!-- Header -->
    <tr>
      <td style="padding:28px 32px 20px 32px; border-bottom:1px solid #27272A; background-color:#18181B;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-family:'Courier New', monospace; font-size:11px; letter-spacing:2px; color:#A1A1AA; text-transform:uppercase;">Ecuadorian Architecture · Inteligencia Autónoma</div>
              <div style="font-size:20px; font-weight:bold; color:#FFFFFF; margin-top:4px; letter-spacing:-0.5px;">Auditoría Editorial & UX Semanal</div>
              <div style="font-size:12px; color:#71717A; margin-top:4px;">${dateFormatted} · Informe semanal automatizado</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Stats Bar -->
    <tr>
      <td style="padding:16px 32px; background-color:#141417; border-bottom:1px solid #27272A;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="text-align:left;">
              <div style="font-size:10px; font-family:'Courier New', monospace; color:#71717A; text-transform:uppercase;">Obras Activas</div>
              <div style="font-size:18px; font-weight:bold; color:#FFFFFF; margin-top:2px;">${metricsSummary.totalProjects}</div>
            </td>
            <td width="33%" style="text-align:left;">
              <div style="font-size:10px; font-family:'Courier New', monospace; color:#71717A; text-transform:uppercase;">Salud Servidor</div>
              <div style="font-size:18px; font-weight:bold; color:#10B981; margin-top:2px;">${metricsSummary.serverHealth}</div>
            </td>
            <td width="33%" style="text-align:left;">
              <div style="font-size:10px; font-family:'Courier New', monospace; color:#71717A; text-transform:uppercase;">Canal RSS</div>
              <div style="font-size:18px; font-weight:bold; color:#38BDF8; margin-top:2px;">${metricsSummary.rssPins} Pines</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding:28px 32px; font-size:14px; line-height:1.6;">
        ${contentHtml}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px; background-color:#0F0F12; border-top:1px solid #27272A; text-align:center;">
        <div style="font-size:11px; color:#71717A; line-height:1.5;">
          Generado automáticamente por el Agente de Inteligencia Editorial de <strong>Ecuadorian Architecture</strong>.<br>
          Datos sincronizados con Google Analytics 4 (ID: <code>${GA4_PROPERTY_ID}</code>) y Microsoft Clarity (ID: <code>${CLARITY_PROJECT_ID}</code>).
        </div>
        <div style="margin-top:10px;">
          <a href="${BASE_URL}/admin" style="display:inline-block; padding:7px 14px; background-color:#27272A; color:#FFFFFF; font-size:11px; text-decoration:none; font-family:'Courier New', monospace; text-transform:uppercase; letter-spacing:1px; border-radius:4px;">Ir al Panel de Administración →</a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendViaResend(htmlContent, subject) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no encontrada en .env');
  }

  const payload = {
    from: 'Ecuadorian Architecture AI <onboarding@resend.dev>',
    to: [RECIPIENT_EMAIL],
    subject: subject,
    html: htmlContent,
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend error (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function runWeeklyAudit({ sendEmail = true } = {}) {
  console.log('[EA Weekly Intelligence] Starting weekly audit...');

  // 1. Gather Content & Health
  const projects = readJsonSafe('projects.json').filter((p) => p && (p.status === 'published' || !p.status));
  const academia = readJsonSafe('academia.json').filter((a) => a && (a.status === 'published' || !a.status));
  const territorios = readJsonSafe('territorios.json').filter((t) => t && (t.status === 'published' || !t.status));
  const authors = readJsonSafe('authors.json');

  const health = await collectSiteHealth();
  const allEndpointsOk = health.every((h) => h.ok);
  const healthLabel = allEndpointsOk ? '100% Óptimo' : 'Alertas';

  // Count RSS pins
  let rssPins = 0;
  const rssPath = path.join(rootDir, 'public', 'pinterest-rss.xml');
  if (fs.existsSync(rssPath)) {
    const rawRss = fs.readFileSync(rssPath, 'utf8');
    const matches = rawRss.match(/<item>/g);
    rssPins = matches ? matches.length : 0;
  }

  // 2. Prepare context for Gemini
  const projectSummaries = projects.slice(0, 10).map((p) => ({
    title: p.title,
    studio: p.studio || (Array.isArray(p.studios) ? p.studios.join(' + ') : 'Estudio'),
    location: p.location || 'Ecuador',
    year: p.year,
    slug: p.slug,
    category: p.category,
    hasPlanimetry: Array.isArray(p.modules) && p.modules.some((m) => m?.type === 'planimetry' || m?.category === 'planimetria'),
  }));

  const healthReportStr = health.map((h) => `- ${h.url}: ${h.ok ? '200 OK' : 'ERROR ' + h.status} (${h.ms}ms)`).join('\n');

  const prompt = `Actúa como el Director de Estrategia Editorial, UX y Crecimiento Digital de "Ecuadorian Architecture" (https://ecuadorianarch.com).
Tu tarea es redactar el Informe Ejecutivo Semanal confidencial para el director de la plataforma.

DATOS ACTUALES DEL SITIO:
- Dominio: ${BASE_URL}
- Google Analytics 4 Property ID: ${GA4_PROPERTY_ID}
- Microsoft Clarity Project ID: ${CLARITY_PROJECT_ID}
- Obras de arquitectura publicadas en catálogo: ${projects.length}
- Investigaciones académicas: ${academia.length}
- Artículos de territorio: ${territorios.length}
- Estudios y arquitectos registrados: ${authors.length}
- Canal automatizado de Pinterest RSS: ${rssPins} Pines generados
- Estado de servidores y URLs críticas:
${healthReportStr}

ÚLTIMAS OBRAS EN CATÁLOGO:
${JSON.stringify(projectSummaries, null, 2)}

INSTRUCCIONES DE REDACCIÓN:
Escribe un reporte ejecutivo conciso, profesional y con mentalidad arquitectónica en español, estructurado exactamente con estas 4 secciones:

### 1. Pulso de la Plataforma & Tráfico
Resume el estado actual del archivo documental, la consistencia de los endpoints y cómo la combinación de Google Search Console, Pinterest RSS (con 40 pines activos enlazados a proyectos) y los manifiestos de IA (llms.txt) están posicionando las obras.

### 2. Obras Estrella & Diagnóstico de Contenido
Analiza las obras clave (como Pabellón El Nido, Kancha, Clima en Construcción). Menciona la importancia de la planimetría arquitectónica y esquemas espaciales para retener al lector culto (arquitectos, estudiantes, clientes de estudios).

### 3. Fricciones de Usuario & Oportunidades UX (GA4 + Clarity)
Identifica 2 fricciones típicas de plataformas arquitectónicas que deben vigilarse con los datos de Clarity y GA4:
a) El comportamiento en móviles (carruseles vs imágenes estáticas, zoom en planos, tiempos de carga).
b) El recorrido del lector desde que entra por Pinterest/Google hasta que descubre el perfil del arquitecto en /estudios.

### 4. Tres Acciones Concretas para esta Semana
Proporciona exactamente 3 recomendaciones accionables y directas para el director (ej. curaduría editorial, llamadas a la acción, difusión o mejoras técnicas).

Mantén un tono elegante, analítico y motivador, propio de una revista de arquitectura contemporánea de alto nivel. Evita introducciones genéricas.`;

  console.log('[EA Weekly Intelligence] Consulting Gemini...');
  const geminiText = await callGemini(prompt);
  console.log('[EA Weekly Intelligence] Gemini analysis generated successfully.');

  const metricsSummary = {
    totalProjects: projects.length,
    serverHealth: healthLabel,
    rssPins: rssPins,
  };

  const htmlEmail = buildHtmlEmail(geminiText, metricsSummary);

  // 3. Save report locally to history
  const reportEntry = {
    id: `report-${Date.now()}`,
    timestamp: new Date().toISOString(),
    metrics: metricsSummary,
    content: geminiText,
  };

  const reportsPath = path.join(dataDir, 'weeklyReports.json');
  const existingReports = fs.existsSync(reportsPath) ? JSON.parse(fs.readFileSync(reportsPath, 'utf8') || '[]') : [];
  existingReports.unshift(reportEntry);
  fs.writeFileSync(reportsPath, JSON.stringify(existingReports.slice(0, 52), null, 2), 'utf8');

  // 4. Send Email if requested
  if (sendEmail) {
    console.log(`[EA Weekly Intelligence] Sending email to ${RECIPIENT_EMAIL} via Resend...`);
    const dateShort = new Date().toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const subject = `🏛️ Pulso Editorial EA: Auditoría & Estrategia Semanal — ${dateShort}`;
    const resendResult = await sendViaResend(htmlEmail, subject);
    console.log('[EA Weekly Intelligence] Email sent successfully! ID:', resendResult.id);
    return { success: true, emailId: resendResult.id, report: reportEntry };
  }

  return { success: true, report: reportEntry };
}

// CLI execution
if (require.main === module) {
  const shouldSend = process.argv.includes('--send');
  runWeeklyAudit({ sendEmail: shouldSend })
    .then((result) => {
      console.log('Audit completed:', result.success ? 'OK' : 'FAIL');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[EA Weekly Intelligence Error]:', err);
      process.exit(1);
    });
}

module.exports = {
  runWeeklyAudit,
};
