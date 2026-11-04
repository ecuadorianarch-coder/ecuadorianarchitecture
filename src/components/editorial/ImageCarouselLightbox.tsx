import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Camera,
  Layers,
  Compass,
} from 'lucide-react';
import { useAdvertising } from '../../context/AdvertisingContext';
import { VerticalAdCarousel } from '../advertising/VerticalAdCarousel';
import { HorizontalCarouselAdBanner } from '../advertising/HorizontalCarouselAdBanner';
import defaultAds from '../../data/advertisements.json';
import defaultCampaigns from '../../data/adCampaigns.json';
import { AdvertisementCampaign, AdCampaign } from '../../types/advertising';

export type CarouselImageCategory = 'fotografia' | 'planimetria';
export type CarouselFilterCategory = 'todas' | 'fotografia' | 'planimetria';

export interface CarouselImageItem {
  url: string;
  caption?: string;
  credit?: string;
  title?: string;
  sourceModuleId?: string;
  category: CarouselImageCategory;
}

interface ImageCarouselLightboxProps {
  isOpen: boolean;
  images: CarouselImageItem[];
  initialIndex?: number;
  projectTitle?: string;
  onClose: () => void;
}

/**
 * Intelligent categorization logic:
 * 1. Explicit user selection ('fotografia' | 'planimetria') has highest precedence.
 * 2. Heuristic analysis of filename, title, and caption for architectural drafting keywords.
 */
export const detectImageCategory = (
  url?: string,
  title?: string,
  caption?: string,
  explicitCategory?: string
): CarouselImageCategory => {
  if (
    explicitCategory === 'planimetria' ||
    explicitCategory === 'planos' ||
    explicitCategory === 'diagrama'
  ) {
    return 'planimetria';
  }
  if (
    explicitCategory === 'fotografia' ||
    explicitCategory === 'foto' ||
    explicitCategory === 'render'
  ) {
    return 'fotografia';
  }

  const textToScan = `${url || ''} ${title || ''} ${caption || ''}`.toLowerCase();
  const planimetryKeywords = [
    'corte',
    'planta',
    'axo',
    'axonometria',
    'axonometría',
    'diagrama',
    'esquema',
    'plano',
    'planimetria',
    'planimetría',
    'seccion',
    'sección',
    'isometria',
    'isometría',
    'elevacion',
    'elevación',
    'fachada-plano',
    'drawing',
    'blueprint',
    'sketch',
    'croquis',
    'cad',
    'dwg',
    'vector',
    'detalles-constructivos',
    'detalle-constructivo',
  ];

  if (planimetryKeywords.some((kw) => textToScan.includes(kw))) {
    return 'planimetria';
  }

  return 'fotografia';
};

/**
 * Extracts and deduplicates all relevant images from an article / project object,
 * classifying each into 'fotografia' or 'planimetria'.
 */
