import React, { useState, useMemo } from 'react';
import { PodcastSection } from './PodcastSection';
import { CommunityFolderContent } from './CommunityFolderContent';
import { DynamicModulesRenderer, extractStudiosList } from '../../components/editorial/DynamicModulesRenderer';
import { ImageCarouselLightbox, extractAllProjectImages } from '../../components/editorial/ImageCarouselLightbox';
import { Camera } from 'lucide-react';
import { EditorialEmptyState } from '../../components/common/EditorialEmptyState';

export interface ProjectModuleContext {
  project: any;
  activePlanType: 'planta' | 'corte' | 'axonometria';
  setActivePlanType: (type: 'planta' | 'corte' | 'axonometria') => void;
  renderPlanimetryDrawing: (type: 'planta' | 'corte' | 'axonometria') => React.ReactNode;
  onOpenLightbox?: (index?: number) => void;
}

export interface ProjectModuleDefinition {
  id: string;
  title: string;
  subTitle?: string;
  shortTitle?: string;
  navLabel: string;
  isMandatory?: boolean;
  isAvailable: (project: any) => boolean;
  inactiveFillClass?: string;
  renderContent: (context: ProjectModuleContext) => React.ReactNode;
}

// ============================================================================
// MODULAR CONTENT RENDERERS
// ============================================================================

