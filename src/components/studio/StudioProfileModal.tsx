import React, { useState, useEffect, useRef } from 'react';
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
  Edit3,
  Camera,
  Image as ImageIcon,
  Save,
  Phone,
  Globe,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<'enviados' | 'publicados' | 'editar'>('enviados');
  const [submissions, setSubmissions] = useState<StudioSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [catalogProjects, setCatalogProjects] = useState<any[]>(allProjects);

  // Form states for editing profile
  const [editStudioName, setEditStudioName] = useState('');
  const [editStudioPrincipals, setEditStudioPrincipals] = useState('');
  const [editStudioLocation, setEditStudioLocation] = useState('');
  const [editFoundationYear, setEditFoundationYear] = useState('');
  const [editStudioWebsite, setEditStudioWebsite] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhilosophy, setEditPhilosophy] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTypologies, setEditTypologies] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = studioAuthService.subscribe((s) => setStudio(s));
    return unsub;
  }, []);

  // Initialize form fields whenever studio data changes
  useEffect(() => {
    if (studio) {
      setEditStudioName(studio.studioName || '');
      setEditStudioPrincipals(studio.studioPrincipals || '');
      setEditStudioLocation(studio.studioLocation || '');
      setEditFoundationYear(studio.foundationYear || '');
      setEditStudioWebsite(studio.studioWebsite || '');
      setEditInstagram(studio.instagram || '');
      setEditPhone(studio.phone || '');
      setEditEmail(studio.email || '');
      setEditPhilosophy(studio.philosophy || '');
      setEditHeadline(studio.headline || '');
      setEditDescription(studio.description || '');
      setEditTypologies(
        Array.isArray(studio.typologies)
          ? studio.typologies.join(', ')
          : studio.typologies || 'Arquitectura Residencial, Paisaje, Colectivo'
      );
      setEditAvatarUrl(studio.studioAvatarUrl || '');
      setEditCoverUrl(studio.studioCoverUrl || '');
    }
  }, [studio]);

  useEffect(() => {
    if (allProjects && allProjects.length > 0) {
      setCatalogProjects(allProjects);
    } else {
      fetch('/api/projects')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setCatalogProjects(data);
        })
        .catch(() => {});
    }
  }, [allProjects]);

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
      setSaveSuccessMessage(null);
      setSaveErrorMessage(null);
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
  const publishedProjects = catalogProjects.filter((p) => {
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

  // Upload handler for Avatar
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setSaveErrorMessage(null);
    const res = await studioAuthService.uploadImage(file);
    setIsUploadingAvatar(false);

    if (res.success && res.url) {
      setEditAvatarUrl(res.url);
      setSaveSuccessMessage('Foto de perfil subida. Haz clic en "Guardar Cambios" para confirmar.');
    } else {
      setSaveErrorMessage(res.error || 'No se pudo subir la imagen.');
    }
  };

  // Upload handler for Cover
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setSaveErrorMessage(null);
    const res = await studioAuthService.uploadImage(file);
    setIsUploadingCover(false);

    if (res.success && res.url) {
      setEditCoverUrl(res.url);
      setSaveSuccessMessage('Portada subida. Haz clic en "Guardar Cambios" para confirmar.');
    } else {
      setSaveErrorMessage(res.error || 'No se pudo subir la portada.');
    }
  };

  // Save full profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    const typologiesArray = editTypologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updates: Partial<StudioProfile> = {
      studioName: editStudioName,
      studioPrincipals: editStudioPrincipals,
      studioLocation: editStudioLocation,
      foundationYear: editFoundationYear,
      studioWebsite: editStudioWebsite,
      instagram: editInstagram,
      phone: editPhone,
      philosophy: editPhilosophy,
      headline: editHeadline,
      description: editDescription,
      studioAvatarUrl: editAvatarUrl,
      studioCoverUrl: editCoverUrl,
      typologies: typologiesArray,
    };

    const res = await studioAuthService.updateProfile(updates);
    setIsSavingProfile(false);

    if (res.success && res.studio) {
      setStudio(res.studio);
      setSaveSuccessMessage('✓ Perfil y Ficha de Proyectos actualizados exitosamente.');
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    } else {
      setSaveErrorMessage(res.error || 'Ocurrió un error al guardar los cambios.');
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
        <header className="sticky top-0 z-30 bg-white border-b-2 border-ea-black px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-anton text-xs sm:text-sm uppercase tracking-wider text-ea-black">
              PORTAL OFICIAL DE ESTUDIO // ECUADORIAN ARCHITECTURE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'editar' ? 'enviados' : 'editar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-okcok uppercase rounded-full border transition-all cursor-pointer ${
                activeTab === 'editar'
                  ? 'bg-ea-black text-white border-ea-black shadow-xs'
                  : 'bg-white text-ea-black border-ea-black hover:bg-neutral-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{activeTab === 'editar' ? 'VER PROPUESTAS' : 'EDITAR PERFIL'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar perfil"
              className="w-8 h-8 rounded-full border border-ea-black/30 hover:border-ea-black hover:bg-ea-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ================= CONTENIDO CON SCROLL ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* BANNER & INFO DEL ESTUDIO */}
          <div className="border-2 border-ea-black rounded-[28px] bg-[#FAFAFA] relative overflow-hidden shadow-xs">
            {/* Cover image banner background if available */}
            {studio.studioCoverUrl && (
              <div className="h-28 sm:h-36 w-full relative overflow-hidden bg-neutral-200 border-b border-ea-black/20">
                <img
                  src={studio.studioCoverUrl}
                  alt={studio.studioName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}

            <div className="p-6 sm:p-8 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                {/* Avatar + Datos principales */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-ea-black bg-[#E8E8E8] overflow-hidden shrink-0 flex items-center justify-center shadow-xs ${studio.studioCoverUrl ? '-mt-12 sm:-mt-16 bg-white' : ''}`}>
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
                    onClick={() => setActiveTab('editar')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-ea-black text-ea-black hover:bg-black hover:text-white font-okcok text-xs uppercase rounded-full transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> EDITAR PERFIL
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-neutral-500 hover:text-red-600 font-mono text-[10px] rounded-full transition-colors cursor-pointer"
                    title="Cerrar sesión en este dispositivo"
                  >
                    <LogOut className="w-3 h-3" /> Cerrar sesión
                  </button>
                </div>
              </div>

              {/* Vista previa de filosofía si existe */}
              {studio.philosophy && (
                <div className="mt-5 pt-4 border-t border-ea-black/10">
                  <span className="block font-anton text-[10px] tracking-widest uppercase text-neutral-500 mb-1">
                    FILOSOFÍA PROYECTUAL // VISTA EN POP-UP DE PROYECTOS
                  </span>
                  <p className="font-creato text-xs sm:text-sm italic text-ea-black/90 line-clamp-2">
                    "{studio.philosophy}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ================= TABS PRINCIPALES ================= */}
          <div className="flex items-center gap-2 border-b border-ea-black/15 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('enviados')}
              className={`px-4 py-2 font-okcok text-sm sm:text-base uppercase tracking-normal rounded-full transition-all shrink-0 cursor-pointer ${
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
              className={`px-4 py-2 font-okcok text-sm sm:text-base uppercase tracking-normal rounded-full transition-all shrink-0 cursor-pointer ${
                activeTab === 'publicados'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-transparent text-neutral-500 hover:text-black'
              }`}
            >
              PUBLICADOS EN CATÁLOGO ({publishedProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('editar')}
              className={`px-4 py-2 font-okcok text-sm sm:text-base uppercase tracking-normal rounded-full transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'editar'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Edit3 className="w-4 h-4" /> EDITAR FICHA EDITORIAL
            </button>

            {activeTab !== 'editar' && (
              <button
                type="button"
                onClick={fetchMySubmissions}
                disabled={isLoadingSubmissions}
                className="ml-auto p-2 text-neutral-400 hover:text-black transition-colors"
                title="Actualizar estatus"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* ================= PESTAÑA: EDITAR PERFIL & POP-UP ================= */}
          {activeTab === 'editar' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Feedback messages */}
              {saveSuccessMessage && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}
              {saveErrorMessage && (
                <div className="p-4 bg-red-50 border-2 border-red-500 rounded-2xl text-red-900 text-xs sm:text-sm font-medium">
                  {saveErrorMessage}
                </div>
              )}

              {/* 1. IMÁGENES: PORTADA Y AVATAR */}
              <div className="border-2 border-ea-black rounded-[24px] p-5 sm:p-6 bg-white space-y-5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-ea-black" />
                  <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-ea-black">
                    1. PORTADA Y FOTO DEL ESTUDIO // POP-UP Y CABECERA
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Portada */}
                  <div className="space-y-2">
                    <label className="block font-okcok text-xs uppercase text-neutral-700">
                      IMAGEN DE PORTADA / BANNER
                    </label>
                    <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-ea-black/30 overflow-hidden bg-neutral-100 relative group flex items-center justify-center">
                      {editCoverUrl ? (
                        <img
                          src={editCoverUrl}
                          alt="Portada"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                          <span className="font-mono text-[11px] text-neutral-500">Sin portada cargada</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={isUploadingCover}
                          className="px-4 py-2 bg-white text-black font-okcok text-xs uppercase rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {isUploadingCover ? 'Subiendo...' : 'Cambiar Portada'}
                        </button>
                      </div>
                    </div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverFileChange}
                    />
                    <p className="font-mono text-[10px] text-neutral-500">
                      Recomendado: 1600x900 px (JPG o WebP). Aparece en la cabecera de tu modal de estudio.
                    </p>
                  </div>

                  {/* Avatar / Foto de Equipo */}
                  <div className="space-y-2">
                    <label className="block font-okcok text-xs uppercase text-neutral-700">
                      FOTO DE PERFIL / LOGO / EQUIPO
                    </label>
                    <div className="h-40 w-full rounded-2xl border-2 border-dashed border-ea-black/30 bg-neutral-100 flex items-center justify-center relative group">
                      <div className="w-24 h-24 rounded-full border-2 border-ea-black overflow-hidden bg-white shadow-xs flex items-center justify-center">
                        {editAvatarUrl ? (
                          <img
                            src={editAvatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-10 h-10 text-neutral-400" />
                        )}
                      </div>

                      <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="px-4 py-2 bg-white text-black font-okcok text-xs uppercase rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {isUploadingAvatar ? 'Subiendo...' : 'Cambiar Foto'}
                        </button>
                      </div>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                    <p className="font-mono text-[10px] text-neutral-500">
                      Recomendado: 400x400 px cuadrado. Aparece en el Navbar y en el pop-up de tus proyectos.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. DATOS GENERALES DEL ESTUDIO */}
              <div className="border-2 border-ea-black rounded-[24px] p-5 sm:p-6 bg-white space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-ea-black" />
                  <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-ea-black">
                    2. IDENTIDAD Y CRÉDITOS OFICIALES
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                      Nombre Oficial del Estudio / Arquitecto *
                    </label>
                    <input
                      type="text"
                      value={editStudioName}
                      onChange={(e) => setEditStudioName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                      Titulares / Socios Principales *
                    </label>
                    <input
                      type="text"
                      value={editStudioPrincipals}
                      onChange={(e) => setEditStudioPrincipals(e.target.value)}
                      placeholder="Ej: Alejandro Andrade, María Gómez"
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                      Ubicación / Ciudad y País *
                    </label>
                    <input
                      type="text"
                      value={editStudioLocation}
                      onChange={(e) => setEditStudioLocation(e.target.value)}
                      placeholder="Ej: Quito, Ecuador"
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                      Año de Fundación
                    </label>
                    <input
                      type="text"
                      value={editFoundationYear}
                      onChange={(e) => setEditFoundationYear(e.target.value)}
                      placeholder="Ej: 2024"
                      className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* 3. FILOSOFÍA PROYECTUAL & MEMORIA */}
              <div className="border-2 border-ea-black rounded-[24px] p-5 sm:p-6 bg-white space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ea-black" />
                  <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-ea-black">
                    3. FILOSOFÍA PROYECTUAL &amp; MEMORIA CRÍTICA
                  </h3>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-okcok text-xs uppercase text-neutral-700">
                      Filosofía / Manifiesto Arquitectónico (Destacado en Pop-up de Obras)
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">Aparece entre comillas en tu pop-up</span>
                  </div>
                  <textarea
                    rows={3}
                    value={editPhilosophy}
                    onChange={(e) => setEditPhilosophy(e.target.value)}
                    placeholder="Ej: La arquitectura debe provocar asombro y responder con honestidad al territorio, la gravedad y la materia local..."
                    className="w-full p-4 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                    Titular Corto / Enfoque
                  </label>
                  <input
                    type="text"
                    value={editHeadline}
                    onChange={(e) => setEditHeadline(e.target.value)}
                    placeholder="Ej: Práctica de arquitectura contemporánea, investigación y producción espacial en el Ecuador."
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                    Trayectoria &amp; Semblanza del Estudio
                  </label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Describe los orígenes, campos de investigación, proyectos destacados y premios del estudio..."
                    className="w-full p-4 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                    Campos de Enfoque &amp; Tipologías (Separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={editTypologies}
                    onChange={(e) => setEditTypologies(e.target.value)}
                    placeholder="Arquitectura Residencial, Paisaje, Colectivo, Rehabilitación"
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* 4. ELEMENTOS DE CONTACTO & REDES */}
              <div className="border-2 border-ea-black rounded-[24px] p-5 sm:p-6 bg-white space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-ea-black" />
                  <h3 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-ea-black">
                    4. ELEMENTOS DE CONTACTO &amp; REDES OFICIALES
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                      Sitio Web Oficial o Portafolio
                    </label>
                    <div className="relative">
                      <ExternalLink className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={editStudioWebsite}
                        onChange={(e) => setEditStudioWebsite(e.target.value)}
                        placeholder="https://tu-estudio.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                      Instagram Oficial
                    </label>
                    <div className="relative">
                      <Instagram className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={editInstagram}
                        onChange={(e) => setEditInstagram(e.target.value)}
                        placeholder="@nomade.taller.ec"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                      Teléfono / WhatsApp de Contacto
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+593 99 999 9999"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-ea-black rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-okcok text-xs uppercase text-neutral-700 mb-1">
                      Correo Electrónico de Contacto
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={editEmail}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 border border-ea-black/30 rounded-xl text-sm font-sans text-neutral-500 cursor-not-allowed"
                        title="El correo de la cuenta está fijado por seguridad"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Guardar Cambios */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-2 border-t border-ea-black/10 flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-neutral-500">
                  Los cambios se sincronizan en vivo con el pop-up de tus proyectos.
                </span>

                <button
                  type="submit"
                  disabled={isSavingProfile || isUploadingAvatar || isUploadingCover}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-okcok text-sm uppercase tracking-wider rounded-full shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= CONTENIDO PESTAÑA: TRABAJOS ENVIADOS (ESTATUS EN VIVO) ================= */}
          {activeTab === 'enviados' && (
            <div className="space-y-4">
              {isLoadingSubmissions ? (
                <div className="py-16 text-center text-xs font-mono text-neutral-400">
                  Cargando estatus de tus proyectos...
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 sm:p-12 text-center border-2 border-dashed border-ea-black/30 rounded-[28px] bg-[#FAFAFA] space-y-4">
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
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white font-okcok text-xs uppercase rounded-full hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer shadow-xs"
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
                        className="border-2 border-ea-black rounded-[24px] p-5 sm:p-6 bg-white hover:shadow-xs transition-shadow space-y-4"
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
                <div className="p-8 sm:p-12 text-center border-2 border-dashed border-ea-black/30 rounded-[28px] bg-[#FAFAFA] space-y-3">
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
                      className="border-2 border-ea-black rounded-[20px] p-4 bg-white hover:bg-neutral-50 cursor-pointer transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
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
