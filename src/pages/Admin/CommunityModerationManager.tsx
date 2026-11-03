import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Camera,
  Check,
  X,
  Trash2,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  Mail,
  User,
  Building2,
  RefreshCw,
  ThumbsUp,
  Image as ImageIcon,
  CheckCheck,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { useCommunityModeration } from '../../services/communityService';
import { useContent } from '../../context/ContentContext';
import { ModerationStatus } from '../../types/community';

export interface UnifiedModerationItem {
  id: string;
  type: 'visita' | 'argumento';
  projectId: string;
  projectTitle: string;
  authorName: string;
  authorEmail?: string;
  title?: string;
  content: string;
  photos?: string[];
  visitDate?: string;
  createdAt: string;
  status: ModerationStatus;
  likes?: number;
}

export const CommunityModerationManager: React.FC = () => {
  const {
    visits,
    arguments: criticalArgs,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalCount,
    isLoading,
    saveStatus,
    approveVisit,
    rejectVisit,
    deleteVisit,
    approveArgument,
    rejectArgument,
    deleteArgument,
    batchApprovePending,
  } = useCommunityModeration();

  const { projects, academia, territorios } = useContent();

  // Mapeo rápido de ID / slug a títulos canónicos de proyectos
  const projectTitlesMap = useMemo(() => {
    const map = new Map<string, string>();
    [...projects, ...academia, ...territorios].forEach((p: any) => {
      if (p.id) map.set(p.id, p.title);
      if (p.slug) map.set(p.slug, p.title);
    });
    return map;
  }, [projects, academia, territorios]);

  // Lista unificada de todas las notas para moderación
  const unifiedItems: UnifiedModerationItem[] = useMemo(() => {
    const visitItems: UnifiedModerationItem[] = visits.map((v) => ({
      id: v.id,
      type: 'visita',
      projectId: v.projectId,
      projectTitle: projectTitlesMap.get(v.projectId) || v.projectId.toUpperCase(),
      authorName: v.authorName,
      authorEmail: v.authorEmail,
      title: 'VISITA DE OBRA IN SITU',
      content: v.experience,
      photos: v.photos || [],
      visitDate: v.visitDate,
      createdAt: v.createdAt,
      status: v.status || 'pendiente',
      likes: v.likes || 0,
    }));

    const argItems: UnifiedModerationItem[] = criticalArgs.map((a) => ({
      id: a.id,
      type: 'argumento',
      projectId: a.projectId,
      projectTitle: projectTitlesMap.get(a.projectId) || a.projectId.toUpperCase(),
      authorName: a.authorName,
      authorEmail: a.authorEmail,
      title: a.argumentTitle || 'ARGUMENTO CRÍTICO',
      content: a.argument,
      photos: [],
      createdAt: a.createdAt,
      status: a.status || 'pendiente',
      likes: a.likes || 0,
    }));

    return [...visitItems, ...argItems].sort((a, b) => {
      // Priorizar pendientes primero
      if (a.status === 'pendiente' && b.status !== 'pendiente') return -1;
      if (a.status !== 'pendiente' && b.status === 'pendiente') return 1;
      // Luego por fecha más reciente
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [visits, criticalArgs, projectTitlesMap]);

  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'visita' | 'argumento'>('todos');
  const [projectFilter, setProjectFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de interfaz interactiva
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<UnifiedModerationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warn' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warn' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Acciones de moderación
  const handleApprove = async (item: UnifiedModerationItem) => {
    if (item.type === 'visita') {
      await approveVisit(item.id);
    } else {
      await approveArgument(item.id);
    }
    showToast(`✓ Aporte de "${item.authorName}" APROBADO y publicado en la web.`);
  };

  const handleReject = async (item: UnifiedModerationItem) => {
    if (item.type === 'visita') {
      await rejectVisit(item.id);
    } else {
      await rejectArgument(item.id);
    }
    showToast(`Aporte de "${item.authorName}" DENEGADO / ocultado de la web.`, 'warn');
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'visita') {
      await deleteVisit(itemToDelete.id);
    } else {
      await deleteArgument(itemToDelete.id);
    }
    showToast(`Aporte eliminado permanentemente.`, 'info');
    setItemToDelete(null);
  };

  const handleBatchApprove = async () => {
    if (window.confirm(`¿Aprobar todos los ${pendingCount} comentarios y visitas pendientes de una sola vez?`)) {
      await batchApprovePending();
      showToast(`✓ Se han aprobado todos los aportes pendientes.`);
    }
  };

  // Filtrado reactivo de notas
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      // Filtro de estado
      if (statusFilter !== 'todos' && item.status !== statusFilter) return false;

      // Filtro de tipo
      if (typeFilter !== 'todos' && item.type !== typeFilter) return false;

      // Filtro de proyecto
      if (projectFilter !== 'todos' && item.projectId !== projectFilter) return false;

      // Búsqueda libre
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAuthor = item.authorName.toLowerCase().includes(q);
        const matchesEmail = item.authorEmail ? item.authorEmail.toLowerCase().includes(q) : false;
        const matchesTitle = item.title ? item.title.toLowerCase().includes(q) : false;
        const matchesContent = item.content.toLowerCase().includes(q);
        const matchesProject = item.projectTitle.toLowerCase().includes(q) || item.projectId.toLowerCase().includes(q);
        if (!matchesAuthor && !matchesEmail && !matchesTitle && !matchesContent && !matchesProject) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedItems, statusFilter, typeFilter, projectFilter, searchQuery]);

  // Lista de proyectos disponibles para el dropdown
  const uniqueProjectIds = useMemo(() => {
    const set = new Set<string>();
    unifiedItems.forEach((item) => set.add(item.projectId));
    return Array.from(set);
  }, [unifiedItems]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Sin fecha';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).toUpperCase();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121212] text-white overflow-hidden select-text">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded border font-mono text-xs flex items-center gap-2.5 shadow-2xl transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
              : toastMessage.type === 'warn'
              ? 'bg-amber-950 border-amber-500 text-amber-200'
              : 'bg-neutral-900 border-neutral-600 text-neutral-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Superior y Tarjetas de Estadísticas */}
      <div className="p-6 bg-[#181818] border-b border-white/10 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded">
                <MessageSquare className="w-4 h-4" />
              </span>
              <h2 className="font-anton text-2xl uppercase tracking-wider text-white">
                MODERACIÓN DE COMENTARIOS &amp; NOTAS DE LA COMUNIDAD
              </h2>
            </div>
            <p className="text-xs text-white/55 mt-1 font-creato">
              Bandeja editorial privada para aprobar o denegar aportes (visitas de obra y debates críticos) antes de su publicación en la web.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            {pendingCount > 0 && (
              <button
                type="button"
                id="btn-batch-approve-all"
                onClick={handleBatchApprove}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 font-anton text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>APROBAR TODOS LOS PENDIENTES ({pendingCount})</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-2 bg-black/40 border border-white/10 rounded font-mono text-[11px] text-white/60">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading || saveStatus === 'saving' ? 'animate-spin text-amber-400' : ''}`} />
              <span>{saveStatus === 'saving' ? 'GUARDANDO...' : saveStatus === 'saved' ? '✓ SINCRONIZADO' : 'EN TIEMPO REAL'}</span>
            </div>
          </div>
        </div>

        {/* 4 Cards de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#202020] border border-white/10 p-3.5 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
                TOTAL APORTES
              </span>
              <span className="font-anton text-2xl text-white mt-0.5 block">{totalCount}</span>
            </div>
            <span className="p-2 bg-white/5 rounded text-white/60">
              <MessageSquare className="w-5 h-5" />
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('pendiente')}
            className={`border p-3.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
              statusFilter === 'pendiente'
                ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-[#202020] border-white/10 hover:border-amber-500/50'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  PENDIENTES
                </span>
                {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <span className="font-anton text-2xl text-amber-300 mt-0.5 block">{pendingCount}</span>
            </div>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded">
              <Clock className="w-5 h-5" />
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('aprobado')}
            className={`border p-3.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
              statusFilter === 'aprobado'
                ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-[#202020] border-white/10 hover:border-emerald-500/50'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                APROBADOS EN LA WEB
              </span>
              <span className="font-anton text-2xl text-emerald-300 mt-0.5 block">{approvedCount}</span>
            </div>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('rechazado')}
            className={`border p-3.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
              statusFilter === 'rechazado'
                ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-[#202020] border-white/10 hover:border-rose-500/50'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                DENEGADOS / OCULTOS
              </span>
              <span className="font-anton text-2xl text-rose-300 mt-0.5 block">{rejectedCount}</span>
            </div>
            <span className="p-2 bg-rose-500/10 text-rose-400 rounded">
              <Ban className="w-5 h-5" />
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Selección */}
      <div className="p-4 bg-[#1e1e1e] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Pestañas de Estado */}
          <div className="flex items-center bg-black/50 p-1 border border-white/15 rounded">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 font-anton text-xs uppercase tracking-wider transition-colors rounded-xs ${
                statusFilter === 'todos' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              TODOS ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('pendiente')}
              className={`px-3 py-1.5 font-anton text-xs uppercase tracking-wider transition-colors rounded-xs flex items-center gap-1.5 ${
                statusFilter === 'pendiente' ? 'bg-amber-400 text-black font-bold' : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <span>PENDIENTES</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[10px] font-mono font-bold">
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('aprobado')}
              className={`px-3 py-1.5 font-anton text-xs uppercase tracking-wider transition-colors rounded-xs ${
                statusFilter === 'aprobado' ? 'bg-emerald-400 text-black font-bold' : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              APROBADOS ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('rechazado')}
              className={`px-3 py-1.5 font-anton text-xs uppercase tracking-wider transition-colors rounded-xs ${
                statusFilter === 'rechazado' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400/80 hover:text-rose-300'
              }`}
            >
              DENEGADOS ({rejectedCount})
            </button>
          </div>

          {/* Filtro por tipo: Visitas vs Conversaciones */}
          <div className="flex items-center bg-black/50 p-1 border border-white/15 rounded text-xs font-mono">
            <button
              onClick={() => setTypeFilter('todos')}
              className={`px-2.5 py-1 transition-colors ${typeFilter === 'todos' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'}`}
            >
              TODO TIPO
            </button>
            <button
              onClick={() => setTypeFilter('visita')}
              className={`px-2.5 py-1 flex items-center gap-1 transition-colors ${typeFilter === 'visita' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'}`}
            >
              <Camera className="w-3 h-3" />
              <span>VISITAS</span>
            </button>
            <button
              onClick={() => setTypeFilter('argumento')}
              className={`px-2.5 py-1 flex items-center gap-1 transition-colors ${typeFilter === 'argumento' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'}`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>CRÍTICAS</span>
            </button>
          </div>

          {/* Selector de Proyecto */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-black/60 border border-white/20 text-white text-xs font-mono px-3 py-1.5 rounded focus:outline-none focus:border-white/50 max-w-[220px]"
          >
            <option value="todos">Todos los proyectos ({uniqueProjectIds.length})</option>
            {uniqueProjectIds.map((pId) => (
              <option key={pId} value={pId}>
                {projectTitlesMap.get(pId) || pId}
              </option>
            ))}
          </select>
        </div>

        {/* Buscador libre */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar autor, correo, texto..."
            className="w-full bg-black/60 border border-white/20 pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-white/30 rounded focus:outline-none focus:border-white/50 font-creato"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Aportes para Moderación */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#181818] border border-white/10 rounded-sm">
            <div className="p-4 bg-white/5 rounded-full text-white/30 mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-anton text-lg uppercase tracking-wider text-white">
              NO SE ENCONTRARON APORTES EN ESTE FILTRO
            </h3>
            <p className="text-xs text-white/50 mt-1 max-w-md font-creato">
              {statusFilter === 'pendiente'
                ? '¡Excelente! No hay comentarios ni visitas de obra pendientes de moderación en este momento.'
                : 'Intenta cambiar los filtros de estado o el término de búsqueda.'}
            </p>
            {statusFilter !== 'todos' && (
              <button
                onClick={() => setStatusFilter('todos')}
                className="mt-4 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase rounded transition-colors"
              >
                Ver todos los aportes
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.id}
              className={`border p-5 rounded-xs transition-all ${
                item.status === 'pendiente'
                  ? 'bg-[#1b1913] border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                  : item.status === 'aprobado'
                  ? 'bg-[#181a18] border-white/15 hover:border-emerald-500/40'
                  : 'bg-[#1a1717] border-rose-900/40 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Encabezado del Dossier de Moderación */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Badge de Tipo */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-anton uppercase tracking-wider rounded ${
                      item.type === 'visita'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    {item.type === 'visita' ? (
                      <>
                        <Camera className="w-3 h-3" />
                        <span>VISITA DE OBRA IN SITU</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3 h-3" />
                        <span>CONVERSACIÓN CRÍTICA</span>
                      </>
                    )}
                  </span>

                  {/* Badge de Estado */}
                  {item.status === 'pendiente' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded font-mono text-[10.5px] font-bold">
                      <Clock className="w-3 h-3 animate-pulse" />
                      <span>PENDIENTE DE APROBACIÓN</span>
                    </span>
                  )}
                  {item.status === 'aprobado' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded font-mono text-[10.5px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PUBLICADO EN LA WEB</span>
                    </span>
                  )}
                  {item.status === 'rechazado' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded font-mono text-[10.5px] font-bold">
                      <XCircle className="w-3 h-3" />
                      <span>DENEGADO / OCULTO</span>
                    </span>
                  )}

                  {/* Indicador de Likes */}
                  {item.likes !== undefined && item.likes > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[10px] text-white/60">
                      <ThumbsUp className="w-2.5 h-2.5" />
                      <span>{item.likes}</span>
                    </span>
                  )}
                </div>

                {/* Fecha de Envío */}
                <div className="flex items-center gap-2 font-mono text-[11px] text-white/50">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>RECIBIDO: {formatDate(item.createdAt)}</span>
                </div>
              </div>

              {/* Fila de Datos del Autor y Proyecto Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3 border-b border-white/10 text-xs">
                {/* Autor y Correo */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-white/40" />
                    <span className="font-mono text-[10px] text-white/50 uppercase">AUTOR / FIRMA:</span>
                    <strong className="font-anton text-sm tracking-wide text-white">{item.authorName}</strong>
                  </div>
                  {item.authorEmail && (
                    <div className="flex items-center gap-2 text-white/70 font-mono text-xs pl-5.5">
                      <Mail className="w-3 h-3 text-amber-400" />
                      <a href={`mailto:${item.authorEmail}`} className="hover:underline text-amber-300">
                        {item.authorEmail}
                      </a>
                      <span className="text-[10px] text-white/40">(Verificado por el usuario)</span>
                    </div>
                  )}
                </div>

                {/* Proyecto Destino */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-white/40" />
                    <span className="font-mono text-[10px] text-white/50 uppercase">PROYECTO:</span>
                    <span className="font-anton text-sm tracking-wide text-white/90">{item.projectTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-white/50 pl-5.5">
                    <span>ID: {item.projectId}</span>
                    <span>•</span>
                    <a
                      href={`/proyectos/${item.projectId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/70 hover:text-white underline"
                    >
                      <span>Ver ficha pública</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    {item.visitDate && (
                      <>
                        <span>•</span>
                        <span>Visita: {item.visitDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido del Aporte */}
              <div className="py-3.5 space-y-2">
                {item.title && item.type === 'argumento' && (
                  <h4 className="font-anton text-base uppercase tracking-wider text-white">
                    {item.title}
                  </h4>
                )}

                <div className="p-3.5 bg-black/40 border border-white/10 rounded font-creato text-xs sm:text-[13px] text-white/85 leading-relaxed whitespace-pre-line text-justify">
                  {item.content}
                </div>

                {/* Fotografías adjuntas in situ */}
                {item.photos && item.photos.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/50 uppercase mb-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{item.photos.length} FOTOGRAFÍA(S) IN SITU ADJUNTAS (CLIC PARA AMPLIAR):</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {item.photos.map((url, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => setSelectedPhoto(url)}
                          className="w-24 h-24 border border-white/20 bg-neutral-900 overflow-hidden rounded relative cursor-zoom-in group"
                        >
                          <img
                            src={url}
                            alt={`Foto in situ ${pIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-mono text-[9px] text-white">
                            AMPLIAR
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Barra de Acciones de Moderación */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Botón Aprobar */}
                  {item.status !== 'aprobado' ? (
                    <button
                      type="button"
                      id={`btn-approve-${item.id}`}
                      onClick={() => handleApprove(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-anton text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>APROBAR &amp; PUBLICAR</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Actualmente publicado en el expediente</span>
                    </div>
                  )}

                  {/* Botón Denegar / Rechazar */}
                  {item.status !== 'rechazado' && (
                    <button
                      type="button"
                      id={`btn-reject-${item.id}`}
                      onClick={() => handleReject(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/50 font-anton text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>DENEGAR / OCULTAR</span>
                    </button>
                  )}
                </div>

                {/* Botón Eliminar Permanente */}
                <button
                  type="button"
                  id={`btn-delete-${item.id}`}
                  onClick={() => setItemToDelete(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30 font-mono text-[11px] uppercase transition-colors cursor-pointer rounded-xs"
                  title="Eliminar este comentario permanentemente"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ELIMINAR</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal Lightbox para Ver Fotografías In Situ */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white p-1 border border-white/20 hover:border-white rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Fotografía in situ ampliada"
              className="max-w-full max-h-[80vh] object-contain border border-white/30 rounded shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border-2 border-rose-500/60 p-6 rounded max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-anton text-lg uppercase tracking-wider text-white">
                ¿ELIMINAR ESTE APORTE PERMANENTEMENTE?
              </h3>
            </div>
            <p className="font-creato text-xs text-white/75 leading-relaxed">
              Esta acción eliminará de forma irreversible el aporte de{' '}
              <strong className="text-white">"{itemToDelete.authorName}"</strong> del expediente{' '}
              <strong className="text-white">{itemToDelete.projectTitle}</strong>.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-white/20 text-xs font-mono uppercase text-white/80 hover:bg-white/10 rounded cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-anton uppercase tracking-wider rounded cursor-pointer"
              >
                Eliminar Aporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
