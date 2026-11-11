const fs = require('fs');
const path = require('path');
const {
  cleanText,
  slugifySeo,
  extractStudios,
  extractUploadFilename,
  extractProjectSeoImages,
} = require('./image-seo-helpers.cjs');

const BASE_URL = (process.env.VITE_SITE_URL || 'https://ecuadorianarch.com').replace(/\/+$/, '');
const MAX_PINS_PER_PROJECT = 5;
const MAX_PLANIMETRY_SLOTS = 2;

const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'src', 'data');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const uploadsDir = path.join(publicDir, 'images', 'uploads');

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(str) {
  return cleanText(String(str || '').replace(/<[^>]*>/g, ' '));
}

function readPublishedCollection(filename, section) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    const items = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    if (!Array.isArray(items)) return [];
    return items
      .filter((item) => item && (item.status === 'published' || !item.status))
      .map((item) => ({ item, section }));
  } catch {
    return [];
  }
}

function inferImageMimeType(url) {
  const clean = String(url || '').split('?')[0].toLowerCase();
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.gif')) return 'image/gif';
  return 'image/webp';
}

function getLocalFileLength(rawUrl) {
  const filename = extractUploadFilename(rawUrl);
  if (filename) {
    const localPath = path.join(uploadsDir, filename);
    if (fs.existsSync(localPath)) {
      try {
        return fs.statSync(localPath).size || 150000;
      } catch {
        // Fallback below
      }
    }
  }
  return 150000;
}

function looksLikePlanOrDiagram(img) {
  if (img.isPlan) return true;
  const text = `${img.rawUrl || ''} ${img.rawCaption || ''}`.toLowerCase();
  return /(planimet|planta|corte|seccion|sección|axo|axonometr|esquema|isometr|detalle|elevacion|elevación|alzado|diagrama)/.test(text);
}

/**
 * Curates up to MAX_PINS_PER_PROJECT images per work:
 * 1) Hero image first
 * 2) Up to MAX_PLANIMETRY_SLOTS architectural drawings/diagrams/axonometries
 * 3) Top remaining photographs up to the project cap
 */
function selectCuratedImages(project, siteUrl) {
  const all = extractProjectSeoImages(project, siteUrl).filter((img) => {
    const u = (img.rawUrl || img.url || '').toLowerCase();
    return u && !u.includes('/logo.svg') && !u.includes('images.unsplash.com');
  });
  if (all.length === 0) return [];

  const picked = [];
  const pickedSet = new Set();

  const add = (img, role) => {
    if (!img || pickedSet.has(img.url) || picked.length >= MAX_PINS_PER_PROJECT) return false;
    pickedSet.add(img.url);
    picked.push({ ...img, role });
    return true;
  };

  // 1. Hero image
  const hero = all.find((img) => img.isHero) || all[0];
  add(hero, 'hero');

  // 2. Planimetry / diagrams / axonometries
  let planCount = 0;
  for (const img of all) {
    if (planCount >= MAX_PLANIMETRY_SLOTS || picked.length >= MAX_PINS_PER_PROJECT) break;
    if (!pickedSet.has(img.url) && looksLikePlanOrDiagram(img)) {
      if (add(img, 'planimetry')) planCount += 1;
    }
  }

  // 3. Top remaining gallery photographs
  for (const img of all) {
    if (picked.length >= MAX_PINS_PER_PROJECT) break;
    if (!pickedSet.has(img.url)) {
      add(img, 'gallery');
    }
  }

  return picked;
}

function buildPinTitle(project, img, index) {
  const title = cleanText(project?.title || 'Obra Arquitectónica');
  const studio = extractStudios(project)[0] || '';
  const suffix = studio ? ` — ${studio}` : '';

  if (img.role === 'hero') {
    return `${title}${suffix} | Arquitectura Ecuatoriana`.slice(0, 100);
  }
  if (img.role === 'planimetry') {
    const tag = img.rawCaption ? cleanText(img.rawCaption) : 'Planimetría y Esquema';
    return `${title}: ${tag}${suffix}`.slice(0, 100);
  }
  const tag = img.rawCaption ? cleanText(img.rawCaption) : `Vista ${index + 1}`;
  return `${title}: ${tag}${suffix} | Ecuadorian Architecture`.slice(0, 100);
}

