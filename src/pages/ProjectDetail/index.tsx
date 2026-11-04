import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useContent } from '../../context/ContentContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Share2, Compass, CheckCircle2, MoveDown, Calendar, MapPin, Users, Sliders, ChevronRight, ChevronLeft } from 'lucide-react';
import { ImageCarouselLightbox, extractAllProjectImages } from '../../components/editorial/ImageCarouselLightbox';

// Figma official SVG logos & doodles
import logoUrl from '../../assets/logos/logo.svg';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagAcademicoUrl from '../../assets/logos/tag_academico.svg';
import tagAcercaBoxUrl from '../../assets/logos/tag_acerca_box.svg';
import compLugarUrl from '../../assets/logos/comp_lugar.svg';
import compAutorUrl from '../../assets/logos/comp_autor.svg';
import compCriticaUrl from '../../assets/logos/comp_critica.svg';
import compFotografiaUrl from '../../assets/logos/comp_fotografia.svg';
import compMaestroUrl from '../../assets/logos/comp_maestro.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import criticaSalvaraMundoSvg from '../../assets/logos/critica_salvara_mundo.svg';

import academiaJson from '../../data/academia.json';
import territoriosJson from '../../data/territorios.json';
import { AuthenticFolderContainer } from './AuthenticFolderContainer';
import { getAvailableModules } from './projectModules';
import { extractStudiosList } from '../../components/editorial/DynamicModulesRenderer';
import { StickySponsorWings } from '../../components/advertising/StickySponsorWings';
import { InFeedProjectAdCard } from '../../components/advertising/InFeedProjectAdCard';
import { PanoramicFolderCard } from '../../components/projects/PanoramicFolderCard';
import { useAdvertising } from '../../context/AdvertisingContext';
import { AuthorProfileModal } from '../../components/author/AuthorProfileModal';
import { PhotographerProfileModal } from '../../components/photographer/PhotographerProfileModal';
import { ConstructionTeamModal } from '../../components/construction/ConstructionTeamModal';
import { getConstructionTeamForProject } from '../../data/constructionTeams';
import { hasAuthorProfile } from '../../data/authors';
import { applyArchitectureSeoToDocument } from '../../services/architectureSeo';
import { ShareProjectModal } from '../../components/common/ShareProjectModal';

// Tape strip component for the taped tabs from Figma media_1791919174953_b2b8f1f9.png
const TapeStrip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute w-8 sm:w-10 h-3 sm:h-3.5 bg-[#E8E6E1]/90 border border-ea-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.18)] pointer-events-none z-20 ${className}`}
    style={{
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px)',
    }}
  />
);

