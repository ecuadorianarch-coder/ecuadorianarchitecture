import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useContent } from '../../context/ContentContext';
import { Search, X, LayoutGrid, Rows3, Check } from 'lucide-react';
import compLugarUrl from '../../assets/logos/comp_lugar.svg';
import compAutorUrl from '../../assets/logos/comp_autor.svg';
import compCriticaUrl from '../../assets/logos/comp_critica.svg';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';
import tagAcademicoUrl from '../../assets/logos/tag_academico.svg';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagTesisUrl from '../../assets/logos/tag_tesis.svg';
import tagEstudiosUrl from '../../assets/logos/tag_estudios.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import logoUrl from '../../assets/logos/logo.svg';

import { OrigamiFolderCard } from '../../components/projects/OrigamiFolderCard';
import { NotebookCard, AcademiaItemData } from '../../components/projects/NotebookCard';
import { FolderTabCard, TerritorioItemData } from '../../components/projects/FolderTabCard';
import { PanoramicFolderCard } from '../../components/projects/PanoramicFolderCard';
import { StickySponsorWings } from '../../components/advertising/StickySponsorWings';
import { InFeedProjectAdCard } from '../../components/advertising/InFeedProjectAdCard';
import { useAdvertising } from '../../context/AdvertisingContext';
import { EditorialEmptyState } from '../../components/common/EditorialEmptyState';

import academiaJson from '../../data/academia.json';
import territoriosJson from '../../data/territorios.json';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type CatalogSectionType = 'proyectos' | 'academia' | 'territorios';

interface ProjectsCatalogProps {
  initialSection?: CatalogSectionType;
  onSelectProject: (projectId: string) => void;
  onNavigate?: (section: string) => void;
  onSectionChange?: (section: CatalogSectionType) => void;
}

