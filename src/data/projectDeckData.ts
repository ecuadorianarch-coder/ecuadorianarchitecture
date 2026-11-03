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
}

export const DECK_PROJECTS: DeckProject[] = [
  {
    id: 'atrium',
    number: '#01',
    title: 'EDIFICIO ATRIUM',
    category: 'EDIFICACIÓN COLECTIVA',
    studio: 'RAMA ESTUDIO',
    authorHandle: 'RAMA ESTUDIO',
    photographer: 'BICUBIK',
    photographerHandle: 'BICUBIK',
    location: 'QUITO',
    year: '2024',
    excerpt:
      'El vacío central como catalizador de luz andina y aire. El proyecto renuncia a densificar el perímetro para vaciar su centro, generando un microclima térmico pasivo a 2.850 msnm.',
    secondaryExcerpt:
      'La tectónica de madera y acero dialoga con la topografía de la quebrada, permitiendo que la arquitectura se disuelva en el paisaje andino.',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'ATRIO CENTRAL // LUZ CENITAL',
    linkId: 'atrium',
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
  },
  {
    id: 'casa-arboles',
    number: '#03',
    title: 'CASA ENTRE ÁRBOLES',
    category: 'VIVIENDA UNIFAMILIAR',
    studio: 'AL BORDE ARQUITECTOS',
    authorHandle: 'AL BORDE',
    photographer: 'JAG STUDIO',
    photographerHandle: 'JAG STUDIO',
    location: 'PUEMBO',
    year: '2024',
    excerpt:
      'Una vivienda que respeta cada algarrobo preexistente. Estructura ligera de madera local y muros portantes de tapial compactado con tierra extraída del propio terreno.',
    secondaryExcerpt:
      'La inercia térmica del tapial estabiliza las temperaturas interiores, prescindiendo por completo de sistemas mecánicos de climatización.',
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'ATMÓSFERA // TAPIAL & MADERA',
    linkId: 'casa-arboles',
  },
  {
    id: 'plaza-teatro',
    number: '#04',
    title: 'PLAZA Y TEATRO',
    category: 'ESPACIO PÚBLICO & CULTURA',
    studio: 'DIEGO GUAYASAMÍN',
    authorHandle: 'DIEGO GUAYASAMÍN',
    photographer: 'BICUBIK',
    photographerHandle: 'BICUBIK',
    location: 'CUENCA',
    year: '2023',
    excerpt:
      'Rehabilitación patrimonial mediante una secuencia de terrazas abiertas que conectan el teatro experimental con la plaza vecinal del austro ecuatoriano.',
    secondaryExcerpt:
      'Las plataformas escalonadas permiten una multiplicidad de usos cívicos y eventos culturales al aire libre.',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'ESCENOGRAFÍA // MADERA & LUZ',
    linkId: 'plaza-teatro',
  },
  {
    id: 'museo-precolombino',
    number: '#05',
    title: 'MUSEO PRECOLOMBINO',
    category: 'EQUIPAMIENTO CULTURAL',
    studio: 'NOMADA TALLER',
    authorHandle: 'NOMADA TALLER',
    photographer: 'JAG STUDIO',
    photographerHandle: 'JAG STUDIO',
    location: 'GUAYAQUIL',
    year: '2024',
    excerpt:
      'Un texto es una composición ordenada de signos escritos en un soporte material, elaborada a partir de un sistema de escritura. Su lectura permite al receptor recuperar el sentido que el emisor quiso comunicar.',
    secondaryExcerpt:
      'Se compone de una serie de enunciados relacionados entre sí y ordenados según una intención comunicativa (como explicar, narrar, describir o argumentar). Para ello, se utiliza un sistema de signos conocido como lenguaje, y dentro de este, un código concreto denominado lengua o idioma.',
    imageUrl:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'GALERÍAS // CELOSÍA TÉRMICA',
    linkId: 'museo-precolombino',
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
    imageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'ARCHIVO // +24 OBRAS',
    linkId: 'catalogo',
    isCtaCard: true,
    ctaTitle: 'VER TODOS LOS PROYECTOS',
    ctaButtonText: 'EXPLORAR CATÁLOGO COMPLETO',
  },
];

