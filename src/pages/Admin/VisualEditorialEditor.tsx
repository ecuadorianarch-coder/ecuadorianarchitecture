import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  Save,
  CheckCircle,
  Eye,
  Sliders,
  Layers,
  Image as ImageIcon,
  FileText,
  Share2,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Plus,
  ExternalLink,
  Sparkles,
  Check,
  Building2,
  MapPin,
  GraduationCap,
  Clock,
  Archive,
  Volume2,
  Film,
  Compass,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Scale,
  MessageSquare,
  Radio,
  Folder,
  Settings,
  AlertTriangle,
  AlertCircle,
  X,
  Globe,
  Upload,
  Loader2,
  Camera,
  HardHat,
  Users,
  Crop,
  Crosshair,
  ZoomIn,
  RotateCcw,
} from 'lucide-react';
import { ProfileSearchSelect } from '../../components/common/ProfileSearchSelect';
import { ConstructionTeamMember } from '../../data/constructionTeams';
import { uploadImageFile, uploadMultipleImages } from '../../utils/mediaUpload';
import { detectImageCategory } from '../../components/editorial/ImageCarouselLightbox';
import {
  EditorialArticle,
  EditorialModuleItem,
  EditorialModuleType,
  EditorialType,
  PublicationStatus,
} from '../../types/editorial';
import { ProjectDetail } from '../ProjectDetail';
import { OrigamiFolderCard } from '../../components/projects/OrigamiFolderCard';
import { NotebookCard } from '../../components/projects/NotebookCard';
import { FolderTabCard } from '../../components/projects/FolderTabCard';
import { MediaLibraryModal } from './MediaLibraryModal';
import { LandingPreviewModal } from './LandingPreviewModal';
import { GoogleSearchPreview } from '../../components/editorial/GoogleSearchPreview';
import {
  generateArchitectureTitle,
  generateArchitectureDescription,
  generateArchitectureKeywords,
} from '../../services/architectureSeo';
import { useContent } from '../../context/ContentContext';

// Vector icons for metadata capsule
const AuthorIcon: React.FC<{ className?: string }> = ({
  className = 'h-3 sm:h-3.5 w-auto object-contain text-ea-black shrink-0',
}) => (
  <svg viewBox="0 0 50 117" className={className} fill="currentColor" aria-hidden="true">
    <path d="M27.1447 0.96362C27.1447 0.96362 28.2718 2.95299 28.2718 3.326C28.3031 5.15995 27.8334 8.01968 27.5517 9.94688C27.4264 10.9105 26.8316 12.1538 26.8942 13.0864C26.9255 13.677 28.6788 17.9044 29.0545 18.7126C30.8391 22.567 35.5354 29.4987 38.8228 32.1408C42.1102 34.783 45.1785 36.4615 47.3388 40.5646C48.4972 42.7715 47.4953 42.6472 47.4327 44.1081C47.4014 45.0717 47.9963 46.8124 48.0589 47.9315C48.3406 52.2832 47.8084 56.262 47.5579 60.4894C47.4327 62.4788 47.7458 65.8047 47.3701 67.6076C47.2448 68.1982 46.8065 68.3847 46.7126 68.9442L47.2135 68.8199C47.2135 69.7835 47.2135 70.6538 47.464 71.5864C47.8397 72.923 49.3112 73.5757 49.4051 75.0678C49.4678 75.9381 48.7477 76.8395 48.7477 77.6166C48.7477 78.2383 49.2173 78.9843 49.2799 79.6682C49.3425 80.7561 48.8729 81.7508 49.0921 82.9631C49.2486 83.8024 49.8748 84.2064 49.9374 85.2633C50 86.5688 49.0607 87.5013 49.2173 88.5893C49.3112 89.3042 50 90.2056 50 91.1692C50 92.4437 48.8103 94.4331 48.0902 95.4899C47.5892 96.267 47.1196 95.8318 47.6205 97.4793L47.9963 96.9509C48.8416 97.2928 49.6869 104.598 49.6243 105.872L48.8729 106.027L49.6556 106.152C49.9687 106.68 48.8416 109.291 48.4972 109.944C48.0276 110.814 46.3056 113.332 45.6481 114.016C44.9593 114.762 44.3331 115.073 43.3626 115.353C40.3256 116.192 34.1265 116.347 30.9017 116.285C27.6769 116.223 23.7946 115.477 20.5698 115.974C20.1941 116.036 20.4133 116.192 19.3175 116.347C14.4959 116.938 8.73514 118.274 5.60427 113.488C3.94491 110.939 4.75893 109.944 4.53977 107.24C4.22668 103.354 3.22481 99.3443 4.2893 95.4899C4.19537 94.6507 1.65937 94.2155 1.44021 92.4126C1.37759 92.0085 1.65937 91.5733 1.56544 91.2314C1.47152 90.8273 0.657492 90.3922 0.532257 89.3664C0.344405 87.6568 1.7846 86.3201 1.72199 84.6416C2.16031 84.6105 1.84722 85.6052 2.5047 85.0146C1.31497 83.7402 2.16031 82.3725 1.7846 81.3156C1.59675 80.7872 0.93927 80.3831 0.626183 79.8858C0.344405 79.4817 -0.532239 78.0829 0.532257 78.2694L0.814035 78.7667L1.25236 75.161L0.782726 76.7152C0.281787 76.7774 0.563565 75.9381 0.626183 75.6894C0.907961 74.5393 1.31497 74.1352 2.25424 73.4825C0.814035 69.8767 1.53414 65.3696 1.7533 61.5152C1.87853 59.6501 2.41078 57.2877 2.129 55.3294C1.94115 54.0861 0.907961 53.0292 0.751418 52.0345C0.313096 49.4235 0.6888 45.2272 0.782726 42.5229C0.782726 42.0877 0.500948 41.6525 0.500948 41.2795C0.500948 41.1241 1.69068 38.886 1.87853 38.5752C2.94303 36.9899 5.07202 35.529 6.26175 33.9748C8.07765 31.6124 9.48655 28.5351 11.3964 26.0795C13.4628 23.4062 20.1941 16.9408 20.0063 13.708C19.975 13.1485 19.5366 12.8688 19.4427 12.4336C19.067 10.0712 18.5348 5.8438 18.8165 3.57467C19.0983 1.30554 20.0689 1.21229 21.9474 0.373024C22.0413 0.34194 22.0413 -0.0310669 22.1666 -0.0310669L27.1447 0.932536V0.96362Z" />
  </svg>
);

