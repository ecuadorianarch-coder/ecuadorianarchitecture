import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AdCampaign, SponsorBrand } from '../../types/advertising';
import { useAdvertising } from '../../context/AdvertisingContext';

interface HorizontalCarouselAdBannerProps {
  campaign: AdCampaign;
  brand?: SponsorBrand;
  onDismiss?: () => void;
  className?: string;
  isPreview?: boolean;
}

export const HorizontalCarouselAdBanner: React.FC<HorizontalCarouselAdBannerProps> = ({
  campaign,
  brand,
  onDismiss,
  className = '',
  isPreview = false,
}) => {
  const { trackImpression, getClickUrl, openNewsletterModal } = useAdvertising();
  const bannerRef = useRef<HTMLDivElement>(null);

  // Track valid impression: >= 50% visible for >= 1s continuously
  useEffect(() => {
    if (!bannerRef.current || isPreview) return;
    let visibilityTimer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!visibilityTimer) {
              visibilityTimer = setTimeout(() => {
                trackImpression(campaign.id, 'inter-galeria');
              }, 1000);
            }
          } else {
            if (visibilityTimer) {
              clearTimeout(visibilityTimer);
              visibilityTimer = null;
            }
          }
        });
      },
      { threshold: [0.5] }
    );

    observer.observe(bannerRef.current);
    return () => {
      if (visibilityTimer) clearTimeout(visibilityTimer);
      observer.disconnect();
    };
  }, [campaign.id, isPreview, trackImpression]);

  const brandName = brand?.name || 'Ecuadorian Architecture';
  const destinationHref = isPreview
    ? campaign.destinationUrl || '#'
    : getClickUrl(campaign, 'inter-galeria');

  const handleClick = (e: React.MouseEvent) => {
    if (
      destinationHref === '#newsletter' ||
      campaign.destinationUrl === '#newsletter' ||
      !destinationHref.startsWith('http') ||
      destinationHref.includes('#')
    ) {
      e.preventDefault();
      openNewsletterModal();
    }
  };

  // Arte gráfico limpio tipo banner leaderboard enviado directamente por la empresa
  const bannerImageUrl =
    campaign.horizontalBannerAsset ||
    campaign.desktopAsset ||
    campaign.mobileAsset;

  return (
    <div
      ref={bannerRef}
      className={`w-full bg-black/90 border-y border-white/10 z-20 shrink-0 select-none py-1.5 sm:py-2 flex items-center justify-center relative ${className}`}
      role="complementary"
      aria-label={`Publicidad patrocinada: ${brandName}`}
    >
      <div className="relative max-w-4xl w-full mx-auto px-2 sm:px-4 flex items-center justify-center">
        {/* Banner gráfico 100% puro entregado por la empresa - Sin textos HTML ni botones CTA sobrepuestos */}
        <a
          href={destinationHref}
          onClick={handleClick}
          target={destinationHref.startsWith('http') ? '_blank' : undefined}
          rel={destinationHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="group relative block w-full max-w-[728px] overflow-hidden rounded-[2px] border border-white/20 hover:border-white/50 transition-all shadow-md cursor-pointer bg-black/60"
          title={`Publicidad patrocinada: ${brandName}`}
        >
          {/* Micro-etiqueta AD */}
          <span className="absolute top-1 left-1.5 z-10 font-mono text-[7.5px] font-bold tracking-widest uppercase bg-black/80 text-white/80 px-1 py-0.2 rounded-[1px] pointer-events-none">
            AD
          </span>
          <img
            src={bannerImageUrl}
            alt={campaign.title || `Banner publicitario ${brandName}`}
            className="w-full h-[42px] xs:h-[48px] sm:h-[58px] md:h-[66px] object-contain object-center group-hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </a>

        {/* Cierre discreto opcional para el usuario */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute -top-1.5 right-1 sm:right-2 p-1 bg-black/85 hover:bg-black text-white/40 hover:text-white rounded-full border border-white/15 transition-colors cursor-pointer z-10 shadow-sm"
            title="Ocultar publicidad temporalmente"
            aria-label="Ocultar anuncio"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
