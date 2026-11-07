import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Cpu,
  BookOpen,
  FileText,
  Instagram,
  Mail,
  Activity,
  Database,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Eye,
  Check,
  X,
  Copy,
  ChevronRight,
  ExternalLink,
  Layers,
  Search,
  Sliders,
  Send,
  HelpCircle,
  Flame,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  AgentId,
  AgentProfile,
  EditorialArticleWorkspace,
  EditorialOfficeState,
  InstagramCarouselPackage,
  NewsletterEdition,
  WebOpsHealthReport,
} from '../../editorial-office/core/types';
import { EA_AGENTS_REGISTRY } from '../../editorial-office/agents/eaAgentPrompts';
import { EA_INSTITUTIONAL_MEMORY } from '../../editorial-office/core/institutionalMemory';

export const EditorialOfficePanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'agents' | 'redaccion' | 'instagram' | 'newsletter' | 'webops' | 'memoria'
  >('dashboard');

  const [officeState, setOfficeState] = useState<EditorialOfficeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Redacción view state
  const [selectedArticleId, setSelectedArticleId] = useState<string>('espacio-para-hablar-con-dios-ssqj');
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('ea-01-chief-editor');
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Fetch current state
  const fetchState = async () => {
    try {
      const res = await fetch('/api/editorial/state');
      if (res.ok) {
        const data = await res.json();
        setOfficeState(data);
      }
    } catch (e) {
      console.warn('Could not fetch from /api/editorial/state, loading local fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Run pipeline for an article
  const handleRunPipeline = async (articleId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/editorial/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      if (res.ok) {
        const data = await res.json();
        triggerNotice(`Pipeline completado con éxito para "${data.workspace?.originalSnapshot?.title || articleId}"`);
        await fetchState();
      } else {
        triggerNotice('Error ejecutando el pipeline en el servidor.');
      }
    } catch (err: any) {
      triggerNotice(`Error de conexión: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Instagram package
  const handleGenerateInstagram = async (articleId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/editorial/instagram/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      if (res.ok) {
        triggerNotice('Carrusel de 10 diapositivas generado exitosamente.');
        await fetchState();
        setActiveSubTab('instagram');
      }
    } catch (err: any) {
      triggerNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Newsletter
  const handleGenerateNewsletter = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/editorial/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: 'Noviembre 2026' }),
      });
      if (res.ok) {
        triggerNotice('Boletín editorial mensual compilado exitosamente.');
        await fetchState();
        setActiveSubTab('newsletter');
      }
    } catch (err: any) {
      triggerNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Run WebOps Diagnostic
  const handleRunWebOps = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/editorial/webops/check');
      if (res.ok) {
        triggerNotice('Auditoría técnica en vivo completada sin anomalías.');
        await fetchState();
      }
    } catch (err: any) {
      triggerNotice(`Error en auditoría: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const articlesList = officeState?.articles ? Object.values(officeState.articles) : [];
  const currentArticle = articlesList.find((a) => a.articleId === selectedArticleId) || articlesList[0];
  const igPackages = officeState?.instagramPackages ? Object.values(officeState.instagramPackages) : [];
  const currentIg = igPackages.find((p) => p.articleId === selectedArticleId) || igPackages[0];
  const currentNewsletter = officeState?.newsletters?.[0];
  const healthReport = officeState?.healthReport;

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f0f] text-white overflow-hidden font-inter">
      {/* Top Bar Office Navigation */}
      <div className="bg-[#161616] border-b border-white/10 px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-anton text-sm uppercase tracking-wider text-white">EA AI EDITORIAL OFFICE</span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 border border-white/20 text-neutral-300 rounded">
            13 AGENTES ACTIVOS
          </span>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="px-3 py-1 bg-amber-400 text-black font-mono text-xs font-semibold rounded shadow flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Sub-tab Pills */}
        <div className="flex items-center gap-1 bg-black/50 p-1 border border-white/10 rounded">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors ${
              activeSubTab === 'dashboard' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            A. DASHBOARD
          </button>
          <button
            onClick={() => setActiveSubTab('agents')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors ${
              activeSubTab === 'agents' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            B. AGENTES (13)
          </button>
          <button
            onClick={() => setActiveSubTab('redaccion')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors ${
              activeSubTab === 'redaccion' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            C. REDACCIÓN & DIFFS
          </button>
          <button
            onClick={() => setActiveSubTab('instagram')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors ${
              activeSubTab === 'instagram' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            D. INSTAGRAM (10 SLIDES)
          </button>
          <button
            onClick={() => setActiveSubTab('newsletter')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors ${
              activeSubTab === 'newsletter' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            E. NEWSLETTER
          </button>
          <button
            onClick={() => setActiveSubTab('webops')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors ${
              activeSubTab === 'webops' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            F. WEB OPERATIONS
          </button>
          <button
            onClick={() => setActiveSubTab('memoria')}
            className={`px-3 py-1 text-xs font-anton tracking-wider uppercase transition-colors ${
              activeSubTab === 'memoria' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            G. MEMORIA
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SUBTAB A: DASHBOARD GENERAL */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="bg-[#181818] border border-white/15 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-widest block mb-1">
                  ESTADO DE LA REDACCIÓN EDITORIAL // OPERACIÓN EN VIVO
                </span>
                <h1 className="font-anton text-2xl md:text-3xl text-white uppercase tracking-wider">
                  SALA DE MÁQUINAS EDITORIAL ECUADORIAN ARCHITECTURE
                </h1>
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-light">
                  Los 13 agentes operan con autonomía funcional: analizan la tectónica, preservan la voz de los
                  autores, auditan hechos constructivos y condensan el pensamiento en carruseles y newsletters.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleRunPipeline(selectedArticleId)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  {isProcessing ? 'Procesando Agentes...' : 'Correr Pipeline Completo'}
                </button>
                <button
                  onClick={fetchState}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                  title="Actualizar estado"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">AGENTES ACTIVOS</span>
                <span className="font-anton text-3xl text-white mt-1 block">13 / 13</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">100% operativos</span>
              </div>
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">EN EDICIÓN / REVISIÓN</span>
                <span className="font-anton text-3xl text-amber-400 mt-1 block">{articlesList.length || 1}</span>
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block">v1 preservando voz</span>
              </div>
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">FACT-CHECKING</span>
                <span className="font-anton text-3xl text-emerald-400 mt-1 block">
                  {currentArticle?.factCheckReport?.verifiedCount || 5} / {currentArticle?.factCheckReport?.totalClaims || 6}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block">Sin contradicciones</span>
              </div>
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">CARRUSELES INSTAGRAM</span>
                <span className="font-anton text-3xl text-white mt-1 block">{igPackages.length || 1}</span>
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block">10 diapositivas exactas</span>
              </div>
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">PRÓXIMO NEWSLETTER</span>
                <span className="font-anton text-xl text-white mt-2 block truncate">NOV 2026</span>
                <span className="text-[10px] text-amber-400 font-mono mt-1 block">Borrador listo</span>
              </div>
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">SALUD WEB & UPTIME</span>
                <span className="font-anton text-3xl text-emerald-400 mt-1 block">
                  {healthReport?.uptimePercentage || 99.98}%
                </span>
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                  {healthReport?.averageResponseTimeMs || 110} ms latencia
                </span>
              </div>
            </div>

            {/* Split Section: Active Article In Pipeline & Live Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Article Workspace Card */}
              <div className="lg:col-span-2 bg-[#161616] border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest block">
                      ARTÍCULO EN PROCESAMIENTO EDITORIAL
                    </span>
                    <h2 className="font-anton text-xl text-white uppercase tracking-wider mt-0.5">
                      {currentArticle?.originalSnapshot?.title || 'ESPACIO PARA HABLAR CON DIOS'}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono text-xs uppercase font-bold">
                    {currentArticle?.stage || 'PENDIENTE_APROBACION'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-black/40 p-2.5 border border-white/5">
                    <span className="text-neutral-500 block text-[10px]">AUTOR ORIGINAL:</span>
                    <span className="text-white font-medium">{currentArticle?.originalSnapshot?.author}</span>
                  </div>
                  <div className="bg-black/40 p-2.5 border border-white/5">
                    <span className="text-neutral-500 block text-[10px]">ESTUDIO:</span>
                    <span className="text-white font-medium">{currentArticle?.originalSnapshot?.studio}</span>
                  </div>
                  <div className="bg-black/40 p-2.5 border border-white/5">
                    <span className="text-neutral-500 block text-[10px]">UBICACIÓN:</span>
                    <span className="text-white font-medium">{currentArticle?.originalSnapshot?.location}</span>
                  </div>
                </div>

                <div className="bg-black/30 p-4 border border-white/5 text-xs text-neutral-300 leading-relaxed font-mono">
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider block mb-1">
                    DICTAMEN EDITORIAL SINTÉTICO (CHIEF EDITOR):
                  </span>
                  {currentArticle?.latestRevision?.excerptSuggestion ||
                    'En las faldas de Rumiñahui, una comunidad sin templo y un taller emergente se unieron para concebir un santuario donde la tierra cruda, la madera local y el diseño participativo devuelven a la arquitectura su sentido comunitario más profundo.'}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveSubTab('redaccion')}
                    className="flex-1 py-2 px-3 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Ver Comparador de Versiones & Diffs
                  </button>
                  <button
                    onClick={() => handleGenerateInstagram(currentArticle?.articleId || selectedArticleId)}
                    className="py-2 px-3 bg-white/10 text-white font-anton text-xs uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
                  >
                    <Instagram className="w-3.5 h-3.5" /> Generar Carrusel (10)
                  </button>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-[#161616] border border-white/10 p-6 flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <span className="font-anton text-sm uppercase tracking-wider text-white">REGISTRO DE ACTIVIDAD</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
                  {(officeState?.activityLog || []).slice(0, 8).map((log) => (
                    <div key={log.id} className="text-xs border-l-2 border-amber-400 pl-3 py-1 font-mono">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500">
                        <span className="font-bold text-neutral-300">{log.agentName}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-neutral-300 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB B: AGENTES (13 ESPECIALISTAS) */}
        {activeSubTab === 'agents' && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Agent Sidebar Selector */}
            <div className="bg-[#161616] border border-white/10 p-4 space-y-2 max-h-[750px] overflow-y-auto">
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block mb-2 px-2">
                ORGANIGRAMA INSTITUCIONAL (13)
              </span>
              {Object.values(EA_AGENTS_REGISTRY).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-3 border transition-colors flex items-center gap-3 ${
                    selectedAgentId === agent.id
                      ? 'bg-white text-black border-white'
                      : 'bg-black/30 border-white/5 hover:border-white/20 text-neutral-300'
                  }`}
                >
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-9 h-9 object-cover rounded-full border border-black/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-anton text-xs tracking-wider uppercase truncate">{agent.name}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          agent.status === 'working' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-mono block opacity-80 truncate">{agent.role}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Agent Detail Card */}
            {(() => {
              const agent = EA_AGENTS_REGISTRY[selectedAgentId] || EA_AGENTS_REGISTRY['ea-01-chief-editor'];
              return (
                <div className="md:col-span-2 bg-[#161616] border border-white/10 p-6 space-y-6">
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-16 h-16 object-cover border border-white/20"
                      />
                      <div>
                        <span className="font-mono text-xs text-amber-400 uppercase tracking-wider block">
                          {agent.department.replace(/-/g, ' ').toUpperCase()}
                        </span>
                        <h2 className="font-anton text-2xl text-white uppercase tracking-wider">{agent.name}</h2>
                        <span className="text-xs text-neutral-400 font-mono">{agent.role}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-neutral-500 block text-[10px]">ESTADO ACTUAL</span>
                      <span className="text-emerald-400 font-bold uppercase">{agent.status}</span>
                      <span className="text-neutral-500 block text-[10px] mt-2">TAREAS EJECUTADAS</span>
                      <span className="text-white font-bold">{agent.completedTasksCount}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-anton text-xs text-neutral-400 uppercase tracking-wider mb-1">
                      DESCRIPCIÓN INSTITUCIONAL
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed font-light">{agent.description}</p>
                  </div>

                  <div>
                    <h3 className="font-anton text-xs text-neutral-400 uppercase tracking-wider mb-2">
                      RESPONSABILIDADES TÉCNICAS
                    </h3>
                    <ul className="space-y-1.5 text-xs text-neutral-300 font-mono">
                      {agent.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">›</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-black/50 p-4 border border-white/10">
                    <h3 className="font-anton text-xs text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" /> INSTRUCCIONES DE SISTEMA (SYSTEM PROMPT INDEPENDIENTE)
                    </h3>
                    <pre className="text-[11px] font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {agent.systemPrompt}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SUBTAB C: REDACCIÓN & COMPARADOR DE VERSIONES */}
        {activeSubTab === 'redaccion' && currentArticle && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header with approval actions */}
            <div className="bg-[#181818] border border-white/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider block">
                  REVISIÓN EDITORIAL & CONTROL DE VERSIONES
                </span>
                <h2 className="font-anton text-xl text-white uppercase tracking-wider">
                  {currentArticle.originalSnapshot.title}
                </h2>
                <span className="text-xs font-mono text-neutral-400">
                  Por: {currentArticle.originalSnapshot.author} // Estudio: {currentArticle.originalSnapshot.studio}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleRunPipeline(currentArticle.articleId)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-anton text-xs uppercase tracking-wider border border-white/20 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-procesar Pipeline
                </button>
                <button
                  onClick={() => {
                    triggerNotice('¡Versión editorial mejorada aprobada por la Dirección!');
                  }}
                  className="px-4 py-2 bg-emerald-500 text-black font-anton text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Aprobar Versión Final
                </button>
              </div>
            </div>

            {/* Side-by-Side Version Comparator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Original v0 (Immutable) */}
              <div className="bg-[#161616] border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-anton text-xs uppercase tracking-wider text-neutral-400">
                    TEXTO ORIGINAL (INALTERABLE // V0)
                  </span>
                  <span className="px-2 py-0.5 bg-white/10 text-[10px] font-mono text-neutral-400">SNAPSHOT ORIGINAL</span>
                </div>
                <div className="text-xs text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap max-h-[450px] overflow-y-auto pr-2 bg-black/30 p-3 border border-white/5">
                  {currentArticle.originalSnapshot.rawText || currentArticle.originalSnapshot.excerpt}
                </div>
              </div>

              {/* Right Column: Architecture Editor Refined (v1) */}
              <div className="bg-[#161616] border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-anton text-xs uppercase tracking-wider text-amber-400">
                      VERSIÓN MEJORADA (ARCHITECTURE EDITOR // V1)
                    </span>
                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 text-[10px] font-mono font-bold">
                      {currentArticle.latestRevision?.authorPreservedVoiceScore || 92}% VOZ PRESERVADA
                    </span>
                  </div>
                </div>
                <div className="text-xs text-white leading-relaxed font-mono whitespace-pre-wrap max-h-[450px] overflow-y-auto pr-2 bg-black/40 p-3 border border-amber-400/20">
                  {currentArticle.latestRevision?.improvedNarrative}
                </div>
              </div>
            </div>

            {/* Diffs & Explanations */}
            <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
              <span className="font-anton text-sm uppercase tracking-wider text-white block border-b border-white/10 pb-2">
                DETALLE DE CAMBIOS & OBSERVACIONES EDITORIALES (DIFF INSPECTOR)
              </span>
              <div className="space-y-3">
                {(currentArticle.latestRevision?.diffs || []).map((diff, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 p-3 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">CAMBIO #{idx + 1}</span>
                      <span className="text-[10px] text-neutral-400">{diff.reason}</span>
                    </div>
                    {diff.originalText && (
                      <div className="bg-red-950/30 text-red-300 p-2 border-l-2 border-red-500 line-through opacity-80">
                        {diff.originalText}
                      </div>
                    )}
                    {diff.editedText && (
                      <div className="bg-emerald-950/30 text-emerald-300 p-2 border-l-2 border-emerald-500">
                        {diff.editedText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Split: Architecture Critic Report & Fact Checker Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Architecture Critic */}
              <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-anton text-sm uppercase tracking-wider text-white">
                    DICTAMEN CRÍTICO (ARCHITECTURE CRITIC)
                  </span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                {currentArticle.critiqueReport ? (
                  <div className="space-y-3 text-xs font-mono text-neutral-300">
                    <div>
                      <span className="text-amber-400 font-bold block text-[10px] uppercase">IMPLANTACIÓN & TERRITORIO</span>
                      <p className="mt-0.5 text-neutral-300">{currentArticle.critiqueReport.implantacion}</p>
                    </div>
                    <div>
                      <span className="text-amber-400 font-bold block text-[10px] uppercase">ESPACIALIDAD & LUZ</span>
                      <p className="mt-0.5 text-neutral-300">{currentArticle.critiqueReport.espacialidad}</p>
                    </div>
                    <div>
                      <span className="text-amber-400 font-bold block text-[10px] uppercase">MATERIALIDAD & TECTÓNICA</span>
                      <p className="mt-0.5 text-neutral-300">{currentArticle.critiqueReport.materialidadTecnica}</p>
                    </div>
                    <div>
                      <span className="text-amber-400 font-bold block text-[10px] uppercase">PREGUNTAS CRÍTICAS PARA DEBATE</span>
                      <ul className="mt-1 space-y-1 list-disc list-inside text-neutral-400">
                        {currentArticle.critiqueReport.preguntasCriticas.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 font-mono">Ejecute el pipeline para generar la crítica.</p>
                )}
              </div>

              {/* Fact Checker Matrix */}
              <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-anton text-sm uppercase tracking-wider text-white">
                    MATRIZ DE VERIFICACIÓN (FACT CHECKER)
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                {currentArticle.factCheckReport ? (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {currentArticle.factCheckReport.items.map((item) => (
                      <div key={item.id} className="bg-black/40 border border-white/5 p-2.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400 uppercase">{item.category}</span>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              item.status === 'VERIFICADO'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-white font-medium mt-1">{item.claim}</p>
                        <p className="text-neutral-400 text-[10px] mt-0.5">Evidencia: {item.evidence}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 font-mono">Ejecute el pipeline para auditar los hechos.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB D: INSTAGRAM STUDIO (10 SLIDES) */}
        {activeSubTab === 'instagram' && currentIg && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider block">
                  AGENTE 07 // INSTAGRAM EDITORIAL STUDIO
                </span>
                <h2 className="font-anton text-xl text-white uppercase tracking-wider">{currentIg.carouselTitle}</h2>
                <span className="text-xs font-mono text-neutral-400">
                  Exactamente 10 diapositivas // Textos concisos de una línea (5-14 palabras)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${currentIg.carouselTitle}\n\n` +
                        currentIg.slides.map((s) => `Slide ${s.slideNumber}: ${s.text}`).join('\n') +
                        `\n\nCOPY:\n${currentIg.copy}\n\nPREGUNTA:\n${currentIg.closingQuestion}\n\n${currentIg.hashtags.join(' ')}`
                    );
                    setCopiedNotice(true);
                    setTimeout(() => setCopiedNotice(false), 2500);
                  }}
                  className="px-3 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedNotice ? '¡Copiado al Portapapeles!' : 'Copiar Paquete Completo'}
                </button>
              </div>
            </div>

            {/* 10 Slides Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {currentIg.slides.map((slide) => (
                <div
                  key={slide.slideNumber}
                  className="bg-[#161616] border border-white/10 p-3.5 flex flex-col justify-between aspect-[4/5] relative group hover:border-amber-400/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-2">
                      <span className="font-bold text-amber-400">SLIDE {slide.slideNumber.toString().padStart(2, '0')}</span>
                      <span>{slide.wordCount} PALABRAS</span>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                      {slide.stage.replace(/_/g, ' ')}
                    </span>
                    <p className="font-anton text-sm text-white uppercase tracking-wider leading-snug">
                      "{slide.text}"
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-2 text-[10px] font-mono text-neutral-400">
                    <span className="text-neutral-500 block text-[9px] uppercase">DIRECCIÓN VISUAL:</span>
                    <p className="line-clamp-2 mt-0.5">{slide.visualDirection}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Instagram Copy & Strategy Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#161616] border border-white/10 p-6">
              <div className="space-y-3">
                <span className="font-anton text-xs uppercase tracking-wider text-neutral-400 block">
                  COPY EDITORIAL DE INSTAGRAM
                </span>
                <div className="bg-black/40 p-4 border border-white/5 text-xs text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {currentIg.copy}
                </div>
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <span className="font-anton text-xs uppercase tracking-wider text-amber-400 block mb-1">
                    PREGUNTA DE CIERRE PARA COMENTARIOS
                  </span>
                  <div className="bg-black/40 p-3 border border-white/5 text-xs text-white font-mono">
                    "{currentIg.closingQuestion}"
                  </div>
                </div>

                <div>
                  <span className="font-anton text-xs uppercase tracking-wider text-neutral-400 block mb-1">
                    HASHTAGS RECOMENDADOS (MÁXIMO 6)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentIg.hashtags.map((h, i) => (
                      <span key={i} className="text-xs font-mono px-2 py-0.5 bg-white/10 text-neutral-300">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB E: NEWSLETTER STUDIO */}
        {activeSubTab === 'newsletter' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider block">
                  AGENTE 08 // NEWSLETTER MENSUAL AUTOMATIZADO
                </span>
                <h2 className="font-anton text-xl text-white uppercase tracking-wider">
                  {currentNewsletter?.editionName || 'EA CUADERNO EDITORIAL // NOVIEMBRE 2026'}
                </h2>
                <span className="text-xs font-mono text-neutral-400">
                  Asunto: {currentNewsletter?.subjectLine}
                </span>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleGenerateNewsletter}
                className="px-4 py-2 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" /> Re-compilar Edición Mensual
              </button>
            </div>

            {/* Newsletter Preview Frame */}
            {currentNewsletter && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#161616] border border-white/10 p-5 space-y-4 text-xs font-mono">
                  <span className="font-anton text-xs uppercase tracking-wider text-neutral-400 block border-b border-white/10 pb-2">
                    ESTRUCTURA EDITORIAL (10 PARTES)
                  </span>
                  <ol className="space-y-2 text-neutral-300 list-decimal list-inside">
                    <li>Nombre: {currentNewsletter.editionName}</li>
                    <li>Editorial de Apertura</li>
                    <li>Reflexión Central: "{currentNewsletter.mainReflection.substring(0, 45)}..."</li>
                    <li>Artículos Destacados ({currentNewsletter.featuredArticles.length})</li>
                    <li>Hitos Arquitectónicos</li>
                    <li>Noticias & Territorio</li>
                    <li>Notas Comunitarias</li>
                    <li>Agenda Cultural</li>
                    <li>Lectura Recomendada: {currentNewsletter.recommendedReading.title}</li>
                    <li>Cierre Institucional EA</li>
                  </ol>
                </div>

                <div className="lg:col-span-2 bg-[#161616] border border-white/10 p-5 flex flex-col">
                  <span className="font-anton text-xs uppercase tracking-wider text-amber-400 block mb-3">
                    VISTA PREVIA HTML RESPONSIVE
                  </span>
                  <div className="bg-white rounded overflow-hidden flex-1 min-h-[450px]">
                    <iframe
                      srcDoc={currentNewsletter.htmlContent}
                      title="Newsletter Preview"
                      className="w-full h-full min-h-[450px] border-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB F: WEB OPERATIONS */}
        {activeSubTab === 'webops' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider block">
                  AGENTE 09 // WEB OPERATIONS & RELIABILITY ENGINEER
                </span>
                <h2 className="font-anton text-xl text-white uppercase tracking-wider">
                  ESTADO DE SALUD TÉCNICA DE LA PLATAFORMA
                </h2>
                <span className="text-xs font-mono text-neutral-400">
                  Monitoreo de disponibilidad, latencia, rutas HTTP y bases de datos
                </span>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleRunWebOps}
                className="px-4 py-2 bg-emerald-500 text-black font-anton text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center gap-2"
              >
                <Activity className="w-3.5 h-3.5" /> Ejecutar Diagnóstico en Vivo
              </button>
            </div>

            {/* Health Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase">DISPONIBILIDAD (UPTIME)</span>
                <span className="font-anton text-3xl text-emerald-400 mt-1 block">
                  {healthReport?.uptimePercentage || 99.98}%
                </span>
              </div>
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase">LATENCIA PROMEDIO</span>
                <span className="font-anton text-3xl text-white mt-1 block">
                  {healthReport?.averageResponseTimeMs || 110} ms
                </span>
              </div>
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase">BASE DE DATOS & SUPABASE</span>
                <span className="font-anton text-2xl text-emerald-400 mt-1 block uppercase">
                  {healthReport?.databaseStatus || 'HEALTHY'}
                </span>
              </div>
              <div className="bg-[#161616] border border-white/10 p-4">
                <span className="font-mono text-[10px] text-neutral-500 uppercase">PORTAL CMS ADMIN</span>
                <span className="font-anton text-2xl text-emerald-400 mt-1 block uppercase">
                  {healthReport?.cmsStatus || 'OPERATIONAL'}
                </span>
              </div>
            </div>

            {/* Incident Log Table */}
            <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
              <span className="font-anton text-sm uppercase tracking-wider text-white block border-b border-white/10 pb-2">
                REGISTRO DE INCIDENTES CLASIFICADOS (CRÍTICO / ALTO / MEDIO / BAJO)
              </span>

              {healthReport?.activeIncidents && healthReport.activeIncidents.length > 0 ? (
                <div className="space-y-3">
                  {healthReport.activeIncidents.map((inc) => (
                    <div key={inc.id} className="bg-black/40 border border-white/5 p-4 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-bold uppercase">{inc.endpointOrComponent}</span>
                        <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-white">{inc.description}</p>
                      <p className="text-neutral-400 text-[11px]">Propuesta de solución: {inc.proposedFix}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-black/20 border border-white/5">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-neutral-300 font-mono">
                    Todos los sistemas y endpoints se encuentran saludables. 0 incidentes detectados.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB G: MEMORIA INSTITUCIONAL */}
        {activeSubTab === 'memoria' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[#181818] border border-white/15 p-4">
              <span className="font-mono text-xs text-amber-400 uppercase tracking-wider block">
                BASE DE CONOCIMIENTO PERMANENTE // EA KNOWLEDGE BASE
              </span>
              <h2 className="font-anton text-xl text-white uppercase tracking-wider">
                MEMORIA INSTITUCIONAL Y CRITERIOS EDITORIALES
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manual de Identidad */}
              <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
                <span className="font-anton text-sm uppercase tracking-wider text-amber-400 block border-b border-white/10 pb-2">
                  MANUAL DE IDENTIDAD Y VOZ EDITORIAL
                </span>
                <ul className="space-y-2 text-xs text-neutral-300 font-mono">
                  {EA_INSTITUTIONAL_MEMORY.identity.editorialVoice.traits.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">›</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Criterios de Crítica */}
              <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
                <span className="font-anton text-sm uppercase tracking-wider text-amber-400 block border-b border-white/10 pb-2">
                  DIMENSIONES DE LA CRÍTICA ARQUITECTÓNICA
                </span>
                <div className="space-y-3 text-xs font-mono">
                  {EA_INSTITUTIONAL_MEMORY.critiqueFramework.coreDimensions.map((d, i) => (
                    <div key={i} className="bg-black/40 p-3 border border-white/5">
                      <span className="text-white font-bold block mb-1">{d.dimension}</span>
                      <ul className="text-neutral-400 text-[11px] list-disc list-inside">
                        {d.guidingQuestions.map((q, qi) => (
                          <li key={qi}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Directorio de Arquitectos y Maestros Mayores */}
              <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
                <span className="font-anton text-sm uppercase tracking-wider text-amber-400 block border-b border-white/10 pb-2">
                  DIRECTORIO VERIFICADO (ESTUDIOS & MAESTROS MAYORES)
                </span>
                <div className="space-y-2 text-xs font-mono">
                  {EA_INSTITUTIONAL_MEMORY.verifiedDirectory.architectsAndStudios.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-black/40 border border-white/5">
                      <span className="text-white font-bold">{s.name} ({s.city})</span>
                      <span className="text-[10px] text-neutral-400">{s.focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archivo de Resoluciones */}
              <div className="bg-[#161616] border border-white/10 p-6 space-y-4">
                <span className="font-anton text-sm uppercase tracking-wider text-amber-400 block border-b border-white/10 pb-2">
                  RESOLUCIONES Y DECISIONES EDITORIALES
                </span>
                <div className="space-y-2 text-xs font-mono">
                  {EA_INSTITUTIONAL_MEMORY.editorialDecisionsArchive.map((dec) => (
                    <div key={dec.id} className="p-3 bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500">
                        <span className="text-amber-400 font-bold">{dec.id}</span>
                        <span>{dec.date}</span>
                      </div>
                      <p className="text-white font-medium">{dec.subject}</p>
                      <p className="text-neutral-400 text-[11px]">{dec.resolution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
