import initialPhotographersJson from './photographers.json';

export interface PhotographerContact {
  website?: string;
  instagram?: string;
  email?: string;
}

export interface PhotographerProfileData {
  id: string;
  name: string;
  slug: string;
  lead: string;
  location: string;
  country: string;
  foundedYear: string;
  avatarUrl: string;
  coverImage: string;
  headline: string;
  description: string;
  philosophy: string;
  focus: string[];
  publications: string[];
  contact: PhotographerContact;
}

export const PHOTOGRAPHERS_REGISTRY: Record<string, PhotographerProfileData> = {
  'bicubik-photography': {
    id: 'bicubik-photography',
    name: 'BICUBIK PHOTOGRAPHY',
    slug: 'bicubik-photography',
    lead: 'Mateo Soto / Equipo Bicubik',
    location: 'Quito, Ecuador',
    country: 'Ecuador',
    foundedYear: '2015',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    headline: 'Fotografía arquitectónica contemporánea, luz cenital y geometría andina.',
    description:
      'Bicubik Photography es uno de los estudios pioneros en la documentación rigurosa de arquitectura contemporánea en el Ecuador. Su práctica se concentra en la interacción entre la potente radiación solar andina, la materialidad desnuda (hormigón visto, madera laminada, perfiles de acero) y la escala de los cuerpos que habitan el espacio. Sus registros visuales han sido portada y catálogo en publicaciones globales como ArchDaily, Dezeen, Domus, Casabella y El Croquis.',
    philosophy:
      'La fotografía de arquitectura no es un mero inventario físico de muros; es una traducción sensorial del espacio que capta la atmósfera, el silencio y la tensión exacta entre la luz ecuatorial y la sombra.',
    focus: [
      'Documentación de Arquitectura Contemporánea',
      'Fotografía Aérea de Paisaje',
      'Registro de Texturas & Materialidad',
      'Cinematografía & Cortometrajes Espaciales',
    ],
    publications: [
      'ArchDaily Building of the Year Featured Partner',
      'Portada Dezeen Architecture Highlights',
      'Archivo Oficial Bienal Panamericana de Quito (BAQ)',
      'Publicaciones Monográficas El Croquis & Domus',
    ],
    contact: {
      website: 'https://www.bicubik.com',
      instagram: '@bicubik.photography',
      email: 'info@bicubik.com',
    },
  },

  'jag-studio': {
    id: 'jag-studio',
    name: 'JAG STUDIO',
    slug: 'jag-studio',
    lead: 'Juan Alberto Andrade & Cuqui Rodríguez',
    location: 'Guayaquil / Quito, Ecuador',
    country: 'Ecuador',
    foundedYear: '2016',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80',
    headline: 'Narrativa visual del paisaje edificado, sombra tropical y tectónica latinoamericana.',
    description:
      'JAG Studio es una firma reconocida internacionalmente por su aproximación poética y documental a la arquitectura latinoamericana. Fundada por Juan Alberto Andrade y Cuqui Rodríguez, su lente dialoga con la sombra del trópico litoral, la tierra cruda y la madera de reforestación. Su enfoque equilibra la precisión compositiva con la espontaneidad de la vida cotidiana que se desenvuelve dentro y alrededor de las obras.',
    philosophy:
      'Fotografiamos el hábitat vivo. Nos interesa el instante en que la arquitectura deja de ser un objeto aislado para fusionarse con el territorio y la comunidad que le da sentido.',
    focus: [
      'Fotografía Documental de Arquitectura',
      'Narrativa Audiovisual Espacial',
      'Libros y Monografías de Autor',
      'Arquitectura de Tierra y Madera',
    ],
    publications: [
      'Dezeen Awards Finalist Architectural Photography',
      'Selección Oficial Bienal de Venecia (Pabellones)',
      'Publicaciones en Arquitectura Viva y Casabella',
      'Archivo Nacional de Arquitectura del Ecuador',
    ],
    contact: {
      website: 'https://www.jagstudio.ec',
      instagram: '@jag_studio',
      email: 'studio@jagstudio.ec',
    },
  },

  'sebastian-crespo': {
    id: 'sebastian-crespo',
    name: 'SEBASTIÁN CRESPO',
    slug: 'sebastian-crespo',
    lead: 'Sebastián Crespo',
    location: 'Cuenca / Quito, Ecuador',
    country: 'Ecuador',
    foundedYear: '2011',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    headline: 'Espacio cívico, patrimonio edificado y rigor cromático en los Andes ecuatorianos.',
    description:
      'Sebastián Crespo es un fotógrafo y artista visual ecuatoriano con más de una década de experiencia documentando obras cívicas, equipamientos públicos y restauraciones patrimoniales en el Austro y el centro andino del Ecuador. Su técnica destaca por la fidelidad a los cielos limpios de alta montaña, el detalle de las fábricas de ladrillo y andesita y la escala urbana del espacio compartido.',
    philosophy:
      'El encuadre debe transmitir la dignidad constructiva del oficio y la relación honesta que el edificio entabla con el perfil montañoso del Ecuador.',
    focus: [
      'Fotografía de Patrimonio y Restauración',
      'Espacio Público y Equipamientos Cívicos',
      'Fotografía Nocturna y de Iluminación',
      'Ediciones Impresas & Catálogos Institucionales',
    ],
    publications: [
      'Premio Nacional de Fotografía Arquitectónica BAQ',
      'Catálogo Oficial de Áreas Históricas de Cuenca',
      'Publicaciones Monográficas de la Bienal Panamericana',
    ],
    contact: {
      website: 'https://www.sebastiancrespo.com',
      instagram: '@sebastiancrespofoto',
      email: 'contacto@sebastiancrespo.com',
    },
  },
};

