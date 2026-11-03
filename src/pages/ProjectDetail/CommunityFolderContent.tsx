import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Heart,
  Plus,
  X,
  Send,
  Calendar,
  Camera,
  MessageSquare,
  Award,
  ShieldCheck,
  User,
  Mail,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from 'lucide-react';
import { useCommunityNotes } from '../../services/communityService';
import { WorksiteVisit, CriticalArgument } from '../../types/community';
import { FIGMA_PATHS } from './communityFigmaPaths';
import { uploadImageFile } from '../../utils/mediaUpload';
import { EditorialEmptyState } from '../../components/common/EditorialEmptyState';

interface CommunityFolderContentProps {
  project: any;
}

// Tape strip component for the authentic taped paper aesthetic (vertical masking tape strip as in Figma 112:1022)
const TapeStrip: React.FC<{ className?: string; rotate?: string }> = ({
  className = '',
  rotate = '-1.5deg',
}) => (
  <span
    aria-hidden="true"
    className={`absolute w-7 h-11 sm:w-8 sm:h-13 bg-[#EFECE1]/95 border border-ea-black/40 shadow-[1px_2px_4px_rgba(0,0,0,0.12)] pointer-events-none z-30 ${className}`}
    style={{
      transform: `rotate(${rotate})`,
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
    }}
  />
);

// Post-it Note: CONVERSACIONES CRÍTICAS (Figma Node 112:1247)
const FigmaNoteConversaciones: React.FC<{
  className?: string;
  onClick?: () => void;
  commentCount: number;
}> = ({ className = '', onClick, commentCount }) => (
  <div
    id="btn-goto-conversaciones"
    onClick={onClick}
    className={`group relative cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.01] ${className}`}
  >
    <svg
      viewBox="0 0 319 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto block pointer-events-none"
    >
      <path d={FIGMA_PATHS.leftNoteOutline} fill="#1D1D1B" />
      <path d={FIGMA_PATHS.leftNoteTextConversaciones} fill="#1D1D1B" />
      <path d={FIGMA_PATHS.leftNoteTextCriticas} fill="#1D1D1B" />
      {/* Componente cápsula: indicador de cantidad de comentarios */}
      <g transform="translate(4, 0)">
        <path d={FIGMA_PATHS.rightNotePillBg} fill="#1D1D1B" />
        <text
          x="155.7"
          y="298"
          fill="#FFFFFF"
          textAnchor="middle"
          className="font-okcok text-[15px] tracking-wider uppercase select-none"
        >
          {commentCount} {commentCount === 1 ? 'COMENTARIO' : 'COMENTARIOS'}
        </text>
      </g>
    </svg>
  </div>
);

// Post-it Note: VISITAS DE OBRA (Figma Node 112:1252)
const FigmaNoteVisitas: React.FC<{
  className?: string;
  onClick?: () => void;
  commentCount: number;
}> = ({ className = '', onClick, commentCount }) => (
  <div
    id="btn-goto-visitas"
    onClick={onClick}
    className={`group relative cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.01] ${className}`}
  >
    <svg
      viewBox="0 0 330 363"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto block pointer-events-none"
    >
      <path d={FIGMA_PATHS.rightNoteOutline} fill="#1D1D1B" />
      <path d={FIGMA_PATHS.rightNoteTextVisitasDe} fill="#1D1D1B" />
      <path d={FIGMA_PATHS.rightNoteTextObra} fill="#1D1D1B" />
      <path d={FIGMA_PATHS.rightNotePillBg} fill="#1D1D1B" />
      <text
        x="155.7"
        y="298"
        fill="#FFFFFF"
        textAnchor="middle"
        className="font-okcok text-[15px] tracking-wider uppercase select-none"
      >
        {commentCount} {commentCount === 1 ? 'COMENTARIO' : 'COMENTARIOS'}
      </text>
    </svg>
  </div>
);

