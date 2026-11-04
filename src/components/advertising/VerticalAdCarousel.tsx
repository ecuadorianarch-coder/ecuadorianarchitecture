import React, { useState, useEffect, useRef } from 'react';
import { AdvertisementCampaign, AdCampaign, SponsorBrand } from '../../types/advertising';
import { useAdvertising } from '../../context/AdvertisingContext';

interface VerticalAdCarouselProps {
  campaign?: AdvertisementCampaign;
  modernCampaign?: AdCampaign;
  brand?: SponsorBrand;
  position: 'izquierdo' | 'derecho';
  isPreview?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export const VerticalAdCarousel: React.FC<VerticalAdCarouselProps> = ({
  campaign,
  modernCampaign,
  brand,
  position,
  isPreview = false,
  theme = 'light',
  className = '',
}) => {
  const { trackImpression, getClickUrl, openNewsletterModal } = useAdvertising();
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // If modern campaign is provided
  const isModern = Boolean(modernCampaign);
  const brandName = brand?.name || modernCampaign?.name || campaign?.brandName || 'Ecuadorian Architecture';
  const brandCategory = brand?.category || campaign?.sponsorCategory || 'Comunidad Editorial';
  const kicker = modernCampaign?.kicker || campaign?.tagLabel || 'NEWSLETTER EA';
  const title = modernCampaign?.title || campaign?.campaignTitle || 'SUSCRÍBETE A NUESTRO NEWSLETTER';
  const subtitle = modernCampaign?.subtitle || 'Investigaciones, proyectos y críticas sobre arquitectura ecuatoriana.';
  const ctaText = modernCampaign?.ctaText || 'SUSCRÍBETE A NUESTRO NEWSLETTER';

  // Assets list (prioriza el arte vertical explícito de skyscraper)
  const verticalAssetUrl =
    modernCampaign?.verticalBannerAsset ||
    modernCampaign?.desktopAsset ||
    '';

  const assets: { url: string; alt?: string; caption?: string }[] = isModern && modernCampaign
    ? [
        {
          url: verticalAssetUrl,
          alt: modernCampaign.title,
          caption: modernCampaign.title,
        },
      ]
    : campaign?.bannerAssets || [];

  const destinationUrl = isModern && modernCampaign
    ? isPreview
      ? modernCampaign.destinationUrl
      : getClickUrl(modernCampaign, 'skyscrapers-laterales')
    : campaign?.destinationUrl || '#';

  // Track impression: >= 50% visible for >= 1s continuously
  useEffect(() => {
    if (!cardRef.current || isPreview || !isModern || !modernCampaign) return;
    let visibilityTimer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!visibilityTimer) {
              visibilityTimer = setTimeout(() => {
                trackImpression(modernCampaign.id, 'skyscrapers-laterales');
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

    observer.observe(cardRef.current);
    return () => {
      if (visibilityTimer) clearTimeout(visibilityTimer);
      observer.disconnect();
    };
  }, [isModern, modernCampaign, isPreview, trackImpression]);

  // Auto-cycling with hover pause (if multi-asset)
  useEffect(() => {
    if (assets.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % assets.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [assets.length, isPaused]);

  if (assets.length === 0) return null;

  const currentAsset = assets[currentIndex];

  const isDark = theme === 'dark';

  const handleClick = (e: React.MouseEvent) => {
    if (destinationUrl === '#newsletter' || !destinationUrl.startsWith('http') || destinationUrl.includes('#')) {
      e.preventDefault();
      openNewsletterModal();
    }
  };

  return (
    <a
      ref={cardRef}
      href={destinationUrl}
      onClick={handleClick}
      target={destinationUrl.startsWith('http') ? '_blank' : undefined}
      rel={destinationUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group relative flex flex-col w-full h-full rounded-[2px] transition-all duration-300 cursor-pointer overflow-hidden select-none border ${
        isDark
          ? 'bg-black/90 border-white/20 hover:border-white/50'
          : 'bg-neutral-100 border-ea-black/30 hover:border-ea-black'
      } ${className}`}
      aria-label={`Pauta publicitaria de ${brandName}: ${title}`}
      data-cursor
    >
      {/* 1. Arte Visual Predefinido 100% Puro (Sin textos ni botones sobrepuestos) */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Micro-etiqueta "AD" discreta */}
        <div className="absolute top-2 left-2 z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span
            className={`font-mono text-[8px] font-bold tracking-widest uppercase backdrop-blur-xs px-1.5 py-0.5 rounded-[1px] shadow-xs ${
              isDark
                ? 'text-black bg-white/90 border border-white/50'
                : 'text-white bg-ea-black/85 border border-white/25'
            }`}
          >
            AD
          </span>
        </div>

        {assets.map((asset, idx) => (
          <div
            key={asset.url + idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center overflow-hidden ${
              idx === currentIndex ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Fondo difuminado ambiental para que cualquier proporción de pantalla se integre sin bordes vacíos */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-md opacity-25 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${asset.url})` }}
              aria-hidden="true"
            />
            {/* Arte publicitario nítido: 100% visible, NUNCA recortado */}
            <img
              src={asset.url}
              alt={asset.alt || title || brandName}
              className="relative w-full h-full object-contain object-center z-1 group-hover:scale-[1.015] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </div>
        ))}

        {/* Indicadores sutiles en caso de múltiples artes */}
        {assets.length > 1 && (
          <div className="absolute top-2 right-2 bg-ea-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded-[2px] flex items-center gap-1 z-10 pointer-events-none">
            {assets.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex ? 'w-3 bg-white' : 'w-1 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </a>
  );
};
