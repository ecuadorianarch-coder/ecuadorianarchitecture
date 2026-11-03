import React, { useEffect, useRef } from 'react';
import tagAcercaUrl from '../../assets/logos/tag_acerca_box.svg';
import { ArrowUpRight, X } from 'lucide-react';

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCatalog?: () => void;
  onNavigateToSection?: (section: string) => void;
}

// Tape strip component for the authentic taped paper aesthetic
const TapeStrip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute w-10 sm:w-12 h-3.5 sm:h-4 bg-[#E8E6E1]/95 border border-ea-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.18)] pointer-events-none z-20 ${className}`}
    style={{
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px)',
    }}
  />
);

export const ManifestoModal: React.FC<ManifestoModalProps> = ({
  isOpen,
  onClose,
  onNavigateToCatalog,
  onNavigateToSection,
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGo = (target: string) => {
    onClose();
    if (target === 'proyectos') {
      if (onNavigateToCatalog) onNavigateToCatalog();
      else window.location.hash = '#proyectos';
    } else if (onNavigateToSection) {
      onNavigateToSection(target);
    } else {
      window.location.hash = `#${target}`;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manifesto-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10 select-none"
    >
      {/* 1. ARCHITECTURAL BLURRED BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-ea-black/70 backdrop-blur-md transition-opacity duration-300"
      />

      {/* 2. FLOATING DOSSIER WINDOW */}
      <div
        ref={modalContentRef}
        className="relative w-full max-w-[1080px] max-h-[90vh] bg-white border-2 border-ea-black shadow-[12px_12px_0px_rgba(0,0,0,1)] z-10 overflow-y-auto no-scrollbar flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Authentic Masking Tape Strips at Corners */}
        <TapeStrip className="-top-2 -left-3 -rotate-45" />
        <TapeStrip className="-top-2 -right-3 rotate-45" />
        <TapeStrip className="-bottom-2 -left-3 rotate-45" />
        <TapeStrip className="-bottom-2 -right-3 -rotate-45" />

        {/* Top Window Control Bar */}
        <div className="sticky top-0 z-30 bg-[#FAF9F6] border-b-2 border-ea-black px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-ea-black animate-pulse" />
            <span className="font-mono text-xs text-ea-black/70 uppercase tracking-widest">
              EXPEDIENTE EDITORIAL • VENTANA INDEPENDIENTE
            </span>
          </div>

          <button
            onClick={onClose}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 border border-ea-black bg-white hover:bg-ea-black text-ea-black hover:text-white transition-all text-xs font-anton tracking-wider uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
            data-cursor
            title="Cerrar ventana (Esc)"
          >
            <span>CERRAR</span>
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Inner Content */}
        <div className="p-6 sm:p-10 md:p-14 bg-white relative">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-ea-border mb-8">
            <div className="flex items-center gap-4">
              <img
                src={tagAcercaUrl}
                alt="Acerca de EA"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
              />
              <div>
                <span className="font-anton text-xs sm:text-sm tracking-widest uppercase text-ea-black/50 block">
                  MANIFIESTO Y PROPÓSITO
                </span>
                <h2
                  id="manifesto-title"
                  className="font-okcok text-3xl sm:text-5xl md:text-6xl uppercase tracking-normal leading-none text-ea-black mt-1"
                >
                  ACERCA DE ECUADORIAN ARCHITECTURE
                </h2>
              </div>
            </div>

            <div className="font-mono text-xs text-ea-black/60 uppercase tracking-widest">
              PLATAFORMA ACTIVA 2024–2026
            </div>
          </div>

          {/* Body: Editorial Text & Pillar Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Manifesto Quote & Text */}
            <div className="lg:col-span-7">
              <blockquote className="font-okcok text-2xl sm:text-3xl uppercase leading-tight text-ea-black mb-6">
                “UN ESPACIO DE CRÍTICA, DIFUSIÓN Y CONVERSACIÓN QUE CONECTA LA ARQUITECTURA CON SU TERRITORIO.”
              </blockquote>

              <p className="font-creato text-sm sm:text-base leading-relaxed text-ea-black/85 mb-4">
                Ecuadorian Architecture surge como un observatorio independiente dedicado a registrar, debatir y proyectar la producción arquitectónica contemporánea del país. Desde las cimas de la cordillera andina hasta los manglares del litoral y la cuenca amazónica, construimos un archivo crítico colectivo que rehúye el espectáculo mediático para enfocarse en la tectónica, la pertinencia material y el compromiso social de nuestras obras.
              </p>

              <p className="font-creato text-xs sm:text-sm leading-relaxed text-ea-black/70">
                Cada proyecto es publicado como un expediente monográfico que incluye planimetría técnica rigurosa (a escala y con orientación norte), corte bioclimático, memoria conceptual y una postura crítica honesta firmada por estudios pares.
              </p>
            </div>

            {/* Right: Pillars */}
            <div className="lg:col-span-5 flex flex-col gap-3.5">
              <div
                onClick={() => handleGo('proyectos')}
                className="border border-ea-black/25 hover:border-ea-black p-4 bg-[#FAF9F6] hover:bg-white transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                data-cursor
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-anton text-xs tracking-wider uppercase text-ea-black/60">
                    01 • MONOGRAFÍAS
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-ea-black/40 group-hover:text-ea-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h4 className="font-okcok text-lg sm:text-xl uppercase group-hover:underline">
                  7 OBRAS MONOGRÁFICAS
                </h4>
                <p className="font-creato text-xs text-ea-black/70 mt-0.5">
                  Planos técnicos, cortes termodinámicos y registro fotográfico en alta resolución.
                </p>
              </div>

              <div
                onClick={() => handleGo('territorios')}
                className="border border-ea-black/25 hover:border-ea-black p-4 bg-[#FAF9F6] hover:bg-white transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                data-cursor
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-anton text-xs tracking-wider uppercase text-ea-black/60">
                    02 • TERRITORIO
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-ea-black/40 group-hover:text-ea-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h4 className="font-okcok text-lg sm:text-xl uppercase group-hover:underline">
                  7 CARTOGRAFÍAS TERRITORIALES
                </h4>
                <p className="font-creato text-xs text-ea-black/70 mt-0.5">
                  Fricción ecológica, dinámicas fluviales y transformaciones del paisaje andino y costero.
                </p>
              </div>

              <div
                onClick={() => handleGo('academia')}
                className="border border-ea-black/25 hover:border-ea-black p-4 bg-[#FAF9F6] hover:bg-white transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                data-cursor
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-anton text-xs tracking-wider uppercase text-ea-black/60">
                    03 • ACADEMIA
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-ea-black/40 group-hover:text-ea-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h4 className="font-okcok text-lg sm:text-xl uppercase group-hover:underline">
                  7 INVESTIGACIONES & TESIS
                </h4>
                <p className="font-creato text-xs text-ea-black/70 mt-0.5">
                  Estudios de riesgo sísmico, arquitectura vernácula y biomateriales locales.
                </p>
              </div>
            </div>
          </div>

          {/* Action Row: CTAs */}
          <div className="mt-8 pt-6 border-t border-ea-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleGo('proyectos')}
                className="border-2 border-ea-black bg-ea-black text-white px-5 py-2.5 font-anton text-xs tracking-widest uppercase hover:bg-neutral-800 transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.4)] flex items-center gap-2 group cursor-pointer"
                data-cursor
              >
                <span>VER MÁS EN EL CATÁLOGO COMPLETO</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleGo('territorios')}
                className="border-2 border-ea-black bg-white text-ea-black px-5 py-2.5 font-anton text-xs tracking-widest uppercase hover:bg-ea-black hover:text-white transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex items-center gap-2 group cursor-pointer"
                data-cursor
              >
                <span>VER MÁS TERRITORIOS</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            <span className="font-mono text-xs text-ea-black/50 tracking-wider uppercase">
              QUITO • GUAYAQUIL • CUENCA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManifestoModal;
