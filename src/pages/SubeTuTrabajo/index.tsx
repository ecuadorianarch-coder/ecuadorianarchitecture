import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  UploadCloud,
  Send,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Users,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  FileText,
  Wand2,
  Layers,
} from 'lucide-react';
import { studioAuthService } from '../../services/studioAuthService';
import { StudioProfileModal } from '../../components/studio/StudioProfileModal';

// Brand Assets
import logoUrl from '../../assets/logos/logo.svg';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import tagAcercaBoxUrl from '../../assets/logos/tag_acerca_box.svg';
import compMaestroUrl from '../../assets/logos/comp_maestro.svg';

interface SubeTuTrabajoProps {
  onNavigate?: (section: string) => void;
  initialStage?: 'landing' | 'proyecto';
}

export type SubmissionCategory = 'proyectos' | 'territorios' | 'academia';

export interface SubmissionFormData {
  // Categoría seleccionada en la landing
  category: SubmissionCategory;

  // 1. Perfil del Estudio (Landing exacto a Figma)
  studioName: string;
  studioPrincipals: string;
  studioLocation: string;
  foundationYear: string;
  contactEmail: string;
  studioPassword?: string;
  contactPhone: string;
  studioWebsite: string;
  studioBio: string;
  studioAvatarUrl: string;
  studioCoverUrl: string;

  // 2. Sube tu Proyecto — Ficha Técnica
  projectTitle: string;
  projectYear: string;
  projectLocation: string;
  builtArea: string;
  typology: string;
  projectTeam: string;
  photographers: string;
  shortSummary: string;

  // Maestro Mayor y Mano de Obra (dentro de la ficha técnica)
  maestroMayorName: string;
  maestroMayorSpecialty: string;
  constructionCrew: string;

  // 3. Curaduría y Enfoque Crítico
  contextRelation: string;
  usersAppropriation: string;
  materialityTectonics: string;
  fullDescription: string;

  // 4. Documentación Gráfica
  cloudStorageUrl: string;
  consentTerms: boolean;
}

export const TYPOLOGY_PRESETS = [
  'Vivienda Unifamiliar',
  'Vivienda Colectiva',
  'Equipamiento Cultural / Educativo',
  'Comercial & Mixto',
  'Pabellón / Efímero',
  'Rehabilitación & Patrimonio',
  'Paisaje & Espacio Público',
  'Arquitectura Sacra / Espiritual',
  'Infraestructura Territorial',
];

export const AREA_PRESETS = ['< 120 m²', '180 m²', '280 m²', '450 m²', '720 m²', '> 1200 m²'];

export const YEAR_PRESETS = ['2026', '2025', '2024', '2023', '2022', 'En Construcción'];

export const LOCATION_PRESETS = [
  'Quito, Pichincha',
  'Cumbayá / Tumbaco',
  'Guayaquil, Guayas',
  'Samborondón',
  'Cuenca, Azuay',
  'Manta, Manabí',
  'Loja',
  'Otavalo / Imbabura',
  'Galápagos',
];

export const PHOTO_PRESETS = [
  'BICUBIK Photography',
  'JAG Studio',
  'Sebastián Crespo',
  'Lorena Darquea',
  'Nicolás Provoste',
  'Fotografía del Estudio',
];

