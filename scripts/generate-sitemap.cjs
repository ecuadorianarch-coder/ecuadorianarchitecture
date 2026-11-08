const fs = require('fs');
const path = require('path');

const baseUrl = process.env.VITE_SITE_URL || 'https://ecuadorianarch.com';
const dataDir = path.join(__dirname, '..', 'src', 'data');
const publicDir = path.join(__dirname, '..', 'public');

const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf8')).filter(p => p.status === 'published' || !p.status);
const territorios = JSON.parse(fs.readFileSync(path.join(dataDir, 'territorios.json'), 'utf8')).filter(t => t.status === 'published' || !t.status);
const academia = JSON.parse(fs.readFileSync(path.join(dataDir, 'academia.json'), 'utf8')).filter(a => a.status === 'published' || !a.status);

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

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent.trim() + '\n', 'utf8');
console.log(`Generated public/sitemap.xml with ${urls.length} URLs (including image metadata) successfully.`);
