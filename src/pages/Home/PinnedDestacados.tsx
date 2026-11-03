import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { ImageCarouselLightbox, extractAllProjectImages } from '../../components/editorial/ImageCarouselLightbox';

gsap.registerPlugin(ScrollTrigger, useGSAP);
if (typeof window !== 'undefined') {
  (window as any).ScrollTrigger = ScrollTrigger;
}

interface PinnedDestacadosProps {
  onSelectProject?: (id: string) => void;
  activeTab?: 'proyectos' | 'academia' | 'territorios' | 'acerca';
  onTabChange?: (tab: 'proyectos' | 'academia' | 'territorios' | 'acerca') => void;
  onNavigateToCatalog?: () => void;
  onNavigateToSection?: (section: string) => void;
}

// Helper SVG Icons matching Figma neo-brutalist doodle style
const DoodlePinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11z" />
    <circle cx="12" cy="10" r="2.2" fill="currentColor" />
  </svg>
);

const DoodleDocIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

// University Logo Marks (PUCE, UG, UCUENCA, USFQ, UCE, ESPOL)
const UniversityLogoIcon: React.FC<{ university: string; className?: string }> = ({
  university,
  className = 'w-5 h-5 shrink-0',
}) => {
  switch (university) {
    case 'PUCE':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Central cross */}
          <path d="M14 2v24M2 14h24" />
          {/* Arrow tips */}
          <path d="M10 6l4-4 4 4M10 22l4 4 4-4M6 10l-4 4 4 4M22 10l4 4-4 4" strokeWidth="2.2" />
          {/* Outer corner chevrons */}
          <path d="M6 7h3v-3M22 7h-3v-3M6 21h3v3M22 21h-3v3" strokeWidth="1.8" />
        </svg>
      );
    case 'UG':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 7v7m-3-3.5h6" strokeWidth="2" />
        </svg>
      );
    case 'UCUENCA':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h16M6 20V9m4 11V9m4 11V9M3 9h18L12 4 3 9z" />
          <circle cx="12" cy="13" r="1.5" />
        </svg>
      );
    case 'USFQ':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4.1 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 'UCE':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          <path d="M12 7v14" />
        </svg>
      );
    case 'ESPOL':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="m14 10-4 4m0-4 4 4" strokeWidth="2" />
          <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
  }
};

// Sketched Doodle Tag Box (border matches university brand color)
const DoodleTagBox: React.FC<{
  children: React.ReactNode;
  color?: string;
  className?: string;
}> = ({ children, color = 'currentColor', className = '' }) => (
  <div className={`relative inline-flex items-center justify-center px-2.5 sm:px-3 py-0.5 ${className}`}>
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 100 36"
    >
      <path
        d="M 1.5,4.5 Q 48,2 98.5,3.5 M 96.5,1.5 Q 98,18 96.5,34.5 M 98.5,33 Q 52,34.5 1.5,33.5 M 3.5,35 Q 2,18 3,1.5"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div style={{ color }}>{children}</div>
  </div>
);

// Sketched Doodle Year Box (architectural doodle container)
const DoodleYearBox: React.FC<{
  year: string;
  className?: string;
}> = ({ year, className = '' }) => (
  <div className={`relative flex items-center h-6 sm:h-7 w-full max-w-[280px] px-2 ${className}`}>
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 200 28"
    >
      <path
        d="M 1,3.5 Q 100,1.5 198.5,2.5 M 197,1 Q 198.5,14 197,27 M 199,26 Q 98,27.5 1.5,25.5 M 2.5,27.5 Q 1.5,14 2,1"
        fill="none"
        stroke="#000000"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-creato text-xs sm:text-[13px] font-bold text-ea-black select-none tracking-wider">
      {year}
    </span>
  </div>
);

