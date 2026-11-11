import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Send,
  MessageCircle,
  Mail,
  QrCode,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { buildProjectImageAlt, toSeoImageUrl } from '../../services/architectureSeo';

export interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    title: string;
    slug?: string;
    studio?: string;
    author?: string;
    institution?: string;
    location?: string;
    year?: string;
    heroImage?: string;
    coverImage?: string;
    category?: string;
    type?: string;
  };
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve project canonical section & URL
  const projectType =
    project.type ||
    (project.category === 'EXPEDIENTE TERRITORIAL'
      ? 'territorios'
      : project.category === 'INVESTIGACIÓN ACADÉMICA'
      ? 'academia'
      : 'proyectos');

  const slug = project.slug || project.id;
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ecuadorianarch.com';

  const shareUrl = `${baseUrl}/${projectType}/${slug}`;
  const displayStudio =
    project.studio || project.author || project.institution || 'Ecuador';
  const displayTitle = project.title || 'Proyecto Arquitectónico';
  const shareTitle = `${displayTitle} — ${displayStudio}`;
  const shareText = `Descubre "${displayTitle}" (${displayStudio}) en Ecuadorian Architecture:`;

  const rawCoverImage =
    project.heroImage ||
    project.coverImage ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  const coverImage = toSeoImageUrl(rawCoverImage, project, 'vista-principal') || rawCoverImage;

  // Native share handler
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const buildLightweightShareJpeg = async (imgUrl: string, fileSlug: string): Promise<File> => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = imgUrl;
    });

    const maxW = 1080;
    const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
    const targetW = Math.max(1, Math.round(img.naturalWidth * scale));
    const targetH = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82)
    );
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) throw new Error('Error generando JPEG');
    return new File([blob], `${fileSlug || 'proyecto'}-ecuadorianarch.jpg`, {
      type: 'image/jpeg',
    });
  };

  const handleShareWithPhoto = async () => {
    if (isPreparingPhoto) return;
    setIsPreparingPhoto(true);
    setPhotoFeedback(null);
    try {
      const jpegFile = await buildLightweightShareJpeg(coverImage, slug);
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };

      if (typeof nav.share === 'function' && typeof nav.canShare === 'function' && nav.canShare({ files: [jpegFile] })) {
        await nav.share({
          files: [jpegFile],
          title: shareTitle,
          text: `${shareText} ${shareUrl}`,
        });
      } else {
        const blobUrl = URL.createObjectURL(jpegFile);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = jpegFile.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          }
        } catch {}
        setPhotoFeedback('Foto JPEG ligera descargada y enlace copiado');
        setTimeout(() => setPhotoFeedback(null), 3500);
      }
    } catch {
      await handleCopyLink();
      setPhotoFeedback('Enlace copiado al portapapeles');
      setTimeout(() => setPhotoFeedback(null), 3000);
    } finally {
      setIsPreparingPhoto(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // User cancelled or aborted native share, ignore silently
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older mobile webviews
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // WhatsApp official universal deep-link (opens app directly on iOS & Android)
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText}\n\n${shareUrl}`
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `"${displayTitle}" (${displayStudio}) en @ecuadorianarch`
  )}&url=${encodeURIComponent(shareUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(`${displayTitle} — ${displayStudio}`)}`;

  const emailUrl = `mailto:?subject=${encodeURIComponent(
    `${displayTitle} — Ecuadorian Architecture`
  )}&body=${encodeURIComponent(
    `Te comparto este expediente de arquitectura publicado en Ecuadorian Architecture:\n\n${displayTitle} (${displayStudio})\nUbicación: ${project.location || 'Ecuador'}\n\nVer expediente completo:\n${shareUrl}`
  )}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    shareUrl
  )}&format=svg`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#141414] border-t-2 sm:border-2 border-white/20 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.9)] sm:shadow-[8px_8px_0px_rgba(0,0,0,0.8)] rounded-t-2xl sm:rounded-none max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile Drag/Pull Handle */}
        <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header Ribbon */}
        <div className="bg-[#1c1c1c] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            <span
              id="share-modal-title"
              className="font-anton text-xs sm:text-sm uppercase tracking-wider text-white truncate"
            >
              COMPARTIR EXPEDIENTE ARQUITECTÓNICO
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded-xs shrink-0 touch-manipulation"
            title="Cerrar ventana"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Content Body - Scrollable on small screens */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain flex-1">
          {/* Project Preview Card */}
          <div className="flex gap-3 bg-[#1e1e1e] border border-white/10 p-2.5 rounded-xs">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black shrink-0 overflow-hidden relative">
              <img
                src={coverImage}
                alt={buildProjectImageAlt(project)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-1 left-1 text-[8px] font-mono uppercase bg-black/80 px-1 text-white/70">
                {projectType}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h4 className="font-anton text-sm sm:text-base uppercase tracking-tight text-white leading-tight line-clamp-2">
                  {displayTitle}
                </h4>
                <p className="font-okcok text-xs text-amber-400 uppercase mt-0.5 truncate">
                  {displayStudio}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 uppercase">
                <span>{project.location || 'ECUADOR'}</span>
                {project.year && <span>• {project.year}</span>}
              </div>
            </div>
          </div>

          {/* Native Mobile Share Button (Primary on mobile) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-anton text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all cursor-pointer active:scale-[0.99] touch-manipulation"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>COMPARTIR EN CUALQUIER APLICACIÓN</span>
            </button>
          )}

          {/* Share / Download Lightweight Hero Photo JPEG */}
          <button
            type="button"
            onClick={handleShareWithPhoto}
            disabled={isPreparingPhoto}
            className="w-full py-2.5 px-4 bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#1a1a1a] border border-white/20 text-white font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 touch-manipulation"
          >
            <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isPreparingPhoto
                ? 'PREPARANDO FOTO...'
                : photoFeedback || 'COMPARTIR / GUARDAR CON HERO FOTO (JPEG)'}
            </span>
          </button>

          {/* Social Channels Grid */}
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
              Canales Directos:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 min-h-[68px] bg-[#1e1e1e] hover:bg-[#25D366]/20 active:bg-[#25D366]/30 border border-white/10 hover:border-[#25D366] text-white hover:text-[#25D366] transition-all group rounded-xs touch-manipulation active:scale-95"
                title="Compartir en WhatsApp"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold">WhatsApp</span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 min-h-[68px] bg-[#1e1e1e] hover:bg-[#0A66C2]/20 active:bg-[#0A66C2]/30 border border-white/10 hover:border-[#0A66C2] text-white hover:text-[#0A66C2] transition-all group rounded-xs touch-manipulation active:scale-95"
                title="Compartir en LinkedIn"
              >
                <div className="w-8 h-8 rounded-full bg-[#0A66C2]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-4 h-4 text-[#0A66C2]" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold">LinkedIn</span>
              </a>

              {/* X / Twitter */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 min-h-[68px] bg-[#1e1e1e] hover:bg-white/20 active:bg-white/30 border border-white/10 hover:border-white text-white transition-all group rounded-xs touch-manipulation active:scale-95"
                title="Compartir en X (Twitter)"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="font-bold text-sm">𝕏</span>
                </div>
                <span className="text-[10px] font-mono uppercase font-bold">X</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 min-h-[68px] bg-[#1e1e1e] hover:bg-[#229ED9]/20 active:bg-[#229ED9]/30 border border-white/10 hover:border-[#229ED9] text-white hover:text-[#229ED9] transition-all group rounded-xs touch-manipulation active:scale-95"
                title="Compartir en Telegram"
              >
                <div className="w-8 h-8 rounded-full bg-[#229ED9]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4 text-[#229ED9]" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold">Telegram</span>
              </a>

              {/* Email */}
              <a
                href={emailUrl}
                className="flex flex-col items-center justify-center gap-1.5 p-3 min-h-[68px] bg-[#1e1e1e] hover:bg-amber-400/20 active:bg-amber-400/30 border border-white/10 hover:border-amber-400 text-white hover:text-amber-400 transition-all group rounded-xs touch-manipulation active:scale-95"
                title="Enviar por correo"
              >
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold">Correo</span>
              </a>

              {/* QR Code */}
              <button
                type="button"
                onClick={() => setShowQr((prev) => !prev)}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 min-h-[68px] border transition-all cursor-pointer group rounded-xs touch-manipulation active:scale-95 ${
                  showQr
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
                    : 'bg-[#1e1e1e] hover:bg-white/20 active:bg-white/30 border-white/10 hover:border-white text-white'
                }`}
                title="Ver código QR para escanear con móvil"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${showQr ? 'bg-black text-amber-400' : 'bg-white/10'}`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold">QR</span>
              </button>
            </div>
          </div>

          {/* QR Code View (Expandable) */}
          {showQr && (
            <div className="p-3 bg-[#1e1e1e] border border-amber-400/40 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in">
              <div className="bg-white p-2 rounded-xs shrink-0">
                <img
                  src={qrImageUrl}
                  alt={`Código QR para ${displayTitle}`}
                  className="w-24 h-24 object-contain"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h5 className="font-anton text-xs uppercase tracking-wider text-amber-400">
                  ESCANEAR CON LA CÁMARA DEL CELULAR
                </h5>
                <p className="text-[10.5px] font-mono text-white/70 leading-relaxed">
                  Apunta con la cámara de cualquier teléfono para abrir directamente este expediente en tu dispositivo móvil.
                </p>
              </div>
            </div>
          )}

          {/* Direct Link Copy Bar */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest">
              Enlace Directo Permanente:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-[#1e1e1e] border border-white/20 px-3 py-2.5 text-xs font-mono text-white/90 select-all focus:outline-none focus:border-white truncate min-h-[44px]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 min-h-[44px] font-anton text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95 touch-manipulation ${
                  copied
                    ? 'bg-emerald-500 text-black font-bold shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-neutral-200 shadow-[2px_2px_0px_rgba(255,255,255,0.3)]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info note with iOS safe area padding */}
        <div className="bg-[#181818] border-t border-white/10 px-4 py-2.5 text-center text-[10px] font-mono text-white/40 uppercase shrink-0 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
          Ecuadorian Architecture • Difusión y pensamiento espacial contemporáneo
        </div>
      </div>
    </div>
  );
};
