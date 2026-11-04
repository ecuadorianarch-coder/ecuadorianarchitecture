import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Camera,
  HardHat,
  Plus,
  Trash2,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EditorialArticle, EditorialType } from '../../types/editorial';
import { ProfileSearchSelect } from '../../components/common/ProfileSearchSelect';
import { ConstructionTeamMember } from '../../data/constructionTeams';

interface NewArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newArticle: EditorialArticle) => void;
}

export const NewArticleModal: React.FC<NewArticleModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [selectedType, setSelectedType] = useState<EditorialType>('proyectos');
  const [title, setTitle] = useState('');
  const [studio, setStudio] = useState('');
  const [university, setUniversity] = useState('PUCE - FADA');
  const [rendersAuthor, setRendersAuthor] = useState('');
  const [location, setLocation] = useState('QUITO');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState('Edificación Colectiva');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Project specific: Photographer, Maestro Mayor and Construction Team
  const [photographer, setPhotographer] = useState('');
  const [maestroMayor, setMaestroMayor] = useState('');
  const [materialidadPrincipal, setMaterialidadPrincipal] = useState('Hormigón crudo y materiales locales');
  const [showTeamSection, setShowTeamSection] = useState(false);
  const [teamMembers, setTeamMembers] = useState<ConstructionTeamMember[]>([
    {
      nombre: 'Carlos Toapanta',
      rol: 'Maestro Albañil',
      oficio: 'Mampostería tradicional y aparejos de piedra vista',
      especialidad: 'Asentado de muros ciclópeos y morteros de cal apagada',
    },
    {
      nombre: 'Manuel Chasi',
      rol: 'Maestro Carpintero',
      oficio: 'Encofrados tradicionales y ensambles en madera bruta',
      especialidad: 'Vigas maestras de eucalipto y cubiertas a dos aguas',
    },
    {
      nombre: 'Fausto Pillajo',
      rol: 'Maestro Fierrero',
      oficio: 'Cimentaciones reforzadas y anclajes sismorresistentes',
      especialidad: 'Amarrado de hierro corrugado y zapatas corridas',
    },
  ]);

  const handleAddMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      {
        nombre: '',
        rol: 'Maestro Albañil / Artesano',
        oficio: 'Oficios tradicionales y acabados en obra',
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof ConstructionTeamMember, value: string) => {
    setTeamMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  if (!isOpen) return null;

  const handleTypeChange = (type: EditorialType) => {
    setSelectedType(type);
    setIsCustomCategory(false);
    setCustomCategory('');
    if (type === 'territorios') {
      setCategory('Morfología Urbana');
      setLocation('GUAYAS Y LITORAL');
    } else if (type === 'academia') {
      setCategory('Hábitat Colectivo y Densidad');
      setLocation('QUITO');
    } else {
      setCategory('Edificación Colectiva');
      setLocation('QUITO');
    }
  };

  const typologies =
    selectedType === 'territorios'
      ? [
          'Morfología Urbana',
          'Cuenca Hídrica y Paisaje',
          'Borde Fluvial y Costero',
          'Asentamientos y Hábitat Rural',
          'Cartografía Crítica',
          'Infraestructura Territorial',
          'Expansión Urbana y Periferias',
        ]
      : selectedType === 'academia'
      ? [
          'Hábitat Colectivo y Densidad',
          'Patrimonio y Memoria',
          'Vulnerabilidad Sísmica y Estructuras',
          'Urbanismo Crítico y Paisaje',
          'Materialidad Experimental y Tierra',
          'Tesis Universitaria / Licenciatura',
          'Investigación de Posgrado / Maestría',
        ]
      : [
          'Edificación Colectiva',
          'Vivienda Unifamiliar',
          'Edificio de Uso Mixto',
          'Espacio Público',
          'Equipamiento Cultural',
          'Equipamiento Social',
          'Arquitectura Efímera',
          'Arquitectura Comercial / Corporativa',
          'Intervención Patrimonial / Restauración',
          'Arquitectura del Paisaje',
        ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const slug = cleanTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const id = `${slug}-${Date.now().toString(36).substring(2, 6)}`;

    // Default hero image based on type
    const defaultHero =
      selectedType === 'proyectos'
        ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
        : selectedType === 'territorios'
        ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'
        : 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80';

    const isTerritorio = selectedType === 'territorios';
    const isAcademia = selectedType === 'academia';

    const primaryStudio =
      studio.trim().toUpperCase() ||
      (isTerritorio
        ? 'COLECTIVO TERRITORIAL'
        : isAcademia
        ? 'AUTOR / INVESTIGADOR'
        : 'ESTUDIO DE ARQUITECTURA');

    const finalCategory =
      isCustomCategory && customCategory.trim()
        ? customCategory.trim()
        : category ||
          (isTerritorio
            ? 'Morfología Urbana'
            : isAcademia
            ? 'Hábitat Colectivo y Densidad'
            : 'Edificación Colectiva');

    const cleanRenders = rendersAuthor.trim().toUpperCase();

    const newArticle: EditorialArticle = {
      id,
      slug,
      type: selectedType,
      title: cleanTitle.toUpperCase(),
      subtitle: isTerritorio
        ? 'EXPEDIENTE TERRITORIAL'
        : isAcademia
        ? 'INVESTIGACIÓN ACADÉMICA'
        : 'OBRA CONSTRUIDA',
      studio: primaryStudio,
      studios: [primaryStudio],
      critic: '',
      location: location.trim().toUpperCase() || (isTerritorio ? 'GUAYAS Y LITORAL' : 'QUITO'),
      year,
      excerpt: isTerritorio
        ? 'Expediente de investigación territorial: análisis de morfología, geografía, cuencas y dinámicas espaciales del territorio ecuatoriano.'
        : isAcademia
        ? 'Investigación académica y proyecto de titulación: un aporte crítico sobre la producción y el pensamiento arquitectónico en el Ecuador.'
        : 'Resumen editorial de la obra: una exploración sobre la materia, el vacío y la pertenencia geográfica en el contexto andino y ecuatoriano.',
      status: 'draft',
      featured: false,
      showOnLanding: false,
      landingTab: selectedType,
      actionButtonText:
        selectedType === 'territorios'
          ? 'VER TERRITORIO'
          : selectedType === 'academia'
          ? 'VER INVESTIGACIÓN'
          : 'VER PROYECTO',
      photographer: isTerritorio || isAcademia ? undefined : photographer.trim().toUpperCase() || undefined,
      maestroMayor: selectedType === 'proyectos' && maestroMayor.trim() ? maestroMayor.trim() : undefined,
      equipoTrabajo: selectedType === 'proyectos' && maestroMayor.trim() ? teamMembers : undefined,
      hasMaestroMayor: selectedType === 'proyectos' ? Boolean(maestroMayor.trim()) : false,
      enableAuthorModal: false,
      materialidadPrincipal: selectedType === 'proyectos' ? materialidadPrincipal.trim() : undefined,
      renders: isAcademia ? (cleanRenders || undefined) : undefined,
      escritoPor: 'Redacción Editorial EA',
      editadoPor: 'Dirección Editorial EA',
      superficie: selectedType === 'proyectos' ? '450 m²' : undefined,
      category: finalCategory,
      tags: ['Lugar', 'Materia', 'Ecuador'],
      heroImage: defaultHero,
      heroImageFocalPoint: 'center',
      resena: isTerritorio
        ? 'Texto analítico principal del expediente territorial...'
        : isAcademia
        ? 'Texto analítico principal de la investigación académica...'
        : 'Texto analítico principal de la reseña...',
      hasCritica: false,
      hasVisitas: selectedType === 'proyectos',
      critica: '',
      criticaHeadline: '',
      criticaQuote: '',
      criticaConclusion: '',
      hasPodcast: false,
      hasNotasComunidad: true,
      modules: [
        {
          id: `mod-intro-${Date.now()}`,
          type: 'hero-header',
          title: cleanTitle.toUpperCase(),
          subtitle:
            selectedType === 'proyectos'
              ? 'LECTURA ARQUITECTÓNICA'
              : selectedType === 'territorios'
              ? 'ANÁLISIS TERRITORIAL Y CARTOGRÁFICO'
              : 'MARCO TEÓRICO E INVESTIGACIÓN',
          content: isTerritorio
            ? 'Introducción crítica al expediente territorial y su contexto biogeográfico.'
            : isAcademia
            ? 'Planteamiento del problema, hipótesis y metodología de la investigación.'
            : 'Introducción crítica a la espacialidad y materialidad del proyecto.',
        },
        {
          id: `mod-text-${Date.now() + 1}`,
          type: 'rich-text',
          content: isTerritorio
            ? 'El presente expediente analiza las tensiones territoriales, los límites urbanos y las configuraciones espaciales en la región ecuatoriana seleccionada.'
            : isAcademia
            ? 'La investigación formula una interrogación crítica sobre las dinámicas constructivas y teóricas en el Ecuador contemporáneo.'
            : 'El proyecto plantea una profunda interrogación sobre las convenciones constructivas contemporáneas en el Ecuador, articulando tecnología local, economía de medios y sobriedad volumétrica.',
        },
        {
          id: `mod-quote-${Date.now() + 2}`,
          type: 'blockquote',
          quoteText: isTerritorio
            ? 'El territorio no es un soporte pasivo; es un sistema vivo de relaciones geográficas y sociales.'
            : isAcademia
            ? 'La investigación académica es el laboratorio donde se formula el futuro del hábitat colectivo.'
            : 'La arquitectura no es una forma aislada, sino una respuesta ética a la geografía y a los recursos disponibles.',
          quoteAuthor: primaryStudio,
        },
        {
          id: `mod-specs-${Date.now() + 3}`,
          type: 'technical-specs',
          title:
            isTerritorio
              ? 'FICHA TERRITORIAL'
              : isAcademia
              ? 'FICHA ACADÉMICA'
              : 'FICHA TÉCNICA',
          dataList: isTerritorio
            ? [
                { key: 'COLECTIVO', value: primaryStudio },
                { key: 'TERRITORIO', value: location.trim().toUpperCase() || 'ECUADOR' },
                { key: 'ESCALA', value: 'Regional / Cuenca' },
                { key: 'AÑO', value: year },
                { key: 'PROBLEMÁTICA', value: finalCategory },
              ]
            : isAcademia
            ? [
                { key: 'INVESTIGADOR', value: primaryStudio },
                { key: 'UNIVERSIDAD', value: university.trim().toUpperCase() || 'PUCE - FADA' },
                { key: 'SEDE', value: location.trim().toUpperCase() || 'QUITO' },
                { key: 'AÑO', value: year },
                { key: 'LÍNEA', value: finalCategory },
                ...(cleanRenders ? [{ key: 'RENDERS', value: cleanRenders }] : []),
              ]
            : [
                { key: 'ESTUDIO', value: primaryStudio },
                { key: 'LOCALIZACIÓN', value: location.trim().toUpperCase() },
                { key: 'AÑO', value: year },
                { key: 'ESTRUCTURA', value: 'Hormigón crudo y materiales locales' },
              ],
        },
      ],
      datos: {
        superficie: selectedType === 'proyectos' ? '450 m²' : undefined,
        estructura: selectedType === 'proyectos' ? materialidadPrincipal : undefined,
        fotografia: selectedType === 'proyectos' ? photographer.trim().toUpperCase() : undefined,
        maestroMayor: selectedType === 'proyectos' && maestroMayor.trim() ? maestroMayor.trim() : undefined,
        equipoTrabajo: selectedType === 'proyectos' && maestroMayor.trim() ? teamMembers : undefined,
        renders: isAcademia && cleanRenders ? cleanRenders : undefined,
        universidad: isAcademia ? university.trim().toUpperCase() : undefined,
        colaboradores: studio.trim() || (isTerritorio ? 'Equipo de Investigación Territorial' : 'Equipo de Proyecto'),
        certificacion: selectedType === 'proyectos' ? 'Eficiencia Bioclimática' : undefined,
      },
      constructionTeam: selectedType === 'proyectos' && maestroMayor.trim() ? {
        projectId: slug,
        projectTitle: cleanTitle.toUpperCase(),
        location: location.trim().toUpperCase() || 'QUITO',
        year,
        maestroMayor: {
          nombre: maestroMayor.trim(),
          rol: 'Maestro Mayor de Obra',
          oficio: materialidadPrincipal,
          trayectoria: 'Maestro constructor con amplia trayectoria en ejecución de obras tectónicas en el Ecuador.',
          reconocimiento: 'Lideró la cuadrilla de artesanos y constructores locales a cargo de la ejecución.',
        },
        members: teamMembers,
        materialidadPrincipal: materialidadPrincipal,
        manifiestoManoObra: 'La arquitectura no existe sin las manos de quienes transforman la materia en espacio. Rendimos tributo al conocimiento técnico, la destreza manual y la dignidad de los maestros constructores del Ecuador.',
      } : undefined,
      ciudad: {
        barrio: location.trim().toUpperCase(),
        altura: '2.850 msnm',
        orientacion: 'Norte-Sur',
        clima: isTerritorio ? 'Variable Territorial' : 'Ecuatorial Andino',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreate(newArticle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-inter text-white">
      <div className="w-full max-w-xl bg-[#161616] border border-white/20 shadow-2xl p-6 sm:p-8 relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-white/70 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>NUEVA PUBLICACIÓN EDITORIAL</span>
          </div>
          <h2 className="font-anton text-2xl sm:text-3xl uppercase tracking-wider text-white">
            CREAR {selectedType === 'territorios' ? 'EXPEDIENTE TERRITORIAL' : selectedType === 'academia' ? 'INVESTIGACIÓN ACADÉMICA' : 'RESEÑA DE PROYECTO'}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {selectedType === 'territorios'
              ? 'Crea un expediente territorial con métricas de cuenca, escalas y análisis geográfico.'
              : selectedType === 'academia'
              ? 'Publica una tesis o investigación universitaria con institución, autor y visualización/renders opcional.'
              : 'Publica una obra arquitectónica construida con ficha técnica completa y registro de visitas.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: SELECT EDITORIAL TYPE */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-2.5">
              1. Tipo de Entrada Editorial
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Proyectos */}
              <button
                type="button"
                onClick={() => handleTypeChange('proyectos')}
                className={`p-3.5 text-left border flex flex-col justify-between transition-all cursor-pointer ${
                  selectedType === 'proyectos'
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 bg-[#1f1f1f] text-white hover:border-white/40'
                }`}
              >
                <Building2 className="w-5 h-5 mb-2" />
                <div>
                  <div className="font-anton text-sm uppercase tracking-wider">PROYECTOS</div>
                  <div className={`text-[10px] leading-tight mt-1 ${selectedType === 'proyectos' ? 'text-black/70' : 'text-white/50'}`}>
                    Obras construidas, vivienda, espacio colectivo
                  </div>
                </div>
              </button>

              {/* Territorios */}
              <button
                type="button"
                onClick={() => handleTypeChange('territorios')}
                className={`p-3.5 text-left border flex flex-col justify-between transition-all cursor-pointer ${
                  selectedType === 'territorios'
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 bg-[#1f1f1f] text-white hover:border-white/40'
                }`}
              >
                <MapPin className="w-5 h-5 mb-2" />
                <div>
                  <div className="font-anton text-sm uppercase tracking-wider">TERRITORIOS</div>
                  <div className={`text-[10px] leading-tight mt-1 ${selectedType === 'territorios' ? 'text-black/70' : 'text-white/50'}`}>
                    Expedientes geográficos, cuencas, litoral
                  </div>
                </div>
              </button>

              {/* Academia */}
              <button
                type="button"
                onClick={() => handleTypeChange('academia')}
                className={`p-3.5 text-left border flex flex-col justify-between transition-all cursor-pointer ${
                  selectedType === 'academia'
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 bg-[#1f1f1f] text-white hover:border-white/40'
                }`}
              >
                <GraduationCap className="w-5 h-5 mb-2" />
                <div>
                  <div className="font-anton text-sm uppercase tracking-wider">ACADEMIA</div>
                  <div className={`text-[10px] leading-tight mt-1 ${selectedType === 'academia' ? 'text-black/70' : 'text-white/50'}`}>
                    Tesis universitarias, investigación crítica
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: BASIC INFO (TAILORED PER TYPE) */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                {selectedType === 'territorios'
                  ? 'Título del Expediente Territorial *'
                  : selectedType === 'academia'
                  ? 'Título de la Investigación / Tesis *'
                  : 'Título del Proyecto / Obra *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  selectedType === 'territorios'
                    ? 'ej. CIUDAD Y RÍO: CUENCA DEL GUAYAS'
                    : selectedType === 'academia'
                    ? 'ej. VIVIENDA PRODUCTIVA EN EL CENTRO HISTÓRICO'
                    : 'ej. CASA EN EL VALLE DE TUMBACO'
                }
                className="w-full bg-[#202020] border border-white/20 p-2.5 text-sm text-white font-medium focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <ProfileSearchSelect
                  type="author"
                  value={studio}
                  onChange={setStudio}
                  label={
                    selectedType === 'proyectos'
                      ? 'Arquitecto o Estudio Principal *'
                      : selectedType === 'territorios'
                      ? 'Colectivo o Equipo Territorial *'
                      : 'Autor(es) / Tesista(s) *'
                  }
                  placeholder={
                    selectedType === 'proyectos'
                      ? 'ej. RAMA ESTUDIO'
                      : selectedType === 'territorios'
                      ? 'ej. ESTUDIO URBANO LITORAL'
                      : 'ej. MATEO SÁNCHEZ'
                  }
                  helperText="Escribe el nombre o selecciona uno. No es obligatorio crear un perfil (solo con el nombre basta)."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                  {selectedType === 'territorios'
                    ? 'Territorio o Región (ej. GUAYAS Y LITORAL)'
                    : 'Ubicación (Ciudad / Cantón)'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={selectedType === 'territorios' ? 'ej. GUAYAS Y LITORAL' : 'ej. QUITO'}
                  className="w-full bg-[#202020] border border-white/20 p-2.5 text-xs text-white focus:outline-none focus:border-white uppercase"
                />
              </div>
            </div>

            {/* SECCIÓN ESPECIAL PARA PROYECTOS: FOTÓGRAFO & MAESTRO MAYOR (MANO DE OBRA) */}
            {selectedType === 'proyectos' && (
              <div className="space-y-3.5 p-3.5 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-anton text-xs uppercase tracking-wider border-b border-white/10 pb-2">
                  <HardHat className="w-4 h-4" />
                  <span>REGISTRO VISUAL & MANO DE OBRA (MAESTROS CONSTRUCTORES)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ProfileSearchSelect
                    type="photographer"
                    value={photographer}
                    onChange={setPhotographer}
                    label="Fotógrafo o Registro de Obra"
                    placeholder="ej. JAG STUDIO, BICUBIK (o deja vacío)"
                    helperText="Despliega fotógrafos o pulsa + para registrar uno nuevo."
                  />

                  <ProfileSearchSelect
                    type="masterBuilder"
                    value={maestroMayor}
                    onChange={setMaestroMayor}
                    label="Maestro Mayor de Obra Principal"
                    placeholder="ej. SEGUNDO GUANOLUISA (o deja vacío)"
                    helperText="Opcional: Si lo dejas vacío, no aparecerá en la web ni en la ficha técnica."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1">
                    Materialidad & Estructura Principal
                  </label>
                  <input
                    type="text"
                    value={materialidadPrincipal}
                    onChange={(e) => setMaterialidadPrincipal(e.target.value)}
                    placeholder="ej. Hormigón crudo, madera de eucalipto, cantería andina"
                    className="w-full bg-[#202020] border border-white/20 p-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                {/* Desplegable de Cuadrilla de Obra */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowTeamSection(!showTeamSection)}
                    className="w-full py-2 px-3 bg-[#181818] hover:bg-[#222] border border-white/15 text-xs font-anton tracking-wider uppercase text-amber-400 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>EQUIPO DE TRABAJO & CUADRILLA ({teamMembers.length} MAESTROS)</span>
                    </span>
                    {showTeamSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showTeamSection && (
                    <div className="mt-3 space-y-2.5 animate-in fade-in">
                      <p className="text-[10.5px] text-white/50 font-mono">
                        Reconoce el trabajo artesanal: agrega albañiles, fierreros, carpinteros o cuadrillas comunitarias a cargo de la ejecución.
                      </p>
                      {teamMembers.map((member, idx) => (
                        <div key={idx} className="p-2.5 bg-[#141414] border border-white/10 space-y-2 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                              #{idx + 1} {member.rol || 'Miembro de Cuadrilla'}
                            </span>
                            {teamMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(idx)}
                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                title="Eliminar miembro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={member.nombre}
                              onChange={(e) => handleMemberChange(idx, 'nombre', e.target.value)}
                              placeholder="Nombre del Maestro (ej. Carlos Toapanta)"
                              className="bg-[#202020] border border-white/20 p-1.5 text-xs text-white focus:border-white focus:outline-none"
                            />
                            <input
                              type="text"
                              value={member.rol}
                              onChange={(e) => handleMemberChange(idx, 'rol', e.target.value)}
                              placeholder="Rol (ej. Maestro Albañil, Maestro Fierrero)"
                              className="bg-[#202020] border border-white/20 p-1.5 text-xs text-white focus:border-white focus:outline-none"
                            />
                          </div>
                          <input
                            type="text"
                            value={member.oficio}
                            onChange={(e) => handleMemberChange(idx, 'oficio', e.target.value)}
                            placeholder="Oficio / Especialidad (ej. Mampostería, Encofrados fenolíticos)"
                            className="w-full bg-[#202020] border border-white/20 p-1.5 text-xs text-white focus:border-white focus:outline-none"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="w-full py-1.5 border border-dashed border-amber-400/40 text-amber-300 hover:bg-amber-400/10 text-xs font-mono uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ AGREGAR OTRO MAESTRO / ARTESANO</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Academia Specific: Universidad & Optional Renders */}
            {selectedType === 'academia' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/5 border border-white/10">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-white/80 mb-1">
                    Universidad / Facultad
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="ej. PUCE - FADA, USFQ, FAU UCE"
                    className="w-full bg-[#202020] border border-white/20 p-2 text-xs text-white uppercase focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-white/80 mb-1">
                    Autor de Renders / 3D (Opcional)
                  </label>
                  <input
                    type="text"
                    value={rendersAuthor}
                    onChange={(e) => setRendersAuthor(e.target.value)}
                    placeholder="ej. ESTUDIO VISUAL 3D (dejar vacío si no hay)"
                    className="w-full bg-[#202020] border border-white/20 p-2 text-xs text-white uppercase focus:outline-none focus:border-white"
                  />
                  <span className="text-[10px] text-white/40 block mt-0.5">
                    Opcional: Si se deja vacío, no aparecerá en la web.
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                {selectedType === 'territorios'
                  ? 'Año del Expediente'
                  : selectedType === 'academia'
                  ? 'Año de Defensa / Publicación'
                  : 'Año de Ejecución / Conclusión'}
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="ej. 2026"
                className="w-full bg-[#202020] border border-white/20 p-2.5 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            {/* Tipología / Categoría / Problemática */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60">
                  {selectedType === 'territorios'
                    ? 'Problemática / Eje Territorial *'
                    : selectedType === 'academia'
                    ? 'Línea de Investigación Académica *'
                    : 'Tipología del Proyecto *'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  {isCustomCategory ? '← Elegir de la lista' : '+ Escribir personalizada'}
                </button>
              </div>

              {!isCustomCategory ? (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCategory(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-[#202020] border border-white/20 p-2.5 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                >
                  {typologies.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value="__custom__" className="text-emerald-400 font-bold bg-[#1e1e1e]">
                    + Agregar otra tipología personalizada...
                  </option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="ej. Borde Fluvial, Vivienda Rural..."
                    className="flex-1 bg-[#202020] border border-emerald-400/70 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase cursor-pointer"
                  >
                    Listo
                  </button>
                </div>
              )}
              <p className="text-[10px] text-white/40 font-sans">
                Etiqueta que aparecerá a la derecha del título en la web (ej. "{isCustomCategory ? customCategory || 'Personalizada' : category}").
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-anton tracking-wider uppercase text-white/60 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="bg-white text-black hover:bg-white/90 disabled:bg-white/40 px-6 py-2.5 font-anton text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <span>INICIAR EDITOR VISUAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};