export const extractAllProjectImages = (project: any): CarouselImageItem[] => {
  if (!project) return [];
  const list: CarouselImageItem[] = [];
  const seenUrls = new Set<string>();

  const getExplicitCategory = (url?: string, mod?: any): string | undefined => {
    if (!url) return undefined;
    if (project.imageCategories?.[url]) return project.imageCategories[url];
    const filename = url.split('/').pop();
    if (filename && project.imageCategories?.[filename]) return project.imageCategories[filename];
    if (mod?.imageCategories?.[url]) return mod.imageCategories[url];
    if (mod?.category) return mod.category;
    return undefined;
  };

  const addImage = (
    url?: string,
    caption?: string,
    credit?: string,
    title?: string,
    forcedCategory?: CarouselImageCategory
  ) => {
    if (!url || typeof url !== 'string' || url.trim().length === 0 || seenUrls.has(url)) return;
    seenUrls.add(url);

    const explicit = forcedCategory || getExplicitCategory(url);
    const category = detectImageCategory(url, title, caption, explicit);

    list.push({ url, caption, credit, title, category });
  };

  // 1. Hero image
  if (project.heroImage) {
    addImage(
      project.heroImage,
      project.heroImageCaption || 'Fotografía de portada y contexto territorial',
      project.heroImageCredit || project.datos?.fotografia || 'Registro EA',
      project.title,
      project.imageCategories?.[project.heroImage] || 'fotografia'
    );
  }

  // 2. Images from Reseña modules (project.modules)
  if (Array.isArray(project.modules)) {
    for (const mod of project.modules) {
      if (mod.type === 'single-image' || mod.type === 'fullscreen-image') {
        if (mod.imageUrl) {
          addImage(
            mod.imageUrl,
            mod.caption,
            mod.credits || project.datos?.fotografia,
            mod.title,
            mod.category || getExplicitCategory(mod.imageUrl, mod)
          );
        }
      } else if (mod.type === 'image-gallery' && Array.isArray(mod.imageUrls)) {
        mod.imageUrls.forEach((url: string, idx: number) => {
          addImage(
            url,
            mod.caption ? `${mod.caption} (${idx + 1})` : `Vista de galería ${idx + 1}`,
            mod.credits || project.datos?.fotografia,
            mod.title,
            mod.imageCategories?.[url] || mod.category || getExplicitCategory(url, mod)
          );
        });
      } else if (mod.type === 'image-comparison') {
        if (mod.beforeImageUrl) {
          addImage(mod.beforeImageUrl, 'Comparativa — Registro 1 (Antes / Dibujo)', mod.credits, mod.title, 'planimetria');
        }
        if (mod.afterImageUrl) {
          addImage(mod.afterImageUrl, 'Comparativa — Registro 2 (Después / Obra)', mod.credits, mod.title, 'fotografia');
        }
      } else if (mod.type === 'planimetry' && mod.imageUrl) {
        addImage(
          mod.imageUrl,
          mod.caption || `Planimetría ${mod.planType ? `(${mod.planType})` : ''}`,
          mod.credits || project.datos?.fotografia,
          mod.title || 'Planimetría Interactiva',
          'planimetria'
        );
      }
    }
  }

  // 3. Images from Crítica modules (project.criticaModules)
  if (Array.isArray(project.criticaModules)) {
    for (const mod of project.criticaModules) {
      if (mod.type === 'single-image' || mod.type === 'fullscreen-image') {
        if (mod.imageUrl) {
          addImage(
            mod.imageUrl,
            mod.caption,
            mod.credits || project.critic,
            mod.title || 'Crítica',
            mod.category || getExplicitCategory(mod.imageUrl, mod)
          );
        }
      } else if (mod.type === 'image-gallery' && Array.isArray(mod.imageUrls)) {
        mod.imageUrls.forEach((url: string, idx: number) => {
          addImage(
            url,
            mod.caption ? `${mod.caption} (${idx + 1})` : `Análisis Crítico — Figura ${idx + 1}`,
            mod.credits || project.critic,
            mod.title,
            mod.imageCategories?.[url] || mod.category || getExplicitCategory(url, mod)
          );
        });
      } else if (mod.type === 'planimetry' && mod.imageUrl) {
        addImage(
          mod.imageUrl,
          mod.caption || 'Plano de análisis crítico',
          mod.credits || project.critic,
          mod.title || 'Planimetría Crítica',
          'planimetria'
        );
      }
    }
  }

  // 3.5. Project plans as real uploaded images
  if (project.plans) {
    if (project.plans.planta) {
      addImage(project.plans.planta, 'Planta arquitectónica', project.datos?.fotografia, 'Planta general', 'planimetria');
    }
    if (project.plans.corte) {
      addImage(project.plans.corte, 'Corte arquitectónico', project.datos?.fotografia, 'Sección longitudinal', 'planimetria');
    }
    if (project.plans.axonometria) {
      addImage(project.plans.axonometria, 'Axonometría / Vista volumétrica', project.datos?.fotografia, 'Axonometría', 'planimetria');
    }
  }

  // 4. Project gallery fallback
  if (Array.isArray(project.gallery)) {
    project.gallery.forEach((url: string, idx: number) => {
      addImage(
        url,
        `Registro de Obra ${idx + 1}`,
        project.datos?.fotografia,
        project.title,
        getExplicitCategory(url)
      );
    });
  }

  // 5. Curated architectural photo series fallback so every project has a rich multi-slide carousel
  if (list.length <= 1) {
    const defaultGalleries: Record<string, CarouselImageItem[]> = {
      atrium: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
          title: 'Edificio Atrium — Fachada Principal',
          caption: 'Fachada frontal hacia la calle andina, evidenciando la modulación del hormigón crudo y el atrio central.',
          credit: project.datos?.fotografia || 'Bicubik Photography',
          category: 'fotografia',
        },
        {
          url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
          title: 'Atrio Bioclimático Central',
          caption: 'El gran vacío central funciona como regulador térmico y articulador de los accesos comunitarios.',
          credit: project.datos?.fotografia || 'Bicubik Photography',
          category: 'fotografia',
        },
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
          title: 'Espacios Interiores & Radiación Solar',
          caption: 'Detalle de penetración de luz equinoccial y ventilación cruzada en las unidades habitacionales.',
          credit: project.datos?.fotografia || 'Bicubik Photography',
          category: 'fotografia',
        },
        {
          url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
          title: 'Tectónica y Envolvente de Hormigón',
          caption: 'Encofrados con maderas locales que transfieren textura táctil a los paramentos estructurales.',
          credit: project.datos?.fotografia || 'Bicubik Photography',
          category: 'fotografia',
        },
        {
          url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
          title: 'Terraza Ajardinada y Remate Superior',
          caption: 'Cubierta vegetal diseñada para retención de aguas pluviales y contemplación del paisaje cordillerano.',
          credit: project.datos?.fotografia || 'Bicubik Photography',
          category: 'fotografia',
        },
      ],
      'casa-arboles': [
        {
          url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80',
          title: 'Casa entre Árboles — Inserción en el Bosque',
          caption: 'La estructura respeta la posición de los árboles nativos preexistentes, suspendida sobre el terreno.',
          credit: project.datos?.fotografia || 'Bicubik Photography',
          category: 'fotografia',
        },
        {
          url: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=80',
          title: 'Estructura Portante de Madera',
          caption: 'Ensambles de madera laminada local que flotan sin alterar las raíces del ecosistema de Ilaló.',
          credit: project.datos?.fotografia || 'Bicubik Photography',
          category: 'fotografia',
        },
        {
          url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1600&q=80',
          title: 'Transición Interior-Exterior',
          caption: 'Galería perimetral abierta hacia la quebrada con carpinterías móviles.',
          credit: project.datos?.fotografia || 'Bicubik Photography',
          category: 'fotografia',
        },
      ],
    };

    const curated = defaultGalleries[project.id];
    if (curated) {
      curated.forEach((c) => addImage(c.url, c.caption, c.credit, c.title, c.category));
    } else {
      [
        {
          url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
          caption: 'Encuadre exterior y relación con la topografía andina',
        },
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
          caption: 'Vacío central articulador y paso de la luz natural',
        },
        {
          url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
          caption: 'Detalle de materialidad, textura y acabado constructivo',
        },
        {
          url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
          caption: 'Integración paisajística con el entorno territorial',
        },
      ].forEach((item, idx) => {
        addImage(
          item.url,
          item.caption,
          project.datos?.fotografia || 'Bicubik Photography',
          `${project.title} — Vista ${idx + 2}`,
          'fotografia'
        );
      });
    }
  }

  return list;
};

