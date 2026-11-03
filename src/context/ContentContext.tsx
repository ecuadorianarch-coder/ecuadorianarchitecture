import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import defaultSiteConfig from '../data/siteConfig.json';
import defaultProjects from '../data/projects.json';
import defaultArticles from '../data/articles.json';
import defaultAcademia from '../data/academia.json';
import defaultTerritorios from '../data/territorios.json';
import defaultAuthors from '../data/authors.json';
import defaultPhotographers from '../data/photographers.json';
import defaultMasterBuilders from '../data/masterBuilders.json';
import { AuthorProfileData } from '../data/authors';
import { PhotographerProfileData } from '../data/photographers';
import { MasterBuilderProfile } from '../data/masterBuilders';
import { EditorialArticle, EditorialType } from '../types/editorial';

interface ContentContextType {
  siteConfig: typeof defaultSiteConfig;
  projects: typeof defaultProjects;
  articles: typeof defaultArticles;
  academia: typeof defaultAcademia;
  territorios: typeof defaultTerritorios;
  authors: AuthorProfileData[];
  photographers: PhotographerProfileData[];
  masterBuilders: MasterBuilderProfile[];
  updateHero: (data: Partial<typeof defaultSiteConfig.hero>) => void;
  updateSearch: (data: Partial<typeof defaultSiteConfig.search>) => void;
  updatePinnedDestacados: (data: Partial<typeof defaultSiteConfig.pinnedDestacados>) => void;
  updateFooter: (data: Partial<typeof defaultSiteConfig.footer>) => void;
  updateProject: (id: string, updatedFields: Partial<(typeof defaultProjects)[0]>) => void;
  addProject: (project: (typeof defaultProjects)[0]) => void;
  deleteProject: (id: string) => void;
  updateArticle: (id: string, updatedFields: Partial<(typeof defaultArticles)[0]>) => void;
  addArticle: (article: (typeof defaultArticles)[0]) => void;
  deleteArticle: (id: string) => void;
  updateAcademia: (id: string, updatedFields: Partial<(typeof defaultAcademia)[0]>) => void;
  addAcademia: (item: (typeof defaultAcademia)[0]) => void;
  deleteAcademia: (id: string) => void;
  updateTerritorio: (id: string, updatedFields: Partial<(typeof defaultTerritorios)[0]>) => void;
  addTerritorio: (item: (typeof defaultTerritorios)[0]) => void;
  deleteTerritorio: (id: string) => void;
  updateAuthorProfile: (id: string, updatedFields: Partial<AuthorProfileData>) => void;
  createAuthorProfile: (profile: AuthorProfileData) => void;
  deleteAuthorProfile: (id: string) => void;
  updatePhotographerProfile: (id: string, updatedFields: Partial<PhotographerProfileData>) => void;
  createPhotographerProfile: (profile: PhotographerProfileData) => void;
  deletePhotographerProfile: (id: string) => void;
  updateMasterBuilderProfile: (id: string, updatedFields: Partial<MasterBuilderProfile>) => void;
  createMasterBuilderProfile: (profile: MasterBuilderProfile) => void;
  deleteMasterBuilderProfile: (id: string) => void;
  saveEditorialArticle: (article: EditorialArticle, persistNow?: boolean) => void;
  deleteEditorialArticle: (id: string, type: EditorialType) => void;
  duplicateEditorialArticle: (id: string, type: EditorialType) => EditorialArticle | null;
  getAllEditorialArticles: () => EditorialArticle[];
  saveToDisk: (overrides?: {
    projects?: any[];
    siteConfig?: any;
    articles?: any[];
    academia?: any[];
    territorios?: any[];
    authors?: AuthorProfileData[];
    photographers?: PhotographerProfileData[];
    masterBuilders?: MasterBuilderProfile[];
  }) => Promise<boolean>;
  resetToDefault: () => void;
  isSaving: boolean;
  saveMessage: string | null;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Invalidation of stale demo content from previous versions in client-side localStorage
  if (typeof window !== 'undefined') {
    const CURRENT_EDITORIAL_VERSION = '2026-11-03-editorial-clean-v3';
    try {
      if (localStorage.getItem('ea_content_version') !== CURRENT_EDITORIAL_VERSION) {
        localStorage.removeItem('ea_content_projects');
        localStorage.removeItem('ea_content_articles');
        localStorage.removeItem('ea_content_academia');
        localStorage.removeItem('ea_content_territorios');
        localStorage.setItem('ea_content_version', CURRENT_EDITORIAL_VERSION);
      }
    } catch {}
  }

