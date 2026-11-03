import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, Bell, Shield, Compass } from 'lucide-react';
import { authService, AdminSession } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (session: AdminSession) => void;
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
  onSuccess,
}) => {
  // Mode: 'coming-soon' (default requested by user) or 'admin-login'
  const [viewMode, setViewMode] = useState<'coming-soon' | 'admin-login'>('coming-soon');

  // Newsletter / notify state
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Admin login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Session check
  const [session, setSession] = useState<AdminSession | null>(() => authService.getSession());

  useEffect(() => {
    if (isOpen) {
      setSession(authService.getSession());
      setViewMode('coming-soon');
      setError(null);
      setSuccessMessage(null);
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

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) return;

    try {
      const stored = JSON.parse(localStorage.getItem('ea_coming_soon_waitlist') || '[]');
      if (!stored.includes(notifyEmail)) {
        stored.push(notifyEmail);
        localStorage.setItem('ea_coming_soon_waitlist', JSON.stringify(stored));
      }
    } catch {
      // Fallback silent ignore
    }

    setIsSubscribed(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(loginUser, loginPass, rememberMe);
      setIsLoading(false);
      if (res.success && res.user) {
        setSession(res.user);
        setSuccessMessage(`¡Bienvenido de vuelta, ${res.user.name || res.user.user}!`);
        if (onSuccess) onSuccess(res.user);
      } else {
        setError(res.error || 'Credenciales incorrectas.');
      }
    }, 300);
  };

  const fillAdminHint = () => {
    setLoginUser('admin');
    setLoginPass('ecuadorianarch2026');
    setError(null);
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
    setSuccessMessage(null);
    setError(null);
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
        {/* VISTA PRINCIPAL: POP UP DICIENDO "PRÓXIMAMENTE"               */}
        {/* (Siempre se muestra primero al dar clic en Iniciar Sesión)     */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'coming-soon' ? (
          <div className="text-center pt-2 pb-1 space-y-4">
            {/* Top Badge Stamp */}
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ea-black text-white font-anton text-[10px] sm:text-[11px] tracking-widest uppercase">
                <Sparkles className="w-3 h-3 text-amber-400" />
                ACCESO A LA PLATAFORMA
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-400 text-ea-black font-anton text-[10px] sm:text-[11px] tracking-wider uppercase border border-ea-black font-bold">
                EN DESARROLLO
              </span>
            </div>

            {/* Main Headline */}
            <div>
              <h2
                id="auth-modal-title"
                className="font-okcok text-3xl sm:text-4xl md:text-[40px] uppercase text-ea-black tracking-normal leading-tight my-1"
              >
                PRÓXIMAMENTE
              </h2>
              <p className="font-creato text-xs sm:text-sm text-ea-black/75 max-w-md mx-auto leading-relaxed mt-2">
                Estamos preparando el portal de acceso y comunidad para la arquitectura ecuatoriana.
                Muy pronto podrás iniciar sesión, registrar tu estudio y participar activamente.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="bg-white border-2 border-ea-black/20 rounded-[6px] p-3.5 sm:p-4 text-left space-y-2.5 shadow-xs">
              <span className="font-anton text-[10px] sm:text-[11px] uppercase tracking-widest text-ea-black/50 block">
                LO QUE SE VIENE EN LA PLATAFORMA:
              </span>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-ea-black text-white flex items-center justify-center shrink-0 font-mono text-[10px] font-bold mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="font-anton text-xs uppercase text-ea-black tracking-wider">
                      Perfiles de Arquitectos & Estudios
                    </h4>
                    <p className="font-creato text-[11px] text-ea-black/60 leading-tight">
                      Gestión de monografías, fichas de obra y catálogo de proyectos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-ea-black text-white flex items-center justify-center shrink-0 font-mono text-[10px] font-bold mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="font-anton text-xs uppercase text-ea-black tracking-wider">
                      Mano de Obra & Maestros Mayores
                    </h4>
                    <p className="font-creato text-[11px] text-ea-black/60 leading-tight">
                      Reconocimiento a cuadrillas de artesanos y oficios constructivos locales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-ea-black text-white flex items-center justify-center shrink-0 font-mono text-[10px] font-bold mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="font-anton text-xs uppercase text-ea-black tracking-wider">
                      Notas Críticas & Visitas de Obra
                    </h4>
                    <p className="font-creato text-[11px] text-ea-black/60 leading-tight">
                      Aportes argumentados y debates fundamentados en cada proyecto.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Waitlist / Early Access Subscription */}
            <div className="pt-1">
              {isSubscribed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-900 rounded-[4px] text-xs font-creato flex items-center justify-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-medium">
                    ¡Anotado! Te avisaremos en cuanto el inicio de sesión esté habilitado.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="space-y-2">
                  <label className="block font-anton text-[11px] tracking-wider uppercase text-ea-black/80">
                    ¿Quieres ser de los primeros en acceder?
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-ea-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
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

            {/* Bottom Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-ea-black hover:bg-neutral-800 text-white rounded-[3px] font-anton text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>ENTENDIDO, VOLVER AL SITIO</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Discreet Editorial CMS Access for admin/team */}
              <div className="pt-2 text-center border-t border-ea-black/10">
                {session ? (
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href="/admin.html"
                      className="font-mono text-[11px] text-ea-black/70 hover:text-ea-black hover:underline inline-flex items-center gap-1.5"
                    >
                      <Shield className="w-3 h-3 text-amber-500" />
                      <span>Sesión de {session.name || session.user} activa · Ir al CMS Editorial →</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="font-mono text-[10px] text-red-600/70 hover:text-red-700 underline cursor-pointer"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode('admin-login')}
                    className="font-mono text-[11px] text-ea-black/50 hover:text-ea-black hover:underline cursor-pointer transition-colors inline-flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>¿Perteneces al equipo editorial? Iniciar sesión administrativa →</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* ADMIN LOGIN FORM (Acceso seguro para el equipo editorial)     */
          /* ------------------------------------------------------------- */
          <div className="pt-2 pb-1 space-y-4">
            <div className="text-center">
              <span className="font-anton text-xs tracking-[0.25em] uppercase text-ea-black/60 block">
                ECUADORIAN ARCHITECTURE
              </span>
              <h2
                id="auth-modal-title"
                className="font-okcok text-2xl sm:text-3xl uppercase text-ea-black mt-1 leading-tight"
              >
                ACCESO EDITORIAL CMS
              </h2>
              <p className="font-creato text-xs text-ea-black/60 mt-1">
                Panel exclusivo para redactores, administradores y editores de contenido.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-creato rounded-[3px] flex items-center gap-2 animate-in fade-in">
                <span className="font-bold shrink-0">✕</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-anton text-[11px] tracking-wider uppercase text-ea-black mb-1">
                  Usuario o Correo Administrativo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ea-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="admin o tu@correo.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-ea-black/40 focus:border-ea-black rounded-[3px] text-xs font-creato text-ea-black placeholder:text-ea-black/35 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-anton text-[11px] tracking-wider uppercase text-ea-black">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setError('Contacta al equipo técnico en ea@ecuadorianarch.com para restablecer tu contraseña.')
                    }
                    className="font-creato text-[11px] text-ea-black/60 hover:text-ea-black underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ea-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-ea-black/40 focus:border-ea-black rounded-[3px] text-xs font-creato text-ea-black placeholder:text-ea-black/35 focus:outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ea-black/40 hover:text-ea-black cursor-pointer"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-xs border-ea-black text-ea-black accent-black cursor-pointer"
                  />
                  <span className="font-creato text-xs text-ea-black/80">Recordar sesión</span>
                </label>

                <button
                  type="button"
                  onClick={fillAdminHint}
                  className="font-mono text-[10px] text-ea-black/50 hover:text-ea-black underline cursor-pointer"
                  title="Cargar credenciales demo"
                >
                  Demo Admin
                </button>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-ea-black hover:bg-neutral-800 text-white rounded-[3px] font-anton text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'VERIFICANDO...' : 'INICIAR SESIÓN CMS'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('coming-soon');
                    setError(null);
                  }}
                  className="w-full py-2 bg-transparent text-ea-black/60 hover:text-ea-black font-anton text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  ← Volver a Próximamente
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
