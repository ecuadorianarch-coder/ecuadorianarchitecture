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
  ZoomIn,
  ZoomOut,
  RotateCcw,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Isolated image zoom & pan state (strictly prevents webpage viewport zoom)
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isGesturing, setIsGesturing] = useState(false);

  const isZoomed = zoomScale > 1.05;

  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomScale((prev) => Math.min(4, Math.round((prev + 0.5) * 10) / 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale((prev) => {
      const next = Math.max(1, Math.round((prev - 0.5) * 10) / 10);
      if (next <= 1.05) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

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

  // Reset zoom whenever image changes, filter changes, or lightbox toggles
  useEffect(() => {
    resetZoom();
  }, [currentIndex, activeFilter, isOpen, resetZoom]);

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture shortcuts when newsletter modal is open or when typing in form controls
      if (isNewsletterModalOpen) return;
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') return;

      if (e.key === 'Escape') {
        if (isZoomed) {
          resetZoom();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isZoomed) handlePrev();
      } else if (e.key === 'ArrowRight') {
        if (!isZoomed) handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetZoom();
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
  }, [isOpen, isNewsletterModalOpen, isZoomed, handlePrev, handleNext, handleZoomIn, handleZoomOut, resetZoom, onClose, activeFilter, filteredImages, currentIndex]);

  // Gesture state reference for non-passive mobile pinch-to-zoom & pan
  const gestureStateRef = useRef({
    scale: 1,
    pan: { x: 0, y: 0 },
    initialDist: 0,
    initialScale: 1,
    startPan: { x: 0, y: 0 },
    touchStartPos: { x: 0, y: 0 },
    isPinching: false,
    isPanning: false,
    lastTapTime: 0,
    lastTapPos: { x: 0, y: 0 },
  });

  useEffect(() => {
    gestureStateRef.current.scale = zoomScale;
    gestureStateRef.current.pan = panOffset;
  }, [zoomScale, panOffset]);

  // Native non-passive touch listeners on image stage (strictly suppresses whole-page viewport zoom)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !isOpen) return;

    const onTouchStart = (e: TouchEvent) => {
      const state = gestureStateRef.current;
      if (e.touches.length === 2) {
        state.isPinching = true;
        state.isPanning = false;
        const x1 = e.touches[0].clientX;
        const y1 = e.touches[0].clientY;
        const x2 = e.touches[1].clientX;
        const y2 = e.touches[1].clientY;
        state.initialDist = Math.hypot(x2 - x1, y2 - y1);
        state.initialScale = state.scale;
        setIsGesturing(true);
        if (e.cancelable) e.preventDefault();
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        state.touchStartPos = { x: touch.clientX, y: touch.clientY };
        state.startPan = { x: state.pan.x, y: state.pan.y };

        const now = Date.now();
        const distFromLast = Math.hypot(
          touch.clientX - state.lastTapPos.x,
          touch.clientY - state.lastTapPos.y
        );

        // Double tap detection (300ms window)
        if (now - state.lastTapTime < 320 && distFromLast < 35) {
          if (e.cancelable) e.preventDefault();
          if (state.scale > 1.05) {
            resetZoom();
          } else {
            const nextScale = 2.5;
            setZoomScale(nextScale);
            state.scale = nextScale;
            const rect = stage.getBoundingClientRect();
            const tapX = touch.clientX - rect.left - rect.width / 2;
            const tapY = touch.clientY - rect.top - rect.height / 2;
            const maxPanX = (rect.width * (nextScale - 1)) / 2;
            const maxPanY = (rect.height * (nextScale - 1)) / 2;
            const newPan = {
              x: Math.max(-maxPanX, Math.min(maxPanX, -tapX * 0.7)),
              y: Math.max(-maxPanY, Math.min(maxPanY, -tapY * 0.7)),
            };
            setPanOffset(newPan);
            state.pan = newPan;
          }
          state.lastTapTime = 0;
          return;
        }

        state.lastTapTime = now;
        state.lastTapPos = { x: touch.clientX, y: touch.clientY };

        if (state.scale > 1.05) {
          state.isPanning = true;
          setIsGesturing(true);
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const state = gestureStateRef.current;

      if (e.touches.length === 2 && state.isPinching) {
        // Crucial: prevent browser viewport pinch-to-zoom on the entire page
        if (e.cancelable) e.preventDefault();
        const x1 = e.touches[0].clientX;
        const y1 = e.touches[0].clientY;
        const x2 = e.touches[1].clientX;
        const y2 = e.touches[1].clientY;
        const dist = Math.hypot(x2 - x1, y2 - y1);
        if (state.initialDist > 0) {
          const factor = dist / state.initialDist;
          const nextScale = Math.min(4, Math.max(1, state.initialScale * factor));
          state.scale = nextScale;
          setZoomScale(nextScale);
          if (nextScale <= 1.05) {
            setPanOffset({ x: 0, y: 0 });
            state.pan = { x: 0, y: 0 };
          }
        }
      } else if (e.touches.length === 1 && state.isPanning && state.scale > 1.05) {
        // Pan the zoomed image inside the stage
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - state.touchStartPos.x;
        const dy = touch.clientY - state.touchStartPos.y;

        const maxPanX = (stage.clientWidth * (state.scale - 1)) / 1.8;
        const maxPanY = (stage.clientHeight * (state.scale - 1)) / 1.8;

        const nextX = Math.max(-maxPanX, Math.min(maxPanX, state.startPan.x + dx));
        const nextY = Math.max(-maxPanY, Math.min(maxPanY, state.startPan.y + dy));

        state.pan = { x: nextX, y: nextY };
        setPanOffset({ x: nextX, y: nextY });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const state = gestureStateRef.current;
      setIsGesturing(false);

      if (state.isPinching) {
        state.isPinching = false;
        if (state.scale < 1.08) {
          resetZoom();
        }
        return;
      }

      if (state.isPanning) {
        state.isPanning = false;
        return;
      }

      // Normal 1-finger swipe navigation when image is NOT zoomed
      if (state.scale <= 1.05 && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - state.touchStartPos.x;
        const dy = touch.clientY - state.touchStartPos.y;

        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
    };

    stage.addEventListener('touchstart', onTouchStart, { passive: false });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd, { passive: false });
    stage.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isOpen, resetZoom, handleNext, handlePrev]);

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
      <main className="flex-1 relative flex items-center justify-between px-3 sm:px-6 2xl:px-8 py-2 overflow-hidden gap-3 2xl:gap-6 min-h-0">
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
        <div
          ref={stageRef}
          style={{ touchAction: 'none' }}
          className="flex-1 relative flex items-center justify-center h-full max-h-full min-w-0 overflow-hidden select-none"
        >
          {/* Previous Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={handlePrev}
              className={`absolute left-2 sm:left-4 z-30 p-2.5 sm:p-3.5 bg-black/80 hover:bg-white hover:text-black border border-white/25 text-white rounded-full transition-all backdrop-blur-sm shadow-2xl hover:scale-105 cursor-pointer ${
                isZoomed ? 'opacity-30 hover:opacity-100' : ''
              }`}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Main Active Image Container with hardware-accelerated transform */}
          <div
            className="relative max-h-full max-w-full flex items-center justify-center will-change-transform"
            style={{
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomScale})`,
              transition: isGesturing ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: isZoomed ? (isGesturing ? 'grabbing' : 'grab') : 'default',
            }}
          >
            {filteredImages.length > 0 ? (
              <img
                key={currentImage.url}
                src={currentImage.url}
                alt={currentImage.caption || `Imagen ${currentIndex + 1}`}
                draggable={false}
                className="max-h-[50vh] xs:max-h-[56vh] sm:max-h-[62vh] xl:max-h-[68vh] max-w-full object-contain shadow-2xl border border-white/15 animate-in fade-in duration-200 pointer-events-none select-none"
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
              className={`absolute right-2 sm:right-4 z-30 p-2.5 sm:p-3.5 bg-black/80 hover:bg-white hover:text-black border border-white/25 text-white rounded-full transition-all backdrop-blur-sm shadow-2xl hover:scale-105 cursor-pointer ${
                isZoomed ? 'opacity-30 hover:opacity-100' : ''
              }`}
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Floating Zoom Controls & Indicator */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-30 flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/20 p-1 rounded-xs shadow-2xl">
            {isZoomed && (
              <button
                type="button"
                onClick={resetZoom}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase bg-amber-400 text-black font-bold rounded-[2px] hover:bg-amber-300 transition-colors cursor-pointer"
                title="Restablecer zoom (0)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{zoomScale.toFixed(1)}x</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 4}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-[2px] transition-colors cursor-pointer"
              title="Acercar (+)"
              aria-label="Acercar imagen"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-[2px] transition-colors cursor-pointer"
              title="Alejar (-)"
              aria-label="Alejar imagen"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Floating gesture hint when zoomed on mobile */}
          {isZoomed && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-black/85 backdrop-blur-md border border-amber-400/40 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono text-amber-300 shadow-2xl pointer-events-none tracking-wider animate-in fade-in duration-200">
              {zoomScale.toFixed(1)}x · Arrastra para explorar · Doble toque para reiniciar
            </div>
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
