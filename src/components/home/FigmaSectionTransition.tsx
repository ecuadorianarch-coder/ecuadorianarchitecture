import React from 'react';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import logoExtendidoUrl from '../../assets/logos/logo_extendido.svg';
import transicionAcademiaFigmaUrl from '../../assets/logos/transicion_academia_figma.png';

export type TransitionSectionType = 'proyectos' | 'territorios' | 'academia';

export interface TransitionMeta {
  id: string;
  figmaNodeId: string;
  frameName: string;
  title: string;
  tagline: string;
  iconUrl: string;
  iconAlt: string;
  figmaImage?: string;
}

export const TRANSITION_CONFIG: Record<TransitionSectionType, TransitionMeta> = {
  proyectos: {
    id: 'transicion-proyectos',
    figmaNodeId: '#134:2292',
    frameName: 'TRANSCION PROYECTOS',
    title: 'PROYECTOS',
    tagline: 'archivo vivo, arquitectura contemporánea.',
    iconUrl: tagProyectosUrl,
    iconAlt: 'Doodle Arquitectura Proyectos',
  },
  territorios: {
    id: 'transicion-territorios',
    figmaNodeId: '#140:2693',
    frameName: 'TRANSCION TERRITORIOS',
    title: 'TERRITORIOS',
    tagline: 'cartografías, paisajes y dinámicas del territorio.',
    iconUrl: tagCiudadUrl,
    iconAlt: 'Doodle Territorios y Montañas',
  },
  academia: {
    id: 'transicion-academia',
    figmaNodeId: '#134:2514',
    frameName: 'TRANSCION ACADEMIA',
    title: 'ACADEMIA',
    tagline: 'pensamiento libre, conocimiento abierto.',
    iconUrl: tagDatosUrl,
    iconAlt: 'Doodle Libreta e Investigación',
    figmaImage: transicionAcademiaFigmaUrl,
  },
};

interface FigmaSectionTransitionProps {
  section: TransitionSectionType;
  onActionClick?: () => void;
  actionText?: string;
  isOverlay?: boolean;
  className?: string;
  badgeRef?: React.RefObject<HTMLSpanElement | null>;
  titleRef?: React.RefObject<HTMLHeadingElement | null>;
  descRef?: React.RefObject<HTMLParagraphElement | null>;
  lineRef?: React.RefObject<HTMLDivElement | null>;
  iconRef?: React.RefObject<HTMLImageElement | null>;
  btnRef?: React.RefObject<HTMLButtonElement | null>;
  preferDirectFigmaImage?: boolean;
}

/**
 * FigmaSectionTransition
 *
 * 1:1 Authentic Recreation of the Figma Transition Frames:
 * - TRANSCION PROYECTOS (#134:2292)
 * - TRANSCION TERRITORIOS (#140:2693)
 * - TRANSCION ACADEMIA (#134:2514)
 *
 * Design Spec (Source of Truth: media_1793048468136_2c7bd399.png):
 * 1. Pitch-black solid canvas (#000000 / bg-black). NO gradients, NO stripes.
 * 2. NO decorative technical brackets (┌ ┐ └ ┘), NO node IDs (#134:2514), NO aspect ratio text.
 * 3. NO chapter badges, NO buttons inside the frame.
 * 4. Centered horizontal lockup:
 *    - Left: Authentic hand-drawn sketch icon (crisp inverted white).
 *    - Right: Handwritten title in OKCOK font + clean lowercase motto underneath.
 * 5. Bottom Center: ECUADORIAN [ea] ARCHITECTURE logo in pure white.
 */
export const FigmaSectionTransition: React.FC<FigmaSectionTransitionProps> = ({
  section,
  onActionClick,
  isOverlay = false,
  className = '',
  titleRef,
  descRef,
  iconRef,
  preferDirectFigmaImage = false,
}) => {
  const config = TRANSITION_CONFIG[section] || TRANSITION_CONFIG.proyectos;

  // If user explicitly asks for the direct raster Figma export on Academia and not in an overlay
  if (preferDirectFigmaImage && config.figmaImage && !isOverlay) {
    return (
      <div
        onClick={onActionClick}
        className={`group/transition relative w-full bg-black text-white flex items-center justify-center select-none overflow-hidden ${
          isOverlay
            ? 'h-full p-4'
            : 'aspect-[16/10] min-h-[460px] max-h-[85vh] sm:min-h-[540px] md:min-h-[620px] lg:min-h-[720px] p-6'
        } ${onActionClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <img
          src={config.figmaImage}
          alt={config.frameName}
          draggable={false}
          className="w-full max-w-4xl h-auto max-h-[80vh] object-contain select-none"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onActionClick}
      className={`group/transition relative w-full bg-black text-white flex flex-col items-center justify-center select-none overflow-hidden ${
        isOverlay
          ? 'h-full px-6 py-8'
          : 'aspect-[16/10] min-h-[460px] max-h-[85vh] sm:min-h-[540px] md:min-h-[620px] lg:min-h-[720px] px-6 py-12'
      } ${onActionClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Central Figma Lockup: Doodle on Left, Title + Motto on Right */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-14 max-w-4xl mx-auto px-4 -mt-6 sm:-mt-8">
        {/* Authentic Hand-Drawn Sketch Icon from Figma (Inverted to Pure Crisp White) */}
        <div className="flex items-center justify-center shrink-0">
          <img
            ref={iconRef}
            src={config.iconUrl}
            alt={config.iconAlt}
            draggable={false}
            className={`w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 object-contain brightness-0 invert opacity-95 transition-transform duration-500 group-hover/transition:scale-105 ${
              isOverlay ? 'opacity-0' : ''
            }`}
          />
        </div>

        {/* Text Block: Title in font-okcok + Clean Poetic Lowercase Motto */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h2
            ref={titleRef}
            className={`font-okcok text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-wider text-white leading-none ${
              isOverlay ? 'opacity-0' : ''
            }`}
          >
            {config.title}
          </h2>

          <p
            ref={descRef}
            className={`font-creato text-xs sm:text-sm md:text-base lg:text-lg text-white/95 font-medium tracking-wide lowercase mt-2 sm:mt-3 ${
              isOverlay ? 'opacity-0' : ''
            }`}
          >
            {config.tagline}
          </p>
        </div>
      </div>

      {/* Authentic Figma Brand Logo at Bottom Center */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none select-none z-10">
        <img
          src={logoExtendidoUrl}
          alt="Ecuadorian Architecture"
          draggable={false}
          className="w-44 sm:w-56 md:w-64 lg:w-72 h-auto brightness-0 invert opacity-90 object-contain"
        />
      </div>
    </div>
  );
};

export default FigmaSectionTransition;