// Exactly 6 authentic architectural projects with legible, human-edited excerpts
const PROYECTOS_DATA = [
  {
    id: 'edificio-sensei',
    title: 'EDIFICIO SENSEI',
    studio: 'DANIEL MORENO FLORES',
    location: 'QUITO',
    category: 'EDIFICIO DE USO MIXTO',
    excerpt: 'La firma Uribe Schwarzkopf anunció el arranque de un nuevo proyecto, llamado Qondesa, que se levantará en las avenidas Naciones Unidas y Amazonas. Según un comunicado de prensa, el proyecto se encargó a MAD Architects. Será la primera incursión de esta firma en Sudamérica, “a través de una arquitectura contemporánea con estilo y espíritu propio, que dará una experiencia futurista en movimiento, donde sus elementos trascenderán más allá de lo imaginable”.',
    imageUrl: '/images/edificio_sensei.png',
  },
  {
    id: 'atrium',
    title: 'EDIFICIO ATRIUM',
    studio: 'RAMA ESTUDIO',
    location: 'QUITO',
    category: 'EDIFICACIÓN COLECTIVA',
    excerpt: 'El Edificio Atrium explora las posibilidades del vacío como articulador social. En lugar de densificar hacia el perímetro, el proyecto vacía su centro para generar un microclima andino que aprovecha la radiación solar directa y la ventilación cruzada natural.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'casa-arboles',
    title: 'CASA ENTRE ÁRBOLES',
    studio: 'AL BORDE ARQUITECTOS',
    location: 'PUEMBO',
    category: 'VIVIENDA UNIFAMILIAR',
    excerpt: 'Una casa que no tala ningún árbol preexistente. Se teje entre los troncos de algarrobos nativos mediante una estructura ligera de madera y muros portantes de tapial compactado con tierra del propio terreno sin alterar las escorrentías naturales.',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'plaza-teatro',
    title: 'PLAZA Y TEATRO',
    studio: 'DIEGO GUAYASAMÍN',
    location: 'CUENCA',
    category: 'ESPACIO PÚBLICO',
    excerpt: 'Rehabilitación integral del centro histórico mediante una secuencia de plataformas y terrazas abiertas que articulan el teatro experimental con la plaza vecinal, dinamizando la vida peatonal y la memoria urbana.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'museo-precolombino',
    title: 'MUSEO PRECOLOMBINO',
    studio: 'LUIS LÓPEZ LÓPEZ',
    location: 'GUAYAQUIL',
    category: 'EQUIPAMIENTO CULTURAL',
    excerpt: 'Hormigón visto pigmentado y control climático pasivo en el trópico costero. Una celosía permeable filtra la luz ecuatorial y disipa el calor marino, creando un microclima sombrío para custodiar piezas arqueológicas milenarias.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pabellon-bosque',
    title: 'PABELLÓN DEL BOSQUE',
    studio: 'ESTUDIO FELIPE ESCUDERO',
    location: 'PICHINCHA',
    category: 'PABELLÓN & PAISAJE',
    excerpt: 'Refugio de alta montaña integrado al páramo mediante perfiles de acero negro y planos vidriados de alta inercia térmica. La cubierta ajardinada devuelve al paisaje la huella exacta de su ocupación territorial.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  },
];

const TERRITORIOS_DATA = [
  {
    id: 'ciudad-rio',
    title: 'CIUDAD Y RÍO',
    studio: 'INVESTIGACIÓN URBANA',
    location: 'GUAYAS',
    category: 'PAISAJE & LITORAL',
    excerpt: 'El impacto de las mareas y la infraestructura hidráulica en la forma urbana. Un recorrido crítico por los esteros y muelles del Gran Guayaquil analizando la relación entre agua y asentamientos populares.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cartografia-viva',
    title: 'CARTOGRAFÍA VIVA',
    studio: 'MAPEO TERRITORIAL',
    location: 'SIERRA CENTRAL',
    category: 'HUELLA PREHISPÁNICA',
    excerpt: 'Paisajes agrícolas y huellas prehispánicas en el callejón interandino. La persistencia de acequias, terrazas y caminos ancestrales en las faldas del Tungurahua.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'amazonia-enclave',
    title: 'AMAZONÍA Y ENCLAVE',
    studio: 'ESTUDIO ECOLÓGICO',
    location: 'CORDILLERA ORIENTAL',
    category: 'FRONTERA EXTRACTIVA',
    excerpt: 'Transformaciones territoriales ante las vías de extracción y asentamientos nativos. Cartografía de la deforestación y la resiliencia de la arquitectura comunitaria en madera y paja toquilla.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cuencas-sur',
    title: 'CUENCAS DEL SUR',
    studio: 'COLECTIVO PAISAJE',
    location: 'AUSTRO / AZUAY',
    category: 'INFRAESTRUCTURA HÍDRICA',
    excerpt: 'Represión hidroeléctrica y transformación del paisaje fluvial interandino. Análisis del cauce modificado del río Paute y su impacto sobre la agricultura y el poblamiento andino.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fronteras-ilalo',
    title: 'FRONTERAS URBANAS',
    studio: 'OBSERVATORIO METROPOLITANO',
    location: 'VALLE DE TUMBÁCO',
    category: 'EXPANSIÓN INMOBILIARIA',
    excerpt: 'Presión inmobiliaria sobre el paisaje volcánico del Ilaló y quebradas interandinas. Dinámicas de fricción entre bosque nativo, comunidades comuneras y condominios cerrados.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'corredor-choco',
    title: 'CORREDOR DEL CHOCÓ',
    studio: 'BIORREGIÓN ANDINA',
    location: 'COSTA NORTE',
    category: 'RESERVA BIOCLIMÁTICA',
    excerpt: 'Deforestación, vías secundarias y resistencia comunitaria en el bosque húmedo del Chocó andino. Estrategias de conservación y arquitectura vernácula con caña guadua y techumbres vegetales.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  },
];

const ACADEMIA_DATA = [
  {
    id: 'edificio-sensei-academia',
    title: 'EDIFICIO SENSEI',
    university: 'PUCE',
    universityFullName: 'PUCE FADA QUITO',
    universityColor: '#2AA5DC',
    sectionType: 'TESIS',
    student: 'JUAN JOSE ROSALES',
    professor: 'JULIAN ZID',
    year: '2023',
    excerpt: 'La firma Uribe Schwarzkopf anunció el arranque de un nuevo proyecto, llamado Qondesa, que se levantará en las avenidas Naciones Unidas y Amazonas. Según un comunicado de prensa, el proyecto se encargó a MAD Architects. Será la primera incursión de esta firma en Sudamérica, “a través de una arquitectura contemporánea con estilo y espíritu propio, que dará una experiencia futurista en movimiento, donde sus elementos trascenderán más allá de lo imaginable”.',
    imageUrl: '/images/edificio_sensei.png',
  },
  {
    id: 'vulnerabilidad-sismica',
    title: 'VULNERABILIDAD SÍSMICA',
    university: 'UG',
    universityFullName: 'FACULTAD ARQ. UG',
    universityColor: '#12519A',
    sectionType: 'ESTUDIOS',
    student: 'CARLOS ALVARADO MENDOZA',
    professor: 'ING. ROBERTO VITERI',
    year: '2024',
    excerpt: 'Estudio estructural y materialidad del bambú en zonas costeras ecuatorianas. Ensayos de laboratorio sobre uniones apernadas y resistencia ante sismos en edificaciones de interés social.',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'borde-urbano',
    title: 'BORDE URBANO',
    university: 'PUCE',
    universityFullName: 'PUCE FADA QUITO',
    universityColor: '#2AA5DC',
    sectionType: 'TESIS',
    student: 'VALERIA ESPINOSA PAREDES',
    professor: 'ARQ. SEBASTIÁN CALERO',
    year: '2023',
    excerpt: 'Cartografía de asentamientos espontáneos y fricción ecológica en las laderas del volcán Pichincha. Diagnóstico morfológico y propuestas de contención paisajística para evitar deslaves.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'arquitectura-vernacula',
    title: 'ARQUITECTURA VERNÁCULA',
    university: 'UCUENCA',
    universityFullName: 'UNIVERSIDAD DE CUENCA',
    universityColor: '#8C1B1B',
    sectionType: 'ARTÍCULOS',
    student: 'ESTEBAN CORDERO VEGA',
    professor: 'DRA. MARÍA AUGUSTA HERMIDA',
    year: '2024',
    excerpt: 'Sistemas constructivos tradicionales y memoria oral en el austro ecuatoriano. Registro etnográfico de maestros de obra en tapial, adobe y bahareque para su preservación normativa.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'habitabilidad-rural',
    title: 'HABITABILIDAD RURAL',
    university: 'USFQ',
    universityFullName: 'USFQ COLEGIO DE ARQUITECTURA',
    universityColor: '#BF1522',
    sectionType: 'TESIS',
    student: 'MATEO BARRAGÁN CISNEROS',
    professor: 'ARQ. FELIPE PALACIOS',
    year: '2023',
    excerpt: 'Prototipos modulares de madera y paja para comunidades de alta montaña. Monitoreo bioclimático del confort térmico y la inercia del suelo en viviendas comunales de páramo.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'patrimonio-colonial',
    title: 'PATRIMONIO HISTÓRICO',
    university: 'UCE',
    universityFullName: 'UNIV. CENTRAL DEL ECUADOR',
    universityColor: '#004380',
    sectionType: 'INVESTIGACIÓN',
    student: 'ANDREA GUERRERO MORA',
    professor: 'ARQ. DIEGO HURTADO',
    year: '2022',
    excerpt: 'Inventario de casonas de tierra y estrategias de consolidación antisísmica. Metodologías no destructivas para la recuperación del patrimonio edificado en centros urbanos protegidos.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'infraestructura-humedales',
    title: 'INFRAESTRUCTURA Y AGUA',
    university: 'ESPOL',
    universityFullName: 'ESPOL FICT GUAYAQUIL',
    universityColor: '#005F9E',
    sectionType: 'ESTUDIOS',
    student: 'GABRIEL MONCAYO FREIRE',
    professor: 'ING. PATRICIO CEVALLOS',
    year: '2024',
    excerpt: 'Modelación hidrodinámica del impacto de inundaciones estacionales y sistemas palafíticos contemporáneos. Diseño resiliente para equipamientos públicos en zonas inundables del delta.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
];

export const PinnedDestacados: React.FC<PinnedDestacadosProps> = ({
  onSelectProject,
  activeTab: controlledTab,
  onTabChange,
  onNavigateToCatalog,
  onNavigateToSection,
}) => {
  const [currentScene, setCurrentScene] = useState<'proyectos' | 'territorios' | 'academia'>('proyectos');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [clickedCardId, setClickedCardId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fullscreen Architectural Image Carousel Lightbox State
  const { projects } = useContent();
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);
  const [lightboxProjectTitle, setLightboxProjectTitle] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleOpenPhotoCarousel = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const fullProj = projects.find((p) => p.id === item.id) || {
      ...item,
      heroImage: item.imageUrl,
    };
    const imgs = extractAllProjectImages(fullProj);
    setLightboxImages(imgs);
    setLightboxProjectTitle(fullProj.title || item.title);
    setIsLightboxOpen(true);
  };

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const proyCarouselRef = useRef<HTMLDivElement>(null);
  const terrCarouselRef = useRef<HTMLDivElement>(null);
  const acadCarouselRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);

  // Black Cinematic Shutter refs
  const shutterRef = useRef<HTMLDivElement>(null);
  const apertureRef = useRef<HTMLDivElement>(null);
  const shutterBadgeRef = useRef<HTMLSpanElement>(null);
  const shutterTitleRef = useRef<HTMLHeadingElement>(null);
  const shutterDescRef = useRef<HTMLParagraphElement>(null);
  const shutterLineRef = useRef<HTMLDivElement>(null);

  // Helper to obtain the active carousel container
  const getActiveCarousel = () => {
    if (currentScene === 'proyectos') return proyCarouselRef.current;
    if (currentScene === 'territorios') return terrCarouselRef.current;
    if (currentScene === 'academia') return acadCarouselRef.current;
    return null;
  };

  // =========================================================================
  // DYNAMIC GRAVITATIONAL PHYSICS FOR CAROUSEL CARDS
  // =========================================================================
  const updateCarouselPhysics = useCallback((containerOverride?: HTMLDivElement | null) => {
    const container = containerOverride || getActiveCarousel();
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>('.ea-destacado-card');
    if (!cards.length) return;

    const containerRect = container.getBoundingClientRect();
    const activeZoneLeft = containerRect.left + (window.innerWidth < 640 ? 24 : 56);

    cards.forEach((card) => {
      // Don't interfere if card is currently actively hovered with mouse tilt
      if (card.classList.contains('is-hovered')) return;

      const cardRect = card.getBoundingClientRect();
      const offset = cardRect.left - activeZoneLeft;

      if (offset < -60) {
        // 1. CARDS BEHIND: FALL DOWN WITH PHYSICAL GRAVITY AND TILT
        // As the card gets pushed left past the spotlight, it drops down and leans onto the ground
        const progress = Math.min(1, Math.abs(offset + 60) / 450);
        const dropY = gsap.utils.interpolate(12, 54, progress);
        const tiltZ = gsap.utils.interpolate(-1.5, -7.5, progress);
        const tiltX = gsap.utils.interpolate(3, 14, progress);
        const cardScale = gsap.utils.interpolate(1, 0.96, progress);

        gsap.to(card, {
          y: dropY,
          rotateZ: tiltZ,
          rotateX: tiltX,
          scale: cardScale,
          transformOrigin: 'bottom left',
          opacity: 1, // NO SE DESVANECE - 100% Sólido físico
          boxShadow: '3px 8px 0px rgba(0,0,0,0.85)',
          duration: 0.35,
          ease: 'power1.out',
          overwrite: 'auto',
        });
      } else if (offset >= -60 && offset <= 260) {
        // 2. ACTIVE CARD IN SPOTLIGHT: STANDS TALL, UPRIGHT, ELEVATED
        gsap.to(card, {
          y: 0,
          rotateZ: 0,
          rotateX: 0,
          scale: 1.02,
          transformOrigin: 'center center',
          opacity: 1,
          boxShadow: '4px 4px 0px #000',
          duration: 0.45,
          ease: 'back.out(1.15)', // Settle físico suave al asentarse
          overwrite: 'auto',
        });
      } else {
        // 3. UPCOMING CARDS: LEANING SLIGHTLY INTO VIEW
        const progress = Math.min(1, (offset - 260) / 550);
        const aheadY = gsap.utils.interpolate(4, 16, progress);
        const aheadTiltZ = gsap.utils.interpolate(0.5, 2.5, progress);
        const aheadScale = gsap.utils.interpolate(1, 0.98, progress);

        gsap.to(card, {
          y: aheadY,
          rotateZ: aheadTiltZ,
          rotateX: 0,
          scale: aheadScale,
          transformOrigin: 'bottom center',
          opacity: 1,
          boxShadow: '3px 3px 0px rgba(0,0,0,0.65)',
          duration: 0.35,
          ease: 'power1.out',
          overwrite: 'auto',
        });
      }
    });
  }, [currentScene]);

  // Synchronize active carousel scroll state and trigger continuous physics
  const handleActiveScroll = () => {
    const container = getActiveCarousel();
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 15);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 15);
    updateCarouselPhysics(container);
  };

  useEffect(() => {
    // Reset carousel position and evaluate arrows on scene change
    const container = getActiveCarousel();
    if (container) {
      container.scrollLeft = 0;
      updateCarouselPhysics(container);
    }
    handleActiveScroll();
  }, [currentScene, updateCarouselPhysics]);

  const handleScrollCarousel = useCallback((direction: 'left' | 'right') => {
    const container = getActiveCarousel();
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>('.ea-destacado-card'));
    const currentScroll = container.scrollLeft;
    const paddingOffset = window.innerWidth < 640 ? 24 : 48;

    let targetCard: HTMLElement | undefined;
    if (direction === 'right') {
      targetCard = cards.find((c) => (c.offsetLeft - paddingOffset) > currentScroll + 20);
    } else {
      const prevCards = cards.filter((c) => (c.offsetLeft - paddingOffset) < currentScroll - 20);
      targetCard = prevCards[prevCards.length - 1];
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    const targetLeft = targetCard
      ? Math.max(0, Math.min(targetCard.offsetLeft - paddingOffset, maxScroll))
      : direction === 'right'
      ? maxScroll
      : 0;

    // Physical gravity drop impulse on the card about to be left behind
    if (direction === 'right') {
      const leavingCard = cards.find(
        (c) => Math.abs((c.offsetLeft - paddingOffset) - currentScroll) < 120
      );
      if (leavingCard) {
        gsap.to(leavingCard, {
          y: 54,
          rotateZ: -7.5,
          rotateX: 12,
          scale: 0.96,
          transformOrigin: 'bottom left',
          boxShadow: '3px 8px 0px rgba(0,0,0,0.85)',
          duration: 0.6,
          ease: 'power2.in', // Aceleración de gravedad real
        });
      }
    }

    if (scrollTweenRef.current) {
      scrollTweenRef.current.kill();
    }

    const scrollProxy = { x: container.scrollLeft };
    scrollTweenRef.current = gsap.to(scrollProxy, {
      x: targetLeft,
      duration: 0.75,
      ease: 'power2.out',
      onUpdate: () => {
        container.scrollLeft = scrollProxy.x;
        updateCarouselPhysics(container);
      },
      onComplete: () => {
        handleActiveScroll();
        updateCarouselPhysics(container);
      },
    });
  }, [updateCarouselPhysics]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleScrollCarousel('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleScrollCarousel('left');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScrollCarousel]);

  useEffect(() => {
    if (controlledTab && (controlledTab === 'proyectos' || controlledTab === 'territorios' || controlledTab === 'academia')) {
      setCurrentScene(controlledTab);
    }
  }, [controlledTab]);

  useEffect(() => {
    const handleCustomScene = (e: any) => {
      if (e.detail && (e.detail === 'proyectos' || e.detail === 'territorios' || e.detail === 'academia')) {
        handleTabClick(e.detail);
      }
    };
    window.addEventListener('ea-change-scene', handleCustomScene);
    return () => window.removeEventListener('ea-change-scene', handleCustomScene);
  }, []);

  const handleTabClick = (tab: 'proyectos' | 'territorios' | 'academia') => {
    setCurrentScene(tab);
    if (onTabChange) onTabChange(tab);

    const st = scrollTriggerRef.current;
    if (st) {
      // Direct smooth navigation to chapter plateau
      const targetProgress = tab === 'proyectos' ? 0.05 : tab === 'territorios' ? 0.48 : 0.88;
      const targetScroll = st.start + (st.end - st.start) * targetProgress;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  // =========================================================================
  // RESPONSIVE PINNED TIMELINE: FAST 1-SCROLL TRANSITION
  // =========================================================================
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        if (!sectionRef.current || !stageRef.current) return;

        const masterTl = gsap.timeline();

        const proyCards = gsap.utils.toArray<HTMLElement>('.card-proy');
        const terrCards = gsap.utils.toArray<HTMLElement>('.card-terr');
        const acadCards = gsap.utils.toArray<HTMLElement>('.card-acad');

        // 1. ALL PROJECTS ARE DIRECTLY VISIBLE AND READY ON ARRIVAL
        gsap.set(proyCards, { y: 0, x: 0, rotation: 0, opacity: 1, scale: 1 });
        gsap.set('.layer-proy', { opacity: 1, pointerEvents: 'auto' });
        gsap.set('.layer-terr', { opacity: 0, pointerEvents: 'none' });
        gsap.set('.layer-acad', { opacity: 0, pointerEvents: 'none' });

        gsap.set(terrCards, { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0, pointerEvents: 'none' });
        gsap.set(acadCards, { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0, pointerEvents: 'none' });

        gsap.set('.destacados-scroll-arrow-right', { opacity: 1, scale: 1, x: 0 });
        gsap.set('.destacados-scroll-arrow-left', { opacity: 0, scale: 0.7, x: -10 });
        gsap.set('.destacados-action-bar', { y: 0, opacity: 1 });

        // Initial shutter state
        if (shutterRef.current) gsap.set(shutterRef.current, { autoAlpha: 0 });
        if (apertureRef.current) gsap.set(apertureRef.current, { scaleY: 0, yPercent: 0, transformOrigin: 'top center' });
        const shutterTexts = [shutterBadgeRef.current, shutterTitleRef.current, shutterDescRef.current].filter(Boolean);
        if (shutterTexts.length) gsap.set(shutterTexts, { opacity: 0, y: 15 });
        if (shutterLineRef.current) gsap.set(shutterLineRef.current, { opacity: 0, scaleX: 0 });

        // CHAPTER 1: PROYECTOS (Tight plateau - transition starts on first decisive scroll!)
        masterTl.to({}, { duration: 0.35 }, 0);

        // Hide arrows softly right before the transition
        masterTl.to(['.destacados-scroll-arrow-right', '.destacados-scroll-arrow-left'], { opacity: 0, duration: 0.1 }, 0.28);

        // =====================================================================
        // CINEMATIC TRANSITION 1: PROYECTOS -> TERRITORIOS (0.35s -> 1.38s)
        // =====================================================================
        if (shutterRef.current && apertureRef.current) {
          masterTl.set(shutterRef.current, { autoAlpha: 1 }, 0.35);
          masterTl.to(apertureRef.current, { scaleY: 1, duration: 0.38, ease: 'power3.inOut' }, 0.35);
        }

        masterTl.call(() => {
          if (shutterBadgeRef.current) shutterBadgeRef.current.innerText = 'TRANSICIÓN CINEMATOGRÁFICA • CAPÍTULO 02';
          if (shutterTitleRef.current) shutterTitleRef.current.innerText = 'TERRITORIOS';
          if (shutterDescRef.current) shutterDescRef.current.innerText = 'CARTOGRAFÍAS, CUENCAS Y DINÁMICAS DEL PAISAJE ANDINO Y COSTERO';
        }, undefined, 0.48);

        if (shutterTexts.length) masterTl.to(shutterTexts, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.5);
        if (shutterLineRef.current) masterTl.to(shutterLineRef.current, { scaleX: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.5);

        // Page swap behind curtain
        masterTl.set('.layer-proy', { opacity: 0, pointerEvents: 'none' }, 0.72);
        masterTl.set('.layer-terr', { opacity: 1, pointerEvents: 'auto' }, 0.72);
        masterTl.set(terrCards, { pointerEvents: 'auto' }, 0.72);

        // Shutter text fades out
        if (shutterTexts.length) masterTl.to(shutterTexts, { opacity: 0, y: -10, duration: 0.18, ease: 'power2.in' }, 0.88);
        if (shutterLineRef.current) masterTl.to(shutterLineRef.current, { opacity: 0, duration: 0.18 }, 0.88);

        // Aperture wipes away upwards
        if (shutterRef.current && apertureRef.current) {
          masterTl.to(apertureRef.current, { yPercent: -100, duration: 0.38, ease: 'power3.inOut' }, 0.98);
          masterTl.set(shutterRef.current, { autoAlpha: 0 }, 1.38);
          masterTl.set(apertureRef.current, { yPercent: 0, scaleY: 0, transformOrigin: 'top center' }, 1.38);
        }

        // Reading plateau 2 (Territorios - ready directly on reveal!)
        masterTl.to('.destacados-scroll-arrow-right', { opacity: 1, duration: 0.15 }, 1.38);
        masterTl.to({}, { duration: 0.85 }, 1.38);

        // Hide arrows softly right before transition 2
        masterTl.to(['.destacados-scroll-arrow-right', '.destacados-scroll-arrow-left'], { opacity: 0, duration: 0.1 }, 2.15);

        // =====================================================================
        // CINEMATIC TRANSITION 2: TERRITORIOS -> ACADEMIA (2.23s -> 3.26s)
        // =====================================================================
        if (shutterRef.current && apertureRef.current) {
          masterTl.set(shutterRef.current, { autoAlpha: 1 }, 2.23);
          masterTl.to(apertureRef.current, { scaleY: 1, duration: 0.38, ease: 'power3.inOut' }, 2.23);
        }

        masterTl.call(() => {
          if (shutterBadgeRef.current) shutterBadgeRef.current.innerText = 'TRANSICIÓN CINEMATOGRÁFICA • CAPÍTULO 03';
          if (shutterTitleRef.current) shutterTitleRef.current.innerText = 'ACADEMIA';
          if (shutterDescRef.current) shutterDescRef.current.innerText = 'INVESTIGACIÓN, VULNERABILIDAD SÍSMICA Y MATERIALIDAD VERNÁCULA';
        }, undefined, 2.36);

        if (shutterTexts.length) masterTl.to(shutterTexts, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 2.38);
        if (shutterLineRef.current) masterTl.to(shutterLineRef.current, { scaleX: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }, 2.38);

        // Page swap behind curtain
        masterTl.set('.layer-terr', { opacity: 0, pointerEvents: 'none' }, 2.6);
        masterTl.set('.layer-acad', { opacity: 1, pointerEvents: 'auto' }, 2.6);
        masterTl.set(acadCards, { pointerEvents: 'auto' }, 2.6);

        // Shutter text fades out
        if (shutterTexts.length) masterTl.to(shutterTexts, { opacity: 0, y: -10, duration: 0.18, ease: 'power2.in' }, 2.76);
        if (shutterLineRef.current) masterTl.to(shutterLineRef.current, { opacity: 0, duration: 0.18 }, 2.76);

        // Aperture wipes away upwards
        if (shutterRef.current && apertureRef.current) {
          masterTl.to(apertureRef.current, { yPercent: -100, duration: 0.38, ease: 'power3.inOut' }, 2.86);
          masterTl.set(shutterRef.current, { autoAlpha: 0 }, 3.26);
          masterTl.set(apertureRef.current, { yPercent: 0, scaleY: 0, transformOrigin: 'top center' }, 3.26);
        }

        // Reading plateau 3 (Academia - ready directly on reveal!)
        masterTl.to('.destacados-scroll-arrow-right', { opacity: 1, duration: 0.15 }, 3.26);
        masterTl.to({}, { duration: 0.85 }, 3.26);

        // TIGHT RESPONSIVE PINNED SCROLL: 1-SCROLL TRANSITIONS (end: '+=1250')
        const st = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=1250',
          pin: true,
          anticipatePin: 1,
          animation: masterTl,
          scrub: 0.45,
          onUpdate: (self) => {
            const p = self.progress;
            let targetScene: 'proyectos' | 'territorios' | 'academia' = 'proyectos';
            if (p >= 0.68) {
              targetScene = 'academia';
            } else if (p >= 0.28) {
              targetScene = 'territorios';
            }

            setCurrentScene((prev) => {
              if (prev !== targetScene) {
                if (onTabChange) onTabChange(targetScene);
                return targetScene;
              }
              return prev;
            });

            // Physical momentum tilt tracking
            const v = self.getVelocity();
            if (stageRef.current) {
              const clampedSkew = gsap.utils.clamp(-2, 2, v * 0.001);
              gsap.to(stageRef.current, {
                skewY: clampedSkew,
                duration: 0.25,
                ease: 'power1.out',
                overwrite: 'auto',
              });
            }
          },
        });

        scrollTriggerRef.current = st;

        return () => {
          st.kill();
          masterTl.kill();
        };
      });

      // Mobile fallback: simple tabs
      mm.add('(max-width: 767px)', () => {
        gsap.set('.layer-proy', { opacity: currentScene === 'proyectos' ? 1 : 0, pointerEvents: currentScene === 'proyectos' ? 'auto' : 'none' });
        gsap.set('.layer-terr', { opacity: currentScene === 'territorios' ? 1 : 0, pointerEvents: currentScene === 'territorios' ? 'auto' : 'none' });
        gsap.set('.layer-acad', { opacity: currentScene === 'academia' ? 1 : 0, pointerEvents: currentScene === 'academia' ? 'auto' : 'none' });
      });
    },
    { scope: sectionRef }
  );

  // NATURAL STRAIGHT LEVELING & FOCUS ON HOVER (ENHANCES EXCERPT / SUMMARY READABILITY)
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    setHoveredCardId(id);
    const card = e.currentTarget;
    card.classList.add('is-hovered');

    gsap.killTweensOf(card);

    // Immediately flatten card to perfectly straight (0° rotation in all axes) for effortless reading
    gsap.to(card, {
      rotateZ: 0,
      rotateX: 0,
      rotateY: 0,
      y: -8,
      scale: 1.025,
      boxShadow: '6px 8px 0px #000',
      duration: 0.32,
      ease: 'power2.out',
      overwrite: true,
    });
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Keep card body strictly flat (0° on all axes) so the text summary is 100% legible
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const photo = card.querySelector('img');
    if (photo) {
      gsap.to(photo, {
        x: x * 0.02,
        y: y * 0.02,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.classList.remove('is-hovered');
    const container = getActiveCarousel();

    const photo = card.querySelector('img');
    if (photo) {
      gsap.to(photo, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.35,
        ease: 'power2.out',
      });
    }

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      y: 0,
      boxShadow: '4px 4px 0px #000',
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        if (container) updateCarouselPhysics(container);
      },
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-white py-8 md:py-12 px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col justify-center items-center select-none overflow-visible"
    >
      {/* 1. DYNAMIC TRIAD HEADER: Synchronized to chapter sequence */}
      <div className="w-full flex items-center justify-center gap-4 sm:gap-8 md:gap-14 lg:gap-20 mb-6 md:mb-8 z-30">
        {/* ================= BUTTON 1: PROYECTOS ================= */}
        <button
          onClick={() => handleTabClick('proyectos')}
          className={`flex items-center gap-2 sm:gap-3.5 text-left transition-all duration-300 cursor-pointer ${
            currentScene === 'proyectos' ? 'opacity-100 scale-100' : 'opacity-40 scale-95 hover:opacity-80'
          }`}
          title="Ver Proyectos Destacados"
          data-cursor
        >
          <img
            src={tagProyectosUrl}
            alt=""
            className={`object-contain transition-all duration-300 ${
              currentScene === 'proyectos' ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-7 h-7 sm:w-9 sm:h-9 grayscale'
            }`}
          />
          <div>
            <span
              className={`font-anton tracking-wide uppercase text-ea-black block leading-none transition-all duration-300 ${
                currentScene === 'proyectos' ? 'text-2xl sm:text-[36px]' : 'text-xs sm:text-[18px]'
              }`}
            >
              PROYECTOS
            </span>
            <span
              className={`font-okcok tracking-normal text-ea-black uppercase block leading-none transition-all duration-300 ${
                currentScene === 'proyectos' ? 'text-lg sm:text-[24px] mt-1.5' : 'text-[10px] sm:text-[14px] mt-1'
              }`}
            >
              DESTACADOS
            </span>
          </div>
        </button>

        {/* ================= BUTTON 2: TERRITORIOS ================= */}
        <button
          onClick={() => handleTabClick('territorios')}
          className={`flex items-center gap-2 sm:gap-3.5 text-left transition-all duration-300 cursor-pointer ${
            currentScene === 'territorios' ? 'opacity-100 scale-100' : 'opacity-40 scale-95 hover:opacity-80'
          }`}
          title="Ver Territorios Destacados"
          data-cursor
        >
          <img
            src={tagCiudadUrl}
            alt=""
            className={`object-contain transition-all duration-300 ${
              currentScene === 'territorios' ? 'w-11 h-11 sm:w-14 sm:h-14' : 'w-7 h-7 sm:w-9 sm:h-9 grayscale'
            }`}
          />
          <div>
            <span
              className={`font-anton tracking-wide uppercase text-ea-black block leading-none transition-all duration-300 ${
                currentScene === 'territorios' ? 'text-2xl sm:text-[33.3px]' : 'text-xs sm:text-[17.5px]'
              }`}
            >
              TERRITORIOS
            </span>
            <span
              className={`font-okcok tracking-normal text-ea-black uppercase block leading-none transition-all duration-300 ${
                currentScene === 'territorios' ? 'text-lg sm:text-[26.2px] mt-1.5' : 'text-[10px] sm:text-[14px] mt-1'
              }`}
            >
              DESTACADOS
            </span>
          </div>
        </button>

        {/* ================= BUTTON 3: ACADEMIA ================= */}
        <button
          onClick={() => handleTabClick('academia')}
          className={`flex items-center gap-2 sm:gap-3.5 text-left transition-all duration-300 cursor-pointer ${
            currentScene === 'academia' ? 'opacity-100 scale-100' : 'opacity-40 scale-95 hover:opacity-80'
          }`}
          title="Ver Academia Destacados"
          data-cursor
        >
          <img
            src={tagDatosUrl}
            alt=""
            className={`object-contain transition-all duration-300 ${
              currentScene === 'academia' ? 'w-11 h-11 sm:w-14 sm:h-14' : 'w-7 h-7 sm:w-9 sm:h-9 grayscale'
            }`}
          />
          <div>
            <span
              className={`font-anton tracking-wide uppercase text-ea-black block leading-none transition-all duration-300 ${
                currentScene === 'academia' ? 'text-2xl sm:text-[34.4px]' : 'text-xs sm:text-[18px]'
              }`}
            >
              ACADEMIA
            </span>
            <span
              className={`font-okcok tracking-normal text-ea-black uppercase block leading-none transition-all duration-300 ${
                currentScene === 'academia' ? 'text-lg sm:text-[26px] mt-1.5' : 'text-[10px] sm:text-[14px] mt-1'
              }`}
            >
              DESTACADOS
            </span>
          </div>
        </button>
      </div>

      {/* 2. UNIFIED MULTI-SCENE STAGE: 520px height, zero clipping, smooth layers */}
      <div
        ref={stageRef}
        className="ea-stage-grid relative w-full max-w-[1240px] min-h-[500px] h-[520px] flex items-center justify-center select-none overflow-visible"
        style={{ perspective: '1200px' }}
      >
        {/* ================= LAYER 1: PROYECTOS (6 Projects + Dedicated Standalone CTA Card) ================= */}
        <div
          ref={proyCarouselRef}
          onScroll={handleActiveScroll}
          className={`layer-proy absolute inset-0 w-full ${currentScene === 'proyectos' ? 'flex' : 'hidden md:flex'} items-center gap-6 md:gap-8 lg:gap-10 overflow-x-auto no-scrollbar py-8 px-6 sm:px-12`}
        >
          {/* THE 6 ARCHITECTURAL PROJECTS (1:1 with Figma Redesign Mockup) */}
          {PROYECTOS_DATA.map((proj) => {
            const isColored = hoveredCardId === proj.id || clickedCardId === proj.id;
            return (
              <article
                key={proj.id}
                onClick={() => {
                  setClickedCardId(proj.id);
                  if (onSelectProject) onSelectProject(proj.id);
                }}
                onMouseMove={handleCardMouseMove}
                onMouseEnter={(e) => handleCardMouseEnter(e, proj.id)}
                onMouseLeave={(e) => {
                  setHoveredCardId(null);
                  handleCardMouseLeave(e);
                }}
                className={`card-proy ea-destacado-card shrink-0 relative w-[88vw] sm:w-[600px] md:w-[650px] lg:w-[680px] h-[340px] sm:h-[360px] cursor-pointer group bg-[#FAF8F5] border-2 border-ea-black rounded-[2px] shadow-[4px_4px_0px_#000] p-5 sm:p-6 md:p-7 flex flex-row items-stretch justify-between gap-5 sm:gap-7 select-none overflow-hidden ${
                  isColored ? 'is-hovered is-active z-30' : 'z-10'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
                data-cursor
              >
                {/* Left Column: Metadata + OKCOK Title + Studio + Excerpt */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full pr-1">
                  {/* Top Metadata Row: Location Pin + Typology Doc */}
                  <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
                    <div className="flex items-center gap-2 text-ea-black">
                      <DoodlePinIcon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                      <span className="font-anton text-[11px] sm:text-[12px] tracking-widest uppercase">
                        {proj.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-ea-black">
                      <DoodleDocIcon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                      <span className="font-anton text-[11px] sm:text-[12px] tracking-widest uppercase">
                        {proj.category}
                      </span>
                    </div>
                  </div>

                  {/* Middle Title & Studio */}
                  <div className="my-auto py-2">
                    <h3 className="font-okcok text-[24px] sm:text-[28px] md:text-[32px] leading-[1.05] uppercase text-ea-black tracking-wide group-hover:underline transition-colors">
                      {proj.title}
                    </h3>
                    <p className="font-anton text-xs sm:text-[13px] md:text-sm leading-tight tracking-wider text-ea-black uppercase mt-1">
                      {proj.studio}
                    </p>
                  </div>

                  {/* Editorial Excerpt */}
                  <p className="font-creato text-xs sm:text-[12px] md:text-[12.5px] leading-relaxed text-ea-black/90 line-clamp-4 sm:line-clamp-5 break-words">
                    {proj.excerpt}
                  </p>
                </div>

                {/* Right Column: Architectural Photo Window — Clean, Borderless & Standalone with Carousel trigger */}
                <div
                  onClick={(e) => handleOpenPhotoCarousel(e, proj)}
                  className="w-[160px] sm:w-[210px] md:w-[250px] h-full shrink-0 overflow-hidden rounded-[2px] relative cursor-zoom-in group/img"
                  title="Clic para ver carrusel de fotos a pantalla completa"
                >
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover object-center group-hover/img:scale-105 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-ea-black/90 text-white px-2 py-0.5 text-[9px] font-anton uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <span>Ver Fotos</span>
                  </div>
                </div>
              </article>
            );
          })}

          {/* 7TH ITEM: DEDICATED EDITORIAL BUTTON CARD */}
          <div
            onClick={() => {
              if (onNavigateToCatalog) onNavigateToCatalog();
              else if (onNavigateToSection) onNavigateToSection('proyectos');
            }}
            onMouseEnter={() => setHoveredCardId('cta-catalog')}
            onMouseLeave={() => setHoveredCardId(null)}
            className="shrink-0 relative w-[260px] sm:w-[290px] h-[340px] sm:h-[360px] cursor-pointer group bg-[#0e0e0e] text-white border-2 border-ea-black shadow-[4px_4px_0px_#000] hover:shadow-[7px_7px_0px_#000] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 select-none z-20 rounded-[2px]"
            data-cursor
          >
            {/* Top Title */}
            <div className="pt-1">
              <h3 className="font-okcok text-2xl sm:text-[28px] leading-[28px] sm:leading-[32px] uppercase text-white tracking-wide group-hover:text-neutral-200 transition-colors">
                VER TODOS LOS PROYECTOS
              </h3>
            </div>

            {/* Center decorative architectural icon */}
            <div className="my-auto py-2 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-white/50 transition-all duration-300 bg-white/5">
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="w-full">
              <div className="w-full py-3 px-4 bg-white text-ea-black font-anton text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-between group-hover:bg-neutral-100 transition-colors shadow-sm rounded-[2px]">
                <span>EXPLORAR CATÁLOGO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= LAYER 2: TERRITORIOS (6 Regions + Dedicated Standalone CTA Card) ================= */}
        <div
          ref={terrCarouselRef}
          onScroll={handleActiveScroll}
          className={`layer-terr absolute inset-0 w-full ${currentScene === 'territorios' ? 'flex' : 'hidden md:flex'} items-center gap-6 md:gap-8 lg:gap-10 overflow-x-auto no-scrollbar py-8 px-6 sm:px-12`}
        >
          {TERRITORIOS_DATA.map((terr) => {
            const isColored = hoveredCardId === terr.id || clickedCardId === terr.id;
            return (
              <article
                key={terr.id}
                onClick={() => {
                  setClickedCardId(terr.id);
                  if (onSelectProject) onSelectProject(terr.id);
                }}
                onMouseMove={handleCardMouseMove}
                onMouseEnter={(e) => handleCardMouseEnter(e, terr.id)}
                onMouseLeave={(e) => {
                  setHoveredCardId(null);
                  handleCardMouseLeave(e);
                }}
                className={`card-terr ea-destacado-card shrink-0 relative w-[88vw] sm:w-[600px] md:w-[650px] lg:w-[680px] h-[340px] sm:h-[360px] cursor-pointer group bg-[#FAF8F5] border-2 border-ea-black rounded-[2px] shadow-[4px_4px_0px_#000] p-5 sm:p-6 md:p-7 flex flex-row items-stretch justify-between gap-5 sm:gap-7 select-none overflow-hidden ${
                  isColored ? 'is-hovered is-active z-30' : 'z-10'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
                data-cursor
              >
                {/* Left Column: Metadata + OKCOK Title + Region/Studio + Excerpt */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full pr-1">
                  {/* Top Metadata Row: Location Pin + Typology Doc */}
                  <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
                    <div className="flex items-center gap-2 text-ea-black">
                      <DoodlePinIcon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                      <span className="font-anton text-[11px] sm:text-[12px] tracking-widest uppercase">
                        {terr.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-ea-black">
                      <DoodleDocIcon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                      <span className="font-anton text-[11px] sm:text-[12px] tracking-widest uppercase">
                        {terr.category}
                      </span>
                    </div>
                  </div>

                  {/* Middle Title & Studio/Theme */}
                  <div className="my-auto py-2">
                    <h3 className="font-okcok text-[24px] sm:text-[28px] md:text-[32px] leading-[1.05] uppercase text-ea-black tracking-wide group-hover:underline transition-colors">
                      {terr.title}
                    </h3>
                    <p className="font-anton text-xs sm:text-[13px] md:text-sm leading-tight tracking-wider text-ea-black uppercase mt-1">
                      {terr.studio}
                    </p>
                  </div>

                  {/* Editorial Excerpt */}
                  <p className="font-creato text-xs sm:text-[12px] md:text-[12.5px] leading-relaxed text-ea-black/90 line-clamp-4 sm:line-clamp-5 break-words">
                    {terr.excerpt}
                  </p>
                </div>

                {/* Right Column: Architectural Photo Window — Clean, Borderless & Standalone with Carousel trigger */}
                <div
                  onClick={(e) => handleOpenPhotoCarousel(e, terr)}
                  className="w-[160px] sm:w-[210px] md:w-[250px] h-full shrink-0 overflow-hidden rounded-[2px] relative cursor-zoom-in group/img"
                  title="Clic para ver carrusel de fotos a pantalla completa"
                >
                  <img
                    src={terr.imageUrl}
                    alt={terr.title}
                    className="w-full h-full object-cover object-center group-hover/img:scale-105 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-ea-black/90 text-white px-2 py-0.5 text-[9px] font-anton uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <span>Ver Fotos</span>
                  </div>
                </div>
              </article>
            );
          })}

          {/* 7TH ITEM: DEDICATED EDITORIAL BUTTON CARD FOR TERRITORIOS */}
          <div
            onClick={() => {
              if (onNavigateToSection) onNavigateToSection('territorios');
              else if (onTabChange) onTabChange('territorios');
            }}
            onMouseEnter={() => setHoveredCardId('cta-territorios')}
            onMouseLeave={() => setHoveredCardId(null)}
            className="shrink-0 relative w-[260px] sm:w-[290px] h-[340px] sm:h-[360px] cursor-pointer group bg-[#0e0e0e] text-white border-2 border-ea-black shadow-[4px_4px_0px_#000] hover:shadow-[7px_7px_0px_#000] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 select-none z-20 rounded-[2px]"
            data-cursor
          >
            {/* Top Title */}
            <div className="pt-1">
              <h3 className="font-okcok text-xl sm:text-[24px] leading-[24px] sm:leading-[28px] uppercase text-white tracking-wide group-hover:text-neutral-200 transition-colors">
                VER TODOS LOS TERRITORIOS
              </h3>
            </div>

            {/* Center decorative architectural icon */}
            <div className="my-auto py-2 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-white/50 transition-all duration-300 bg-white/5">
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="w-full">
              <div className="w-full py-3 px-4 bg-white text-ea-black font-anton text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-between group-hover:bg-neutral-100 transition-colors shadow-sm rounded-[2px]">
                <span>EXPLORAR TERRITORIOS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= LAYER 3: ACADEMIA (6 Investigations + Dedicated Standalone CTA Card) ================= */}
        <div
          ref={acadCarouselRef}
          onScroll={handleActiveScroll}
          className={`layer-acad absolute inset-0 w-full ${currentScene === 'academia' ? 'flex' : 'hidden md:flex'} items-center gap-6 md:gap-8 lg:gap-10 overflow-x-auto no-scrollbar py-8 px-6 sm:px-12`}
        >
          {ACADEMIA_DATA.map((acad) => {
            const isColored = hoveredCardId === acad.id || clickedCardId === acad.id;
            return (
              <article
                key={acad.id}
                onClick={() => {
                  setClickedCardId(acad.id);
                  if (onSelectProject) onSelectProject(acad.id);
                }}
                onMouseMove={handleCardMouseMove}
                onMouseEnter={(e) => handleCardMouseEnter(e, acad.id)}
                onMouseLeave={(e) => {
                  setHoveredCardId(null);
                  handleCardMouseLeave(e);
                }}
                className={`card-acad ea-destacado-card shrink-0 relative w-[88vw] sm:w-[600px] md:w-[650px] lg:w-[680px] h-[340px] sm:h-[360px] cursor-pointer group bg-[#FAF8F5] border-2 border-ea-black rounded-[2px] shadow-[4px_4px_0px_#000] p-5 sm:p-6 md:p-7 flex flex-row items-stretch justify-between gap-5 sm:gap-7 select-none overflow-hidden ${
                  isColored ? 'is-hovered is-active z-30' : 'z-10'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
                data-cursor
              >
                {/* Left Column: University + Section + Title + Credits + Year + Excerpt */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full pr-1">
                  {/* Top Metadata Row: University Logo & Name + Doodle Section Tag */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <div
                      className="flex items-center gap-2 font-anton text-base sm:text-lg md:text-xl tracking-wider uppercase font-bold"
                      style={{ color: acad.universityColor }}
                    >
                      <UniversityLogoIcon university={acad.university} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                      <span>{acad.university}</span>
                    </div>

                    <DoodleTagBox color={acad.universityColor}>
                      <span className="font-okcok text-xs sm:text-sm tracking-wider uppercase leading-none">
                        {acad.sectionType}
                      </span>
                    </DoodleTagBox>
                  </div>

                  {/* Middle Content: OKCOK Title + Credits + Sketched Year Box */}
                  <div className="my-auto py-1 sm:py-1.5">
                    <h3 className="font-okcok text-[24px] sm:text-[28px] md:text-[32px] leading-[1.05] uppercase text-ea-black tracking-wide group-hover:underline transition-colors">
                      {acad.title}
                    </h3>

                    <div className="mt-1 space-y-0.5">
                      <p className="font-anton text-xs sm:text-[13px] leading-tight tracking-wider text-ea-black uppercase">
                        ESTUDIANTE: {acad.student}
                      </p>
                      <p className="font-anton text-xs sm:text-[13px] leading-tight tracking-wider text-ea-black uppercase">
                        DOCENTE: {acad.professor}
                      </p>
                    </div>

                    <DoodleYearBox year={acad.year} className="mt-1.5" />
                  </div>

                  {/* Bottom: Editorial Excerpt */}
                  <p className="font-creato text-xs sm:text-[11.5px] md:text-[12px] leading-relaxed text-ea-black/90 line-clamp-3 sm:line-clamp-4 break-words">
                    {acad.excerpt}
                  </p>
                </div>

                {/* Right Column: Architectural Photo Window — Clean, Borderless & Standalone with Carousel trigger */}
                <div
                  onClick={(e) => handleOpenPhotoCarousel(e, acad)}
                  className="w-[160px] sm:w-[210px] md:w-[250px] lg:w-[260px] h-full shrink-0 overflow-hidden rounded-[2px] relative cursor-zoom-in group/img"
                  title="Clic para ver carrusel de fotos a pantalla completa"
                >
                  <img
                    src={acad.imageUrl}
                    alt={acad.title}
                    className="w-full h-full object-cover object-center group-hover/img:scale-105 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-ea-black/90 text-white px-2 py-0.5 text-[9px] font-anton uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <span>Ver Fotos</span>
                  </div>
                </div>
              </article>
            );
          })}

          {/* 7TH ITEM: DEDICATED EDITORIAL BUTTON CARD FOR ACADEMIA */}
          <div
            onClick={() => {
              if (onNavigateToSection) onNavigateToSection('academia');
              else if (onTabChange) onTabChange('academia');
            }}
            onMouseEnter={() => setHoveredCardId('cta-academia')}
            onMouseLeave={() => setHoveredCardId(null)}
            className="shrink-0 relative w-[260px] sm:w-[290px] h-[340px] sm:h-[360px] cursor-pointer group bg-[#0e0e0e] text-white border-2 border-ea-black shadow-[4px_4px_0px_#000] hover:shadow-[7px_7px_0px_#000] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 select-none z-20 rounded-[2px]"
            data-cursor
          >
            {/* Top Title */}
            <div className="pt-1">
              <h3 className="font-okcok text-2xl sm:text-[28px] leading-[28px] sm:leading-[32px] uppercase text-white tracking-wide group-hover:text-neutral-200 transition-colors">
                VER TODA LA INVESTIGACIÓN
              </h3>
            </div>

            {/* Center decorative architectural icon */}
            <div className="my-auto py-2 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-white/50 transition-all duration-300 bg-white/5">
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="w-full">
              <div className="w-full py-3 px-4 bg-white text-ea-black font-anton text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-between group-hover:bg-neutral-100 transition-colors shadow-sm rounded-[2px]">
                <span>EXPLORAR ARCHIVO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION ARROWS (Synchronized with active scene: Proyectos, Territorios & Academia) */}
        <>
          {/* RIGHT ARROW: Mirar más elementos */}
          <button
            onClick={() => handleScrollCarousel('right')}
            className={`destacados-scroll-arrow-right absolute right-0 sm:-right-4 md:-right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-13 sm:h-13 bg-white text-ea-black border-2 border-ea-black shadow-[3px_3px_0px_#000] hover:bg-ea-black hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer group active:translate-x-0.5 active:translate-y-0.5 ${
              canScrollRight ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
            }`}
            title="Mirar más hacia la derecha"
            aria-label="Mirar más hacia la derecha"
            data-cursor
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* LEFT ARROW: Mirar elementos anteriores a la izquierda */}
          <button
            onClick={() => handleScrollCarousel('left')}
            className={`destacados-scroll-arrow-left absolute left-0 sm:-left-4 md:-left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-13 sm:h-13 bg-white text-ea-black border-2 border-ea-black shadow-[3px_3px_0px_#000] hover:bg-ea-black hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer group active:translate-x-0.5 active:translate-y-0.5 ${
              canScrollLeft ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
            }`}
            title="Mirar elementos anteriores a la izquierda"
            aria-label="Mirar elementos anteriores a la izquierda"
            data-cursor
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>
        </>
      </div>

      {/* 3. DYNAMIC CHAPTER-SYNCED "VER MÁS" ACTION BAR */}
      <div className="destacados-action-bar w-full max-w-[1040px] mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 bg-[#fbfbf9] border-2 border-ea-black shadow-[4px_4px_0px_#000000] relative z-30 transition-all duration-300">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-ea-black animate-pulse" />
          <div className="text-left">
            <span className="block font-mono text-[10px] tracking-widest text-ea-black/60 uppercase">
              {currentScene === 'proyectos'
                ? 'COLECCIÓN MONOGRÁFICA · 06 OBRAS + CATÁLOGO COMPLETO'
                : currentScene === 'territorios'
                ? 'ATLAS TERRITORIAL · 06 REGIONES + EXPEDICIÓN COMPLETA'
                : 'ARCHIVO ACADÉMICO · 06 INVESTIGACIONES + ARCHIVO COMPLETO'}
            </span>
            <span className="block font-anton text-sm sm:text-base text-ea-black uppercase tracking-wide">
              {currentScene === 'proyectos'
                ? 'ARQUITECTURA CONTEMPORÁNEA DEL ECUADOR'
                : currentScene === 'territorios'
                ? 'CARTOGRAFÍAS, CUENCAS Y PAISAJES VIVOS'
                : 'TESIS CRÍTICAS Y VULNERABILIDAD SOCIAL'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (currentScene === 'proyectos') {
              if (onNavigateToCatalog) onNavigateToCatalog();
              else if (onNavigateToSection) onNavigateToSection('proyectos');
            } else if (currentScene === 'territorios') {
              if (onNavigateToSection) onNavigateToSection('territorios');
            } else {
              if (onNavigateToSection) onNavigateToSection('academia');
            }
          }}
          className="group/cta w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-ea-black text-white hover:bg-neutral-800 transition-all duration-200 cursor-pointer text-xs font-anton tracking-wider uppercase shadow-sm active:translate-y-0.5"
          data-cursor
        >
          <span>
            {currentScene === 'proyectos'
              ? 'VER TODOS LOS PROYECTOS (+40 OBRAS) →'
              : currentScene === 'territorios'
              ? 'VER MÁS TERRITORIOS (7 REGIONES) →'
              : 'VER MÁS INVESTIGACIÓN (7 TESIS) →'}
          </span>
        </button>
      </div>

      {/* 4. CINEMATIC BLACK SHUTTER APERTURE OVERLAY (Portal to document.body) */}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={shutterRef}
              className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden"
              style={{ visibility: 'hidden' }}
            >
              <div
                ref={apertureRef}
                className="absolute inset-0 w-full h-full bg-ea-black flex flex-col items-center justify-center text-white px-6"
              >
                <div className="text-center flex flex-col items-center justify-center max-w-xl">
                  <span
                    ref={shutterBadgeRef}
                    className="shutter-badge font-anton text-xs md:text-sm tracking-[0.3em] uppercase text-white/50 block mb-2 opacity-0"
                  >
                    TRANSICIÓN CINEMATOGRÁFICA • CAPÍTULO 02
                  </span>
                  <h2
                    ref={shutterTitleRef}
                    className="shutter-title font-okcok text-4xl sm:text-6xl md:text-7xl uppercase tracking-wider text-white opacity-0"
                  >
                    TERRITORIOS
                  </h2>
                  <div
                    ref={shutterLineRef}
                    className="shutter-line w-16 h-[2px] bg-white/40 mx-auto mt-4 opacity-0"
                  />
                  <p
                    ref={shutterDescRef}
                    className="shutter-desc font-creato text-xs sm:text-sm uppercase tracking-widest text-white/70 mt-3 opacity-0 text-center"
                  >
                    CARTOGRAFÍAS, CUENCAS Y DINÁMICAS DEL PAISAJE ANDINO Y COSTERO
                  </p>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
      {/* Fullscreen Architectural Image Carousel Lightbox */}
      <ImageCarouselLightbox
        isOpen={isLightboxOpen}
        images={lightboxImages}
        initialIndex={0}
        projectTitle={lightboxProjectTitle}
        onClose={() => setIsLightboxOpen(false)}
      />
    </section>
  );
};

export default PinnedDestacados;
