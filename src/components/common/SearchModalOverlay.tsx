import React, { useEffect, useRef, useState } from 'react';
import { Search, X, ArrowUpRight, Building2, MapPin, Calendar, Compass } from 'lucide-react';

export interface SearchResultItem {
  id: string;
  title: string;
  studio: string;
  location: string;
  year?: string;
  category: 'proyectos' | 'academia' | 'territorios';
  excerpt: string;
  imageUrl?: string;
}

interface SearchModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (item: SearchResultItem) => void;
  mockResults?: SearchResultItem[];
}

export const SearchModalOverlay: React.FC<SearchModalOverlayProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  mockResults = [],
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'proyectos' | 'academia' | 'territorios'>('todos');
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Bloqueo estricto del scroll de body cuando el modal está activo
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Auto-foco ergonómico con ligero delay para permitir montaje fluido
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtrado resiliente con contención
  const filtered = mockResults.filter((item) => {
    const matchesFilter = activeFilter === 'todos' || item.category === activeFilter;
    const q = query.toLowerCase().trim();
    if (!q) return matchesFilter;
    const inTitle = item.title.toLowerCase().includes(q);
    const inStudio = item.studio.toLowerCase().includes(q);
    const inLocation = item.location.toLowerCase().includes(q);
    return matchesFilter && (inTitle || inStudio || inLocation);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 backdrop-blur-sm transition-opacity duration-200"
    >
      {/* 
        CONTENEDOR PRINCIPAL:
        - Mobile: Pantalla completa obligatoria (100vw, 100dvh) para evitar teclado flotante cortado.
        - Desktop (md+): Ventana flotante centralizada (max-w-2xl), con margen superior de respiro.
        - Animación de entrada: opacity y translateY suave (200ms ease-out).
      */}
      <div className="relative flex flex-col w-full h-[100dvh] md:h-auto md:max-h-[85vh] md:max-w-2xl md:mt-16 bg-[#FAF8F5] md:border-2 md:border-ea-black md:shadow-[8px_8px_0px_#000000] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        
        {/* ENCABEZADO Y CAMPO DE BÚSQUEDA */}
        <header className="flex flex-col border-b-2 border-ea-black bg-white px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-center justify-between pb-2.5">
            <span
              id="modal-search-title"
              className="font-anton text-xs sm:text-sm uppercase tracking-[0.18em] text-ea-black/50"
            >
              EXPLORADOR DE ARQUITECTURA ECUATORIANA
            </span>

            {/* BOTÓN DE CIERRE ERGONÓMICO: Mínimo 44x44px táctil para pulgar en móviles */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar buscador"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ea-black/60 hover:text-ea-black hover:bg-black/5 active:scale-95 transition-all rounded-[2px] cursor-pointer -mr-2"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* INPUT BAR CON ÁREA TÁCTIL EXPANDIDA */}
          <div className="relative flex items-center w-full min-h-[44px] bg-[#FAF8F5] border border-ea-black px-3.5 mt-1 focus-within:ring-2 focus-within:ring-ea-black transition-all">
            <Search className="w-5 h-5 text-ea-black/60 shrink-0 mr-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por proyecto, estudio o ciudad..."
              className="w-full h-full py-2 bg-transparent font-creato text-sm sm:text-base text-ea-black placeholder:text-ea-black/45 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-ea-black/40 hover:text-ea-black transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* FILTROS TÁCTILES RÁPIDOS: touch-target >= 44px de altura, espaciado >= 10px */}
          <div className="flex items-center gap-2.5 pt-3 overflow-x-auto no-scrollbar">
            {(['todos', 'proyectos', 'academia', 'territorios'] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`min-h-[44px] px-3.5 py-2 text-xs font-mono uppercase font-bold tracking-wider rounded-[2px] border transition-all cursor-pointer select-none active:scale-95 shrink-0 ${
                    isActive
                      ? 'bg-ea-black text-white border-ea-black shadow-[2px_2px_0px_#000000]'
                      : 'bg-white text-ea-black/75 border-ea-black/40 hover:border-ea-black hover:text-ea-black'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </header>

        {/* LISTA DE RESULTADOS CON BLINDAJE TIPOGRÁFICO ANTI-DESBORDAMIENTO */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-14 text-center">
              <Compass className="w-10 h-10 stroke-[1.4] mx-auto text-ea-black/30 mb-2" />
              <p className="font-anton text-base uppercase tracking-wider text-ea-black/70">
                No se encontraron expedientes
              </p>
              <p className="font-creato text-xs text-ea-black/50 mt-1 max-w-xs mx-auto break-words">
                Prueba buscando por términos como &ldquo;hormigón&rdquo;, &ldquo;Quito&rdquo;, &ldquo;Al Borde&rdquo; o &ldquo;vivienda&rdquo;.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id}
                onClick={() => {
                  onSelectResult(item);
                  onClose();
                }}
                /* ZONA TÁCTIL MÍNIMA 44px + Feedback táctil activo (active:scale-[0.98]) */
                className="group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-white border border-ea-black/20 hover:border-ea-black hover:shadow-[3px_3px_0px_#000000] active:scale-[0.98] transition-all cursor-pointer rounded-[2px] w-full max-w-full overflow-hidden"
              >
                {/* THUMBNAIL CON ASPECT RATIO FIJO PARA EVITAR CLS */}
                {item.imageUrl && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#EAE6DD] border border-ea-black/15 overflow-hidden rounded-[1px]">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* CONTENEDOR DE TEXTO RESILIENTE (min-w-0 esencial en flexbox) */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-ea-black/50 bg-[#EAE6DD] px-1.5 py-0.5 rounded-[1px] tracking-widest shrink-0">
                      {item.category}
                    </span>
                    <span className="font-mono text-[11px] text-ea-black/60 truncate">
                      {item.location} {item.year ? `• ${item.year}` : ''}
                    </span>
                  </div>

                  {/* TÍTULO CON CONTENCIÓN ANTI-OVERFLOW Y TRUNCADO MULTILÍNEA */}
                  <h4 className="font-anton text-sm sm:text-base uppercase text-ea-black tracking-wide leading-snug line-clamp-2 break-words overflow-hidden [hyphens:auto]">
                    {item.title}
                  </h4>

                  {/* EXTRACTO SECUNDARIO TRUNCADO */}
                  <p className="font-creato text-xs text-ea-black/65 line-clamp-1 break-words mt-0.5">
                    {item.studio} — {item.excerpt}
                  </p>
                </div>

                {/* ACCIÓN ERGONÓMICA DE NAVEGACIÓN */}
                <div className="shrink-0 w-8 h-8 flex items-center justify-center text-ea-black/40 group-hover:text-ea-black group-hover:translate-x-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                </div>
              </article>
            ))
          )}
        </div>

        {/* PIE DE DIÁLOGO */}
        <footer className="border-t border-ea-black/15 bg-[#FAF8F5] px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-ea-black/50">
          <span>{filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}</span>
          <span className="hidden sm:inline">ESC para cerrar</span>
        </footer>
      </div>
    </div>
  );
};
