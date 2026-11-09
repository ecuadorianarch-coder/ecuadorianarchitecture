import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const dataDir = path.resolve(rootDir, 'src/data');

const SITE_URL = process.env.VITE_SITE_URL || 'https://ecuadorianarch.com';
const DEFAULT_TITLE = 'Arquitectura Ecuatoriana — Obras, Estudios y Crítica | Ecuadorian Architecture';
const DEFAULT_DESC = 'La plataforma de referencia de la arquitectura ecuatoriana: archivo documental, proyectos contemporáneos, estudios de arquitectura en Ecuador, investigación y crítica editorial.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

function cleanText(str) {
  if (!str) return '';
  return String(str).trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    const full = `${title} - ${studiosStr} | Arquitectura Ecuatoriana`;
    if (full.length <= 60) return full;
    const shorter = `${title} | Arquitectura Ecuatoriana`;
    if (shorter.length <= 60) return shorter;
    return `${title} - ${studiosStr} | EA`;
  }
  return `${title} | Arquitectura Ecuatoriana`;
}

function generateDescription(project) {
  const title = cleanText(project?.title);
  const studios = extractStudios(project);
  const studiosStr = studios.length > 0 ? studios.join(' + ') : 'estudios de arquitectura ecuatorianos';
  const location = cleanText(project?.location) || 'Ecuador';
  const year = cleanText(project?.year) || '2026';
  const category = cleanText(project?.category) || 'Arquitectura';
  const photographer = cleanText(project?.photographer || project?.datos?.fotografia) || 'Registro EA';
  const excerpt = cleanText(project?.excerpt || project?.resena || project?.subtitle);

  let crafted = `Arquitectura ecuatoriana: ${title ? title + ', ' : ''}${category.toLowerCase()} en ${location}, Ecuador por ${studiosStr}.`;
  if (excerpt) {
    const firstSentence = excerpt.split('.')[0].trim();
    if (firstSentence) {
      crafted += ` ${firstSentence}.`;
    }
  }
  crafted += ` Fotografía: ${photographer} (${year}). Archivo y crítica en Ecuadorian Architecture.`;
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
          {
            '@type': 'Question',
            name: `¿Por qué es representativo ${title} para la arquitectura ecuatoriana?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${title} ejemplifica las respuestas espaciales contemporáneas de la arquitectura ecuatoriana: diálogo con la topografía de ${locationStr}, pertinencia tectónica y experimentación formal registrada por Ecuadorian Architecture (${canonicalUrl}).`,
            },
          },
        ],
      },
    ],
  };
}

