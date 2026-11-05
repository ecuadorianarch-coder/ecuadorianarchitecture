import React, { useEffect, useRef } from 'react';
import { ArrowLeft, X, ExternalLink, Instagram, Mail, MapPin, Calendar, Award, Building, Users } from 'lucide-react';
import { getAuthorProfile, AuthorProfileData } from '../../data/authors';

export interface AuthorProfileModalProps {
  studioName: string;
  isOpen: boolean;
  onClose: () => void;
  allProjects: any[];
  onSelectProject?: (projectId: string) => void;
  currentProjectId?: string;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  studioName,
  isOpen,
  onClose,
  allProjects,
  onSelectProject,
  currentProjectId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const author: AuthorProfileData = getAuthorProfile(studioName);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter all projects that belong to this author / studio
  const normalizedAuthorName = author.name.toUpperCase();
  const authorProjects = allProjects.filter((p) => {
    const pStudio = (p.studio || p.institution || p.author || '').toUpperCase();
    return (
      pStudio === normalizedAuthorName ||
      pStudio.includes(normalizedAuthorName) ||
      normalizedAuthorName.includes(pStudio)
    );
  });

  // If no projects matched via exact studio name, at least include current project if current project matches
  const displayProjects =
    authorProjects.length > 0
      ? authorProjects
      : allProjects.filter((p) => p.id === currentProjectId);