/**
 * Normalizes a photographer name string into a key slug.
 */
export const normalizePhotographerToSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Loads all active photographer profiles, checking localStorage first, then photographers.json, then PHOTOGRAPHERS_REGISTRY.
 */
export const getAllPhotographerProfiles = (): PhotographerProfileData[] => {
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('ea_content_photographers');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (_) {}

  if (Array.isArray(initialPhotographersJson) && initialPhotographersJson.length > 0) {
    return initialPhotographersJson as PhotographerProfileData[];
  }

  return Object.values(PHOTOGRAPHERS_REGISTRY);
};

/**
 * Retrieves the photographer profile by name or id with fuzzy matching.
 * Checks live dynamic photographers first so any updates in CMS are reflected immediately.
 */
export const getPhotographerProfile = (photographerName: string): PhotographerProfileData => {
  const allPhotos = getAllPhotographerProfiles();
  if (!photographerName) {
    return allPhotos[0] || PHOTOGRAPHERS_REGISTRY['bicubik-photography'];
  }

  const slug = normalizePhotographerToSlug(photographerName);

  // 1. Exact match by slug or id
  const exact = allPhotos.find((p) => p.slug === slug || p.id === slug);
  if (exact) return exact;

  // 2. Exact match by uppercase normalized name
  const cleanName = photographerName.trim().toUpperCase();
  const nameMatch = allPhotos.find(
    (p) => p.name.trim().toUpperCase() === cleanName || normalizePhotographerToSlug(p.name) === slug
  );
  if (nameMatch) return nameMatch;

  // 3. Fuzzy match
  const fuzzy = allPhotos.find((p) => {
    const pSlug = p.slug || normalizePhotographerToSlug(p.name);
    return slug.includes(pSlug) || pSlug.includes(slug);
  });
  if (fuzzy) return fuzzy;

  // 4. Fallback static registry
  if (PHOTOGRAPHERS_REGISTRY[slug]) {
    return PHOTOGRAPHERS_REGISTRY[slug];
  }

  // 5. Dynamic fallback for any new photographer
  return {
    id: slug || 'fotografo-arquitectura',
    name: cleanName,
    slug: slug || 'fotografo-arquitectura',
    lead: cleanName,
    location: 'Ecuador',
    country: 'Ecuador',
    foundedYear: '2018',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    headline: `Documentación fotográfica de arquitectura y territorio en el Ecuador.`,
    description: `${cleanName} es un estudio y práctica de fotografía especializada en arquitectura contemporánea, paisaje y hábitat en el Ecuador. Su trabajo documenta la luz, la materia y la espacialidad de proyectos destacados a nivel nacional e internacional.`,
    philosophy:
      'Capturar la arquitectura en su diálogo más puro con la luz del lugar y la escala humana.',
    focus: ['Fotografía de Arquitectura', 'Documentación Espacial', 'Detalle Constructivo'],
    publications: ['Publicado en Archivo EcuadorianArch'],
    contact: {
      website: 'https://ecuadorianarch.org',
      instagram: `@${slug.replace(/-/g, '')}`,
    },
  };
};
