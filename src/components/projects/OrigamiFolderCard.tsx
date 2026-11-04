import React, { useState } from 'react';
import { ArrowRight, Eye } from 'lucide-react';
import { BROCHURE_FULL_PATH, BROCHURE_OUTER_PATH } from './folderPaths';

export interface ProjectFolderData {
  id: string;
  number?: string;
  title: string;
  studio: string;
  critic?: string;
  location: string;
  year: string;
  excerpt: string;
  heroImage?: string;
  heroImagePosition?: string;
  heroImageFocalPoint?: string;
  imageUrl?: string;
  category?: string;
  resena?: string;
  memory?: string;
  secondaryExcerpt?: string;
  photographer?: string;
  fotografo?: string;
  datos?: {
    fotografia?: string;
    superficie?: string;
    estructura?: string;
    colaboradores?: string;
    certificacion?: string;
  };
  visitas?: number | string;
  comentarios?: number | string;
  type?: 'proyectos' | 'territorios' | 'academia' | string;
  hasVisitas?: boolean;
  renders?: string;
}

interface OrigamiFolderCardProps {
  project: ProjectFolderData;
  index?: number;
  onSelect: (projectId: string) => void;
}

export const OrigamiFolderCard: React.FC<OrigamiFolderCardProps> = ({
  project,
  index = 0,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Controlled organic angle variance in idle state (-0.8deg to +0.6deg)
  const restingTilts = [-0.7, 0.5, -0.4, 0.6, -0.5, 0.3];
  const restingRotation = restingTilts[index % restingTilts.length];

  const photoUrl =
    project.heroImage ||
    project.imageUrl ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  const handleClick = (e: React.MouseEvent) => {
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
    if (isTouch && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    onSelect(project.id);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={`origami-folder-card relative w-[min(345px,calc(100vw-2.25rem))] h-[414px] max-w-[345px] cursor-pointer select-none transition-all duration-500 ease-out shrink-0 ${
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
      {/* 1. DOSSIER INTERIOR (Unobstructed Interior with Visible Breathing Room)    */}
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
        {/* Paper Background SVG matching hand-drawn doodle silhouette */}
        <svg
          width="345"
          height="414"
          viewBox="0 0 345 414"
          fill="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path d={BROCHURE_OUTER_PATH} fill="#FAF8F5" />
          <path d={BROCHURE_FULL_PATH} fill="black" />
        </svg>

        {/* Interior Editorial Content Spread - Compact with visible breathing room */}
        <div
          className={`absolute left-[46px] right-[38px] top-[92px] bottom-[32px] flex flex-col justify-between z-10 transition-all duration-400 ease-out ${
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          {/* Top metadata row inside dossier */}
          <div className="flex items-center justify-between border-b border-ea-black/20 pb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 bg-ea-black rounded-full shrink-0" />
              <span className="font-anton text-[10px] tracking-wider uppercase text-ea-black/80 truncate">
                {project.location} — {project.year}
              </span>
            </div>
            <span className="font-mono text-[10.5px] font-bold text-ea-black/55 shrink-0 ml-1">
              {project.number || `#0${index + 1}`}
            </span>
          </div>

          {/* Compact Architectural Photograph */}
          <div className="relative w-full h-[114px] my-1 bg-ea-offwhite border border-ea-black/35 overflow-hidden shadow-xs shrink-0">
            <img
              src={photoUrl}
              alt={project.title}
              className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                isOpen
                  ? 'grayscale-0 scale-105 contrast-105'
                  : 'grayscale contrast-120 scale-100'
              }`}
              style={{
                objectPosition:
                  project.heroImagePosition ||
                  (project.heroImageFocalPoint === 'top'
                    ? 'center 20%'
                    : project.heroImageFocalPoint === 'bottom'
                    ? 'center 80%'
                    : 'center 50%'),
              }}
              loading="lazy"
            />
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-white font-mono text-[8.5px] uppercase tracking-wider backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <Eye className="w-2.5 h-2.5" />
              <span>REGISTRO FOTOGRÁFICO</span>
            </div>
          </div>

          {/* Generous & Highly Legible Editorial Critique Preview */}
          <div className="flex-1 flex flex-col justify-center py-0.5 overflow-hidden">
            <div className="text-[8.5px] font-anton tracking-widest text-ea-black/55 uppercase mb-0.5">
              PREVISUALIZACIÓN CRÍTICA / EXTRACTO:
            </div>
            <p className="font-creato text-[11px] leading-[14px] text-ea-black/90 uppercase line-clamp-3">
              "{project.excerpt}"
            </p>
          </div>

          {/* Call-to-action button */}
          <div className="pt-1.5 border-t border-ea-black/20 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(project.id);
              }}
              className="w-full py-1.5 px-3 bg-ea-black text-white hover:bg-black/90 rounded-xs flex items-center justify-between transition-all shadow-sm cursor-pointer min-h-[36px]"
            >
              <span className="font-anton text-[10px] tracking-wider uppercase">
                LEER CRÍTICA MONOGRÁFICA
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
      {/* 2. FRONT COVER (Tapa Frontal con bisagra 3D izquierda)                     */}
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
        {/* Hand-drawn Paper Folder SVG */}
        <svg
          width="345"
          height="414"
          viewBox="0 0 345 414"
          fill="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path d={BROCHURE_OUTER_PATH} fill="#FAF8F5" />
          <path d={BROCHURE_FULL_PATH} fill="black" />
        </svg>

        {/* Front Cover Idle Content: Title + Studio */}
        <div
          className={`absolute left-[46px] right-[38px] top-[94px] bottom-[34px] flex flex-col justify-between pointer-events-auto z-30 transition-opacity duration-200 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Top cover metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-ea-black rounded-full opacity-80" />
              <span className="font-anton text-[9.5px] tracking-widest uppercase text-ea-black/60">
                EXPEDIENTE {project.number || `#0${index + 1}`}
              </span>
            </div>

            <span className="font-mono text-[10.5px] font-bold text-ea-black/45 tracking-wider">
              [{project.year}]
            </span>
          </div>

          {/* Center Paper Area */}
          <div className="flex-1 flex flex-col justify-center items-start pl-1">
            <div className="w-12 h-0.5 bg-ea-black/20 mb-2" />
            <span className="font-anton text-[9.5px] tracking-widest text-ea-black/40 uppercase">
              {project.location} • ARCHIVO MONOGRÁFICO
            </span>
          </div>

          {/* Bottom Left Cover Typography: Title in OKCOK + Studio in Anton */}
          <div className="flex flex-col justify-end text-left pt-2.5 border-t border-ea-black/15">
            <h3 className="font-okcok text-[22px] sm:text-[24px] leading-[25px] uppercase text-ea-black tracking-tight">
              {project.title}
            </h3>
            <p className="font-anton text-[13px] sm:text-[14px] leading-[17px] tracking-wider text-ea-black/70 uppercase mt-0.5">
              {project.studio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
