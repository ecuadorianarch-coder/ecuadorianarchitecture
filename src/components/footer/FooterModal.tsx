import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Mail, Send, Sparkles, Building2, MessageSquare, ArrowUpRight } from 'lucide-react';

export type FooterModalTab = 'feedback' | 'publicidad' | 'proyectos';

interface FooterModalProps {
  isOpen: boolean;
  initialTab?: FooterModalTab;
  onClose: () => void;
}

// Tape strip component matching authentic Ecuadorian Architecture aesthetic
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

export const FooterModal: React.FC<FooterModalProps> = ({
  isOpen,
  initialTab = 'feedback',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<FooterModalTab>(initialTab);
  const modalRef = useRef<HTMLDivElement>(null);

  // Form states
  // 1. Feedback
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('Sugerencia editorial');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // 2. Project submission
  const [projTitle, setProjTitle] = useState('');
  const [projAuthors, setProjAuthors] = useState('');
  const [projLocation, setProjLocation] = useState('');
  const [projType, setProjType] = useState('Obra construida');
  const [projLink, setProjLink] = useState('');
  const [projEmail, setProjEmail] = useState('');
  const [projSuccess, setProjSuccess] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('ea_user_feedback') || '[]');
      existing.push({
        id: Date.now().toString(),
        name: feedbackName || 'Anónimo',
        email: feedbackEmail || 'No provisto',
        type: feedbackType,
        message: feedbackMessage,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('ea_user_feedback', JSON.stringify(existing));
    } catch (err) {
      console.warn('Could not store feedback locally', err);
    }

    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackSuccess(false);
    }, 4000);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projLink.trim() || !projEmail.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('ea_project_submissions') || '[]');
      existing.push({
        id: Date.now().toString(),
        title: projTitle,
        authors: projAuthors,
        location: projLocation,
        type: projType,
        link: projLink,
        email: projEmail,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('ea_project_submissions', JSON.stringify(existing));
    } catch (err) {
      console.warn('Could not store project submission', err);
    }

    setProjSuccess(true);
    setTimeout(() => {
      setProjTitle('');
      setProjAuthors('');
      setProjLocation('');
      setProjLink('');
      setProjEmail('');
      setProjSuccess(false);
    }, 4500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Información y participación en Ecuadorian Architecture"
        className="relative w-full max-w-[680px] max-h-[92vh] flex flex-col bg-[#FDFDFD] border-2 border-ea-black shadow-[8px_8px_0px_rgba(0,0,0,1)] select-text overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Architectural tape strips on corners */}
        <TapeStrip className="-top-2 left-6 -rotate-3" />
        <TapeStrip className="-top-2 right-6 rotate-2" />

        {/* Top Header with title and close button */}
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-6 pb-3 border-b border-ea-black/15 bg-white shrink-0">
          <div className="flex flex-col">
            <span className="font-anton text-xs sm:text-sm tracking-widest text-ea-black/50 uppercase">
              ECUADORIAN ARCHITECTURE • BUZÓN & ALIANZAS
            </span>
            <span className="font-okcok text-lg sm:text-xl md:text-2xl tracking-wide text-ea-black uppercase mt-0.5">
              {activeTab === 'feedback' && 'Danos tu Feedback'}
              {activeTab === 'publicidad' && 'Publicita con Nosotros'}
              {activeTab === 'proyectos' && 'Envía tus Proyectos'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-ea-black/60 hover:text-ea-black hover:bg-ea-black/5 rounded-xs transition-colors cursor-pointer"
            aria-label="Cerrar modal"
            data-cursor
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 border-b-2 border-ea-black bg-ea-offwhite/80 shrink-0 text-center">
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`py-2.5 sm:py-3 px-2 font-anton text-[11px] sm:text-xs md:text-sm tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-white text-ea-black border-b-2 border-ea-black -mb-[2px] font-bold shadow-2xs'
                : 'text-ea-black/60 hover:text-ea-black hover:bg-black/5'
            }`}
          >
            Feedback
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('publicidad')}
            className={`py-2.5 sm:py-3 px-2 font-anton text-[11px] sm:text-xs md:text-sm tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'publicidad'
                ? 'bg-white text-ea-black border-b-2 border-ea-black -mb-[2px] font-bold shadow-2xs'
                : 'text-ea-black/60 hover:text-ea-black hover:bg-black/5'
            }`}
          >
            Publicidad
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('proyectos')}
            className={`py-2.5 sm:py-3 px-2 font-anton text-[11px] sm:text-xs md:text-sm tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'proyectos'
                ? 'bg-white text-ea-black border-b-2 border-ea-black -mb-[2px] font-bold shadow-2xs'
                : 'text-ea-black/60 hover:text-ea-black hover:bg-black/5'
            }`}
          >
            Enviar Proyecto
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1">
          {/* ========================================================================= */}
          {/* TAB 1: DANOS TU FEEDBACK                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <p className="font-inter text-xs sm:text-sm text-ea-black/75 leading-relaxed">
                Este espacio se construye con el criterio riguroso de su comunidad.
                Compártenos observaciones sobre el contenido, errores tipográficos o cartográficos, o propuestas de mejora para la plataforma.
              </p>

              {feedbackSuccess ? (
                <div className="p-4 border-2 border-ea-black bg-ea-offwhite flex items-center gap-3 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-ea-black text-white flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-anton text-sm tracking-wider uppercase text-ea-black">
                      ¡Comentario Recibido!
                    </h4>
                    <p className="font-inter text-xs text-ea-black/70">
                      Tu mensaje ha sido registrado en el buzón editorial de Ecuadorian Architecture.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                        Tu Nombre (Opcional)
                      </label>
                      <input
                        type="text"
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        placeholder="Ej. Arq. Mateo Morales"
                        className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                      />
                    </div>
                    <div>
                      <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                        Correo de Contacto (Opcional)
                      </label>
                      <input
                        type="email"
                        value={feedbackEmail}
                        onChange={(e) => setFeedbackEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                      Categoría del Feedback
                    </label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                    >
                      <option value="Sugerencia editorial">Sugerencia editorial</option>
                      <option value="Crítica o corrección de obra">Crítica o corrección técnica de obra</option>
                      <option value="Reporte de errata o bug">Reporte de errata o error en la web</option>
                      <option value="Propuesta de colaboración">Propuesta de colaboración académica</option>
                      <option value="Felicitación o comentario">Otro / Reflexión libre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                      Tu Mensaje o Sugerencia *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Escribe aquí tus comentarios, observaciones sobre el archivo o solicitudes..."
                      className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black resize-y transition-all"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <a
                      href="mailto:contacto@ecuadorianarch.com?subject=Feedback%20Ecuadorian%20Architecture"
                      className="inline-flex items-center gap-1.5 text-xs font-inter text-ea-black/60 hover:text-ea-black transition-colors"
                      data-cursor
                    >
                      <Mail className="w-3.5 h-3.5" />
                      O escríbenos a contacto@ecuadorianarch.com
                    </a>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-ea-black text-white font-anton text-xs sm:text-sm tracking-wider uppercase hover:bg-ea-black/85 active:scale-95 transition-all shadow-xs cursor-pointer"
                      data-cursor
                    >
                      <Send className="w-3.5 h-3.5" />
                      Enviar Feedback
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PUBLICITA CON NOSOTROS                                             */}
          {/* ========================================================================= */}
          {activeTab === 'publicidad' && (
            <div className="space-y-4">
              <p className="font-inter text-xs sm:text-sm text-ea-black/75 leading-relaxed">
                Ecuadorian Architecture es el archivo y medio de referencia para la comunidad arquitectónica,
                conectando estudios líderes, fabricantes de materiales, constructoras y marcas con miles de profesionales en Ecuador y América Latina.
              </p>

              {/* Advertising Formats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 border border-ea-black bg-ea-offwhite/50 flex flex-col justify-between">
                  <div>
                    <span className="font-anton text-[10px] tracking-wider text-ea-black/50 uppercase">
                      FORMATO 01
                    </span>
                    <h4 className="font-anton text-xs sm:text-sm tracking-wider uppercase text-ea-black mt-1">
                      Alas Laterales
                    </h4>
                    <p className="font-inter text-[11px] text-ea-black/70 mt-1 leading-snug">
                      Presencia fija bilateral (Sticky Sponsor Wings) en la lectura monográfica de proyectos.
                    </p>
                  </div>
                  <span className="font-okcok text-[11px] text-ea-black uppercase mt-3">
                    ALTO IMPACTO VISUAL
                  </span>
                </div>

                <div className="p-3.5 border border-ea-black bg-ea-offwhite/50 flex flex-col justify-between">
                  <div>
                    <span className="font-anton text-[10px] tracking-wider text-ea-black/50 uppercase">
                      FORMATO 02
                    </span>
                    <h4 className="font-anton text-xs sm:text-sm tracking-wider uppercase text-ea-black mt-1">
                      In-Feed Catalog
                    </h4>
                    <p className="font-inter text-[11px] text-ea-black/70 mt-1 leading-snug">
                      Tarjetas patrocinadas integradas orgánicamente en el catálogo general de proyectos y territorios.
                    </p>
                  </div>
                  <span className="font-okcok text-[11px] text-ea-black uppercase mt-3">
                    INTEGRACIÓN EDITORIAL
                  </span>
                </div>

                <div className="p-3.5 border border-ea-black bg-ea-offwhite/50 flex flex-col justify-between">
                  <div>
                    <span className="font-anton text-[10px] tracking-wider text-ea-black/50 uppercase">
                      FORMATO 03
                    </span>
                    <h4 className="font-anton text-xs sm:text-sm tracking-wider uppercase text-ea-black mt-1">
                      Dossier Crítico
                    </h4>
                    <p className="font-inter text-[11px] text-ea-black/70 mt-1 leading-snug">
                      Publicación monográfica de obra o soluciones constructivas con análisis crítico y fotografía de campo.
                    </p>
                  </div>
                  <span className="font-okcok text-[11px] text-ea-black uppercase mt-3">
                    CONTENIDO DE FONDO
                  </span>
                </div>
              </div>

              {/* Direct Commercial Contact CTA */}
              <div className="p-4 border-2 border-ea-black bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-anton text-xs sm:text-sm tracking-wider uppercase text-ea-black">
                    Solicita el Media Kit Editorial
                  </h4>
                  <p className="font-inter text-[11px] sm:text-xs text-ea-black/65">
                    Métricas de audiencia, tarifas de pauta y calendario de publicaciones anual.
                  </p>
                </div>

                <a
                  href="mailto:comercial@ecuadorianarch.com?subject=Solicitud%20de%20Media%20Kit%20-%20Ecuadorian%20Architecture"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-ea-black text-white font-anton text-xs tracking-wider uppercase hover:bg-ea-black/85 active:scale-95 transition-all shrink-0 cursor-pointer"
                  data-cursor
                >
                  <Mail className="w-3.5 h-3.5" />
                  Escribir a Comercial
                </a>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ENVÍA TUS PROYECTOS                                                */}
          {/* ========================================================================= */}
          {activeTab === 'proyectos' && (
            <div className="space-y-4">
              <p className="font-inter text-xs sm:text-sm text-ea-black/75 leading-relaxed">
                La convocatoria editorial permanece abierta durante todo el año para obras construidas en Ecuador,
                investigaciones de grado/posgrado (Academia) y cartografías del paisaje (Territorios).
              </p>

              {/* Editorial Requirements Badge */}
              <div className="p-3 border border-dashed border-ea-black/40 bg-ea-offwhite/40 text-xs font-inter text-ea-black/70 space-y-1">
                <span className="font-anton text-[10px] tracking-wider uppercase text-ea-black block">
                  REQUISITOS OBLIGATORIOS DE POSTULACIÓN:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Fotografía arquitectónica profesional en alta resolución.</li>
                  <li>Memoria descriptiva conceptual y créditos del equipo técnico.</li>
                  <li>Planimetría en formato vectorial o PDF (plantas, cortes y elevaciones).</li>
                </ul>
              </div>

              {projSuccess ? (
                <div className="p-4 border-2 border-ea-black bg-ea-offwhite flex items-center gap-3 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-ea-black text-white flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-anton text-sm tracking-wider uppercase text-ea-black">
                      ¡Postulación Enviada con Éxito!
                    </h4>
                    <p className="font-inter text-xs text-ea-black/70">
                      El comité editorial revisará la documentación técnica y te contactará a la brevedad.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProjectSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                        Nombre del Proyecto / Obra *
                      </label>
                      <input
                        required
                        type="text"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        placeholder="Ej. Casa de las Tejedoras"
                        className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                        Estudio / Autor(es) *
                      </label>
                      <input
                        required
                        type="text"
                        value={projAuthors}
                        onChange={(e) => setProjAuthors(e.target.value)}
                        placeholder="Ej. Al Borde / Natura Futura"
                        className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                        Ubicación (Ciudad o Provincia)
                      </label>
                      <input
                        type="text"
                        value={projLocation}
                        onChange={(e) => setProjLocation(e.target.value)}
                        placeholder="Ej. Quito / Manabí / Cuenca"
                        className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                        Pilar Editorial
                      </label>
                      <select
                        value={projType}
                        onChange={(e) => setProjType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                      >
                        <option value="Proyectos (Obra construida)">Proyectos (Obra construida)</option>
                        <option value="Academia (Tesis o Investigación)">Academia (Tesis o Investigación)</option>
                        <option value="Territorios (Paisaje y Urbanismo)">Territorios (Paisaje y Urbanismo)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                      Enlace de Descarga (Drive / WeTransfer / Dropbox) *
                    </label>
                    <input
                      required
                      type="url"
                      value={projLink}
                      onChange={(e) => setProjLink(e.target.value)}
                      placeholder="https://drive.google.com/... o https://we.tl/..."
                      className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-anton text-[10px] sm:text-[11px] tracking-wider text-ea-black/70 uppercase mb-1">
                      Correo de Contacto *
                    </label>
                    <input
                      required
                      type="email"
                      value={projEmail}
                      onChange={(e) => setProjEmail(e.target.value)}
                      placeholder="contacto@tu-estudio.com"
                      className="w-full px-3 py-2 bg-white border border-ea-black font-inter text-xs sm:text-sm text-ea-black outline-none focus:ring-1 focus:ring-ea-black transition-all"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <a
                      href="mailto:convocatorias@ecuadorianarch.com?subject=Postulaci%C3%B3n%20Editorial%20-%20Ecuadorian%20Architecture"
                      className="inline-flex items-center gap-1.5 text-xs font-inter text-ea-black/60 hover:text-ea-black transition-colors"
                      data-cursor
                    >
                      <Mail className="w-3.5 h-3.5" />
                      O envía a convocatorias@ecuadorianarch.com
                    </a>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-ea-black text-white font-anton text-xs sm:text-sm tracking-wider uppercase hover:bg-ea-black/85 active:scale-95 transition-all shadow-xs cursor-pointer"
                      data-cursor
                    >
                      <Send className="w-3.5 h-3.5" />
                      Postular Proyecto
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 sm:px-7 py-3 bg-ea-offwhite/60 border-t border-ea-black/15 flex items-center justify-between text-[10px] sm:text-[11px] font-inter text-ea-black/50 shrink-0">
          <span>Ecuadorian Architecture © {new Date().getFullYear()}</span>
          <span>Buzón oficial & Consejo Editorial</span>
        </div>
      </div>
    </div>
  );
};
