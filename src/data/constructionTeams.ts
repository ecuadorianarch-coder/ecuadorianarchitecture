import { getMasterBuilderByName } from './masterBuilders';

export interface ConstructionTeamMember {
  nombre: string;
  rol: string;
  oficio: string;
  especialidad?: string;
  comunidad?: string;
}

export interface ConstructionTeamData {
  projectId: string;
  projectTitle: string;
  location: string;
  year: string;
  maestroMayor: {
    nombre: string;
    rol: string;
    oficio: string;
    trayectoria?: string;
    reconocimiento?: string;
  };
  members: ConstructionTeamMember[];
  materialidadPrincipal: string;
  manifiestoManoObra: string;
}

export const CONSTRUCTION_TEAMS_DATABASE: Record<string, ConstructionTeamData> = {
  'espacio-para-hablar-con-dios-ssqj': {
    projectId: 'espacio-para-hablar-con-dios-ssqj',
    projectTitle: 'Espacio para Hablar con Dios',
    location: 'Rumipamba, Quito, Ecuador',
    year: '2024',
    maestroMayor: {
      nombre: 'Segundo Guanoluisa',
      rol: 'Maestro Mayor de Obra & Dirección Artesanal',
      oficio: 'Cantería andina, cimentaciones ciclópeas y replanteo de niveles',
      trayectoria: 'Más de 35 años de experiencia liderando cuadrillas de construcción tradicional en los valles interandinos de Pichincha y Cotopaxi.',
      reconocimiento: 'Coordinó la minga comunitaria y el levantamiento de los muros portantes de tierra y piedra.',
    },
    materialidadPrincipal: 'Adobe secado al sol, piedra local y madera estructural',
    manifiestoManoObra:
      'La arquitectura sagrada de Rumipamba no habría sido posible sin el saber ancestral de las manos comuneras. Honramos a los maestros artesanos que transformaron el barro y la piedra en un refugio espiritual para su propia comunidad.',
    members: [
      {
        nombre: 'Carlos Toapanta',
        rol: 'Maestro Albañil',
        oficio: 'Mampostería tradicional y aparejos de piedra vista',
        especialidad: 'Asentado de muros ciclópeos y morteros de cal apagada',
      },
      {
        nombre: 'Manuel Chasi',
        rol: 'Maestro Carpintero',
        oficio: 'Encofrados tradicionales y ensambles en madera bruta',
        especialidad: 'Vigas maestras de eucalipto y cubiertas a dos aguas',
      },
      {
        nombre: 'Fausto Pillajo',
        rol: 'Maestro Fierrero',
        oficio: 'Cimentaciones reforzadas y anclajes sismorresistentes',
        especialidad: 'Amarrado de hierro corrugado y zapatas corridas',
      },
      {
        nombre: 'Cuadrilla Comunitaria Rumipamba',
        rol: 'Mano de Obra Colectiva / Minga',
        oficio: 'Acarreo de piedra de río, pisado de barro y revoques naturales',
        comunidad: 'Comuna de Rumipamba',
      },
    ],
  },

  atrium: {
    projectId: 'atrium',
    projectTitle: 'Edificio Atrium',
    location: 'Quito, Ecuador',
    year: '2024',
    maestroMayor: {
      nombre: 'Luis Toapanta',
      rol: 'Maestro Mayor de Obra General',
      oficio: 'Estructuras de hormigón armado visto y coordinación de subcontratos',
      trayectoria: '28 años de trayectoria en obras de gran escala y complejidad técnica en el Distrito Metropolitano de Quito.',
      reconocimiento: 'Lideró la modulación de encofrados fenolíticos y el vaciado continuo del atrio central.',
    },
    materialidadPrincipal: 'Hormigón armado visto y acero laminado',
    manifiestoManoObra:
      'La precisión milimétrica del hormigón visto en Atrium es el resultado del rigor artesanal de los maestros encofradores y fierreros ecuatorianos, cuyo trabajo manual define la textura y honestidad tectónica de la obra.',
    members: [
      {
        nombre: 'Jorge Criollo',
        rol: 'Maestro Encofrador',
        oficio: 'Modulación de tableros fenólicos y desencofrado limpio',
        especialidad: 'Acabados arquitectónicos sin resanes',
      },
      {
        nombre: 'Carlos Morocho',
        rol: 'Maestro Fierrero',
        oficio: 'Doblado y armado de enfierrado sismorresistente',
        especialidad: 'Muros de corte y nudos de pórticos de alta densidad',
      },
      {
        nombre: 'Bolívar Tipán',
        rol: 'Maestro Metalmecánico',
        oficio: 'Montaje de perfiles metálicos y barandillas',
        especialidad: 'Soldadura de penetración completa en vigas compuestas',
      },
      {
        nombre: 'Edgar Suntasig',
        rol: 'Maestro de Instalaciones',
        oficio: 'Pases de losa e integración de ductos embebidos',
        especialidad: 'Redes hidrosanitarias y de ventilación pasiva',
      },
    ],
  },

  'casa-arboles': {
    projectId: 'casa-arboles',
    projectTitle: 'Casa entre Árboles',
    location: 'Puembo, Ecuador',
    year: '2023',
    maestroMayor: {
      nombre: 'Juan Carlos Tipán',
      rol: 'Maestro Mayor & Especialista en Tapial',
      oficio: 'Construcción con tierra compactada y técnicas vernáculas contemporáneas',
      trayectoria: 'Reconocido a nivel nacional por su dominio del apisonado de tapia pisada y estabilización de tierras locales.',
      reconocimiento: 'Supervisó la granulometría de suelos y la compactación neumática y manual de los muros portantes.',
    },
    materialidadPrincipal: 'Tapial de tierra cruda y eucalipto reciclado',
    manifiestoManoObra:
      'Construir con tierra exige una sensibilidad táctil que ninguna máquina reemplaza. Cada capa compactada en Casa entre Árboles lleva la fuerza y el ritmo de los maestros tapialeros andinos.',
    members: [
      {
        nombre: 'Segundo Pillajo',
        rol: 'Maestro Tapialero',
        oficio: 'Armado de encofrados deslizantes y apisonado rítmico',
        especialidad: 'Muros de 40 cm en tierra compactada',
      },
      {
        nombre: 'Marcelo Quishpe',
        rol: 'Maestro Carpintero',
        oficio: 'Cepillado y ensamble de vigas de eucalipto reciclado',
        especialidad: 'Uniones tradicionales de carpintería y clavijas de madera',
      },
      {
        nombre: 'Ramiro Chaluisa',
        rol: 'Maestro Albañil',
        oficio: 'Zócalos de piedra andesita y sobrecimientos',
        especialidad: 'Protección contra humedad por capilaridad',
      },
    ],
  },

  'plaza-teatro': {
    projectId: 'plaza-teatro',
    projectTitle: 'Plaza y Teatro',
    location: 'Cuenca, Ecuador',
    year: '2024',
    maestroMayor: {
      nombre: 'Bolívar Quizhpe',
      rol: 'Maestro Mayor de Obra & Cantería',
      oficio: 'Tallado tradicional de andesita y restauración patrimonial',
      trayectoria: 'Heredero de tres generaciones de picapedreros cuencanos en las canteras del Tomebamba.',
      reconocimiento: 'Coordinó el labrado a mano de miles de adoquines y piezas de graderío para el espacio público.',
    },
    materialidadPrincipal: 'Piedra andesita tallada y hormigón pigmentado',
    manifiestoManoObra:
      'El espacio público de Cuenca cobra vida a través de la destreza secular de sus canteros. Cada junta y desnivel fue trazado con la maestría de quienes conocen la dureza y nobleza de la andesita cuencana.',
    members: [
      {
        nombre: 'Wilson Guamán',
        rol: 'Maestro Cantero',
        oficio: 'Corte y labrado a cincel de piedra andesita',
        especialidad: 'Piezas monolíticas para bordillos y fuentes',
      },
      {
        nombre: 'Ángel Zhunio',
        rol: 'Maestro Albañil',
        oficio: 'Aparejo de pavimentos drenantes y graderíos',
        especialidad: 'Nivelación con pendientes de escorrentía natural',
      },
      {
        nombre: 'Jaime Pesántez',
        rol: 'Maestro Carpintero',
        oficio: 'Mobiliario urbano de madera y pasamanos',
        especialidad: 'Maderas duras tratadas para intemperie',
      },
    ],
  },

  'casa-loma': {
    projectId: 'casa-loma',
    projectTitle: 'Casa Loma',
    location: 'Tumbaco, Ecuador',
    year: '2024',
    maestroMayor: {
      nombre: 'Carlos Morocho',
      rol: 'Maestro Mayor & Montaje en Topografía Difícil',
      oficio: 'Montaje de estructuras en pendientes de 45° y zapatas aisladas',
      trayectoria: 'Especialista en resolver obras complejas de ladera en las quebradas y colinas de Tumbaco.',
      reconocimiento: 'Dirigió el izaje manual y apernado en seco de la estructura de madera laminada.',
    },
    materialidadPrincipal: 'Madera laminada encolada y micropilotes de acero',
    manifiestoManoObra:
      'El respeto al terreno escarpado requirió un trabajo quirúrgico sin maquinaria pesada. Los maestros cargaron y ensamblaron cada pieza en suspensión con precisión y valentía.',
    members: [
      {
        nombre: 'David Criollo',
        rol: 'Maestro Carpintero',
        oficio: 'Montaje de pórticos de madera laminada y rigidizadores',
        especialidad: 'Tolerancias milimétricas en uniones apernadas',
      },
      {
        nombre: 'Mario Toapanta',
        rol: 'Maestro Albañil',
        oficio: 'Excavación manual de zapatas y anclajes a roca firme',
        especialidad: 'Muros de contención en gaviones de piedra de río',
      },
      {
        nombre: 'Pedro Suntasig',
        rol: 'Maestro de Acabados',
        oficio: 'Cubiertas ligeras ventiladas e impermeabilización',
        especialidad: 'Aislamiento térmico con fibras vegetales',
      },
    ],
  },

  'museo-precolombino': {
    projectId: 'museo-precolombino',
    projectTitle: 'Museo Precolombino',
    location: 'Guayaquil, Ecuador',
    year: '2022',
    maestroMayor: {
      nombre: 'Edison Mero',
      rol: 'Maestro Mayor de Obra Costera',
      oficio: 'Hormigones masivos en ambiente salino y cimentaciones sobre fango',
      trayectoria: '30 años ejecutando obras de infraestructura y equipamiento cultural en el litoral ecuatoriano.',
      reconocimiento: 'Supervisó la adición de puzolanas locales y el curado húmedo contra el clima tropical húmedo.',
    },
    materialidadPrincipal: 'Hormigón ciclópeo visto y madera de teca',
    manifiestoManoObra:
      'En la cuenca del Guayas, construir exige vencer al salitre y la marea. La solidez de los muros del museo es un homenaje a las cuadrillas que trabajaron bajo el sol ecuatorial.',
    members: [
      {
        nombre: 'Jacinto Solórzano',
        rol: 'Maestro Encofrador',
        oficio: 'Encofrados fenólicos estancos y desencofrado con desmoldantes ecológicos',
        especialidad: 'Texturas desbastadas y peinadas',
      },
      {
        nombre: 'Walter Macías',
        rol: 'Maestro Fierrero',
        oficio: 'Colocación de recubrimientos marinos y separadores plásticos',
        especialidad: 'Protección catódica pasiva de armaduras',
      },
      {
        nombre: 'Carlos Álava',
        rol: 'Maestro Albañil',
        oficio: 'Revoques hidrófugos y zócalos de sacrificio',
        especialidad: 'Impermeabilizaciones integrales de cimientos',
      },
    ],
  },

  'pabellon-bosque': {
    projectId: 'pabellon-bosque',
    projectTitle: 'Pabellón del Bosque',
    location: 'Cotopaxi, Ecuador',
    year: '2024',
    maestroMayor: {
      nombre: 'Marco Chasi',
      rol: 'Maestro Mayor & Montaje de Alta Montaña',
      oficio: 'Estructuras ligeras en condiciones de páramo y frío extremo',
      trayectoria: 'Constructor de refugios andinos y obras bioclimáticas a más de 3.400 msnm.',
      reconocimiento: 'Lideró el ensamblaje en seco durante vientos y heladas del volcán Cotopaxi.',
    },
    materialidadPrincipal: 'Acero negro, vidrio insulado y piedra volcánica',
    manifiestoManoObra:
      'A los pies del volcán, el clima no da tregua. Los maestros soldadores y vidrieros trabajaron con frío glacial para lograr un pabellón que flota sobre el páramo sin alterar su flora.',
    members: [
      {
        nombre: 'Hernán Pillajo',
        rol: 'Maestro Soldador',
        oficio: 'Soldadura TIG y ensamblaje de perfiles tubulares estructurales',
        especialidad: 'Acabados en negro mate anticorrosivo',
      },
      {
        nombre: 'Víctor Guanoluisa',
        rol: 'Maestro Albañil',
        oficio: 'Asentado de piedra volcánica sin mortero visible',
        especialidad: 'Plataformas de apoyo sobre suelo volcánico permeable',
      },
      {
        nombre: 'Segundo Quishpe',
        rol: 'Maestro Vidriero',
        oficio: 'Instalación de paneles termopanel de doble acristalamiento',
        especialidad: 'Sellos herméticos contra vientos andinos',
      },
    ],
  },

  'centro-comunitario': {
    projectId: 'centro-comunitario',
    projectTitle: 'Centro Comunitario',
    location: 'Canoa, Manabí, Ecuador',
    year: '2023',
    maestroMayor: {
      nombre: 'Don Eloy Cedeño',
      rol: 'Maestro Mayor Tradicional del Bambú',
      oficio: 'Corte, curado con humo y selección de caña guadua angustifolia',
      trayectoria: 'Sabedor ancestral manabita con más de 45 años erigiendo estructuras palafíticas y cubiertas vernáculas.',
      reconocimiento: 'Instruyó a los jóvenes de la comunidad en el arte de la boca de pescado y las uniones con pasadores de madera.',
    },
    materialidadPrincipal: 'Caña guadua rolliza, madera de mangle y techo vegetal',
    manifiestoManoObra:
      'La caña guadua no se doblega si se conoce su fibra. Este centro es fruto del conocimiento manabita de pescadores y campesinos que demostraron que la arquitectura vegetal es sismorresistente y digna.',
    members: [
      {
        nombre: 'Washington Mero',
        rol: 'Maestro Guaduero',
        oficio: 'Vaciado de canutos con mortero y uniones sismorresistentes',
        especialidad: 'Ensambles de cartelas y espárragos roscados',
      },
      {
        nombre: 'Vicente Loor',
        rol: 'Maestro Carpintero Costero',
        oficio: 'Vigas maestras de madera y pisos entablados ventilados',
        especialidad: 'Ventilación cruzada pasiva para trópico húmedo',
      },
      {
        nombre: 'Cuadrilla de Pescadores de Canoa',
        rol: 'Mano de Obra Colectiva Comunal',
        oficio: 'Tejido vegetal de hojas de palma y levantamiento de tijerales',
        comunidad: 'Asociación de Pescadores Artesanales de Canoa',
      },
    ],
  },

  'casa-magnolia': {
    projectId: 'casa-magnolia',
    projectTitle: 'Casa Magnolia',
    location: 'Puembo, Ecuador',
    year: '2023',
    maestroMayor: {
      nombre: 'Manuel Quishpe',
      rol: 'Maestro Mayor de Obra Escultural',
      oficio: 'Hormigón blanco arquitectónico y encofrados geométricos curvos',
      trayectoria: '25 años de oficio especializado en proyectos residenciales de alta exigencia formal en Quito.',
      reconocimiento: 'Logró la curvatura monolítica que abraza el árbol de magnolia sin juntas visibles.',
    },
    materialidadPrincipal: 'Hormigón blanco visto y madera de cedro',
    manifiestoManoObra:
      'Hacer que el hormigón parezca una escultura fluida exige un trabajo de carpintería de moldes comparable a la ebanistería fina. Los maestros encofradores modelaron la madera milímetro a milímetro.',
    members: [
      {
        nombre: 'Fausto Criollo',
        rol: 'Maestro Encofrador Curvo',
        oficio: 'Trazado y curvado de tableros fenólicos con refuerzos radiales',
        especialidad: 'Superficies cilíndricas sin quiebres ni desniveles',
      },
      {
        nombre: 'Carlos Tipán',
        rol: 'Maestro Fierrero',
        oficio: 'Armado helicoidal de acero corrugado en voladizos',
        especialidad: 'Control de deflexiones y amarre continuo',
      },
      {
        nombre: 'Patricio Chaluisa',
        rol: 'Maestro Pulidor',
        oficio: 'Desbastado y sellado de pisos de hormigón continuo',
        especialidad: 'Acabados tersos al tacto con cuarzo blanco',
      },
    ],
  },

  'edificio-sensei': {
    projectId: 'edificio-sensei',
    projectTitle: 'Edificio Sensei',
    location: 'Quito, Ecuador',
    year: '2023',
    maestroMayor: {
      nombre: 'Ángel Criollo',
      rol: 'Maestro Mayor de Obra Integral',
      oficio: 'Estructuras mixtas de hormigón y pieles metálicas suspendidas',
      trayectoria: '26 años de liderazgo en edificaciones de uso mixto e ingeniería de fachadas en la capital.',
      reconocimiento: 'Coordinó la calibración de tensores y la fachada paramétrica curva.',
    },
    materialidadPrincipal: 'Hormigón visto y envolvente metálica curva',
    manifiestoManoObra:
      'La modernidad de la fachada de Sensei reposa sobre la maestría de soldadores y fierreros que aseguraron cada anclaje al milímetro en altura sobre la ciudad.',
    members: [
      {
        nombre: 'Washington Toapanta',
        rol: 'Maestro Fierrero',
        oficio: 'Armadura densa en pantallas de hormigón sismorresistente',
        especialidad: 'Nudos de confinamiento estructural de alta exigencia',
      },
      {
        nombre: 'Segundo Morocho',
        rol: 'Maestro Encofrador',
        oficio: 'Encofrados trepantes para muros perimetrales',
        especialidad: 'Vaciado vertical continuo a plomo perfecto',
      },
      {
        nombre: 'Jorge Quishpe',
        rol: 'Maestro Albañil',
        oficio: 'Mampostería ligera y aislamiento acústico interior',
        especialidad: 'Divisiones interiores y nivelación de losas',
      },
    ],
  },
};

