import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  MousePointerClick,
  Eye,
  Target,
  Building2,
  ExternalLink,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { CampaignReportData } from '../../types/advertising';

interface AdvertiserReportProps {
  token: string;
}

export const AdvertiserReport: React.FC<AdvertiserReportProps> = ({ token }) => {
  const [report, setReport] = useState<CampaignReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'methodology'>('overview');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ads/report?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'No se pudo cargar el reporte publicitario.');
        }
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // CSV Exporter
  const handleDownloadCSV = () => {
    if (!report) return;

    const rows = [
      ['REPORTE PUBLICITARIO - ECUADORIAN ARCHITECTURE'],
      ['Campaña', report.campaign.name],
      ['Anunciante', report.brand.name],
      ['Período', `${report.stats.startDate} al ${report.stats.endDate}`],
      ['Generado el', new Date().toLocaleString('es-EC')],
      [''],
      ['RESUMEN GENERAL'],
      ['Métrica', 'Valor'],
      ['Impresiones Válidas', report.stats.validImpressions],
      ['Clics Válidos', report.stats.validClicks],
      ['Clics Brutos', report.stats.grossClicks],
      ['CTR Promedio', `${report.stats.ctr}%`],
      ['Meta Contratada', report.stats.targetImpressions || 'N/A'],
      ['% de Entrega', report.stats.deliveryPercent ? `${report.stats.deliveryPercent}%` : 'N/A'],
      [''],
      ['DESGLOSE POR UBICACIÓN'],
      ['Ubicación', 'Impresiones', 'Clics Válidos', 'CTR'],
      ...report.placementBreakdown.map((p) => [p.name, p.impressions, p.clicks, `${p.ctr}%`]),
      [''],
      ['EVOLUCIÓN DIARIA'],
      ['Fecha', 'Impresiones Válidas', 'Clics Válidos', 'Clics Brutos', 'CTR'],
      ...report.dailyTrend.map((d) => [
        d.date,
        d.validImpressions,
        d.validClicks,
        d.grossClicks,
        d.validImpressions > 0 ? `${((d.validClicks / d.validImpressions) * 100).toFixed(2)}%` : '0.00%',
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Reporte_${report.brand.name.replace(/\s+/g, '_')}_${report.campaign.id}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center p-6 text-ea-black">
        <div className="w-12 h-12 border-4 border-ea-black border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="font-okcok text-xl font-bold uppercase tracking-wider">
          Cargando Reporte de Anunciante...
        </h2>
        <p className="font-mono text-xs text-ea-black/60 mt-1">
          Validando token de acceso seguro
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center p-6 text-ea-black">
        <div className="max-w-md w-full bg-white border-2 border-ea-black p-8 text-center shadow-[4px_4px_0px_#000]">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-300">
            !
          </div>
          <h2 className="font-okcok text-2xl font-bold uppercase mb-2">
            Enlace No Válido o Revocado
          </h2>
          <p className="font-creato text-sm text-ea-black/70 mb-6">
            {error || 'El reporte que intentas consultar no existe o ha sido desactivado por el equipo editorial.'}
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-ea-black text-white font-anton text-xs uppercase tracking-wider hover:bg-black/80 transition-colors shadow-[2px_2px_0px_#000]"
          >
            Ir a Ecuadorian Architecture
          </a>
        </div>
      </div>
    );
  }

  const { campaign, brand, stats, dailyTrend, placementBreakdown, methodology } = report;

  // Max value for daily trend chart scaling
  const maxImp = Math.max(...dailyTrend.map((d) => d.validImpressions), 10);

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-ea-black flex flex-col print:bg-white print:text-black">
      {/* 1. TOP NAV / ACCIONES */}
      <header className="border-b-2 border-ea-black bg-[#FAF8F5] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 print:relative print:border-b">
        <div className="flex items-center gap-3">
          <a href="/" className="font-okcok text-lg sm:text-xl font-black uppercase tracking-tight hover:opacity-80">
            ECUADORIAN<span className="font-light">ARCHITECTURE</span>
          </a>
          <span className="hidden sm:inline-block font-mono text-[10px] bg-ea-black text-white px-2 py-0.5 font-bold uppercase tracking-widest">
            ADVERTISER REPORT
          </span>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ea-black font-anton text-xs uppercase tracking-wider hover:bg-ea-black/5 transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
            title="Descargar métricas en formato CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ea-black text-white font-anton text-xs uppercase tracking-wider hover:bg-black/85 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.3)] active:translate-x-0.5 active:translate-y-0.5"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col gap-6">
        {/* BRAND & CAMPAIGN HERO */}
        <section className="bg-white border-2 border-ea-black p-6 sm:p-8 shadow-[4px_4px_0px_#000] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {brand.logoUrl ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#FAF8F5] border border-ea-black/30 p-2 flex items-center justify-center">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain grayscale"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0 bg-ea-black/5 border border-ea-black/30 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-ea-black/60" />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-anton text-xs tracking-wider uppercase text-ea-black/70 bg-ea-black/5 px-2 py-0.5 border border-ea-black/20">
                    {brand.name}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                      campaign.status === 'activa'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : campaign.status === 'programada'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : campaign.status === 'finalizada'
                        ? 'bg-neutral-200 text-neutral-800 border-neutral-400'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {campaign.status.toUpperCase()}
                  </span>
                  <span className="font-mono text-[10px] text-ea-black/50">
                    ID: {campaign.id}
                  </span>
                </div>

                <h1 className="font-okcok text-2xl sm:text-3xl font-black uppercase tracking-tight text-ea-black leading-tight">
                  {campaign.name}
                </h1>

                <p className="font-creato text-sm text-ea-black/75 mt-1 max-w-2xl">
                  {campaign.title}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3 font-mono text-xs text-ea-black/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-ea-black/50" />
                    <span>
                      {stats.startDate} — {stats.endDate}
                    </span>
                  </div>
                  {campaign.destinationUrl && (
                    <a
                      href={campaign.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-ea-black underline hover:text-black font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>URL de Destino</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick summary box */}
            <div className="lg:text-right shrink-0 bg-[#FAF8F5] border border-ea-black/20 p-4 rounded-none min-w-[220px]">
              <span className="font-mono text-[10px] uppercase font-bold text-ea-black/50 block">
                Última Actualización
              </span>
              <span className="font-mono text-xs font-semibold text-ea-black block mt-0.5">
                {new Date(methodology.lastUpdated).toLocaleDateString('es-EC', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {stats.targetImpressions && stats.deliveryPercent && (
                <div className="mt-2 pt-2 border-t border-ea-black/10">
                  <span className="font-mono text-[10px] uppercase text-ea-black/60 block">
                    Entrega Contratada
                  </span>
                  <span className="font-anton text-lg font-bold text-ea-black">
                    {stats.deliveryPercent}%
                  </span>
                  <div className="w-full h-1.5 bg-ea-black/10 mt-1 overflow-hidden">
                    <div
                      className="h-full bg-ea-black"
                      style={{ width: `${Math.min(Number(stats.deliveryPercent), 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. KEY METRICS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Impresiones Válidas */}
          <div className="bg-white border-2 border-ea-black p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between text-ea-black/60 mb-2">
              <span className="font-mono text-[11px] uppercase font-bold tracking-wider">
                Impresiones Válidas
              </span>
              <Eye className="w-4 h-4 text-ea-black" />
            </div>
            <div className="font-anton text-3xl sm:text-4xl text-ea-black tracking-wide my-1">
              {stats.validImpressions.toLocaleString('es-EC')}
            </div>
            <div className="font-creato text-[11px] text-ea-black/60">
              Visibilidad &ge; 50% por &ge; 1s
            </div>
          </div>

          {/* Card 2: Clics Válidos */}
          <div className="bg-white border-2 border-ea-black p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between text-ea-black/60 mb-2">
              <span className="font-mono text-[11px] uppercase font-bold tracking-wider">
                Clics Válidos
              </span>
              <MousePointerClick className="w-4 h-4 text-ea-black" />
            </div>
            <div className="font-anton text-3xl sm:text-4xl text-ea-black tracking-wide my-1">
              {stats.validClicks.toLocaleString('es-EC')}
            </div>
            <div className="font-creato text-[11px] text-ea-black/60">
              {stats.grossClicks} clics brutos recibidos
            </div>
          </div>

          {/* Card 3: CTR (Click-Through Rate) */}
          <div className="bg-white border-2 border-ea-black p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between text-ea-black/60 mb-2">
              <span className="font-mono text-[11px] uppercase font-bold tracking-wider">
                CTR Promedio
              </span>
              <TrendingUp className="w-4 h-4 text-ea-black" />
            </div>
            <div className="font-anton text-3xl sm:text-4xl text-ea-black tracking-wide my-1">
              {stats.ctr}%
            </div>
            <div className="font-creato text-[11px] text-ea-black/60">
              Clics válidos / Impresiones
            </div>
          </div>

          {/* Card 4: Objetivo de Entrega */}
          <div className="bg-white border-2 border-ea-black p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between text-ea-black/60 mb-2">
              <span className="font-mono text-[11px] uppercase font-bold tracking-wider">
                Meta Contratada
              </span>
              <Target className="w-4 h-4 text-ea-black" />
            </div>
            <div className="font-anton text-3xl sm:text-4xl text-ea-black tracking-wide my-1">
              {stats.targetImpressions
                ? stats.targetImpressions.toLocaleString('es-EC')
                : 'Pauta Libre'}
            </div>
            <div className="font-creato text-[11px] text-ea-black/60">
              {stats.deliveryPercent ? `${stats.deliveryPercent}% completado` : 'Presupuesto continuo'}
            </div>
          </div>
        </section>

        {/* 4. DAILY TREND CHART */}
        <section className="bg-white border-2 border-ea-black p-6 sm:p-7 shadow-[4px_4px_0px_#000]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-ea-black/15">
            <div>
              <h2 className="font-okcok text-xl font-bold uppercase tracking-tight">
                Evolución Diaria de Campaña
              </h2>
              <p className="font-creato text-xs text-ea-black/70 mt-0.5">
                Volumen diario de exposiciones verificadas y tráfico generado
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-ea-black inline-block" />
                <span>Impresiones Válidas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-500 inline-block" />
                <span>Clics Válidos</span>
              </div>
            </div>
          </div>

          {dailyTrend.length === 0 ? (
            <div className="py-12 text-center font-mono text-sm text-ea-black/50">
              Sin registros diarios acumulados para este período.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-2 items-end h-52 pt-6 px-2 border-b border-ea-black/20">
                {dailyTrend.map((day) => {
                  const impHeight = Math.max(Math.round((day.validImpressions / maxImp) * 100), 4);
                  const dayCtr =
                    day.validImpressions > 0
                      ? ((day.validClicks / day.validImpressions) * 100).toFixed(1)
                      : '0.0';

                  return (
                    <div
                      key={day.date}
                      className="group flex flex-col items-center h-full justify-end relative cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-ea-black text-white p-2 rounded-none font-mono text-[9px] pointer-events-none z-20 whitespace-nowrap shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                        <div className="font-bold">{day.date}</div>
                        <div>Imp: {day.validImpressions}</div>
                        <div>Clics: {day.validClicks} (CTR: {dayCtr}%)</div>
                      </div>

                      {/* Bar columns */}
                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        {/* Impressions bar */}
                        <div
                          className="w-1/2 bg-ea-black group-hover:bg-black/75 transition-all"
                          style={{ height: `${impHeight}%` }}
                        />
                        {/* Clicks mini bar */}
                        <div
                          className="w-1/3 bg-amber-500 group-hover:bg-amber-400 transition-all"
                          style={{
                            height: `${Math.min(
                              Math.max(Math.round((day.validClicks / Math.max(maxImp * 0.1, 1)) * 100), 2),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="font-mono text-[9px] text-ea-black/60 mt-1 truncate max-w-full">
                        {day.date.split('-').slice(1).join('/')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ea-black/30 bg-[#FAF8F5] text-ea-black/70">
                      <th className="py-2 px-3">Fecha</th>
                      <th className="py-2 px-3 text-right">Impresiones</th>
                      <th className="py-2 px-3 text-right">Clics Válidos</th>
                      <th className="py-2 px-3 text-right">Clics Brutos</th>
                      <th className="py-2 px-3 text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyTrend.map((day) => {
                      const dayCtr =
                        day.validImpressions > 0
                          ? ((day.validClicks / day.validImpressions) * 100).toFixed(2)
                          : '0.00';
                      return (
                        <tr key={day.date} className="border-b border-ea-black/10 hover:bg-ea-black/5">
                          <td className="py-2 px-3 font-semibold">{day.date}</td>
                          <td className="py-2 px-3 text-right">{day.validImpressions.toLocaleString('es-EC')}</td>
                          <td className="py-2 px-3 text-right text-amber-700 font-semibold">{day.validClicks}</td>
                          <td className="py-2 px-3 text-right text-ea-black/50">{day.grossClicks}</td>
                          <td className="py-2 px-3 text-right font-bold">{dayCtr}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 5. PLACEMENT BREAKDOWN */}
        <section className="bg-white border-2 border-ea-black p-6 sm:p-7 shadow-[4px_4px_0px_#000]">
          <h2 className="font-okcok text-xl font-bold uppercase tracking-tight mb-2">
            Rendimiento por Formato y Ubicación
          </h2>
          <p className="font-creato text-xs text-ea-black/70 mb-5">
            Distribución del impacto publicitario según el punto de contacto en la plataforma
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placementBreakdown.map((plc) => (
              <div
                key={plc.placementId}
                className="border-2 border-ea-black p-4 bg-[#FAF8F5] flex flex-col justify-between shadow-[2px_2px_0px_#000]"
              >
                <div>
                  <span className="font-mono text-[9.5px] uppercase font-bold text-ea-black/50 block">
                    ID: {plc.placementId}
                  </span>
                  <h4 className="font-okcok text-base font-bold uppercase mt-0.5 text-ea-black">
                    {plc.name}
                  </h4>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-ea-black/15 font-mono text-center">
                  <div>
                    <span className="text-[10px] text-ea-black/50 uppercase block">Imp.</span>
                    <span className="font-anton text-lg text-ea-black">{plc.impressions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ea-black/50 uppercase block">Clics</span>
                    <span className="font-anton text-lg text-amber-600">{plc.clicks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ea-black/50 uppercase block">CTR</span>
                    <span className="font-anton text-lg text-ea-black">{plc.ctr}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. METHODOLOGY & TRANSPARENCY */}
        <section className="bg-white border-2 border-ea-black p-6 sm:p-7 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-okcok text-lg font-bold uppercase tracking-tight">
              Metodología de Medición y Transparencia
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-creato leading-relaxed text-ea-black/80">
            <div className="border border-ea-black/20 p-4 bg-[#FAF8F5]">
              <h4 className="font-anton uppercase tracking-wider text-ea-black mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Auditoría de Impresiones (MRC Standard)
              </h4>
              <p>
                Una impresión solo se contabiliza cuando al menos el <strong>50% del área gráfica</strong> del banner se encuentra en el área visible activa de la pantalla de forma continua durante <strong>1.000 milisegundos (1 segundo)</strong>. Se descartan exposiciones fugaces por scroll rápido y se aplica deduplicación por sesión para evitar inflación artificial de métricas.
              </p>
            </div>

            <div className="border border-ea-black/20 p-4 bg-[#FAF8F5]">
              <h4 className="font-anton uppercase tracking-wider text-ea-black mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Validación de Clics y Protección Anti-Fraude
              </h4>
              <p>
                Los clics se gestionan a través de un endpoint central de redirección (<code>/api/ads/click</code>). El sistema registra el evento de forma persistente en servidor y filtra automáticamente ráfagas de doble clic accidentales en intervalos menores a 3 segundos, así como crawlers y user-agents automatizados conocidos.
              </p>
            </div>
          </div>
        </section>

        {/* 7. ADVERTISER SUPPORT CONTACT */}
        <footer className="pt-4 pb-12 text-center font-creato text-xs text-ea-black/60 print:pb-0">
          <p>
            Reporte oficial generado por <strong>Ecuadorian Architecture</strong> para <strong>{brand.name}</strong>.
          </p>
          <p className="mt-1">
            Para dudas sobre este reporte, ajustes de creatividad o contratación de nuevos espacios, contáctanos a{' '}
            <a href="mailto:comercial@ecuadorianarch.com" className="underline font-bold text-ea-black">
              comercial@ecuadorianarch.com
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};
