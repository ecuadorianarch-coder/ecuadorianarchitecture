import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';
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
  const [authView, setAuthView] = useState<'login' | 'forgot_request' | 'forgot_reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthView('login');
      setEmail('');
      setPassword('');
      setRecoveryCode('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setSuccessMessage(null);
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

  // Manejador de Login tradicional
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico oficial válido.');
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

  // Manejador de Solicitud de Código de Recuperación
  const handleRequestCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingresa el correo oficial con el que registraste tu estudio.');
      return;
    }

    setIsLoading(true);
    const result = await studioAuthService.requestPasswordReset(email);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'No se pudo enviar el código de recuperación.');
      return;
    }

    setSuccessMessage(result.message || 'Código de seguridad de 6 dígitos enviado a tu correo.');
    setAuthView('forgot_reset');
  };

  // Manejador de Cambio de Contraseña con Código
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!recoveryCode.trim() || recoveryCode.trim().length < 6) {
      setErrorMessage('Por favor ingresa el código de 6 dígitos que enviamos a tu correo.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    const result = await studioAuthService.resetPassword(email, recoveryCode, newPassword);
    setIsLoading(false);

    if (!result.success || !result.studio) {
      setErrorMessage(result.error || 'Código incorrecto o expirado.');
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
              {authView === 'login'
                ? 'INICIAR SESIÓN'
                : authView === 'forgot_request'
                ? 'RECUPERAR CONTRASEÑA'
                : 'NUEVA CONTRASEÑA'}
            </h2>
            <p className="font-sans text-xs sm:text-[13px] text-ea-black/70 mt-1 leading-relaxed max-w-sm mx-auto">
              {authView === 'login'
                ? 'Accede a tu perfil de estudio para consultar el estatus en vivo de tus obras enviadas y administrar tus publicaciones.'
                : authView === 'forgot_request'
                ? 'Ingresa tu correo oficial registrado. Te enviaremos un código de seguridad de 6 dígitos para restablecer tu acceso.'
                : `Ingresa el código que enviamos a ${email} y define tu nueva contraseña.`}
            </p>
          </div>
        </div>

        {/* Alertas */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded text-xs font-mono">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* =================================================================== */}
        {/* VISTA 1: INICIAR SESIÓN                                             */}
        {/* =================================================================== */}
        {authView === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="font-okcok text-xs uppercase tracking-normal text-ea-black flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neutral-500" /> CONTRASEÑA *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('forgot_request');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] font-sans text-neutral-600 hover:text-black hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
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
        )}

        {/* =================================================================== */}
        {/* VISTA 2: SOLICITAR CÓDIGO DE RECUPERACIÓN                           */}
        {/* =================================================================== */}
        {authView === 'forgot_request' && (
          <form onSubmit={handleRequestCodeSubmit} className="mt-5 space-y-4">
            <div className="space-y-1">
              <label className="font-okcok text-xs uppercase tracking-normal text-ea-black flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500" /> CORREO ELECTRÓNICO REGISTRADO *
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-ea-black text-white font-okcok text-sm uppercase tracking-wider rounded hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <KeyRound className="w-4 h-4" />
              {isLoading ? 'ENVIANDO CÓDIGO...' : 'ENVIAR CÓDIGO DE SEGURIDAD'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthView('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-mono text-xs text-neutral-600 hover:text-black underline cursor-pointer"
              >
                ← Volver a Iniciar Sesión
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VISTA 3: RESTABLECER CONTRASEÑA CON CÓDIGO                          */}
        {/* =================================================================== */}
        {authView === 'forgot_reset' && (
          <form onSubmit={handleResetPasswordSubmit} className="mt-5 space-y-4">
            {/* Campo Código */}
            <div className="space-y-1">
              <label className="font-okcok text-xs uppercase tracking-normal text-ea-black flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-neutral-500" /> CÓDIGO DE 6 DÍGITOS *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full h-12 bg-white border border-ea-black/30 rounded px-3.5 text-center text-xl font-mono tracking-widest text-ea-black placeholder:text-neutral-300 focus:outline-hidden focus:border-ea-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Campo Nueva Contraseña */}
            <div className="space-y-1">
              <label className="font-okcok text-xs uppercase tracking-normal text-ea-black flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-500" /> NUEVA CONTRASEÑA *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full h-11 bg-white border border-ea-black/30 rounded px-3.5 pr-10 text-xs sm:text-sm font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:border-ea-black focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="space-y-1">
              <label className="font-okcok text-xs uppercase tracking-normal text-ea-black flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-500" /> CONFIRMAR NUEVA CONTRASEÑA *
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full h-11 bg-white border border-ea-black/30 rounded px-3.5 text-xs sm:text-sm font-sans text-ea-black placeholder:text-neutral-400 focus:outline-hidden focus:border-ea-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Botón de Restablecer */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-ea-black text-white font-okcok text-sm uppercase tracking-wider rounded hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? 'ACTUALIZANDO...' : 'GUARDAR CONTRASEÑA E INGRESAR'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 flex items-center justify-between font-mono text-xs text-neutral-600">
              <button
                type="button"
                onClick={() => {
                  setAuthView('forgot_request');
                  setErrorMessage(null);
                }}
                className="hover:text-black underline cursor-pointer"
              >
                Reenviar código
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthView('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="hover:text-black underline cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

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