const ResenaModuleContent: React.FC<ProjectModuleContext> = ({
  project,
  activePlanType,
  renderPlanimetryDrawing,
  onOpenLightbox,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const allImages = useMemo(() => extractAllProjectImages(project), [project]);
  const studios = useMemo(() => extractStudiosList(project), [project]);
  const hasMultipleStudios = studios.length > 1;

  const isTerritorios = project.type === 'territorios' || project.category === 'EXPEDIENTE TERRITORIAL';
  const isAcademia = project.type === 'academia' || project.category === 'INVESTIGACIÓN ACADÉMICA';

  const writtenBy = 
    project.escritoPor || 
    project.author || 
    project.authorName || 
    project.datos?.autorTexto || 
    (studios.length > 0 ? studios[0] : isTerritorios ? 'Equipo Territorial EA' : isAcademia ? 'Investigador EA' : 'Redacción EA');

  const editedBy = 
    project.editadoPor || 
    project.editor || 
    project.editorName || 
    project.datos?.editor || 
    'Dirección Editorial EA';

  const handleOpenGallery = (index: number = 0) => {
    if (onOpenLightbox) {
      onOpenLightbox(index);
    } else {
      setLightboxOpen(true);
    }
  };

  if (project.modules && project.modules.length > 0) {
    return (
      <article className="space-y-5 md:space-y-6 max-w-4xl mx-auto">
        <DynamicModulesRenderer
          modules={project.modules}
          project={project}
          activePlanType={activePlanType}
          renderPlanimetryDrawing={renderPlanimetryDrawing}
          onOpenLightbox={handleOpenGallery}
        />
      </article>
    );
  }

  return (
    <article className="space-y-5 md:space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-anton text-[10.5px] sm:text-[11.5px] tracking-widest uppercase bg-ea-black text-white px-3 py-1">
            {isTerritorios ? 'EXPEDIENTE TERRITORIAL' : isAcademia ? 'INVESTIGACIÓN ACADÉMICA' : 'LECTURA ARQUITECTÓNICA'}
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] text-ea-black/50 uppercase">
            {isTerritorios ? 'DIAGNÓSTICO SOCIO-ESPACIAL & CARTOGRAFÍA' : isAcademia ? 'MARCO CRÍTICO & PROPUESTA DE TESIS' : 'ANÁLISIS ESPACIAL & MATERIALIDAD'}
          </span>
        </div>
        <h3 className="font-okcok text-lg sm:text-[20px] md:text-[22px] uppercase text-ea-black leading-[1.25] tracking-normal">
          {project.title}
        </h3>

        {/* Ficha Técnica Editorial / Project Factsheet (Totalmente responsiva, adaptada según sección) */}
        <div className="w-full">
          <dl className="w-full my-3 sm:my-4 py-2.5 sm:py-3 border-y border-ea-black/15 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-x-3 gap-y-2.5 text-left select-none items-start">
            {isTerritorios ? (
              <>
                {/* 1. Colectivo / Equipo */}
                <div className="min-w-0 pr-2 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    COLECTIVO
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {studios[0] || project.studio || 'COLECTIVO TERRITORIAL'}
                  </dd>
                </div>

                {/* 2. Territorio / Lugar */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    TERRITORIO
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {project.location || project.region || 'ECUADOR'}
                  </dd>
                </div>

                {/* 3. Escala */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    ESCALA
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                    {project.region || project.datos?.superficie || 'TERRITORIAL'}
                  </dd>
                </div>

                {/* 4. Año */}
                <div className="min-w-0 pl-2.5 sm:border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    AÑO
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                    {project.year || '2024'}
                  </dd>
                </div>

                {/* 5. Problemática (en vez de fotografía) */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start col-span-2 xs:col-span-1">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    PROBLEMÁTICA
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {project.problematica || project.category || 'ANÁLISIS DEL TERRITORIO'}
                  </dd>
                </div>
              </>
            ) : isAcademia ? (
              <>
                {/* 1. Tesista / Autor */}
                <div className="min-w-0 pr-2 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    INVESTIGADOR
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {project.author || studios[0] || project.studio || 'TESISTA'}
                  </dd>
                </div>

                {/* 2. Universidad */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    UNIVERSIDAD
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {project.universidad || project.institution || 'UNIVERSIDAD'}
                  </dd>
                </div>

                {/* 3. Lugar / Sede */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    SEDE
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                    {project.location || 'ECUADOR'}
                  </dd>
                </div>

                {/* 4. Año */}
                <div className="min-w-0 pl-2.5 sm:border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    AÑO
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                    {project.year || '2024'}
                  </dd>
                </div>

                {/* 5. Renders (Opcional) o Problemática */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start col-span-2 xs:col-span-1">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    {Boolean(project.datos?.renders?.trim() || project.renders?.trim() || project.datos?.visualizacion?.trim()) ? 'RENDERS' : 'LÍNEA'}
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {project.datos?.renders || project.renders || project.datos?.visualizacion || project.problematica || 'TESIS DE GRADO'}
                  </dd>
                </div>
              </>
            ) : (
              <>
                {/* 1. Estudio(s) / Autoría */}
                <div className="min-w-0 pr-2 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    {hasMultipleStudios ? `ESTUDIOS (${studios.length})` : 'ESTUDIO'}
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {hasMultipleStudios ? (
                      <span className="flex flex-col gap-0.5">
                        {studios.map((s, idx) => (
                          <span key={idx} className="block leading-tight">
                            {s}
                            {idx < studios.length - 1 && (
                              <span className="text-ea-black/35 font-normal ml-1">+</span>
                            )}
                          </span>
                        ))}
                      </span>
                    ) : (
                      studios[0] || project.studio || 'ESTUDIO NO ESPECIFICADO'
                    )}
                  </dd>
                </div>

                {/* 2. Ubicación / Lugar */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    LUGAR
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {project.location || 'ECUADOR'}
                  </dd>
                </div>

                {/* 3. Área / Superficie */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    ÁREA
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                    {project.datos?.superficie || '3.850 M²'}
                  </dd>
                </div>

                {/* 4. Año */}
                <div className="min-w-0 pl-2.5 sm:border-l border-ea-black/10 flex flex-col justify-start">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    AÑO
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                    {project.year || '2024'}
                  </dd>
                </div>

                {/* 5. Fotografía */}
                <div className="min-w-0 pl-2.5 border-l border-ea-black/10 flex flex-col justify-start col-span-2 xs:col-span-1">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    FOTOGRAFÍA
                  </dt>
                  <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                    {project.datos?.fotografia || project.photographer || 'BICUBIK PHOTOGRAPHY'}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* Créditos Editoriales / Byline */}
        <div className="pt-2 pb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-[11.5px] font-mono uppercase text-ea-black/70 select-none">
          <span className="text-neutral-400">ESCRITO POR:</span>
          <span className="font-semibold text-ea-black font-okcok tracking-tight">{writtenBy}</span>
          <span className="text-neutral-300 mx-1">,</span>
          <span className="text-neutral-400">EDITADO POR:</span>
          <span className="font-semibold text-ea-black font-okcok tracking-tight">{editedBy}</span>
        </div>
      </div>

      <p className="font-creato text-[14px] sm:text-[15px] text-ea-black/90 leading-[1.8] font-normal my-4.5">
        {project.resena || project.excerpt}
      </p>

      {/* Architectural Floor Plan Image — Real uploaded drawing */}
      <figure className="my-8 group">
        <div
          onClick={() => handleOpenGallery(1)}
          className="relative cursor-zoom-in overflow-hidden rounded-[2px] bg-white border border-neutral-100 flex items-center justify-center p-2 sm:p-4"
          title="Clic para ver en carrusel de fotos a pantalla completa"
        >
          <img
            src={
              project.plans?.planta ||
              project.planImage ||
              'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80'
            }
            alt="Planta arquitectónica"
            className="w-full h-auto max-h-[560px] object-contain mx-auto group-hover:scale-[1.01] transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <figcaption className="pt-1.5 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
          {project.datos?.fotografia || 'Bicubik Photography'}
        </figcaption>
      </figure>

      <blockquote className="border-l-4 border-ea-black pl-5 py-3 my-6 bg-transparent">
        <p className="font-okcok text-base sm:text-[17px] md:text-[18px] uppercase leading-snug text-ea-black">
          "{project.memory || project.excerpt}"
        </p>
      </blockquote>

      <p className="font-creato text-[13.5px] sm:text-[14.5px] text-ea-black/85 leading-[1.72] my-4">
        La estructura responde a una lógica bioclimática rigurosa. A {project.ciudad?.altura || '2.850 msnm'}, la radiación solar equinoccial penetra a través de los vacíos cenitales, acumulando inercia térmica en la masa de hormigón crudo visto durante las horas diurnas y liberando calor paulatinamente durante el frío nocturno de la cordillera.
      </p>

      {/* Photographic Detail Figure */}
      <figure className="my-8 group">
        <div
          onClick={() => handleOpenGallery(0)}
          className="overflow-hidden rounded-[2px] bg-neutral-100 cursor-zoom-in relative select-none"
          title="Clic para ver en carrusel de fotos a pantalla completa"
        >
          <img
            src={project.heroImage}
            alt={project.title}
            className="w-full h-[320px] sm:h-[460px] md:h-[520px] object-cover group-hover:scale-[1.015] transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-ea-black/90 text-white px-3 py-1.5 text-[10px] font-anton uppercase tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-xs">
            <Camera className="w-3.5 h-3.5" />
            <span>Abrir Carrusel de Fotos</span>
          </div>
        </div>
        <figcaption className="pt-1.5 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
          {project.datos?.fotografia || 'Bicubik Photography'}
        </figcaption>
      </figure>

      <p className="font-creato text-[13.5px] sm:text-[14.5px] text-ea-black/85 leading-[1.72] my-4">
        En conclusión, la obra demuestra que la densidad colectiva en la ciudad andina no requiere renunciar a la luz natural ni a la porosidad comunitaria. La renuncia al área vendible en favor del vacío colectivo constituye el aporte más radical de {project.studio} a la práctica arquitectónica ecuatoriana.
      </p>

      {/* Fullscreen Carousel Lightbox */}
      <ImageCarouselLightbox
        isOpen={lightboxOpen}
        images={allImages}
        initialIndex={0}
        projectTitle={project.title}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  );
};

const CriticaModuleContent: React.FC<ProjectModuleContext> = ({
  project,
  renderPlanimetryDrawing,
  onOpenLightbox,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const allImages = useMemo(() => extractAllProjectImages(project), [project]);
  const studios = useMemo(() => extractStudiosList(project), [project]);
  const hasMultipleStudios = studios.length > 1;

  const writtenBy = 
    project.critic || 
    project.escritoPor || 
    project.author || 
    'Al Borde';

  const editedBy = 
    project.editadoPor || 
    project.editor || 
    project.editorName || 
    'Dirección Editorial EA';

  const handleOpenGallery = (index: number = 0) => {
    if (onOpenLightbox) {
      onOpenLightbox(index);
    } else {
      setLightboxOpen(true);
    }
  };

  if (project.criticaModules && project.criticaModules.length > 0) {
    return (
      <article className="space-y-5 md:space-y-6 max-w-4xl mx-auto">
        <DynamicModulesRenderer
          modules={project.criticaModules}
          project={project}
          renderPlanimetryDrawing={renderPlanimetryDrawing}
          onOpenLightbox={handleOpenGallery}
        />
      </article>
    );
  }

  // If there is no real critical review authored yet, display the authentic editorial empty state
  if (!project.critica || (typeof project.critica === 'string' && project.critica.trim().length === 0)) {
    return (
      <article className="max-w-4xl mx-auto py-4">
        <EditorialEmptyState section="critica" />
      </article>
    );
  }

  return (
    <article className="space-y-5 md:space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-anton text-[10.5px] sm:text-[11.5px] tracking-widest uppercase bg-ea-black text-white px-3 py-1">
            CRÍTICA EXTERNA
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] text-ea-black/50 uppercase">
            REVISIÓN Y DICTAMEN POR: {project.critic || 'AL BORDE'}
          </span>
        </div>
        <h3 className="font-okcok text-lg sm:text-[20px] md:text-[22px] uppercase text-ea-black leading-[1.25] tracking-normal">
          {project.criticaHeadline || project.criticaTitle || 'Desafiar la convención inmobiliaria desde la inercia térmica'}
        </h3>

        {/* Ficha Técnica Editorial / Project Factsheet (Una sola línea continua con expansión vertical para múltiples estudios) */}
        <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
          <dl className="min-w-[520px] sm:min-w-full my-3.5 sm:my-4 py-2.5 sm:py-3 border-y border-ea-black/15 grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.3fr)] gap-x-2.5 sm:gap-x-4 text-left select-none items-stretch">
            {/* 1. Texto Crítico */}
            <div className="min-w-0 pr-2 sm:pr-3 flex flex-col justify-start">
              <dt className="font-mono text-[9px] sm:text-[9.5px] uppercase tracking-widest text-neutral-400">
                TEXTO CRÍTICO
              </dt>
              <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                {project.critic || 'AL BORDE'}
              </dd>
            </div>

            {/* 2. Estudio Evaluado / Estudios */}
            <div className="min-w-0 pl-2.5 sm:pl-3.5 border-l border-ea-black/10 flex flex-col justify-start">
              <dt className="font-mono text-[9px] sm:text-[9.5px] uppercase tracking-widest text-neutral-400">
                {hasMultipleStudios ? `ESTUDIOS EVALUADOS (${studios.length})` : 'ESTUDIO EVALUADO'}
              </dt>
              <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                {hasMultipleStudios ? (
                  <span className="flex flex-col gap-0.5">
                    {studios.map((s, idx) => (
                      <span key={idx} className="block leading-tight">
                        {s}
                        {idx < studios.length - 1 && (
                          <span className="text-ea-black/35 font-normal ml-1">+</span>
                        )}
                      </span>
                    ))}
                  </span>
                ) : (
                  studios[0] || project.studio || 'ESTUDIO NO ESPECIFICADO'
                )}
              </dd>
            </div>

            {/* 3. Ubicación / Lugar */}
            <div className="min-w-0 pl-2.5 sm:pl-3.5 border-l border-ea-black/10 flex flex-col justify-start">
              <dt className="font-mono text-[9px] sm:text-[9.5px] uppercase tracking-widest text-neutral-400">
                LUGAR
              </dt>
              <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                {project.location || 'ECUADOR'}
              </dd>
            </div>

            {/* 4. Área / Superficie */}
            <div className="min-w-0 pl-2.5 sm:pl-3.5 border-l border-ea-black/10 flex flex-col justify-start">
              <dt className="font-mono text-[9px] sm:text-[9.5px] uppercase tracking-widest text-neutral-400">
                ÁREA
              </dt>
              <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                {project.datos?.superficie || '3.850 M²'}
              </dd>
            </div>

            {/* 5. Fotografía */}
            <div className="min-w-0 pl-2.5 sm:pl-3.5 border-l border-ea-black/10 flex flex-col justify-start">
              <dt className="font-mono text-[9px] sm:text-[9.5px] uppercase tracking-widest text-neutral-400">
                FOTOGRAFÍA
              </dt>
              <dd className="font-okcok text-[12px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                {project.datos?.fotografia || 'BICUBIK PHOTOGRAPHY'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Créditos Editoriales / Byline */}
        <div className="pt-2 pb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-[11.5px] font-mono uppercase text-ea-black/70 select-none">
          <span className="text-neutral-400">ESCRITO POR:</span>
          <span className="font-semibold text-ea-black font-okcok tracking-tight">{writtenBy}</span>
          <span className="text-neutral-300 mx-1">,</span>
          <span className="text-neutral-400">EDITADO POR:</span>
          <span className="font-semibold text-ea-black font-okcok tracking-tight">{editedBy}</span>
        </div>
      </div>

      <p className="font-creato text-[13.5px] sm:text-[14.5px] text-ea-black/85 leading-[1.72] font-normal my-4 whitespace-pre-line">
        {project.critica || project.excerpt}
      </p>

      {/* Architectural Section Image — Real uploaded drawing */}
      <figure className="my-8 group">
        <div
          onClick={() => handleOpenGallery(2)}
          className="relative cursor-zoom-in overflow-hidden rounded-[2px] bg-white border border-neutral-100 flex items-center justify-center p-2 sm:p-4"
          title="Clic para ver en carrusel de fotos a pantalla completa"
        >
          <img
            src={
              project.plans?.corte ||
              project.sectionImage ||
              'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1600&q=80'
            }
            alt="Corte arquitectónico"
            className="w-full h-auto max-h-[560px] object-contain mx-auto group-hover:scale-[1.01] transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <figcaption className="pt-1.5 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
          {project.datos?.fotografia || 'Bicubik Photography'}
        </figcaption>
      </figure>

      <blockquote className="border-l-4 border-ea-black pl-5 py-3 my-6 bg-transparent">
        <p className="font-okcok text-base sm:text-[17px] md:text-[18px] uppercase leading-snug text-ea-black">
          "{project.criticaQuote || 'Frente a la torre hermética vidriada, la pertinencia ética radica en la economía de medios y la inercia de la materia cruda.'}"
        </p>
      </blockquote>

      <p className="font-creato text-[13.5px] sm:text-[14.5px] text-ea-black/85 leading-[1.72] my-4 whitespace-pre-line">
        {project.criticaConclusion ||
          `El proyecto cuestiona el modelo hegemónico de torre de apartamentos vidriada en el valle de ${project.location}. Mientras el mercado convencional insiste en climatizaciones mecánicas que disparan el consumo energético, ${project.studio} recupera principios constructivos autóctonos y los articula con hormigón visto y mampostería permeable.`}
      </p>

      {/* Architectural Axonometric / Detail Image */}
      <figure className="my-8 group">
        <div
          onClick={() => handleOpenGallery(3)}
          className="relative cursor-zoom-in overflow-hidden rounded-[2px] bg-white border border-neutral-100 flex items-center justify-center p-2 sm:p-4"
          title="Clic para ver en carrusel de fotos a pantalla completa"
        >
          <img
            src={
              project.plans?.axonometria ||
              project.axonometriaImage ||
              'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80'
            }
            alt="Axonometría arquitectónica"
            className="w-full h-auto max-h-[560px] object-cover mx-auto group-hover:scale-[1.01] transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <figcaption className="pt-1.5 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
          {project.datos?.fotografia || 'Bicubik Photography'}
        </figcaption>
      </figure>

      <p className="font-creato text-[13.5px] sm:text-[14.5px] text-ea-black/85 leading-[1.72] my-4">
        Dictamen final: {project.title} no es simplemente un edificio residencial; es un manifiesto de sobriedad y resistencia ecológica. Plantea una alternativa constructiva contundente para el futuro del hábitat colectivo en la cordillera de los Andes.
      </p>

      {/* Fullscreen Carousel Lightbox */}
      <ImageCarouselLightbox
        isOpen={lightboxOpen}
        images={allImages}
        initialIndex={0}
        projectTitle={project.title}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  );
};

// ============================================================================
// SYSTEM REGISTRY OF AVAILABLE MODULE DEFINITIONS
// ============================================================================

export const PROJECT_MODULES_REGISTRY: ProjectModuleDefinition[] = [
  {
    id: 'resena',
    title: 'RESENA',
    navLabel: 'RESEÑAS',
    shortTitle: 'RESEÑAS',
    isMandatory: true,
    isAvailable: () => true,
    inactiveFillClass: 'af-fill-critica',
    renderContent: (ctx) => <ResenaModuleContent {...ctx} />,
  },
  {
    id: 'critica',
    title: 'CRITICA',
    navLabel: 'CRÍTICA',
    shortTitle: 'CRÍTICA',
    isMandatory: false,
    isAvailable: (project) => {
      if (!project) return false;
      if (project.hasCritica === false) return false;
      return (
        project.hasCritica === true ||
        (typeof project.critica === 'string' &&
          project.critica.trim().length > 0 &&
          !project.critica.includes('Dictamen crítico')) ||
        (Array.isArray(project.criticaModules) && project.criticaModules.length > 0)
      );
    },
    inactiveFillClass: 'af-fill-critica',
    renderContent: (ctx) => <CriticaModuleContent {...ctx} />,
  },
  {
    id: 'podcast',
    title: 'PODCAST',
    navLabel: 'PODCAST',
    shortTitle: 'PODCAST',
    isMandatory: false,
    isAvailable: (project) => {
      if (!project) return false;
      return project.hasPodcast !== false;
    },
    inactiveFillClass: 'af-fill-podcast',
    renderContent: (ctx) => <PodcastSection project={ctx.project} />,
  },
  {
    id: 'obra-viva',
    title: 'NOTAS',
    subTitle: 'DE LA COMUNIDAD',
    navLabel: 'NOTAS DE LA COMUNIDAD',
    shortTitle: 'NOTAS',
    isMandatory: false,
    isAvailable: (project) => {
      if (!project) return true;
      return project.hasNotasComunidad !== false;
    },
    inactiveFillClass: 'af-fill-notas',
    renderContent: (ctx) => <CommunityFolderContent project={ctx.project} />,
  },
];

/**
 * Filter registry to return only the modules available for the specific project record.
 * Ensures Reseña and Notas de la comunidad are always present.
 */
export const getAvailableModules = (project: any): ProjectModuleDefinition[] => {
  if (!project) {
    return PROJECT_MODULES_REGISTRY.filter((m) => m.isMandatory);
  }
  return PROJECT_MODULES_REGISTRY.filter((m) => m.isMandatory || m.isAvailable(project));
};
