const fs = require('fs');
const path = require('path');
const {
  cleanText,
  extractProjectSeoImages,
  toFirstPartySeoImageUrl,
} = require('./image-seo-helpers.cjs');

const baseUrl = process.env.VITE_SITE_URL || 'https://ecuadorianarch.com';
const dataDir = path.join(__dirname, '..', 'src', 'data');
const publicDir = path.join(__dirname, '..', 'public');

const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf8')).filter(p => p.status === 'published' || !p.status);
const territorios = JSON.parse(fs.readFileSync(path.join(dataDir, 'territorios.json'), 'utf8')).filter(t => t.status === 'published' || !t.status);
const academia = JSON.parse(fs.readFileSync(path.join(dataDir, 'academia.json'), 'utf8')).filter(a => a.status === 'published' || !a.status);
const authorsPath = path.join(dataDir, 'authors.json');
const authors = fs.existsSync(authorsPath) ? JSON.parse(fs.readFileSync(authorsPath, 'utf8') || '[]') : [];

const today = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/proyectos', priority: '0.9', changefreq: 'daily' },
  { path: '/territorios', priority: '0.9', changefreq: 'weekly' },
  { path: '/academia', priority: '0.9', changefreq: 'weekly' },
  { path: '/acerca-de-ea', priority: '0.7', changefreq: 'monthly' },
];

const urls = [];

for (const r of staticRoutes) {
  urls.push(`  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`);
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildImagesXml(item, section, baseUrl) {
  const images = extractProjectSeoImages(item, baseUrl);
  if (!images.length) return '';
  return images
    .map((img) => {
      const cap = escapeXml(img.caption || '');
      const title = escapeXml(img.title || '');
      return `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      <image:title>${title}</image:title>${cap ? `\n      <image:caption>${cap}</image:caption>` : ''}
    </image:image>`;
    })
    .join('');
}

for (const { list, section } of [
  { list: projects, section: 'proyectos' },
  { list: territorios, section: 'territorios' },
  { list: academia, section: 'academia' },
]) {
  for (const item of list) {
    const slug = item.slug || item.id;
    const imageXml = buildImagesXml(item, section, baseUrl);
    urls.push(`  <url>
    <loc>${baseUrl}/${section}/${slug}</loc>
    <lastmod>${item.updatedAt ? item.updatedAt.split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>`);
  }
}

for (const auth of authors) {
  const slug = auth.slug || cleanText(auth.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) continue;
  const rawCover = cleanText(auth.coverImage || '');
  const isStockUnsplash = rawCover.includes('images.unsplash.com');
  let imageXml = '';
  if (rawCover && !isStockUnsplash) {
    const seoCover = toFirstPartySeoImageUrl(
      rawCover,
      { slug, title: auth.name, studio: auth.name },
      'estudio-arquitectura',
      baseUrl
    );
    imageXml = `
    <image:image>
      <image:loc>${escapeXml(seoCover)}</image:loc>
      <image:title>${escapeXml(cleanText(auth.name))} - Estudio de Arquitectura en Ecuador | Arquitectura Ecuatoriana</image:title>
    </image:image>`;
  }
  urls.push(`  <url>
    <loc>${baseUrl}/estudios/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>`);
}

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent.trim() + '\n', 'utf8');
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  try {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent.trim() + '\n', 'utf8');
  } catch (e) {}
}
console.log(`Generated sitemap.xml with ${urls.length} URLs (including image metadata) successfully.`);
