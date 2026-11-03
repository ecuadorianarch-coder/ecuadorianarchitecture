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
  const { trackImpression, getClickUrl } = useAdvertising();
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

  const brandName = brand?.name || 'Auspiciante';
  const destinationHref = isPreview
    ? campaign.destinationUrl || '#'
    : getClickUrl(campaign, 'inter-galeria');

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
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block w-full max-w-[728px] overflow-hidden rounded-[2px] border border-white/15 hover:border-white/40 transition-all shadow-md cursor-pointer"
          title={`Publicidad patrocinada: ${brandName} — Abrir sitio oficial`}
        >
          <img
            src={bannerImageUrl}
            alt={campaign.title || `Banner publicitario ${brandName}`}
            className="w-full h-[50px] xs:h-[56px] sm:h-[68px] md:h-[76px] object-cover sm:object-contain object-center group-hover:opacity-90 transition-opacity"
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
