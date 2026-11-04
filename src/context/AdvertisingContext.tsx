import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { NewsletterSubscriptionModal } from '../components/common/NewsletterSubscriptionModal';
import {
  SponsorBrand,
  AdCampaign,
  AdPlacementConfig,
  AdPlacementId,
  AdAnalytics,
} from '../types/advertising';

import defaultBrands from '../data/adBrands.json';
import defaultCampaigns from '../data/adCampaigns.json';
import defaultPlacements from '../data/adPlacements.json';
import defaultAnalytics from '../data/adAnalytics.json';

export interface CampaignMetrics {
  validImpressions: number;
  grossClicks: number;
  validClicks: number;
  ctr: number; // porcentaje (e.g. 4.75)
  deliveryPercent: number | null; // e.g. 85.2 si hay target, null si no
}

export interface BrandMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  draftCampaigns: number;
  totalBudget: number;
  totalTargetImpressions: number;
  validImpressions: number;
  grossClicks: number;
  validClicks: number;
  overallCtr: number;
  overallDeliveryPercent: number | null;
}

interface AdvertisingContextType {
  brands: SponsorBrand[];
  campaigns: AdCampaign[];
  placements: AdPlacementConfig[];
  analytics: AdAnalytics;
  isSaving: boolean;
  saveMessage: string | null;
  getBrandById: (brandId: string) => SponsorBrand | undefined;
  getPlacementConfig: (placementId: AdPlacementId) => AdPlacementConfig | undefined;
  getEligibleCampaigns: (placementId: AdPlacementId) => AdCampaign[];
  addBrand: (brand: SponsorBrand) => void;
  updateBrand: (id: string, updated: Partial<SponsorBrand>) => void;
  deleteBrand: (id: string) => void;
  addCampaign: (campaign: AdCampaign) => void;
  updateCampaign: (id: string, updated: Partial<AdCampaign>) => void;
  deleteCampaign: (id: string) => void;
  updatePlacementConfig: (id: AdPlacementId, updated: Partial<AdPlacementConfig>) => void;
  trackImpression: (campaignId: string, placementId: AdPlacementId, options?: { isAdmin?: boolean }) => void;
  trackClick: (campaignId: string, placementId: AdPlacementId) => void;
  getClickUrl: (campaign: AdCampaign, placementId: AdPlacementId) => string;
  getCampaignMetrics: (campaignId: string) => CampaignMetrics;
  getBrandMetrics: (brandId: string) => BrandMetrics;
  generateShareToken: (campaignId: string) => Promise<string>;
  toggleShareEnabled: (campaignId: string, enabled: boolean) => Promise<void>;
  generateBrandPortalToken: (brandId: string) => Promise<string>;
  toggleBrandPortalAccess: (brandId: string, enabled: boolean) => Promise<void>;
  saveToDisk: (
    overrideCampaigns?: AdCampaign[],
    overrideBrands?: SponsorBrand[],
    overridePlacements?: AdPlacementConfig[],
    overrideAnalytics?: AdAnalytics
  ) => Promise<boolean>;
  refreshAnalytics: () => Promise<void>;
  resetToDefaults: () => void;
  isNewsletterModalOpen: boolean;
  openNewsletterModal: () => void;
  closeNewsletterModal: () => void;
}

const AdvertisingContext = createContext<AdvertisingContextType | undefined>(undefined);