export type MotionVariant = 'vertical-slices' | 'horizontal-blinds' | 'quadrant-aperture';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onSelectProject?: (id: string) => void;
  onNavigate?: (section: string) => void;
  customProjectData?: any;
  controlledActiveTab?: string;
  onTabChange?: (tab: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectId,
  onBack,
  onSelectProject,
  onNavigate,
  customProjectData,
  controlledActiveTab,
  onTabChange,
}) => {
  const { projects, academia, territorios } = useContent();

  // Find project or fallback from all active content collections
  const allProjects = useMemo(
    () => [
      ...projects,
      ...(academia || academiaJson).map((a: any) => ({
        ...a,
        type: 'academia',
        hasVisitas: false,
        studio: a.institution || a.studio || a.universidad,
        critic: a.universidad || a.critic,
        category: 'INVESTIGACIÓN ACADÉMICA',
        plans: a.plans || { planta: a.heroImage, corte: a.heroImage, axonometria: a.heroImage },
        critique: a.critique || {
          text: a.excerpt,
          thesis: a.excerpt,
          spatialAnalysis: a.excerpt,
          materiality: a.excerpt,
        },
      })),
      ...(territorios || territoriosJson).map((t: any) => ({
        ...t,
        type: 'territorios',
        hasVisitas: false,
        critic: t.region || t.critic,
        category: 'EXPEDIENTE TERRITORIAL',
        plans: t.plans || { planta: t.heroImage, corte: t.heroImage, axonometria: t.heroImage },
        critique: t.critique || {
          text: t.excerpt,
          thesis: t.excerpt,
          spatialAnalysis: t.excerpt,
          materiality: t.excerpt,
        },
      })),
    ],
    [projects, academia, territorios]
  );

  const project = useMemo(
    () =>
      customProjectData ||
      allProjects.find((p: any) => p.id === projectId || p.slug === projectId) ||
      projects[0],
    [customProjectData, allProjects, projectId, projects]
  );

  const availableModules = useMemo(() => getAvailableModules(project), [project]);
  const studiosList = useMemo(() => extractStudiosList(project), [project]);

  const hasCriticaActive = useMemo(() => {
    if (!project) return false;
    if (project.hasCritica === false) return false;
    return (
      project.hasCritica === true ||
      availableModules.some((m) => m.id === 'critica')
    );
  }, [project, availableModules]);

  const displayLocation = useMemo(() => {
    const loc = (project.datos?.ubicacion || project.location || '').trim();
    const barrio = (project.ciudad?.barrio || '').trim();
    if (!loc && !barrio) return '';
    if (!barrio) return loc;
    if (!loc) return barrio;
    if (loc.toLowerCase().includes(barrio.toLowerCase())) return loc;
    if (barrio.toLowerCase().includes(loc.toLowerCase())) return barrio;
    return `${barrio}, ${loc}`;
  }, [project.datos?.ubicacion, project.location, project.ciudad?.barrio]);

  const projectSection: 'proyectos' | 'academia' | 'territorios' = useMemo(() => {
    if (
      project?.type === 'academia' ||
      project?.category === 'INVESTIGACIÓN ACADÉMICA' ||
      (academia || []).some((a: any) => a.id === project?.id || a.slug === project?.slug)
    ) {
      return 'academia';
    }
    if (
      project?.type === 'territorios' ||
      project?.category === 'EXPEDIENTE TERRITORIAL' ||
      (territorios || []).some((t: any) => t.id === project?.id || t.slug === project?.slug)
    ) {
      return 'territorios';
    }
    return 'proyectos';
  }, [project, academia, territorios]);

  const sectionTagIcon = projectSection === 'academia' ? tagAcademicoUrl : projectSection === 'territorios' ? tagCiudadUrl : tagProyectosUrl;

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (controlledActiveTab) return controlledActiveTab;
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const t = p.get('tab');
      if (t && ['resena', 'critica', 'podcast', 'obra-viva'].includes(t)) return t;
    }
    return availableModules[0]?.id || 'resena';
  });

  useEffect(() => {
    if (controlledActiveTab && controlledActiveTab !== activeTab) {
      setActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);
  const [activePlanType, setActivePlanType] = useState<'planta' | 'corte' | 'axonometria'>('planta');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [selectedAuthorName, setSelectedAuthorName] = useState<string>(() => project.studio || '');

  const canOpenAuthorModal = (studioName?: string) => {
    if (!studioName || !studioName.trim()) return false;
    // Only open popup if explicitly enabled on this project in CMS AND a genuine registered profile exists
    if (!project?.enableAuthorModal) return false;
    return hasAuthorProfile(studioName);
  };

  const handleOpenAuthor = (studio?: string) => {
    const finalStudio = studio || project.studio || '';
    if (!canOpenAuthorModal(finalStudio)) return;
    setSelectedAuthorName(finalStudio);
    setIsAuthorModalOpen(true);
  };

  const [isPhotographerModalOpen, setIsPhotographerModalOpen] = useState(false);
  const [selectedPhotographerName, setSelectedPhotographerName] = useState<string>(
    () => project.datos?.fotografia || project.photographer || ''
  );

  const handleOpenPhotographer = (photoName?: string) => {
    const finalPhoto = photoName || project.datos?.fotografia || project.photographer || '';
    if (!finalPhoto || !finalPhoto.trim()) return;
    setSelectedPhotographerName(finalPhoto);
    setIsPhotographerModalOpen(true);
  };

  // Construction Team & Master Builders Recognition State
  const [isConstructionTeamModalOpen, setIsConstructionTeamModalOpen] = useState(false);
  const constructionTeam = useMemo(() => getConstructionTeamForProject(project), [project]);

  // Fullscreen Architectural Image Carousel Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  const openLightboxAt = (index: number = 0) => {
    setLightboxInitialIndex(index);
    setIsLightboxOpen(true);
  };

  // Dynamic Architecture SEO Injection (ArchDaily & Arquitectura Viva standards)
  useEffect(() => {
    if (project) {
      const cleanup = applyArchitectureSeoToDocument(project);
      return cleanup;
    }
  }, [project]);

  // Related items collection for the "CONTINUAR EXPLORANDO" carousel (Strictly independent per section)
  const relatedProjects = useMemo(() => {
    const seen = new Set<string>([project.id]);
    const list: any[] = [];

    // Independent collections: Territorios only shows Territorios, Academia only Academia, Proyectos only Proyectos
    for (const p of allProjects) {
      const pType = (p as any).type || (p.category === 'EXPEDIENTE TERRITORIAL' ? 'territorios' : p.category === 'INVESTIGACIÓN ACADÉMICA' ? 'academia' : 'proyectos');
      if (!seen.has(p.id) && pType === projectSection && p.status !== 'draft') {
        seen.add(p.id);
        list.push(p);
      }
    }

    return list;
  }, [allProjects, project.id, projectSection]);

  // Carousel ref and scroll handlers for related projects
  const relatedCarouselRef = useRef<HTMLDivElement>(null);

  const scrollRelatedPrev = () => {
    if (!relatedCarouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = relatedCarouselRef.current;
    if (scrollLeft <= 10) {
      relatedCarouselRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
    } else {
      const step = clientWidth >= 1024 ? clientWidth / 2 : clientWidth;
      relatedCarouselRef.current.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  const scrollRelatedNext = () => {
    if (!relatedCarouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = relatedCarouselRef.current;
    if (scrollLeft >= scrollWidth - clientWidth - 10) {
      relatedCarouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const step = clientWidth >= 1024 ? clientWidth / 2 : clientWidth;
      relatedCarouselRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const allProjectImages = useMemo(() => extractAllProjectImages(project), [project]);

  // Metadata Pill Capsule Scroll Controls & Physics
  const pillScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPillLeft, setCanScrollPillLeft] = useState(false);
  const [canScrollPillRight, setCanScrollPillRight] = useState(false);

  const checkPillScroll = useCallback(() => {
    const el = pillScrollRef.current;
    if (!el) return;
    setCanScrollPillLeft(el.scrollLeft > 6);
    setCanScrollPillRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  const handlePillScrollStep = (dir: 'left' | 'right') => {
    const el = pillScrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(180, el.clientWidth * 0.55);
    el.scrollBy({
      left: dir === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const el = pillScrollRef.current;
    if (!el) return;

    checkPillScroll();
    window.addEventListener('resize', checkPillScroll);

    // 1. Mouse wheel horizontal translator: lets vertical mouse wheel scroll the pill horizontally
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 0.85;
          checkPillScroll();
        }
      }
    };

    // 2. Drag-to-scroll with mouse
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      moved = false;
      startX = e.pageX - el.offsetLeft;
      startScroll = el.scrollLeft;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.25;
      if (Math.abs(walk) > 4) {
        moved = true;
        el.scrollLeft = startScroll - walk;
        checkPillScroll();
      }
    };

    const onMouseUp = () => {
      isDown = false;
    };

    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      window.removeEventListener('resize', checkPillScroll);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [checkPillScroll, project?.id]);

  // Helper to determine the natural motion preset of each project
  const getProjectDefaultVariant = (proj: any): MotionVariant => {
    if (proj?.motion?.variant) return proj.motion.variant as MotionVariant;
    // Fallback mappings for architectural typology
    if (
      proj?.id === 'casa-arboles' ||
      proj?.id === 'casa-loma' ||
      proj?.id === 'borde-urbano' ||
      proj?.id === 'habitabilidad-rural' ||
      proj?.id === 'infraestructura-humedales' ||
      proj?.id === 'ciudad-rio' ||
      proj?.id === 'cartografia-viva' ||
      proj?.id === 'fronteras-ilalo'
    ) {
      return 'horizontal-blinds';
    }
    if (
      proj?.id === 'plaza-teatro' ||
      proj?.id === 'museo-precolombino' ||
      proj?.id === 'arquitectura-vernacula' ||
      proj?.id === 'cuencas-sur' ||
      proj?.id === 'metabolismo-insular'
    ) {
      return 'quadrant-aperture';
    }
    return 'vertical-slices';
  };

  // State for current motion variant (can be auto-assigned or manually previewed)
  const [motionVariant, setMotionVariant] = useState<MotionVariant>(() => getProjectDefaultVariant(project));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMotionVariant(getProjectDefaultVariant(project));
    const currentAvailable = getAvailableModules(project);
    if (!currentAvailable.some((m) => m.id === activeTab)) {
      setActiveTab(currentAvailable[0]?.id || 'resena');
    }
  }, [projectId]);

  useEffect(() => {
    if (controlledActiveTab) {
      const currentAvailable = getAvailableModules(project);
      if (currentAvailable.some((m) => m.id === controlledActiveTab)) {
        setActiveTab(controlledActiveTab);
      }
    }
  }, [controlledActiveTab, project?.id]);

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // Advertising: in-dossier editorial placement
  const { getEligibleCampaigns, getBrandById } = useAdvertising();
  const eligibleDossierAds = getEligibleCampaigns('dossier-editorial');
  const dossierAd = eligibleDossierAds[0];

  // Main container ref
  const pageRef = useRef<HTMLDivElement>(null);

  // Cinematic scroll animation refs
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headerBarRef = useRef<HTMLDivElement>(null);
  const initialEditorialRef = useRef<HTMLDivElement>(null);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const singleHeroImgRef = useRef<HTMLImageElement>(null);
  const scrollPromptRef = useRef<HTMLDivElement>(null);
  const watermarkStampRef = useRef<HTMLDivElement>(null);
  const settleIndicatorRef = useRef<HTMLDivElement>(null);
  const dossierContainerRef = useRef<HTMLDivElement>(null);

  // Variant 1: Vertical Slices refs
  const vSlicesLayerRef = useRef<HTMLDivElement>(null);
  const vSlice1Ref = useRef<HTMLDivElement>(null);
  const vSlice2Ref = useRef<HTMLDivElement>(null);
  const vSlice3Ref = useRef<HTMLDivElement>(null);
  const vSlice4Ref = useRef<HTMLDivElement>(null);
  const vSlice5Ref = useRef<HTMLDivElement>(null);
  const vKineticLayerRef = useRef<HTMLDivElement>(null);
  const vKineticLine1Ref = useRef<HTMLDivElement>(null);
  const vKineticLine2Ref = useRef<HTMLDivElement>(null);
  const vKineticLine3Ref = useRef<HTMLDivElement>(null);
  const vConceptualCardRef = useRef<HTMLDivElement>(null);

  // Variant 2: Horizontal Blinds refs
  const hBlindsLayerRef = useRef<HTMLDivElement>(null);
  const hBlind1Ref = useRef<HTMLDivElement>(null);
  const hBlind2Ref = useRef<HTMLDivElement>(null);
  const hBlind3Ref = useRef<HTMLDivElement>(null);
  const hBlind4Ref = useRef<HTMLDivElement>(null);
  const hKineticLayerRef = useRef<HTMLDivElement>(null);
  const hKineticCol1Ref = useRef<HTMLDivElement>(null);
  const hKineticCol2Ref = useRef<HTMLDivElement>(null);
  const hKineticRibbonRef = useRef<HTMLDivElement>(null);
  const hQuoteBoxRef = useRef<HTMLDivElement>(null);

  // Variant 3: Quadrant Aperture refs
  const qApertureLayerRef = useRef<HTMLDivElement>(null);
  const qTopLeftRef = useRef<HTMLDivElement>(null);
  const qTopRightRef = useRef<HTMLDivElement>(null);
  const qBottomLeftRef = useRef<HTMLDivElement>(null);
  const qBottomRightRef = useRef<HTMLDivElement>(null);
  const qKineticLayerRef = useRef<HTMLDivElement>(null);
  const qCenterZoomTextRef = useRef<HTMLDivElement>(null);
  const qDiagonalRibbon1Ref = useRef<HTMLDivElement>(null);
  const qDiagonalRibbon2Ref = useRef<HTMLDivElement>(null);
  const qCenterCardRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    const shareData = {
      title: `${project.title} — ${project.studio || 'Ecuadorian Architecture'}`,
      text: `Explora el expediente monográfico de "${project.title}" (${project.studio || 'Arquitectura Ecuatoriana'}) en Ecuadorian Architecture.`,
      url: window.location.href,
    };

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ) {
      navigator.share(shareData).catch(() => {
        // Fallback to rich mobile drawer modal
        setIsShareModalOpen(true);
      });
    } else {
      setIsShareModalOpen(true);
    }
  };

  // Computed Focal Point / Object Position for Hero Photograph
  const heroObjectPosition = useMemo(() => {
    if (project.heroImagePosition && typeof project.heroImagePosition === 'string' && project.heroImagePosition.trim()) {
      return project.heroImagePosition.trim();
    }
    if (project.heroImageFocalPoint && typeof project.heroImageFocalPoint === 'string') {
      const fp = project.heroImageFocalPoint.trim().toLowerCase();
      if (fp === 'top') return 'center 15%';
      if (fp === 'bottom') return 'center 80%';
      if (fp === 'center') return 'center 50%';
      return fp;
    }
    return 'center 50%';
  }, [project.heroImagePosition, project.heroImageFocalPoint]);

  const heroImageZoomScale = useMemo(() => {
    const zoom = Number(project.heroImageZoom);
    if (!isNaN(zoom) && zoom > 100) {
      return `scale(${zoom / 100})`;
    }
    return undefined;
  }, [project.heroImageZoom]);

  // =========================================================================
  // GSAP SCROLL CHOREOGRAPHY (Switches between 3 distinct physical proposals)
  // =========================================================================
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      if (!trackRef.current || !stageRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // -----------------------------------------------------------------------
      // COMMON MOMENTO 1 (Scroll 0.00 -> 0.22): EXPANSION TO 100vw x 100vh
      // -----------------------------------------------------------------------
      if (headerBarRef.current) {
        tl.to(headerBarRef.current, { y: -90, opacity: 0, duration: 0.15, ease: 'power1.inOut' }, 0);
      }
      if (initialEditorialRef.current) {
        tl.to(initialEditorialRef.current, { y: -45, opacity: 0, scale: 0.95, duration: 0.14, ease: 'power1.inOut' }, 0);
      }
      if (scrollPromptRef.current) {
        tl.to(scrollPromptRef.current, { opacity: 0, duration: 0.08, ease: 'power1.out' }, 0);
      }

      // Hero image expands with nuance depending on variant
      if (heroWrapperRef.current) {
        if (motionVariant === 'quadrant-aperture') {
          // Perspective level-out expansion
          tl.fromTo(
            heroWrapperRef.current,
            { rotateX: 10, scale: 0.92, borderRadius: '28px' },
            {
              top: '50%',
              width: '100vw',
              maxWidth: '100vw',
              height: '100vh',
              maxHeight: '100vh',
              borderRadius: '0px',
              borderWidth: '0px',
              rotateX: 0,
              scale: 1,
              duration: 0.22,
              ease: 'power2.inOut',
            },
            0
          );
        } else {
          tl.fromTo(
            heroWrapperRef.current,
            { borderRadius: '28px' },
            {
              top: '50%',
              width: '100vw',
              maxWidth: '100vw',
              height: '100vh',
              maxHeight: '100vh',
              borderRadius: '0px',
              borderWidth: '0px',
              duration: 0.22,
              ease: 'power2.inOut',
            },
            0
          );
        }
      }

      // Watermark figure stamp shines at full bleed
      if (watermarkStampRef.current) {
        tl.fromTo(watermarkStampRef.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.07, ease: 'power1.out' }, 0.16);
        tl.to(watermarkStampRef.current, { opacity: 0, duration: 0.06 }, 0.24);
      }

      // -----------------------------------------------------------------------
      // CHOREOGRAPHY VARIANT 1: VERTICAL SLICES (Tectonic brutalist deconstruction)
      // -----------------------------------------------------------------------
      if (motionVariant === 'vertical-slices') {
        if (singleHeroImgRef.current && vSlicesLayerRef.current) {
          tl.to(singleHeroImgRef.current, { opacity: 0, duration: 0.02 }, 0.23);
          tl.to(vSlicesLayerRef.current, { opacity: 1, duration: 0.02 }, 0.23);
        }

        if (vSlice1Ref.current) tl.to(vSlice1Ref.current, { yPercent: -65, rotate: -3.5, scale: 0.94, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (vSlice2Ref.current) tl.to(vSlice2Ref.current, { yPercent: 72, rotate: 2.8, scale: 1.04, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (vSlice3Ref.current) tl.to(vSlice3Ref.current, { yPercent: -88, rotate: -2.0, scale: 0.92, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (vSlice4Ref.current) tl.to(vSlice4Ref.current, { yPercent: 78, rotate: 3.2, scale: 1.05, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (vSlice5Ref.current) tl.to(vSlice5Ref.current, { yPercent: -62, rotate: -3.0, scale: 0.94, duration: 0.26, ease: 'power2.inOut' }, 0.25);

        // Kinetic typography
        if (vKineticLayerRef.current) tl.to(vKineticLayerRef.current, { opacity: 1, duration: 0.05 }, 0.44);
        if (vKineticLine1Ref.current) tl.fromTo(vKineticLine1Ref.current, { xPercent: -75, opacity: 0 }, { xPercent: 25, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.44);
        if (vKineticLine2Ref.current) tl.fromTo(vKineticLine2Ref.current, { xPercent: 75, opacity: 0 }, { xPercent: -20, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.47);
        if (vKineticLine3Ref.current) tl.fromTo(vKineticLine3Ref.current, { xPercent: -60, opacity: 0 }, { xPercent: 30, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.50);

        if (vConceptualCardRef.current) {
          tl.fromTo(vConceptualCardRef.current, { scale: 0.82, opacity: 0, y: 55 }, { scale: 1, opacity: 1, y: 0, duration: 0.18, ease: 'back.out(1.2)' }, 0.50);
          tl.to(vConceptualCardRef.current, { opacity: 0, scale: 0.94, y: -35, duration: 0.14, ease: 'power1.in' }, 0.68);
        }

        // Dissolve into monograph
        if (vSlicesLayerRef.current) tl.to(vSlicesLayerRef.current, { opacity: 0, y: 80, duration: 0.20, ease: 'power2.in' }, 0.72);
        if (vKineticLayerRef.current) tl.to(vKineticLayerRef.current, { opacity: 0, y: 60, duration: 0.20, ease: 'power2.in' }, 0.72);
      }

      // -----------------------------------------------------------------------
      // CHOREOGRAPHY VARIANT 2: HORIZONTAL BLINDS (Lateral panoramic strata)
      // -----------------------------------------------------------------------
      if (motionVariant === 'horizontal-blinds') {
        if (singleHeroImgRef.current && hBlindsLayerRef.current) {
          tl.to(singleHeroImgRef.current, { opacity: 0, duration: 0.02 }, 0.23);
          tl.to(hBlindsLayerRef.current, { opacity: 1, duration: 0.02 }, 0.23);
        }

        // 4 Horizontal bands slide in alternating lateral directions with skew
        if (hBlind1Ref.current) tl.to(hBlind1Ref.current, { xPercent: -75, skewX: -2, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (hBlind2Ref.current) tl.to(hBlind2Ref.current, { xPercent: 80, skewX: 2.5, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (hBlind3Ref.current) tl.to(hBlind3Ref.current, { xPercent: -85, skewX: -2.5, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (hBlind4Ref.current) tl.to(hBlind4Ref.current, { xPercent: 72, skewX: 2, duration: 0.26, ease: 'power2.inOut' }, 0.25);

        // Vertical typographic columns & horizontal marquee
        if (hKineticLayerRef.current) tl.to(hKineticLayerRef.current, { opacity: 1, duration: 0.05 }, 0.44);
        if (hKineticCol1Ref.current) tl.fromTo(hKineticCol1Ref.current, { yPercent: 60, opacity: 0 }, { yPercent: -40, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.44);
        if (hKineticCol2Ref.current) tl.fromTo(hKineticCol2Ref.current, { yPercent: -60, opacity: 0 }, { yPercent: 40, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.47);
        if (hKineticRibbonRef.current) tl.fromTo(hKineticRibbonRef.current, { xPercent: 80, opacity: 0 }, { xPercent: -30, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.48);

        if (hQuoteBoxRef.current) {
          tl.fromTo(hQuoteBoxRef.current, { scale: 0.85, opacity: 0, x: -60 }, { scale: 1, opacity: 1, x: 0, duration: 0.18, ease: 'back.out(1.2)' }, 0.50);
          tl.to(hQuoteBoxRef.current, { opacity: 0, x: 60, duration: 0.14, ease: 'power1.in' }, 0.68);
        }

        // Dissolve
        if (hBlindsLayerRef.current) tl.to(hBlindsLayerRef.current, { opacity: 0, scale: 0.96, duration: 0.20, ease: 'power2.in' }, 0.72);
        if (hKineticLayerRef.current) tl.to(hKineticLayerRef.current, { opacity: 0, duration: 0.20, ease: 'power2.in' }, 0.72);
      }

      // -----------------------------------------------------------------------
      // CHOREOGRAPHY VARIANT 3: QUADRANT APERTURE (3D perspective expansion)
      // -----------------------------------------------------------------------
      if (motionVariant === 'quadrant-aperture') {
        if (singleHeroImgRef.current && qApertureLayerRef.current) {
          tl.to(singleHeroImgRef.current, { opacity: 0, duration: 0.02 }, 0.23);
          tl.to(qApertureLayerRef.current, { opacity: 1, duration: 0.02 }, 0.23);
        }

        // 4 Corner quadrants part outward in an explosive diagonal aperture
        if (qTopLeftRef.current) tl.to(qTopLeftRef.current, { xPercent: -62, yPercent: -60, rotate: -7, scale: 0.9, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (qTopRightRef.current) tl.to(qTopRightRef.current, { xPercent: 62, yPercent: -60, rotate: 7, scale: 0.9, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (qBottomLeftRef.current) tl.to(qBottomLeftRef.current, { xPercent: -62, yPercent: 60, rotate: 6, scale: 0.9, duration: 0.26, ease: 'power2.inOut' }, 0.25);
        if (qBottomRightRef.current) tl.to(qBottomRightRef.current, { xPercent: 62, yPercent: 60, rotate: -6, scale: 0.9, duration: 0.26, ease: 'power2.inOut' }, 0.25);

        // 3D Zooming typography
        if (qKineticLayerRef.current) tl.to(qKineticLayerRef.current, { opacity: 1, duration: 0.05 }, 0.44);
        if (qCenterZoomTextRef.current) {
          tl.fromTo(qCenterZoomTextRef.current, { scale: 0.35, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 0.28, ease: 'power2.out' }, 0.44);
          tl.to(qCenterZoomTextRef.current, { scale: 1.35, opacity: 0, duration: 0.14, ease: 'power1.in' }, 0.66);
        }
        if (qDiagonalRibbon1Ref.current) tl.fromTo(qDiagonalRibbon1Ref.current, { xPercent: -70, opacity: 0 }, { xPercent: 30, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.46);
        if (qDiagonalRibbon2Ref.current) tl.fromTo(qDiagonalRibbon2Ref.current, { xPercent: 70, opacity: 0 }, { xPercent: -30, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.48);

        if (qCenterCardRef.current) {
          tl.fromTo(qCenterCardRef.current, { scale: 0.75, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: 'back.out(1.2)' }, 0.50);
          tl.to(qCenterCardRef.current, { opacity: 0, scale: 1.08, duration: 0.14, ease: 'power1.in' }, 0.68);
        }

        // Dissolve
        if (qApertureLayerRef.current) tl.to(qApertureLayerRef.current, { opacity: 0, scale: 1.1, duration: 0.20, ease: 'power2.in' }, 0.72);
        if (qKineticLayerRef.current) tl.to(qKineticLayerRef.current, { opacity: 0, duration: 0.20, ease: 'power2.in' }, 0.72);
      }

      // Settle indicator pointing into the monograph dossier
      if (settleIndicatorRef.current) {
        tl.fromTo(
          settleIndicatorRef.current,
          { opacity: 0, y: 35, pointerEvents: 'none' },
          { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.14, ease: 'power2.out' },
          0.78
        );
        tl.to(
          settleIndicatorRef.current,
          { opacity: 0, y: -25, pointerEvents: 'none', duration: 0.12, ease: 'power2.in' },
          0.93
        );
      }
    },
    { scope: pageRef, dependencies: [projectId, motionVariant] }
  );

  // =========================================================================
  // HELPER: Architectural Plan Drawing (Uploaded Image)
  // =========================================================================
  const renderPlanimetryDrawing = (highlightType?: 'planta' | 'corte' | 'axonometria') => {
    const currentType = highlightType || activePlanType;
    const planImg =
      (project.plans && project.plans[currentType]) ||
      project.planImage ||
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80';
    const photographerName = project.datos?.fotografia || project.photographer || '';

    return (
      <figure className="w-full my-6 group">
        <div
          onClick={() => openLightboxAt(0)}
          className="w-full cursor-zoom-in overflow-hidden rounded-[2px] bg-white border border-neutral-100 flex items-center justify-center p-2 sm:p-4"
          title="Clic para ver en carrusel de fotos a pantalla completa"
        >
          <img
            src={planImg}
            alt="Plano arquitectónico"
            className="w-full h-auto max-h-[560px] object-contain mx-auto group-hover:scale-[1.01] transition-transform duration-500"
            loading="lazy"
          />
        </div>
        {photographerName ? (
          <figcaption className="pt-1.5 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
            {photographerName}
          </figcaption>
        ) : null}
      </figure>
    );
  };

  // Contextual secondary bottom navbar visibility check:
  // Appears ONLY when user is actively reading within the monograph dossier folder section
  // Disappears immediately when leaving that section (scrolling above it or scrolling below it into Ciudad & Territorio / Ficha Técnica)
  useEffect(() => {
    const handleScrollCheck = () => {
      const section = document.getElementById('dossier-heading') || document.getElementById('folder-tabs-anchor');
      const tabsAnchor = document.getElementById('folder-tabs-anchor');
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      const tabsRect = tabsAnchor ? tabsAnchor.getBoundingClientRect() : sectionRect;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // 1. Entrance: Physical top tabs in the folder have scrolled out of the top of the viewport
      // (avoiding redundant bottom bar while top tabs are directly visible in view)
      const tabsOutOfView = tabsRect.top + 100 <= 70;

      // 2. Exit: Reader is strictly within this dossier section.
      // As soon as the reader scrolls past the end of this folder (into Ciudad & Territorio, Ficha Técnica, etc.),
      // sectionRect.bottom drops below the threshold, immediately hiding the bar.
      const withinSection = sectionRect.bottom >= 220 && sectionRect.top < windowHeight - 80;

      setIsBottomNavVisible(tabsOutOfView && withinSection);
    };

    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    window.addEventListener('resize', handleScrollCheck);
    handleScrollCheck();

    return () => {
      window.removeEventListener('scroll', handleScrollCheck);
      window.removeEventListener('resize', handleScrollCheck);
    };
  }, [activeTab]);

  const handleSelectCategory = (tab: string) => {
    setActiveTab(tab);
    // Preserves reader position in-flow without forcing an unwanted jump back to top
  };

  return (
    <div ref={pageRef} className="w-full bg-white text-ea-black select-none">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC SCROLL SEQUENCE TRACK (420vh track, sticky 100vh stage)      */}
      {/* ========================================================================= */}
      <section ref={trackRef} className="relative w-full h-[420vh]">
        <div
          ref={stageRef}
          className="sticky top-0 w-full h-screen overflow-hidden bg-white"
        >
          {/* --------------------------------------------------------------------- */}
          {/* A. TOP BAR: Exact Figma Header & Pill Bar (media_1791919174953_b2b8f1f9.png) */}
          {/* --------------------------------------------------------------------- */}
          <div
            ref={headerBarRef}
            className="hero-header-bar absolute top-0 left-0 right-0 z-40 px-3.5 sm:px-8 md:px-12 pt-[calc(0.4rem+env(safe-area-inset-top,0px))] sm:pt-3.5 md:pt-4 pb-1 max-w-[1400px] mx-auto pointer-events-auto"
          >
            <style>{`
              /* Architectural Hero & Header Geometry: Balanced proportions, zero cropping */
              .hero-photo-card {
                top: 57.5%;
                height: 56vh;
                max-height: 580px;
                min-height: 380px;
              }
              @media (max-height: 800px) {
                .hero-header-bar {
                  padding-top: 8px !important;
                  padding-bottom: 2px !important;
                }
                .hero-pill-capsule {
                  padding-top: 6px !important;
                  padding-bottom: 6px !important;
                  padding-left: 16px !important;
                  padding-right: 16px !important;
                }
                .hero-editorial-placard {
                  top: 126px !important;
                }
                .hero-editorial-placard h2 {
                  font-size: 26px !important;
                }
                .hero-photo-card {
                  top: 58.5% !important;
                  height: 50vh !important;
                  max-height: 480px !important;
                }
              }
              @media (max-height: 620px) {
                .hero-header-bar {
                  padding-top: 4px !important;
                  padding-bottom: 2px !important;
                }
                .hero-pill-capsule {
                  padding-top: 4px !important;
                  padding-bottom: 4px !important;
                }
                .hero-editorial-placard {
                  top: 104px !important;
                }
                .hero-editorial-placard h2 {
                  font-size: 20px !important;
                }
                .hero-photo-card {
                  top: 61% !important;
                  height: 44vh !important;
                  max-height: 350px !important;
                }
              }
              @media (max-height: 480px) {
                .hero-header-bar header {
                  display: none !important;
                }
                .hero-editorial-placard {
                  top: 56px !important;
                }
                .hero-photo-card {
                  top: 64% !important;
                  height: 38vh !important;
                  max-height: 240px !important;
                }
              }
            `}</style>
            <header className="flex items-center justify-between gap-3 sm:gap-6 pb-2 sm:pb-3 border-b border-ea-black/10 mb-2">
              {/* Left: Brand Logo + Section Breadcrumb Back Button */}
              <div className="flex items-center gap-2.5 sm:gap-4 shrink min-w-0">
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    else window.location.hash = '';
                  }}
                  className="group transition-transform hover:scale-105 flex items-center cursor-pointer focus:outline-none shrink-0"
                  title="Volver al inicio"
                  data-cursor
                >
                  <img
                    src={logoUrl}
                    alt="Ecuadorian Architecture"
                    className="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0"
                  />
                </button>

                <span className="text-ea-black/25 font-mono text-xs">/</span>

                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 sm:gap-2 group cursor-pointer focus:outline-none py-1 px-2 rounded-sm hover:bg-ea-black/5 transition-colors shrink-0"
                  title={`Volver a ${projectSection}`}
                  data-cursor
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ea-black group-hover:-translate-x-1 transition-transform" />
                  <span className="font-anton text-xs sm:text-sm uppercase tracking-wider text-ea-black">
                    {projectSection.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-ea-black/40 tracking-widest uppercase hidden lg:inline">
                    / ARCHIVO
                  </span>
                </button>
              </div>

              {/* Right: Section Links - Clean horizontal architectural links */}
              <nav aria-label="Secciones de la plataforma" className="flex items-center gap-3.5 sm:gap-6 md:gap-7 shrink-0">
                <button
                  onClick={() => onNavigate && onNavigate('territorios')}
                  className={`font-anton text-xs sm:text-[13px] tracking-[0.15em] uppercase transition-colors relative py-1 ${
                    projectSection === 'territorios' ? 'text-ea-black font-bold' : 'text-ea-black/60 hover:text-ea-black'
                  }`}
                  title="Ir a Territorios"
                  data-cursor
                >
                  <span>TERRITORIOS</span>
                  {projectSection === 'territorios' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-ea-black" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('academia')}
                  className={`font-anton text-xs sm:text-[13px] tracking-[0.15em] uppercase transition-colors relative py-1 ${
                    projectSection === 'academia' ? 'text-ea-black font-bold' : 'text-ea-black/60 hover:text-ea-black'
                  }`}
                  title="Ir a Academia"
                  data-cursor
                >
                  <span>ACADEMIA</span>
                  {projectSection === 'academia' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-ea-black" />
                  )}
                </button>

                {projectSection !== 'proyectos' && (
                  <button
                    onClick={() => onNavigate && onNavigate('proyectos')}
                    className="font-anton text-xs sm:text-[13px] tracking-[0.15em] uppercase text-ea-black/60 hover:text-ea-black transition-colors relative py-1"
                    title="Ir a Proyectos"
                    data-cursor
                  >
                    <span>PROYECTOS</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate && onNavigate('acerca')}
                  className="font-anton text-xs sm:text-[13px] tracking-[0.15em] uppercase text-ea-black/60 hover:text-ea-black transition-colors relative py-1"
                  title="Ir a Acerca de EA"
                  data-cursor
                >
                  <span>ACERCA</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 border border-ea-black/30 hover:border-ea-black text-ea-black hover:bg-ea-black hover:text-white transition-all rounded-[2px] font-anton text-[11px] sm:text-xs uppercase tracking-wider shrink-0 cursor-pointer active:scale-95 touch-manipulation ml-0.5"
                  title="Compartir este expediente"
                  aria-label="Compartir este expediente"
                  data-cursor
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">COMPARTIR</span>
                </button>
              </nav>
            </header>

            {/* Pill Capsule Wrapper with smooth scroll, mouse drag & indicators */}
            <div className="relative w-full group/pill">
              {/* Left Arrow Button / Indicator when scrolled right */}
              {canScrollPillLeft && (
                <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center pl-1 sm:pl-2 pr-4 bg-gradient-to-r from-[#F0EEEA] via-[#F0EEEA]/90 to-transparent rounded-l-full pointer-events-none">
                  <button
                    type="button"
                    onClick={() => handlePillScrollStep('left')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ea-black text-white flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                    title="Ver datos anteriores a la izquierda"
                    aria-label="Ver datos anteriores a la izquierda"
                    data-cursor
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Pill Capsule: Desplazable horizontalmente con rueda del mouse, arrastre o botones */}
              <div
                ref={pillScrollRef}
                onScroll={checkPillScroll}
                className="hero-pill-capsule w-full bg-[#FAF8F5]/95 rounded-full py-1.5 sm:py-2.5 px-5 sm:px-8 border border-ea-black/20 shadow-xs flex items-center justify-start lg:justify-center gap-3 sm:gap-6 md:gap-7 overflow-x-auto no-scrollbar whitespace-nowrap cursor-grab active:cursor-grabbing select-none"
              >
                {/* ========================================================= */}
                {/* CASO 1: TERRITORIOS (Sin crítica ni fotografía)          */}
                {/* ========================================================= */}
                {projectSection === 'territorios' && (
                  <>
                    {/* 1. TERRITORIO / LUGAR */}
                    <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                      <img src={compLugarUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                      <span>{project.location || project.region || 'TERRITORIO'}</span>
                    </div>

                    <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>

                    {/* 2. COLECTIVO / EQUIPO */}
                    {studiosList.length > 1 ? (
                      <div className="flex items-center gap-1.5 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                        <img src={compAutorUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                        {studiosList.map((st, i) => {
                          const canOpen = canOpenAuthorModal(st);
                          return (
                            <React.Fragment key={st}>
                              {i > 0 && <span className="text-ea-black/50 font-bold select-none">+</span>}
                              {canOpen ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAuthor(st)}
                                  className="hover:underline underline-offset-4 decoration-2 decoration-ea-black font-semibold cursor-pointer transition-colors"
                                  title={`Ver investigaciones de ${st}`}
                                  data-cursor
                                >
                                  {st}
                                </button>
                              ) : (
                                <span className="font-semibold">{st}</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                        {studiosList.some((st) => canOpenAuthorModal(st)) && (
                          <span className="text-xs font-mono text-ea-black/40">↗</span>
                        )}
                      </div>
                    ) : canOpenAuthorModal(project.studio) ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAuthor(project.studio)}
                        className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 group hover:text-black cursor-pointer transition-colors leading-[1.25] py-0.5"
                        title={`Ver investigaciones de ${project.studio || 'este colectivo'}`}
                        data-cursor
                      >
                        <img src={compAutorUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block group-hover:scale-105 transition-transform pointer-events-none" />
                        <span className="group-hover:underline underline-offset-4 decoration-2 decoration-ea-black font-semibold">
                          {project.studio || 'COLECTIVO TERRITORIAL'}
                        </span>
                        <span className="text-xs font-mono text-ea-black/40 group-hover:text-ea-black transition-colors">↗</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                        <img src={compAutorUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                        <span className="font-semibold">
                          {project.studio || 'COLECTIVO TERRITORIAL'}
                        </span>
                      </div>
                    )}

                    {/* 3. EJE / PROBLEMÁTICA (si está disponible) */}
                    {(project.problematica || project.situacion || project.category) && (
                      <>
                        <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>
                        <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                          <img src={tagCiudadUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                          <span>{project.problematica || project.situacion || project.category}</span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* ========================================================= */}
                {/* CASO 2: ACADEMIA (Renders opcional en vez de fotografía)   */}
                {/* ========================================================= */}
                {projectSection === 'academia' && (
                  <>
                    {/* 1. LUGAR / SEDE */}
                    <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                      <img src={compLugarUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                      <span>{project.location || 'ECUADOR'}</span>
                    </div>

                    <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>

                    {/* 2. TESISTA / AUTOR */}
                    {canOpenAuthorModal(project.studio || project.author || project.institution) ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAuthor(project.studio || project.author || project.institution)}
                        className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 group hover:text-black cursor-pointer transition-colors leading-[1.25] py-0.5"
                        title="Ver investigaciones de este autor"
                        data-cursor
                      >
                        <img src={compAutorUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block group-hover:scale-105 transition-transform pointer-events-none" />
                        <span className="group-hover:underline underline-offset-4 decoration-2 decoration-ea-black font-semibold">
                          {project.studio || project.author || 'TESISTA'}
                        </span>
                        <span className="text-xs font-mono text-ea-black/40 group-hover:text-ea-black transition-colors">↗</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                        <img src={compAutorUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                        <span className="font-semibold">
                          {project.studio || project.author || 'TESISTA'}
                        </span>
                      </div>
                    )}

                    {/* 3. UNIVERSIDAD / INSTITUCIÓN */}
                    <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>
                    <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                      <img src={tagAcademicoUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                      <span>{project.universidad || project.institution || project.critic || 'UNIVERSIDAD'}</span>
                    </div>

                    {/* 4. RENDERS / VISUALIZACIÓN 3D (OPCIONAL: puede estar o no estar) */}
                    {Boolean(project.datos?.renders?.trim() || project.renders?.trim() || project.datos?.visualizacion?.trim()) && (
                      <>
                        <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>
                        <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                          <img src={compFotografiaUrl} alt="Renders" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                          <span className="text-neutral-500 font-mono text-[11px] sm:text-xs">RENDERS:</span>
                          <span className="font-semibold">{project.datos?.renders || project.renders || project.datos?.visualizacion}</span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* ========================================================= */}
                {/* CASO 3: PROYECTOS (Arquitectura construida tradicional)   */}
                {/* ========================================================= */}
                {projectSection === 'proyectos' && (
                  <>
                    {/* 1. LUGAR */}
                    <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                      <img src={compLugarUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                      <span>{project.location || 'QUITO'}</span>
                    </div>

                    <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>

                    {/* 2. AUTOR (Clickable solo si tiene perfil registrado y activado en CMS) */}
                    {studiosList.length > 1 ? (
                      <div className="flex items-center gap-1.5 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                        <img src={compAutorUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                        {studiosList.map((st, i) => {
                          const canOpen = canOpenAuthorModal(st);
                          return (
                            <React.Fragment key={st}>
                              {i > 0 && <span className="text-ea-black/50 font-bold select-none">+</span>}
                              {canOpen ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAuthor(st)}
                                  className="hover:underline underline-offset-4 decoration-2 decoration-ea-black font-semibold cursor-pointer transition-colors"
                                  title={`Ver perfil y proyectos de ${st}`}
                                  data-cursor
                                >
                                  {st}
                                </button>
                              ) : (
                                <span className="font-semibold">{st}</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                        {studiosList.some((st) => canOpenAuthorModal(st)) && (
                          <span className="text-xs font-mono text-ea-black/40">↗</span>
                        )}
                      </div>
                    ) : canOpenAuthorModal(project.studio) ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAuthor(project.studio)}
                        className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 group hover:text-black cursor-pointer transition-colors leading-[1.25] py-0.5"
                        title={`Ver perfil y proyectos de ${project.studio || 'este autor'}`}
                        data-cursor
                      >
                        <img src={compAutorUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block group-hover:scale-105 transition-transform pointer-events-none" />
                        <span className="group-hover:underline underline-offset-4 decoration-2 decoration-ea-black font-semibold">
                          {project.studio || 'ESTUDIO'}
                        </span>
                        <span className="text-xs font-mono text-ea-black/40 group-hover:text-ea-black transition-colors">↗</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                        <img src={compAutorUrl} alt="" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                        <span className="font-semibold">
                          {project.studio || 'ESTUDIO'}
                        </span>
                      </div>
                    )}

                    {/* 3. MAESTRO MAYOR & MANO DE OBRA (OPCIONAL: igual que fotógrafo, puede estar o no estar) */}
                    {Boolean(constructionTeam && constructionTeam.maestroMayor?.nombre?.trim()) && (
                      <>
                        <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>
                        <button
                          type="button"
                          onClick={() => setIsConstructionTeamModalOpen(true)}
                          className="flex items-center gap-1.5 sm:gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 group hover:text-black cursor-pointer transition-colors leading-[1.25] py-0.5"
                          title={`Ver equipo de trabajo y cuadrilla de obra a cargo de ${constructionTeam.maestroMayor.nombre}`}
                          data-cursor
                        >
                          <img src={compMaestroUrl} alt="" className="h-4 sm:h-5 md:h-6 w-auto object-contain inline-block group-hover:scale-105 transition-transform pointer-events-none" />
                          <span className="text-ea-black/60 font-normal">MAESTRO MAYOR</span>
                          <span className="group-hover:underline underline-offset-4 decoration-2 decoration-ea-black font-semibold">
                            {constructionTeam.maestroMayor.nombre}
                          </span>
                          <span className="text-xs font-mono text-ea-black/40 group-hover:text-ea-black transition-colors">↗</span>
                        </button>
                      </>
                    )}

                    {/* 4. FOTOGRAFÍA (OPCIONAL: solo si el proyecto tiene fotógrafo asignado) */}
                    {Boolean(project.datos?.fotografia?.trim() || project.photographer?.trim()) && (
                      <>
                        <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>
                        <button
                          type="button"
                          onClick={() => handleOpenPhotographer(project.datos?.fotografia || project.photographer)}
                          className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 group hover:text-black cursor-pointer transition-colors leading-[1.25] py-0.5"
                          title={`Ver perfil y proyectos fotografiados por ${project.datos?.fotografia || project.photographer}`}
                          data-cursor
                        >
                          <img src={compFotografiaUrl} alt="Fotografía" className="h-4 sm:h-5 md:h-6 object-contain inline-block group-hover:scale-105 transition-transform pointer-events-none" />
                          <span className="group-hover:underline underline-offset-4 decoration-2 decoration-ea-black font-semibold">
                            {project.datos?.fotografia || project.photographer}
                          </span>
                          <span className="text-xs font-mono text-ea-black/40 group-hover:text-ea-black transition-colors">↗</span>
                        </button>
                      </>
                    )}

                    {/* 5. CRÍTICA (OPCIONAL: solo si el módulo de crítica está activo en este proyecto) */}
                    {hasCriticaActive && Boolean(project.critic?.trim()) && (
                      <>
                        <span className="text-ea-black/30 font-bold text-sm sm:text-base shrink-0 select-none">•</span>
                        <div className="flex items-center gap-2 font-okcok text-xs sm:text-[15px] md:text-base uppercase tracking-wide text-ea-black shrink-0 leading-[1.25] py-0.5">
                          <img src={compCriticaUrl} alt="Crítica" className="h-4 sm:h-5 md:h-6 object-contain inline-block pointer-events-none" />
                          <span>{project.critic.trim()}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Right Arrow Button / Indicator when content overflows right */}
              {canScrollPillRight && (
                <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center pr-1 sm:pr-2 pl-4 bg-gradient-to-l from-[#F0EEEA] via-[#F0EEEA]/90 to-transparent rounded-r-full pointer-events-none">
                  <button
                    type="button"
                    onClick={() => handlePillScrollStep('right')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ea-black text-white flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                    title="Ver más datos hacia la derecha"
                    aria-label="Ver más datos hacia la derecha"
                    data-cursor
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* B. MOMENTO 1 HERO STAGE: Centered image growing to 100vw x 100vh      */}
          {/* --------------------------------------------------------------------- */}
          <div
            ref={initialEditorialRef}
            className="hero-editorial-placard absolute top-[134px] sm:top-[144px] md:top-[150px] left-1/2 -translate-x-1/2 w-[92vw] sm:w-[90vw] max-w-[1040px] px-1 sm:px-2 flex items-end justify-between z-20 pointer-events-none"
          >
            <div>
              <h2 className="font-okcok text-2xl sm:text-3xl md:text-[38px] uppercase text-ea-black tracking-normal leading-[1.2] py-0.5">
                {project.title}
              </h2>
              <div className="sm:hidden font-creato text-[11px] text-ea-black/60 leading-snug mt-1">
                <span className="capitalize">{project.category || (projectSection === 'academia' ? 'Investigación Académica' : projectSection === 'territorios' ? 'Expediente Territorial' : 'Edificación colectiva')}</span> • <span>AÑO: {project.year}</span>
                {projectSection === 'territorios' ? (
                  <span className="block text-ea-black/55">región: {project.region || project.location}</span>
                ) : projectSection === 'academia' ? (
                  <span className="block text-ea-black/55">investigación: {project.universidad || project.studio}</span>
                ) : hasCriticaActive && Boolean(project.critic?.trim()) ? (
                  <span className="block text-ea-black/55">escrito por: {project.critic.trim()}</span>
                ) : null}
              </div>
            </div>
            <div className="text-right hidden sm:block pointer-events-auto leading-tight text-ea-black/60">
              <p className="font-creato text-[11px] sm:text-[12px] text-ea-black/60 capitalize">
                {project.category || (projectSection === 'academia' ? 'Investigación Académica' : projectSection === 'territorios' ? 'Expediente Territorial' : 'Edificación colectiva')}
              </p>
              <p className="font-creato text-[10.5px] sm:text-[11px] text-ea-black/50 uppercase mt-0.5">
                AÑO: {project.year}
              </p>
              {projectSection === 'territorios' ? (
                <p className="font-creato text-[11px] sm:text-[12px] text-ea-black/60 mt-0.5">
                  escala: <span className="text-ea-black/75">{project.region || project.location || 'Territorial'}</span>
                </p>
              ) : projectSection === 'academia' ? (
                <p className="font-creato text-[11px] sm:text-[12px] text-ea-black/60 mt-0.5">
                  institución: <span className="text-ea-black/75">{project.universidad || project.studio || 'Academia'}</span>
                </p>
              ) : hasCriticaActive && Boolean(project.critic?.trim()) ? (
                <p className="font-creato text-[11px] sm:text-[12px] text-ea-black/60 mt-0.5">
                  escrito por: <span className="text-ea-black/75">{project.critic.trim()}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div
            ref={heroWrapperRef}
            onClick={() => openLightboxAt(0)}
            className="hero-photo-card absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] sm:w-[90vw] max-w-[1040px] rounded-[18px] sm:rounded-[24px] shadow-2xl overflow-hidden bg-ea-offwhite z-10 transition-shadow duration-300 cursor-zoom-in"
            title="Clic para ver en carrusel de fotos a pantalla completa"
          >
            <img
              ref={singleHeroImgRef}
              src={project.heroImage}
              alt={project.title}
              className="w-full h-full object-cover transition-[object-position] duration-200"
              style={{
                objectPosition: heroObjectPosition,
                transform: heroImageZoomScale,
              }}
            />

            <div
              ref={watermarkStampRef}
              className="absolute inset-0 flex flex-col justify-between p-8 sm:p-12 bg-black/30 text-white pointer-events-none opacity-0"
            >
              <div className="flex justify-between items-center text-xs font-mono tracking-widest uppercase">
                <span>REGISTRO MONOGRÁFICO EA</span>
                <span>{project.location} — {project.year}</span>
              </div>
              <div>
                <h3 className="font-okcok text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-tight text-white leading-none">
                  {project.title}
                </h3>
                <p className="font-anton text-sm sm:text-base tracking-widest uppercase text-white/90 mt-3">
                  {project.studio} • {project.location}
                </p>
              </div>
            </div>
          </div>

          <div
            ref={scrollPromptRef}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-ea-black/45 text-[11px] font-mono uppercase tracking-widest pointer-events-none"
          >
            <MoveDown className="w-3.5 h-3.5 animate-bounce" />
            <span>DESPLAZA HACIA ABAJO PARA EXPLORAR</span>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* C. VARIANT 1: VERTICAL SLICES LAYER & KINETIC TYPOGRAPHY               */}
          {/* --------------------------------------------------------------------- */}
          {motionVariant === 'vertical-slices' && (
            <>
              <div
                ref={vSlicesLayerRef}
                className="absolute inset-0 w-screen h-screen overflow-hidden bg-[#0A0C10] z-20 pointer-events-none opacity-0"
              >
                <div
                  className="absolute inset-0 opacity-[0.15] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                  }}
                />

                <div className="absolute top-8 left-8 text-white/30 font-mono text-[11px] uppercase tracking-widest">
                  [CINEMÁTICA 01: {project.motion?.kicker || 'FRACTURA VERTICAL TECTÓNICA'} • {project.location}]
                </div>

                {/* 5 Vertical Slices */}
                <div ref={vSlice1Ref} className="absolute top-0 left-0 w-[20vw] h-screen overflow-hidden shadow-2xl border-r border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-0 left-0 w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div ref={vSlice2Ref} className="absolute top-0 left-[20vw] w-[20vw] h-screen overflow-hidden shadow-2xl border-r border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-0 left-[-20vw] w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
                <div ref={vSlice3Ref} className="absolute top-0 left-[40vw] w-[20vw] h-screen overflow-hidden shadow-2xl border-r border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-0 left-[-40vw] w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/15" />
                </div>
                <div ref={vSlice4Ref} className="absolute top-0 left-[60vw] w-[20vw] h-screen overflow-hidden shadow-2xl border-r border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-0 left-[-60vw] w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div ref={vSlice5Ref} className="absolute top-0 left-[80vw] w-[20vw] h-screen overflow-hidden shadow-2xl">
                  <img src={project.heroImage} alt="" className="absolute top-0 left-[-80vw] w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              </div>

              {/* Kinetic Typography */}
              <div
                ref={vKineticLayerRef}
                className="absolute inset-0 w-screen h-screen overflow-hidden z-30 pointer-events-none flex flex-col justify-between py-12 opacity-0"
              >
                <div ref={vKineticLine1Ref} className="whitespace-nowrap font-okcok text-6xl sm:text-8xl md:text-9xl uppercase tracking-tight text-white/95 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] select-none pl-12">
                  “{project.title}” • {project.location} • {project.year} • {project.studio}
                </div>

                <div className="w-full flex justify-center px-6 my-auto">
                  <div ref={vConceptualCardRef} className="w-full max-w-2xl bg-white/95 text-ea-black border-2 border-ea-black p-6 sm:p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] backdrop-blur-md">
                    <div className="flex items-center justify-between pb-3 border-b border-ea-border mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-ea-black rounded-full" />
                        <span className="font-anton text-xs tracking-widest uppercase text-ea-black/70">MEMORIA CONCEPTUAL</span>
                      </div>
                      <span className="font-mono text-xs text-ea-black/50 uppercase">{project.studio}</span>
                    </div>
                    <blockquote className="font-okcok text-xl sm:text-2xl md:text-3xl uppercase leading-tight text-ea-black mb-4">
                      "{project.excerpt}"
                    </blockquote>
                    <p className="font-creato text-xs sm:text-sm text-ea-black/80 leading-relaxed">
                      {project.memory || project.resena || project.excerpt}
                    </p>
                  </div>
                </div>

                <div className="w-full overflow-hidden my-2">
                  <div ref={vKineticLine2Ref} className="inline-block whitespace-nowrap bg-white text-ea-black px-8 py-3 font-anton text-2xl sm:text-4xl md:text-5xl uppercase tracking-wider shadow-2xl border-y-2 border-ea-black">
                    {hasCriticaActive && Boolean(project.critic?.trim())
                      ? `CRÍTICA: “${project.critic.trim()}” — ${(project.excerpt || '').toUpperCase()}`
                      : `${project.studio || 'ARQUITECTURA'} — ${(project.title || '').toUpperCase()} — ${(project.location || '').toUpperCase()}`}
                  </div>
                </div>

                <div ref={vKineticLine3Ref} className="whitespace-nowrap font-okcok text-4xl sm:text-6xl md:text-7xl uppercase text-white/80 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] select-none pl-24">
                  {project.tags?.length ? project.tags.join(' • ').toUpperCase() : 'MATERIA LOCAL • RADICALIDAD ANDINA • CLIMA & COLECTIVIDAD'}
                </div>
              </div>
            </>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* D. VARIANT 2: HORIZONTAL BLINDS LAYER & LATERAL PARALLAX              */}
          {/* --------------------------------------------------------------------- */}
          {motionVariant === 'horizontal-blinds' && (
            <>
              <div
                ref={hBlindsLayerRef}
                className="absolute inset-0 w-screen h-screen overflow-hidden bg-[#0C0E12] z-20 pointer-events-none opacity-0"
              >
                {/* Horizontal Topographical Contour Watermarks */}
                <div
                  className="absolute inset-0 opacity-[0.12] pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, #ffffff, #ffffff 1px, transparent 1px, transparent 32px)',
                  }}
                />

                <div className="absolute top-8 left-8 text-white/35 font-mono text-[11px] uppercase tracking-widest">
                  [CINEMÁTICA 02: {project.motion?.kicker || 'ESTRATIGRAFÍA TOPOGRÁFICA'} • {project.ciudad?.altura ? `COTA ${project.ciudad.altura}` : project.location}]
                </div>

                {/* 4 Horizontal Bands (25vh each) */}
                <div ref={hBlind1Ref} className="absolute top-0 left-0 w-screen h-[25vh] overflow-hidden shadow-2xl border-b border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-0 left-0 w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div ref={hBlind2Ref} className="absolute top-[25vh] left-0 w-screen h-[25vh] overflow-hidden shadow-2xl border-b border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-[-25vh] left-0 w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
                <div ref={hBlind3Ref} className="absolute top-[50vh] left-0 w-screen h-[25vh] overflow-hidden shadow-2xl border-b border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-[-50vh] left-0 w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/15" />
                </div>
                <div ref={hBlind4Ref} className="absolute top-[75vh] left-0 w-screen h-[25vh] overflow-hidden shadow-2xl">
                  <img src={project.heroImage} alt="" className="absolute top-[-75vh] left-0 w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              </div>

              {/* Cross-weave Kinetic Layer: Vertical typography columns + horizontal ribbon */}
              <div
                ref={hKineticLayerRef}
                className="absolute inset-0 w-screen h-screen overflow-hidden z-30 pointer-events-none flex justify-between items-center px-12 opacity-0"
              >
                {/* Column 1 (Left vertical banner) */}
                <div
                  ref={hKineticCol1Ref}
                  className="font-okcok text-5xl sm:text-7xl md:text-8xl text-white/90 uppercase tracking-tight select-none [writing-mode:vertical-rl] rotate-180 drop-shadow-2xl"
                >
                  {project.title} • {project.location}
                </div>

                {/* Center Marquee & Quote Box */}
                <div className="flex flex-col items-center max-w-xl mx-auto z-40">
                  <div ref={hQuoteBoxRef} className="bg-white/95 text-ea-black border-2 border-ea-black p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] mb-6">
                    <span className="font-anton text-xs uppercase tracking-widest text-ea-black/60 block mb-2">
                      ESTRATIGRAFÍA CONSTRUCTIVA
                    </span>
                    <blockquote className="font-okcok text-xl sm:text-2xl uppercase leading-tight text-ea-black mb-3">
                      "{project.excerpt}"
                    </blockquote>
                    <p className="font-creato text-xs text-ea-black/80 leading-relaxed">
                      {project.memory}
                    </p>
                  </div>

                  <div ref={hKineticRibbonRef} className="bg-ea-black text-white px-8 py-3 font-anton text-xl sm:text-3xl uppercase tracking-widest border border-white/20 shadow-2xl whitespace-nowrap">
                    {project.motion?.conceptTag || 'ARQUITECTURA DE ESTRATOS'} • {project.studio} • {project.year}
                  </div>
                </div>

                {/* Column 2 (Right vertical banner) */}
                <div
                  ref={hKineticCol2Ref}
                  className="font-okcok text-4xl sm:text-6xl md:text-7xl text-white/75 uppercase tracking-tight select-none [writing-mode:vertical-rl] drop-shadow-2xl"
                >
                  {hasCriticaActive && Boolean(project.critic?.trim())
                    ? `CRÍTICA: ${project.critic.trim()}`
                    : `${project.studio || 'ARQUITECTURA'} • ${project.year || ''}`}
                </div>
              </div>
            </>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* E. VARIANT 3: QUADRANT APERTURE & 3D PERSPECTIVE ZOOM                 */}
          {/* --------------------------------------------------------------------- */}
          {motionVariant === 'quadrant-aperture' && (
            <>
              <div
                ref={qApertureLayerRef}
                className="absolute inset-0 w-screen h-screen overflow-hidden bg-[#08090C] z-20 pointer-events-none opacity-0"
              >
                {/* Central Radial Crosshair Blueprint Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.2] pointer-events-none">
                  <div className="w-[600px] h-[600px] rounded-full border border-white/30 flex items-center justify-center">
                    <div className="w-[300px] h-[300px] rounded-full border border-white/20" />
                    <div className="absolute w-full h-[1px] bg-white/20" />
                    <div className="absolute h-full w-[1px] bg-white/20" />
                  </div>
                </div>

                <div className="absolute top-8 left-8 text-white/35 font-mono text-[11px] uppercase tracking-widest">
                  [CINEMÁTICA 03: {project.motion?.kicker || 'APERTURA EN CUADRANTES 3D'} • {project.title.toUpperCase()}]
                </div>

                {/* 4 Quadrants (50vw x 50vh each) */}
                {/* Top-Left NW */}
                <div ref={qTopLeftRef} className="absolute top-0 left-0 w-[50vw] h-[50vh] overflow-hidden shadow-2xl border-r border-b border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-0 left-0 w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                {/* Top-Right NE */}
                <div ref={qTopRightRef} className="absolute top-0 left-[50vw] w-[50vw] h-[50vh] overflow-hidden shadow-2xl border-l border-b border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-0 left-[-50vw] w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
                {/* Bottom-Left SW */}
                <div ref={qBottomLeftRef} className="absolute top-[50vh] left-0 w-[50vw] h-[50vh] overflow-hidden shadow-2xl border-r border-t border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-[-50vh] left-0 w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/15" />
                </div>
                {/* Bottom-Right SE */}
                <div ref={qBottomRightRef} className="absolute top-[50vh] left-[50vw] w-[50vw] h-[50vh] overflow-hidden shadow-2xl border-l border-t border-white/10">
                  <img src={project.heroImage} alt="" className="absolute top-[-50vh] left-[-50vw] w-screen h-screen max-w-none object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              </div>

              {/* 3D Depth Zoom Typography */}
              <div
                ref={qKineticLayerRef}
                className="absolute inset-0 w-screen h-screen overflow-hidden z-30 pointer-events-none flex flex-col justify-between py-8 items-center opacity-0"
              >
                {/* Diagonal Ribbon Top */}
                <div ref={qDiagonalRibbon1Ref} className="w-full flex justify-center -rotate-3 my-2">
                  <span className="bg-white text-ea-black font-anton text-2xl sm:text-4xl uppercase px-12 py-2 shadow-2xl border-y-2 border-ea-black whitespace-nowrap">
                    {project.motion?.kicker || 'EXPLOSIÓN ÓPTICA'} // {project.studio} • {project.location}
                  </span>
                </div>

                {/* Massive Zoom Center Headline */}
                <div className="my-auto flex flex-col items-center text-center px-4">
                  <h3
                    ref={qCenterZoomTextRef}
                    className="font-okcok text-7xl sm:text-9xl md:text-[140px] uppercase tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)] leading-none select-none"
                  >
                    {project.title}
                  </h3>

                  <div ref={qCenterCardRef} className="bg-white/95 text-ea-black border-2 border-ea-black p-6 sm:p-8 max-w-xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] mt-4">
                    <p className="font-okcok text-lg sm:text-xl uppercase leading-tight text-ea-black">
                      "{project.excerpt}"
                    </p>
                  </div>
                </div>

                {/* Diagonal Ribbon Bottom */}
                <div ref={qDiagonalRibbon2Ref} className="w-full flex justify-center rotate-3 my-2">
                  <span className="bg-ea-black text-white font-okcok text-xl sm:text-3xl uppercase px-12 py-2 shadow-2xl border border-white/20 whitespace-nowrap">
                    {hasCriticaActive && Boolean(project.critic?.trim())
                      ? `CRÍTICA: “${project.critic.trim()}” • ${project.tags?.[0] || 'ESPACIO'} & ${project.tags?.[1] || 'MATERIA ANDINA'}`
                      : `${(project.title || '').toUpperCase()} • ${(project.location || '').toUpperCase()} • ${project.year || ''}`}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Settle Indicator leading into Monograph (LA CRÍTICA SALVARÁ EL MUNDO) */}
          <div
            ref={settleIndicatorRef}
            className="absolute inset-0 w-screen h-screen flex flex-col items-center justify-center z-30 pointer-events-none opacity-0 bg-white"
          >
            <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 px-6 text-center pointer-events-auto">
              {/* Illustration: LA CRÍTICA SALVARÁ EL MUNDO (Pure Vector SVG) */}
              <div className="w-[240px] sm:w-[300px] md:w-[340px] max-w-[85vw] flex items-center justify-center">
                <img
                  src={criticaSalvaraMundoSvg}
                  alt="La Crítica Salvará el Mundo"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-none"
                  draggable={false}
                />
              </div>

              {/* Button: CONTINUAR LEYENDO ↓ */}
              <button
                type="button"
                onClick={() => {
                  const el =
                    document.getElementById('dossier') ||
                    document.getElementById('folder-tabs-anchor') ||
                    document.getElementById('dossier-heading');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center gap-2.5 font-anton text-xs sm:text-[13px] tracking-widest uppercase bg-ea-black text-white px-8 py-3.5 shadow-md hover:bg-black/85 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                title="Continuar leyendo el expediente monográfico"
                data-cursor
              >
                <span>CONTINUAR LEYENDO</span>
                <span className="text-sm font-bold">↓</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MONOGRAPHIC DOSSIER & FIGMA TAPED TABS WITH STICKY SPONSOR WINGS       */}
      {/* (Only visible when arriving at this section, sticky all the way to footer)*/}
      {/* ========================================================================= */}
      <div
        ref={dossierContainerRef}
        className="relative w-full max-w-[1780px] mx-auto flex items-start justify-center gap-4 2xl:gap-8 px-2 xl:px-4"
      >
        {/* Left Sticky Skyscraper Wing */}
        <StickySponsorWings
          section="criticas"
          position="izquierdo"
          triggerRef={dossierContainerRef}
          className="mt-4"
        />

        <main
          id="dossier"
          className="flex-1 w-full min-h-screen bg-white text-ea-black pt-8 pb-32 px-4 sm:px-8 md:px-12 max-w-[1340px] min-w-0"
        >
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 sm:pb-4 border-b border-ea-border">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-3 font-anton text-xs sm:text-sm tracking-widest uppercase text-ea-black/70 hover:text-ea-black transition-colors group w-fit"
            data-cursor
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>VOLVER AL CATÁLOGO</span>
          </button>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span className="font-mono text-xs text-ea-black/50 uppercase truncate min-w-0">
              {project.location} — {project.studio}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-ea-black bg-white hover:bg-ea-black text-ea-black hover:text-white transition-all rounded-[2px] shadow-2xs font-anton text-xs tracking-wider uppercase active:scale-95 shrink-0 touch-manipulation"
              title="Compartir expediente"
              data-cursor
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>COMPARTIR</span>
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* ARCHDAILY MONOGRAPHIC DOSSIER WITH FIGMA TAPED TABS                     */}
        {/* ======================================================================= */}
        <section id="dossier-heading" className="pt-2 sm:pt-3 pb-14" style={{ scrollMarginTop: '65px' }}>
          {/* Physical Manila Dossier Folder Tabs matching SVG reference (folder_main_tabs.svg) */}
          <div id="folder-tabs-anchor" className="relative pt-0">
            <AuthenticFolderContainer
              activeTab={activeTab}
              onSelectTab={handleTabSelect}
              modules={availableModules}
            >
              {(() => {
                const currentModule =
                  availableModules.find((m) => m.id === activeTab) || availableModules[0];
                return currentModule
                  ? currentModule.renderContent({
                      project,
                      activePlanType,
                      setActivePlanType,
                      renderPlanimetryDrawing,
                      onOpenLightbox: openLightboxAt,
                    })
                  : null;
              })()}
            </AuthenticFolderContainer>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 3. DOSSIER EDITORIAL: LOCALIZACIÓN, FICHA TÉCNICA Y CRÉDITOS            */}
        {/* ======================================================================= */}
        <section className="py-14 border-t border-ea-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: LOCALIZACIÓN & PROYECTO */}
            <div className="border-2 border-ea-black p-8 md:p-10 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-ea-border mb-6">
                  <div className="flex items-center gap-3">
                    <img src={tagCiudadUrl} alt="" className="w-8 h-8 object-contain" />
                    <span className="font-anton text-2xl uppercase tracking-wider text-ea-black">
                      LOCALIZACIÓN & PROYECTO
                    </span>
                  </div>
                  <span className="font-mono text-xs text-ea-black/40">DATOS GENERALES</span>
                </div>

                <div className="space-y-4 font-creato text-sm">
                  {/* Ubicación (Sin duplicar ciudad y mostrando exactamente lo ingresado) */}
                  {Boolean(displayLocation) && (
                    <div className="flex justify-between py-2 border-b border-ea-border">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Ubicación</span>
                      <span className="font-semibold text-right">{displayLocation}</span>
                    </div>
                  )}

                  {/* Tipología / Programa */}
                  {Boolean(project.category?.trim() || project.tipologia?.trim() || project.datos?.tipologia?.trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Tipología / Programa</span>
                      <span className="font-semibold text-right">
                        {project.tipologia || project.datos?.tipologia || project.category}
                      </span>
                    </div>
                  )}

                  {/* Año de Finalización */}
                  {Boolean(project.year?.toString().trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Año de Finalización</span>
                      <span className="font-semibold text-right">{project.year}</span>
                    </div>
                  )}

                  {/* Estado de la Obra (Opcional) */}
                  {Boolean(project.estadoObra?.trim() || project.datos?.estado?.trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Estado de la Obra</span>
                      <span className="font-semibold text-right">
                        {project.estadoObra || project.datos?.estado}
                      </span>
                    </div>
                  )}

                  {/* Cliente / Encargo (OPCIONAL: solo si fue ingresado explícitamente) */}
                  {Boolean(project.cliente?.trim() || project.datos?.cliente?.trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border last:border-b-0">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Cliente / Encargo</span>
                      <span className="font-semibold text-right">
                        {(project.cliente || project.datos?.cliente)?.trim()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-ea-border">
                <p className="font-creato text-xs text-ea-black/60 leading-relaxed">
                  {project.memory || project.excerpt || `Memoria arquitectónica: intervención proyectual desarrollada en ${displayLocation || 'el territorio'}, respondiendo al paisaje, al contexto urbano y a la materialidad contemporánea.`}
                </p>
              </div>
            </div>

            {/* Card 2: FICHA TÉCNICA & CRÉDITOS */}
            <div className="border-2 border-ea-black p-8 md:p-10 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-ea-border mb-6">
                  <div className="flex items-center gap-3">
                    <img src={tagDatosUrl} alt="" className="w-8 h-8 object-contain" />
                    <span className="font-anton text-2xl uppercase tracking-wider text-ea-black">
                      FICHA TÉCNICA & CRÉDITOS
                    </span>
                  </div>
                  <span className="font-mono text-xs text-ea-black/40">EQUIPO & CONSTRUCCIÓN</span>
                </div>

                <div className="space-y-4 font-creato text-sm">
                  {/* Superficie Construida (OPCIONAL: solo si fue ingresada) */}
                  {Boolean(project.superficie?.trim() || project.datos?.superficie?.trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Superficie Construida</span>
                      <span className="font-semibold text-right">
                        {(project.superficie || project.datos?.superficie)?.trim()}
                      </span>
                    </div>
                  )}

                  {/* Sistema Estructural (OPCIONAL: solo si fue ingresado) */}
                  {Boolean(project.datos?.estructura?.trim() || project.sistemaEstructural?.trim() || project.materialidadPrincipal?.trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Sistema Estructural</span>
                      <span className="font-semibold text-right">
                        {(project.datos?.estructura || project.sistemaEstructural || project.materialidadPrincipal)?.trim()}
                      </span>
                    </div>
                  )}

                  {/* Equipo / Colaboradores (OPCIONAL: solo si fue ingresado) */}
                  {Boolean(project.colaboradores?.trim() || project.datos?.colaboradores?.trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Equipo / Colaboradores</span>
                      <span className="font-semibold text-right max-w-[60%]">
                        {(project.colaboradores || project.datos?.colaboradores)?.trim()}
                      </span>
                    </div>
                  )}

                  {/* Fotografía / Registro (OPCIONAL: solo si existe fotógrafo) */}
                  {Boolean(project.datos?.fotografia?.trim() || project.photographer?.trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Fotografía / Registro</span>
                      <span className="font-semibold text-right">
                        {(project.datos?.fotografia || project.photographer)?.trim()}
                      </span>
                    </div>
                  )}

                  {/* Ingeniería / Cálculo (OPCIONAL: solo si fue ingresada) */}
                  {Boolean(project.datos?.ingenieria?.trim() || project.datos?.calculoEstructural?.trim() || project.ingenieria?.trim()) && (
                    <div className="flex justify-between py-2 border-b border-ea-border last:border-b-0">
                      <span className="text-ea-black/60 uppercase text-xs font-mono">Ingeniería / Cálculo</span>
                      <span className="font-semibold text-right">
                        {(project.datos?.ingenieria || project.datos?.calculoEstructural || project.ingenieria)?.trim()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-ea-border flex justify-between items-center flex-wrap gap-2">
                <span className="text-xs font-mono text-ea-black/50">
                  {studiosList.length > 1 ? 'ESTUDIOS / AUTORÍA:' : 'ESTUDIO / AUTORÍA:'}
                </span>
                <span className="font-anton text-sm tracking-wider uppercase text-ea-black">
                  {studiosList.length > 1 ? studiosList.join(' + ') : (project.studio || 'ESTUDIO')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* ESPACIO PUBLICITARIO: DOSSIER EDITORIAL INTER-MÓDULO                     */}
        {/* ======================================================================= */}
        {dossierAd && (
          <div className="my-10 flex justify-center w-full">
            <InFeedProjectAdCard
              campaign={dossierAd}
              brand={getBrandById(dossierAd.brandId)}
              layoutVariant="panoramic-card"
            />
          </div>
        )}

        {/* ======================================================================= */}
        {/* COMPARTIR / DIFUSIÓN ARQUITECTÓNICA BANNER                               */}
        {/* ======================================================================= */}
        <div className="my-10 p-6 sm:p-8 bg-[#F6F5F2] border-2 border-ea-black rounded-[2px] shadow-[4px_4px_0px_#000000]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ea-black" />
                <span className="font-mono text-[10px] tracking-widest uppercase text-ea-black/60">
                  DIFUSIÓN ARQUITECTÓNICA // ARCHIVO ECUATORIANO
                </span>
              </div>
              <h3 className="font-anton text-lg sm:text-2xl uppercase tracking-wide text-ea-black">
                ¿Te inspiró esta obra? Compártela con tu red
              </h3>
              <p className="font-creato text-xs sm:text-sm text-ea-black/70 max-w-xl">
                Impulsa la arquitectura ecuatoriana enviando este expediente monográfico a colegas, estudiantes o a tu despacho vía WhatsApp, LinkedIn, X o código QR.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={handleShare}
                className="w-full md:w-auto justify-center inline-flex items-center gap-2.5 px-5 py-3.5 bg-ea-black text-white hover:bg-[#222] font-anton text-xs sm:text-sm tracking-wider uppercase rounded-[2px] shadow-[3px_3px_0px_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.35)] transition-all active:scale-98 cursor-pointer touch-manipulation"
                data-cursor
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>COMPARTIR EXPEDIENTE</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. CONTINUAR EXPLORANDO OTROS PROYECTOS (CARRUSEL INTERACTIVO)         */}
        {/* ======================================================================= */}
        <section className="pt-14 border-t border-ea-border relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-ea-black rounded-full" />
              <span className="font-anton text-xs sm:text-sm tracking-widest uppercase text-ea-black/60">
                {projectSection === 'territorios'
                  ? 'EXPEDIENTES TERRITORIALES'
                  : projectSection === 'academia'
                  ? 'INVESTIGACIONES ACADÉMICAS'
                  : 'CONTINUAR EXPLORANDO'}
              </span>
              <span className="font-mono text-xs text-ea-black/40 font-bold">
                [{relatedProjects.length} {projectSection === 'territorios' ? 'EXPEDIENTES' : projectSection === 'academia' ? 'INVESTIGACIONES' : 'PROYECTOS RELACIONADOS'}]
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="font-anton text-xs tracking-widest uppercase underline text-ea-black hover:opacity-70 whitespace-nowrap"
                data-cursor
              >
                VER TODOS LOS PROYECTOS ({projects.length})
              </button>

              {/* Navigation Flechitas (Header Controls) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollRelatedPrev}
                  className="w-9 h-9 rounded-full border-2 border-ea-black flex items-center justify-center text-ea-black bg-white hover:bg-ea-black hover:text-white active:scale-95 transition-all shadow-2xs cursor-pointer"
                  aria-label="Proyecto anterior"
                  title="Anterior"
                  data-cursor
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={scrollRelatedNext}
                  className="w-9 h-9 rounded-full border-2 border-ea-black flex items-center justify-center text-ea-black bg-white hover:bg-ea-black hover:text-white active:scale-95 transition-all shadow-2xs cursor-pointer"
                  aria-label="Siguiente proyecto"
                  title="Siguiente"
                  data-cursor
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Track with lateral floating arrows on large screens */}
          <div className="relative group/carousel">
            {/* Floating Left Arrow (Desktop) */}
            <button
              type="button"
              onClick={scrollRelatedPrev}
              className="hidden xl:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border-2 border-ea-black bg-white text-ea-black items-center justify-center shadow-lg hover:bg-ea-black hover:text-white active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
              aria-label="Proyecto anterior"
              data-cursor
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Scrollable Track */}
            <div
              ref={relatedCarouselRef}
              className="flex items-stretch gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth py-2 px-0.5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedProjects.map((other, idx) => (
                <div
                  key={other.id}
                  className="shrink-0 w-full lg:w-[calc(50%-12px)] snap-start flex"
                >
                  <PanoramicFolderCard
                    project={other as any}
                    index={idx}
                    onSelect={(id) => onSelectProject && onSelectProject(id)}
                  />
                </div>
              ))}
            </div>

            {/* Floating Right Arrow (Desktop) */}
            <button
              type="button"
              onClick={scrollRelatedNext}
              className="hidden xl:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border-2 border-ea-black bg-white text-ea-black items-center justify-center shadow-lg hover:bg-ea-black hover:text-white active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
              aria-label="Siguiente proyecto"
              data-cursor
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DISCRETE BOTTOM SECONDARY NAVIGATION BAR (Reseñas, Crítica, Podcast, Notas) */}
        {/* ========================================================================= */}
        <aside
          id="secondary-bottom-navbar"
          className={`fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] select-none transition-all duration-300 ease-out ${
            isBottomNavVisible
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
          aria-label="Navegación secundaria de expediente"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-md border-2 border-ea-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-2 sm:px-3 py-1.5 rounded-[2px]">
            <div className="hidden lg:flex items-center gap-1.5 border-r border-ea-border pr-2.5 mr-1 text-[10px] font-mono text-ea-black/50 uppercase tracking-widest whitespace-nowrap">
              <span>EA • PROYECTOS</span>
            </div>

            {availableModules.map((mod) => {
              const isSelected =
                activeTab === mod.id ||
                (!availableModules.some((m) => m.id === activeTab) &&
                  mod.id === availableModules[0]?.id);
              return (
                <button
                  key={mod.id}
                  id={`bottom-nav-${mod.id}`}
                  onClick={() => handleSelectCategory(mod.id)}
                  className={`px-2.5 sm:px-3 py-1 font-anton text-[10.5px] sm:text-[11.5px] tracking-wider uppercase transition-all rounded-[2px] whitespace-nowrap ${
                    isSelected
                      ? 'bg-ea-black text-white shadow-2xs'
                      : 'text-ea-black/60 hover:text-ea-black hover:bg-black/5'
                  }`}
                  data-cursor
                >
                  {mod.shortTitle ? (
                    <>
                      <span className="sm:hidden">{mod.shortTitle}</span>
                      <span className="hidden sm:inline">{mod.navLabel}</span>
                    </>
                  ) : (
                    mod.navLabel
                  )}
                </button>
              );
            })}

            <div className="border-l border-ea-border pl-1.5 ml-1 flex items-center">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 min-h-[30px] font-anton text-[10.5px] sm:text-[11.5px] tracking-wider uppercase text-ea-black/70 hover:text-white hover:bg-ea-black rounded-[2px] transition-colors touch-manipulation active:scale-95"
                title="Compartir este expediente"
                aria-label="Compartir este expediente"
                data-cursor
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">COMPARTIR</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

        {/* Right Sticky Skyscraper Wing */}
        <StickySponsorWings
          section="criticas"
          position="derecho"
          triggerRef={dossierContainerRef}
          className="mt-4"
        />
      </div>

      {/* Author Profile Dossier Modal */}
      <AuthorProfileModal
        studioName={selectedAuthorName || project.studio || ''}
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        allProjects={allProjects}
        onSelectProject={onSelectProject}
        currentProjectId={project.id}
      />

      {/* Photographer Profile Dossier Modal */}
      <PhotographerProfileModal
        photographerName={selectedPhotographerName || project.datos?.fotografia || project.photographer || 'BICUBIK PHOTOGRAPHY'}
        isOpen={isPhotographerModalOpen}
        onClose={() => setIsPhotographerModalOpen(false)}
        allProjects={allProjects}
        onSelectProject={onSelectProject}
        currentProjectId={project.id}
      />

      {/* Construction Team & Master Builders Recognition Modal */}
      {Boolean(constructionTeam) && (
        <ConstructionTeamModal
          project={project}
          isOpen={isConstructionTeamModalOpen}
          onClose={() => setIsConstructionTeamModalOpen(false)}
        />
      )}

      {/* Fullscreen Architectural Image Carousel Lightbox */}
      <ImageCarouselLightbox
        isOpen={isLightboxOpen}
        images={allProjectImages}
        initialIndex={lightboxInitialIndex}
        projectTitle={project.title}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* Universal Multi-Channel Share Project Modal */}
      <ShareProjectModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={project}
      />
    </div>
  );
};
