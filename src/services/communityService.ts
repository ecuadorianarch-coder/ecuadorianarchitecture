import { useState, useEffect, useCallback } from 'react';
import initialCommunityData from '../data/communityNotes.json';
import { WorksiteVisit, CriticalArgument, CommunityStore, SessionUser, ModerationStatus } from '../types/community';

const STORAGE_KEY = 'ea_community_store_v1';
const SESSION_USER_KEY = 'ea_session_user_v1';

export const DEFAULT_SESSION_USER: SessionUser = {
  name: '',
  email: '',
  role: 'Colaborador EA',
  city: 'Ecuador',
};

export const getSessionUser = (): SessionUser => {
  if (typeof window === 'undefined') return DEFAULT_SESSION_USER;
  try {
    const saved = localStorage.getItem(SESSION_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          name: parsed.name === 'Arq. Mateo Carrión' ? '' : (parsed.name || ''),
          email: parsed.email || '',
          role: parsed.role || DEFAULT_SESSION_USER.role,
          city: parsed.city || DEFAULT_SESSION_USER.city,
        };
      }
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SESSION_USER;
};

export const setSessionUser = (user: SessionUser) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch (e) {}
};

/**
 * Hook para interactuar con las Notas de la Comunidad (Visitas y Argumentos)
 * respetando el filtrado estricto por projectId.
 */
