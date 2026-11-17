/**
 * Studio Authentication Service for Ecuadorian Architecture
 * Provides secure cryptographic session management for architectural studios and creators.
 */

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
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getStudio(): StudioProfile | null {
    try {
      const raw = localStorage.getItem(STUDIO_DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStudio();
  },

  setSession(token: string, studio: StudioProfile) {
    try {
      localStorage.setItem(TOKEN_KEY, token);

      // Limpiar imágenes extremadamente pesadas en base64 para evitar QuotaExceededError en localStorage
      const safeStudio: StudioProfile = { ...studio };
      if (safeStudio.studioAvatarUrl && safeStudio.studioAvatarUrl.length > 50000) {
        safeStudio.studioAvatarUrl = '';
      }
      if (safeStudio.studioCoverUrl && safeStudio.studioCoverUrl.length > 50000) {
        safeStudio.studioCoverUrl = '';
      }

      localStorage.setItem(STUDIO_DATA_KEY, JSON.stringify(safeStudio));
      this.notify();
    } catch (e) {
      console.warn('Could not save studio session to localStorage:', e);
      try {
        // Fallback mínimo
        localStorage.setItem(TOKEN_KEY, token);
        const minimalStudio = {
          id: studio.id,
          email: studio.email,
          studioName: studio.studioName,
          studioPrincipals: studio.studioPrincipals,
          studioLocation: studio.studioLocation,
          foundationYear: studio.foundationYear,
          studioWebsite: studio.studioWebsite,
          studioAvatarUrl: '',
          studioCoverUrl: '',
        };
        localStorage.setItem(STUDIO_DATA_KEY, JSON.stringify(minimalStudio));
        this.notify();
      } catch {}
    }
  },

  logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(STUDIO_DATA_KEY);
      this.notify();
    } catch (e) {
      console.warn('Could not clear studio session:', e);
    }
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
