/**
 * Architecture SEO Service for Ecuadorian Architecture
 * 
 * Implements the indexing and rich snippet standards used by the world's leading
 * architecture publications (ArchDaily, Arquitectura Viva, Divisare, Domus, Dezeen)
 * to achieve #1 rankings and rich image preview snippets in Google Search results.
 */

export interface ArchitectureSeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  schemaJsonLd: Record<string, any>;
  score: {
    titleLength: number;
    titleStatus: 'optimal' | 'warning' | 'short';
    descLength: number;
    descStatus: 'optimal' | 'warning' | 'short';
    hasImage: boolean;
    hasAuthor: boolean;
    hasLocation: boolean;
  };
}

export const CANONICAL_SITE_URL = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost'))
  ? window.location.origin
  : ((import.meta as any).env?.VITE_SITE_URL || 'https://ecuadorianarch.com');

/**
 * Normalizes text to capital case / clean punctuation
 */
function cleanText(str?: string): string {
  if (!str) return '';
  return str.trim();
}

/**
 * Truncates text cleanly at word boundary with max length
 */
function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const sub = text.substring(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.75) {
    return sub.substring(0, lastSpace) + '.';
  }
  return sub + '.';
}

/**
 * Extracts list of studios with equal weight
 */
export function extractSeoStudios(project: any): string[] {
  if (Array.isArray(project?.studios) && project.studios.length > 0) {
    return project.studios.map((s: string) => cleanText(s)).filter(Boolean);
  }
  const raw = project?.studio || '';
  if (!raw) return [];
  if (/[+&/]/.test(raw) || (raw.includes(',') && !raw.includes('S.A.') && !raw.includes('CIA.'))) {
    const list = raw
      .split(/\s*(?:\+|\/|\&|,)\s*/)
      .map((s: string) => cleanText(s))
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return [cleanText(raw)];
}

/**
 * Generates the canonical Google search title following ArchDaily and Arquitectura Viva standards:
 * Formula: "[Nombre del Proyecto] - [Estudio Principal] | Ecuadorian Architecture"
 * Target: 50-60 characters (never truncated on Google Desktop or Mobile SERP).
 */
export function generateArchitectureTitle(project: any): string {
  const title = cleanText(project?.title) || 'Proyecto Arquitectónico';
  const studios = extractSeoStudios(project);
  const studiosStr = studios.length > 0 ? studios.join(' + ') : '';

  if (studiosStr) {
    const full = `${title} - ${studiosStr} | Ecuadorian Architecture`;
    if (full.length <= 65) return full;

    const eaShort = `${title} - ${studiosStr} | EA`;
    if (eaShort.length <= 65) return eaShort;

    const shorter = `${title} - ${studiosStr}`;
    if (shorter.length <= 65) return shorter;

    return `${title} | Ecuadorian Architecture`;
  }

  return `${title} | Ecuadorian Architecture`;
}

/**
 * Generates the canonical Google search snippet description following Arquitectura Viva standards:
 * Formula: "[Tipología] en [Ubicación, Ecuador] diseñada por [Estudios]. [Concepto y materialidad]. Fotografías por [Fotógrafo], año [Año]."
 * Target: 145-160 characters (optimal snippet length with zero truncation ellipsis).
 */
export function generateArchitectureDescription(project: any): string {
  const title = cleanText(project?.title) || 'Obra';
  const studios = extractSeoStudios(project);
  const studiosStr = studios.length > 0 ? studios.join(' + ') : 'arquitectos ecuatorianos';
  const location = cleanText(project?.location) || 'Ecuador';
  const year = cleanText(project?.year) || '2026';
  const category = cleanText(project?.category) || 'Proyecto arquitectónico';
  const photographer = cleanText(project?.photographer || project?.datos?.fotografia) || 'Registro EA';
  const excerpt = cleanText(project?.excerpt || project?.resena || project?.subtitle);

  // 1. If excerpt already provided and nicely sized:
  if (excerpt && excerpt.length >= 100 && excerpt.length <= 160) {
    return excerpt;
  }

  // 2. High-impact architectural formula (Arquitectura Viva style):
  let crafted = `${title}: ${category} en ${location}, Ecuador, obra de ${studiosStr}.`;
  
  if (excerpt) {
    // Add first sentence of excerpt
    const firstSentence = excerpt.split('.')[0].trim();
    if (firstSentence) {
      crafted += ` ${firstSentence}.`;
    }
  }

  crafted += ` Fotografías por ${photographer}, ${year}.`;

  // Clamp strictly to 158 characters for perfect Google snippet appearance
  return truncateAtWord(crafted, 158);
}

/**
 * Generates high-relevance search keywords
 */
export function generateArchitectureKeywords(project: any): string[] {
  const keywords = new Set<string>();
  keywords.add('arquitectura ecuatoriana');
  keywords.add('ecuadorian architecture');

  if (project?.title) keywords.add(project.title.toLowerCase());
  
  const studios = extractSeoStudios(project);
  studios.forEach((s) => {
    keywords.add(s.toLowerCase());
    keywords.add(`${s.toLowerCase()} arquitectura`);
  });

  if (project?.location) {
    keywords.add(`arquitectura en ${project.location.toLowerCase()}`);
    keywords.add(`${project.location.toLowerCase()} ecuador`);
  }

  if (project?.category) keywords.add(project.category.toLowerCase());
  keywords.add('arquitectura andina');
  keywords.add('fotografia de arquitectura');
  keywords.add('diseño arquitectonico contemporaneo');

  return Array.from(keywords);
}

/**
 * Resolves Wikidata entity URI for prominent Ecuadorian locations for semantic SEO / GEO
 */
function getWikidataPlaceUri(location?: string): string {
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

/**
 * Generates Schema.org JSON-LD Structured Data Graph for Google Rich Snippets,
 * Image Thumbnails, and Advanced AEO/GEO/AVO for Perplexity, ChatGPT and Gemini Overviews.
 */
export function generateArchitectureSchemaJsonLd(project: any): Record<string, any> {
  const title = cleanText(project?.title) || 'Proyecto Arquitectónico';
  const slug = cleanText(project?.slug) || cleanText(project?.id) || 'proyecto';
  const section = project?.type || 'proyectos';
  const canonicalUrl = `https://ecuadorianarchitecture.com/${section}/${slug}`;
  const studios = extractSeoStudios(project);
  const rawHero = cleanText(project?.heroImage) || `${CANONICAL_SITE_URL}/logo.svg`;
  const seoHero = toSeoImageUrl(rawHero, project, 'vista-principal');
  const heroImage = seoHero.startsWith('/') ? `${CANONICAL_SITE_URL}${seoHero}` : seoHero;
  const desc = generateArchitectureDescription(project);
  const datePublished = project?.createdAt || '2026-01-01T00:00:00Z';
  const dateModified = project?.updatedAt || new Date().toISOString();
  const studiosStr = studios.length > 0 ? studios.join(' + ') : 'Arquitectos ecuatorianos';
  const locationStr = cleanText(project?.location) || 'Ecuador';
  const yearStr = cleanText(project?.year) || '2026';
  const categoryStr = cleanText(project?.category) || 'Arquitectura';
  const materialsStr = project?.datos?.estructura || project?.datos?.materiales || 'Hormigón, madera y técnicas locales';
  const photographerStr = cleanText(project?.photographer || project?.datos?.fotografia) || 'Registro EA';

  // Authors array supporting multiple studios at equal weight
  const authors = studios.map((studioName) => ({
    '@type': 'Organization',
    name: studioName,
    url: `${CANONICAL_SITE_URL}/estudios/${encodeURIComponent(studioName.toLowerCase().replace(/\s+/g, '-'))}`,
  }));

  const imageList = [
    heroImage,
    ...(project?.secondaryImageUrl ? [project.secondaryImageUrl] : []),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Article & VisualArtwork (Guarantees Google Rich Results and image preview)
      {
        '@type': ['Article', 'VisualArtwork'],
        '@id': `${canonicalUrl}#article`,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${CANONICAL_SITE_URL}/#website`,
          name: 'Ecuadorian Architecture',
          url: CANONICAL_SITE_URL,
        },
        mainEntityOfPage: canonicalUrl,
        headline: generateArchitectureTitle(project),
        name: title,
        description: desc,
        image: imageList.map((imgUrl) => ({
          '@type': 'ImageObject',
          url: imgUrl,
          caption: `${title} - Fotografía arquitectónica por ${photographerStr}`,
          width: 1600,
          height: 1060,
        })),
        author: authors.length > 0 ? authors : [{ '@type': 'Organization', name: 'Redacción Ecuadorian Architecture' }],
        publisher: {
          '@type': 'Organization',
          name: 'Ecuadorian Architecture',
          url: CANONICAL_SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${CANONICAL_SITE_URL}/logo.svg`,
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
        // AEO: Speakable specification for Voice Search (Google Assistant, Siri) & AI audio summaries
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.editorial-lead', '.project-concept'],
        },
        // GEO: Explicit entity linking to Wikidata for Knowledge Graph
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
      // 2. BreadcrumbList (Guarantees Google displays clean navigation hierarchy like Arquitectura Viva)
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://ecuadorianarchitecture.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: section === 'territorios' ? 'Territorios' : section === 'academia' ? 'Academia' : 'Proyectos',
            item: `https://ecuadorianarchitecture.com/${section}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: canonicalUrl,
          },
        ],
      },
      // 3. AEO / GEO Q&A Page schema (Enables Perplexity, ChatGPT and Google AI Overviews to cite direct answers)
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

/**
 * Compiles complete SEO package with quality diagnostics
 */
export function compileArchitectureSeo(project: any): ArchitectureSeoData {
  const metaTitle = cleanText(project?.seo?.metaTitle) || generateArchitectureTitle(project);
  const metaDescription = cleanText(project?.seo?.metaDescription) || generateArchitectureDescription(project);
  const keywords = project?.tags?.length ? project.tags : generateArchitectureKeywords(project);
  const slug = cleanText(project?.slug) || cleanText(project?.id) || 'proyecto';
  const section = project?.type || 'proyectos';
  const canonicalUrl = `${CANONICAL_SITE_URL}/${section}/${slug}`;
  const rawOg = cleanText(project?.heroImage) || `${CANONICAL_SITE_URL}/og-image.jpg`;
  const seoOg = toSeoImageUrl(rawOg, project, 'vista-principal', true);
  const ogImage = seoOg.startsWith('/') ? `${CANONICAL_SITE_URL}${seoOg}` : seoOg;
  const schemaJsonLd = generateArchitectureSchemaJsonLd(project);

  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  return {
    metaTitle,
    metaDescription,
    keywords,
    canonicalUrl,
    ogImage,
    schemaJsonLd,
    score: {
      titleLength,
      titleStatus: titleLength >= 40 && titleLength <= 65 ? 'optimal' : titleLength < 40 ? 'short' : 'warning',
      descLength,
      descStatus: descLength >= 130 && descLength <= 165 ? 'optimal' : descLength < 130 ? 'short' : 'warning',
      hasImage: Boolean(project?.heroImage),
      hasAuthor: extractSeoStudios(project).length > 0,
      hasLocation: Boolean(project?.location),
    },
  };
}

/**
 * Dynamically injects all SEO meta tags, Open Graph, Twitter Cards, and Schema.org JSON-LD
 * into the browser document head when viewing any project in the live app.
 */
export function applyArchitectureSeoToDocument(project: any): () => void {
  if (typeof document === 'undefined') return () => {};

  const seo = compileArchitectureSeo(project);
  const previousTitle = document.title;

  // 1. Document Title
  document.title = seo.metaTitle;

  // Helper to safely set or create meta tag
  const setMeta = (attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Search Meta Tags
  setMeta('name', 'description', seo.metaDescription);
  setMeta('name', 'keywords', seo.keywords.join(', '));
  setMeta('name', 'author', extractSeoStudios(project).join(' + '));
  setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // 3. Open Graph (Facebook, WhatsApp, LinkedIn, Pinterest)
  setMeta('property', 'og:site_name', 'Ecuadorian Architecture');
  setMeta('property', 'og:type', 'article');
  setMeta('property', 'og:title', seo.metaTitle);
  setMeta('property', 'og:description', seo.metaDescription);
  setMeta('property', 'og:url', seo.canonicalUrl);
  setMeta('property', 'og:image', seo.ogImage);
  setMeta('property', 'og:image:secure_url', seo.ogImage);
  if (/\.jpe?g(\?|$)/i.test(seo.ogImage)) {
    setMeta('property', 'og:image:type', 'image/jpeg');
  }
  setMeta('property', 'og:image:width', '1200');
  setMeta('property', 'og:image:height', '630');
  setMeta('property', 'og:image:alt', buildProjectImageAlt(project));
  setMeta('property', 'og:locale', 'es_EC');

  // 4. Twitter Card
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:site', '@ecuadorianarch');
  setMeta('name', 'twitter:title', seo.metaTitle);
  setMeta('name', 'twitter:description', seo.metaDescription);
  setMeta('name', 'twitter:image', seo.ogImage);

  // 5. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', seo.canonicalUrl);

  // 6. Schema.org JSON-LD Script Tag
  let jsonLdScript = document.getElementById('ea-schema-jsonld') as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = 'ea-schema-jsonld';
    jsonLdScript.type = 'application/ld+json';
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.text = JSON.stringify(seo.schemaJsonLd, null, 2);

  // Cleanup function when leaving the page
  return () => {
    document.title = previousTitle || 'Ecuadorian Architecture';
    if (jsonLdScript && jsonLdScript.parentNode) {
      jsonLdScript.parentNode.removeChild(jsonLdScript);
    }
  };
}

function slugifySeoSegment(str: string): string {
  return String(str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isPavilionProject(project: any): boolean {
  if (!project) return false;
  const parts = [
    project.title,
    project.seo?.metaTitle,
    project.category,
    project.excerpt,
    project.subtitle,
    project.resena,
  ];
  if (Array.isArray(project.modules)) {
    for (const mod of project.modules) {
      if (mod?.content) parts.push(mod.content);
      if (mod?.title) parts.push(mod.title);
      if (mod?.caption) parts.push(mod.caption);
    }
  }
  const haystack = parts.filter(Boolean).join(' ').toLowerCase();
  return haystack.includes('pabellon') || haystack.includes('pabellón');
}

/**
 * Generates an accurate, rich Spanish alt attribute for Google Images & accessibility.
 */
export function buildProjectImageAlt(project: any, detail?: string): string {
  const title = cleanText(project?.title) || 'Proyecto Arquitectónico';
  const studios = extractSeoStudios(project);
  const studiosStr = studios.length > 0 ? studios.join(' + ') : 'Arquitectos ecuatorianos';
  const location = cleanText(project?.location) || 'Ecuador';
  const category = cleanText(project?.category) || 'Arquitectura';
  const hasPavilion = isPavilionProject(project) && !title.toLowerCase().includes('pabell');

  const prefix = detail ? `${cleanText(detail)} de ${title}` : title;
  const typology = hasPavilion ? `Pabellón de ${category}` : category;
  return `${prefix} — ${typology} por ${studiosStr} en ${location}, Ecuador | Arquitectura Ecuatoriana`;
}

/**
 * Resolves uploaded image URLs to first-party `/media/s/<file>/<seo-slug>.<ext>` in production builds
 * so Google Images indexes assets under ecuadorianarch.com with descriptive filenames.
 */
export function toSeoImageUrl(
  rawUrl: string | undefined,
  project?: any,
  descriptor: string = 'vista',
  forOpenGraph: boolean = false
): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  if (!import.meta.env.PROD || rawUrl.startsWith('data:')) return rawUrl;

  const cleaned = rawUrl.split('?')[0].trim();
  const supaMatch = cleaned.match(/\/storage\/v1\/object\/public\/uploads\/([^/]+)$/i);
  const localMatch = cleaned.match(/\/images\/uploads\/([^/]+)$/i);
  const sourceFile = supaMatch?.[1] || localMatch?.[1];
  if (!sourceFile) return rawUrl;

  const dotIdx = sourceFile.lastIndexOf('.');
  const ext = forOpenGraph ? '.jpg' : dotIdx >= 0 ? sourceFile.slice(dotIdx).toLowerCase() : '.webp';
  const baseName = (dotIdx >= 0 ? sourceFile.slice(0, dotIdx) : sourceFile).replace(/^\d+-/, '');
  const cleanedFileSlug = slugifySeoSegment(baseName);
  const useFileSlug =
    cleanedFileSlug &&
    !/^(\d+|capa-\d+|r\d+(-\d+)?|whatsapp-image.*)$/.test(cleanedFileSlug);

  const titleSlug = slugifySeoSegment(project?.slug || project?.title || 'obra');
  const studioSlug = slugifySeoSegment(extractSeoStudios(project)[0] || '');
  const hasPavilion = isPavilionProject(project) && !titleSlug.includes('pabellon');
  const descSlug = slugifySeoSegment(useFileSlug ? cleanedFileSlug.slice(0, 48) : descriptor || 'fotografia');

  const tokens = [
    hasPavilion ? 'pabellon' : '',
    titleSlug,
    studioSlug,
    descSlug,
    'arquitectura-ecuatoriana',
  ].filter(Boolean);

  const seoFilename = `${tokens.join('-').slice(0, 110)}${ext}`;
  const routePrefix = forOpenGraph ? '/media/og' : '/media/s';
  return `${routePrefix}/${encodeURIComponent(sourceFile)}/${seoFilename}`;
}
