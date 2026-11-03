/**
 * ============================================================================
 * DATOS EDITORIALES DE LA PILA DE TARJETAS (MAZO FÍSICO)
 * ============================================================================
 * Aquí puedes editar fácilmente los proyectos que aparecen en el mazo:
 * - title: Nombre del proyecto (aparece en la franja superior y en el frente)
 * - category: Categoría o tipología arquitectónica
 * - studio: Nombre del arquitecto o estudio
 * - location: Ciudad o emplazamiento
 * - year: Año de construcción o publicación
 * - excerpt: Resumen o extracto crítico
 * - imageUrl: Imagen principal del proyecto (Fachada / Exterior)
 * - secondaryImageUrl: Segunda imagen (Interior / Detalle tectónico que se revela)
 * - secondaryCaption: Pequeña etiqueta descriptiva de la segunda imagen
 * - linkId: Identificador para abrir el expediente completo del proyecto
 * - isCtaCard: Indica si es la tarjeta final de llamada a la acción para ver el catálogo
 */

export interface DeckProject {
  id: string;
  number: string;
  title: string;
  category: string;
  studio: string;
  authorHandle?: string;
  photographer?: string;
  photographerHandle?: string;
  location: string;
  year: string;
  excerpt: string;
  secondaryExcerpt?: string;
  imageUrl: string;
  secondaryImageUrl?: string;
  secondaryCaption?: string;
  linkId: string;
  isCtaCard?: boolean;
  ctaTitle?: string;
  ctaButtonText?: string;
  actionButtonText?: string;
  isEditorialEmptyCard?: boolean;
  emptySection?: 'proyectos' | 'territorios' | 'academia';
}

export const DECK_PROJECTS: DeckProject[] = [
  {
    id: 'espacio-para-hablar-con-dios-ssqj',
    number: '#01',
    title: 'ESPACIO PARA HABLAR CON DIOS',
    category: 'EQUIPAMIENTO CULTURAL',
    studio: 'NOMADE TALLER',
    authorHandle: 'NOMADE TALLER',
    photographer: '',
    photographerHandle: '',
    location: 'QUITO',
    year: '2024',
    excerpt:
      'El proyecto nace como una respuesta íntima de la comunidad de Rumipamba a su propia necesidad espiritual, un intento de reconectar con lo divino en un espacio que les ha sido negado a través de un proceso de diseño participativo.',
    secondaryExcerpt:
      'A través de un proceso participativo con la comunidad, se concibió un espacio que no solo une a las personas con lo sagrado, sino que revitaliza técnicas ancestrales honrando la maestría local.',
    imageUrl: '/images/uploads/1793233204996-RENDER_1__3_.webp',
    secondaryImageUrl: '/images/uploads/1793233720751-TALLER_PARTICIPATIVO__1_.webp',
    secondaryCaption: 'PROCESO // TALLER PARTICIPATIVO',
    linkId: 'espacio-para-hablar-con-dios-ssqj',
    actionButtonText: 'VER PROYECTO',
  },
  {
    id: 'edificio-sensei',
    number: '#02',
    title: 'EDIFICIO SENSEI',
    category: 'USO MIXTO & DENSIDAD',
    studio: 'DANIEL MORENO FLORES',
    authorHandle: 'DANIEL MORENO FLORES',
    photographer: 'JAG STUDIO',
    photographerHandle: 'JAG STUDIO',
    location: 'QUITO',
    year: '2023',
    excerpt:
      'Una propuesta de porosidad urbana en el hipercentro de Quito. Hormigón visto y vegetación endémica que dialogan con el clima andino y reactivan el zócalo público barrial.',
    secondaryExcerpt:
      'El zócalo permeable vincula el espacio privado con la vereda peatonal, enriqueciendo la vida colectiva del barrio.',
    imageUrl: '/images/edificio_sensei.png',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'MATERIALIDAD // HORMIGÓN VISTO',
    linkId: 'edificio-sensei',
    actionButtonText: 'VER PROYECTO',
  },
  {
    id: 'ver-todos',
    number: '→',
    title: 'VER TODOS LOS PROYECTOS',
    category: 'CATÁLOGO COMPLETO',
    studio: 'ARCHIVO MONOGRÁFICO',
    location: 'ECUADOR',
    year: '2024',
    excerpt:
      'Accede a la totalidad de obras documentadas en el territorio ecuatoriano: planimetrías técnicas a escala 1:100, memorias descriptivas, fichas tectónicas y crítica especializada.',
    imageUrl: '/images/edificio_sensei.png',
    secondaryImageUrl: '/images/uploads/1793233204996-RENDER_1__3_.webp',
    secondaryCaption: 'ARCHIVO // OBRAS VERIFICADAS',
    linkId: 'catalogo',
    isCtaCard: true,
    ctaTitle: 'VER TODOS LOS PROYECTOS',
    ctaButtonText: 'EXPLORAR CATÁLOGO COMPLETO',
  },
];

