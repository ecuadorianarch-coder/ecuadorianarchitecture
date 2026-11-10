import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface EditorialNewsletterCardProps {
  source?: string;
  variant?: 'card' | 'footer';
  className?: string;
}

export const EditorialNewsletterCard: React.FC<EditorialNewsletterCardProps> = ({
  source = 'editorial-infeed',
  variant = 'card',
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor ingresa una dirección de correo válida.');
      return;
    }

    if (honeypot) {
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          source,
          section: variant === 'footer' ? 'footer-newsletter' : 'infeed-newsletter',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ocurrió un error al procesar tu suscripción.');
      }

      // Track conversion in Google Analytics 4
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'newsletter_signup', {
          event_category: 'engagement',
          event_label: source,
          value: 1,
        });
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className={`border-2 border-ea-black bg-white p-6 md:p-8 text-center flex flex-col items-center justify-center transition-all ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-ea-black text-white flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-ea-black/50 font-bold mb-1">
          SUSCRIPCIÓN CONFIRMADA
        </span>
        <h4 className="font-anton text-xl md:text-2xl uppercase tracking-wider text-ea-black mb-2">
          Te has unido al archivo documental
        </h4>
        <p className="font-creato text-xs md:text-sm text-ea-black/70 max-w-md leading-relaxed">
          Recibirás en tu bandeja las nuevas obras, investigaciones tectónicas y críticas del Ecuador. Sin spam.
        </p>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-ea-black" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ea-black/60 font-bold">
            BOLETÍN EDITORIAL MENSUAL
          </span>
        </div>
        <h4 className="font-anton text-lg sm:text-xl uppercase tracking-wider text-ea-black leading-tight">
          Nuevas obras y pensamiento espacial
        </h4>
        <p className="font-creato text-xs text-ea-black/70 leading-relaxed max-w-sm">
          Recibe cada mes una selección rigurosa de obras, planimetrías y críticas de arquitectura ecuatoriana.
        </p>

        <form onSubmit={handleSubmit} className="space-y-2 pt-1 max-w-md">
          <input
            type="text"
            name="hp_field"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-black/40 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-white border-2 border-ea-black rounded-[2px] pl-9 pr-3 py-2 font-creato text-xs text-ea-black placeholder:text-ea-black/35 focus:outline-none focus:ring-1 focus:ring-ea-black"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-ea-black text-white hover:bg-black/85 active:scale-95 px-4 py-2 font-anton text-xs uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Enviando...</span>
              ) : (
                <>
                  <span>Suscribirme</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="font-creato text-[11px] text-red-600 leading-tight">{errorMessage}</p>
          )}

          <span className="font-mono text-[9px] text-ea-black/40 uppercase tracking-wider block">
            1 correo al mes • Cancela cuando desees
          </span>
        </form>
      </div>
    );
  }

  // Default: In-feed editorial card (for ProjectDetail, articles, etc.)
  return (
    <div
      className={`border-2 border-ea-black bg-[#FAF8F5] p-6 sm:p-8 md:p-10 relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ea-black/5 border border-ea-black/15 font-mono text-[10px] uppercase tracking-wider text-ea-black">
            <Sparkles className="w-3 h-3 text-ea-black/70" />
            <span>ARCHIVO DOCUMENTAL EA</span>
          </div>

          <h3 className="font-anton text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-ea-black leading-tight">
            Recibe cada obra en tu bandeja
          </h3>

          <p className="font-creato text-xs sm:text-sm text-ea-black/70 leading-relaxed">
            Nuevas investigaciones, fotografías, detalles constructivos y lecturas críticas sobre la arquitectura contemporánea e histórica del Ecuador.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:max-w-md space-y-2.5 shrink-0">
          <input
            type="text"
            name="hp_field"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-black/40 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-white border-2 border-ea-black rounded-[2px] pl-10 pr-4 py-2.5 font-creato text-sm text-ea-black placeholder:text-ea-black/35 focus:outline-none focus:ring-1 focus:ring-ea-black"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-ea-black text-white hover:bg-black/90 active:scale-95 px-5 py-2.5 font-anton text-sm uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Enviando...</span>
              ) : (
                <>
                  <span>Suscribirme</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="font-creato text-xs text-red-600 leading-tight">{errorMessage}</p>
          )}

          <div className="flex items-center justify-between font-mono text-[10px] text-ea-black/50 uppercase tracking-wider pt-1">
            <span>Sin contenido patrocinado basura</span>
            <span>100% gratuito</span>
          </div>
        </form>
      </div>
    </div>
  );
};
