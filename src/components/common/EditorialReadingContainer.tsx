import React from 'react';

interface EditorialReadingContainerProps {
  title?: string;
  subtitle?: string;
  date?: string;
  author?: string;
  leadParagraph?: string;
  children: React.ReactNode;
  className?: string;
}

export const EditorialReadingContainer: React.FC<EditorialReadingContainerProps> = ({
  title,
  subtitle,
  date,
  author,
  leadParagraph,
  children,
  className = '',
}) => {
  return (
    <div
      /*
        CONTENEDOR DE LECTURA EDITORIAL PRINCIPAL:
        - Desktop: max-w-[680px] estrictamente centralizado (margin: 0 auto).
        - Mobile: Ancho 100% con padding horizontal de seguridad de 20px (px-5).
        - Contención global: w-full max-w-full break-words para evitar desbordes.
      */
      className={`w-full max-w-[680px] mx-auto px-5 sm:px-6 md:px-0 py-8 select-text ${className}`}
    >
      {/* METADATA SUPERIOR */}
      {(date || author || subtitle) && (
        <header className="border-b border-ea-black/20 pb-4 mb-6 w-full max-w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] sm:text-xs uppercase text-ea-black/65 tracking-wider mb-2">
            {date && <span>{date}</span>}
            {date && author && <span className="opacity-40">•</span>}
            {author && <span className="font-bold text-ea-black">{author}</span>}
          </div>

          {subtitle && (
            <span className="block font-mono text-xs uppercase tracking-[0.16em] text-ea-black/55 mb-1.5 break-words">
              {subtitle}
            </span>
          )}

          {/* 
            TÍTULO PRINCIPAL EDITORIAL:
            - Tipografía fluida: clamp(1.75rem, 5vw, 2.25rem)
            - Contención elástica: break-words, hyphens-auto
          */}
          {title && (
            <h1 className="font-anton text-[clamp(1.75rem,5vw,2.25rem)] uppercase text-ea-black tracking-normal leading-[1.12] break-words [hyphens:auto] mt-1">
              {title}
            </h1>
          )}
        </header>
      )}

      {/* PÁRRAFO DE INTRODUCCIÓN / LEAD */}
      {leadParagraph && (
        <div className="w-full max-w-full mb-6">
          <p className="font-creato text-base sm:text-lg text-ea-black/90 font-medium leading-[1.62] break-words [hyphens:auto] border-l-2 border-ea-black pl-4 py-1 italic">
            {leadParagraph}
          </p>
        </div>
      )}

      {/* 
        CUERPO EDITORIAL:
        - line-height entre 1.6 y 1.65 para respiración tipográfica y prevención de fatiga
        - break-words y text-justify / hyphens automáticos
      */}
      <div className="w-full max-w-full font-creato text-sm sm:text-base text-ea-black/85 leading-[1.65] break-words [hyphens:auto] space-y-5">
        {children}
      </div>
    </div>
  );
};