export const DECK_TERRITORIOS: DeckProject[] = [];

export const DECK_ACADEMIA: DeckProject[] = [];

export const DECK_DATA_BY_TAB: Record<'proyectos' | 'territorios' | 'academia', DeckProject[]> = {
  proyectos: DECK_PROJECTS,
  territorios: DECK_TERRITORIOS,
  academia: DECK_ACADEMIA,
};

/**
 * Convierte un artículo editorial del CMS a la estructura de tarjeta del mazo físico de la Landing.
 */
export function editorialArticleToDeckProject(article: any, index?: number): DeckProject {
  const numberTag = article.number || `#${String((index ?? 0) + 1).padStart(2, '0')}`;

  // Formato de estudio(s) colaborador(es): hasta 3 estudios unidos con " + "
  let studioText = article.studio || '';
  if (Array.isArray(article.studios) && article.studios.length > 0) {
    studioText = article.studios.filter(Boolean).join(' + ');
  } else if (!studioText && article.author) {
    studioText = article.author;
  }

  // Fotógrafo (opcional)
  const photo = article.photographer || article.datos?.fotografia || article.photographerHandle || '';

  return {
    id: article.id,
    number: numberTag,
    title: article.title,
    category: article.category || (article.type === 'proyectos' ? 'OBRA CONSTRUIDA' : article.type === 'territorios' ? 'TERRITORIO' : 'ACADEMIA'),
    studio: studioText || 'ESTUDIO DE ARQUITECTURA',
    authorHandle: article.authorHandle || studioText,
    photographer: photo,
    photographerHandle: article.photographerHandle || photo,
    location: article.location || article.city || 'ECUADOR',
    year: article.year || '2024',
    excerpt: article.excerpt || article.resena || '',
    secondaryExcerpt: article.secondaryExcerpt || (article.resena ? article.resena.slice(0, 160) + '...' : undefined),
    imageUrl: article.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl: article.secondaryImageUrl,
    secondaryCaption: article.secondaryCaption,
    linkId: article.slug || article.id,
    isCtaCard: false,
    actionButtonText: article.actionButtonText || (article.type === 'territorios' ? 'VER TERRITORIO' : article.type === 'academia' ? 'VER INVESTIGACIÓN' : 'VER PROYECTO'),
  };
}

export function createEditorialEmptyDeckCard(tab: 'proyectos' | 'territorios' | 'academia'): DeckProject {
  const titles: Record<string, string> = {
    academia: 'El conocimiento también se construye colectivamente.',
    territorios: 'El territorio también está por escribirse.',
    proyectos: 'La arquitectura no empieza ni termina en una fotografía.',
  };
  const categories: Record<string, string> = {
    academia: 'INVESTIGACIÓN ACADÉMICA // EN CONSTRUCCIÓN',
    territorios: 'EXPEDIENTES TERRITORIALES // EN CONSTRUCCIÓN',
    proyectos: 'ARCHIVO DOCUMENTAL // EN CONSTRUCCIÓN',
  };

  return {
    id: `empty-deck-${tab}`,
    number: '#01',
    title: titles[tab] || 'EN CONSTRUCCIÓN EDITORIAL',
    category: categories[tab] || 'EN CONSTRUCCIÓN EDITORIAL',
    studio: 'DIRECCIÓN EDITORIAL EA',
    authorHandle: 'ECUADORIANARCHITECTURE',
    location: 'ECUADOR',
    year: '2026',
    excerpt: '',
    imageUrl: '',
    linkId: tab,
    isEditorialEmptyCard: true,
    emptySection: tab,
  };
}

/**
 * Obtiene la lista activa de tarjetas para la pestaña indicada de la Landing.
 * Si el CMS tiene artículos con `showOnLanding === true`, se priorizan y ordenan.
 * Si no hay publicaciones reales en esta categoría, retorna la tarjeta de estado vacío editorial.
 */
export function getDeckProjectsForTab(
  tab: 'proyectos' | 'territorios' | 'academia',
  allArticles?: any[]
): DeckProject[] {
  const matching = (allArticles || []).filter((a) => {
    const belongsToTab = (a.landingTab || a.type) === tab;
    return belongsToTab && a.showOnLanding === true;
  });

  if (matching.length === 0) {
    return [createEditorialEmptyDeckCard(tab)];
  }

  matching.sort((a, b) => {
    const orderA = typeof a.landingOrder === 'number' ? a.landingOrder : 99;
    const orderB = typeof b.landingOrder === 'number' ? b.landingOrder : 99;
    return orderA - orderB;
  });

  const deckProjects = matching.map((art, idx) => editorialArticleToDeckProject(art, idx));

  // Conservar la tarjeta final de llamado a la acción (CTA) para explorar catálogo completo
  const defaultList = DECK_DATA_BY_TAB[tab] || DECK_PROJECTS;
  const ctaCard = defaultList.find((p) => p.isCtaCard);
  if (ctaCard) {
    deckProjects.push(ctaCard);
  }

  return deckProjects;
}