export const ImageCarouselLightbox: React.FC<ImageCarouselLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  projectTitle = 'EXPEDIENTE VISUAL',
  onClose,
}) => {
  const [activeFilter, setActiveFilter] = useState<CarouselFilterCategory>('todas');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAdDismissed, setIsAdDismissed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { getEligibleCampaigns, getBrandById, isNewsletterModalOpen } = useAdvertising();

  // Category counts
  const counts = useMemo(() => {
    let photos = 0;
    let plans = 0;
    images.forEach((img) => {
      if (img.category === 'planimetria') {
        plans++;
      } else {
        photos++;
      }
    });
    return {
      todas: images.length,
      fotografia: photos,
      planimetria: plans,
    };
  }, [images]);

  // Filtered list of images based on active category
  const filteredImages = useMemo(() => {
    if (activeFilter === 'todas') return images;
    return images.filter((img) => (img.category || 'fotografia') === activeFilter);
  }, [images, activeFilter]);

  // Lateral advertising campaigns for carousel (Skyscrapers)
  const modernLateralCampaigns = useMemo(() => {
    return getEligibleCampaigns('skyscrapers-laterales');
  }, [getEligibleCampaigns]);

  // Horizontal advertising campaigns for carousel
  const modernHorizontalCampaigns = useMemo(() => {
    const interGaleria = getEligibleCampaigns('inter-galeria');
    if (interGaleria.length > 0) return interGaleria;
    const dossier = getEligibleCampaigns('dossier-editorial');
    if (dossier.length > 0) return dossier;
    const inFeed = getEligibleCampaigns('entre-proyectos');
    if (inFeed.length > 0) return inFeed;
    return defaultCampaigns as unknown as AdCampaign[];
  }, [getEligibleCampaigns]);

  // Stable horizontal advertising campaign for the current lightbox viewing session
  const currentHorizontalCampaign = useMemo(() => {
    if (modernHorizontalCampaigns.length === 0) return null;
    return modernHorizontalCampaigns[0];
  }, [modernHorizontalCampaigns]);

  const horizontalBrand = currentHorizontalCampaign
    ? getBrandById(currentHorizontalCampaign.brandId)
    : undefined;

  const fallbackCampaigns = defaultAds as AdvertisementCampaign[];

  // Left lateral campaign resolution
  const leftModernCampaign = modernLateralCampaigns[0] || null;
  const leftBrand = leftModernCampaign ? getBrandById(leftModernCampaign.brandId) : undefined;
  const leftLegacyCampaign = !leftModernCampaign
    ? fallbackCampaigns.find((ad) => ad.positionTarget === 'ambos-lados' || ad.positionTarget === 'izquierdo') || fallbackCampaigns[0]
    : null;

  // Right lateral campaign resolution
  const rightModernCampaign =
    modernLateralCampaigns.length > 1
      ? modernLateralCampaigns[1]
      : modernLateralCampaigns[0] || null;
  const rightBrand = rightModernCampaign ? getBrandById(rightModernCampaign.brandId) : undefined;
  const rightLegacyCampaign = !rightModernCampaign
    ? fallbackCampaigns.find((ad) => ad.positionTarget === 'ambos-lados' || ad.positionTarget === 'derecho') || fallbackCampaigns[1] || fallbackCampaigns[0]
    : null;

  const hasLeftAd = Boolean(leftModernCampaign || leftLegacyCampaign);
  const hasRightAd = Boolean(rightModernCampaign || rightLegacyCampaign);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveFilter('todas');
      const validIndex = Math.max(0, Math.min(initialIndex, images.length - 1));
      setCurrentIndex(validIndex);
      setIsAdDismissed(false);
    }
  }, [isOpen, initialIndex, images]);

  // Filter switch handler that maintains current image or smoothly jumps to index 0
  const handleFilterChange = (newFilter: CarouselFilterCategory) => {
    if (newFilter === activeFilter) return;
    const currentImg = filteredImages[currentIndex];
    setActiveFilter(newFilter);

    const nextList =
      newFilter === 'todas'
        ? images
        : images.filter((img) => (img.category || 'fotografia') === newFilter);

    if (currentImg) {
      const foundIdx = nextList.findIndex((img) => img.url === currentImg.url);
      setCurrentIndex(foundIdx >= 0 ? foundIdx : 0);
    } else {
      setCurrentIndex(0);
    }
  };

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
  }, [filteredImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture shortcuts when newsletter modal is open or when typing in form controls
      if (isNewsletterModalOpen) return;
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '1') {
        handleFilterChange('todas');
      } else if (e.key === '2') {
        handleFilterChange('fotografia');
      } else if (e.key === '3') {
        handleFilterChange('planimetria');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isNewsletterModalOpen, handlePrev, handleNext, onClose, activeFilter, filteredImages, currentIndex]);

  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = filteredImages[currentIndex] || filteredImages[0] || images[0];

  const renderCategoryFilterButtons = (isCompact = false) => (
    <div
      className={`flex items-center bg-black/60 border border-white/20 p-0.5 rounded-xs shrink-0 shadow-inner ${
        isCompact ? 'w-full max-w-md justify-between' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => handleFilterChange('todas')}
        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-anton uppercase tracking-wider transition-all cursor-pointer ${
          isCompact ? 'flex-1 text-center' : ''
        } ${
          activeFilter === 'todas'
            ? 'bg-white text-black shadow-sm font-bold'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        title="Ver todas las imágenes y planimetrías juntas (Presiona 1)"
      >
        <Layers className="w-3.5 h-3.5 shrink-0" />
        <span>TODAS</span>
        <span className={`font-mono text-[10px] ml-0.5 ${activeFilter === 'todas' ? 'text-black/70' : 'text-white/40'}`}>
          ({counts.todas})
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleFilterChange('fotografia')}
        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-anton uppercase tracking-wider transition-all cursor-pointer ${
          isCompact ? 'flex-1 text-center' : ''
        } ${
          activeFilter === 'fotografia'
            ? 'bg-white text-black shadow-sm font-bold'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        title="Filtrar únicamente fotografías y renders de obra (Presiona 2)"
      >
        <Camera className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">FOTOGRAFÍAS</span>
        <span className="sm:hidden">FOTOS</span>
        <span className={`font-mono text-[10px] ml-0.5 ${activeFilter === 'fotografia' ? 'text-black/70' : 'text-white/40'}`}>
          ({counts.fotografia})
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleFilterChange('planimetria')}
        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-anton uppercase tracking-wider transition-all cursor-pointer ${
          isCompact ? 'flex-1 text-center' : ''
        } ${
          activeFilter === 'planimetria'
            ? 'bg-amber-400 text-black shadow-sm font-bold border-amber-300'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        title="Filtrar solo planos, cortes, plantas, axonometrías y diagramas (Presiona 3)"
      >
        <Compass className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden md:inline">PLANIMETRÍAS Y DIAGRAMAS</span>
        <span className="md:hidden">PLANOS</span>
        <span className={`font-mono text-[10px] ml-0.5 ${activeFilter === 'planimetria' ? 'text-black/70' : 'text-white/40'}`}>
          ({counts.planimetria})
        </span>
      </button>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md text-white flex flex-col justify-between font-inter select-none overflow-hidden"
    >
      {/* ==================================================================== */}
      {/* TOP BAR: BRANDING, TITLE, CATEGORY FILTERS, COUNTER, CONTROLS       */}
      {/* ==================================================================== */}
      <header className="border-b border-white/10 bg-black/85 backdrop-blur-md z-30 shrink-0">
        {/* Main top row: Always visible, guaranteed close button without overflow */}
        <div className="h-14 sm:h-16 px-3 sm:px-6 md:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Branding & Project Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <span className="font-anton text-xs sm:text-sm uppercase tracking-widest text-white/60 hidden xl:inline">
              EA // CARRUSEL FOTOGRÁFICO
            </span>
            <span className="text-white/30 hidden xl:inline">•</span>
            <span className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white truncate max-w-[150px] xs:max-w-[190px] sm:max-w-[220px] md:max-w-xs lg:max-w-md">
              {projectTitle}
            </span>
          </div>

          {/* Center (Desktop / Tablet): CATEGORY FILTER SWITCHER */}
          <div className="hidden md:flex items-center">
            {renderCategoryFilterButtons(false)}
          </div>

          {/* Right: Counter & Actions (Guaranteed to always fit and never get pushed out) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Counter */}
            <div className="flex items-center bg-white/10 px-2 sm:px-3 py-1 border border-white/15 rounded-xs">
              <span className="font-mono text-[11px] sm:text-xs text-white tracking-widest">
                {String(Math.min(currentIndex + 1, Math.max(1, filteredImages.length))).padStart(2, '0')} / {String(filteredImages.length).padStart(2, '0')}
              </span>
            </div>

            {/* Fullscreen toggle (Desktop only) */}
            <button
              onClick={toggleFullscreen}
              className="p-2 border border-white/15 hover:border-white hover:bg-white/10 transition-colors text-white/70 hover:text-white hidden md:inline-flex cursor-pointer rounded-xs"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button: Prominent, high contrast, guaranteed visibility on all screen sizes */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 active:scale-95 text-xs font-anton uppercase tracking-wider transition-all shadow-md cursor-pointer rounded-xs z-40 shrink-0"
              title="Cerrar galería (Esc)"
              aria-label="Cerrar galería fotográfica"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
              <span className="font-bold">Cerrar</span>
            </button>
          </div>
        </div>

        {/* Mobile / Adaptive sub-row: Clean segmented control for filter tabs */}
        <div className="md:hidden border-t border-white/10 bg-black/60 px-3 py-1.5 flex items-center justify-center">
          {renderCategoryFilterButtons(true)}
        </div>
      </header>

      {/* ==================================================================== */}
      {/* CENTER: LARGE ACTIVE IMAGE, NAVIGATION ARROWS & LATERAL AD BANNERS   */}
      {/* ==================================================================== */}
      <main
        className="flex-1 relative flex items-center justify-between px-3 sm:px-6 2xl:px-8 py-2 overflow-hidden gap-3 2xl:gap-6 min-h-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Lateral Skyscraper Ad Banner */}
        {hasLeftAd && (
          <aside
            aria-label="Publicidad lateral izquierda"
            className="hidden xl:flex flex-col items-center justify-center shrink-0 w-[140px] xl:w-[155px] 2xl:w-[175px] h-[72vh] max-h-[75vh] z-10 select-none animate-in fade-in slide-in-from-left-4 duration-300 min-h-0"
          >
            <div className="w-full flex items-center justify-between pb-1 px-0.5 text-[9px] font-mono tracking-widest text-white/40 uppercase">
              <span>PUBLICIDAD</span>
              <span className="text-[8px] bg-white/10 px-1 py-0.2 rounded-[1px] text-white/60">AD</span>
            </div>
            <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden">
              <VerticalAdCarousel
                position="izquierdo"
                theme="dark"
                modernCampaign={leftModernCampaign || undefined}
                campaign={leftLegacyCampaign || undefined}
                brand={leftBrand}
              />
            </div>
          </aside>
        )}

        {/* Center Stage: Image and Navigation Controls */}
        <div className="flex-1 relative flex items-center justify-center h-full max-h-full min-w-0">
          {/* Previous Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 z-30 p-2.5 sm:p-3.5 bg-black/80 hover:bg-white hover:text-black border border-white/25 text-white rounded-full transition-all backdrop-blur-sm shadow-2xl hover:scale-105 cursor-pointer"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Main Active Image Container */}
          <div className="relative max-h-full max-w-full flex items-center justify-center">
            {filteredImages.length > 0 ? (
              <img
                key={currentImage.url}
                src={currentImage.url}
                alt={currentImage.caption || `Imagen ${currentIndex + 1}`}
                className="max-h-[50vh] xs:max-h-[56vh] sm:max-h-[62vh] xl:max-h-[68vh] max-w-full object-contain shadow-2xl border border-white/15 animate-in fade-in duration-200"
              />
            ) : (
              <div className="py-20 text-center font-mono text-sm text-white/50">
                No hay elementos registrados en esta categoría.
              </div>
            )}
          </div>

          {/* Next Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 z-30 p-2.5 sm:p-3.5 bg-black/80 hover:bg-white hover:text-black border border-white/25 text-white rounded-full transition-all backdrop-blur-sm shadow-2xl hover:scale-105 cursor-pointer"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Right Lateral Skyscraper Ad Banner */}
        {hasRightAd && (
          <aside
            aria-label="Publicidad lateral derecha"
            className="hidden xl:flex flex-col items-center justify-center shrink-0 w-[140px] xl:w-[155px] 2xl:w-[175px] h-[72vh] max-h-[75vh] z-10 select-none animate-in fade-in slide-in-from-right-4 duration-300 min-h-0"
          >
            <div className="w-full flex items-center justify-between pb-1 px-0.5 text-[9px] font-mono tracking-widest text-white/40 uppercase">
              <span>PUBLICIDAD</span>
              <span className="text-[8px] bg-white/10 px-1 py-0.2 rounded-[1px] text-white/60">AD</span>
            </div>
            <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden">
              <VerticalAdCarousel
                position="derecho"
                theme="dark"
                modernCampaign={rightModernCampaign || undefined}
                campaign={rightLegacyCampaign || undefined}
                brand={rightBrand}
              />
            </div>
          </aside>
        )}
      </main>

      {/* ==================================================================== */}
      {/* HORIZONTAL AD BANNER (SPONSOR PARTNERSHIP)                           */}
      {/* Elegantly placed between main photo stage and thumbnails bar        */}
      {/* ==================================================================== */}
      {currentHorizontalCampaign && !isAdDismissed && (
        <HorizontalCarouselAdBanner
          campaign={currentHorizontalCampaign}
          brand={horizontalBrand}
          onDismiss={() => setIsAdDismissed(true)}
        />
      )}

      {/* ==================================================================== */}
      {/* BOTTOM BAR: CAPTION, CREDITS & THUMBNAILS CAROUSEL STRIP           */}
      {/* ==================================================================== */}
      <footer className="border-t border-white/10 bg-black/80 p-3 sm:p-4 space-y-3 z-20 shrink-0">
        {/* Caption, Category Tag & Photography Credit */}
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Badge Pill */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-wider border rounded-[1px] ${
                  currentImage?.category === 'planimetria'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {currentImage?.category === 'planimetria' ? (
                  <>
                    <Compass className="w-2.5 h-2.5" />
                    <span>Planimetría / Diagrama</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-2.5 h-2.5" />
                    <span>Fotografía de Obra</span>
                  </>
                )}
              </span>

              {currentImage?.title && (
                <span className="font-anton text-[11px] uppercase tracking-wider text-white/60 block truncate">
                  {currentImage.title}
                </span>
              )}

              {/* Discreet sponsor restore link if dismissed */}
              {isAdDismissed && currentHorizontalCampaign && (
                <button
                  type="button"
                  onClick={() => setIsAdDismissed(false)}
                  className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400/80 hover:text-amber-300 uppercase tracking-wider underline cursor-pointer ml-1"
                  title="Mostrar publicidad"
                >
                  <span>Publicidad ({horizontalBrand?.name || 'Sponsor'})</span>
                </button>
              )}
            </div>

            <p className="font-creato text-white/90 text-xs sm:text-sm line-clamp-2">
              {currentImage?.caption || `Registro de obra ${currentIndex + 1}`}
            </p>
          </div>

          {currentImage?.credit && (
            <div className="shrink-0 font-mono text-[10px] sm:text-[11px] text-white/60 uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto border-t sm:border-t-0 sm:border-l border-white/10 pt-1 sm:pt-0 sm:pl-3">
              <Camera className="w-3.5 h-3.5 text-white/40" />
              <span>FOTOGRAFÍA: {currentImage.credit}</span>
            </div>
          )}
        </div>

        {/* Thumbnails Strip */}
        {filteredImages.length > 1 && (
          <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            {filteredImages.map((img, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`group relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 border-2 overflow-hidden transition-all cursor-pointer ${
                    isActive
                      ? 'border-white ring-2 ring-white/50 scale-105 opacity-100'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                  }`}
                  title={img.caption || `Ir a elemento ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Category mini indicator when viewing 'todas' */}
                  {activeFilter === 'todas' && (
                    <span
                      className={`absolute bottom-0.5 right-0.5 p-0.5 rounded-[1px] ${
                        img.category === 'planimetria'
                          ? 'bg-amber-400 text-black'
                          : 'bg-black/70 text-white'
                      }`}
                    >
                      {img.category === 'planimetria' ? (
                        <Compass className="w-2.5 h-2.5" />
                      ) : (
                        <Camera className="w-2.5 h-2.5" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </footer>
    </div>
  );
};
