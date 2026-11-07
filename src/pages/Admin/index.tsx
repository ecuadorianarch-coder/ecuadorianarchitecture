import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import {
  FileText,
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  Megaphone,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon,
  BookOpen,
  Users,
  MessageSquare,
  Briefcase,
  Activity,
} from 'lucide-react';
import { HomePage } from '../Home';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { AdvertisingManager } from './AdvertisingManager';
import { ProfilesManager } from './ProfilesManager';
import { AdminLogin } from './AdminLogin';
import { authService } from '../../services/authService';
import { EditorialDashboard } from './EditorialDashboard';
import { VisualEditorialEditor } from './VisualEditorialEditor';
import { EditorialOfficePanel } from './EditorialOfficePanel';
import { OpportunitiesOfficePanel } from './OpportunitiesOfficePanel';
import { VisualWorkspaceOffice } from './VisualWorkspaceOffice';
import { NewArticleModal } from './NewArticleModal';
import { MediaLibraryModal } from './MediaLibraryModal';
import { CommunityModerationManager } from './CommunityModerationManager';
import { AudienceManager } from './AudienceManager';
import { useCommunityModeration } from '../../services/communityService';
import { EditorialArticle } from '../../types/editorial';

export const AdminPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const currentUser = authService.getCurrentUser() || 'admin';

  const {
    siteConfig,
    projects,
    updateHero,
    updateSearch,
    updateFooter,
    updateProject,
    saveToDisk,
    resetToDefault,
    isSaving,
    saveMessage,
    saveEditorialArticle,
    deleteEditorialArticle,
    duplicateEditorialArticle,
    getAllEditorialArticles,
  } = useContent();
  const { pendingCount } = useCommunityModeration();

  // Active views and modals
  const [activeTab, setActiveTab] = useState<'visual-office' | 'editorial-office' | 'opportunities' | 'editorial' | 'advertising' | 'profiles' | 'community' | 'site-config' | 'audience'>('visual-office');
  const [editingArticle, setEditingArticle] = useState<EditorialArticle | null>(() => {
    try {
      const activeId = sessionStorage.getItem('ea_editing_article_id');
      if (activeId) {
        const draft = localStorage.getItem(`ea_draft_${activeId}`);
        if (draft) return JSON.parse(draft);
      }
    } catch {}
    return null;
  });
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isGlobalMediaOpen, setIsGlobalMediaOpen] = useState(false);

  // Sub-state for Site Config & Motion Inspector
  const [siteConfigSection, setSiteConfigSection] = useState<'hero' | 'search' | 'footer' | 'motion'>('hero');
  const [previewWidth, setPreviewWidth] = useState<'1440' | '1024' | '768' | '430' | '390'>('1440');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  // Keep session storage in sync so user is never kicked back to dashboard on refresh
  React.useEffect(() => {
    if (editingArticle?.id) {
      sessionStorage.setItem('ea_editing_article_id', editingArticle.id);
    } else {
      sessionStorage.removeItem('ea_editing_article_id');
    }
  }, [editingArticle?.id]);

  // Fallback recovery if page loaded before draft was hydrated
  React.useEffect(() => {
    if (!editingArticle) {
      const activeId = sessionStorage.getItem('ea_editing_article_id');
      if (activeId) {
        const found = getAllEditorialArticles().find((a) => a.id === activeId || a.slug === activeId);
        if (found) {
          setEditingArticle(found);
        }
      }
    }
  }, [projects]);

  // If not authenticated, display the secure brutalist login screen
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  // If an article is being edited, render the two-panel Elementor-style visual editor
  if (editingArticle) {
    return (
      <VisualEditorialEditor
        initialArticle={editingArticle}
        onSave={(updatedArticle, publishNow) => {
          saveEditorialArticle(updatedArticle, publishNow);
        }}
        onBack={() => {
          sessionStorage.removeItem('ea_editing_article_id');
          setEditingArticle(null);
        }}
      />
    );
  }

  const widthMap = {
    '1440': 'max-w-[1440px]',
    '1024': 'max-w-[1024px]',
    '768': 'max-w-[768px]',
    '430': 'max-w-[430px]',
    '390': 'max-w-[390px]',
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] text-white flex flex-col font-inter overflow-hidden">
      {/* Admin Top Header */}
      <header className="h-16 bg-[#1a1a1a] border-b border-white/10 px-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          <span className="font-anton text-xl tracking-wider text-white">EA ADMIN</span>
          <div className="hidden sm:flex items-center gap-2 border-l border-white/20 pl-4 text-xs font-mono text-white/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white/80">{currentUser}</span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded border border-white/10">
          <button
            onClick={() => setActiveTab('visual-office')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors relative ${
              activeTab === 'visual-office' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'text-amber-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> OFICINA VIRTUAL (VIVA)
          </button>
          <button
            onClick={() => setActiveTab('editorial-office')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors relative ${
              activeTab === 'editorial-office' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> CONSOLA EDITORIAL
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors relative ${
              activeTab === 'opportunities' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> OPORTUNIDADES &amp; ALIANZAS
          </button>
          <button
            onClick={() => setActiveTab('editorial')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors ${
              activeTab === 'editorial' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> RESEÑAS &amp; CMS
          </button>
          <button
            onClick={() => setActiveTab('advertising')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors ${
              activeTab === 'advertising' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" /> PUBLICIDAD
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors relative ${
              activeTab === 'audience' ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20' : 'text-emerald-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> AUDIENCIA &amp; LEADS
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors ${
              activeTab === 'profiles' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> PERFILES &amp; ARQUITECTOS
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors relative ${
              activeTab === 'community' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> COMUNIDAD &amp; MODERACIÓN
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-black font-mono text-[10px] font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('site-config')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-anton tracking-wider transition-colors ${
              activeTab === 'site-config' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> DISEÑO WEB &amp; HERO
          </button>
          <button
            onClick={() => setIsGlobalMediaOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider text-white/60 hover:text-white transition-colors border-l border-white/10"
            title="Abrir Biblioteca Multimedia"
          >
            <ImageIcon className="w-3.5 h-3.5" /> MEDIOS
          </button>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs text-emerald-400 font-medium animate-fadeIn hidden lg:inline">
              {saveMessage}
            </span>
          )}

          <button
            onClick={resetToDefault}
            title="Restablecer valores por defecto"
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={saveToDisk}
            disabled={isSaving}
            className="flex items-center gap-2 bg-white text-black hover:bg-white/90 px-4 py-2 text-xs font-anton tracking-wider uppercase transition-colors"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>

          <a
            href="http://localhost:4000/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-ea-crimson text-white hover:bg-ea-crimson/90 px-3 py-2 text-xs font-anton tracking-wider uppercase transition-all shadow-sm"
            title="Abrir Cuartel General Autónomo 2D en nueva pestaña (Puerto 4000)"
          >
            <Sparkles className="w-3.5 h-3.5" /> OFICINA VIRTUAL 2D
          </a>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 border border-white/30 px-3 py-2 text-xs font-anton tracking-wider hover:bg-white/10 transition-colors"
            title="Abrir vista pública del sitio en nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5" /> VER SITIO WEB
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-2 text-xs font-anton tracking-wider hover:bg-red-500/30 transition-colors"
            title="Cerrar sesión segura de editor"
          >
            <LogOut className="w-3.5 h-3.5" /> CERRAR SESIÓN
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 border border-white/30 px-3 py-2 text-xs font-anton tracking-wider hover:bg-white/10 transition-colors"
            >
              <Eye className="w-4 h-4" /> SALIR
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace based on active tab */}
      {activeTab === 'visual-office' && <VisualWorkspaceOffice />}
      {activeTab === 'editorial-office' && <EditorialOfficePanel />}
      {activeTab === 'opportunities' && <OpportunitiesOfficePanel />}

      {activeTab === 'editorial' && (
        <EditorialDashboard
          articles={getAllEditorialArticles()}
          onEditArticle={(art) => setEditingArticle(art)}
          onCreateNew={() => setIsNewModalOpen(true)}
          onDuplicate={(art) => duplicateEditorialArticle(art.id, art.type)}
          onDelete={(art) => deleteEditorialArticle(art.id, art.type)}
          onStatusChange={(art, newStatus) => saveEditorialArticle({ ...art, status: newStatus }, true)}
          onOpenPreview={(art) => setEditingArticle(art)}
          onSaveArticle={(art) => saveEditorialArticle(art, true)}
        />
      )}

      {activeTab === 'advertising' && <AdvertisingManager />}

      {activeTab === 'audience' && <AudienceManager />}

      {activeTab === 'profiles' && <ProfilesManager />}

      {activeTab === 'community' && <CommunityModerationManager />}

      {activeTab === 'site-config' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Inspector Panel for Global Web Settings */}
          <aside className="w-full md:w-[420px] lg:w-[480px] bg-[#1a1a1a] border-r border-white/10 flex flex-col flex-shrink-0 overflow-y-auto p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-anton text-lg tracking-wider uppercase text-white mb-1">
                  AJUSTES DE LA PORTADA PÚBLICA
                </h3>
                <p className="text-xs text-white/50">
                  Modifica titulares globales del Hero, Manifiesto y Footer.
                </p>
              </div>

              {/* Section Sub-selector */}
              <div className="grid grid-cols-4 gap-2 border-b border-white/10 pb-4">
                <button
                  onClick={() => setSiteConfigSection('hero')}
                  className={`py-2 text-xs font-anton tracking-wider uppercase border transition-colors ${
                    siteConfigSection === 'hero' ? 'border-white bg-white text-black' : 'border-white/20 text-white/60'
                  }`}
                >
                  HERO
                </button>
                <button
                  onClick={() => setSiteConfigSection('search')}
                  className={`py-2 text-xs font-anton tracking-wider uppercase border transition-colors ${
                    siteConfigSection === 'search' ? 'border-white bg-white text-black' : 'border-white/20 text-white/60'
                  }`}
                >
                  BUSCADOR
                </button>
                <button
                  onClick={() => setSiteConfigSection('footer')}
                  className={`py-2 text-xs font-anton tracking-wider uppercase border transition-colors ${
                    siteConfigSection === 'footer' ? 'border-white bg-white text-black' : 'border-white/20 text-white/60'
                  }`}
                >
                  FOOTER
                </button>
                <button
                  onClick={() => setSiteConfigSection('motion')}
                  className={`py-2 text-xs font-anton tracking-wider uppercase border transition-colors ${
                    siteConfigSection === 'motion' ? 'border-white bg-white text-black' : 'border-white/20 text-white/60'
                  }`}
                >
                  CINÉTICA
                </button>
              </div>

              {/* HERO SECTION CONTROLS */}
              {siteConfigSection === 'hero' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-white/70 block mb-1">
                      Pill Category Tag
                    </label>
                    <input
                      type="text"
                      value={siteConfig.hero.pillText}
                      onChange={(e) => updateHero({ pillText: e.target.value })}
                      className="w-full bg-black/50 border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-white/70 block mb-1">
                      Titular Línea 1 (Anton)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.hero.headlineLine1}
                      onChange={(e) => updateHero({ headlineLine1: e.target.value })}
                      className="w-full bg-black/50 border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-white/70 block mb-1">
                      Titular Línea 2 (Anton)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.hero.headlineLine2}
                      onChange={(e) => updateHero({ headlineLine2: e.target.value })}
                      className="w-full bg-black/50 border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-white/70 block mb-1">
                      Subtítulo Manifiesto
                    </label>
                    <textarea
                      value={siteConfig.hero.subtitle}
                      onChange={(e) => updateHero({ subtitle: e.target.value })}
                      rows={2}
                      className="w-full bg-black/50 border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* SEARCH SECTION CONTROLS */}
              {siteConfigSection === 'search' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-white/70 block mb-1">
                      Placeholder Buscador
                    </label>
                    <input
                      type="text"
                      value={siteConfig.search.placeholder}
                      onChange={(e) => updateSearch({ placeholder: e.target.value })}
                      className="w-full bg-black/50 border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* FOOTER SECTION CONTROLS */}
              {siteConfigSection === 'footer' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-white/70 block mb-1">
                      Lema Editorial
                    </label>
                    <input
                      type="text"
                      value={siteConfig.footer.tagline}
                      onChange={(e) => updateFooter({ tagline: e.target.value })}
                      className="w-full bg-black/50 border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* MOTION SECTION CONTROLS */}
              {siteConfigSection === 'motion' && (
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 border border-white/10 text-xs text-white/70">
                    Selecciona un proyecto para calibrar su preset de apertura cinematográfica:
                  </div>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-black border border-white/20 p-2 text-xs text-white font-mono uppercase"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.motion?.variant || 'vertical-slices'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </aside>

          {/* Right Live Canvas Viewport */}
          <main className="flex-1 bg-[#0d0d0d] flex flex-col overflow-hidden">
            <div className="h-10 bg-[#161616] border-b border-white/10 px-4 flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase">Ancho:</span>
                {(['1440', '1024', '768', '430', '390'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setPreviewWidth(w)}
                    className={`px-2 py-0.5 font-anton ${previewWidth === w ? 'bg-white text-black' : 'hover:text-white'}`}
                  >
                    {w}PX
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>SINCRONIZACIÓN EN VIVO</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start">
              <div
                className={`w-full ${widthMap[previewWidth]} bg-white shadow-2xl transition-all duration-300 min-h-screen text-ea-black relative overflow-x-hidden`}
              >
                <Navbar isPreview />
                <HomePage />
                <Footer />
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Global New Article Modal */}
      <NewArticleModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={(newArt) => {
          saveEditorialArticle(newArt, true);
          sessionStorage.setItem('ea_editing_article_id', newArt.id);
          setEditingArticle(newArt);
        }}
      />

      {/* Global Media Library Modal */}
      <MediaLibraryModal
        isOpen={isGlobalMediaOpen}
        onClose={() => setIsGlobalMediaOpen(false)}
        onSelectImage={() => {}}
      />
    </div>
  );
};

export default AdminPage;