const CameraIcon: React.FC<{ className?: string }> = ({
  className = 'h-2.5 sm:h-3 w-auto object-contain text-ea-black shrink-0',
}) => (
  <svg viewBox="0 0 888.07 552.48" className={className} fill="currentColor" aria-hidden="true">
    <path d="M 676.99 134.59 C 680.93 145.67, 670.34 166.26, 676.07 176.19 C 678.85 181.02, 691.57 179.16, 697.03 179.28 C 703.25 179.42, 709.55 178.96, 715.42 179.23 C 719.97 179.45, 724.81 181.71, 729.08 181.60 C 736.01 181.43, 748.61 175.77, 756.72 174.79 C 762.60 174.08, 781.55 177.29, 784.47 171.60 C 787.14 166.42, 784.20 153.89, 783.56 147.75 C 782.85 140.90, 784.59 132.24, 779.39 126.72 C 768.53 124.16, 758.48 130.12, 748.59 131.14 C 744.49 131.56, 740.14 130.78, 736.01 131.16 C 716.39 132.98, 696.72 134.98, 676.99 134.59 M 800.74 105.94 L 784.70 105.94 C 786.86 109.23, 792.70 107.82, 795.56 110.55 C 797.34 112.26, 800.53 122.38, 800.68 125.01 C 794.37 141.11, 801.90 162.12, 799.52 177.48 C 796.91 194.38, 779.05 186.22, 768.21 187.42 C 753.72 189.03, 734.06 194.97, 719.78 195.24 C 701.31 195.58, 700.58 195.51, 682.79 199.40 C 679.08 200.20, 665.35 203.18, 662.65 203.15 C 648.56 203.04, 656.51 187.13, 656.41 181.05 C 656.32 175.92, 655.65 166.89, 655.07 161.66 C 653.58 148.28, 642.27 121.41, 663.24 117.87 C 690.04 113.34, 718.39 116.65, 745.10 112.74 C 752.36 111.68, 761.37 106.54, 769.80 108.22 C 770.45 105.41, 768.75 105.71, 766.63 105.15 C 756.89 102.59, 750.72 105.30, 742.93 104.76 C 683.60 100.66, 625.36 92.38, 565.22 90.99 C 503.74 89.57, 442.40 85.00, 380.83 81.83 C 289.58 77.13, 187.34 62.88, 97.75 74.99 C 95.22 75.33, 92.48 74.72, 89.85 75.12 C 83.83 76.03, 62.97 79.69, 58.71 81.85 C 57.86 82.28, 57.02 82.76, 56.27 83.35 C 54.67 88.95, 53.99 96.99, 53.65 103.09 C 52.16 130.08, 51.64 157.66, 51.39 184.37 C 51.36 188.14, 47.16 200.75, 50.14 202.84 C 52.87 203.64, 56.02 203.53, 58.85 203.38 C 86.93 201.92, 119.85 201.78, 148.13 202.14 C 190.92 202.70, 227.88 213.31, 269.89 204.74 C 273.64 203.97, 285.65 202.79, 289.19 203.28 C 291.60 203.61, 303.01 209.81, 302.35 213.02 C 299.54 220.33, 290.28 221.85, 283.20 222.39 C 276.97 222.85, 271.32 220.53, 266.19 220.42 C 246.71 220.01, 226.09 220.39, 206.62 221.68 C 193.87 222.52, 188.64 221.87, 176.82 221.68 C 171.72 221.60, 163.88 223.88, 158.54 224.01 C 132.03 224.67, 105.90 223.81, 79.43 226.26 C 73.42 226.82, 64.94 229.37, 59.79 229.64 C 55.81 229.84, 52.03 226.80, 48.47 230.83 C 47.54 258.58, 48.10 286.35, 47.20 314.10 C 45.29 372.64, 40.78 431.85, 38.76 490.39 C 38.64 493.70, 38.01 507.49, 39.82 508.80 L 61.13 507.17 C 103.74 513.17, 147.86 507.24, 190.57 509.29 C 252.72 512.28, 313.56 513.64, 375.11 513.81 C 401.62 513.88, 427.69 511.49, 454.13 510.44 C 473.21 509.68, 492.34 509.14, 511.46 509.23 C 527.59 509.32, 544.41 511.82, 560.73 510.48 C 582.42 508.69, 595.80 511.81, 616.89 512.76 C 654.94 514.48, 693.25 512.65, 731.47 512.67 L 846.47 516.05 C 847.81 515.27, 845.74 491.20, 845.16 487.21 C 843.85 478.04, 843.94 472.64, 843.01 464.14 C 842.55 459.96, 840.09 456.39, 839.67 452.60 C 839.02 446.70, 841.54 441.22, 840.88 435.34 C 840.34 430.51, 837.55 425.05, 837.31 419.33 C 836.06 389.27, 835.16 359.00, 833.96 328.82 L 819.07 237.71 C 816.47 239.26, 815.02 241.18, 811.66 241.18 C 758.81 241.29, 706.30 239.41, 653.49 241.14 C 643.17 241.48, 628.93 244.42, 633.78 229.45 C 635.48 224.21, 637.29 221.87, 643.24 221.62 C 662.47 220.83, 682.17 223.53, 701.67 223.92 C 735.96 224.60, 770.59 221.45, 804.77 218.25 C 808.71 217.88, 812.83 218.48, 816.78 218.23 Z" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({
  className = 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-ea-black shrink-0',
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="7.5" cy="14" r="0.75" fill="currentColor" />
    <circle cx="12" cy="14" r="0.75" fill="currentColor" />
    <circle cx="16.5" cy="14" r="0.75" fill="currentColor" />
    <circle cx="7.5" cy="18" r="0.75" fill="currentColor" />
    <circle cx="12" cy="18" r="0.75" fill="currentColor" />
    <circle cx="16.5" cy="18" r="0.75" fill="currentColor" />
  </svg>
);

interface VisualEditorialEditorProps {
  initialArticle: EditorialArticle;
  onSave: (article: EditorialArticle, publishNow?: boolean) => void;
  onBack: () => void;
}

// 7 Logical Sections for Non-Technical Architects
export type EditorSectionKey =
  | 'basica'
  | 'fotos'
  | 'descripcion'
  | 'creditos'
  | 'landing'
  | 'modulos'
  | 'avanzado';

const getSectionMetadata = (type: EditorialType = 'proyectos'): Record<EditorSectionKey, { title: string; subtitle: string; icon: any }> => {
  const isTerritorio = type === 'territorios';
  const isAcademia = type === 'academia';

  return {
    basica: {
      title: isTerritorio ? 'Información Territorial' : isAcademia ? 'Información Académica' : 'Información Básica',
      subtitle: isTerritorio
        ? 'Título del expediente, colectivo territorial, año y escala'
        : isAcademia
        ? 'Título de la investigación, tesista, año y sede'
        : 'Título, arquitectos principales, año y ubicación',
      icon: isTerritorio ? MapPin : isAcademia ? GraduationCap : Building2,
    },
    fotos: {
      title: isTerritorio ? 'Registro Visual y Cartografía' : isAcademia ? 'Visualización y Renders' : 'Fotografías del Proyecto',
      subtitle: isTerritorio
        ? 'Foto o cartografía principal y registro de territorio'
        : isAcademia
        ? 'Visualización principal de la tesis y esquemas'
        : 'Foto principal exterior y foto secundaria de detalle',
      icon: ImageIcon,
    },
    descripcion: {
      title: isTerritorio ? 'Memoria Territorial' : isAcademia ? 'Resumen y Marco Teórico' : 'Descripción y Memoria',
      subtitle: 'Resumen para tarjetas y memoria analítica',
      icon: FileText,
    },
    creditos: {
      title: isTerritorio ? 'Ficha Territorial' : isAcademia ? 'Ficha de Investigación' : 'Ficha Técnica y Créditos',
      subtitle: isTerritorio
        ? 'Colectivo, escala territorial y equipo cartográfico'
        : isAcademia
        ? 'Tesista, universidad, tutor y renders (opcional)'
        : 'Autores, fotógrafo, superficie m² y materiales',
      icon: Layers,
    },
    landing: {
      title: 'Aparición en Portada',
      subtitle: 'Activar en el mazo de inicio y posición',
      icon: Sparkles,
    },
    modulos: {
      title: 'Expediente Modular',
      subtitle: isTerritorio
        ? 'Dossier, análisis territorial y notas comunitarias'
        : isAcademia
        ? 'Dossier, marco metodológico y notas comunitarias'
        : 'Reseña, planos, crítica paritaria y podcast',
      icon: Folder,
    },
    avanzado: {
      title: 'Opciones Avanzadas',
      subtitle: 'Enlace web, estado de publicación y datos para Google',
      icon: Settings,
    },
  };
};

// Available module catalog for the "+ AÑADIR MÓDULO" picker
const MODULE_CATALOG: { type: EditorialModuleType; title: string; desc: string; icon: any }[] = [
  { type: 'hero-header', title: 'Encabezado Editorial', desc: 'Hero con kicker, titular, subtítulo y autor', icon: FileText },
  { type: 'title-subtitle', title: 'Título y Subtítulo', desc: 'Encabezado de sección de lectura', icon: FileText },
  { type: 'rich-text', title: 'Texto Enriquecido', desc: 'Párrafos analíticos de la reseña', icon: FileText },
  { type: 'single-image', title: 'Imagen Individual', desc: 'Fotografía con pie de foto y crédito', icon: ImageIcon },
  { type: 'fullscreen-image', title: 'Imagen Pantalla Completa', desc: 'Fotografía a todo el ancho (Full Bleed)', icon: Maximize2 },
  { type: 'image-gallery', title: 'Galería de Imágenes', desc: 'Cuadrícula de 2 a 4 fotos', icon: ImageIcon },
  { type: 'image-comparison', title: 'Comparador de Imágenes', desc: 'Slider interactivo antes / después o plano / foto', icon: Sliders },
  { type: 'video', title: 'Video Embebido', desc: 'Video de YouTube, Vimeo o MP4', icon: Film },
  { type: 'podcast', title: 'Audio / Podcast', desc: 'Episodio de podcast con duración y reproductor', icon: Volume2 },
  { type: 'blockquote', title: 'Cita Destacada', desc: 'Cita en tipografía OKCOK con autor', icon: FileText },
  { type: 'technical-specs', title: 'Ficha Técnica', desc: 'Superficie, estructura, fotógrafo y colaboradores', icon: Layers },
  { type: 'materials-list', title: 'Lista de Materiales', desc: 'Paleta tectónica de materiales constructivos', icon: Layers },
  { type: 'project-data', title: 'Datos del Proyecto', desc: 'Emplazamiento, clima, altura msnm', icon: MapPin },
  { type: 'planimetry', title: 'Planimetría Interactiva', desc: 'Planta, corte o axonometría con visor', icon: Compass },
  { type: 'map-location', title: 'Mapa y Ubicación', desc: 'Datos territoriales y geográficos', icon: MapPin },
  { type: 'credits', title: 'Bloque de Créditos', desc: 'Créditos completos de arquitectura y colaboradores', icon: Building2 },
  { type: 'external-links', title: 'Enlaces Externos', desc: 'Web del estudio, recursos y publicaciones', icon: ExternalLink },
  { type: 'separator', title: 'Separador Editorial', desc: 'Línea de transición visual entre bloques', icon: ArrowUpDown },
];

const DEFAULT_CATEGORIES_BY_TYPE: Record<EditorialType, string[]> = {
  proyectos: [
    'Edificación Colectiva',
    'Vivienda Unifamiliar',
    'Edificio de Uso Mixto',
    'Espacio Público',
    'Equipamiento Cultural',
    'Equipamiento Social',
    'Arquitectura Efímera',
    'Arquitectura Comercial / Corporativa',
    'Intervención Patrimonial / Restauración',
    'Arquitectura del Paisaje',
  ],
  territorios: [
    'Morfología Urbana',
    'Cuenca Hídrica y Paisaje',
    'Borde Fluvial y Costero',
    'Asentamientos y Hábitat Rural',
    'Cartografía Crítica',
    'Infraestructura Territorial',
    'Expansión Urbana y Periferias',
  ],
  academia: [
    'Hábitat Colectivo y Densidad',
    'Patrimonio y Memoria',
    'Vulnerabilidad Sísmica y Estructuras',
    'Urbanismo Crítico y Paisaje',
    'Materialidad Experimental y Tierra',
    'Tesis Universitaria / Licenciatura',
    'Investigación de Posgrado / Maestría',
  ],
};

export const VisualEditorialEditor: React.FC<VisualEditorialEditorProps> = ({
  initialArticle,
  onSave,
  onBack,
}) => {
  // Working draft state with automatic migration of studios
  const [article, setArticle] = useState<EditorialArticle>(() => {
    // Helper to resolve studios array with equal weighting
    const resolveStudios = (rawStudios?: string[], rawStudio?: string): string[] => {
      if (Array.isArray(rawStudios) && rawStudios.length > 0) {
        return rawStudios.map((s) => String(s).trim()).filter(Boolean);
      }
      if (rawStudio && typeof rawStudio === 'string') {
        const parts = rawStudio
          .split(/\s*(?:\+|\/|\&|,)\s*/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length > 0) return parts;
      }
      return [''];
    };

    // If local draft exists and is newer, initialize with it
    try {
      const stored = localStorage.getItem(`ea_draft_${initialArticle.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.updatedAt && parsed.updatedAt > (initialArticle.updatedAt || '')) {
          const studiosList = resolveStudios(parsed.studios, parsed.studio);
          return {
            ...parsed,
            studios: studiosList,
            studio: studiosList.join(' + ') || parsed.studio || 'ESTUDIO',
            hasCritica: parsed.hasCritica ?? Boolean(parsed.critica && parsed.critica.trim().length > 0 && !parsed.critica.includes('Dictamen crítico')),
            hasPodcast: parsed.hasPodcast ?? Boolean(parsed.podcast?.title),
            hasNotasComunidad: parsed.hasNotasComunidad ?? true,
          };
        }
      }
    } catch {}

    const initialStudiosList = resolveStudios(initialArticle.studios, initialArticle.studio);

    return {
      ...initialArticle,
      studios: initialStudiosList,
      studio: initialStudiosList.join(' + ') || initialArticle.studio || 'ESTUDIO',
      hasCritica: initialArticle.hasCritica ?? Boolean(initialArticle.critica && initialArticle.critica.trim().length > 0 && !initialArticle.critica.includes('Dictamen crítico')),
      hasPodcast: initialArticle.hasPodcast ?? Boolean(initialArticle.podcast?.title),
      hasNotasComunidad: initialArticle.hasNotasComunidad ?? true,
      modules: initialArticle.modules || [
        {
          id: `mod-intro-${Date.now()}`,
          type: 'hero-header',
          title: initialArticle.title,
          subtitle: initialArticle.subtitle || 'LECTURA ARQUITECTÓNICA',
          content: initialArticle.excerpt,
        },
        {
          id: `mod-text-${Date.now() + 1}`,
          type: 'rich-text',
          content: initialArticle.resena || initialArticle.excerpt,
        },
        {
          id: `mod-img-${Date.now() + 2}`,
          type: 'single-image',
          imageUrl: initialArticle.heroImage,
          caption: 'Registro fotográfico de la envolvente y materialidad',
          credits: initialArticle.datos?.fotografia || 'Registro EA',
        },
        {
          id: `mod-quote-${Date.now() + 3}`,
          type: 'blockquote',
          quoteText: initialArticle.memory || initialArticle.excerpt,
          quoteAuthor: initialArticle.studio || 'Autores',
        },
      ],
    };
  });

  const { getAllEditorialArticles, saveEditorialArticle } = useContent();
  const allArticles = getAllEditorialArticles ? getAllEditorialArticles() : [];

  // Dynamic tipología / category options combining presets, existing DB projects and current custom value
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);

  const sectionMeta = useMemo(() => getSectionMetadata(article.type), [article.type]);

  const categoryOptions = useMemo(() => {
    const typeDefaults = DEFAULT_CATEGORIES_BY_TYPE[article.type] || DEFAULT_CATEGORIES_BY_TYPE.proyectos;
    const set = new Set(typeDefaults);
    if (allArticles && Array.isArray(allArticles)) {
      allArticles.forEach((a) => {
        if (a.type === article.type && a.category && typeof a.category === 'string' && a.category.trim()) {
          set.add(a.category.trim());
        }
      });
    }
    if (article.category && typeof article.category === 'string' && article.category.trim()) {
      set.add(article.category.trim());
    }
    return Array.from(set);
  }, [allArticles, article.category, article.type]);

  const hasPhotographer = Boolean(article.photographer?.trim() || article.datos?.fotografia?.trim());
  const hasRenders = Boolean(article.renders?.trim() || article.datos?.renders?.trim());
  const hasMaestroMayor = Boolean(
    ((article as any).hasMaestroMayor !== false) &&
    (((article as any).maestroMayor && (article as any).maestroMayor.trim()) ||
     (article.datos?.maestroMayor && article.datos.maestroMayor.trim()))
  );

  const [isLandingModalOpen, setIsLandingModalOpen] = useState(false);
  const [showSecondaryInEditorPreview, setShowSecondaryInEditorPreview] = useState(false);

  // Hero Image Framing & Photo Selector State
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isProjectPhotosOpen, setIsProjectPhotosOpen] = useState(false);

  // Extract all existing project images for 1-click selection as hero cover
  const projectPhotos = useMemo(() => {
    const list: { url: string; label: string; type: string }[] = [];
    const seen = new Set<string>();

    const add = (url?: string, label?: string, type = 'Imagen') => {
      if (url && typeof url === 'string' && url.trim() && !seen.has(url)) {
        seen.add(url);
        list.push({ url, label: label || 'Imagen del proyecto', type });
      }
    };

    if (article.heroImage) add(article.heroImage, 'Portada actual', 'Portada');
    if (article.secondaryImageUrl) add(article.secondaryImageUrl, 'Fotografía secundaria', 'Interior');
    (article.gallery || []).forEach((u, i) => add(u, `Galería #${i + 1}`, 'Galería'));
    (article.modules || []).forEach((m) => {
      if (m.imageUrl) add(m.imageUrl, m.title || m.caption || 'Foto de módulo', m.type);
      (m.imageUrls || []).forEach((u, idx) => add(u, `Foto ${idx + 1} de galería`, 'Galería'));
      if (m.beforeImageUrl) add(m.beforeImageUrl, 'Antes', 'Comparativa');
      if (m.afterImageUrl) add(m.afterImageUrl, 'Después', 'Comparativa');
    });
    if (article.plans) {
      if (article.plans.planta) add(article.plans.planta, 'Planta arquitectónica', 'Planimetría');
      if (article.plans.corte) add(article.plans.corte, 'Corte arquitectónico', 'Planimetría');
      if (article.plans.axonometria) add(article.plans.axonometria, 'Axonometría', 'Planimetría');
    }

    return list;
  }, [article]);

  // Computed focal coordinates (X: 0-100%, Y: 0-100%)
  const [heroPosX, heroPosY] = useMemo(() => {
    if (article.heroImagePosition && article.heroImagePosition.includes('%')) {
      const parts = article.heroImagePosition.split(/\s+/);
      if (parts.length >= 2) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        if (!isNaN(x) && !isNaN(y)) return [Math.round(x), Math.round(y)];
      }
    }
    if (article.heroImageFocalPoint === 'top') return [50, 15];
    if (article.heroImageFocalPoint === 'bottom') return [50, 75];
    return [50, 50];
  }, [article.heroImagePosition, article.heroImageFocalPoint]);

  const heroZoom = Number(article.heroImageZoom) || 100;

  const updateHeroFraming = (x: number, y: number, zoom = heroZoom) => {
    const clampedX = Math.max(0, Math.min(100, Math.round(x)));
    const clampedY = Math.max(0, Math.min(100, Math.round(y)));
    const posStr = `${clampedX}% ${clampedY}%`;
    const focalCategory = clampedY < 35 ? 'top' : clampedY > 65 ? 'bottom' : 'center';

    setArticle((prev) => ({
      ...prev,
      heroImagePosition: posStr,
      heroImageFocalPoint: focalCategory,
      heroImageZoom: zoom,
    }));
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingHero(true);
    try {
      const uploadedUrl = await uploadImageFile(file);
      setArticle((prev) => ({
        ...prev,
        heroImage: uploadedUrl,
      }));
    } catch (err) {
      console.error('Error al subir imagen de portada:', err);
    } finally {
      setIsUploadingHero(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  // Active section for the sticky breadcrumb & sidebar highlight
  const [activeSection, setActiveSection] = useState<EditorSectionKey>('basica');

  // Collapsible section state (Opciones avanzadas closed by default)
  const [collapsedSections, setCollapsedSections] = useState<Record<EditorSectionKey, boolean>>({
    basica: false,
    fotos: false,
    descripcion: false,
    creditos: false,
    landing: false,
    modulos: false,
    avanzado: true, // Closed by default as required
  });

  const toggleSection = (key: EditorSectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setActiveSection(key);
  };

  // Folder Dossier Active Tab in Editor: Reseña, Crítica, Podcast, Comunidad
  const [activeFolderSection, setActiveFolderSection] = useState<'resena' | 'critica' | 'podcast' | 'comunidad'>('resena');
  const [addModuleTarget, setAddModuleTarget] = useState<'resena' | 'critica'>('resena');
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);

  // Device selector: desktop (~1440px), tablet (~768px), mobile (~390px)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewAppearance, setPreviewAppearance] = useState<'full' | 'landing' | 'card' | 'social' | 'google'>('full');
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);

  // Architecture SEO Auto-Optimizer (ArchDaily & Arquitectura Viva standard)
  const handleOptimizeArchitectureSeo = () => {
    const optimizedTitle = generateArchitectureTitle(article);
    const optimizedDesc = generateArchitectureDescription(article);
    const optimizedKeywords = generateArchitectureKeywords(article);

    setArticle((prev) => ({
      ...prev,
      seo: {
        ...(prev.seo || {}),
        metaTitle: optimizedTitle,
        metaDescription: optimizedDesc,
      },
      tags: optimizedKeywords,
    }));

    setToast({
      type: 'success',
      message: '✓ SEO optimizado al estándar ArchDaily y Arquitectura Viva: título con autoría, descripción para Google y miniatura lista.',
    });
  };
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<
    | 'hero'
    | 'secondary'
    | 'articleGallery'
    | { moduleId: string; field: 'imageUrl' | 'beforeImageUrl' | 'afterImageUrl' | 'galleryAdd'; isCritica?: boolean }
  >('hero');
  const [uploadingGalleryModId, setUploadingGalleryModId] = useState<string | null>(null);
  const [isUploadingArticleGallery, setIsUploadingArticleGallery] = useState(false);
  const [galleryUploadCategory, setGalleryUploadCategory] = useState<'fotografia' | 'planimetria'>('fotografia');

  // Friendly toast notification banner
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [autoSaveMsg, setAutoSaveMsg] = useState<string>('✓ Guardado en borrador');
  const [isPublishing, setIsPublishing] = useState(false);

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auto-save to localStorage on every change
  useEffect(() => {
    try {
      const draft = {
        ...article,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`ea_draft_${article.id}`, JSON.stringify(draft));
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setAutoSaveMsg(`✓ Borrador guardado (${time})`);
    } catch (e) {
      console.warn('Draft auto-save warning', e);
    }
  }, [article]);

  // Update root article field helper
  const updateField = <K extends keyof EditorialArticle>(field: K, value: EditorialArticle[K]) => {
    setArticle((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Studio management: Equal multi-studio support with no hierarchy
  const studiosList: string[] =
    article.studios && article.studios.length > 0
      ? article.studios
      : article.studio
      ? [article.studio]
      : [''];

  const handleStudioChange = (index: number, val: string) => {
    const updated = [...studiosList];
    updated[index] = val.toUpperCase();
    const joined = updated.filter(Boolean).join(' + ');
    setArticle((prev) => ({
      ...prev,
      studios: updated,
      studio: joined || 'ESTUDIO',
    }));
  };

  const handleAddStudio = () => {
    const updated = [...studiosList, ''];
    setArticle((prev) => ({
      ...prev,
      studios: updated,
    }));
  };

  const handleRemoveStudio = (index: number) => {
    const updated = studiosList.filter((_, i) => i !== index);
    const valid = updated.length > 0 ? updated : [''];
    const joined = valid.filter(Boolean).join(' + ');
    setArticle((prev) => ({
      ...prev,
      studios: valid,
      studio: joined || 'ESTUDIO',
    }));
  };

  // Update module helper (supports both resena and critica modules)
  const updateModule = (id: string, updatedFields: Partial<EditorialModuleItem>, isCritica: boolean = false) => {
    if (isCritica) {
      setArticle((prev) => ({
        ...prev,
        criticaModules: (prev.criticaModules || []).map((m) =>
          m.id === id ? { ...m, ...updatedFields } : m
        ),
      }));
    } else {
      setArticle((prev) => ({
        ...prev,
        modules: (prev.modules || []).map((m) =>
          m.id === id ? { ...m, ...updatedFields } : m
        ),
      }));
    }
  };

  // Add module
  const handleAddModule = (type: EditorialModuleType, atIndex?: number) => {
    const isCrit = addModuleTarget === 'critica';
    const targetIndex = atIndex !== undefined ? atIndex : (insertAtIndex !== null ? insertAtIndex : undefined);

    const newModule: EditorialModuleItem = {
      id: `mod-${type}-${Date.now()}`,
      type,
      title: type === 'title-subtitle' ? (isCrit ? 'ANÁLISIS DE IMPACTO' : 'NUEVA SECCIÓN') : undefined,
      content: type === 'rich-text' ? 'Escribe aquí el contenido analítico de este bloque...' : undefined,
      imageUrl: type === 'single-image' || type === 'fullscreen-image' ? article.heroImage : undefined,
      quoteText: type === 'blockquote' ? 'La arquitectura no es una forma, sino una respuesta a la geografía.' : undefined,
      quoteAuthor: type === 'blockquote' ? (isCrit ? (article.critic || 'Crítico') : (article.studio || 'Autor')) : undefined,
      caption: type === 'single-image' ? 'Registro fotográfico de obra' : undefined,
    };

    if (isCrit) {
      setArticle((prev) => {
        const list = [...(prev.criticaModules || [])];
        if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= list.length) {
          list.splice(targetIndex, 0, newModule);
        } else {
          list.push(newModule);
        }
        return { ...prev, criticaModules: list };
      });
    } else {
      setArticle((prev) => {
        const list = [...(prev.modules || [])];
        if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= list.length) {
          list.splice(targetIndex, 0, newModule);
        } else {
          list.push(newModule);
        }
        return { ...prev, modules: list };
      });
    }

    setExpandedModules((prev) => ({ ...prev, [newModule.id]: true }));
    setInsertAtIndex(null);
    setIsAddModuleOpen(false);
  };

  // Helper: Quickly insert an image module right after a specific module
  const handleInsertImageAfter = (index: number, isCritica: boolean = false) => {
    const newModuleId = `mod-single-image-${Date.now()}`;
    const newModule: EditorialModuleItem = {
      id: newModuleId,
      type: 'single-image',
      imageUrl: article.heroImage,
      caption: 'Registro fotográfico de obra',
      credits: article.datos?.fotografia || article.photographer || 'Registro EA',
    };

    const listKey = isCritica ? 'criticaModules' : 'modules';
    setArticle((prev) => {
      const list = [...(prev[listKey] || [])];
      list.splice(index + 1, 0, newModule);
      return { ...prev, [listKey]: list };
    });

    setExpandedModules((prev) => ({ ...prev, [newModuleId]: true }));
    setMediaTarget({ moduleId: newModuleId, field: 'imageUrl', isCritica });
    setIsMediaModalOpen(true);
  };

  // Helper: Split text by paragraph and insert an image module right in between
  const handleSplitTextAndInsertImage = (moduleId: string, isCritica: boolean = false) => {
    const listKey = isCritica ? 'criticaModules' : 'modules';
    const currentList = article[listKey] || [];
    const modIndex = currentList.findIndex((m) => m.id === moduleId);
    if (modIndex < 0) return;

    const currentMod = currentList[modIndex];
    const text = currentMod.content || '';

    const splitRegex = /\n\s*\n/;
    let parts = text.split(splitRegex);
    if (parts.length < 2) {
      const singleParts = text.split('\n');
      if (singleParts.length >= 2) {
        parts = [singleParts[0], singleParts.slice(1).join('\n')];
      }
    }

    const firstParagraph = parts[0]?.trim() || text;
    const remainingParagraphs = parts.length > 1
      ? parts.slice(1).join('\n\n').trim()
      : 'Continuación del análisis arquitectónico de la obra...';

    const imageModId = `mod-single-image-${Date.now()}`;
    const secondTextModId = `mod-rich-text-${Date.now() + 1}`;

    const updatedFirstMod: EditorialModuleItem = {
      ...currentMod,
      content: firstParagraph,
    };

    const imageMod: EditorialModuleItem = {
      id: imageModId,
      type: 'single-image',
      imageUrl: article.heroImage,
      caption: 'Registro fotográfico intermedio de la espacialidad',
      credits: article.datos?.fotografia || article.photographer || 'Registro EA',
    };

    const secondTextMod: EditorialModuleItem = {
      id: secondTextModId,
      type: 'rich-text',
      content: remainingParagraphs,
    };

    setArticle((prev) => {
      const list = [...(prev[listKey] || [])];
      list.splice(modIndex, 1, updatedFirstMod, imageMod, secondTextMod);
      return { ...prev, [listKey]: list };
    });

    setExpandedModules((prev) => ({
      ...prev,
      [imageModId]: true,
      [secondTextModId]: true,
    }));

    setMediaTarget({ moduleId: imageModId, field: 'imageUrl', isCritica });
    setIsMediaModalOpen(true);
  };

  // Reorder modules
  const moveModule = (index: number, direction: 'up' | 'down', isCritica: boolean = false) => {
    const listKey = isCritica ? 'criticaModules' : 'modules';
    const mods = [...(article[listKey] || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mods.length) return;

    const [moved] = mods.splice(index, 1);
    mods.splice(targetIndex, 0, moved);
    setArticle((prev) => ({ ...prev, [listKey]: mods }));
  };

  // Duplicate module
  const duplicateModule = (index: number, isCritica: boolean = false) => {
    const listKey = isCritica ? 'criticaModules' : 'modules';
    const mods = [...(article[listKey] || [])];
    const original = mods[index];
    const duplicated: EditorialModuleItem = {
      ...original,
      id: `mod-${original.type}-${Date.now()}`,
      title: original.title ? `${original.title} (Copia)` : undefined,
    };
    mods.splice(index + 1, 0, duplicated);
    setArticle((prev) => ({ ...prev, [listKey]: mods }));
    setExpandedModules((prev) => ({ ...prev, [duplicated.id]: true }));
  };

  // Delete module
  const deleteModule = (id: string, isCritica: boolean = false) => {
    const listKey = isCritica ? 'criticaModules' : 'modules';
    setArticle((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] || []).filter((m) => m.id !== id),
    }));
  };

  // Check whether Critica is active
  const isCriticaActive =
    article.hasCritica !== false &&
    (article.hasCritica === true || (typeof article.critica === 'string' && article.critica.trim().length > 0 && !article.critica.includes('Dictamen crítico')));

  const handleToggleCritica = (enable: boolean) => {
    if (enable) {
      setArticle((prev) => ({
        ...prev,
        hasCritica: true,
        critic: prev.critic || 'AL BORDE',
        criticaHeadline: prev.criticaHeadline || 'Desafiar la convención inmobiliaria desde la inercia térmica',
        critica: prev.critica || prev.excerpt || 'La pertinencia ética de esta obra radica en su economía de medios y la sobriedad constructiva en el contexto andino.',
        criticaQuote: prev.criticaQuote || 'Frente a la torre hermética vidriada, la pertinencia ética radica en la economía de medios y la inercia de la materia cruda.',
        criticaConclusion: prev.criticaConclusion || `El proyecto cuestiona el modelo hegemónico de torre de apartamentos en ${prev.location || 'el territorio'}.`,
      }));
    } else {
      setArticle((prev) => ({
        ...prev,
        hasCritica: false,
      }));
    }
  };

  const handleTogglePodcast = (enable: boolean) => {
    if (enable) {
      setArticle((prev) => ({
        ...prev,
        hasPodcast: true,
        podcast: {
          episode: prev.podcast?.episode || 'EP. 04',
          title: prev.podcast?.title || `Conversación de Obra: ${prev.title}`,
          duration: prev.podcast?.duration || '35 MIN',
          published: true,
          audioUrl: prev.podcast?.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        },
      }));
    } else {
      setArticle((prev) => ({
        ...prev,
        hasPodcast: false,
        podcast: prev.podcast ? { ...prev.podcast, published: false } : undefined,
      }));
    }
  };

  const handleToggleNotas = (enable: boolean) => {
    setArticle((prev) => ({
      ...prev,
      hasNotasComunidad: enable,
    }));
  };

  // Media Library Selection Handler
  const handleSelectMedia = (media: { url: string; caption?: string; credit?: string; alt?: string; focalPoint?: 'top' | 'center' | 'bottom' }) => {
    if (mediaTarget === 'hero') {
      updateField('heroImage', media.url);
      if (media.focalPoint) updateField('heroImageFocalPoint', media.focalPoint);
      if (media.caption) updateField('heroImageCaption', media.caption);
      if (media.credit) updateField('heroImageCredit', media.credit);
    } else if (mediaTarget === 'secondary') {
      updateField('secondaryImageUrl', media.url);
      if (media.caption) updateField('secondaryCaption', media.caption);
    } else if (mediaTarget === 'articleGallery') {
      const currentGallery = article.gallery || [];
      updateField('gallery', [...currentGallery, media.url]);
      const chosenCat = (media as any).category || galleryUploadCategory;
      updateField('imageCategories', {
        ...(article.imageCategories || {}),
        [media.url]: chosenCat,
      });
    } else if (typeof mediaTarget === 'object') {
      if (mediaTarget.field === 'galleryAdd') {
        const listKey = mediaTarget.isCritica ? 'criticaModules' : 'modules';
        const chosenCat = (media as any).category || 'fotografia';
        setArticle((prev) => ({
          ...prev,
          imageCategories: {
            ...(prev.imageCategories || {}),
            [media.url]: chosenCat,
          },
          [listKey]: (prev[listKey] || []).map((m) => {
            if (m.id === mediaTarget.moduleId) {
              return { ...m, imageUrls: [...(m.imageUrls || []), media.url] };
            }
            return m;
          }),
        }));
      } else {
        const chosenCat = (media as any).category;
        updateModule(
          mediaTarget.moduleId,
          {
            [mediaTarget.field]: media.url,
            caption: media.caption || undefined,
            credits: media.credit || undefined,
            ...(chosenCat ? { category: chosenCat } : {}),
          },
          Boolean(mediaTarget.isCritica)
        );
        if (chosenCat) {
          updateField('imageCategories', {
            ...(article.imageCategories || {}),
            [media.url]: chosenCat,
          });
        }
      }
    }
  };

  // Validation before save / publish
  const validateBeforeAction = (isPublish: boolean): boolean => {
    if (!article.title || !article.title.trim()) {
      setToast({
        type: 'error',
        message: 'Por favor escribe el título del proyecto antes de continuar.',
      });
      setActiveSection('basica');
      setCollapsedSections((prev) => ({ ...prev, basica: false }));
      return false;
    }
    if (isPublish && (!article.heroImage || !article.heroImage.trim())) {
      setToast({
        type: 'error',
        message: 'Por favor selecciona la fotografía principal de portada antes de publicar.',
      });
      setActiveSection('fotos');
      setCollapsedSections((prev) => ({ ...prev, fotos: false }));
      return false;
    }
    return true;
  };

  // Clean dummy placeholders and synchronize excerpt before save or publish
  const sanitizeArticleEditorialTexts = (art: EditorialArticle): EditorialArticle => {
    const cleanExcerpt = art.excerpt?.trim() || '';
    const rawResena = art.resena?.trim();
    const cleanResena = (!rawResena || rawResena.startsWith('Texto analítico')) ? cleanExcerpt : rawResena;
    return {
      ...art,
      excerpt: cleanExcerpt,
      resena: cleanResena,
    };
  };

  // Save draft
  const handleSaveDraft = () => {
    if (!validateBeforeAction(false)) return;
    const sanitized = sanitizeArticleEditorialTexts(article);
    setArticle(sanitized);
    onSave(sanitized, false);
    setToast({
      type: 'success',
      message: '✓ Proyecto guardado correctamente como borrador.',
    });
  };

  // Publish
  const handlePublish = () => {
    if (!validateBeforeAction(true)) return;
    setIsPublishing(true);
    const sanitized = sanitizeArticleEditorialTexts(article);
    const publishedArticle: EditorialArticle = {
      ...sanitized,
      status: 'published',
      updatedAt: new Date().toISOString(),
    };
    setArticle(publishedArticle);
    onSave(publishedArticle, true);
    setTimeout(() => {
      setIsPublishing(false);
      setToast({
        type: 'success',
        message: '✓ ¡Proyecto publicado con éxito en la web pública!',
      });
    }, 600);
  };

  // Friendly Quality Auditor for mobile & desktop
  const getQualityAuditorNotice = () => {
    if (!article.title || !article.title.trim()) {
      return {
        type: 'warning' as const,
        text: '⚠️ Falta ingresar el título del proyecto.',
      };
    }
    if (article.title.length > 38) {
      return {
        type: 'warning' as const,
        text: `⚠️ El título es algo extenso (${article.title.length} letras). Revisa la vista previa móvil para verificar que no se corte.`,
      };
    }
    if (!article.heroImage || !article.heroImage.trim()) {
      return {
        type: 'warning' as const,
        text: '⚠️ No has seleccionado una fotografía principal de portada.',
      };
    }
    if (!article.studio || article.studio === 'ESTUDIO' || article.studio.trim() === '') {
      return {
        type: 'warning' as const,
        text: '⚠️ Recuerda ingresar el arquitecto o estudio principal.',
      };
    }
    if (!article.excerpt || article.excerpt.trim() === '') {
      return {
        type: 'warning' as const,
        text: '⚠️ Añade un breve resumen para las tarjetas de portada y catálogo.',
      };
    }
    return {
      type: 'success' as const,
      text: '✓ Diseño verificado: textos legibles y proporciones fluidas en celular y computador.',
    };
  };

  const auditorNotice = getQualityAuditorNotice();

  // Helper to render individual module cards in Reseña or Crítica
  const renderModuleCard = (
    mod: EditorialModuleItem,
    index: number,
    isCritica: boolean,
    totalCount: number
  ) => {
    const isExpanded = expandedModules[mod.id] ?? false;
    const catalogDef = MODULE_CATALOG.find((c) => c.type === mod.type);
    const IconComponent = catalogDef?.icon || Layers;

    return (
      <div
        key={mod.id}
        className="bg-[#202020] border border-white/15 overflow-hidden transition-all shadow-sm"
      >
        {/* Module Header Bar */}
        <div className="p-3 bg-[#252525] flex items-center justify-between gap-2 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-5 h-5 bg-white/10 text-white font-mono text-[10px] flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <IconComponent className="w-3.5 h-3.5 text-white/60 shrink-0" />
            <span className="font-anton text-xs uppercase tracking-wider text-white truncate">
              {mod.title || catalogDef?.title || mod.type}
            </span>
          </div>

          {/* Module Controls (Move, Duplicate, Delete, Collapse) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => moveModule(index, 'up', isCritica)}
              className="p-1 text-white/50 hover:text-white disabled:text-white/20 transition-colors"
              title="Mover Arriba"
            >
              <MoveUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={index === totalCount - 1}
              onClick={() => moveModule(index, 'down', isCritica)}
              className="p-1 text-white/50 hover:text-white disabled:text-white/20 transition-colors"
              title="Mover Abajo"
            >
              <MoveDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => duplicateModule(index, isCritica)}
              className="p-1 text-white/50 hover:text-white transition-colors"
              title="Duplicar Módulo"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => deleteModule(mod.id, isCritica)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
              title="Eliminar Módulo"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() =>
                setExpandedModules((prev) => ({
                  ...prev,
                  [mod.id]: !isExpanded,
                }))
              }
              className="p-1 text-white/70 hover:text-white transition-colors ml-1"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Module Editing Body */}
        {isExpanded && (
          <div className="p-4 space-y-3.5 bg-[#1e1e1e] text-xs">
            {/* Title / Subtitle if applicable */}
            {(mod.type === 'hero-header' ||
              mod.type === 'title-subtitle' ||
              mod.type === 'video' ||
              mod.type === 'podcast' ||
              mod.type === 'technical-specs' ||
              mod.type === 'materials-list' ||
              mod.type === 'credits') && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
                  Título del Módulo
                </label>
                <input
                  type="text"
                  value={mod.title || ''}
                  onChange={(e) => updateModule(mod.id, { title: e.target.value }, isCritica)}
                  placeholder="ej. VACÍO ARTICULADOR & LUZ"
                  className="w-full bg-[#282828] border border-white/15 p-2 text-white font-medium focus:outline-none focus:border-white"
                />
              </div>
            )}

            {/* Subtitle */}
            {(mod.type === 'hero-header' || mod.type === 'title-subtitle') && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
                  Subtítulo / Kicker
                </label>
                <input
                  type="text"
                  value={mod.subtitle || ''}
                  onChange={(e) => updateModule(mod.id, { subtitle: e.target.value }, isCritica)}
                  placeholder="ej. ANÁLISIS TECTÓNICO"
                  className="w-full bg-[#282828] border border-white/15 p-2 text-white focus:outline-none focus:border-white"
                />
              </div>
            )}

            {/* Rich Text / Content */}
            {(mod.type === 'hero-header' || mod.type === 'rich-text' || mod.type === 'podcast') && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
                  Contenido Editorial (Párrafos)
                </label>
                <textarea
                  rows={4}
                  value={mod.content || ''}
                  onChange={(e) => updateModule(mod.id, { content: e.target.value }, isCritica)}
                  placeholder="Escribe el análisis arquitectónico aquí..."
                  className="w-full bg-[#282828] border border-white/15 p-2 text-white focus:outline-none focus:border-white resize-y"
                />
              </div>
            )}

            {/* Image Selector for Single Image & Fullscreen Image */}
            {(mod.type === 'single-image' || mod.type === 'fullscreen-image') && (
              <div className="space-y-3">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50">
                  Imagen del Módulo
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 bg-black border border-white/20 overflow-hidden shrink-0">
                    <img
                      src={mod.imageUrl || article.heroImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaTarget({ moduleId: mod.id, field: 'imageUrl', isCritica });
                      setIsMediaModalOpen(true);
                    }}
                    className="bg-white/10 hover:bg-white hover:text-black border border-white/20 px-3 py-1.5 text-xs font-anton uppercase tracking-wider transition-colors"
                  >
                    Cambiar Imagen
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-0.5">
                      Pie de Foto
                    </label>
                    <input
                      type="text"
                      value={mod.caption || ''}
                      onChange={(e) => updateModule(mod.id, { caption: e.target.value }, isCritica)}
                      placeholder="Descripción de la toma..."
                      className="w-full bg-[#282828] border border-white/15 p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-0.5">
                      Crédito Fotográfico
                    </label>
                    <input
                      type="text"
                      value={mod.credits || ''}
                      onChange={(e) => updateModule(mod.id, { credits: e.target.value }, isCritica)}
                      placeholder="ej. Bicubik"
                      className="w-full bg-[#282828] border border-white/15 p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Categoría para Carrusel Lightbox */}
                <div className="pt-1">
                  <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                    Categoría en Carrusel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateModule(mod.id, { category: 'fotografia' }, isCritica);
                        if (mod.imageUrl) {
                          updateField('imageCategories', {
                            ...(article.imageCategories || {}),
                            [mod.imageUrl]: 'fotografia',
                          });
                        }
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-anton uppercase tracking-wider border cursor-pointer transition-colors ${
                        (mod.category || (mod.imageUrl && article.imageCategories?.[mod.imageUrl]) || 'fotografia') === 'fotografia'
                          ? 'bg-white text-black border-white font-bold shadow-sm'
                          : 'bg-[#282828] text-white/60 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Fotografía de Obra</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateModule(mod.id, { category: 'planimetria' }, isCritica);
                        if (mod.imageUrl) {
                          updateField('imageCategories', {
                            ...(article.imageCategories || {}),
                            [mod.imageUrl]: 'planimetria',
                          });
                        }
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-anton uppercase tracking-wider border cursor-pointer transition-colors ${
                        (mod.category || (mod.imageUrl && article.imageCategories?.[mod.imageUrl])) === 'planimetria'
                          ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-sm'
                          : 'bg-[#282828] text-white/60 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Planimetría / Diagrama</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Image Gallery module */}
            {mod.type === 'image-gallery' && (
              <div className="space-y-4 pt-1">
                {/* Título de la galería */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1">
                    Título de la Galería (Opcional)
                  </label>
                  <input
                    type="text"
                    value={mod.title || ''}
                    onChange={(e) => updateModule(mod.id, { title: e.target.value }, isCritica)}
                    placeholder="ej. DETALLES CONSTRUCTIVOS & VISTAS INTERIORES"
                    className="w-full bg-[#282828] border border-white/15 p-2 text-xs text-white uppercase focus:border-white focus:outline-none"
                  />
                </div>

                {/* Configuración de Columnas & Categoría del Bloque */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                      Distribución de Cuadrícula
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([2, 3, 4] as const).map((cols) => (
                        <button
                          key={cols}
                          type="button"
                          onClick={() =>
                            updateModule(
                              mod.id,
                              { settings: { ...(mod.settings || {}), columns: cols } },
                              isCritica
                            )
                          }
                          className={`py-1.5 text-xs font-mono uppercase border transition-colors ${
                            (mod.settings?.columns || 3) === cols
                              ? 'bg-white text-black border-white font-bold'
                              : 'bg-[#282828] text-white/60 border-white/15 hover:text-white'
                          }`}
                        >
                          {cols} Col
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                      Categoría en Carrusel
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          updateModule(mod.id, { category: 'fotografia' }, isCritica);
                          const updatedCats = { ...(article.imageCategories || {}) };
                          (mod.imageUrls || []).forEach((u) => {
                            updatedCats[u] = 'fotografia';
                          });
                          updateField('imageCategories', updatedCats);
                        }}
                        className={`py-1.5 px-2 text-xs font-anton uppercase border flex items-center justify-center gap-1 transition-colors ${
                          (mod.category || 'fotografia') === 'fotografia'
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-[#282828] text-white/60 border-white/15 hover:border-white/30'
                        }`}
                      >
                        <Camera className="w-3 h-3" />
                        <span>Fotos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateModule(mod.id, { category: 'planimetria' }, isCritica);
                          const updatedCats = { ...(article.imageCategories || {}) };
                          (mod.imageUrls || []).forEach((u) => {
                            updatedCats[u] = 'planimetria';
                          });
                          updateField('imageCategories', updatedCats);
                        }}
                        className={`py-1.5 px-2 text-xs font-anton uppercase border flex items-center justify-center gap-1 transition-colors ${
                          mod.category === 'planimetria'
                            ? 'bg-amber-400 text-black border-amber-400 font-bold'
                            : 'bg-[#282828] text-white/60 border-white/15 hover:border-white/30'
                        }`}
                      >
                        <Compass className="w-3 h-3" />
                        <span>Planos</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción para Añadir Imágenes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
                      Añadir Imágenes a la Galería ({(mod.imageUrls || []).length} fotos)
                    </label>
                    <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>WebP 2560px Auto</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Subir desde computadora (Múltiples archivos) */}
                    <label className={`flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-anton text-xs uppercase tracking-wider cursor-pointer border border-emerald-400 transition-colors ${uploadingGalleryModId === mod.id ? 'opacity-70 pointer-events-none' : ''}`}>
                      {uploadingGalleryModId === mod.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingGalleryModId === mod.id ? 'Subiendo...' : 'Subir desde PC'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingGalleryModId === mod.id}
                        className="hidden"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          setUploadingGalleryModId(mod.id);
                          try {
                            const urls = await uploadMultipleImages(e.target.files);
                            const current = mod.imageUrls || [];
                            updateModule(mod.id, { imageUrls: [...current, ...urls] }, isCritica);
                            setToast({
                              type: 'success',
                              message: `✓ Se subieron ${urls.length} fotos a la galería exitosamente.`,
                            });
                          } catch (err) {
                            setToast({ type: 'error', message: 'Error al subir fotos' });
                          } finally {
                            setUploadingGalleryModId(null);
                          }
                        }}
                      />
                    </label>

                    {/* Elegir de la Biblioteca Multimedia */}
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget({ moduleId: mod.id, field: 'galleryAdd', isCritica });
                        setIsMediaModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/10 hover:bg-white hover:text-black text-white font-anton text-xs uppercase tracking-wider border border-white/20 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>De Biblioteca</span>
                    </button>
                  </div>

                  {/* Input para pegar URL directa */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="url"
                      id={`url-input-${mod.id}`}
                      placeholder="Pegar enlace https://..."
                      className="flex-1 bg-[#282828] border border-white/15 p-1.5 text-xs text-white font-mono focus:border-white focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          if (input.value.trim()) {
                            const current = mod.imageUrls || [];
                            updateModule(mod.id, { imageUrls: [...current, input.value.trim()] }, isCritica);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(`url-input-${mod.id}`) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const current = mod.imageUrls || [];
                          updateModule(mod.id, { imageUrls: [...current, input.value.trim()] }, isCritica);
                          input.value = '';
                        }
                      }}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white hover:text-black text-white text-[11px] font-anton uppercase tracking-wider border border-white/20"
                    >
                      + Añadir
                    </button>
                  </div>

                  {uploadingGalleryModId === mod.id && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono py-1">
                      <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Subiendo imágenes y guardando en disco...</span>
                    </div>
                  )}
                </div>

                {/* Cuadrícula de miniaturas para reordenar y eliminar */}
                {(!mod.imageUrls || mod.imageUrls.length === 0) ? (
                  <div className="p-4 border border-dashed border-white/15 text-center text-white/40 text-xs font-mono">
                    Galería vacía. Sube fotos desde tu equipo o elígelas de la biblioteca.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-white/50">
                      <span>Fotos en la Galería ({mod.imageUrls.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('¿Seguro que deseas vaciar todas las fotos de esta galería?')) {
                            updateModule(mod.id, { imageUrls: [] }, isCritica);
                          }
                        }}
                        className="text-red-400/80 hover:text-red-300 underline"
                      >
                        Vaciar galería
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {mod.imageUrls.map((url, imgIdx) => {
                        const itemCat =
                          mod.imageCategories?.[url] ||
                          article.imageCategories?.[url] ||
                          mod.category ||
                          detectImageCategory(url);

                        return (
                          <div
                            key={`${url}-${imgIdx}`}
                            className="group relative aspect-square bg-black border border-white/20 overflow-hidden rounded-[2px]"
                          >
                            <img
                              src={url}
                              alt={`Foto ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-1 left-1 bg-black/80 text-white font-mono text-[9px] px-1 py-0.2 rounded">
                              #{imgIdx + 1}
                            </span>

                            {/* Badge categoría clicable */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextCat = itemCat === 'planimetria' ? 'fotografia' : 'planimetria';
                                updateModule(
                                  mod.id,
                                  {
                                    imageCategories: {
                                      ...(mod.imageCategories || {}),
                                      [url]: nextCat,
                                    },
                                  },
                                  isCritica
                                );
                                updateField('imageCategories', {
                                  ...(article.imageCategories || {}),
                                  [url]: nextCat,
                                });
                                setToast({
                                  type: 'success',
                                  message: `Foto #${imgIdx + 1} cambiada a ${nextCat === 'planimetria' ? 'Planimetría' : 'Fotografía'}`
                                });
                              }}
                              title="Clic para cambiar: Fotografía <-> Planimetría"
                              className={`absolute bottom-1 left-1 px-1.5 py-0.5 text-[8.5px] font-mono uppercase tracking-wider rounded-[1px] flex items-center gap-1 shadow-md transition-all cursor-pointer z-10 ${
                                itemCat === 'planimetria'
                                  ? 'bg-amber-400 text-black font-bold hover:bg-amber-300'
                                  : 'bg-black/80 text-emerald-300 border border-emerald-500/40 hover:bg-black'
                              }`}
                            >
                              {itemCat === 'planimetria' ? (
                                <>
                                  <Compass className="w-2.5 h-2.5" />
                                  <span>Plano</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-2.5 h-2.5" />
                                  <span>Foto</span>
                                </>
                              )}
                            </button>

                            {/* Botones flotantes de control */}
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-1 transition-opacity z-20 pointer-events-none group-hover:pointer-events-auto">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (mod.imageUrls || []).filter((_, i) => i !== imgIdx);
                                    updateModule(mod.id, { imageUrls: updated }, isCritica);
                                  }}
                                  title="Eliminar de la galería"
                                  className="p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-xs"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex justify-between items-center">
                                <button
                                  type="button"
                                  disabled={imgIdx === 0}
                                  onClick={() => {
                                    if (imgIdx === 0) return;
                                    const list = [...(mod.imageUrls || [])];
                                    const [item] = list.splice(imgIdx, 1);
                                    list.splice(imgIdx - 1, 0, item);
                                    updateModule(mod.id, { imageUrls: list }, isCritica);
                                  }}
                                  title="Mover a la izquierda"
                                  className="p-1 bg-white/20 hover:bg-white hover:text-black text-white rounded-xs disabled:opacity-20 disabled:pointer-events-none"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={imgIdx === (mod.imageUrls || []).length - 1}
                                  onClick={() => {
                                    if (imgIdx === (mod.imageUrls || []).length - 1) return;
                                    const list = [...(mod.imageUrls || [])];
                                    const [item] = list.splice(imgIdx, 1);
                                    list.splice(imgIdx + 1, 0, item);
                                    updateModule(mod.id, { imageUrls: list }, isCritica);
                                  }}
                                  title="Mover a la derecha"
                                  className="p-1 bg-white/20 hover:bg-white hover:text-black text-white rounded-xs disabled:opacity-20 disabled:pointer-events-none"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pie de Foto & Créditos Fotográficos de la Galería */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-0.5">
                      Pie de Foto Global
                    </label>
                    <input
                      type="text"
                      value={mod.caption || ''}
                      onChange={(e) => updateModule(mod.id, { caption: e.target.value }, isCritica)}
                      placeholder="Descripción de la serie fotográfica..."
                      className="w-full bg-[#282828] border border-white/15 p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-0.5">
                      Crédito Fotográfico
                    </label>
                    <input
                      type="text"
                      value={mod.credits || ''}
                      onChange={(e) => updateModule(mod.id, { credits: e.target.value }, isCritica)}
                      placeholder="Opcional (ej. JAG Studio)"
                      className="w-full bg-[#282828] border border-white/15 p-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Blockquote module */}
            {mod.type === 'blockquote' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
                    Texto de la Cita *
                  </label>
                  <textarea
                    rows={3}
                    value={mod.quoteText || mod.content || ''}
                    onChange={(e) =>
                      updateModule(mod.id, { quoteText: e.target.value, content: e.target.value }, isCritica)
                    }
                    placeholder="Cita textual del autor o crítico..."
                    className="w-full bg-[#282828] border border-white/15 p-2 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
                    Autor de la Cita
                  </label>
                  <input
                    type="text"
                    value={mod.quoteAuthor || ''}
                    onChange={(e) => updateModule(mod.id, { quoteAuthor: e.target.value }, isCritica)}
                    placeholder="ej. David Barragán (Al Borde)"
                    className="w-full bg-[#282828] border border-white/15 p-2 text-white"
                  />
                </div>
              </div>
            )}

            {/* Comparison module */}
            {mod.type === 'image-comparison' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                      Imagen Izquierda (Antes / Plano)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget({ moduleId: mod.id, field: 'beforeImageUrl', isCritica });
                        setIsMediaModalOpen(true);
                      }}
                      className="w-full bg-white/10 hover:bg-white hover:text-black py-1.5 text-[10px] font-anton uppercase border border-white/20"
                    >
                      Elegir Imagen 1
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                      Imagen Derecha (Después / Foto)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget({ moduleId: mod.id, field: 'afterImageUrl', isCritica });
                        setIsMediaModalOpen(true);
                      }}
                      className="w-full bg-white/10 hover:bg-white hover:text-black py-1.5 text-[10px] font-anton uppercase border border-white/20"
                    >
                      Elegir Imagen 2
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video module */}
            {mod.type === 'video' && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
                  Enlace de Video (YouTube / Vimeo / MP4)
                </label>
                <input
                  type="url"
                  value={mod.videoUrl || ''}
                  onChange={(e) => updateModule(mod.id, { videoUrl: e.target.value }, isCritica)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#282828] border border-white/15 p-2 text-white"
                />
              </div>
            )}

            {/* Podcast module */}
            {mod.type === 'podcast' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                    Código Episodio
                  </label>
                  <input
                    type="text"
                    value={mod.episode || ''}
                    onChange={(e) => updateModule(mod.id, { episode: e.target.value }, isCritica)}
                    placeholder="EA-POD-02"
                    className="w-full bg-[#282828] border border-white/15 p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={mod.duration || ''}
                    onChange={(e) => updateModule(mod.id, { duration: e.target.value }, isCritica)}
                    placeholder="42 min"
                    className="w-full bg-[#282828] border border-white/15 p-1.5 text-white"
                  />
                </div>
              </div>
            )}

            {/* Quick Actions for Paragraphs & Media Insertion */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleInsertImageAfter(index, isCritica)}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white hover:text-black border border-white/20 text-[10.5px] font-anton uppercase tracking-wider flex items-center gap-1.5 transition-colors text-white shadow-sm"
                title="Inserta una foto inmediatamente después de este bloque y abre la biblioteca multimedia"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Insertar Imagen Después</span>
              </button>

              {mod.type === 'rich-text' && (
                <button
                  type="button"
                  onClick={() => handleSplitTextAndInsertImage(mod.id, isCritica)}
                  className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 hover:text-black border border-emerald-500/40 text-[10.5px] font-anton uppercase tracking-wider flex items-center gap-1.5 transition-colors text-emerald-300 hover:text-black shadow-sm"
                  title="Divide el texto en el primer párrafo e inserta un bloque de imagen en medio"
                >
                  <span>✂️ Dividir en 2 e Insertar Foto en Medio</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAddModuleTarget(isCritica ? 'critica' : 'resena');
                  setInsertAtIndex(index + 1);
                  setIsAddModuleOpen(true);
                }}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 border border-white/15 text-[10.5px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors text-white/60 hover:text-white"
                title="Añade cualquier otro tipo de bloque modular en esta posición"
              >
                <Plus className="w-3 h-3" />
                <span>Insertar Otro Bloque...</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] text-white flex flex-col font-inter overflow-hidden select-none">
      {/* ==================================================================== */}
      {/* 1. TOP STICKY BREADCRUMB HEADER (Always know what you are editing)   */}
      {/* ==================================================================== */}
      <header className="h-14 bg-[#181818] border-b border-white/15 px-3 sm:px-5 flex items-center justify-between flex-shrink-0 z-30 sticky top-0 shadow-md">
        {/* Left: Back & Live Sticky Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-mono uppercase text-white/70 hover:text-white px-2.5 py-1.5 border border-white/20 hover:border-white transition-colors bg-white/5 shrink-0"
            title="Volver al panel principal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panel</span>
          </button>

          {/* Sticky Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono truncate border-l border-white/15 pl-3">
            <span className="text-white/40 hidden md:inline">Editando:</span>
            <span className="px-1.5 py-0.5 bg-white/10 text-white font-anton uppercase text-[10px] tracking-wider rounded shrink-0">
              {article.type === 'proyectos' ? 'Proyecto' : article.type === 'territorios' ? 'Territorio' : 'Academia'}
            </span>
            <span className="text-white/30 select-none">›</span>
            <span
              className="font-anton text-white uppercase truncate max-w-[140px] sm:max-w-[220px]"
              title={article.title}
            >
              {article.title || 'NUEVO PROYECTO'}
            </span>
            <span className="text-white/30 select-none">›</span>
            <span className="text-emerald-400 font-semibold truncate text-[11px] sm:text-xs">
              {sectionMeta[activeSection].title}
            </span>
          </div>
        </div>

        {/* Center: Device Selector (Computador, Tablet, Celular) */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center bg-black/60 p-1 border border-white/15 rounded">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all ${
                previewDevice === 'desktop' ? 'bg-white text-black font-bold shadow-xs' : 'text-white/60 hover:text-white'
              }`}
              title="Computador (~1440px)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[10px] font-anton tracking-wider uppercase">Computador</span>
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all ${
                previewDevice === 'tablet' ? 'bg-white text-black font-bold shadow-xs' : 'text-white/60 hover:text-white'
              }`}
              title="Tablet (~768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="text-[10px] font-anton tracking-wider uppercase">Tablet</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-2.5 py-1 text-xs flex items-center gap-1.5 transition-all ${
                previewDevice === 'mobile' ? 'bg-white text-black font-bold shadow-xs' : 'text-white/60 hover:text-white'
              }`}
              title="Celular (~390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[10px] font-anton tracking-wider uppercase">Celular</span>
            </button>
          </div>

          {/* Appearance selector */}
          <div className="flex items-center bg-black/60 p-1 border border-white/15 rounded">
            <button
              onClick={() => setPreviewAppearance('full')}
              className={`px-2.5 py-1 text-[10px] font-anton tracking-wider uppercase transition-colors ${
                previewAppearance === 'full' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              Página Completa
            </button>
            <button
              onClick={() => setPreviewAppearance('landing')}
              className={`px-2.5 py-1 text-[10px] font-anton tracking-wider uppercase transition-colors flex items-center gap-1 ${
                previewAppearance === 'landing' ? 'bg-white text-black' : 'text-emerald-400 hover:text-white'
              }`}
              title="Previsualizar Tarjeta del Mazo en Landing"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Tarjeta Portada</span>
            </button>
            <button
              onClick={() => setPreviewAppearance('card')}
              className={`px-2.5 py-1 text-[10px] font-anton tracking-wider uppercase transition-colors ${
                previewAppearance === 'card' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setPreviewAppearance('google')}
              className={`px-2.5 py-1 text-[10px] font-anton tracking-wider uppercase transition-colors flex items-center gap-1 ${
                previewAppearance === 'google' ? 'bg-[#1a73e8] text-white shadow-xs font-bold' : 'text-sky-400 hover:text-white'
              }`}
              title="Previsualizar cómo aparece en las búsquedas de Google"
            >
              <Globe className="w-3 h-3 text-sky-400" />
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Right: Actions (Simulator, Save, Publish) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setIsLandingModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 sm:px-3 py-1.5 text-xs font-anton tracking-wider uppercase hover:bg-emerald-500/30 transition-colors"
            title="Abrir Simulador de Previews en Móviles en Pantalla Completa"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulador Móvil</span>
          </button>

          <button
            onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
            className="p-1.5 border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-colors hidden xl:inline-flex"
            title={isFullScreenPreview ? 'Salir de pantalla completa' : 'Vista previa a pantalla completa'}
          >
            {isFullScreenPreview ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 bg-[#252525] border border-white/30 text-white hover:bg-white/15 px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-all shadow-xs"
            title="Guardar borrador sin publicar en la web todavía"
          >
            <Save className="w-3.5 h-3.5 text-white/80" />
            <span className="hidden sm:inline">Guardar</span>
          </button>

          {/* Publish Button */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-1.5 bg-white text-black hover:bg-neutral-200 disabled:bg-white/50 px-3.5 sm:px-4 py-1.5 text-xs font-anton tracking-wider uppercase transition-all shadow-md font-bold"
            title="Publicar este proyecto directamente en la web"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isPublishing ? 'PUBLICANDO...' : 'PUBLICAR EN LA WEB'}</span>
          </button>
        </div>
      </header>

      {/* Floating Toast Alert Banner */}
      {toast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] flex items-center justify-between p-3.5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 border rounded"
          style={{
            backgroundColor: toast.type === 'error' ? '#2d1515' : toast.type === 'success' ? '#14291e' : '#1e2430',
            borderColor: toast.type === 'error' ? '#f87171' : toast.type === 'success' ? '#34d399' : '#60a5fa',
            color: '#fff',
          }}
        >
          <div className="flex items-center gap-2.5 text-xs font-medium">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-white/60 hover:text-white p-1 ml-3"
            title="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MAIN WORKSPACE (Two-Panel Layout)                                 */}
      {/* ==================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================================================================== */}
        {/* LEFT PANEL: SIMPLIFIED COLLAPSIBLE FORM SECTIONS                   */}
        {/* ================================================================== */}
        {!isFullScreenPreview && (
          <aside className="w-full md:w-[480px] lg:w-[520px] bg-[#161616] border-r border-white/10 flex flex-col flex-shrink-0 z-10 overflow-hidden">
            {/* Quick-Jump Section Navigation Tabs */}
            <div className="bg-[#1c1c1c] border-b border-white/10 p-2 flex items-center gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
              {(
                [
                  { key: 'basica', label: '1. Básica' },
                  { key: 'fotos', label: '2. Fotos' },
                  { key: 'descripcion', label: '3. Memoria' },
                  { key: 'creditos', label: '4. Ficha' },
                  { key: 'landing', label: '5. Portada' },
                  { key: 'modulos', label: '6. Módulos' },
                  { key: 'avanzado', label: '7. Avanzado' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveSection(tab.key);
                    setCollapsedSections((prev) => ({ ...prev, [tab.key]: false }));
                    const el = document.getElementById(`section-${tab.key}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-anton uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeSection === tab.key
                      ? 'bg-white text-black shadow-xs'
                      : 'text-white/60 hover:text-white bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Form Body with the 7 Collapsible Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ------------------------------------------------------------ */}
              {/* SECCIÓN 1: INFORMACIÓN BÁSICA DEL PROYECTO                   */}
              {/* ------------------------------------------------------------ */}
              <div
                id="section-basica"
                className={`bg-[#1c1c1c] border transition-all ${
                  activeSection === 'basica' ? 'border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40' : 'border-white/15'
                }`}
                onFocus={() => setActiveSection('basica')}
                onClick={() => setActiveSection('basica')}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('basica')}
                  className="w-full p-3.5 flex items-center justify-between text-left bg-[#222222] border-b border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-white/10 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white">
                        {sectionMeta.basica.title}
                      </h3>
                      <p className="text-[10.5px] text-white/50 font-sans">
                        {sectionMeta.basica.subtitle}
                      </p>
                    </div>
                  </div>
                  {collapsedSections.basica ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronUp className="w-4 h-4 text-white/60" />}
                </button>

                {!collapsedSections.basica && (
                  <div className="p-4 space-y-4">
                    {/* Título Principal */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                        {article.type === 'territorios'
                          ? 'Título del Expediente Territorial *'
                          : article.type === 'academia'
                          ? 'Título de la Investigación / Tesis *'
                          : 'Título Principal de la Obra *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={article.title}
                        onChange={(e) => updateField('title', e.target.value.toUpperCase())}
                        placeholder={
                          article.type === 'territorios'
                            ? 'ej. CIUDAD Y RÍO: CUENCA DEL GUAYAS'
                            : article.type === 'academia'
                            ? 'ej. VIVIENDA PRODUCTIVA EN EL CENTRO HISTÓRICO'
                            : 'ej. CASA LOS CEDROS'
                        }
                        className="w-full bg-[#242424] border border-white/20 p-2.5 text-sm text-white font-medium uppercase focus:border-white focus:outline-none"
                      />
                      <p className="text-[10px] text-white/40 mt-1">
                        El nombre principal tal como aparecerá en el encabezado y en el catálogo.
                      </p>
                    </div>

                    {/* Subtítulo Opcional */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                        {article.type === 'territorios'
                          ? 'Subtítulo / Ámbito (ej. GUAYAS Y LITORAL)'
                          : article.type === 'academia'
                          ? 'Subtítulo / Mención Académica'
                          : 'Subtítulo del Proyecto (Opcional)'}
                      </label>
                      <input
                        type="text"
                        value={article.subtitle || ''}
                        onChange={(e) => updateField('subtitle', e.target.value.toUpperCase())}
                        placeholder={
                          article.type === 'territorios'
                            ? 'ej. EXPEDIENTE TERRITORIAL'
                            : article.type === 'academia'
                            ? 'ej. INVESTIGACIÓN ACADÉMICA'
                            : 'ej. VACÍO, INERCIA Y PAISAJE ANDINO'
                        }
                        className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white uppercase focus:border-white focus:outline-none"
                      />
                      <p className="text-[10px] text-white/40 mt-1">
                        Frase corta conceptual o lema de la publicación.
                      </p>
                    </div>

                    {/* AUTORES / COLECTIVO / ESTUDIOS PRINCIPALES */}
                    <div className="bg-[#222] border border-white/10 p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                          <AuthorIcon className="h-3.5 w-auto text-emerald-400" />
                          <span>
                            {article.type === 'territorios'
                              ? 'Colectivo o Equipo Territorial Principal'
                              : article.type === 'academia'
                              ? 'Autor(es) / Tesista(s)'
                              : 'Arquitecto o Estudios Principales'}
                          </span>
                        </label>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {studiosList.length > 1
                            ? `${studiosList.length} ${article.type === 'territorios' ? 'Colectivos' : article.type === 'academia' ? 'Autores' : 'Estudios'}`
                            : `1 ${article.type === 'territorios' ? 'Colectivo' : article.type === 'academia' ? 'Autor' : 'Estudio'}`}
                        </span>
                      </div>

                      <p className="text-[11px] text-white/60 font-sans leading-relaxed">
                        {article.type === 'territorios'
                          ? 'Escribe el colectivo o equipo de investigación. Si hay varios grupos colaboradores, agrégalos con igual peso.'
                          : article.type === 'academia'
                          ? 'Escribe el nombre del autor o tesista principal. Puedes añadir coautores o colaboradores con el mismo peso.'
                          : 'Escribe el arquitecto o estudio principal. Si hay varios estudios, agrégalos todos con el mismo peso.'}
                      </p>

                      <div className="space-y-2">
                        {studiosList.map((st, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-white/50 w-28 shrink-0">
                              {article.type === 'territorios'
                                ? (studiosList.length === 1 ? 'Colectivo:' : `Colectivo ${idx + 1}:`)
                                : article.type === 'academia'
                                ? (studiosList.length === 1 ? 'Autor / Tesista:' : `Coautor ${idx + 1}:`)
                                : (studiosList.length === 1 ? 'Estudio:' : `Estudio ${idx + 1}:`)}
                            </span>
                            <div className="flex-1">
                              <ProfileSearchSelect
                                type="author"
                                value={st}
                                onChange={(val) => handleStudioChange(idx, val)}
                                placeholder={
                                  article.type === 'territorios'
                                    ? 'ej. ESTUDIO URBANO LITORAL'
                                    : article.type === 'academia'
                                    ? 'ej. MATEO SÁNCHEZ'
                                    : 'ej. RAMA ESTUDIO'
                                }
                              />
                            </div>
                            {studiosList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStudio(idx)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer"
                                title="Eliminar este ítem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleAddStudio}
                        className="inline-flex items-center gap-1.5 text-xs font-anton uppercase tracking-wider text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 border border-emerald-500/30 transition-all mt-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {article.type === 'territorios'
                            ? '+ Agregar Otro Colectivo / Autor'
                            : article.type === 'academia'
                            ? '+ Agregar Otro Autor / Coautor'
                            : '+ Agregar Otro Estudio Principal'}
                        </span>
                      </button>

                      {/* Control de Popup de Perfil de Autor */}
                      <div className="mt-3 p-3 bg-[#181818] border border-white/10 rounded-xs space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(article.enableAuthorModal)}
                            onChange={(e) => updateField('enableAuthorModal', e.target.checked)}
                            className="rounded bg-[#242424] border-white/30 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                          />
                          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                            Abrir perfil de autor como ventana emergente (popup)
                          </span>
                        </label>
                        <p className="text-[10.5px] font-mono text-white/50 pl-6">
                          {article.enableAuthorModal
                            ? '✓ Activado: Al hacer clic en el nombre en la ficha del proyecto se abrirá el dossier del estudio (requiere perfil registrado).'
                            : '✕ Desactivado (Por defecto): En la web solo se mostrará el nombre como texto plano sin popup. No es obligatorio crear un perfil.'}
                        </p>
                      </div>
                    </div>

                    {/* Ubicación y Año */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                          {article.type === 'territorios' ? 'Territorio o Región *' : 'Ciudad o Ubicación General *'}
                        </label>
                        <input
                          type="text"
                          value={article.location || ''}
                          onChange={(e) => updateField('location', e.target.value.toUpperCase())}
                          placeholder={article.type === 'territorios' ? 'ej. GUAYAS Y LITORAL' : 'ej. QUITO'}
                          className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white uppercase focus:border-white focus:outline-none"
                        />
                        <p className="text-[10px] text-white/40 mt-1">
                          {article.type === 'territorios' ? 'Región o cuenca territorial analizada.' : 'Ciudad o cantón del proyecto.'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                          {article.type === 'territorios'
                            ? 'Año del Expediente *'
                            : article.type === 'academia'
                            ? 'Año de Defensa / Publicación *'
                            : 'Año de Finalización *'}
                        </label>
                        <input
                          type="text"
                          value={article.year || ''}
                          onChange={(e) => updateField('year', e.target.value)}
                          placeholder="ej. 2026"
                          className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                        />
                        <p className="text-[10px] text-white/40 mt-1">
                          Año de registro oficial.
                        </p>
                      </div>
                    </div>

                    {/* Dirección, Barrio o Sector Específico */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                        Dirección, Barrio o Sector Específico (Opcional)
                      </label>
                      <input
                        type="text"
                        value={article.ciudad?.barrio || article.datos?.ubicacion || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateField('ciudad', { ...(article.ciudad || {}), barrio: val });
                          updateField('datos', { ...(article.datos || {}), ubicacion: val });
                        }}
                        placeholder="ej. Boulevard 24 de Mayo, Centro Histórico (o deja vacío)"
                        className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                      />
                      <p className="text-[10px] text-white/40 mt-1">
                        Si lo dejas vacío, en la web solo se mostrará la ciudad sin duplicaciones.
                      </p>
                    </div>

                    {/* Clasificación Editorial */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1.5">
                        Clasificación de la Publicación
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['proyectos', 'territorios', 'academia'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateField('type', t)}
                            className={`py-2 px-2 text-center text-xs font-anton uppercase tracking-wider border transition-colors cursor-pointer ${
                              article.type === t
                                ? 'bg-white text-black border-white'
                                : 'bg-[#242424] text-white/60 border-white/15 hover:text-white'
                            }`}
                          >
                            {t === 'proyectos' ? '🏛️ Proyectos' : t === 'territorios' ? '🗺️ Territorios' : '🎓 Academia'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tipología / Categoría / Problemática */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-white font-bold">
                          {article.type === 'territorios'
                            ? 'Problemática / Eje Territorial *'
                            : article.type === 'academia'
                            ? 'Línea de Investigación Académica *'
                            : 'Tipología / Categoría del Proyecto *'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                          className="text-[10.5px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                        >
                          {isCustomCategoryMode ? '← Elegir de la lista predefinida' : '+ Escribir personalizada'}
                        </button>
                      </div>

                      {!isCustomCategoryMode ? (
                        <div className="space-y-1">
                          <select
                            value={categoryOptions.includes(article.category || '') ? (article.category || 'Edificación Colectiva') : '__custom__'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '__custom__') {
                                setIsCustomCategoryMode(true);
                              } else {
                                updateField('category', val);
                              }
                            }}
                            className="w-full bg-[#242424] border border-white/20 p-2.5 text-xs text-white focus:border-white focus:outline-none cursor-pointer"
                          >
                            <option value="" disabled>-- Selecciona una tipología --</option>
                            {categoryOptions.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                            <option value="__custom__" className="text-emerald-400 font-bold bg-[#1e1e1e]">
                              + Agregar otra tipología personalizada...
                            </option>
                          </select>
                          <p className="text-[10px] text-white/40">
                            Texto visible a la derecha del título en la web pública (ej. <span className="text-white/70 italic">"{article.category || 'Edificación Colectiva'}"</span>).
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={article.category || ''}
                              onChange={(e) => updateField('category', e.target.value)}
                              placeholder="ej. Pabellón Experimental, Vivienda Rural..."
                              className="flex-1 bg-[#242424] border border-emerald-400/70 p-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setIsCustomCategoryMode(false)}
                              className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono uppercase transition-colors"
                              title="Confirmar y volver a la lista"
                            >
                              Guardar
                            </button>
                          </div>
                          <p className="text-[10px] text-emerald-400/70 font-mono">
                            ✓ Tipología personalizada vinculada. Escribe cualquier nombre y se reflejará de inmediato en la web.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SECCIÓN 2: FOTOGRAFÍAS DEL PROYECTO                          */}
              {/* ------------------------------------------------------------ */}
              <div
                id="section-fotos"
                className={`bg-[#1c1c1c] border transition-all ${
                  activeSection === 'fotos' ? 'border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40' : 'border-white/15'
                }`}
                onFocus={() => setActiveSection('fotos')}
                onClick={() => setActiveSection('fotos')}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('fotos')}
                  className="w-full p-3.5 flex items-center justify-between text-left bg-[#222222] border-b border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-white/10 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white">
                        FOTOGRAFÍAS DEL PROYECTO
                      </h3>
                      <p className="text-[10.5px] text-white/50 font-sans">
                        Foto principal exterior y foto secundaria para el efecto de revelado
                      </p>
                    </div>
                  </div>
                  {collapsedSections.fotos ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronUp className="w-4 h-4 text-white/60" />}
                </button>

                {!collapsedSections.fotos && (
                  <div className="p-4 space-y-4">
                    {/* ======================================================= */}
                    {/* FOTOGRAFÍA PRINCIPAL DE PORTADA (HERO) // ENCUADRE Y RECORTE */}
                    {/* ======================================================= */}
                    <div className="space-y-3.5 pb-4 border-b border-white/10">
                      {/* Header with Title and Current Coordinate Badge */}
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                          <Crop className="w-3.5 h-3.5 text-amber-400" />
                          <span>Fotografía Principal de Portada *</span>
                        </label>
                        <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                          Encuadre: X:{heroPosX}% • Y:{heroPosY}%
                        </span>
                      </div>

                      {/* Photo Selector Controls: Upload, Library, and Project Photos Dropdown */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Hidden Native File Input */}
                        <input
                          ref={heroFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleHeroFileUpload}
                          className="hidden"
                        />

                        {/* Direct File Upload Button */}
                        <button
                          type="button"
                          onClick={() => heroFileInputRef.current?.click()}
                          disabled={isUploadingHero}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
                          title="Subir foto desde tu computador o dispositivo"
                        >
                          {isUploadingHero ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Subiendo...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Subir Foto</span>
                            </>
                          )}
                        </button>

                        {/* Open Media Library Modal */}
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('hero');
                            setIsMediaModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-white border border-white/20 font-anton text-xs uppercase tracking-wider transition-colors cursor-pointer"
                          title="Elegir foto de la biblioteca multimedia general"
                        >
                          <Folder className="w-3.5 h-3.5 text-white/70" />
                          <span>Biblioteca</span>
                        </button>

                        {/* Toggle Existing Project Photos */}
                        {projectPhotos.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsProjectPhotosOpen((prev) => !prev)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 border font-anton text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                              isProjectPhotosOpen
                                ? 'bg-amber-400 text-black border-amber-400 font-bold'
                                : 'bg-[#1c1c1c] text-white/80 border-white/15 hover:text-white hover:border-white/40'
                            }`}
                            title="Seleccionar cualquiera de las fotos ya cargadas en este proyecto"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Fotos de la Obra ({projectPhotos.length})</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isProjectPhotosOpen ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Grid of Existing Project Photos for 1-Click Assignment */}
                      {isProjectPhotosOpen && projectPhotos.length > 0 && (
                        <div className="p-2.5 bg-[#141414] border border-white/15 rounded-lg space-y-2 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                            <span>Haz clic en cualquier imagen para convertirla en portada:</span>
                            <span className="text-amber-300">{projectPhotos.length} disponibles</span>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[170px] overflow-y-auto pr-1">
                            {projectPhotos.map((p, idx) => {
                              const isCurrent = article.heroImage === p.url;
                              return (
                                <button
                                  key={`${p.url}-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    updateField('heroImage', p.url);
                                    setIsProjectPhotosOpen(false);
                                  }}
                                  className={`group relative aspect-[4/3] rounded-[4px] overflow-hidden bg-black transition-all cursor-pointer ${
                                    isCurrent
                                      ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-black scale-[0.98]'
                                      : 'border border-white/20 hover:border-white hover:scale-105'
                                  }`}
                                  title={`${p.label} (${p.type})`}
                                >
                                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-white/80 px-1 py-0.5 truncate text-left">
                                    {p.label}
                                  </span>
                                  {isCurrent && (
                                    <div className="absolute top-1 right-1 bg-amber-400 text-black rounded-full p-0.5 shadow-sm">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Direct URL input fallback */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={article.heroImage || ''}
                          onChange={(e) => updateField('heroImage', e.target.value)}
                          placeholder="O pega una URL: https://..."
                          className="flex-1 bg-[#1a1a1a] border border-white/15 p-2 text-[11px] text-white font-mono focus:border-white focus:outline-none rounded-[2px]"
                        />
                        {article.heroImage && (
                          <a
                            href={article.heroImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-[#252525] border border-white/15 text-white/60 hover:text-white rounded-[2px]"
                            title="Ver imagen original en nueva pestaña"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* ======================================================= */}
                      {/* INTERACTIVE CROP & FOCAL POINT FRAMER CANVAS            */}
                      {/* ======================================================= */}
                      {article.heroImage && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-white/80 font-bold flex items-center gap-1.5">
                              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                              <span>Encuadre Interactivo (Haz clic o arrastra para centrar)</span>
                            </span>
                            <span className="text-white/40 text-[10px]">
                              X: {heroPosX}% • Y: {heroPosY}%
                            </span>
                          </div>

                          {/* Clickable / Draggable Focal Area */}
                          <div
                            onPointerDown={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              if (rect.width > 0 && rect.height > 0) {
                                const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                                const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                                updateHeroFraming(clickX, clickY);
                              }
                            }}
                            onPointerMove={(e) => {
                              if (e.buttons === 1) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                if (rect.width > 0 && rect.height > 0) {
                                  const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                                  const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                                  updateHeroFraming(clickX, clickY);
                                }
                              }
                            }}
                            className="relative w-full h-[220px] bg-[#0c0c0c] border-2 border-white/20 hover:border-amber-400/60 rounded-[8px] overflow-hidden select-none cursor-crosshair group transition-colors shadow-inner flex items-center justify-center"
                            title="Haz clic o arrastra sobre la foto para ubicar qué parte debe verse en el centro"
                          >
                            {/* Complete Uncropped Image in Full View */}
                            <img
                              src={article.heroImage}
                              alt="Vista completa para encuadre"
                              className="w-full h-full object-contain pointer-events-none"
                            />

                            {/* Rule of Thirds Grid Overlay */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                              <div className="border-r border-b border-white" />
                              <div className="border-r border-b border-white" />
                              <div className="border-b border-white" />
                              <div className="border-r border-b border-white" />
                              <div className="border-r border-b border-white" />
                              <div className="border-b border-white" />
                              <div className="border-r border-b border-white" />
                              <div className="border-r border-b border-white" />
                              <div />
                            </div>

                            {/* Approximate Panoramical Card Frame centered on focal point */}
                            <div
                              className="absolute pointer-events-none border border-dashed border-amber-400/50 bg-amber-400/5 transition-all duration-75"
                              style={{
                                width: '100%',
                                height: '56%',
                                left: '0%',
                                top: `${Math.max(0, Math.min(44, heroPosY - 28))}%`,
                              }}
                            />

                            {/* Focal Point Crosshair Pin */}
                            <div
                              className="absolute pointer-events-none transition-all duration-75 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                              style={{
                                left: `${heroPosX}%`,
                                top: `${heroPosY}%`,
                              }}
                            >
                              <div className="relative flex items-center justify-center">
                                {/* Pulse ring */}
                                <span className="absolute w-7 h-7 rounded-full bg-amber-400/30 animate-ping" />
                                {/* Outer target ring */}
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-black/60 shadow-lg flex items-center justify-center">
                                  {/* Inner crosshair dot */}
                                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-xs" />
                                </div>
                                {/* Reticle crosshair axes */}
                                <div className="absolute w-10 h-0.5 bg-white/70 -z-10" />
                                <div className="absolute h-10 w-0.5 bg-white/70 -z-10" />
                              </div>

                              {/* Coordinate badge below pin */}
                              <span className="mt-1 font-mono text-[8px] bg-black/90 text-amber-300 px-1.5 py-0.2 rounded border border-white/20 whitespace-nowrap shadow-md">
                                X: {heroPosX}% • Y: {heroPosY}%
                              </span>
                            </div>

                            {/* Instruction overlay pill */}
                            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-[9px] font-mono text-white/70 px-2 py-0.5 rounded border border-white/10 pointer-events-none">
                              🎯 Haz clic o arrastra para encuadrar
                            </div>
                          </div>

                          {/* Precision Sliders */}
                          <div className="space-y-3 bg-[#171717] p-3 rounded-lg border border-white/10">
                            {/* Vertical Slider */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10.5px] font-mono">
                                <span className="text-white/80 font-medium">
                                  Posición Vertical (Cielo ↔ Suelo / Obra):
                                </span>
                                <span className="text-amber-300 font-bold">{heroPosY}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={heroPosY}
                                onChange={(e) => updateHeroFraming(heroPosX, Number(e.target.value))}
                                className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-amber-400"
                              />
                              <div className="flex justify-between text-[9px] font-mono text-white/40">
                                <span>0% Cielo / Cubierta</span>
                                <span className="text-white/60">50% Centro</span>
                                <span className="text-amber-300 font-bold">75% Enfoque Obra</span>
                                <span>100% Suelo / Base</span>
                              </div>
                            </div>

                            {/* Horizontal Slider */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10.5px] font-mono">
                                <span className="text-white/80 font-medium">
                                  Posición Horizontal (Izquierda ↔ Derecha):
                                </span>
                                <span className="text-amber-300 font-bold">{heroPosX}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={heroPosX}
                                onChange={(e) => updateHeroFraming(Number(e.target.value), heroPosY)}
                                className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-amber-400"
                              />
                              <div className="flex justify-between text-[9px] font-mono text-white/40">
                                <span>0% Izquierda</span>
                                <span className="text-white/60">50% Centro</span>
                                <span>100% Derecha</span>
                              </div>
                            </div>

                            {/* Scale / Zoom Slider */}
                            <div className="space-y-1 pt-1 border-t border-white/10">
                              <div className="flex items-center justify-between text-[10.5px] font-mono">
                                <span className="text-white/80 font-medium flex items-center gap-1">
                                  <ZoomIn className="w-3 h-3 text-white/60" />
                                  <span>Acercamiento / Zoom:</span>
                                </span>
                                <span className="text-amber-300 font-bold">{heroZoom}%</span>
                              </div>
                              <input
                                type="range"
                                min="100"
                                max="140"
                                value={heroZoom}
                                onChange={(e) => updateHeroFraming(heroPosX, heroPosY, Number(e.target.value))}
                                className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-amber-400"
                              />
                              <div className="flex justify-between text-[9px] font-mono text-white/40">
                                <span>100% Cobertura Real</span>
                                <span>120% Acercamiento Medio</span>
                                <span>140% Zoom Máximo</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Architectural Presets */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-white/50">
                              Ajustes rápidos de 1 clic:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {/* Golden preset for architectural elevation/ground */}
                              <button
                                type="button"
                                onClick={() => updateHeroFraming(50, 75)}
                                className={`py-1.5 px-2 text-[10px] font-mono uppercase border rounded-[3px] transition-colors flex items-center justify-center gap-1 ${
                                  heroPosY >= 70 && heroPosY <= 80 && heroPosX >= 45 && heroPosX <= 55
                                    ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-xs'
                                    : 'bg-[#202020] text-amber-300 border-amber-400/30 hover:border-amber-400'
                                }`}
                                title="Centra la toma en el edificio y su base (ideal para fotos con mucho cielo)"
                              >
                                <span>🏛️</span>
                                <span>Enfocar en la Obra (75%)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeroFraming(50, 50)}
                                className={`py-1.5 px-2 text-[10px] font-mono uppercase border rounded-[3px] transition-colors ${
                                  heroPosY === 50 && heroPosX === 50
                                    ? 'bg-white text-black border-white font-bold'
                                    : 'bg-[#202020] text-white/70 border-white/15 hover:text-white'
                                }`}
                              >
                                ⚖️ Centro (50%)
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeroFraming(50, 15)}
                                className={`py-1.5 px-2 text-[10px] font-mono uppercase border rounded-[3px] transition-colors ${
                                  heroPosY <= 25 && heroPosX >= 45 && heroPosX <= 55
                                    ? 'bg-white text-black border-white font-bold'
                                    : 'bg-[#202020] text-white/70 border-white/15 hover:text-white'
                                }`}
                              >
                                ☁️ Cielo / Cubierta
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeroFraming(50, 90)}
                                className={`py-1.5 px-2 text-[10px] font-mono uppercase border rounded-[3px] transition-colors ${
                                  heroPosY >= 85
                                    ? 'bg-white text-black border-white font-bold'
                                    : 'bg-[#202020] text-white/70 border-white/15 hover:text-white'
                                }`}
                              >
                                🌾 Suelo / Zócalo
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeroFraming(25, heroPosY)}
                                className="py-1.5 px-2 text-[10px] font-mono uppercase border rounded-[3px] bg-[#202020] text-white/70 border-white/15 hover:text-white"
                              >
                                ⬅️ Lateral Izq.
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeroFraming(75, heroPosY)}
                                className="py-1.5 px-2 text-[10px] font-mono uppercase border rounded-[3px] bg-[#202020] text-white/70 border-white/15 hover:text-white"
                              >
                                ➡️ Lateral Der.
                              </button>
                            </div>
                          </div>

                          {/* =================================================== */}
                          {/* LIVE HERO CARD PREVIEW SIMULATOR                    */}
                          {/* =================================================== */}
                          <div className="pt-2 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                              <span className="uppercase tracking-wider font-bold text-white flex items-center gap-1.5">
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>Simulador Real de Portada</span>
                              </span>
                              <span className="text-emerald-400 text-[9px]">
                                Proporción exacta de la ficha
                              </span>
                            </div>

                            {/* Simulated hero photo card matching ProjectDetail proportions */}
                            <div className="relative w-full aspect-[16/8] sm:aspect-[2.1/1] rounded-[14px] sm:rounded-[18px] overflow-hidden bg-black border-2 border-white/30 shadow-2xl">
                              <img
                                src={article.heroImage}
                                alt="Simulación exacta del recorte"
                                className="w-full h-full object-cover transition-[object-position] duration-150"
                                style={{
                                  objectPosition: `${heroPosX}% ${heroPosY}%`,
                                  transform: heroZoom > 100 ? `scale(${heroZoom / 100})` : undefined,
                                }}
                              />

                              {/* Corner watermark ribbon simulation */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none flex flex-col justify-between p-3 sm:p-4 text-white">
                                <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-white/80">
                                  <span>{article.location || 'ECUADOR'}</span>
                                  <span>{article.year || '2024'}</span>
                                </div>
                                <div>
                                  <h4 className="font-okcok text-xs sm:text-sm uppercase tracking-wide truncate drop-shadow">
                                    {article.title || 'TÍTULO DE LA OBRA'}
                                  </h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Foto Secundaria (Efecto Cortina en Portada) */}
                    <div className="space-y-2.5 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Fotografía Secundaria (Interior / Efecto Cortina)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowSecondaryInEditorPreview((prev) => !prev)}
                          className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline"
                        >
                          {showSecondaryInEditorPreview ? 'Ocultar en preview' : 'Probar en preview'}
                        </button>
                      </div>

                      <p className="text-[10.5px] text-white/50 font-sans leading-relaxed">
                        Foto complementaria (interior o detalle constructivo) que se revela al tocar o interactuar con la tarjeta en la portada.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={article.secondaryImageUrl || ''}
                          onChange={(e) => updateField('secondaryImageUrl', e.target.value)}
                          placeholder="https://... (Foto interior o detalle)"
                          className="flex-1 bg-[#242424] border border-white/20 p-2 text-xs text-white font-mono focus:border-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('secondary');
                            setIsMediaModalOpen(true);
                          }}
                          className="px-3 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200"
                        >
                          Biblioteca
                        </button>
                      </div>
                    </div>

                    {/* Galería de Imágenes de la Obra (Carrete General / Lightbox) */}
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Galería de Imágenes de la Obra ({(article.gallery || []).length} fotos)</span>
                        </label>
                        {(article.gallery || []).length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('¿Seguro que deseas vaciar todas las fotos del carrete general?')) {
                                updateField('gallery', []);
                              }
                            }}
                            className="text-[10px] font-mono text-red-400/80 hover:text-red-300 underline"
                          >
                            Vaciar galería
                          </button>
                        )}
                      </div>

                      <p className="text-[10.5px] text-white/50 font-sans leading-relaxed">
                        Carrete fotográfico de la obra para el visor y carrusel a pantalla completa (Lightbox). Sube tantas fotos como desees desde tu equipo o elígelas de la biblioteca.
                      </p>

                      <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Optimización ArchDaily activa: escala a 2560px WebP de alta fidelidad (~500 KB sin pérdida visual).</span>
                      </div>

                      {/* Selector de Categoría para Nuevas Imágenes de Galería */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-[#1c1c1c] border border-white/10 rounded-xs">
                        <span className="text-[10.5px] font-mono uppercase text-white/70">
                          Categoría para imágenes a subir:
                        </span>
                        <div className="flex items-center gap-1 bg-[#262626] p-0.5 border border-white/15">
                          <button
                            type="button"
                            onClick={() => setGalleryUploadCategory('fotografia')}
                            className={`px-2.5 py-1 text-[10.5px] font-anton uppercase flex items-center gap-1 transition-all cursor-pointer ${
                              galleryUploadCategory === 'fotografia'
                                ? 'bg-white text-black font-bold shadow-sm'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            <Camera className="w-3 h-3" />
                            <span>Fotografía</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalleryUploadCategory('planimetria')}
                            className={`px-2.5 py-1 text-[10.5px] font-anton uppercase flex items-center gap-1 transition-all cursor-pointer ${
                              galleryUploadCategory === 'planimetria'
                                ? 'bg-amber-400 text-black font-bold shadow-sm'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            <Compass className="w-3 h-3" />
                            <span>Planimetría / Diagrama</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Subir desde computadora (Múltiples archivos) */}
                        <label className={`flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-anton text-xs uppercase tracking-wider cursor-pointer border border-emerald-400 transition-colors ${isUploadingArticleGallery ? 'opacity-70 pointer-events-none' : ''}`}>
                          {isUploadingArticleGallery ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploadingArticleGallery ? 'Subiendo fotos...' : 'Subir desde PC'}</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            disabled={isUploadingArticleGallery}
                            className="hidden"
                            onChange={async (e) => {
                              if (!e.target.files || e.target.files.length === 0) return;
                              setIsUploadingArticleGallery(true);
                              try {
                                const urls = await uploadMultipleImages(e.target.files);
                                const current = article.gallery || [];
                                updateField('gallery', [...current, ...urls]);
                                const updatedCats = { ...(article.imageCategories || {}) };
                                urls.forEach((u) => {
                                  updatedCats[u] = galleryUploadCategory;
                                });
                                updateField('imageCategories', updatedCats);
                                setToast({
                                  type: 'success',
                                  message: `✓ Se agregaron ${urls.length} imágenes como ${galleryUploadCategory === 'planimetria' ? 'Planimetrías' : 'Fotografías'}.`,
                                });
                              } catch (err) {
                                setToast({ type: 'error', message: 'Error al subir fotos' });
                              } finally {
                                setIsUploadingArticleGallery(false);
                              }
                            }}
                          />
                        </label>

                        {/* Elegir de Biblioteca */}
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('articleGallery');
                            setIsMediaModalOpen(true);
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/10 hover:bg-white hover:text-black text-white font-anton text-xs uppercase tracking-wider border border-white/20 transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>De Biblioteca</span>
                        </button>
                      </div>

                      {/* Input para pegar enlace directo */}
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          id="input-add-article-gallery"
                          placeholder="Pegar enlace de imagen https://..."
                          className="flex-1 bg-[#242424] border border-white/15 p-1.5 text-xs text-white font-mono focus:border-white focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget;
                              if (input.value.trim()) {
                                const current = article.gallery || [];
                                const newUrl = input.value.trim();
                                updateField('gallery', [...current, newUrl]);
                                updateField('imageCategories', {
                                  ...(article.imageCategories || {}),
                                  [newUrl]: galleryUploadCategory,
                                });
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('input-add-article-gallery') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              const current = article.gallery || [];
                              const newUrl = input.value.trim();
                              updateField('gallery', [...current, newUrl]);
                              updateField('imageCategories', {
                                ...(article.imageCategories || {}),
                                [newUrl]: galleryUploadCategory,
                              });
                              input.value = '';
                            }
                          }}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white hover:text-black text-white text-[11px] font-anton uppercase tracking-wider border border-white/20"
                        >
                          + Añadir
                        </button>
                      </div>

                      {/* Miniaturas de la galería general */}
                      {(article.gallery && article.gallery.length > 0) ? (
                        <div className="space-y-2 pt-1">
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {article.gallery.map((url, gIdx) => {
                              const itemCat = article.imageCategories?.[url] || detectImageCategory(url);
                              return (
                                <div
                                  key={`${url}-${gIdx}`}
                                  className="group relative aspect-square bg-black border border-white/20 overflow-hidden rounded-[2px]"
                                >
                                  <img src={url} alt={`Foto ${gIdx + 1}`} className="w-full h-full object-cover" />
                                  <span className="absolute top-1 left-1 bg-black/80 text-white font-mono text-[9px] px-1 py-0.2 rounded">
                                    #{gIdx + 1}
                                  </span>

                                  {/* Badge de Categoría Clicable para alternar entre Foto y Planimetría */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const nextCat = itemCat === 'planimetria' ? 'fotografia' : 'planimetria';
                                      updateField('imageCategories', {
                                        ...(article.imageCategories || {}),
                                        [url]: nextCat,
                                      });
                                      setToast({
                                        type: 'success',
                                        message: `Foto #${gIdx + 1} cambiada a ${nextCat === 'planimetria' ? 'Planimetría' : 'Fotografía'}`
                                      });
                                    }}
                                    title="Clic para alternar entre Fotografía y Planimetría"
                                    className={`absolute bottom-1 left-1 px-1.5 py-0.5 text-[8.5px] font-mono uppercase tracking-wider rounded-[1px] flex items-center gap-1 shadow-md transition-all cursor-pointer z-10 ${
                                      itemCat === 'planimetria'
                                        ? 'bg-amber-400 text-black font-bold hover:bg-amber-300'
                                        : 'bg-black/80 text-emerald-300 border border-emerald-500/40 hover:bg-black'
                                    }`}
                                  >
                                    {itemCat === 'planimetria' ? (
                                      <>
                                        <Compass className="w-2.5 h-2.5" />
                                        <span>Plano</span>
                                      </>
                                    ) : (
                                      <>
                                        <Camera className="w-2.5 h-2.5" />
                                        <span>Foto</span>
                                      </>
                                    )}
                                  </button>

                                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-1 transition-opacity z-20 pointer-events-none group-hover:pointer-events-auto">
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = (article.gallery || []).filter((_, i) => i !== gIdx);
                                          updateField('gallery', updated);
                                        }}
                                        title="Eliminar foto"
                                        className="p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-xs"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <button
                                        type="button"
                                        disabled={gIdx === 0}
                                        onClick={() => {
                                          if (gIdx === 0) return;
                                          const list = [...(article.gallery || [])];
                                          const [item] = list.splice(gIdx, 1);
                                          list.splice(gIdx - 1, 0, item);
                                          updateField('gallery', list);
                                        }}
                                        className="p-1 bg-white/20 hover:bg-white hover:text-black text-white rounded-xs disabled:opacity-20 disabled:pointer-events-none"
                                      >
                                        <ChevronLeft className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={gIdx === (article.gallery || []).length - 1}
                                        onClick={() => {
                                          if (gIdx === (article.gallery || []).length - 1) return;
                                          const list = [...(article.gallery || [])];
                                          const [item] = list.splice(gIdx, 1);
                                          list.splice(gIdx + 1, 0, item);
                                          updateField('gallery', list);
                                        }}
                                        className="p-1 bg-white/20 hover:bg-white hover:text-black text-white rounded-xs disabled:opacity-20 disabled:pointer-events-none"
                                      >
                                        <ChevronRight className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Botón para insertar como módulo en la reseña con 1 clic */}
                          <button
                            type="button"
                            onClick={() => {
                              const newMod: EditorialModuleItem = {
                                id: `mod-gallery-${Date.now()}`,
                                type: 'image-gallery',
                                title: 'GALERÍA DE LA OBRA',
                                imageUrls: [...(article.gallery || [])],
                                settings: { columns: 3 },
                              };
                              setArticle((prev) => ({
                                ...prev,
                                modules: [...(prev.modules || []), newMod],
                              }));
                              setExpandedModules((prev) => ({ ...prev, [newMod.id]: true }));
                              setActiveSection('modulos');
                              setCollapsedSections((prev) => ({ ...prev, modulos: false }));
                              setToast({
                                type: 'success',
                                message: '✓ Se creó un bloque de galería en la reseña con estas imágenes.',
                              });
                            }}
                            className="w-full py-1.5 px-3 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 text-[11px] font-anton uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Crear bloque de galería en la Reseña con estas fotos</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 border border-dashed border-white/15 text-center text-white/40 text-xs font-mono">
                          Aún no has agregado fotos a la galería general.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SECCIÓN 3: DESCRIPCIÓN Y MEMORIA ARQUITECTÓNICA              */}
              {/* ------------------------------------------------------------ */}
              <div
                id="section-descripcion"
                className={`bg-[#1c1c1c] border transition-all ${
                  activeSection === 'descripcion' ? 'border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40' : 'border-white/15'
                }`}
                onFocus={() => setActiveSection('descripcion')}
                onClick={() => setActiveSection('descripcion')}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('descripcion')}
                  className="w-full p-3.5 flex items-center justify-between text-left bg-[#222222] border-b border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-white/10 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      3
                    </span>
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white">
                        DESCRIPCIÓN Y MEMORIA ARQUITECTÓNICA
                      </h3>
                      <p className="text-[10.5px] text-white/50 font-sans">
                        Resumen para tarjetas, párrafos analíticos y citas destacadas
                      </p>
                    </div>
                  </div>
                  {collapsedSections.descripcion ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronUp className="w-4 h-4 text-white/60" />}
                </button>

                {!collapsedSections.descripcion && (
                  <div className="p-4 space-y-4">
                    {/* Resumen Principal */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">
                          Resumen Principal para Tarjetas (Párrafo 1) *
                        </label>
                        <span className="text-[10px] font-mono text-white/40">
                          {article.excerpt?.length || 0} caracteres
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={article.excerpt || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setArticle((prev) => ({
                            ...prev,
                            excerpt: val,
                            resena:
                              !prev.resena ||
                              prev.resena.startsWith('Texto analítico') ||
                              prev.resena === prev.excerpt
                                ? val
                                : prev.resena,
                          }));
                        }}
                        placeholder="Escribe el extracto principal de la obra que se leerá en la portada y tarjetas de celular..."
                        className="w-full bg-[#242424] border border-white/20 p-2.5 text-xs text-white leading-relaxed resize-none focus:border-white focus:outline-none"
                      />
                      <p className="text-[10px] text-white/40 mt-1">
                        Texto corto y directo (1 a 2 párrafos) visible en celulares y computadores.
                      </p>
                    </div>

                    {/* Extracto Secundario Complementario */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                        Extracto Secundario (Párrafo 2 - Visible en Tablet y Computador)
                      </label>
                      <textarea
                        rows={2}
                        value={article.secondaryExcerpt || ''}
                        onChange={(e) => updateField('secondaryExcerpt', e.target.value)}
                        placeholder="Segundo párrafo analítico complementario..."
                        className="w-full bg-[#242424] border border-white/20 p-2.5 text-xs text-white leading-relaxed resize-none focus:border-white focus:outline-none"
                      />
                    </div>

                    {/* Texto del Botón de Acción */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                        Texto del Botón de la Tarjeta
                      </label>
                      <input
                        type="text"
                        value={article.actionButtonText || 'VER PROYECTO'}
                        onChange={(e) => updateField('actionButtonText', e.target.value.toUpperCase())}
                        placeholder="VER PROYECTO"
                        className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white uppercase font-anton focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SECCIÓN 4: FICHA TÉCNICA Y CRÉDITOS                          */}
              {/* ------------------------------------------------------------ */}
              <div
                id="section-creditos"
                className={`bg-[#1c1c1c] border transition-all ${
                  activeSection === 'creditos' ? 'border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40' : 'border-white/15'
                }`}
                onFocus={() => setActiveSection('creditos')}
                onClick={() => setActiveSection('creditos')}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('creditos')}
                  className="w-full p-3.5 flex items-center justify-between text-left bg-[#222222] border-b border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-white/10 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      4
                    </span>
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white">
                        {sectionMeta.creditos.title}
                      </h3>
                      <p className="text-[10.5px] text-white/50 font-sans">
                        {sectionMeta.creditos.subtitle}
                      </p>
                    </div>
                  </div>
                  {collapsedSections.creditos ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronUp className="w-4 h-4 text-white/60" />}
                </button>

                {!collapsedSections.creditos && (
                  <div className="p-4 space-y-4">
                    {/* Escrito por & Editado por */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                          {article.type === 'territorios'
                            ? 'Autor del Análisis / Memoria Territorial'
                            : article.type === 'academia'
                            ? 'Autor(es) / Tesista(s)'
                            : 'Escrito por (Autor de la Memoria)'}
                        </label>
                        <input
                          type="text"
                          value={article.escritoPor || ''}
                          onChange={(e) => updateField('escritoPor', e.target.value)}
                          placeholder={
                            article.type === 'territorios'
                              ? 'ej. Equipo de Cartografía Territorial'
                              : article.type === 'academia'
                              ? 'ej. Mateo Sánchez / Arq. Carolina Rodas'
                              : 'ej. Arq. Carolina Rodas'
                          }
                          className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                          Editado por (Revisión Editorial)
                        </label>
                        <input
                          type="text"
                          value={article.editadoPor || ''}
                          onChange={(e) => updateField('editadoPor', e.target.value)}
                          placeholder="ej. Dirección Editorial EA"
                          className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* TYPE-SPECIFIC FIELDS */}
                    {article.type === 'territorios' ? (
                      /* CASE A: TERRITORIOS (No fotografía, no superficie construida) */
                      <div className="space-y-3 p-3 bg-white/5 border border-white/10 rounded-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                              Escala Territorial / Ámbito
                            </label>
                            <input
                              type="text"
                              value={article.datos?.escala || article.subtitle || ''}
                              onChange={(e) => {
                                updateField('subtitle', e.target.value.toUpperCase());
                                updateField('datos', { ...(article.datos || {}), escala: e.target.value });
                              }}
                              placeholder="ej. REGIONAL / CUENCA HIDROGRÁFICA"
                              className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white uppercase focus:border-white focus:outline-none"
                            />
                            <p className="text-[10px] text-white/40 mt-1">
                              Escala geográfica de aproximación del expediente.
                            </p>
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                              Equipo de Cartografía / Datos
                            </label>
                            <input
                              type="text"
                              value={article.datos?.colaboradores || ''}
                              onChange={(e) => {
                                updateField('datos', { ...(article.datos || {}), colaboradores: e.target.value });
                              }}
                              placeholder="ej. Taller de Geografía Crítica / EA"
                              className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                            />
                            <p className="text-[10px] text-white/40 mt-1">
                              Colectivo, investigadores o fuentes cartográficas.
                            </p>
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#141414] border border-dashed border-white/15 text-[11px] font-mono text-white/60">
                          ℹ️ <strong className="text-white">Territorios:</strong> Se omiten automáticamente los campos de fotógrafo, superficie construida y visitas de obra, adaptando la ficha a variables territoriales.
                        </div>
                      </div>
                    ) : article.type === 'academia' ? (
                      /* CASE B: ACADEMIA (Renders opcional en vez de fotografía, Universidad, Tutor, no superficie construida) */
                      <div className="space-y-3 p-3 bg-white/5 border border-white/10 rounded-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Renders (Opcional) */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                                Autor de Renders / 3D (Opcional)
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (hasRenders) {
                                    updateField('renders', '');
                                    updateField('datos', { ...(article.datos || {}), renders: '' });
                                  } else {
                                    updateField('renders', 'ESTUDIO VISUAL 3D');
                                    updateField('datos', { ...(article.datos || {}), renders: 'ESTUDIO VISUAL 3D' });
                                  }
                                }}
                                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 cursor-pointer"
                              >
                                {hasRenders ? '✕ Quitar renders' : '+ Asignar autor de renders'}
                              </button>
                            </div>

                            {hasRenders ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={article.renders || article.datos?.renders || ''}
                                  onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    updateField('renders', val);
                                    updateField('datos', { ...(article.datos || {}), renders: val });
                                  }}
                                  placeholder="ej. ESTUDIO VISUAL 3D (o deja vacío)"
                                  className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white uppercase focus:border-white focus:outline-none"
                                />
                                <p className="text-[10px] text-white/40">
                                  Opcional: Si se deja vacío o se quita, no se mostrará en la web pública.
                                </p>
                              </div>
                            ) : (
                              <div className="p-2.5 bg-[#181818] border border-dashed border-white/20 text-[11px] font-mono text-white/50 flex items-center justify-between">
                                <span>🚫 Sin renders asignados (opcional - no aparecerá en la web)</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateField('renders', 'ESTUDIO VISUAL 3D');
                                    updateField('datos', { ...(article.datos || {}), renders: 'ESTUDIO VISUAL 3D' });
                                  }}
                                  className="text-[10.5px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                                >
                                  Asignar
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Universidad / Facultad */}
                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                              Universidad / Facultad
                            </label>
                            <input
                              type="text"
                              value={article.datos?.universidad || 'PUCE - FADA'}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                updateField('datos', { ...(article.datos || {}), universidad: val });
                              }}
                              placeholder="ej. PUCE - FADA, USFQ, FAU UCE"
                              className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white uppercase focus:border-white focus:outline-none"
                            />
                            <p className="text-[10px] text-white/40 mt-1">
                              Institución académica donde se desarrolló la investigación.
                            </p>
                          </div>
                        </div>

                        {/* Tutor / Director */}
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                            Tutor o Director de Tesis
                          </label>
                          <input
                            type="text"
                            value={article.datos?.colaboradores || ''}
                            onChange={(e) =>
                              updateField('datos', {
                                ...(article.datos || {}),
                                colaboradores: e.target.value,
                              })
                            }
                            placeholder="ej. Arq. Daniel Moreno Flores (Tutor)"
                            className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                        </div>

                        <div className="p-2.5 bg-[#141414] border border-dashed border-white/15 text-[11px] font-mono text-white/60">
                          ℹ️ <strong className="text-white">Academia:</strong> Se reemplaza la fotografía obligatoria por renders opcionales y se omiten visitas de obra.
                        </div>
                      </div>
                    ) : (
                      /* CASE C: PROYECTOS (Full architectural specs) */
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                                Fotógrafo o Registro
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (hasPhotographer) {
                                    updateField('photographer', '');
                                    updateField('datos', { ...(article.datos || {}), fotografia: '' });
                                  } else {
                                    updateField('photographer', 'JAG STUDIO');
                                    updateField('datos', { ...(article.datos || {}), fotografia: 'JAG STUDIO' });
                                  }
                                }}
                                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 cursor-pointer"
                              >
                                {hasPhotographer ? '✕ Quitar fotógrafo' : '+ Asignar fotógrafo'}
                              </button>
                            </div>
                            {hasPhotographer ? (
                              <div className="space-y-1">
                                <ProfileSearchSelect
                                  type="photographer"
                                  value={article.photographer || article.datos?.fotografia || ''}
                                  onChange={(val) => {
                                    updateField('photographer', val);
                                    updateField('datos', { ...(article.datos || {}), fotografia: val });
                                  }}
                                  placeholder="ej. JAG STUDIO, BICUBIK (o deja vacío)"
                                  helperText="Despliega fotógrafos registrados o pulsa + para crear un nuevo perfil."
                                />
                                <p className="text-[10px] text-white/40">
                                  Deja vacío o pulsa "Quitar fotógrafo" si no deseas que aparezca en la web.
                                </p>
                              </div>
                            ) : (
                              <div className="p-2.5 bg-[#181818] border border-dashed border-white/20 text-[11px] font-mono text-white/50 flex items-center justify-between">
                                <span>🚫 Sin fotógrafo (no aparecerá en la web)</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateField('photographer', 'JAG STUDIO');
                                    updateField('datos', { ...(article.datos || {}), fotografia: 'JAG STUDIO' });
                                  }}
                                  className="text-[10.5px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                                >
                                  Asignar
                                </button>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                              Superficie Construida (m²)
                            </label>
                            <input
                              type="text"
                              value={article.superficie || article.datos?.superficie || ''}
                              onChange={(e) => {
                                updateField('superficie', e.target.value);
                                updateField('datos', { ...(article.datos || {}), superficie: e.target.value });
                              }}
                              placeholder="ej. 3.850 m²"
                              className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Estructura y Sistema Estructural */}
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                            Sistema Estructural y Materiales (Opcional)
                          </label>
                          <input
                            type="text"
                            value={article.datos?.estructura || (article as any).materialidadPrincipal || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateField('datos', {
                                ...(article.datos || {}),
                                estructura: val,
                              });
                              updateField('materialidadPrincipal' as any, val);
                            }}
                            placeholder="ej. Hormigón armado visto y acero (o deja vacío si no aplica)"
                            className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                          <p className="text-[10px] text-white/40 mt-1">
                            Si lo dejas vacío, no se mostrará en la ficha técnica.
                          </p>
                        </div>

                        {/* Ingeniería y Cálculo Estructural */}
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                            Ingeniería / Cálculo Estructural (Opcional)
                          </label>
                          <input
                            type="text"
                            value={(article as any).ingenieria || article.datos?.ingenieria || article.datos?.calculoEstructural || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateField('ingenieria' as any, val);
                              updateField('datos', {
                                ...(article.datos || {}),
                                ingenieria: val,
                                calculoEstructural: val,
                              });
                            }}
                            placeholder="ej. Ing. Patricio Cevallos (o deja vacío si no aplica)"
                            className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                          <p className="text-[10px] text-white/40 mt-1">
                            Si lo dejas vacío, no se mostrará en la ficha técnica.
                          </p>
                        </div>

                        {/* Cliente / Encargo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                              Cliente / Encargo (Opcional)
                            </label>
                            <input
                              type="text"
                              value={(article as any).cliente || article.datos?.cliente || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateField('cliente' as any, val);
                                updateField('datos', {
                                  ...(article.datos || {}),
                                  cliente: val,
                                });
                              }}
                              placeholder="ej. Privado, Municipio de Quito (o deja vacío)"
                              className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                            />
                            <p className="text-[10px] text-white/40 mt-1">
                              Si lo dejas vacío, no se mostrará en la web.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                              Estado de la Obra (Opcional)
                            </label>
                            <input
                              type="text"
                              value={(article as any).estadoObra || article.datos?.estado || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateField('estadoObra' as any, val);
                                updateField('datos', {
                                  ...(article.datos || {}),
                                  estado: val,
                                });
                              }}
                              placeholder="ej. Obra Construida, Intervención Efímera (o deja vacío)"
                              className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                            />
                            <p className="text-[10px] text-white/40 mt-1">
                              Si lo dejas vacío, se deduce automáticamente.
                            </p>
                          </div>
                        </div>

                        {/* Equipo / Colaboradores */}
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                            Equipo de Proyecto / Colaboradores (Opcional)
                          </label>
                          <input
                            type="text"
                            value={(article as any).colaboradores || article.datos?.colaboradores || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateField('colaboradores' as any, val);
                              updateField('datos', {
                                ...(article.datos || {}),
                                colaboradores: val,
                              });
                            }}
                            placeholder="ej. Arq. Daniel Moreno, Arq. Margaux Eyssette (o deja vacío)"
                            className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                          <p className="text-[10px] text-white/40 mt-1">
                            Colaboradores del despacho o proyecto. Si lo dejas vacío, no se mostrará.
                          </p>
                        </div>

                        {/* Maestro Mayor & Equipo de Mano de Obra */}
                        <div className="p-3.5 bg-[#1e1e1e] border border-white/15 rounded-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                              <HardHat className="w-4 h-4 text-amber-400" />
                              <span>Maestro Mayor & Mano de Obra (Opcional)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                if (hasMaestroMayor) {
                                  updateField('maestroMayor' as any, '');
                                  updateField('datos', { ...(article.datos || {}), maestroMayor: '' });
                                  updateField('hasMaestroMayor' as any, false);
                                  updateField('constructionTeam' as any, null);
                                  updateField('equipoTrabajo' as any, []);
                                } else {
                                  updateField('maestroMayor' as any, 'Segundo Guanoluisa');
                                  updateField('datos', { ...(article.datos || {}), maestroMayor: 'Segundo Guanoluisa' });
                                  updateField('hasMaestroMayor' as any, true);
                                }
                              }}
                              className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                            >
                              {hasMaestroMayor ? '✕ Quitar Maestro Mayor' : '+ Asignar Maestro Mayor'}
                            </button>
                          </div>

                          {hasMaestroMayor ? (
                            <>

                          <ProfileSearchSelect
                            type="masterBuilder"
                            value={(article as any).maestroMayor || article.datos?.maestroMayor || ''}
                            onChange={(val) => {
                              updateField('maestroMayor' as any, val);
                              updateField('datos', {
                                ...(article.datos || {}),
                                maestroMayor: val,
                              });
                              if (!val.trim()) {
                                updateField('hasMaestroMayor' as any, false);
                              } else {
                                updateField('hasMaestroMayor' as any, true);
                              }
                            }}
                            label="Maestro Mayor Principal"
                            placeholder="ej. SEGUNDO GUANOLUISA, LUIS TOAPANTA (o deja vacío)"
                            helperText="Busca en el catálogo o escribe uno libre. Si lo dejas vacío o pulsas 'Quitar', no se mostrará en la web."
                          />

                          {/* Cuadrilla & Miembros de Mano de Obra */}
                          <div className="pt-2 border-t border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono text-white/80 uppercase font-bold flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-amber-400" />
                                <span>Cuadrilla de Constructores & Artesanos</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = (article as any).equipoTrabajo || article.datos?.equipoTrabajo || [];
                                  const updated = [
                                    ...current,
                                    {
                                      nombre: '',
                                      rol: 'Maestro Albañil / Artesano',
                                      oficio: 'Mampostería y oficios tradicionales',
                                    },
                                  ];
                                  updateField('equipoTrabajo' as any, updated);
                                  updateField('datos', {
                                    ...(article.datos || {}),
                                    equipoTrabajo: updated,
                                  });
                                }}
                                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 uppercase flex items-center gap-1 underline cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Agregar miembro
                              </button>
                            </div>

                            {/* Render list of members */}
                            {(((article as any).equipoTrabajo || article.datos?.equipoTrabajo || []) as ConstructionTeamMember[]).length > 0 ? (
                              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {(((article as any).equipoTrabajo || article.datos?.equipoTrabajo || []) as ConstructionTeamMember[]).map((member, mIdx) => (
                                  <div key={mIdx} className="p-2.5 bg-[#141414] border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                                        #{mIdx + 1} {member.rol || 'Miembro'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = [...((article as any).equipoTrabajo || article.datos?.equipoTrabajo || [])];
                                          current.splice(mIdx, 1);
                                          updateField('equipoTrabajo' as any, current);
                                          updateField('datos', {
                                            ...(article.datos || {}),
                                            equipoTrabajo: current,
                                          });
                                        }}
                                        className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                                        title="Eliminar este miembro"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={member.nombre}
                                        onChange={(e) => {
                                          const current = [...((article as any).equipoTrabajo || article.datos?.equipoTrabajo || [])];
                                          current[mIdx] = { ...current[mIdx], nombre: e.target.value };
                                          updateField('equipoTrabajo' as any, current);
                                          updateField('datos', {
                                            ...(article.datos || {}),
                                            equipoTrabajo: current,
                                          });
                                        }}
                                        placeholder="Nombre del Maestro (ej. Carlos Toapanta)"
                                        className="bg-[#242424] border border-white/20 p-1.5 text-xs text-white focus:border-white focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={member.rol}
                                        onChange={(e) => {
                                          const current = [...((article as any).equipoTrabajo || article.datos?.equipoTrabajo || [])];
                                          current[mIdx] = { ...current[mIdx], rol: e.target.value };
                                          updateField('equipoTrabajo' as any, current);
                                          updateField('datos', {
                                            ...(article.datos || {}),
                                            equipoTrabajo: current,
                                          });
                                        }}
                                        placeholder="Rol (ej. Maestro Albañil, Maestro Fierrero)"
                                        className="bg-[#242424] border border-white/20 p-1.5 text-xs text-white focus:border-white focus:outline-none"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      value={member.oficio}
                                      onChange={(e) => {
                                        const current = [...((article as any).equipoTrabajo || article.datos?.equipoTrabajo || [])];
                                        current[mIdx] = { ...current[mIdx], oficio: e.target.value };
                                        updateField('equipoTrabajo' as any, current);
                                        updateField('datos', {
                                          ...(article.datos || {}),
                                          equipoTrabajo: current,
                                        });
                                      }}
                                      placeholder="Oficio / Especialidad (ej. Aparejos de piedra, Encofrados fenolíticos)"
                                      className="w-full bg-[#242424] border border-white/20 p-1.5 text-xs text-white focus:border-white focus:outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 bg-[#151515] border border-dashed border-white/15 text-[10.5px] font-mono text-white/50 text-center">
                                Se utilizará la cuadrilla predeterminada del Maestro Mayor seleccionado o cuadrilla local. Haz clic en "Agregar miembro" para personalizarla.
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-2.5 bg-[#181818] border border-dashed border-white/20 text-[11px] font-mono text-white/50 flex items-center justify-between">
                          <span>🚫 Sin Maestro Mayor (no aparecerá en la web ni en la ficha técnica)</span>
                          <button
                            type="button"
                            onClick={() => {
                              updateField('maestroMayor' as any, 'Segundo Guanoluisa');
                              updateField('datos', { ...(article.datos || {}), maestroMayor: 'Segundo Guanoluisa' });
                              updateField('hasMaestroMayor' as any, true);
                            }}
                            className="text-[10.5px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                          >
                            Asignar
                          </button>
                        </div>
                      )}
                    </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SECCIÓN 5: APARICIÓN EN PORTADA (LANDING PRINCIPAL)           */}
              {/* ------------------------------------------------------------ */}
              <div
                id="section-landing"
                className={`bg-[#1c1c1c] border transition-all ${
                  activeSection === 'landing' ? 'border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40' : 'border-white/15'
                }`}
                onFocus={() => setActiveSection('landing')}
                onClick={() => setActiveSection('landing')}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('landing')}
                  className="w-full p-3.5 flex items-center justify-between text-left bg-[#222222] border-b border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-white/10 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      5
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white">
                        APARICIÓN EN PORTADA (LANDING PRINCIPAL)
                      </h3>
                      <p className="text-[10.5px] text-white/50 font-sans">
                        Activar en el mazo físico de inicio y definir el orden de visualización
                      </p>
                    </div>
                  </div>
                  {collapsedSections.landing ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronUp className="w-4 h-4 text-white/60" />}
                </button>

                {!collapsedSections.landing && (
                  <div className="p-4 space-y-4">
                    {/* Interruptor ON/OFF Grande */}
                    <div className="bg-[#242424] border border-white/15 p-4 rounded-xs flex items-center justify-between gap-4">
                      <div>
                        <span className="font-anton text-sm uppercase text-white block">
                          MOSTRAR ESTE PROYECTO EN LA PORTADA PRINCIPAL
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">
                          {article.showOnLanding
                            ? '✓ Activado: Aparece en el mazo de cartas de la portada'
                            : '✗ Desactivado: Solo visible en el catálogo general'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateField('showOnLanding', !article.showOnLanding)}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                          article.showOnLanding ? 'bg-emerald-500 justify-end' : 'bg-white/20 justify-start'
                        }`}
                        title="Activar o desactivar presencia en portada"
                      >
                        <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                      </button>
                    </div>

                    {article.showOnLanding && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                            Pestaña en Portada
                          </label>
                          <select
                            value={article.landingTab || article.type}
                            onChange={(e) => updateField('landingTab', e.target.value as EditorialType)}
                            className="w-full bg-[#242424] border border-white/20 p-2 text-xs font-mono uppercase text-white focus:border-white focus:outline-none"
                          >
                            <option value="proyectos">Proyectos Destacados</option>
                            <option value="territorios">Territorios Destacados</option>
                            <option value="academia">Academia Destacada</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                            Posición en el Mazo
                          </label>
                          <select
                            value={article.landingOrder || 1}
                            onChange={(e) => updateField('landingOrder', Number(e.target.value))}
                            className="w-full bg-[#242424] border border-white/20 p-2 text-xs font-mono uppercase text-white focus:border-white focus:outline-none"
                          >
                            <option value="1">#1 (Carta al Frente del Mazo)</option>
                            <option value="2">#2 (Segunda Carta)</option>
                            <option value="3">#3 (Tercera Carta)</option>
                            <option value="4">#4 (Cuarta Carta)</option>
                            <option value="5">#5 (Quinta Carta)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewAppearance('landing')}
                        className="flex-1 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Previsualizar Tarjeta del Mazo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsLandingModalOpen(true)}
                        className="py-2 px-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-anton text-xs uppercase tracking-wider hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Simulador Móvil Pantalla Completa</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SECCIÓN 6: EXPEDIENTE MODULAR Y CONTENIDOS ESPECIALES        */}
              {/* ------------------------------------------------------------ */}
              <div
                id="section-modulos"
                className={`bg-[#1c1c1c] border transition-all ${
                  activeSection === 'modulos' ? 'border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40' : 'border-white/15'
                }`}
                onFocus={() => setActiveSection('modulos')}
                onClick={() => setActiveSection('modulos')}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('modulos')}
                  className="w-full p-3.5 flex items-center justify-between text-left bg-[#222222] border-b border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-white/10 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      6
                    </span>
                    <Folder className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white">
                        EXPEDIENTE MODULAR Y CONTENIDOS ESPECIALES
                      </h3>
                      <p className="text-[10.5px] text-white/50 font-sans">
                        Pestañas Manila del dossier: Reseña, Crítica paritaria, Audio/Podcast y Comunidad
                      </p>
                    </div>
                  </div>
                  {collapsedSections.modulos ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronUp className="w-4 h-4 text-white/60" />}
                </button>

                {!collapsedSections.modulos && (
                  <div className="p-4 space-y-4">
                    {/* Selector de Pestañas Manila */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {/* 1. RESEÑA */}
                      <button
                        type="button"
                        onClick={() => setActiveFolderSection('resena')}
                        className={`p-2 text-left border transition-all flex flex-col justify-between ${
                          activeFolderSection === 'resena'
                            ? 'bg-[#FAF9F5] text-black border-white shadow-md'
                            : 'bg-[#222] text-white/70 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-anton text-xs uppercase tracking-wider">RESEÑA</span>
                          <span className="text-[9px] font-mono px-1 bg-black/10 text-black">ACTIVA</span>
                        </div>
                        <span className="text-[9px] font-mono opacity-60 truncate">
                          {article.modules?.length || 0} módulos
                        </span>
                      </button>

                      {/* 2. CRÍTICA */}
                      <button
                        type="button"
                        onClick={() => setActiveFolderSection('critica')}
                        className={`p-2 text-left border transition-all flex flex-col justify-between ${
                          activeFolderSection === 'critica'
                            ? 'bg-[#FAF9F5] text-black border-white shadow-md'
                            : 'bg-[#222] text-white/70 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-anton text-xs uppercase tracking-wider">CRÍTICA</span>
                          <span
                            className={`text-[9px] font-mono px-1 font-bold ${
                              isCriticaActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {isCriticaActive ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono opacity-60 truncate">
                          {article.critic || 'Sin asignar'}
                        </span>
                      </button>

                      {/* 3. PODCAST */}
                      <button
                        type="button"
                        onClick={() => setActiveFolderSection('podcast')}
                        className={`p-2 text-left border transition-all flex flex-col justify-between ${
                          activeFolderSection === 'podcast'
                            ? 'bg-[#FAF9F5] text-black border-white shadow-md'
                            : 'bg-[#222] text-white/70 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-anton text-xs uppercase tracking-wider">PODCAST</span>
                          <span
                            className={`text-[9px] font-mono px-1 font-bold ${
                              article.hasPodcast ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'
                            }`}
                          >
                            {article.hasPodcast ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono opacity-60 truncate">
                          {article.podcast?.episode || 'Episodio'}
                        </span>
                      </button>

                      {/* 4. NOTAS */}
                      <button
                        type="button"
                        onClick={() => setActiveFolderSection('comunidad')}
                        className={`p-2 text-left border transition-all flex flex-col justify-between ${
                          activeFolderSection === 'comunidad'
                            ? 'bg-[#FAF9F5] text-black border-white shadow-md'
                            : 'bg-[#222] text-white/70 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-anton text-xs uppercase tracking-wider">NOTAS</span>
                          <span
                            className={`text-[9px] font-mono px-1 font-bold ${
                              article.hasNotasComunidad !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {article.hasNotasComunidad !== false ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono opacity-60 truncate">
                          Comunidad
                        </span>
                      </button>
                    </div>

                    {/* Reseña Modules List */}
                    {activeFolderSection === 'resena' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-anton text-xs uppercase tracking-wider text-white">
                            MÓDULOS DE RESEÑA ({article.modules?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAddModuleTarget('resena');
                              setIsAddModuleOpen(true);
                            }}
                            className="bg-white text-black hover:bg-neutral-200 px-3 py-1 text-[11px] font-anton uppercase tracking-wider flex items-center gap-1 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir Módulo</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(article.modules || []).map((mod, index) => (
                            <React.Fragment key={mod.id}>
                              {renderModuleCard(mod, index, false, article.modules?.length || 1)}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Crítica paritaria */}
                    {activeFolderSection === 'critica' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-anton text-xs uppercase tracking-wider text-white">
                            CRÍTICA EXTERNA PARITARIA
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleCritica(!isCriticaActive)}
                            className={`px-3 py-1 text-xs font-anton uppercase tracking-wider ${
                              isCriticaActive ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {isCriticaActive ? 'Activada' : 'Desactivada'}
                          </button>
                        </div>

                        {isCriticaActive && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                                Nombre del Crítico o Colectivo Revisor
                              </label>
                              <input
                                type="text"
                                value={article.critic || ''}
                                onChange={(e) => updateField('critic', e.target.value.toUpperCase())}
                                placeholder="ej. AL BORDE // REDACCIÓN CRÍTICA EA"
                                className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white uppercase focus:border-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                                Titular del Dictamen Crítico
                              </label>
                              <input
                                type="text"
                                value={article.criticaHeadline || ''}
                                onChange={(e) => updateField('criticaHeadline', e.target.value)}
                                placeholder="ej. Desafiar la convención inmobiliaria desde la inercia térmica"
                                className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                                Texto del Ensayo Crítico
                              </label>
                              <textarea
                                rows={4}
                                value={article.critica || ''}
                                onChange={(e) => updateField('critica', e.target.value)}
                                placeholder="Escribe aquí el análisis de pertinencia ética y constructiva..."
                                className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Podcast */}
                    {activeFolderSection === 'podcast' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-anton text-xs uppercase tracking-wider text-white">
                            CONVERSACIÓN EN AUDIO / PODCAST
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePodcast(!article.hasPodcast)}
                            className={`px-3 py-1 text-xs font-anton uppercase tracking-wider ${
                              article.hasPodcast ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {article.hasPodcast ? 'Activado' : 'Desactivado'}
                          </button>
                        </div>

                        {article.hasPodcast && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                                  Código Episodio
                                </label>
                                <input
                                  type="text"
                                  value={article.podcast?.episode || 'EP. 04'}
                                  onChange={(e) =>
                                    updateField('podcast', {
                                      episode: e.target.value,
                                      title: article.podcast?.title || article.title,
                                      duration: article.podcast?.duration || '35 MIN',
                                      published: true,
                                      audioUrl: article.podcast?.audioUrl,
                                    })
                                  }
                                  className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                                  Duración
                                </label>
                                <input
                                  type="text"
                                  value={article.podcast?.duration || '35 MIN'}
                                  onChange={(e) =>
                                    updateField('podcast', {
                                      episode: article.podcast?.episode || 'EP. 04',
                                      title: article.podcast?.title || article.title,
                                      duration: e.target.value,
                                      published: true,
                                      audioUrl: article.podcast?.audioUrl,
                                    })
                                  }
                                  className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                                Enlace de Audio (MP3 / Stream)
                              </label>
                              <input
                                type="url"
                                value={article.podcast?.audioUrl || ''}
                                onChange={(e) =>
                                  updateField('podcast', {
                                    episode: article.podcast?.episode || 'EP. 04',
                                    title: article.podcast?.title || article.title,
                                    duration: article.podcast?.duration || '35 MIN',
                                    published: true,
                                    audioUrl: e.target.value,
                                  })
                                }
                                placeholder="https://..."
                                className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comunidad */}
                    {activeFolderSection === 'comunidad' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-anton text-xs uppercase tracking-wider text-white">
                            NOTAS DE LA COMUNIDAD (OBRA VIVA)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleNotas(article.hasNotasComunidad === false)}
                            className={`px-3 py-1 text-xs font-anton uppercase tracking-wider cursor-pointer ${
                              article.hasNotasComunidad !== false ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {article.hasNotasComunidad !== false ? 'Activadas' : 'Desactivadas'}
                          </button>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {article.type === 'territorios'
                            ? 'Permite a investigadores, residentes y estudiantes aportar reflexiones críticas, observaciones y discusiones territoriales. (Las visitas de obra están automáticamente deshabilitadas).'
                            : article.type === 'academia'
                            ? 'Permite a estudiantes, docentes y críticos aportar reflexiones sobre el marco teórico y la pertinencia de la investigación. (Las visitas de obra están automáticamente deshabilitadas).'
                            : 'Permite a estudiantes, críticos y residentes aportar testimonios y registros de la obra habitada a lo largo del tiempo.'}
                        </p>
                        {article.type !== 'proyectos' && (
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                            ✓ Modo {article.type === 'territorios' ? 'Territorios' : 'Academia'} activo: Las 'Visitas de obra' están omitidas. La comunidad participa mediante reflexiones y aportes críticos.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SECCIÓN 7: OPCIONES AVANZADAS (CERRADO POR DEFECTO)          */}
              {/* ------------------------------------------------------------ */}
              <div
                id="section-avanzado"
                className={`bg-[#191919] border transition-all ${
                  activeSection === 'avanzado' ? 'border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40' : 'border-white/10'
                }`}
                onFocus={() => setActiveSection('avanzado')}
                onClick={() => setActiveSection('avanzado')}
              >
                <button
                  type="button"
                  onClick={() => toggleSection('avanzado')}
                  className="w-full p-3.5 flex items-center justify-between text-left bg-[#1f1f1f] border-b border-white/10 hover:bg-[#252525] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-white/5 text-white/70 font-mono text-[10px] flex items-center justify-center font-bold">
                      7
                    </span>
                    <Settings className="w-4 h-4 text-white/60" />
                    <div>
                      <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white/80">
                        OPCIONES AVANZADAS
                      </h3>
                      <p className="text-[10.5px] text-white/40 font-sans">
                        Ajustes técnicos poco frecuentes: dirección web, estado y datos para Google
                      </p>
                    </div>
                  </div>
                  {collapsedSections.avanzado ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
                </button>

                {!collapsedSections.avanzado && (
                  <div className="p-4 space-y-4">
                    {/* Dirección Web Amigable (Slug) */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                        Dirección Web Amigable (Enlace Permanente)
                      </label>
                      <div className="flex items-center gap-1.5 bg-[#202020] border border-white/20 p-2 text-xs font-mono text-white/70">
                        <span className="text-white/40 select-none">/{article.type}/</span>
                        <input
                          type="text"
                          value={article.slug || ''}
                          onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                          placeholder="nombre-del-proyecto"
                          className="flex-1 bg-transparent text-white focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">
                        La dirección URL única con la que se compartirá la obra en internet.
                      </p>
                    </div>

                    {/* Estado de Publicación */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                        Estado de Publicación
                      </label>
                      <select
                        value={article.status}
                        onChange={(e) => updateField('status', e.target.value as PublicationStatus)}
                        className="w-full bg-[#242424] border border-white/20 p-2 text-xs font-mono uppercase text-white focus:border-white focus:outline-none"
                      >
                        <option value="draft">Borrador (Solo visible para editores)</option>
                        <option value="ready">Listo para revisión</option>
                        <option value="published">Publicado en la web (Visible a todos)</option>
                        <option value="archived">Archivado</option>
                      </select>
                    </div>

                    {/* Animación Cinética de Apertura */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1.5">
                        Efecto Visual de Apertura (Scroll)
                      </label>
                      <div className="space-y-1.5">
                        {[
                          { id: 'vertical-slices', title: 'Dislocación Vertical Tectónica', desc: 'Franjas verticales que se desplazan al hacer scroll' },
                          { id: 'horizontal-blinds', title: 'Persianas Horizontales', desc: 'Revelado sutil por líneas horizontales' },
                          { id: 'quadrant-aperture', title: 'Apertura en Cuadrantes', desc: 'Efecto diafragma en 4 cuadrantes' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateField('motion', {
                                ...article.motion,
                                variant: item.id as any,
                              })
                            }
                            className={`w-full p-2.5 text-left border transition-all ${
                              (article.motion?.variant || 'vertical-slices') === item.id
                                ? 'bg-white text-black border-white'
                                : 'bg-[#222222] text-white border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="font-anton text-xs uppercase tracking-wider">{item.title}</div>
                            <div className={`text-[10px] ${
                              (article.motion?.variant || 'vertical-slices') === item.id ? 'text-black/70' : 'text-white/40'
                            }`}>
                              {item.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Datos para Google y Redes Sociales (Fórmula Arquitectura Viva & ArchDaily) */}
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-anton text-xs uppercase tracking-wider text-white block">
                          POSICIONAMIENTO EN GOOGLE (FÓRMULA ARQUITECTURA VIVA / ARCHDAILY)
                        </span>
                        <button
                          type="button"
                          onClick={handleOptimizeArchitectureSeo}
                          className="px-2.5 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[10px] font-anton uppercase tracking-wider flex items-center gap-1 rounded shadow-xs transition-colors shrink-0"
                          title="Generar automáticamente título con autoría y descripción optimizada para Google"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-Optimizar SEO</span>
                        </button>
                      </div>

                      <p className="text-[10.5px] text-white/50 leading-relaxed font-sans">
                        Aprende de las publicaciones de arquitectura más importantes del mundo: Google premia títulos estructurados con el nombre de la obra y los estudios, acompañados de una miniatura visual.
                      </p>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-mono uppercase text-white/60">
                            Título para Google (Ideal 50-60 caracteres)
                          </label>
                          <span className={`text-[10px] font-mono ${
                            (article.seo?.metaTitle || article.title).length <= 60 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {(article.seo?.metaTitle || article.title).length} / 60
                          </span>
                        </div>
                        <input
                          type="text"
                          value={article.seo?.metaTitle || article.title}
                          onChange={(e) =>
                            updateField('seo', {
                              ...article.seo,
                              metaTitle: e.target.value,
                            })
                          }
                          placeholder="ej. Centro cultural Aduana en San Blas - Colectivo C733"
                          className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-mono uppercase text-white/60">
                            Descripción Snippet para Google (Ideal 145-160 caracteres)
                          </label>
                          <span className={`text-[10px] font-mono ${
                            (article.seo?.metaDescription || article.excerpt).length <= 160 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {(article.seo?.metaDescription || article.excerpt).length} / 160
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={article.seo?.metaDescription || article.excerpt}
                          onChange={(e) =>
                            updateField('seo', {
                              ...article.seo,
                              metaDescription: e.target.value,
                            })
                          }
                          placeholder="El edificio histórico de... en Quito, diseñado por..."
                          className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white resize-none focus:border-white focus:outline-none"
                        />
                      </div>

                      {/* Vista previa idéntica a la captura de pantalla de Google */}
                      <div className="p-3.5 bg-white text-black rounded-lg border border-neutral-300 shadow-sm space-y-2">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-semibold">
                          Resultado Real en el Buscador de Google:
                        </span>

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 pr-1">
                            {/* Favicon + Breadcrumb */}
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-black text-white font-anton text-[8px] flex items-center justify-center shrink-0">
                                EA
                              </div>
                              <div className="truncate text-[11px] text-neutral-700 font-mono">
                                <span className="font-sans font-medium text-black">Ecuadorian Architecture</span>
                                <span className="text-neutral-400 mx-1">›</span>
                                <span>{article.type || 'proyectos'} › {article.slug || 'obra'}</span>
                              </div>
                            </div>

                            {/* Google Blue/Purple Clickable Title */}
                            <h4 className="text-[13px] sm:text-[14px] font-normal text-[#1a0dab] leading-snug line-clamp-2">
                              {article.seo?.metaTitle || `${article.title} - ${studiosList.join(' + ') || article.studio || 'ESTUDIO'}`}
                            </h4>

                            {/* Snippet text */}
                            <p className="text-[11px] text-[#4d5156] line-clamp-2 mt-1 leading-relaxed">
                              {article.seo?.metaDescription || article.excerpt}
                            </p>
                          </div>

                          {/* Thumbnail photo on the right (matching user screenshot) */}
                          <div className="w-16 h-16 rounded-[10px] overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0 shadow-xs">
                            <img
                              src={article.heroImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-emerald-700">
                          <span className="flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Rich Snippet con Miniatura a la derecha activado</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setPreviewAppearance('google')}
                            className="text-[#1a73e8] hover:underline font-medium"
                          >
                            Ver simulador Google ➔
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* ================================================================== */}
        {/* RIGHT PANEL: REAL-TIME LIVE CANVAS PREVIEW                         */}
        {/* ================================================================== */}
        <main className="flex-1 bg-[#0b0b0b] flex flex-col items-center justify-start overflow-hidden relative">
          {/* Top Preview Quality Bar & Section Sync Indicator */}
          <div className="w-full bg-[#141414] border-b border-white/10 px-4 py-2 flex items-center justify-between gap-3 text-xs flex-shrink-0 z-20">
            {/* Active editing section reminder */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-white/60">
                Sincronizado con: <strong className="text-white uppercase font-anton tracking-wider">{sectionMeta[activeSection].title}</strong>
              </span>
            </div>

            {/* Quality Auditor Notice */}
            <div
              className={`px-3 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 truncate max-w-lg ${
                auditorNotice.type === 'warning'
                  ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <span>{auditorNotice.text}</span>
            </div>
          </div>

          {/* Canvas Viewport Container */}
          <div className="w-full flex-1 overflow-y-auto flex justify-center p-3 sm:p-6">
            {/* DESKTOP VIEWPORT (~1440px) */}
            {previewDevice === 'desktop' && (
              <div className="w-full max-w-[1440px] bg-white text-ea-black shadow-2xl relative flex flex-col min-h-[90vh]">
                {previewAppearance === 'full' && (
                  <ProjectDetail
                    projectId={article.id}
                    customProjectData={article}
                    controlledActiveTab={
                      activeFolderSection === 'resena' ? 'resena' :
                      activeFolderSection === 'critica' ? 'critica' :
                      activeFolderSection === 'podcast' ? 'podcast' : 'obra-viva'
                    }
                    onTabChange={(tabId) => {
                      if (tabId === 'resena') setActiveFolderSection('resena');
                      else if (tabId === 'critica') setActiveFolderSection('critica');
                      else if (tabId === 'podcast') setActiveFolderSection('podcast');
                      else if (tabId === 'obra-viva') setActiveFolderSection('comunidad');
                    }}
                    onBack={() => {}}
                  />
                )}

                {previewAppearance === 'landing' && (
                  <div className="p-8 sm:p-14 flex flex-col items-center justify-center min-h-[600px] bg-[#FAF9F5] select-none text-ea-black">
                    <div className="text-center space-y-1 mb-8">
                      <span className="font-anton text-xs uppercase tracking-widest text-ea-black/50 block">
                        VISTA PREVIA DE LA PORTADA // MAZO FÍSICO
                      </span>
                      <h3 className="font-anton text-xl uppercase text-ea-black flex items-center justify-center gap-2">
                        <span>TARJETA DESTACADA EN COMPUTADOR</span>
                        {article.showOnLanding ? (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded uppercase">
                            En Portada #{article.landingOrder || 1}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-200 border border-neutral-300 px-2 py-0.5 rounded uppercase">
                            No activa en Portada
                          </span>
                        )}
                      </h3>
                    </div>

                    {/* Wide Desktop Card */}
                    <div className="w-full max-w-[820px] bg-white border-2 border-ea-black rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col text-ea-black">
                      <header className="w-full bg-white border-b-2 border-ea-black px-6 py-3 flex items-center justify-between gap-3 shrink-0">
                        <h3 className="font-okcok text-xl uppercase text-ea-black tracking-wide truncate">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-anton text-[11px] tracking-wider uppercase text-ea-black bg-white px-2 py-0.5 rounded-[3px] border border-ea-black shadow-xs">
                            {article.category || 'PROYECTO'}
                          </span>
                          <span className="font-mono text-[10px] text-ea-black/60 uppercase">
                            • {article.location}
                          </span>
                        </div>
                      </header>

                      <div className="p-6 md:p-7 flex flex-row items-stretch justify-between gap-6">
                        <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                          <div>
                            <div className="px-2.5 py-1 border border-ea-black rounded-[4px] flex items-center justify-between gap-2 w-full max-w-[340px] bg-white overflow-hidden box-border">
                              <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={article.studio}>
                                <AuthorIcon className="h-3.5 w-auto object-contain text-ea-black shrink-0" />
                                <span className="font-okcok text-[10px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                  {studiosList.join(' + ') || article.studio || 'ESTUDIO'}
                                </span>
                              </div>
                              {article.type === 'proyectos' && Boolean((article as any).maestroMayor || article.datos?.maestroMayor) && (
                                <>
                                  <span className="text-ea-black/30 text-[9px] shrink-0">•</span>
                                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title="Maestro Mayor">
                                    <span className="text-[10px] shrink-0">🔨</span>
                                    <span className="font-okcok text-[10px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                      {(article as any).maestroMayor || article.datos?.maestroMayor}
                                    </span>
                                  </div>
                                </>
                              )}
                              {article.type === 'proyectos' && Boolean((article as any).maestroMayor || article.datos?.maestroMayor) && (
                              <>
                                <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>
                                <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title="Maestro Mayor">
                                  <span className="text-[9px] shrink-0">🔨</span>
                                  <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                    {(article as any).maestroMayor || article.datos?.maestroMayor}
                                  </span>
                                </div>
                              </>
                            )}
                            {article.type === 'proyectos' && hasPhotographer && (
                                <>
                                  <span className="text-ea-black/30 text-[9px] shrink-0">•</span>
                                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={article.photographer}>
                                    <CameraIcon className="h-3 w-auto object-contain text-ea-black shrink-0" />
                                    <span className="font-okcok text-[10px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                      {article.photographer || article.datos?.fotografia}
                                    </span>
                                  </div>
                                </>
                              )}
                              {article.type === 'academia' && hasRenders && (
                                <>
                                  <span className="text-ea-black/30 text-[9px] shrink-0">•</span>
                                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={article.renders || article.datos?.renders}>
                                    <span className="font-okcok text-[10px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                      RENDERS: {article.renders || article.datos?.renders}
                                    </span>
                                  </div>
                                </>
                              )}
                              <span className="text-ea-black/30 text-[9px] shrink-0">•</span>
                              <div className="flex items-center gap-1 shrink-0" title={article.year}>
                                <CalendarIcon className="w-3.5 h-3.5 text-ea-black shrink-0" />
                                <span className="font-okcok text-[10px] uppercase tracking-wide text-ea-black leading-tight shrink-0 whitespace-nowrap">
                                  {article.year || '2026'}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2 font-creato text-[12.5px] text-ea-black/85 leading-relaxed line-clamp-4 max-w-md">
                              <p>{article.excerpt}</p>
                              {article.secondaryExcerpt && (
                                <p className="text-ea-black/80">{article.secondaryExcerpt}</p>
                              )}
                            </div>
                          </div>

                          <div className="pt-4 mt-auto">
                            <div className="inline-flex items-center gap-2 bg-white text-ea-black px-4 py-2 border border-ea-black rounded-[4px] font-okcok text-base uppercase tracking-wide shadow-xs">
                              <span>{article.actionButtonText || 'VER PROYECTO'}</span>
                              <span className="text-base leading-none">➔</span>
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => setShowSecondaryInEditorPreview((prev) => !prev)}
                          className="w-[280px] h-[220px] shrink-0 rounded-[10px] overflow-hidden bg-neutral-900 relative shadow-inner cursor-pointer"
                          title="Clic para probar el efecto cortina"
                        >
                          <img
                            src={article.heroImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                          {article.secondaryImageUrl && (
                            <div
                              className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-500"
                              style={{
                                clipPath: showSecondaryInEditorPreview ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
                              }}
                            >
                              <img
                                src={article.secondaryImageUrl}
                                alt="Vista secundaria"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                            {showSecondaryInEditorPreview ? 'Vista Interior' : 'Clic para Interior'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewAppearance === 'card' && (
                  <div className="p-8 sm:p-16 flex flex-col items-center justify-center min-h-[600px] bg-[#FAF9F5] space-y-6">
                    <span className="font-anton text-xs uppercase tracking-widest text-ea-black/50 block">
                      VISTA PREVIA EN CATÁLOGO GENERAL
                    </span>
                    <OrigamiFolderCard
                      project={{
                        id: article.id,
                        title: article.title,
                        studio: studiosList.join(' + ') || article.studio || 'ESTUDIO',
                        location: article.location,
                        year: article.year,
                        excerpt: article.excerpt,
                        heroImage: article.heroImage,
                        heroImagePosition: article.heroImagePosition,
                        heroImageFocalPoint: article.heroImageFocalPoint,
                      }}
                      onSelect={() => {}}
                    />
                  </div>
                )}

                {previewAppearance === 'google' && (
                  <GoogleSearchPreview
                    article={article}
                    device="desktop"
                    onApplyOptimizedSeo={handleOptimizeArchitectureSeo}
                  />
                )}
              </div>
            )}

            {/* TABLET VIEWPORT (~768px) */}
            {previewDevice === 'tablet' && (
              <div className="w-[768px] max-w-full bg-white text-ea-black shadow-2xl relative flex flex-col min-h-[85vh] border-x-4 border-neutral-700 rounded-sm">
                {previewAppearance === 'full' && (
                  <ProjectDetail
                    projectId={article.id}
                    customProjectData={article}
                    controlledActiveTab={
                      activeFolderSection === 'resena' ? 'resena' :
                      activeFolderSection === 'critica' ? 'critica' :
                      activeFolderSection === 'podcast' ? 'podcast' : 'obra-viva'
                    }
                    onTabChange={(tabId) => {
                      if (tabId === 'resena') setActiveFolderSection('resena');
                      else if (tabId === 'critica') setActiveFolderSection('critica');
                      else if (tabId === 'podcast') setActiveFolderSection('podcast');
                      else if (tabId === 'obra-viva') setActiveFolderSection('comunidad');
                    }}
                    onBack={() => {}}
                  />
                )}

                {previewAppearance === 'landing' && (
                  <div className="p-6 flex flex-col items-center justify-center min-h-[500px] bg-[#FAF9F5]">
                    <div className="w-full max-w-[680px] bg-white border-2 border-ea-black rounded-[18px] shadow-lg overflow-hidden flex flex-col">
                      <header className="w-full bg-white border-b-2 border-ea-black px-5 py-2.5 flex items-center justify-between">
                        <h3 className="font-okcok text-lg uppercase text-ea-black tracking-wide truncate">
                          {article.title}
                        </h3>
                        <span className="font-anton text-[10px] tracking-wider uppercase text-ea-black bg-white px-2 py-0.5 rounded-[3px] border border-ea-black">
                          {article.category || 'PROYECTO'}
                        </span>
                      </header>
                      <div className="p-5 flex flex-row gap-5">
                        <div className="flex-1 flex flex-col justify-between">
                          <p className="font-creato text-xs text-ea-black/85 leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                          <div className="pt-3">
                            <div className="inline-flex items-center gap-2 bg-white text-ea-black px-3.5 py-1.5 border border-ea-black rounded-[4px] font-okcok text-xs uppercase tracking-wide">
                              <span>{article.actionButtonText || 'VER PROYECTO'}</span>
                              <span>➔</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-[220px] h-[160px] shrink-0 rounded-[8px] overflow-hidden bg-black relative">
                          <img src={article.heroImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewAppearance === 'card' && (
                  <div className="p-8 flex items-center justify-center min-h-[500px] bg-[#FAF9F5]">
                    <OrigamiFolderCard
                      project={{
                        id: article.id,
                        title: article.title,
                        studio: studiosList.join(' + ') || article.studio || 'ESTUDIO',
                        location: article.location,
                        year: article.year,
                        excerpt: article.excerpt,
                        heroImage: article.heroImage,
                        heroImagePosition: article.heroImagePosition,
                        heroImageFocalPoint: article.heroImageFocalPoint,
                      }}
                      onSelect={() => {}}
                    />
                  </div>
                )}

                {previewAppearance === 'google' && (
                  <GoogleSearchPreview
                    article={article}
                    device="tablet"
                    onApplyOptimizedSeo={handleOptimizeArchitectureSeo}
                  />
                )}
              </div>
            )}

            {/* CELULAR VIEWPORT (~390px) WITH AUTHENTIC SMARTPHONE FRAME */}
            {previewDevice === 'mobile' && (
              <div className="w-[410px] max-w-full bg-[#1c1c1c] p-3 rounded-[46px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-4 border-[#333] relative my-auto">
                {/* Smartphone Speaker & Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full flex items-center justify-center gap-2 z-30 pointer-events-none">
                  <div className="w-10 h-1 bg-neutral-700 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full border border-neutral-700" />
                </div>

                {/* Inner Screen Viewport */}
                <div className="w-full bg-white rounded-[36px] overflow-hidden pt-7 pb-4 min-h-[680px] max-h-[82vh] overflow-y-auto">
                  {previewAppearance === 'full' && (
                    <ProjectDetail
                      projectId={article.id}
                      customProjectData={article}
                      controlledActiveTab={
                        activeFolderSection === 'resena' ? 'resena' :
                        activeFolderSection === 'critica' ? 'critica' :
                        activeFolderSection === 'podcast' ? 'podcast' : 'obra-viva'
                      }
                      onTabChange={(tabId) => {
                        if (tabId === 'resena') setActiveFolderSection('resena');
                        else if (tabId === 'critica') setActiveFolderSection('critica');
                        else if (tabId === 'podcast') setActiveFolderSection('podcast');
                        else if (tabId === 'obra-viva') setActiveFolderSection('comunidad');
                      }}
                      onBack={() => {}}
                    />
                  )}

                  {previewAppearance === 'landing' && (
                    <div className="p-3 bg-[#FAF9F5] min-h-[580px] flex flex-col justify-center">
                      <article className="w-full bg-white text-ea-black border-2 border-ea-black rounded-[16px] overflow-hidden flex flex-col shadow-sm">
                        <header className="w-full bg-white border-b-2 border-ea-black px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
                          <h3 className="font-okcok text-base uppercase text-ea-black tracking-wide truncate">
                            {article.title}
                          </h3>
                          <span className="font-anton text-[9.5px] tracking-wider uppercase text-ea-black bg-white px-2 py-0.5 rounded-[3px] border border-ea-black shadow-xs shrink-0">
                            {article.category || 'PROYECTO'}
                          </span>
                        </header>

                        <div className="p-3.5 flex flex-col gap-3">
                          {/* Metadata capsule */}
                          <div className="px-2 py-1 border border-ea-black rounded-[4px] flex items-center justify-between gap-1.5 w-full bg-white overflow-hidden box-border">
                            <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={article.studio}>
                              <AuthorIcon className="h-3 w-auto object-contain text-ea-black shrink-0" />
                              <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                {studiosList.join(' + ') || article.studio || 'ESTUDIO'}
                              </span>
                            </div>
                            {article.type === 'proyectos' && Boolean((article as any).maestroMayor || article.datos?.maestroMayor) && (
                              <>
                                <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>
                                <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title="Maestro Mayor">
                                  <span className="text-[9px] shrink-0">🔨</span>
                                  <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                    {(article as any).maestroMayor || article.datos?.maestroMayor}
                                  </span>
                                </div>
                              </>
                            )}
                            {article.type === 'proyectos' && hasPhotographer && (
                              <>
                                <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>
                                <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={article.photographer}>
                                  <CameraIcon className="h-2.5 w-auto object-contain text-ea-black shrink-0" />
                                  <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                    {article.photographer || article.datos?.fotografia}
                                  </span>
                                </div>
                              </>
                            )}
                            {article.type === 'academia' && hasRenders && (
                              <>
                                <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>
                                <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={article.renders || article.datos?.renders}>
                                  <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                    RENDERS: {article.renders || article.datos?.renders}
                                  </span>
                                </div>
                              </>
                            )}
                            <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>
                            <div className="flex items-center gap-1 shrink-0" title={article.year}>
                              <CalendarIcon className="w-3 h-3 text-ea-black shrink-0" />
                              <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight shrink-0 whitespace-nowrap">
                                {article.year || '2026'}
                              </span>
                            </div>
                          </div>

                          {/* Photo with wipe */}
                          <div
                            onClick={() => setShowSecondaryInEditorPreview((prev) => !prev)}
                            className="w-full h-[155px] rounded-[8px] overflow-hidden bg-neutral-900 relative shadow-inner cursor-pointer"
                            title="Tocar para alternar vista interior"
                          >
                            <img
                              src={article.heroImage}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                            {article.secondaryImageUrl && (
                              <div
                                className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-500"
                                style={{
                                  clipPath: showSecondaryInEditorPreview ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
                                }}
                              >
                                <img
                                  src={article.secondaryImageUrl}
                                  alt="Vista secundaria"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[8px] font-mono px-1.5 py-0.5 rounded">
                              {showSecondaryInEditorPreview ? 'Vista Interior' : 'Tocar para Interior'}
                            </div>
                          </div>

                          {/* Excerpt */}
                          <div className="font-creato text-xs text-ea-black/85 leading-relaxed line-clamp-3">
                            <p>{article.excerpt}</p>
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-white text-ea-black px-4 py-2 border border-ea-black rounded-[4px] font-okcok text-sm uppercase tracking-wide shadow-xs"
                          >
                            <span>{article.actionButtonText || 'VER PROYECTO'}</span>
                            <span className="text-sm leading-none">➔</span>
                          </button>
                        </div>
                      </article>
                    </div>
                  )}

                  {previewAppearance === 'card' && (
                    <div className="p-3 bg-[#FAF9F5] min-h-[580px] flex items-center justify-center">
                      <OrigamiFolderCard
                        project={{
                          id: article.id,
                          title: article.title,
                          studio: studiosList.join(' + ') || article.studio || 'ESTUDIO',
                          location: article.location,
                          year: article.year,
                          excerpt: article.excerpt,
                          heroImage: article.heroImage,
                          heroImagePosition: article.heroImagePosition,
                          heroImageFocalPoint: article.heroImageFocalPoint,
                        }}
                        onSelect={() => {}}
                      />
                    </div>
                  )}

                  {previewAppearance === 'google' && (
                    <div className="p-2 bg-[#f8f9fa] min-h-[580px]">
                      <GoogleSearchPreview
                        article={article}
                        device="mobile"
                        onApplyOptimizedSeo={handleOptimizeArchitectureSeo}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: ADD MODULE PICKER                                             */}
      {/* ==================================================================== */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-[#161616] border border-white/20 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-anton text-xl uppercase tracking-wider text-white">
                  AÑADIR MÓDULO EDITORIAL {addModuleTarget === 'critica' ? 'A CRÍTICA' : 'A RESEÑA'}
                </h3>
                <p className="text-xs text-white/50">
                  {addModuleTarget === 'critica'
                    ? 'Selecciona el tipo de bloque que deseas integrar al ensayo de Crítica.'
                    : 'Selecciona el tipo de bloque que deseas integrar al cuerpo de la Reseña.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setInsertAtIndex(null);
                  setIsAddModuleOpen(false);
                }}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pr-1">
              {MODULE_CATALOG.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddModule(item.type)}
                    className="p-3.5 bg-[#202020] border border-white/10 hover:border-white hover:bg-white hover:text-black text-left flex flex-col justify-between group transition-all"
                  >
                    <IconComp className="w-5 h-5 text-white/60 group-hover:text-black mb-2" />
                    <div>
                      <div className="font-anton text-xs uppercase tracking-wider text-white group-hover:text-black">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-white/50 group-hover:text-black/70 mt-1 leading-tight">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: MEDIA LIBRARY                                                 */}
      {/* ==================================================================== */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={handleSelectMedia}
        currentImageUrl={
          mediaTarget === 'hero'
            ? article.heroImage
            : mediaTarget === 'secondary'
            ? article.secondaryImageUrl
            : undefined
        }
      />

      {/* ==================================================================== */}
      {/* MODAL: LANDING PREVIEWS & MOBILE SIMULATOR                           */}
      {/* ==================================================================== */}
      <LandingPreviewModal
        isOpen={isLandingModalOpen}
        onClose={() => setIsLandingModalOpen(false)}
        articles={allArticles}
        initialTab={(article.landingTab || article.type) as any}
        initialArticleId={article.id}
        onSaveArticle={(updated) => {
          if (updated.id === article.id) {
            setArticle(updated);
          }
          if (saveEditorialArticle) {
            saveEditorialArticle(updated);
          }
        }}
        onEditArticle={(target) => {
          setArticle(target);
          setActiveSection('landing');
          setCollapsedSections((prev) => ({ ...prev, landing: false }));
        }}
      />
    </div>
  );
};
