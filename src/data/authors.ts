import initialAuthorsJson from './authors.json';

export interface AuthorTeamMember {
  name: string;
  role: string;
}

export interface AuthorContact {
  website?: string;
  instagram?: string;
  email?: string;
}

export interface AuthorProfileData {
  id: string;
  name: string;
  slug: string;
  founder: string;
  location: string;
  country: string;
  foundedYear: string;
  avatarUrl: string;
  coverImage: string;
  headline: string;
  description: string;
  philosophy: string;
  typologies: string[];
  team: AuthorTeamMember[];
  awards: string[];
  contact: AuthorContact;
}

export const AUTHORS_REGISTRY: Record<string, AuthorProfileData> = {
  'estudio-felipe-escudero': {
    id: 'estudio-felipe-escudero',
    name: 'ESTUDIO FELIPE ESCUDERO',
    slug: 'estudio-felipe-escudero',
    founder: 'Felipe Escudero',
    location: 'Quito, Ecuador',
    country: 'Ecuador',
    foundedYear: '2014',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    headline: 'Arquitectura escultórica, vanguardia matérica y diálogo con la geografía andina.',
    description:
      'Fundado en Quito por Felipe Escudero, el estudio opera en el cruce entre la arquitectura contemporánea, la escultura y la innovación de fabricación digital. Sus obras se distinguen por formas puras, volúmenes monolíticos y un diálogo visceral con la topografía volcánica del Ecuador. El estudio ha sido ampliamente publicado en medios internacionales como Wallpaper*, Architectural Digest, Dwell y ArchDaily.',
    philosophy:
      'La arquitectura debe provocar asombro y emoción permanente. Buscamos que cada obra sea un artefacto sensorial que capte la luz ecuatorial, la gravedad y el silencio del paisaje.',
    typologies: [
      'Arquitectura Residencial',
      'Arquitectura Efímera',
      'Pabellones de Alta Montaña',
      'Diseño de Mobiliario y Escultura',
    ],
    team: [
      { name: 'Felipe Escudero', role: 'Director Creativo & Principal' },
      { name: 'Esteban Naranjo', role: 'Coordinador de Proyectos' },
      { name: 'Mateo Neira', role: 'Líder Tectónico & Materialidad' },
    ],
    awards: [
      'Selección Oficial Bienal Panamericana de Arquitectura de Quito (BAQ)',
      'ArchDaily Building of the Year Nominee',
      'Premio Nacional de Diseño Espacial',
    ],
    contact: {
      website: 'https://www.felipeescudero.com',
      instagram: '@estudiofelipeescudero',
      email: 'contacto@felipeescudero.com',
    },
  },

  'rama-estudio': {
    id: 'rama-estudio',
    name: 'RAMA ESTUDIO',
    slug: 'rama-estudio',
    founder: 'Carolina Rodas, Felipe Donoso, Carla Chávez',
    location: 'Quito, Ecuador',
    country: 'Ecuador',
    foundedYear: '2012',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    headline: 'Taller de arquitectura, producción material y optimización de recursos en los Andes.',
    description:
      'RAMA estudio es una práctica de arquitectura y diseño radicada en Quito enfocada en la optimización de recursos, la experimentación espacial y la producción de bajo impacto ambiental. Sus proyectos abordan desde viviendas bioclimáticas hasta infraestructuras colectivas y rehabilitación patrimonial, integrando mano de obra local con soluciones técnicas contemporáneas.',
    philosophy:
      'Trabajamos desde la honestidad de la materia y la potencia del vacío. La arquitectura adquiere sentido cuando genera comunidad y responde con precisión a su microclima.',
    typologies: [
      'Edificación Colectiva',
      'Vivienda Bioclimática',
      'Rehabilitación Patrimonial',
      'Espacio Público',
    ],
    team: [
      { name: 'Carolina Rodas', role: 'Socia Fundadora' },
      { name: 'Felipe Donoso', role: 'Socio Fundador' },
      { name: 'Carla Chávez', role: 'Socia Fundadora' },
    ],
    awards: [
      'Premio Bienal Panamericana de Arquitectura de Quito (BAQ)',
      'Premio Mies Crown Hall Americas (MCHAP) Nominee',
    ],
    contact: {
      website: 'https://ramaestudioec.com',
      instagram: '@ramaestudioec',
      email: 'info@ramaestudioec.com',
    },
  },

  'al-borde-arquitectos': {
    id: 'al-borde-arquitectos',
    name: 'AL BORDE ARQUITECTOS',
    slug: 'al-borde-arquitectos',
    founder: 'David Barragán, Pascual Gangotena, Marialuisa Borja, Esteban Benavides',
    location: 'Quito / Puembo, Ecuador',
    country: 'Ecuador',
    foundedYear: '2007',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80',
    headline: 'Arquitectura radical de recursos escasos, tierra cruda y pedagogía comunitaria.',
    description:
      'Al Borde es un colectivo interdisciplinario de arquitectura internacionalmente reconocido por convertir la escasez económica en un motor de invención espacial. Mediante el uso pionero de tierra cruda (tapial, adobe), madera de reforestación y sistemas participativos, han posicionado la arquitectura ecuatoriana en las principales bienales del mundo.',
    philosophy:
      'Hacer más con menos. La belleza arquitectónica surge de la verdad estructural y de la capacidad de transformar los recursos disponibles en hábitat digno y festivo.',
    typologies: [
      'Vivienda Experimental',
      'Arquitectura con Tierra Cruda',
      'Equipamientos Educativos',
      'Autoconstrucción Comunitaria',
    ],
    team: [
      { name: 'David Barragán', role: 'Socio Director' },
      { name: 'Pascual Gangotena', role: 'Socio Director' },
      { name: 'Marialuisa Borja', role: 'Socia Directora' },
      { name: 'Esteban Benavides', role: 'Socio Director' },
    ],
    awards: [
      'Exhibición Bienal de Arquitectura de Venecia',
      'Premio Curry Stone Design Prize',
      'Premio Global Award for Sustainable Architecture',
    ],
    contact: {
      website: 'https://www.albordearq.com',
      instagram: '@albordearq',
      email: 'contacto@albordearq.com',
    },
  },

  'daniel-moreno-flores': {
    id: 'daniel-moreno-flores',
    name: 'DANIEL MORENO FLORES',
    slug: 'daniel-moreno-flores',
    founder: 'Daniel Moreno Flores',
    location: 'Quito / Tumbaco, Ecuador',
    country: 'Ecuador',
    foundedYear: '2010',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    headline: 'Estructuras ligeras de madera y metal en diálogo con la orografía volcánica.',
    description:
      'La práctica de Daniel Moreno Flores se caracteriza por una sensibilidad extrema hacia la topografía, el suelo y la vegetación nativa de las quebradas interandinas. Con estructuras ensambladas en seco, sistemas modulares de madera y metal, sus proyectos se posan con levedad sobre el terreno respetando la huella ecológica.',
    philosophy:
      'La arquitectura debe posarse sobre la tierra con respeto reverencial, permitiendo que la naturaleza continúe su curso bajo y alrededor de la obra.',
    typologies: [
      'Vivienda Unifamiliar',
      'Estructuras Mixtas Madera-Metal',
      'Arquitectura en Pendiente',
      'Edificación de Uso Mixto',
    ],
    team: [{ name: 'Daniel Moreno Flores', role: 'Arquitecto Principal' }],
    awards: ['Mención de Honor BAQ', 'Premio Ornato Ciudad de Quito'],
    contact: {
      instagram: '@danielmorenofloresarq',
      email: 'contacto@danielmorenoflores.com',
    },
  },

  'diego-guayasamin': {
    id: 'diego-guayasamin',
    name: 'DIEGO GUAYASAMÍN',
    slug: 'diego-guayasamin',
    founder: 'Diego Guayasamín',
    location: 'Quito / Cuenca, Ecuador',
    country: 'Ecuador',
    foundedYear: '2004',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    headline: 'Monumentalidad cívica, hormigón escultórico e infraestructuras metropolitanas.',
    description:
      'Estudio líder en el desarrollo de obras públicas y corporativas de gran escala en el Ecuador. Reconocido por el diseño de la Sede de UNASUR y múltiples plazas cívicas, su trabajo explora el hormigón armado en voladizos espectaculares y la articulación del espacio público urbano.',
    philosophy:
      'El espacio público es el verdadero corazón democrático de la ciudad. La arquitectura cívica debe inspirar orgullo colectivo y perdurar en el tiempo.',
    typologies: ['Edificios Cívicos', 'Espacio Público', 'Teatros', 'Centros Corporativos'],
    team: [{ name: 'Diego Guayasamín', role: 'Director General' }],
    awards: [
      'Premio Nacional de Espacio Público 2024',
      'Premio Nacional de Arquitectura BAQ',
    ],
    contact: {
      website: 'https://www.diegoguayasamin.com',
      instagram: '@diegoguayasaminarquitectos',
    },
  },

  'luis-lopez-lopez': {
    id: 'luis-lopez-lopez',
    name: 'LUIS LÓPEZ LÓPEZ',
    slug: 'luis-lopez-lopez',
    founder: 'Luis López López',
    location: 'Guayaquil, Ecuador',
    country: 'Ecuador',
    foundedYear: '2008',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    headline: 'Arquitectura tropical bioclimática, ventilación y memoria litoral.',
    description:
      'Práctica arquitectónica con sede en Guayaquil, centrada en la climatización pasiva y la tectónica tropical en climas cálido-húmedos. Su catálogo abarca museos, bibliotecas y proyectos educativos donde las sombras profundas y los materiales cerámicos locales son protagonistas.',
    philosophy:
      'En el trópico, la sombra y el viento son la arquitectura. Proyectamos para captar la brisa marina y atenuar la radiación solar.',
    typologies: ['Museografía', 'Equipamientos Educativos', 'Arquitectura Tropical Costera'],
    team: [{ name: 'Luis López López', role: 'Director' }],
    awards: ['Premio Bienal de Arquitectura del Litoral'],
    contact: {
      instagram: '@luislopezarq',
    },
  },

  'enlace-arquitectura': {
    id: 'enlace-arquitectura',
    name: 'ENLACE ARQUITECTURA',
    slug: 'enlace-arquitectura',
    founder: 'Colectivo Enlace Manabí',
    location: 'Manabí / Portoviejo, Ecuador',
    country: 'Ecuador',
    foundedYear: '2015',
    avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80',
    headline: 'Innovación en caña guadúa y regeneración comunitaria en la costa ecuatoriana.',
    description:
      'Colectivo interdisciplinario que promueve el uso del bambú / caña guadúa angustifolia como material estructural de alto rendimiento sísmico. Tras el terremoto de 2016, han liderado la construcción de centros comunitarios, escuelas rurales y albergues sostenibles en la costa ecuatoriana.',
    philosophy:
      'El bambú es el acero vegetal de América. Construir con caña guadúa es regenerar la economía campesina y salvaguardar la vida frente a los sismos.',
    typologies: ['Estructuras en Caña Guadúa', 'Centros Comunitarios', 'Hábitat Resiliente Costero'],
    team: [{ name: 'Equipo Enlace Manabí', role: 'Colectivo Tectónico' }],
    awards: ['Premio Hábitat Resiliente Ecuador', 'Mención Especial Sostenibilidad'],
    contact: {
      instagram: '@enlacearquitecturaec',
    },
  },
};