  const [siteConfig, setSiteConfig] = useState(defaultSiteConfig);
  const [projects, setProjects] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('ea_content_projects');
      return cached ? JSON.parse(cached) : defaultProjects;
    } catch {
      return defaultProjects;
    }
  });
  const [articles, setArticles] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('ea_content_articles');
      return cached ? JSON.parse(cached) : defaultArticles;
    } catch {
      return defaultArticles;
    }
  });
  const [academia, setAcademia] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('ea_content_academia');
      return cached ? JSON.parse(cached) : defaultAcademia;
    } catch {
      return defaultAcademia;
    }
  });
  const [territorios, setTerritorios] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('ea_content_territorios');
      return cached ? JSON.parse(cached) : defaultTerritorios;
    } catch {
      return defaultTerritorios;
    }
  });
  const [authors, setAuthors] = useState<AuthorProfileData[]>(() => {
    try {
      const cached = localStorage.getItem('ea_content_authors');
      return cached ? JSON.parse(cached) : defaultAuthors;
    } catch {
      return defaultAuthors as AuthorProfileData[];
    }
  });
  const [photographers, setPhotographers] = useState<PhotographerProfileData[]>(() => {
    try {
      const cached = localStorage.getItem('ea_content_photographers');
      return cached ? JSON.parse(cached) : defaultPhotographers;
    } catch {
      return defaultPhotographers as PhotographerProfileData[];
    }
  });
  const [masterBuilders, setMasterBuilders] = useState<MasterBuilderProfile[]>(() => {
    try {
      const cached = localStorage.getItem('ea_content_master_builders');
      return cached ? JSON.parse(cached) : defaultMasterBuilders;
    } catch {
      return defaultMasterBuilders as MasterBuilderProfile[];
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Synchronous refs to prevent stale closure bugs in fast save operations
  const siteConfigRef = useRef(siteConfig);
  const projectsRef = useRef(projects);
  const articlesRef = useRef(articles);
  const academiaRef = useRef(academia);
  const territoriosRef = useRef(territorios);
  const authorsRef = useRef(authors);
  const photographersRef = useRef(photographers);
  const masterBuildersRef = useRef(masterBuilders);

  useEffect(() => { siteConfigRef.current = siteConfig; }, [siteConfig]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { articlesRef.current = articles; }, [articles]);
  useEffect(() => { academiaRef.current = academia; }, [academia]);
  useEffect(() => { territoriosRef.current = territorios; }, [territorios]);
  useEffect(() => { authorsRef.current = authors; }, [authors]);
  useEffect(() => { photographersRef.current = photographers; }, [photographers]);
  useEffect(() => { masterBuildersRef.current = masterBuilders; }, [masterBuilders]);

  // Sync to local cache on changes for fail-safe persistence
  useEffect(() => {
    try {
      localStorage.setItem('ea_content_projects', JSON.stringify(projects));
      localStorage.setItem('ea_content_academia', JSON.stringify(academia));
      localStorage.setItem('ea_content_territorios', JSON.stringify(territorios));
      localStorage.setItem('ea_content_articles', JSON.stringify(articles));
      localStorage.setItem('ea_content_authors', JSON.stringify(authors));
      localStorage.setItem('ea_content_photographers', JSON.stringify(photographers));
    } catch (e) {
      console.warn('Storage quota warning', e);
    }
  }, [projects, academia, territorios, articles, authors, photographers]);

  // Load latest on mount from API or fallback
  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          siteConfigRef.current = data;
          setSiteConfig(data);
        }
      })
      .catch(() => {});

    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          projectsRef.current = data;
          setProjects(data);
        }
      })
      .catch(() => {});

    fetch('/api/articles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          articlesRef.current = data;
          setArticles(data);
        }
      })
      .catch(() => {});

    fetch('/api/academia')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          academiaRef.current = data;
          setAcademia(data);
        }
      })
      .catch(() => {});

    fetch('/api/territorios')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          territoriosRef.current = data;
          setTerritorios(data);
        }
      })
      .catch(() => {});

    fetch('/api/authors')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          authorsRef.current = data;
          setAuthors(data);
        }
      })
      .catch(() => {});

    fetch('/api/photographers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          photographersRef.current = data;
          setPhotographers(data);
        }
      })
      .catch(() => {});
  }, []);

  // Real-time synchronization across browser tabs (e.g. /admin vs main portal)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'ea_content_projects') {
          const parsed = JSON.parse(e.newValue);
          projectsRef.current = parsed;
          setProjects(parsed);
        } else if (e.key === 'ea_content_academia') {
          const parsed = JSON.parse(e.newValue);
          academiaRef.current = parsed;
          setAcademia(parsed);
        } else if (e.key === 'ea_content_territorios') {
          const parsed = JSON.parse(e.newValue);
          territoriosRef.current = parsed;
          setTerritorios(parsed);
        } else if (e.key === 'ea_content_articles') {
          const parsed = JSON.parse(e.newValue);
          articlesRef.current = parsed;
          setArticles(parsed);
        } else if (e.key === 'ea_content_authors') {
          const parsed = JSON.parse(e.newValue);
          authorsRef.current = parsed;
          setAuthors(parsed);
        } else if (e.key === 'ea_content_photographers') {
          const parsed = JSON.parse(e.newValue);
          photographersRef.current = parsed;
          setPhotographers(parsed);
        }
      } catch (err) {
        console.warn('Cross-tab sync error:', err);
      }
    };

    const handleWindowFocus = () => {
      // Re-fetch projects if modified externally
      fetch('/api/projects')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data)) {
            projectsRef.current = data;
            setProjects(data);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const updateHero = (data: Partial<typeof defaultSiteConfig.hero>) => {
    setSiteConfig((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...data },
    }));
  };

  const updateSearch = (data: Partial<typeof defaultSiteConfig.search>) => {
    setSiteConfig((prev) => ({
      ...prev,
      search: { ...prev.search, ...data },
    }));
  };

  const updatePinnedDestacados = (data: Partial<typeof defaultSiteConfig.pinnedDestacados>) => {
    setSiteConfig((prev) => ({
      ...prev,
      pinnedDestacados: { ...prev.pinnedDestacados, ...data },
    }));
  };

  const updateFooter = (data: Partial<typeof defaultSiteConfig.footer>) => {
    setSiteConfig((prev) => ({
      ...prev,
      footer: { ...prev.footer, ...data },
    }));
  };

  // Projects
  const updateProject = (id: string, updatedFields: Partial<(typeof defaultProjects)[0]>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const addProject = (project: (typeof defaultProjects)[0]) => {
    setProjects((prev) => [project, ...prev.filter((p) => p.id !== project.id)]);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Articles
  const updateArticle = (id: string, updatedFields: Partial<(typeof defaultArticles)[0]>) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
  };

  const addArticle = (article: (typeof defaultArticles)[0]) => {
    setArticles((prev) => [article, ...prev.filter((a) => a.id !== article.id)]);
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Academia
  const updateAcademia = (id: string, updatedFields: any) => {
    setAcademia((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const addAcademia = (item: any) => {
    setAcademia((prev) => [item, ...prev.filter((a) => a.id !== item.id)]);
  };

  const deleteAcademia = (id: string) => {
    setAcademia((prev) => prev.filter((a) => a.id !== id));
  };

  // Territorios
  const updateTerritorio = (id: string, updatedFields: any) => {
    setTerritorios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const addTerritorio = (item: any) => {
    setTerritorios((prev) => [item, ...prev.filter((t) => t.id !== item.id)]);
  };

  const deleteTerritorio = (id: string) => {
    setTerritorios((prev) => prev.filter((t) => t.id !== id));
  };

  // Authors / Architects
  const updateAuthorProfile = (id: string, updatedFields: Partial<AuthorProfileData>) => {
    setAuthors((prev) => {
      const next = prev.map((a) => (a.id === id || a.slug === id ? { ...a, ...updatedFields } : a));
      authorsRef.current = next;
      try {
        localStorage.setItem('ea_content_authors', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const createAuthorProfile = (profile: AuthorProfileData) => {
    setAuthors((prev) => {
      const filtered = prev.filter((a) => a.id !== profile.id && a.slug !== profile.slug);
      const next = [profile, ...filtered];
      authorsRef.current = next;
      try {
        localStorage.setItem('ea_content_authors', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const deleteAuthorProfile = (id: string) => {
    setAuthors((prev) => {
      const next = prev.filter((a) => a.id !== id && a.slug !== id);
      authorsRef.current = next;
      try {
        localStorage.setItem('ea_content_authors', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Photographers / Collaborators
  const updatePhotographerProfile = (id: string, updatedFields: Partial<PhotographerProfileData>) => {
    setPhotographers((prev) => {
      const next = prev.map((p) => (p.id === id || p.slug === id ? { ...p, ...updatedFields } : p));
      photographersRef.current = next;
      try {
        localStorage.setItem('ea_content_photographers', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const createPhotographerProfile = (profile: PhotographerProfileData) => {
    setPhotographers((prev) => {
      const filtered = prev.filter((p) => p.id !== profile.id && p.slug !== profile.slug);
      const next = [profile, ...filtered];
      photographersRef.current = next;
      try {
        localStorage.setItem('ea_content_photographers', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const deletePhotographerProfile = (id: string) => {
    setPhotographers((prev) => {
      const next = prev.filter((p) => p.id !== id && p.slug !== id);
      photographersRef.current = next;
      try {
        localStorage.setItem('ea_content_photographers', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Master Builders / Maestros Mayores
  const updateMasterBuilderProfile = (id: string, updatedFields: Partial<MasterBuilderProfile>) => {
    setMasterBuilders((prev) => {
      const next = prev.map((m) => (m.id === id || m.slug === id ? { ...m, ...updatedFields } : m));
      masterBuildersRef.current = next;
      try {
        localStorage.setItem('ea_content_master_builders', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const createMasterBuilderProfile = (profile: MasterBuilderProfile) => {
    setMasterBuilders((prev) => {
      const filtered = prev.filter((m) => m.id !== profile.id && m.slug !== profile.slug);
      const next = [profile, ...filtered];
      masterBuildersRef.current = next;
      try {
        localStorage.setItem('ea_content_master_builders', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const deleteMasterBuilderProfile = (id: string) => {
    setMasterBuilders((prev) => {
      const next = prev.filter((m) => m.id !== id && m.slug !== id);
      masterBuildersRef.current = next;
      try {
        localStorage.setItem('ea_content_master_builders', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Unified polymorphic save
  const saveEditorialArticle = (article: EditorialArticle, persistNow = false) => {
    const cleanItem = {
      ...article,
      updatedAt: new Date().toISOString(),
    };

    if (article.type === 'proyectos') {
      const exists = projectsRef.current.some((p) => p.id === cleanItem.id);
      const nextProjects = exists
        ? projectsRef.current.map((p) => (p.id === cleanItem.id ? { ...p, ...cleanItem } : p))
        : [cleanItem, ...projectsRef.current];
      projectsRef.current = nextProjects;
      setProjects(nextProjects);
      try {
        localStorage.setItem('ea_content_projects', JSON.stringify(nextProjects));
      } catch (e) {}
      if (persistNow) {
        saveToDisk({ projects: nextProjects });
      }
    } else if (article.type === 'territorios') {
      const exists = territoriosRef.current.some((t) => t.id === cleanItem.id);
      const nextTerritorios = exists
        ? territoriosRef.current.map((t) => (t.id === cleanItem.id ? { ...t, ...cleanItem } : t))
        : [cleanItem, ...territoriosRef.current];
      territoriosRef.current = nextTerritorios;
      setTerritorios(nextTerritorios);
      try {
        localStorage.setItem('ea_content_territorios', JSON.stringify(nextTerritorios));
      } catch (e) {}
      if (persistNow) {
        saveToDisk({ territorios: nextTerritorios });
      }
    } else if (article.type === 'academia') {
      const exists = academiaRef.current.some((a) => a.id === cleanItem.id);
      const nextAcademia = exists
        ? academiaRef.current.map((a) => (a.id === cleanItem.id ? { ...a, ...cleanItem } : a))
        : [cleanItem, ...academiaRef.current];
      academiaRef.current = nextAcademia;
      setAcademia(nextAcademia);
      try {
        localStorage.setItem('ea_content_academia', JSON.stringify(nextAcademia));
      } catch (e) {}
      if (persistNow) {
        saveToDisk({ academia: nextAcademia });
      }
    }
  };

  const deleteEditorialArticle = (id: string, type: EditorialType) => {
    if (type === 'proyectos') {
      deleteProject(id);
    } else if (type === 'territorios') {
      deleteTerritorio(id);
    } else if (type === 'academia') {
      deleteAcademia(id);
    }
  };

  const duplicateEditorialArticle = (id: string, type: EditorialType): EditorialArticle | null => {
    let source: any = null;
    if (type === 'proyectos') source = projectsRef.current.find((p) => p.id === id);
    else if (type === 'territorios') source = territoriosRef.current.find((t) => t.id === id);
    else if (type === 'academia') source = academiaRef.current.find((a) => a.id === id);

    if (!source) return null;

    const newId = `${source.id}-copia-${Date.now().toString(36).substring(2, 6)}`;
    const duplicated: EditorialArticle = {
      ...source,
      id: newId,
      slug: `${source.slug || source.id}-copia`,
      title: `${source.title} (Copia)`,
      status: 'draft',
      type: type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveEditorialArticle(duplicated);
    return duplicated;
  };

  const getAllEditorialArticles = (): EditorialArticle[] => {
    const list: EditorialArticle[] = [];

    // Map projects
    projects.forEach((p) => {
      list.push({
        ...p,
        type: 'proyectos',
        status: p.status || 'published',
      });
    });

    // Map territorios
    territorios.forEach((t) => {
      list.push({
        ...t,
        type: 'territorios',
        status: t.status || 'published',
        studio: t.studio || t.region,
      });
    });

    // Map academia
    academia.forEach((a) => {
      list.push({
        ...a,
        type: 'academia',
        status: a.status || 'published',
        studio: a.studio || a.institution || a.universidad,
      });
    });

    return list;
  };

  const saveToDisk = async (overrides?: {
    projects?: any[];
    siteConfig?: any;
    articles?: any[];
    academia?: any[];
    territorios?: any[];
    authors?: AuthorProfileData[];
    photographers?: PhotographerProfileData[];
    masterBuilders?: MasterBuilderProfile[];
  }): Promise<boolean> => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const currentSiteConfig = overrides?.siteConfig || siteConfigRef.current;
      const currentProjects = overrides?.projects || projectsRef.current;
      const currentArticles = overrides?.articles || articlesRef.current;
      const currentAcademia = overrides?.academia || academiaRef.current;
      const currentTerritorios = overrides?.territorios || territoriosRef.current;
      const currentAuthors = overrides?.authors || authorsRef.current;
      const currentPhotographers = overrides?.photographers || photographersRef.current;
      const currentMasterBuilders = overrides?.masterBuilders || masterBuildersRef.current;

      await Promise.all([
        fetch('/api/site-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSiteConfig, null, 2),
        }),
        fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentProjects, null, 2),
        }),
        fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentArticles, null, 2),
        }),
        fetch('/api/academia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentAcademia, null, 2),
        }),
        fetch('/api/territorios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentTerritorios, null, 2),
        }),
        fetch('/api/authors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentAuthors, null, 2),
        }),
        fetch('/api/photographers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPhotographers, null, 2),
        }),
        fetch('/api/master-builders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentMasterBuilders, null, 2),
        }),
      ]);

      setIsSaving(false);
      setSaveMessage('✓ Cambios editoriales guardados correctamente en disco.');
      setTimeout(() => setSaveMessage(null), 4000);
      return true;
    } catch (err: any) {
      setIsSaving(false);
      setSaveMessage('Error al guardar: ' + err.message);
      return false;
    }
  };

  const resetToDefault = () => {
    setSiteConfig(defaultSiteConfig);
    setProjects(defaultProjects);
    setArticles(defaultArticles);
    setAcademia(defaultAcademia);
    setTerritorios(defaultTerritorios);
    setAuthors(defaultAuthors as AuthorProfileData[]);
    setPhotographers(defaultPhotographers as PhotographerProfileData[]);
    setMasterBuilders(defaultMasterBuilders as MasterBuilderProfile[]);
    localStorage.removeItem('ea_content_projects');
    localStorage.removeItem('ea_content_academia');
    localStorage.removeItem('ea_content_territorios');
    localStorage.removeItem('ea_content_articles');
    localStorage.removeItem('ea_content_authors');
    localStorage.removeItem('ea_content_photographers');
    localStorage.removeItem('ea_content_master_builders');
  };

  return (
    <ContentContext.Provider
      value={{
        siteConfig,
        projects,
        articles,
        academia,
        territorios,
        authors,
        photographers,
        masterBuilders,
        updateHero,
        updateSearch,
        updatePinnedDestacados,
        updateFooter,
        updateProject,
        addProject,
        deleteProject,
        updateArticle,
        addArticle,
        deleteArticle,
        updateAcademia,
        addAcademia,
        deleteAcademia,
        updateTerritorio,
        addTerritorio,
        deleteTerritorio,
        updateAuthorProfile,
        createAuthorProfile,
        deleteAuthorProfile,
        updatePhotographerProfile,
        createPhotographerProfile,
        deletePhotographerProfile,
        updateMasterBuilderProfile,
        createMasterBuilderProfile,
        deleteMasterBuilderProfile,
        saveEditorialArticle,
        deleteEditorialArticle,
        duplicateEditorialArticle,
        getAllEditorialArticles,
        saveToDisk,
        resetToDefault,
        isSaving,
        saveMessage,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within a ContentProvider');
  return ctx;
};