function renderSemanticProjectBody(project, section, slug, allProjects = []) {
  const title = escapeHtml(cleanText(project.title) || 'Proyecto Arquitectónico');
  const studios = extractStudios(project);
  const studiosStr = escapeHtml(studios.join(' + ') || 'Estudio de Arquitectura');
  const location = escapeHtml(cleanText(project.location) || 'Ecuador');
  const year = escapeHtml(cleanText(project.year) || '2026');
  const category = escapeHtml(cleanText(project.category) || 'Arquitectura');
  const excerpt = escapeHtml(cleanText(project.excerpt || project.resena || project.subtitle));
  const photographer = escapeHtml(cleanText(project.photographer || project?.datos?.fotografia) || 'Registro EA');
  const materials = escapeHtml(cleanText(project?.datos?.estructura || project?.datos?.materiales || project.materialidadPrincipal));
  const surface = escapeHtml(cleanText(project.superficie));

  // Extract text paragraphs from modules
  const paragraphs = [];
  if (Array.isArray(project.modules)) {
    for (const mod of project.modules) {
      if (mod.type === 'rich-text' && mod.content) {
        paragraphs.push(escapeHtml(cleanText(mod.content)));
      } else if (mod.type === 'section-heading' && mod.title) {
        paragraphs.push(`<strong>${escapeHtml(cleanText(mod.title))}</strong>`);
      }
    }
  }

  // Cross-linking to other projects in the catalog
  const otherProjects = (allProjects || [])
    .filter(p => (cleanText(p.slug) || cleanText(p.id)) !== slug)
    .slice(0, 4);

  return `
    <article class="ea-semantic-article max-w-4xl mx-auto px-4 sm:px-6 py-8 text-[#111111] bg-white font-sans" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <nav aria-label="Miga de pan" class="text-xs text-neutral-500 mb-6 font-mono">
        <a href="/" class="hover:underline text-neutral-600">Inicio</a> / 
        <a href="/${section}" class="hover:underline capitalize text-neutral-600">${section}</a> / 
        <span class="text-black font-semibold">${title}</span>
      </nav>

      <header class="mb-8 border-b border-neutral-200 pb-6">
        <p class="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
          ${category} • ${location}, Ecuador • ${year}
        </p>
        <h1 class="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black mb-3">
          ${title} — Arquitectura Ecuatoriana
        </h1>
        <p class="text-base text-neutral-700 font-medium">
          Diseño y autoría: <strong class="text-black">${studiosStr}</strong>
        </p>
      </header>

      ${excerpt ? `
      <section class="mb-8">
        <blockquote class="text-lg italic text-neutral-800 border-l-4 border-black pl-4 py-1.5 leading-relaxed bg-neutral-50">
          "${excerpt}"
        </blockquote>
      </section>
      ` : ''}

      <section class="mb-8 bg-neutral-50 p-4 sm:p-6 border border-neutral-200 rounded-sm">
        <h2 class="text-xs font-mono uppercase tracking-widest text-neutral-600 mb-4 border-b border-neutral-200 pb-2">
          Ficha Técnica de la Obra
        </h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt class="text-neutral-500 text-xs font-mono">Obra:</dt><dd class="font-semibold text-black">${title}</dd></div>
          <div><dt class="text-neutral-500 text-xs font-mono">Autores:</dt><dd class="font-semibold text-black">${studiosStr}</dd></div>
          <div><dt class="text-neutral-500 text-xs font-mono">Ubicación:</dt><dd class="font-semibold text-black">${location}, Ecuador</dd></div>
          <div><dt class="text-neutral-500 text-xs font-mono">Año:</dt><dd class="font-semibold text-black">${year}</dd></div>
          ${category ? `<div><dt class="text-neutral-500 text-xs font-mono">Tipología:</dt><dd class="font-semibold text-black">${category}</dd></div>` : ''}
          ${surface ? `<div><dt class="text-neutral-500 text-xs font-mono">Superficie:</dt><dd class="font-semibold text-black">${surface}</dd></div>` : ''}
          ${materials ? `<div><dt class="text-neutral-500 text-xs font-mono">Materialidad:</dt><dd class="font-semibold text-black">${materials}</dd></div>` : ''}
          ${photographer ? `<div><dt class="text-neutral-500 text-xs font-mono">Fotografía:</dt><dd class="font-semibold text-black">${photographer}</dd></div>` : ''}
        </dl>
      </section>

      <section class="prose max-w-none text-neutral-800 leading-relaxed mb-10 space-y-4">
        <h2 class="text-xl font-bold uppercase tracking-wide text-black pt-4 border-t border-neutral-200 mb-4">
          Memoria Descriptiva y Análisis Crítico
        </h2>
        ${paragraphs.length > 0 
          ? paragraphs.map(p => `<p class="leading-relaxed mb-4">${p}</p>`).join('\n')
          : `<p class="leading-relaxed">${excerpt || 'Expediente monográfico y registro arquitectónico contemporáneo en Ecuador.'}</p>`
        }
      </section>

      ${otherProjects.length > 0 ? `
      <aside class="mt-12 pt-8 border-t-2 border-neutral-200">
        <h3 class="text-sm font-mono uppercase tracking-widest text-neutral-600 mb-4 font-bold">
          Más Obras en el Archivo de Arquitectura Ecuatoriana
        </h3>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
          ${otherProjects.map(op => {
            const opSlug = cleanText(op.slug) || cleanText(op.id);
            const opTitle = escapeHtml(cleanText(op.title));
            const opStudios = escapeHtml(extractStudios(op).join(' + ') || cleanText(op.studio));
            const opLoc = escapeHtml(cleanText(op.location) || 'Ecuador');
            const opYear = escapeHtml(cleanText(op.year) || '2026');
            return `
            <li class="border border-neutral-200 p-4 rounded-sm hover:border-black transition-colors bg-neutral-50/50">
              <a href="/${section}/${opSlug}" class="block group text-black no-underline">
                <span class="block text-xs font-mono text-neutral-500 uppercase">${opLoc} • ${opYear}</span>
                <span class="block font-bold text-black uppercase group-hover:underline text-base mt-0.5">${opTitle}</span>
                <span class="block text-xs text-neutral-600 mt-1">${opStudios}</span>
              </a>
            </li>
            `;
          }).join('\n')}
        </ul>
      </aside>
      ` : ''}

      <footer class="mt-12 pt-6 border-t border-neutral-200 text-xs text-neutral-500 font-mono flex flex-wrap justify-between gap-4">
        <span>Ecuadorian Architecture — Archivo Documental y Crítica de Arquitectura en Ecuador</span>
        <a href="/" class="hover:underline text-black font-semibold">← Volver a la portada principal</a>
      </footer>
    </article>
  `;
}

