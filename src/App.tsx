import React, { useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContentProvider, useContent } from './context/ContentContext';
import { AdvertisingProvider } from './context/AdvertisingContext';
import { CustomCursor } from './components/layout/CustomCursor';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/Home';
import { ProjectsCatalog, CatalogSectionType } from './pages/ProjectsCatalog';
import { ProjectDetail } from './pages/ProjectDetail';
import { CinematicTransition } from './components/common/CinematicTransition';
import { AcercaDeEA } from './pages/AcercaDeEA';
import { AdvertiserReport } from './pages/AdvertiserReport';
import { AdvertiserPortal } from './pages/AdvertiserPortal';
import { parseCurrentRoute, pushAppRoute, replaceAppRoute } from './utils/navigation';

gsap.registerPlugin(ScrollTrigger);

export const AppContent: React.FC = () => {
  const { projects, academia, territorios } = useContent();
  const initialRoute = parseCurrentRoute();

  const [advertiserToken, setAdvertiserToken] = useState<string | null>(initialRoute.advertiserToken || null);
  const [reportToken, setReportToken] = useState<string | null>(initialRoute.reportToken || null);
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'project-detail' | 'acerca'>(initialRoute.view);
  const [catalogSection, setCatalogSection] = useState<CatalogSectionType>(initialRoute.catalogSection || 'proyectos');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialRoute.projectId || 'atrium');
  const [targetTab, setTargetTab] = useState<'proyectos' | 'academia' | 'territorios' | 'acerca'>(
    initialRoute.targetTab || initialRoute.catalogSection || 'proyectos'
  );

  // Cinematic project transition state
  const [transitionState, setTransitionState] = useState<{
    isActive: boolean;
    projectId?: string;
    title?: string;
    section?: string;
  }>({ isActive: false });

  // Unified Route Synchronizer (Handles History API popstate & Hash changes)
  const currentViewRef = React.useRef(currentView);
  currentViewRef.current = currentView;
  const catalogSectionRef = React.useRef(catalogSection);
  catalogSectionRef.current = catalogSection;
  const selectedProjectIdRef = React.useRef(selectedProjectId);
  selectedProjectIdRef.current = selectedProjectId;

  const syncRoute = useCallback(() => {
    const route = parseCurrentRoute();

    if (route.advertiserToken) {
      setAdvertiserToken(route.advertiserToken);
      return;
    }
    if (route.reportToken) {
      setReportToken(route.reportToken);
      return;
    }

    const prevView = currentViewRef.current;
    const prevSection = catalogSectionRef.current;
    const prevProj = selectedProjectIdRef.current;

    if (route.view === 'project-detail' && route.projectId) {
      const isDifferent = prevView !== 'project-detail' || prevProj !== route.projectId;
      setSelectedProjectId(route.projectId);
      if (route.catalogSection) setCatalogSection(route.catalogSection);
      setCurrentView('project-detail');
      if (isDifferent) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    } else if (route.view === 'catalog' && route.catalogSection) {
      const isDifferent = prevView !== 'catalog' || prevSection !== route.catalogSection;
      setCatalogSection(route.catalogSection);
      setCurrentView('catalog');
      if (isDifferent) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    } else if (route.view === 'acerca') {
      const isDifferent = prevView !== 'acerca';
      setCurrentView('acerca');
      setTargetTab('acerca');
      if (isDifferent) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    } else {
      const isDifferent = prevView !== 'home';
      setCurrentView('home');
      if (isDifferent && window.location.hash !== '#destacados') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    }
  }, []);

  useEffect(() => {
    // If arriving with legacy hash, seamlessly upgrade URL to clean path without reload
    const hash = window.location.hash.toLowerCase();
    if (hash.startsWith('#proyecto-')) {
      const pid = hash.replace('#proyecto-', '');
      replaceAppRoute(`/proyectos/${pid}`);
    } else if (hash === '#proyectos' || hash === '#catalogo') {
      replaceAppRoute('/proyectos');
    } else if (hash === '#academia') {
      replaceAppRoute('/academia');
    } else if (hash === '#territorios' || hash === '#territorio') {
      replaceAppRoute('/territorios');
    } else if (hash === '#acerca-de-ea' || hash === '#acerca') {
      replaceAppRoute('/acerca-de-ea');
    }

    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, [syncRoute]);

  // Ensure scroll is at top and ScrollTrigger calculations are refreshed on every view change
  useEffect(() => {
    if (window.location.hash !== '#destacados') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
    return () => clearTimeout(timer);
  }, [currentView]);

  const handleNavigate = (section: string) => {
    if (section === 'proyectos' || section === 'academia' || section === 'territorios') {
      const sec = section as CatalogSectionType;
      pushAppRoute(`/${sec}`);
      setCatalogSection(sec);
      setCurrentView('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'home') {
      pushAppRoute('/');
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'acerca' || section === 'acerca-de-ea') {
      pushAppRoute('/acerca-de-ea');
      setCurrentView('acerca');
      setTargetTab('acerca');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else if (section === 'admin') {
      window.location.href = '/admin.html';
      return;
    } else {
      if (currentView !== 'home') {
        pushAppRoute('/');
        setCurrentView('home');
      }
    }
  };

  const handleSelectProject = (projectId: string) => {
    // Determine section and slug
    const inAcademia = academia.some((a: any) => a.id === projectId || a.slug === projectId);
    const inTerritorios = territorios.some((t: any) => t.id === projectId || t.slug === projectId);
    const sec = inAcademia ? 'academia' : inTerritorios ? 'territorios' : 'proyectos';

    const all = [...projects, ...academia, ...territorios];
    const found = all.find((p: any) => p.id === projectId || p.slug === projectId);
    const title = found?.title || 'PROYECTO';

    // Trigger theatrical cinematic transition
    setTransitionState({
      isActive: true,
      projectId,
      title,
      section: sec,
    });
  };

  const handleBackToCatalog = () => {
    pushAppRoute(`/${catalogSection}`);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  // If advertiser profile portal token is present in URL
  if (advertiserToken) {
    return <AdvertiserPortal token={advertiserToken} />;
  }

  // If single campaign report token is present in URL
  if (reportToken) {
    return <AdvertiserReport token={reportToken} />;
  }

  return (
    <div className="relative min-h-screen bg-white text-ea-black font-inter selection:bg-ea-black selection:text-white">
      {/* Custom interactive cursor */}
      <CustomCursor />

      {/* Cinematic theatrical entrance transition into project */}
      <CinematicTransition
        isActive={transitionState.isActive}
        projectTitle={transitionState.title}
        onTransitionMiddle={() => {
          if (transitionState.projectId) {
            setSelectedProjectId(transitionState.projectId);
            const all = [...projects, ...academia, ...territorios];
            const found: any = all.find((p: any) => p.id === transitionState.projectId || p.slug === transitionState.projectId);
            const slug = found?.slug || transitionState.projectId;
            const sec = transitionState.section || 'proyectos';
            pushAppRoute(`/${sec}/${slug}`);
            setCurrentView('project-detail');
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }
        }}
        onTransitionEnd={() => {
          setTransitionState({ isActive: false });
        }}
      />

      {/* Main navigation: persistent on Home; Catalog and ProjectDetail render their exact Figma header */}
      {currentView === 'home' && (
        <Navbar
          activeSection="home"
          currentPillar={targetTab}
          onNavigate={handleNavigate}
        />
      )}

      {/* Main view switcher */}
      {currentView === 'home' && (
        <HomePage
          onSelectProject={handleSelectProject}
          onNavigateToCatalog={() => handleNavigate('proyectos')}
          onNavigateToSection={(sec) => handleNavigate(sec)}
          initialTab={targetTab}
          onTabChange={(tab) => setTargetTab(tab)}
        />
      )}

      {currentView === 'catalog' && (
        <ProjectsCatalog
          initialSection={catalogSection}
          onSelectProject={handleSelectProject}
          onNavigate={handleNavigate}
          onSectionChange={(sec) => setCatalogSection(sec)}
        />
      )}

      {currentView === 'project-detail' && (
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={handleBackToCatalog}
          onSelectProject={handleSelectProject}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'acerca' && (
        <AcercaDeEA
          onNavigate={handleNavigate}
          onSelectProject={handleSelectProject}
        />
      )}

      {/* Editorial footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ContentProvider>
      <AdvertisingProvider>
        <AppContent />
      </AdvertisingProvider>
    </ContentProvider>
  );
};

export default App;
