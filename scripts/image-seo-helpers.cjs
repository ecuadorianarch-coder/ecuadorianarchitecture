const path = require('path');

function cleanText(str) {
  if (!str) return '';
  return String(str).replace(/\s+/g, ' ').trim();
}

function slugifySeo(str) {
  return cleanText(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractStudios(project) {
  if (Array.isArray(project?.studios) && project.studios.length > 0) {
    return project.studios.map((s) => cleanText(s)).filter(Boolean);
  }
  if (project?.studio) return [cleanText(project.studio)];
  return ['Estudios Ecuatorianos'];
}

function projectMentionsPavilion(project) {
  const parts = [
    project?.title,
    project?.seo?.metaTitle,
    project?.category,
    project?.excerpt,
    project?.subtitle,
    project?.resena,
    project?.heroImage,
  ];
  if (Array.isArray(project?.modules)) {
    for (const mod of project.modules) {
      if (mod?.content) parts.push(mod.content);
      if (mod?.title) parts.push(mod.title);
      if (mod?.caption) parts.push(mod.caption);
      if (mod?.imageUrl) parts.push(mod.imageUrl);
      if (Array.isArray(mod?.imageUrls)) parts.push(mod.imageUrls.join(' '));
    }
  }
  const haystack = parts.filter(Boolean).join(' ').toLowerCase();
  return haystack.includes('pabellon') || haystack.includes('pabellón');
}

function extractUploadFilename(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const cleaned = rawUrl.split('?')[0].trim();
  const supaMatch = cleaned.match(/\/storage\/v1\/object\/public\/uploads\/([^/]+)$/i);
  if (supaMatch) return supaMatch[1];
  const localMatch = cleaned.match(/\/images\/uploads\/([^/]+)$/i);
  if (localMatch) return localMatch[1];
  return null;
}

function toFirstPartySeoImageUrl(rawUrl, project, descriptor = 'vista', siteUrl = 'https://ecuadorianarch.com') {
  if (!rawUrl || typeof rawUrl !== 'string') return `${siteUrl}/logo.svg`;
  const sourceFile = extractUploadFilename(rawUrl);
  if (!sourceFile) {
    return rawUrl.startsWith('http') ? rawUrl : `${siteUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  }

  const ext = path.extname(sourceFile).toLowerCase() || '.webp';
  const titleSlug = slugifySeo(project?.slug || project?.title || 'obra');
  const studioSlug = slugifySeo(extractStudios(project)[0] || '');
  const descSlug = slugifySeo(descriptor || 'fotografia');
  const hasPavilion = projectMentionsPavilion(project) && !titleSlug.includes('pabellon');

  const nameTokens = [
    hasPavilion ? 'pabellon' : '',
    titleSlug,
    studioSlug,
    descSlug,
    'arquitectura-ecuatoriana',
  ].filter(Boolean);

  const seoFilename = `${nameTokens.join('-').slice(0, 110)}${ext}`;
  const origin = siteUrl ? siteUrl.replace(/\/+$/, '') : '';
  return `${origin}/media/s/${encodeURIComponent(sourceFile)}/${seoFilename}`;
}

function toFirstPartyOgImageUrl(rawUrl, project, descriptor = 'vista-principal', siteUrl = 'https://ecuadorianarch.com') {
  if (!rawUrl || typeof rawUrl !== 'string') return `${siteUrl}/og-image.jpg`;
  const sourceFile = extractUploadFilename(rawUrl);
  if (!sourceFile) {
    return rawUrl.startsWith('http') ? rawUrl : `${siteUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  }

  const titleSlug = slugifySeo(project?.slug || project?.title || 'obra');
  const studioSlug = slugifySeo(extractStudios(project)[0] || '');
  const descSlug = slugifySeo(descriptor || 'vista-principal');
  const hasPavilion = projectMentionsPavilion(project) && !titleSlug.includes('pabellon');

  const nameTokens = [
    hasPavilion ? 'pabellon' : '',
    titleSlug,
    studioSlug,
    descSlug,
    'arquitectura-ecuatoriana',
  ].filter(Boolean);

  const seoBase = nameTokens.join('-').slice(0, 110);
  const origin = siteUrl ? siteUrl.replace(/\/+$/, '') : '';
  return `${origin}/media/og/${encodeURIComponent(sourceFile)}/${seoBase}.jpg`;
}

function buildImageAlt(project, { caption, label, isPlan } = {}) {
  const title = cleanText(project?.title) || 'Proyecto Arquitectónico';
  const studios = extractStudios(project).join(' + ');
  const location = cleanText(project?.location) || 'Ecuador';
  const category = cleanText(project?.category) || 'Arquitectura';
  const hasPavilion = projectMentionsPavilion(project) && !title.toLowerCase().includes('pabell');

  const prefix = caption
    ? cleanText(caption)
    : label
    ? `${label} de ${title}`
    : isPlan
    ? `Planimetría de ${title}`
    : title;

  const typologyNote = hasPavilion ? `Pabellón de ${category}` : category;
  return `${prefix} — ${typologyNote} por ${studios} en ${location}, Ecuador | Arquitectura Ecuatoriana`;
}

function buildSeoDescriptorFromUrl(rawUrl, fallback) {
  const filename = extractUploadFilename(rawUrl) || '';
  const base = path.basename(filename, path.extname(filename)).replace(/^\d+-/, '');
  const cleaned = slugifySeo(base);
  if (!cleaned || /^(\d+|capa-\d+|r\d+(-\d+)?|whatsapp-image.*)$/.test(cleaned)) {
    return fallback;
  }
  return cleaned.slice(0, 48);
}

function extractProjectSeoImages(project, siteUrl = 'https://ecuadorianarch.com') {
  const seen = new Map();
  const ordered = [];
  const photographerDefault = cleanText(project?.photographer || project?.datos?.fotografia) || 'Registro EA';

  const register = (rawUrl, { caption, label, credit, isPlan = false, isHero = false, indexLabel }) => {
    if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.startsWith('data:')) return;
    const key = rawUrl.trim();
    if (seen.has(key)) {
      const existing = seen.get(key);
      if (caption && !existing.rawCaption) existing.rawCaption = caption;
      if (credit && existing.credit === photographerDefault) existing.credit = credit;
      if (isPlan) existing.isPlan = true;
      return;
    }

    const fallbackDesc = isHero ? 'vista-principal' : indexLabel || (isPlan ? 'planimetria' : 'fotografia');
    const descriptor = buildSeoDescriptorFromUrl(key, fallbackDesc);
    const seoUrl = toFirstPartySeoImageUrl(key, project, descriptor, siteUrl);
    const alt = buildImageAlt(project, { caption, label: isHero ? '' : label, isPlan });

    const entry = {
      rawUrl: key,
      url: seoUrl,
      alt,
      title: alt,
      rawCaption: cleanText(caption || ''),
      caption: cleanText(caption) || alt,
      credit: cleanText(credit) || photographerDefault,
      isPlan,
      isHero,
    };

    seen.set(key, entry);
    ordered.push(entry);
  };

  if (project?.heroImage) {
    register(project.heroImage, {
      caption: project?.seo?.ogImageAlt || '',
      label: 'Vista principal',
      credit: photographerDefault,
      isHero: true,
    });
  }

  let imgCounter = 1;
  if (Array.isArray(project?.modules)) {
    for (const mod of project.modules) {
      if (!mod) continue;
      const credit = cleanText(mod.credits) || photographerDefault;
      const isPlanMod = mod.type === 'planimetry' || mod.category === 'planimetria';

      if ((mod.type === 'single-image' || mod.type === 'fullscreen-image' || mod.type === 'planimetry') && mod.imageUrl) {
        register(mod.imageUrl, {
          caption: mod.caption || mod.title || '',
          label: isPlanMod ? `Planimetría ${imgCounter}` : `Fotografía ${imgCounter}`,
          credit,
          isPlan: isPlanMod,
          indexLabel: `${isPlanMod ? 'planimetria' : 'foto'}-${imgCounter}`,
        });
        imgCounter += 1;
      } else if (mod.type === 'image-gallery' && Array.isArray(mod.imageUrls)) {
        for (const u of mod.imageUrls) {
          register(u, {
            caption: mod.title || '',
            label: `Galería fotográfica ${imgCounter}`,
            credit,
            isPlan: mod.category === 'planimetria',
            indexLabel: `galeria-${imgCounter}`,
          });
          imgCounter += 1;
        }
      } else if (mod.type === 'image-comparison') {
        if (mod.beforeImageUrl) {
          register(mod.beforeImageUrl, {
            label: `Comparativa estado previo ${imgCounter}`,
            credit,
            indexLabel: `comparativa-antes-${imgCounter}`,
          });
          imgCounter += 1;
        }
        if (mod.afterImageUrl) {
          register(mod.afterImageUrl, {
            label: `Comparativa estado actual ${imgCounter}`,
            credit,
            indexLabel: `comparativa-despues-${imgCounter}`,
          });
          imgCounter += 1;
        }
      }
    }
  }

  return ordered;
}

module.exports = {
  cleanText,
  slugifySeo,
  extractStudios,
  projectMentionsPavilion,
  extractUploadFilename,
  toFirstPartySeoImageUrl,
  toFirstPartyOgImageUrl,
  buildImageAlt,
  extractProjectSeoImages,
};