function renderSemanticCategoryBody(sectionPage, items = []) {
  const pageTitle = escapeHtml(sectionPage.title.split('—')[0].trim());
  const pageDesc = escapeHtml(sectionPage.desc);

  return `
    <main class="ea-semantic-category max-w-5xl mx-auto px-4 sm:px-6 py-10 text-[#111111] bg-white font-sans" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <nav aria-label="Miga de pan" class="text-xs text-neutral-500 mb-6 font-mono">
        <a href="/" class="hover:underline text-neutral-600">Inicio</a> / 
        <span class="text-black font-semibold capitalize">${escapeHtml(sectionPage.path)}</span>
      </nav>

      <header class="mb-10 border-b border-neutral-200 pb-6">
        <h1 class="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black mb-3">
          ${pageTitle}
        </h1>
        <p class="text-base text-neutral-700 leading-relaxed max-w-3xl">
          ${pageDesc}
        </p>
      </header>

      <section class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        ${(items || []).map(item => {
          const slug = cleanText(item.slug) || cleanText(item.id);
          const title = escapeHtml(cleanText(item.title));
          const studios = escapeHtml(extractStudios(item).join(' + ') || cleanText(item.studio) || 'Autores');
          const loc = escapeHtml(cleanText(item.location) || 'Ecuador');
          const year = escapeHtml(cleanText(item.year) || '2026');
          const exc = escapeHtml(cleanText(item.excerpt || item.subtitle || ''));
          return `
          <article class="border border-neutral-200 p-5 rounded-sm hover:border-black transition-colors bg-neutral-50/50">
            <span class="text-xs font-mono uppercase text-neutral-500 block mb-1">
              ${loc} — ${year}
            </span>
            <h2 class="text-xl font-bold uppercase text-black mb-1">
              <a href="/${sectionPage.path}/${slug}" class="hover:underline text-black no-underline">${title}</a>
            </h2>
            <p class="text-xs font-medium text-neutral-700 uppercase mb-3">
              ${studios}
            </p>
            ${exc ? `<p class="text-sm text-neutral-600 leading-relaxed mb-4">${exc}</p>` : ''}
            <a href="/${sectionPage.path}/${slug}" class="text-xs font-mono uppercase tracking-widest text-black underline underline-offset-4 font-semibold">
              Ver expediente completo →
            </a>
          </article>
          `;
        }).join('\n')}
      </section>

      <footer class="pt-6 border-t border-neutral-200 text-xs text-neutral-500 font-mono flex justify-between">
        <span>Ecuadorian Architecture</span>
        <a href="/" class="hover:underline text-black font-semibold">← Volver al inicio</a>
      </footer>
    </main>
  `;
}