export const useCommunityNotes = (projectId: string, projectSlug?: string) => {
  const [store, setStore] = useState<CommunityStore>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed?.visits) && Array.isArray(parsed?.arguments)) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return initialCommunityData as CommunityStore;
  });

  const [sessionUser, setSessionUserState] = useState<SessionUser>(getSessionUser);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with /api/community-notes if available
  useEffect(() => {
    let isMounted = true;
    fetch('/api/community-notes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.visits) && Array.isArray(data.arguments)) {
          setStore((prev) => {
            // Merge with local changes if any
            const mergedVisits = [...data.visits];
            prev.visits.forEach((v) => {
              if (!mergedVisits.some((item) => item.id === v.id)) {
                mergedVisits.push(v);
              }
            });
            const mergedArgs = [...data.arguments];
            prev.arguments.forEach((a) => {
              if (!mergedArgs.some((item) => item.id === a.id)) {
                mergedArgs.push(a);
              }
            });
            const updated = { visits: mergedVisits, arguments: mergedArgs };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      })
      .catch(() => {});

    // Escuchar actualizaciones del almacén disparadas desde el CMS u otra pestaña
    const handleStoreUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail.visits) && Array.isArray(e.detail.arguments)) {
        setStore(e.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('ea_community_store_updated', handleStoreUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('ea_community_store_updated', handleStoreUpdate);
      }
    };
  }, []);

  const saveStore = useCallback(async (newStore: CommunityStore) => {
    setStore(newStore);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
        window.dispatchEvent(new CustomEvent('ea_community_store_updated', { detail: newStore }));
      } catch (e) {}
    }
    try {
      await fetch('/api/community-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore, null, 2),
      });
    } catch (e) {
      // Local storage already has it
    }
  }, []);

  /**
   * 1. Registrar Visita de Obra
   * Inyecta projectId automáticamente desde el contexto actual del proyecto.
   * Por defecto entra en estado 'pendiente' para moderación en el CMS privado.
   */
  const addWorksiteVisit = useCallback(
    async (data: {
      experience: string;
      photos?: string[];
      visitDate?: string;
      authorName?: string;
      authorEmail?: string;
    }): Promise<{ success: boolean; visit?: WorksiteVisit; error?: string }> => {
      if (!data.experience.trim()) {
        return { success: false, error: 'La descripción de la experiencia de visita es obligatoria.' };
      }

      const finalAuthorName = data.authorName?.trim() || sessionUser.name?.trim() || 'Visitante EA';
      const finalAuthorEmail = data.authorEmail?.trim() || sessionUser.email?.trim() || undefined;

      // Validar máximo 3 fotografías
      const cleanPhotos = (data.photos || []).filter(Boolean).slice(0, 3);

      const newVisit: WorksiteVisit = {
        id: `visita-${projectId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        projectId, // Asignado estrictamente desde el contexto del proyecto
        authorName: finalAuthorName,
        authorEmail: finalAuthorEmail,
        experience: data.experience.trim(),
        photos: cleanPhotos,
        visitDate: data.visitDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: 'pendiente', // Enviado a moderación privada del CMS
        likes: 0,
        hasLiked: false,
      };

      const updatedStore: CommunityStore = {
        ...store,
        visits: [newVisit, ...store.visits],
      };

      await saveStore(updatedStore);
      return { success: true, visit: newVisit };
    },
    [projectId, sessionUser, store, saveStore]
  );

  /**
   * 2. Registrar Conversación Crítica
   * Inyecta projectId automáticamente desde el contexto actual del proyecto.
   * Por defecto entra en estado 'pendiente' para moderación en el CMS privado.
   */
  const addCriticalArgument = useCallback(
    async (data: {
      argumentTitle?: string;
      argument: string;
      authorName?: string;
      authorEmail?: string;
    }): Promise<{ success: boolean; argument?: CriticalArgument; error?: string }> => {
      if (!data.argument.trim()) {
        return { success: false, error: 'El argumento crítico es obligatorio.' };
      }

      const finalAuthorName = data.authorName?.trim() || sessionUser.name?.trim() || 'Crítico EA';
      const finalAuthorEmail = data.authorEmail?.trim() || sessionUser.email?.trim() || undefined;

      const newArgument: CriticalArgument = {
        id: `arg-${projectId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        projectId, // Asignado estrictamente desde el contexto del proyecto
        authorName: finalAuthorName,
        authorEmail: finalAuthorEmail,
        argumentTitle: data.argumentTitle?.trim() || undefined,
        argument: data.argument.trim(),
        createdAt: new Date().toISOString(),
        status: 'pendiente', // Enviado a moderación privada del CMS
        likes: 0,
        hasLiked: false,
      };

      const updatedStore: CommunityStore = {
        ...store,
        arguments: [newArgument, ...store.arguments],
      };

      await saveStore(updatedStore);
      return { success: true, argument: newArgument };
    },
    [projectId, sessionUser, store, saveStore]
  );

  const toggleVisitLike = useCallback(
    (visitId: string) => {
      const updatedVisits = store.visits.map((v) => {
        if (v.id === visitId) {
          const hasLiked = !v.hasLiked;
          return {
            ...v,
            hasLiked,
            likes: (v.likes || 0) + (hasLiked ? 1 : -1),
          };
        }
        return v;
      });
      saveStore({ ...store, visits: updatedVisits });
    },
    [store, saveStore]
  );

  const toggleArgumentLike = useCallback(
    (argId: string) => {
      const updatedArgs = store.arguments.map((a) => {
        if (a.id === argId) {
          const hasLiked = !a.hasLiked;
          return {
            ...a,
            hasLiked,
            likes: (a.likes || 0) + (hasLiked ? 1 : -1),
          };
        }
        return a;
      });
      saveStore({ ...store, arguments: updatedArgs });
    },
    [store, saveStore]
  );

  // Filtrado estricto por proyecto actual (soporta projectId canónico, slug o identificador base)
  const isProjectMatch = useCallback(
    (itemProjectId?: string) => {
      if (!itemProjectId) return false;
      if (itemProjectId === projectId) return true;
      if (projectSlug && itemProjectId === projectSlug) return true;
      if (projectId && (itemProjectId.startsWith(projectId) || projectId.startsWith(itemProjectId))) return true;
      if (projectSlug && (itemProjectId.startsWith(projectSlug) || projectSlug.startsWith(itemProjectId))) return true;
      return false;
    },
    [projectId, projectSlug]
  );

  // En la vista pública, se muestran los aprobados; el autor en sesión también ve sus propios pendientes con aviso
  const projectVisits = store.visits.filter(
    (v) => isProjectMatch(v.projectId) && (v.status === 'aprobado' || (sessionUser?.name && v.authorName === sessionUser.name))
  );

  const projectArguments = store.arguments.filter(
    (a) => isProjectMatch(a.projectId) && (a.status === 'aprobado' || (sessionUser?.name && a.authorName === sessionUser.name))
  );

  return {
    visits: projectVisits,
    arguments: projectArguments,
    allVisitsCount: projectVisits.length,
    allArgumentsCount: projectArguments.length,
    sessionUser,
    setSessionUser: (user: SessionUser) => {
      setSessionUser(user);
      setSessionUserState(user);
    },
    addWorksiteVisit,
    addCriticalArgument,
    toggleVisitLike,
    toggleArgumentLike,
    isLoading,
  };
};