  const handleCardClick = (projId: string) => {
    onClose();
    if (projId !== currentProjectId && onSelectProject) {
      onSelectProject(projId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="author-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[92vh] bg-white border-2 border-ea-black rounded-[28px] sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden text-ea-black"
      >
        {/* ================= TOP BAR (Sticky) ================= */}
        <header className="sticky top-0 z-30 bg-white border-b-2 border-ea-black px-5 sm:px-7 py-3.5 sm:py-4 flex items-center justify-between gap-4 rounded-t-[26px] sm:rounded-t-[34px]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-ea-black border-2 border-ea-black font-anton text-xs sm:text-[13px] tracking-wider uppercase rounded-full shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
              data-cursor
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>VOLVER AL PROYECTO</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-ea-black/20 hover:border-ea-black hover:bg-black/5 flex items-center justify-center text-ea-black/70 hover:text-ea-black transition-all cursor-pointer"
            aria-label="Cerrar perfil"
            data-cursor
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </header>

        {/* ================= SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-9 space-y-6 sm:space-y-8 bg-white custom-scrollbar">
          {/* ================= 1. HERO COMPOSITION (Matching User Mockup) ================= */}
          <section className="space-y-4">
            {/* Studio Identity Header */}
            <div>
              <span className="font-creato text-xs tracking-widest uppercase text-neutral-500 font-bold block mb-1">
                ESTUDIO:
              </span>
              <h1
                id="author-modal-title"
                className="font-okcok text-3xl sm:text-4xl md:text-5xl leading-[1.05] uppercase text-ea-black tracking-wide"
              >
                {author.name}
              </h1>
            </div>

            {/* Side-by-side Hero: Rounded INTEGRANTES Box + Rounded Team Photo Window */}
            <div className="flex flex-col md:flex-row items-stretch gap-4 sm:gap-5 md:gap-6">
              {/* Left Box: INTEGRANTES */}
              <div className="flex-1 bg-white border-2 border-ea-black rounded-[22px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="font-okcok text-lg sm:text-xl md:text-[22px] uppercase text-ea-black font-bold tracking-tight mb-3">
                    INTEGRANTES:
                  </h2>

                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    {author.team && author.team.length > 0 ? (
                      author.team.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3">
                          <span className="font-okcok text-base sm:text-lg md:text-[19px] uppercase text-ea-black tracking-wide leading-tight">
                            {member.name}
                          </span>
                          {member.role && (
                            <span className="font-creato text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wider shrink-0">
                              {member.role}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      author.founder.split(',').map((fName, idx) => (
                        <span key={idx} className="font-okcok text-base sm:text-lg md:text-[19px] uppercase text-ea-black tracking-wide leading-tight">
                          {fName.trim()}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Studio Quick Specs */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-4 mt-4 border-t border-ea-black/10 text-xs font-mono text-ea-black/60">
                  {author.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-ea-black/60" />
                      <span className="font-creato font-semibold text-ea-black">{author.location}</span>
                    </span>
                  )}
                  {author.foundedYear && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-ea-black/60" />
                      <span className="font-creato font-semibold text-ea-black">FUNDADO EN {author.foundedYear}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Box: Team / Portrait Photo */}
              <div className="w-full md:w-[35%] lg:w-[32%] min-h-[190px] sm:min-h-[210px] rounded-[22px] sm:rounded-[26px] overflow-hidden border-2 border-ea-black relative shrink-0 shadow-xs bg-neutral-100 group">
                <img
                  src={author.avatarUrl || author.coverImage}
                  alt={author.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          </section>

          {/* 2. DESCRIPTION & PHILOSOPHY ("DESCRIPCIÓN DEL ESTUDIO") */}
          <section className="bg-white border-2 border-ea-black rounded-[22px] sm:rounded-[26px] p-5 sm:p-7 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-ea-black stroke-[2.2]" />
                <h2 className="font-anton text-xs sm:text-sm tracking-wider uppercase text-ea-black">
                  TRAYECTORIA & DESCRIPCIÓN DEL ESTUDIO
                </h2>
              </div>
              <p className="font-creato text-xs sm:text-sm md:text-[14.5px] leading-relaxed text-ea-black/90 text-justify">
                {author.description}
              </p>
            </div>

            {/* Architectural Philosophy Callout */}
            {author.philosophy && (
              <div className="p-4 sm:p-5 bg-white border-l-4 border-ea-black border-y border-r border-ea-black/10 rounded-[14px]">
                <span className="block font-anton text-[10px] tracking-widest uppercase text-ea-black/60 mb-1">
                  FILOSOFÍA PROYECTUAL
                </span>
                <p className="font-creato text-xs sm:text-sm md:text-[14px] italic text-ea-black leading-relaxed font-medium">
                  "{author.philosophy}"
                </p>
              </div>
            )}

            {/* Typologies & Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-ea-black/10">
              {/* Typologies */}
              <div>
                <span className="block font-anton text-[10px] sm:text-[11px] uppercase tracking-wider text-ea-black/60 mb-2">
                  CAMPOS DE ENFOQUE & TIPOLOGÍAS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {author.typologies.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-ea-black/25 rounded-full font-creato text-xs font-semibold text-ea-black"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Online Presence & Contact */}
              <div>
                <span className="block font-anton text-[10px] sm:text-[11px] uppercase tracking-wider text-ea-black/60 mb-2">
                  CONTACTO & REDES
                </span>
                <div className="flex flex-wrap gap-2">
                  {author.contact.website && (
                    <a
                      href={author.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-ea-black rounded-full font-mono text-xs font-bold text-ea-black hover:bg-black hover:text-white transition-colors shadow-2xs"
                      data-cursor
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>SITIO WEB</span>
                    </a>
                  )}

                  {author.contact.instagram && (
                    <a
                      href={`https://instagram.com/${author.contact.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-ea-black rounded-full font-mono text-xs font-bold text-ea-black hover:bg-black hover:text-white transition-colors shadow-2xs"
                      data-cursor
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{author.contact.instagram}</span>
                    </a>
                  )}

                  {author.contact.email && (
                    <a
                      href={`mailto:${author.contact.email}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-ea-black rounded-full font-mono text-xs font-bold text-ea-black hover:bg-black hover:text-white transition-colors shadow-2xs"
                      data-cursor
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{author.contact.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 3. PUBLISHED PROJECTS */}
          <section className="space-y-4">
            <div className="border-b-2 border-ea-black pb-2">
              <h2 className="font-okcok text-2xl sm:text-3xl uppercase tracking-wide text-ea-black">
                PROYECTOS PUBLICADOS ({displayProjects.length})
              </h2>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-2">
              {displayProjects.map((p) => {
                const isCurrent = p.id === currentProjectId;
                return (
                  <article
                    key={p.id}
                    onClick={() => handleCardClick(p.id)}
                    className={`group bg-white border-2 border-ea-black rounded-[20px] sm:rounded-[22px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                      isCurrent ? 'ring-2 ring-ea-black' : ''
                    }`}
                    data-cursor
                  >
                    {isCurrent && (
                      <span className="absolute top-3 right-3 z-10 bg-ea-black text-white text-[9.5px] font-anton px-2.5 py-0.5 tracking-wider uppercase rounded-full shadow-2xs">
                        VIENDO AHORA
                      </span>
                    )}

                    {/* Image Window */}
                    <div className="w-full h-44 sm:h-48 overflow-hidden bg-neutral-100 border border-ea-black/20 rounded-[14px] relative mb-3">
                      <img
                        src={p.heroImage || p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    </div>

                    {/* Metadata Header */}
                    <div className="flex items-center justify-between gap-2 text-[10.5px] font-mono font-bold text-ea-black/60 uppercase mb-1">
                      <span>{p.location || 'ECUADOR'}</span>
                      <span>AÑO {p.year || '2024'}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-okcok text-xl sm:text-2xl uppercase leading-tight text-ea-black group-hover:underline transition-all mb-2">
                      {p.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="font-creato text-xs text-ea-black/80 line-clamp-2 leading-relaxed mb-4">
                      {p.excerpt || p.memory || (p.resena && !p.resena.startsWith('Texto analítico') ? p.resena : '')}
                    </p>

                    {/* CTA Button */}
                    <div className="mt-auto pt-2.5 border-t border-ea-black/10 flex items-center justify-between text-ea-black font-anton text-xs tracking-wider uppercase group-hover:text-black">
                      <span>{isCurrent ? 'CONTINUAR LEYENDO' : 'EXPLORAR EXPEDIENTE'}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <footer className="bg-white border-t-2 border-ea-black px-5 sm:px-7 py-3.5 flex items-center justify-between rounded-b-[26px] sm:rounded-b-[34px]">
          <span className="font-mono text-xs text-ea-black/60 uppercase font-bold tracking-wider">
            {author.name}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-ea-black text-white font-anton text-xs sm:text-[13px] tracking-wider uppercase rounded-full shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:bg-neutral-800 transition-colors cursor-pointer"
            data-cursor
          >
            VOLVER AL PROYECTO
          </button>
        </footer>
      </div>
    </div>
  );
};