export const DECK_TERRITORIOS: DeckProject[] = [
  {
    id: 'ciudad-rio',
    number: '#01',
    title: 'CIUDAD Y RÍO',
    category: 'PAISAJE & LITORAL',
    studio: 'INVESTIGACIÓN URBANA',
    authorHandle: 'INVESTIGACIÓN URBANA',
    photographer: 'DOCUMENTACIÓN EA',
    photographerHandle: 'DOCUMENTACIÓN EA',
    location: 'GUAYAS',
    year: '2024',
    excerpt:
      'El impacto de las mareas y la infraestructura hidráulica en la forma urbana. Un recorrido crítico por los esteros y muelles del Gran Guayaquil analizando la relación entre agua y asentamientos populares.',
    secondaryExcerpt:
      'La dinámica estuarina redefine los límites entre la tierra firme y la ciénaga, desafiando las lógicas tradicionales de planificación urbana.',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'ESTUARIO // AGUA & CIUDAD',
    linkId: 'ciudad-rio',
    actionButtonText: 'VER TERRITORIO',
  },
  {
    id: 'cartografia-viva',
    number: '#02',
    title: 'CARTOGRAFÍA VIVA',
    category: 'HUELLA PREHISPÁNICA',
    studio: 'MAPEO TERRITORIAL',
    authorHandle: 'MAPEO TERRITORIAL',
    photographer: 'ARCHIVO PAISAJE',
    photographerHandle: 'ARCHIVO PAISAJE',
    location: 'SIERRA CENTRAL',
    year: '2024',
    excerpt:
      'Paisajes agrícolas y huellas prehispánicas en el callejón interandino. La persistencia de acequias, terrazas y caminos ancestrales en las faldas del Tungurahua.',
    secondaryExcerpt:
      'El trazado milenario de las acequias continúa regulando el microclima agrícola y la cohesión comunitaria en el valle.',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'TERRAZAS // ANDENES ANDINOS',
    linkId: 'cartografia-viva',
    actionButtonText: 'VER TERRITORIO',
  },
  {
    id: 'amazonia-enclave',
    number: '#03',
    title: 'AMAZONÍA Y ENCLAVE',
    category: 'FRONTERA EXTRACTIVA',
    studio: 'ESTUDIO ECOLÓGICO',
    authorHandle: 'ESTUDIO ECOLÓGICO',
    photographer: 'COLECTIVO VERNÁCULO',
    photographerHandle: 'COLECTIVO VERNÁCULO',
    location: 'CORDILLERA ORIENTAL',
    year: '2023',
    excerpt:
      'Transformaciones territoriales ante las vías de extracción y asentamientos nativos. Cartografía de la deforestación y la resiliencia de la arquitectura comunitaria en madera y paja toquilla.',
    secondaryExcerpt:
      'Las estructuras comunales en paja toquilla y chonta demuestran una adaptación climática pasiva insuperada por modelos foráneos.',
    imageUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'CANOPEA // ESTRUCTURA VEGETAL',
    linkId: 'amazonia-enclave',
    actionButtonText: 'VER TERRITORIO',
  },
  {
    id: 'cuencas-sur',
    number: '#04',
    title: 'CUENCAS DEL SUR',
    category: 'INFRAESTRUCTURA HÍDRICA',
    studio: 'COLECTIVO PAISAJE',
    authorHandle: 'COLECTIVO PAISAJE',
    photographer: 'DOCUMENTACIÓN EA',
    photographerHandle: 'DOCUMENTACIÓN EA',
    location: 'AUSTRO / AZUAY',
    year: '2023',
    excerpt:
      'Represión hidroeléctrica y transformación del paisaje fluvial interandino. Análisis del cauce modificado del río Paute y su impacto sobre la agricultura y el poblamiento andino.',
    secondaryExcerpt:
      'El cañón fluvial actúa como corredor bioclimático y articulador histórico de asentamientos rurales artesanales.',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'CAUCE // PAUTE HIDRÁULICO',
    linkId: 'cuencas-sur',
    actionButtonText: 'VER TERRITORIO',
  },
  {
    id: 'fronteras-ilalo',
    number: '#05',
    title: 'FRONTERAS URBANAS',
    category: 'EXPANSIÓN INMOBILIARIA',
    studio: 'OBSERVATORIO METROPOLITANO',
    authorHandle: 'OBSERVATORIO METROPOLITANO',
    photographer: 'BICUBIK',
    photographerHandle: 'BICUBIK',
    location: 'VALLE DE TUMBÁCO',
    year: '2024',
    excerpt:
      'Presión inmobiliaria sobre el paisaje volcánico del Ilaló y quebradas interandinas. Dinámicas de fricción entre bosque nativo, comunidades comuneras y condominios cerrados.',
    secondaryExcerpt:
      'Las quebradas interandinas constituyen las últimas venas ecológicas que conectan los valles cálidos con el páramo andino.',
    imageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'LADERAS // VOLCÁN ILALÓ',
    linkId: 'fronteras-ilalo',
    actionButtonText: 'VER TERRITORIO',
  },
  {
    id: 'ver-todos-territorios',
    number: '→',
    title: 'VER TODOS LOS TERRITORIOS',
    category: 'MAPA Y REGIONES',
    studio: 'ARCHIVO TERRITORIAL',
    location: 'ECUADOR',
    year: '2024',
    excerpt:
      'Explora el mapa monográfico interactivo con todas las regiones, cuencas hídricas, reservas bioclimáticas y dinámicas territoriales del Ecuador.',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'CARTOGRAFÍA // 7 REGIONES',
    linkId: 'territorios',
    isCtaCard: true,
    ctaTitle: 'VER TODOS LOS TERRITORIOS',
    ctaButtonText: 'EXPLORAR MAPA COMPLETO',
  },
];