/**
 * Hook exclusivo para el CMS de Moderación Privada
 * Permite a los administradores revisar, aprobar, denegar y eliminar comentarios y visitas de obra.
 */
export const useCommunityModeration = () => {
  const [store, setStore] = useState<CommunityStore>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed?.visits) && Array.isArray(parsed?.arguments)) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return initialCommunityData as CommunityStore;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Sincronizar con el servidor y escuchar eventos
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetch('/api/community-notes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.visits) && Array.isArray(data.arguments)) {
          setStore(data);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const handleUpdate = (e: any) => {
      if (e?.detail) setStore(e.detail);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('ea_community_store_updated', handleUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('ea_community_store_updated', handleUpdate);
      }
    };
  }, []);

  const saveStore = useCallback(async (newStore: CommunityStore): Promise<boolean> => {
    setStore(newStore);
    setSaveStatus('saving');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
        window.dispatchEvent(new CustomEvent('ea_community_store_updated', { detail: newStore }));
      } catch (e) {}
    }
    try {
      const res = await fetch('/api/community-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore, null, 2),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
        return true;
      }
    } catch (e) {}
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
    return true;
  }, []);

  const approveVisit = useCallback(
    async (id: string) => {
      const updatedVisits = store.visits.map((v) => (v.id === id ? { ...v, status: 'aprobado' as ModerationStatus } : v));
      return saveStore({ ...store, visits: updatedVisits });
    },
    [store, saveStore]
  );

  const rejectVisit = useCallback(
    async (id: string) => {
      const updatedVisits = store.visits.map((v) => (v.id === id ? { ...v, status: 'rechazado' as ModerationStatus } : v));
      return saveStore({ ...store, visits: updatedVisits });
    },
    [store, saveStore]
  );

  const deleteVisit = useCallback(
    async (id: string) => {
      const updatedVisits = store.visits.filter((v) => v.id !== id);
      return saveStore({ ...store, visits: updatedVisits });
    },
    [store, saveStore]
  );

  const approveArgument = useCallback(
    async (id: string) => {
      const updatedArgs = store.arguments.map((a) => (a.id === id ? { ...a, status: 'aprobado' as ModerationStatus } : a));
      return saveStore({ ...store, arguments: updatedArgs });
    },
    [store, saveStore]
  );

  const rejectArgument = useCallback(
    async (id: string) => {
      const updatedArgs = store.arguments.map((a) => (a.id === id ? { ...a, status: 'rechazado' as ModerationStatus } : a));
      return saveStore({ ...store, arguments: updatedArgs });
    },
    [store, saveStore]
  );

  const deleteArgument = useCallback(
    async (id: string) => {
      const updatedArgs = store.arguments.filter((a) => a.id !== id);
      return saveStore({ ...store, arguments: updatedArgs });
    },
    [store, saveStore]
  );

  const batchApprovePending = useCallback(async () => {
    const updatedVisits = store.visits.map((v) => (v.status === 'pendiente' ? { ...v, status: 'aprobado' as ModerationStatus } : v));
    const updatedArgs = store.arguments.map((a) => (a.status === 'pendiente' ? { ...a, status: 'aprobado' as ModerationStatus } : a));
    return saveStore({ visits: updatedVisits, arguments: updatedArgs });
  }, [store, saveStore]);

  const pendingVisitsCount = store.visits.filter((v) => v.status === 'pendiente').length;
  const pendingArgsCount = store.arguments.filter((a) => a.status === 'pendiente').length;
  const pendingCount = pendingVisitsCount + pendingArgsCount;

  const approvedVisitsCount = store.visits.filter((v) => v.status === 'aprobado').length;
  const approvedArgsCount = store.arguments.filter((a) => a.status === 'aprobado').length;
  const approvedCount = approvedVisitsCount + approvedArgsCount;

  const rejectedVisitsCount = store.visits.filter((v) => v.status === 'rechazado').length;
  const rejectedArgsCount = store.arguments.filter((a) => a.status === 'rechazado').length;
  const rejectedCount = rejectedVisitsCount + rejectedArgsCount;

  return {
    store,
    visits: store.visits,
    arguments: store.arguments,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalCount: store.visits.length + store.arguments.length,
    isLoading,
    saveStatus,
    approveVisit,
    rejectVisit,
    deleteVisit,
    approveArgument,
    rejectArgument,
    deleteArgument,
    batchApprovePending,
    saveStore,
  };
};
