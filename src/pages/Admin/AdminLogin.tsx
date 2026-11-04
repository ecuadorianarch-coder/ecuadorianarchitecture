import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(username, password, rememberMe);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || 'Credenciales no válidas.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0d0d] text-white flex flex-col justify-between font-inter relative overflow-hidden select-none">
      {/* Background architectural grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Bar */}
      <header className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between z-10 backdrop-blur-sm bg-black/40">
        <div className="flex items-center gap-3">
          <span className="font-anton text-xl tracking-widest text-white">ECUADORIAN ARCHITECTURE</span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 border-l border-white/20 pl-3 hidden sm:inline">
            CORE CMS &bull; EDITORIAL PORTAL
          </span>
        </div>

        <a
          href="/"
          className="flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors uppercase tracking-wider py-1 px-2 border border-white/10 hover:border-white/30 rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la Web</span>
        </a>
      </header>

      {/* Center Login Box */}
      <main className="w-full flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-[460px] bg-[#161616] border border-white/15 p-8 sm:p-10 shadow-2xl relative">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white" />

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[11px] font-mono uppercase tracking-wider text-white/70 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acceso Restringido &bull; Editores</span>
            </div>
            <h1 className="font-anton text-3xl sm:text-4xl tracking-wider uppercase text-white mb-2">
              PANEL DE CONTROL
            </h1>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Ingresa tus credenciales editoriales para modificar contenidos, proyectos, artículos y pautas publicitarias de Ecuadorian Architecture.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/70 mb-2">
                Usuario Editorial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. admin o ecuadorianarch"
                  autoComplete="username"
                  className="w-full bg-[#1e1e1e] border border-white/15 text-white pl-10 pr-4 py-2.5 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-white/70">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-[10px] font-mono text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider underline underline-offset-2"
                >
                  {showHint ? 'Ocultar ayuda' : '¿Olvidaste o primer acceso?'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#1e1e1e] border border-white/15 text-white pl-10 pr-10 py-2.5 text-sm rounded-none focus:outline-none focus:border-white transition-colors placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Credentials Info Card */}
            {showHint && (
              <div className="p-3 bg-white/5 border border-white/10 text-xs text-white/70 space-y-2">
                <div className="font-mono text-[11px] text-white/70 p-2 bg-black/40 border border-white/10 rounded space-y-1.5">
                  <p className="font-sans text-xs text-white/90 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acceso restringido y autenticado.</span>
                  </p>
                  <p className="text-[10.5px] text-white/60 leading-relaxed">
                    Utiliza tus credenciales editoriales asignadas (<code className="text-white/80 bg-white/10 px-1 py-0.5 rounded">admin</code>, <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded">ecuadorianarch</code> o <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded">editor</code>). Para restablecer accesos, contacta a la dirección técnica en <span className="text-white underline">direccion@ecuadorianarch.com</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70 hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-none border-white/30 bg-black/50 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Mantener sesión iniciada (7 días)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/50 py-3 px-4 font-anton text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>VERIFICANDO...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>INGRESAR AL PANEL CMS</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Security Note */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 font-mono">
            <span>SESIÓN ENCRIPTADA</span>
            <span>v2.4 &bull; 2026</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 font-mono gap-2 z-10 bg-black/40">
        <div>
          &copy; {new Date().getFullYear()} ECUADORIAN ARCHITECTURE &bull; Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-4">
          <span>PORTAL EDITORIAL PRIVADO</span>
        </div>
      </footer>
    </div>
  );
};
