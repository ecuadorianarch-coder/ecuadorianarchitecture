import React, { useState } from 'react';
import { Search, Menu, X, ArrowUpRight, Compass, BookOpen, Layers } from 'lucide-react';
import { SearchModalOverlay, SearchResultItem } from '../common/SearchModalOverlay';

interface AdaptiveNavbarProps {
  currentSection?: string;
  onNavigate?: (section: string) => void;
  mockSearchItems?: SearchResultItem[];
}

export const AdaptiveNavbar: React.FC<AdaptiveNavbarProps> = ({
  currentSection = 'proyectos',
  onNavigate,
  mockSearchItems = [],
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'proyectos', label: 'PROYECTOS', icon: Compass },
    { id: 'academia', label: 'ACADEMIA', icon: BookOpen },
    { id: 'territorios', label: 'TERRITORIOS', icon: Layers },
  ];

  const handleLinkClick = (id: string) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    } else {
      window.location.hash = `#${id}`;
    }
  };

  return (
    <>
      {/* 
        HEADER NAVBAR CONTENEDOR:
        - Safe Margins: px-4 en Mobile (16px), sm:px-6 (24px), md:px-10 (40px)
        - Altura estándar: h-16 (64px) a h-[70px]
        - Z-Index 40 con fondo translúcido y borde nítido
      */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b-2 border-ea-black select-none">
        <div className="max-w-[1440px] mx-auto h-16 sm:h-[70px] px-4 sm:px-6 md:px-10 flex items-center justify-between gap-4">
          
          {/* LOGOTIPO / IDENTIDAD EDITORIAL CON PROTECCIÓN CONTRA OVERFLOW */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleLinkClick('inicio')}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ea-black"
              aria-label="Ir a Inicio Ecuadorian Architecture"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-ea-black text-white flex items-center justify-center font-okcok text-xl font-bold rounded-[1px] shadow-[2px_2px_0px_#888] transition-transform group-hover:scale-105 active:scale-95">
                EA
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-anton text-sm sm:text-base uppercase tracking-[0.14em] text-ea-black leading-none">
                  ECUADORIAN
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-ea-black/60 leading-tight">
                  ARCHITECTURE
                </span>
              </div>
            </button>
          </div>

          {/* NAVEGACIÓN DESKTOP (lg+) CON TOUCH TARGETS CUMPLIENDO WCAG */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = currentSection === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleLinkClick(link.id)}
                  /* Área táctil de 44px de altura mínima, espaciado de 12px+ */
                  className={`min-h-[44px] flex items-center gap-1.5 px-2 font-anton text-xs lg:text-[13px] tracking-[0.16em] uppercase transition-all cursor-pointer relative ${
                    isActive
                      ? 'text-ea-black'
                      : 'text-ea-black/65 hover:text-ea-black'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-2 right-2 h-0.5 bg-ea-black" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ACCIONES DEL HEADER: BUSCADOR ADAPTATIVO + MENÚ MÓVIL */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* 
              TRIGGER DE BÚSQUEDA:
              - Desktop (md+): Input/Barra horizontal de 38px de altura, 280px-340px de ancho, padding 0 14px.
              - Mobile (< md): Botón táctil ergonómico de 44px × 44px exactos con ícono centrado.
            */}
            
            {/* Desktop Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar en el catálogo"
              className="hidden md:flex items-center justify-between w-64 lg:w-72 h-[38px] px-3.5 bg-white border border-ea-black rounded-[2px] shadow-[2px_2px_0px_#000000] hover:shadow-[3px_3px_0px_#000000] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 text-ea-black/60 font-creato text-xs tracking-wide truncate">
                <Search className="w-4 h-4 stroke-[2]" />
                <span className="truncate">Buscar proyecto o autor...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center justify-center font-mono text-[10px] font-bold text-ea-black/50 bg-[#EAE6DD] border border-ea-black/30 px-1.5 py-0.5 rounded-[1px]">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Touch Search Trigger (44px × 44px estricto) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Abrir buscador móvil"
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-ea-black rounded-[2px] shadow-[2px_2px_0px_#000000] active:scale-95 transition-transform text-ea-black cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* BOTÓN HAMBURGUESA MÓVIL (44px × 44px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#1D1D1B] text-white border border-ea-black rounded-[2px] shadow-[2px_2px_0px_#000000] active:scale-95 transition-all cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>

        {/* 
          OVERLAY / DRAWER MÓVIL CON CONTENCIÓN COMPLETA:
          - Z-Index alto, touch targets de 48px para cada sección.
          - Touch gaps de 12px entre elementos para ergonomía con el pulgar.
        */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t-2 border-ea-black bg-[#FAF8F5] px-5 py-6 animate-in slide-in-from-top-2 duration-200"
            role="navigation"
            aria-label="Menú móvil"
          >
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-ea-black/50 mb-1">
                SECCIONES EDITORIALES
              </span>

              {navLinks.map((link) => {
                const isActive = currentSection === link.id;
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleLinkClick(link.id)}
                    /* Área táctil de 48px de altura mínima con feedback activo */
                    className={`min-h-[48px] flex items-center justify-between px-4 py-2.5 rounded-[2px] border-2 font-anton text-sm uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] ${
                      isActive
                        ? 'bg-ea-black text-white border-ea-black shadow-[3px_3px_0px_#888]'
                        : 'bg-white text-ea-black border-ea-black/30 hover:border-ea-black'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 stroke-[2]" />
                      <span>{link.label}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 opacity-60" />
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-ea-black/25 flex items-center justify-between font-mono text-[11px] text-ea-black/60">
              <span>ECUADORIAN ARCHITECTURE DIGITAL</span>
              <span>2026</span>
            </div>
          </div>
        )}
      </header>

      {/* MODAL / OVERLAY DE BÚSQUEDA INTEGRADO */}
      <SearchModalOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(item) => {
          if (onNavigate) {
            onNavigate(item.id);
          } else {
            window.location.hash = `#${item.id}`;
          }
        }}
        mockResults={mockSearchItems}
      />
    </>
  );
};
