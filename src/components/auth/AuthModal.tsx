import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { studioAuthService, StudioProfile } from '../../services/studioAuthService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (studio: StudioProfile) => void;
  onNavigateSubmit?: () => void;
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
  onLoginSuccess,
  onNavigateSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setErrorMessage(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    const result = await studioAuthService.login(email, password);
    setIsLoading(false);

    if (!result.success || !result.studio) {
      setErrorMessage(result.error || 'Credenciales inválidas. Revisa tu correo y contraseña.');
      return;
    }

    if (onLoginSuccess) {
      onLoginSuccess(result.studio);
    }
    onClose();
  };

  const handleGoToSubmit = () => {
    onClose();
    if (onNavigateSubmit) {
      onNavigateSubmit();
    } else {
      window.location.href = '/sube-tu-trabajo';
    }
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

        {/* Header */}
        <div className="text-center pt-2 pb-1 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ea-black text-white font-anton text-[10px] sm:text-[11px] tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              PORTAL DE ESTUDIOS &amp; AUTORES
            </span>
          </div>

          <div>
            <h2
              id="auth-modal-title"
              className="font-okcok text-2xl sm:text-3xl uppercase text-ea-black leading-tight tracking-tight"
            >
              INICIAR SESIÓN
            </h2>
            <p className="font-sans text-xs sm:text-[13px] text-ea-black/70 mt-1 leading-relaxed max-w-sm mx-auto">
              Accede a tu perfil de estudio para consultar el estatus en vivo de tus obras enviadas y administrar tus publicaciones.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded text-xs font-mono">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Campo Correo */}
          <div className="space-y-1">
            <label className="font-okcok text-xs uppercase tracking-normal text-ea-black flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-500" /> CORREO ELECTRÓNICO OFICIAL *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@estudio.com"
              className="w-full h-11 bg-white border border-ea-black/30 rounded px-3.5 text-xs sm:text-sm font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:border-ea-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1">
            <label className="font-okcok text-xs uppercase tracking-normal text-ea-black flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-neutral-500" /> CONTRASEÑA *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-white border border-ea-black/30 rounded px-3.5 pr-10 text-xs sm:text-sm font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:border-ea-black focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-ea-black text-white font-okcok text-sm uppercase tracking-wider rounded hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? 'VERIFICANDO...' : 'INGRESAR A MI PERFIL'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separador y Link a Sube tu Trabajo */}
        <div className="mt-6 pt-5 border-t border-ea-black/15 text-center space-y-2">
          <p className="font-sans text-xs text-neutral-600">
            ¿Aún no has registrado tu estudio o arquitecto?
          </p>
          <button
            type="button"
            onClick={handleGoToSubmit}
            className="inline-flex items-center gap-1.5 font-okcok text-xs uppercase tracking-wider text-ea-black hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            SUBE TU PRIMER TRABAJO Y CREA TU PERFIL AQUÍ →
          </button>
        </div>
      </div>
    </div>
  );
};
