import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Compass,
  DollarSign,
  Award,
  Calendar,
  AlertCircle,
  FileText,
  Mail,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  Copy,
  ChevronRight,
  ShieldCheck,
  Send,
  Building2,
  TrendingUp,
  Flame,
  Layers,
  HelpCircle,
  RefreshCw,
  Monitor,
} from 'lucide-react';
import {
  OpportunitiesAgentId,
  OpportunityCategory,
  OpportunityStatus,
  OpportunityItem,
  SponsorLead,
  SponsorshipPackage,
  OpportunityAlert,
  OpportunityPitch,
  OpportunitiesMonthlyReport,
  OpportunitiesHubState,
} from '../../editorial-office/core/types';
import { EA_OPPORTUNITIES_AGENTS } from '../../editorial-office/agents/eaOpportunitiesPrompts';

export const OpportunitiesOfficePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'virtual-office' | 'hub' | 'calendar' | 'sponsors' | 'for-you' | 'pitches' | 'reports'
  >('virtual-office');

  const [oppState, setOppState] = useState<OpportunitiesHubState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filters for Hub
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Selected item states
  const [selectedOppId, setSelectedOppId] = useState<string>('opp-baq-2026');
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>('sp-novacero');
  const [selectedAgentDesk, setSelectedAgentDesk] = useState<OpportunitiesAgentId>('ea-opp-01-director');
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Fetch opportunities state from server
  const fetchOppState = async () => {
    try {
      const res = await fetch('/api/opportunities/hub');
      if (res.ok) {
        const data = await res.json();
        setOppState(data);
      }
    } catch (e) {
      console.warn('Error fetching opportunities hub:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOppState();
  }, []);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Generate pitch
  const handleGeneratePitch = async (targetId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/opportunities/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId }),
      });
      if (res.ok) {
        const data = await res.json();
        triggerNotice(`Dossier y borrador de pitch generados con éxito para "${data.pitch?.targetName}"`);
        await fetchOppState();
        setActiveTab('pitches');
      }
    } catch (err: any) {
      triggerNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Compile monthly report
  const handleCompileReport = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/opportunities/report/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: 'Noviembre 2026' }),
      });
      if (res.ok) {
        triggerNotice('Informe estratégico mensual compilado por el Opportunities Director.');
        await fetchOppState();
        setActiveTab('reports');
      }
    } catch (err: any) {
      triggerNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const opportunitiesList = oppState?.opportunities ? Object.values(oppState.opportunities) : [];
  const sponsorsList = oppState?.sponsors ? Object.values(oppState.sponsors) : [];
  const alertsList = oppState?.alerts || [];
  const pitchesList = oppState?.pitches ? Object.values(oppState.pitches) : [];
  const reportsList = oppState?.monthlyReports || [];
  const packagesList = oppState?.packages || [];

  // Filtered opportunities
  const filteredOpps = opportunitiesList.filter((opp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      opp.title.toLowerCase().includes(q) ||
      opp.organizer.toLowerCase().includes(q) ||
      opp.country.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'todos' || opp.category === categoryFilter;
    const matchesStatus = statusFilter === 'todos' || opp.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedOpp = opportunitiesList.find((o) => o.id === selectedOppId) || opportunitiesList[0];
  const selectedSponsor = sponsorsList.find((s) => s.id === selectedSponsorId) || sponsorsList[0];
  const currentPitch = pitchesList[0];

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0d] text-white overflow-hidden font-inter">
      {/* Opportunities Header Navigation Bar */}
      <div className="bg-[#141414] border-b border-white/10 px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-anton text-sm uppercase tracking-wider text-white">
            EA OPPORTUNITIES & PARTNERSHIPS OFFICE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded font-semibold">
            7 AGENTES ESTRATÉGICOS
          </span>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="px-3 py-1 bg-emerald-400 text-black font-mono text-xs font-semibold rounded shadow flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-black/60 p-1 border border-white/10 rounded">
          <button
            onClick={() => setActiveTab('virtual-office')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'virtual-office' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" /> OFICINA VIRTUAL
          </button>
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'hub' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3" /> OPPORTUNITIES HUB ({opportunitiesList.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'calendar' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3" /> CALENDARIO & ALERTAS
          </button>
          <button
            onClick={() => setActiveTab('sponsors')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'sponsors' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3 h-3" /> CRM AUSPICIOS ({sponsorsList.length})
          </button>
          <button
            onClick={() => setActiveTab('for-you')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors flex items-center gap-1.5 relative ${
              activeTab === 'for-you' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" /> FOR YOU ({alertsList.length})
          </button>
          <button
            onClick={() => setActiveTab('pitches')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'pitches' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" /> DOSSIERS & PITCHES
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> INFORME MENSUAL
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: VIRTUAL OFFICE & DESKS */}
        {activeTab === 'virtual-office' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Architectural Office Header */}
            <div className="bg-[#181818] border border-white/15 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block mb-1">
                  PLANTA ARQUITECTÓNICA // SALA ESTRATÉGICA EN VIVO
                </span>
                <h1 className="font-anton text-2xl md:text-3xl text-white uppercase tracking-wider">
                  ZONA OPPORTUNITIES & PARTNERSHIPS
                </h1>
                <p className="text-xs text-neutral-400 mt-1 max-w-3xl font-light">
                  Los 7 agentes estratégicos operan en tiempo real en sus escritorios: rastrean bienales, auditan
                  fondos públicos, gestionan relaciones con patrocinadores y formulan dossiers institucionales con
                  autonomía supervisada.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isProcessing}
                  onClick={handleCompileReport}
                  className="px-4 py-2 bg-amber-400 text-black font-anton text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Compilar Informe Mensual
                </button>
                <button
                  onClick={fetchOppState}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                  title="Actualizar estado de agentes"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Virtual Office Floor Plan Representation */}
            <div className="bg-[#121212] border border-white/20 p-6 rounded-lg relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span className="uppercase tracking-wider font-bold text-white">
                    VISTA ESPACIAL DE ESCRITORIOS // DESKS INTERACTIVOS
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  7 Humanitos / Agentes en Operación
                </span>
              </div>

              {/* Grid of Virtual Desks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(EA_OPPORTUNITIES_AGENTS).map((agent) => {
                  const isDirector = agent.id === 'ea-opp-01-director';
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentDesk(agent.id)}
                      className={`p-4 border transition-all cursor-pointer relative group ${
                        selectedAgentDesk === agent.id
                          ? 'bg-[#222222] border-amber-400 ring-1 ring-amber-400/50 shadow-lg'
                          : 'bg-[#181818] border-white/10 hover:border-white/30'
                      } ${isDirector ? 'lg:col-span-2 bg-gradient-to-r from-[#1c1c1c] to-[#262626]' : ''}`}
                    >
                      {/* Desk Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/80 shadow"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
                          </div>
                          <div>
                            <span className="font-anton text-sm tracking-wider uppercase text-white block">
                              {agent.name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-300 block opacity-90 truncate max-w-[180px]">
                              {agent.role}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 bg-black/50 border border-white/10 text-neutral-300 rounded uppercase">
                          {agent.status}
                        </span>
                      </div>

                      {/* Desk Activity Status (Humanito trabajando) */}
                      <div className="bg-black/60 p-2.5 border border-white/5 rounded text-xs font-mono space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500">
                          <span>TAREA ACTIVA EN ESCRITORIO</span>
                          <span className="text-amber-400 font-bold">{agent.completedTasksCount} tareas</span>
                        </div>
                        <p className="text-white text-[11px] leading-tight">
                          {agent.id === 'ea-opp-01-director' && 'Coordinando evaluación estratégica de BAQ 2026 y Fondo IFCI.'}
                          {agent.id === 'ea-opp-02-competitions' && 'Rastreando bases de concursos y bienales en Ecuador y LatAm.'}
                          {agent.id === 'ea-opp-03-grants' && 'Auditoría de requisitos documentales para subvenciones IFCI/AECID.'}
                          {agent.id === 'ea-opp-04-sponsorships' && 'Seguimiento con Novacero y Holcim para serie de materiales.'}
                          {agent.id === 'ea-opp-05-institutional' && 'Estructuración de borrador de convenio de tesis con FAU-UCE.'}
                          {agent.id === 'ea-opp-06-proposals' && 'Confeccionando pitch de estructuras sismorresistentes Novacero.'}
                          {agent.id === 'ea-opp-07-analyst' && 'Ponderando matrices de riesgo y elegibilidad (Fit Score).'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> Autonomía supervisada
                        </span>
                        <span className="text-amber-400 group-hover:underline flex items-center gap-0.5">
                          Ver perfil &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Desk Deep Inspector */}
              {(() => {
                const agent = EA_OPPORTUNITIES_AGENTS[selectedAgentDesk];
                return (
                  <div className="mt-6 bg-[#1a1a1a] border border-white/15 p-5 rounded space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">
                          INSPECTOR DE ESCRITORIO //
                        </span>
                        <h3 className="font-anton text-lg text-white uppercase tracking-wider">{agent.name}</h3>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">{agent.role}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="bg-black/40 p-3 border border-white/5 space-y-2">
                        <span className="text-amber-400 font-bold block uppercase text-[10px]">
                          RESPONSABILIDADES EN CURSO
                        </span>
                        <ul className="space-y-1 text-neutral-300">
                          {agent.responsibilities.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">›</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-black/40 p-3 border border-white/5 space-y-2">
                        <span className="text-amber-400 font-bold block uppercase text-[10px]">
                          SYSTEM PROMPT & REGLAS DE DECISIÓN
                        </span>
                        <pre className="text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                          {agent.systemPrompt}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 2: EA OPPORTUNITIES HUB */}
        {activeTab === 'hub' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Hub Filters Bar */}
            <div className="bg-[#181818] border border-white/15 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                <Search className="w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar por convocatoria, bienal, organizador, país..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/50 border border-white/10 px-3 py-1.5 text-xs text-white placeholder-neutral-500 font-mono flex-1 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-black/50 border border-white/10 px-3 py-1.5 text-xs font-mono text-neutral-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="todos">Todas las Categorías</option>
                  <option value="concurso">Concursos</option>
                  <option value="premio">Premios</option>
                  <option value="convocatoria">Convocatorias</option>
                  <option value="fondo">Fondos</option>
                  <option value="subvencion">Subvenciones</option>
                  <option value="cooperacion_internacional">Cooperación Internacional</option>
                  <option value="alianza_institucional">Alianzas Institucionales</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/50 border border-white/10 px-3 py-1.5 text-xs font-mono text-neutral-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="detectada">Detectada</option>
                  <option value="verificada">Verificada</option>
                  <option value="recomendada">Recomendada</option>
                  <option value="en_preparacion">En Preparación</option>
                  <option value="postulada">Postulada</option>
                  <option value="en_negociacion">En Negociación</option>
                </select>
              </div>
            </div>

            {/* Opportunities Catalog Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-[#161616] border border-white/10 p-5 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest block">
                          {opp.category.replace(/_/g, ' ')} // {opp.country}
                        </span>
                        <h3 className="font-anton text-lg text-white uppercase tracking-wider mt-0.5">
                          {opp.title}
                        </h3>
                        <span className="text-xs text-neutral-400 font-mono block">{opp.organizer}</span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                            opp.status === 'recomendada'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : opp.status === 'en_preparacion'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-white/10 text-neutral-300 border border-white/15'
                          }`}
                        >
                          {opp.status.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500 block mt-1">
                          Fit Score: <strong className="text-amber-400">{opp.strategicFitScore}/100</strong>
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/40 p-3 border border-white/5 text-xs font-mono space-y-1.5">
                      <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                        <span>CIERRE OFICIAL:</span>
                        <span className="text-white font-bold">{opp.closingDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                        <span>COSTO DE POSTULACIÓN:</span>
                        <span className="text-white">{opp.cost}</span>
                      </div>
                      <div className="pt-1 border-t border-white/5 text-[11px] text-neutral-300">
                        <strong className="text-amber-400">Elegibilidad EA:</strong> {opp.eaEligibility}
                      </div>
                    </div>

                    <div className="text-xs text-neutral-300 font-mono">
                      <strong className="text-neutral-400 block text-[10px] uppercase mb-1">REQUISITOS CLAVE:</strong>
                      <ul className="space-y-0.5 list-disc list-inside text-[11px] text-neutral-400">
                        {opp.requirements.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <a
                      href={opp.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      Bases Oficiales <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleGeneratePitch(opp.id)}
                      className="px-3 py-1.5 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generar Pitch / Dossier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CALENDARIO & ALERTAS ANTICIPADAS (30, 15, 7, 2 DÍAS) */}
        {activeTab === 'calendar' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block mb-1">
                  CALENDARIO CRÍTICO DE OPORTUNIDADES // SISTEMA DE ALERTAS
                </span>
                <h2 className="font-anton text-2xl text-white uppercase tracking-wider">
                  SEGUIMIENTO DE FECHAS LÍMITE & APERTURAS
                </h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">
                  Alertas programadas automáticas a 30, 15, 7 y 2 días antes de cada fecha de cierre para no perder
                  ninguna postulación.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 bg-red-950/60 border border-red-800 text-red-300 rounded font-bold">
                  2 Días (Crítico)
                </span>
                <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-800 text-amber-300 rounded font-bold">
                  7 Días (Alto)
                </span>
                <span className="px-2.5 py-1 bg-yellow-950/60 border border-yellow-800 text-yellow-300 rounded font-bold">
                  15 Días
                </span>
                <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded font-bold">
                  30 Días
                </span>
              </div>
            </div>

            {/* Timeline List of Deadlines */}
            <div className="space-y-4">
              {opportunitiesList
                .filter((o) => o.closingDate)
                .sort((a, b) => new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime())
                .map((opp) => {
                  const now = new Date();
                  const closeDate = new Date(opp.closingDate);
                  const diffDays = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                  const isUrgent = diffDays <= 7;
                  const isCritical = diffDays <= 2;

                  return (
                    <div
                      key={opp.id}
                      className={`p-5 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isCritical
                          ? 'bg-red-950/20 border-red-800'
                          : isUrgent
                          ? 'bg-amber-950/20 border-amber-800'
                          : 'bg-[#161616] border-white/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-anton text-lg text-white uppercase tracking-wider">{opp.title}</span>
                          <span className="text-xs font-mono text-neutral-400">({opp.organizer})</span>
                        </div>
                        <p className="text-xs text-neutral-300 font-mono">
                          Requisitos pendientes:{' '}
                          <span className="text-neutral-400">{opp.requiredDocs.join(', ')}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-mono text-xs text-neutral-400 block uppercase">FECHA LÍMITE</span>
                          <span className="font-anton text-xl text-white block">{opp.closingDate}</span>
                          <span
                            className={`font-mono text-xs font-bold block ${
                              isCritical ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {diffDays > 0 ? `${diffDays} días restantes` : 'Cerrada'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleGeneratePitch(opp.id)}
                          className="px-3 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                        >
                          Preparar Expediente
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 4: CRM DE AUSPICIOS & PATROCINIOS */}
        {activeTab === 'sponsors' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block mb-1">
                  CRM COMERCIAL & AUSPICIOS DE ALTO VALOR // INDEPENDENCIA BLINDADA
                </span>
                <h2 className="font-anton text-2xl text-white uppercase tracking-wider">
                  BASE DE PATROCINADORES DEL SECTOR CONSTRUCTOR
                </h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">
                  Marcas de acero, hormigón sostenible, maderas certificadas y acabados. Separación estricta entre
                  pautas publicitarias y juicios críticos editoriales.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('pitches')}
                  className="px-3 py-2 bg-amber-400 text-black font-anton text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors"
                >
                  Ver Pitches Preparados
                </button>
              </div>
            </div>

            {/* Sponsors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sponsorsList.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="bg-[#161616] border border-white/10 p-5 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest block">
                          {sponsor.sector}
                        </span>
                        <h3 className="font-anton text-lg text-white uppercase tracking-wider mt-0.5">
                          {sponsor.companyName}
                        </h3>
                        <span className="text-xs text-neutral-400 font-mono block">{sponsor.country}</span>
                      </div>
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {sponsor.affinityScore}% Afín
                      </span>
                    </div>

                    <div className="bg-black/40 p-3 border border-white/5 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                        <span>ETAPA ACTUAL:</span>
                        <span className="text-amber-300 uppercase font-bold">
                          {sponsor.currentStage.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                        <span>PRESUPUESTO ESTIMADO:</span>
                        <span className="text-white">{sponsor.estimatedBudgetRange}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                        <span>CONTACTO:</span>
                        <span className="text-neutral-300">{sponsor.contactEmail}</span>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-300 font-mono">
                      <strong className="text-neutral-400 block text-[10px] uppercase mb-1">
                        PROPUESTA ADAPTADA:
                      </strong>
                      <p className="text-[11px] text-neutral-300 line-clamp-3">{sponsor.customProposalSummary}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      Web oficial <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleGeneratePitch(sponsor.id)}
                      className="px-3 py-1.5 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Diseñar Pitch
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Configurable Sponsorship Packages */}
            <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
              <span className="font-anton text-sm uppercase tracking-wider text-white block border-b border-white/10 pb-2">
                PAQUETES DE PATROCINIO INSTITUCIONAL CONFIGURABLES
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packagesList.map((pkg) => (
                  <div key={pkg.id} className="bg-black/40 border border-white/5 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="font-anton text-base text-amber-400 uppercase tracking-wider block">
                        {pkg.name}
                      </span>
                      <span className="text-xs font-mono text-neutral-400 block mt-0.5">{pkg.tagline}</span>
                      <p className="text-xs text-neutral-300 mt-2 font-mono leading-relaxed">{pkg.description}</p>

                      <div className="mt-3 pt-3 border-t border-white/5 text-xs font-mono space-y-1">
                        <span className="text-neutral-500 text-[10px] uppercase block">ENTREGABLES INCLUIDOS:</span>
                        <ul className="space-y-0.5 text-neutral-300 list-disc list-inside text-[11px]">
                          {pkg.deliverables.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold">{pkg.estimatedMonthlyOrAnnualRange}</span>
                      <span className="text-emerald-400 text-[10px] uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Independencia Ética
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BANDEJA "OPPORTUNITIES FOR YOU" */}
        {activeTab === 'for-you' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-6 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block mb-1">
                  BANDEJA EJECUTIVA DIRECTA // RECOMENDACIONES DE ALTA PRIORIDAD
                </span>
                <h2 className="font-anton text-2xl text-white uppercase tracking-wider">
                  OPPORTUNITIES FOR YOU (DIRECTOR GENERAL)
                </h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">
                  Convocatorias de alto calado, alertas de cierre inminente y marcas con afinidad estratégica
                  seleccionadas por el Opportunities Director.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {alertsList.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-[#161616] border border-white/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                        alert.priority === 'URGENTE'
                          ? 'bg-red-950/60 text-red-400 border border-red-800'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      }`}
                    >
                      <Flame className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-anton text-base text-white uppercase tracking-wider">
                          {alert.title}
                        </span>
                        <span className="px-2 py-0.5 bg-white/10 text-[9px] font-mono text-neutral-300 uppercase">
                          {alert.priority}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 font-mono leading-relaxed">{alert.summary}</p>
                      <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5 pt-0.5">
                        <span className="font-bold uppercase">ACCIÓN RECOMENDADA:</span>
                        <span>{alert.recommendedAction}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGeneratePitch(alert.targetId)}
                    className="px-4 py-2 bg-amber-400 text-black font-anton text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors flex-shrink-0 flex items-center gap-1.5"
                  >
                    Actuar Ahora &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DOSSIERS & PITCHES */}
        {activeTab === 'pitches' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block mb-1">
                  AGENTE 06 // PROPOSAL & PITCH DESIGNER
                </span>
                <h2 className="font-anton text-2xl text-white uppercase tracking-wider">
                  DOSSIERS Y PRESENTACIONES INSTITUCIONALES
                </h2>
                <span className="text-xs font-mono text-neutral-400">
                  Propuestas estructuradas con justificación, entregables, presupuesto y borrador de email
                </span>
              </div>

              {currentPitch && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${currentPitch.title}\n\n${currentPitch.summary}\n\nQUÉ OFRECE EA:\n${currentPitch.whatWeOffer.join(
                        '\n'
                      )}\n\nBORRADOR DE EMAIL:\nAsunto: ${currentPitch.draftEmailSubject}\n\n${currentPitch.draftEmailBody}`
                    );
                    setCopiedPitch(true);
                    setTimeout(() => setCopiedPitch(false), 2500);
                  }}
                  className="px-4 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedPitch ? '¡Copiado al Portapapeles!' : 'Copiar Dossier Completo'}
                </button>
              )}
            </div>

            {currentPitch ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Outline Box */}
                <div className="bg-[#161616] border border-white/10 p-5 space-y-4 text-xs font-mono">
                  <span className="font-anton text-xs uppercase tracking-wider text-amber-400 block border-b border-white/10 pb-2">
                    ESTRUCTURA DEL PITCH DECK
                  </span>
                  <ul className="space-y-2 text-neutral-300">
                    {currentPitch.pitchDeckOutline.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-neutral-500 text-[10px] uppercase block">PRESUPUESTO PRELIMINAR:</span>
                    <span className="text-emerald-400 text-sm font-bold block">{currentPitch.preliminaryBudget}</span>
                    <span className="text-neutral-500 text-[10px] uppercase block mt-2">CRONOGRAMA DE EJECUCIÓN:</span>
                    <span className="text-white block">{currentPitch.timeline}</span>
                  </div>
                </div>

                {/* Right Pitch Body & Email Draft */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
                    <div>
                      <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block">
                        DESTINATARIO: {currentPitch.targetName}
                      </span>
                      <h3 className="font-anton text-xl text-white uppercase tracking-wider mt-0.5">
                        {currentPitch.title}
                      </h3>
                      <p className="text-xs text-neutral-300 mt-2 font-mono leading-relaxed">{currentPitch.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
                      <div className="bg-black/40 p-3 border border-white/5 space-y-1.5">
                        <span className="text-amber-400 font-bold block uppercase text-[10px]">QUÉ OFRECE EA:</span>
                        <ul className="space-y-1 text-neutral-300 list-disc list-inside text-[11px]">
                          {currentPitch.whatWeOffer.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-black/40 p-3 border border-white/5 space-y-1.5">
                        <span className="text-amber-400 font-bold block uppercase text-[10px]">BENEFICIOS MUTUOS:</span>
                        <ul className="space-y-1 text-neutral-300 list-disc list-inside text-[11px]">
                          {currentPitch.mutualBenefits.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Draft Email Box */}
                  <div className="bg-[#161616] border border-white/10 p-6 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-anton text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> BORRADOR DE EMAIL DE ACERCAMIENTO
                      </span>
                      <span className="text-[10px] text-neutral-400">Listo para revisión de la Dirección</span>
                    </div>

                    <div className="bg-black/40 p-3 border border-white/5">
                      <span className="text-neutral-500 text-[10px] block">ASUNTO:</span>
                      <span className="text-white font-bold">{currentPitch.draftEmailSubject}</span>
                    </div>

                    <div className="bg-black/40 p-4 border border-white/5 text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                      {currentPitch.draftEmailBody}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#161616] border border-white/10">
                <FileText className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 font-mono">
                  Selecciona una convocatoria o patrocinador en el Hub para generar un pitch automático.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: INFORME MENSUAL DE OPORTUNIDADES */}
        {activeTab === 'reports' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block mb-1">
                  AGENTE 01 // OPPORTUNITIES DIRECTOR
                </span>
                <h2 className="font-anton text-2xl text-white uppercase tracking-wider">
                  INFORME ESTRATÉGICO MENSUAL DE OPORTUNIDADES
                </h2>
                <span className="text-xs font-mono text-neutral-400">
                  Balance consolidado de convocatorias, fondos no reembolsables y negociaciones de patrocinio
                </span>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleCompileReport}
                className="px-4 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-compilar Informe del Mes
              </button>
            </div>

            {reportsList[0] && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#161616] border border-white/10 p-5 space-y-4 font-mono text-xs">
                  <span className="font-anton text-xs uppercase tracking-wider text-amber-400 block border-b border-white/10 pb-2">
                    BALANCE CUANTITATIVO
                  </span>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Convocatorias Identificadas:</span>
                      <span className="text-white font-bold">{reportsList[0].totalIdentified}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Oportunidades Recomendadas:</span>
                      <span className="text-emerald-400 font-bold">{reportsList[0].totalRecommended}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Negociaciones Activas de Auspicio:</span>
                      <span className="text-amber-400 font-bold">{reportsList[0].activeSponsorNegotiations}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-neutral-500 text-[10px] uppercase block">VALOR POTENCIAL EN FONDOS:</span>
                      <span className="text-emerald-400 text-sm font-bold block mt-0.5">
                        {reportsList[0].grantsValuePotential}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-[#161616] border border-white/10 p-5 space-y-4 font-mono text-xs">
                  <span className="font-anton text-xs uppercase tracking-wider text-white block border-b border-white/10 pb-2">
                    RECOMENDACIONES ESTRATÉGICAS PARA LA DIRECCIÓN GENERAL
                  </span>

                  <ul className="space-y-3 text-neutral-300">
                    {reportsList[0].strategicRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 bg-black/40 p-3 border border-white/5">
                        <span className="text-amber-400 font-bold text-sm">#{i + 1}</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-white/10 text-[11px] text-neutral-500 flex items-center justify-between">
                    <span>Preparado por: {reportsList[0].preparedByAgent}</span>
                    <span>Fecha: {new Date(reportsList[0].timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
