import React, { useState, useEffect } from 'react';
import { TargetSection, AdvertisementCampaign, AdCampaign, SponsorBrand } from '../../types/advertising';
import { VerticalAdCarousel } from './VerticalAdCarousel';
import { useAdvertising } from '../../context/AdvertisingContext';
import defaultAds from '../../data/advertisements.json';

interface StickySponsorWingsProps {
  section: TargetSection;
  position: 'izquierdo' | 'derecho';
  /** Optional container element or ref to observe for scroll visibility */
  triggerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  isPreview?: boolean;
}

export const StickySponsorWings: React.FC<StickySponsorWingsProps> = ({
  section,
  position,
  triggerRef,
  className = '',
  isPreview = false,
}) => {
  const { getEligibleCampaigns, getBrandById } = useAdvertising();
  const [isVisible, setIsVisible] = useState(false);
  const [activeModernCampaign, setActiveModernCampaign] = useState<AdCampaign | null>(null);
  const [activeLegacyCampaign, setActiveLegacyCampaign] = useState<AdvertisementCampaign | null>(null);

  // 1. Resolve active advertisement campaign
  useEffect(() => {
    // Check modern campaigns first
    const modernList = getEligibleCampaigns('skyscrapers-laterales');
    if (modernList.length > 0) {
      // Pick based on position: if multiple, left gets index 0, right gets index 1 (or 0 if only 1)
      const selected = position === 'derecho' && modernList.length > 1 ? modernList[1] : modernList[0];
      setActiveModernCampaign(selected);
      setActiveLegacyCampaign(null);
      return;
    }

    // Fallback to legacy
    const today = new Date().toISOString().split('T')[0];
    const campaigns = defaultAds as AdvertisementCampaign[];

    const matched = campaigns.find((ad) => {
      if (!ad.activeStatus) return false;
      if (ad.startDate && ad.startDate > today) return false;
      if (ad.endDate && ad.endDate < today) return false;
      if (!ad.targetSections.includes(section)) return false;
      if (ad.positionTarget !== 'ambos-lados' && ad.positionTarget !== position) return false;
      return true;
    });

    setActiveModernCampaign(null);
    setActiveLegacyCampaign(matched || null);
  }, [section, position, getEligibleCampaigns]);

  // 2. Scroll & Intersection Observer Trigger
  useEffect(() => {
    if (!triggerRef?.current) {
      const handleScroll = () => {
        const scrollY = window.scrollY;

        // Los banners laterales aparecen de forma fluida al descender del header (scrollY > 70)
        // y permanecen visibles hasta llegar al footer. Solo se desvanecen al regresar arriba.
        if (scrollY > 70) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      };

      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-40px 0px -40px 0px',
      }
    );

    const el = triggerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [triggerRef]);

  if (!activeModernCampaign && !activeLegacyCampaign) return null;

  const brand: SponsorBrand | undefined = activeModernCampaign
    ? getBrandById(activeModernCampaign.brandId)
    : undefined;

  const brandLabel = brand?.name || activeModernCampaign?.name || activeLegacyCampaign?.brandName || 'Sponsor';

  return (
    <aside
      aria-label={`Espacio publicitario ${position}: ${brandLabel}`}
      className={`hidden xl:flex flex-col sticky top-24 z-20 w-[165px] 2xl:w-[190px] shrink-0 select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'
      } ${className}`}
    >
      <VerticalAdCarousel
        modernCampaign={activeModernCampaign || undefined}
        campaign={activeLegacyCampaign || undefined}
        brand={brand}
        position={position}
        isPreview={isPreview}
      />
    </aside>
  );
};