export const ProjectsCatalog: React.FC<ProjectsCatalogProps> = ({
  initialSection = 'proyectos',
  onSelectProject,
  onNavigate,
  onSectionChange,
}) => {
  const { projects, academia, territorios } = useContent();
  const { getPlacementConfig, getEligibleCampaigns, getBrandById } = useAdvertising();
  const inFeedConfig = getPlacementConfig('entre-proyectos');
  const eligibleInFeedCampaigns = getEligibleCampaigns('entre-proyectos');
  const inFeedFrequency = Math.max(1, inFeedConfig?.frequency || 3);
  const [currentSection, setCurrentSection] = useState<CatalogSectionType>(initialSection);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with prop if it changes
  useEffect(() => {
    if (initialSection) {
      setCurrentSection(initialSection);
      setSearchQuery('');
    }
  }, [initialSection]);

  // Listen to hash changes for direct deep linking
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#academia') {
        setCurrentSection('academia');
      } else if (h === '#territorios' || h === '#territorio') {
        setCurrentSection('territorios');
      } else if (h === '#proyectos' || h === '#catalogo') {
        setCurrentSection('proyectos');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Responsive mobile/adaptive detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSearchExpanded(false);
        setActiveFilterSheet(null);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter dropdown state (desktop)
  const [isLugarMenuOpen, setIsLugarMenuOpen] = useState(false);
  const [isAutorMenuOpen, setIsAutorMenuOpen] = useState(false);
  const [isCriticaMenuOpen, setIsCriticaMenuOpen] = useState(false);
  const [isUniversidadMenuOpen, setIsUniversidadMenuOpen] = useState(false);
  const [isProblematicaMenuOpen, setIsProblematicaMenuOpen] = useState(false);
  const [isSituacionMenuOpen, setIsSituacionMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  // Exterior Mobile Action Drawer State (Portal to document.body)
  interface FilterSheetConfig {
    id: string;
    title: string;
    icon?: string;
    options: string[];
    selected: string | null;
    onSelect: (val: string | null) => void;
    allLabel: string;
  }
  const [activeFilterSheet, setActiveFilterSheet] = useState<FilterSheetConfig | null>(null);
  const [sheetSearch, setSheetSearch] = useState('');

  // Mobile Expanded Search Overlay State
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const expandedInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus expanded input when search overlay opens
  useEffect(() => {
    if (isSearchExpanded) {
      const timer = setTimeout(() => {
        expandedInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isSearchExpanded]);

  // Lock body scroll when mobile filter sheet or expanded search is active
  useEffect(() => {
    if (activeFilterSheet || isSearchExpanded) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeFilterSheet, isSearchExpanded]);

  // Close menus or search overlay on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveFilterSheet(null);
        setIsSearchExpanded(false);
        closeAllMenus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openFilterSheet = (
    id: string,
    title: string,
    icon: string | undefined,
    options: string[],
    selected: string | null,
    onSelect: (val: string | null) => void,
    allLabel: string
  ) => {
    closeAllMenus();
    setSheetSearch('');
    setActiveFilterSheet({
      id,
      title,
      icon,
      options,
      selected,
      onSelect,
      allLabel,
    });
  };

  // Selected filters for Proyectos
  const [selectedLugar, setSelectedLugar] = useState<string | null>(null);
  const [selectedAutor, setSelectedAutor] = useState<string | null>(null);
  const [selectedCritica, setSelectedCritica] = useState<string | null>(null);

  // Selected filters for Academia
  const [selectedUniversidad, setSelectedUniversidad] = useState<string | null>(null);
  const [selectedAcademiaProblematica, setSelectedAcademiaProblematica] = useState<string | null>(null);
  const [selectedSituacion, setSelectedSituacion] = useState<string | null>(null);

  // Selected filters for Territorio
  const [selectedTerritorioLugar, setSelectedTerritorioLugar] = useState<string | null>(null);
  const [selectedTerritorioProblematica, setSelectedTerritorioProblematica] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'hybrid' | 'grid' | 'panoramic'>('hybrid');

  // Change section helper
  const handleSwitchSection = (section: CatalogSectionType) => {
    setCurrentSection(section);
    setIsNavMenuOpen(false);
    setSearchQuery('');
    window.location.hash = `#${section}`;
    if (onSectionChange) onSectionChange(section);
  };

  const clearAllFilters = () => {
    setSelectedLugar(null);
    setSelectedAutor(null);
    setSelectedCritica(null);
    setSelectedUniversidad(null);
    setSelectedAcademiaProblematica(null);
    setSelectedSituacion(null);
    setSelectedTerritorioLugar(null);
    setSelectedTerritorioProblematica(null);
    setSearchQuery('');
  };

  // Close menus when clicking outside
  const closeAllMenus = () => {
    setIsLugarMenuOpen(false);
    setIsAutorMenuOpen(false);
    setIsCriticaMenuOpen(false);
    setIsUniversidadMenuOpen(false);
    setIsProblematicaMenuOpen(false);
    setIsSituacionMenuOpen(false);
    setActiveFilterSheet(null);
    setIsSearchExpanded(false);
  };

  // =========================================================================
  // 1. DATASETS & FILTERING
  // =========================================================================

  // Helper for accent-insensitive search
  const normalize = (str?: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const q = normalize(searchQuery);

  // --- PROYECTOS DATA ---
  const publishedProjects = useMemo(
    () => projects.filter((p) => p.status === 'published' || !p.status),
    [projects]
  );
  const lugares = useMemo(
    () => Array.from(new Set(publishedProjects.map((p) => p.location).filter(Boolean))),
    [publishedProjects]
  );
  const autores = useMemo(
    () => Array.from(new Set(publishedProjects.map((p) => p.studio).filter(Boolean))),
    [publishedProjects]
  );
  const criticos = useMemo(
    () => Array.from(new Set(publishedProjects.map((p) => p.critic).filter(Boolean))),
    [publishedProjects]
  );

  const filteredProjects = useMemo(() => {
    return publishedProjects.filter((p) => {
      const matchesSearch =
        q === '' ||
        normalize(p.title).includes(q) ||
        normalize(p.studio).includes(q) ||
        normalize(p.location).includes(q) ||
        normalize(p.excerpt).includes(q) ||
        normalize(p.critic).includes(q);

      const matchesLugar = !selectedLugar || p.location === selectedLugar;
      const matchesAutor = !selectedAutor || p.studio === selectedAutor;
      const matchesCritica = !selectedCritica || p.critic === selectedCritica;

      return matchesSearch && matchesLugar && matchesAutor && matchesCritica;
    });
  }, [publishedProjects, q, selectedLugar, selectedAutor, selectedCritica]);

  // --- ACADEMIA DATA ---
  const academiaList = useMemo(
    () => (academia || academiaJson) as AcademiaItemData[],
    [academia]
  );
  const universidades = useMemo(
    () => Array.from(new Set(academiaList.map((a) => a.universidad).filter(Boolean))),
    [academiaList]
  );
  const academiaProblematicas = useMemo(
    () => Array.from(new Set(academiaList.map((a) => a.problematica).filter(Boolean))),
    [academiaList]
  );
  const situaciones = useMemo(
    () => Array.from(new Set(academiaList.map((a) => a.situacion).filter(Boolean))),
    [academiaList]
  );

  const filteredAcademia = useMemo(() => {
    return academiaList.filter((a) => {
      const matchesSearch =
        q === '' ||
        normalize(a.title).includes(q) ||
        normalize(a.institution).includes(q) ||
        normalize(a.universidad).includes(q) ||
        normalize(a.problematica).includes(q) ||
        normalize(a.situacion).includes(q) ||
        normalize(a.location).includes(q) ||
        normalize(a.excerpt).includes(q);

      const matchesUniv = !selectedUniversidad || a.universidad === selectedUniversidad;
      const matchesProb = !selectedAcademiaProblematica || a.problematica === selectedAcademiaProblematica;
      const matchesSit = !selectedSituacion || a.situacion === selectedSituacion;

      return matchesSearch && matchesUniv && matchesProb && matchesSit;
    });
  }, [academiaList, q, selectedUniversidad, selectedAcademiaProblematica, selectedSituacion]);

  // --- TERRITORIOS DATA ---
  const territoriosList = useMemo(
    () => (territorios || territoriosJson) as TerritorioItemData[],
    [territorios]
  );
  const territorioLugares = useMemo(
    () =>
      Array.from(
        new Set([...territoriosList.map((t) => t.location), ...territoriosList.map((t) => t.region)].filter(Boolean))
      ),
    [territoriosList]
  );
  const territorioProblematicas = useMemo(
    () => Array.from(new Set(territoriosList.map((t) => t.problematica).filter(Boolean))),
    [territoriosList]
  );

  const filteredTerritorios = useMemo(() => {
    return territoriosList.filter((t) => {
      const matchesSearch =
        q === '' ||
        normalize(t.title).includes(q) ||
        normalize(t.studio).includes(q) ||
        normalize(t.region).includes(q) ||
        normalize(t.location).includes(q) ||
        normalize(t.problematica).includes(q) ||
        normalize(t.excerpt).includes(q);

      const matchesLugar =
        !selectedTerritorioLugar ||
        t.location === selectedTerritorioLugar ||
        t.region === selectedTerritorioLugar;
      const matchesProb =
        !selectedTerritorioProblematica || t.problematica === selectedTerritorioProblematica;

      return matchesSearch && matchesLugar && matchesProb;
    });
  }, [territoriosList, q, selectedTerritorioLugar, selectedTerritorioProblematica]);

  // Active filters check
  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedLugar ||
      selectedAutor ||
      selectedCritica ||
      selectedUniversidad ||
      selectedAcademiaProblematica ||
      selectedSituacion ||
      selectedTerritorioLugar ||
      selectedTerritorioProblematica
  );

  // Filtered options for mobile filter sheet
  const filteredSheetOptions = activeFilterSheet
    ? activeFilterSheet.options.filter((opt) =>
        sheetSearch ? normalize(opt).includes(normalize(sheetSearch)) : true
      )
    : [];

  // Section-specific configuration
  const sectionConfig = {
    proyectos: {
      title: 'PROYECTOS',
      tagIcon: tagProyectosUrl,
      placeholder: 'proyecto, arquitecto, crítico...',
      countLabel: `${filteredProjects.length} PROYECTOS REGISTRADOS`,
      emptyMessage: 'NO SE ENCONTRARON PROYECTOS CON ESOS CRITERIOS',
      archiveTitle: 'ARCHIVO HISTÓRICO & EXPEDIENTES',
    },
    academia: {
      title: 'ACADEMIA',
      tagIcon: tagAcademicoUrl,
      placeholder: 'universidad, investigación, tesis...',
      countLabel: `${filteredAcademia.length} INVESTIGACIONES REGISTRADAS`,
      emptyMessage: 'NO SE ENCONTRARON INVESTIGACIONES CON ESOS CRITERIOS',
      archiveTitle: 'ARCHIVO HISTÓRICO & EXPEDIENTES ACADÉMICOS',
    },
    territorios: {
      title: 'TERRITORIO',
      tagIcon: tagCiudadUrl,
      placeholder: 'territorio, región, problemática...',
      countLabel: `${filteredTerritorios.length} EXPEDIENTES TERRITORIALES REGISTRADOS`,
      emptyMessage: 'NO SE ENCONTRARON EXPEDIENTES TERRITORIALES CON ESOS CRITERIOS',
      archiveTitle: 'EXPEDIENTES TERRITORIALES & CARTOGRAFÍA',
    },
  }[currentSection];

  // Current live matches for expanded mobile search
  const currentMatches =
    currentSection === 'proyectos'
      ? filteredProjects
      : currentSection === 'academia'
      ? filteredAcademia
      : filteredTerritorios;

  // Search quick suggestions for empty state
  const searchSuggestions = {
    proyectos: ['QUITO', 'CUENCA', 'RAMA ESTUDIO', 'AL BORDE', 'VIVIENDA', 'EDIFICIO ATRIUM', 'PUEMBO'],
    academia: ['USFQ', 'PUCE', 'HABITAT', 'PATRIMONIO', 'VIVIENDA', 'URBANISMO'],
    territorios: ['QUITO', 'SIERRA', 'COSTA', 'AMAZONÍA', 'MOVILIDAD', 'ESPACIO PÚBLICO'],
  }[currentSection];

  const catalogRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Physical Dynamics:
  // Folders fall and tilt organically under simulated gravity as user scrolls down,
  // and smoothly reconstruct / return to their pristine resting alignment when scrolling back up.
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced || !catalogRef.current) return;

      const wrappers = gsap.utils.toArray<HTMLElement>('.gravity-card-wrapper');
      if (wrappers.length === 0) return;

      // Ensure cards are clean at resting state
      gsap.set(wrappers, { opacity: 1, y: 0, rotationZ: 0, rotationX: 0 });

      // Scroll-driven gravity physics with bidirectional scrub
      wrappers.forEach((wrapper, i) => {
        const col = i % 3;
        // As user scrolls down past the cards, gravity pulls each folder downwards with natural tilt
        const dropY = 90 + col * 32;
        const tiltZ = col === 0 ? -7 : col === 1 ? 2.5 : 8;
        const tiltX = 10 + col * 4;

        gsap.to(wrapper, {
          y: dropY,
          rotationZ: tiltZ,
          rotationX: tiltX,
          opacity: 0.75,
          ease: 'power1.in',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 32%',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      });

      // Subtle dynamic settling for panoramic archive cards
      const archiveCards = gsap.utils.toArray<HTMLElement>('.panoramic-archive-card');
      archiveCards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 35, opacity: 0.6 },
          {
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 65%',
              scrub: 1,
            },
          }
        );
      });
    },
    {
      scope: catalogRef,
      dependencies: [
        currentSection,
        viewMode,
        searchQuery,
        selectedLugar,
        selectedAutor,
        selectedCritica,
        selectedUniversidad,
        selectedAcademiaProblematica,
        selectedSituacion,
        selectedTerritorioLugar,
        selectedTerritorioProblematica,
      ],
    }
  );

  // Helper to interleave projects with in-feed editorial sponsor cards based on frequency
  const renderProjectsWithAds = (
    projectsList: typeof filteredProjects,
    isPanoramic: boolean = false,
    startIndexOffset: number = 0
  ) => {
    if (!inFeedConfig?.active || eligibleInFeedCampaigns.length === 0) {
      return projectsList.map((proj, idx) => (
        <div
          key={proj.id}
          className={
            isPanoramic
              ? 'panoramic-archive-card will-change-transform w-full h-full flex'
              : 'gravity-card-wrapper will-change-transform'
          }
        >
          {isPanoramic ? (
            <PanoramicFolderCard
              project={proj}
              index={idx + startIndexOffset}
              onSelect={onSelectProject}
            />
          ) : (
            <OrigamiFolderCard
              project={proj}
              index={idx + startIndexOffset}
              onSelect={onSelectProject}
            />
          )}
        </div>
      ));
    }

    const elements: React.ReactNode[] = [];
    let adCounter = 0;

    projectsList.forEach((proj, idx) => {
      elements.push(
        <div
          key={proj.id}
          className={
            isPanoramic
              ? 'panoramic-archive-card will-change-transform w-full h-full flex'
              : 'gravity-card-wrapper will-change-transform'
          }
        >
          {isPanoramic ? (
            <PanoramicFolderCard
              project={proj}
              index={idx + startIndexOffset}
              onSelect={onSelectProject}
            />
          ) : (
            <OrigamiFolderCard
              project={proj}
              index={idx + startIndexOffset}
              onSelect={onSelectProject}
            />
          )}
        </div>
      );

      // Check if we should insert an in-feed ad card
      if ((idx + 1) % inFeedFrequency === 0) {
        const campaign = eligibleInFeedCampaigns[adCounter % eligibleInFeedCampaigns.length];
        const brand = getBrandById(campaign.brandId);
        elements.push(
          <div
            key={`ad-${campaign.id}-${idx}`}
            className={
              isPanoramic
                ? 'panoramic-archive-card will-change-transform w-full h-full flex'
                : 'gravity-card-wrapper will-change-transform flex justify-center'
            }
          >
            <InFeedProjectAdCard
              campaign={campaign}
              brand={brand}
              layoutVariant={isPanoramic ? 'panoramic-card' : 'vertical-card'}
            />
          </div>
        );
        adCounter++;
      }
    });

    return elements;
  };

  return (
    <div className="relative w-full min-h-screen bg-white">
      {/* 
        SISTEMA DE PAUTA & SKYSCRAPERS STICKY EDITORIALES:
        - Visible exclusivamente en viewports grandes (>= 1280px / xl)
        - Oculto al 100% en móvil y tablet para preservar lectura
      */}
      <div className="w-full max-w-[1780px] mx-auto flex items-start justify-center gap-4 2xl:gap-8 px-2 xl:px-4">
        {/* Left Sticky Skyscraper Wing */}
        <StickySponsorWings
          section={currentSection}
          position="izquierdo"
          className="mt-28 mb-8"
        />

        {/* Central Projects Catalog Column */}
        <div
          ref={catalogRef}
          onClick={closeAllMenus}
          className="flex-1 w-full min-h-screen pt-8 sm:pt-12 pb-24 px-4 sm:px-8 md:px-12 max-w-[1340px] select-none min-w-0"
        >
      {/* ========================================================================= */}
      {/* 1. EXACT FIGMA NAVBAR FOR CURRENT SECTION                                  */}
      {/* ========================================================================= */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-6">
        {/* Left: [ea] logo doodle + SECTION in OKCOK font + doodle tag + caret v */}
        <div className="flex items-center gap-3 sm:gap-4 relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="group transition-transform hover:scale-105 focus:outline-none"
            title="Volver al inicio"
            data-cursor
          >
            <img
              src={logoUrl}
              alt="Ecuadorian Architecture"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
            />
          </button>

          <div className="flex items-center gap-2 relative">
            <h1 className="font-okcok text-[clamp(1.5rem,6vw,2.625rem)] uppercase text-ea-black tracking-normal leading-[1.2] py-0.5 inline-block overflow-visible whitespace-nowrap">
              {sectionConfig.title}
            </h1>
            <img
              src={sectionConfig.tagIcon}
              alt=""
              className="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0 inline-block ml-0.5 sm:ml-1"
            />
            <button
              onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
              className="font-okcok text-xl sm:text-2xl text-ea-black/60 hover:text-black transition-colors ml-0.5 focus:outline-none p-1 min-h-[44px] min-w-[32px] flex items-center justify-center"
              title="Explorar secciones"
              data-cursor
            >
              v
            </button>

            {/* Quick-Nav Dropdown menu under caret v */}
            {isNavMenuOpen && (
              <div className="absolute top-full left-12 mt-2 bg-white border border-ea-black shadow-xl z-50 py-2 min-w-[200px] rounded-sm">
                <button
                  onClick={() => {
                    setIsNavMenuOpen(false);
                    onNavigate && onNavigate('home');
                  }}
                  className="w-full px-4 py-2 text-left font-anton text-xs tracking-wider uppercase hover:bg-ea-offwhite transition-colors"
                >
                  01 — INICIO / HERO
                </button>
                <button
                  onClick={() => handleSwitchSection('proyectos')}
                  className={`w-full px-4 py-2 text-left font-anton text-xs tracking-wider uppercase hover:bg-ea-offwhite transition-colors flex justify-between items-center ${
                    currentSection === 'proyectos' ? 'bg-ea-offwhite font-bold' : ''
                  }`}
                >
                  <span>02 — PROYECTOS</span>
                  {currentSection === 'proyectos' && <span>✓</span>}
                </button>
                <button
                  onClick={() => handleSwitchSection('territorios')}
                  className={`w-full px-4 py-2 text-left font-anton text-xs tracking-wider uppercase hover:bg-ea-offwhite transition-colors flex justify-between items-center ${
                    currentSection === 'territorios' ? 'bg-ea-offwhite font-bold' : ''
                  }`}
                >
                  <span>03 — TERRITORIO</span>
                  {currentSection === 'territorios' && <span>✓</span>}
                </button>
                <button
                  onClick={() => handleSwitchSection('academia')}
                  className={`w-full px-4 py-2 text-left font-anton text-xs tracking-wider uppercase hover:bg-ea-offwhite transition-colors flex justify-between items-center ${
                    currentSection === 'academia' ? 'bg-ea-offwhite font-bold' : ''
                  }`}
                >
                  <span>04 — ACADEMIA</span>
                  {currentSection === 'academia' && <span>✓</span>}
                </button>
                <button
                  onClick={() => {
                    setIsNavMenuOpen(false);
                    onNavigate && onNavigate('acerca');
                  }}
                  className="w-full px-4 py-2 text-left font-anton text-xs tracking-wider uppercase hover:bg-ea-offwhite transition-colors"
                >
                  05 — ACERCA DE EA
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Hand-drawn Search Box (Expands to Fullscreen Overlay on Mobile) */}
        <div
          className="relative w-full sm:w-[320px] md:w-[360px] focus-within:md:w-[420px] max-w-full transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            if (isMobile) {
              setIsSearchExpanded(true);
            }
          }}
        >
          <div className="flex items-center justify-between px-4 h-[48px] bg-white border-2 border-ea-black rounded-[14px] shadow-[1px_2px_0px_rgba(0,0,0,0.85)] hover:shadow-[1px_3px_0px_rgba(0,0,0,0.95)] transition-all cursor-pointer sm:cursor-text">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (isMobile) {
                  setIsSearchExpanded(true);
                }
              }}
              readOnly={isMobile}
              placeholder={sectionConfig.placeholder}
              className="w-full bg-transparent font-creato text-xs sm:text-[13px] text-ea-black placeholder:text-ea-black/45 focus:outline-none cursor-pointer sm:cursor-text"
              data-cursor
            />

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="p-1 text-ea-black/50 hover:text-ea-black transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              )}
              <Search className="w-5 h-5 text-ea-black stroke-[2.2]" />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. EXACT FIGMA FILTER PILL BAR FOR EACH ELEMENT                            */}
      {/* ========================================================================= */}
      <section className="w-full my-6" onClick={(e) => e.stopPropagation()}>
        <div className="w-full bg-[#F0EEEA] rounded-full py-2 sm:py-2.5 px-4 sm:px-8 md:px-12 border border-ea-black/10 flex items-center justify-start sm:justify-around gap-4 sm:gap-6 md:gap-8 shadow-2xs relative overflow-x-auto md:overflow-visible no-scrollbar whitespace-nowrap">
          {/* ======================= CASE A: PROYECTOS ======================= */}
          {currentSection === 'proyectos' && (
            <>
              {/* 1. LUGAR */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      openFilterSheet('lugar', 'LUGAR', compLugarUrl, lugares, selectedLugar, setSelectedLugar, 'Todos los lugares');
                    } else {
                      setIsLugarMenuOpen(!isLugarMenuOpen);
                      setIsAutorMenuOpen(false);
                      setIsCriticaMenuOpen(false);
                    }
                  }}
                  className={`py-1.5 px-2 sm:px-2.5 flex items-center gap-1.5 font-okcok text-sm sm:text-base uppercase tracking-wide transition-all focus:outline-none hover:scale-105 shrink-0 ${
                    selectedLugar ? 'text-ea-black font-bold' : 'text-ea-black/85 hover:text-black'
                  }`}
                  data-cursor
                >
                  <img src={compLugarUrl} alt="Lugar" className="h-4 sm:h-4.5 w-auto object-contain shrink-0 select-none pointer-events-none" />
                  {selectedLugar && (
                    <span className="font-anton text-[10px] sm:text-[11px] tracking-wider ml-1.5 bg-ea-black text-white px-2 sm:px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs shrink-0 select-none">
                      <span className="max-w-[90px] sm:max-w-[140px] truncate">{selectedLugar}</span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLugar(null);
                        }}
                        className="hover:text-red-300 ml-0.5 cursor-pointer flex items-center justify-center"
                        title="Quitar filtro"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    </span>
                  )}
                </button>

                {isLugarMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-ea-black shadow-xl z-50 py-1.5 min-w-[170px] rounded-sm">
                    <button
                      onClick={() => {
                        setSelectedLugar(null);
                        setIsLugarMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center"
                    >
                      <span>Todos los lugares</span>
                      {!selectedLugar && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                    {lugares.map((lugar) => (
                      <button
                        key={lugar}
                        onClick={() => {
                          setSelectedLugar(lugar);
                          setIsLugarMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center ${
                          selectedLugar === lugar ? 'font-bold bg-ea-offwhite' : ''
                        }`}
                      >
                        <span>{lugar}</span>
                        {selectedLugar === lugar && <span className="text-[10px] font-mono">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. AUTOR */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      openFilterSheet('autor', 'AUTOR', compAutorUrl, autores, selectedAutor, setSelectedAutor, 'Todos los autores');
                    } else {
                      setIsAutorMenuOpen(!isAutorMenuOpen);
                      setIsLugarMenuOpen(false);
                      setIsCriticaMenuOpen(false);
                    }
                  }}
                  className={`py-1.5 px-2 sm:px-2.5 flex items-center gap-1.5 font-okcok text-sm sm:text-base uppercase tracking-wide transition-all focus:outline-none hover:scale-105 shrink-0 ${
                    selectedAutor ? 'text-ea-black font-bold' : 'text-ea-black/85 hover:text-black'
                  }`}
                  data-cursor
                >
                  <img src={compAutorUrl} alt="Autor" className="h-4 sm:h-4.5 w-auto object-contain shrink-0 select-none pointer-events-none" />
                  {selectedAutor && (
                    <span className="font-anton text-[10px] sm:text-[11px] tracking-wider ml-1.5 bg-ea-black text-white px-2 sm:px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs shrink-0 select-none">
                      <span className="max-w-[90px] sm:max-w-[140px] truncate">{selectedAutor}</span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAutor(null);
                        }}
                        className="hover:text-red-300 ml-0.5 cursor-pointer flex items-center justify-center"
                        title="Quitar filtro"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    </span>
                  )}
                </button>

                {isAutorMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-ea-black shadow-xl z-50 py-1.5 min-w-[200px] rounded-sm max-h-[260px] overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedAutor(null);
                        setIsAutorMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center"
                    >
                      <span>Todos los autores</span>
                      {!selectedAutor && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                    {autores.map((autor) => (
                      <button
                        key={autor}
                        onClick={() => {
                          setSelectedAutor(autor);
                          setIsAutorMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center ${
                          selectedAutor === autor ? 'font-bold bg-ea-offwhite' : ''
                        }`}
                      >
                        <span>{autor}</span>
                        {selectedAutor === autor && <span className="text-[10px] font-mono">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. CRÍTICA */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      openFilterSheet('critica', 'CRÍTICA', compCriticaUrl, criticos, selectedCritica, setSelectedCritica, 'Todas las críticas');
                    } else {
                      setIsCriticaMenuOpen(!isCriticaMenuOpen);
                      setIsLugarMenuOpen(false);
                      setIsAutorMenuOpen(false);
                    }
                  }}
                  className={`py-1.5 px-2 sm:px-2.5 flex items-center gap-1.5 font-okcok text-sm sm:text-base uppercase tracking-wide transition-all focus:outline-none hover:scale-105 shrink-0 ${
                    selectedCritica ? 'text-ea-black font-bold' : 'text-ea-black/85 hover:text-black'
                  }`}
                  data-cursor
                >
                  <img src={compCriticaUrl} alt="Crítica" className="h-4 sm:h-4.5 w-auto object-contain shrink-0 select-none pointer-events-none" />
                  {selectedCritica && (
                    <span className="font-anton text-[10px] sm:text-[11px] tracking-wider ml-1.5 bg-ea-black text-white px-2 sm:px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs shrink-0 select-none">
                      <span className="max-w-[90px] sm:max-w-[140px] truncate">{selectedCritica}</span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCritica(null);
                        }}
                        className="hover:text-red-300 ml-0.5 cursor-pointer flex items-center justify-center"
                        title="Quitar filtro"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    </span>
                  )}
                </button>

                {isCriticaMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-ea-black shadow-xl z-50 py-1.5 min-w-[190px] rounded-sm">
                    <button
                      onClick={() => {
                        setSelectedCritica(null);
                        setIsCriticaMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center"
                    >
                      <span>Todas las críticas</span>
                      {!selectedCritica && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                    {criticos.map((critico) => (
                      <button
                        key={critico}
                        onClick={() => {
                          setSelectedCritica(critico);
                          setIsCriticaMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center ${
                          selectedCritica === critico ? 'font-bold bg-ea-offwhite' : ''
                        }`}
                      >
                        <span>{critico}</span>
                        {selectedCritica === critico && <span className="text-[10px] font-mono">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ======================= CASE B: ACADEMIA ======================= */}
          {currentSection === 'academia' && (
            <>
              {/* 1. UNIVERSIDAD */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      openFilterSheet('universidad', 'UNIVERSIDAD', tagTesisUrl, universidades, selectedUniversidad, setSelectedUniversidad, 'Todas las universidades');
                    } else {
                      setIsUniversidadMenuOpen(!isUniversidadMenuOpen);
                      setIsProblematicaMenuOpen(false);
                      setIsSituacionMenuOpen(false);
                    }
                  }}
                  className={`py-1.5 px-2 sm:px-2.5 flex items-center gap-2 font-okcok text-sm sm:text-base uppercase tracking-wide transition-all focus:outline-none hover:scale-105 shrink-0 ${
                    selectedUniversidad ? 'text-ea-black font-bold' : 'text-ea-black/85 hover:text-black'
                  }`}
                  data-cursor
                >
                  <img src={tagTesisUrl} alt="" className="h-4 sm:h-4.5 w-auto object-contain shrink-0 inline-block select-none pointer-events-none" />
                  {selectedUniversidad ? (
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <span>UNIV:</span>
                      <span className="font-anton text-[10px] sm:text-[11px] tracking-wider bg-ea-black text-white px-2 sm:px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs shrink-0 select-none">
                        <span className="max-w-[90px] sm:max-w-[140px] truncate">{selectedUniversidad}</span>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUniversidad(null);
                          }}
                          className="hover:text-red-300 ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Quitar filtro"
                        >
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span>UNIVERSIDAD</span>
                  )}
                </button>

                {isUniversidadMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-ea-black shadow-xl z-50 py-1.5 min-w-[210px] rounded-sm max-h-[260px] overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedUniversidad(null);
                        setIsUniversidadMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center"
                    >
                      <span>Todas las universidades</span>
                      {!selectedUniversidad && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                    {universidades.map((univ) => (
                      <button
                        key={univ}
                        onClick={() => {
                          setSelectedUniversidad(univ);
                          setIsUniversidadMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center ${
                          selectedUniversidad === univ ? 'font-bold bg-ea-offwhite' : ''
                        }`}
                      >
                        <span>{univ}</span>
                        {selectedUniversidad === univ && <span className="text-[10px] font-mono">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. PROBLEMÁTICA */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      openFilterSheet('problematica', 'PROBLEMÁTICA', tagEstudiosUrl, academiaProblematicas, selectedAcademiaProblematica, setSelectedAcademiaProblematica, 'Todas las problemáticas');
                    } else {
                      setIsProblematicaMenuOpen(!isProblematicaMenuOpen);
                      setIsUniversidadMenuOpen(false);
                      setIsSituacionMenuOpen(false);
                    }
                  }}
                  className={`py-1.5 px-2 sm:px-2.5 flex items-center gap-2 font-okcok text-sm sm:text-base uppercase tracking-wide transition-all focus:outline-none hover:scale-105 shrink-0 ${
                    selectedAcademiaProblematica ? 'text-ea-black font-bold' : 'text-ea-black/85 hover:text-black'
                  }`}
                  data-cursor
                >
                  <img src={tagEstudiosUrl} alt="" className="h-4 sm:h-4.5 w-auto object-contain shrink-0 inline-block select-none pointer-events-none" />
                  {selectedAcademiaProblematica ? (
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <span>PROB:</span>
                      <span className="font-anton text-[10px] sm:text-[11px] tracking-wider bg-ea-black text-white px-2 sm:px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs shrink-0 select-none">
                        <span className="max-w-[90px] sm:max-w-[140px] truncate">{selectedAcademiaProblematica}</span>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAcademiaProblematica(null);
                          }}
                          className="hover:text-red-300 ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Quitar filtro"
                        >
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span>PROBLEMÁTICA</span>
                  )}
                </button>

                {isProblematicaMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-ea-black shadow-xl z-50 py-1.5 min-w-[220px] rounded-sm max-h-[260px] overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedAcademiaProblematica(null);
                        setIsProblematicaMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center"
                    >
                      <span>Todas las problemáticas</span>
                      {!selectedAcademiaProblematica && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                    {academiaProblematicas.map((prob) => (
                      <button
                        key={prob}
                        onClick={() => {
                          setSelectedAcademiaProblematica(prob);
                          setIsProblematicaMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center ${
                          selectedAcademiaProblematica === prob ? 'font-bold bg-ea-offwhite' : ''
                        }`}
                      >
                        <span>{prob}</span>
                        {selectedAcademiaProblematica === prob && <span className="text-[10px] font-mono">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. SITUACIÓN */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      openFilterSheet('situacion', 'SITUACIÓN', tagDatosUrl, situaciones, selectedSituacion, setSelectedSituacion, 'Todas las situaciones');
                    } else {
                      setIsSituacionMenuOpen(!isSituacionMenuOpen);
                      setIsUniversidadMenuOpen(false);
                      setIsProblematicaMenuOpen(false);
                    }
                  }}
                  className={`py-1.5 px-2 sm:px-2.5 flex items-center gap-2 font-okcok text-sm sm:text-base uppercase tracking-wide transition-all focus:outline-none hover:scale-105 shrink-0 ${
                    selectedSituacion ? 'text-ea-black font-bold' : 'text-ea-black/85 hover:text-black'
                  }`}
                  data-cursor
                >
                  <img src={tagDatosUrl} alt="" className="h-4 sm:h-4.5 w-auto object-contain shrink-0 inline-block select-none pointer-events-none" />
                  {selectedSituacion ? (
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <span>SIT:</span>
                      <span className="font-anton text-[10px] sm:text-[11px] tracking-wider bg-ea-black text-white px-2 sm:px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs shrink-0 select-none">
                        <span className="max-w-[90px] sm:max-w-[140px] truncate">{selectedSituacion}</span>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSituacion(null);
                          }}
                          className="hover:text-red-300 ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Quitar filtro"
                        >
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span>SITUACIÓN</span>
                  )}
                </button>

                {isSituacionMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-ea-black shadow-xl z-50 py-1.5 min-w-[190px] rounded-sm">
                    <button
                      onClick={() => {
                        setSelectedSituacion(null);
                        setIsSituacionMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center"
                    >
                      <span>Todas las situaciones</span>
                      {!selectedSituacion && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                    {situaciones.map((sit) => (
                      <button
                        key={sit}
                        onClick={() => {
                          setSelectedSituacion(sit);
                          setIsSituacionMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center ${
                          selectedSituacion === sit ? 'font-bold bg-ea-offwhite' : ''
                        }`}
                      >
                        <span>{sit}</span>
                        {selectedSituacion === sit && <span className="text-[10px] font-mono">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ======================= CASE C: TERRITORIO ======================= */}
          {currentSection === 'territorios' && (
            <>
              {/* 1. LUGAR */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      openFilterSheet('lugar', 'LUGAR', compLugarUrl, territorioLugares, selectedTerritorioLugar, setSelectedTerritorioLugar, 'Todos los lugares');
                    } else {
                      setIsLugarMenuOpen(!isLugarMenuOpen);
                      setIsProblematicaMenuOpen(false);
                    }
                  }}
                  className={`py-1.5 px-2 sm:px-2.5 flex items-center gap-1.5 font-okcok text-sm sm:text-base uppercase tracking-wide transition-all focus:outline-none hover:scale-105 shrink-0 ${
                    selectedTerritorioLugar ? 'text-ea-black font-bold' : 'text-ea-black/85 hover:text-black'
                  }`}
                  data-cursor
                >
                  <img src={compLugarUrl} alt="Lugar" className="h-4 sm:h-4.5 w-auto object-contain shrink-0 select-none pointer-events-none" />
                  {selectedTerritorioLugar && (
                    <span className="font-anton text-[10px] sm:text-[11px] tracking-wider ml-1.5 bg-ea-black text-white px-2 sm:px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs shrink-0 select-none">
                      <span className="max-w-[90px] sm:max-w-[140px] truncate">{selectedTerritorioLugar}</span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTerritorioLugar(null);
                        }}
                        className="hover:text-red-300 ml-0.5 cursor-pointer flex items-center justify-center"
                        title="Quitar filtro"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    </span>
                  )}
                </button>

                {isLugarMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-ea-black shadow-xl z-50 py-1.5 min-w-[210px] rounded-sm max-h-[260px] overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedTerritorioLugar(null);
                        setIsLugarMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center"
                    >
                      <span>Todos los lugares</span>
                      {!selectedTerritorioLugar && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                    {territorioLugares.map((lug) => (
                      <button
                        key={lug}
                        onClick={() => {
                          setSelectedTerritorioLugar(lug);
                          setIsLugarMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center ${
                          selectedTerritorioLugar === lug ? 'font-bold bg-ea-offwhite' : ''
                        }`}
                      >
                        <span>{lug}</span>
                        {selectedTerritorioLugar === lug && <span className="text-[10px] font-mono">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. PROBLEMÁTICA */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (isMobile) {
                      openFilterSheet('problematica', 'PROBLEMÁTICA', tagEstudiosUrl, territorioProblematicas, selectedTerritorioProblematica, setSelectedTerritorioProblematica, 'Todas las problemáticas');
                    } else {
                      setIsProblematicaMenuOpen(!isProblematicaMenuOpen);
                      setIsLugarMenuOpen(false);
                    }
                  }}
                  className={`py-1.5 px-2 sm:px-2.5 flex items-center gap-2 font-okcok text-sm sm:text-base uppercase tracking-wide transition-all focus:outline-none hover:scale-105 shrink-0 ${
                    selectedTerritorioProblematica ? 'text-ea-black font-bold' : 'text-ea-black/85 hover:text-black'
                  }`}
                  data-cursor
                >
                  <img src={tagEstudiosUrl} alt="" className="h-4 sm:h-4.5 w-auto object-contain shrink-0 inline-block select-none pointer-events-none" />
                  {selectedTerritorioProblematica ? (
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <span>PROB:</span>
                      <span className="font-anton text-[10px] sm:text-[11px] tracking-wider bg-ea-black text-white px-2 sm:px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs shrink-0 select-none">
                        <span className="max-w-[90px] sm:max-w-[140px] truncate">{selectedTerritorioProblematica}</span>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTerritorioProblematica(null);
                          }}
                          className="hover:text-red-300 ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Quitar filtro"
                        >
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span>PROBLEMÁTICA</span>
                  )}
                </button>

                {isProblematicaMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-ea-black shadow-xl z-50 py-1.5 min-w-[220px] rounded-sm max-h-[260px] overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedTerritorioProblematica(null);
                        setIsProblematicaMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center"
                    >
                      <span>Todas las problemáticas</span>
                      {!selectedTerritorioProblematica && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                    {territorioProblematicas.map((prob) => (
                      <button
                        key={prob}
                        onClick={() => {
                          setSelectedTerritorioProblematica(prob);
                          setIsProblematicaMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-creato hover:bg-ea-offwhite flex justify-between items-center ${
                          selectedTerritorioProblematica === prob ? 'font-bold bg-ea-offwhite' : ''
                        }`}
                      >
                        <span>{prob}</span>
                        {selectedTerritorioProblematica === prob && <span className="text-[10px] font-mono">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Clear Active Filters chip */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="shrink-0 text-xs font-creato text-ea-black/60 hover:text-ea-black underline px-2 py-1 ml-1 transition-colors"
              title="Restablecer filtros"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Subtle status & view mode controls below the capsule */}
        <div className="flex items-center justify-between pt-3 px-2">
          <span className="font-anton text-xs tracking-widest text-ea-black/50 uppercase">
            {sectionConfig.countLabel}
          </span>

          <div className="flex items-center border border-ea-black/20 p-0.5 bg-[#FAF8F5] rounded-xs">
            <button
              onClick={() => setViewMode('hybrid')}
              className={`px-2 py-0.5 text-[11px] font-anton tracking-wider uppercase transition-colors ${
                viewMode === 'hybrid'
                  ? 'bg-white shadow-xs text-ea-black border border-ea-black/15'
                  : 'text-ea-black/50 hover:text-ea-black'
              }`}
              title="Composición Figma (Dossiers + Archivo)"
            >
              FIGMA
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-xs text-ea-black border border-ea-black/15'
                  : 'text-ea-black/50 hover:text-ea-black'
              }`}
              title="Tarjetas Verticales"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('panoramic')}
              className={`p-1 transition-colors ${
                viewMode === 'panoramic'
                  ? 'bg-white shadow-xs text-ea-black border border-ea-black/15'
                  : 'text-ea-black/50 hover:text-ea-black'
              }`}
              title="Tarjetas Panorámicas"
            >
              <Rows3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FIGMA CARDS (PROYECTOS FOLDERS, ACADEMIA NOTEBOOKS, TERRITORIO TABS)   */}
      {/* ========================================================================= */}
      <main className="py-6">
        {/* ======================= CASE A: PROYECTOS ======================= */}
        {currentSection === 'proyectos' && (
          projects.length === 0 ? (
            <EditorialEmptyState section="proyectos" />
          ) : filteredProjects.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-ea-black/20 bg-[#FAF8F5] p-8">
              <p className="font-okcok text-2xl uppercase text-ea-black/45">{sectionConfig.emptyMessage}</p>
              <button
                onClick={clearAllFilters}
                className="mt-5 px-4 py-2 bg-ea-black text-white font-anton text-xs uppercase tracking-wider hover:bg-black/80 transition-colors"
              >
                RESTAURAR TODOS LOS PROYECTOS
              </button>
            </div>
          ) : viewMode === 'hybrid' ? (
            <div className="flex flex-col gap-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center">
                {filteredProjects.slice(0, 3).map((proj, idx) => (
                  <div key={proj.id} className="gravity-card-wrapper will-change-transform">
                    <OrigamiFolderCard
                      project={proj}
                      index={idx}
                      onSelect={onSelectProject}
                    />
                  </div>
                ))}
              </div>

              {filteredProjects.length > 3 && (
                <div className="mt-16 sm:mt-24 pt-8 border-t border-ea-black/15 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 bg-ea-black rounded-full" />
                      <h2 className="font-anton text-sm tracking-widest uppercase text-ea-black/70">
                        {sectionConfig.archiveTitle}
                      </h2>
                    </div>
                    <span className="font-mono text-xs text-ea-black/40 font-bold">
                      [{filteredProjects.length - 3} EN ARCHIVO]
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {renderProjectsWithAds(filteredProjects.slice(3), true, 3)}
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center">
              {renderProjectsWithAds(filteredProjects, false, 0)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderProjectsWithAds(filteredProjects, true, 0)}
            </div>
          )
        )}

        {/* ======================= CASE B: ACADEMIA ======================= */}
        {currentSection === 'academia' && (
          academiaList.length === 0 ? (
            <EditorialEmptyState section="academia" />
          ) : filteredAcademia.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-ea-black/20 bg-[#FAF8F5] p-8">
              <p className="font-okcok text-2xl uppercase text-ea-black/45">{sectionConfig.emptyMessage}</p>
              <button
                onClick={clearAllFilters}
                className="mt-5 px-4 py-2 bg-ea-black text-white font-anton text-xs uppercase tracking-wider hover:bg-black/80 transition-colors"
              >
                RESTAURAR TODAS LAS INVESTIGACIONES
              </button>
            </div>
          ) : viewMode === 'hybrid' ? (
            <div className="flex flex-col gap-12">
              {/* Top 3 Spiral Notebooks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center">
                {filteredAcademia.slice(0, 3).map((item, idx) => (
                  <div key={item.id} className="gravity-card-wrapper will-change-transform">
                    <NotebookCard
                      item={item}
                      index={idx}
                      onSelect={onSelectProject}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom 4 Archive Dossiers */}
              {filteredAcademia.length > 3 && (
                <div className="mt-24 sm:mt-32 pt-8 border-t border-ea-black/15 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 bg-ea-black rounded-full" />
                      <h2 className="font-anton text-sm tracking-widest uppercase text-ea-black/70">
                        {sectionConfig.archiveTitle}
                      </h2>
                    </div>
                    <span className="font-mono text-xs text-ea-black/40 font-bold">
                      [{filteredAcademia.length - 3} EN ARCHIVO]
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredAcademia.slice(3).map((item, idx) => (
                      <div key={item.id} className="panoramic-archive-card will-change-transform w-full h-full">
                        <PanoramicFolderCard
                          project={{
                            id: item.id,
                            number: item.number,
                            title: item.title,
                            studio: item.institution,
                            location: item.location,
                            year: item.year,
                            excerpt: item.excerpt,
                            heroImage: item.heroImage,
                            category: item.problematica || 'INVESTIGACIÓN ACADÉMICA',
                            type: 'academia',
                            hasVisitas: false,
                          }}
                          index={idx + 3}
                          onSelect={onSelectProject}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center">
              {filteredAcademia.map((item, idx) => (
                <div key={item.id} className="gravity-card-wrapper will-change-transform">
                  <NotebookCard
                    item={item}
                    index={idx}
                    onSelect={onSelectProject}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredAcademia.map((item, idx) => (
                <div key={item.id} className="panoramic-archive-card will-change-transform w-full h-full">
                  <PanoramicFolderCard
                    project={{
                      id: item.id,
                      number: item.number,
                      title: item.title,
                      studio: item.institution,
                      location: item.location,
                      year: item.year,
                      excerpt: item.excerpt,
                      heroImage: item.heroImage,
                      category: item.problematica || 'INVESTIGACIÓN ACADÉMICA',
                      type: 'academia',
                      hasVisitas: false,
                    }}
                    index={idx}
                    onSelect={onSelectProject}
                  />
                </div>
              ))}
            </div>
          )
        )}

        {/* ======================= CASE C: TERRITORIOS ======================= */}
        {currentSection === 'territorios' && (
          territoriosList.length === 0 ? (
            <EditorialEmptyState section="territorios" />
          ) : filteredTerritorios.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-ea-black/20 bg-[#FAF8F5] p-8">
              <p className="font-okcok text-2xl uppercase text-ea-black/45">{sectionConfig.emptyMessage}</p>
              <button
                onClick={clearAllFilters}
                className="mt-5 px-4 py-2 bg-ea-black text-white font-anton text-xs uppercase tracking-wider hover:bg-black/80 transition-colors"
              >
                RESTAURAR TODOS LOS EXPEDIENTES
              </button>
            </div>
          ) : viewMode === 'hybrid' ? (
            <div className="flex flex-col gap-12">
              {/* Top 3 Manila Folders with tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center">
                {filteredTerritorios.slice(0, 3).map((item, idx) => (
                  <div key={item.id} className="gravity-card-wrapper will-change-transform">
                    <FolderTabCard
                      item={item}
                      index={idx}
                      onSelect={onSelectProject}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom 4 Archive Dossiers */}
              {filteredTerritorios.length > 3 && (
                <div className="mt-24 sm:mt-32 pt-8 border-t border-ea-black/15 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 bg-ea-black rounded-full" />
                      <h2 className="font-anton text-sm tracking-widest uppercase text-ea-black/70">
                        {sectionConfig.archiveTitle}
                      </h2>
                    </div>
                    <span className="font-mono text-xs text-ea-black/40 font-bold">
                      [{filteredTerritorios.length - 3} EN ARCHIVO]
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredTerritorios.slice(3).map((item, idx) => (
                      <div key={item.id} className="panoramic-archive-card will-change-transform w-full h-full">
                        <PanoramicFolderCard
                          project={{
                            id: item.id,
                            number: item.number,
                            title: item.title,
                            studio: `${item.studio} • ${item.region}`,
                            location: item.location,
                            year: item.year,
                            excerpt: item.excerpt,
                            heroImage: item.heroImage,
                            category: (item as any).situacion || item.problematica || 'EXPEDIENTE TERRITORIAL',
                            type: 'territorios',
                            hasVisitas: false,
                          }}
                          index={idx + 3}
                          onSelect={onSelectProject}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center">
              {filteredTerritorios.map((item, idx) => (
                <div key={item.id} className="gravity-card-wrapper will-change-transform">
                  <FolderTabCard
                    item={item}
                    index={idx}
                    onSelect={onSelectProject}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredTerritorios.map((item, idx) => (
                <div key={item.id} className="panoramic-archive-card will-change-transform w-full h-full">
                  <PanoramicFolderCard
                    project={{
                      id: item.id,
                      number: item.number,
                      title: item.title,
                      studio: `${item.studio} • ${item.region}`,
                      location: item.location,
                      year: item.year,
                      excerpt: item.excerpt,
                      heroImage: item.heroImage,
                      category: (item as any).situacion || item.problematica || 'EXPEDIENTE TERRITORIAL',
                      type: 'territorios',
                      hasVisitas: false,
                    }}
                    index={idx}
                    onSelect={onSelectProject}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </main>
        </div>

        {/* Right Sticky Skyscraper Wing */}
        <StickySponsorWings
          section={currentSection}
          position="derecho"
          className="mt-28 mb-8"
        />
      </div>

      {/* ========================================================================= */}
      {/* 4. EXTERIOR MOBILE FILTER ACTION DRAWER (PORTAL TO DOCUMENT.BODY)          */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && activeFilterSheet && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setActiveFilterSheet(null);
              setSheetSearch('');
            }}
          />

          {/* Bottom Drawer */}
          <div 
            className="relative z-10 w-full max-w-lg mx-auto max-h-[85vh] bg-[#FAF8F5] border-t-2 border-x-2 border-ea-black rounded-t-[22px] shadow-[0_-12px_45px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tactile drag indicator pill */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-ea-black/25 rounded-full" />
            </div>

            {/* Drawer Header */}
            <div className="px-5 py-3 border-b border-ea-black/15 flex items-center justify-between bg-white/70">
              <div className="flex items-center gap-2.5">
                {activeFilterSheet.icon && (
                  <img 
                    src={activeFilterSheet.icon} 
                    alt="" 
                    className="h-5 w-5 object-contain" 
                  />
                )}
                <div>
                  <span className="font-anton text-[10px] tracking-widest uppercase text-ea-black/50 block leading-tight">
                    FILTRAR POR
                  </span>
                  <h3 className="font-okcok text-xl sm:text-2xl uppercase tracking-wide text-ea-black leading-none mt-0.5">
                    {activeFilterSheet.title}
                  </h3>
                </div>
              </div>

              {/* Close Button: 44x44px touch target */}
              <button
                onClick={() => {
                  setActiveFilterSheet(null);
                  setSheetSearch('');
                }}
                className="w-11 h-11 border-2 border-ea-black bg-white rounded-full flex items-center justify-center text-ea-black hover:bg-ea-black hover:text-white transition-all shadow-[1px_2px_0px_rgba(0,0,0,0.85)] active:scale-95"
                aria-label="Cerrar filtro"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Quick search input if more than 4 options */}
            {activeFilterSheet.options.length > 4 && (
              <div className="px-5 pt-3 pb-2 bg-[#FAF8F5]">
                <div className="flex items-center px-3.5 h-10 bg-white border border-ea-black/30 rounded-xl shadow-2xs">
                  <Search className="w-4 h-4 text-ea-black/50 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={sheetSearch}
                    onChange={(e) => setSheetSearch(e.target.value)}
                    placeholder={`Buscar en ${activeFilterSheet.title.toLowerCase()}...`}
                    className="w-full bg-transparent font-creato text-xs sm:text-sm text-ea-black placeholder:text-ea-black/40 focus:outline-none"
                    autoFocus
                  />
                  {sheetSearch && (
                    <button 
                      onClick={() => setSheetSearch('')}
                      className="p-1 text-ea-black/40 hover:text-ea-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="p-5 pt-2 overflow-y-auto max-h-[50vh] space-y-2 no-scrollbar">
              {/* Reset / All Option */}
              <button
                onClick={() => {
                  activeFilterSheet.onSelect(null);
                  setActiveFilterSheet(null);
                  setSheetSearch('');
                }}
                className={`w-full min-h-[48px] px-4 py-3 rounded-xl border flex items-center justify-between text-left transition-all active:scale-[0.98] ${
                  !activeFilterSheet.selected
                    ? 'bg-ea-black text-white border-ea-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.25)]'
                    : 'bg-white text-ea-black border-ea-black/20 hover:border-ea-black/40 hover:bg-white/80'
                }`}
              >
                <span className="font-creato text-sm font-medium tracking-wide">
                  {activeFilterSheet.allLabel}
                </span>
                {!activeFilterSheet.selected && (
                  <span className="font-anton text-xs bg-white text-ea-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> ACTIVO
                  </span>
                )}
              </button>

              {/* Filtered options */}
              {filteredSheetOptions.map((opt) => {
                const isSelected = activeFilterSheet.selected === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      activeFilterSheet.onSelect(opt);
                      setActiveFilterSheet(null);
                      setSheetSearch('');
                    }}
                    className={`w-full min-h-[48px] px-4 py-3 rounded-xl border flex items-center justify-between text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-ea-black text-white border-ea-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.25)]'
                        : 'bg-white text-ea-black border-ea-black/20 hover:border-ea-black/40 hover:bg-white/80'
                    }`}
                  >
                    <span className="font-creato text-sm font-medium">
                      {opt}
                    </span>
                    {isSelected && (
                      <span className="font-anton text-xs bg-white text-ea-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> SELECCIONADO
                      </span>
                    )}
                  </button>
                );
              })}

              {filteredSheetOptions.length === 0 && (
                <div className="py-8 text-center text-xs font-creato text-ea-black/50 uppercase">
                  No se encontraron coincidencias para "{sheetSearch}"
                </div>
              )}
            </div>

            {/* Bottom safe area for mobile home indicator */}
            <div className="h-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] bg-[#FAF8F5]" />
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 5. EXTERIOR MOBILE EXPANDED SEARCH OVERLAY (PORTAL TO DOCUMENT.BODY)      */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' && isSearchExpanded && createPortal(
        <div 
          className="fixed inset-0 z-[10002] bg-[#FAF8F5] flex flex-col md:hidden overflow-hidden animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Search Input Bar with Safe Area Top */}
          <div className="pt-[calc(0.75rem+env(safe-area-inset-top,0px))] px-3 pb-3 sm:p-4 bg-white border-b-2 border-ea-black shadow-xs flex items-center gap-2.5 shrink-0">
            <div className="flex-1 flex items-center px-3.5 h-12 bg-[#FAF8F5] border-2 border-ea-black rounded-[14px] shadow-[1px_2px_0px_rgba(0,0,0,0.85)]">
              <Search className="w-5 h-5 text-ea-black stroke-[2.5] mr-2.5 shrink-0" />
              <input
                ref={expandedInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={sectionConfig.placeholder}
                className="w-full bg-transparent font-creato text-sm sm:text-base text-ea-black placeholder:text-ea-black/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-ea-black/40 hover:text-ea-black shrink-0"
                  title="Borrar texto"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Cancel / Close button */}
            <button
              onClick={() => setIsSearchExpanded(false)}
              className="h-12 px-3.5 border-2 border-ea-black bg-white rounded-[14px] font-anton text-xs tracking-wider uppercase text-ea-black hover:bg-ea-black hover:text-white transition-all shadow-[1px_2px_0px_rgba(0,0,0,0.85)] active:scale-95 shrink-0 flex items-center justify-center"
            >
              CERRAR
            </button>
          </div>

          {/* Search Body: Suggestions or Live Results */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar space-y-4">
            {/* Case A: Empty Search -> Show Suggestions */}
            {!searchQuery.trim() && (
              <div className="space-y-3 pt-2">
                <span className="font-anton text-[11px] tracking-widest uppercase text-ea-black/50 block">
                  SUGERENCIAS EN {sectionConfig.title}
                </span>
                <div className="flex flex-wrap gap-2">
                  {searchSuggestions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-2 bg-white border border-ea-black/20 hover:border-ea-black rounded-xl font-creato text-xs font-semibold text-ea-black hover:bg-ea-black hover:text-white transition-all shadow-2xs active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-ea-black/10 text-xs font-creato text-ea-black/50 leading-relaxed">
                  Tip: Puedes buscar por nombre de proyecto, arquitecto, ciudad, universidad o problemática.
                </div>
              </div>
            )}

            {/* Case B: Active Search -> Live Results List */}
            {searchQuery.trim() && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-anton text-[11px] tracking-widest uppercase text-ea-black/60">
                    {currentMatches.length} RESULTADO(S) EN {sectionConfig.title}
                  </span>
                  {currentMatches.length > 0 && (
                    <button
                      onClick={() => setIsSearchExpanded(false)}
                      className="font-creato text-xs text-ea-black underline hover:font-bold"
                    >
                      Ver en catálogo
                    </button>
                  )}
                </div>

                {currentMatches.length > 0 ? (
                  <div className="space-y-2.5">
                    {currentMatches.map((item: any) => {
                      const subtitle =
                        currentSection === 'proyectos'
                          ? `${item.studio || ''} • ${item.location || ''} • ${item.year || ''}`
                          : currentSection === 'academia'
                          ? `${item.institution || item.universidad || ''} • ${item.location || ''}`
                          : `${item.studio || ''} • ${item.region || item.location || ''}`;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            onSelectProject(item.id);
                            setIsSearchExpanded(false);
                          }}
                          className="w-full bg-white border-2 border-ea-black rounded-[14px] p-3 flex items-center gap-3 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] hover:shadow-[2px_4px_0px_rgba(0,0,0,0.95)] active:scale-[0.98] transition-all cursor-pointer"
                        >
                          {item.heroImage && (
                            <img
                              src={item.heroImage}
                              alt=""
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-ea-black/20 shrink-0 bg-ea-offwhite"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-anton text-[10px] tracking-wider text-ea-black/50 uppercase block truncate">
                              {item.number ? `#${item.number} • ` : ''}
                              {item.location || ''}
                            </span>
                            <h4 className="font-okcok text-base sm:text-lg text-ea-black truncate leading-tight mt-0.5">
                              {item.title}
                            </h4>
                            <p className="font-creato text-xs text-ea-black/65 truncate mt-0.5">
                              {subtitle}
                            </p>
                          </div>
                          <span className="text-ea-black/40 font-mono text-sm shrink-0">→</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-2 bg-white border border-ea-black/15 rounded-2xl p-6">
                    <p className="font-anton text-sm tracking-wide text-ea-black uppercase">
                      NO SE ENCONTRARON RESULTADOS PARA "{searchQuery}"
                    </p>
                    <p className="font-creato text-xs text-ea-black/55 max-w-xs mx-auto">
                      Intenta buscar con otros términos como una ciudad (ej. Quito, Cuenca) o el nombre de un estudio.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Footer with Safe Area Bottom */}
          {searchQuery.trim() && currentMatches.length > 0 && (
            <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-ea-black/15 flex justify-center shrink-0">
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="w-full sm:w-auto px-6 h-11 bg-ea-black text-white font-anton text-xs tracking-widest uppercase rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>VER {currentMatches.length} RESULTADO(S) EN EL CATÁLOGO</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