/**
 * Fallback generator for any custom or dynamically created project
 */
export function getConstructionTeamForProject(project: any): ConstructionTeamData {
  if (!project) {
    return {
      projectId: 'unknown',
      projectTitle: 'Proyecto Arquitectónico',
      location: 'Ecuador',
      year: '2026',
      maestroMayor: {
        nombre: 'Segundo Guanoluisa',
        rol: 'Maestro Mayor de Obra',
        oficio: 'Construcción tradicional andina y dirección de cuadrilla',
      },
      members: [],
      materialidadPrincipal: 'Materiales locales',
      manifiestoManoObra:
        'Reconocimiento a la mano de obra ecuatoriana y al saber de los maestros constructores que hacen posible la arquitectura.',
    };
  }

  const slug = project.slug || project.id || '';
  // If project has a full custom constructionTeam object:
  if (project.constructionTeam && project.constructionTeam.maestroMayor) {
    return {
      projectId: slug,
      projectTitle: project.title || 'Proyecto Arquitectónico',
      location: project.location || 'Ecuador',
      year: project.year || '2026',
      ...project.constructionTeam,
    };
  }

  // If registered static project
  if (CONSTRUCTION_TEAMS_DATABASE[slug]) {
    return CONSTRUCTION_TEAMS_DATABASE[slug];
  }

  // If project has custom maestroMayor in its data:
  const customMaestro = project.maestroMayor || project.datos?.maestroMayor || 'Segundo Guanoluisa';
  const customTeam = project.equipoTrabajo || project.datos?.equipoTrabajo;
  const builderProfile = getMasterBuilderByName(customMaestro);

  return {
    projectId: slug,
    projectTitle: project.title || 'Proyecto Arquitectónico',
    location: project.location || builderProfile?.location || 'Ecuador',
    year: project.year || '2026',
    maestroMayor: {
      nombre: builderProfile?.name || customMaestro,
      rol: builderProfile?.rol || 'Maestro Mayor de Obra',
      oficio: builderProfile?.oficio || project.datos?.estructura || 'Coordinación general de obra y replanteo de niveles',
      trayectoria: builderProfile?.trayectoria || 'Maestro constructor con amplia trayectoria en ejecución de obras tectónicas en el Ecuador.',
      reconocimiento: builderProfile?.reconocimiento || 'Lideró la cuadrilla de artesanos y constructores locales a cargo de la ejecución.',
    },
    members: Array.isArray(customTeam) && customTeam.length > 0
      ? customTeam
      : builderProfile?.defaultMembers && builderProfile.defaultMembers.length > 0
      ? builderProfile.defaultMembers
      : [
          {
            nombre: `${(builderProfile?.name || customMaestro).split(' ')[0] || 'Maestro'} y Cuadrilla Local`,
            rol: 'Maestros Albañiles & Fierreros',
            oficio: project.datos?.estructura || 'Mampostería, estructuras y acabados arquitectónicos',
          },
          {
            nombre: 'Mano de Obra Artesanal Ecuatoriana',
            rol: 'Cuadrilla de Construcción',
            oficio: 'Encofrados, carpintería tradicional y detalles en obra',
          },
        ],
    materialidadPrincipal: project.materialidadPrincipal || project.datos?.estructura || 'Materiales y técnicas locales',
    manifiestoManoObra:
      project.manifiestoManoObra ||
      'La arquitectura no existe sin las manos de quienes transforman la materia en espacio. Rendimos tributo al conocimiento técnico, la destreza manual y la dignidad de los maestros constructores del Ecuador.',
  };
}