/**
 * Normalizes an author/studio string into a lookup key slug.
 */
export const normalizeStudioToSlug = (studioName: string): string => {
  return studioName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Loads all active author profiles, checking localStorage first, then authors.json, then AUTHORS_REGISTRY.
 */
export const getAllAuthorProfiles = (): AuthorProfileData[] => {
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('ea_content_authors');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (_) {}

  if (Array.isArray(initialAuthorsJson) && initialAuthorsJson.length > 0) {
    return initialAuthorsJson as AuthorProfileData[];
  }

  return Object.values(AUTHORS_REGISTRY);
};

/**
 * Checks whether an author or studio has a genuine registered profile
 * in the database (either custom CMS authors or static registry).
 */
export const hasAuthorProfile = (studioName?: string): boolean => {
  if (!studioName || !studioName.trim()) return false;
  const cleanName = studioName.trim().toUpperCase();
  const slug = normalizeStudioToSlug(studioName);
  const allAuthors = getAllAuthorProfiles();

  return (
    allAuthors.some((a) => {
      const aSlug = a.slug || normalizeStudioToSlug(a.name);
      const aName = a.name.trim().toUpperCase();
      return (
        a.id === slug ||
        aSlug === slug ||
        aName === cleanName ||
        (cleanName.length > 3 && aName.includes(cleanName)) ||
        (cleanName.length > 3 && cleanName.includes(aName))
      );
    }) || Boolean(AUTHORS_REGISTRY[slug])
  );
};

/**
 * Retrieves the author profile by studio name or id with fuzzy matching.
 * Checks live dynamic authors first so any updates in CMS are reflected immediately.
 */
export const getAuthorProfile = (studioName: string): AuthorProfileData => {
  const allAuthors = getAllAuthorProfiles();
  if (!studioName) {
    return allAuthors[0] || AUTHORS_REGISTRY['estudio-felipe-escudero'];
  }

  const slug = normalizeStudioToSlug(studioName);

  // 1. Exact match by slug or id
  const exact = allAuthors.find((a) => a.slug === slug || a.id === slug);
  if (exact) return exact;

  // 2. Exact match by uppercase normalized name
  const cleanName = studioName.trim().toUpperCase();
  const nameMatch = allAuthors.find(
    (a) => a.name.trim().toUpperCase() === cleanName || normalizeStudioToSlug(a.name) === slug
  );
  if (nameMatch) return nameMatch;

  // 3. Fuzzy match
  const fuzzy = allAuthors.find((a) => {
    const aSlug = a.slug || normalizeStudioToSlug(a.name);
    return slug.includes(aSlug) || aSlug.includes(slug);
  });
  if (fuzzy) return fuzzy;

  // 4. Check fallback static registry
  if (AUTHORS_REGISTRY[slug]) {
    return AUTHORS_REGISTRY[slug];
  }

  // 5. Dynamic fallback for any other studio (e.g., academia, territorios, or new studios)
  return {
    id: slug || 'estudio-arquitectura',
    name: cleanName,
    slug: slug || 'estudio-arquitectura',
    founder: cleanName,
    location: 'Ecuador',
    country: 'Ecuador',
    foundedYear: '2016',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    headline: `Práctica de arquitectura contemporánea, investigación y producción espacial en el Ecuador.`,
    description: `${cleanName} es una práctica arquitectónica activa en el Ecuador, orientada a la investigación proyectual, la honestidad material y el diálogo riguroso con el entorno físico y cultural del territorio. Sus obras y estudios exploran respuestas espaciales contemporáneas a los desafíos urbanos y paisajísticos de la región andina y litoral.`,
    philosophy:
      'Proyectar desde el lugar y con la materia local para responder con pertinencia tectónica a nuestro tiempo.',
    typologies: ['Arquitectura Contemporánea', 'Investigación Proyectual', 'Hábitat Sustentable'],
    team: [{ name: cleanName, role: 'Dirección de Taller' }],
    awards: ['Publicado en Archivo EcuadorianArch'],
    contact: {
      website: 'https://ecuadorianarch.org',
      instagram: `@${slug.replace(/-/g, '')}`,
    },
  };
};
