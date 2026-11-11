import React, { useState, useMemo } from 'react';
import { EditorialModuleItem } from '../../types/editorial';
import {
  Volume2,
  Play,
  ExternalLink,
  MapPin,
  Layers,
  FileText,
  CheckCircle2,
  Maximize2,
  BookOpen,
} from 'lucide-react';
import {
  ImageCarouselLightbox,
  extractAllProjectImages,
} from './ImageCarouselLightbox';
import { buildProjectImageAlt, toSeoImageUrl } from '../../services/architectureSeo';

/**
 * Helper to extract and cleanly format collaborating studios list.
 * Supports:
 * - array of studios: project.studios = ["RAMA ESTUDIO", "AL BORDE", "ENSAMBLE"]
 * - combined string: project.studio = "RAMA ESTUDIO + AL BORDE + ENSAMBLE"
 * - comma or ampersand separated string
 */
export const extractStudiosList = (project: any, fallbackStudio?: string): string[] => {
  if (Array.isArray(project?.studios) && project.studios.length > 0) {
    return project.studios.map((s: string) => String(s).trim()).filter(Boolean);
  }
  const raw = fallbackStudio || project?.studio || '';
  if (!raw) return [];
  if (typeof raw !== 'string') return [String(raw)];

  if (/[+&/]/.test(raw) || (raw.includes(',') && !raw.includes('S.A.') && !raw.includes('CIA.'))) {
    const list = raw
      .split(/\s*(?:\+|\/|\&|,)\s*/)
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return [raw.trim()];
};

/**
 * Helper to identify if a project or article is from the "Territorios" section (escritos de ciudad/territorial).
 * Territorios articles are urban reflections, city essays, or territorial dossiers.
 * They MUST NOT display building construction factsheets (área construida, estudio de arquitectura, etc.).
 */
export const isTerritoriosProject = (project: any): boolean => {
  if (!project) return false;
  if (project.type === 'territorios' || project.section === 'territorios') return true;
  const cat = String(project.category || '').toLowerCase();
  if (
    cat.includes('territorio') ||
    cat.includes('ciudad') ||
    cat.includes('urbano') ||
    cat.includes('reflexion') ||
    cat.includes('expediente territorial')
  ) {
    return true;
  }
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (pathname.includes('/territorios') || hash.includes('territorios')) {
      return true;
    }
  }
  return false;
};

interface DynamicModulesRendererProps {
  modules?: EditorialModuleItem[];
  project: any;
  activePlanType?: 'planta' | 'corte' | 'axonometria';
  renderPlanimetryDrawing?: (type: 'planta' | 'corte' | 'axonometria') => React.ReactNode;
  onOpenLightbox?: (index?: number) => void;
}

