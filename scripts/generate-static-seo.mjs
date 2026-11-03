import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const dataDir = path.resolve(rootDir, 'src/data');

const SITE_URL = 'https://ecuadorianarchitecture.com';
const DEFAULT_TITLE = 'Ecuadorian Architecture — Crítica + Difusión + Conversación';
const DEFAULT_DESC = 'Una plataforma para descubrir, contextualizar y cuestionar arquitectura ecuatoriana mediante experiencias narrativas interactivas.';
const DEFAULT_IMAGE = `${SITE_URL}/logo.svg`;

function cleanText(str) {
  if (!str) return '';
  return String(str).trim();
}

function truncateAtWord(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const sub = text.substring(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.75) {
    return sub.substring(0, lastSpace) + '.';
  }
  return sub + '.';
}

function extractStudios(project) {
  if (Array.isArray(project?.studios) && project.studios.length > 0) {
    return project.studios.map(cleanText).filter(Boolean);
  }
  const raw = project?.studio || '';
  if (!raw) return [];
  if (/[+&/]/.test(raw) || (raw.includes(',') && !raw.includes('S.A.') && !raw.includes('CIA.'))) {
    const list = raw
      .split(/\s*(?:\+|\/|\&|,)\s*/)
      .map(cleanText)
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return [cleanText(raw)];
}

function generateTitle(project) {
  const title = cleanText(project?.title) || 'Proyecto Arquitectónico';
  const studios = extractStudios(project);
  const studiosStr = studios.length > 0 ? studios.join(' + ') : '';

  if (studiosStr) {
    const full = `${title} - ${studiosStr} | Ecuadorian Architecture`;
    if (full.length <= 60) return full;
    const shorter = `${title} - ${studiosStr}`;
    if (shorter.length <= 60) return shorter;
    return `${title} | Ecuadorian Architecture`;
  }
  return `${title} | Ecuadorian Architecture`;
}

function generateDescription(project) {
  const studios = extractStudios(project);
  const studiosStr = studios.length > 0 ? studios.join(' + ') : 'arquitectos ecuatorianos';
  const location = cleanText(project?.location) || 'Ecuador';
  const year = cleanText(project?.year) || '2026';
  const category = cleanText(project?.category) || 'Proyecto arquitectónico';
  const photographer = cleanText(project?.photographer || project?.datos?.fotografia) || 'Registro EA';
  const excerpt = cleanText(project?.excerpt || project?.resena || project?.subtitle);

  let crafted = `${category} en ${location}, Ecuador, obra de ${studiosStr}.`;
  if (excerpt) {
    const firstSentence = excerpt.split('.')[0].trim();
    if (firstSentence) {
      crafted += ` ${firstSentence}.`;
    }
  }
  crafted += ` Fotografías por ${photographer}, ${year}.`;
  return truncateAtWord(crafted, 158);
}

function getWikidataPlaceUri(location) {
  const loc = (location || '').toLowerCase();
  if (loc.includes('quito')) return 'https://www.wikidata.org/wiki/Q2900';
  if (loc.includes('guayaquil')) return 'https://www.wikidata.org/wiki/Q47698';
  if (loc.includes('cuenca')) return 'https://www.wikidata.org/wiki/Q192267';
  if (loc.includes('manabí') || loc.includes('manabi')) return 'https://www.wikidata.org/wiki/Q271866';
  if (loc.includes('chimborazo')) return 'https://www.wikidata.org/wiki/Q389274';
  if (loc.includes('cotopaxi')) return 'https://www.wikidata.org/wiki/Q499158';
  if (loc.includes('esmeraldas')) return 'https://www.wikidata.org/wiki/Q382346';
  return 'https://www.wikidata.org/wiki/Q736'; // Ecuador default
}

function generateSchemaJsonLd(project, section, slug) {
  const title = cleanText(project?.title) || 'Proyecto Arquitectónico';
  const canonicalUrl = `${SITE_URL}/${section}/${slug}`;
  const studios = extractStudios(project);
  const heroImage = project?.heroImage
    ? (project.heroImage.startsWith('http') ? project.heroImage : `${SITE_URL}${project.heroImage}`)
    : DEFAULT_IMAGE;
  const desc = generateDescription(project);
  const datePublished = project?.createdAt || '2026-01-01T00:00:00Z';
  const dateModified = project?.updatedAt || new Date().toISOString();
  const studiosStr = studios.length > 0 ? studios.join(' + ') : 'Arquitectos ecuatorianos';
  const locationStr = cleanText(project?.location) || 'Ecuador';
  const yearStr = cleanText(project?.year) || '2026';
  const categoryStr = cleanText(project?.category) || 'Arquitectura';
  const materialsStr = project?.datos?.estructura || project?.datos?.materiales || 'Hormigón, madera y técnicas locales';
  const photographerStr = cleanText(project?.photographer || project?.datos?.fotografia) || 'Registro EA';

  const authors = studios.map((studioName) => ({
    '@type': 'Organization',
    name: studioName,
    url: `${SITE_URL}/estudios/${encodeURIComponent(studioName.toLowerCase().replace(/\s+/g, '-'))}`,
  }));

  const sectionName = section === 'territorios' ? 'Territorios' : section === 'academia' ? 'Academia' : 'Proyectos';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Article', 'VisualArtwork'],
        '@id': `${canonicalUrl}#article`,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          name: 'Ecuadorian Architecture',
          url: SITE_URL,
        },
        mainEntityOfPage: canonicalUrl,
        headline: generateTitle(project),
        name: title,
        description: desc,
        image: {
          '@type': 'ImageObject',
          url: heroImage,
          caption: `${title} - Fotografía arquitectónica por ${photographerStr}`,
          width: 1600,
          height: 1060,
        },
        author: authors.length > 0 ? authors : [{ '@type': 'Organization', name: 'Redacción Ecuadorian Architecture' }],
        publisher: {
          '@type': 'Organization',
          name: 'Ecuadorian Architecture',
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.svg`,
            width: 512,
            height: 512,
          },
        },
        datePublished,
        dateModified,
        inLanguage: 'es-EC',
        artform: 'Architecture',
        artMedium: materialsStr,
        genre: 'Arquitectura contemporánea ecuatoriana',
        isAccessibleForFree: true,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.editorial-lead', '.project-concept'],
        },
        about: [
          {
            '@type': 'Thing',
            name: 'Arquitectura de Ecuador',
            sameAs: 'https://es.wikipedia.org/wiki/Arquitectura_de_Ecuador',
          },
          {
            '@type': 'Place',
            name: locationStr,
            sameAs: getWikidataPlaceUri(locationStr),
          },
        ],
        contentLocation: {
          '@type': 'Place',
          name: `${locationStr}, Ecuador`,
          sameAs: getWikidataPlaceUri(locationStr),
          address: {
            '@type': 'PostalAddress',
            addressLocality: locationStr,
            addressCountry: 'EC',
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: sectionName,
            item: `${SITE_URL}/${section}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: canonicalUrl,
          },
        ],
      },
      // AEO / GEO FAQPage Schema
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: `¿Quién diseñó el proyecto ${title}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${title} es una obra de ${categoryStr.toLowerCase()} diseñada por ${studiosStr} en ${locationStr}, Ecuador (${yearStr}). Archivo documental y crítica oficial en Ecuadorian Architecture.`,
            },
          },
          {
            '@type': 'Question',
            name: `¿Cuáles son los materiales y características constructivas de ${title}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `En ${title}, la propuesta espacial y tectónica se basa en ${materialsStr}. Registro fotográfico a cargo de ${photographerStr}.`,
            },
          },
          {
            '@type': 'Question',
            name: `¿Dónde consultar el expediente crítico y planos de ${title}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `El análisis crítico completo, fotografías en alta resolución y ficha técnica están disponibles en Ecuadorian Architecture en ${canonicalUrl}`,
            },
          },
        ],
      },
    ],
  };
}

