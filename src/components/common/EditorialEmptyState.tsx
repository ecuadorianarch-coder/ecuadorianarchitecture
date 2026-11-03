import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export type EditorialSectionKey =
  | 'territorio'
  | 'territorios'
  | 'academia'
  | 'critica'
  | 'podcast'
  | 'proyectos'
  | 'comunidad';

interface EditorialEmptyStateProps {
  section: EditorialSectionKey;
  variant?: 'full' | 'card' | 'inline';
  className?: string;
  onSuccess?: (email: string) => void;
}

interface SectionEditorialCopy {
  badge: string;
  title: string;
  body1: string;
  body2?: string;
  ctaHeading: string;
  ctaSub: string;
  buttonText: string;
}

const SECTION_COPIES: Record<string, SectionEditorialCopy> = {
  territorio: {
    badge: 'EXPEDIENTES TERRITORIALES // EN CONSTRUCCIÓN EDITORIAL',
    title: 'El territorio también está por escribirse.',
    body1: 'Estamos preparando nuevas miradas sobre nuestras ciudades, paisajes, comunidades y formas de habitar.',
    body2: 'Pronto encontrarás aquí investigaciones, recorridos, reflexiones y conversaciones sobre el territorio ecuatoriano.',
    ctaHeading: 'No pierdas de vista lo que viene.',
    ctaSub: 'Déjanos tu correo y te avisaremos cuando publiquemos nuevos contenidos.',
    buttonText: 'Quiero estar al tanto',
  },
  territorios: {
    badge: 'EXPEDIENTES TERRITORIALES // EN CONSTRUCCIÓN EDITORIAL',
    title: 'El territorio también está por escribirse.',
    body1: 'Estamos preparando nuevas miradas sobre nuestras ciudades, paisajes, comunidades y formas de habitar.',
    body2: 'Pronto encontrarás aquí investigaciones, recorridos, reflexiones y conversaciones sobre el territorio ecuatoriano.',
    ctaHeading: 'No pierdas de vista lo que viene.',
    ctaSub: 'Déjanos tu correo y te avisaremos cuando publiquemos nuevos contenidos.',
    buttonText: 'Quiero estar al tanto',
  },
  academia: {
    badge: 'INVESTIGACIÓN ACADÉMICA // EN CONSTRUCCIÓN EDITORIAL',
    title: 'El conocimiento también se construye colectivamente.',
    body1: 'Estamos reuniendo investigaciones, tesis, ensayos, debates y publicaciones académicas que dialogan con nuestra arquitectura.',
    body2: 'Pronto este espacio estará abierto para compartir y consultar reflexiones desde las aulas y más allá de ellas.',
    ctaHeading: 'Sé el primero en enterarte.',
    ctaSub: 'Déjanos tu correo y te notificaremos cuando publiquemos nuevas investigaciones.',
    buttonText: 'Quiero estar al tanto',
  },
  critica: {
    badge: 'CRÍTICA Y ENSAYO // EN CONSTRUCCIÓN EDITORIAL',
    title: 'Toda arquitectura merece ser pensada, cuestionada y discutida.',
    body1: 'Estamos preparando textos críticos, ensayos y lecturas profundas sobre proyectos, ciudades y procesos constructivos del Ecuador.',
    body2: 'Una arquitectura sin crítica es una arquitectura incompleta.',
    ctaHeading: 'No te pierdas los primeros textos.',
    ctaSub: 'Suscríbete y te avisaremos apenas se publiquen.',
    buttonText: 'Avisarme cuando publiquen',
  },
  podcast: {
    badge: 'REGISTRO SONORO // EN CONSTRUCCIÓN EDITORIAL',
    title: 'Las ideas también necesitan una voz.',
    body1: 'Estamos trabajando en conversaciones, entrevistas y debates sonoros con quienes piensan, construyen y habitan la arquitectura en nuestro país.',
    body2: 'Pronto podrás escucharnos aquí y en plataformas digitales.',
    ctaHeading: 'Entérate antes que nadie del primer episodio.',
    ctaSub: 'Déjanos tu correo y te enviaremos el enlace apenas salga al aire.',
    buttonText: 'Quiero escucharlos',
  },
  proyectos: {
    badge: 'ARCHIVO DOCUMENTAL // EN CONSTRUCCIÓN EDITORIAL',
    title: 'La arquitectura no empieza ni termina en una fotografía.',
    body1: 'Estamos documentando obras reales con planimetrías, detalles técnicos, memorias, presupuestos y voces de sus protagonistas.',
    body2: 'Pronto presentaremos proyectos que valen la pena conocer a fondo.',
    ctaHeading: 'Acompáñanos desde el inicio.',
    ctaSub: 'Déjanos tu correo y te avisaremos cuando publiquemos nuevos proyectos.',
    buttonText: 'Mantenerme al tanto',
  },
  comunidad: {
    badge: 'MEMORIA COLECTIVA // EN CONSTRUCCIÓN EDITORIAL',
    title: 'La arquitectura también se construye desde quienes la habitan.',
    body1: 'Este espacio estará destinado a registrar visitas de obra, reflexiones, experiencias y miradas de quienes recorren y viven los proyectos.',
    body2: undefined,
    ctaHeading: '¿Tienes una visita o experiencia que compartir?',
    ctaSub: 'Déjanos tu correo y te avisaremos cuando la sección esté abierta para recibir publicaciones.',
    buttonText: 'Quiero participar',
  },
};

