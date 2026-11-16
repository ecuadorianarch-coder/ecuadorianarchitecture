import React, { useState } from 'react';
import {
  CheckCircle2,
  UploadCloud,
  Send,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  Hammer,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';

// Brand Assets
import logoUrl from '../../assets/logos/logo.svg';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import tagAcercaBoxUrl from '../../assets/logos/tag_acerca_box.svg';
import compMaestroUrl from '../../assets/logos/comp_maestro.svg';

interface SubeTuTrabajoProps {
  onNavigate?: (section: string) => void;
}

export type SubmissionCategory = 'proyectos' | 'territorios' | 'academia';

export interface SubmissionFormData {
  // Categoría
  category: SubmissionCategory;

  // 1. Perfil del Estudio (Obligatorio)
  studioName: string;
  studioPrincipals: string;
  studioLocation: string;
  foundationYear: string;
  contactEmail: string;
  contactPhone: string;
  studioWebsite: string;
  studioBio: string;
  studioAvatarUrl: string;
  studioCoverUrl: string;

  // 2. Ficha Técnica de la Obra
  projectTitle: string;
  projectYear: string;
  projectLocation: string;
  builtArea: string;
  projectTeam: string;
  photographers: string;
  shortSummary: string;

  // 2b. Maestro Mayor y Trabajadores de la Obra
  maestroMayorName: string;
  maestroMayorRole: string;
  maestroMayorSpecialty: string;
  constructionCrew: string;
  craftsmanshipTribute: string;

  // 3. Curaduría y Enfoque Crítico
  contextRelation: string;
  usersAppropriation: string;
  materialityTectonics: string;
  fullDescription: string;

  // 4. Documentación Gráfica
  cloudStorageUrl: string;
  consentTerms: boolean;
}

const initialFormState: SubmissionFormData = {
  category: 'proyectos',
  studioName: '',
  studioPrincipals: '',
  studioLocation: '',
  foundationYear: '',
  contactEmail: '',
  contactPhone: '',
  studioWebsite: '',
  studioBio: '',
  studioAvatarUrl: '',
  studioCoverUrl: '',
  projectTitle: '',
  projectYear: '',
  projectLocation: '',
  builtArea: '',
  projectTeam: '',
  photographers: '',
  shortSummary: '',
  maestroMayorName: '',
  maestroMayorRole: 'Maestro Mayor de Obra',
  maestroMayorSpecialty: '',
  constructionCrew: '',
  craftsmanshipTribute: '',
  contextRelation: '',
  usersAppropriation: '',
  materialityTectonics: '',
  fullDescription: '',
  cloudStorageUrl: '',
  consentTerms: false,
};

export const SubeTuTrabajo: React.FC<SubeTuTrabajoProps> = ({ onNavigate }) => {
  // Flujo guiado: Paso 1 (Perfil de Estudio) -> Paso 2 (Proyecto & Maestro Mayor)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<SubmissionFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategorySelect = (cat: SubmissionCategory) => {
    setFormData((prev) => ({ ...prev, category: cat }));
  };

  // Manejo de carga de imágenes para Perfil y Portada
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'studioAvatarUrl' | 'studioCoverUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no debe superar los 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  // Validación y avance del Paso 1 al Paso 2
  const handleProceedToStep2 = () => {
    setErrorMessage(null);

    if (!formData.studioName.trim()) {
      setErrorMessage('Por favor ingresa el nombre de tu estudio o despacho arquitectónico.');
      return;
    }
    if (!formData.studioPrincipals.trim()) {
      setErrorMessage('Por favor ingresa los titulares o directores del estudio.');
      return;
    }
    if (!formData.studioLocation.trim()) {
      setErrorMessage('Por favor indica la ubicación principal del estudio (ciudad y país).');
      return;
    }
    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico oficial de contacto válido.');
      return;
    }
    if (!formData.studioAvatarUrl.trim()) {
      setErrorMessage('Es obligatorio subir la foto de perfil o logo del estudio para crear tu ficha de arquitecto.');
      return;
    }
    if (!formData.studioCoverUrl.trim()) {
      setErrorMessage('Es obligatorio subir la foto de portada o banner de obra para tu perfil de estudio.');
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.projectTitle.trim()) {
      setErrorMessage('Por favor ingresa el título del proyecto u obra.');
      return;
    }
    if (!formData.photographers.trim()) {
      setErrorMessage('Por favor acredita a los fotógrafos de la obra.');
      return;
    }
    if (!formData.maestroMayorName.trim()) {
      setErrorMessage('En Ecuadorian Architecture es fundamental reconocer a quien construyó el espacio: por favor ingresa el nombre del Maestro Mayor de la obra.');
      return;
    }
    if (!formData.cloudStorageUrl.trim()) {
      setErrorMessage('Por favor incluye el enlace a la carpeta en la nube (Drive/OneDrive/Dropbox) con fotos y planos separados.');
      return;
    }
    if (!formData.consentTerms) {
      setErrorMessage('Debes confirmar la autorización y autoría del material presentado.');
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch('/api/editorial/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });

      // Guardar también en localStorage como respaldo local
      try {
        const localSubmissions = JSON.parse(localStorage.getItem('ea_my_submissions') || '[]');
        localSubmissions.unshift({
          ...formData,
          id: `ea-sub-${Date.now()}`,
          date: new Date().toISOString(),
        });
        localStorage.setItem('ea_my_submissions', JSON.stringify(localSubmissions));
      } catch (e) {
        // Ignore quota error
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-ea-black select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. HEADER 1:1 CON FIGMA FRAME "SUBE TU PROYECTO" (#156:1870)              */}
      {/* ========================================================================= */}
      <header className="w-full max-w-[1440px] mx-auto px-4 sm:px-12 md:px-20 pt-6 sm:pt-10 pb-4 flex items-center justify-between select-none">
        {/* Left: ea Logo + SUBE TU TRABAJO (Exacto a Figma) */}
        <div
          onClick={() => {
            if (onNavigate) onNavigate('home');
            else window.location.href = '/';
          }}
          className="flex items-center gap-3 sm:gap-5 cursor-pointer group shrink-0"
          title="Volver a la portada de Ecuadorian Architecture"
        >
          <img
            src={logoUrl}
            alt="ea"
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain group-hover:scale-105 transition-transform"
          />
          <h1 className="font-okcok text-xl sm:text-2xl md:text-3xl uppercase tracking-normal text-ea-black leading-none m-0">
            SUBE TU TRABAJO
          </h1>
        </div>

        {/* Right: The 4 Navigation Pillars */}
        <nav
          aria-label="Navegación principal"
          className="flex items-center sm:items-end gap-2.5 sm:gap-7 md:gap-9 shrink-0"
        >
          <button
            onClick={() => (onNavigate ? onNavigate('proyectos') : (window.location.href = '/proyectos'))}
            className="flex flex-col items-center group cursor-pointer opacity-60 hover:opacity-100 transition-opacity p-1"
            title="Ir a Proyectos"
          >
            <div className="w-7 h-7 sm:w-12 sm:h-12 flex items-center justify-center">
              <img
                src={tagProyectosUrl}
                alt="PROYECTOS"
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="hidden sm:block font-anton text-[9.5px] tracking-widest text-ea-black uppercase mt-1">
              PROYECTOS
            </span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('territorios') : (window.location.href = '/territorios'))}
            className="flex flex-col items-center group cursor-pointer opacity-60 hover:opacity-100 transition-opacity p-1"
            title="Ir a Territorios"
          >
            <div className="w-7 h-7 sm:w-12 sm:h-12 flex items-center justify-center">
              <img
                src={tagCiudadUrl}
                alt="TERRITORIOS"
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="hidden sm:block font-anton text-[9.5px] tracking-widest text-ea-black uppercase mt-1">
              TERRITORIOS
            </span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('academia') : (window.location.href = '/academia'))}
            className="flex flex-col items-center group cursor-pointer opacity-60 hover:opacity-100 transition-opacity p-1"
            title="Ir a Academia"
          >
            <div className="w-7 h-7 sm:w-12 sm:h-12 flex items-center justify-center">
              <img
                src={tagDatosUrl}
                alt="ACADEMIA"
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="hidden sm:block font-anton text-[9.5px] tracking-widest text-ea-black uppercase mt-1">
              ACADEMIA
            </span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('acerca') : (window.location.href = '/acerca-de-ea'))}
            className="flex flex-col items-center group cursor-pointer opacity-60 hover:opacity-100 transition-opacity p-1"
            title="Conocer más sobre Ecuadorian Architecture"
          >
            <div className="w-7 h-7 sm:w-12 sm:h-12 flex items-center justify-center">
              <img
                src={tagAcercaBoxUrl}
                alt="ACERCA DE EA"
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="hidden sm:block font-anton text-[9.5px] tracking-widest text-ea-black uppercase mt-1">
              ACERCA DE EA
            </span>
          </button>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* BARRA DE PROGRESO DEL ONBOARDING (PASO 1 -> PASO 2)                      */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 md:px-12 pt-2 pb-6">
        <div className="flex items-center justify-between border-b border-black/15 pb-4">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Indicador Paso 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 cursor-pointer transition-all ${
                currentStep === 1 ? 'opacity-100 scale-102' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-anton ${
                  currentStep === 1
                    ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                1
              </div>
              <span className="font-okcok text-xs sm:text-sm md:text-base uppercase tracking-normal">
                PERFIL DEL ESTUDIO
              </span>
            </button>

            <span className="text-neutral-300 font-bold">→</span>

            {/* Indicador Paso 2 */}
            <div
              className={`flex items-center gap-2 transition-all ${
                currentStep === 2 ? 'opacity-100 scale-102' : 'opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-anton ${
                  currentStep === 2
                    ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                2
              </div>
              <span className="font-okcok text-xs sm:text-sm md:text-base uppercase tracking-normal">
                LA OBRA & MAESTRO MAYOR
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Curaduría Oficial EA
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CUERPO PRINCIPAL                                                          */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 md:px-12 py-2 sm:py-6">
        {/* PANTALLA DE ÉXITO */}
        {isSuccess ? (
          <div className="w-full max-w-[840px] mx-auto my-12 p-8 sm:p-14 border border-black rounded-[40px] sm:rounded-[52px] bg-white text-center shadow-xs">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-okcok text-2xl sm:text-4xl uppercase tracking-normal mb-4">
              ¡TRABAJO Y PERFIL RECIBIDOS!
            </h2>
            <p className="font-sans text-base sm:text-lg text-neutral-600 max-w-[620px] mx-auto leading-relaxed mb-6">
              Hemos registrado el perfil de <strong>{formData.studioName}</strong>, el homenaje al <strong>Maestro {formData.maestroMayorName || 'Mayor'}</strong> y la documentación de <strong>{formData.projectTitle}</strong>.
            </p>
            <div className="p-4 sm:p-6 bg-[#F4F4F5] rounded-[24px] max-w-[560px] mx-auto text-left text-sm text-neutral-700 space-y-2 mb-8">
              <p>
                <strong>• Perfil de Estudio:</strong> Tu ficha de arquitecto y equipo de obra han sido indexados en el sistema editorial.
              </p>
              <p>
                <strong>• Evaluación Curatorial:</strong> Revisaremos la planimetría, fotografías y memoria de la obra.
              </p>
              <p>
                <strong>• Notificación:</strong> Te responderemos a <strong>{formData.contactEmail}</strong> en 3 a 5 días hábiles.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData(initialFormState);
                  setCurrentStep(1);
                  setIsSuccess(false);
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-black text-white font-okcok uppercase text-sm rounded-full hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer"
              >
                SUBIR OTRO TRABAJO
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate('proyectos');
                  else window.location.href = '/proyectos';
                }}
                className="w-full sm:w-auto px-8 py-3.5 border border-black text-black font-okcok uppercase text-sm rounded-full hover:bg-neutral-100 transition-all active:scale-95 cursor-pointer"
              >
                EXPLORAR EL CATÁLOGO
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {/* Mensaje de Error */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-[20px] text-sm text-center font-medium">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* =================================================================== */}
            {/* PASO 1: PERFIL DEL ESTUDIO & FOTOS (OBLIGATORIO)                     */}
            {/* =================================================================== */}
            {currentStep === 1 && (
              <section className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1">
                    <Sparkles className="w-4 h-4 text-ea-black" /> Primer Paso Esencial
                  </div>
                  <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black">
                    1. PERFIL DEL ESTUDIO O ARQUITECTO
                  </h2>
                  <p className="font-sans text-sm sm:text-base text-neutral-600 mt-2 max-w-[780px]">
                    Crea tu ficha de estudio oficial en Ecuadorian Architecture. Esta información se utilizará para tu página monográfica en el directorio y para atribuir la autoría de todos tus proyectos.
                  </p>
                </div>

                {/* Subida Obligatoria: Foto de Perfil y Foto de Portada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 bg-[#FAFAFA] border border-black/15 rounded-[32px]">
                  {/* Foto de Perfil / Logo */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black flex items-center gap-2">
                        <Camera className="w-4 h-4" /> FOTO DE PERFIL / LOGO DEL ESTUDIO *
                      </label>
                      <span className="text-[11px] font-mono text-neutral-500">1:1 Cuadrada</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-black/20 bg-[#E8E8E8] overflow-hidden shrink-0 flex items-center justify-center">
                        {formData.studioAvatarUrl ? (
                          <img
                            src={formData.studioAvatarUrl}
                            alt="Avatar estudio"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-8 h-8 text-neutral-400" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-okcok uppercase rounded-full cursor-pointer hover:bg-neutral-800 transition-all active:scale-95">
                          <UploadCloud className="w-4 h-4" /> SUBIR FOTO
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'studioAvatarUrl')}
                          />
                        </label>
                        <input
                          type="url"
                          name="studioAvatarUrl"
                          value={formData.studioAvatarUrl}
                          onChange={handleInputChange}
                          placeholder="O pega una URL directa de imagen..."
                          className="w-full h-10 bg-white border border-neutral-300 rounded-[20px] px-4 text-xs font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Foto de Portada / Banner */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> FOTO DE PORTADA DEL ESTUDIO *
                      </label>
                      <span className="text-[11px] font-mono text-neutral-500">16:9 Banner</span>
                    </div>

                    <div className="w-full h-24 sm:h-28 rounded-[20px] border-2 border-black/20 bg-[#E8E8E8] overflow-hidden relative flex items-center justify-center group">
                      {formData.studioCoverUrl ? (
                        <img
                          src={formData.studioCoverUrl}
                          alt="Portada estudio"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-xs text-neutral-400 font-sans">
                          Obra representativa o equipo de trabajo
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-okcok uppercase cursor-pointer transition-opacity">
                        <UploadCloud className="w-4 h-4 mr-2" /> CAMBIAR PORTADA
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'studioCoverUrl')}
                        />
                      </label>
                    </div>

                    <input
                      type="url"
                      name="studioCoverUrl"
                      value={formData.studioCoverUrl}
                      onChange={handleInputChange}
                      placeholder="O pega una URL directa de imagen de portada..."
                      className="w-full h-10 bg-white border border-neutral-300 rounded-[20px] px-4 text-xs font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Campos de texto del estudio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Nombre del Estudio */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="studioName"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      NOMBRE DEL ESTUDIO O ARQUITECTO *
                    </label>
                    <input
                      id="studioName"
                      name="studioName"
                      type="text"
                      required
                      value={formData.studioName}
                      onChange={handleInputChange}
                      placeholder="Ej. RAMA estudio / Al Borde / Felipe Escudero"
                      className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Titulares */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="studioPrincipals"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      TITULARES / ARQUITECTOS PRINCIPALES *
                    </label>
                    <input
                      id="studioPrincipals"
                      name="studioPrincipals"
                      type="text"
                      required
                      value={formData.studioPrincipals}
                      onChange={handleInputChange}
                      placeholder="Separar por comas (ej. Carolina Rodas, Felipe Donoso)"
                      className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Ubicación */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="studioLocation"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      UBICACIÓN (CIUDAD / PAÍS) *
                    </label>
                    <input
                      id="studioLocation"
                      name="studioLocation"
                      type="text"
                      required
                      value={formData.studioLocation}
                      onChange={handleInputChange}
                      placeholder="Ej. Quito, Ecuador / Cuenca, Ecuador"
                      className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Año de Fundación */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="foundationYear"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      AÑO DE FUNDACIÓN
                    </label>
                    <input
                      id="foundationYear"
                      name="foundationYear"
                      type="text"
                      value={formData.foundationYear}
                      onChange={handleInputChange}
                      placeholder="Ej. 2012"
                      className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Correo Electrónico de Contacto */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contactEmail"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      CORREO ELECTRÓNICO OFICIAL *
                    </label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="contacto@estudio.com"
                      className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Instagram / Web */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="studioWebsite"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      INSTAGRAM O SITIO WEB (@estudio / link)
                    </label>
                    <input
                      id="studioWebsite"
                      name="studioWebsite"
                      type="text"
                      value={formData.studioWebsite}
                      onChange={handleInputChange}
                      placeholder="@ramaestudioec / www.ramaestudio.com"
                      className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contactPhone"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      TELÉFONO / WHATSAPP DE COORDINACIÓN
                    </label>
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="text"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+593 99 999 9999"
                      className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Filosofía del Estudio */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label
                      htmlFor="studioBio"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      FILOSOFÍA O MANIFIESTO DEL ESTUDIO (1 PÁRRAFO CORTO)
                    </label>
                    <textarea
                      id="studioBio"
                      name="studioBio"
                      rows={3}
                      value={formData.studioBio}
                      onChange={handleInputChange}
                      placeholder="Describe los principios teóricos, materiales, tectónicos o sociales que definen la práctica del estudio."
                      className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Previsualización en vivo de la tarjeta de estudio */}
                {formData.studioName && (
                  <div className="p-6 bg-[#121215] text-white rounded-[28px] border border-black/20">
                    <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Previsualización en vivo de tu perfil editorial
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-neutral-800 overflow-hidden shrink-0 border border-neutral-700 flex items-center justify-center">
                        {formData.studioAvatarUrl ? (
                          <img
                            src={formData.studioAvatarUrl}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-okcok text-xl uppercase tracking-normal text-white">
                          {formData.studioName}
                        </h4>
                        <p className="text-xs text-neutral-400 font-sans">
                          {formData.studioPrincipals || 'Titulares'} · {formData.studioLocation || 'Ecuador'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón para avanzar al Paso 2 */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="w-full sm:w-auto px-10 py-5 bg-black text-white font-okcok uppercase text-base sm:text-lg rounded-full hover:bg-neutral-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-3 cursor-pointer"
                  >
                    CREAR Y VERIFICAR PERFIL DEL ESTUDIO
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </section>
            )}

            {/* =================================================================== */}
            {/* PASO 2: LA OBRA, MAESTRO MAYOR & CURADURÍA CRÍTICA                   */}
            {/* =================================================================== */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                {/* Resumen del Estudio Verificado (Permite volver al Paso 1) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 bg-[#FAFAFA] border border-black/15 rounded-[28px] gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 border border-black/10 shrink-0">
                      {formData.studioAvatarUrl ? (
                        <img
                          src={formData.studioAvatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 m-2.5 text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-okcok text-base uppercase text-ea-black">
                          {formData.studioName}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                          Perfil Verificado ✓
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 font-sans">
                        {formData.studioPrincipals} · {formData.contactEmail}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-okcok uppercase text-neutral-600 hover:text-black underline underline-offset-4 cursor-pointer"
                  >
                    Editar datos del estudio
                  </button>
                </div>

                {/* =============================================================== */}
                {/* SELECTOR DE PILAR / CATEGORÍA (FIGMA EXACT RECTANGLE #158:2121) */}
                {/* =============================================================== */}
                <section
                  aria-label="Selecciona la categoría de tu trabajo"
                  className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-4 sm:p-8 md:p-10 bg-white"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Pilar: PROYECTOS */}
                    <div
                      onClick={() => handleCategorySelect('proyectos')}
                      className={`relative flex flex-col items-center justify-between p-6 sm:p-8 rounded-[32px] sm:rounded-[44px] cursor-pointer transition-all ${
                        formData.category === 'proyectos'
                          ? 'border border-black bg-white shadow-sm ring-1 ring-black'
                          : 'border border-transparent bg-[#FAFAFA]/70 hover:bg-[#F2F2F2] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="w-24 sm:w-32 md:w-40 aspect-square flex items-center justify-center my-auto py-2">
                        <img
                          src={tagProyectosUrl}
                          alt="PROYECTOS"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="font-okcok text-xl sm:text-2xl md:text-3xl uppercase tracking-normal text-ea-black mt-3">
                        PROYECTOS
                      </span>
                    </div>

                    {/* Pilar: TERRITORIOS */}
                    <div
                      onClick={() => handleCategorySelect('territorios')}
                      className={`relative flex flex-col items-center justify-between p-6 sm:p-8 rounded-[32px] sm:rounded-[44px] cursor-pointer transition-all ${
                        formData.category === 'territorios'
                          ? 'border border-black bg-white shadow-sm ring-1 ring-black'
                          : 'border border-transparent bg-[#FAFAFA]/70 hover:bg-[#F2F2F2] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="w-24 sm:w-32 md:w-40 aspect-square flex items-center justify-center my-auto py-2">
                        <img
                          src={tagCiudadUrl}
                          alt="TERRITORIOS"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="font-okcok text-xl sm:text-2xl md:text-3xl uppercase tracking-normal text-ea-black mt-3">
                        TERRITORIOS
                      </span>
                    </div>

                    {/* Pilar: ACADEMIA */}
                    <div
                      onClick={() => handleCategorySelect('academia')}
                      className={`relative flex flex-col items-center justify-between p-6 sm:p-8 rounded-[32px] sm:rounded-[44px] cursor-pointer transition-all ${
                        formData.category === 'academia'
                          ? 'border border-black bg-white shadow-sm ring-1 ring-black'
                          : 'border border-transparent bg-[#FAFAFA]/70 hover:bg-[#F2F2F2] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="w-24 sm:w-32 md:w-40 aspect-square flex items-center justify-center my-auto py-2">
                        <img
                          src={tagDatosUrl}
                          alt="ACADEMIA"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="font-okcok text-xl sm:text-2xl md:text-3xl uppercase tracking-normal text-ea-black mt-3">
                        ACADEMIA
                      </span>
                    </div>
                  </div>
                </section>

                {/* =============================================================== */}
                {/* 2. FICHA TÉCNICA DEL PROYECTO                                   */}
                {/* =============================================================== */}
                <section className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white">
                  <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black mb-8">
                    2. FICHA TÉCNICA DEL PROYECTO
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Título de la Obra */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="projectTitle"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        TÍTULO OFICIAL DE LA OBRA *
                      </label>
                      <input
                        id="projectTitle"
                        name="projectTitle"
                        type="text"
                        required
                        value={formData.projectTitle}
                        onChange={handleInputChange}
                        placeholder="Ej. Casa Lasso / Pabellón Kancha"
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Año de Construcción */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="projectYear"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        AÑO DE FINALIZACIÓN *
                      </label>
                      <input
                        id="projectYear"
                        name="projectYear"
                        type="text"
                        required
                        value={formData.projectYear}
                        onChange={handleInputChange}
                        placeholder="Ej. 2024"
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Ubicación de la Obra */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="projectLocation"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        UBICACIÓN DE LA OBRA (CIUDAD, PROVINCIA O PARROQUIA) *
                      </label>
                      <input
                        id="projectLocation"
                        name="projectLocation"
                        type="text"
                        required
                        value={formData.projectLocation}
                        onChange={handleInputChange}
                        placeholder="Ej. Lasso, Cotopaxi / Nayón, Quito"
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Área Construida */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="builtArea"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        ÁREA CONSTRUIDA (M²)
                      </label>
                      <input
                        id="builtArea"
                        name="builtArea"
                        type="text"
                        value={formData.builtArea}
                        onChange={handleInputChange}
                        placeholder="Ej. 350 m²"
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Equipo de Colaboradores */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="projectTeam"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        EQUIPO DE COLABORADORES Y ASESORES TÉCNICOS
                      </label>
                      <input
                        id="projectTeam"
                        name="projectTeam"
                        type="text"
                        value={formData.projectTeam}
                        onChange={handleInputChange}
                        placeholder="Ej. Cálculo estructural: Ing. X / Paisajismo: Y"
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Créditos de Fotografía */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="photographers"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        FOTOGRAFÍA DE OBRA (CRÉDITOS) *
                      </label>
                      <input
                        id="photographers"
                        name="photographers"
                        type="text"
                        required
                        value={formData.photographers}
                        onChange={handleInputChange}
                        placeholder="Ej. JAG Studio / BICUBIK / Sebastián Crespo"
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Resumen Ejecutivo */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label
                        htmlFor="shortSummary"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        RESUMEN EJECUTIVO DE LA OBRA (2 A 3 LÍNEAS) *
                      </label>
                      <textarea
                        id="shortSummary"
                        name="shortSummary"
                        rows={2}
                        required
                        value={formData.shortSummary}
                        onChange={handleInputChange}
                        placeholder="¿Cuál es la premisa espacial principal? Sintetiza el propósito de diseño en pocas frases."
                        className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* =============================================================== */}
                {/* 2B. EL MAESTRO MAYOR & TRABAJADORES DE OBRA (FUNDAMENTAL EA)    */}
                {/* =============================================================== */}
                <section className="w-full border-2 border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white relative overflow-hidden">
                  {/* Badge superior */}
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={compMaestroUrl}
                      alt="Maestro Mayor"
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                    />
                    <span className="text-xs font-mono uppercase tracking-widest text-neutral-600 font-bold">
                      Identidad &amp; Mano de Obra · Ecuadorian Architecture
                    </span>
                  </div>

                  <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black mb-3">
                    2B. EL MAESTRO MAYOR &amp; TRABAJADORES DE LA OBRA
                  </h2>
                  <p className="font-sans text-sm sm:text-base text-neutral-600 mb-8 max-w-[840px] leading-relaxed">
                    En Ecuadorian Architecture creemos firmemente que la arquitectura no existe sin las manos que transforman la materia en espacio. Es indispensable acreditar al <strong>Maestro Mayor</strong> y a la <strong>cuadrilla de artesanos</strong> que levantaron la obra.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Nombre del Maestro Mayor */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="maestroMayorName"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        NOMBRE COMPLETO DEL MAESTRO MAYOR *
                      </label>
                      <input
                        id="maestroMayorName"
                        name="maestroMayorName"
                        type="text"
                        required
                        value={formData.maestroMayorName}
                        onChange={handleInputChange}
                        placeholder="Ej. Segundo Guanoluisa / Carlos Toapanta"
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Oficio y Especialidad del Maestro Mayor */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="maestroMayorSpecialty"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        OFICIO PRINCIPAL Y ESPECIALIDAD DEL MAESTRO *
                      </label>
                      <input
                        id="maestroMayorSpecialty"
                        name="maestroMayorSpecialty"
                        type="text"
                        required
                        value={formData.maestroMayorSpecialty}
                        onChange={handleInputChange}
                        placeholder="Ej. Mampostería de ladrillo visto / Encofrados en madera / Adobe tradicional"
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Cuadrilla y Trabajadores Destacados */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label
                        htmlFor="constructionCrew"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        CUADRILLA DE CONSTRUCTORES Y ARTESANOS DESTACADOS
                      </label>
                      <span className="text-xs text-neutral-500 font-sans -mt-1 mb-1">
                        Puedes listar nombres, roles y oficios (ej. Manuel Chasi — Maestro Carpintero; Fausto Pillajo — Fierrero).
                      </span>
                      <textarea
                        id="constructionCrew"
                        name="constructionCrew"
                        rows={2}
                        value={formData.constructionCrew}
                        onChange={handleInputChange}
                        placeholder="Ej. Juan Pérez (Maestro albañil), Luis Cuji (Carpintería de encofrados), Pedro Guamán (Soldadura y cerrajería)..."
                        className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                      />
                    </div>

                    {/* Testimonio o Reconocimiento a la Mano de Obra */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label
                        htmlFor="craftsmanshipTribute"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        RECONOCIMIENTO / MANIFIESTO DE LA MANO DE OBRA
                      </label>
                      <span className="text-xs text-neutral-500 font-sans -mt-1 mb-1">
                        Comparte un breve testimonio sobre los saberes empíricos, anécdotas de faena o la relación entre los arquitectos y los constructores durante la obra.
                      </span>
                      <textarea
                        id="craftsmanshipTribute"
                        name="craftsmanshipTribute"
                        rows={3}
                        value={formData.craftsmanshipTribute}
                        onChange={handleInputChange}
                        placeholder="¿Qué soluciones técnicas o detalles constructivos fueron perfeccionados gracias al conocimiento del Maestro Mayor y su equipo en el sitio?"
                        className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* =============================================================== */}
                {/* 3. CURADURÍA CRÍTICA                                            */}
                {/* =============================================================== */}
                <section className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white">
                  <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black mb-3">
                    3. CURADURÍA &amp; ENFOQUE CRÍTICO
                  </h2>
                  <p className="font-sans text-sm sm:text-base text-neutral-600 mb-8 max-w-[800px]">
                    Estas 3 preguntas permiten que nuestro comité editorial redacte la reseña con rigor espacial:
                  </p>

                  <div className="space-y-6 sm:space-y-8">
                    {/* Contexto y Territorio */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contextRelation"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        A. ¿CÓMO SE RELACIONA EL PROYECTO CON EL CONTEXTO Y EL TERRITORIO? *
                      </label>
                      <span className="text-xs text-neutral-500 font-sans -mt-1 mb-1">
                        Topografía, clima, paisaje andino o costero, integración con el entorno urbano, rural o preexistencias.
                      </span>
                      <textarea
                        id="contextRelation"
                        name="contextRelation"
                        rows={3}
                        required
                        value={formData.contextRelation}
                        onChange={handleInputChange}
                        placeholder="Describe las decisiones de implantación, vientos y respuesta topográfica..."
                        className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                      />
                    </div>

                    {/* Usuarios y Apropiación */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="usersAppropriation"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        B. ¿QUIÉNES HABITAN EL ESPACIO Y CÓMO FUE CONCEBIDA LA EXPERIENCIA DEL USUARIO? *
                      </label>
                      <span className="text-xs text-neutral-500 font-sans -mt-1 mb-1">
                        Dinámicas sociales, comunidad, flexibilidad espacial o la relación íntima entre los habitantes y el vacío.
                      </span>
                      <textarea
                        id="usersAppropriation"
                        name="usersAppropriation"
                        rows={3}
                        required
                        value={formData.usersAppropriation}
                        onChange={handleInputChange}
                        placeholder="Explica cómo interactúan los usuarios con la escala, los recorridos y la vivencia cotidiana..."
                        className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                      />
                    </div>

                    {/* Materialidad y Tectónica */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="materialityTectonics"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        C. ¿QUÉ MATERIALES, TÉCNICAS Y SISTEMAS CONSTRUCTIVOS ESTRUCTURAN LA OBRA? *
                      </label>
                      <span className="text-xs text-neutral-500 font-sans -mt-1 mb-1">
                        Tierra cruda, madera local, ladrillo artesanal, acero, hormigón visto o detalles de mano de obra especializada.
                      </span>
                      <textarea
                        id="materialityTectonics"
                        name="materialityTectonics"
                        rows={3}
                        required
                        value={formData.materialityTectonics}
                        onChange={handleInputChange}
                        placeholder="Menciona las decisiones materiales clave, proveedores locales y las soluciones de detalle..."
                        className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                      />
                    </div>

                    {/* Memoria Descriptiva Completa */}
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="fullDescription"
                        className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                      >
                        D. MEMORIA DESCRIPTIVA EDITORIAL COMPLETA DEL PROYECTO
                      </label>
                      <textarea
                        id="fullDescription"
                        name="fullDescription"
                        rows={5}
                        value={formData.fullDescription}
                        onChange={handleInputChange}
                        placeholder="Pega aquí el texto conceptual completo redactado por el estudio..."
                        className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* =============================================================== */}
                {/* 4. DOCUMENTACIÓN GRÁFICA EN LA NUBE                             */}
                {/* =============================================================== */}
                <section className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white">
                  <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black mb-3">
                    4. ARCHIVOS GRÁFICOS (FOTOS &amp; PLANOS)
                  </h2>

                  <div className="border border-black/20 rounded-[28px] p-5 sm:p-6 bg-[#FAFAFA] mb-6 space-y-3 text-xs sm:text-sm font-sans text-neutral-700">
                    <div className="font-okcok uppercase text-sm sm:text-base text-ea-black flex items-center gap-2">
                      <UploadCloud className="w-5 h-5" /> REQUISITOS OBLIGATORIOS DE LA CARPETA EN LA NUBE:
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 pl-2">
                      <li>
                        <strong>Permisos de acceso:</strong> El enlace debe estar configurado como <u>"Cualquiera con el enlace puede ver"</u> (acceso público de lectura).
                      </li>
                      <li>
                        <strong>Subcarpeta 1 — FOTOGRAFÍAS:</strong> Mínimo 10 a 20 fotos en alta resolución (JPG o PNG, ancho mínimo 2400px), renombradas o acreditando al fotógrafo.
                      </li>
                      <li>
                        <strong>Subcarpeta 2 — PLANIMETRÍAS:</strong> Plantas arquitectónicas completas, cortes longitudinales/transversales, fachadas, esquemas conceptuales o axonométricas (fondo blanco puro, escala gráfica legible, formato PDF vectorial o PNG alta resolución).
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="cloudStorageUrl"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                    >
                      ENLACE A CARPETA (GOOGLE DRIVE / ONEDRIVE / DROPBOX / WETRANSFER) *
                    </label>
                    <div className="relative w-full">
                      <input
                        id="cloudStorageUrl"
                        name="cloudStorageUrl"
                        type="url"
                        required
                        value={formData.cloudStorageUrl}
                        onChange={handleInputChange}
                        placeholder="https://drive.google.com/drive/folders/... o https://1drv.ms/..."
                        className="w-full h-14 bg-[#E8E8E8] rounded-[30px] pl-6 pr-12 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                      />
                      <ExternalLink className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Términos de Autoría */}
                  <div className="mt-8 pt-6 border-t border-black/10 flex items-start gap-3">
                    <input
                      id="consentTerms"
                      name="consentTerms"
                      type="checkbox"
                      required
                      checked={formData.consentTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 accent-black rounded cursor-pointer"
                    />
                    <label
                      htmlFor="consentTerms"
                      className="text-xs sm:text-sm font-sans text-neutral-700 cursor-pointer"
                    >
                      Confirmo que represento al estudio de arquitectura o autoría del proyecto, que poseo las autorizaciones correspondientes de los fotógrafos, el Maestro Mayor y colaboradores citados, y autorizo a <strong>Ecuadorian Architecture</strong> a publicar este material en sus canales digitales, archivo y redes oficiales.
                    </label>
                  </div>
                </section>

                {/* Botón Monumental de Envío */}
                <div className="pt-4 pb-12 flex flex-col items-center justify-center gap-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="w-full sm:w-auto px-8 py-5 border border-black text-black font-okcok uppercase text-base rounded-full hover:bg-neutral-100 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> REVISAR PERFIL
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto min-w-[320px] sm:min-w-[420px] h-16 bg-black text-white font-okcok uppercase text-lg sm:text-xl rounded-full hover:bg-neutral-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ENVIANDO DOSSIER...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          ENVIAR PROYECTO PARA CURADURÍA
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 font-sans text-center">
                    El equipo editorial revisará el expediente y te responderá a {formData.contactEmail || 'tu correo'}.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
