import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Instagram,
  Mail,
  MapPin,
  Calendar,
  Building,
  Users,
  LogOut,
  UploadCloud,
  CheckCircle2,
  Clock,
  Eye,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { studioAuthService, StudioProfile, StudioSubmission } from '../../services/studioAuthService';

export interface StudioProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProjects?: any[];
  onSelectProject?: (projectId: string) => void;
  onNavigateSubmit?: () => void;
}

export const StudioProfileModal: React.FC<StudioProfileModalProps> = ({
  isOpen,
  onClose,
  allProjects = [],
  onSelectProject,
  onNavigateSubmit,
}) => {
  const [studio, setStudio] = useState<StudioProfile | null>(() => studioAuthService.getStudio());
  const [activeTab, setActiveTab] = useState<'enviados' | 'publicados'>('enviados');
  const [submissions, setSubmissions] = useState<StudioSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  useEffect(() => {
    const unsub = studioAuthService.subscribe((s) => setStudio(s));
    return unsub;
  }, []);

  const fetchMySubmissions = async () => {
    setIsLoadingSubmissions(true);
    const res = await studioAuthService.getMySubmissions();
    if (res.success && res.submissions) {
      setSubmissions(res.submissions);
    }
    setIsLoadingSubmissions(false);
  };

  useEffect(() => {
    if (isOpen) {
      setStudio(studioAuthService.getStudio());
      fetchMySubmissions();
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !studio) return null;

  // Filter published projects from main catalog matching studio name
  const normalizedStudio = (studio.studioName || '').toUpperCase();
  const publishedProjects = allProjects.filter((p) => {
    const pStudio = (p.studio || p.institution || p.author || '').toUpperCase();
    return (
      pStudio.includes(normalizedStudio) ||
      (normalizedStudio && normalizedStudio.includes(pStudio))
    );
  });

  const handleLogout = () => {
    studioAuthService.logout();
    onClose();
  };

  const handleNewSubmit = () => {
    onClose();
    if (onNavigateSubmit) {
      onNavigateSubmit();
    } else {
      window.location.href = '/sube-tu-trabajo';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-profile-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] bg-white border-2 border-ea-black rounded-[28px] sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden text-ea-black select-none"
      >
        {/* ================= HEADER DEL MODAL ================= */}
        <header className="sticky top-0 z-30 bg-white border-b-2 border-ea-black px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-anton text-xs sm:text-sm uppercase tracking-wider text-ea-black">
              PERFIL OFICIAL DE ESTUDIO // ECUADORIAN ARCHITECTURE
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar perfil"
            className="w-8 h-8 rounded-full border border-ea-black/30 hover:border-ea-black hover:bg-ea-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* ================= CONTENIDO CON SCROLL ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* BANNER & INFO DEL ESTUDIO */}
          <div className="border border-ea-black rounded-[28px] p-6 sm:p-8 bg-[#FAFAFA] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Avatar + Datos principales */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-ea-black bg-[#E8E8E8] overflow-hidden shrink-0 flex items-center justify-center">
                  {studio.studioAvatarUrl ? (
                    <img
                      src={studio.studioAvatarUrl}
                      alt={studio.studioName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-neutral-400" />
                  )}
                </div>

                <div>
                  <h1
                    id="studio-profile-title"
                    className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal leading-none"
                  >
                    {studio.studioName || 'Estudio de Arquitectura'}
                  </h1>
                  <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
                    {studio.studioPrincipals || 'Titulares del estudio'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-neutral-500 mt-2">
                    {studio.studioLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        {studio.studioLocation}
                      </span>
                    )}
                    {studio.foundationYear && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        Fundado en {studio.foundationYear}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      Cuenta Verificada
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción rápida */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleNewSubmit}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white font-okcok text-xs uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" /> + SUBIR TRABAJO
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-neutral-600 hover:text-red-600 hover:border-red-300 font-mono text-[11px] rounded-full transition-colors cursor-pointer"
                  title="Cerrar sesión en este dispositivo"
                >
                  <LogOut className="w-3 h-3" /> Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* ================= TABS: TRABAJOS ENVIADOS VS PUBLICADOS ================= */}
          <div className="flex items-center gap-2 border-b border-ea-black/15 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('enviados')}
              className={`px-4 py-2 font-okcok text-sm sm:text-base uppercase tracking-normal rounded-full transition-all cursor-pointer ${
                activeTab === 'enviados'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-transparent text-neutral-500 hover:text-black'
              }`}
            >
              TRABAJOS ENVIADOS ({submissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('publicados')}
              className={`px-4 py-2 font-okcok text-sm sm:text-base uppercase tracking-normal rounded-full transition-all cursor-pointer ${
                activeTab === 'publicados'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-transparent text-neutral-500 hover:text-black'
              }`}
            >
              PUBLICADOS EN CATÁLOGO ({publishedProjects.length})
            </button>

            <button
              type="button"
              onClick={fetchMySubmissions}
              disabled={isLoadingSubmissions}
              className="ml-auto p-2 text-neutral-400 hover:text-black transition-colors"
              title="Actualizar estatus"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* ================= CONTENIDO PESTAÑA: TRABAJOS ENVIADOS (ESTATUS EN VIVO) ================= */}
          {activeTab === 'enviados' && (
            <div className="space-y-4">
              {isLoadingSubmissions ? (
                <div className="py-16 text-center text-xs font-mono text-neutral-400">
                  Cargando estatus de tus proyectos...
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-300 rounded-[28px] bg-[#FAFAFA] space-y-4">
                  <UploadCloud className="w-10 h-10 text-neutral-400 mx-auto" />
                  <div>
                    <h3 className="font-okcok text-xl uppercase">Aún no has enviado trabajos</h3>
                    <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                      Postula tu primera obra construida, territorio o investigación académica para el proceso curatorial de Ecuadorian Architecture.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNewSubmit}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white font-okcok text-xs uppercase rounded-full hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer"
                  >
                    SUBIR MI PRIMER TRABAJO →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {submissions.map((sub) => {
                    const isApproved = sub.status === 'aprobado';
                    const isReviewed = sub.status === 'revisado';
                    const isPending = sub.status === 'pendiente_curaduria' || !sub.status;

                    return (
                      <div
                        key={sub.id}
                        className="border border-ea-black rounded-[24px] p-5 sm:p-6 bg-white hover:shadow-xs transition-shadow space-y-4"
                      >
                        {/* Cabecera de la propuesta */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-150 pb-3">
                          <div>
                            <span className="font-mono text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                              CATEGORÍA {sub.category ? sub.category.toUpperCase() : 'PROYECTO'} · ENVIADO EL{' '}
                              {sub.receivedAt ? new Date(sub.receivedAt).toLocaleDateString() : 'RECIENTE'}
                            </span>
                            <h3 className="font-okcok text-xl sm:text-2xl uppercase tracking-normal text-ea-black mt-0.5">
                              {sub.projectTitle || 'Sin título'}
                            </h3>
                          </div>

                          {/* Badge de Estatus */}
                          <div>
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-xs font-bold rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                APROBADO PARA PUBLICACIÓN
                              </span>
                            ) : isReviewed ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 font-mono text-xs font-bold rounded-full">
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                EN REVISIÓN EDITORIAL
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-bold rounded-full">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                PENDIENTE DE CURADURÍA
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ficha técnica compacta */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-neutral-600">
                          <div>
                            <span className="text-[10px] text-neutral-400 block uppercase">Ubicación</span>
                            <span className="text-ea-black font-medium">{sub.projectLocation || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block uppercase">Año Obra</span>
                            <span className="text-ea-black font-medium">{sub.projectYear || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block uppercase">Área Construida</span>
                            <span className="text-ea-black font-medium">{sub.builtArea || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block uppercase">Maestro Mayor</span>
                            <span className="text-ea-black font-medium">{sub.maestroMayorName || 'No indicado'}</span>
                          </div>
                        </div>

                        {/* Resumen & Carpeta Cloud */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs">
                          <p className="font-sans text-neutral-600 line-clamp-2 max-w-xl">
                            {sub.shortSummary || sub.fullDescription || 'Propuesta en proceso de evaluación curatorial.'}
                          </p>

                          {sub.cloudStorageUrl && (
                            <a
                              href={sub.cloudStorageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 hover:border-black font-okcok text-xs uppercase rounded-full shrink-0 transition-colors"
                            >
                              <FolderOpen className="w-3.5 h-3.5" /> VER CARPETA EN NUBE ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= CONTENIDO PESTAÑA: TRABAJOS PUBLICADOS ================= */}
          {activeTab === 'publicados' && (
            <div className="space-y-4">
              {publishedProjects.length === 0 ? (
                <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-300 rounded-[28px] bg-[#FAFAFA] space-y-3">
                  <Building className="w-10 h-10 text-neutral-400 mx-auto" />
                  <h3 className="font-okcok text-xl uppercase">Aún no hay obras publicadas en el catálogo</h3>
                  <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto">
                    Cuando tu propuesta sea aprobada por el comité curatorial de Ecuadorian Architecture, aparecerá aquí vinculada a tu perfil de estudio oficial.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {publishedProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onClose();
                        if (onSelectProject) onSelectProject(p.id);
                        else window.location.href = `/proyectos/${p.slug || p.id}`;
                      }}
                      className="border border-ea-black rounded-[20px] p-4 bg-white hover:bg-neutral-50 cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="aspect-video w-full rounded-[14px] overflow-hidden bg-neutral-100 mb-3 border border-neutral-200">
                          {p.coverImage || p.images?.[0] ? (
                            <img
                              src={p.coverImage || p.images?.[0]}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : null}
                        </div>
                        <h4 className="font-okcok text-lg uppercase text-ea-black group-hover:underline">
                          {p.title}
                        </h4>
                        <p className="font-mono text-xs text-neutral-500 mt-0.5">
                          {p.location || 'Ecuador'} · {p.year || '2026'}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-150 flex items-center justify-between text-xs font-okcok uppercase text-neutral-700">
                        <span>VER EN CATÁLOGO</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
