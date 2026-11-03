/**
 * Modelos de datos para el CMS Editorial Visual de EcuadorianArchitecture (EA)
 * Soporta Proyectos, Territorios, Academia y el sistema modular de publicación.
 */

export type EditorialType = 'proyectos' | 'territorios' | 'academia';
export type PublicationStatus = 'draft' | 'ready' | 'published' | 'archived';

export type EditorialModuleType =
  | 'hero-header'
  | 'title-subtitle'
  | 'rich-text'
  | 'single-image'
  | 'fullscreen-image'
  | 'image-gallery'
  | 'image-comparison'
  | 'video'
  | 'podcast'
  | 'blockquote'
  | 'technical-specs'
  | 'materials-list'
  | 'project-data'
  | 'planimetry'
  | 'map-location'
  | 'credits'
  | 'external-links'
  | 'separator';

export interface EditorialModuleItem {
  id: string;
  type: EditorialModuleType;
  title?: string;
  subtitle?: string;
  content?: string;
  caption?: string;
  credits?: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  audioUrl?: string;
  episode?: string;
  duration?: string;
  quoteAuthor?: string;
  quoteText?: string;
  dataList?: { key: string; value: string }[];
  externalLinks?: { label: string; url: string }[];
  planType?: 'planta' | 'corte' | 'axonometria';
  beforeImageUrl?: string;
  afterImageUrl?: string;
  category?: 'fotografia' | 'planimetria';
  imageCategories?: Record<string, 'fotografia' | 'planimetria'>;
  settings?: {
    aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
    focalPoint?: 'top' | 'center' | 'bottom';
    columns?: 2 | 3 | 4;
    showBorder?: boolean;
  };
}

export interface EditorialArticle {
  id: string;
  slug: string;
  type: EditorialType;
  number?: string;
  title: string;
  subtitle?: string;
  studio?: string; // Estudio para proyectos, institución para academia, colectivo para territorios
  critic?: string; // Crítico externo
  author?: string; // Autor editorial
  location: string;
  country?: string;
  city?: string;
  year: string;
  date?: string;
  excerpt: string;
  status: PublicationStatus;
  featured?: boolean;
  category?: string;
  tags?: string[];
  heroImage: string;
  heroImageFocalPoint?: 'top' | 'center' | 'bottom';
  heroImageCaption?: string;
  heroImageCredit?: string;
  gallery?: string[];
  imageCategories?: Record<string, 'fotografia' | 'planimetria'>;
  // Landing Deck Configuration & Preview Fields
  showOnLanding?: boolean;
  landingOrder?: number;
  landingTab?: EditorialType;
  secondaryExcerpt?: string;
  secondaryImageUrl?: string;
  secondaryCaption?: string;
  actionButtonText?: string;
  authorHandle?: string;
  photographer?: string;
  photographerHandle?: string;
  renders?: string; // Autor de Renders / Visualización 3D (Academia / Proyectos)
  hasVisitas?: boolean; // Control explícito de visitas de obra (falso para Territorios y Academia)
  studios?: string[];
  escritoPor?: string;
  editadoPor?: string;
  superficie?: string;
  memory?: string;
  resena?: string;
  hasCritica?: boolean;
  critica?: string;
  criticaHeadline?: string;
  criticaTitle?: string;
  criticaQuote?: string;
  criticaConclusion?: string;
  criticaModules?: EditorialModuleItem[];
  hasPodcast?: boolean;
  hasNotasComunidad?: boolean;
  podcast?: {
    episode: string;
    title: string;
    duration: string;
    published: boolean;
    audioUrl?: string;
  };
  evento?: string;
  datos?: {
    superficie?: string;
    estructura?: string;
    fotografia?: string;
    colaboradores?: string;
    certificacion?: string;
    [key: string]: string | undefined;
  };
  ciudad?: {
    barrio?: string;
    altura?: string;
    orientacion?: string;
    clima?: string;
    [key: string]: string | undefined;
  };
  motion?: {
    variant: 'vertical-slices' | 'horizontal-blinds' | 'quadrant-aperture';
    kicker?: string;
    conceptTag?: string;
    preset?: string;
    hoverZoom?: number;
  };
  // Academia specific
  universidad?: string;
  institution?: string;
  problematica?: string;
  situacion?: string;
  // Territorios specific
  region?: string;
  // Dynamic modular layout
  modules?: EditorialModuleItem[];
  // SEO & Social
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  alt: string;
  caption?: string;
  credit?: string;
  focalPoint?: 'top' | 'center' | 'bottom';
  uploadedAt: string;
  size?: string;
  dimensions?: string;
  category?: string;
  imageType?: 'fotografia' | 'planimetria';
}
