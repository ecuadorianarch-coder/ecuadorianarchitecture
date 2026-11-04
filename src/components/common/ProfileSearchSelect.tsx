import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Plus,
  Building2,
  Camera,
  HardHat,
  Check,
  X,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { AuthorProfileData, normalizeStudioToSlug } from '../../data/authors';
import { PhotographerProfileData, normalizePhotographerToSlug } from '../../data/photographers';
import { MasterBuilderProfile, normalizeMasterBuilderToSlug } from '../../data/masterBuilders';

export type ProfileSelectType = 'author' | 'photographer' | 'masterBuilder';

export interface ProfileSearchSelectProps {
  type: ProfileSelectType;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const ProfileSearchSelect: React.FC<ProfileSearchSelectProps> = ({
  type,
  value,
  onChange,
  label,
  placeholder,
  helperText,
  required = false,
  className = '',
}) => {
  const {
    authors,
    photographers,
    masterBuilders,
    createAuthorProfile,
    createPhotographerProfile,
    createMasterBuilderProfile,
  } = useContent();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search query when incoming value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    const q = (query || '').trim().toLowerCase();

    if (type === 'author') {
      return authors
        .filter((a) => {
          if (!q) return true;
          return (
            a.name.toLowerCase().includes(q) ||
            a.founder.toLowerCase().includes(q) ||
            a.location.toLowerCase().includes(q)
          );
        })
        .slice(0, 8);
    }

    if (type === 'photographer') {
      return photographers
        .filter((p) => {
          if (!q) return true;
          return (
            p.name.toLowerCase().includes(q) ||
            p.lead.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q)
          );
        })
        .slice(0, 8);
    }