function injectMeta(html, { title, description, canonicalUrl, ogImage, schemaJsonLd }) {
  let updated = html;

  // Title
  updated = updated.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Meta description
  if (updated.includes('<meta name="description"')) {
    updated = updated.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${description}" />`);
  } else {
    updated = updated.replace('</head>', `  <meta name="description" content="${description}" />\n  </head>`);
  }

  // Canonical
  const canonicalTag = `  <link rel="canonical" href="${canonicalUrl}" />`;
  if (updated.includes('<link rel="canonical"')) {
    updated = updated.replace(/<link rel="canonical" href=".*?" \/>/i, canonicalTag);
  } else {
    updated = updated.replace('</head>', `${canonicalTag}\n  </head>`);
  }

  // Strip existing fallback Open Graph & Twitter Cards to prevent duplication
  updated = updated.replace(/<!-- Open Graph[\s\S]*?<!-- Twitter Cards[\s\S]*?(?=<link|<script|<\/head)/i, '');
  updated = updated.replace(/<meta property="og:[^>]*>/gi, '');
  updated = updated.replace(/<meta name="twitter:[^>]*>/gi, '');

  // Injected Open Graph & Twitter Tags
  const socialTags = `
    <!-- Open Graph / WhatsApp / Facebook / LinkedIn -->
    <meta property="og:site_name" content="Ecuadorian Architecture" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:secure_url" content="${ogImage}" />
    <meta property="og:image:width" content="1600" />
    <meta property="og:image:height" content="1060" />
    <meta property="og:locale" content="es_EC" />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@ecuadorianarch" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
  `;
  updated = updated.replace('</head>', `${socialTags}\n  </head>`);

  // Schema.org JSON-LD (strip existing if any, then insert)
  updated = updated.replace(/<script type="application\/ld\+json" id="ea-schema-jsonld">[\s\S]*?<\/script>/gi, '');
  if (schemaJsonLd) {
    const jsonLdTag = `\n  <script type="application/ld+json" id="ea-schema-jsonld">\n${JSON.stringify(schemaJsonLd, null, 2)}\n  </script>\n  `;
    updated = updated.replace('</head>', `${jsonLdTag}</head>`);
  }

  return updated;
}

function writeStaticHtml(targetDir, htmlContent) {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), htmlContent, 'utf-8');
}

