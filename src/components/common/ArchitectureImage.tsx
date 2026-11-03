import React, { useState } from 'react';
import { Camera, Layers } from 'lucide-react';

export interface ArchitectureImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: '16/10' | '16/9' | '4/3' | '1/1' | 'auto';
  photographer?: string;
  isPlan?: boolean;
  priority?: boolean;
  objectFit?: 'cover' | 'contain';
  onClick?: () => void;
  caption?: string;
}

/**
 * ArchitectureImage Component
 * 
 * Implements ArchDaily & Dezeen image delivery standards:
 * 1. Zero Cumulative Layout Shift (CLS = 0) with reserved aspect ratio container
 * 2. Native loading="lazy" + decoding="async" for offscreen performance
 * 3. Graceful skeleton blur-in transition
 * 4. Micro-credit badges for Photographer & Planimetría (Divisare / ArchDaily standard)
 * 5. Architectural fallback pattern on network error
 */
export const ArchitectureImage: React.FC<ArchitectureImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = '16/10',
  photographer,
  isPlan = false,
  priority = false,
  objectFit = 'cover',
  onClick,
  caption,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectClass =
    aspectRatio === '16/10'
      ? 'aspect-[16/10]'
      : aspectRatio === '16/9'
      ? 'aspect-video'
      : aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : '';

  return (
    <div
      className={`relative overflow-hidden bg-[#F5F4F0] border border-ea-black/10 select-none ${aspectClass} ${className}`}
      onClick={onClick}
    >
      {/* Background Architectural Grid Pattern for Placeholder */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #1A1A1A 1px, transparent 0)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Skeleton Pulse before image loads */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-200/50 animate-pulse" />
      )}

      {/* Image Element */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full transition-all duration-700 ease-out ${
            objectFit === 'contain' ? 'object-contain' : 'object-cover'
          } ${isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-[1.02] blur-xs'}`}
        />
      ) : (
        /* Fallback if image fails to load */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-ea-black/40">
          <Layers className="w-8 h-8 mb-2 stroke-1" />
          <span className="font-mono text-[10px] uppercase tracking-wider">
            Registro Visual EA
          </span>
          <span className="font-mono text-[9px] text-ea-black/30 mt-1 max-w-[200px] truncate">
            {alt}
          </span>
        </div>
      )}

      {/* Micro-Badges: Planimetría / Fotógrafo (ArchDaily/Divisare style) */}
      {(isPlan || photographer) && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none z-10">
          {isPlan ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ea-black/85 backdrop-blur-xs text-white font-mono text-[9px] uppercase tracking-widest border border-white/20">
              <Layers className="w-3 h-3" /> Planimetría
            </span>
          ) : <span />}

          {photographer && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-ea-black font-mono text-[9px] uppercase tracking-wider border border-ea-black/20 shadow-xs">
              <Camera className="w-2.5 h-2.5" /> {photographer}
            </span>
          )}
        </div>
      )}

      {/* Optional Editorial Caption Bar */}
      {caption && isLoaded && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ea-black/70 via-ea-black/30 to-transparent p-3 pt-6 text-white text-[11px] font-inter opacity-0 hover:opacity-100 transition-opacity">
          {caption}
        </div>
      )}
    </div>
  );
};
