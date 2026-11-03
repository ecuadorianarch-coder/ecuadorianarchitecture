import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useContent } from '../../context/ContentContext';
import { UniconLogo } from '../../components/common/UniconLogo';
import { ArrowRight, X, Search } from 'lucide-react';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import tagAcercaUrl from '../../assets/logos/tag_acerca_box.svg';

gsap.registerPlugin(ScrollTrigger);

interface SearchPreviewItem {
  id: string;
  type: 'proyecto' | 'territorio' | 'academia';
  typeLabel: string;
  title: string;
  subtitle: string;
  location: string;
  year?: string;
  imageUrl: string;
  excerpt: string;
}

const normalizeText = (text?: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

interface HeroProps {
  onNavigateToCatalog?: () => void;
  onNavigateToSection?: (section: string) => void;
  onSearch?: (query: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onNavigateToCatalog,
  onNavigateToSection,
  onSearch,
  onSelectProject,
}) => {
  const { siteConfig, projects, academia, territorios } = useContent();
  const { hero } = siteConfig;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const heroContainerRef = useRef<HTMLElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Live filtered search preview cards
  const searchResults = useMemo<SearchPreviewItem[]>(() => {
    const q = normalizeText(searchQuery.trim());
    if (!q) return [];

    const items: SearchPreviewItem[] = [];

    // 1. Projects
    (projects || []).forEach((proj: any) => {
      const titleMatch = normalizeText(proj.title).includes(q);
      const studioMatch = normalizeText(proj.studio).includes(q);
      const criticMatch = normalizeText(proj.critic).includes(q);
      const locMatch = normalizeText(proj.location).includes(q);
      const catMatch = normalizeText(proj.category).includes(q);
      const excerptMatch = normalizeText(proj.excerpt).includes(q);
      const photoMatch = normalizeText(proj.datos?.fotografia || proj.photographer).includes(q);

      if (titleMatch || studioMatch || criticMatch || locMatch || catMatch || excerptMatch || photoMatch) {
        items.push({
          id: proj.id,
          type: 'proyecto',
          typeLabel: 'PROYECTO',
          title: proj.title || 'PROYECTO',
          subtitle: proj.studio ? `${proj.studio}${proj.critic ? ` • Crítica: ${proj.critic}` : ''}` : 'ARQUITECTURA',
          location: proj.location || 'ECUADOR',
          year: proj.year ? String(proj.year) : undefined,
          imageUrl: proj.heroImage || proj.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          excerpt: proj.excerpt || proj.memory || '',
        });
      }
    });

    // 2. Territorios
    (territorios || []).forEach((terr: any) => {
      const titleMatch = normalizeText(terr.title).includes(q);
      const studioMatch = normalizeText(terr.studio).includes(q);
      const regionMatch = normalizeText(terr.region).includes(q);
      const locMatch = normalizeText(terr.location).includes(q);
      const excerptMatch = normalizeText(terr.excerpt).includes(q);

      if (titleMatch || studioMatch || regionMatch || locMatch || excerptMatch) {
        items.push({
          id: terr.id,
          type: 'territorio',
          typeLabel: 'TERRITORIO',
          title: terr.title || 'TERRITORIO',
          subtitle: terr.studio || terr.region || 'EXPEDIENTE TERRITORIAL',
          location: terr.region || terr.location || 'ECUADOR',
          year: terr.year ? String(terr.year) : undefined,
          imageUrl: terr.heroImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          excerpt: terr.excerpt || '',
        });
      }
    });

    // 3. Academia
    (academia || []).forEach((acad: any) => {
      const titleMatch = normalizeText(acad.title).includes(q);
      const instMatch = normalizeText(acad.institution || acad.universidad || acad.university).includes(q);
      const studentMatch = normalizeText(acad.student).includes(q);
      const profMatch = normalizeText(acad.professor).includes(q);
      const locMatch = normalizeText(acad.location).includes(q);
      const excerptMatch = normalizeText(acad.excerpt).includes(q);

      if (titleMatch || instMatch || studentMatch || profMatch || locMatch || excerptMatch) {
        items.push({
          id: acad.id,
          type: 'academia',
          typeLabel: 'ACADEMIA',
          title: acad.title || 'INVESTIGACIÓN ACADÉMICA',
          subtitle: acad.universidad || acad.institution || acad.university || 'TESIS DE INVESTIGACIÓN',
          location: acad.location || 'ECUADOR',
          year: acad.year ? String(acad.year) : undefined,
          imageUrl: acad.heroImage || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
          excerpt: acad.excerpt || '',
        });
      }
    });

    return items.slice(0, 8);
  }, [searchQuery, projects, academia, territorios]);

  // Click outside and Escape key to close search preview panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll whenever search preview is open on mobile to prevent background scrolling/jitter
  useEffect(() => {
    if (isSearchOpen && searchQuery.trim().length >= 1) {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        const originalOverflow = document.body.style.overflow;
        const originalTouchAction = document.body.style.touchAction;
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        return () => {
          document.body.style.overflow = originalOverflow;
          document.body.style.touchAction = originalTouchAction;
        };
      }
    }
  }, [isSearchOpen, searchQuery]);

  const handleSelectResult = (item: SearchPreviewItem) => {
    setIsSearchOpen(false);
    if (onSelectProject) {
      onSelectProject(item.id);
    } else {
      window.location.hash = `#proyecto-${item.id}`;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (onNavigateToCatalog) {
      onNavigateToCatalog();
    }
  };

  const handlePillarClick = (pillar: string) => {
    if (pillar === 'proyectos') {
      if (onNavigateToCatalog) {
        onNavigateToCatalog();
      } else {
        window.location.hash = '#proyectos';
      }
    } else if (pillar === 'acerca') {
      if (onNavigateToSection) {
        onNavigateToSection('acerca');
      } else {
        window.location.hash = '#acerca-de-ea';
      }
    } else if (onNavigateToSection) {
      onNavigateToSection(pillar);
    } else {
      window.location.hash = `#${pillar}`;
    }
  };

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const letters = gsap.utils.toArray<SVGElement>('.unicon-letter');
      const emblem = heroContainerRef.current?.querySelector('.unicon-emblem');

      // MASTER ENTRANCE TIMELINE
      const masterTl = gsap.timeline();

      // 1. EMBLEM IMPACT DROP
      if (emblem) {
        masterTl.fromTo(
          emblem,
          {
            y: -140,
            rotation: -4,
            scale: 0.94,
            opacity: 0.95,
            transformOrigin: '50% 50%',
          },
          {
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.75,
            ease: 'bounce.out',
          },
          0.05
        );
      }

      // 2. UNICON LETTERS INDEPENDENT PHYSICAL GRAVITY FALL ON ENTRANCE
      letters.forEach((letter, i) => {
        const isLeft = letter.classList.contains('unicon-letter-ecuadorian');
        const distFromCenter = isLeft ? 9 - i : i - 10;
        const delay = 0.08 + Math.abs(distFromCenter) * 0.028 + (Math.abs(Math.sin(i * 77)) * 0.04);
        const initialY = -115 - Math.abs(Math.sin(i * 1.7)) * 45;
        const initialRot = Math.cos(i * 1.8) * 15;
        const initialX = Math.sin(i * 2.5) * 8;

        masterTl.fromTo(
          letter,
          {
            y: initialY,
            x: initialX,
            rotation: initialRot,
            transformOrigin: '50% 50%',
            opacity: 0.95,
          },
          {
            y: 0,
            x: 0,
            rotation: 0,
            duration: 0.85 + Math.abs(Math.sin(i * 3.1)) * 0.2,
            ease: 'bounce.out',
          },
          delay
        );
      });

      // 3. SEARCH CAPSULE ENTRANCE
      masterTl.fromTo(
        '.hero-search',
        { opacity: 0, y: -16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
        0.28
      );

      // 4. HEADLINE INITIAL ENTRANCE: crisp container reveal
      masterTl.fromTo(
        '.hero-headline-1, .hero-headline-2',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' },
        0.32
      );

      // 5. SUBTITLE AND PILLARS ENTRANCE
      masterTl.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
        0.5
      );

      masterTl.fromTo(
        '.hero-pillar',
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.06, ease: 'back.out(1.4)' },
        0.55
      );

      // =========================================================================
      // 6. SCROLL DRIVEN PHYSICAL PARALLAX OF "UN ESPACIO DE CRITICA DE ARQUITECTURA"
      // Letters physically tilt and separate with simulated gravity on scrub
      // =========================================================================
      const isMobile = window.innerWidth < 768;
      const fallChars = gsap.utils.toArray<HTMLElement>('.hero-fall-char');
      fallChars.forEach((charEl, idx) => {
        const seed1 = (idx * 43) % 100;
        const seed2 = (idx * 67) % 100;

        // Controlled downward drop: 45px to 95px on desktop; 18px to 36px on mobile
        const targetY = isMobile
          ? 18 + (seed1 / 100) * 18
          : 45 + (seed1 / 100) * 50;

        // Subtle lateral scatter: -30px to +30px on desktop; -10px to +10px on mobile
        const targetX = isMobile
          ? ((seed1 - 50) / 50) * 10
          : ((seed1 - 50) / 50) * 30;

        // Angular tumbling: -18deg to +18deg on desktop; -8deg to +8deg on mobile
        const targetRot = isMobile
          ? ((seed2 - 50) / 50) * 8
          : ((seed2 - 50) / 50) * 18;

        gsap.fromTo(
          charEl,
          { y: 0, x: 0, rotation: 0 },
          {
            y: targetY,
            x: targetX,
            rotation: targetRot,
            ease: 'power1.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: heroContainerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          }
        );
      });

      // 7. UNICON LETTERS MULTI-SPEED DISPERSION ON SCROLL
      gsap.fromTo(
        '.unicon-letter',
        { y: 0, x: 0, rotation: 0 },
        {
          y: (index) => (index % 2 === 0 ? -40 : -20),
          x: (index) => Math.sin(index * 1.8) * 12,
          rotation: (index) => ((index % 2 === 0 ? -1 : 1) * 4),
          immediateRender: false,
          scrollTrigger: {
            trigger: heroContainerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );

      if (emblem) {
        gsap.fromTo(
          emblem,
          { y: 0, scale: 1 },
          {
            y: -30,
            scale: 0.96,
            immediateRender: false,
            scrollTrigger: {
              trigger: heroContainerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
            },
          }
        );
      }

      // 8. SEARCH CAPSULE & SUBTITLE GENTLE PARALLAX ON SCROLL (Never fades to empty)
      gsap.fromTo(
        '.hero-search',
        { y: 0, opacity: 1, scale: 1 },
        {
          y: 40,
          opacity: 0.85,
          scale: 0.98,
          immediateRender: false,
          scrollTrigger: {
            trigger: heroContainerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );

      gsap.fromTo(
        '.hero-subtitle',
        { y: 0, opacity: 1 },
        {
          y: 35,
          opacity: 0.8,
          immediateRender: false,
          scrollTrigger: {
            trigger: heroContainerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );

      // 9. PILLARS GENTLE ASCENT (Keeps full crispness and visibility)
      gsap.fromTo(
        '.hero-pillar',
        { y: 0, opacity: 1, scale: 1 },
        {
          y: (i) => -20 - i * 8,
          opacity: 0.9,
          scale: 1,
          immediateRender: false,
          scrollTrigger: {
            trigger: heroContainerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );
    },
    { scope: heroContainerRef }
  );

  const line1Text = hero?.headlineLine1 || 'UN ESPACIO DE CRITICA';
  const line2Text = hero?.headlineLine2 || 'DE ARQUITECTURA';

  return (
    <section
      ref={heroContainerRef}
      className="relative w-full min-h-screen bg-white pt-16 sm:pt-24 pb-14 sm:pb-16 px-3.5 sm:px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col justify-between items-center select-none overflow-x-clip"
    >
      {/* 1. TOP BRANDING: ECUADORIAN [ea] ARCHITECTURE WITH PHYSICAL INDEPENDENT LETTERS */}
      <div className="hero-branding w-full flex justify-center pt-1 sm:pt-2 md:pt-4">
        <UniconLogo
          className="w-[min(100%,320px)] sm:w-[420px] md:w-[480px] lg:w-[520px] h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => {
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {/* 2. CENTERED SEARCH CAPSULE: Proyecto arquitecto critco... 🔍 */}
      <div id="buscador" ref={searchWrapperRef} className="hero-search w-full max-w-[460px] mx-auto my-5 sm:my-6 md:my-8 px-2 md:px-0 relative z-50">
        <form
          onSubmit={handleSearchSubmit}
          className="w-full h-[48px] md:h-[52px] border-2 border-black rounded-[14px] flex items-center justify-between px-3.5 sm:px-4 bg-white transition-all duration-200 focus-within:shadow-md hover:border-black/80 relative z-10"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 1) setIsSearchOpen(true);
            }}
            placeholder="Proyecto, arquitecto, critco..."
            className="w-full bg-transparent font-okcok text-sm md:text-[15px] text-ea-black placeholder:text-ea-black/60 outline-none pr-2"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="mr-2 text-ea-black/40 hover:text-ea-black transition-colors flex items-center justify-center cursor-pointer min-h-[36px] min-w-[36px]"
              title="Borrar búsqueda"
              aria-label="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            aria-label="Buscar"
            className="flex-shrink-0 text-ea-black hover:scale-110 active:scale-90 transition-transform cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            data-cursor
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="10.5" cy="10.5" r="7" />
              <line x1="15.8" y1="15.8" x2="21.5" y2="21.5" strokeWidth="3" />
            </svg>
          </button>
        </form>

        {/* 1. DESKTOP FLOATING DROPDOWN (md: and up) */}
        {isSearchOpen && searchQuery.trim().length >= 1 && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#FAF8F5] border-2 border-ea-black rounded-[14px] shadow-[8px_8px_0px_#000] overflow-hidden z-50 hidden md:flex flex-col max-h-[440px] animate-in fade-in duration-150">
            {/* Header bar */}
            <div className="px-4 py-2 bg-[#EFECE6] border-b-2 border-ea-black/15 flex items-center justify-between text-ea-black select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ea-black animate-pulse" />
                <span className="font-anton text-xs tracking-wider uppercase">
                  {searchResults.length === 1
                    ? '1 COINCIDENCIA'
                    : `${searchResults.length} COINCIDENCIAS`}
                </span>
              </div>
              <span className="font-mono text-[10px] text-ea-black/55 uppercase">
                ESC para cerrar
              </span>
            </div>

            {/* List of Preview Cards */}
            {searchResults.length > 0 ? (
              <div className="overflow-y-auto overscroll-contain no-scrollbar divide-y divide-ea-black/10">
                {searchResults.map((item) => (
                  <article
                    key={`desk-${item.type}-${item.id}`}
                    onClick={() => handleSelectResult(item)}
                    className="group p-3.5 flex items-center gap-4 bg-white hover:bg-[#F3EFEA] transition-all cursor-pointer text-left select-none"
                    data-cursor
                  >
                    <div className="relative w-20 h-20 min-w-[80px] min-h-[80px] shrink-0 rounded-[3px] border-2 border-ea-black overflow-hidden bg-ea-offwhite shadow-[2px_2px_0px_#000]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`font-anton text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-[2px] leading-none ${
                            item.type === 'proyecto'
                              ? 'bg-ea-black text-white'
                              : item.type === 'territorio'
                              ? 'bg-[#8C5835] text-white'
                              : 'bg-[#2B4C7E] text-white'
                          }`}
                        >
                          {item.typeLabel}
                        </span>
                        {item.location && (
                          <span className="font-anton text-[10.5px] tracking-wider uppercase text-ea-black/75">
                            • {item.location}
                          </span>
                        )}
                        {item.year && (
                          <span className="font-mono text-[10px] text-ea-black/50">
                            {item.year}
                          </span>
                        )}
                      </div>
                      <h4 className="font-okcok text-lg leading-[1.1] uppercase text-ea-black tracking-normal group-hover:underline truncate">
                        {item.title}
                      </h4>
                      <p className="font-anton text-xs text-ea-black/80 uppercase tracking-wide truncate mt-0.5">
                        {item.subtitle}
                      </p>
                      {item.excerpt && (
                        <p className="font-creato text-[12px] text-ea-black/70 line-clamp-1 leading-snug mt-1">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 w-8 h-8 rounded-full border border-ea-black/30 flex items-center justify-center group-hover:border-ea-black group-hover:bg-ea-black group-hover:text-white transition-all text-ea-black">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-ea-black">
                <p className="font-okcok text-lg uppercase tracking-wide">
                  NO SE ENCONTRARON RESULTADOS
                </p>
                <p className="font-creato text-xs text-ea-black/70 mt-1 max-w-[320px] mx-auto leading-relaxed">
                  Prueba buscando por nombre de obra, estudio, crítico, ciudad o tipología.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. MOBILE DEDICATED FULL-SCREEN SEARCH OVERLAY (Escapes Stacking Context & Body Scroll) */}
        {typeof document !== 'undefined' &&
          isSearchOpen &&
          searchQuery.trim().length >= 1 &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Resultados de búsqueda"
              className="fixed inset-0 z-[9999] bg-[#FAF8F5] flex flex-col md:hidden animate-in fade-in duration-150"
            >
              {/* Mobile Top Header */}
              <div className="p-3 bg-white border-b-2 border-ea-black flex items-center gap-2 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
                <div className="flex-1 flex items-center border-2 border-ea-black rounded-[12px] px-3 py-2 bg-[#FAF8F5] shadow-xs">
                  <Search className="w-4 h-4 text-ea-black/60 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Proyecto, arquitecto, crítico..."
                    className="w-full bg-transparent font-okcok text-sm outline-none text-ea-black"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="p-1 text-ea-black/50 hover:text-ea-black cursor-pointer"
                      title="Borrar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="font-anton text-xs uppercase tracking-wider text-ea-black px-2 py-2 shrink-0 cursor-pointer active:scale-95"
                >
                  CERRAR
                </button>
              </div>

              {/* Status Header */}
              <div className="px-4 py-2 bg-[#EFECE6] border-b border-ea-black/15 flex items-center justify-between text-ea-black select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ea-black animate-pulse" />
                  <span className="font-anton text-xs tracking-wider uppercase">
                    {searchResults.length === 1
                      ? '1 COINCIDENCIA'
                      : `${searchResults.length} COINCIDENCIAS`}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-ea-black/60 uppercase">
                  Toca para abrir
                </span>
              </div>

              {/* Scrollable Results List (Locked to container, zero leak to body) */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain divide-y divide-ea-black/10 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <article
                      key={`mob-${item.type}-${item.id}`}
                      onClick={() => handleSelectResult(item)}
                      className="p-3.5 flex items-center gap-3.5 bg-white active:bg-[#F3EFEA] transition-colors cursor-pointer text-left select-none"
                    >
                      <div className="relative w-16 h-16 shrink-0 rounded-[3px] border-2 border-ea-black overflow-hidden bg-ea-offwhite shadow-[2px_2px_0px_#000]">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`font-anton text-[9.5px] tracking-widest uppercase px-1.5 py-0.5 rounded-[2px] leading-none ${
                              item.type === 'proyecto'
                                ? 'bg-ea-black text-white'
                                : item.type === 'territorio'
                                ? 'bg-[#8C5835] text-white'
                                : 'bg-[#2B4C7E] text-white'
                            }`}
                          >
                            {item.typeLabel}
                          </span>
                          {item.location && (
                            <span className="font-anton text-[10px] uppercase text-ea-black/75">
                              • {item.location}
                            </span>
                          )}
                          {item.year && (
                            <span className="font-mono text-[9.5px] text-ea-black/50">
                              {item.year}
                            </span>
                          )}
                        </div>
                        <h4 className="font-okcok text-base uppercase text-ea-black truncate leading-tight">
                          {item.title}
                        </h4>
                        <p className="font-anton text-xs text-ea-black/80 uppercase truncate mt-0.5">
                          {item.subtitle}
                        </p>
                        {item.excerpt && (
                          <p className="font-creato text-[11px] text-ea-black/70 line-clamp-1 leading-snug mt-0.5">
                            {item.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 w-7 h-7 rounded-full border border-ea-black/25 flex items-center justify-center text-ea-black">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="p-8 text-center text-ea-black">
                    <p className="font-okcok text-lg uppercase tracking-wide">
                      NO SE ENCONTRARON RESULTADOS
                    </p>
                    <p className="font-creato text-xs text-ea-black/70 mt-1 max-w-[280px] mx-auto leading-relaxed">
                      Prueba buscando por nombre de obra, estudio, crítico o ciudad.
                    </p>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* 3. MONUMENTAL EDITORIAL HEADLINE: INDEPENDENT FALLING CHARACTERS ON SCROLL */}
      <div className="w-full text-center max-w-[960px] mx-auto my-3 sm:my-4 md:my-6 overflow-visible relative px-2">
        <h1 className="hero-headline-1 font-okcok text-[clamp(1.75rem,8vw,2.5rem)] sm:text-5xl md:text-[64px] lg:text-[72px] leading-[1.08] text-ea-black uppercase tracking-normal">
          {line1Text.split(' ').map((word, wIdx) => (
            <span key={`w1-${wIdx}`} className="inline-block mr-[0.25em] last:mr-0 whitespace-nowrap">
              {word.split('').map((char, cIdx) => (
                <span
                  key={`c1-${wIdx}-${cIdx}`}
                  className="hero-fall-char inline-block"
                  style={{ transformOrigin: '50% 100%' }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <h1 className="hero-headline-2 font-okcok text-[clamp(1.75rem,8vw,2.5rem)] sm:text-5xl md:text-[64px] lg:text-[72px] leading-[1.08] text-ea-black uppercase tracking-normal mt-1 md:mt-2">
          {line2Text.split(' ').map((word, wIdx) => (
            <span key={`w2-${wIdx}`} className="inline-block mr-[0.25em] last:mr-0 whitespace-nowrap">
              {word.split('').map((char, cIdx) => (
                <span
                  key={`c2-${wIdx}-${cIdx}`}
                  className="hero-fall-char inline-block"
                  style={{ transformOrigin: '50% 100%' }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="hero-subtitle font-okcok text-sm sm:text-lg md:text-[22px] lg:text-[24px] text-ea-black/90 uppercase tracking-wide mt-2.5 sm:mt-3 md:mt-4">
          {hero?.subtitle || 'DONDE TODAS LAS VOCES SON RELEVANTES'}
        </p>
      </div>

      {/* 4. FOUR PILLARS: PROYECTOS, TERRITORIOS, ACADEMIA, ACERCA DE EA */}
      <div className="w-full max-w-[1140px] mx-auto pt-4 sm:pt-6 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 md:gap-10 lg:gap-14 items-end justify-items-center">
          {/* PILLAR 1: PROYECTOS (House) */}
          <div
            onClick={() => handlePillarClick('proyectos')}
            className="hero-pillar flex flex-col items-center cursor-pointer group hover:-translate-y-3 hover:scale-105 active:scale-95 transition-all duration-300 p-2 rounded-sm select-none min-h-[44px]"
            data-cursor
            title="Explorar Proyectos Monográficos"
          >
            <div className="h-20 sm:h-28 md:h-32 flex items-end justify-center">
              <img
                src={tagProyectosUrl}
                alt="PROYECTOS"
                className="max-h-full max-w-[110px] sm:max-w-[130px] md:max-w-[150px] object-contain group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300 drop-shadow-sm"
              />
            </div>
            <span className="font-anton text-xs sm:text-sm md:text-base tracking-widest text-ea-black uppercase mt-2.5 sm:mt-3 text-center group-hover:tracking-wider transition-all">
              PROYECTOS
            </span>
            <span className="font-anton text-[8.5px] sm:text-[10px] tracking-wider uppercase text-ea-black/60 group-hover:text-white bg-ea-offwhite group-hover:bg-ea-black px-2 sm:px-2.5 py-1 mt-1.5 transition-all rounded-xs border border-ea-border group-hover:border-ea-black shadow-2xs whitespace-nowrap min-h-[30px] flex items-center justify-center">
              VER MÁS (7 OBRAS) →
            </span>
          </div>

          {/* PILLAR 2: TERRITORIOS (Sun & Map) */}
          <div
            onClick={() => handlePillarClick('territorios')}
            className="hero-pillar flex flex-col items-center cursor-pointer group hover:-translate-y-3 hover:scale-105 active:scale-95 transition-all duration-300 p-2 rounded-sm select-none min-h-[44px]"
            data-cursor
            title="Explorar Cartografía Territorial"
          >
            <div className="h-20 sm:h-28 md:h-32 flex items-end justify-center">
              <img
                src={tagCiudadUrl}
                alt="TERRITORIOS"
                className="max-h-full max-w-[110px] sm:max-w-[130px] md:max-w-[150px] object-contain group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300 drop-shadow-sm"
              />
            </div>
            <span className="font-anton text-xs sm:text-sm md:text-base tracking-widest text-ea-black uppercase mt-2.5 sm:mt-3 text-center group-hover:tracking-wider transition-all">
              TERRITORIOS
            </span>
            <span className="font-anton text-[8.5px] sm:text-[10px] tracking-wider uppercase text-ea-black/60 group-hover:text-white bg-ea-offwhite group-hover:bg-ea-black px-2 sm:px-2.5 py-1 mt-1.5 transition-all rounded-xs border border-ea-border group-hover:border-ea-black shadow-2xs whitespace-nowrap min-h-[30px] flex items-center justify-center">
              VER MÁS (7 REGIONES) →
            </span>
          </div>

          {/* PILLAR 3: ACADEMIA (Notebook) */}
          <div
            onClick={() => handlePillarClick('academia')}
            className="hero-pillar flex flex-col items-center cursor-pointer group hover:-translate-y-3 hover:scale-105 active:scale-95 transition-all duration-300 p-2 rounded-sm select-none min-h-[44px]"
            data-cursor
            title="Explorar Investigaciones Académicas"
          >
            <div className="h-20 sm:h-28 md:h-32 flex items-end justify-center">
              <img
                src={tagDatosUrl}
                alt="ACADEMIA"
                className="max-h-full max-w-[110px] sm:max-w-[130px] md:max-w-[150px] object-contain group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300 drop-shadow-sm"
              />
            </div>
            <span className="font-anton text-xs sm:text-sm md:text-base tracking-widest text-ea-black uppercase mt-2.5 sm:mt-3 text-center group-hover:tracking-wider transition-all">
              ACADEMIA
            </span>
            <span className="font-anton text-[8.5px] sm:text-[10px] tracking-wider uppercase text-ea-black/60 group-hover:text-white bg-ea-offwhite group-hover:bg-ea-black px-2 sm:px-2.5 py-1 mt-1.5 transition-all rounded-xs border border-ea-border group-hover:border-ea-black shadow-2xs whitespace-nowrap min-h-[30px] flex items-center justify-center">
              VER MÁS (7 TESIS) →
            </span>
          </div>

          {/* PILLAR 4: ACERCA DE EA (Open Box) */}
          <div
            onClick={() => handlePillarClick('acerca')}
            className="hero-pillar flex flex-col items-center cursor-pointer group hover:-translate-y-3 hover:scale-105 active:scale-95 transition-all duration-300 p-2 rounded-sm select-none min-h-[44px]"
            data-cursor
            title="Leer Manifiesto y Acerca de EA"
          >
            <div className="h-20 sm:h-28 md:h-32 flex items-end justify-center">
              <img
                src={tagAcercaUrl}
                alt="ACERCA DE EA"
                className="max-h-full max-w-[110px] sm:max-w-[130px] md:max-w-[150px] object-contain group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300 drop-shadow-sm"
              />
            </div>
            <span className="font-anton text-xs sm:text-sm md:text-base tracking-widest text-ea-black uppercase mt-2.5 sm:mt-3 text-center group-hover:tracking-wider transition-all">
              ACERCA DE EA
            </span>
            <span className="font-anton text-[8.5px] sm:text-[10px] tracking-wider uppercase text-ea-black/60 group-hover:text-white bg-ea-offwhite group-hover:bg-ea-black px-2 sm:px-2.5 py-1 mt-1.5 transition-all rounded-xs border border-ea-border group-hover:border-ea-black shadow-2xs whitespace-nowrap min-h-[30px] flex items-center justify-center">
              VER MANIFIESTO →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