function renderSemanticHomeBody(allProjects = []) {
  return `
    <main class="ea-semantic-home max-w-5xl mx-auto px-4 sm:px-6 py-10 text-[#111111] bg-white font-sans" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <header class="mb-10 text-center sm:text-left border-b border-neutral-200 pb-8">
        <p class="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2 font-semibold">
          Archivo Monográfico • Crítica Especializada • Pensamiento Espacial
        </p>
        <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black mb-4">
          Arquitectura Ecuatoriana
        </h1>
        <p class="text-base sm:text-lg text-neutral-700 max-w-3xl leading-relaxed">
          Plataforma de referencia para el registro, la crítica editorial y la documentación rigurosa de las obras, estudios de arquitectura y dinámicas territoriales contemporáneas en el Ecuador.
        </p>
      </header>

      <section class="mb-12">
        <div class="flex items-center justify-between border-b border-neutral-300 pb-2 mb-6">
          <h2 class="text-sm font-mono uppercase tracking-widest text-black font-bold">
            01. Obras y Proyectos Recientes en Ecuador
          </h2>
          <a href="/proyectos" class="text-xs font-mono uppercase text-neutral-600 hover:text-black hover:underline font-semibold">
            Ver catálogo completo →
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          ${allProjects.map(p => {
            const slug = cleanText(p.slug) || cleanText(p.id);
            const title = escapeHtml(cleanText(p.title));
            const studios = escapeHtml(extractStudios(p).join(' + ') || cleanText(p.studio) || 'Arquitectos ecuatorianos');
            const loc = escapeHtml(cleanText(p.location) || 'Ecuador');
            const year = escapeHtml(cleanText(p.year) || '2026');
            const exc = escapeHtml(cleanText(p.excerpt || p.subtitle || ''));
            return `
            <article class="border border-neutral-200 p-5 rounded-sm hover:border-black transition-all bg-neutral-50/50">
              <span class="text-xs font-mono uppercase tracking-wider text-neutral-500 block mb-1">
                ${loc} — ${year}
              </span>
              <h3 class="text-xl font-bold uppercase tracking-tight text-black mb-1">
                <a href="/proyectos/${slug}" class="hover:underline text-black no-underline">${title}</a>
              </h3>
              <p class="text-xs font-medium text-neutral-700 uppercase mb-3">
                ${studios}
              </p>
              ${exc ? `<p class="text-sm text-neutral-600 leading-relaxed mb-4">${exc}</p>` : ''}
              <a href="/proyectos/${slug}" class="inline-block text-xs font-mono uppercase tracking-widest text-black underline underline-offset-4 font-semibold">
                Explorar obra completa →
              </a>
            </article>
            `;
          }).join('\n')}
        </div>
      </section>

      <section class="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-200">
        <div class="border border-neutral-200 p-5 rounded-sm">
          <h3 class="font-bold uppercase text-sm mb-2"><a href="/proyectos" class="hover:underline text-black no-underline">Proyectos</a></h3>
          <p class="text-xs text-neutral-600 leading-relaxed">Expedientes monográficos de arquitectura residencial, equipamiento, pabellones efímeros y regeneración urbana en Ecuador.</p>
        </div>
        <div class="border border-neutral-200 p-5 rounded-sm">
          <h3 class="font-bold uppercase text-sm mb-2"><a href="/academia" class="hover:underline text-black no-underline">Academia</a></h3>
          <p class="text-xs text-neutral-600 leading-relaxed">Investigaciones proyectuales, tesis de grado y pedagogía arquitectónica de las facultades de Ecuador.</p>
        </div>
        <div class="border border-neutral-200 p-5 rounded-sm">
          <h3 class="font-bold uppercase text-sm mb-2"><a href="/territorios" class="hover:underline text-black no-underline">Territorios</a></h3>
          <p class="text-xs text-neutral-600 leading-relaxed">Cartografías críticas, lecturas del paisaje andino, litoral y amazónico en relación a la ciudad.</p>
        </div>
      </section>

      <footer class="pt-8 border-t border-neutral-300 text-xs text-neutral-500 font-mono flex flex-wrap justify-between items-center gap-4">
        <span>© Ecuadorian Architecture — Registro y Crítica de Arquitectura en el Ecuador</span>
        <nav class="flex gap-4">
          <a href="/proyectos" class="hover:underline text-neutral-600">Proyectos</a>
          <a href="/academia" class="hover:underline text-neutral-600">Academia</a>
          <a href="/territorios" class="hover:underline text-neutral-600">Territorios</a>
          <a href="/acerca-de-ea" class="hover:underline text-neutral-600">Acerca de EA</a>
        </nav>
      </footer>
    </main>
  `;
}