export const AdvertisingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<SponsorBrand[]>(defaultBrands as SponsorBrand[]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(defaultCampaigns as AdCampaign[]);
  const [placements, setPlacements] = useState<AdPlacementConfig[]>(defaultPlacements as AdPlacementConfig[]);
  const [analytics, setAnalytics] = useState<AdAnalytics>(defaultAnalytics as AdAnalytics);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  const openNewsletterModal = useCallback(() => setIsNewsletterModalOpen(true), []);
  const closeNewsletterModal = useCallback(() => setIsNewsletterModalOpen(false), []);

  // Deduplication cache for impressions within the current session
  const trackedImpressionsRef = useRef<Set<string>>(new Set());

  const refreshAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/ad-analytics');
      if (res.ok) {
        const data = await res.json();
        if (data) setAnalytics(data);
      }
    } catch {
      // ignore
    }
  }, []);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/ad-brands')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && Array.isArray(data)) setBrands(data); })
      .catch(() => {});

    fetch('/api/ad-campaigns')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && Array.isArray(data)) setCampaigns(data); })
      .catch(() => {});

    fetch('/api/ad-placements')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && Array.isArray(data)) setPlacements(data); })
      .catch(() => {});

    refreshAnalytics();
  }, [refreshAnalytics]);

  const getBrandById = useCallback((brandId: string) => {
    return brands.find((b) => b.id === brandId);
  }, [brands]);

  const getPlacementConfig = useCallback((placementId: AdPlacementId) => {
    return placements.find((p) => p.id === placementId);
  }, [placements]);

  // Determine which campaigns are eligible right now for a given placement
  const getEligibleCampaigns = useCallback((placementId: AdPlacementId): AdCampaign[] => {
    const placement = getPlacementConfig(placementId);
    if (placement && !placement.active) return [];

    const today = new Date().toISOString().split('T')[0];

    return campaigns
      .filter((camp) => {
        if (!camp.placements.includes(placementId)) return false;

        const brand = getBrandById(camp.brandId);
        if (!brand || brand.status !== 'activa') return false;

        if (camp.status === 'pausada' || camp.status === 'borrador') return false;

        if (camp.endDate && camp.endDate < today) return false;
        if (camp.startDate && camp.startDate > today) return false;

        return camp.status === 'activa' || camp.status === 'programada';
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [campaigns, getPlacementConfig, getBrandById]);

  // Brand CRUD
  const addBrand = (brand: SponsorBrand) => {
    setBrands((prev) => [brand, ...prev]);
  };

  const updateBrand = (id: string, updated: Partial<SponsorBrand>) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setCampaigns((prev) => prev.filter((c) => c.brandId !== id));
  };

  // Campaign CRUD
  const addCampaign = (campaign: AdCampaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
  };

  const updateCampaign = (id: string, updated: Partial<AdCampaign>) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  // Placement Config
  const updatePlacementConfig = (id: AdPlacementId, updated: Partial<AdPlacementConfig>) => {
    setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  // Build Click Redirection URL
  const getClickUrl = useCallback((campaign: AdCampaign, placementId: AdPlacementId) => {
    const dest = campaign.destinationUrl || '#';
    return `/api/ads/click?c=${encodeURIComponent(campaign.id)}&p=${encodeURIComponent(placementId)}&dest=${encodeURIComponent(dest)}`;
  }, []);

  // Impression Tracking
  const trackImpression = useCallback(
    (campaignId: string, placementId: AdPlacementId, options?: { isAdmin?: boolean }) => {
      const isAdmin = Boolean(options?.isAdmin);
      const dedupeKey = `${campaignId}_${placementId}`;

      if (!isAdmin) {
        if (trackedImpressionsRef.current.has(dedupeKey)) return;
        try {
          if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`ea_imp_${dedupeKey}`)) {
            return;
          }
          sessionStorage.setItem(`ea_imp_${dedupeKey}`, '1');
        } catch {
          // ignore
        }
        trackedImpressionsRef.current.add(dedupeKey);
      }

      fetch('/api/ads/track-impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, placementId, isAdmin }),
      }).catch(() => {});

      if (!isAdmin) {
        const device: 'desktop' | 'tablet' | 'mobile' =
          typeof window !== 'undefined'
            ? window.innerWidth < 768
              ? 'mobile'
              : window.innerWidth < 1280
              ? 'tablet'
              : 'desktop'
            : 'desktop';

        setAnalytics((prev) => ({
          ...prev,
          impressions: {
            ...prev.impressions,
            [campaignId]: (prev.impressions[campaignId] || 0) + 1,
          },
          impressionsByPlacement: {
            ...prev.impressionsByPlacement,
            [placementId]: (prev.impressionsByPlacement[placementId] || 0) + 1,
          },
          deviceBreakdown: {
            ...prev.deviceBreakdown,
            [device]: (prev.deviceBreakdown?.[device] || 0) + 1,
          },
          lastUpdated: new Date().toISOString(),
        }));
      }
    },
    []
  );

  const trackClick = useCallback((campaignId: string, placementId: AdPlacementId) => {
    setAnalytics((prev) => ({
      ...prev,
      clicks: {
        ...prev.clicks,
        [campaignId]: (prev.clicks[campaignId] || 0) + 1,
      },
      validClicks: {
        ...prev.validClicks,
        [campaignId]: ((prev.validClicks?.[campaignId] ?? prev.clicks[campaignId]) || 0) + 1,
      },
      clicksByPlacement: {
        ...prev.clicksByPlacement,
        [placementId]: (prev.clicksByPlacement[placementId] || 0) + 1,
      },
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Compute live metrics for a campaign
  const getCampaignMetrics = useCallback(
    (campaignId: string): CampaignMetrics => {
      const camp = campaigns.find((c) => c.id === campaignId);
      const validImpressions = analytics.impressions?.[campaignId] || 0;
      const grossClicks = analytics.grossClicks?.[campaignId] || analytics.clicks?.[campaignId] || 0;
      const validClicks = analytics.validClicks?.[campaignId] || analytics.clicks?.[campaignId] || 0;

      const ctr = validImpressions > 0 ? Number(((validClicks / validImpressions) * 100).toFixed(2)) : 0;
      const deliveryPercent =
        camp?.targetImpressions && camp.targetImpressions > 0
          ? Number(((validImpressions / camp.targetImpressions) * 100).toFixed(1))
          : null;

      return {
        validImpressions,
        grossClicks,
        validClicks,
        ctr,
        deliveryPercent,
      };
    },
    [campaigns, analytics]
  );

  // Compute aggregated live metrics for an advertiser / brand
  const getBrandMetrics = useCallback(
    (brandId: string): BrandMetrics => {
      const brandCamps = campaigns.filter((c) => c.brandId === brandId);
      let totalBudget = 0;
      let totalTargetImpressions = 0;
      let validImpressions = 0;
      let grossClicks = 0;
      let validClicks = 0;

      let activeCampaigns = 0;
      let draftCampaigns = 0;

      brandCamps.forEach((camp) => {
        if (camp.status === 'activa') activeCampaigns++;
        if (camp.status === 'borrador') draftCampaigns++;

        totalBudget += (camp.budget || 0);
        totalTargetImpressions += (camp.targetImpressions || 0);

        const vImp = analytics.impressions?.[camp.id] || 0;
        const gClk = analytics.grossClicks?.[camp.id] || 0;
        const vClk = analytics.validClicks?.[camp.id] || analytics.clicks?.[camp.id] || 0;

        validImpressions += vImp;
        grossClicks += gClk;
        validClicks += vClk;
      });

      const overallCtr = validImpressions > 0 ? Number(((validClicks / validImpressions) * 100).toFixed(2)) : 0;
      const overallDeliveryPercent =
        totalTargetImpressions > 0 ? Number(((validImpressions / totalTargetImpressions) * 100).toFixed(1)) : null;

      return {
        totalCampaigns: brandCamps.length,
        activeCampaigns,
        draftCampaigns,
        totalBudget,
        totalTargetImpressions,
        validImpressions,
        grossClicks,
        validClicks,
        overallCtr,
        overallDeliveryPercent,
      };
    },
    [campaigns, analytics]
  );

  // Generate single campaign share token
  const generateShareToken = async (campaignId: string): Promise<string> => {
    const raw = Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(3);
    const token = `ea_sec_${raw}`;

    const updated = campaigns.map((c) =>
      c.id === campaignId ? { ...c, shareToken: token, shareEnabled: true } : c
    );
    setCampaigns(updated);

    try {
      await fetch('/api/ad-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated, null, 2),
      });
    } catch {
      // ignore
    }

    return token;
  };

  const toggleShareEnabled = async (campaignId: string, enabled: boolean): Promise<void> => {
    const updated = campaigns.map((c) =>
      c.id === campaignId ? { ...c, shareEnabled: enabled } : c
    );
    setCampaigns(updated);

    try {
      await fetch('/api/ad-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated, null, 2),
      });
    } catch {
      // ignore
    }
  };

  // Generate Brand Advertiser Portal Token
  const generateBrandPortalToken = async (brandId: string): Promise<string> => {
    const brand = brands.find((b) => b.id === brandId);
    const slug = (brand?.name || 'adv').toLowerCase().replace(/[^a-z0-9]/g, '');
    const raw = Math.random().toString(36).substring(2, 8);
    const token = `ea_adv_${slug}_${raw}`;

    const updated = brands.map((b) =>
      b.id === brandId ? { ...b, portalToken: token, portalEnabled: true } : b
    );
    setBrands(updated);

    try {
      await fetch('/api/ad-brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated, null, 2),
      });
    } catch {
      // ignore
    }

    return token;
  };

  const toggleBrandPortalAccess = async (brandId: string, enabled: boolean): Promise<void> => {
    const updated = brands.map((b) =>
      b.id === brandId ? { ...b, portalEnabled: enabled } : b
    );
    setBrands(updated);

    try {
      await fetch('/api/ad-brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated, null, 2),
      });
    } catch {
      // ignore
    }
  };

  // Save to Disk via API
  const saveToDisk = async (
    overrideCampaigns?: AdCampaign[],
    overrideBrands?: SponsorBrand[],
    overridePlacements?: AdPlacementConfig[],
    overrideAnalytics?: AdAnalytics
  ): Promise<boolean> => {
    setIsSaving(true);
    setSaveMessage(null);

    const cToSave = overrideCampaigns || campaigns;
    const bToSave = overrideBrands || brands;
    const pToSave = overridePlacements || placements;
    const aToSave = overrideAnalytics || analytics;

    try {
      await Promise.all([
        fetch('/api/ad-brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bToSave, null, 2),
        }),
        fetch('/api/ad-campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cToSave, null, 2),
        }),
        fetch('/api/ad-placements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pToSave, null, 2),
        }),
        fetch('/api/ad-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aToSave, null, 2),
        }),
      ]);

      setIsSaving(false);
      setSaveMessage('✓ Campañas y analíticas guardadas en disco.');
      setTimeout(() => setSaveMessage(null), 3500);
      return true;
    } catch (err: any) {
      setIsSaving(false);
      setSaveMessage('Error al guardar: ' + err.message);
      return false;
    }
  };

  const resetToDefaults = () => {
    setBrands(defaultBrands as SponsorBrand[]);
    setCampaigns(defaultCampaigns as AdCampaign[]);
    setPlacements(defaultPlacements as AdPlacementConfig[]);
    setAnalytics(defaultAnalytics as AdAnalytics);
    trackedImpressionsRef.current.clear();
  };

  return (
    <AdvertisingContext.Provider
      value={{
        brands,
        campaigns,
        placements,
        analytics,
        isSaving,
        saveMessage,
        getBrandById,
        getPlacementConfig,
        getEligibleCampaigns,
        addBrand,
        updateBrand,
        deleteBrand,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        updatePlacementConfig,
        trackImpression,
        trackClick,
        getClickUrl,
        getCampaignMetrics,
        getBrandMetrics,
        generateShareToken,
        toggleShareEnabled,
        generateBrandPortalToken,
        toggleBrandPortalAccess,
        saveToDisk,
        refreshAnalytics,
        resetToDefaults,
        isNewsletterModalOpen,
        openNewsletterModal,
        closeNewsletterModal,
      }}
    >
      {children}
      <NewsletterSubscriptionModal
        isOpen={isNewsletterModalOpen}
        onClose={closeNewsletterModal}
        source="banner-publicitario"
      />
    </AdvertisingContext.Provider>
  );
};

export const useAdvertising = () => {
  const ctx = useContext(AdvertisingContext);
  if (!ctx) throw new Error('useAdvertising must be used within an AdvertisingProvider');
  return ctx;
};