export const DECK_ACADEMIA: DeckProject[] = [
  {
    id: 'edificio-sensei-academia',
    number: '#01',
    title: 'EDIFICIO SENSEI',
    category: 'TESIS // PUCE FADA',
    studio: 'JUAN JOSÉ ROSALES',
    authorHandle: 'JUAN JOSÉ ROSALES',
    photographer: 'ARQ. JULIÁN ZID',
    photographerHandle: 'ARQ. JULIÁN ZID',
    location: 'QUITO',
    year: '2023',
    excerpt:
      'Investigación morfológica y tectónica sobre la densificación del hipercentro de Quito. Análisis proyectual del zócalo comercial continuo y su permeabilidad hacia el espacio público barrial.',
    secondaryExcerpt:
      'La integración de hormigón visto y vegetación endémica como estrategia de regulación térmica y ventilación pasiva en altura.',
    imageUrl: '/images/edificio_sensei.png',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'DIAGNÓSTICO // DENSIDAD URBANA',
    linkId: 'edificio-sensei-academia',
    actionButtonText: 'VER INVESTIGACIÓN',
  },
  {
    id: 'vulnerabilidad-sismica',
    number: '#02',
    title: 'VULNERABILIDAD SÍSMICA',
    category: 'ESTUDIO // UG ARQ',
    studio: 'CARLOS ALVARADO',
    authorHandle: 'CARLOS ALVARADO',
    photographer: 'ING. ROBERTO VITERI',
    photographerHandle: 'ING. ROBERTO VITERI',
    location: 'GUAYAQUIL',
    year: '2024',
    excerpt:
      'Estudio estructural y materialidad del bambú en zonas costeras ecuatorianas. Ensayos de laboratorio sobre uniones apernadas y resistencia ante sismos en edificaciones de interés social.',
    secondaryExcerpt:
      'El comportamiento dúctil del bambú guadua optimiza la disipación de energía sísmica frente a sistemas rígidos convencionales.',
    imageUrl:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'LABORATORIO // ENSAYO TECTÓNICO',
    linkId: 'vulnerabilidad-sismica',
    actionButtonText: 'VER INVESTIGACIÓN',
  },
  {
    id: 'borde-urbano',
    number: '#03',
    title: 'BORDE URBANO',
    category: 'TESIS // PUCE FADA',
    studio: 'VALERIA ESPINOSA',
    authorHandle: 'VALERIA ESPINOSA',
    photographer: 'ARQ. SEBASTIÁN CALERO',
    photographerHandle: 'ARQ. SEBASTIÁN CALERO',
    location: 'QUITO',
    year: '2023',
    excerpt:
      'Cartografía de asentamientos espontáneos y fricción ecológica en las laderas del volcán Pichincha. Diagnóstico morfológico y propuestas de contención paisajística para evitar deslaves.',
    secondaryExcerpt:
      'Estrategias de consolidación de bordes vegetales que frenan la expansión informal sobre las cuencas de amortiguamiento.',
    imageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'MAPEO // QUEBRADAS PICHINCHA',
    linkId: 'borde-urbano',
    actionButtonText: 'VER INVESTIGACIÓN',
  },
  {
    id: 'arquitectura-vernacula',
    number: '#04',
    title: 'ARQUITECTURA VERNÁCULA',
    category: 'ARTÍCULOS // UCUENCA',
    studio: 'ESTEBAN CORDERO',
    authorHandle: 'ESTEBAN CORDERO',
    photographer: 'DRA. MARÍA AUGUSTA HERMIDA',
    photographerHandle: 'DRA. MARÍA AUGUSTA HERMIDA',
    location: 'CUENCA',
    year: '2024',
    excerpt:
      'Sistemas constructivos tradicionales y memoria oral en el austro ecuatoriano. Registro etnográfico de maestros de obra en tapial, adobe y bahareque para su preservación normativa.',
    secondaryExcerpt:
      'El rescate de fórmulas ancestrales de compactación de tierra y estabilización con mucílago vegetal para bioconstrucción contemporánea.',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'PATRIMONIO // TAPIAL & MEMORIA',
    linkId: 'arquitectura-vernacula',
    actionButtonText: 'VER INVESTIGACIÓN',
  },
  {
    id: 'habitabilidad-rural',
    number: '#05',
    title: 'HABITABILIDAD RURAL',
    category: 'TESIS // USFQ ARQ',
    studio: 'MATEO BARRAGÁN',
    authorHandle: 'MATEO BARRAGÁN',
    photographer: 'ARQ. FELIPE PALACIOS',
    photographerHandle: 'ARQ. FELIPE PALACIOS',
    location: 'COTOPAXI',
    year: '2023',
    excerpt:
      'Prototipos modulares de madera y paja para comunidades de alta montaña. Monitoreo bioclimático del confort térmico y la inercia del suelo en viviendas comunales de páramo.',
    secondaryExcerpt:
      'La ventilación controlada por chimenea solar y la doble piel aislante de paja reducen el gradiente térmico nocturno en un 40%.',
    imageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'PÁRAMO // CONFORT TÉRMICO',
    linkId: 'habitabilidad-rural',
    actionButtonText: 'VER INVESTIGACIÓN',
  },
  {
    id: 'ver-toda-academia',
    number: '→',
    title: 'VER TODA LA ACADEMIA',
    category: 'TESIS & INVESTIGACIONES',
    studio: 'FONDO ACADÉMICO',
    location: 'ECUADOR',
    year: '2024',
    excerpt:
      'Consulta el catálogo académico completo: proyectos de graduación, investigaciones universitarias y artículos indexados de facultades de arquitectura del Ecuador.',
    imageUrl:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    secondaryImageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    secondaryCaption: 'ARCHIVO // +18 TESIS',
    linkId: 'academia',
    isCtaCard: true,
    ctaTitle: 'VER TODA LA ACADEMIA',
    ctaButtonText: 'EXPLORAR INVESTIGACIONES',
  },
];

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

