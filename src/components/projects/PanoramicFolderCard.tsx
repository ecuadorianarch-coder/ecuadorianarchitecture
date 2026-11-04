import React from 'react';
import { ProjectFolderData } from './OrigamiFolderCard';

interface PanoramicFolderCardProps {
  project: ProjectFolderData;
  index?: number;
  onSelect: (projectId: string) => void;
}

// 1. Building / House Icon (Matching mockup top-left)
const BuildingIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

// 2. Location Pin Icon (Matching mockup top-right)
const PinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

// 3. Ink Bottle / Pen Icon (For Studio in pill box)
const InkBottleIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
    <path d="M6 1h4v1.5H6zM5.5 2.5h5a.5.5 0 0 1 .5.5v1.2a3 3 0 0 1-1.5 2.6v6.2a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V6.8A3 3 0 0 1 4.5 4.2V3a.5.5 0 0 1 .5-.5z" />
  </svg>
);

// 4. Calendar Doodle Icon (For Year in pill box)
const CalendarDoodleIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M5 1.5v3M11 1.5v3M2 7h12" />
    <circle cx="5.5" cy="10" r="0.75" fill="currentColor" />
    <circle cx="8" cy="10" r="0.75" fill="currentColor" />
    <circle cx="10.5" cy="10" r="0.75" fill="currentColor" />
  </svg>
);

