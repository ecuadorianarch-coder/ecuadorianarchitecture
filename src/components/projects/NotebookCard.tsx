import React, { useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { NOTEBOOK_FULL_PATH, NOTEBOOK_OUTER_PATH } from './folderPaths';
import { buildProjectImageAlt, toSeoImageUrl } from '../../services/architectureSeo';

export interface AcademiaItemData {
  id: string;
  number?: string;
  title: string;
  institution: string;
  studio?: string;
  universidad: string;
  problematica: string;
  situacion: string;
  location: string;
  year: string;
  excerpt: string;
  heroImage?: string;
}

interface NotebookCardProps {
  item: AcademiaItemData;
  index?: number;
  onSelect: (id: string) => void;
}

export const NotebookCard: React.FC<NotebookCardProps> = ({
  item,
  index = 0,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Controlled organic angle variance in idle state
  const restingTilts = [-0.6, 0.4, -0.5, 0.5, -0.4, 0.3];
  const restingRotation = restingTilts[index % restingTilts.length];

  const photoUrl =
    item.heroImage ||
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80';

  const handleClick = (e: React.MouseEvent) => {
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
    if (isTouch && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    onSelect(item.id);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={`notebook-card relative w-[min(345px,calc(100vw-2.25rem))] h-[414px] max-w-[345px] cursor-pointer select-none transition-all duration-500 ease-out shrink-0 ${
        isOpen ? 'z-50' : 'z-10'
      }`}
      style={{
        perspective: '1400px',
        transformStyle: 'preserve-3d',
        transform: isOpen
          ? 'rotate(0deg) translateY(-12px) scale(1.03)'
          : `rotate(${restingRotation}deg) translateY(0px) scale(1)`,
      }}
      data-cursor
    >
      {/* ========================================================================= */}
      {/* 1. INTERIOR SPREAD (Dossier Interior de Investigación)                     */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-auto transition-all duration-500 ease-out"
        style={{
          transform: 'translateZ(0px)',
          filter: isOpen
            ? 'drop-shadow(0 22px 32px rgba(0, 0, 0, 0.20))'
            : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))',
        }}
      >
        {/* Pure Vector Spiral Notebook SVG - Crisp at any resolution */}
        <svg
          width="345"
          height="414"
          viewBox="0 0 345 414"
          fill="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path d={NOTEBOOK_OUTER_PATH} fill="#FAF8F5" />
          <path d={NOTEBOOK_FULL_PATH} fill="black" fillRule="evenodd" />
        </svg>

        {/* Interior Editorial Content Spread - Compact with visible breathing room */}
        <div
          className={`absolute left-[58px] right-[36px] top-[46px] bottom-[32px] flex flex-col justify-between z-10 transition-all duration-400 ease-out ${
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          {/* Top metadata row inside notebook */}
          <div className="flex items-center justify-between border-b border-ea-black/20 pb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 bg-ea-black rounded-full shrink-0" />
              <span className="font-anton text-[9.5px] tracking-wider uppercase text-ea-black/80 truncate">
                {item.universidad} — {item.year}
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-ea-black/55 shrink-0 ml-1">
              {item.number || `#0${index + 1}`}
            </span>
          </div>

          {/* Compact Architectural & Scientific Photograph */}
          <div className="relative w-full h-[112px] my-1 bg-ea-offwhite border border-ea-black/35 overflow-hidden shadow-xs shrink-0">
            <img
              src={toSeoImageUrl(photoUrl, item, 'academia')}
              alt={buildProjectImageAlt(item, 'Investigación académica')}
              className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                isOpen
                  ? 'grayscale-0 scale-105 contrast-105'
                  : 'grayscale contrast-120 scale-100'
              }`}
              loading="lazy"
            />
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-white font-mono text-[8.5px] uppercase tracking-wider backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <BookOpen className="w-2.5 h-2.5" />
              <span>REGISTRO DE CAMPO</span>
            </div>
          </div>

          {/* Generous & Highly Legible Editorial Research Preview */}
          <div className="flex-1 flex flex-col justify-center py-0.5 overflow-hidden">
            <div className="text-[8.5px] font-anton tracking-widest text-ea-black/55 uppercase mb-0.5">
              INVESTIGACIÓN / EXTRACTO CRÍTICO:
            </div>
            <p className="font-creato text-[11px] leading-[14px] text-ea-black/90 uppercase line-clamp-3">
              "{item.excerpt}"
            </p>
          </div>

          {/* Call-to-action button */}
          <div className="pt-1.5 border-t border-ea-black/20 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
              className="w-full py-1.5 px-3 bg-ea-black text-white hover:bg-black/90 rounded-xs flex items-center justify-between transition-all shadow-sm cursor-pointer min-h-[36px]"
            >
              <span className="font-anton text-[10px] tracking-wider uppercase">
                LEER INVESTIGACIÓN COMPLETA
              </span>
              <ArrowRight
                className={`w-3 h-3 transition-transform duration-300 ${
                  isOpen ? 'translate-x-1' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FRONT COVER (Tapa Frontal del Cuaderno - 3D hinge on left)              */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-auto z-20 transition-all duration-550 ease-out"
        style={{
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
          transform: isOpen
            ? 'rotateY(-106deg) scale(0.96) translateZ(12px)'
            : 'rotateY(0deg) scale(1) translateZ(4px)',
          filter: isOpen
            ? 'drop-shadow(-20px 22px 28px rgba(0, 0, 0, 0.32))'
            : 'drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.08))',
        }}
      >
        {/* Pure Vector Spiral Notebook SVG - Crisp at any resolution */}
        <svg
          width="345"
          height="414"
          viewBox="0 0 345 414"
          fill="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path d={NOTEBOOK_OUTER_PATH} fill="#FAF8F5" />
          <path d={NOTEBOOK_FULL_PATH} fill="black" fillRule="evenodd" />
        </svg>

        {/* Front Cover Idle Content: Title + Institution + Metadata */}
        <div
          className={`absolute left-[58px] right-[36px] top-[48px] bottom-[34px] flex flex-col justify-between pointer-events-auto z-30 transition-opacity duration-200 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Top cover metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-ea-black rounded-full opacity-80" />
              <span className="font-anton text-[9.5px] tracking-widest uppercase text-ea-black/60">
                EXP. ACADÉMICO {item.number || `#0${index + 1}`}
              </span>
            </div>

            <span className="font-mono text-[10.5px] font-bold text-ea-black/45 tracking-wider">
              [{item.year}]
            </span>
          </div>

          {/* Center Paper Area: Lined Paper feel */}
          <div className="flex-1 flex flex-col justify-center items-start pl-1 space-y-1.5">
            <div className="w-12 h-0.5 bg-ea-black/20" />
            <span className="font-anton text-[9.5px] tracking-widest text-ea-black/50 uppercase">
              {item.universidad}
            </span>
            <span className="font-creato text-[10.5px] text-ea-black/70 uppercase">
              {item.problematica}
            </span>
            <div className="inline-block px-1.5 py-0.5 bg-ea-black/5 border border-ea-black/15 text-[9px] font-mono uppercase tracking-wider text-ea-black/80">
              {item.situacion}
            </div>
          </div>

          {/* Bottom Typography: Title in OKCOK + Institution in Anton */}
          <div className="flex flex-col justify-end text-left pt-2.5 border-t border-ea-black/15">
            <h3 className="font-okcok text-[21px] sm:text-[23px] leading-[24px] uppercase text-ea-black tracking-tight">
              {item.title}
            </h3>
            <p className="font-anton text-[12.5px] sm:text-[13.5px] leading-[16px] tracking-wider text-ea-black/70 uppercase mt-0.5">
              {item.institution}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
