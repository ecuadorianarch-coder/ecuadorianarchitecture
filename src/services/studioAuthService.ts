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
      localStorage.setItem(STUDIO_DATA_KEY, JSON.stringify(studio));
      this.notify();
    } catch (e) {
      console.warn('Could not save studio session:', e);
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
      const res = await fetch('/api/auth/studio/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Credenciales inválidas' };
      }

      this.setSession(data.token, data.studio);
      return { success: true, studio: data.studio };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
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

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudieron cargar las propuestas.' };
      }

      return { success: true, submissions: data.submissions || [] };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión.' };
    }
  },
};