export function parseProjectMemory(rawText: string): Partial<SubmissionFormData> {
  const result: Partial<SubmissionFormData> = {};
  if (!rawText || !rawText.trim()) return result;

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Título de la obra
  const titleMatch = rawText.match(/(?:proyecto|obra|título|titulo|nombre(?:\s+de\s+la\s+obra)?)\s*[:\-–]\s*([^\n\r]+)/i);
  if (titleMatch) {
    result.projectTitle = titleMatch[1].trim();
  } else if (lines.length > 0 && lines[0].length < 60 && !lines[0].includes(':')) {
    result.projectTitle = lines[0].replace(/^[#\*\-]+\s*/, '').trim();
  }

  // 2. Año de finalización
  const yearMatch =
    rawText.match(/(?:año(?:\s+de\s+construcción|\s+de\s+finalización)?|fecha|year)\s*[:\-–]?\s*(20\d{2})/i) ||
    rawText.match(/\b(20[12]\d)\b/);
  if (yearMatch) {
    result.projectYear = yearMatch[1];
  }

  // 3. Ubicación
  const locMatch = rawText.match(/(?:ubicación|ubicacion|lugar|ciudad|emplazamiento|location)\s*[:\-–]\s*([^\n\r,]+(?:,\s*[^\n\r]+)?)/i);
  if (locMatch) {
    result.projectLocation = locMatch[1].trim();
  }

  // 4. Área construida / m²
  const areaMatch =
    rawText.match(/(?:área(?:\s+construida|\s+útil)?|area|superficie|m2|m²)\s*[:\-–]?\s*(\d+[\.,]?\d*)\s*(?:m2|m²|metros\s*cuadrados)?/i) ||
    rawText.match(/(\d+[\.,]?\d*)\s*(?:m2|m²)/i);
  if (areaMatch) {
    result.builtArea = `${areaMatch[1].trim()} m²`;
  }

  // 5. Tipología
  const typMatch = rawText.match(/(?:tipología|tipologia|programa|uso|categoría)\s*[:\-–]\s*([^\n\r]+)/i);
  if (typMatch) {
    result.typology = typMatch[1].trim();
  } else {
    const lower = rawText.toLowerCase();
    if (lower.includes('unifamiliar') || lower.includes('casa') || lower.includes('vivienda individual')) {
      result.typology = 'Vivienda Unifamiliar';
    } else if (lower.includes('colectiva') || lower.includes('edificio residencial') || lower.includes('departamentos')) {
      result.typology = 'Vivienda Colectiva';
    } else if (lower.includes('cultural') || lower.includes('museo') || lower.includes('centro cultural') || lower.includes('educativo') || lower.includes('escuela')) {
      result.typology = 'Equipamiento Cultural / Educativo';
    } else if (lower.includes('comercial') || lower.includes('oficinas') || lower.includes('restaurante') || lower.includes('café')) {
      result.typology = 'Comercial & Mixto';
    } else if (lower.includes('pabellón') || lower.includes('pabellon') || lower.includes('efímero') || lower.includes('instalación')) {
      result.typology = 'Pabellón / Efímero';
    } else if (lower.includes('rehabilitación') || lower.includes('rehabilitacion') || lower.includes('patrimonio') || lower.includes('restauración') || lower.includes('reforma')) {
      result.typology = 'Rehabilitación & Patrimonio';
    } else if (lower.includes('paisaje') || lower.includes('parque') || lower.includes('espacio público') || lower.includes('plaza')) {
      result.typology = 'Paisaje & Espacio Público';
    } else if (lower.includes('capilla') || lower.includes('templo') || lower.includes('iglesia') || lower.includes('sacro') || lower.includes('espiritual')) {
      result.typology = 'Arquitectura Sacra / Espiritual';
    }
  }

  // 6. Fotografía
  const photoMatch = rawText.match(/(?:fotograf[ií]a|fot[oó]grafo|fotos|photos?)\s*[:\-–]\s*([^\n\r]+)/i);
  if (photoMatch) {
    result.photographers = photoMatch[1].trim();
  }

  // 7. Maestro Mayor y Mano de Obra
  const maestroMatch = rawText.match(/(?:maestro(?:\s+mayor)?|constructor|ejecución|mano\s+de\s+obra)\s*[:\-–]\s*([^\n\r]+)/i);
  if (maestroMatch) {
    result.maestroMayorName = maestroMatch[1].trim();
  }

  // 8. Equipo de colaboradores
  const teamMatch = rawText.match(/(?:equipo|colaboradores|asesores|arquitectos\s+colaboradores)\s*[:\-–]\s*([^\n\r]+)/i);
  if (teamMatch) {
    result.projectTeam = teamMatch[1].trim();
  }

  // 9. Materialidad / Tectónica
  const matMatch = rawText.match(/(?:materiales|materialidad|tect[oó]nica|estructura)\s*[:\-–]\s*([^\n\r]+(?:\n[^\n\r]+)?)/i);
  if (matMatch) {
    result.materialityTectonics = matMatch[1].trim();
  }

  // 10. Memoria y Resumen
  const memMatch = rawText.match(/(?:memoria(?:\s+descriptiva|\s+del\s+proyecto)?|descripci[oó]n|concepto)\s*[:\-–]\s*([\s\S]+?)(?=(?:materiales|fotograf|equipo|ubicaci|área|$))/i);
  if (memMatch && memMatch[1].trim().length > 30) {
    const full = memMatch[1].trim();
    result.fullDescription = full;
    const firstSentences = full.split('. ').slice(0, 2).join('. ') + '.';
    result.shortSummary = firstSentences.length < 250 ? firstSentences : full.slice(0, 240) + '...';
  } else {
    const paragraphs = rawText.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 50 && !p.includes(':'));
    if (paragraphs.length > 0) {
      result.fullDescription = paragraphs.join('\n\n');
      result.shortSummary = paragraphs[0].slice(0, 240);
    }
  }

  // 11. Carpeta en la nube (Drive/Dropbox/OneDrive/Wetransfer)
  const driveMatch = rawText.match(/(https?:\/\/(?:drive\.google\.com|dropbox\.com|we\.tl|onedrive\.live\.com)[^\s]+)/i);
  if (driveMatch) {
    result.cloudStorageUrl = driveMatch[1].trim();
  }

  return result;
}

const initialFormState: SubmissionFormData = {
  category: 'proyectos',
  studioName: '',
  studioPrincipals: '',
  studioLocation: '',
  foundationYear: '',
  contactEmail: '',
  studioPassword: '',
  contactPhone: '',
  studioWebsite: '',
  studioBio: '',
  studioAvatarUrl: '',
  studioCoverUrl: '',
  projectTitle: '',
  projectYear: '',
  projectLocation: '',
  builtArea: '',
  typology: '',
  projectTeam: '',
  photographers: '',
  shortSummary: '',
  maestroMayorName: '',
  maestroMayorSpecialty: '',
  constructionCrew: '',
  contextRelation: '',
  usersAppropriation: '',
  materialityTectonics: '',
  fullDescription: '',
  cloudStorageUrl: '',
  consentTerms: false,
};

export const SubeTuTrabajo: React.FC<SubeTuTrabajoProps> = ({
  onNavigate,
  initialStage = 'landing',
}) => {
  // 'landing' = Vista exacta de Figma (#156:1870) con Selector + 1. Perfil del Estudio
  // 'proyecto' = Segunda etapa: SUBE TU PROYECTO (Ficha Técnica + Curaduría + Fotos/Planos)
  const [stage, setStage] = useState<'landing' | 'proyecto'>(initialStage);
  const [formData, setFormData] = useState<SubmissionFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  // Pre-poblar datos de estudio si ya está autenticado
  useEffect(() => {
    const existing = studioAuthService.getStudio();
    if (existing) {
      setFormData((prev) => ({
        ...prev,
        studioName: prev.studioName || existing.studioName,
        studioPrincipals: prev.studioPrincipals || existing.studioPrincipals,
        studioLocation: prev.studioLocation || existing.studioLocation,
        foundationYear: prev.foundationYear || existing.foundationYear,
        contactEmail: prev.contactEmail || existing.email,
        contactPhone: prev.contactPhone || existing.phone || '',
        studioWebsite: prev.studioWebsite || existing.studioWebsite,
        studioBio: prev.studioBio || existing.description || existing.philosophy || '',
        studioAvatarUrl: prev.studioAvatarUrl || existing.studioAvatarUrl,
        studioCoverUrl: prev.studioCoverUrl || existing.studioCoverUrl,
        // Valores iniciales inteligentes para la ficha técnica del proyecto
        projectLocation: prev.projectLocation || existing.studioLocation || '',
        projectTeam: prev.projectTeam || existing.studioPrincipals || '',
        typology: prev.typology || (existing.typologies && existing.typologies.length ? existing.typologies[0] : ''),
      }));
    }
  }, []);

  const [memoryInput, setMemoryInput] = useState('');
  const [extractedFeedback, setExtractedFeedback] = useState<string | null>(null);

  const handleExtractMemory = () => {
    if (!memoryInput.trim()) {
      setExtractedFeedback('⚠️ Pega el texto de la memoria o ficha técnica primero.');
      return;
    }

    const parsed = parseProjectMemory(memoryInput);
    let count = 0;
    setFormData((prev) => {
      const next = { ...prev };
      if (parsed.projectTitle) { next.projectTitle = parsed.projectTitle; count++; }
      if (parsed.projectYear) { next.projectYear = parsed.projectYear; count++; }
      if (parsed.projectLocation) { next.projectLocation = parsed.projectLocation; count++; }
      if (parsed.builtArea) { next.builtArea = parsed.builtArea; count++; }
      if (parsed.typology) { next.typology = parsed.typology; count++; }
      if (parsed.photographers) { next.photographers = parsed.photographers; count++; }
      if (parsed.projectTeam) { next.projectTeam = parsed.projectTeam; count++; }
      if (parsed.maestroMayorName) { next.maestroMayorName = parsed.maestroMayorName; count++; }
      if (parsed.shortSummary) { next.shortSummary = parsed.shortSummary; count++; }
      if (parsed.fullDescription) { next.fullDescription = parsed.fullDescription; count++; }
      if (parsed.materialityTectonics) { next.materialityTectonics = parsed.materialityTectonics; count++; }
      if (parsed.cloudStorageUrl) { next.cloudStorageUrl = parsed.cloudStorageUrl; count++; }
      return next;
    });

    setExtractedFeedback(`✓ ¡Éxito! ${count} campos extraídos y completados automáticamente.`);
  };

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

  // Validar y avanzar de la Landing al Formulario de Proyecto
  const handleProceedToProject = () => {
    setErrorMessage(null);

    if (!formData.studioName.trim()) {
      setErrorMessage('Por favor ingresa el nombre de tu estudio o despacho arquitectónico.');
      return;
    }
    if (!formData.studioPrincipals.trim()) {
      setErrorMessage('Por favor ingresa los titulares del estudio.');
      return;
    }
    if (!formData.studioLocation.trim()) {
      setErrorMessage('Por favor indica la ubicación del estudio (ciudad y país).');
      return;
    }
    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
      setErrorMessage('Por favor ingresa un correo de contacto oficial.');
      return;
    }

    const isAlreadyLoggedIn = studioAuthService.isAuthenticated();
    if (!isAlreadyLoggedIn && (!formData.studioPassword || formData.studioPassword.length < 6)) {
      setErrorMessage('Por favor define una contraseña de al menos 6 caracteres para proteger tu perfil y consultar el estatus de tu obra.');
      return;
    }

    setStage('proyecto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.projectTitle.trim()) {
      setErrorMessage('Por favor ingresa el título oficial del proyecto.');
      return;
    }
    if (!formData.photographers.trim()) {
      setErrorMessage('Por favor ingresa los créditos de fotografía.');
      return;
    }
    if (!formData.cloudStorageUrl.trim()) {
      setErrorMessage('Por favor incluye el enlace a la carpeta con fotos y planimetrías en la nube.');
      return;
    }
    if (!formData.consentTerms) {
      setErrorMessage('Debes confirmar los términos de autoría y publicación.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/editorial/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('El servidor no devolvió una respuesta válida al enviar tu propuesta.');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo registrar la propuesta en el servidor.');
      }

      if (data.token && data.studio) {
        studioAuthService.setSession(data.token, data.studio);
      }

      // Guardar respaldo local
      try {
        const local = JSON.parse(localStorage.getItem('ea_my_submissions') || '[]');
        local.unshift({
          ...formData,
          id: data.id || `ea-sub-${Date.now()}`,
          date: new Date().toISOString(),
        });
        localStorage.setItem('ea_my_submissions', JSON.stringify(local));
      } catch (e) {
        // Ignore quota error
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al enviar la propuesta.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-ea-black select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. HEADER 1:1 CON FIGMA FRAME "SUBE TU PROYECTO" (#156:1870)              */}
      {/* Izquierda: Logo ea + Título dinámico (SUBE TU TRABAJO o SUBE TU PROYECTO) */}
      {/* ========================================================================= */}
      <header className="w-full max-w-[1440px] mx-auto px-4 sm:px-12 md:px-20 pt-6 sm:pt-10 pb-4 flex items-center justify-between select-none">
        {/* Left: ea Logo + Title */}
        <div
          onClick={() => {
            if (stage === 'proyecto') {
              setStage('landing');
            } else if (onNavigate) {
              onNavigate('home');
            } else {
              window.location.href = '/';
            }
          }}
          className="flex items-center gap-3 sm:gap-5 cursor-pointer group shrink-0"
          title={stage === 'proyecto' ? 'Volver al paso anterior' : 'Volver al inicio'}
        >
          <img
            src={logoUrl}
            alt="ea"
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain group-hover:scale-105 transition-transform"
          />
          <h1 className="font-okcok text-xl sm:text-2xl md:text-3xl uppercase tracking-normal text-ea-black leading-none m-0">
            {stage === 'landing'
              ? 'SUBE TU TRABAJO'
              : formData.category === 'territorios'
              ? 'SUBE TU TERRITORIO'
              : formData.category === 'academia'
              ? 'SUBE TU INVESTIGACIÓN'
              : 'SUBE TU PROYECTO'}
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
      {/* CUERPO PRINCIPAL                                                          */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 md:px-12 py-4 sm:py-8">
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
              Hemos registrado el proyecto <strong>{formData.projectTitle}</strong> y el perfil del estudio <strong>{formData.studioName}</strong>.
            </p>
            <div className="p-4 sm:p-6 bg-[#F4F4F5] rounded-[24px] max-w-[560px] mx-auto text-left text-sm text-neutral-700 space-y-2 mb-8">
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
                onClick={() => setIsStudioModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-ea-crimson text-white font-okcok uppercase text-sm rounded-full hover:bg-black transition-all active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                VER ESTATUS EN MI PERFIL DE ESTUDIO →
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(initialFormState);
                  setStage('landing');
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
        ) : stage === 'landing' ? (
          /* ===================================================================== */
          /* LANDING DE ATERRIZAJE: 1:1 CON FIGMA (#156:1870)                      */
          /* 1. Selector de Categoría (PROYECTOS / TERRITORIOS / ACADEMIA)          */
          /* 2. Caja 1: PERFIL DEL ESTUDIO (Campos de Figma + foto/portada)        */
          /* ===================================================================== */
          <div className="space-y-8 sm:space-y-10">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-[20px] text-sm text-center font-medium">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* CAJA 1 FIGMA: SELECTOR DE PILAR (RECTANGLE #158:2121) */}
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
                  <div className="w-28 sm:w-36 md:w-44 aspect-square flex items-center justify-center my-auto py-2">
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
                  <div className="w-28 sm:w-36 md:w-44 aspect-square flex items-center justify-center my-auto py-2">
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
                  <div className="w-28 sm:w-36 md:w-44 aspect-square flex items-center justify-center my-auto py-2">
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

            {/* CAJA 2 FIGMA: 1. PERFIL DEL ESTUDIO (RECTANGLE #158:2123) */}
            <section className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black">
                  1. PERFIL DEL ESTUDIO
                </h2>
                {studioAuthService.isAuthenticated() && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-300 rounded-full text-xs font-mono text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sesión de estudio activa ✓</span>
                    <button
                      type="button"
                      onClick={() => setIsStudioModalOpen(true)}
                      className="underline font-bold hover:text-black ml-1 cursor-pointer"
                    >
                      Ver mi perfil
                    </button>
                  </div>
                )}
              </div>

              {studioAuthService.isAuthenticated() && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-emerald-50 border-2 border-emerald-500/40 rounded-[28px] gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-emerald-500/40 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                      {formData.studioAvatarUrl ? (
                        <img src={formData.studioAvatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-okcok text-emerald-800 text-sm font-bold">{(formData.studioName || 'A')[0]}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-okcok text-sm sm:text-base uppercase text-ea-black">
                          {formData.studioName || 'Estudio Conectado'}
                        </span>
                        <span className="font-mono text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                          VINCULADO ✓
                        </span>
                      </div>
                      <p className="text-xs text-emerald-900/70 font-sans">
                        Perfil cargado. Puedes editar los campos abajo o avanzar directo a subir tu proyecto.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleProceedToProject}
                    className="w-full sm:w-auto px-6 py-3 bg-ea-black text-white font-okcok uppercase text-xs sm:text-sm rounded-full hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
                  >
                    CONTINUAR DIRECTO AL PROYECTO ➔
                  </button>
                </div>
              )}

              {/* Los campos de Figma en cuadrícula 2x2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* 1. Nombre del Estudio o Arquitecto */}
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
                    placeholder=""
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                </div>

                {/* 2. Titulares */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="studioPrincipals"
                    className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                  >
                    TITULARES (SEPARAR POR COMA) *
                  </label>
                  <input
                    id="studioPrincipals"
                    name="studioPrincipals"
                    type="text"
                    required
                    value={formData.studioPrincipals}
                    onChange={handleInputChange}
                    placeholder=""
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                </div>

                {/* 3. Ubicación */}
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
                    placeholder=""
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                </div>

                {/* 4. Año de Fundación */}
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
                    placeholder=""
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                </div>

                {/* Correo Electrónico Oficial */}
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

                {/* Contraseña para proteger el perfil y consultar estatus */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="studioPassword"
                      className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black flex items-center gap-1.5"
                    >
                      <Lock className="w-4 h-4 text-neutral-500" /> CREAR CONTRASEÑA *
                    </label>
                    <span className="text-[11px] font-mono text-neutral-500">Mínimo 6 caracteres</span>
                  </div>
                  <div className="relative">
                    <input
                      id="studioPassword"
                      name="studioPassword"
                      type={showPassword ? 'text' : 'password'}
                      required={!studioAuthService.isAuthenticated()}
                      disabled={studioAuthService.isAuthenticated()}
                      value={studioAuthService.isAuthenticated() ? '••••••••••••' : (formData.studioPassword || '')}
                      onChange={handleInputChange}
                      placeholder={studioAuthService.isAuthenticated() ? 'Perfil ya vinculado' : 'Contraseña para ver el estatus'}
                      className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 pr-12 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all disabled:opacity-60"
                    />
                    {!studioAuthService.isAuthenticated() && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Instagram / Sitio Web */}
                <div className="flex flex-col gap-2 md:col-span-2">
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
                    placeholder="@estudio / web"
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              {/* Subida opcional de Foto de Perfil y Portada del Estudio */}
              <div className="pt-4 border-t border-black/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#FAFAFA] border border-black/10 rounded-[30px]">
                  {/* Foto de Perfil / Logo */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="font-okcok text-xs sm:text-sm uppercase tracking-normal text-ea-black flex items-center gap-2">
                        <Camera className="w-4 h-4" /> FOTO DE PERFIL / LOGO (OPCIONAL)
                      </label>
                      <span className="text-[11px] font-mono text-neutral-500">1:1</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border border-black/20 bg-[#E8E8E8] overflow-hidden shrink-0 flex items-center justify-center">
                        {formData.studioAvatarUrl ? (
                          <img
                            src={formData.studioAvatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-okcok uppercase rounded-full cursor-pointer hover:bg-neutral-800 transition-all active:scale-95">
                          <UploadCloud className="w-3.5 h-3.5" /> SUBIR FOTO
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'studioAvatarUrl')}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Foto de Portada / Banner */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="font-okcok text-xs sm:text-sm uppercase tracking-normal text-ea-black flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> FOTO DE PORTADA / TALLER (OPCIONAL)
                      </label>
                      <span className="text-[11px] font-mono text-neutral-500">16:9</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-[16px] border border-black/20 bg-[#E8E8E8] overflow-hidden shrink-0 flex items-center justify-center">
                        {formData.studioCoverUrl ? (
                          <img
                            src={formData.studioCoverUrl}
                            alt="Portada"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-okcok uppercase rounded-full cursor-pointer hover:bg-neutral-800 transition-all active:scale-95">
                          <UploadCloud className="w-3.5 h-3.5" /> SUBIR PORTADA
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'studioCoverUrl')}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de acción para avanzar a la siguiente etapa */}
              <div className="pt-6 border-t border-black/10 flex justify-end">
                <button
                  type="button"
                  onClick={handleProceedToProject}
                  className="w-full sm:w-auto px-10 py-5 bg-black text-white font-okcok uppercase text-base sm:text-lg rounded-full hover:bg-neutral-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-3 cursor-pointer"
                >
                  {formData.category === 'territorios'
                    ? 'CONTINUAR: SUBE TU TERRITORIO'
                    : formData.category === 'academia'
                    ? 'CONTINUAR: SUBE TU INVESTIGACIÓN'
                    : 'CONTINUAR: SUBE TU PROYECTO'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </section>
          </div>
        ) : (
          /* ===================================================================== */
          /* SEGUNDA ETAPA: "SUBE TU PROYECTO" (EL FOCO ES EL PROYECTO)            */
          /* Con Ficha Técnica, Maestro Mayor, Curaduría Crítica y Archivos        */
          /* ===================================================================== */
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-[20px] text-sm text-center font-medium">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Cabecera de contexto: Perfil de Estudio Creado */}
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
                      {formData.studioName || 'Estudio Registrado'}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                      Perfil Creado ✓
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-sans">
                    {formData.studioPrincipals} · {formData.contactEmail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStage('landing')}
                className="text-xs font-okcok uppercase text-neutral-600 hover:text-black underline underline-offset-4 cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Editar perfil del estudio
              </button>
            </div>

            {/* SELECTOR RÁPIDO DE PILAR (Permite cambiar entre Proyectos / Territorios / Academia si lo desea) */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 shrink-0">
                Categoría:
              </span>
              <button
                type="button"
                onClick={() => handleCategorySelect('proyectos')}
                className={`px-5 py-2.5 rounded-full font-okcok text-xs uppercase cursor-pointer transition-all ${
                  formData.category === 'proyectos'
                    ? 'bg-black text-white'
                    : 'bg-[#F2F2F2] text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                PROYECTOS
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect('territorios')}
                className={`px-5 py-2.5 rounded-full font-okcok text-xs uppercase cursor-pointer transition-all ${
                  formData.category === 'territorios'
                    ? 'bg-black text-white'
                    : 'bg-[#F2F2F2] text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                TERRITORIOS
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect('academia')}
                className={`px-5 py-2.5 rounded-full font-okcok text-xs uppercase cursor-pointer transition-all ${
                  formData.category === 'academia'
                    ? 'bg-black text-white'
                    : 'bg-[#F2F2F2] text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                ACADEMIA
              </button>
            </div>

            {/* ================================================================= */}
            {/* 2. FICHA TÉCNICA DEL PROYECTO                                     */}
            {/* ================================================================= */}
            <section className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white">
              <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black mb-6">
                2. FICHA TÉCNICA DEL PROYECTO
              </h2>

              {/* EXTRACTOR INTELIGENTE DE MEMORIA O FICHA TÉCNICA */}
              <div className="mb-8 p-5 sm:p-6 bg-[#FAF8F5] border-2 border-dashed border-ea-black/30 rounded-[28px] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h3 className="font-okcok text-sm sm:text-base uppercase text-ea-black tracking-normal">
                      AUTO-RELLENAR FICHA DESDE MEMORIA O TEXTO
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">
                    Pega tu memoria descriptiva o ficha técnica y completaremos los campos
                  </span>
                </div>

                <textarea
                  value={memoryInput}
                  onChange={(e) => setMemoryInput(e.target.value)}
                  placeholder="Pega aquí la memoria del proyecto (Ej: 'Casa Lasso, 2024. Ubicada en Lasso, Cotopaxi. Área: 350 m². Tipología: Vivienda Unifamiliar. Fotografía: BICUBIK. Materialidad: Tierra compactada y madera de eucalipto...')"
                  className="w-full h-24 p-4 bg-white border border-black/20 rounded-[18px] text-xs sm:text-sm font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-black resize-y"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExtractMemory}
                    disabled={!memoryInput.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-ea-black text-white font-okcok uppercase text-xs rounded-full hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>⚡</span> EXTRAER Y AUTO-RELLENAR FICHA
                  </button>

                  {extractedFeedback && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-mono text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      {extractedFeedback}
                    </span>
                  )}
                </div>
              </div>

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

                {/* Tipología de la Obra */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="typology"
                    className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black flex items-center justify-between"
                  >
                    <span>TIPOLOGÍA DE LA OBRA *</span>
                    <span className="text-[11px] font-mono text-neutral-500 font-normal">Clic para seleccionar</span>
                  </label>
                  <input
                    id="typology"
                    name="typology"
                    type="text"
                    required
                    value={formData.typology || ''}
                    onChange={handleInputChange}
                    placeholder="Ej. Vivienda Unifamiliar, Equipamiento, etc."
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                  {/* Chips interactivos de Tipología */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {TYPOLOGY_PRESETS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, typology: t }))}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                          formData.typology === t
                            ? 'bg-ea-black text-white font-bold ring-1 ring-black'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
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
                  {/* Chips interactivos de Año */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {YEAR_PRESETS.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, projectYear: y }))}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                          formData.projectYear === y
                            ? 'bg-ea-black text-white font-bold'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
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
                    placeholder="Lasso, Cotopaxi / Nayón, Quito"
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                  {/* Chips interactivos de Ciudades / Provincias */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {LOCATION_PRESETS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, projectLocation: loc }))}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                          formData.projectLocation === loc
                            ? 'bg-ea-black text-white font-bold'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
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
                    placeholder="350 m²"
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                  {/* Chips interactivos de Área */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {AREA_PRESETS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, builtArea: area }))}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                          formData.builtArea === area
                            ? 'bg-ea-black text-white font-bold'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipo de Colaboradores */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="projectTeam"
                    className="font-okcok text-sm sm:text-base uppercase tracking-normal text-ea-black"
                  >
                    EQUIPO DE COLABORADORES Y ASESORES
                  </label>
                  <input
                    id="projectTeam"
                    name="projectTeam"
                    type="text"
                    value={formData.projectTeam}
                    onChange={handleInputChange}
                    placeholder="Cálculo estructural, diseño de paisaje, etc."
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                </div>

                {/* Fotógrafo(s) */}
                <div className="flex flex-col gap-2 md:col-span-2">
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
                    placeholder="JAG Studio / BICUBIK / Sebastián Crespo"
                    className="w-full h-14 bg-[#E8E8E8] rounded-[30px] px-6 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                  {/* Chips interactivos de Fotógrafos */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PHOTO_PRESETS.map((ph) => (
                      <button
                        key={ph}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, photographers: ph }))}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                          formData.photographers === ph
                            ? 'bg-ea-black text-white font-bold ring-1 ring-black'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {ph}
                      </button>
                    ))}
                  </div>
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
                    placeholder="Sintetiza la premisa espacial y el propósito central de diseño en pocas frases."
                    className="w-full bg-[#E8E8E8] rounded-[24px] p-5 text-sm sm:text-base font-sans text-ea-black placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-none"
                  />
                </div>

                {/* RECONOCIMIENTO DEL OFICIO: MAESTRO MAYOR Y TRABAJADORES (Dentro de la ficha técnica) */}
                <div className="md:col-span-2 p-6 bg-[#FAFAFA] border border-black/15 rounded-[30px] space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-600 font-bold">
                    <img src={compMaestroUrl} alt="" className="w-5 h-5 object-contain" />
                    Mano de Obra &amp; Ejecución Constructiva
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="maestroMayorName"
                        className="font-okcok text-xs sm:text-sm uppercase tracking-normal text-ea-black"
                      >
                        NOMBRE DEL MAESTRO MAYOR
                      </label>
                      <input
                        id="maestroMayorName"
                        name="maestroMayorName"
                        type="text"
                        value={formData.maestroMayorName}
                        onChange={handleInputChange}
                        placeholder="Ej. Segundo Guanoluisa"
                        className="w-full h-12 bg-white border border-neutral-300 rounded-[20px] px-5 text-xs sm:text-sm font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="maestroMayorSpecialty"
                        className="font-okcok text-xs sm:text-sm uppercase tracking-normal text-ea-black"
                      >
                        ESPECIALIDAD / OFICIO
                      </label>
                      <input
                        id="maestroMayorSpecialty"
                        name="maestroMayorSpecialty"
                        type="text"
                        value={formData.maestroMayorSpecialty}
                        onChange={handleInputChange}
                        placeholder="Mampostería, encofrados, adobe..."
                        className="w-full h-12 bg-white border border-neutral-300 rounded-[20px] px-5 text-xs sm:text-sm font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label
                        htmlFor="constructionCrew"
                        className="font-okcok text-xs sm:text-sm uppercase tracking-normal text-ea-black"
                      >
                        TRABAJADORES Y ARTESANOS DESTACADOS DE LA CUADRILLA
                      </label>
                      <input
                        id="constructionCrew"
                        name="constructionCrew"
                        type="text"
                        value={formData.constructionCrew}
                        onChange={handleInputChange}
                        placeholder="Ej. Manuel Chasi (Carpintero), Carlos Toapanta (Albañil)"
                        className="w-full h-12 bg-white border border-neutral-300 rounded-[20px] px-5 text-xs sm:text-sm font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================================= */}
            {/* 3. CURADURÍA CRÍTICA                                              */}
            {/* ================================================================= */}
            <section className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white">
              <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black mb-3">
                3. CURADURÍA &amp; ENFOQUE CRÍTICO
              </h2>
              <p className="font-sans text-sm sm:text-base text-neutral-600 mb-8 max-w-[800px]">
                Preguntas clave para permitir una mayor curación editorial de la obra:
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
                  <textarea
                    id="contextRelation"
                    name="contextRelation"
                    rows={3}
                    required
                    value={formData.contextRelation}
                    onChange={handleInputChange}
                    placeholder="Topografía, clima, paisaje andino o costero, integración con el entorno urbano o rural..."
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
                  <textarea
                    id="usersAppropriation"
                    name="usersAppropriation"
                    rows={3}
                    required
                    value={formData.usersAppropriation}
                    onChange={handleInputChange}
                    placeholder="Dinámicas sociales, comunidad, flexibilidad espacial o la relación entre los habitantes y el vacío..."
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
                  <textarea
                    id="materialityTectonics"
                    name="materialityTectonics"
                    rows={3}
                    required
                    value={formData.materialityTectonics}
                    onChange={handleInputChange}
                    placeholder="Tierra cruda, madera local, ladrillo artesanal, acero, hormigón visto o detalles de mano de obra..."
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

            {/* ================================================================= */}
            {/* 4. DOCUMENTACIÓN GRÁFICA EN LA NUBE                               */}
            {/* ================================================================= */}
            <section className="w-full border border-black rounded-[36px] sm:rounded-[52px] p-6 sm:p-10 md:p-12 bg-white">
              <h2 className="font-okcok text-2xl sm:text-3xl md:text-4xl uppercase tracking-normal text-ea-black mb-3">
                4. ARCHIVOS GRÁFICOS (FOTOS &amp; PLANOS)
              </h2>

              <div className="border border-black/20 rounded-[28px] p-5 sm:p-6 bg-[#FAFAFA] mb-6 space-y-2 text-xs sm:text-sm font-sans text-neutral-700">
                <div className="font-okcok uppercase text-sm sm:text-base text-ea-black flex items-center gap-2">
                  <UploadCloud className="w-5 h-5" /> Subir enlace con fotos y planimetrías separadas:
                </div>
                <p>
                  • <strong>Subcarpeta 1 — FOTOGRAFÍAS:</strong> Alta resolución (mínimo 2400px de ancho) con créditos de fotógrafo.
                </p>
                <p>
                  • <strong>Subcarpeta 2 — PLANIMETRÍAS:</strong> Plantas, cortes, fachadas y axonométricas en fondo blanco puro y escala legible.
                </p>
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
                  Confirmo que represento legalmente al estudio o autoría del proyecto y autorizo a <strong>Ecuadorian Architecture</strong> a publicar este material en sus canales digitales, archivo y redes oficiales.
                </label>
              </div>
            </section>

            {/* Botón de Envío */}
            <div className="pt-4 pb-12 flex flex-col items-center justify-center gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStage('landing')}
                  className="w-full sm:w-auto px-8 py-5 border border-black text-black font-okcok uppercase text-base rounded-full hover:bg-neutral-100 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> VOLVER AL PERFIL
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
                El equipo editorial revisará el expediente y responderá a {formData.contactEmail || 'tu correo'}.
              </p>
            </div>
          </form>
        )}
      </main>

      {/* MODAL DE PERFIL DE ESTUDIO (TRABAJOS ENVIADOS & CATÁLOGO) */}
      <StudioProfileModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        onNavigateSubmit={() => {
          setIsStudioModalOpen(false);
          setStage('landing');
          setIsSuccess(false);
        }}
      />
    </div>
  );
};