/**
 * Obtiene la lista activa de tarjetas para la pestaña indicada de la Landing.
 * Si el CMS tiene artículos con `showOnLanding === true`, se priorizan y ordenan.
 * De lo contrario, se utilizan los destacados por defecto.
 */
export function getDeckProjectsForTab(
  tab: 'proyectos' | 'territorios' | 'academia',
  allArticles?: any[]
): DeckProject[] {
  const defaultList = DECK_DATA_BY_TAB[tab] || DECK_PROJECTS;
  if (!allArticles || allArticles.length === 0) {
    return defaultList;
  }

  const matching = allArticles.filter((a) => {
    const belongsToTab = (a.landingTab || a.type) === tab;
    return belongsToTab && a.showOnLanding === true;
  });

  if (matching.length === 0) {
    return defaultList;
  }

  matching.sort((a, b) => {
    const orderA = typeof a.landingOrder === 'number' ? a.landingOrder : 99;
    const orderB = typeof b.landingOrder === 'number' ? b.landingOrder : 99;
    return orderA - orderB;
  });

  const deckProjects = matching.map((art, idx) => editorialArticleToDeckProject(art, idx));

  // Conservar la tarjeta final de llamado a la acción (CTA)
  const ctaCard = defaultList.find((p) => p.isCtaCard);
  if (ctaCard) {
    deckProjects.push(ctaCard);
  }

  return deckProjects;
}