export const CommunityFolderContent: React.FC<CommunityFolderContentProps> = ({ project }) => {
  // Conectar con el servicio de Notas de la Comunidad filtrado por projectId canónico y slug
  const {
    visits,
    arguments: criticalArguments,
    sessionUser,
    setSessionUser,
    addWorksiteVisit,
    addCriticalArgument,
    toggleVisitLike,
    toggleArgumentLike,
  } = useCommunityNotes(project.id, project.slug);

  // Estados visuales internos según Figma Frame 112:1022:
  const isVisitasEnabled = useMemo(() => {
    if (!project) return true;
    if (project.type === 'territorios' || project.type === 'academia') return false;
    if (project.category === 'EXPEDIENTE TERRITORIAL' || project.category === 'INVESTIGACIÓN ACADÉMICA') return false;
    if (project.hasVisitas === false) return false;
    return true;
  }, [project]);

  // - viewMode:
  //    'index': Selector inicial ("Índice General")
  //    'conversaciones': Tablero exclusivo de post-its con scroll interno para leer el texto completo
  //    'visitas': Vista directa de la Hoja Monográfica editorial con pestañas laterales
  const [viewMode, setViewMode] = useState<'index' | 'conversaciones' | 'visitas'>('index');

  // Stream activo para el modal de contribución
  const [activeStream, setActiveStream] = useState<'visitas' | 'conversaciones'>(() => (isVisitasEnabled ? 'visitas' : 'conversaciones'));

  // Índice de la visita seleccionada para la hoja monográfica de Visitas de Obra
  const [selectedVisitIndex, setSelectedVisitIndex] = useState(0);

  // Progreso de scroll de la hoja monográfica (0 a 1) para sincronizar el scrollbar doodle
  const [sheetScrollProgress, setSheetScrollProgress] = useState(0);

  // Visor Popup (Lightbox) para fotos de visitas de obra
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);

  // Navegación por teclado (flecha izquierda, flecha derecha, escape) en el lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % (lightboxPhotos.length || 1));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + (lightboxPhotos.length || 1)) % (lightboxPhotos.length || 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxPhotos.length]);

  // Modal de contribución
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'visitas' | 'conversaciones'>('visitas');

  // Formulario: Datos de Identidad del Autor (Nombre y Correo Electrónico)
  const [authorName, setAuthorName] = useState(() => sessionUser?.name || '');
  const [authorEmail, setAuthorEmail] = useState(() => sessionUser?.email || '');

  // Sincronizar si cambia sessionUser
  useEffect(() => {
    if (sessionUser?.name && !authorName) {
      setAuthorName(sessionUser.name);
    }
    if (sessionUser?.email && !authorEmail) {
      setAuthorEmail(sessionUser.email);
    }
  }, [sessionUser]);

  // Formulario: Visitas de obra
  const [visitExperience, setVisitExperience] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitPhotos, setVisitPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Formulario: Conversación crítica
  const [argTitle, setArgTitle] = useState('');
  const [argContent, setArgContent] = useState('');

  // Mensaje de estado / error
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visita activa mostrada en la hoja monográfica
  const activeVisit = visits[selectedVisitIndex] || visits[0] || null;

  // Subir imagen optimizada para arquitectura (URL de servidor o WebP compacto)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (visitPhotos.length + files.length > 3) {
      setFormError('Se permite un máximo de 3 fotografías por visita de obra.');
      return;
    }

    setIsUploadingPhoto(true);
    setFormError(null);

    try {
      const fileList = Array.from(files).slice(0, 3 - visitPhotos.length);
      for (const file of fileList) {
        const url = await uploadImageFile(file, { maxDimension: 1920, quality: 0.85, format: 'image/webp' });
        if (url) {
          setVisitPhotos((prev) => [...prev, url].slice(0, 3));
        }
      }
    } catch {
      setFormError('Error al procesar la fotografía.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setVisitPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Enviar formulario integrado
  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validación de Nombre y Correo
    const cleanName = authorName.trim();
    if (!cleanName) {
      setFormError('Por favor escribe tu nombre o firma profesional antes de publicar.');
      return;
    }

    const cleanEmail = authorEmail.trim();
    if (!cleanEmail) {
      setFormError('Por favor escribe tu correo electrónico antes de publicar.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setFormError('Por favor ingresa un formato de correo electrónico válido (ej. tu@correo.com).');
      return;
    }

    setIsSubmitting(true);

    // Persistir identidad en sesión y almacenamiento local
    setSessionUser({
      ...sessionUser,
      name: cleanName,
      email: cleanEmail,
    });

    if (modalMode === 'visitas') {
      if (!visitExperience.trim()) {
        setFormError('La descripción de la experiencia de visita es obligatoria.');
        setIsSubmitting(false);
        return;
      }

      const res = await addWorksiteVisit({
        experience: visitExperience,
        photos: visitPhotos.length > 0 ? visitPhotos : undefined,
        visitDate: visitDate || undefined,
        authorName: cleanName,
        authorEmail: cleanEmail,
      });

      if (!res.success) {
        setFormError(res.error || 'Error al registrar la visita.');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess('✓ Visita de obra enviada a moderación editorial. Se publicará una vez aprobada.');
      setVisitExperience('');
      setVisitDate('');
      setVisitPhotos([]);
      setActiveStream('visitas');
      setSelectedVisitIndex(0);
      setViewMode('visitas');
    } else {
      if (!argContent.trim()) {
        setFormError('El argumento crítico es obligatorio.');
        setIsSubmitting(false);
        return;
      }

      const res = await addCriticalArgument({
        argumentTitle: argTitle || undefined,
        argument: argContent,
        authorName: cleanName,
        authorEmail: cleanEmail,
      });

      if (!res.success) {
        setFormError(res.error || 'Error al registrar el argumento.');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess('✓ Argumento crítico enviado a moderación editorial. Se publicará una vez aprobado.');
      setArgTitle('');
      setArgContent('');
      setActiveStream('conversaciones');
      setViewMode('conversaciones');
    }

    setIsSubmitting(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setFormSuccess(null);
    }, 1800);
  };

  return (
    <div className="w-full text-ea-black select-text py-2 sm:py-4">
      <style>{`
        .community-custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .community-custom-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        .community-custom-scroll::-webkit-scrollbar-thumb {
          background: #1B1B1B;
          border-radius: 2px;
        }
        .sheet-editorial-scroll::-webkit-scrollbar {
          display: none;
          width: 0px;
          height: 0px;
        }
        .sheet-editorial-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* =================================================================== */}
      {/* VISTA 1: ÍNDICE GENERAL / POST-ITS (Figma 112:1022 - Compacta)      */}
      {/* =================================================================== */}
      {viewMode === 'index' && (
        <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[380px] py-2 sm:py-3 select-none">
          {criticalArguments.length === 0 && visits.length === 0 && (
            <div className="w-full max-w-xl mb-6">
              <EditorialEmptyState section="comunidad" variant="card" />
            </div>
          )}
          {/* Post-it(s) Centrados: En Proyectos muestra Conversaciones y Visitas; en Territorios y Academia solo Conversaciones */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-6 md:gap-7 w-full ${isVisitasEnabled ? 'max-w-xl' : 'max-w-md'} pb-6 sm:pb-7`}>
            <FigmaNoteConversaciones
              onClick={() => {
                setActiveStream('conversaciones');
                setViewMode('conversaciones');
              }}
              commentCount={criticalArguments.length}
              className="w-[230px] sm:w-[200px] md:w-[215px] shrink-0"
            />

            {isVisitasEnabled && (
              <FigmaNoteVisitas
                onClick={() => {
                  setActiveStream('visitas');
                  setSelectedVisitIndex(0);
                  setViewMode('visitas');
                }}
                commentCount={visits.length}
                className="w-[230px] sm:w-[200px] md:w-[215px] shrink-0"
              />
            )}
          </div>

          {/* Botón inferior centrado con marco artesanal */}
          <div className="pt-1 flex justify-center w-full">
            <button
              id="btn-contribuir-index"
              onClick={() => {
                setModalMode(isVisitasEnabled ? activeStream : 'conversaciones');
                setFormError(null);
                setFormSuccess(null);
                setIsModalOpen(true);
              }}
              className="group relative cursor-pointer select-none transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] bg-transparent border-0 p-0 min-h-[48px] flex items-center justify-center"
              style={{ width: '280px', maxWidth: '88%' }}
            >
              <img
                src="/btn_contribuir.png"
                alt="CONTRIBUIR AL ESPACIO"
                className="w-full h-auto block select-none pointer-events-none"
              />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 2: CONVERSACIONES CRÍTICAS (POST-ITS CON SCROLL INTERNO)      */}
      {/* =================================================================== */}
      {viewMode === 'conversaciones' && (
        <div className="flex flex-col w-full gap-4 pt-1 select-none">
          {/* Fila Superior: Navegación + Título + Acciones con diseño limpio y coherente */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-dashed border-ea-black/20">
            <div>
              <button
                type="button"
                id="btn-back-to-index-conv"
                onClick={() => setViewMode('index')}
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-ea-black text-ea-black hover:text-white border-2 border-ea-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-okcok text-xs uppercase tracking-wide cursor-pointer mb-2 min-h-[42px] rounded-[6px]"
              >
                <span className="text-sm leading-none transition-transform group-hover:-translate-x-0.5">&larr;</span>
                <span>VOLVER AL ÍNDICE GENERAL</span>
              </button>
              <h3 className="font-anton text-xl uppercase tracking-wide text-ea-black mt-0.5">
                CONVERSACIONES CRÍTICAS
              </h3>
              <p className="font-creato text-[11px] text-ea-black/65">
                Debates y posturas teóricas • Desplázate dentro de cada post-it para leer el argumento completo
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
              {isVisitasEnabled && (
                <button
                  type="button"
                  id="btn-switch-to-visitas"
                  onClick={() => {
                    setActiveStream('visitas');
                    setSelectedVisitIndex(0);
                    setViewMode('visitas');
                  }}
                  className="group inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ea-black text-ea-black hover:text-white border-2 border-ea-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-okcok text-xs uppercase tracking-wide cursor-pointer min-h-[42px] rounded-[6px] shrink-0"
                >
                  <span>VER VISITAS ({visits.length})</span>
                  <span className="text-sm leading-none transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </button>
              )}
              <button
                type="button"
                id="btn-add-argument-header"
                onClick={() => {
                  setModalMode('conversaciones');
                  setFormError(null);
                  setFormSuccess(null);
                  setIsModalOpen(true);
                }}
                className="flex-1 sm:flex-initial bg-white hover:bg-black hover:text-white text-ea-black border-2 border-ea-black py-2 px-3.5 text-center font-okcok text-xs sm:text-[13px] tracking-wider uppercase shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer min-h-[44px] flex items-center justify-center shrink-0"
              >
                + APORTAR ARGUMENTO
              </button>
            </div>
          </div>

          {/* Tablero de Post-its de Conversación Crítica (2 columnas para lectura espaciosa y cómoda) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full items-stretch">
            {criticalArguments.length === 0 && (
              <div className="col-span-full mb-2">
                <EditorialEmptyState section="comunidad" variant="card" />
              </div>
            )}
            {criticalArguments.map((arg, idx) => (
              <div
                key={arg.id}
                id={`postit-argument-${idx}`}
                className="group relative bg-white border-2 border-ea-black p-5 sm:p-5.5 shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#000] transition-all flex flex-col justify-between h-[360px] sm:h-[385px] select-text"
              >
                {/* Cinta adhesiva superior auténtica */}
                <TapeStrip className="-top-3.5 left-1/2 -translate-x-1/2" rotate={idx % 2 === 0 ? '-1.5deg' : '1.2deg'} />

                {/* Cabecera del Post-it: Autor, número y título */}
                <div className="border-b border-ea-black/15 pb-2 mb-2 select-none">
                  <div className="flex justify-between items-center">
                    <span className="font-anton text-xs sm:text-[12px] uppercase text-ea-black tracking-wide truncate max-w-[210px]">
                      {arg.authorName}
                    </span>
                    <span className="font-mono text-[9px] text-ea-black/50">
                      #0{idx + 1}
                    </span>
                  </div>
                  <h4 className="font-anton text-[11.5px] sm:text-[12px] uppercase text-ea-black/85 leading-tight tracking-wide mt-1 line-clamp-2">
                    {arg.argumentTitle || `ARGUMENTO CRÍTICO 0${idx + 1}`}
                  </h4>
                </div>

                {/* Cuerpo del argumento: scrollable libremente al hacer clic o interactuar dentro */}
                <div className="flex-1 overflow-y-auto pr-2 mb-2 space-y-1 community-custom-scroll text-left">
                  <p className="font-creato text-xs sm:text-[13px] text-ea-black/90 leading-[1.62] whitespace-pre-line text-justify">
                    {arg.argument}
                  </p>
                </div>

                {/* Pie del post-it */}
                <div className="pt-2 border-t border-dashed border-ea-black/20 flex justify-between items-center font-mono text-[8.5px] text-ea-black/55 select-none">
                  <span>
                    {arg.createdAt ? new Date(arg.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'DEBATE ABIERTO'}
                  </span>
                  <span className="font-anton text-[9.5px] text-ea-black uppercase tracking-wider flex items-center gap-1">
                    SCROLL PARA LEER &darr;
                  </span>
                </div>
              </div>
            ))}

            {/* Ficha adhesiva para agregar nuevo argumento crítico */}
            <div
              id="btn-add-argument-postit"
              onClick={() => {
                setModalMode('conversaciones');
                setFormError(null);
                setFormSuccess(null);
                setIsModalOpen(true);
              }}
              className="group relative bg-[#FAF9F5] border-2 border-dashed border-ea-black p-5 sm:p-6 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all flex flex-col items-center justify-center min-h-[220px] sm:h-[385px] cursor-pointer text-center gap-3 select-none"
            >
              <TapeStrip className="-top-3.5 left-1/2 -translate-x-1/2" rotate="0deg" />

              <div className="w-10 h-10 border-2 border-ea-black rounded-full flex items-center justify-center font-bold text-xl text-ea-black group-hover:scale-110 transition-transform">
                +
              </div>
              <div>
                <div className="font-okcok text-sm sm:text-base uppercase text-ea-black tracking-wide leading-tight">
                  PLANTEAR NUEVO<br />ARGUMENTO
                </div>
                <div className="font-creato text-[10px] text-ea-black/60 mt-1 max-w-[190px]">
                  Aporta tu postura crítica o reflexión sobre este proyecto
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 3: VISITAS DE OBRA (HOJA MONOGRÁFICA FIGMA COMPONENT 7)       */}
      {/* Post-it de Conversación Crítica ubicado FUERA del contenedor de     */}
      {/* textos (como pestaña/marcador externo a la izquierda)               */}
      {/* =================================================================== */}
      {viewMode === 'visitas' && activeVisit && (() => {
        const visitCreatedDateFormatted = (() => {
          if (activeVisit.createdAt) {
            try {
              const d = new Date(activeVisit.createdAt);
              return d.toLocaleDateString('es-EC', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).toUpperCase();
            } catch {
              return '2 DE OCTUBRE, 2026';
            }
          }
          return '2 DE OCTUBRE, 2026';
        })();

        return (
          <>
            {/* ------------------------------------------------------------- */}
            {/* VISTA MÓVIL: HOJA MONOGRÁFICA EDITORIAL ERGONÓMICA (< 768px)  */}
            {/* ------------------------------------------------------------- */}
            <div className="block md:hidden w-full select-text pb-6">
              {/* Barra de acción superior ergonómica y limpia */}
              <div className="flex items-center justify-between gap-2.5 pb-3 mb-3 border-b border-dashed border-[#1D1D1B]/20">
                <button
                  type="button"
                  id="btn-back-to-index-visitas-mobile"
                  onClick={() => setViewMode('index')}
                  className="group inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ea-black text-ea-black hover:text-white border-2 border-ea-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-okcok text-xs uppercase tracking-wide cursor-pointer shrink-0 min-h-[42px] rounded-[6px]"
                >
                  <span className="text-sm leading-none transition-transform group-hover:-translate-x-0.5">&larr;</span>
                  <span>ÍNDICE GENERAL</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStream('conversaciones');
                    setViewMode('conversaciones');
                  }}
                  className="group inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ea-black text-ea-black hover:text-white border-2 border-ea-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-okcok text-xs uppercase tracking-wide cursor-pointer shrink-0 min-h-[42px] rounded-[6px]"
                >
                  <span>CRÍTICAS ({criticalArguments.length})</span>
                  <span className="text-sm leading-none transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </button>
              </div>

              {/* Selector horizontal de visitas con touch targets de 44px */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-4 w-full">
                {visits.map((v, i) => {
                  const isSel = selectedVisitIndex === i;
                  const authorLabel = v.authorName?.toUpperCase() || `VISITA #0${i + 1}`;
                  return (
                    <button
                      key={v.id || i}
                      id={`mobile-visit-chip-${i}`}
                      onClick={() => setSelectedVisitIndex(i)}
                      className={`shrink-0 px-3.5 py-2 min-h-[44px] font-anton text-xs uppercase tracking-wider border-2 border-ea-black transition-all cursor-pointer flex items-center gap-2 select-none ${
                        isSel
                          ? 'bg-[#1D1D1B] text-white shadow-[2px_2px_0px_#000]'
                          : 'bg-white text-ea-black hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{authorLabel}</span>
                      <span className={`text-[10px] font-mono px-1 py-0.5 rounded-2xs ${isSel ? 'bg-white/20 text-white' : 'bg-ea-black/10 text-ea-black'}`}>
                        #0{i + 1}
                      </span>
                    </button>
                  );
                })}
                <button
                  id="btn-mobile-add-visit-chip"
                  onClick={() => {
                    setModalMode('visitas');
                    setFormError(null);
                    setFormSuccess(null);
                    setIsModalOpen(true);
                  }}
                  className="shrink-0 px-3.5 py-2 min-h-[44px] font-anton text-xs uppercase tracking-wider border-2 border-dashed border-ea-black bg-[#FAF9F5] hover:bg-[#1D1D1B] hover:text-white text-ea-black transition-colors cursor-pointer flex items-center gap-1.5 select-none"
                >
                  <span>+ APORTAR</span>
                </button>
              </div>

              {/* Tarjeta monográfica artesanal en papel brutalista */}
              <article className="relative bg-white border-2 border-ea-black p-4 sm:p-5 shadow-[4px_4px_0px_#000] text-left pt-6">
                <TapeStrip className="-top-3.5 left-1/2 -translate-x-1/2" rotate="-1deg" />

                {/* Badge cápsula de cabecera */}
                <div className="inline-block bg-[#1D1D1B] text-white px-3 py-1 font-okcok text-xs uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,0.2)] mb-3">
                  VISITAS DE OBRA // REGISTRO
                </div>

                {/* Título Anton grande y fluido */}
                <h3 className="font-anton text-2xl uppercase leading-tight tracking-wide text-ea-black break-words mt-1 mb-2">
                  {(() => {
                    const text = activeVisit.experience.trim();
                    const firstSentence = text.split(/[.\n]/)[0];
                    return firstSentence.toUpperCase();
                  })()}
                </h3>

                {/* Fila de metadatos tipográficos limpios */}
                <div className="font-mono text-[11px] text-ea-black/70 uppercase flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-ea-black/15">
                  <span>PUBLICADO EL {visitCreatedDateFormatted}</span>
                  {activeVisit.visitDate && (
                    <>
                      <span className="opacity-30">//</span>
                      <span>VISITA: {activeVisit.visitDate}</span>
                    </>
                  )}
                  <span className="opacity-30">•</span>
                  <span className="font-bold text-ea-black">REGISTRO IN SITU</span>
                </div>

                {/* Línea de autor y número de visita */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-ea-black/20 font-mono text-xs">
                  <span className="font-anton text-xs tracking-wider uppercase text-ea-black">
                    AUTOR: {activeVisit.authorName?.toUpperCase() || 'ARQUITECTO VISITANTE'}
                  </span>
                  <span className="text-[10px] bg-[#EAE6DD] px-2 py-0.5 border border-ea-black/30 font-bold">
                    VISITA #0{selectedVisitIndex + 1}
                  </span>
                </div>

                {/* Cuerpo editorial de la visita */}
                <div className="font-creato text-[15px] sm:text-base leading-[1.65] text-ea-black/90 break-words whitespace-pre-line text-left py-2">
                  {activeVisit.experience}
                </div>

                {/* Galería de fotos fotográficas de obra */}
                {activeVisit.photos && activeVisit.photos.length > 0 && (
                  <div className="mt-5 pt-4 border-t-2 border-dashed border-ea-black">
                    <div className="font-anton text-sm uppercase tracking-wider text-ea-black mb-3">
                      REGISTRO FOTOGRÁFICO ({activeVisit.photos.length}{' '}
                      {activeVisit.photos.length === 1 ? 'FOTOGRAFÍA' : 'FOTOGRAFÍAS'})
                    </div>

                    <div className="space-y-4">
                      {activeVisit.photos.map((photoUrl, pIdx) => (
                        <div
                          key={pIdx}
                          id={`btn-mobile-photo-${pIdx}`}
                          onClick={() => {
                            setLightboxPhotos(activeVisit.photos || []);
                            setLightboxIndex(pIdx);
                            setLightboxOpen(true);
                          }}
                          className="bg-[#FAF8F5] border-2 border-ea-black p-2.5 shadow-[3px_3px_0px_#000] cursor-pointer group active:scale-[0.99] transition-transform"
                        >
                          <div className="w-full aspect-[4/3] bg-[#EAE6DD] overflow-hidden border border-ea-black/20 relative">
                            <img
                              src={photoUrl}
                              alt={`Registro fotográfico ${pIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-ea-black text-white px-2.5 py-1 font-mono text-[11px] uppercase border border-white">
                                AMPLIAR FOTO ⤢
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between font-mono text-[11px] uppercase text-ea-black">
                            <span>FIG. 1.0{selectedVisitIndex + 1}.{pIdx + 1}</span>
                            <span className="underline font-bold text-[11px]">TOCA PARA AMPLIAR &rarr;</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón ergonómico inferior de contribución */}
                <div className="mt-5 pt-4 border-t border-ea-black/20">
                  <button
                    type="button"
                    id="btn-mobile-contribuir-visita"
                    onClick={() => {
                      setModalMode('visitas');
                      setFormError(null);
                      setFormSuccess(null);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-3 min-h-[48px] bg-[#1D1D1B] hover:bg-black text-white font-okcok text-sm uppercase tracking-wider shadow-[3px_3px_0px_#000] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>+ APORTAR TU VISITA DE OBRA</span>
                  </button>
                </div>
              </article>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* VISTA DESKTOP: HOJA MONOGRÁFICA EN VECTOR DOODLE (>= 768px)   */}
            {/* ------------------------------------------------------------- */}
            <div className="hidden md:block w-full select-none" style={{ margin: '0 -24px', width: 'calc(100% + 48px)' }}>
              {/* Barra superior de navegación FUERA de la hoja: botón Índice General altamente visible y fácil de usar */}
              <div className="flex items-center justify-between pb-3 px-6 sm:px-8 border-b border-dashed border-[#1D1D1B]/20 mb-2">
                <button
                  type="button"
                  id="btn-back-to-index-visitas"
                  onClick={() => setViewMode('index')}
                  className="group inline-flex items-center gap-2.5 px-4 py-2 bg-[#FAF8F5] hover:bg-[#1D1D1B] text-[#1D1D1B] hover:text-white border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] hover:shadow-[4px_4px_0px_#1D1D1B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-mono text-[12px] sm:text-[13px] uppercase font-bold cursor-pointer"
                >
                  <span className="text-base leading-none transition-transform group-hover:-translate-x-1">&larr;</span>
                  <span>VOLVER AL ÍNDICE GENERAL</span>
                </button>

                <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#1D1D1B]/55">
                  <span>NOTAS DE LA COMUNIDAD</span>
                  <span className="opacity-40">//</span>
                  <span className="font-bold text-[#1D1D1B]">VISITAS DE OBRA</span>
                </div>
              </div>

            <svg
              viewBox="-180 -25 1440 1220"
              width="100%"
              height="auto"
              className="w-full h-auto block select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="f-drop-c7" x="-3%" y="-3%" width="108%" height="108%">
                  <feDropShadow dx="4" dy="4" stdDeviation="0" floodColor="#000000" />
                </filter>
                <filter id="p-drop-c7" x="-5%" y="-5%" width="115%" height="115%">
                  <feDropShadow dx="3" dy="3" stdDeviation="0" floodColor="#000000" />
                </filter>
              </defs>

              {/* 1. Main Sheet Alargada Verticalmente (Protagonista) con White Fill & Hard Shadow */}
              <g filter="url(#f-drop-c7)">
                <path d={FIGMA_PATHS.readerMainSheetOuterTall} fill="#FFFFFF" />
                <path d={FIGMA_PATHS.readerMainSheetTall} fill="#1D1D1B" />
              </g>

              {/* 2. Tape on sheet top-left (Vector 112:1091 at dx: 205, dy: 3) */}
              <g transform="translate(205, -5) rotate(-1.5)">
                <rect x="0" y="0" width="44" height="74" fill="#EFECE1" stroke="#1D1D1B" strokeWidth="1.6" opacity="0.95" />
              </g>

              {/* 3. Black Top Pill: VISITAS DE OBRA (112:1101 at dx: 634, dy: 10) */}
              <g transform="translate(634, 10)" filter="url(#p-drop-c7)">
                <path d={FIGMA_PATHS.readerTopPill} fill="#1D1D1B" />
                <text
                  x="165"
                  y="40"
                  fontFamily="'OKCOK', sans-serif"
                  fontSize="26"
                  fill="#FFFFFF"
                  textAnchor="middle"
                  letterSpacing="2"
                >
                  VISITAS DE OBRA
                </text>
              </g>

              {/* 4. Left Post-it: FUERA DEL CONTENEDOR DE TEXTOS (dx: -160, dy: 240) */}
              {/* Pestaña / Anotación adhesiva externa que invita a navegar a Conversaciones Críticas */}
              <g
                transform="translate(-160, 240)"
                filter="url(#p-drop-c7)"
                className="cursor-pointer group hover:opacity-90 transition-opacity duration-150"
                onClick={() => {
                  setActiveStream('conversaciones');
                  setViewMode('conversaciones');
                }}
                id="c7-left-postit-btn"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
              >
                {/* Hitbox transparente para capturar clics en todo el post-it */}
                <rect x="0" y="-15" width="200" height="245" fill="transparent" style={{ pointerEvents: 'all' }} />

                <path d={FIGMA_PATHS.readerLeftNoteOuter} fill="#FFFFFF" />
                <path d={FIGMA_PATHS.readerLeftNote} fill="#1D1D1B" />

                {/* Tape on top of post-it */}
                <rect
                  x="83"
                  y="-14"
                  width="34"
                  height="60"
                  fill="#EFECE1"
                  stroke="#1D1D1B"
                  strokeWidth="1.5"
                  transform="rotate(-1.2 100 15)"
                />

                <text
                  x="99"
                  y="112"
                  fontFamily="'Anton', Impact, sans-serif"
                  fontSize="18"
                  fill="#1D1D1B"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  CONVERSACIONES
                </text>
                <text
                  x="99"
                  y="142"
                  fontFamily="'Anton', Impact, sans-serif"
                  fontSize="28"
                  fill="#1D1D1B"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  CRÍTICAS
                </text>

                {/* Pill inside post-it */}
                <g transform="translate(34, 169)">
                  <path d={FIGMA_PATHS.readerLeftNotePill} fill="#1D1D1B" />
                  <text
                    x="62"
                    y="19"
                    fontFamily="'OKCOK', sans-serif"
                    fontSize="13"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    letterSpacing="0.5"
                  >
                    {criticalArguments.length} {criticalArguments.length === 1 ? 'APORTE' : 'APORTES'} &rarr;
                  </text>
                </g>
              </g>

              {/* 5. Editorial Area Header: Título en fuente escalada grande + Fecha de publicación abajo */}
              <foreignObject x="55" y="105" width="880" height="145">
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: "'Anton', Impact, sans-serif",
                      fontSize: '44px',
                      textTransform: 'uppercase',
                      lineHeight: '1.1',
                      color: '#1D1D1B',
                      letterSpacing: '0.8px',
                    }}
                  >
                    {(() => {
                      const text = activeVisit.experience.trim();
                      const firstSentence = text.split(/[.\n]/)[0];
                      if (firstSentence.length <= 44) {
                        return firstSentence.toUpperCase();
                      }
                      const words = firstSentence.split(' ');
                      const mid = Math.ceil(words.length / 2);
                      const line1 = words.slice(0, mid).join(' ');
                      const line2 = words.slice(mid).join(' ');
                      return (
                        <>
                          {line1.toUpperCase()}
                          <br />
                          {line2.toUpperCase()}
                        </>
                      );
                    })()}
                  </h2>

                  {/* Fecha de publicación y metadata de visita directamente abajo del título (sin caja contenedora) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                      color: 'rgba(29, 29, 27, 0.75)',
                      letterSpacing: '0.8px',
                    }}
                  >
                    <span>PUBLICADO EL {visitCreatedDateFormatted}</span>
                    {activeVisit.visitDate && (
                      <>
                        <span style={{ opacity: 0.35 }}>//</span>
                        <span>FECHA DE VISITA: {activeVisit.visitDate}</span>
                      </>
                    )}
                    <span style={{ opacity: 0.35 }}>•</span>
                    <span style={{ fontWeight: 'bold', color: '#1D1D1B' }}>REGISTRO IN SITU</span>
                  </div>
                </div>
              </foreignObject>

              {/* Author Capsule eliminada: el arquitecto se identifica únicamente en su lengüeta derecha */}

              {/* Body Paragraph + Galería de Fotos de Obra con Scroll Interno fluido (alargado verticalmente) */}
              <foreignObject x="55" y="260" width="880" height="820">
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  className="sheet-editorial-scroll"
                  onScroll={(e) => {
                    const t = e.currentTarget;
                    const max = t.scrollHeight - t.clientHeight;
                    setSheetScrollProgress(max > 0 ? t.scrollTop / max : 0);
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    fontFamily: "'Creato Display', sans-serif",
                    fontSize: '26px',
                    lineHeight: '1.72',
                    color: '#1D1D1B',
                    textAlign: 'justify',
                    paddingRight: '18px',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Texto editorial de la experiencia de visita */}
                  <p
                    style={{
                      margin: 0,
                      marginBottom: activeVisit.photos && activeVisit.photos.length > 0 ? '28px' : '0px',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {activeVisit.experience}
                  </p>

                  {/* Galería de fotos subidas por el usuario / visitantes */}
                  {activeVisit.photos && activeVisit.photos.length > 0 && (
                    <div
                      style={{
                        marginTop: '28px',
                        borderTop: '2px dashed #1D1D1B',
                        paddingTop: '24px',
                        paddingBottom: '24px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Anton', Impact, sans-serif",
                          fontSize: '22px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          color: '#1D1D1B',
                          marginBottom: '18px',
                        }}
                      >
                        REGISTRO FOTOGRÁFICO DE OBRA ({activeVisit.photos.length}{' '}
                        {activeVisit.photos.length === 1 ? 'FOTOGRAFÍA' : 'FOTOGRAFÍAS'})
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            activeVisit.photos.length === 1
                              ? '1fr'
                              : '1fr 1fr',
                          gap: '20px',
                        }}
                      >
                        {activeVisit.photos.map((photoUrl, pIdx) => {
                          const isLastOdd = activeVisit.photos.length % 2 !== 0 && pIdx === activeVisit.photos.length - 1;
                          const cardHeight = activeVisit.photos.length === 1 ? '480px' : isLastOdd ? '420px' : '370px';
                          return (
                          <div
                            key={pIdx}
                            id={`btn-open-photo-${pIdx}`}
                            onClick={() => {
                              setLightboxPhotos(activeVisit.photos || []);
                              setLightboxIndex(pIdx);
                              setLightboxOpen(true);
                            }}
                            className="group/photo"
                            style={{
                              background: '#FFFFFF',
                              border: '2px solid #1D1D1B',
                              padding: '12px',
                              boxShadow: '5px 5px 0px #000',
                              cursor: 'pointer',
                              position: 'relative',
                              gridColumn: isLastOdd ? 'span 2' : 'span 1',
                            }}
                          >
                            <div
                              style={{
                                width: '100%',
                                height: cardHeight,
                                overflow: 'hidden',
                                background: '#EAE6DD',
                                border: '1px solid rgba(0,0,0,0.2)',
                                position: 'relative',
                              }}
                            >
                              <img
                                src={photoUrl}
                                alt={`Registro fotográfico de obra ${pIdx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                              {/* Overlay indicador para ampliar en popup */}
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(0,0,0,0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.15s ease',
                                }}
                                className="group-hover/photo:opacity-100"
                              >
                                <span
                                  style={{
                                    background: '#1D1D1B',
                                    color: '#FFFFFF',
                                    padding: '6px 12px',
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    letterSpacing: '1px',
                                    border: '1px solid #FFFFFF',
                                  }}
                                >
                                  AMPLIAR REGISTRO ⤢
                                </span>
                              </div>
                            </div>
                            <div
                              style={{
                                marginTop: '10px',
                                fontFamily: 'monospace',
                                fontSize: '15.5px',
                                textTransform: 'uppercase',
                                color: '#1D1D1B',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span>
                                FIG. 1.0{selectedVisitIndex + 1}.{pIdx + 1}
                              </span>
                              <span style={{ textDecoration: 'underline', fontSize: '13px' }}>
                                VER EN POPUP &rarr;
                              </span>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </foreignObject>

              {/* Scrollbar Track & Thumb interactivo dinámico (alargado verticalmente) */}
              <g transform="translate(953, 132)">
                <path d={FIGMA_PATHS.readerScrollbarTrackTall} fill="#1D1D1B" />
                <path
                  d={FIGMA_PATHS.readerScrollbarThumb}
                  transform={`translate(2, ${20 + sheetScrollProgress * 840})`}
                  fill="#1D1D1B"
                />
              </g>

              {/* 6. Right Tabs Stack (dx: 1022): Renderiza únicamente las visitas reales existentes + 1 pestaña "+ APORTAR AL ESPACIO" inmediatamente siguiente */}
              {(() => {
                const TAB_Y_SLOTS = [100, 215, 330, 445, 560];
                const maxVisitsToShow = 4;
                const visibleVisits = visits.slice(0, maxVisitsToShow);
                const aportarSlotIndex = Math.min(visibleVisits.length, 4);
                const aportarY = TAB_Y_SLOTS[aportarSlotIndex];

                return (
                  <>
                    {/* Pestañas de visitas existentes */}
                    {visibleVisits.map((visit, idx) => {
                      const isSelected = selectedVisitIndex === idx;
                      const tabY = TAB_Y_SLOTS[idx];
                      const authorStr = visit.authorName?.toUpperCase() || `USUARIO 0${idx + 1}`;
                      const isLong = authorStr.length > 15;

                      if (idx === 0) {
                        return (
                          <g
                            key={visit.id || `visit-${idx}`}
                            transform={`translate(1022, ${tabY})`}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedVisitIndex(0);
                              setSheetScrollProgress(0);
                            }}
                            id="c7-tab-0"
                            style={{ cursor: 'pointer', pointerEvents: 'all' }}
                          >
                            <rect
                              x="2"
                              y="2"
                              width="196"
                              height="88"
                              rx="4"
                              fill={isSelected ? '#1D1D1B' : '#FFFFFF'}
                              stroke="#1D1D1B"
                              strokeWidth="1.5"
                              style={{ pointerEvents: 'all' }}
                            />
                            <text
                              x="100"
                              y="44"
                              fontFamily="'OKCOK', sans-serif"
                              fontSize={authorStr.length > 20 ? '12.5' : '14'}
                              textLength={isLong ? '155' : undefined}
                              lengthAdjust={isLong ? 'spacingAndGlyphs' : undefined}
                              fill={isSelected ? '#FFFFFF' : '#1D1D1B'}
                              textAnchor="middle"
                              textTransform="uppercase"
                            >
                              {authorStr}
                            </text>
                            <text
                              x="100"
                              y="66"
                              fontFamily="'OKCOK', sans-serif"
                              fontSize="13"
                              fill={isSelected ? '#EFECE1' : '#1D1D1B'}
                              textAnchor="middle"
                              textTransform="uppercase"
                            >
                              VISITA #01
                            </text>
                          </g>
                        );
                      }

                      const tabPath =
                        idx === 1
                          ? FIGMA_PATHS.readerTab2
                          : idx === 2
                          ? FIGMA_PATHS.readerTab3
                          : FIGMA_PATHS.readerTab4;

                      return (
                        <g
                          key={visit.id || `visit-${idx}`}
                          transform={`translate(1022, ${tabY})`}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedVisitIndex(idx);
                            setSheetScrollProgress(0);
                          }}
                          id={`c7-tab-${idx}`}
                          style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        >
                          <rect
                            x="2"
                            y="2"
                            width="198"
                            height="96"
                            rx="4"
                            fill={isSelected ? '#1D1D1B' : '#FFFFFF'}
                            style={{ pointerEvents: 'all' }}
                          />
                          <path
                            d={tabPath}
                            fill={isSelected ? '#FFFFFF' : '#1D1D1B'}
                          />
                          <text
                            x="100"
                            y="46"
                            fontFamily="'OKCOK', sans-serif"
                            fontSize={authorStr.length > 20 ? '12.5' : '14'}
                            textLength={isLong ? '155' : undefined}
                            lengthAdjust={isLong ? 'spacingAndGlyphs' : undefined}
                            fill={isSelected ? '#FFFFFF' : '#1D1D1B'}
                            textAnchor="middle"
                            textTransform="uppercase"
                          >
                            {authorStr}
                          </text>
                          <text
                            x="100"
                            y="68"
                            fontFamily="'OKCOK', sans-serif"
                            fontSize="13"
                            fill={isSelected ? '#EFECE1' : '#1D1D1B'}
                            textAnchor="middle"
                            textTransform="uppercase"
                          >
                            VISITA #0{idx + 1}
                          </text>
                        </g>
                      );
                    })}

                    {/* Pestaña Única: "+ APORTAR AL ESPACIO" inmediatamente siguiente (sin transforms para evitar parpadeos) */}
                    <g
                      transform={`translate(1022, ${aportarY})`}
                      className="cursor-pointer group hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setModalMode('visitas');
                        setFormError(null);
                        setFormSuccess(null);
                        setIsModalOpen(true);
                      }}
                      id="btn-reader-add-tab"
                      style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    >
                      <rect
                        x="2"
                        y="2"
                        width="198"
                        height="96"
                        rx="4"
                        fill="#FFFFFF"
                        style={{ pointerEvents: 'all' }}
                      />
                      <path d={FIGMA_PATHS.readerTab5Dashed} fill="#1D1D1B" />
                      <text
                        x="100"
                        y="46"
                        fontFamily="'OKCOK', sans-serif"
                        fontSize="14.5"
                        fill="#1D1D1B"
                        textAnchor="middle"
                        textTransform="uppercase"
                      >
                        + APORTAR AL
                      </text>
                      <text
                        x="100"
                        y="68"
                        fontFamily="'OKCOK', sans-serif"
                        fontSize="14.5"
                        fill="#1D1D1B"
                        textAnchor="middle"
                        textTransform="uppercase"
                      >
                        ESPACIO
                      </text>
                    </g>
                  </>
                );
              })()}
            </svg>
          </div>
        </>
      );
    })()}

      {/* =================================================================== */}
      {/* VISTA 3B: VISITAS DE OBRA - ESTADO VACÍO EDITORIAL                  */}
      {/* Cuando no existen visitas registradas aún en el expediente          */}
      {/* =================================================================== */}
      {viewMode === 'visitas' && !activeVisit && (
        <div className="flex flex-col w-full gap-4 pt-1 select-none">
          {/* Fila Superior: Navegación + Título + Acciones ergonómicas */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-dashed border-ea-black/20">
            <div>
              <button
                type="button"
                id="btn-back-to-index-empty-visitas"
                onClick={() => setViewMode('index')}
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-ea-black text-ea-black hover:text-white border-2 border-ea-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-okcok text-xs uppercase tracking-wide cursor-pointer mb-2 min-h-[42px] rounded-[6px]"
              >
                <span className="text-sm leading-none transition-transform group-hover:-translate-x-0.5">&larr;</span>
                <span>VOLVER AL ÍNDICE GENERAL</span>
              </button>
              <h3 className="font-anton text-xl uppercase tracking-wide text-ea-black mt-0.5">
                VISITAS DE OBRA IN SITU
              </h3>
              <p className="font-creato text-[11px] text-ea-black/65">
                Registro técnico in situ • Expediente abierto a la comunidad arquitectónica
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                id="btn-switch-to-conversaciones-from-empty"
                onClick={() => {
                  setActiveStream('conversaciones');
                  setViewMode('conversaciones');
                }}
                className="group inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ea-black text-ea-black hover:text-white border-2 border-ea-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-okcok text-xs uppercase tracking-wide cursor-pointer min-h-[42px] rounded-[6px] shrink-0"
              >
                <span>VER CRÍTICAS ({criticalArguments.length})</span>
                <span className="text-sm leading-none transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </button>

              <button
                type="button"
                id="btn-add-visit-from-empty-header"
                onClick={() => {
                  setModalMode('visitas');
                  setFormError(null);
                  setFormSuccess(null);
                  setIsModalOpen(true);
                }}
                className="flex-1 sm:flex-initial bg-[#1D1D1B] hover:bg-black text-white border-2 border-ea-black py-2 px-3.5 text-center font-okcok text-xs sm:text-[13px] tracking-wider uppercase shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 shrink-0"
              >
                <Camera className="w-4 h-4" />
                <span>+ APORTAR VISITA DE OBRA</span>
              </button>
            </div>
          </div>

          {/* Tarjeta de Estado Vacío Neobrutalista */}
          <div className="relative w-full bg-[#FAF9F5] border-2 border-ea-black p-6 sm:p-10 shadow-[6px_6px_0px_#1D1D1B] flex flex-col items-center justify-center text-center my-2 sm:my-4">
            <TapeStrip className="-top-3.5 left-1/2 -translate-x-1/2" rotate="-0.8deg" />

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ea-black text-white font-mono text-[10.5px] uppercase tracking-widest mb-4">
              <span>EXPEDIENTE TÉCNICO IN SITU</span>
              <span>•</span>
              <span>0 REGISTROS</span>
            </div>

            <h4 className="font-anton text-2xl sm:text-3xl uppercase tracking-wide text-ea-black max-w-xl leading-tight">
              AÚN NO SE REGISTRAN VISITAS DE OBRA EN ESTE PROYECTO
            </h4>

            <p className="font-creato text-xs sm:text-sm text-ea-black/75 max-w-lg mt-3 leading-relaxed">
              Las visitas de obra capturan el estado real del proyecto en el tiempo: patologías, comportamiento bioclimático, evolución material y apropiación comunitaria con fotografías in situ.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <button
                type="button"
                id="btn-add-first-visit-cta"
                onClick={() => {
                  setModalMode('visitas');
                  setFormError(null);
                  setFormSuccess(null);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-3 min-h-[48px] bg-[#1D1D1B] hover:bg-black text-white font-okcok text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_#000] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>+ REGISTRAR LA PRIMERA VISITA</span>
              </button>

              <button
                type="button"
                id="btn-back-to-index-empty-card"
                onClick={() => setViewMode('index')}
                className="w-full sm:w-auto px-4 py-3 min-h-[48px] bg-white hover:bg-ea-black text-ea-black hover:text-white border-2 border-ea-black font-okcok text-xs sm:text-sm uppercase tracking-wide shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                &larr; VOLVER AL ÍNDICE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL PORTAL: LIGHTBOX / POPUP DE FOTOGRAFÍAS DE OBRA              */}
      {/* Con navegación por flechas derecha/izquierda, teclado y miniaturas */}
      {/* =================================================================== */}
      {lightboxOpen &&
        lightboxPhotos.length > 0 &&
        createPortal(
          <div
            id="photo-lightbox-modal"
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-between p-3 sm:p-6 select-none"
            style={{
              backgroundColor: 'rgba(12, 12, 12, 0.96)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            onClick={() => setLightboxOpen(false)}
          >
            {/* Barra Superior: Título, autor, contador de fotos y botón de cierre */}
            <div
              className="w-full max-w-5xl flex items-center justify-between pb-3 z-10"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.25)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span
                  style={{
                    fontFamily: "'Anton', Impact, sans-serif",
                    fontSize: '20px',
                    color: '#FFFFFF',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  REGISTRO DE OBRA // {activeVisit?.authorName?.toUpperCase()}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }} className="hidden sm:inline">
                  •
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13.5px',
                    color: '#EFECE1',
                    background: 'rgba(255,255,255,0.12)',
                    padding: '3px 9px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    letterSpacing: '0.5px',
                  }}
                >
                  FOTOGRAFÍA {lightboxIndex + 1} DE {lightboxPhotos.length}
                </span>
              </div>

              <button
                type="button"
                id="btn-lightbox-close"
                onClick={() => setLightboxOpen(false)}
                style={{
                  backgroundColor: '#1D1D1B',
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)',
                  padding: '7px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="hover:bg-white hover:text-black transition-colors rounded-xs"
                aria-label="Cerrar visor"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Contenedor Central: Botón Flecha Izquierda + Fotografía + Botón Flecha Derecha */}
            <div
              className="relative w-full max-w-5xl flex-1 flex items-center justify-between gap-3 sm:gap-8 my-auto py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxPhotos.length > 1 ? (
                <button
                  type="button"
                  id="btn-lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev - 1 + lightboxPhotos.length) % lightboxPhotos.length);
                  }}
                  style={{
                    backgroundColor: '#1D1D1B',
                    color: '#FFFFFF',
                    border: '2px solid rgba(255, 255, 255, 0.7)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="hover:scale-105 hover:border-white transition-all rounded-xs shrink-0 group"
                  aria-label="Fotografía anterior"
                >
                  <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <div className="w-12 sm:w-16" />
              )}

              {/* Imagen a pantalla completa con caption monográfico */}
              <div className="relative flex-1 flex flex-col items-center justify-center max-h-[75vh] overflow-hidden">
                <img
                  id="lightbox-current-image"
                  src={lightboxPhotos[lightboxIndex]}
                  alt={`Fotografía ${lightboxIndex + 1}`}
                  className="max-h-[66vh] sm:max-h-[72vh] max-w-full object-contain border-2 border-white/40 shadow-[0_12px_40px_rgb(0,0,0,0.9)]"
                />
                <div
                  style={{
                    marginTop: '10px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: '12.5px',
                    color: 'rgba(255, 255, 255, 0.75)',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                  }}
                >
                  FIG. 1.0{selectedVisitIndex + 1}.{lightboxIndex + 1} — ARCHIVO DOCUMENTAL EA // {project.title.toUpperCase()}
                </div>
              </div>

              {/* Botón Flecha Derecha */}
              {lightboxPhotos.length > 1 ? (
                <button
                  type="button"
                  id="btn-lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev + 1) % lightboxPhotos.length);
                  }}
                  style={{
                    backgroundColor: '#1D1D1B',
                    color: '#FFFFFF',
                    border: '2px solid rgba(255, 255, 255, 0.7)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="hover:scale-105 hover:border-white transition-all rounded-xs shrink-0 group"
                  aria-label="Siguiente fotografía"
                >
                  <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <div className="w-12 sm:w-16" />
              )}
            </div>

            {/* Barra Inferior: Guía de teclado y miniaturas interactivas */}
            <div
              className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 z-10"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.65)',
                }}
              >
                Usa las flechas &larr; &rarr; del teclado o los botones para navegar • ESC para cerrar
              </div>

              {/* Miniaturas de todas las fotos de la visita */}
              {lightboxPhotos.length > 1 && (
                <div className="flex items-center gap-2.5">
                  {lightboxPhotos.map((url, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      id={`btn-lightbox-thumb-${tIdx}`}
                      onClick={() => setLightboxIndex(tIdx)}
                      style={{
                        width: '48px',
                        height: '48px',
                        border: lightboxIndex === tIdx ? '2.5px solid #FFFFFF' : '1.5px solid rgba(255,255,255,0.3)',
                        opacity: lightboxIndex === tIdx ? 1 : 0.6,
                        transform: lightboxIndex === tIdx ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: lightboxIndex === tIdx ? '0 0 10px rgba(255,255,255,0.7)' : 'none',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                        padding: 0,
                        overflow: 'hidden',
                      }}
                      aria-label={`Ver foto ${tIdx + 1}`}
                    >
                      <img src={url} alt={`Miniatura ${tIdx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* =================================================================== */}
      {/* MODAL PORTAL DE CONTRIBUCIÓN (Visitas de obra & Crítica)             */}
      {/* =================================================================== */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ea-black/75 backdrop-blur-xs select-none">
            <div
              className="relative w-full max-w-lg bg-white border-2 border-ea-black p-5 sm:p-7 shadow-[6px_6px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <TapeStrip className="-top-5 left-1/2 -translate-x-1/2" rotate="-1deg" />

              {/* Botón Cerrar */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 border border-ea-black hover:bg-ea-black hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Cabecera del Modal */}
              <div className="mb-5 space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-ea-black/50 block">
                  NOTAS DE LA COMUNIDAD // {project.title}
                </span>
                <h3 className="font-anton text-2xl uppercase tracking-wide text-ea-black">
                  {!isVisitasEnabled
                    ? (project.type === 'academia' || project.category === 'INVESTIGACIÓN ACADÉMICA'
                        ? 'APORTAR DEBATE / REFLEXIÓN ACADÉMICA'
                        : 'APORTAR DEBATE / OBSERVACIÓN TERRITORIAL')
                    : (modalMode === 'visitas' ? 'REGISTRAR VISITA DE OBRA' : 'APORTAR ARGUMENTO CRÍTICO')}
                </h3>
                <p className="font-creato text-xs text-ea-black/70">
                  {!isVisitasEnabled
                    ? (project.type === 'academia' || project.category === 'INVESTIGACIÓN ACADÉMICA'
                        ? 'Aporta una reflexión, marco teórico o discusión crítica sobre esta investigación.'
                        : 'Aporta análisis territorial, datos de campo o discusión sobre este expediente.')
                    : (modalMode === 'visitas'
                        ? 'Comparte tu experiencia en primera persona tras visitar la obra construida.'
                        : 'Aporta una reflexión fundamentada sobre las decisiones y el impacto del proyecto.')}
                </p>
              </div>

              {/* Selector de modo dentro del modal (Omitido en Territorios y Academia) */}
              {isVisitasEnabled && (
                <div className="flex border-2 border-ea-black mb-4 font-okcok text-xs uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setModalMode('visitas')}
                    className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                      modalMode === 'visitas'
                        ? 'bg-ea-black text-white'
                        : 'bg-[#FAF9F5] text-ea-black hover:bg-white'
                    }`}
                  >
                    Visita de obra
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode('conversaciones')}
                    className={`flex-1 py-2 text-center transition-colors border-l-2 border-ea-black cursor-pointer ${
                      modalMode === 'conversaciones'
                        ? 'bg-ea-black text-white'
                        : 'bg-[#FAF9F5] text-ea-black hover:bg-white'
                    }`}
                  >
                    Conversación crítica
                  </button>
                </div>
              )}

              {/* Mensajes de error y éxito */}
              {formError && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-500 text-red-700 text-xs font-mono">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mb-4 p-2.5 bg-green-50 border border-green-600 text-green-800 text-xs font-mono font-bold">
                  {formSuccess}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmitContribution} className="space-y-4">
                {/* Campos de Identidad: Nombre y Correo Electrónico */}
                <div className="p-3 bg-[#FAF9F5] border-2 border-ea-black shadow-[2px_2px_0px_#000] space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-ea-black/15 font-mono text-[9.5px] uppercase tracking-wider text-ea-black/65">
                    <span className="flex items-center gap-1.5 font-bold text-ea-black">
                      <User className="w-3.5 h-3.5 text-ea-black" />
                      DATOS DEL AUTOR DE LA NOTA
                    </span>
                    <span className="text-[9px] text-ea-black/50">
                      ID: {project.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-anton text-[11px] uppercase tracking-wider mb-1 text-ea-black">
                        Tu Nombre / Firma *
                      </label>
                      <input
                        type="text"
                        required
                        id="input-author-name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ej. Arq. Daniel Moreno"
                        className="w-full p-2 bg-white border border-ea-black font-creato text-xs text-ea-black placeholder:text-ea-black/35 focus:outline-none focus:ring-1 focus:ring-ea-black"
                      />
                    </div>

                    <div>
                      <label className="block font-anton text-[11px] uppercase tracking-wider mb-1 text-ea-black">
                        Tu Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        id="input-author-email"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="ejemplo@estudio.ec"
                        className="w-full p-2 bg-white border border-ea-black font-creato text-xs text-ea-black placeholder:text-ea-black/35 focus:outline-none focus:ring-1 focus:ring-ea-black"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-ea-black/60 pt-0.5">
                    <Mail className="w-3 h-3 text-ea-black/50 shrink-0" />
                    <span>Tu correo no se publicará; se utiliza para verificación y réplicas editoriales.</span>
                  </div>
                </div>

                {modalMode === 'visitas' ? (
                  <>
                    <div>
                      <label className="block font-anton text-[11px] uppercase tracking-wider mb-1 text-ea-black">
                        Experiencia de visita *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={visitExperience}
                        onChange={(e) => setVisitExperience(e.target.value)}
                        placeholder="Describe cómo se siente el espacio, la calidad de los detalles, la luz natural, la acústica..."
                        className="w-full p-2.5 bg-[#FAF9F5] border border-ea-black font-creato text-xs text-ea-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-ea-black"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-anton text-[11px] uppercase tracking-wider mb-1 text-ea-black">
                          Fecha de visita (opcional)
                        </label>
                        <input
                          type="date"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full p-2 bg-[#FAF9F5] border border-ea-black font-mono text-xs text-ea-black focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-anton text-[11px] uppercase tracking-wider mb-1 text-ea-black">
                          Fotos in situ (máx. 3)
                        </label>
                        <label className="flex items-center justify-center gap-2 p-2 bg-[#FAF9F5] border border-ea-black hover:bg-white cursor-pointer font-okcok text-xs uppercase tracking-wide">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Adjuntar fotos</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            disabled={isUploadingPhoto || visitPhotos.length >= 3}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {visitPhotos.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {visitPhotos.map((photo, i) => (
                          <div key={i} className="relative w-16 h-16 border border-ea-black group">
                            <img src={photo} alt="Previa" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(i)}
                              className="absolute -top-1.5 -right-1.5 bg-ea-black text-white p-0.5 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block font-anton text-[11px] uppercase tracking-wider mb-1 text-ea-black">
                        Título del argumento (opcional)
                      </label>
                      <input
                        type="text"
                        value={argTitle}
                        onChange={(e) => setArgTitle(e.target.value)}
                        placeholder="Ej. Tectónica y materialidad en el contexto andino"
                        className="w-full p-2.5 bg-[#FAF9F5] border border-ea-black font-creato text-xs text-ea-black focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-anton text-[11px] uppercase tracking-wider mb-1 text-ea-black">
                        Argumento crítico *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={argContent}
                        onChange={(e) => setArgContent(e.target.value)}
                        placeholder="Expón tu análisis crítico sobre el proyecto, sus decisiones programáticas, constructivas o urbanas..."
                        className="w-full p-2.5 bg-[#FAF9F5] border border-ea-black font-creato text-xs text-ea-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-ea-black"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-ea-black/50">
                    * Modera automáticamente según las normas EA
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-ea-black text-white hover:bg-black font-okcok text-xs uppercase tracking-wider py-2.5 px-6 border border-ea-black transition-colors disabled:opacity-50 cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,0.2)]"
                  >
                    {isSubmitting ? 'PUBLICANDO...' : 'PUBLICAR EN LA COMUNIDAD'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
