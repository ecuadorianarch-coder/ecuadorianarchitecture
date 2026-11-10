import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, ArrowRight, Mail, User, Phone, Sparkles } from 'lucide-react';
import logoUrl from '/logo.svg';

interface NewsletterSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export const NewsletterSubscriptionModal: React.FC<NewsletterSubscriptionModalProps> = ({
  isOpen,
  onClose,
  source = 'banner-publicitario',
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);

    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation (Email is the sole mandatory requirement)
    const cleanEmail = email.trim().toLowerCase();
    const cleanNombre = nombre.trim();
    const cleanTelefono = telefono.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor ingresa una dirección de correo válida.');
      return;
    }

    // 2. Anti-spam honeypot
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
          nombre: cleanNombre,
          telefono: cleanTelefono,
          email: cleanEmail,
          source,
          section: 'newsletter-banner',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ocurrió un error al registrar la suscripción.');
      }

      // GA4 event tracking
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'newsletter_signup', {
          event_category: 'engagement',
          event_label: source || 'newsletter_modal',
          value: 1,
        });
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setNombre('');
    setTelefono('');
    setEmail('');
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-ea-black/75 backdrop-blur-md animate-in fade-in duration-200"
      style={{ zIndex: 99999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleResetAndClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[540px] bg-[#FAF8F5] border-2 border-ea-black rounded-[20px] sm:rounded-[24px] shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden select-none"
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-6 pb-3 border-b border-ea-black/10">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="EA" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-ea-black/60 font-bold">
                ECUADORIAN ARCHITECTURE
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] tracking-wider uppercase text-ea-black font-extrabold -mt-0.5">
                COMUNIDAD EDITORIAL
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-ea-black/20 flex items-center justify-center text-ea-black/70 hover:text-ea-black hover:border-ea-black active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Cerrar ventana"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-5 sm:px-7 py-5 sm:py-6 max-h-[82vh] overflow-y-auto no-scrollbar">
          {isSuccess ? (
            /* SUCCESS STATE */
            <div className="flex flex-col items-center text-center py-4 sm:py-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ea-black text-white flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.3)] mb-4">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-white stroke-[2.2]" />
              </div>

              <span className="font-mono text-[11px] uppercase tracking-widest text-ea-black/60 font-semibold mb-1">
                SUSCRIPCIÓN CONFIRMADA
              </span>

              <h3 className="font-okcok text-2xl sm:text-3xl uppercase tracking-normal text-ea-black leading-tight mb-2">
                ¡Gracias por querer ser parte de esta conversación!
              </h3>

              <p className="font-creato text-xs sm:text-sm text-ea-black/70 max-w-md leading-relaxed mb-6">
                Te avisaremos cuando haya nuevas investigaciones, procesos de obra, críticas y lecturas publicadas en EcuadorianArchitecture.
              </p>

              {/* Data Summary Card */}
              <div className="w-full bg-white border-2 border-ea-black/15 rounded-xl p-3.5 sm:p-4 text-left font-mono text-xs text-ea-black/80 space-y-1.5 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-ea-black/50 uppercase">Correo:</span>
                  <span className="font-bold text-ea-black truncate max-w-[220px]">{email}</span>
                </div>
                {Boolean(nombre) && (
                  <div className="flex items-center justify-between border-t border-ea-black/10 pt-1.5">
                    <span className="text-ea-black/50 uppercase">Nombre:</span>
                    <span className="font-bold text-ea-black">{nombre}</span>
                  </div>
                )}
                {Boolean(telefono) && (
                  <div className="flex items-center justify-between border-t border-ea-black/10 pt-1.5">
                    <span className="text-ea-black/50 uppercase">Teléfono:</span>
                    <span className="font-bold text-ea-black">{telefono}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3.5 px-6 bg-ea-black text-white font-okcok sm:font-anton text-sm sm:text-base tracking-wider uppercase rounded-xl hover:bg-black/90 active:scale-98 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                Volver a explorar
              </button>
            </div>
          ) : (
            /* FORM STATE */
            <div>
              <div className="mb-5 sm:mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ea-black/5 border border-ea-black/15 font-mono text-[10px] uppercase tracking-wider text-ea-black mb-2">
                  <Sparkles className="w-3 h-3 text-ea-black/70" />
                  <span>Sin contenido de relleno</span>
                </div>

                <h2
                  id="newsletter-modal-title"
                  className="font-okcok text-2xl sm:text-3xl md:text-[34px] uppercase tracking-normal text-ea-black leading-[1.1] mb-2"
                >
                  Suscríbete a nuestro newsletter
                </h2>

                <p className="font-creato text-xs sm:text-sm text-ea-black/70 leading-relaxed">
                  Investigaciones, obras reales, procesos de diseño, materialidades y lecturas críticas sobre la arquitectura ecuatoriana directamente en tu bandeja.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot for spam bots */}
                <input
                  type="text"
                  name="website_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {/* 1. Correo electrónico (REQUISITO PRINCIPAL) */}
                <div>
                  <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-ea-black/80 mb-1.5">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-black/40 pointer-events-none" />
                    <input
                      ref={firstInputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full bg-white border-2 border-ea-black/30 focus:border-ea-black rounded-xl pl-10 pr-4 py-2.5 sm:py-3 font-creato text-sm text-ea-black placeholder:text-ea-black/35 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* 2. Nombre completo (OPCIONAL) */}
                <div>
                  <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-ea-black/80 mb-1.5">
                    Nombre completo <span className="text-ea-black/40 font-normal text-[10px]">(opcional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-black/40 pointer-events-none" />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Daniel Moreno Flores"
                      className="w-full bg-white border-2 border-ea-black/30 focus:border-ea-black rounded-xl pl-10 pr-4 py-2.5 sm:py-3 font-creato text-sm text-ea-black placeholder:text-ea-black/35 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* 3. Teléfono / WhatsApp (OPCIONAL) */}
                <div>
                  <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-ea-black/80 mb-1.5">
                    Teléfono / WhatsApp <span className="text-ea-black/40 font-normal text-[10px]">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-black/40 pointer-events-none" />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej. +593 99 123 4567"
                      className="w-full bg-white border-2 border-ea-black/30 focus:border-ea-black rounded-xl pl-10 pr-4 py-2.5 sm:py-3 font-creato text-sm text-ea-black placeholder:text-ea-black/35 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-creato text-xs leading-snug">
                    {errorMessage}
                  </div>
                )}

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 bg-ea-black text-white font-okcok sm:font-anton text-base sm:text-lg tracking-wider uppercase rounded-xl hover:bg-black/90 active:scale-98 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span>Suscribiendo...</span>
                    ) : (
                      <>
                        <span>Quiero suscribirme</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                </div>

                <p className="font-mono text-[10px] text-center text-ea-black/45 leading-tight pt-1">
                  Respetamos tu privacidad. Solo escribiremos cuando haya publicaciones reales y verificadas.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