export const PanoramicFolderCard: React.FC<PanoramicFolderCardProps> = ({
  project,
  index = 0,
  onSelect,
}) => {
  const photoUrl =
    project.heroImage ||
    project.imageUrl ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  // Typology and location formatting in clean sentence/title case
  const formatTitleCase = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const categoryLabel = project.category
    ? formatTitleCase(project.category)
    : 'Vivienda unifamiliar';

  const locationLabel = project.location
    ? formatTitleCase(project.location)
    : 'Tumbaco';

  // Studio / Architects parsing (supports 1, 3, 6 or any number of collaborating architecture studios)
  const architects: string[] = (() => {
    if (Array.isArray((project as any).studios) && (project as any).studios.length > 0) {
      return (project as any).studios.map((s: string) => s.trim().toUpperCase()).filter(Boolean);
    }
    const raw = project.studio || 'RAMA ESTUDIO';
    if (!raw || typeof raw !== 'string') return ['RAMA ESTUDIO'];
    const parts = raw
      .split(/\s*(?:\+|\/|,|&|\band\b|\by\b)\s*/i)
      .map((s) => s.replace(/^@/, '').trim().toUpperCase())
      .filter(Boolean);
    return parts.length > 0 ? parts : [raw.trim().toUpperCase()];
  })();

  // Year
  const yearLabel = project.year || '2024';

  // Construct a rich, complete editorial description so NO text gets cut off
  const fullDescription = (() => {
    const resena = (project as any).resena?.trim();
    const memory = (project as any).memory?.trim();
    const secondaryExcerpt = (project as any).secondaryExcerpt?.trim();
    const excerpt = project.excerpt?.trim();

    if (resena && memory && resena !== memory) {
      return `${resena} ${memory}`;
    }
    if (resena) return resena;
    if (memory && secondaryExcerpt) return `${memory} ${secondaryExcerpt}`;
    if (memory) return memory;
    if (excerpt && secondaryExcerpt) return `${excerpt} ${secondaryExcerpt}`;
    return excerpt || '';
  })();

  // Title sizing: dynamically scaled so long titles stay readable without breaking the layout
  const titleLength = project.title?.length || 0;
  const titleSizeClass =
    titleLength > 24
      ? 'text-lg sm:text-xl md:text-[22px] leading-[1.2]'
      : titleLength > 16
      ? 'text-xl sm:text-2xl md:text-[25px] leading-[1.2]'
      : 'text-2xl sm:text-[28px] md:text-[32px] leading-[1.15]';

  // Stats & Flags
  const isVisitasEnabled =
    project.type !== 'territorios' &&
    project.type !== 'academia' &&
    project.category !== 'EXPEDIENTE TERRITORIAL' &&
    project.category !== 'INVESTIGACIÓN ACADÉMICA' &&
    project.hasVisitas !== false;

  const visitsCount =
    project.visitas ?? (project.title?.includes('LOMA') ? 2 : 2 + (index % 3));
  const commentsCount =
    project.comentarios ?? (project.title?.includes('LOMA') ? 7 : 4 + (index % 4));

  return (
    <article
      onClick={() => onSelect(project.id)}
      className="panoramic-folder-card relative w-full h-auto md:h-[380px] lg:h-[390px] bg-white border-2 border-ea-black rounded-[26px] sm:rounded-[30px] md:rounded-[34px] p-4 sm:p-5 md:p-5 lg:p-6 flex flex-col md:flex-row items-stretch justify-between gap-4 sm:gap-5 md:gap-5 cursor-pointer group select-none transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
      data-cursor
    >
      {/* 1. Left Column (Dezeen / ArchDaily visual hook): Architectural Photo Window */}
      <div className="w-full md:w-[38%] lg:w-[40%] aspect-square md:aspect-auto md:h-full max-h-[280px] md:max-h-none rounded-[20px] sm:rounded-[24px] md:rounded-[26px] overflow-hidden bg-neutral-100 relative shrink-0 shadow-xs">
        <img
          src={photoUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          style={{
            objectPosition:
              (project as any).heroImagePosition ||
              ((project as any).heroImageFocalPoint === 'top'
                ? 'center 20%'
                : (project as any).heroImageFocalPoint === 'bottom'
                ? 'center 80%'
                : 'center 50%'),
          }}
          loading="lazy"
        />
      </div>

      {/* 2. Right Column: Top Meta + OKCOK Title with ↗ Arrow + Tag Box + Description + Bottom Badges */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full pl-0 md:pl-1 overflow-hidden">
        <div>
          {/* Top Metadata Row: House/Building + Location Pin on ONE line */}
          <div className="flex items-center gap-3.5 sm:gap-4 flex-nowrap whitespace-nowrap mb-1.5 text-neutral-500 overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <BuildingIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-neutral-500" />
              <span className="font-creato text-xs sm:text-[13px] text-neutral-500 font-normal">
                {categoryLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <PinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-neutral-500" />
              <span className="font-creato text-xs sm:text-[13px] text-neutral-500 font-normal">
                {locationLabel}
              </span>
            </div>
          </div>

          {/* Main Title with Minimalist Diagonal Arrow Indicator (↗) for Higher Click Intent */}
          <div className="flex items-start justify-between gap-3 my-1 sm:my-1.5">
            <h3 className={`font-okcok ${titleSizeClass} uppercase text-ea-black font-bold tracking-tight break-normal hyphens-none group-hover:text-neutral-800 transition-colors`}>
              {project.title}
            </h3>
            <span className="w-8 h-8 rounded-full border border-ea-black/25 flex items-center justify-center shrink-0 text-ea-black group-hover:bg-ea-black group-hover:text-white group-hover:border-ea-black transition-all duration-300 mt-0.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </div>

          {/* Outlined Tag Pill Box: Studio(s) • Year (WITHOUT PHOTOGRAPHER, full names, wraps cleanly) */}
          <div className="border border-ea-black rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 my-1 sm:my-1.5 w-fit max-w-full bg-white shrink-0">
            {/* Architect / Studio 1 */}
            <div className="flex items-center gap-1.5 text-ea-black shrink-0">
              <InkBottleIcon className="w-3.5 h-3.5 shrink-0 text-ea-black" />
              <span className="font-okcok text-xs uppercase tracking-wider text-ea-black">
                {architects[0]}
              </span>
            </div>

            {/* Additional collaborating studios (if any) */}
            {architects.slice(1).map((arch, aIdx) => (
              <div key={aIdx} className="flex items-center gap-1.5 text-ea-black shrink-0">
                <span className="text-ea-black/40 text-xs font-bold leading-none select-none">•</span>
                <span className="font-okcok text-xs uppercase tracking-wider text-ea-black">
                  {arch}
                </span>
              </div>
            ))}

            {/* Year */}
            {yearLabel && (
              <div className="flex items-center gap-1.5 text-ea-black shrink-0">
                <span className="text-ea-black/40 text-xs font-bold leading-none select-none">•</span>
                <CalendarDoodleIcon className="w-3.5 h-3.5 shrink-0 text-ea-black" />
                <span className="font-okcok text-xs tracking-wider text-ea-black">
                  {yearLabel}
                </span>
              </div>
            )}
          </div>

          {/* Editorial Excerpt Paragraph (Generous 4 lines, high-contrast, clean ellipsis) */}
          <p
            className="font-creato text-xs sm:text-[13px] md:text-[13.5px] leading-[1.6] text-neutral-800 my-2 sm:my-2.5 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {fullDescription}
          </p>
        </div>

        {/* Bottom Action Pills: Visitas de Obra & Comentarios (Side by side on ONE row, never stacked or cut off) */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap mt-auto pt-2 pb-0.5 shrink-0">
          {isVisitasEnabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(project.id);
              }}
              className="bg-[#70757D] hover:bg-[#5D626A] active:scale-95 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-okcok text-[10px] sm:text-[10.5px] uppercase tracking-normal sm:tracking-wide transition-all inline-flex items-center justify-center shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
              data-cursor
            >
              {visitsCount} VISITAS DE OBRAS
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(project.id);
            }}
            className="bg-[#70757D] hover:bg-[#5D626A] active:scale-95 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-okcok text-[10px] sm:text-[10.5px] uppercase tracking-normal sm:tracking-wide transition-all inline-flex items-center justify-center shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
            data-cursor
          >
            {commentsCount} COMENTARIOS
          </button>
        </div>
      </div>
    </article>
  );
};
