import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Building2,
  Calendar,
  MousePointerClick,
  Eye,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Clock,
  ArrowUpRight,
  Save,
  RotateCcw,
  ExternalLink,
  Layers,
  X,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Search,
  Filter,
  DollarSign,
  Target,
  FileSpreadsheet,
  AlertTriangle,
  Info,
  Sparkles,
  UserCheck,
  Upload,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { useAdvertising } from '../../context/AdvertisingContext';
import {
  AdCampaign,
  SponsorBrand,
  AdPlacementId,
  AdStatus,
  AdPlacementConfig,
  DeviceType,
} from '../../types/advertising';
import { InFeedProjectAdCard } from '../../components/advertising/InFeedProjectAdCard';
import { VerticalAdCarousel } from '../../components/advertising/VerticalAdCarousel';
import { OrigamiFolderCard } from '../../components/projects/OrigamiFolderCard';
import realProjects from '../../data/projects.json';
import realNotesData from '../../data/communityNotes.json';

export const AdvertisingManager: React.FC = () => {
  const {
    brands,
    campaigns,
    placements,
    analytics,
    isSaving,
    saveMessage,
    getBrandById,
    addBrand,
    updateBrand,
    deleteBrand,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    updatePlacementConfig,
    getCampaignMetrics,
    getBrandMetrics,
    generateShareToken,
    toggleShareEnabled,
    generateBrandPortalToken,
    toggleBrandPortalAccess,
    saveToDisk,
    refreshAnalytics,
    resetToDefaults,
  } = useAdvertising();

  // Internal tab state
  const [subTab, setSubTab] = useState<'campaigns' | 'preview' | 'brands' | 'placements' | 'analytics'>(
    'campaigns'
  );

  // Campaign View Organization: One dashboard per advertiser vs all campaigns
  const [campaignsMode, setCampaignsMode] = useState<'by-advertiser' | 'all-campaigns'>('by-advertiser');
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState<string>(brands[0]?.id || '');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [placementFilter, setPlacementFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<SponsorBrand | null>(null);

  // Share Single Campaign Modal
  const [shareModalCampaign, setShareModalCampaign] = useState<AdCampaign | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);

  // Share Advertiser Profile Portal Modal
  const [shareProfileBrand, setShareProfileBrand] = useState<SponsorBrand | null>(null);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);
  const [isRegeneratingProfileToken, setIsRegeneratingProfileToken] = useState(false);

  // Live preview interactive state
  const [previewCampaignId, setPreviewCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [previewPlacement, setPreviewPlacement] = useState<AdPlacementId>('dossier-editorial');
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  // Campaign Form State
  const [campForm, setCampForm] = useState<Partial<AdCampaign>>({
    brandId: brands[0]?.id || '',
    name: '',
    kicker: 'ESPACIO AUSPICIADO',
    title: '',
    subtitle: '',
    desktopAsset: '',
    mobileAsset: '',
    horizontalBannerAsset: '',
    destinationUrl: '',
    ctaText: 'VER CATÁLOGO',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'borrador',
    placements: ['entre-proyectos'],
    priority: 5,
    budget: 1500,
    targetImpressions: 20000,
    notes: '',
  });

  // Brand Form State
  const [brandForm, setBrandForm] = useState<Partial<SponsorBrand>>({
    name: '',
    logoUrl: '',
    description: '',
    destinationUrl: '',
    category: 'Materiales & Innovación',
    status: 'activa',
    priority: 5,
    contactEmail: '',
    accountManager: 'Mónica Serrano · Directora Comercial EA',
  });

  // Technical Specs Guide State & Helpers
  const [copiedSpecs, setCopiedSpecs] = useState(false);

  const bannerSpecsText = `📐 ESPECIFICACIONES TÉCNICAS OFICIALES DE PUBLICIDAD — ECUADORIAN ARCHITECTURE
================================================================================
Estimado anunciante / agencia comercial:
A continuación detallamos las medidas requeridas para publicar pautas en www.ecuadorianarch.com:

1. SKYSCRAPERS LATERALES (Sticky Wings & Lightbox)
   • Medida: 300 × 600 px (o 160 × 600 px)
   • Proporción: 1:2 vertical
   • Formatos: JPG, PNG o WebP (máx. 600 KB)

2. ENTRE PROYECTOS / IN-FEED (Catálogo General)
   • Medida: 800 × 500 px (o 600 × 400 px)
   • Proporción: 16:10 o 3:2 horizontal
   • Formatos: JPG, PNG o WebP (máx. 800 KB)

3. BANNER HORIZONTAL / INTER-GALERÍA (Carrusel Lightbox)
   • Medida: 728 × 90 px (Leaderboard) o 1200 × 200 px (HD Panorámico)
   • Proporción: 8:1 o 6:1 ultra-panorámico
   • Formatos: JPG, PNG o WebP (máx. 400 KB)

4. DOSSIER EDITORIAL (Dentro del Detalle de Obra)
   • Medida: 1200 × 400 px (o 900 × 300 px)
   • Proporción: 3:1 panorámico
   • Formatos: JPG, PNG o WebP (máx. 800 KB)

5. VERSIÓN MÓVIL RESPONSIVE (Smartphones)
   • Medida: 600 × 600 px (1:1 Cuadrado) o 600 × 400 px (3:2)
   • Formatos: JPG, PNG o WebP (máx. 500 KB)

* NOTA DE DISEÑO IMPORTANTE:
Nuestros banners renderizan exclusivamente la imagen gráfica final enviada por la empresa (sin tipografías ni botones HTML sobrepuestos). Por favor asegurarse de que el arte incluya el logotipo de la marca, su propio titular y su llamado a la acción comercial.`;

  const handleCopySpecs = () => {
    navigator.clipboard.writeText(bannerSpecsText).then(() => {
      setCopiedSpecs(true);
      setTimeout(() => setCopiedSpecs(false), 3000);
    });
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'desktopAsset' | 'mobileAsset' | 'horizontalBannerAsset'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP o GIF).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 8 MB. Por favor optimízala antes de subirla.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setCampForm((prev) => ({ ...prev, [field]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const today = new Date().toISOString().split('T')[0];

  // Campaign alerts calculation
  const { expiringCampaigns, inactiveCampaigns } = useMemo(() => {
    const expiring: AdCampaign[] = [];
    const inactive: AdCampaign[] = [];

    campaigns.forEach((camp) => {
      if (camp.status === 'activa') {
        const end = new Date(camp.endDate);
        const now = new Date(today);
        const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          expiring.push(camp);
        }

        const imp = analytics.impressions[camp.id] || 0;
        if (imp === 0) {
          inactive.push(camp);
        }
      }
    });

    return { expiringCampaigns: expiring, inactiveCampaigns: inactive };
  }, [campaigns, analytics, today]);

  // Selected brand object and its campaigns
  const activeBrand = brands.find((b) => b.id === selectedAdvertiserId) || brands[0];
  const activeBrandCampaigns = useMemo(() => {
    return campaigns.filter((c) => c.brandId === activeBrand?.id);
  }, [campaigns, activeBrand]);

  const activeBrandMetrics = useMemo(() => {
    return activeBrand ? getBrandMetrics(activeBrand.id) : null;
  }, [activeBrand, getBrandMetrics]);

  // Filtered campaigns for current view
  const displayedCampaigns = useMemo(() => {
    const base = campaignsMode === 'by-advertiser' ? activeBrandCampaigns : campaigns;
    return base.filter((camp) => {
      if (statusFilter !== 'todas' && camp.status !== statusFilter) return false;
      if (placementFilter !== 'todas' && !camp.placements.includes(placementFilter as AdPlacementId))
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const brand = getBrandById(camp.brandId);
        const matchesName = camp.name.toLowerCase().includes(q);
        const matchesTitle = camp.title.toLowerCase().includes(q);
        const matchesBrand = brand?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesBrand) return false;
      }
      return true;
    });
  }, [campaignsMode, activeBrandCampaigns, campaigns, statusFilter, placementFilter, searchQuery, getBrandById]);

  // Open campaign modal for edit or create
  const handleOpenCampaignModal = (campaign?: AdCampaign, preselectedBrandId?: string) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampForm({ ...campaign });
    } else {
      setEditingCampaign(null);
      setCampForm({
        brandId: preselectedBrandId || activeBrand?.id || brands[0]?.id || '',
        name: '',
        kicker: 'ESPACIO AUSPICIADO',
        title: '',
        subtitle: '',
        desktopAsset:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        mobileAsset:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        horizontalBannerAsset: '',
        destinationUrl: 'https://ecuadorianarch.com',
        ctaText: 'VER CATÁLOGO',
        startDate: today,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'borrador',
        placements: ['entre-proyectos', 'dossier-editorial'],
        priority: 5,
        budget: 1500,
        targetImpressions: 20000,
        notes: '',
      });
    }
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = (publishImmediately = false) => {
    if (!campForm.name || !campForm.brandId || !campForm.title || !campForm.desktopAsset) {
      alert('Por favor completa los campos requeridos (Nombre, Marca, Título, Arte Desktop).');
      return;
    }

    const targetStatus: AdStatus = publishImmediately
      ? 'activa'
      : (campForm.status as AdStatus) || 'borrador';

    if (editingCampaign) {
      updateCampaign(editingCampaign.id, {
        ...campForm,
        horizontalBannerAsset: campForm.horizontalBannerAsset || '',
        status: targetStatus,
      });
    } else {
      const rawToken =
        Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(3);
      const newCamp: AdCampaign = {
        id: `camp-${Date.now()}`,
        brandId: campForm.brandId || brands[0]?.id || '',
        name: campForm.name || 'Nueva Campaña',
        kicker: campForm.kicker || 'ESPACIO AUSPICIADO',
        title: campForm.title || 'Título de Campaña',
        subtitle: campForm.subtitle || '',
        desktopAsset: campForm.desktopAsset || '',
        mobileAsset: campForm.mobileAsset || campForm.desktopAsset || '',
        horizontalBannerAsset: campForm.horizontalBannerAsset || '',
        destinationUrl: campForm.destinationUrl || 'https://ecuadorianarch.com',
        ctaText: campForm.ctaText || 'VER CATÁLOGO',
        startDate: campForm.startDate || today,
        endDate: campForm.endDate || '2026-12-31',
        status: targetStatus,
        placements: campForm.placements || ['entre-proyectos'],
        priority: campForm.priority || 5,
        budget: campForm.budget,
        targetImpressions: campForm.targetImpressions,
        shareToken: `ea_sec_${rawToken}`,
        shareEnabled: true,
        notes: campForm.notes || '',
        createdAt: today,
      };
      addCampaign(newCamp);
    }
    setIsCampaignModalOpen(false);
  };

  // Duplicate campaign
  const handleDuplicateCampaign = (camp: AdCampaign) => {
    const rawToken =
      Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(3);
    const duplicated: AdCampaign = {
      ...camp,
      id: `camp-${Date.now()}`,
      name: `${camp.name} (Copia)`,
      status: 'borrador',
      shareToken: `ea_sec_${rawToken}`,
      createdAt: today,
    };
    addCampaign(duplicated);
  };

  const handleTogglePause = (camp: AdCampaign) => {
    const nextStatus: AdStatus = camp.status === 'activa' ? 'pausada' : 'activa';
    updateCampaign(camp.id, { status: nextStatus });
  };

  // Advertiser Profile Share
  const getAdvertiserProfileUrl = (token?: string) => {
    const t = token || 'demo';
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/?anunciante=${t}`;
    }
    return `/?anunciante=${t}`;
  };

  const handleCopyProfileLink = () => {
    if (!shareProfileBrand) return;
    const url = getAdvertiserProfileUrl(shareProfileBrand.portalToken);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedProfileLink(true);
      setTimeout(() => setCopiedProfileLink(false), 3000);
    });
  };

  const handleRegenerateProfileToken = async () => {
    if (!shareProfileBrand) return;
    if (confirm('¿Regenerar el enlace de este anunciante? El anterior dejará de funcionar.')) {
      setIsRegeneratingProfileToken(true);
      const newToken = await generateBrandPortalToken(shareProfileBrand.id);
      setShareProfileBrand((prev) => (prev ? { ...prev, portalToken: newToken } : null));
      setIsRegeneratingProfileToken(false);
      setCopiedProfileLink(false);
    }
  };

  const handleToggleProfileAccess = async () => {
    if (!shareProfileBrand) return;
    const next = !shareProfileBrand.portalEnabled;
    await toggleBrandPortalAccess(shareProfileBrand.id, next);
    setShareProfileBrand((prev) => (prev ? { ...prev, portalEnabled: next } : null));
  };

  // Single campaign share
  const getCampaignShareUrl = (token: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/?ad-report=${token}`;
    }
    return `/?ad-report=${token}`;
  };

  const handleCopyCampaignShareLink = () => {
    if (!shareModalCampaign) return;
    const url = getCampaignShareUrl(shareModalCampaign.shareToken);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  // Brand CRUD
  const handleOpenBrandModal = (brand?: SponsorBrand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandForm({ ...brand });
    } else {
      setEditingBrand(null);
      setBrandForm({
        name: '',
        logoUrl: '',
        description: '',
        destinationUrl: '',
        category: 'Iluminación Técnica',
        status: 'activa',
        priority: 5,
        contactEmail: '',
        accountManager: 'Mónica Serrano · Directora Comercial EA',
      });
    }
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name || !brandForm.destinationUrl) {
      alert('Por favor completa el nombre de la marca y su sitio web.');
      return;
    }

    if (editingBrand) {
      updateBrand(editingBrand.id, brandForm);
    } else {
      const rawSlug = brandForm.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const newBrand: SponsorBrand = {
        id: `brand-${rawSlug}-${Date.now()}`,
        name: brandForm.name,
        logoUrl: brandForm.logoUrl || '',
        description: brandForm.description || '',
        destinationUrl: brandForm.destinationUrl,
        category: brandForm.category || 'Arquitectura & Diseño',
        status: brandForm.status || 'activa',
        priority: brandForm.priority || 5,
        contactEmail: brandForm.contactEmail || '',
        portalToken: `ea_adv_${rawSlug}_${Math.random().toString(36).substring(2, 7)}`,
        portalEnabled: true,
        accountManager: brandForm.accountManager || 'Mónica Serrano · Directora Comercial EA',
        createdAt: today,
      };
      addBrand(newBrand);
    }
    setIsBrandModalOpen(false);
  };

  // Live preview active campaign
  const currentPreviewCampaign = campaigns.find((c) => c.id === previewCampaignId) || campaigns[0];
  const currentPreviewBrand = currentPreviewCampaign ? getBrandById(currentPreviewCampaign.brandId) : undefined;

  // Aggregate KPI totals
  const totalImpressions = Object.values(analytics.impressions).reduce((a, b) => a + b, 0);
  const totalClicks = Object.values(analytics.clicks).reduce((a, b) => a + b, 0);
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'activa').length;
  const draftCampaignsCount = campaigns.filter((c) => c.status === 'borrador').length;

  return (
    <div className="flex-1 flex flex-col bg-[#121212] text-white overflow-hidden font-inter">
      {/* 1. TOP SUBTABS BAR */}
      <div className="bg-[#181818] border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/60 p-1 border border-white/10">
            <button
              onClick={() => setSubTab('campaigns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                subTab === 'campaigns' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Campañas & Anunciantes</span>
            </button>

            <button
              onClick={() => setSubTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                subTab === 'preview' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Previsualizador en Vivo</span>
            </button>

            <button
              onClick={() => setSubTab('brands')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                subTab === 'brands' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Directorio Anunciantes ({brands.length})</span>
            </button>

            <button
              onClick={() => setSubTab('placements')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                subTab === 'placements' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Espacios & Tarifario</span>
            </button>

            <button
              onClick={() => setSubTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                subTab === 'analytics' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analítica Global</span>
            </button>
          </div>
        </div>

        {/* Disk Save Controls */}
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="font-mono text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 border border-emerald-500/30">
              {saveMessage}
            </span>
          )}

          <button
            onClick={() => saveToDisk()}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR EN DISCO'}</span>
          </button>
        </div>
      </div>

      {/* 2. ALERTS BAR */}
      {(expiringCampaigns.length > 0 || inactiveCampaigns.length > 0) && (
        <div className="bg-[#1e1b12] border-b border-amber-500/30 px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            {expiringCampaigns.length > 0 && (
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>{expiringCampaigns.length} campaña(s)</strong> próxima(s) a finalizar en $\le$ 7 días.
                </span>
              </div>
            )}
            {inactiveCampaigns.length > 0 && (
              <div className="flex items-center gap-2 text-sky-300">
                <Info className="w-4 h-4 shrink-0 text-sky-400" />
                <span>
                  <strong>{inactiveCampaigns.length} campaña(s)</strong> activas aún sin impresiones.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ========================================================================= */}
        {/* SUBTAB 1: CAMPAIGN DASHBOARD - ONE DASHBOARD PER ADVERTISER               */}
        {/* ========================================================================= */}
        {subTab === 'campaigns' && (
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Header: Organization toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-anton text-2xl tracking-wider uppercase text-white">
                  GESTIÓN PUBLICITARIA
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Organiza y monitorea las pautas de forma individual por anunciante para evitar confusiones.
                </p>
              </div>

              {/* View Switcher: By Advertiser vs All Campaigns */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-black/70 p-1 border border-white/20 rounded">
                  <button
                    onClick={() => setCampaignsMode('by-advertiser')}
                    className={`px-3 py-1 text-xs font-anton uppercase tracking-wider transition-colors ${
                      campaignsMode === 'by-advertiser' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Un Dashboard por Anunciante
                  </button>
                  <button
                    onClick={() => setCampaignsMode('all-campaigns')}
                    className={`px-3 py-1 text-xs font-anton uppercase tracking-wider transition-colors ${
                      campaignsMode === 'all-campaigns' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Todas las Campañas ({campaigns.length})
                  </button>
                </div>

                <button
                  onClick={() => handleOpenCampaignModal(undefined, activeBrand?.id)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors shadow-lg font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>NUEVA CAMPAÑA</span>
                </button>
              </div>
            </div>

            {/* ================================================================= */}
            {/* MODE A: UN DASHBOARD POR ANUNCIANTE (RECOMENDADO)                 */}
            {/* ================================================================= */}
            {campaignsMode === 'by-advertiser' && (
              <div className="flex flex-col gap-6">
                {/* 1. Advertiser Selector Horizontal Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {brands.map((b) => {
                    const isSelected = b.id === (activeBrand?.id || '');
                    const bMetrics = getBrandMetrics(b.id);

                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelectedAdvertiserId(b.id)}
                        className={`text-left p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#222] border-white shadow-[3px_3px_0px_#fff]'
                            : 'bg-[#181818] border-white/15 hover:border-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 bg-black border border-white/20 p-1 flex items-center justify-center shrink-0">
                            {b.logoUrl ? (
                              <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain filter invert" />
                            ) : (
                              <Building2 className="w-4 h-4 text-white/50" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-anton text-xs uppercase tracking-wide text-white block truncate">
                              {b.name}
                            </span>
                            <span className="font-mono text-[9px] text-white/40 block truncate">
                              {b.category}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-white/60">
                          <span>
                            <strong className="text-white">{bMetrics.activeCampaigns}</strong> activas
                          </span>
                          <span className="text-amber-400 font-bold">{bMetrics.overallCtr}% CTR</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 2. Active Advertiser Executive Dashboard Box */}
                {activeBrand && activeBrandMetrics && (
                  <div className="bg-[#181818] border-2 border-white/20 p-6 rounded-sm shadow-xl flex flex-col gap-6">
                    {/* Header of this specific advertiser */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-white/10">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-black border border-white/20 p-2 flex items-center justify-center shrink-0">
                          {activeBrand.logoUrl ? (
                            <img src={activeBrand.logoUrl} alt={activeBrand.name} className="max-h-full max-w-full object-contain filter invert" />
                          ) : (
                            <Building2 className="w-7 h-7 text-white/60" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-white/50 uppercase">DASHBOARD DE ANUNCIANTE</span>
                            <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 uppercase font-bold">
                              {activeBrand.status}
                            </span>
                          </div>

                          <h3 className="font-anton text-2xl uppercase tracking-wider text-white mt-0.5">
                            {activeBrand.name}
                          </h3>

                          <p className="font-creato text-xs text-white/60 mt-0.5 max-w-xl">
                            {activeBrand.description}
                          </p>

                          <div className="flex items-center gap-3 mt-2 font-mono text-[10px] text-white/40">
                            <span>Contacto EA: <strong>{activeBrand.accountManager || 'Mónica Serrano'}</strong></span>
                            <span>·</span>
                            <a href={activeBrand.destinationUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                              Sitio Oficial ↗
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Primary Actions for this Advertiser */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => {
                            setShareProfileBrand(activeBrand);
                            setCopiedProfileLink(false);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-black hover:bg-white/90 font-anton text-xs uppercase tracking-wider shadow-[2px_2px_0px_#fff]"
                          title="Compartir Portal Completo con este Anunciante"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>COMPARTIR PERFIL AL CLIENTE</span>
                        </button>

                        <button
                          onClick={() => {
                            setPreviewCampaignId(activeBrandCampaigns[0]?.id || campaigns[0]?.id || '');
                            setSubTab('preview');
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-anton text-xs uppercase tracking-wider"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>VER EN LA WEB</span>
                        </button>

                        <button
                          onClick={() => handleOpenCampaignModal(undefined, activeBrand.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-anton text-xs uppercase tracking-wider"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>AÑADIR CAMPAÑA</span>
                        </button>
                      </div>
                    </div>

                    {/* KPI Meters for this Advertiser */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
                      <div className="bg-black/50 p-3.5 border border-white/10">
                        <span className="text-white/40 text-[10px] uppercase block">Campañas Registradas</span>
                        <span className="font-anton text-2xl text-white mt-1 block">
                          {activeBrandMetrics.activeCampaigns} <span className="text-sm text-white/40">/ {activeBrandMetrics.totalCampaigns}</span>
                        </span>
                        <span className="text-[10px] text-white/40 block mt-0.5">{activeBrandMetrics.draftCampaigns} borradores</span>
                      </div>

                      <div className="bg-black/50 p-3.5 border border-white/10">
                        <span className="text-white/40 text-[10px] uppercase block">Inversión Contratada</span>
                        <span className="font-anton text-2xl text-white mt-1 block">
                          ${activeBrandMetrics.totalBudget.toLocaleString()} <span className="text-xs text-white/40">USD</span>
                        </span>
                        <span className="text-[10px] text-white/40 block mt-0.5">Meta: {activeBrandMetrics.totalTargetImpressions.toLocaleString()} imp</span>
                      </div>

                      <div className="bg-black/50 p-3.5 border border-white/10">
                        <span className="text-white/40 text-[10px] uppercase block">Impresiones Auditadas</span>
                        <span className="font-anton text-2xl text-emerald-400 mt-1 block">
                          {activeBrandMetrics.validImpressions.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-white/40 block mt-0.5">Visibilidad &ge; 1s MRC</span>
                      </div>

                      <div className="bg-black/50 p-3.5 border border-white/10">
                        <span className="text-white/40 text-[10px] uppercase block">Clics Válidos</span>
                        <span className="font-anton text-2xl text-white mt-1 block">
                          {activeBrandMetrics.validClicks}
                        </span>
                        <span className="text-[10px] text-white/40 block mt-0.5">{activeBrandMetrics.grossClicks} clics brutos</span>
                      </div>

                      <div className="bg-black/50 p-3.5 border border-white/10">
                        <span className="text-white/40 text-[10px] uppercase block">CTR Ponderado</span>
                        <span className="font-anton text-2xl text-amber-400 mt-1 block">
                          {activeBrandMetrics.overallCtr}%
                        </span>
                        <span className="text-[10px] text-white/40 block mt-0.5">
                          {activeBrandMetrics.overallDeliveryPercent ? `${activeBrandMetrics.overallDeliveryPercent}% entrega` : 'Pauta libre'}
                        </span>
                      </div>
                    </div>

                    {/* Campaigns Table of this Advertiser */}
                    <div className="border border-white/15 bg-black/40 rounded-sm overflow-hidden">
                      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
                        <span className="font-anton text-xs uppercase tracking-wider text-white">
                          Pautas y Creatividades de {activeBrand.name} ({activeBrandCampaigns.length})
                        </span>
                        <span className="font-mono text-[10px] text-white/40">
                          Token de Perfil: {activeBrand.portalToken || 'No generado'}
                        </span>
                      </div>

                      {activeBrandCampaigns.length === 0 ? (
                        <div className="p-8 text-center font-mono text-xs text-white/40">
                          Este anunciante no tiene campañas configuradas. Haz clic en "Añadir Campaña" para crear la primera.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-mono text-xs border-collapse">
                            <thead className="bg-black/80 text-white/40 uppercase text-[10px] border-b border-white/10">
                              <tr>
                                <th className="py-2.5 px-3">Campaña</th>
                                <th className="py-2.5 px-3">Estado</th>
                                <th className="py-2.5 px-3">Período</th>
                                <th className="py-2.5 px-3 text-right">Presupuesto / Meta</th>
                                <th className="py-2.5 px-3 text-right">Imp. Válidas</th>
                                <th className="py-2.5 px-3 text-right">Clics</th>
                                <th className="py-2.5 px-3 text-right">CTR</th>
                                <th className="py-2.5 px-3 text-center">Entrega</th>
                                <th className="py-2.5 px-3 text-center">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-white/80">
                              {activeBrandCampaigns.map((camp) => {
                                const metrics = getCampaignMetrics(camp.id);
                                return (
                                  <tr key={camp.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-3 font-inter">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 bg-black border border-white/15 overflow-hidden shrink-0">
                                          <img src={camp.desktopAsset} alt={camp.name} className="w-full h-full object-cover filter grayscale" />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="font-bold text-white block truncate max-w-xs">{camp.name}</span>
                                          <span className="font-mono text-[9px] text-white/40 block truncate">
                                            {camp.placements.join(', ')}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3">
                                      <span
                                        className={`px-2 py-0.5 text-[9px] uppercase font-bold border ${
                                          camp.status === 'activa'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                            : camp.status === 'programada'
                                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                            : camp.status === 'pausada'
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                            : 'bg-white/5 text-white/40 border-white/10'
                                        }`}
                                      >
                                        {camp.status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-[11px] text-white/60 whitespace-nowrap">
                                      {camp.startDate} al {camp.endDate}
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                      {camp.budget ? <span className="font-bold text-white block">${camp.budget}</span> : '—'}
                                      {camp.targetImpressions && <span className="text-[9px] text-white/40 block">Meta: {camp.targetImpressions}</span>}
                                    </td>
                                    <td className="py-3 px-3 text-right font-bold text-white">
                                      {metrics.validImpressions.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-3 text-right font-bold text-amber-400">
                                      {metrics.validClicks}
                                    </td>
                                    <td className="py-3 px-3 text-right font-bold text-white">
                                      {metrics.ctr}%
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                      {metrics.deliveryPercent !== null ? (
                                        <span className="font-bold text-emerald-400">{metrics.deliveryPercent}%</span>
                                      ) : '—'}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          onClick={() => {
                                            setPreviewCampaignId(camp.id);
                                            setSubTab('preview');
                                          }}
                                          title="Previsualizar en Vivo"
                                          className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleOpenCampaignModal(camp, activeBrand.id)}
                                          title="Editar"
                                          className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDuplicateCampaign(camp)}
                                          title="Duplicar"
                                          className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleTogglePause(camp)}
                                          title={camp.status === 'activa' ? 'Pausar' : 'Activar'}
                                          className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded"
                                        >
                                          {camp.status === 'activa' ? <PauseCircle className="w-3.5 h-3.5 text-amber-400" /> : <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />}
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm(`¿Eliminar la campaña "${camp.name}"?`)) {
                                              deleteCampaign(camp.id);
                                            }
                                          }}
                                          title="Eliminar"
                                          className="p-1 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* MODE B: TODAS LAS CAMPAÑAS (VISTA GLOBAL PLANA)                   */}
            {/* ================================================================= */}
            {campaignsMode === 'all-campaigns' && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#181818] border border-white/10 p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por campaña o marca..."
                      className="bg-black/60 border border-white/20 px-2 py-1 text-xs text-white w-52"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-black border border-white/20 px-2 py-1 text-xs text-white"
                    >
                      <option value="todas">Todos los estados</option>
                      <option value="activa">Activas</option>
                      <option value="programada">Programadas</option>
                      <option value="pausada">Pausadas</option>
                      <option value="borrador">Borradores</option>
                      <option value="finalizada">Finalizadas</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#181818] border border-white/15 rounded-sm overflow-hidden">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-black/60 text-white/40 uppercase text-[10px] border-b border-white/10">
                      <tr>
                        <th className="py-2.5 px-3">Campaña / Marca</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3 text-right">Imp. Válidas</th>
                        <th className="py-2.5 px-3 text-right">Clics</th>
                        <th className="py-2.5 px-3 text-right">CTR</th>
                        <th className="py-2.5 px-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-white/80">
                      {displayedCampaigns.map((camp) => {
                        const brand = getBrandById(camp.brandId);
                        const metrics = getCampaignMetrics(camp.id);
                        return (
                          <tr key={camp.id} className="hover:bg-white/5">
                            <td className="py-2.5 px-3 font-inter">
                              <span className="font-bold text-white block">{camp.name}</span>
                              <span className="text-[11px] text-white/50">{brand?.name}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[9px] uppercase font-bold border px-1.5 py-0.5 border-white/20">
                                {camp.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-white">{metrics.validImpressions}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-amber-400">{metrics.validClicks}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-white">{metrics.ctr}%</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => {
                                  setPreviewCampaignId(camp.id);
                                  setSubTab('preview');
                                }}
                                className="text-emerald-400 hover:underline text-[11px]"
                              >
                                Ver en Web
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: PREVISUALIZADOR EN VIVO REAL EN CONTEXTO (MOCKUP IN-CONTEXT)    */}
        {/* ========================================================================= */}
        {subTab === 'preview' && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {/* Header controls bar */}
            <div className="bg-[#181818] border border-white/15 p-4 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="font-anton text-lg tracking-wider uppercase text-white">
                    PREVISUALIZADOR EDITORIAL EN CONTEXTO REAL
                  </h2>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  Visualización exacta del banner insertado dentro de la página real (Dossier Editorial, Catálogo o Skyscrapers).
                </p>
              </div>

              {/* Selector controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Select campaign */}
                <select
                  value={previewCampaignId}
                  onChange={(e) => setPreviewCampaignId(e.target.value)}
                  className="bg-black border border-white/20 px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.status.toUpperCase()}] {c.name} ({getBrandById(c.brandId)?.name})
                    </option>
                  ))}
                </select>

                {/* Select placement */}
                <select
                  value={previewPlacement}
                  onChange={(e) => setPreviewPlacement(e.target.value as AdPlacementId)}
                  className="bg-black border border-white/20 px-3 py-1.5 text-xs font-mono text-white focus:outline-none font-bold"
                >
                  <option value="dossier-editorial">Dossier Editorial (Inter-módulo en Ficha de Proyecto)</option>
                  <option value="entre-proyectos">Entre Proyectos (Catálogo In-Feed Grid)</option>
                  <option value="pie-articulo">Cierre de Reseña (Post-Contenido Editorial) [Nuevo]</option>
                  <option value="skyscrapers-laterales">Skyscrapers Laterales (Sticky Wings)</option>
                  <option value="destacado-home">Destacado Home (Portada Principal)</option>
                  <option value="barra-top-sponsor">Franja Institucional Superior (Top Bar) [Nuevo]</option>
                  <option value="inter-galeria">Inter-Módulo en Galería Fotográfica [Nuevo]</option>
                  <option value="comunidad-infeed">Notas Comunitarias & Archivo Abierto [Nuevo]</option>
                </select>

                {/* Device switch */}
                <div className="flex items-center bg-black/60 p-0.5 border border-white/20 rounded">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-anton tracking-wider ${
                      previewDevice === 'desktop' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>PC</span>
                  </button>

                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-anton tracking-wider ${
                      previewDevice === 'tablet' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>TAB</span>
                  </button>

                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-anton tracking-wider ${
                      previewDevice === 'mobile' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>MÓVIL</span>
                  </button>
                </div>

                {/* One click live publish if draft */}
                {currentPreviewCampaign && (
                  <button
                    onClick={() => handleTogglePause(currentPreviewCampaign)}
                    className={`px-3.5 py-1.5 text-xs font-anton tracking-wider uppercase border transition-colors ${
                      currentPreviewCampaign.status === 'activa'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 font-bold'
                    }`}
                  >
                    {currentPreviewCampaign.status === 'activa' ? 'PAUSAR PAUTA' : 'PUBLICAR EN VIVO'}
                  </button>
                )}
              </div>
            </div>

            {/* REALISTIC CONTEXTUAL MOCKUP CANVAS (100% REAL DATA FROM PROJECTS.JSON) */}
            {currentPreviewCampaign ? (
              <div className="border-2 border-white/15 bg-[#EFECE6] p-4 sm:p-8 flex flex-col items-center justify-center min-h-[600px] overflow-hidden relative text-ea-black select-none">
                <div className="absolute top-2 left-3 font-mono text-[9px] text-ea-black/40 uppercase tracking-widest">
                  ENTORNO SIMULADO: {previewPlacement.toUpperCase()} · VISTA: {previewDevice.toUpperCase()} · CAMPAÑA: {currentPreviewCampaign.name}
                </div>

                {/* 1. DOSSIER EDITORIAL SIMULATION (REAL PROJECT: EDIFICIO ATRIUM) */}
                {previewPlacement === 'dossier-editorial' && (() => {
                  const p1 = realProjects[0];
                  return (
                    <div
                      className={`bg-white border-2 border-ea-black shadow-[4px_4px_0px_#000] p-6 sm:p-10 transition-all ${
                        previewDevice === 'desktop'
                          ? 'w-full max-w-[850px]'
                          : previewDevice === 'tablet'
                          ? 'w-[580px]'
                          : 'w-[360px] p-4'
                      }`}
                    >
                      <div className="border-b-2 border-ea-black pb-4 mb-6">
                        <span className="font-mono text-[10px] text-ea-black/50 uppercase tracking-widest block mb-1">
                          EXPEDIENTE MONOGRÁFICO // {p1.category.toUpperCase()}
                        </span>
                        <h3 className="font-okcok text-2xl sm:text-3xl uppercase font-bold text-ea-black">
                          {p1.title}
                        </h3>
                        <p className="font-creato text-xs text-ea-black/60 mt-1">
                          {p1.studio} · {p1.location} · {p1.year}
                        </p>
                      </div>

                      <p className="font-creato text-xs sm:text-sm text-ea-black/80 leading-relaxed mb-6">
                        {p1.resena}
                      </p>

                      {/* Real ad banner sitting directly in the dossier flow */}
                      <div className="my-6 flex justify-center">
                        <InFeedProjectAdCard
                          campaign={currentPreviewCampaign}
                          brand={currentPreviewBrand}
                          layoutVariant="panoramic-card"
                          isPreview={true}
                        />
                      </div>

                      <p className="font-creato text-xs sm:text-sm text-ea-black/80 leading-relaxed mt-6">
                        {p1.critica}
                      </p>

                      <div className="mt-8 pt-4 border-t border-ea-black/20 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[10px] text-ea-black/60">
                        <div>
                          <span className="block text-ea-black/40 uppercase">Superficie</span>
                          <strong className="text-ea-black">{p1.datos?.superficie}</strong>
                        </div>
                        <div>
                          <span className="block text-ea-black/40 uppercase">Estructura</span>
                          <strong className="text-ea-black">{p1.datos?.estructura}</strong>
                        </div>
                        <div>
                          <span className="block text-ea-black/40 uppercase">Fotografía</span>
                          <strong className="text-ea-black">{p1.datos?.fotografia}</strong>
                        </div>
                        <div>
                          <span className="block text-ea-black/40 uppercase">Certificación</span>
                          <strong className="text-ea-black">{p1.datos?.certificacion}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. ENTRE PROYECTOS (REAL CATALOG GRID WITH REAL ORIGAMI CARDS) */}
                {previewPlacement === 'entre-proyectos' && (() => {
                  const p1 = realProjects[0];
                  const p2 = realProjects[1];
                  return (
                    <div
                      className={`transition-all ${
                        previewDevice === 'desktop'
                          ? 'w-full max-w-[1120px]'
                          : previewDevice === 'tablet'
                          ? 'w-[740px]'
                          : 'w-[360px]'
                      }`}
                    >
                      <div className="bg-white border-2 border-ea-black p-4 mb-4 flex items-center justify-between shadow-[2px_2px_0px_#000]">
                        <span className="font-okcok text-sm uppercase font-bold">
                          CATÁLOGO // 142 PROYECTOS ARQUITECTÓNICOS
                        </span>
                        <span className="font-mono text-[10px] text-ea-black/50">RETÍCULA EDITORIAL 3 COLUMNAS</span>
                      </div>

                      <div
                        className={`grid gap-5 items-start justify-items-center ${
                          previewDevice === 'desktop'
                            ? 'grid-cols-3'
                            : previewDevice === 'tablet'
                            ? 'grid-cols-2'
                            : 'grid-cols-1'
                        }`}
                      >
                        {/* Real Project Card 1: Edificio Atrium */}
                        <OrigamiFolderCard project={p1} index={0} onSelect={() => {}} />

                        {/* Real Ad Card Inserted In-Feed */}
                        <div className="flex justify-center">
                          <InFeedProjectAdCard
                            campaign={currentPreviewCampaign}
                            brand={currentPreviewBrand}
                            layoutVariant="vertical-card"
                            isPreview={true}
                          />
                        </div>

                        {/* Real Project Card 2: Casa Entre Árboles */}
                        {previewDevice !== 'mobile' && (
                          <OrigamiFolderCard project={p2} index={1} onSelect={() => {}} />
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. PIE DE ARTÍCULO / POST-CONTENIDO (NUEVO ESPACIO) */}
                {previewPlacement === 'pie-articulo' && (() => {
                  const p1 = realProjects[0];
                  return (
                    <div
                      className={`bg-white border-2 border-ea-black shadow-[4px_4px_0px_#000] p-6 sm:p-10 transition-all ${
                        previewDevice === 'desktop' ? 'w-full max-w-[850px]' : 'w-[360px] p-4'
                      }`}
                    >
                      <div className="pb-4 mb-4">
                        <span className="font-anton text-xs text-ea-black/50 uppercase tracking-widest block mb-2">
                          CONCLUSIÓN MONOGRÁFICA · {p1.title}
                        </span>
                        <p className="font-creato text-xs sm:text-sm text-ea-black/80 leading-relaxed">
                          {p1.memory}
                        </p>
                      </div>

                      {/* Closing panoramic ad placement */}
                      <div className="my-6">
                        <div className="font-mono text-[9px] text-ea-black/40 uppercase mb-1">
                          ESPACIO AUSPICIADO AL CIERRE DEL ARTÍCULO
                        </div>
                        <InFeedProjectAdCard
                          campaign={currentPreviewCampaign}
                          brand={currentPreviewBrand}
                          layoutVariant="panoramic-card"
                          isPreview={true}
                        />
                      </div>

                      {/* Real Podcast Box */}
                      {p1.podcast && (
                        <div className="bg-[#FAF8F5] border border-ea-black/20 p-4 mt-6 flex items-center justify-between">
                          <div>
                            <span className="font-mono text-[9px] text-ea-black/50 uppercase block">
                              EPISODIO EDITORIAL {p1.podcast.episode}
                            </span>
                            <h4 className="font-okcok text-sm uppercase font-bold text-ea-black">
                              {p1.podcast.title}
                            </h4>
                          </div>
                          <span className="font-mono text-xs text-ea-black/60">{p1.podcast.duration}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 4. SKYSCRAPERS LATERALES (STICKY WINGS) */}
                {previewPlacement === 'skyscrapers-laterales' && (() => {
                  const p1 = realProjects[0];
                  return (
                    <div className="w-full max-w-[1040px] flex items-start justify-center gap-4">
                      {/* Left Wing Banner */}
                      <div className="w-[180px] h-[640px] shrink-0">
                        <VerticalAdCarousel
                          modernCampaign={currentPreviewCampaign}
                          brand={currentPreviewBrand}
                          position="izquierdo"
                          isPreview={true}
                        />
                      </div>

                      {/* Real Central Monograph Column */}
                      <div className="flex-1 bg-white border border-ea-black/30 p-6 min-h-[580px] flex flex-col justify-between">
                        <div>
                          <span className="font-mono text-[10px] text-ea-black/50 uppercase block">
                            EXPEDIENTE MONOGRÁFICO // {p1.location} · {p1.year}
                          </span>
                          <h3 className="font-okcok text-2xl uppercase font-bold mt-1">{p1.title}</h3>
                          <p className="font-anton text-xs text-ea-black/60 uppercase mt-0.5">{p1.studio}</p>
                          <p className="font-creato text-xs text-ea-black/80 mt-3 leading-relaxed">
                            {p1.memory}
                          </p>
                          <p className="font-creato text-xs text-ea-black/70 mt-3 leading-relaxed border-t border-ea-black/10 pt-3">
                            {p1.resena}
                          </p>
                        </div>

                        <div className="p-3 bg-neutral-50 border border-ea-black/20 text-center font-mono text-[10px] text-ea-black/60 mt-4">
                          Los skyscrapers laterales flanquean el contenido y permanecen fijos durante el scroll del lector ocupando casi toda la altura de la pantalla.
                        </div>
                      </div>

                      {/* Right Wing Banner (Desktop only) */}
                      {previewDevice === 'desktop' && (
                        <div className="w-[180px] h-[640px] shrink-0">
                          <VerticalAdCarousel
                            modernCampaign={currentPreviewCampaign}
                            brand={currentPreviewBrand}
                            position="derecho"
                            isPreview={true}
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 5. DESTACADO HOME */}
                {previewPlacement === 'destacado-home' && (
                  <div
                    className={`bg-white border-2 border-ea-black p-6 sm:p-8 shadow-[4px_4px_0px_#000] transition-all ${
                      previewDevice === 'desktop' ? 'w-full max-w-[850px]' : 'w-[360px] p-4'
                    }`}
                  >
                    <div className="border-b border-ea-black/20 pb-3 mb-4">
                      <span className="font-anton text-xs uppercase tracking-widest text-ea-black/50">
                        ECUADORIAN ARCHITECTURE // ARCHIVO ABIERTO
                      </span>
                      <h4 className="font-okcok text-lg uppercase font-bold text-ea-black mt-1">
                        ALIANZAS Y PATROCINIOS DESTACADOS
                      </h4>
                    </div>

                    <InFeedProjectAdCard
                      campaign={currentPreviewCampaign}
                      brand={currentPreviewBrand}
                      layoutVariant="panoramic-card"
                      isPreview={true}
                    />
                  </div>
                )}

                {/* 6. FRANJA INSTITUCIONAL SUPERIOR / TOP BAR (NUEVO ESPACIO) */}
                {previewPlacement === 'barra-top-sponsor' && (
                  <div
                    className={`bg-white border-2 border-ea-black shadow-[4px_4px_0px_#000] p-4 sm:p-6 transition-all ${
                      previewDevice === 'desktop' ? 'w-full max-w-[950px]' : 'w-[360px] p-3'
                    }`}
                  >
                    {/* Faux Navbar */}
                    <div className="flex items-center justify-between pb-3 border-b-2 border-ea-black mb-3">
                      <span className="font-okcok text-base font-bold uppercase">ECUADORIAN ARCHITECTURE</span>
                      <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-ea-black/70">
                        <span>PROYECTOS</span>
                        <span>ACADEMIA</span>
                        <span>TERRITORIOS</span>
                      </div>
                    </div>

                    {/* Real Top Sponsor Strip */}
                    <div className="bg-[#FAF8F5] border border-ea-black p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
                      <div className="flex items-center gap-3">
                        {currentPreviewBrand?.logoUrl ? (
                          <img src={currentPreviewBrand.logoUrl} alt="" className="h-5 w-auto object-contain grayscale" />
                        ) : (
                          <Building2 className="w-5 h-5 text-ea-black" />
                        )}
                        <div>
                          <span className="font-mono text-[9px] uppercase font-bold text-ea-black/60 block">
                            {currentPreviewCampaign.kicker || 'PATROCINIO OFICIAL'}
                          </span>
                          <span className="font-okcok text-xs uppercase font-bold text-ea-black">
                            {currentPreviewCampaign.title}
                          </span>
                        </div>
                      </div>

                      <a
                        href={currentPreviewCampaign.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-ea-black text-white font-anton text-[10px] uppercase tracking-wider shrink-0"
                      >
                        {currentPreviewCampaign.ctaText || 'CONOCER MÁS'} →
                      </a>
                    </div>
                  </div>
                )}

                {/* 7. INTER-MÓDULO EN GALERÍA FOTOGRÁFICA (NUEVO ESPACIO) */}
                {previewPlacement === 'inter-galeria' && (() => {
                  const p1 = realProjects[0];
                  return (
                    <div
                      className={`bg-white border-2 border-ea-black shadow-[4px_4px_0px_#000] p-6 sm:p-8 transition-all ${
                        previewDevice === 'desktop' ? 'w-full max-w-[850px]' : 'w-[360px] p-4'
                      }`}
                    >
                      <div className="mb-4">
                        <span className="font-mono text-[10px] text-ea-black/50 uppercase block">
                          DOCUMENTACIÓN FOTOGRÁFICA // {p1.title}
                        </span>
                        <div className="h-56 bg-ea-black/10 border border-ea-black mt-2 overflow-hidden relative">
                          <img src={p1.heroImage} alt={p1.title} className="w-full h-full object-cover grayscale" />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[9px] px-2 py-0.5">
                            {p1.datos?.fotografia}
                          </div>
                        </div>
                      </div>

                      {/* In-gallery ad banner */}
                      <div className="my-6">
                        <InFeedProjectAdCard
                          campaign={currentPreviewCampaign}
                          brand={currentPreviewBrand}
                          layoutVariant="panoramic-card"
                          isPreview={true}
                        />
                      </div>

                      <div className="p-4 border border-ea-black/20 bg-[#FAF8F5] text-center font-mono text-[10px] text-ea-black/60">
                        Planimetría técnica y axonométrica de {p1.title} (RAMA ESTUDIO).
                      </div>
                    </div>
                  );
                })()}

                {/* 8. NOTAS COMUNITARIAS & ARCHIVO ABIERTO (NUEVO ESPACIO) */}
                {previewPlacement === 'comunidad-infeed' && (() => {
                  const n1 = realNotesData.visits[0];
                  const n2 = realNotesData.visits[1];
                  return (
                    <div
                      className={`bg-white border-2 border-ea-black shadow-[4px_4px_0px_#000] p-6 sm:p-8 transition-all ${
                        previewDevice === 'desktop' ? 'w-full max-w-[850px]' : 'w-[360px] p-4'
                      }`}
                    >
                      <div className="pb-3 border-b-2 border-ea-black mb-4">
                        <span className="font-anton text-xs uppercase tracking-widest text-ea-black/50">
                          BITÁCORA COLABORATIVA & NOTAS DE VISITA
                        </span>
                      </div>

                      {/* Real Note 1 */}
                      {n1 && (
                        <div className="bg-[#FAF8F5] border border-ea-black p-4 mb-4">
                          <div className="flex items-center justify-between mb-1 font-mono text-[10px]">
                            <strong>{n1.authorName}</strong>
                            <span className="text-ea-black/40">{n1.visitDate}</span>
                          </div>
                          <p className="font-creato text-xs text-ea-black/80">{n1.experience}</p>
                        </div>
                      )}

                      {/* Community ad banner */}
                      <div className="my-5">
                        <InFeedProjectAdCard
                          campaign={currentPreviewCampaign}
                          brand={currentPreviewBrand}
                          layoutVariant="panoramic-card"
                          isPreview={true}
                        />
                      </div>

                      {/* Real Note 2 */}
                      {n2 && (
                        <div className="bg-[#FAF8F5] border border-ea-black p-4">
                          <div className="flex items-center justify-between mb-1 font-mono text-[10px]">
                            <strong>{n2.authorName}</strong>
                            <span className="text-ea-black/40">{n2.visitDate}</span>
                          </div>
                          <p className="font-creato text-xs text-ea-black/80">{n2.experience}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center font-mono text-xs text-white/40 py-16">
                No hay campañas disponibles para previsualizar.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: BRANDS DIRECTORY                                                */}
        {/* ========================================================================= */}
        {subTab === 'brands' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-anton text-2xl tracking-wider uppercase text-white">
                  DIRECTORIO DE ANUNCIANTES
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Gestiona empresas aliadas, credenciales de portal y contactos comerciales.
                </p>
              </div>

              <button
                onClick={() => handleOpenBrandModal()}
                className="flex items-center gap-2 bg-white text-black hover:bg-white/90 px-4 py-2 text-xs font-anton tracking-wider uppercase transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>NUEVO ANUNCIANTE</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brands.map((b) => {
                const brandCampaigns = campaigns.filter((c) => c.brandId === b.id);
                return (
                  <div
                    key={b.id}
                    className="bg-[#181818] border border-white/15 p-4 rounded-sm flex items-start justify-between gap-4 hover:border-white/30 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 bg-black border border-white/15 p-1 flex items-center justify-center shrink-0">
                        {b.logoUrl ? (
                          <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain filter invert" />
                        ) : (
                          <Building2 className="w-6 h-6 text-white/40" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-anton text-base tracking-wider uppercase text-white truncate">
                            {b.name}
                          </h3>
                          <span
                            className={`font-mono text-[9px] uppercase px-1.5 py-0.2 border ${
                              b.status === 'activa'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        <span className="font-anton text-xs text-white/60 uppercase tracking-widest block mt-0.5">
                          {b.category}
                        </span>

                        <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-white/40">
                          <span>{brandCampaigns.length} campaña(s)</span>
                          <span>·</span>
                          <button
                            onClick={() => {
                              setSelectedAdvertiserId(b.id);
                              setCampaignsMode('by-advertiser');
                              setSubTab('campaigns');
                            }}
                            className="text-emerald-400 hover:underline"
                          >
                            Ver Dashboard →
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setShareProfileBrand(b);
                          setCopiedProfileLink(false);
                        }}
                        title="Compartir Perfil al Cliente"
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenBrandModal(b)}
                        title="Editar"
                        className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al anunciante "${b.name}"?`)) {
                            deleteBrand(b.id);
                          }
                        }}
                        title="Eliminar"
                        className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 4: COMMERCIAL PLACEMENTS & MEDIA KIT SPEC                          */}
        {/* ========================================================================= */}
        {subTab === 'placements' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-anton text-2xl tracking-wider uppercase text-white">
                  TARIFARIO Y ESPECIFICACIONES COMERCIALES (MEDIA KIT)
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Dimensiones oficiales recomendadas para anunciantes, tarifas sugeridas CPM en USD y frecuencia.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySpecs}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-black font-anton text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors rounded-xs shadow-md cursor-pointer shrink-0"
                title="Copiar texto con todas las medidas para enviar a clientes y anunciantes"
              >
                {copiedSpecs ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSpecs ? '¡MEDIDAS COPIADAS!' : 'COPIAR MEDIDAS PARA CLIENTE'}</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {placements.map((plc) => (
                <div key={plc.id} className="bg-[#181818] border border-white/15 p-5 rounded-sm flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${plc.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <h3 className="font-anton text-lg tracking-wider uppercase text-white">{plc.name}</h3>
                        <span className="font-mono text-[10px] text-white/40 border border-white/10 px-2 py-0.5">
                          ID: {plc.id}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-1.5 max-w-2xl">{plc.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 font-mono text-xs">
                        <div className="bg-black/50 p-2 border border-white/10">
                          <span className="text-white/40 text-[9px] uppercase block">Dimensiones</span>
                          <span className="text-white font-bold">{plc.recommendedDimensions || '1400 × 900 px'}</span>
                        </div>
                        <div className="bg-black/50 p-2 border border-white/10">
                          <span className="text-white/40 text-[9px] uppercase block">Formatos</span>
                          <span className="text-white font-bold">{plc.acceptedFormats?.join(', ') || 'WebP, JPG, PNG'}</span>
                        </div>
                        <div className="bg-black/50 p-2 border border-white/10">
                          <span className="text-white/40 text-[9px] uppercase block">Ubicación</span>
                          <span className="text-white font-bold">{plc.pageLocation || 'Catálogo'}</span>
                        </div>
                        <div className="bg-black/50 p-2 border border-white/10">
                          <span className="text-white/40 text-[9px] uppercase block">Tarifa Sugerida</span>
                          <span className="text-amber-400 font-bold">${plc.baseRateCpm || 25} USD / CPM</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => updatePlacementConfig(plc.id, { active: !plc.active })}
                      className={`px-3 py-1.5 text-xs font-anton tracking-wider uppercase border transition-colors shrink-0 ${
                        plc.active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-white/5 text-white/40 border-white/20'
                      }`}
                    >
                      {plc.active ? 'ACTIVO' : 'DESACTIVADO'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 5: GLOBAL ANALYTICS                                                */}
        {/* ========================================================================= */}
        {subTab === 'analytics' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div>
              <h2 className="font-anton text-2xl tracking-wider uppercase text-white">
                MÉTRICAS AUDITADAS Y RENDIMIENTO GLOBAL
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Datos consolidados de todos los anunciantes y formatos en Ecuadorian Architecture.
              </p>
            </div>

            <div className="bg-[#181818] border border-white/15 p-5 rounded-sm">
              <h3 className="font-anton text-xs uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span>Distribución por Dispositivo</span>
              </h3>
              <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-black/50 p-3.5 border border-white/10">
                  <span className="text-white/40 block text-[10px] uppercase">Escritorio</span>
                  <span className="text-xl text-white font-bold">{analytics.deviceBreakdown.desktop}</span>
                  <span className="text-[10px] text-white/40 block mt-1">Impresiones verificadas</span>
                </div>
                <div className="bg-black/50 p-3.5 border border-white/10">
                  <span className="text-white/40 block text-[10px] uppercase">Tablet</span>
                  <span className="text-xl text-white font-bold">{analytics.deviceBreakdown.tablet}</span>
                  <span className="text-[10px] text-white/40 block mt-1">Impresiones verificadas</span>
                </div>
                <div className="bg-black/50 p-3.5 border border-white/10">
                  <span className="text-white/40 block text-[10px] uppercase">Móvil</span>
                  <span className="text-xl text-white font-bold">{analytics.deviceBreakdown.mobile}</span>
                  <span className="text-[10px] text-white/40 block mt-1">Impresiones verificadas</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: COMPARTIR PERFIL DEL ANUNCIANTE (PORTAL DE MARCA)                  */}
      {/* ========================================================================= */}
      {shareProfileBrand && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/20 w-full max-w-lg rounded-sm shadow-2xl overflow-hidden font-inter">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-anton text-base tracking-wider uppercase text-white">
                  PORTAL CORPORATIVO DEL ANUNCIANTE
                </h3>
              </div>
              <button onClick={() => setShareProfileBrand(null)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 text-xs">
              <div>
                <span className="font-mono text-[10px] text-white/40 uppercase block">Anunciante Oficial</span>
                <span className="font-anton text-lg text-white block mt-0.5">{shareProfileBrand.name}</span>
                <span className="font-creato text-xs text-white/60">{shareProfileBrand.category}</span>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1.5">
                  Enlace Privado al Perfil del Anunciante (Solo Lectura)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getAdvertiserProfileUrl(shareProfileBrand.portalToken)}
                    className="flex-1 bg-black border border-white/20 px-3 py-2 text-white font-mono text-xs select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyProfileLink}
                    className="px-3.5 py-2 bg-white text-black hover:bg-white/90 font-anton text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0"
                  >
                    {copiedProfileLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedProfileLink ? '¡COPIADO!' : 'COPIAR'}</span>
                  </button>
                </div>
                <p className="font-creato text-[11px] text-white/50 mt-1.5">
                  Al entrar con este enlace, <strong>{shareProfileBrand.name}</strong> verá su propio portal corporativo con todas sus campañas, gráficos de evolución, simulador interactivo de cómo se ven en la web y descarga de CSV/PDF.
                </p>
              </div>

              {/* Security controls */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white block font-bold">Estado del Acceso</span>
                    <span className="text-white/40 text-[10px]">
                      {shareProfileBrand.portalEnabled !== false ? 'Activo y accesible para el cliente' : 'Acceso revocado'}
                    </span>
                  </div>

                  <button
                    onClick={handleToggleProfileAccess}
                    className={`px-3 py-1 text-[11px] font-anton uppercase tracking-wider border ${
                      shareProfileBrand.portalEnabled !== false
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {shareProfileBrand.portalEnabled !== false ? 'HABILITADO' : 'REVOCADO'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <span className="text-white block font-bold">Regenerar Token</span>
                    <span className="text-white/40 text-[10px]">Invalida el link previo si fue filtrado</span>
                  </div>

                  <button
                    onClick={handleRegenerateProfileToken}
                    disabled={isRegeneratingProfileToken}
                    className="px-3 py-1 text-[11px] font-anton uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    {isRegeneratingProfileToken ? 'GENERANDO...' : 'NUEVO TOKEN'}
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <a
                  href={getAdvertiserProfileUrl(shareProfileBrand.portalToken)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-anton tracking-wider uppercase text-emerald-400 hover:text-emerald-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Portal de {shareProfileBrand.name}</span>
                </a>

                <button
                  onClick={() => setShareProfileBrand(null)}
                  className="px-4 py-1.5 border border-white/20 text-white/70 hover:text-white font-anton text-xs uppercase"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR CAMPAÑA                                             */}
      {/* ========================================================================= */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] border border-white/20 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-sm shadow-2xl overflow-hidden font-inter">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-anton text-base tracking-wider uppercase text-white">
                {editingCampaign ? 'EDITAR CAMPAÑA' : 'CREAR NUEVA CAMPAÑA'}
              </h3>
              <button onClick={() => setIsCampaignModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCampaign(false);
              }}
              className="p-6 overflow-y-auto flex flex-col gap-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Anunciante *
                  </label>
                  <select
                    value={campForm.brandId}
                    onChange={(e) => setCampForm({ ...campForm, brandId: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Nombre Interno de Campaña *
                  </label>
                  <input
                    type="text"
                    value={campForm.name}
                    onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
                    placeholder="Ej. Colección Otoño Dekton 2026"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Antetítulo Editorial (Kicker)
                  </label>
                  <input
                    type="text"
                    value={campForm.kicker}
                    onChange={(e) => setCampForm({ ...campForm, kicker: e.target.value })}
                    placeholder="Ej. ESPACIO AUSPICIADO // MATERIALES"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Estado
                  </label>
                  <select
                    value={campForm.status}
                    onChange={(e) => setCampForm({ ...campForm, status: e.target.value as AdStatus })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="borrador">Borrador (No visible públicamente)</option>
                    <option value="activa">Activa (Publicada)</option>
                    <option value="programada">Programada por Fecha</option>
                    <option value="pausada">Pausada</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                  Titular Principal del Anuncio (Anton / Okcok) *
                </label>
                <input
                  type="text"
                  value={campForm.title}
                  onChange={(e) => setCampForm({ ...campForm, title: e.target.value })}
                  placeholder="Ej. Innovación en Fachadas Ventiladas para Alta Montaña"
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                  Subtítulo / Mensaje Secundario
                </label>
                <textarea
                  value={campForm.subtitle}
                  onChange={(e) => setCampForm({ ...campForm, subtitle: e.target.value })}
                  placeholder="Ej. Soluciones técnicas certificadas para arquitectos y constructoras."
                  rows={2}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              {/* GUÍA DE MEDIDAS OFICIALES PARA ENVIAR AL CLIENTE */}
              <div className="bg-neutral-900/90 border border-amber-400/40 p-3.5 rounded-xs flex flex-col gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-anton text-xs uppercase tracking-wider text-white">
                      GUÍA DE MEDIDAS OFICIALES PARA CLIENTES Y ANUNCIANTES
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySpecs}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-black font-anton text-[10.5px] uppercase tracking-wider hover:bg-amber-300 transition-colors rounded-xs shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                    title="Copiar texto con todas las medidas para enviar por WhatsApp o correo a la empresa"
                  >
                    {copiedSpecs ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSpecs ? '¡MEDIDAS COPIADAS!' : 'COPIAR MEDIDAS PARA CLIENTE'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-white/40 block text-[9px] uppercase">1. In-Feed (Catálogo)</span>
                    <span className="text-white font-bold text-[11px]">800 × 500 px</span>
                    <span className="text-white/50 block text-[8.5px]">Proporción 16:10</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-white/40 block text-[9px] uppercase">2. Skyscrapers Wings</span>
                    <span className="text-white font-bold text-[11px]">300 × 600 px</span>
                    <span className="text-white/50 block text-[8.5px]">Proporción 1:2</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-white/40 block text-[9px] uppercase">3. Banner Horizontal</span>
                    <span className="text-white font-bold text-[11px]">728 × 90 / 1200 × 200</span>
                    <span className="text-white/50 block text-[8.5px]">Inter-Galería Lightbox</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-white/40 block text-[9px] uppercase">4. Móvil Responsive</span>
                    <span className="text-white font-bold text-[11px]">600 × 600 px</span>
                    <span className="text-white/50 block text-[8.5px]">Cuadrado 1:1 o 3:2</span>
                  </div>
                </div>

                <p className="text-[10px] text-amber-300/90 font-mono">
                  * IMPORTANTE: Los banners renderizan exclusivamente la imagen gráfica final enviada por la empresa (sin tipografías ni botones sobrepuestos). El arte debe contener el logo, titular y botón dentro del propio diseño gráfico.
                </p>
              </div>

              {/* 1. ARTE PRINCIPAL / ESCRITORIO (IN-FEED, SKYSCRAPERS & DOSSIER) */}
              <div className="bg-black/40 border border-white/15 p-3.5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-mono text-[10.5px] uppercase font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-white/70" />
                    <span>Arte Principal / Escritorio *</span>
                  </label>
                  <span className="text-[9.5px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 border border-amber-400/30 rounded-xs self-start sm:self-auto">
                    Medida: 800 × 500 px (In-Feed) o 300 × 600 px (Skyscraper)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[9px] uppercase text-white/50 block mb-1">
                      Opción A: Subir archivo desde tu computadora
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-mono cursor-pointer transition-colors rounded-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Examinar imagen...</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(e) => handleFileUpload(e, 'desktopAsset')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="font-mono text-[9px] uppercase text-white/50 block mb-1">
                      Opción B: O pegar URL directa de la imagen
                    </label>
                    <input
                      type="url"
                      value={campForm.desktopAsset}
                      onChange={(e) => setCampForm({ ...campForm, desktopAsset: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {campForm.desktopAsset && (
                  <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                    <img
                      src={campForm.desktopAsset}
                      alt="Vista previa arte escritorio"
                      className="h-14 w-24 object-cover border border-white/30 bg-neutral-900 rounded-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px] text-white/70 block truncate">
                        Imagen cargada correctamente
                      </span>
                      <button
                        type="button"
                        onClick={() => setCampForm({ ...campForm, desktopAsset: '' })}
                        className="text-[10px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer mt-0.5"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. BANNER HORIZONTAL / INTER-GALERÍA (LIGHTBOX & LEADERBOARDS) */}
              <div className="bg-black/40 border border-white/15 p-3.5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-mono text-[10.5px] uppercase font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-white/70" />
                    <span>Banner Horizontal (Inter-Galería / Lightbox)</span>
                  </label>
                  <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 border border-emerald-400/30 rounded-xs self-start sm:self-auto">
                    Medida: 728 × 90 px (Leaderboard) o 1200 × 200 px (HD)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[9px] uppercase text-white/50 block mb-1">
                      Opción A: Subir banner horizontal
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-mono cursor-pointer transition-colors rounded-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Examinar banner horizontal...</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(e) => handleFileUpload(e, 'horizontalBannerAsset')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="font-mono text-[9px] uppercase text-white/50 block mb-1">
                      Opción B: O pegar URL directa
                    </label>
                    <input
                      type="url"
                      value={campForm.horizontalBannerAsset || ''}
                      onChange={(e) => setCampForm({ ...campForm, horizontalBannerAsset: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {campForm.horizontalBannerAsset && (
                  <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                    <img
                      src={campForm.horizontalBannerAsset}
                      alt="Vista previa banner horizontal"
                      className="h-10 w-32 object-contain border border-white/30 bg-neutral-900 rounded-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px] text-white/70 block truncate">
                        Banner horizontal cargado
                      </span>
                      <button
                        type="button"
                        onClick={() => setCampForm({ ...campForm, horizontalBannerAsset: '' })}
                        className="text-[10px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer mt-0.5"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. ARTE PARA MÓVIL (RESPONSIVE SMARTPHONES) */}
              <div className="bg-black/40 border border-white/15 p-3.5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-mono text-[10.5px] uppercase font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-white/70" />
                    <span>Arte Adaptado para Móvil (Opcional)</span>
                  </label>
                  <span className="text-[9.5px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 border border-blue-400/30 rounded-xs self-start sm:self-auto">
                    Medida: 600 × 600 px (1:1 Cuadrado) o 600 × 400 px
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[9px] uppercase text-white/50 block mb-1">
                      Opción A: Subir archivo para móvil
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-mono cursor-pointer transition-colors rounded-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Examinar imagen móvil...</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(e) => handleFileUpload(e, 'mobileAsset')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="font-mono text-[9px] uppercase text-white/50 block mb-1">
                      Opción B: O pegar URL directa
                    </label>
                    <input
                      type="url"
                      value={campForm.mobileAsset || ''}
                      onChange={(e) => setCampForm({ ...campForm, mobileAsset: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {campForm.mobileAsset && (
                  <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                    <img
                      src={campForm.mobileAsset}
                      alt="Vista previa arte móvil"
                      className="h-12 w-12 object-cover border border-white/30 bg-neutral-900 rounded-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px] text-white/70 block truncate">
                        Arte móvil cargado
                      </span>
                      <button
                        type="button"
                        onClick={() => setCampForm({ ...campForm, mobileAsset: '' })}
                        className="text-[10px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer mt-0.5"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    URL de Destino Final *
                  </label>
                  <input
                    type="url"
                    value={campForm.destinationUrl}
                    onChange={(e) => setCampForm({ ...campForm, destinationUrl: e.target.value })}
                    placeholder="https://marca.com/catalogo?utm_source=ea"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Texto del Botón (CTA)
                  </label>
                  <input
                    type="text"
                    value={campForm.ctaText}
                    onChange={(e) => setCampForm({ ...campForm, ctaText: e.target.value })}
                    placeholder="VER CATÁLOGO"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={campForm.startDate}
                    onChange={(e) => setCampForm({ ...campForm, startDate: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    value={campForm.endDate}
                    onChange={(e) => setCampForm({ ...campForm, endDate: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Commercial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-3.5 border border-white/10">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Presupuesto Contratado (USD)
                  </label>
                  <input
                    type="number"
                    value={campForm.budget || ''}
                    onChange={(e) =>
                      setCampForm({
                        ...campForm,
                        budget: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="1800"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Meta de Impresiones
                  </label>
                  <input
                    type="number"
                    value={campForm.targetImpressions || ''}
                    onChange={(e) =>
                      setCampForm({
                        ...campForm,
                        targetImpressions: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    placeholder="25000"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Placements Multi-Select */}
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-2">
                  Ubicaciones Asignadas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'entre-proyectos', label: 'Entre Proyectos (In-Feed Grid Catálogo)' },
                    { id: 'skyscrapers-laterales', label: 'Skyscrapers Laterales (Sticky Wings & Lightbox)' },
                    { id: 'inter-galeria', label: 'Inter-Galería (Banner Horizontal en Carrusel / Lightbox)' },
                    { id: 'dossier-editorial', label: 'Dossier Editorial (Dentro de Ficha de Obra)' },
                    { id: 'destacado-home', label: 'Destacados Home' },
                  ].map((item) => {
                    const isChecked = campForm.placements?.includes(item.id as AdPlacementId);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2 p-2.5 border cursor-pointer select-none text-xs transition-colors ${
                          isChecked ? 'bg-white/10 border-white text-white' : 'border-white/10 text-white/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = campForm.placements || [];
                            if (e.target.checked) {
                              setCampForm({ ...campForm, placements: [...cur, item.id as AdPlacementId] });
                            } else {
                              setCampForm({ ...campForm, placements: cur.filter((p) => p !== item.id) });
                            }
                          }}
                          className="accent-white"
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                  Notas Comerciales Internas
                </label>
                <textarea
                  value={campForm.notes || ''}
                  onChange={(e) => setCampForm({ ...campForm, notes: e.target.value })}
                  placeholder="Detalles del acuerdo..."
                  rows={2}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-4 py-2 border border-white/20 text-white/70 hover:text-white text-xs font-anton tracking-wider uppercase"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-anton tracking-wider uppercase"
                  >
                    GUARDAR BORRADOR
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveCampaign(true)}
                    className="px-5 py-2 bg-white text-black hover:bg-white/90 text-xs font-anton tracking-wider uppercase font-bold"
                  >
                    PUBLICAR EN VIVO
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR MARCA                                               */}
      {/* ========================================================================= */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/20 w-full max-w-lg flex flex-col rounded-sm shadow-2xl overflow-hidden font-inter">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-anton text-base tracking-wider uppercase text-white">
                {editingBrand ? 'EDITAR ANUNCIANTE' : 'REGISTRAR NUEVO ANUNCIANTE'}
              </h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                  Nombre de la Marca *
                </label>
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="Ej. Artemide Iluminación"
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={brandForm.category}
                    onChange={(e) => setBrandForm({ ...brandForm, category: e.target.value })}
                    placeholder="Ej. Iluminación Técnica"
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                    Estado
                  </label>
                  <select
                    value={brandForm.status}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, status: e.target.value as 'activa' | 'inactiva' })
                    }
                    className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                  Logo URL (SVG / PNG transparente)
                </label>
                <input
                  type="url"
                  value={brandForm.logoUrl}
                  onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                  placeholder="https://.../logo.svg"
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                  Sitio Web Oficial *
                </label>
                <input
                  type="url"
                  value={brandForm.destinationUrl}
                  onChange={(e) => setBrandForm({ ...brandForm, destinationUrl: e.target.value })}
                  placeholder="https://www.marca.com"
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-white/70 block mb-1">
                  Ejecutivo Comercial EA Asignado
                </label>
                <input
                  type="text"
                  value={brandForm.accountManager || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, accountManager: e.target.value })}
                  placeholder="Mónica Serrano · Directora Comercial EA"
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 border border-white/20 text-white/70 hover:text-white text-xs font-anton tracking-wider uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black hover:bg-white/90 text-xs font-anton tracking-wider uppercase"
                >
                  {editingBrand ? 'GUARDAR CAMBIOS' : 'REGISTRAR ANUNCIANTE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
