import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
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
  const { trackImpression, getClickUrl } = useAdvertising();
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // If modern campaign is provided
  const isModern = Boolean(modernCampaign);
  const brandName = brand?.name || modernCampaign?.name || campaign?.brandName || 'Auspiciante';
  const brandCategory = brand?.category || campaign?.sponsorCategory || 'Alianza Arquitectónica';
  const kicker = modernCampaign?.kicker || campaign?.tagLabel || 'PATROCINIO';
  const title = modernCampaign?.title || campaign?.campaignTitle || '';
  const subtitle = modernCampaign?.subtitle || '';
  const ctaText = modernCampaign?.ctaText || 'EXPLORAR CATÁLOGO';

  // Assets list
  const assets: { url: string; alt?: string; caption?: string }[] = isModern && modernCampaign
    ? [
        {
          url: modernCampaign.desktopAsset,
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

  return (
    <a
      ref={cardRef}
      href={destinationUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group relative flex flex-col w-full h-[500px] xl:h-[550px] 2xl:h-[600px] rounded-[2px] transition-all duration-300 p-2 2xl:p-2.5 cursor-pointer overflow-hidden select-none ${
        isDark
          ? 'bg-[#111317]/95 border border-white/20 hover:border-white/50 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-md hover:-translate-y-1'
          : 'bg-[#FAF8F5] border-2 border-ea-black shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#000] hover:-translate-y-1'
      } ${className}`}
      aria-label={`Pauta publicitaria de ${brandName}: ${title}`}
      data-cursor
    >
      {/* 1. Arte Visual Predefinido (Sin textos invasivos superpuestos) */}
      <div
        className={`relative flex-1 w-full overflow-hidden rounded-[1px] ${
          isDark ? 'bg-black/60 border border-white/15' : 'bg-[#EAE6DD] border border-ea-black/20'
        }`}
      >
        {/* Micro-etiqueta "AD" visible encima de la foto solo en hover */}
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
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
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={asset.url}
              alt={asset.alt || title || brandName}
              className="w-full h-full object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
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

      {/* 2. Barra de CTA */}
      <div
        className={`mt-2 2xl:mt-2.5 px-2.5 py-2.5 2xl:py-3 flex items-center justify-between gap-1.5 transition-colors duration-200 shrink-0 ${
          isDark
            ? 'bg-white text-black group-hover:bg-neutral-200 shadow-md'
            : 'bg-ea-black text-white group-hover:bg-[#181818] shadow-[2px_2px_0px_rgba(0,0,0,0.15)]'
        }`}
      >
        <span
          className={`font-anton text-[11px] 2xl:text-[12px] tracking-wider uppercase truncate ${
            isDark ? 'text-black' : 'text-white'
          }`}
        >
          {ctaText || 'EXPLORAR CATÁLOGO'}
        </span>
        <ArrowUpRight
          className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ${
            isDark ? 'text-black' : 'text-white'
          }`}
        />
      </div>

      {/* 3. Texto corto editorial abajo */}
      <div className="mt-2 px-1 pb-0.5 flex flex-col gap-0.5 shrink-0">
        <h4
          className={`font-anton text-[12px] 2xl:text-[13px] leading-tight tracking-wider uppercase truncate group-hover:underline ${
            isDark ? 'text-white' : 'text-ea-black'
          }`}
        >
          {brandName}
        </h4>

        {(subtitle || currentAsset?.caption || brandCategory || title) && (
          <p
            className={`font-creato text-[9px] 2xl:text-[9.5px] leading-snug uppercase line-clamp-2 ${
              isDark ? 'text-neutral-400' : 'text-ea-black/75'
            }`}
          >
            {subtitle || currentAsset?.caption || brandCategory || title}
          </p>
        )}
      </div>
    </a>
  );
};