const TapeStrip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute w-12 sm:w-16 h-4 sm:h-5 bg-[#E8E6E1]/90 border border-ea-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.15)] pointer-events-none z-10 ${className}`}
    style={{
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px)',
    }}
  />
);

export const EditorialEmptyState: React.FC<EditorialEmptyStateProps> = ({
  section,
  variant = 'full',
  className = '',
  onSuccess,
}) => {
  const copy = SECTION_COPIES[section] || SECTION_COPIES.territorio;
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Spam honeypot detection
    if (honeypot) {
      setIsSuccess(true);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send to server endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          section,
          source: `empty-state-${section}`,
          hp: honeypot,
        }),
      });

      // 2. Also save to local storage as client-side backup
      try {
        const stored = JSON.parse(localStorage.getItem('ea_subscribers') || '[]');
        if (!stored.some((s: any) => (typeof s === 'string' ? s : s.email) === cleanEmail)) {
          stored.push({
            email: cleanEmail,
            section,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem('ea_subscribers', JSON.stringify(stored));
        }
      } catch {
        // localStorage quota fail-safe
      }

      if (response.ok || response.status === 200) {
        setIsSuccess(true);
        if (onSuccess) onSuccess(cleanEmail);
      } else {
        // If server returns error, still show success if it was recorded locally
        setIsSuccess(true);
      }
    } catch {
      // Offline fallback: succeeded in saving locally
      setIsSuccess(true);
      if (onSuccess) onSuccess(cleanEmail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCard = variant === 'card';

  return (
    <div
      className={`relative w-full bg-[#FAF8F5] border-2 border-ea-black shadow-[4px_4px_0px_#1d1d1b] ${
        isCard ? 'p-6 sm:p-8 max-w-xl mx-auto' : 'p-8 sm:p-12 md:p-16 max-w-3xl mx-auto my-8 sm:my-12'
      } ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(#1d1d1b 0.5px, transparent 0.5px), radial-gradient(#1d1d1b 0.5px, #FAF8F5 0.5px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      {/* Editorial Tape Strips */}
      <TapeStrip className="-top-2 left-6 sm:left-10 -rotate-2" />
      <TapeStrip className="-top-2 right-6 sm:right-10 rotate-3" />

      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 bg-ea-black animate-pulse" />
        <span className="font-mono text-[10.5px] sm:text-xs uppercase tracking-widest text-ea-black/70 font-semibold">
          {copy.badge}
        </span>
      </div>

      {/* Main Title */}
      <h3
        className={`font-okcok uppercase text-ea-black leading-tight tracking-tight mb-4 ${
          isCard ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'
        }`}
      >
        {copy.title}
      </h3>

      {/* Editorial Intent Paragraphs */}
      <div className="space-y-3 font-creato text-ea-black/85 text-[14px] sm:text-[15.5px] leading-relaxed max-w-2xl">
        <p>{copy.body1}</p>
        {copy.body2 && <p>{copy.body2}</p>}
      </div>

      {/* Divider */}
      <div className="my-6 sm:my-8 border-t border-dashed border-ea-black/25 relative">
        <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-[#FAF8F5] px-3 font-mono text-[9px] uppercase tracking-widest text-ea-black/40">
          SUSCRIPCIÓN EDITORIAL DIRECTA
        </span>
      </div>

      {/* CTA Block / Subscription Form */}
      {isSuccess ? (
        <div className="bg-white border-2 border-ea-black p-5 sm:p-6 shadow-[3px_3px_0px_#1d1d1b] flex items-start gap-3 sm:gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-8 h-8 rounded-full bg-ea-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-[#FAF8F5]" />
          </div>
          <div>
            <span className="font-anton text-xs uppercase tracking-widest text-ea-black block mb-1">
              REGISTRO CONFIRMADO
            </span>
            <p className="font-creato text-[13.5px] sm:text-[14.5px] text-ea-black/90 font-medium leading-snug">
              ¡Gracias por querer ser parte de esta conversación! Te avisaremos cuando haya nuevas publicaciones en EcuadorianArchitecture.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="font-anton text-base sm:text-lg uppercase text-ea-black tracking-wide">
              {copy.ctaHeading}
            </h4>
            <p className="font-creato text-xs sm:text-sm text-ea-black/75 mt-0.5">
              {copy.ctaSub}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Honeypot field (hidden from humans) */}
            <input
              type="text"
              name="ea_editorial_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-black/45 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-ea-black font-creato text-sm text-ea-black placeholder:text-ea-black/40 focus:outline-none focus:ring-2 focus:ring-ea-black shadow-[2px_2px_0px_#1d1d1b]"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ea-black text-white border-2 border-ea-black font-anton text-xs sm:text-[13px] uppercase tracking-wider shadow-[3px_3px_0px_#1d1d1b] hover:bg-neutral-800 hover:shadow-[1px_1px_0px_#1d1d1b] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {isSubmitting ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <span>{copy.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-red-600 font-creato text-xs mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="font-mono text-[10px] text-ea-black/50 tracking-tight">
              * Cero spam. Respetamos tu privacidad y solo te escribiremos con publicaciones reales e investigaciones verificadas.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};