async function run() {
  console.log('[EA SEO Prerender] Starting static architectural SEO generator...');

  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('[EA SEO Prerender] dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }
  const baseHtml = fs.readFileSync(indexPath, 'utf-8');

  // Load collections
  const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf-8') || '[]');
  const academia = JSON.parse(fs.readFileSync(path.join(dataDir, 'academia.json'), 'utf-8') || '[]');
  const territorios = JSON.parse(fs.readFileSync(path.join(dataDir, 'territorios.json'), 'utf-8') || '[]');

  const sitemapUrls = [
    { loc: SITE_URL, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/proyectos`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_URL}/academia`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_URL}/territorios`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_URL}/acerca-de-ea`, changefreq: 'monthly', priority: '0.7' },
  ];

  // 1. Generate Category Landing Pages
  const sectionPages = [
    {
      path: 'proyectos',
      title: 'Proyectos y Obras — Ecuadorian Architecture',
      desc: 'Archivo contemporáneo de arquitectura ecuatoriana: residencias, equipamientos, intervenciones patrimoniales y diseño espacial.',
    },
    {
      path: 'academia',
      title: 'Investigación Académica y Tesis — Ecuadorian Architecture',
      desc: 'Tesis de grado, investigaciones proyectuales y ensayos críticos de las principales facultades de arquitectura del Ecuador.',
    },
    {
      path: 'territorios',
      title: 'Expedientes Territoriales y Ciudad — Ecuadorian Architecture',
      desc: 'Cartografías críticas, análisis urbano, paisaje y dinámicas territoriales en los Andes, la Costa y la Amazonía ecuatoriana.',
    },
    {
      path: 'acerca-de-ea',
      title: 'Acerca de Ecuadorian Architecture — Manifiesto y Consejo Editorial',
      desc: 'Plataforma independiente dedicada a la crítica, archivo y difusión del pensamiento espacial y constructivo ecuatoriano.',
    },
  ];

  for (const page of sectionPages) {
    const pageHtml = injectMeta(baseHtml, {
      title: page.title,
      description: page.desc,
      canonicalUrl: `${SITE_URL}/${page.path}`,
      ogImage: `${SITE_URL}/logo.svg`,
      schemaJsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: page.title,
        description: page.desc,
        url: `${SITE_URL}/${page.path}`,
      },
    });
    writeStaticHtml(path.join(distDir, page.path), pageHtml);
    console.log(`[EA SEO Prerender] Generated static landing: /${page.path}`);
  }

  // 2. Generate Individual Projects & Works
  const collections = [
    { items: projects, section: 'proyectos' },
    { items: academia, section: 'academia' },
    { items: territorios, section: 'territorios' },
  ];

  let projectCount = 0;

  for (const { items, section } of collections) {
    for (const item of items) {
      const slug = cleanText(item.slug) || cleanText(item.id);
      const id = cleanText(item.id);
      const title = generateTitle(item);
      const description = generateDescription(item);
      const canonicalUrl = `${SITE_URL}/${section}/${slug}`;
      const heroImage = item.heroImage
        ? (item.heroImage.startsWith('http') ? item.heroImage : `${SITE_URL}${item.heroImage}`)
        : DEFAULT_IMAGE;
      const schemaJsonLd = generateSchemaJsonLd(item, section, slug);

      const html = injectMeta(baseHtml, {
        title,
        description,
        canonicalUrl,
        ogImage: heroImage,
        schemaJsonLd,
      });

      // Write by slug
      writeStaticHtml(path.join(distDir, section, slug), html);

      // If id differs from slug, also generate for id to prevent 404
      if (id && id !== slug) {
        writeStaticHtml(path.join(distDir, section, id), html);
      }

      sitemapUrls.push({
        loc: canonicalUrl,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: item.updatedAt ? item.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      });

      projectCount++;
    }
  }

  console.log(`[EA SEO Prerender] Generated ${projectCount} architectural project detail pages.`);

  // 3. Generate XML Sitemap
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log('[EA SEO Prerender] Generated dist/sitemap.xml');

  // 4. Generate Robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin.html
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  console.log('[EA SEO Prerender] Generated dist/robots.txt');

  // 5. Generate _redirects for Netlify / Cloudflare Pages / Static hosts
  const redirects = `/*    /index.html   200\n`;
  fs.writeFileSync(path.join(distDir, '_redirects'), redirects, 'utf-8');

  console.log('[EA SEO Prerender] Static architectural SEO generated successfully! 🎉');
}

run().catch((err) => {
  console.error('[EA SEO Prerender] Error generating static SEO:', err);
  process.exit(1);
});
