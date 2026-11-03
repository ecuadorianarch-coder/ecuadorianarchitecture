import React, { useState, useEffect, useRef } from 'react';
import { AuthModal } from '../auth/AuthModal';
import { User, Compass } from 'lucide-react';
// Artwork mapping:
// 'btn_explorar.svg' contains the 'INICIAR SESIÓN' artwork (with key/circle doodle)
// 'tag_top_left.svg' contains the 'EXPLORAR' artwork (with diagonal arrow)
import btnIniciarSesionUrl from '../../assets/logos/btn_explorar.svg';
import btnExplorarUrl from '../../assets/logos/tag_top_left.svg';

interface NavbarProps {
  activeSection?: string;
  currentPillar?: 'proyectos' | 'academia' | 'territorios' | 'acerca';
  onNavigate?: (section: string) => void;
  onLogin?: () => void;
  isPreview?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPillar = 'proyectos',
  onNavigate,
  onLogin,
  isPreview = false,
}) => {
  const [isDestacadosInView, setIsDestacadosInView] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const checkScroll = () => {
      if (isPreview) {
        setIsDestacadosInView(true);
        return;
      }
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const dest = document.getElementById('destacados');
      if (dest) {
        const rect = dest.getBoundingClientRect();
        // At Hero (scrollY near 0, rect.top > 300), hasArrived is strictly FALSE.
        // As user scrolls down and #destacados reaches the upper viewport (scrollY > 200 && rect.top <= 250),
        // the buttons take full color and opacity on desktop.
        const hasArrived = scrollY > 200 && rect.top <= 250;
        setIsDestacadosInView(hasArrived);
      } else {
        setIsDestacadosInView(scrollY > 400);
      }

      // Detect scroll direction for mobile smart auto-hide (hide when scrolling down, show when scrolling up)
      const diff = scrollY - lastScrollYRef.current;
      if (Math.abs(diff) > 6) {
        setIsScrollingDown(diff > 0 && scrollY > 150);
      }
      lastScrollYRef.current = scrollY;
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    checkScroll();
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [isPreview]);

  // Click on EXPLORAR:
  // - If at Hero: smoothly scrolls to the search box (#buscador) and focuses input
  // - If at Destacados: navigates to the active tab's full catalog browser (proyectos, academia, territorios)
  const handleExploreClick = () => {
    if (!isDestacadosInView) {
      const searchSection = document.getElementById('buscador');
      const searchInput = document.querySelector<HTMLInputElement>('#buscador input');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          searchInput?.focus();
        }, 450);
        return;
      }
    }

    // In Destacados: navigate to the corresponding section catalog browser
    const targetSection =
      currentPillar === 'academia'
        ? 'academia'
        : currentPillar === 'territorios'
        ? 'territorios'
        : 'proyectos';

    if (onNavigate) {
      onNavigate(targetSection);
    } else {
      window.location.hash = `#${targetSection}`;
    }
  };

  // Click on INICIAR SESIÓN opens the AuthModal pop-up
  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP-LEFT: BOTÓN INICIAR SESIÓN (SVG FIGMA)                       */}
      {/* En móvil: Visible solo en Hero. En Destacados se oculta para no    */}
      {/* colisionar con las pestañas de Proyectos/Territorios/Academia.     */}
      {/* ------------------------------------------------------------------- */}
      <div
        className={`fixed top-[calc(0.75rem+env(safe-area-inset-top,0px))] sm:top-5 left-3 sm:left-6 md:left-8 z-40 select-none transition-all duration-500 ease-out ${
          isDestacadosInView
            ? 'max-md:opacity-0 max-md:pointer-events-none max-md:-translate-y-8 md:opacity-100 md:scale-100 md:pointer-events-auto'
            : 'opacity-[0.4] sm:opacity-[0.25] hover:opacity-100 scale-95 hover:scale-105 pointer-events-auto'
        }`}
      >
        <button
          type="button"
          onClick={handleLoginClick}
          className="group min-h-[44px] min-w-[44px] flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden"
          title="Iniciar sesión o crear cuenta — Ecuadorian Architecture"
          data-cursor
        >
          <img
            src={btnIniciarSesionUrl}
            alt="INICIAR SESIÓN"
            className={`h-7 sm:h-9 md:h-10 lg:h-11 w-auto object-contain transition-all duration-500 ${
              isDestacadosInView
                ? 'filter-none drop-shadow-2xs'
                : 'filter grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:drop-shadow-xs'
            }`}
            draggable={false}
          />
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. TOP-RIGHT: BOTÓN EXPLORAR (SVG FIGMA - DYNAMIC DESTINATION)      */}
      {/* En móvil: Visible solo en Hero. En Destacados se oculta para no    */}
      {/* colisionar con las pestañas de Proyectos/Territorios/Academia.     */}
      {/* ------------------------------------------------------------------- */}
      <div
        className={`fixed top-[calc(0.75rem+env(safe-area-inset-top,0px))] sm:top-5 right-3 sm:right-6 md:right-8 z-40 select-none transition-all duration-500 ease-out ${
          isDestacadosInView
            ? 'max-md:opacity-0 max-md:pointer-events-none max-md:-translate-y-8 md:opacity-100 md:scale-100 md:pointer-events-auto'
            : 'opacity-[0.4] sm:opacity-[0.25] hover:opacity-100 scale-95 hover:scale-105 pointer-events-auto'
        }`}
      >
        <button
          type="button"
          onClick={handleExploreClick}
          className="group min-h-[44px] min-w-[44px] flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden"
          title={
            !isDestacadosInView
              ? 'Explorar — Ir al buscador crítico'
              : `Explorar — Ir al navegador de ${
                  currentPillar === 'academia'
                    ? 'Academia'
                    : currentPillar === 'territorios'
                    ? 'Territorios'
                    : 'Proyectos'
                }`
          }
          data-cursor
        >
          <img
            src={btnExplorarUrl}
            alt="EXPLORAR"
            className={`h-7 sm:h-9 md:h-10 lg:h-11 w-auto object-contain transition-all duration-500 ${
              isDestacadosInView
                ? 'filter-none drop-shadow-2xs'
                : 'filter grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:drop-shadow-xs'
            }`}
            draggable={false}
          />
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. MOBILE FLOATING ACTION PILL (BOTTOM DOCK)                        */}
      {/* Solo en móviles (< md). Aparece en Destacados en la zona del pulgar */}
      {/* Se oculta al scrollear hacia abajo y reaparece al scrollear arriba. */}
      {/* ------------------------------------------------------------------- */}
      {isDestacadosInView && (
        <nav
          aria-label="Acciones rápidas en móvil"
          className={`md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] inset-x-0 mx-auto w-fit z-40 select-none transition-all duration-300 ease-out ${
            isScrollingDown
              ? 'translate-y-20 opacity-0 pointer-events-none'
              : 'translate-y-0 opacity-100 pointer-events-auto'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-md border border-ea-black/30 shadow-[0_6px_24px_rgba(0,0,0,0.16)] rounded-full px-4 py-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleLoginClick}
              className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ea-black/80 hover:text-ea-black active:scale-95 transition-all cursor-pointer min-h-[36px]"
              title="Iniciar sesión"
            >
              <User className="w-3.5 h-3.5 text-ea-black" />
              <span>SESIÓN</span>
            </button>

            <span className="w-px h-3.5 bg-ea-black/20" aria-hidden="true" />

            <button
              type="button"
              onClick={handleExploreClick}
              className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ea-black hover:text-ea-black active:scale-95 transition-all cursor-pointer min-h-[36px]"
              title={`Explorar ${currentPillar}`}
            >
              <Compass className="w-3.5 h-3.5 text-ea-black" />
              <span>EXPLORAR</span>
            </button>
          </div>
        </nav>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. MODAL POP-UP DE INICIAR SESIÓN Y CREAR CUENTA                   */}
      {/* ------------------------------------------------------------------- */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