export const DynamicModulesRenderer: React.FC<DynamicModulesRendererProps> = ({
  modules,
  project,
  activePlanType = 'planta',
  renderPlanimetryDrawing,
  onOpenLightbox,
}) => {
  const [comparisonSlider, setComparisonSlider] = useState<Record<string, number>>({});
  const [activePlanSelection, setActivePlanSelection] = useState<'planta' | 'corte' | 'axonometria'>(activePlanType);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Extract all images from the project and modules for the lightbox carousel
  const allImages = useMemo(() => extractAllProjectImages(project), [project, modules]);

  const openCarouselAtUrl = (url?: string) => {
    if (!url) return;
    const idx = allImages.findIndex((img) => img.url === url);
    const targetIdx = idx >= 0 ? idx : 0;
    if (onOpenLightbox) {
      onOpenLightbox(targetIdx);
    } else {
      setCarouselIndex(targetIdx);
      setCarouselOpen(true);
    }
  };

  if (!modules || modules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 my-6">
      {modules.map((mod) => {
        switch (mod.type) {
          case 'hero-header': {
            const isTerritorios = isTerritoriosProject(project);
            const studios = extractStudiosList(project, mod.credits);
            const hasMultiple = studios.length > 1;
            const writtenBy = 
              mod.caption ||
              project.escritoPor || 
              project.author || 
              project.authorName || 
              (studios.length > 0 ? studios[0] : isTerritorios ? 'Equipo Territorial EA' : 'Redacción EA');
            const editedBy = 
              project.editadoPor || 
              project.editor || 
              'Dirección Editorial EA';

            return (
              <div key={mod.id} className="space-y-3 border-b-2 border-ea-black pb-6">
                {mod.subtitle && (
                  <span className="font-anton text-[11px] tracking-widest uppercase bg-ea-black text-white px-3 py-1 inline-block">
                    {mod.subtitle}
                  </span>
                )}
                {mod.title && (
                  <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase text-ea-black leading-tight">
                    {mod.title}
                  </h2>
                )}
                {mod.content && (
                  <p className="font-creato text-base text-ea-black/75 leading-relaxed">
                    {mod.content}
                  </p>
                )}

                {/* En Territorios (escritos de ciudad), NO se muestra la barra de área/estudio/año porque son reflexiones urbanas, no proyectos construidos */}
                {!isTerritorios && (
                  <div className="w-full">
                    <dl className="w-full my-2.5 sm:my-3 py-2 sm:py-2.5 border-y border-ea-black/15 grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,0.7fr)] gap-x-1.5 sm:gap-x-4 text-left select-none items-start">
                      <div className="min-w-0 pr-1.5 sm:pr-3 flex flex-col justify-start">
                        <dt className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-neutral-400">
                          {hasMultiple ? `ESTUDIOS (${studios.length})` : 'ESTUDIO'}
                        </dt>
                        <dd className="font-okcok text-[10.5px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                          {hasMultiple ? (
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
                            studios[0] || mod.credits || project.studio || 'ESTUDIO NO ESPECIFICADO'
                          )}
                        </dd>
                      </div>
                      <div className="min-w-0 pl-1.5 sm:pl-3.5 border-l border-ea-black/10 flex flex-col justify-start">
                        <dt className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-neutral-400">LUGAR</dt>
                        <dd className="font-okcok text-[10.5px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug break-words">
                          {project.location || 'ECUADOR'}
                        </dd>
                      </div>
                      <div className="min-w-0 pl-1.5 sm:pl-3.5 border-l border-ea-black/10 flex flex-col justify-start">
                        <dt className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-neutral-400">ÁREA</dt>
                        <dd className="font-okcok text-[10.5px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                          {project.datos?.superficie || project.superficie || project.area || 'S/D'}
                        </dd>
                      </div>
                      <div className="min-w-0 pl-1.5 sm:pl-3.5 border-l border-ea-black/10 flex flex-col justify-start">
                        <dt className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-neutral-400">AÑO</dt>
                        <dd className="font-okcok text-[10.5px] sm:text-[13px] uppercase text-ea-black font-semibold mt-0.5 leading-snug whitespace-nowrap">
                          {project.year || '2024'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}

                {/* Créditos Editoriales / Byline */}
                <div
                  className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-[11.5px] font-mono uppercase text-ea-black/70 select-none ${
                    isTerritorios ? 'pt-2.5 mt-2.5 border-t border-ea-black/15' : 'pt-1 pb-0.5'
                  }`}
                >
                  <span className="text-neutral-400">ESCRITO POR:</span>
                  <span className="font-semibold text-ea-black font-okcok tracking-tight">{writtenBy}</span>
                  <span className="text-neutral-300 mx-1">,</span>
                  <span className="text-neutral-400">EDITADO POR:</span>
                  <span className="font-semibold text-ea-black font-okcok tracking-tight">{editedBy}</span>
                  {isTerritorios && project.year && (
                    <>
                      <span className="text-neutral-300 mx-1">•</span>
                      <span className="font-semibold text-ea-black/60 font-mono">{project.year}</span>
                    </>
                  )}
                </div>
              </div>
            );
          }

          case 'title-subtitle':
            return (
              <div key={mod.id} className="space-y-2 pt-4">
                {mod.subtitle && (
                  <span className="font-mono text-xs text-ea-black/60 uppercase tracking-wider block">
                    {mod.subtitle}
                  </span>
                )}
                {mod.title && (
                  <h3 className="font-okcok text-xl sm:text-2xl uppercase text-ea-black leading-snug">
                    {mod.title}
                  </h3>
                )}
              </div>
            );

          case 'rich-text':
            return (
              <div key={mod.id} className="prose max-w-none">
                <p className="font-creato text-[14px] sm:text-[15px] text-ea-black/85 leading-[1.75] font-normal whitespace-pre-line">
                  {mod.content}
                </p>
              </div>
            );

          case 'single-image':
            return (
              <figure key={mod.id} className="my-8 group">
                <div
                  className="relative cursor-zoom-in overflow-hidden rounded-[2px]"
                  onClick={() => openCarouselAtUrl(mod.imageUrl || project.heroImage)}
                  title="Clic para ampliar en carrusel a pantalla completa"
                >
                  <img
                    src={toSeoImageUrl(mod.imageUrl || project.heroImage, project, mod.category === 'planimetria' ? 'planimetria' : 'fotografia')}
                    alt={buildProjectImageAlt(project, mod.caption || mod.title || (mod.category === 'planimetria' ? 'Planimetría arquitectónica' : 'Fotografía'))}
                    className={`w-full h-auto max-h-[640px] object-cover group-hover:scale-[1.015] transition-transform duration-500 ${
                      mod.settings?.focalPoint === 'top'
                        ? 'object-top'
                        : mod.settings?.focalPoint === 'bottom'
                        ? 'object-bottom'
                        : 'object-center'
                    }`}
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-ea-black/90 text-white px-3 py-1.5 text-[10px] font-anton uppercase tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-xs">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                    <span>Ver en Carrusel</span>
                  </div>
                </div>
                {(mod.credits || project.datos?.fotografia || project.photographer) ? (
                  <figcaption className="pt-1.5 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
                    {mod.credits || project.datos?.fotografia || project.photographer}
                  </figcaption>
                ) : null}
              </figure>
            );

          case 'fullscreen-image':
            return (
              <div key={mod.id} className="my-8 -mx-4 sm:-mx-8 md:-mx-12 lg:-mx-20 group">
                <div className="overflow-hidden relative">
                  <div
                    className="cursor-zoom-in relative"
                    onClick={() => openCarouselAtUrl(mod.imageUrl || project.heroImage)}
                    title="Clic para ampliar en carrusel a pantalla completa"
                  >
                    <img
                      src={toSeoImageUrl(mod.imageUrl || project.heroImage, project, 'vista-panoramica')}
                      alt={buildProjectImageAlt(project, mod.caption || mod.title || 'Vista panorámica')}
                      className="w-full h-[400px] sm:h-[550px] object-cover group-hover:scale-[1.015] transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-ea-black/90 text-white px-3 py-1.5 text-[10px] font-anton uppercase tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-xs">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                      <span>Ver en Carrusel</span>
                    </div>
                  </div>
                  {(mod.credits || project.datos?.fotografia || project.photographer) ? (
                    <figcaption className="pt-1.5 px-4 sm:px-8 md:px-12 lg:px-20 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
                      {mod.credits || project.datos?.fotografia || project.photographer}
                    </figcaption>
                  ) : null}
                </div>
              </div>
            );

          case 'image-gallery':
            return (
              <div key={mod.id} className="my-8 space-y-2">
                {mod.title && (
                  <h4 className="font-anton text-xs tracking-wider uppercase text-ea-black mb-3">
                    {mod.title}
                  </h4>
                )}
                <div
                  className={`grid gap-3 sm:gap-4 ${
                    mod.settings?.columns === 4
                      ? 'grid-cols-2 md:grid-cols-4'
                      : mod.settings?.columns === 3
                      ? 'grid-cols-1 sm:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2'
                  }`}
                >
                  {(mod.imageUrls || [project.heroImage]).map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => openCarouselAtUrl(url)}
                      className="overflow-hidden rounded-[2px] group cursor-zoom-in relative"
                      title="Clic para ver en carrusel"
                    >
                      <img
                        src={toSeoImageUrl(url, project, `galeria-${idx + 1}`)}
                        alt={buildProjectImageAlt(project, `Galería fotográfica ${idx + 1}`)}
                        className="w-full h-[220px] sm:h-[260px] object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-ea-black/90 text-white px-2.5 py-1 text-[9.5px] font-anton uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3 h-3 text-white" />
                        <span>Ver Foto</span>
                      </div>
                    </div>
                  ))}
                </div>
                {(mod.credits || project.datos?.fotografia || project.photographer) ? (
                  <figcaption className="pt-1.5 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
                    {mod.credits || project.datos?.fotografia || project.photographer}
                  </figcaption>
                ) : null}
              </div>
            );

          case 'image-comparison': {
            const sliderVal = comparisonSlider[mod.id] ?? 50;
            return (
              <div key={mod.id} className="my-6 border-2 border-ea-black bg-black overflow-hidden shadow-xs">
                <div className="p-3 bg-white border-b-2 border-ea-black flex justify-between items-center text-xs font-anton tracking-wider uppercase text-ea-black">
                  <span>COMPARACIÓN VISUAL</span>
                  <span className="font-mono text-[10px] text-ea-black/60">
                    DESLIZA PARA COMPARAR
                  </span>
                </div>
                <div className="relative w-full h-[320px] sm:h-[420px] overflow-hidden select-none">
                  {/* Before image */}
                  <img
                    src={toSeoImageUrl(mod.beforeImageUrl || project.heroImage, project, 'antes')}
                    alt={buildProjectImageAlt(project, 'Estado previo')}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* After image with clip */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderVal}%` }}
                  >
                    <img
                      src={toSeoImageUrl(mod.afterImageUrl || project.heroImage, project, 'despues')}
                      alt={buildProjectImageAlt(project, 'Estado intervenido')}
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{ width: '100%', minWidth: '100%' }}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                  </div>
                  {/* Slider Control */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={(e) =>
                      setComparisonSlider((prev) => ({
                        ...prev,
                        [mod.id]: Number(e.target.value),
                      }))
                    }
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-ea-black shadow-md flex items-center justify-center text-xs font-bold text-ea-black pointer-events-none z-10"
                    style={{ left: `${sliderVal}%` }}
                  >
                    ⇄
                  </div>
                </div>
                <div className="p-2.5 bg-[#FAF9F5] border-t-2 border-ea-black flex justify-between text-[10px] font-mono uppercase text-ea-black/70">
                  <span>IZQUIERDA: {mod.caption || 'ESTADO ACTUAL'}</span>
                  <span>DERECHA: {mod.credits || 'REFERENCIA / PLANO'}</span>
                </div>
              </div>
            );
          }

          case 'video':
            return (
              <div key={mod.id} className="my-6 border-2 border-ea-black overflow-hidden shadow-xs bg-black">
                {mod.videoUrl?.includes('youtube') || mod.videoUrl?.includes('youtu.be') ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={mod.videoUrl.replace('watch?v=', 'embed/')}
                      title={mod.title || 'Video documental'}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-ea-black text-white space-y-3">
                    <Play className="w-12 h-12 mx-auto text-white/80" />
                    <p className="font-anton text-sm uppercase tracking-widest">
                      {mod.title || 'DOCUMENTAL AUDIOVISUAL'}
                    </p>
                    <a
                      href={mod.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-white px-4 py-2 text-xs font-mono uppercase hover:bg-white hover:text-black transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir Video Externo
                    </a>
                  </div>
                )}
              </div>
            );

          case 'podcast':
            return (
              <div key={mod.id} className="my-6 p-6 bg-[#FAF9F5] border-2 border-ea-black shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-ea-black/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-ea-black" />
                    <span className="font-anton text-xs uppercase tracking-wider text-ea-black">
                      {mod.episode || 'EA PODCAST EPISODIO'}
                    </span>
                  </div>
                  {mod.duration && (
                    <span className="font-mono text-[10px] text-ea-black/60 uppercase">
                      DURACIÓN: {mod.duration}
                    </span>
                  )}
                </div>
                <h4 className="font-okcok text-lg uppercase text-ea-black">
                  {mod.title || 'Conversación Crítica con los Autores'}
                </h4>
                {mod.content && (
                  <p className="font-creato text-sm text-ea-black/80">
                    {mod.content}
                  </p>
                )}
                {mod.audioUrl && (
                  <audio controls className="w-full mt-3">
                    <source src={mod.audioUrl} type="audio/mpeg" />
                    Tu navegador no soporta el reproductor de audio.
                  </audio>
                )}
              </div>
            );

          case 'blockquote':
            return (
              <blockquote
                key={mod.id}
                className="border-l-4 border-ea-black pl-5 py-4 my-6 bg-[#FAF9F5]/70 p-4 sm:p-6 shadow-xs"
              >
                <p className="font-okcok text-base sm:text-lg md:text-xl uppercase leading-snug text-ea-black">
                  "{mod.quoteText || mod.content}"
                </p>
                {mod.quoteAuthor && (
                  <footer className="mt-3 text-xs font-mono uppercase text-ea-black/60 tracking-wider">
                    — {mod.quoteAuthor}
                  </footer>
                )}
              </blockquote>
            );

          case 'technical-specs':
          case 'project-data': {
            const dataItems = mod.dataList && mod.dataList.length > 0
              ? mod.dataList
              : project.datos
              ? Object.entries(project.datos).map(([k, v]) => ({ key: k, value: String(v) }))
              : [];

            return (
              <div key={mod.id} className="my-6 p-5 sm:p-6 bg-[#FAF9F5] border-2 border-ea-black shadow-xs">
                <div className="flex items-center justify-between border-b-2 border-ea-black pb-3 mb-4">
                  <span className="font-anton text-xs uppercase tracking-wider text-ea-black">
                    {mod.title || 'FICHA TÉCNICA DEL PROYECTO'}
                  </span>
                  <span className="font-mono text-[10px] text-ea-black/50 uppercase">
                    REGISTRO OFICIAL
                  </span>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {dataItems.map((item, idx) => (
                    <div key={idx} className="border-b border-ea-border/60 pb-2">
                      <dt className="text-[10px] font-mono uppercase text-ea-black/50 tracking-wider">
                        {item.key}
                      </dt>
                      <dd className="text-xs font-anton uppercase text-ea-black pt-0.5">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          }

          case 'materials-list': {
            const materials = mod.dataList && mod.dataList.length > 0
              ? mod.dataList
              : (project.tags || []).map((t: string) => ({ key: 'MATERIAL', value: t }));

            return (
              <div key={mod.id} className="my-6 p-5 bg-white border-2 border-ea-black shadow-xs">
                <h4 className="font-anton text-xs uppercase tracking-wider text-ea-black mb-3">
                  {mod.title || 'PALETA MATERIAL & TECTÓNICA'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {materials.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#FAF9F5] border border-ea-black text-xs font-mono uppercase text-ea-black flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-ea-black/50" />
                      <span>{m.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          }

          case 'planimetry':
            return (
              <figure key={mod.id} className="my-8 group">
                <div
                  onClick={() => openCarouselAtUrl(mod.imageUrl || project.plans?.planta || project.heroImage)}
                  className="cursor-zoom-in relative overflow-hidden rounded-[2px] bg-white border border-neutral-100 flex items-center justify-center p-2 sm:p-4"
                  title="Clic para ampliar en carrusel de fotos"
                >
                  <img
                    src={toSeoImageUrl(
                      mod.imageUrl ||
                      project.plans?.planta ||
                      project.planImage ||
                      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
                      project,
                      'planimetria-arquitectonica'
                    )}
                    alt={buildProjectImageAlt(project, 'Planta arquitectónica y planimetría')}
                    className="w-full h-auto max-h-[560px] object-contain mx-auto group-hover:scale-[1.01] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-ea-black/90 text-white px-3 py-1.5 text-[10px] font-anton uppercase tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-xs">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                    <span>Ver en Carrusel</span>
                  </div>
                </div>
                {(mod.credits || project.datos?.fotografia || project.photographer) ? (
                  <figcaption className="pt-1.5 text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
                    {mod.credits || project.datos?.fotografia || project.photographer}
                  </figcaption>
                ) : null}
              </figure>
            );

          case 'map-location':
            return (
              <div key={mod.id} className="my-6 p-5 bg-[#FAF9F5] border-2 border-ea-black shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b-2 border-ea-black pb-2">
                  <MapPin className="w-4 h-4 text-ea-black" />
                  <span className="font-anton text-xs uppercase tracking-wider text-ea-black">
                    {mod.title || 'EMPLAZAMIENTO & TERRITORIO'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono uppercase text-ea-black/70">
                  <div>
                    <span className="text-[10px] text-ea-black/40 block">CIUDAD / PAÍS</span>
                    <strong className="text-ea-black font-anton">{project.location || 'ECUADOR'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ea-black/40 block">BARRIO / SECTOR</span>
                    <strong className="text-ea-black font-anton">{project.ciudad?.barrio || 'CENTRO'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ea-black/40 block">ALTURA MSNM</span>
                    <strong className="text-ea-black font-anton">{project.ciudad?.altura || 'ANDES'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ea-black/40 block">CLIMA</span>
                    <strong className="text-ea-black font-anton">{project.ciudad?.clima || 'TEMPLADO'}</strong>
                  </div>
                </div>
              </div>
            );

          case 'credits':
            return (
              <div key={mod.id} className="my-6 p-5 bg-white border-2 border-ea-black shadow-xs space-y-2">
                <span className="font-anton text-xs uppercase tracking-wider text-ea-black block border-b-2 border-ea-black pb-2">
                  {mod.title || 'CRÉDITOS EDITORIALES Y DE ARQUITECTURA'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono uppercase pt-2">
                  <div>
                    <span className="text-[10px] text-ea-black/40 block">AUTORÍA ARQUITECTÓNICA</span>
                    <strong className="text-ea-black">{project.studio || 'ESTUDIO'}</strong>
                  </div>
                  {Boolean(project.datos?.fotografia?.trim() || project.photographer?.trim()) && (
                    <div>
                      <span className="text-[10px] text-ea-black/40 block">FOTOGRAFÍA</span>
                      <strong className="text-ea-black">{project.datos?.fotografia || project.photographer}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-ea-black/40 block">COLABORADORES</span>
                    <span className="text-ea-black/80">{project.datos?.colaboradores || 'EQUIPO DE DISEÑO'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ea-black/40 block">REVISIÓN CRÍTICA</span>
                    <span className="text-ea-black/80">{project.critic || 'REDACCIÓN EA'}</span>
                  </div>
                </div>
              </div>
            );

          case 'external-links':
            return (
              <div key={mod.id} className="my-6 p-5 bg-[#FAF9F5] border-2 border-ea-black shadow-xs space-y-3">
                <span className="font-anton text-xs uppercase tracking-wider text-ea-black block border-b-2 border-ea-black pb-2">
                  {mod.title || 'DOCUMENTACIÓN Y RECURSOS ASOCIADOS'}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {(mod.externalLinks || [{ label: 'Web del Estudio', url: '#' }]).map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ea-black text-xs font-mono uppercase hover:bg-ea-black hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            );

          case 'references':
          case 'footnotes': {
            const rawContent = (mod.content || '').trim();
            const hasDataList = Boolean(mod.dataList && mod.dataList.length > 0);
            const hasLinks = Boolean(mod.externalLinks && mod.externalLinks.length > 0);

            if (!rawContent && !hasDataList && !hasLinks) return null;

            const lines = rawContent
              ? rawContent
                  .split('\n')
                  .map((l) => l.trim())
                  .filter(Boolean)
              : [];

            return (
              <aside
                key={mod.id}
                aria-label="Referencias y Bibliografía"
                className="mt-10 sm:mt-12 pt-6 sm:pt-7 border-t border-ea-black/20 space-y-3.5 select-text"
              >
                <div className="flex items-center gap-2.5 pb-1">
                  <BookOpen className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="font-mono text-[9.5px] sm:text-[10.5px] uppercase font-bold tracking-[0.2em] text-neutral-500">
                    {mod.title || 'REFERENCIAS & BIBLIOGRAFÍA'}
                  </span>
                  <span className="h-px flex-1 bg-ea-black/15" />
                </div>

                {lines.length > 0 && (
                  <ol className="space-y-2 font-mono text-[11px] sm:text-[11.5px] text-neutral-600 leading-relaxed list-none pl-0">
                    {lines.map((line, idx) => {
                      const match = line.match(/^(\[\d+\]|\d+\.|\([0-9]+\))\s*(.*)$/);
                      const prefix = match ? match[1] : `[${idx + 1}]`;
                      const text = match ? match[2] : line;

                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 pl-3 border-l-2 border-neutral-300 hover:border-ea-black transition-colors"
                        >
                          <span className="font-bold text-neutral-400 select-none text-[10px] sm:text-[10.5px] pt-0.5 shrink-0">
                            {prefix}
                          </span>
                          <span className="flex-1 break-words leading-relaxed text-ea-black/85">
                            {text}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {hasDataList && (
                  <ul className="space-y-2 font-mono text-[11px] sm:text-[11.5px] text-neutral-600 leading-relaxed list-none pl-0">
                    {mod.dataList!.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 pl-3 border-l-2 border-neutral-300 hover:border-ea-black transition-colors"
                      >
                        <span className="font-bold text-neutral-400 select-none text-[10px] sm:text-[10.5px] pt-0.5 shrink-0">
                          {item.key ? item.key : `[${idx + 1}]`}
                        </span>
                        <span className="flex-1 break-words leading-relaxed text-ea-black/85">
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {hasLinks && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {mod.externalLinks!.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-ea-black hover:text-white text-neutral-700 text-[10.5px] font-mono uppercase border border-neutral-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </aside>
            );
          }

          case 'separator':
            return (
              <hr key={mod.id} className="my-8 border-t-2 border-ea-black/30 border-dashed" />
            );

          default:
            return null;
        }
      })}

      {/* Auto-renderizado de referencias a nivel de proyecto si no se añadió un módulo explícito */}
      {(() => {
        const hasModuleRef = modules.some((m) => m.type === 'references' || m.type === 'footnotes');
        const projectRefs = project?.references || project?.referencias;
        if (hasModuleRef || !projectRefs) return null;

        const lines: string[] = Array.isArray(projectRefs)
          ? projectRefs.map((r: any) => (typeof r === 'string' ? r : r.title || r.text || '')).filter(Boolean)
          : typeof projectRefs === 'string'
          ? projectRefs.split('\n').map((l: string) => l.trim()).filter(Boolean)
          : [];

        if (lines.length === 0) return null;

        return (
          <aside
            aria-label="Referencias y Bibliografía"
            className="mt-10 sm:mt-12 pt-6 sm:pt-7 border-t border-ea-black/20 space-y-3.5 select-text"
          >
            <div className="flex items-center gap-2.5 pb-1">
              <BookOpen className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="font-mono text-[9.5px] sm:text-[10.5px] uppercase font-bold tracking-[0.2em] text-neutral-500">
                REFERENCIAS & BIBLIOGRAFÍA
              </span>
              <span className="h-px flex-1 bg-ea-black/15" />
            </div>
            <ol className="space-y-2 font-mono text-[11px] sm:text-[11.5px] text-neutral-600 leading-relaxed list-none pl-0">
              {lines.map((line, idx) => {
                const match = line.match(/^(\[\d+\]|\d+\.|\([0-9]+\))\s*(.*)$/);
                const prefix = match ? match[1] : `[${idx + 1}]`;
                const text = match ? match[2] : line;

                return (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 pl-3 border-l-2 border-neutral-300 hover:border-ea-black transition-colors"
                  >
                    <span className="font-bold text-neutral-400 select-none text-[10px] sm:text-[10.5px] pt-0.5 shrink-0">
                      {prefix}
                    </span>
                    <span className="flex-1 break-words leading-relaxed text-ea-black/85">
                      {text}
                    </span>
                  </li>
                );
              })}
            </ol>
          </aside>
        );
      })()}

      {/* Interactive Fullscreen Image Carousel Lightbox */}
      <ImageCarouselLightbox
        isOpen={carouselOpen}
        images={allImages}
        initialIndex={carouselIndex}
        projectTitle={project?.title || 'EXPEDIENTE VISUAL'}
        onClose={() => setCarouselOpen(false)}
      />
    </div>
  );
};
