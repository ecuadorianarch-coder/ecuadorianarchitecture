/**
 * Studio Authentication Service for Ecuadorian Architecture
 * Provides secure cryptographic session management for architectural studios and creators.
 */

import { optimizeArchitecturalImage } from '../utils/mediaUpload';

export interface StudioProfile {
  id: string;
  email: string;
  studioName: string;
  studioPrincipals: string;
  studioLocation: string;
  foundationYear: string;
  studioWebsite: string;
  studioAvatarUrl: string;
  studioCoverUrl: string;
  philosophy?: string;
  headline?: string;
  description?: string;
  instagram?: string;
  phone?: string;
  country?: string;
  typologies?: string[];
}

export interface StudioSubmission {
  id: string;
  category: 'proyectos' | 'territorios' | 'academia';
  projectTitle: string;
  projectYear?: string;
  projectLocation?: string;
  builtArea?: string;
  photographers?: string;
  shortSummary?: string;
  maestroMayorName?: string;
  maestroMayorSpecialty?: string;
  constructionCrew?: string;
  contextRelation?: string;
  usersAppropriation?: string;
  materialityTectonics?: string;
  fullDescription?: string;
  cloudStorageUrl?: string;
  status: 'pendiente_curaduria' | 'revisado' | 'aprobado' | 'descartado';
  receivedAt: string;
}

const TOKEN_KEY = 'ea_studio_token';
const STUDIO_DATA_KEY = 'ea_studio_data';

const BLOATED_CACHE_KEYS = [
  'ea_content_projects',
  'ea_content_academia',
  'ea_content_territorios',
  'ea_content_articles',
  'ea_content_authors',
  'ea_content_photographers',
  'ea_content_master_builders',
  'ea_media_library',
  'ea_editorial_office_state',
  'ea_project_submissions',
];

function purgeBloatedCaches() {
  if (typeof window === 'undefined') return;
  for (const k of BLOATED_CACHE_KEYS) {
    try {
      localStorage.removeItem(k);
    } catch {}
  }
}

// Proactive quota probe: if localStorage is nearly full, free up space now
if (typeof window !== 'undefined') {
  try {
    const probe = '__ea_quota_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
  } catch {
    purgeBloatedCaches();
  }
}

let memoryToken: string | null = null;
let memoryStudio: StudioProfile | null = null;

function safeStorageSet(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[studioAuthService] localStorage set failed for ${key}, clearing cache and retrying...`, err);
    purgeBloatedCaches();
    try {
      localStorage.setItem(key, value);
    } catch (e2) {
      console.warn(`[studioAuthService] localStorage set failed even after purge:`, e2);
    }
  }
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

function safeStorageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(key);
    if (val) return val;
  } catch {}
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageRemove(key: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
}

type AuthListener = (studio: StudioProfile | null) => void;
const listeners: Set<AuthListener> = new Set();

export const studioAuthService = {
  subscribe(listener: AuthListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  notify() {
    const current = this.getStudio();
    listeners.forEach((fn) => fn(current));
  },

  getToken(): string | null {
    if (memoryToken) return memoryToken;
    const t = safeStorageGet(TOKEN_KEY);
    if (t) memoryToken = t;
    return t;
  },

  getStudio(): StudioProfile | null {
    if (memoryStudio) return memoryStudio;
    try {
      const raw = safeStorageGet(STUDIO_DATA_KEY);
      if (raw) {
        memoryStudio = JSON.parse(raw);
        return memoryStudio;
      }
    } catch {}
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStudio();
  },

  setSession(token: string, studio: StudioProfile) {
    memoryToken = token;

    // Limpiar imágenes extremadamente pesadas en base64 para evitar QuotaExceededError en localStorage
    const safeStudio: StudioProfile = { ...studio };
    if (safeStudio.studioAvatarUrl && safeStudio.studioAvatarUrl.length > 50000) {
      safeStudio.studioAvatarUrl = '';
    }
    if (safeStudio.studioCoverUrl && safeStudio.studioCoverUrl.length > 50000) {
      safeStudio.studioCoverUrl = '';
    }
    memoryStudio = safeStudio;

    safeStorageSet(TOKEN_KEY, token);
    safeStorageSet(STUDIO_DATA_KEY, JSON.stringify(safeStudio));
    this.notify();
  },

  logout() {
    memoryToken = null;
    memoryStudio = null;
    safeStorageRemove(TOKEN_KEY);
    safeStorageRemove(STUDIO_DATA_KEY);
    this.notify();
  },

  async verifySession(): Promise<StudioProfile | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/studio/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success && data.studio) {
          this.setSession(token, data.studio);
          return data.studio;
        }
      }
    } catch (e) {
      console.warn('[studioAuthService] Could not verify remote session:', e);
    }

    return this.getStudio();
  },

  async login(email: string, password: string): Promise<{ success: boolean; error?: string; studio?: StudioProfile }> {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      const res = await fetch('/api/auth/studio/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: 'El servidor respondió con un formato no reconocido. Por favor recarga e intenta de nuevo.' };
      }

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Credenciales inválidas. Verifica tu correo y contraseña.' };
      }

      this.setSession(data.token, data.studio);
      return { success: true, studio: data.studio };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    }
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const res = await fetch('/api/auth/studio/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: 'Respuesta no válida del servidor.' };
      }

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudo enviar el código de recuperación.' };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión.' };
    }
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; studio?: StudioProfile; error?: string }> {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanCode = (code || '').trim();
      const cleanPass = (newPassword || '').trim();

      const res = await fetch('/api/auth/studio/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode, newPassword: cleanPass }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: 'Respuesta no válida del servidor.' };
      }

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Código incorrecto o expirado.' };
      }

      if (data.token && data.studio) {
        this.setSession(data.token, data.studio);
      }

      return { success: true, studio: data.studio };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión.' };
    }
  },

  async uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { dataUrl, filename } = await optimizeArchitecturalImage(file, {
        maxDimension: 1800,
        quality: 0.80,
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          data: dataUrl,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.url) {
        return { success: true, url: json.url };
      } else {
        return { success: false, error: json.error || 'Error al subir la imagen' };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Error de conexión al subir imagen' };
    }
  },

  async updateProfile(updates: Partial<StudioProfile>): Promise<{ success: boolean; studio?: StudioProfile; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'No has iniciado sesión.' };
    }

    try {
      const res = await fetch('/api/studio/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: 'Respuesta inválida del servidor.' };
      }

      if (!res.ok || !data.success || !data.studio) {
        return { success: false, error: data.error || 'Error al actualizar el perfil.' };
      }

      this.setSession(token, data.studio);
      return { success: true, studio: data.studio };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error de conexión.' };
    }
  },

  async getMySubmissions(): Promise<{ success: boolean; submissions?: StudioSubmission[]; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'No has iniciado sesión.' };
    }

    try {
      const res = await fetch('/api/studio/my-submissions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: 'Respuesta inválida del servidor al obtener propuestas.' };
      }

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudieron cargar las propuestas.' };
      }

      return { success: true, submissions: data.submissions || [] };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión.' };
    }
  },
};
