const fs = require('fs');
const path = require('path');

const baseUrl = 'https://ecuadorianarchitecture.com';
const dataDir = path.join(__dirname, '..', 'src', 'data');
const publicDir = path.join(__dirname, '..', 'public');

const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf8'));
const territorios = JSON.parse(fs.readFileSync(path.join(dataDir, 'territorios.json'), 'utf8'));
const academia = JSON.parse(fs.readFileSync(path.join(dataDir, 'academia.json'), 'utf8'));

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

for (const p of projects) {
  const slug = p.slug || p.id;
  urls.push(`  <url>
    <loc>${baseUrl}/proyectos/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
}

for (const t of territorios) {
  const slug = t.slug || t.id;
  urls.push(`  <url>
    <loc>${baseUrl}/territorios/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent.trim() + '\n', 'utf8');
console.log(`Generated public/sitemap.xml with ${urls.length} URLs successfully.`);
