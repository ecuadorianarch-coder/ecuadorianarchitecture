import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Eye,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  AlertTriangle,
  Building2,
  MapPin,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  List,
  ExternalLink,
  ChevronDown,
  Smartphone,
} from 'lucide-react';
import { EditorialArticle, EditorialType, PublicationStatus } from '../../types/editorial';
import { LandingPreviewModal } from './LandingPreviewModal';

interface EditorialDashboardProps {
  articles: EditorialArticle[];
  onEditArticle: (article: EditorialArticle) => void;
  onCreateNew: () => void;
  onDuplicate: (article: EditorialArticle) => void;
  onDelete: (article: EditorialArticle) => void;
  onStatusChange: (article: EditorialArticle, newStatus: PublicationStatus) => void;
  onOpenPreview: (article: EditorialArticle) => void;
  onSaveArticle?: (article: EditorialArticle) => void;
}

export const EditorialDashboard: React.FC<EditorialDashboardProps> = ({
  articles,
  onEditArticle,
  onCreateNew,
  onDuplicate,
  onDelete,
  onStatusChange,
  onOpenPreview,
  onSaveArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'year'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Landing Preview Modal state
  const [isLandingModalOpen, setIsLandingModalOpen] = useState(false);
  const [previewArticleId, setPreviewArticleId] = useState<string | undefined>(undefined);

  // Delete confirmation state
  const [articleToDelete, setArticleToDelete] = useState<EditorialArticle | null>(null);

  // Metrics computation
  const totalArticles = articles.length;
  const totalProjects = articles.filter((a) => a.type === 'proyectos').length;
  const totalTerritorios = articles.filter((a) => a.type === 'territorios').length;
  const totalAcademia = articles.filter((a) => a.type === 'academia').length;
  const totalLandingCount = articles.filter((a) => a.showOnLanding === true).length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const readyCount = articles.filter((a) => a.status === 'ready').length;

  // Toggle landing appearance helper
  const toggleLanding = (article: EditorialArticle) => {
    const updated = {
      ...article,
      showOnLanding: !article.showOnLanding,
      landingOrder: !article.showOnLanding ? (article.landingOrder || 1) : undefined,
    };
    if (onSaveArticle) {
      onSaveArticle(updated);
    } else {
      onStatusChange(updated, updated.status);
    }
  };

  // Filter & Search
  const filteredArticles = articles
    .filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        a.title.toLowerCase().includes(q) ||
        (a.studio && a.studio.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesType =
        selectedType === 'todos' ||
        (selectedType === 'landing' ? a.showOnLanding === true : a.type === selectedType);
      const matchesStatus = selectedStatus === 'todos' || a.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return (b.year || '').localeCompare(a.year || '');
      // default: updated / id
      const dateA = a.updatedAt || a.createdAt || '';
      const dateB = b.updatedAt || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

  const getStatusBadge = (status: PublicationStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
            <CheckCircle className="w-3 h-3" /> Publicado
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-mono uppercase tracking-wider">
            <Clock className="w-3 h-3" /> Listo para Publicar
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/20 text-white/50 text-[10px] font-mono uppercase tracking-wider">
            <Archive className="w-3 h-3" /> Archivado
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
            <Edit3 className="w-3 h-3" /> Borrador
          </span>
        );
    }
  };

  const getTypeIcon = (type: EditorialType) => {
    switch (type) {
      case 'proyectos':
        return <Building2 className="w-3.5 h-3.5 text-white/70" />;
      case 'territorios':
        return <MapPin className="w-3.5 h-3.5 text-white/70" />;
      case 'academia':
        return <GraduationCap className="w-3.5 h-3.5 text-white/70" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] text-white p-6 sm:p-8 space-y-8 font-inter">
      {/* Top Banner / Hero Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-[#1a1a1a] border border-white/10 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Total Artículos</span>
          <span className="font-anton text-2xl text-white mt-1">{totalArticles}</span>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Proyectos</span>
          <span className="font-anton text-2xl text-white mt-1">{totalProjects}</span>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Territorios</span>
          <span className="font-anton text-2xl text-white mt-1">{totalTerritorios}</span>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">Academia</span>
          <span className="font-anton text-2xl text-white mt-1">{totalAcademia}</span>
        </div>
        <div className="bg-[#1a1a1a] border border-emerald-500/20 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">Publicados</span>
          <span className="font-anton text-2xl text-emerald-400 mt-1">{publishedCount}</span>
        </div>
        <div className="bg-[#1a1a1a] border border-emerald-500/30 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">★ En Landing</span>
          <span className="font-anton text-2xl text-emerald-400 mt-1">{totalLandingCount}</span>
        </div>
        <div className="bg-[#1a1a1a] border border-amber-500/20 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-amber-300 tracking-wider">Borradores</span>
          <span className="font-anton text-2xl text-amber-300 mt-1">{draftCount}</span>
        </div>
        <div className="bg-[#1a1a1a] border border-sky-500/20 p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">Listos Publicar</span>
          <span className="font-anton text-2xl text-sky-400 mt-1">{readyCount}</span>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-anton text-2xl sm:text-3xl tracking-wider uppercase text-white">
            RESEÑAS &amp; CONTENIDO EDITORIAL
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Administra, crea y previsualiza reseñas en tiempo real con el editor visual de dos paneles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          <button
            onClick={() => {
              setPreviewArticleId(undefined);
              setIsLandingModalOpen(true);
            }}
            className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 px-4 py-2.5 font-anton text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>SIMULADOR PREVIEWS MÓVIL</span>
          </button>

          <button
            onClick={onCreateNew}
            className="bg-white text-black hover:bg-white/90 px-5 py-2.5 font-anton text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>NUEVA RESEÑA / ENTRADA</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#181818] border border-white/10 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, autor, estudio, ubicación..."
            className="w-full bg-[#222222] border border-white/15 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-white rounded-none"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Section Type Filter */}
          <div className="flex items-center gap-1 bg-black/40 p-1 border border-white/10">
            {['todos', 'proyectos', 'territorios', 'academia', 'landing'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 text-[10px] font-anton uppercase tracking-wider transition-colors ${
                  selectedType === type ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {type === 'landing' ? '★ EN LANDING' : type}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#222222] border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono uppercase"
          >
            <option value="todos">Todos los Estados</option>
            <option value="published">Publicados</option>
            <option value="ready">Listos para Publicar</option>
            <option value="draft">Borradores</option>
            <option value="archived">Archivados</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#222222] border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono uppercase"
          >
            <option value="updated">Más Recientes</option>
            <option value="title">Título A-Z</option>
            <option value="year">Año</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-white/10 bg-black/40 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
              title="Vista en Lista / Tabla"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ARTICLE LISTINGS */}
      {filteredArticles.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-white/10 p-8 space-y-4">
          <p className="font-anton text-lg uppercase text-white/50">
            No se encontraron artículos con los filtros aplicados.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('todos');
              setSelectedStatus('todos');
            }}
            className="text-xs font-mono text-white/70 hover:text-white underline underline-offset-4 uppercase"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-[#171717] border border-white/15 hover:border-white/40 transition-all flex flex-col justify-between group overflow-hidden"
            >
              {/* Card Thumbnail & Tags */}
              <div className="relative aspect-[16/10] bg-black overflow-hidden">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-white/20 text-[10px] font-anton uppercase tracking-wider text-white">
                    {getTypeIcon(article.type)}
                    <span>{article.type}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLanding(article);
                      }}
                      className={`px-2 py-0.5 text-[9.5px] font-anton uppercase tracking-wider border rounded-xs transition-colors cursor-pointer ${
                        article.showOnLanding
                          ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                          : 'bg-black/60 text-white/50 border-white/20 hover:text-white hover:border-white/40'
                      }`}
                      title={article.showOnLanding ? 'Activa en Landing. Haz clic para desactivar' : 'Haz clic para activar en la Landing'}
                    >
                      {article.showOnLanding ? `★ LANDING #${article.landingOrder || 1}` : '+ LANDING'}
                    </button>
                    <div>{getStatusBadge(article.status)}</div>
                  </div>
                </div>

                {/* Bottom Metadata */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-[10px] font-mono uppercase text-white/70 flex justify-between">
                  <span>{article.location || 'ECUADOR'}</span>
                  <span>{article.year || '2026'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1 truncate">
                    {article.studio || 'ESTUDIO'}
                  </div>
                  <h3 className="font-anton text-lg tracking-wide uppercase text-white leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="font-creato text-xs text-white/60 line-clamp-2 mt-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between gap-1">
                  <button
                    onClick={() => onEditArticle(article)}
                    className="flex-1 bg-white text-black hover:bg-white/90 py-1.5 px-2 text-[11px] font-anton tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>EDITAR</span>
                  </button>

                  <button
                    onClick={() => {
                      setPreviewArticleId(article.id);
                      setIsLandingModalOpen(true);
                    }}
                    className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30 transition-colors"
                    title="Simulador Móvil (Landing)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenPreview(article)}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 border border-white/15 transition-colors"
                    title="Previsualizar"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDuplicate(article)}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 border border-white/15 transition-colors"
                    title="Duplicar como Borrador"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setArticleToDelete(article)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                    title="Eliminar Entrada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#171717] border border-white/15 overflow-x-auto">
          <table className="w-full text-left text-xs font-inter border-collapse">
            <thead>
              <tr className="bg-[#222222] border-b border-white/10 text-[10px] font-mono uppercase text-white/50 tracking-wider">
                <th className="p-3">Miniatura</th>
                <th className="p-3">Título / Reseña</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Landing</th>
                <th className="p-3">Autor / Estudio</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Año</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      className="w-12 h-9 object-cover border border-white/20 bg-black"
                    />
                  </td>
                  <td className="p-3">
                    <span className="font-anton text-sm tracking-wide uppercase text-white block">
                      {article.title}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 block truncate max-w-xs">
                      {article.slug || article.id}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] uppercase text-white/70">
                      {article.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleLanding(article)}
                      className={`px-2 py-0.5 text-[9.5px] font-anton uppercase tracking-wider border rounded-xs transition-colors cursor-pointer ${
                        article.showOnLanding
                          ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                          : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                      }`}
                      title={article.showOnLanding ? 'Activo en Landing. Clic para desactivar' : 'Inactivo en Landing. Clic para activar'}
                    >
                      {article.showOnLanding ? `★ #${article.landingOrder || 1}` : 'NO'}
                    </button>
                  </td>
                  <td className="p-3 font-mono text-white/80">{article.studio || '—'}</td>
                  <td className="p-3 font-mono text-white/80">{article.location || '—'}</td>
                  <td className="p-3 font-mono text-white/80">{article.year || '—'}</td>
                  <td className="p-3">{getStatusBadge(article.status)}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onEditArticle(article)}
                        className="px-2.5 py-1 bg-white text-black text-[10px] font-anton uppercase tracking-wider hover:bg-white/90"
                      >
                        EDITAR
                      </button>
                      <button
                        onClick={() => {
                          setPreviewArticleId(article.id);
                          setIsLandingModalOpen(true);
                        }}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                        title="Simulador Móvil (Landing)"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenPreview(article)}
                        className="p-1 text-white/60 hover:text-white"
                        title="Previsualizar"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicate(article)}
                        className="p-1 text-white/60 hover:text-white"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setArticleToDelete(article)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#181818] border border-red-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-anton text-lg uppercase tracking-wider">
                CONFIRMAR ELIMINACIÓN
              </h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              ¿Estás seguro de que deseas eliminar la reseña{' '}
              <strong className="text-white font-medium">"{articleToDelete.title}"</strong>?
              Esta acción no se puede deshacer una vez guardados los cambios en disco.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 text-xs font-anton tracking-wider uppercase text-white/60 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(articleToDelete);
                  setArticleToDelete(null);
                }}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 font-anton text-xs uppercase tracking-widest"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Landing Previews & Mobile QA Modal */}
      <LandingPreviewModal
        isOpen={isLandingModalOpen}
        onClose={() => setIsLandingModalOpen(false)}
        articles={articles}
        initialTab={(selectedType === 'territorios' || selectedType === 'academia' ? selectedType : 'proyectos')}
        initialArticleId={previewArticleId}
        onSaveArticle={(updated) => {
          if (onSaveArticle) {
            onSaveArticle(updated);
          } else {
            onStatusChange(updated, updated.status);
          }
        }}
        onEditArticle={(art) => {
          setIsLandingModalOpen(false);
          onEditArticle(art);
        }}
      />
    </div>
  );
};
