import React, { useState } from 'react';
import { ArrowUpRight, MapPin, Calendar, Compass, User } from 'lucide-react';

export interface ProjectCardData {
  id: string;
  title: string;
  studio: string;
  location: string;
  year: string;
  excerpt: string;
  imageUrl: string;
  heroImagePosition?: string;
  heroImageFocalPoint?: string;
  category?: string;
  critiqueCount?: number;
  visitsCount?: number;
}

interface CatalogProjectCardProps {
  project: ProjectCardData;
  index?: number;
  onSelect: (projectId: string) => void;
}

export const CatalogProjectCard: React.FC<CatalogProjectCardProps> = ({
  project,
  index = 0,
  onSelect,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <article
      onClick={() => onSelect(project.id)}
      /*
        ZONA TÁCTIL GLOBAL Y ERGONOMÍA:
        - Toda la tarjeta es clicable con active scale (scale-[0.98])
        - width 100%, max-width 100% estricto para evitar desbordes en rejillas móviles
      */
      className="group relative flex flex-col w-full max-w-full bg-[#FAF8F5] border-2 border-ea-black rounded-[2px] shadow-[4px_4px_0px_#000000] hover:shadow-[7px_7px_0px_#000000] hover:-translate-y-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden select-none"
      aria-label={`Ver expediente del proyecto ${project.title}`}
    >
      {/* 
        1. CONTENEDOR DE IMAGEN CON ASPECT RATIO FIJO:
        - aspect-[16/10] previene Cumulative Layout Shift (CLS)
        - Skeleton loader gris cálido (#EAE6DD) mientras carga
      */}
      <div className="relative w-full aspect-[16/10] bg-[#EAE6DD] border-b-2 border-ea-black overflow-hidden">
        {/* Skeleton de carga mientras la imagen se descarga */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#EAE6DD] animate-pulse flex items-center justify-center">
            <Compass className="w-8 h-8 text-ea-black/20 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        )}

        <img
          src={project.imageUrl}
          alt={`Fotografía del proyecto ${project.title}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
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
        />

        {/* Píldora de Categoría / Número Superior */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest bg-ea-black text-white px-2 py-0.5 rounded-[1px] shadow-[2px_2px_0px_#ffffff]">
            EXPEDIENTE #{String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Badge de Ubicación y Año */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#FAF8F5]/95 backdrop-blur-sm border border-ea-black px-2 py-0.5 rounded-[1px] font-mono text-[10px] uppercase font-bold text-ea-black shadow-[2px_2px_0px_#000000]">
          <MapPin className="w-3 h-3 stroke-[2.2]" />
          <span>{project.location}</span>
          <span className="opacity-40">•</span>
          <span>{project.year}</span>
        </div>
      </div>

      {/* 
        2. CONTENEDOR EDITORIAL CON BLINDAJE TIPOGRÁFICO:
        - padding horizontal de seguridad de 16px a 20px
        - break-words y line-clamp para contención elástica total
      */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between w-full max-w-full min-w-0">
        <div className="w-full max-w-full min-w-0">
          
          {/* AUTOR / ESTUDIO */}
          <div className="flex items-center gap-1.5 text-ea-black/60 font-mono text-[11px] uppercase tracking-wider mb-1.5 truncate">
            <User className="w-3 h-3 stroke-[2] shrink-0" />
            <span className="font-bold text-ea-black truncate">{project.studio}</span>
          </div>

          {/* 
            TÍTULO DEL PROYECTO:
            - Tipografía fluida: clamp(1.125rem, 3vw, 1.35rem)
            - Contención por elipsis multilínea: line-clamp-2
            - Anti-overflow: break-words, hyphens-auto
          */}
          <h3
            className="font-anton text-[clamp(1.125rem,2.8vw,1.35rem)] uppercase text-ea-black tracking-wide leading-tight line-clamp-2 break-words overflow-hidden [hyphens:auto] mb-2"
            title={project.title}
          >
            {project.title}
          </h3>

          {/* EXTRACTO EDITORIAL */}
          <p className="font-creato text-xs sm:text-[13px] text-ea-black/75 leading-relaxed line-clamp-2 break-words [hyphens:auto] mb-4">
            {project.excerpt}
          </p>
        </div>

        {/* 
          3. BOTÓN DE ACCIÓN / FOOTER TÁCTIL:
          - Altura mínima táctil de 44px
          - Interacción táctil optimizada para dedos
        */}
        <div className="pt-3 border-t border-dashed border-ea-black/25 flex items-center justify-between w-full">
          <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase text-ea-black/60">
            {project.critiqueCount !== undefined && (
              <span>{project.critiqueCount} críticas</span>
            )}
            {project.visitsCount !== undefined && (
              <>
                <span className="opacity-40">•</span>
                <span>{project.visitsCount} visitas</span>
              </>
            )}
          </div>

          <div
            /* Área táctil mínima de 44px de altura */
            className="min-h-[44px] inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ea-black group-hover:text-black group-hover:underline transition-all"
          >
            <span>EXPEDIENTE</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.4] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </article>
  );
};