    // Master builder
    return masterBuilders
      .filter((m) => {
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.rol.toLowerCase().includes(q) ||
          m.oficio.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [type, authors, photographers, masterBuilders, query]);

  // Check if current typed query exactly matches any existing name
  const exactMatchExists = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return false;
    if (type === 'author') return authors.some((a) => a.name.toLowerCase() === q);
    if (type === 'photographer') return photographers.some((p) => p.name.toLowerCase() === q);
    return masterBuilders.some((m) => m.name.toLowerCase() === q);
  }, [type, authors, photographers, masterBuilders, query]);

  const handleSelect = (selectedName: string) => {
    setQuery(selectedName);
    onChange(selectedName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    onChange(newVal);
    setIsOpen(true);
  };

  // -------------------------------------------------------------
  // Quick Inline Creation Form State
  // -------------------------------------------------------------
  const [newName, setNewName] = useState('');
  const [newFounderOrRol, setNewFounderOrRol] = useState('');
  const [newLocation, setNewLocation] = useState('Quito, Ecuador');
  const [newYearOrExp, setNewYearOrExp] = useState(new Date().getFullYear().toString());
  const [newSpecialty, setNewSpecialty] = useState('');

  const openCreateModal = () => {
    const suggested = (query || '').trim();
    setNewName(suggested);
    if (type === 'author') {
      setNewFounderOrRol('');
      setNewYearOrExp('2020');
      setNewSpecialty('Arquitectura contemporánea y materialidad local');
    } else if (type === 'photographer') {
      setNewFounderOrRol(suggested ? `${suggested} / Fotografía` : '');
      setNewYearOrExp('2021');
      setNewSpecialty('Fotografía documental y atmósfera espacial');
    } else {
      setNewFounderOrRol('Maestro Mayor de Obra General');
      setNewYearOrExp('25+ años');
      setNewSpecialty('Estructuras de hormigón visto, cantería y replanteo de niveles');
    }
    setIsOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleSaveNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    if (!cleanName) return;

    if (type === 'author') {
      const slug = normalizeStudioToSlug(cleanName);
      const newAuthor: AuthorProfileData = {
        id: slug,
        name: cleanName.toUpperCase(),
        slug,
        founder: newFounderOrRol.trim() || cleanName,
        location: newLocation.trim() || 'Quito, Ecuador',
        country: 'Ecuador',
        foundedYear: newYearOrExp || '2020',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        headline: newSpecialty || 'Arquitectura contemporánea y compromiso con el territorio ecuatoriano.',
        description: `${cleanName} es un estudio de arquitectura enfocado en la práctica contemporánea, el desarrollo tectónico y la materialidad honesta en el Ecuador.`,
        philosophy: 'Construir desde la pertinencia matérica, el respeto a la geografía y el rigor espacial.',
        typologies: ['Arquitectura Residencial', 'Equipamiento'],
        team: [{ name: newFounderOrRol.trim() || cleanName, role: 'Arquitecto Principal' }],
        awards: [],
        contact: {
          website: '',
          instagram: `@${slug.replace(/-/g, '')}`,
          email: `contacto@${slug}.ec`,
        },
      };
      createAuthorProfile(newAuthor);
      handleSelect(newAuthor.name);
    } else if (type === 'photographer') {
      const slug = normalizePhotographerToSlug(cleanName);
      const newPhoto: PhotographerProfileData = {
        id: slug,
        name: cleanName.toUpperCase(),
        slug,
        lead: newFounderOrRol.trim() || cleanName,
        location: newLocation.trim() || 'Quito, Ecuador',
        country: 'Ecuador',
        foundedYear: newYearOrExp || '2021',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
        headline: newSpecialty || 'Fotografía de arquitectura contemporánea, luz cenital y geometría.',
        description: `Registro visual y narrativas espaciales desarrolladas por ${cleanName} en el territorio ecuatoriano.`,
        philosophy: 'Captar la relación íntima entre la luz ecuatorial, la materia desnuda y el silencio del espacio.',
        focus: ['Documentación Arquitectónica', 'Espacios Interiores', 'Materialidad'],
        publications: ['Ecuadorian Architecture Featured Partner'],
        contact: {
          website: '',
          instagram: `@${slug.replace(/-/g, '')}`,
          email: `info@${slug}.com`,
        },
      };
      createPhotographerProfile(newPhoto);
      handleSelect(newPhoto.name);
    } else {
      // Master builder
      const slug = normalizeMasterBuilderToSlug(cleanName);
      const newBuilder: MasterBuilderProfile = {
        id: slug,
        name: cleanName,
        slug,
        rol: newFounderOrRol.trim() || 'Maestro Mayor de Obra General',
        oficio: newSpecialty || 'Coordinación general de obra, replanteo y estructuras',
        location: newLocation.trim() || 'Quito, Ecuador',
        experienceYears: newYearOrExp || '20+ años',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
        trayectoria: `${newYearOrExp || 'Más de 20 años'} de trayectoria liderando cuadrillas de construcción y asegurando la calidad constructiva en el Ecuador.`,
        reconocimiento: 'Liderazgo directo en la coordinación de oficios tradicionales y faenas de obra.',
        specialties: newSpecialty ? newSpecialty.split(',').map((s) => s.trim()) : ['Dirección de obra', 'Estructuras'],
        defaultMembers: [
          {
            nombre: `${cleanName.split(' ')[0]} y Cuadrilla Local`,
            rol: 'Maestros Albañiles & Fierreros',
            oficio: newSpecialty || 'Mampostería, estructuras y acabados arquitectónicos',
          },
        ],
      };
      createMasterBuilderProfile(newBuilder);
      handleSelect(newBuilder.name);
    }

    setIsCreateModalOpen(false);
  };

  const getIcon = () => {
    if (type === 'author') return <Building2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (type === 'photographer') return <Camera className="w-3.5 h-3.5 text-cyan-400" />;
    return <HardHat className="w-3.5 h-3.5 text-amber-400" />;
  };

  const getTypeLabel = () => {
    if (type === 'author') return 'Arquitecto / Estudio';
    if (type === 'photographer') return 'Fotógrafo / Registro';
    return 'Maestro Mayor';
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            {getIcon()}
            <span>{label}</span>
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {type === 'author' ? 'Catálogo de Estudios' : type === 'photographer' ? 'Catálogo de Fotógrafos' : 'Mano de Obra & Maestros'}
          </span>
        </label>
      )}

      {/* Input container with icons */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (query.trim()) {
                handleSelect(query.trim().toUpperCase());
              }
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || `Buscar o escribir ${getTypeLabel()}...`}
          required={required}
          className="w-full bg-[#242424] border border-white/20 pl-8 pr-16 py-2 text-xs text-white uppercase focus:border-white focus:outline-none transition-colors"
        />
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
          <Search className="w-3.5 h-3.5" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onChange('');
                setIsOpen(true);
              }}
              className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Borrar texto"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {helperText && <p className="text-[10px] text-white/40 mt-1">{helperText}</p>}

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-white/20 shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-white/10">
          {/* Quick Option: Direct plain name without creating profile */}
          {query.trim().length > 0 && (
            <div className="p-2 bg-[#1f1f1f] border-b border-white/10">
              <button
                type="button"
                onClick={() => handleSelect(query.trim().toUpperCase())}
                className="w-full py-1.5 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs text-left flex items-center justify-between transition-colors cursor-pointer rounded-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    Usar solo texto: <strong className="text-white underline">{query.trim().toUpperCase()}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400/80 shrink-0 font-mono ml-2">
                  (Solo nombre, sin perfil)
                </span>
              </button>
            </div>
          )}
          {filteredItems.length > 0 ? (
            filteredItems.map((item: any) => {
              const itemName = item.name;
              const isSelected = (value || '').toLowerCase() === itemName.toLowerCase();
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(itemName)}
                  className={`w-full p-2.5 text-left flex items-center justify-between gap-3 hover:bg-white/10 transition-colors ${
                    isSelected ? 'bg-white/15 text-white' : 'text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={itemName}
                        className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        {getIcon()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-anton text-xs uppercase tracking-wider text-white truncate">
                        {itemName}
                      </div>
                      <div className="text-[10px] font-mono text-white/50 truncate flex items-center gap-2">
                        {type === 'author' && (
                          <span>{item.founder || item.location}</span>
                        )}
                        {type === 'photographer' && (
                          <span>{item.lead || item.location}</span>
                        )}
                        {type === 'masterBuilder' && (
                          <span>{item.rol} • {item.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/10 text-white/60 border border-white/15 uppercase">
                      Registrado
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-white/50 font-mono">
              No se encontró ningún perfil registrado para "{query}".
            </div>
          )}

          {/* Quick inline create button */}
          <div className="p-2 bg-[#141414]">
            <button
              type="button"
              onClick={openCreateModal}
              className="w-full py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-anton text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {query.trim()
                  ? `+ Crear perfil detallado: "${query.trim().toUpperCase()}" (opcional)`
                  : `+ Crear perfil detallado de ${getTypeLabel()} (opcional)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* QUICK INLINE CREATION MODAL */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#1a1a1a] border border-white/30 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {getIcon()}
                <h3 className="font-anton text-sm uppercase tracking-wider text-white">
                  CREAR PERFIL DE {getTypeLabel().toUpperCase()}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 font-sans">
              Este perfil quedará registrado en el catálogo del CMS y se asignará automáticamente a esta obra.
            </p>

            <form onSubmit={handleSaveNewProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/80 mb-1">
                  Nombre Oficial / Firma *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={
                    type === 'author'
                      ? 'ej. ESTUDIO FELIPE ESCUDERO'
                      : type === 'photographer'
                      ? 'ej. BICUBIK PHOTOGRAPHY'
                      : 'ej. SEGUNDO GUANOLUISA'
                  }
                  className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white uppercase focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/80 mb-1">
                    {type === 'author' ? 'Fundador / Titular' : type === 'photographer' ? 'Fotógrafo Principal' : 'Rol / Cargo'}
                  </label>
                  <input
                    type="text"
                    value={newFounderOrRol}
                    onChange={(e) => setNewFounderOrRol(e.target.value)}
                    placeholder={
                      type === 'author'
                        ? 'ej. Felipe Escudero'
                        : type === 'photographer'
                        ? 'ej. Mateo Soto'
                        : 'ej. Maestro Mayor de Obra General'
                    }
                    className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/80 mb-1">
                    {type === 'masterBuilder' ? 'Años de Trayectoria' : 'Año de Fundación'}
                  </label>
                  <input
                    type="text"
                    value={newYearOrExp}
                    onChange={(e) => setNewYearOrExp(e.target.value)}
                    placeholder={type === 'masterBuilder' ? 'ej. 30+ años' : 'ej. 2018'}
                    className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/80 mb-1">
                  Ubicación / Ciudad
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="ej. Quito, Ecuador o Cuenca, Ecuador"
                  className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/80 mb-1">
                  {type === 'masterBuilder' ? 'Oficio & Especialidades' : 'Enfoque / Especialidad Tectónica'}
                </label>
                <textarea
                  rows={2}
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder={
                    type === 'masterBuilder'
                      ? 'ej. Cantería andina, encofrados fenolíticos, cimentaciones y aparejos de piedra'
                      : 'ej. Arquitectura escultórica, vanguardia matérica y diálogo con la geografía andina.'
                  }
                  className="w-full bg-[#242424] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 text-xs font-mono uppercase text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-white/90 flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>GUARDAR Y ASIGNAR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
