import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Sparkles, CheckCircle2, Bell, Compass } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tape strip component for the authentic taped paper aesthetic
const TapeStrip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute w-10 sm:w-12 h-3.5 sm:h-4 bg-[#E8E6E1]/95 border border-ea-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.18)] pointer-events-none z-20 ${className}`}
    style={{
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px)',
    }}
  />
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Newsletter / notify state
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubscribed(false);
      setNotifyEmail('');
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) return;

    try {
      const stored = JSON.parse(localStorage.getItem('ea_coming_soon_waitlist') || '[]');
      if (!stored.includes(notifyEmail)) {
        stored.push(notifyEmail);
        localStorage.setItem('ea_coming_soon_waitlist', JSON.stringify(stored));
      }
      // Also post to newsletter API if available
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifyEmail, section: 'community-waitlist' }),
      }).catch(() => {});
    } catch {
      // Fallback silent ignore
    }

    setIsSubscribed(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[490px] bg-[#FAF8F5] border-2 border-ea-black rounded-[8px] shadow-[8px_8px_0px_#000000] p-6 sm:p-8 select-none max-h-[92vh] overflow-y-auto"
      >
        {/* Taped paper corners */}
        <TapeStrip className="-top-2 left-6 -rotate-6" />
        <TapeStrip className="-top-2 right-6 rotate-6" />
        <TapeStrip className="-bottom-2 left-6 rotate-3" />
        <TapeStrip className="-bottom-2 right-6 -rotate-3" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-ea-black/30 hover:border-ea-black hover:bg-ea-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ------------------------------------------------------------- */}
        {/* VISTA PÚBLICA EXCLUSIVA: COMUNIDAD Y REGISTRO PRÓXIMAMENTE    */}
        {/* ------------------------------------------------------------- */}
        <div className="text-center pt-2 pb-1 space-y-4">
          {/* Top Badge Stamp */}
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ea-black text-white font-anton text-[10px] sm:text-[11px] tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              ACCESO A LA PLATAFORMA
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-400 text-ea-black font-anton text-[10px] sm:text-[11px] tracking-wider uppercase border border-ea-black font-bold">
              PRÓXIMAMENTE
            </span>
          </div>

          {/* Title */}
          <div>
            <h2
              id="auth-modal-title"
              className="font-okcok text-2xl sm:text-3xl uppercase text-ea-black leading-tight tracking-tight"
            >
              COMUNIDAD EDITORIAL &amp; PERFILES
            </h2>
            <p className="font-creato text-xs sm:text-[13px] text-ea-black/70 mt-2 leading-relaxed max-w-sm mx-auto">
              Estamos preparando el espacio para que arquitectos, investigadores, estudiantes y fotógrafos puedan crear su perfil público, guardar obras en su biblioteca personal y participar en las conversaciones críticas.
            </p>
          </div>

          {/* Feature List (Paper note style) */}
          <div className="bg-white/80 border border-ea-black/15 rounded-[4px] p-3.5 sm:p-4 text-left space-y-2.5 text-xs font-creato shadow-xs">
            <div className="flex items-start gap-2.5 text-ea-black/85">
              <span className="w-4 h-4 rounded-full bg-ea-black/10 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong>Biblioteca personal:</strong> Guarda proyectos, investigaciones y expedientes territoriales favoritos.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-ea-black/85">
              <span className="w-4 h-4 rounded-full bg-ea-black/10 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong>Postulación directa:</strong> Envía tus obras construidas o tesis para revisión por el comité editorial.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-ea-black/85">
              <span className="w-4 h-4 rounded-full bg-ea-black/10 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong>Bitácoras de obra:</strong> Comparte visitas presenciales y notas críticas sobre la arquitectura del país.
              </span>
            </div>
          </div>

          {/* Email Notification Form */}
          <div className="pt-1">
            {isSubscribed ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-[4px] text-emerald-800 text-xs font-creato flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  ¡Gracias! Te avisaremos por correo en cuanto abramos el registro.
                </span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-2">
                <label className="block font-anton text-[11px] tracking-wider uppercase text-ea-black/80 text-left">
                  Sé de los primeros en ingresar:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-ea-black/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-ea-black/40 focus:border-ea-black rounded-[3px] text-xs font-creato text-ea-black placeholder:text-ea-black/35 focus:outline-hidden transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-ea-black hover:bg-neutral-800 text-white font-anton text-xs uppercase tracking-wider rounded-[3px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>AVÍSAME</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Action: Return to Website */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-ea-black hover:bg-neutral-800 text-white rounded-[3px] font-anton text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <span>ENTENDIDO, VOLVER AL SITIO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