function injectMeta(html, { title, description, canonicalUrl, ogImage, schemaJsonLd, bodyHtml }) {
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

  // Inject semantic HTML inside <div id="root"></div> for Googlebot & SEO Crawlers
  if (bodyHtml) {
    updated = updated.replace(
      /<div id="root"><\/div>/i,
      `<div id="root">\n${bodyHtml}\n    </div>`
    );
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

  // Load collections (Strictly filter for published items)
  const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf-8') || '[]').filter(p => p.status === 'published' || !p.status);
  const academia = JSON.parse(fs.readFileSync(path.join(dataDir, 'academia.json'), 'utf-8') || '[]').filter(a => a.status === 'published' || !a.status);
  const territorios = JSON.parse(fs.readFileSync(path.join(dataDir, 'territorios.json'), 'utf-8') || '[]').filter(t => t.status === 'published' || !t.status);

  const sitemapUrls = [
    { loc: SITE_URL, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/proyectos`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_URL}/academia`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_URL}/territorios`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_URL}/acerca-de-ea`, changefreq: 'monthly', priority: '0.7' },
  ];

  // 1. Generate Root Homepage Semantic HTML
  const homeHtml = injectMeta(baseHtml, {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    canonicalUrl: SITE_URL,
    ogImage: `${SITE_URL}/og-image.jpg`,
    bodyHtml: renderSemanticHomeBody(projects),
  });
  fs.writeFileSync(indexPath, homeHtml, 'utf-8');
  console.log('[EA SEO Prerender] Generated semantic HTML for root index.html');

  // 2. Generate Category Landing Pages with Semantic Content
  const sectionPages = [
    {
      path: 'proyectos',
      title: 'Proyectos de Arquitectura Ecuatoriana — Obras y Archivo | Ecuadorian Architecture',
      desc: 'Archivo contemporáneo de arquitectura ecuatoriana: residencias, equipamientos, intervenciones patrimoniales y diseño espacial en Quito, Guayaquil, Cuenca y todo el Ecuador.',
    },
    {
      path: 'academia',
      title: 'Investigación en Arquitectura Ecuatoriana y Tesis | Ecuadorian Architecture',
      desc: 'Tesis de grado, investigaciones proyectuales y ensayos críticos de las principales facultades de arquitectura del Ecuador.',
    },
    {
      path: 'territorios',
      title: 'Territorio y Ciudad en Ecuador — Expedientes Críticos | Ecuadorian Architecture',
      desc: 'Cartografías críticas, análisis urbano, paisaje y dinámicas territoriales en los Andes, la Costa y la Amazonía ecuatoriana.',
    },
    {
      path: 'acerca-de-ea',
      title: 'Acerca de Ecuadorian Architecture — Manifiesto y Crítica Nacional',
      desc: 'Plataforma independiente dedicada a la crítica, archivo y difusión del pensamiento espacial y constructivo ecuatoriano.',
    },
  ];

  for (const page of sectionPages) {
    const categoryItems = page.path === 'proyectos' ? projects : page.path === 'academia' ? academia : page.path === 'territorios' ? territorios : projects;
    const pageHtml = injectMeta(baseHtml, {
      title: page.title,
      description: page.desc,
      canonicalUrl: `${SITE_URL}/${page.path}`,
      ogImage: `${SITE_URL}/logo.svg`,
      bodyHtml: renderSemanticCategoryBody(page, categoryItems),
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

  // 3. Generate Individual Projects & Works with Semantic Content
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
      const bodyHtml = renderSemanticProjectBody(item, section, slug, items);

      const html = injectMeta(baseHtml, {
        title,
        description,
        canonicalUrl,
        ogImage: heroImage,
        schemaJsonLd,
        bodyHtml,
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
        image: heroImage ? {
          loc: heroImage,
          title: `${cleanText(item.title)} - Arquitectura Ecuatoriana (${cleanText(item.location) || 'Ecuador'})`,
          caption: description,
        } : null
      });

      projectCount++;
    }
  }

  console.log(`[EA SEO Prerender] Generated ${projectCount} architectural project detail pages.`);

  // 3. Generate XML Sitemap with Image Extension
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.image ? `
    <image:image>
      <image:loc>${u.image.loc}</image:loc>
      <image:title>${u.image.title.replace(/&/g, '&amp;')}</image:title>
      <image:caption>${u.image.caption.replace(/&/g, '&amp;')}</image:caption>
    </image:image>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log('[EA SEO Prerender] Generated dist/sitemap.xml with image extensions');

  // 4. Generate Robots.txt (Universal Crawlers + Full AI/LLM Access)
  const robotsTxt = `# robots.txt for Ecuadorian Architecture (https://ecuadorianarch.com)
User-agent: *
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /api/catalog.json
Disallow: /admin
Disallow: /admin.html
Disallow: /api/
Disallow: /*?portal=*
Disallow: /*?token=*
Disallow: /*?ad-report=*
Disallow: /*?ad-advertiser=*

# Explicit Permissions for AI Agents & Search Crawlers (AEO / GEO)
User-agent: GPTBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /api/catalog.json

User-agent: OAI-SearchBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /api/catalog.json

User-agent: ChatGPT-User
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /api/catalog.json

User-agent: ClaudeBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: PerplexityBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  console.log('[EA SEO Prerender] Generated dist/robots.txt with AI permissions');

  // 5. Generate _redirects for Netlify / Cloudflare Pages / Static hosts
  const redirects = `/admin    /admin.html   200\n/*        /index.html   200\n`;
  fs.writeFileSync(path.join(distDir, '_redirects'), redirects, 'utf-8');

  console.log('[EA SEO Prerender] Static architectural SEO generated successfully! 🎉');
}

run().catch((err) => {
  console.error('[EA SEO Prerender] Error generating static SEO:', err);
  process.exit(1);
});
