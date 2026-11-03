export type AdPlacementId =
  | 'entre-proyectos'
  | 'skyscrapers-laterales'
  | 'dossier-editorial'
  | 'destacado-home'
  | 'pie-articulo'
  | 'barra-top-sponsor'
  | 'inter-galeria'
  | 'comunidad-infeed';

export type AdStatus = 'borrador' | 'programada' | 'activa' | 'pausada' | 'finalizada';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface SponsorBrand {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  destinationUrl: string;
  contactEmail?: string;
  category: string; // e.g. 'Iluminación Técnica', 'Envolventes & Fachadas', 'Superficies', 'Mobiliario'
  status: 'activa' | 'inactiva';
  priority: number; // 1 to 10
  createdAt: string;
  portalToken?: string; // Token único seguro para el Portal del Anunciante
  portalEnabled?: boolean; // Control para activar o revocar acceso al portal del anunciante
  accountManager?: string; // Ejecutivo de cuenta editorial asignado
}

export interface AdCampaign {
  id: string;
  brandId: string;
  name: string; // Nombre interno de la campaña
  kicker?: string; // Antetítulo editorial (e.g. 'PATROCINIO OFICIAL', 'ALIANZA EDITORIAL')
  title: string; // Título principal del anuncio
  subtitle?: string; // Mensaje secundario o especificación técnica
  desktopAsset: string; // URL imagen optimizada para escritorio
  mobileAsset: string; // URL imagen optimizada para móvil (relación adaptada)
  horizontalBannerAsset?: string; // Arte gráfico limpio tipo banner leaderboard (728x90 o similar) enviado directamente por la empresa
  destinationUrl: string; // URL de destino final
  ctaText?: string; // e.g. 'EXPLORAR CATÁLOGO', 'DESCARGAR FICHA TÉCNICA'
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  status: AdStatus;
  placements: AdPlacementId[];
  priority: number; // Peso para desempates / rotación
  createdAt: string;
  // Campos profesionales de gestión comercial y dashboard compartido
  budget?: number; // Presupuesto contratado en USD (opcional)
  targetImpressions?: number; // Objetivo o meta de impresiones contratadas
  shareToken: string; // Token único seguro para el dashboard de anunciante (solo lectura)
  shareEnabled: boolean; // Control para activar/revocar el enlace compartido
  notes?: string; // Notas comerciales internas
}

export interface AdPlacementConfig {
  id: AdPlacementId;
  name: string;
  description: string;
  supportedDevices: DeviceType[];
  frequency?: number; // Para 'entre-proyectos': cada cuántos proyectos aparece (default 3)
  maxAdsPerPage?: number;
  aspectRatioDesktop: string;
  aspectRatioMobile: string;
  active: boolean;
  recommendedDimensions?: string;
  acceptedFormats?: string[];
  pageLocation?: string;
  baseRateCpm?: number; // Tarifa sugerida CPM en USD
}

export interface AdEvent {
  id: string;
  campaignId: string;
  placementId: AdPlacementId;
  type: 'impression' | 'click';
  timestamp: string; // ISO String
  isValid: boolean;
  reason?: 'valid' | 'rapid_duplicate' | 'admin_preview' | 'bot_detected';
  device: DeviceType;
  userAgent?: string;
  sessionId?: string;
}

export interface AdDailyStat {
  date: string;
  validImpressions: number;
  grossClicks: number;
  validClicks: number;
}

export interface AdAnalytics {
  impressions: Record<string, number>; // campaignId -> valid count
  grossClicks: Record<string, number>; // campaignId -> gross count
  validClicks: Record<string, number>; // campaignId -> valid count
  clicks: Record<string, number>; // alias compatible con validClicks
  impressionsByPlacement: Record<string, number>; // placementId -> count
  clicksByPlacement: Record<string, number>; // placementId -> count
  dailyStats?: Record<string, Record<string, { validImpressions: number; grossClicks: number; validClicks: number }>>; // date -> campaignId -> stats
  deviceBreakdown: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  lastUpdated: string;
}

export interface CampaignReportData {
  campaign: AdCampaign;
  brand: SponsorBrand;
  stats: {
    validImpressions: number;
    grossClicks: number;
    validClicks: number;
    ctr: string; // e.g. "4.79"
    deliveryPercent?: string; // e.g. "82.5"
    targetImpressions?: number;
    budget?: number;
    startDate: string;
    endDate: string;
    daysRemaining?: number;
  };
  dailyTrend: AdDailyStat[];
  placementBreakdown: { placementId: AdPlacementId; name: string; impressions: number; clicks: number; ctr: string }[];
  methodology: {
    impressionRule: string;
    clickRule: string;
    lastUpdated: string;
  };
}

export interface AdvertiserPortalData {
  brand: SponsorBrand;
  campaigns: (AdCampaign & {
    metrics: {
      validImpressions: number;
      grossClicks: number;
      validClicks: number;
      ctr: string;
      deliveryPercent?: string;
    };
  })[];
  totals: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    totalTargetImpressions: number;
    validImpressions: number;
    grossClicks: number;
    validClicks: number;
    overallCtr: string;
    overallDeliveryPercent?: string;
  };
  dailyTrend: AdDailyStat[];
  placementBreakdown: {
    placementId: AdPlacementId;
    name: string;
    impressions: number;
    clicks: number;
    ctr: string;
  }[];
  methodology: {
    impressionRule: string;
    clickRule: string;
    lastUpdated: string;
  };
}

// Legacy helper compatibility for previous components
export type TargetSection = 'proyectos' | 'academia' | 'territorios' | 'criticas' | 'ciudad' | 'home';
export type PositionTarget = 'ambos-lados' | 'izquierdo' | 'derecho';
export interface BannerAsset {
  url: string;
  alt?: string;
  caption?: string;
}
export interface AdvertisementCampaign {
  id: string;
  brandName: string;
  campaignTitle: string;
  targetSections: TargetSection[];
  positionTarget: PositionTarget;
  bannerAssets: BannerAsset[];
  destinationUrl: string;
  carouselInterval?: number;
  activeStatus: boolean;
  startDate: string;
  endDate: string;
  tagLabel?: string;
  sponsorCategory?: string;
}
