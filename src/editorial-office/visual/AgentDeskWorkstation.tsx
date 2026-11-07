import React from 'react';
import { AgentCharacterAvatar } from './AgentCharacterAvatar';
import { Clock, CheckCircle2, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

export interface DeskAgentData {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'disponible' | 'trabajando' | 'revisando' | 'esperando_aprobacion' | 'completado' | 'bloqueado' | 'error' | 'pausado';
  currentTask?: string;
  progress?: number;
  completedTasksCount?: number;
  lastActive?: string;
  isPaused?: boolean;
}

interface AgentDeskWorkstationProps {
  agent: DeskAgentData;
  isSelected?: boolean;
  onSelect: (agent: DeskAgentData) => void;
  accentColor?: string;
}

export const AgentDeskWorkstation: React.FC<AgentDeskWorkstationProps> = ({
  agent,
  isSelected = false,
  onSelect,
  accentColor = '#f59e0b'
}) => {
  const getStatusBadge = () => {
    switch (agent.status) {
      case 'trabajando':
        return { label: 'TRABAJANDO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50', dot: 'bg-amber-400 animate-pulse' };
      case 'revisando':
        return { label: 'REVISANDO', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50', dot: 'bg-cyan-400 animate-pulse' };
      case 'esperando_aprobacion':
        return { label: 'ESPERANDO APROBACIÓN', color: 'bg-purple-500/25 text-purple-200 border-purple-500/60 shadow-sm shadow-purple-500/20', dot: 'bg-purple-400 animate-ping' };
      case 'completado':
        return { label: 'COMPLETADO', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', dot: 'bg-emerald-400' };
      case 'bloqueado':
        return { label: 'BLOQUEADO', color: 'bg-rose-500/20 text-rose-300 border-rose-500/50', dot: 'bg-rose-400 animate-bounce' };
      case 'error':
        return { label: 'ERROR', color: 'bg-red-500/30 text-red-200 border-red-500/70', dot: 'bg-red-400' };
      case 'pausado':
        return { label: 'PAUSADO', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40', dot: 'bg-zinc-400' };
      default:
        return { label: 'DISPONIBLE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
    }
  };

  const statusBadge = getStatusBadge();
  const progressVal = agent.progress ?? 100;

  return (
    <div
      onClick={() => onSelect(agent)}
      className={`group relative flex flex-col justify-between p-3.5 rounded-lg border transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? 'bg-zinc-900/95 border-amber-400 ring-2 ring-amber-400/30 shadow-xl shadow-amber-500/10 -translate-y-0.5'
          : 'bg-[#121215]/90 hover:bg-zinc-900 border-white/10 hover:border-white/30 shadow-md hover:-translate-y-0.5'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)'
      }}
    >
      {/* Indicador de escritorio arquitectónico (mesa de trabajo superior) */}
      <div className="absolute top-0 inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header del puesto: Avatar + Identidad */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <AgentCharacterAvatar
            agentId={agent.id}
            size={56}
            status={agent.status}
            showAura={agent.status === 'esperando_aprobacion' || agent.status === 'trabajando'}
          />
          {agent.isPaused && (
            <span className="absolute -top-1 -left-1 px-1 py-0.2 bg-zinc-800 text-[9px] font-mono font-bold text-zinc-400 border border-zinc-600 rounded">
              PAUSA
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest truncate">
              {agent.id.replace('ea-', '').replace('opp-', 'OPP-')}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${statusBadge.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              <span className="truncate max-w-[85px]">{statusBadge.label}</span>
            </span>
          </div>

          <h4 className="font-anton text-sm tracking-wide text-white group-hover:text-amber-400 transition-colors truncate leading-tight">
            {agent.name}
          </h4>
          <p className="font-mono text-[11px] text-zinc-400 truncate mt-0.5">
            {agent.role}
          </p>
        </div>
      </div>

      {/* Tarea viva en curso */}
      <div className="mt-2.5 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
          <span className="flex items-center gap-1 truncate text-zinc-300">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate max-w-[150px]">
              {agent.currentTask ? agent.currentTask : 'En guardia editorial'}
            </span>
          </span>
          <span className="font-bold text-white shrink-0 ml-1">{progressVal}%</span>
        </div>

        {/* Barra de progreso visual */}
        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, Math.max(5, progressVal))}%`,
              backgroundColor:
                agent.status === 'esperando_aprobacion'
                  ? '#a855f7'
                  : agent.status === 'bloqueado'
                  ? '#f43f5e'
                  : agent.status === 'completado'
                  ? '#10b981'
                  : '#f59e0b'
            }}
          />
        </div>
      </div>

      {/* Footer del escritorio: Métricas rápidas + Botón entrar */}
      <div className="mt-2.5 flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>{agent.completedTasksCount || 12} tareas</span>
        </span>

        <span className="inline-flex items-center gap-0.5 text-zinc-300 group-hover:text-amber-400 transition-colors font-bold">
          <span>Abrir</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
