import React, { useEffect, useRef } from 'react';
import { AdCampaign, SponsorBrand } from '../../types/advertising';
import { useAdvertising } from '../../context/AdvertisingContext';

interface InFeedProjectAdCardProps {
  campaign: AdCampaign;
  brand?: SponsorBrand;
  layoutVariant?: 'vertical-card' | 'panoramic-card';
  isPreview?: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
}

export const InFeedProjectAdCard: React.FC<InFeedProjectAdCardProps> = ({
  campaign,
  brand,
  layoutVariant = 'vertical-card',
  isPreview = false,
  device,
}) => {
  const { trackImpression, getClickUrl, openNewsletterModal } = useAdvertising();
  const cardRef = useRef<HTMLDivElement>(null);

  // Track valid impression: >= 50% visible for >= 1s continuously (skip if preview)
  useEffect(() => {
    if (!cardRef.current || isPreview) return;
    let visibilityTimer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!visibilityTimer) {
              visibilityTimer = setTimeout(() => {
                trackImpression(campaign.id, 'entre-proyectos');
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
  }, [campaign.id, isPreview, trackImpression]);

  const brandName = brand?.name || 'Ecuadorian Architecture';

  // Format destination URL display
  let cleanDomain = 'ecuadorianarchitecture.com';
  try {
    if (campaign.destinationUrl && campaign.destinationUrl.startsWith('http')) {
      cleanDomain = new URL(campaign.destinationUrl).hostname.replace('www.', '');
    }
  } catch {
    cleanDomain = 'ecuadorianarchitecture.com';
  }

  // Real measurable click URL
  const clickHref = isPreview
    ? campaign.destinationUrl || '#'
    : getClickUrl(campaign, 'entre-proyectos');

  const handleClick = (e: React.MouseEvent) => {
    if (
      clickHref === '#newsletter' ||
      campaign.destinationUrl === '#newsletter' ||
      !clickHref.startsWith('http') ||
      clickHref.includes('#')
    ) {
      e.preventDefault();
      openNewsletterModal();
    }
  };

  // =========================================================================
  // 1. PANORAMIC CARD VARIANT (Catalog Grid - Pure image banner)
  // Perfectly calibrated to match PanoramicFolderCard dimensions exactly
  // =========================================================================
  const isExplicitMobile = device === 'mobile';
  const isExplicitDesktop = device === 'desktop' || device === 'tablet';

  if (layoutVariant === 'panoramic-card') {
    const isMobileMode = isExplicitMobile;
    const activeAsset = isMobileMode ? (campaign.mobileAsset || campaign.desktopAsset) : campaign.desktopAsset;

    return (
      <div
        ref={cardRef}
        className={`infeed-sponsor-card relative w-full rounded-[24px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden select-none transition-all duration-300 ease-out hover:-translate-y-0.5 border border-ea-black/30 hover:border-ea-black group ${
          isMobileMode ? 'h-[260px] sm:h-[280px]' : 'h-auto md:h-[380px] lg:h-[390px]'
        }`}
      >
        {/* Main Artwork Asset Frame - 100% pure image */}
        <a
          href={clickHref}
          onClick={handleClick}
          target={clickHref.startsWith('http') ? '_blank' : undefined}
          rel={clickHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="relative w-full h-full min-h-[220px] md:min-h-0 overflow-hidden bg-neutral-100 flex items-center justify-center cursor-pointer"
          data-cursor
          title={campaign.title || brandName}
        >
          {/* Fondo difuminado ambiental en computadora para llenar los laterales sin recortar texto */}
          {!isMobileMode && (
            <div
              className="hidden sm:block absolute inset-0 bg-cover bg-center filter blur-xl opacity-25 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${activeAsset})` }}
              aria-hidden="true"
            />
          )}

          <picture className="relative w-full h-full block z-1">
            {!isExplicitDesktop && (
              <source media="(max-width: 639px)" srcSet={campaign.mobileAsset || campaign.desktopAsset} />
            )}
            <img
              src={activeAsset}
              alt={campaign.title || brandName}
              className={`w-full h-full object-center group-hover:scale-[1.015] transition-transform duration-500 ease-out ${
                isMobileMode ? 'object-cover' : 'object-cover sm:object-contain'
              }`}
              loading="lazy"
            />
          </picture>
          {/* Subtle discreet AD indicator */}
          <span className="absolute top-3.5 right-3.5 font-mono text-[9px] font-bold tracking-widest uppercase bg-black/75 text-white/90 backdrop-blur-xs px-2 py-0.5 rounded-[2px] pointer-events-none shadow-xs z-10">
            PUBLICIDAD
          </span>
        </a>
      </div>
    );
  }

  // =========================================================================
  // 2. VERTICAL CARD VARIANT (Pure image banner without CTA bar or overlay text)
  // =========================================================================
  const isMobileMode = isExplicitMobile;
  const activeAsset = isMobileMode ? (campaign.mobileAsset || campaign.desktopAsset) : campaign.desktopAsset;

  return (
    <div
      ref={cardRef}
      className={`infeed-sponsor-card relative rounded-[2px] overflow-hidden select-none transition-all duration-300 ease-out hover:-translate-y-0.5 shrink-0 border border-ea-black/30 hover:border-ea-black group ${
        isMobileMode ? 'w-[320px] h-[380px]' : 'w-[345px] h-[414px]'
      }`}
    >
      {/* Artwork Banner - 100% pure image */}
      <a
        href={clickHref}
        onClick={handleClick}
        target={clickHref.startsWith('http') ? '_blank' : undefined}
        rel={clickHref.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="relative w-full h-full overflow-hidden bg-neutral-100 flex items-center justify-center cursor-pointer"
        data-cursor
        title={campaign.title || brandName}
      >
        {!isMobileMode && (
          <div
            className="hidden sm:block absolute inset-0 bg-cover bg-center filter blur-lg opacity-25 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${activeAsset})` }}
            aria-hidden="true"
          />
        )}
        <picture className="relative w-full h-full block z-1">
          {!isExplicitDesktop && (
            <source media="(max-width: 639px)" srcSet={campaign.mobileAsset || campaign.desktopAsset} />
          )}
          <img
            src={activeAsset}
            alt={campaign.title || brandName}
            className={`w-full h-full object-center group-hover:scale-[1.015] transition-transform duration-500 ease-out ${
              isMobileMode ? 'object-cover' : 'object-cover sm:object-contain'
            }`}
            loading="lazy"
          />
        </picture>
        {/* Subtle discreet AD indicator */}
        <span className="absolute top-2.5 right-2.5 font-mono text-[8.5px] font-bold tracking-widest uppercase bg-black/75 text-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-[2px] pointer-events-none shadow-xs z-10">
          PUBLICIDAD
        </span>
      </a>
    </div>
  );
};
