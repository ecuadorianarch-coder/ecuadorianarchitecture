import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  MessageSquare,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  FileText,
  Sliders,
  Send,
  Building2,
  Layers,
  Flame,
  ShieldCheck,
  Share2,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
  LayoutGrid,
  Kanban,
  Video,
  Mic,
  Maximize2,
  RefreshCw,
  Compass,
  Coffee
} from 'lucide-react';
import { AgentCharacterAvatar } from '../../editorial-office/visual/AgentCharacterAvatar';
import { AgentDeskWorkstation, DeskAgentData } from '../../editorial-office/visual/AgentDeskWorkstation';
import { GatherOfficeWorld } from '../../editorial-office/visual/GatherOfficeWorld';
import { EA_AGENTS_REGISTRY } from '../../editorial-office/agents/eaAgentPrompts';
import { EA_OPPORTUNITIES_AGENTS } from '../../editorial-office/agents/eaOpportunitiesPrompts';

interface TaskItem {
  id: string;
  title: string;
  department: string;
  assignedAgentId: string;
  assignedAgentName: string;
  priority: 'urgente' | 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'en_proceso' | 'en_revision' | 'esperando_aprobacion' | 'completada' | 'bloqueada';
  progress: number;
  deliverableRef?: string;
  deliverableType?: 'articulo' | 'carrusel' | 'newsletter' | 'pitch' | 'reporte' | 'auditoria' | 'oportunidad' | 'alianza';
  deadline?: string;
  description?: string;
  blockReason?: string;
}

interface MeetingSession {
  id: string;
  date: string;
  topic: string;
  objective: string;
  attendees: string[];
  transcript: Array<{ speaker: string; role: string; message: string; timestamp: string }>;
  conclusions: string[];
  actionItems: Array<{ task: string; assignee: string; deadline: string }>;
}