function buildPinDescription(project, img) {
  const title = cleanText(project?.title || 'Proyecto Arquitectónico');
  const studios = extractStudios(project).join(' + ');
  const location = cleanText(project?.location || 'Ecuador');
  const year = cleanText(project?.year || '');
  const category = cleanText(project?.category || 'Arquitectura');
  const summary = stripHtml(project?.seo?.metaDescription || project?.excerpt || project?.subtitle || project?.resena || '');
  const caption = cleanText(img.rawCaption || '');

  const metaLine = [
    category,
    studios ? `por ${studios}` : '',
    location,
    year,
  ].filter(Boolean).join(' · ');

  const parts = [
    caption ? `${title} — ${caption}.` : `${title}.`,
    metaLine ? `${metaLine}.` : '',
    summary,
    'Publicado en Ecuadorian Architecture.',
  ].filter(Boolean);

  return parts.join(' ').slice(0, 495);
}

function getItemTimestamp(item) {
  const rawDate = item?.updatedAt || item?.createdAt || (item?.year ? `${item.year}-01-01T12:00:00Z` : '');
  const ms = Date.parse(rawDate);
  return Number.isFinite(ms) ? ms : Date.now();
}

function generatePinterestRss() {
  const records = [
    ...readPublishedCollection('projects.json', 'proyectos'),
    ...readPublishedCollection('territorios.json', 'territorios'),
    ...readPublishedCollection('academia.json', 'academia'),
  ];

  // Newest works first
  records.sort((a, b) => getItemTimestamp(b.item) - getItemTimestamp(a.item));

  const rssItems = [];
  for (const { item, section } of records) {
    const slug = cleanText(item.slug || item.id);
    if (!slug) continue;

    const projectUrl = encodeURI(`${BASE_URL}/${section}/${slug}`);
    const curatedImages = selectCuratedImages(item, BASE_URL);
    const baseMs = getItemTimestamp(item);
    const category = cleanText(item.category || (section === 'academia' ? 'Academia' : section === 'territorios' ? 'Territorios' : 'Arquitectura'));

    curatedImages.forEach((img, idx) => {
      const mimeType = inferImageMimeType(img.url);
      const byteLength = getLocalFileLength(img.rawUrl);
      const sourceFileSlug = slugifySeo(extractUploadFilename(img.rawUrl) || `${idx}`);
      const guid = `ea-pin-${section}-${slugifySeo(slug)}-${idx + 1}-${sourceFileSlug}`.slice(0, 120);
      // Slight 60s spacing so Pinterest preserves hero-first order deterministically
      const pubDate = new Date(baseMs - idx * 60000).toUTCString();
      const pinTitle = buildPinTitle(item, img, idx);
      const pinDesc = buildPinDescription(item, img);

      rssItems.push(`    <item>
      <title>${escapeXml(pinTitle)}</title>
      <link>${escapeXml(projectUrl)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <category>${escapeXml(category)}</category>
      <description>${escapeXml(pinDesc)}</description>
      <enclosure url="${escapeXml(img.url)}" length="${byteLength}" type="${mimeType}" />
      <media:content url="${escapeXml(img.url)}" medium="image" type="${mimeType}">
        <media:title>${escapeXml(pinTitle)}</media:title>
        <media:description>${escapeXml(img.alt || pinDesc)}</media:description>
      </media:content>
    </item>`);
    });
  }

  const feedUrl = `${BASE_URL}/pinterest-rss.xml`;
  const lastBuildDate = new Date().toUTCString();

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ecuadorian Architecture — Obras, Estudios y Crítica</title>
    <link>${escapeXml(BASE_URL)}</link>
    <description>Archivo documental curado de arquitectura ecuatoriana contemporánea, planimetrías, pabellones, vivienda, academia y territorios.</description>
    <language>es-ec</language>
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${rssItems.join('\n')}
  </channel>
</rss>
`;

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'pinterest-rss.xml'), rssXml, 'utf8');

  if (fs.existsSync(distDir)) {
    try {
      fs.writeFileSync(path.join(distDir, 'pinterest-rss.xml'), rssXml, 'utf8');
    } catch {
      // Non-fatal if dist is locked
    }
  }

  console.log(`[EA Pinterest RSS] Generated pinterest-rss.xml with ${rssItems.length} curated Pins across ${records.length} works.`);
}

generatePinterestRss();
