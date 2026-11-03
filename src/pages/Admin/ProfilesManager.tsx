import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  Camera,
  Building2,
  MapPin,
  Calendar,
  Globe,
  Instagram,
  Mail,
  Award,
  Layers,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  HardHat,
  Hammer,
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { AuthorProfileData, normalizeStudioToSlug } from '../../data/authors';
import { PhotographerProfileData, normalizePhotographerToSlug } from '../../data/photographers';
import { MasterBuilderProfile, normalizeMasterBuilderToSlug } from '../../data/masterBuilders';
import { MediaLibraryModal } from './MediaLibraryModal';
import { uploadImageFile } from '../../utils/mediaUpload';
import { AuthorProfileModal } from '../../components/author/AuthorProfileModal';
import { PhotographerProfileModal } from '../../components/photographer/PhotographerProfileModal';

export const ProfilesManager: React.FC = () => {
  const {
    authors,
    photographers,
    masterBuilders,
    updateAuthorProfile,
    createAuthorProfile,
    deleteAuthorProfile,
    updatePhotographerProfile,
    createPhotographerProfile,
    deletePhotographerProfile,
    updateMasterBuilderProfile,
    createMasterBuilderProfile,
    deleteMasterBuilderProfile,
    saveToDisk,
    projects,
    academia,
    territorios,
  } = useContent();

  const [activeTab, setActiveTab] = useState<'all' | 'authors' | 'photographers' | 'masterBuilders'>('authors');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingAuthor, setEditingAuthor] = useState<AuthorProfileData | null>(null);
  const [editingPhotographer, setEditingPhotographer] = useState<PhotographerProfileData | null>(null);
  const [editingMasterBuilder, setEditingMasterBuilder] = useState<MasterBuilderProfile | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);

  // Preview modal state
  const [previewAuthorName, setPreviewAuthorName] = useState<string | null>(null);
  const [previewPhotographerName, setPreviewPhotographerName] = useState<string | null>(null);

  // Media Library state for image selection in editor
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<'avatar' | 'cover' | null>(null);

  // Image upload in-progress indicator
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetField, setUploadTargetField] = useState<'avatar' | 'cover' | null>(null);

  // All combined projects for dossier preview & stats
  const allProjects = useMemo(() => {
    return [
      ...projects,
      ...academia.map((a: any) => ({ ...a, type: 'academia' })),
      ...territorios.map((t: any) => ({ ...t, type: 'territorios' })),
    ];
  }, [projects, academia, territorios]);

  // Project count mapping per author/studio
  const projectCountByAuthor = useMemo(() => {
    const counts: Record<string, number> = {};
    allProjects.forEach((p) => {
      const studio = (p.studio || p.institution || p.author || '').toUpperCase();
      if (studio) {
        counts[studio] = (counts[studio] || 0) + 1;
      }
    });
    return counts;
  }, [allProjects]);

  // Project count mapping per photographer
  const projectCountByPhotographer = useMemo(() => {
    const counts: Record<string, number> = {};
    allProjects.forEach((p) => {
      const photo = (p.datos?.fotografia || p.photographer || '').toUpperCase();
      if (photo) {
        counts[photo] = (counts[photo] || 0) + 1;
      }
    });
    return counts;
  }, [allProjects]);

  // Filtered authors list
  const filteredAuthors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return authors;
    return authors.filter((a) => {
      return (
        a.name.toLowerCase().includes(q) ||
        (a.founder && a.founder.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.headline && a.headline.toLowerCase().includes(q)) ||
        (a.typologies && a.typologies.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [authors, searchQuery]);

  // Filtered photographers list
  const filteredPhotographers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return photographers;
    return photographers.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.lead && p.lead.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.headline && p.headline.toLowerCase().includes(q))
      );
    });
  }, [photographers, searchQuery]);

  // Project count mapping per master builder
  const projectCountByMaestro = useMemo(() => {
    const counts: Record<string, number> = {};
    allProjects.forEach((p) => {
      const maestro = (p.maestroMayor || p.datos?.maestroMayor || '').toUpperCase();
      if (maestro) {
        counts[maestro] = (counts[maestro] || 0) + 1;
      }
    });
    return counts;
  }, [allProjects]);

  // Filtered master builders list
  const filteredMasterBuilders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return masterBuilders;
    return masterBuilders.filter((m) => {
      return (
        m.name.toLowerCase().includes(q) ||
        (m.rol && m.rol.toLowerCase().includes(q)) ||
        (m.oficio && m.oficio.toLowerCase().includes(q)) ||
        (m.location && m.location.toLowerCase().includes(q)) ||
        (m.specialties && m.specialties.some((s) => s.toLowerCase().includes(q)))
      );
    });
  }, [masterBuilders, searchQuery]);

  // Start creating new master builder profile
  const handleNewMasterBuilder = () => {
    const newId = `maestro-${Date.now().toString(36)}`;
    const blankBuilder: MasterBuilderProfile = {
      id: newId,
      name: '',
      slug: newId,
      rol: 'Maestro Mayor de Obra General',
      oficio: 'Cantería andina, encofrados fenolíticos y replanteo de niveles',
      location: 'Quito, Ecuador',
      experienceYears: '25+ años',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
      trayectoria: 'Maestro constructor con amplia trayectoria liderando cuadrillas de obra y faenas tradicionales en el Ecuador.',
      reconocimiento: 'Lideró la coordinación de mano de obra y el replanteo estructural de la obra.',
      specialties: ['Dirección de obra', 'Estructuras sismorresistentes', 'Mampostería tradicional'],
      defaultMembers: [
        {
          nombre: 'Cuadrilla Local',
          rol: 'Maestros Albañiles & Fierreros',
          oficio: 'Mampostería y encofrados',
        },
      ],
    };
    setEditingMasterBuilder(blankBuilder);
    setIsNewProfile(true);
  };

  const handleSaveMasterBuilder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMasterBuilder || !editingMasterBuilder.name.trim()) return;

    const slug = normalizeMasterBuilderToSlug(editingMasterBuilder.name);
    const builderToSave: MasterBuilderProfile = {
      ...editingMasterBuilder,
      id: editingMasterBuilder.id || slug,
      slug,
      name: editingMasterBuilder.name.trim(),
    };

    if (isNewProfile) {
      createMasterBuilderProfile(builderToSave);
    } else {
      updateMasterBuilderProfile(builderToSave.id, builderToSave);
    }
    saveToDisk();
    setEditingMasterBuilder(null);
    setIsNewProfile(false);
  };

  const handleDeleteMasterBuilder = (id: string, name: string) => {
    if (window.confirm(`¿Confirmas eliminar el perfil de Maestro Mayor de "${name}"?`)) {
      deleteMasterBuilderProfile(id);
      saveToDisk();
    }
  };

  const handleDuplicateMasterBuilder = (builder: MasterBuilderProfile) => {
    const newId = `${builder.slug}-copia-${Date.now().toString(36).substring(2, 6)}`;
    const copy: MasterBuilderProfile = {
      ...builder,
      id: newId,
      name: `${builder.name} (COPIA)`,
      slug: newId,
    };
    createMasterBuilderProfile(copy);
    saveToDisk();
  };

  // Start creating new author profile
  const handleNewAuthor = () => {
    const newId = `estudio-${Date.now().toString(36)}`;
    const blankAuthor: AuthorProfileData = {
      id: newId,
      name: 'NUEVO ESTUDIO DE ARQUITECTURA',
      slug: newId,
      founder: 'Arquitecto Titular',
      location: 'Quito, Ecuador',
      country: 'Ecuador',
      foundedYear: new Date().getFullYear().toString(),
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      headline: 'Práctica arquitectónica contemporánea, investigación y producción espacial.',
      description: 'Estudio de arquitectura orientado a la experimentación proyectual y la investigación matérica en el Ecuador.',
      philosophy: 'Proyectar desde el lugar y con la materia local para responder con pertinencia tectónica a nuestro tiempo.',
      typologies: ['Arquitectura Residencial', 'Equipamiento Colectivo', 'Diseño Sustentable'],
      team: [{ name: 'Arquitecto Titular', role: 'Dirección de Taller' }],
      awards: ['Publicado en Archivo EcuadorianArch'],
      contact: {
        website: 'https://',
        instagram: '@estudio',
        email: 'contacto@estudio.com',
      },
    };
    setIsNewProfile(true);
    setEditingAuthor(blankAuthor);
    setEditingPhotographer(null);
  };

  // Start creating new photographer profile
  const handleNewPhotographer = () => {
    const newId = `foto-${Date.now().toString(36)}`;
    const blankPhotographer: PhotographerProfileData = {
      id: newId,
      name: 'NUEVO FOTÓGRAFO / ESTUDIO VISUAL',
      slug: newId,
      lead: 'Fotógrafo Principal',
      location: 'Quito, Ecuador',
      country: 'Ecuador',
      foundedYear: new Date().getFullYear().toString(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      headline: 'Documentación fotográfica de arquitectura contemporánea y territorio.',
      description: 'Práctica fotográfica dedicada a la documentación visual de obras arquitectónicas y paisajes en el Ecuador.',
      philosophy: 'Capturar la atmósfera, el silencio y la tensión exacta entre la luz ecuatorial y la sombra.',
      focus: ['Fotografía de Arquitectura', 'Documentación Espacial', 'Detalle Constructivo'],
      publications: ['Publicado en Archivo EcuadorianArch'],
      contact: {
        website: 'https://',
        instagram: '@fotografo',
        email: 'info@fotografo.com',
      },
    };
    setIsNewProfile(true);
    setEditingPhotographer(blankPhotographer);
    setEditingAuthor(null);
  };

  // Save author
  const handleSaveAuthor = (authorToSave: AuthorProfileData) => {
    if (isNewProfile) {
      createAuthorProfile(authorToSave);
    } else {
      updateAuthorProfile(authorToSave.id, authorToSave);
    }
    saveToDisk();
    setEditingAuthor(null);
    setIsNewProfile(false);
  };

  // Save photographer
  const handleSavePhotographer = (photoToSave: PhotographerProfileData) => {
    if (isNewProfile) {
      createPhotographerProfile(photoToSave);
    } else {
      updatePhotographerProfile(photoToSave.id, photoToSave);
    }
    saveToDisk();
    setEditingPhotographer(null);
    setIsNewProfile(false);
  };

  // Duplicate author
  const handleDuplicateAuthor = (author: AuthorProfileData) => {
    const newId = `${author.slug}-copia-${Date.now().toString(36).substring(2, 6)}`;
    const copy: AuthorProfileData = {
      ...author,
      id: newId,
      name: `${author.name} (COPIA)`,
      slug: newId,
    };
    createAuthorProfile(copy);
    saveToDisk();
  };

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetField) return;

    setIsUploadingImage(uploadTargetField);
    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        if (editingAuthor) {
          if (uploadTargetField === 'avatar') {
            setEditingAuthor({ ...editingAuthor, avatarUrl: res.url });
          } else {
            setEditingAuthor({ ...editingAuthor, coverImage: res.url });
          }
        } else if (editingPhotographer) {
          if (uploadTargetField === 'avatar') {
            setEditingPhotographer({ ...editingPhotographer, avatarUrl: res.url });
          } else {
            setEditingPhotographer({ ...editingPhotographer, coverImage: res.url });
          }
        } else if (editingMasterBuilder) {
          if (uploadTargetField === 'avatar') {
            setEditingMasterBuilder({ ...editingMasterBuilder, avatarUrl: res.url });
          } else {
            setEditingMasterBuilder({ ...editingMasterBuilder, coverImage: res.url });
          }
        }
      }
    } catch (err) {
      console.error('Error uploading profile image:', err);
    } finally {
      setIsUploadingImage(null);
      setUploadTargetField(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 bg-[#121212] text-white flex flex-col overflow-hidden font-inter select-none">
      {/* Hidden file input for direct computer uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* =================================================================== */}
      {/* 1. TOP TOOLBAR & CONTROLS                                           */}
      {/* =================================================================== */}
      <div className="bg-[#1a1a1a] border-b border-white/10 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-anton text-2xl tracking-wider text-white">
              PERFILES &amp; ARQUITECTOS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono text-xs border border-white/15">
              {authors.length} Arquitectos · {photographers.length} Fotógrafos
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Crea y edita la información real, fotografías de perfil, trayectoria, equipo y enlaces de arquitectos y autores.
          </p>
        </div>

        {/* Action Controls & New Profile Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar arquitecto o estudio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/15 pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 rounded focus:outline-hidden focus:border-white transition-colors font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* New Architect Profile Button */}
          <button
            type="button"
            onClick={handleNewAuthor}
            className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded text-xs font-anton tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NUEVO ARQUITECTO</span>
          </button>

          {/* New Photographer Profile Button */}
          <button
            type="button"
            onClick={handleNewPhotographer}
            className="flex items-center gap-2 bg-neutral-800 text-white hover:bg-neutral-700 border border-white/20 px-3.5 py-2 rounded text-xs font-anton tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
            title="Agregar Fotógrafo de Arquitectura"
          >
            <Camera className="w-3.5 h-3.5 text-white/70" />
            <span>NUEVO FOTÓGRAFO</span>
          </button>

          {/* New Master Builder Profile Button */}
          <button
            type="button"
            onClick={handleNewMasterBuilder}
            className="flex items-center gap-2 bg-amber-400 text-black hover:bg-amber-300 px-3.5 py-2 rounded text-xs font-anton tracking-wider uppercase transition-all active:scale-95 cursor-pointer shadow-md"
            title="Agregar Maestro Mayor de Obra"
          >
            <HardHat className="w-3.5 h-3.5 text-black" />
            <span>NUEVO MAESTRO MAYOR</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. SUB-NAVIGATION TABS                                              */}
      {/* =================================================================== */}
      <div className="bg-[#161616] border-b border-white/10 px-6 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setActiveTab('authors')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-anton tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'authors'
                ? 'bg-white text-black shadow-xs'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ARQUITECTOS / ESTUDIOS ({authors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photographers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-anton tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'photographers'
                ? 'bg-white text-black shadow-xs'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>FOTÓGRAFOS / COLABORADORES ({photographers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('masterBuilders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-anton tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'masterBuilders'
                ? 'bg-white text-black shadow-xs'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>MAESTROS MAYORES & MANO DE OBRA ({masterBuilders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-anton tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-xs'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>TODOS ({authors.length + photographers.length + masterBuilders.length})</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-white/40 hidden md:inline">
          Haz clic en &quot;EDITAR&quot; en cualquier tarjeta para cambiar fotos y datos reales.
        </span>
      </div>

      {/* =================================================================== */}
      {/* 3. PROFILES CARDS GRID                                              */}
      {/* =================================================================== */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SECTION A: AUTHORS / ARCHITECTS */}
        {(activeTab === 'authors' || activeTab === 'all') && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white/60" />
                <h2 className="font-anton text-sm tracking-wider uppercase text-white/90">
                  Prácticas &amp; Estudios de Arquitectura ({filteredAuthors.length})
                </h2>
              </div>
            </div>

            {filteredAuthors.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-12 text-center">
                <Building2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="font-anton text-sm uppercase tracking-wider text-white/60">
                  No se encontraron arquitectos con el criterio de búsqueda.
                </p>
                <button
                  type="button"
                  onClick={handleNewAuthor}
                  className="mt-4 px-4 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider rounded inline-flex items-center gap-2 hover:bg-neutral-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Crear primer arquitecto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAuthors.map((author) => {
                  const projCount = projectCountByAuthor[author.name.toUpperCase()] || 0;
                  return (
                    <article
                      key={author.id}
                      className="bg-[#1a1a1a] border border-white/10 hover:border-white/30 rounded-lg overflow-hidden flex flex-col justify-between transition-all group hover:shadow-xl"
                    >
                      {/* Top Cover Banner */}
                      <div className="relative h-28 bg-neutral-900 overflow-hidden">
                        {author.coverImage ? (
                          <img
                            src={author.coverImage}
                            alt=""
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-900" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

                        {/* Associated Projects Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className="px-2 py-0.5 rounded bg-black/75 border border-white/20 text-[10px] font-mono uppercase text-white/90 backdrop-blur-xs flex items-center gap-1"
                            title={`${projCount} proyectos vinculados en la plataforma`}
                          >
                            <FolderOpen className="w-3 h-3 text-white/70" />
                            {projCount} {projCount === 1 ? 'PROYECTO' : 'PROYECTOS'}
                          </span>
                        </div>

                        {/* Avatar thumbnail overlapping cover */}
                        <div className="absolute -bottom-4 left-4">
                          <div className="w-16 h-16 rounded-full border-2 border-[#1a1a1a] bg-neutral-800 overflow-hidden shadow-lg relative group-hover:ring-2 group-hover:ring-white/40 transition-all">
                            {author.avatarUrl ? (
                              <img
                                src={author.avatarUrl}
                                alt={author.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-anton text-lg text-white/40">
                                {author.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 pt-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-anton text-base tracking-wide uppercase text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                {author.name}
                              </h3>
                              <p className="text-xs text-white/60 font-mono line-clamp-1">
                                {author.founder || 'Titular / Fundador'}
                              </p>
                            </div>
                          </div>

                          {/* Location & Year Founded */}
                          <div className="flex items-center gap-3 text-[11px] text-white/40 font-mono mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-white/30" />
                              {author.location || 'Ecuador'}
                            </span>
                            {author.foundedYear && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-white/30" />
                                {author.foundedYear}
                              </span>
                            )}
                          </div>

                          {/* Headline */}
                          {author.headline && (
                            <p className="text-xs text-white/70 mt-2.5 line-clamp-2 italic leading-relaxed">
                              &ldquo;{author.headline}&rdquo;
                            </p>
                          )}

                          {/* Typologies Tags */}
                          {author.typologies && author.typologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {author.typologies.slice(0, 3).map((t, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/60 uppercase"
                                >
                                  {t}
                                </span>
                              ))}
                              {author.typologies.length > 3 && (
                                <span className="text-[9px] font-mono text-white/40 self-center">
                                  +{author.typologies.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Social & Web icons */}
                        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/10 text-white/50 text-xs">
                          {author.contact?.website && (
                            <a
                              href={author.contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-white transition-colors"
                              title={author.contact.website}
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {author.contact?.instagram && (
                            <span className="hover:text-white transition-colors font-mono text-[10px] flex items-center gap-0.5">
                              <Instagram className="w-3 h-3" />
                              {author.contact.instagram}
                            </span>
                          )}
                          {author.contact?.email && (
                            <a
                              href={`mailto:${author.contact.email}`}
                              className="hover:text-white transition-colors ml-auto"
                              title={author.contact.email}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Action Bar Footer */}
                      <div className="bg-black/30 border-t border-white/10 p-2.5 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewProfile(false);
                            setEditingAuthor({ ...author });
                            setEditingPhotographer(null);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black hover:bg-neutral-200 py-1.5 px-2 rounded text-[11px] font-anton tracking-wider uppercase transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>EDITAR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewAuthorName(author.name)}
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                          title="Ver Dossier Público (Vista Previa)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateAuthor(author)}
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                          title="Duplicar perfil"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el perfil de ${author.name}? Esta acción no se puede deshacer.`)) {
                              deleteAuthorProfile(author.id);
                              saveToDisk();
                            }
                          }}
                          className="p-1.5 text-red-400/70 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                          title="Eliminar perfil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION B: PHOTOGRAPHERS / COLLABORATORS */}
        {(activeTab === 'photographers' || activeTab === 'all') && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-white/60" />
                <h2 className="font-anton text-sm tracking-wider uppercase text-white/90">
                  Fotógrafos de Arquitectura &amp; Registros Visuales ({filteredPhotographers.length})
                </h2>
              </div>
            </div>

            {filteredPhotographers.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-12 text-center">
                <Camera className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="font-anton text-sm uppercase tracking-wider text-white/60">
                  No se encontraron fotógrafos con el criterio de búsqueda.
                </p>
                <button
                  type="button"
                  onClick={handleNewPhotographer}
                  className="mt-4 px-4 py-2 bg-neutral-800 text-white border border-white/20 font-anton text-xs uppercase tracking-wider rounded inline-flex items-center gap-2 hover:bg-neutral-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Crear primer fotógrafo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPhotographers.map((photo) => {
                  const projCount = projectCountByPhotographer[photo.name.toUpperCase()] || 0;
                  return (
                    <article
                      key={photo.id}
                      className="bg-[#1a1a1a] border border-white/10 hover:border-white/30 rounded-lg overflow-hidden flex flex-col justify-between transition-all group hover:shadow-xl"
                    >
                      {/* Top Cover Banner */}
                      <div className="relative h-28 bg-neutral-900 overflow-hidden">
                        {photo.coverImage ? (
                          <img
                            src={photo.coverImage}
                            alt=""
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-900" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

                        {/* Associated Projects Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className="px-2 py-0.5 rounded bg-black/75 border border-white/20 text-[10px] font-mono uppercase text-white/90 backdrop-blur-xs flex items-center gap-1"
                            title={`${projCount} registros fotográficos vinculados`}
                          >
                            <Camera className="w-3 h-3 text-white/70" />
                            {projCount} {projCount === 1 ? 'REGISTRO' : 'REGISTROS'}
                          </span>
                        </div>

                        {/* Avatar thumbnail overlapping cover */}
                        <div className="absolute -bottom-4 left-4">
                          <div className="w-16 h-16 rounded-full border-2 border-[#1a1a1a] bg-neutral-800 overflow-hidden shadow-lg relative group-hover:ring-2 group-hover:ring-white/40 transition-all">
                            {photo.avatarUrl ? (
                              <img
                                src={photo.avatarUrl}
                                alt={photo.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-anton text-lg text-white/40">
                                {photo.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 pt-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-anton text-base tracking-wide uppercase text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                {photo.name}
                              </h3>
                              <p className="text-xs text-white/60 font-mono line-clamp-1">
                                {photo.lead || 'Fotógrafo Principal'}
                              </p>
                            </div>
                          </div>

                          {/* Location & Year Founded */}
                          <div className="flex items-center gap-3 text-[11px] text-white/40 font-mono mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-white/30" />
                              {photo.location || 'Ecuador'}
                            </span>
                            {photo.foundedYear && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-white/30" />
                                {photo.foundedYear}
                              </span>
                            )}
                          </div>

                          {/* Headline */}
                          {photo.headline && (
                            <p className="text-xs text-white/70 mt-2.5 line-clamp-2 italic leading-relaxed">
                              &ldquo;{photo.headline}&rdquo;
                            </p>
                          )}

                          {/* Focus Tags */}
                          {photo.focus && photo.focus.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {photo.focus.slice(0, 3).map((f, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/60 uppercase"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Social & Web icons */}
                        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/10 text-white/50 text-xs">
                          {photo.contact?.website && (
                            <a
                              href={photo.contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-white transition-colors"
                              title={photo.contact.website}
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {photo.contact?.instagram && (
                            <span className="hover:text-white transition-colors font-mono text-[10px] flex items-center gap-0.5">
                              <Instagram className="w-3 h-3" />
                              {photo.contact.instagram}
                            </span>
                          )}
                          {photo.contact?.email && (
                            <a
                              href={`mailto:${photo.contact.email}`}
                              className="hover:text-white transition-colors ml-auto"
                              title={photo.contact.email}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Action Bar Footer */}
                      <div className="bg-black/30 border-t border-white/10 p-2.5 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewProfile(false);
                            setEditingPhotographer({ ...photo });
                            setEditingAuthor(null);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black hover:bg-neutral-200 py-1.5 px-2 rounded text-[11px] font-anton tracking-wider uppercase transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>EDITAR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewPhotographerName(photo.name)}
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                          title="Ver Dossier Fotográfico (Vista Previa)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el perfil fotográfico de ${photo.name}?`)) {
                              deletePhotographerProfile(photo.id);
                              saveToDisk();
                            }
                          }}
                          className="p-1.5 text-red-400/70 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                          title="Eliminar perfil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. MAESTROS MAYORES & MANO DE OBRA SECTION                          */}
        {/* =================================================================== */}
        {(activeTab === 'masterBuilders' || activeTab === 'all') && (
          <div className="pt-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-400" />
                <h2 className="font-anton text-sm tracking-wider uppercase text-white/90">
                  Maestros Mayores &amp; Mano de Obra ({filteredMasterBuilders.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-white/40 hidden sm:inline">
                Reconocimiento a constructores, dirección artesanal y cuadrillas tectónicas
              </span>
            </div>

            {filteredMasterBuilders.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-12 text-center">
                <HardHat className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="font-anton text-sm uppercase tracking-wider text-white/60">
                  No se encontraron maestros mayores con el criterio de búsqueda.
                </p>
                <button
                  type="button"
                  onClick={handleNewMasterBuilder}
                  className="mt-4 px-4 py-2 bg-amber-400 text-black font-anton text-xs uppercase tracking-wider rounded inline-flex items-center gap-2 hover:bg-amber-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Crear primer Maestro Mayor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMasterBuilders.map((builder) => {
                  const projCount = projectCountByMaestro[builder.name.toUpperCase()] || 0;
                  return (
                    <article
                      key={builder.id}
                      className="bg-[#1a1a1a] border border-white/10 hover:border-amber-400/40 rounded-lg overflow-hidden flex flex-col justify-between transition-all group hover:shadow-xl"
                    >
                      {/* Top Cover Banner */}
                      <div className="relative h-28 bg-neutral-900 overflow-hidden">
                        {builder.coverImage ? (
                          <img
                            src={builder.coverImage}
                            alt=""
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-900" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

                        {/* Associated Projects Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className="px-2 py-0.5 rounded bg-black/75 border border-white/20 text-[10px] font-mono uppercase text-white/90 backdrop-blur-xs flex items-center gap-1"
                            title={`${projCount} obras lideradas`}
                          >
                            <HardHat className="w-3 h-3 text-amber-400" />
                            {projCount} {projCount === 1 ? 'OBRA' : 'OBRAS'}
                          </span>
                        </div>

                        {/* Avatar thumbnail */}
                        <div className="absolute -bottom-4 left-4">
                          <div className="w-16 h-16 rounded-full border-2 border-[#1a1a1a] bg-neutral-800 overflow-hidden shadow-lg relative group-hover:ring-2 group-hover:ring-amber-400/50 transition-all">
                            {builder.avatarUrl ? (
                              <img
                                src={builder.avatarUrl}
                                alt={builder.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-anton text-lg text-amber-400 bg-amber-400/10">
                                {builder.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 pt-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div>
                            <h3 className="font-anton text-base tracking-wide uppercase text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                              {builder.name}
                            </h3>
                            <p className="text-xs text-amber-400 font-mono line-clamp-1">
                              {builder.rol || 'Maestro Mayor de Obra'}
                            </p>
                          </div>

                          {/* Location & Experience */}
                          <div className="flex items-center gap-3 text-[11px] text-white/50 font-mono mt-2">
                            {builder.location && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {builder.location}
                              </span>
                            )}
                            {builder.experienceYears && (
                              <span className="flex items-center gap-1 shrink-0">
                                <Calendar className="w-3 h-3" />
                                {builder.experienceYears}
                              </span>
                            )}
                          </div>

                          {/* Oficio Description */}
                          <p className="text-xs text-white/60 font-sans line-clamp-2 mt-2 leading-relaxed">
                            {builder.oficio || builder.trayectoria}
                          </p>

                          {/* Specialties Pills */}
                          {builder.specialties && builder.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {builder.specialties.slice(0, 3).map((sp, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9.5px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/70"
                                >
                                  {sp}
                                </span>
                              ))}
                              {builder.specialties.length > 3 && (
                                <span className="text-[9.5px] font-mono text-white/40 self-center">
                                  +{builder.specialties.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Cuadrilla preview badge */}
                          {builder.defaultMembers && builder.defaultMembers.length > 0 && (
                            <div className="mt-2.5 text-[10px] font-mono text-amber-400/80 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>Cuadrilla base: {builder.defaultMembers.length} artesanos</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar Footer */}
                      <div className="bg-black/30 border-t border-white/10 p-2.5 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewProfile(false);
                            setEditingMasterBuilder({ ...builder });
                            setEditingAuthor(null);
                            setEditingPhotographer(null);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-amber-400 text-black hover:bg-amber-300 py-1.5 px-2 rounded text-[11px] font-anton tracking-wider uppercase transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>EDITAR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateMasterBuilder(builder)}
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                          title="Duplicar perfil"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMasterBuilder(builder.id, builder.name)}
                          className="p-1.5 text-red-400/70 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                          title="Eliminar perfil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. RICH PROFILE EDITOR DRAWER / MODAL (FOR AUTHORS / ARCHITECTS)    */}
      {/* =================================================================== */}
      {editingAuthor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#181818] border border-white/20 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-white">
            {/* Header */}
            <div className="bg-[#202020] border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] text-amber-400 uppercase tracking-widest block">
                  {isNewProfile ? 'CREAR NUEVO PERFIL' : 'EDITAR PERFIL DE ARQUITECTO'}
                </span>
                <h2 className="font-anton text-xl tracking-wider text-white uppercase mt-0.5">
                  {editingAuthor.name || 'ESTUDIO DE ARQUITECTURA'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingAuthor(null)}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* SECTION: IDENTIFICACIÓN PRINCIPAL */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> 1. Datos Principales del Estudio / Arquitecto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Nombre del Estudio o Arquitecto *
                    </label>
                    <input
                      type="text"
                      value={editingAuthor.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingAuthor({
                          ...editingAuthor,
                          name: val,
                          slug: isNewProfile ? normalizeStudioToSlug(val) : editingAuthor.slug,
                        });
                      }}
                      placeholder="Ej: ESTUDIO FELIPE ESCUDERO"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded font-anton text-sm text-white focus:outline-hidden focus:border-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Fundador(es) / Titular(es) *
                    </label>
                    <input
                      type="text"
                      value={editingAuthor.founder}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, founder: e.target.value })}
                      placeholder="Ej: Felipe Escudero"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white focus:outline-hidden focus:border-white font-sans text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Ubicación (Ciudad, País)
                    </label>
                    <input
                      type="text"
                      value={editingAuthor.location}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, location: e.target.value })}
                      placeholder="Ej: Quito, Ecuador"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white focus:outline-hidden focus:border-white font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono text-[11px] text-white/70 mb-1">País</label>
                      <input
                        type="text"
                        value={editingAuthor.country}
                        onChange={(e) => setEditingAuthor({ ...editingAuthor, country: e.target.value })}
                        placeholder="Ecuador"
                        className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white focus:outline-hidden focus:border-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-white/70 mb-1">Año Fundación</label>
                      <input
                        type="text"
                        value={editingAuthor.foundedYear}
                        onChange={(e) => setEditingAuthor({ ...editingAuthor, foundedYear: e.target.value })}
                        placeholder="2014"
                        className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white focus:outline-hidden focus:border-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-white/50 mb-1">
                    Slug Identificador (URL y lookup interno)
                  </label>
                  <input
                    type="text"
                    value={editingAuthor.slug}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, slug: normalizeStudioToSlug(e.target.value) })}
                    className="w-full bg-black/30 border border-white/10 p-2 rounded text-white/60 font-mono text-xs"
                  />
                </div>
              </div>

              {/* SECTION: IMÁGENES REALES (AVATAR Y PORTADA) */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> 2. Imágenes Reales (Foto del Arquitecto &amp; Portada)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Foto de Perfil / Avatar */}
                  <div className="bg-black/40 border border-white/10 rounded p-4 space-y-3">
                    <span className="font-mono text-xs text-white/90 font-bold block">
                      Foto del Arquitecto / Logotipo del Estudio (Avatar)
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full border-2 border-white/20 bg-neutral-900 overflow-hidden flex-shrink-0 relative">
                        {editingAuthor.avatarUrl ? (
                          <img
                            src={editingAuthor.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-anton text-xs text-white/30">
                            SIN FOTO
                          </div>
                        )}
                        {isUploadingImage === 'avatar' && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-[9px] font-mono animate-pulse">SUBIENDO</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadTargetField('avatar');
                            fileInputRef.current?.click();
                          }}
                          className="w-full py-1.5 px-3 bg-white text-black hover:bg-neutral-200 text-xs font-anton tracking-wider uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir desde mi equipo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMediaTargetField('avatar');
                            setIsMediaModalOpen(true);
                          }}
                          className="w-full py-1.5 px-3 bg-white/10 text-white hover:bg-white/20 text-xs font-anton tracking-wider uppercase rounded flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Biblioteca de Medios</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-white/50 mb-0.5">O ingresa URL directa:</label>
                      <input
                        type="text"
                        value={editingAuthor.avatarUrl}
                        onChange={(e) => setEditingAuthor({ ...editingAuthor, avatarUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-black/50 border border-white/15 p-2 rounded text-white text-[11px] font-mono focus:outline-hidden focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Portada / Cover Image */}
                  <div className="bg-black/40 border border-white/10 rounded p-4 space-y-3">
                    <span className="font-mono text-xs text-white/90 font-bold block">
                      Portada / Obra Representativa (Cover Image)
                    </span>
                    <div className="relative h-20 rounded border border-white/20 bg-neutral-900 overflow-hidden">
                      {editingAuthor.coverImage ? (
                        <img
                          src={editingAuthor.coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-anton text-xs text-white/30">
                          SIN PORTADA
                        </div>
                      )}
                      {isUploadingImage === 'cover' && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-[10px] font-mono animate-pulse">SUBIENDO</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadTargetField('cover');
                          fileInputRef.current?.click();
                        }}
                        className="py-1.5 px-2 bg-white text-black hover:bg-neutral-200 text-xs font-anton tracking-wider uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir portada</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMediaTargetField('cover');
                          setIsMediaModalOpen(true);
                        }}
                        className="py-1.5 px-2 bg-white/10 text-white hover:bg-white/20 text-xs font-anton tracking-wider uppercase rounded flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Medios</span>
                      </button>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-white/50 mb-0.5">O ingresa URL directa:</label>
                      <input
                        type="text"
                        value={editingAuthor.coverImage}
                        onChange={(e) => setEditingAuthor({ ...editingAuthor, coverImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-black/50 border border-white/15 p-2 rounded text-white text-[11px] font-mono focus:outline-hidden focus:border-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: TEXTOS EDITORIALES & NARRATIVA */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 3. Contenido Editorial &amp; Filosofía
                </h3>

                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">
                    Titular Editorial (Headline / Frase Síntesis)
                  </label>
                  <input
                    type="text"
                    value={editingAuthor.headline}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, headline: e.target.value })}
                    placeholder="Ej: Arquitectura escultórica, vanguardia matérica y diálogo con la geografía andina."
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white text-xs font-sans italic focus:outline-hidden focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">
                    Trayectoria y Descripción Detallada (Biografía)
                  </label>
                  <textarea
                    rows={4}
                    value={editingAuthor.description}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, description: e.target.value })}
                    placeholder="Describe la fundación del estudio, su evolución, obras emblemáticas y enfoque proyectual..."
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white text-xs font-sans leading-relaxed focus:outline-hidden focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">
                    Filosofía Arquitectónica &amp; Manifiesto
                  </label>
                  <textarea
                    rows={3}
                    value={editingAuthor.philosophy}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, philosophy: e.target.value })}
                    placeholder="Principios constructivos, diálogo con la luz, materia, territorio..."
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white text-xs font-sans leading-relaxed focus:outline-hidden focus:border-white"
                  />
                </div>
              </div>

              {/* SECTION: TIPOLOGÍAS, EQUIPO Y PREMIOS */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> 4. Tipologías, Equipo &amp; Reconocimientos
                </h3>

                {/* Typologies tags */}
                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">
                    Tipologías Arquitectónicas (Separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={(editingAuthor.typologies || []).join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setEditingAuthor({ ...editingAuthor, typologies: list });
                    }}
                    placeholder="Arquitectura Residencial, Edificación Colectiva, Pabellones"
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white text-xs font-mono focus:outline-hidden focus:border-white"
                  />
                </div>

                {/* Team members */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[11px] text-white/70">
                      Miembros del Equipo &amp; Roles
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextTeam = [...(editingAuthor.team || []), { name: '', role: '' }];
                        setEditingAuthor({ ...editingAuthor, team: nextTeam });
                      }}
                      className="text-[10px] font-anton tracking-wider uppercase text-amber-300 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Agregar Miembro
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(editingAuthor.team || []).map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const nextTeam = [...(editingAuthor.team || [])];
                            nextTeam[idx] = { ...nextTeam[idx], name: e.target.value };
                            setEditingAuthor({ ...editingAuthor, team: nextTeam });
                          }}
                          placeholder="Nombre (ej: Felipe Escudero)"
                          className="flex-1 bg-black/50 border border-white/15 p-2 rounded text-white text-xs"
                        />
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => {
                            const nextTeam = [...(editingAuthor.team || [])];
                            nextTeam[idx] = { ...nextTeam[idx], role: e.target.value };
                            setEditingAuthor({ ...editingAuthor, team: nextTeam });
                          }}
                          placeholder="Cargo (ej: Director Creativo)"
                          className="flex-1 bg-black/50 border border-white/15 p-2 rounded text-white text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextTeam = (editingAuthor.team || []).filter((_, i) => i !== idx);
                            setEditingAuthor({ ...editingAuthor, team: nextTeam });
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Awards list */}
                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">
                    Premios &amp; Reconocimientos (Uno por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={(editingAuthor.awards || []).join('\n')}
                    onChange={(e) => {
                      const list = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
                      setEditingAuthor({ ...editingAuthor, awards: list });
                    }}
                    placeholder="Selección Oficial BAQ&#10;ArchDaily Building of the Year Nominee&#10;Premio Ornato"
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white text-xs font-mono focus:outline-hidden focus:border-white"
                  />
                </div>
              </div>

              {/* SECTION: ENLACES & CONTACTO */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> 5. Contacto &amp; Presencia Digital
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1 flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-white/40" /> Sitio Web
                    </label>
                    <input
                      type="text"
                      value={editingAuthor.contact?.website || ''}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          contact: { ...editingAuthor.contact, website: e.target.value },
                        })
                      }
                      placeholder="https://www.estudio.com"
                      className="w-full bg-black/50 border border-white/20 p-2 rounded text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1 flex items-center gap-1.5">
                      <Instagram className="w-3 h-3 text-white/40" /> Instagram
                    </label>
                    <input
                      type="text"
                      value={editingAuthor.contact?.instagram || ''}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          contact: { ...editingAuthor.contact, instagram: e.target.value },
                        })
                      }
                      placeholder="@estudio"
                      className="w-full bg-black/50 border border-white/20 p-2 rounded text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-white/40" /> Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={editingAuthor.contact?.email || ''}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          contact: { ...editingAuthor.contact, email: e.target.value },
                        })
                      }
                      placeholder="contacto@estudio.com"
                      className="w-full bg-black/50 border border-white/20 p-2 rounded text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="bg-[#202020] border-t border-white/10 px-6 py-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreviewAuthorName(editingAuthor.name)}
                className="px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-700 border border-white/20 rounded text-xs font-anton tracking-wider uppercase flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Previsualizar Dossier</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingAuthor(null)}
                  className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded text-xs font-anton tracking-wider uppercase transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAuthor(editingAuthor)}
                  className="px-6 py-2 bg-white text-black hover:bg-neutral-200 rounded text-xs font-anton tracking-wider uppercase transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer font-bold"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>GUARDAR PERFIL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. RICH PROFILE EDITOR DRAWER / MODAL (FOR PHOTOGRAPHERS)           */}
      {/* =================================================================== */}
      {editingPhotographer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#181818] border border-white/20 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-white">
            {/* Header */}
            <div className="bg-[#202020] border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] text-amber-400 uppercase tracking-widest block">
                  {isNewProfile ? 'CREAR NUEVO PERFIL FOTOGRÁFICO' : 'EDITAR PERFIL DE FOTÓGRAFO'}
                </span>
                <h2 className="font-anton text-xl tracking-wider text-white uppercase mt-0.5">
                  {editingPhotographer.name || 'ESTUDIO FOTOGRÁFICO'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhotographer(null)}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> 1. Datos del Fotógrafo / Estudio Visual
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Nombre o Firma Fotográfica *
                    </label>
                    <input
                      type="text"
                      value={editingPhotographer.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingPhotographer({
                          ...editingPhotographer,
                          name: val,
                          slug: isNewProfile ? normalizePhotographerToSlug(val) : editingPhotographer.slug,
                        });
                      }}
                      placeholder="Ej: BICUBIK PHOTOGRAPHY"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded font-anton text-sm text-white focus:outline-hidden focus:border-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Fotógrafo Titular / Equipo
                    </label>
                    <input
                      type="text"
                      value={editingPhotographer.lead}
                      onChange={(e) => setEditingPhotographer({ ...editingPhotographer, lead: e.target.value })}
                      placeholder="Ej: Mateo Soto / Equipo Bicubik"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white focus:outline-hidden focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={editingPhotographer.location}
                      onChange={(e) => setEditingPhotographer({ ...editingPhotographer, location: e.target.value })}
                      placeholder="Quito, Ecuador"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">Año Inicio</label>
                    <input
                      type="text"
                      value={editingPhotographer.foundedYear}
                      onChange={(e) => setEditingPhotographer({ ...editingPhotographer, foundedYear: e.target.value })}
                      placeholder="2015"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* IMÁGENES FOTÓGRAFO */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> 2. Imágenes (Avatar &amp; Fotografía Destacada)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar */}
                  <div className="bg-black/40 border border-white/10 rounded p-4 space-y-3">
                    <span className="font-mono text-xs text-white/90 font-bold block">Avatar / Foto</span>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border border-white/20 overflow-hidden bg-neutral-900 flex-shrink-0">
                        {editingPhotographer.avatarUrl && (
                          <img src={editingPhotographer.avatarUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadTargetField('avatar');
                            fileInputRef.current?.click();
                          }}
                          className="w-full py-1.5 px-3 bg-white text-black text-xs font-anton uppercase rounded flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" /> Subir foto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTargetField('avatar');
                            setIsMediaModalOpen(true);
                          }}
                          className="w-full py-1.5 px-3 bg-white/10 text-white text-xs font-anton uppercase rounded flex items-center justify-center gap-1.5 border border-white/15"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> Medios
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editingPhotographer.avatarUrl}
                      onChange={(e) => setEditingPhotographer({ ...editingPhotographer, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-black/50 border border-white/15 p-2 rounded text-white text-[11px] font-mono"
                    />
                  </div>

                  {/* Portada */}
                  <div className="bg-black/40 border border-white/10 rounded p-4 space-y-3">
                    <span className="font-mono text-xs text-white/90 font-bold block">Portada</span>
                    <div className="h-16 rounded border border-white/20 overflow-hidden bg-neutral-900">
                      {editingPhotographer.coverImage && (
                        <img src={editingPhotographer.coverImage} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadTargetField('cover');
                          fileInputRef.current?.click();
                        }}
                        className="py-1.5 px-2 bg-white text-black text-xs font-anton uppercase rounded flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Subir portada
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTargetField('cover');
                          setIsMediaModalOpen(true);
                        }}
                        className="py-1.5 px-2 bg-white/10 text-white text-xs font-anton uppercase rounded flex items-center justify-center gap-1.5 border border-white/15"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Medios
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editingPhotographer.coverImage}
                      onChange={(e) => setEditingPhotographer({ ...editingPhotographer, coverImage: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-black/50 border border-white/15 p-2 rounded text-white text-[11px] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* NARRATIVA Y CONTACTO FOTÓGRAFO */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 3. Manifiesto &amp; Contacto
                </h3>

                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">Titular Síntesis</label>
                  <input
                    type="text"
                    value={editingPhotographer.headline}
                    onChange={(e) => setEditingPhotographer({ ...editingPhotographer, headline: e.target.value })}
                    placeholder="Luz cenital y geometría andina..."
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">Descripción &amp; Enfoque</label>
                  <textarea
                    rows={3}
                    value={editingPhotographer.description}
                    onChange={(e) => setEditingPhotographer({ ...editingPhotographer, description: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-white text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={editingPhotographer.contact?.website || ''}
                    onChange={(e) =>
                      setEditingPhotographer({
                        ...editingPhotographer,
                        contact: { ...editingPhotographer.contact, website: e.target.value },
                      })
                    }
                    placeholder="Web (https://...)"
                    className="bg-black/50 border border-white/15 p-2 rounded text-white text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={editingPhotographer.contact?.instagram || ''}
                    onChange={(e) =>
                      setEditingPhotographer({
                        ...editingPhotographer,
                        contact: { ...editingPhotographer.contact, instagram: e.target.value },
                      })
                    }
                    placeholder="Instagram (@...)"
                    className="bg-black/50 border border-white/15 p-2 rounded text-white text-xs font-mono"
                  />
                  <input
                    type="email"
                    value={editingPhotographer.contact?.email || ''}
                    onChange={(e) =>
                      setEditingPhotographer({
                        ...editingPhotographer,
                        contact: { ...editingPhotographer.contact, email: e.target.value },
                      })
                    }
                    placeholder="Email"
                    className="bg-black/50 border border-white/15 p-2 rounded text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-[#202020] border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPhotographer(null)}
                className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded text-xs font-anton tracking-wider uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSavePhotographer(editingPhotographer)}
                className="px-6 py-2 bg-white text-black hover:bg-neutral-200 rounded text-xs font-anton tracking-wider uppercase flex items-center gap-2 font-bold cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>GUARDAR FOTÓGRAFO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. RICH PROFILE EDITOR DRAWER / MODAL (FOR MAESTROS MAYORES)        */}
      {/* =================================================================== */}
      {editingMasterBuilder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#181818] border border-white/20 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-white">
            {/* Header */}
            <div className="bg-[#202020] border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] text-amber-400 uppercase tracking-widest block flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5" />
                  <span>{isNewProfile ? 'CREAR NUEVO PERFIL' : 'EDITAR PERFIL DE MAESTRO MAYOR'}</span>
                </span>
                <h2 className="font-anton text-xl tracking-wider text-white uppercase mt-0.5">
                  {editingMasterBuilder.name || 'MAESTRO CONSTRUCTOR'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingMasterBuilder(null)}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveMasterBuilder} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* SECTION 1: VISUAL MEDIA */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> 1. Fotografías del Maestro Mayor & Obra
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Portrait / Avatar */}
                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Retrato o Foto de Perfil del Maestro
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full border-2 border-white/20 bg-neutral-900 overflow-hidden shrink-0">
                        {editingMasterBuilder.avatarUrl ? (
                          <img
                            src={editingMasterBuilder.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-anton text-amber-400 bg-amber-400/10">
                            MM
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={editingMasterBuilder.avatarUrl || ''}
                          onChange={(e) =>
                            setEditingMasterBuilder({
                              ...editingMasterBuilder,
                              avatarUrl: e.target.value,
                            })
                          }
                          placeholder="URL de foto o usa los botones..."
                          className="w-full bg-black/50 border border-white/20 p-2 rounded text-xs text-white font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setUploadTargetField('avatar');
                              fileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-[10.5px] font-mono uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3" /> Subir PC
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMediaTargetField('avatar');
                              setIsMediaModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-[10.5px] font-mono uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3" /> Biblioteca
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Photo */}
                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Foto de Portada / Obra en Construcción
                    </label>
                    <div className="space-y-1.5">
                      <div className="h-16 rounded border border-white/20 bg-neutral-900 overflow-hidden relative">
                        {editingMasterBuilder.coverImage ? (
                          <img
                            src={editingMasterBuilder.coverImage}
                            alt=""
                            className="w-full h-full object-cover opacity-70"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-white/40">
                            Sin portada asignada
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingMasterBuilder.coverImage || ''}
                          onChange={(e) =>
                            setEditingMasterBuilder({
                              ...editingMasterBuilder,
                              coverImage: e.target.value,
                            })
                          }
                          placeholder="URL de portada..."
                          className="flex-1 bg-black/50 border border-white/20 p-1.5 rounded text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadTargetField('cover');
                            fileInputRef.current?.click();
                          }}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-[10.5px] font-mono uppercase cursor-pointer"
                        >
                          Subir
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTargetField('cover');
                            setIsMediaModalOpen(true);
                          }}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-[10.5px] font-mono uppercase cursor-pointer"
                        >
                          Biblioteca
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: IDENTIFICACIÓN & OFICIO */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <HardHat className="w-4 h-4" /> 2. Datos del Maestro Constructor
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Nombre Completo del Maestro *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMasterBuilder.name}
                      onChange={(e) =>
                        setEditingMasterBuilder({
                          ...editingMasterBuilder,
                          name: e.target.value,
                          slug: isNewProfile ? normalizeMasterBuilderToSlug(e.target.value) : editingMasterBuilder.slug,
                        })
                      }
                      placeholder="Ej: SEGUNDO GUANOLUISA"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded font-anton text-sm text-white focus:outline-hidden focus:border-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Rol Oficial en Obra *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMasterBuilder.rol}
                      onChange={(e) =>
                        setEditingMasterBuilder({
                          ...editingMasterBuilder,
                          rol: e.target.value,
                        })
                      }
                      placeholder="Ej: Maestro Mayor de Obra & Dirección Artesanal"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-xs text-white focus:outline-hidden focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Ubicación / Comuna / Región
                    </label>
                    <input
                      type="text"
                      value={editingMasterBuilder.location}
                      onChange={(e) =>
                        setEditingMasterBuilder({
                          ...editingMasterBuilder,
                          location: e.target.value,
                        })
                      }
                      placeholder="Ej: Rumipamba, Quito, Ecuador"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-xs text-white focus:outline-hidden focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-white/70 mb-1">
                      Años de Trayectoria
                    </label>
                    <input
                      type="text"
                      value={editingMasterBuilder.experienceYears || ''}
                      onChange={(e) =>
                        setEditingMasterBuilder({
                          ...editingMasterBuilder,
                          experienceYears: e.target.value,
                        })
                      }
                      placeholder="Ej: 35+ años"
                      className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-xs text-white focus:outline-hidden focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">
                    Oficio Principal & Destreza Constructiva *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMasterBuilder.oficio}
                    onChange={(e) =>
                      setEditingMasterBuilder({
                        ...editingMasterBuilder,
                        oficio: e.target.value,
                      })
                    }
                    placeholder="Ej: Cantería andina, cimentaciones ciclópeas y replanteo de niveles"
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-xs text-white focus:outline-hidden focus:border-white"
                  />
                </div>
              </div>

              {/* SECTION 3: TRAYECTORIA & RECONOCIMIENTO */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Award className="w-4 h-4" /> 3. Trayectoria Biográfica & Reconocimiento
                </h3>

                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">
                    Trayectoria y Experiencia en Obra
                  </label>
                  <textarea
                    rows={3}
                    value={editingMasterBuilder.trayectoria}
                    onChange={(e) =>
                      setEditingMasterBuilder({
                        ...editingMasterBuilder,
                        trayectoria: e.target.value,
                      })
                    }
                    placeholder="Describe la experiencia liderando cuadrillas de construcción y su dominio técnico..."
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-xs text-white focus:outline-hidden focus:border-white resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-white/70 mb-1">
                    Reconocimiento Editorial o Rol Clave
                  </label>
                  <textarea
                    rows={2}
                    value={editingMasterBuilder.reconocimiento}
                    onChange={(e) =>
                      setEditingMasterBuilder({
                        ...editingMasterBuilder,
                        reconocimiento: e.target.value,
                      })
                    }
                    placeholder="Ej: Coordinó la minga comunitaria y el levantamiento de los muros portantes de tierra y piedra."
                    className="w-full bg-black/50 border border-white/20 p-2.5 rounded text-xs text-white focus:outline-hidden focus:border-white resize-none"
                  />
                </div>
              </div>

              {/* SECTION 4: CUADRILLA BASE DE ARTESANOS */}
              <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-anton text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Users className="w-4 h-4" /> 4. Cuadrilla Base de Constructores & Artesanos
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const current = editingMasterBuilder.defaultMembers || [];
                      setEditingMasterBuilder({
                        ...editingMasterBuilder,
                        defaultMembers: [
                          ...current,
                          {
                            nombre: '',
                            rol: 'Maestro Albañil',
                            oficio: 'Mampostería tradicional',
                            especialidad: '',
                          },
                        ],
                      });
                    }}
                    className="px-2.5 py-1 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 rounded text-[10.5px] font-mono uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Agregar Miembro
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(editingMasterBuilder.defaultMembers || []).map((member, idx) => (
                    <div key={idx} className="p-3 bg-black/40 border border-white/10 rounded space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                          Artesano #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingMasterBuilder.defaultMembers || []).filter((_, i) => i !== idx);
                            setEditingMasterBuilder({
                              ...editingMasterBuilder,
                              defaultMembers: updated,
                            });
                          }}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          title="Eliminar miembro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={member.nombre}
                          onChange={(e) => {
                            const updated = [...(editingMasterBuilder.defaultMembers || [])];
                            updated[idx] = { ...updated[idx], nombre: e.target.value };
                            setEditingMasterBuilder({ ...editingMasterBuilder, defaultMembers: updated });
                          }}
                          placeholder="Nombre (ej. Carlos Toapanta)"
                          className="bg-[#242424] border border-white/20 p-1.5 rounded text-xs text-white"
                        />
                        <input
                          type="text"
                          value={member.rol}
                          onChange={(e) => {
                            const updated = [...(editingMasterBuilder.defaultMembers || [])];
                            updated[idx] = { ...updated[idx], rol: e.target.value };
                            setEditingMasterBuilder({ ...editingMasterBuilder, defaultMembers: updated });
                          }}
                          placeholder="Rol (ej. Maestro Albañil, Fierrero, Carpintero)"
                          className="bg-[#242424] border border-white/20 p-1.5 rounded text-xs text-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={member.oficio}
                        onChange={(e) => {
                          const updated = [...(editingMasterBuilder.defaultMembers || [])];
                          updated[idx] = { ...updated[idx], oficio: e.target.value };
                          setEditingMasterBuilder({ ...editingMasterBuilder, defaultMembers: updated });
                        }}
                        placeholder="Oficio / Especialidad (ej. Aparejos de piedra, Encofrados fenolíticos)"
                        className="w-full bg-[#242424] border border-white/20 p-1.5 rounded text-xs text-white"
                      />
                    </div>
                  ))}
                  {(!editingMasterBuilder.defaultMembers || editingMasterBuilder.defaultMembers.length === 0) && (
                    <p className="text-[11px] text-white/40 font-mono text-center py-2">
                      Sin miembros asignados. Pulsa &quot;Agregar Miembro&quot; para añadir a los albañiles, fierreros o carpinteros habituales.
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="bg-[#202020] border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl -mx-6 -mb-6 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingMasterBuilder(null)}
                  className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded text-xs font-anton tracking-wider uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-400 text-black hover:bg-amber-300 rounded text-xs font-anton tracking-wider uppercase flex items-center gap-2 font-bold cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>GUARDAR PERFIL DE MAESTRO MAYOR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. MEDIA LIBRARY MODAL INTEGRATION                                  */}
      {/* =================================================================== */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setMediaTargetField(null);
        }}
        onSelectImage={(media) => {
          if (mediaTargetField) {
            if (editingAuthor) {
              if (mediaTargetField === 'avatar') {
                setEditingAuthor({ ...editingAuthor, avatarUrl: media.url });
              } else {
                setEditingAuthor({ ...editingAuthor, coverImage: media.url });
              }
            } else if (editingPhotographer) {
              if (mediaTargetField === 'avatar') {
                setEditingPhotographer({ ...editingPhotographer, avatarUrl: media.url });
              } else {
                setEditingPhotographer({ ...editingPhotographer, coverImage: media.url });
              }
            } else if (editingMasterBuilder) {
              if (mediaTargetField === 'avatar') {
                setEditingMasterBuilder({ ...editingMasterBuilder, avatarUrl: media.url });
              } else {
                setEditingMasterBuilder({ ...editingMasterBuilder, coverImage: media.url });
              }
            }
          }
          setIsMediaModalOpen(false);
          setMediaTargetField(null);
        }}
      />

      {/* =================================================================== */}
      {/* 7. LIVE PUBLIC DOSSIER PREVIEWS                                     */}
      {/* =================================================================== */}
      {previewAuthorName && (
        <AuthorProfileModal
          studioName={previewAuthorName}
          isOpen={Boolean(previewAuthorName)}
          onClose={() => setPreviewAuthorName(null)}
          allProjects={allProjects}
        />
      )}

      {previewPhotographerName && (
        <PhotographerProfileModal
          photographerName={previewPhotographerName}
          isOpen={Boolean(previewPhotographerName)}
          onClose={() => setPreviewPhotographerName(null)}
          allProjects={allProjects}
        />
      )}
    </div>
  );
};

export default ProfilesManager;