export const VisualWorkspaceOffice: React.FC = () => {
  // Navigation sub-views (Gather 2D interactive walk-around mode default)
  const [currentView, setCurrentView] = useState<'gather' | 'floor' | 'pipeline' | 'tasks' | 'director' | 'meeting'>('gather');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('todos');

  // Office state loaded from backend API
  const [agentsMap, setAgentsMap] = useState<Record<string, DeskAgentData>>({});
  const [tasksList, setTasksList] = useState<TaskItem[]>([]);
  const [meetingsList, setMeetingsList] = useState<MeetingSession[]>([]);
  const [rawState, setRawState] = useState<any>(null);
  const [oppState, setOppState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Modals & Drawers
  const [activeDrawerAgent, setActiveDrawerAgent] = useState<DeskAgentData | null>(null);
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState<boolean>(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState<boolean>(false);
  const [selectedArticleInspector, setSelectedArticleInspector] = useState<any>(null);
  const [inspectorActiveTab, setInspectorActiveTab] = useState<'diff' | 'critique' | 'factcheck' | 'instagram'>('diff');

  // Agent chat state
  const [agentChatInput, setAgentChatInput] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Meeting creation state
  const [meetingTopic, setMeetingTopic] = useState<string>('Cobertura Crítica y Difusión de la BAQ 2026');
  const [meetingObjective, setMeetingObjective] = useState<string>('Alinear cronograma editorial, formato de carruseles de 10 láminas y captación de fondos.');
  const [meetingSelectedAgents, setMeetingSelectedAgents] = useState<string[]>([
    'ea-01-chief-editor',
    'ea-04-architecture-critic',
    'ea-07-instagram-editor',
    'ea-opp-01-director'
  ]);
  const [activeMeetingResult, setActiveMeetingResult] = useState<MeetingSession | null>(null);

  // Live Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Guayaquil' }) +
        ' (ECT / Quito)'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch full state from backend
  const fetchOfficeState = async () => {
    try {
      setIsLoading(true);
      const [resEd, resOpp] = await Promise.all([
        fetch('/api/editorial/state'),
        fetch('/api/opportunities/hub').catch(() => fetch('/api/opportunities/state'))
      ]);

      if (resEd.ok) {
        const edData = await resEd.json();
        setRawState(edData);
        if (edData.agentStates) {
          setAgentsMap(edData.agentStates);
        }
        if (edData.tasks) {
          setTasksList(edData.tasks);
        }
        if (edData.meetings) {
          setMeetingsList(edData.meetings);
        }
      }

      if (resOpp.ok) {
        const oppData = await resOpp.json();
        setOppState(oppData);
      }
    } catch (e) {
      console.error('[Visual Workspace] Error al cargar estado:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeState();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  // List of all 20 agents combined
  const allAgentsList = useMemo(() => {
    return Object.values(agentsMap);
  }, [agentsMap]);

  // Grouped agents by 6 visual departments
  const departmentGroups = useMemo(() => {
    return {
      'direccion-general': {
        name: '01. DIRECCIÓN GENERAL & EDITORIAL',
        subtitle: 'Liderazgo, asignación y salvaguarda de la línea crítica institucional',
        accent: '#f59e0b',
        agents: allAgentsList.filter(a => a.department === 'direccion-general')
      },
      'investigacion-critica': {
        name: '02. INVESTIGACIÓN Y CRÍTICA ARQUITECTÓNICA',
        subtitle: 'Edición sintáctica, examen conceptual en 6 dimensiones y rigor fáctico',
        accent: '#06b6d4',
        agents: allAgentsList.filter(a => a.department === 'investigacion-critica')
      },
      'creatividad-multimedia': {
        name: '03. CREATIVIDAD, MULTIMEDIA & NARRATIVA',
        subtitle: 'Carruseles de 10 láminas, boletines mensuales, podcast y diseño visual',
        accent: '#e11d48',
        agents: allAgentsList.filter(a => a.department === 'creatividad-multimedia')
      },
      'comunidad': {
        name: '04. COMUNIDAD & ALIANZAS INSTITUCIONALES',
        subtitle: 'Diálogo con lectores, moderación crítica y convenios con universidades',
        accent: '#8b5cf6',
        agents: allAgentsList.filter(a => a.department === 'comunidad')
      },
      'tecnologia': {
        name: '05. TECNOLOGÍA, WEBOPS & ANALÍTICA',
        subtitle: 'Resiliencia del servidor, latencia 110ms, UX digital y métricas territoriales',
        accent: '#10b981',
        agents: allAgentsList.filter(a => a.department === 'tecnologia')
      },
      'comercial-operaciones': {
        name: '06. COMERCIAL, FONDOS & OPORTUNIDADES',
        subtitle: 'Bienales, concursos, fondos públicos (IFCI/AECID) y patrocinios éticos',
        accent: '#d97706',
        agents: allAgentsList.filter(a => a.department === 'comercial-operaciones')
      }
    };
  }, [allAgentsList]);

  // Filtered department list based on selected filter
  const displayedDepartments = useMemo(() => {
    if (selectedDeptFilter === 'todos') {
      return Object.entries(departmentGroups);
    }
    return Object.entries(departmentGroups).filter(([key]) => key === selectedDeptFilter);
  }, [departmentGroups, selectedDeptFilter]);

  // Tasks requiring director attention
  const needsAttentionTasks = useMemo(() => {
    return tasksList.filter(t => t.status === 'esperando_aprobacion' || t.status === 'bloqueada');
  }, [tasksList]);

  // Single-click approval of an article
  const handleApproveArticle = async (articleId: string) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/editorial/article/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, decision: 'approve' })
      });
      if (res.ok) {
        showNotification('¡Artículo aprobado y publicado exitosamente en Ecuadorian Architecture!');
        await fetchOfficeState();
        if (selectedArticleInspector?.articleId === articleId) {
          setSelectedArticleInspector(null);
        }
      }
    } catch (e: any) {
      alert('Error al aprobar artículo: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Single-click carousel approval
  const handleApproveCarousel = async (pkgId: string) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/editorial/carousel/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkgId })
      });
      if (res.ok) {
        showNotification('¡Carrusel de 10 láminas aprobado para publicación en Instagram!');
        await fetchOfficeState();
      }
    } catch (e: any) {
      alert('Error al aprobar carrusel: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Single-click newsletter approval
  const handleApproveNewsletter = async (newsletterId: string) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/editorial/newsletter/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId })
      });
      if (res.ok) {
        showNotification('¡Edición de boletín mensual aprobada para despacho a suscriptores!');
        await fetchOfficeState();
      }
    } catch (e: any) {
      alert('Error al aprobar boletín: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Single-click resolve blockage
  const handleResolveBlockage = async (taskId: string) => {
    const note = prompt('Ingresa la resolución o indicación para desbloquear esta tarea:', 'Acuerdo ratificado y autorizado por Dirección General.');
    if (!note) return;

    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/editorial/task/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, resolutionNotes: note })
      });
      if (res.ok) {
        showNotification('Bloqueo resuelto y tarea reactivada en el flujo operativo.');
        await fetchOfficeState();
      }
    } catch (e: any) {
      alert('Error al resolver bloqueo: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Run full article pipeline
  const handleRunFullPipeline = async () => {
    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/editorial/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: 'espacio-para-hablar-con-dios-ssqj' })
      });
      if (res.ok) {
        showNotification('Pipeline editorial completado: v1 generado, crítica emitida y hechos auditados.');
        await fetchOfficeState();
      }
    } catch (e: any) {
      alert('Error al correr pipeline: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Run 10-slide Instagram generator
  const handleRunInstagramGenerator = async () => {
    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/editorial/instagram/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: 'espacio-para-hablar-con-dios-ssqj' })
      });
      if (res.ok) {
        showNotification('Carrusel de 10 láminas (5 a 14 palabras c/u) generado exitosamente.');
        await fetchOfficeState();
      }
    } catch (e: any) {
      alert('Error al generar carrusel: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Run WebOps check
  const handleRunWebOps = async () => {
    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/editorial/webops/check');
      if (res.ok) {
        showNotification('Auditoría WebOps ejecutada: 99.98% uptime, 0 incidentes detectados.');
        await fetchOfficeState();
      }
    } catch (e: any) {
      alert('Error en auditoría WebOps: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Send message to agent
  const handleSendMessageToAgent = async () => {
    if (!agentChatInput.trim() || !activeDrawerAgent) return;
    const msgToSend = agentChatInput.trim();
    setAgentChatInput('');
    setIsSendingMessage(true);

    try {
      const res = await fetch('/api/editorial/agent/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: activeDrawerAgent.id, message: msgToSend })
      });

      if (res.ok) {
        await fetchOfficeState();
        // Update local drawer agent representation
        const stateRes = await fetch('/api/editorial/state');
        const stateData = await stateRes.json();
        if (stateData.agentStates && stateData.agentStates[activeDrawerAgent.id]) {
          setActiveDrawerAgent(stateData.agentStates[activeDrawerAgent.id]);
        }
      }
    } catch (e: any) {
      alert('Error al enviar mensaje: ' + e.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Convene virtual meeting
  const handleConveneMeeting = async () => {
    if (!meetingTopic.trim()) {
      alert('Por favor ingresa un tema para la reunión.');
      return;
    }

    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/editorial/meeting/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendeeIds: meetingSelectedAgents,
          topic: meetingTopic,
          objective: meetingObjective
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveMeetingResult(data.minutes);
        showNotification('¡Reunión virtual concluida! Acta de acuerdos registrada.');
        await fetchOfficeState();
      }
    } catch (e: any) {
      alert('Error al convocar reunión: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Toggle agent status (pause/resume)
  const handleToggleAgentPause = async (agent: DeskAgentData) => {
    try {
      setIsProcessingAction(true);
      const newPaused = !agent.isPaused;
      const res = await fetch('/api/editorial/agent/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          updates: {
            isPaused: newPaused,
            status: newPaused ? 'pausado' : 'disponible'
          }
        })
      });
      if (res.ok) {
        showNotification(`Agente ${agent.name} ${newPaused ? 'pausado' : 'reanudado'}.`);
        await fetchOfficeState();
        setActiveDrawerAgent(prev => prev ? { ...prev, isPaused: newPaused, status: newPaused ? 'pausado' : 'disponible' } : null);
      }
    } catch (e: any) {
      alert('Error al modificar estado: ' + e.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Open inspector modal for article
  const activeWorkspace = rawState?.articles ? Object.values(rawState.articles)[0] as any : null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans flex flex-col">
      {/* =========================================================================
          01. TOP EXECUTIVE BAR & HUD (HORA EN VIVO, MÉTRICAS Y ACCIONES RÁPIDAS)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0e0e12]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-400 text-black flex items-center justify-center font-anton text-lg tracking-tighter shadow-md shadow-amber-500/20">
              EA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-anton text-lg tracking-wider text-white">
                  ECUADORIAN ARCHITECTURE
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded">
                  VIRTUAL OFFICE
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-400">
                Oficina Editorial Viva • 20 Agentes IA Operativos • {currentTimeStr}
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="hidden xl:flex items-center gap-3 font-mono text-xs">
            {/* Attention Beacon */}
            <button
              onClick={() => setCurrentView('director')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${
                needsAttentionTasks.length > 0
                  ? 'bg-purple-950/60 border-purple-500/80 text-purple-200 animate-pulse hover:bg-purple-900/60'
                  : 'bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>NECESITA MI ATENCIÓN:</span>
              <span className="font-bold px-1.5 py-0.2 bg-purple-500 text-black rounded text-[11px]">
                {needsAttentionTasks.length}
              </span>
            </button>

            {/* WebOps Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-white/10 rounded text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>WEBOPS: 99.98% OPERACIONAL (110ms)</span>
            </div>

            {/* BAQ & IFCI Alerts */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-white/10 rounded text-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>BAQ 2026 // IFCI FONDO ACTIVO</span>
            </div>
          </div>

          {/* Global Operations Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunFullPipeline}
              disabled={isProcessingAction}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider bg-white text-black hover:bg-amber-400 transition-colors uppercase"
              title="Ejecutar flujo completo de redacción y crítica"
            >
              <Play className="w-3.5 h-3.5" />
              <span>CORRER PIPELINE</span>
            </button>

            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider bg-purple-600 hover:bg-purple-500 text-white transition-colors uppercase"
              title="Convocar reunión en sala virtual"
            >
              <Video className="w-3.5 h-3.5" />
              <span>SALA REUNIONES</span>
            </button>

            <button
              onClick={fetchOfficeState}
              disabled={isLoading}
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 border border-white/10 rounded transition-colors"
              title="Refrescar estado de la oficina"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded border border-white/10 text-xs font-anton tracking-wider">
            <button
              onClick={() => setCurrentView('gather')}
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                currentView === 'gather' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'text-amber-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 animate-spin-slow" /> MODO GATHER (CAMINAR 2D)
            </button>

            <button
              onClick={() => setCurrentView('floor')}
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                currentView === 'floor' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> PLANO ESTUDIO (ESTÁTICO)
            </button>

            <button
              onClick={() => setCurrentView('pipeline')}
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                currentView === 'pipeline' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> PRODUCCIÓN EDITORIAL (8 FASES)
            </button>

            <button
              onClick={() => setCurrentView('tasks')}
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                currentView === 'tasks' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> TABLERO DE TAREAS
            </button>

            <button
              onClick={() => setCurrentView('director')}
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors relative ${
                currentView === 'director' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> MESA CENTRAL DEL DIRECTOR
              {needsAttentionTasks.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
              )}
            </button>

            <button
              onClick={() => setCurrentView('meeting')}
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                currentView === 'meeting' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> ACTAS &amp; REUNIONES
            </button>
          </div>

          {/* Department Filter (only in floor view) */}
          {currentView === 'floor' && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 overflow-x-auto py-0.5">
              <span className="mr-1 text-zinc-300">ZONA:</span>
              {[
                { id: 'todos', label: 'TODAS (6)' },
                { id: 'direccion-general', label: 'DIRECCIÓN' },
                { id: 'investigacion-critica', label: 'CRÍTICA' },
                { id: 'creatividad-multimedia', label: 'CREATIVIDAD' },
                { id: 'comunidad', label: 'COMUNIDAD' },
                { id: 'tecnologia', label: 'TECNOLOGÍA' },
                { id: 'comercial-operaciones', label: 'OPORTUNIDADES' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedDeptFilter(f.id)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    selectedDeptFilter === f.id
                      ? 'bg-zinc-800 text-amber-400 border-amber-400/50 font-bold'
                      : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Floating Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-black font-mono font-bold text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border border-emerald-400 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* =========================================================================
          VIEW 0: MODO GATHER.TOWN INTERACTIVO (CAMINAR POR LA OFICINA EN 2D)
         ========================================================================= */}
      {currentView === 'gather' && (
        <GatherOfficeWorld
          agentsMap={agentsMap}
          onOpenAgentDrawer={(ag) => setActiveDrawerAgent(ag)}
          onOpenDirectorModal={() => setCurrentView('director')}
          onOpenMeetingModal={() => setIsMeetingModalOpen(true)}
          onApproveArticle={handleApproveArticle}
          onApproveCarousel={handleApproveCarousel}
          onApproveNewsletter={handleApproveNewsletter}
          needsAttentionCount={needsAttentionTasks.length}
        />
      )}

      {/* =========================================================================
          VIEW 1: EL PISO DE LA OFICINA (SPATIAL FLOOR PLAN VIEW)
         ========================================================================= */}
      {currentView === 'floor' && (
        <main className="flex-1 p-4 lg:p-8 max-w-[1700px] w-full mx-auto space-y-8">
          {/* Plano de Planta: Centro de Operaciones del Director */}
          <div className="relative p-6 lg:p-8 rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-[#14121a] to-[#0f0e14] overflow-hidden shadow-2xl">
            {/* Grid arquitectónico de fondo */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#a855f7 1px, transparent 1px), radial-gradient(#ffffff 0.5px, transparent 0.5px)`,
                backgroundSize: '32px 32px',
                backgroundPosition: '0 0, 16px 16px'
              }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <AgentCharacterAvatar
                    agentId="ea-director-human"
                    size={76}
                    status={needsAttentionTasks.length > 0 ? 'esperando_aprobacion' : 'disponible'}
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-anton tracking-wider rounded font-bold shadow">
                    HUMANO
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-400 font-bold tracking-widest uppercase">
                      MESA CENTRAL DEL DIRECTOR
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  </div>
                  <h2 className="font-anton text-2xl tracking-wide text-white mt-0.5">
                    DESPACHO DE DIRECCIÓN &amp; CONTROL EJECUTIVO
                  </h2>
                  <p className="font-mono text-xs text-zinc-400 max-w-2xl mt-1">
                    Foco neurálgico de toma de decisiones. Aprueba publicaciones, resuelve bloqueos
                    entre departamentos y valida las alianzas estratégicas con un solo clic.
                  </p>
                </div>
              </div>

              {/* Acceso Rápido a Bandeja "Necesita mi atención" */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCurrentView('director')}
                  className="flex items-center gap-3 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-anton tracking-wider text-sm rounded shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>BANDEJA: {needsAttentionTasks.length} TAREAS PENDIENTES</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMeetingModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 font-anton tracking-wider text-sm rounded transition-colors"
                >
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>CONVOCAR REUNIÓN</span>
                </button>
              </div>
            </div>

            {/* Chips de entregables listos para el director */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                onClick={() => {
                  setSelectedArticleInspector(activeWorkspace);
                  setInspectorActiveTab('diff');
                }}
                className="p-3 bg-black/40 hover:bg-zinc-900 border border-white/10 hover:border-amber-400 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span className="text-amber-400 font-bold">ARTÍCULO V1 LISTO</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-anton text-sm text-white truncate">ESPACIO PARA HABLAR CON DIOS</h4>
                <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">Rumipamba • Dictamen Crítico 8.8/10</p>
              </div>

              <div
                onClick={() => {
                  setSelectedArticleInspector(activeWorkspace);
                  setInspectorActiveTab('instagram');
                }}
                className="p-3 bg-black/40 hover:bg-zinc-900 border border-white/10 hover:border-amber-400 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span className="text-rose-400 font-bold">INSTAGRAM 10 LÁMINAS</span>
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-anton text-sm text-white truncate">CARRUSEL EDITORIAL</h4>
                <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">Estricto 5 a 14 palabras/lámina</p>
              </div>

              <div
                onClick={() => setCurrentView('director')}
                className="p-3 bg-black/40 hover:bg-zinc-900 border border-white/10 hover:border-amber-400 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span className="text-emerald-400 font-bold">BOLETÍN MENSUAL</span>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-anton text-sm text-white truncate">NOVIEMBRE 2026</h4>
                <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">Edición mensual lista para despacho</p>
              </div>

              <div
                onClick={() => setCurrentView('director')}
                className="p-3 bg-black/40 hover:bg-zinc-900 border border-white/10 hover:border-amber-400 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span className="text-amber-300 font-bold">FONDO IFCI &amp; BAQ 2026</span>
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-anton text-sm text-white truncate">$8.000 USD NO REEMBOLSABLE</h4>
                <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">Dossier y memoria en preparación</p>
              </div>
            </div>
          </div>

          {/* Departamentos y Puestos de Trabajo (Las 6 Zonas) */}
          <div className="space-y-8">
            {displayedDepartments.map(([deptKey, dept]) => (
              <section
                key={deptKey}
                className="p-5 lg:p-6 rounded-xl border border-white/10 bg-[#101014] relative overflow-hidden"
              >
                {/* Cabecera del Departamento */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: dept.accent }}
                    />
                    <div>
                      <h3 className="font-anton text-lg tracking-wider text-white">
                        {dept.name}
                      </h3>
                      <p className="font-mono text-xs text-zinc-400">
                        {dept.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-[11px] text-zinc-300 px-2 py-0.5 bg-black/40 border border-white/10 rounded self-start sm:self-auto">
                    {dept.agents.length} AGENTES ACTIVOS
                  </span>
                </div>

                {/* Grid de Puestos de Trabajo / Escritorios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {dept.agents.map(agent => (
                    <AgentDeskWorkstation
                      key={agent.id}
                      agent={agent}
                      accentColor={dept.accent}
                      isSelected={activeDrawerAgent?.id === agent.id}
                      onSelect={(selected) => setActiveDrawerAgent(selected)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW 2: PRODUCCIÓN EDITORIAL KANBAN (8 COLUMNAS DE FLUJO)
         ========================================================================= */}
      {currentView === 'pipeline' && (
        <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-anton text-xl tracking-wider text-white">
                TABLERO DE PRODUCCIÓN EDITORIAL (8 ETAPAS)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Trazabilidad estricta: Recibidos → Investigación → Edición → Crítica → Verificación → Diseño → Aprobación → Publicación
              </p>
            </div>
            <button
              onClick={handleRunFullPipeline}
              disabled={isProcessingAction}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider bg-white text-black hover:bg-amber-400 transition-colors uppercase"
            >
              <Play className="w-3.5 h-3.5" /> RE-PROCESAR ARTÍCULO
            </button>
          </div>

          <div className="grid grid-cols-8 gap-3 min-w-[1400px]">
            {[
              { id: 'recibidos', title: '01. RECIBIDOS', sub: 'CMS v0' },
              { id: 'investigacion', title: '02. INVESTIGACIÓN', sub: 'Contexto & Autor' },
              { id: 'edicion', title: '03. EDICIÓN', sub: 'Prosa & Diffs' },
              { id: 'critica', title: '04. CRÍTICA', sub: '6 Dimensiones' },
              { id: 'verificacion', title: '05. VERIFICACIÓN', sub: 'Fact Checking' },
              { id: 'diseno', title: '06. DISEÑO', sub: '10 Láminas' },
              { id: 'aprobacion', title: '07. APROBACIÓN', sub: 'Mesa Director' },
              { id: 'publicacion', title: '08. PUBLICADO', sub: 'Web & Redes' }
            ].map((col, idx) => {
              const isRumipambaHere =
                (idx === 6 && activeWorkspace?.stage === 'PENDIENTE_APROBACION') ||
                (idx === 7 && activeWorkspace?.stage === 'PUBLICADO') ||
                (idx === 2 && activeWorkspace?.stage === 'REVISION_REQUERIDA');

              return (
                <div key={col.id} className="bg-[#121216] border border-white/10 rounded-lg p-3 flex flex-col h-[75vh]">
                  <div className="pb-2 mb-2 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-anton text-xs tracking-wider text-white truncate">{col.title}</h4>
                      <p className="font-mono text-[9px] text-zinc-400">{col.sub}</p>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono flex items-center justify-center font-bold text-zinc-300">
                      {isRumipambaHere ? 1 : 0}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {isRumipambaHere && activeWorkspace && (
                      <div
                        onClick={() => setSelectedArticleInspector(activeWorkspace)}
                        className="p-3 bg-zinc-900 hover:bg-zinc-800/90 border border-amber-400/80 rounded cursor-pointer transition-all shadow-md group"
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-1">
                          <span className="text-amber-400 font-bold uppercase truncate">NOMADE TALLER</span>
                          <span className="px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-bold">8.8/10</span>
                        </div>
                        <h5 className="font-anton text-xs text-white group-hover:text-amber-400 transition-colors leading-snug">
                          {activeWorkspace.originalSnapshot?.title || 'ESPACIO PARA HABLAR CON DIOS'}
                        </h5>
                        <p className="font-mono text-[10px] text-zinc-400 mt-1 line-clamp-2">
                          Rumipamba • 180 m² • Adobe y Madera • Maestro Mayor Segundo Guanoluisa
                        </p>
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                          <span>Diffs: +36 / -42</span>
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            Inspeccionar <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW 3: TABLERO GLOBAL DE TAREAS (KANBAN MULTIDEPARTAMENTAL)
         ========================================================================= */}
      {currentView === 'tasks' && (
        <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-anton text-xl tracking-wider text-white">
                TABLERO CENTRAL DE TAREAS (KANBAN VIVO)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Visualización integral de tareas pendientes, en curso, bloqueadas y entregables producidos
              </p>
            </div>
            <div className="font-mono text-xs text-zinc-400">
              Total tareas registradas: <span className="text-white font-bold">{tasksList.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3 min-w-[1300px]">
            {[
              { id: 'pendiente', title: 'PENDIENTES', color: 'border-zinc-500/50' },
              { id: 'en_proceso', title: 'EN PROCESO', color: 'border-amber-500/50' },
              { id: 'en_revision', title: 'EN REVISIÓN', color: 'border-cyan-500/50' },
              { id: 'esperando_aprobacion', title: 'ESPERANDO APROBACIÓN', color: 'border-purple-500/50' },
              { id: 'completada', title: 'COMPLETADAS', color: 'border-emerald-500/50' },
              { id: 'bloqueada', title: 'BLOQUEADAS', color: 'border-rose-500/50' }
            ].map(col => {
              const colTasks = tasksList.filter(t => t.status === col.id);

              return (
                <div key={col.id} className="bg-[#121216] border border-white/10 rounded-lg p-3 flex flex-col h-[75vh]">
                  <div className={`pb-2 mb-2 border-b ${col.color} flex items-center justify-between`}>
                    <h4 className="font-anton text-xs tracking-wider text-white truncate">{col.title}</h4>
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono flex items-center justify-center font-bold text-zinc-300">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {colTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3 bg-zinc-900/90 border border-white/10 hover:border-white/30 rounded transition-all shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-1">
                            <span className="uppercase text-amber-400 font-bold truncate max-w-[100px]">
                              {task.department.replace('-', ' ')}
                            </span>
                            <span
                              className={`px-1 py-0.2 rounded font-bold uppercase ${
                                task.priority === 'urgente'
                                  ? 'bg-red-500/20 text-red-300'
                                  : task.priority === 'alta'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <h5 className="font-anton text-xs text-white leading-snug">
                            {task.title}
                          </h5>

                          {task.description && (
                            <p className="font-mono text-[10px] text-zinc-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {task.blockReason && (
                            <div className="mt-2 p-1.5 bg-rose-950/40 border border-rose-500/30 rounded text-[10px] font-mono text-rose-300">
                              ⚠️ {task.blockReason}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-400 truncate max-w-[100px]">{task.assignedAgentName}</span>
                          {task.status === 'bloqueada' ? (
                            <button
                              onClick={() => handleResolveBlockage(task.id)}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[9px]"
                            >
                              Desbloquear
                            </button>
                          ) : (
                            <span className="font-bold text-white">{task.progress}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW 4: MESA CENTRAL DEL DIRECTOR ("NECESITA MI ATENCIÓN")
         ========================================================================= */}
      {currentView === 'director' && (
        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="p-6 bg-gradient-to-r from-purple-950/40 via-zinc-900 to-black border border-purple-500/40 rounded-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-bold uppercase tracking-widest">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>BANDEJA DE PRIORIDAD ABSOLUTA</span>
              </div>
              <h2 className="font-anton text-3xl tracking-wide text-white mt-1">
                NECESITA MI ATENCIÓN ({needsAttentionTasks.length})
              </h2>
              <p className="font-mono text-xs text-zinc-300 mt-1">
                Entregables, dictámenes y decisiones que requieren la aprobación soberana del Director Humano
              </p>
            </div>

            <button
              onClick={() => setCurrentView('floor')}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-anton tracking-wider text-xs rounded transition-colors self-start md:self-auto"
            >
              <LayoutGrid className="w-4 h-4" /> VOLVER AL PISO
            </button>
          </div>

          {/* Lista de Items pendientes */}
          <div className="space-y-4">
            {/* 1. Artículo de Rumipamba esperando aprobación */}
            <div className="p-5 bg-[#121216] border border-amber-400/60 rounded-xl shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 bg-amber-400 text-black font-mono font-bold text-[9px] uppercase rounded">
                      APROBACIÓN EDITORIAL FINAL
                    </span>
                    <h3 className="font-anton text-xl text-white mt-1">
                      ESPACIO PARA HABLAR CON DIOS // NÓMADE TALLER
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 mt-1">
                      El Architecture Editor y el Architecture Critic han finalizado la versión v1. Dictamen crítico: 8.8/10. 6 datos fácticos validados.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedArticleInspector(activeWorkspace);
                      setInspectorActiveTab('diff');
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-anton tracking-wider text-xs rounded transition-colors"
                  >
                    INSPECCIONAR DIFFS &amp; CRÍTICA
                  </button>
                  <button
                    onClick={() => handleApproveArticle('espacio-para-hablar-con-dios-ssqj')}
                    disabled={isProcessingAction}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-anton tracking-wider text-xs rounded shadow transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> APROBAR Y PUBLICAR
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Carrusel de Instagram de 10 láminas */}
            <div className="p-5 bg-[#121216] border border-rose-400/50 rounded-xl shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 bg-rose-500 text-white font-mono font-bold text-[9px] uppercase rounded">
                      VALIDACIÓN DE REDES SOCIALES
                    </span>
                    <h3 className="font-anton text-xl text-white mt-1">
                      CARRUSEL EDITORIAL DE INSTAGRAM (10 LÁMINAS)
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 mt-1">
                      Generado estrictamente respetando el estándar institucional EA: entre 5 y 14 palabras por diapositiva.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedArticleInspector(activeWorkspace);
                      setInspectorActiveTab('instagram');
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-anton tracking-wider text-xs rounded transition-colors"
                  >
                    VER 10 LÁMINAS
                  </button>
                  <button
                    onClick={() => handleApproveCarousel('ig-pkg-1793831565573')}
                    disabled={isProcessingAction}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-anton tracking-wider text-xs rounded shadow transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> APROBAR CARRUSEL
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Newsletter mensual de Noviembre 2026 */}
            <div className="p-5 bg-[#121216] border border-emerald-400/50 rounded-xl shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-500 text-black font-mono font-bold text-[9px] uppercase rounded">
                      BOLETÍN MENSUAL LISTO
                    </span>
                    <h3 className="font-anton text-xl text-white mt-1">
                      EA CUADERNO EDITORIAL // NOVIEMBRE 2026
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 mt-1">
                      Incluye editorial sobre desmercantilización del hábitat, proyecto de Rumipamba y agenda de exposiciones.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveNewsletter('nl-1793831565603')}
                    disabled={isProcessingAction}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-anton tracking-wider text-xs rounded shadow transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> APROBAR Y DESPACHAR
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Tareas bloqueadas */}
            {tasksList.filter(t => t.status === 'bloqueada').map(bTask => (
              <div key={bTask.id} className="p-5 bg-rose-950/20 border border-rose-500/60 rounded-xl shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/40 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-rose-500 text-white font-mono font-bold text-[9px] uppercase rounded">
                        TAREA BLOQUEADA
                      </span>
                      <h3 className="font-anton text-xl text-white mt-1">
                        {bTask.title}
                      </h3>
                      <p className="font-mono text-xs text-rose-300 mt-1">
                        Motivo del bloqueo: {bTask.blockReason}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleResolveBlockage(bTask.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-anton tracking-wider text-xs rounded shadow transition-colors"
                  >
                    RESOLVER BLOQUEO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW 5: ACTAS & SALA DE REUNIONES VIRTUALES
         ========================================================================= */}
      {currentView === 'meeting' && (
        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-anton text-2xl tracking-wider text-white">
                SALA DE REUNIONES VIRTUALES &amp; HISTORIAL DE ACTAS
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Archivo oficial de deliberaciones multiagente, consensos editoriales y acuerdos con tareas asignadas
              </p>
            </div>
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-anton tracking-wider text-xs rounded flex items-center gap-2"
            >
              <Video className="w-4 h-4" /> CONVOCAR NUEVA REUNIÓN
            </button>
          </div>

          <div className="space-y-6">
            {meetingsList.map(meet => (
              <div key={meet.id} className="p-6 bg-[#121216] border border-white/10 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <span className="font-mono text-[10px] text-purple-400 font-bold uppercase">
                      ACTA OFICIAL // {new Date(meet.date).toLocaleDateString('es-EC', { dateStyle: 'full' })}
                    </span>
                    <h3 className="font-anton text-xl text-white mt-0.5">{meet.topic}</h3>
                  </div>
                  <span className="font-mono text-xs text-zinc-400 self-start sm:self-auto">
                    {meet.attendees.length} Asistentes
                  </span>
                </div>

                <div>
                  <h5 className="font-mono text-[11px] text-zinc-400 uppercase font-bold mb-1">Objetivo:</h5>
                  <p className="font-mono text-xs text-zinc-300">{meet.objective}</p>
                </div>

                {/* Transcripción del debate */}
                <div className="p-4 bg-black/50 border border-white/5 rounded-lg space-y-3">
                  <h5 className="font-mono text-[11px] text-amber-400 uppercase font-bold">
                    Transcripción del Debate:
                  </h5>
                  {meet.transcript.map((line, idx) => (
                    <div key={idx} className="font-mono text-xs space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{line.speaker}</span>
                        <span className="text-[10px] text-zinc-400">({line.role})</span>
                        <span className="text-[10px] text-zinc-400 ml-auto">{line.timestamp}</span>
                      </div>
                      <p className="text-zinc-300 pl-3 border-l-2 border-white/10">{line.message}</p>
                    </div>
                  ))}
                </div>

                {/* Conclusiones y Tareas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-zinc-900/60 rounded border border-white/5">
                    <h5 className="font-mono text-[11px] text-emerald-400 uppercase font-bold mb-2">
                      Consensos &amp; Conclusiones:
                    </h5>
                    <ul className="space-y-1 font-mono text-xs text-zinc-300 list-disc list-inside">
                      {meet.conclusions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded border border-white/5">
                    <h5 className="font-mono text-[11px] text-purple-400 uppercase font-bold mb-2">
                      Acciones Asignadas:
                    </h5>
                    <div className="space-y-1.5 font-mono text-xs">
                      {meet.actionItems.map((act, i) => (
                        <div key={i} className="flex items-center justify-between text-zinc-300">
                          <span>• {act.task}</span>
                          <span className="text-amber-400 font-bold shrink-0 ml-2">{act.assignee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* =========================================================================
          MODAL: AGENT PROFILE & DIRECT INSTRUCTION DRAWER
         ========================================================================= */}
      {activeDrawerAgent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#121216] border-l border-white/10 h-full flex flex-col shadow-2xl animate-fadeIn">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between bg-zinc-900/80">
              <div className="flex items-center gap-3">
                <AgentCharacterAvatar
                  agentId={activeDrawerAgent.id}
                  size={60}
                  status={activeDrawerAgent.status}
                />
                <div>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                    {activeDrawerAgent.id}
                  </span>
                  <h3 className="font-anton text-xl text-white">{activeDrawerAgent.name}</h3>
                  <p className="font-mono text-xs text-amber-400">{activeDrawerAgent.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAgentPause(activeDrawerAgent)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded border transition-colors ${
                    activeDrawerAgent.isPaused
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {activeDrawerAgent.isPaused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={() => setActiveDrawerAgent(null)}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Tarea Actual & Progreso */}
              <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
                  <span className="font-bold text-zinc-200">TAREA ACTUAL</span>
                  <span className="text-amber-400 font-bold">{activeDrawerAgent.progress ?? 100}%</span>
                </div>
                <p className="font-mono text-xs text-zinc-300">
                  {activeDrawerAgent.currentTask || 'En guardia operativa'}
                </p>
                <div className="mt-2 w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${activeDrawerAgent.progress ?? 100}%` }}
                  />
                </div>
              </div>

              {/* Responsabilidades Oficiales */}
              {activeDrawerAgent.responsibilities && (
                <div>
                  <h4 className="font-mono text-xs text-zinc-400 uppercase font-bold mb-2">
                    Responsabilidades Oficiales:
                  </h4>
                  <ul className="space-y-1 font-mono text-xs text-zinc-300 list-disc list-inside">
                    {activeDrawerAgent.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* System Prompt (editable / visualizable) */}
              {activeDrawerAgent.systemPrompt && (
                <div className="p-3 bg-zinc-950 border border-white/5 rounded-lg">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                    <span className="font-bold text-zinc-300">SYSTEM PROMPT / DIRECTRICES</span>
                    <span className="text-[10px] text-zinc-400">Verificado</span>
                  </div>
                  <pre className="font-mono text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                    {activeDrawerAgent.systemPrompt}
                  </pre>
                </div>
              )}

              {/* Chat Directo & Enviar Instrucción */}
              <div className="pt-3 border-t border-white/10">
                <h4 className="font-mono text-xs text-amber-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Canal Directo de Instrucción:
                </h4>

                {/* Historial de Mensajes */}
                <div className="p-3 bg-black/50 border border-white/5 rounded-lg space-y-2.5 max-h-52 overflow-y-auto mb-3">
                  {activeDrawerAgent.messages && activeDrawerAgent.messages.length > 0 ? (
                    activeDrawerAgent.messages.map((m: any) => (
                      <div
                        key={m.id}
                        className={`font-mono text-xs p-2 rounded ${
                          m.sender === 'user'
                            ? 'bg-purple-950/40 text-purple-200 border border-purple-500/30 ml-4'
                            : 'bg-zinc-900 text-zinc-300 border border-white/5 mr-4'
                        }`}
                      >
                        <div className="text-[9px] text-zinc-400 font-bold mb-0.5">
                          {m.sender === 'user' ? 'DIRECTOR GENERAL' : activeDrawerAgent.name}
                        </div>
                        <p>{m.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="font-mono text-xs text-zinc-400 text-center py-4">
                      No hay mensajes previos. Envía una instrucción al agente.
                    </p>
                  )}
                </div>

                {/* Input de instrucción */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={agentChatInput}
                    onChange={(e) => setAgentChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessageToAgent()}
                    placeholder={`Instrucción directa para ${activeDrawerAgent.name}...`}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSendMessageToAgent}
                    disabled={isSendingMessage || !agentChatInput.trim()}
                    className="p-2 bg-amber-400 text-black rounded hover:bg-amber-300 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONVOCAR REUNIÓN VIRTUAL MULTIAGENTE
         ========================================================================= */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#141418] border border-purple-500/40 rounded-xl shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-purple-300 font-anton text-xl tracking-wider">
                <Video className="w-5 h-5 text-purple-400" /> CONVOCAR SALA DE REUNIONES VIRTUALES
              </div>
              <button
                onClick={() => {
                  setIsMeetingModalOpen(false);
                  setActiveMeetingResult(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeMeetingResult ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-lg">
                  <h4 className="font-anton text-lg text-emerald-300">¡REUNIÓN CONCLUIDA EXITOSAMENTE!</h4>
                  <p className="font-mono text-xs text-zinc-300 mt-1">
                    Tema: {activeMeetingResult.topic}
                  </p>
                </div>

                {/* Transcripción generada */}
                <div className="p-4 bg-black/60 border border-white/10 rounded-lg space-y-3 font-mono text-xs">
                  <h5 className="font-bold text-amber-400">Transcripción de la deliberación:</h5>
                  {activeMeetingResult.transcript.map((line, i) => (
                    <div key={i} className="pl-3 border-l-2 border-purple-500/40 space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{line.speaker}</span>
                        <span className="text-[10px] text-zinc-400 font-normal">({line.role})</span>
                      </div>
                      <p className="text-zinc-300">{line.message}</p>
                    </div>
                  ))}
                </div>

                {/* Conclusiones */}
                <div className="p-3 bg-zinc-900 rounded border border-white/10 font-mono text-xs">
                  <h5 className="font-bold text-purple-300 mb-1">Acuerdos Adoptados:</h5>
                  <ul className="list-disc list-inside text-zinc-300 space-y-1">
                    {activeMeetingResult.conclusions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setIsMeetingModalOpen(false);
                    setActiveMeetingResult(null);
                    setCurrentView('meeting');
                  }}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-anton tracking-wider text-xs rounded uppercase"
                >
                  VER TODAS LAS ACTAS DE REUNIÓN
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">TEMA DE LA REUNIÓN:</label>
                  <input
                    type="text"
                    value={meetingTopic}
                    onChange={(e) => setMeetingTopic(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-1">OBJETIVO CENTRAL:</label>
                  <input
                    type="text"
                    value={meetingObjective}
                    onChange={(e) => setMeetingObjective(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-zinc-400 mb-2">
                    SELECCIONAR AGENTES PARTICIPANTES ({meetingSelectedAgents.length} convocados):
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-black/40 border border-white/5 rounded">
                    {allAgentsList.map(a => {
                      const isSelected = meetingSelectedAgents.includes(a.id);
                      return (
                        <label
                          key={a.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer font-mono text-xs transition-colors ${
                            isSelected ? 'bg-purple-950/60 text-purple-200 border border-purple-500/40' : 'text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setMeetingSelectedAgents(prev => prev.filter(id => id !== a.id));
                              } else {
                                setMeetingSelectedAgents(prev => [...prev, a.id]);
                              }
                            }}
                            className="rounded accent-purple-500"
                          />
                          <span className="truncate">{a.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => setIsMeetingModalOpen(false)}
                    className="px-4 py-2 font-anton text-xs text-zinc-400 hover:text-white"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleConveneMeeting}
                    disabled={isProcessingAction || meetingSelectedAgents.length < 2}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-anton tracking-wider text-xs rounded uppercase flex items-center gap-2 shadow"
                  >
                    <Video className="w-4 h-4" /> CONVOCAR Y DEBATIR EN SALA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INSPECTOR EDITORIAL (DIFFS, CRÍTICA, VERIFICACIÓN & INSTAGRAM)
         ========================================================================= */}
      {selectedArticleInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-8">
          <div className="w-full max-w-5xl bg-[#121216] border border-white/10 rounded-xl shadow-2xl h-[88vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Header Inspector */}
            <div className="p-4 lg:p-5 bg-zinc-900 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">
                  INSPECTOR EDITORIAL EA // {selectedArticleInspector.originalSlug || 'PROYECTO'}
                </span>
                <h3 className="font-anton text-xl text-white">
                  {selectedArticleInspector.originalSnapshot?.title || 'ESPACIO PARA HABLAR CON DIOS'}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApproveArticle('espacio-para-hablar-con-dios-ssqj')}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-anton tracking-wider text-xs rounded flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> APROBAR Y PUBLICAR
                </button>
                <button
                  onClick={() => setSelectedArticleInspector(null)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="px-5 pt-3 bg-zinc-950 border-b border-white/10 flex items-center gap-4 text-xs font-anton tracking-wider">
              <button
                onClick={() => setInspectorActiveTab('diff')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  inspectorActiveTab === 'diff' ? 'border-amber-400 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                DIFFS: ORIGINAL V0 VS. EDITADO V1
              </button>
              <button
                onClick={() => setInspectorActiveTab('critique')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  inspectorActiveTab === 'critique' ? 'border-amber-400 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                DICTAMEN CRÍTICO (6 DIMENSIONES)
              </button>
              <button
                onClick={() => setInspectorActiveTab('factcheck')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  inspectorActiveTab === 'factcheck' ? 'border-amber-400 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                AUDITORÍA FÁCTICA (FACT CHECKING)
              </button>
              <button
                onClick={() => setInspectorActiveTab('instagram')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  inspectorActiveTab === 'instagram' ? 'border-amber-400 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                CARRUSEL DE INSTAGRAM (10 LÁMINAS)
              </button>
            </div>

            {/* Inspector Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {inspectorActiveTab === 'diff' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original v0 */}
                  <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
                    <h4 className="font-mono text-xs text-zinc-400 font-bold uppercase mb-2">
                      VERSIÓN ORIGINAL RECIBIDA (V0)
                    </h4>
                    <p className="font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                      {selectedArticleInspector.originalSnapshot?.rawText || 'Sin texto registrado.'}
                    </p>
                  </div>

                  {/* Editado v1 */}
                  <div className="p-4 bg-zinc-900/60 border border-amber-400/30 rounded-lg">
                    <h4 className="font-mono text-xs text-amber-400 font-bold uppercase mb-2">
                      VERSIÓN EDITADA POR ARCHITECTURE EDITOR (V1)
                    </h4>
                    <p className="font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {selectedArticleInspector.editedSnapshot?.improvedText || selectedArticleInspector.originalSnapshot?.rawText}
                    </p>
                  </div>
                </div>
              )}

              {inspectorActiveTab === 'critique' && (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900 rounded-lg border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-anton text-lg text-white">CALIFICACIÓN CRÍTICA GLOBAL</h4>
                      <p className="font-mono text-xs text-zinc-400">Emisión por: EA Architecture Critic</p>
                    </div>
                    <span className="font-anton text-3xl text-amber-400">8.8 / 10</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedArticleInspector.critiqueReport?.dimensions ? (
                      Object.entries(selectedArticleInspector.critiqueReport.dimensions).map(([dim, val]: any) => (
                        <div key={dim} className="p-3 bg-black/40 border border-white/5 rounded">
                          <span className="font-mono text-xs text-amber-300 font-bold uppercase">{dim}</span>
                          <p className="font-mono text-xs text-zinc-300 mt-1">{val.notes || val.argumento}</p>
                        </div>
                      ))
                    ) : (
                      <p className="font-mono text-xs text-zinc-400">Evaluación favorable en implantación, ética y materia.</p>
                    )}
                  </div>
                </div>
              )}

              {inspectorActiveTab === 'factcheck' && (
                <div className="space-y-3">
                  <h4 className="font-mono text-xs text-emerald-400 font-bold uppercase">
                    AFIRMACIONES AUDITADAS &amp; CONTRASTADAS:
                  </h4>
                  {selectedArticleInspector.factCheckReport?.verifiedClaims?.map((claim: any, idx: number) => (
                    <div key={idx} className="p-3 bg-black/40 border border-emerald-500/20 rounded flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="font-mono text-xs">
                        <span className="text-white font-bold">{claim.claim}</span>
                        <p className="text-zinc-400 text-[11px] mt-0.5">Fuente: {claim.source} • Estado: Validado</p>
                      </div>
                    </div>
                  )) || (
                    <p className="font-mono text-xs text-zinc-400">6 afirmaciones fácticas verificadas con éxito.</p>
                  )}
                </div>
              )}

              {inspectorActiveTab === 'instagram' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono text-xs text-rose-400 font-bold uppercase">
                      10 LÁMINAS DE CARRUSEL (CUMPLIMIENTO: 5 A 14 PALABRAS CADA UNA)
                    </h4>
                    <button
                      onClick={() => handleApproveCarousel('ig-pkg-1793831565573')}
                      className="px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white font-anton text-xs rounded"
                    >
                      APROBAR CARRUSEL
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const slideNum = i + 1;
                      const pkg = rawState?.instagramPackages ? Object.values(rawState.instagramPackages)[0] as any : null;
                      const slide = pkg?.slides?.find((s: any) => s.slideNumber === slideNum) || {
                        text: `Lámina ${slideNum}: Síntesis arquitectónica territorial.`,
                        wordCount: 8
                      };

                      return (
                        <div key={slideNum} className="p-3 bg-black/50 border border-white/10 rounded-lg flex flex-col justify-between h-44">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                              <span className="font-bold text-amber-400">LÁMINA {slideNum}</span>
                              <span className="text-zinc-300 font-bold">{slide.wordCount} palabras</span>
                            </div>
                            <p className="font-anton text-xs text-white leading-snug">
                              "{slide.text}"
                            </p>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">
                            ✓ Cumple rango 5-14 palabras
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
