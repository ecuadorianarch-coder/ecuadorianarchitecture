const fs = require('fs');
const path = require('path');

const baseUrl = process.env.VITE_SITE_URL || 'https://ecuadorianarch.com';
const dataDir = path.join(__dirname, '..', 'src', 'data');
const publicDir = path.join(__dirname, '..', 'public');

const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf8')).filter(p => p.status === 'published' || !p.status);
const territorios = JSON.parse(fs.readFileSync(path.join(dataDir, 'territorios.json'), 'utf8')).filter(t => t.status === 'published' || !t.status);
const academia = JSON.parse(fs.readFileSync(path.join(dataDir, 'academia.json'), 'utf8')).filter(a => a.status === 'published' || !a.status);
const authorsPath = path.join(dataDir, 'authors.json');
const authors = fs.existsSync(authorsPath) ? JSON.parse(fs.readFileSync(authorsPath, 'utf8') || '[]') : [];

const today = new Date().toISOString().split('T')[0];

function clean(str) {
  if (!str) return '';
  return String(str).trim();
}

function getStudios(p) {
  if (Array.isArray(p.studios) && p.studios.length > 0) return p.studios;
  if (p.studio) return [p.studio];
  return ['Estudios Ecuatorianos'];
}

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

for (const p of projects) {
  const slug = p.slug || p.id;
  const title = clean(p.title) || 'Proyecto Arquitectónico';
  const studios = getStudios(p).join(' + ');
  const loc = clean(p.location) || 'Ecuador';
  const heroImage = p.heroImage ? (p.heroImage.startsWith('http') ? p.heroImage : `${baseUrl}${p.heroImage}`) : null;

  let imageXml = '';
  if (heroImage) {
    const imgTitle = `${title} - ${studios} - Arquitectura Ecuatoriana (${loc})`.replace(/&/g, '&amp;');
    const imgCaption = clean(p.excerpt || p.resena || p.subtitle || '').replace(/&/g, '&amp;');
    imageXml = `
    <image:image>
      <image:loc>${heroImage}</image:loc>
      <image:title>${imgTitle}</image:title>
      ${imgCaption ? `<image:caption>${imgCaption}</image:caption>` : ''}
    </image:image>`;
  }

  urls.push(`  <url>
    <loc>${baseUrl}/proyectos/${slug}</loc>
    <lastmod>${p.updatedAt ? p.updatedAt.split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>`);
}

for (const t of territorios) {
  const slug = t.slug || t.id;
  const heroImage = t.heroImage ? (t.heroImage.startsWith('http') ? t.heroImage : `${baseUrl}${t.heroImage}`) : null;
  let imageXml = '';
  if (heroImage) {
    imageXml = `
    <image:image>
      <image:loc>${heroImage}</image:loc>
      <image:title>${clean(t.title).replace(/&/g, '&amp;')} - Territorio y Ciudad en Ecuador</image:title>
    </image:image>`;
  }

  urls.push(`  <url>
    <loc>${baseUrl}/territorios/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>`);
}

for (const a of academia) {
  const slug = a.slug || a.id;
  urls.push(`  <url>
    <loc>${baseUrl}/academia/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
}

for (const auth of authors) {
  const slug = auth.slug || clean(auth.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) continue;
  const coverImage = auth.coverImage ? (auth.coverImage.startsWith('http') ? auth.coverImage : `${baseUrl}${auth.coverImage}`) : null;
  let imageXml = '';
  if (coverImage) {
    imageXml = `
    <image:image>
      <image:loc>${coverImage}</image:loc>
      <image:title>${clean(auth.name).replace(/&/g, '&amp;')} - Arquitectos en Ecuador</image:title>
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
