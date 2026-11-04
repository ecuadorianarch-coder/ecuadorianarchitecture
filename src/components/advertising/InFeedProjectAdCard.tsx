import React, { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AdCampaign, SponsorBrand } from '../../types/advertising';
import { useAdvertising } from '../../context/AdvertisingContext';

interface InFeedProjectAdCardProps {
  campaign: AdCampaign;
  brand?: SponsorBrand;
  layoutVariant?: 'vertical-card' | 'panoramic-card';
  isPreview?: boolean;
}

export const InFeedProjectAdCard: React.FC<InFeedProjectAdCardProps> = ({
  campaign,
  brand,
  layoutVariant = 'vertical-card',
  isPreview = false,
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
  // 1. PANORAMIC CARD VARIANT (Catalog Grid - 1:1 with client brief & mock)
  // Perfectly calibrated to match PanoramicFolderCard dimensions exactly
  // =========================================================================
  if (layoutVariant === 'panoramic-card') {
    return (
      <div
        ref={cardRef}
        className="infeed-sponsor-card relative w-full h-auto md:h-[380px] lg:h-[390px] bg-white border-2 border-ea-black rounded-[26px] sm:rounded-[30px] md:rounded-[34px] p-4 sm:p-5 md:p-5 lg:p-6 flex flex-col justify-between select-none transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 overflow-hidden group"
      >
        {/* Main Artwork Asset Frame */}
        <a
          href={clickHref}
          onClick={handleClick}
          target={clickHref.startsWith('http') ? '_blank' : undefined}
          rel={clickHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="relative w-full flex-1 min-h-0 rounded-[22px] sm:rounded-[26px] overflow-hidden bg-neutral-100 block cursor-pointer"
          data-cursor
          title={`Suscribirme al newsletter de ${brandName}`}
        >
          <picture className="w-full h-full block">
            <source media="(max-width: 639px)" srcSet={campaign.mobileAsset || campaign.desktopAsset} />
            <img
              src={campaign.desktopAsset}
              alt={campaign.title || brandName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          </picture>
        </a>

        {/* Bottom Bar: Action CTA Button + Website Domain Link with Target Icon */}
        <div className="pt-3 border-t border-ea-black/15 flex items-center justify-between gap-3 mt-3 shrink-0">
          {/* CTA Button */}
          <a
            href={clickHref}
            onClick={handleClick}
            target={clickHref.startsWith('http') ? '_blank' : undefined}
            rel={clickHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-ea-black text-white font-anton text-xs sm:text-[12.5px] tracking-wider uppercase hover:bg-neutral-800 transition-colors shadow-xs active:translate-x-0.5 active:translate-y-0.5 shrink-0"
            data-cursor
          >
            <span>{campaign.ctaText || 'SUSCRÍBETE A NUESTRO NEWSLETTER'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>

          {/* Website Link with Architectural Target Dot */}
          <a
            href={clickHref}
            onClick={handleClick}
            target={clickHref.startsWith('http') ? '_blank' : undefined}
            rel={clickHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="font-mono text-xs sm:text-[12px] text-ea-black/75 hover:text-ea-black transition-colors flex items-center gap-2 truncate min-w-0"
            title={cleanDomain}
            data-cursor
          >
            <span className="truncate">{cleanDomain}</span>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-ea-black/50 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-ea-black" />
            </span>
          </a>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. VERTICAL CARD VARIANT (For vertical grid: Artwork + CTA + Web link)
  // =========================================================================
  return (
    <div
      ref={cardRef}
      className="infeed-sponsor-card relative w-[345px] h-[414px] bg-[#FAF8F5] border-2 border-ea-black p-3.5 sm:p-4 flex flex-col justify-between select-none transition-all duration-300 ease-out shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-y-1 shrink-0 overflow-hidden group"
      style={{ borderRadius: '2px' }}
    >
      {/* Artwork Banner */}
      <a
        href={clickHref}
        onClick={handleClick}
        target={clickHref.startsWith('http') ? '_blank' : undefined}
        rel={clickHref.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="relative w-full h-[335px] border border-ea-black/35 overflow-hidden bg-ea-offwhite block cursor-pointer"
        data-cursor
        title={`Suscribirme al newsletter de ${brandName}`}
      >
        <picture className="w-full h-full block">
          <source media="(max-width: 639px)" srcSet={campaign.mobileAsset || campaign.desktopAsset} />
          <img
            src={campaign.desktopAsset}
            alt={campaign.title || brandName}
            className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </picture>
      </a>

      {/* Bottom Bar: CTA Button + Website Domain Link with Target Icon */}
      <div className="flex items-center justify-between gap-2 pt-2.5 mt-0.5 border-t border-ea-black/10">
        <a
          href={clickHref}
          onClick={handleClick}
          target={clickHref.startsWith('http') ? '_blank' : undefined}
          rel={clickHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ea-black text-white font-anton text-[11px] sm:text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors shadow-xs active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          data-cursor
        >
          <span>{campaign.ctaText || 'SUSCRÍBETE A NUESTRO NEWSLETTER'}</span>
          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
        </a>

        <a
          href={clickHref}
          onClick={handleClick}
          target={clickHref.startsWith('http') ? '_blank' : undefined}
          rel={clickHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="font-mono text-[10.5px] text-ea-black/75 hover:text-ea-black transition-colors flex items-center gap-1.5 truncate min-w-0"
          title={cleanDomain}
          data-cursor
        >
          <span className="truncate">{cleanDomain}</span>
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-ea-black/50 shrink-0">
            <span className="w-1 h-1 rounded-full bg-ea-black" />
          </span>
        </a>
      </div>
    </div>
  );
};
