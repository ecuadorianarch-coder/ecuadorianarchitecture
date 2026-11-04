import React, { useEffect, useState } from 'react';
import {
  Building2,
  Calendar,
  Download,
  Printer,
  Eye,
  TrendingUp,
  MousePointerClick,
  Target,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Monitor,
  Tablet,
  Smartphone,
  ChevronRight,
  Info,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { AdvertiserPortalData, AdCampaign, AdPlacementId, DeviceType } from '../../types/advertising';
import { InFeedProjectAdCard } from '../../components/advertising/InFeedProjectAdCard';
import { VerticalAdCarousel } from '../../components/advertising/VerticalAdCarousel';
import { OrigamiFolderCard } from '../../components/projects/OrigamiFolderCard';
import realProjects from '../../data/projects.json';
import realNotesData from '../../data/communityNotes.json';

interface AdvertiserPortalProps {
  token: string;
}

export const AdvertiserPortal: React.FC<AdvertiserPortalProps> = ({ token }) => {
  const [data, setData] = useState<AdvertiserPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Minimalist View Tab Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'methodology'>('overview');

  // Selected campaign filter (all or specific id)
  const [selectedCampId, setSelectedCampId] = useState<string>('all');

  // Preview interactive state inside portal
  const [previewPlacement, setPreviewPlacement] = useState<AdPlacementId>('dossier-editorial');
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [activePreviewCampaignId, setActivePreviewCampaignId] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ads/advertiser-portal?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'No se pudo acceder al portal del anunciante.');
        }
        return res.json();
      })
      .then((portalData: AdvertiserPortalData) => {
        setData(portalData);
        if (portalData.campaigns.length > 0) {
          setActivePreviewCampaignId(portalData.campaigns[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // Download Consolidated CSV
  const handleDownloadCSV = () => {
    if (!data) return;

    const rows = [
      ['PORTAL CORPORATIVO DE ANUNCIANTE - ECUADORIAN ARCHITECTURE'],
      ['Anunciante', data.brand.name],
      ['Categoría', data.brand.category],
      ['Ejecutivo Editorial', data.brand.accountManager || 'Equipo Comercial EA'],
      ['Generado el', new Date().toLocaleString('es-EC')],
      [''],
      ['RESUMEN CONSOLIDADO DE LA MARCA'],
      ['Métrica', 'Valor'],
      ['Campañas Totales', data.totals.totalCampaigns],
      ['Campañas Activas', data.totals.activeCampaigns],
      ['Inversión Total Contratada', `$${data.totals.totalBudget} USD`],
      ['Impresiones Válidas Acumuladas', data.totals.validImpressions],
      ['Clics Válidos Acumulados', data.totals.validClicks],
      ['Clics Brutos Totales', data.totals.grossClicks],
      ['CTR Promedio Ponderado', `${data.totals.overallCtr}%`],
      [
        'Cumplimiento Global vs Meta',
        data.totals.overallDeliveryPercent ? `${data.totals.overallDeliveryPercent}%` : 'N/A',
      ],
      [''],
      ['DESGLOSE POR CAMPAÑA'],
      [
        'Campaña',
        'Estado',
        'Inicio',
        'Fin',
        'Presupuesto',
        'Meta Imp.',
        'Imp. Válidas',
        'Clics Válidos',
        'CTR',
        '% Cumplimiento',
      ],
      ...data.campaigns.map((c) => [
        c.name,
        c.status.toUpperCase(),
        c.startDate,
        c.endDate,
        c.budget ? `$${c.budget}` : 'N/A',
        c.targetImpressions || 'N/A',
        c.metrics.validImpressions,
        c.metrics.validClicks,
        `${c.metrics.ctr}%`,
        c.metrics.deliveryPercent ? `${c.metrics.deliveryPercent}%` : 'N/A',
      ]),
      [''],
      ['RENDIMIENTO POR UBICACIÓN'],
      ['Ubicación', 'Impresiones Válidas', 'Clics Válidos', 'CTR'],
      ...data.placementBreakdown.map((p) => [p.name, p.impressions, p.clicks, `${p.ctr}%`]),
      [''],
      ['EVOLUCIÓN DIARIA ACUMULADA'],
      ['Fecha', 'Impresiones Válidas', 'Clics Válidos', 'Clics Brutos'],
      ...data.dailyTrend.map((d) => [d.date, d.validImpressions, d.validClicks, d.grossClicks]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Consolidado_${data.brand.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-stone-900">
        <div className="w-10 h-10 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="font-okcok text-lg font-bold uppercase tracking-wider">
          Cargando Portal de Anunciante
        </h2>
        <p className="font-mono text-xs text-stone-500 mt-1">
          Verificando credenciales de acceso seguro...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-stone-900">
        <div className="max-w-md w-full bg-white border border-stone-300 p-8 text-center shadow-sm">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200 font-bold">
            !
          </div>
          <h2 className="font-okcok text-xl font-bold uppercase mb-2">
            Acceso no disponible
          </h2>
          <p className="font-creato text-xs text-stone-600 mb-6 leading-relaxed">
            {error || 'El perfil comercial de anunciante no se encuentra activo o el enlace ha caducado.'}
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-stone-900 text-white font-anton text-xs uppercase tracking-wider hover:bg-black transition-colors"
          >
            Volver a Ecuadorian Architecture
          </a>
        </div>
      </div>
    );
  }

  const { brand, campaigns, totals, dailyTrend, placementBreakdown, methodology } = data;

  const displayedCampaigns =
    selectedCampId === 'all' ? campaigns : campaigns.filter((c) => c.id === selectedCampId);

  const previewCampaign =
    campaigns.find((c) => c.id === activePreviewCampaignId) || campaigns[0] || null;

  const maxImp = Math.max(...dailyTrend.map((d) => d.validImpressions), 10);

  const placementsList: { id: AdPlacementId; label: string; space: string }[] = [
    { id: 'dossier-editorial', label: 'Dossier Editorial', space: 'Ficha de Proyecto' },
    { id: 'entre-proyectos', label: 'Entre Proyectos', space: 'Catálogo In-Feed' },
    { id: 'pie-articulo', label: 'Pie de Artículo', space: 'Cierre Monográfico' },
    { id: 'skyscrapers-laterales', label: 'Skyscrapers Laterales', space: 'Sticky Wings' },
    { id: 'destacado-home', label: 'Destacado Home', space: 'Archivo Abierto' },
    { id: 'barra-top-sponsor', label: 'Franja Superior', space: 'Top Bar Institucional' },
    { id: 'inter-galeria', label: 'Inter-Galería', space: 'Documentación Fotográfica' },
    { id: 'comunidad-infeed', label: 'Notas Comunitarias', space: 'Bitácora Colectiva' },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white print:bg-white print:text-black">
      {/* 1. TOP MINIMALIST HEADER */}
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 print:relative print:border-b">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="font-okcok text-lg font-bold tracking-tight text-stone-900 hover:opacity-75 transition-opacity">
              ECUADORIAN<span className="font-light text-stone-500">ARCHITECTURE</span>
            </a>
            <span className="h-4 w-px bg-stone-300 mx-1" />
            <span className="font-mono text-[10px] text-stone-500 uppercase tracking-widest font-medium">
              PORTAL DE ANUNCIANTE
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 text-stone-700 font-mono text-[11px] hover:border-stone-900 hover:text-stone-900 transition-colors shadow-sm"
              title="Descargar métricas consolidadas en formato CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white font-mono text-[11px] hover:bg-black transition-colors shadow-sm"
              title="Imprimir informe ejecutivo o guardar en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col gap-6">
        {/* BRAND PROFILE HEADER */}
        <section className="bg-white border border-stone-200/80 p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {brand.logoUrl ? (
                <div className="w-16 h-16 shrink-0 bg-stone-50 border border-stone-200 p-2 flex items-center justify-center">
                  <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain grayscale" />
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-stone-500" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-2 py-0.5">
                    {brand.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Alianza Activa
                  </span>
                </div>

                <h1 className="font-okcok text-2xl sm:text-3xl font-bold uppercase tracking-tight text-stone-950">
                  {brand.name}
                </h1>

                <p className="font-creato text-xs sm:text-sm text-stone-600 mt-0.5 max-w-2xl leading-relaxed">
                  {brand.description || 'Patrocinador oficial de Ecuadorian Architecture.'}
                </p>
              </div>
            </div>

            {/* Account executive & Audit info */}
            <div className="flex flex-col md:items-end gap-1.5 border-t md:border-t-0 border-stone-100 pt-3 md:pt-0">
              <span className="font-mono text-[10px] text-stone-500 uppercase">
                Auditoría en Servidor
              </span>
              <span className="font-mono text-xs font-semibold text-stone-900">
                {new Date(methodology.lastUpdated).toLocaleDateString('es-EC', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {brand.accountManager && (
                <span className="font-mono text-[11px] text-stone-600 mt-1">
                  Ejecutivo EA: <strong className="text-stone-900">{brand.accountManager}</strong>
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 3. MINIMALIST SEGMENTED TABS (EASY NAVIGATION) */}
        <div className="flex items-center justify-between border-b border-stone-200 print:hidden">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-stone-900 text-stone-950 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>1. Resumen & Campañas</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
                activeTab === 'simulator'
                  ? 'border-stone-900 text-stone-950 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Simulador en Vivo en la Web</span>
              <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-mono">
                8 espacios
              </span>
            </button>

            <button
              onClick={() => setActiveTab('methodology')}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
                activeTab === 'methodology'
                  ? 'border-stone-900 text-stone-950 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Garantía & Auditoría MRC</span>
            </button>
          </nav>

          <span className="hidden md:inline font-mono text-[11px] text-stone-500">
            Vista ejecutiva verificada
          </span>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & CAMPAIGNS (THE CORE METRICS)                            */}
        {/* ========================================================================= */}
        {(activeTab === 'overview' || typeof window !== 'undefined' && window.matchMedia?.('print').matches) && (
          <div className="flex flex-col gap-6">
            {/* 4 HERO METRICS - ULTRA CLEAR & MINIMALIST */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Impresiones Válidas */}
              <div className="bg-white border border-stone-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                      Impresiones Válidas
                    </span>
                    <Eye className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="font-okcok text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight">
                    {totals.validImpressions.toLocaleString('es-EC')}
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-stone-100 flex flex-col gap-0.5">
                  <span className="font-mono text-[10.5px] text-stone-600">
                    Visibilidad continua &ge; 1s
                  </span>
                  {totals.totalTargetImpressions > 0 && (
                    <span className="font-mono text-[10px] text-stone-600">
                      Objetivo: {totals.totalTargetImpressions.toLocaleString('es-EC')} imp.
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Clics Válidos */}
              <div className="bg-white border border-stone-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                      Clics Cualificados
                    </span>
                    <MousePointerClick className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="font-okcok text-3xl sm:text-4xl font-bold text-amber-700 tracking-tight">
                    {totals.validClicks.toLocaleString('es-EC')}
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-stone-100 flex flex-col gap-0.5">
                  <span className="font-mono text-[10.5px] text-stone-600">
                    Tráfico real verificado
                  </span>
                  <span className="font-mono text-[10px] text-stone-600">
                    {totals.grossClicks} brutos ({totals.grossClicks - totals.validClicks} bots/dupl. filtrados)
                  </span>
                </div>
              </div>

              {/* Card 3: CTR Promedio */}
              <div className="bg-white border border-stone-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                      CTR Promedio
                    </span>
                    <TrendingUp className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="font-okcok text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight">
                    {totals.overallCtr}%
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-stone-100 flex flex-col gap-0.5">
                  <span className="font-mono text-[10.5px] text-stone-600">
                    Tasa de interacción
                  </span>
                  <span className="font-mono text-[10px] text-emerald-800 font-medium">
                    Rendimiento editorial superior
                  </span>
                </div>
              </div>

              {/* Card 4: Cumplimiento / Pauta */}
              <div className="bg-white border border-stone-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                      Cumplimiento de Pauta
                    </span>
                    <Target className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="font-okcok text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight">
                    {totals.overallDeliveryPercent ? `${totals.overallDeliveryPercent}%` : `${totals.activeCampaigns} Activa`}
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-stone-100 flex flex-col gap-1">
                  {totals.overallDeliveryPercent && (
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-stone-900 rounded-full"
                        style={{ width: `${Math.min(Number(totals.overallDeliveryPercent), 100)}%` }}
                      />
                    </div>
                  )}
                  <span className="font-mono text-[10px] text-stone-600">
                    {totals.totalBudget ? `$${totals.totalBudget.toLocaleString()} USD contratados` : `${totals.totalCampaigns} campaña(s) registradas`}
                  </span>
                </div>
              </div>
            </section>

            {/* CAMPAIGNS PORTFOLIO TABLE */}
            <section className="bg-white border border-stone-200/80 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-stone-100">
                <div>
                  <h2 className="font-okcok text-lg font-bold uppercase tracking-tight text-stone-900">
                    Detalle por Campaña
                  </h2>
                  <p className="font-creato text-xs text-stone-600 mt-0.5">
                    Seguimiento individual de cada creatividad y pauta activa
                  </p>
                </div>

                {/* Filter if multiple */}
                {campaigns.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-stone-600">Filtrar:</span>
                    <select
                      value={selectedCampId}
                      onChange={(e) => setSelectedCampId(e.target.value)}
                      className="bg-stone-50 border border-stone-300 px-2.5 py-1 font-mono text-xs text-stone-800 focus:outline-none"
                    >
                      <option value="all">Todas ({campaigns.length})</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-600 text-[10px] uppercase tracking-wider bg-stone-50/50">
                      <th className="py-2.5 px-3">Campaña / Creatividad</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Período</th>
                      <th className="py-2.5 px-3 text-right">Imp. Válidas</th>
                      <th className="py-2.5 px-3 text-right">Clics</th>
                      <th className="py-2.5 px-3 text-right">CTR</th>
                      <th className="py-2.5 px-3 text-center">Entrega</th>
                      <th className="py-2.5 px-3 text-center print:hidden">Simulador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {displayedCampaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-semibold text-stone-950 block">{camp.name}</span>
                          <span className="text-[11px] text-stone-600 line-clamp-1">{camp.title}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 border ${
                              camp.status === 'activa'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : camp.status === 'programada'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {camp.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-stone-600 whitespace-nowrap">
                          {camp.startDate} al {camp.endDate}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-stone-900">
                          {camp.metrics.validImpressions.toLocaleString('es-EC')}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-amber-700">
                          {camp.metrics.validClicks}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-stone-950">
                          {camp.metrics.ctr}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          {camp.metrics.deliveryPercent ? (
                            <span className="font-semibold text-stone-900">{camp.metrics.deliveryPercent}%</span>
                          ) : (
                            <span className="text-stone-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center print:hidden">
                          <button
                            onClick={() => {
                              setActivePreviewCampaignId(camp.id);
                              setActiveTab('simulator');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 font-mono text-[10.5px] font-medium transition-colors border border-stone-300"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver en la Web</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2-COLUMN SECTION: PLACEMENTS BREAKDOWN & DAILY TREND */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placement Performance */}
              <section className="bg-white border border-stone-200/80 p-6 shadow-sm">
                <div className="mb-4 pb-3 border-b border-stone-100">
                  <h3 className="font-okcok text-base font-bold uppercase tracking-tight text-stone-900">
                    Rendimiento por Espacio
                  </h3>
                  <p className="font-creato text-xs text-stone-600 mt-0.5">
                    Distribución de impacto según la ubicación dentro de la plataforma
                  </p>
                </div>

                <div className="flex flex-col gap-3.5">
                  {placementBreakdown.map((item) => (
                    <div key={item.placementId} className="border border-stone-100 p-3 bg-stone-50/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-semibold text-stone-900">
                          {item.name}
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-900">
                          CTR {item.ctr}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10.5px] text-stone-600">
                        <span>{item.impressions.toLocaleString('es-EC')} impresiones</span>
                        <span>{item.clicks} clics válidos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Daily Trend */}
              <section className="bg-white border border-stone-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-okcok text-base font-bold uppercase tracking-tight text-stone-900">
                      Evolución Diaria
                    </h3>
                    <p className="font-creato text-xs text-stone-600 mt-0.5">
                      Volumen de exposiciones e interacciones recientes
                    </p>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-stone-900 inline-block" />
                      <span>Impresiones</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-amber-600 inline-block" />
                      <span>Clics</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-1.5 items-end h-48 pt-4 px-1 border-b border-stone-200">
                  {dailyTrend.map((day) => {
                    const impHeight = Math.max(Math.round((day.validImpressions / maxImp) * 100), 4);
                    const dayCtr =
                      day.validImpressions > 0 ? ((day.validClicks / day.validImpressions) * 100).toFixed(1) : '0.0';

                    return (
                      <div key={day.date} className="group flex flex-col items-center h-full justify-end relative cursor-pointer">
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white p-1.5 font-mono text-[9px] pointer-events-none z-20 whitespace-nowrap shadow-md">
                          <div className="font-bold">{day.date}</div>
                          <div>Imp: {day.validImpressions} | Clics: {day.validClicks} ({dayCtr}%)</div>
                        </div>

                        <div className="w-full flex items-end justify-center gap-0.5 h-full">
                          <div className="w-1/2 bg-stone-900 group-hover:bg-stone-700 transition-colors" style={{ height: `${impHeight}%` }} />
                          <div
                            className="w-1/3 bg-amber-600 group-hover:bg-amber-500 transition-colors"
                            style={{
                              height: `${Math.min(
                                Math.max(Math.round((day.validClicks / Math.max(maxImp * 0.1, 1)) * 100), 2),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="font-mono text-[8.5px] text-stone-500 mt-1 truncate max-w-full">
                          {day.date.split('-').slice(1).join('/')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE IN-CONTEXT SIMULATOR (8 REAL SPACES, ZERO INVENTED DATA)       */}
        {/* ========================================================================= */}
        {activeTab === 'simulator' && (
          <section className="bg-white border border-stone-200/80 p-6 sm:p-7 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="font-okcok text-xl font-bold uppercase tracking-tight text-stone-950">
                    Simulador en Vivo: Tu Anuncio en la Web Pública
                  </h2>
                </div>
                <p className="font-creato text-xs text-stone-600 mt-0.5">
                  Previsualización fidedigna de cómo visualizan los lectores tu marca en cada entorno editorial.
                </p>
              </div>

              {/* Device switcher */}
              <div className="flex items-center bg-stone-100 border border-stone-200 p-0.5 self-start md:self-auto">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs uppercase font-medium transition-all ${
                    previewDevice === 'desktop' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Vista de Escritorio"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs uppercase font-medium transition-all ${
                    previewDevice === 'tablet' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Vista de Tablet"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs uppercase font-medium transition-all ${
                    previewDevice === 'mobile' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Vista de Teléfono Móvil"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Móvil</span>
                </button>
              </div>
            </div>

            {/* 8 Clean Space Pills Selector */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10.5px] uppercase font-bold text-stone-500">
                Selecciona la ubicación a simular:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {placementsList.map((p) => {
                  const isSelected = previewPlacement === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPreviewPlacement(p.id)}
                      className={`text-left p-2.5 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="font-okcok text-xs uppercase font-bold truncate">
                        {p.label}
                      </span>
                      <span className={`font-mono text-[9.5px] mt-0.5 truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        {p.space}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campaign picker if multiple */}
            {campaigns.length > 1 && (
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <span className="font-mono text-[11px] text-stone-500">Campaña activa:</span>
                <select
                  value={activePreviewCampaignId}
                  onChange={(e) => setActivePreviewCampaignId(e.target.value)}
                  className="bg-stone-50 border border-stone-300 px-3 py-1 font-mono text-xs text-stone-900 focus:outline-none"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* REALISTIC SIMULATOR CANVAS */}
            {previewCampaign && (
              <div className="border border-stone-300 bg-[#EFECE6] p-4 sm:p-8 flex flex-col items-center justify-center min-h-[580px] overflow-hidden relative">
                <div className="absolute top-2 left-3 font-mono text-[9px] text-stone-500 uppercase tracking-widest bg-white/80 px-2 py-0.5 border border-stone-200">
                  ESPACIO: {previewPlacement.toUpperCase()} · DISPOSITIVO: {previewDevice.toUpperCase()}
                </div>

                {/* 1. DOSSIER EDITORIAL */}
                {previewPlacement === 'dossier-editorial' && (() => {
                  const p1 = realProjects[0];
                  return (
                    <div
                      className={`bg-white border border-stone-300 shadow-sm p-6 sm:p-10 transition-all ${
                        previewDevice === 'desktop'
                          ? 'w-full max-w-[850px]'
                          : previewDevice === 'tablet'
                          ? 'w-[580px]'
                          : 'w-[360px] p-4'
                      }`}
                    >
                      <div className="border-b border-stone-200 pb-4 mb-6">
                        <span className="font-mono text-[10px] text-stone-500 uppercase tracking-widest block mb-1">
                          EXPEDIENTE MONOGRÁFICO // {p1.category.toUpperCase()}
                        </span>
                        <h3 className="font-okcok text-2xl sm:text-3xl uppercase font-bold text-stone-950">
                          {p1.title}
                        </h3>
                        <p className="font-creato text-xs text-stone-600 mt-1">
                          {p1.studio} · {p1.location} · {p1.year}
                        </p>
                      </div>

                      <p className="font-creato text-xs sm:text-sm text-stone-700 leading-relaxed mb-6">
                        {p1.resena}
                      </p>

                      <div className="my-6 flex justify-center">
                        <InFeedProjectAdCard
                          campaign={previewCampaign}
                          brand={brand}
                          layoutVariant="panoramic-card"
                          isPreview={true}
                        />
                      </div>

                      <p className="font-creato text-xs sm:text-sm text-stone-700 leading-relaxed mt-6">
                        {p1.critica}
                      </p>

                      <div className="mt-8 pt-4 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[10px] text-stone-600">
                        <div>
                          <span className="block text-stone-400 uppercase">Superficie</span>
                          <strong className="text-stone-900">{p1.datos?.superficie}</strong>
                        </div>
                        <div>
                          <span className="block text-stone-400 uppercase">Estructura</span>
                          <strong className="text-stone-900">{p1.datos?.estructura}</strong>
                        </div>
                        <div>
                          <span className="block text-stone-400 uppercase">Fotografía</span>
                          <strong className="text-stone-900">{p1.datos?.fotografia}</strong>
                        </div>
                        <div>
                          <span className="block text-stone-400 uppercase">Certificación</span>
                          <strong className="text-stone-900">{p1.datos?.certificacion}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. ENTRE PROYECTOS */}
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
                      <div className="bg-white border border-stone-300 p-4 mb-4 flex items-center justify-between shadow-sm">
                        <span className="font-okcok text-sm uppercase font-bold text-stone-950">
                          CATÁLOGO // 142 PROYECTOS ARQUITECTÓNICOS
                        </span>
                        <span className="font-mono text-[10px] text-stone-500">RETÍCULA EDITORIAL</span>
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
                        <OrigamiFolderCard project={p1} index={0} onSelect={() => {}} />

                        <div className="flex justify-center">
                          <InFeedProjectAdCard
                            campaign={previewCampaign}
                            brand={brand}
                            layoutVariant="vertical-card"
                            isPreview={true}
                          />
                        </div>

                        {previewDevice !== 'mobile' && (
                          <OrigamiFolderCard project={p2} index={1} onSelect={() => {}} />
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. PIE DE ARTÍCULO */}
                {previewPlacement === 'pie-articulo' && (() => {
                  const p1 = realProjects[0];
                  return (
                    <div
                      className={`bg-white border border-stone-300 shadow-sm p-6 sm:p-10 transition-all ${
                        previewDevice === 'desktop' ? 'w-full max-w-[850px]' : 'w-[360px] p-4'
                      }`}
                    >
                      <div className="pb-4 mb-4">
                        <span className="font-anton text-xs text-stone-500 uppercase tracking-widest block mb-2">
                          CONCLUSIÓN MONOGRÁFICA · {p1.title}
                        </span>
                        <p className="font-creato text-xs sm:text-sm text-stone-700 leading-relaxed">
                          {p1.memory}
                        </p>
                      </div>

                      <div className="my-6">
                        <div className="font-mono text-[9px] text-stone-500 uppercase mb-1">
                          ESPACIO AUSPICIADO AL CIERRE DEL ARTÍCULO
                        </div>
                        <InFeedProjectAdCard
                          campaign={previewCampaign}
                          brand={brand}
                          layoutVariant="panoramic-card"
                          isPreview={true}
                        />
                      </div>

                      {p1.podcast && (
                        <div className="bg-stone-50 border border-stone-200 p-4 mt-6 flex items-center justify-between">
                          <div>
                            <span className="font-mono text-[9px] text-stone-500 uppercase block">
                              EPISODIO EDITORIAL {p1.podcast.episode}
                            </span>
                            <h4 className="font-okcok text-sm uppercase font-bold text-stone-950">
                              {p1.podcast.title}
                            </h4>
                          </div>
                          <span className="font-mono text-xs text-stone-600">{p1.podcast.duration}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 4. SKYSCRAPERS LATERALES */}
                {previewPlacement === 'skyscrapers-laterales' && (() => {
                  const p1 = realProjects[0];
                  return (
                    <div className="w-full max-w-[1040px] flex items-start justify-center gap-4">
                      <div className="w-[180px] shrink-0">
                        <VerticalAdCarousel
                          modernCampaign={previewCampaign}
                          brand={brand}
                          position="izquierdo"
                          isPreview={true}
                        />
                      </div>

                      <div className="flex-1 bg-white border border-stone-300 p-6 shadow-sm min-h-[580px] flex flex-col justify-between">
                        <div>
                          <span className="font-mono text-[10px] text-stone-500 uppercase block">
                            EXPEDIENTE MONOGRÁFICO // {p1.location} · {p1.year}
                          </span>
                          <h3 className="font-okcok text-2xl uppercase font-bold mt-1 text-stone-950">{p1.title}</h3>
                          <p className="font-anton text-xs text-stone-500 uppercase mt-0.5">{p1.studio}</p>
                          <p className="font-creato text-xs text-stone-700 mt-3 leading-relaxed">
                            {p1.memory}
                          </p>
                          <p className="font-creato text-xs text-stone-600 mt-3 leading-relaxed border-t border-stone-100 pt-3">
                            {p1.resena}
                          </p>
                        </div>

                        <div className="p-3 bg-stone-50 border border-stone-200 text-center font-mono text-[10px] text-stone-500 mt-4">
                          Los skyscrapers laterales flanquean el contenido y permanecen fijos durante el scroll del lector.
                        </div>
                      </div>

                      {previewDevice === 'desktop' && (
                        <div className="w-[180px] shrink-0">
                          <VerticalAdCarousel
                            modernCampaign={previewCampaign}
                            brand={brand}
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
                    className={`bg-white border border-stone-300 p-6 sm:p-8 shadow-sm transition-all ${
                      previewDevice === 'desktop' ? 'w-full max-w-[850px]' : 'w-[360px] p-4'
                    }`}
                  >
                    <div className="border-b border-stone-200 pb-3 mb-4">
                      <span className="font-anton text-xs uppercase tracking-widest text-stone-500">
                        ECUADORIAN ARCHITECTURE // ARCHIVO ABIERTO
                      </span>
                      <h4 className="font-okcok text-lg uppercase font-bold text-stone-950 mt-1">
                        ALIANZAS Y PATROCINIOS DESTACADOS
                      </h4>
                    </div>

                    <InFeedProjectAdCard
                      campaign={previewCampaign}
                      brand={brand}
                      layoutVariant="panoramic-card"
                      isPreview={true}
                    />
                  </div>
                )}

                {/* 6. FRANJA TOP SPONSOR */}
                {previewPlacement === 'barra-top-sponsor' && (
                  <div
                    className={`bg-white border border-stone-300 shadow-sm p-4 sm:p-6 transition-all ${
                      previewDevice === 'desktop' ? 'w-full max-w-[950px]' : 'w-[360px] p-3'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                      <span className="font-okcok text-base font-bold uppercase text-stone-950">ECUADORIAN ARCHITECTURE</span>
                      <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-stone-500">
                        <span>PROYECTOS</span>
                        <span>ACADEMIA</span>
                        <span>TERRITORIOS</span>
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {brand?.logoUrl ? (
                          <img src={brand.logoUrl} alt="" className="h-5 w-auto object-contain grayscale" />
                        ) : (
                          <Building2 className="w-5 h-5 text-stone-700" />
                        )}
                        <div>
                          <span className="font-mono text-[9px] uppercase font-bold text-stone-500 block">
                            {previewCampaign.kicker || 'PATROCINIO OFICIAL'}
                          </span>
                          <span className="font-okcok text-xs uppercase font-bold text-stone-950">
                            {previewCampaign.title}
                          </span>
                        </div>
                      </div>

                      <a
                        href={previewCampaign.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-stone-900 text-white font-anton text-[10px] uppercase tracking-wider shrink-0 hover:bg-black"
                      >
                        {previewCampaign.ctaText || 'CONOCER MÁS'} →
                      </a>
                    </div>
                  </div>
                )}

                {/* 7. INTER-GALERÍA */}
                {previewPlacement === 'inter-galeria' && (() => {
                  const p1 = realProjects[0];
                  return (
                    <div
                      className={`bg-white border border-stone-300 shadow-sm p-6 sm:p-8 transition-all ${
                        previewDevice === 'desktop' ? 'w-full max-w-[850px]' : 'w-[360px] p-4'
                      }`}
                    >
                      <div className="mb-4">
                        <span className="font-mono text-[10px] text-stone-500 uppercase block">
                          DOCUMENTACIÓN FOTOGRÁFICA // {p1.title}
                        </span>
                        <div className="h-56 bg-stone-100 border border-stone-200 mt-2 overflow-hidden relative">
                          <img src={p1.heroImage} alt={p1.title} className="w-full h-full object-cover grayscale" />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[9px] px-2 py-0.5">
                            {p1.datos?.fotografia}
                          </div>
                        </div>
                      </div>

                      <div className="my-6">
                        <InFeedProjectAdCard
                          campaign={previewCampaign}
                          brand={brand}
                          layoutVariant="panoramic-card"
                          isPreview={true}
                        />
                      </div>

                      <div className="p-4 border border-stone-200 bg-stone-50 text-center font-mono text-[10px] text-stone-500">
                        Planimetría técnica y axonométrica de {p1.title} ({p1.studio}).
                      </div>
                    </div>
                  );
                })()}

                {/* 8. NOTAS COMUNITARIAS */}
                {previewPlacement === 'comunidad-infeed' && (() => {
                  const n1 = realNotesData.visits[0];
                  const n2 = realNotesData.visits[1];
                  return (
                    <div
                      className={`bg-white border border-stone-300 shadow-sm p-6 sm:p-8 transition-all ${
                        previewDevice === 'desktop' ? 'w-full max-w-[850px]' : 'w-[360px] p-4'
                      }`}
                    >
                      <div className="pb-3 border-b border-stone-200 mb-4">
                        <span className="font-anton text-xs uppercase tracking-widest text-stone-500">
                          BITÁCORA COLABORATIVA & NOTAS DE VISITA
                        </span>
                      </div>

                      {n1 && (
                        <div className="bg-stone-50 border border-stone-200 p-4 mb-4">
                          <div className="flex items-center justify-between mb-1 font-mono text-[10px]">
                            <strong className="text-stone-900">{n1.authorName}</strong>
                            <span className="text-stone-500">{n1.visitDate}</span>
                          </div>
                          <p className="font-creato text-xs text-stone-700">{n1.experience}</p>
                        </div>
                      )}

                      <div className="my-5">
                        <InFeedProjectAdCard
                          campaign={previewCampaign}
                          brand={brand}
                          layoutVariant="panoramic-card"
                          isPreview={true}
                        />
                      </div>

                      {n2 && (
                        <div className="bg-stone-50 border border-stone-200 p-4">
                          <div className="flex items-center justify-between mb-1 font-mono text-[10px]">
                            <strong className="text-stone-900">{n2.authorName}</strong>
                            <span className="text-stone-500">{n2.visitDate}</span>
                          </div>
                          <p className="font-creato text-xs text-stone-700">{n2.experience}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: METHODOLOGY & AUDITING (TRUST & TRANSPARENCY)                      */}
        {/* ========================================================================= */}
        {(activeTab === 'methodology' || typeof window !== 'undefined' && window.matchMedia?.('print').matches) && (
          <section className="bg-white border border-stone-200/80 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h2 className="font-okcok text-xl font-bold uppercase tracking-tight text-stone-950">
                  Garantía de Medición y Metodología MRC
                </h2>
              </div>
              <p className="font-creato text-xs text-stone-600">
                Principios técnicos auditables para certificar la efectividad de la inversión publicitaria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-creato leading-relaxed text-stone-700">
              <div className="border border-stone-200 p-5 bg-stone-50/60 flex flex-col justify-between">
                <div>
                  <h3 className="font-anton uppercase tracking-wider text-stone-950 mb-2 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Estándar de Visibilidad Continua (&ge; 1s)
                  </h3>
                  <p>
                    Una impresión sólo se certifica cuando al menos el <strong>50% del área gráfica</strong> del banner permanece de forma continua dentro de la pantalla del usuario durante un mínimo de <strong>1.000 milisegundos</strong>. Las exposiciones fugaces por desplazamiento rápido se descartan automáticamente para no inflar métricas artificiales.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200/60 font-mono text-[10px] text-stone-500">
                  Normativa: Media Rating Council (MRC) + IAB Guidelines
                </div>
              </div>

              <div className="border border-stone-200 p-5 bg-stone-50/60 flex flex-col justify-between">
                <div>
                  <h3 className="font-anton uppercase tracking-wider text-stone-950 mb-2 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Filtrado Anti-Fraude y Deduplicación
                  </h3>
                  <p>
                    Las redirecciones se procesan en el servidor propio (<code>/api/ads/click</code>). El sistema detecta y descarta robots automatizados (crawlers, bots de indexación), ráfagas de doble clic accidental menores a 3 segundos y tráfico de navegación interna de administración.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200/60 font-mono text-[10px] text-stone-500">
                  Protección: Rate-limiting por IP + User-Agent Verification
                </div>
              </div>
            </div>

            {/* Direct Support Contact */}
            <div className="bg-stone-50 border border-stone-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-okcok text-sm uppercase font-bold text-stone-950">
                  ¿Preguntas sobre este reporte o deseas ampliar tu pauta?
                </h4>
                <p className="font-creato text-xs text-stone-600 mt-0.5">
                  Tu ejecutivo comercial asignado está disponible para asesorarte en nuevas activaciones.
                </p>
              </div>

              <a
                href="mailto:comercial@ecuadorianarch.com"
                className="px-4 py-2 bg-stone-900 text-white font-mono text-xs uppercase hover:bg-black transition-colors shrink-0"
              >
                Contactar a {brand.accountManager?.split('—')[0] || 'Comercial EA'}
              </a>
            </div>
          </section>
        )}

        {/* MINIMAL FOOTER */}
        <footer className="pt-4 pb-8 text-center font-mono text-[11px] text-stone-600 print:hidden">
          <p>
            Portal oficial corporativo generado por <strong>Ecuadorian Architecture</strong> para <strong>{brand.name}</strong>.
          </p>
        </footer>
      </main>
    </div>
  );
};