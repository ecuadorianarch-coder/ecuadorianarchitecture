/**
 * Authentication Service for Ecuadorian Architecture Editorial & CMS Portal
 * Provides session management, credential validation and protection for CMS access.
 */

export interface AdminSession {
  user: string;
  name?: string;
  role?: string;
  token: string;
  expiresAt: number;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
}

const SESSION_KEY = 'ea_admin_session';
const CUSTOM_PASSWORD_KEY = 'ea_admin_custom_password';
const REGISTERED_USERS_KEY = 'ea_registered_users';

// Default initial credentials (supports runtime environment variable VITE_ADMIN_PASSWORD)
const VALID_USERS = ['admin', 'ecuadorianarch', 'editor'];
const DEFAULT_PASSWORD = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSWORD) || 'Ecuadorianarch10.';

export const authService = {
  /**
   * Helper to retrieve all registered users
   */
  getRegisteredUsers(): RegisteredUser[] {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Check if current session is active and not expired
   */
  isAuthenticated(): boolean {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const session: AdminSession = JSON.parse(raw);
      if (!session.token || !session.expiresAt) return false;
      if (Date.now() > session.expiresAt) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get current authenticated user or null
   */
  getCurrentUser(): string | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: AdminSession = JSON.parse(raw);
      return session.name || session.user || 'admin';
    } catch {
      return null;
    }
  },

  /**
   * Get current session object
   */
  getSession(): AdminSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Login with username or email and password
   */
  login(usernameOrEmail: string, password: string, rememberMe = true): { success: boolean; error?: string; user?: AdminSession } {
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      return { success: false, error: 'Por favor complete todos los campos.' };
    }

    // 1. Check default admin credentials
    const currentPassword = localStorage.getItem(CUSTOM_PASSWORD_KEY) || DEFAULT_PASSWORD;
    const isDefaultAdmin = VALID_USERS.includes(cleanInput);

    if (isDefaultAdmin && cleanPass === currentPassword) {
      const duration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
      const session: AdminSession = {
        user: cleanInput,
        name: cleanInput === 'admin' ? 'Administrador' : cleanInput.toUpperCase(),
        role: 'Administrador / Editor Principal',
        token: `ea_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt: Date.now() + duration,
      };

      const serialized = JSON.stringify(session);
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, serialized);
      } else {
        sessionStorage.setItem(SESSION_KEY, serialized);
      }
      return { success: true, user: session };
    }

    // 2. Check registered users
    const registeredUsers = this.getRegisteredUsers();
    const foundUser = registeredUsers.find(
      (u) => u.username.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput
    );

    if (foundUser) {
      if (foundUser.password !== cleanPass) {
        return { success: false, error: 'Contraseña incorrecta. Verifique sus credenciales.' };
      }

      const duration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
      const session: AdminSession = {
        user: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
        token: `ea_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt: Date.now() + duration,
      };

      const serialized = JSON.stringify(session);
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, serialized);
      } else {
        sessionStorage.setItem(SESSION_KEY, serialized);
      }
      return { success: true, user: session };
    }

    if (isDefaultAdmin) {
      return { success: false, error: 'Contraseña incorrecta para el usuario administrador.' };
    }

    return { success: false, error: 'Usuario o correo no encontrado. Puedes registrar una cuenta nueva.' };
  },

  /**
   * Register a new user account
   */
  register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): { success: boolean; error?: string; user?: AdminSession } {
    const cleanName = userData.name.trim();
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanPass = userData.password.trim();
    const role = userData.role || 'Lector / Crítico';

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, error: 'Todos los campos son obligatorios.' };
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Ingrese un correo electrónico válido.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const registeredUsers = this.getRegisteredUsers();
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const username = cleanEmail.split('@')[0];
    const newUser: RegisteredUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      username,
      password: cleanPass,
      role,
      createdAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));

    // Automatically log in the newly registered user
    return this.login(cleanEmail, cleanPass, true);
  },

  /**
   * Terminate active session
   */
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },

  /**
   * Change current admin password
   */
  changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    const activePass = localStorage.getItem(CUSTOM_PASSWORD_KEY) || DEFAULT_PASSWORD;
    if (currentPassword.trim() !== activePass) {
      return { success: false, error: 'La contraseña actual no coincide.' };
    }
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }
    localStorage.setItem(CUSTOM_PASSWORD_KEY, newPassword.trim());
    return { success: true };
  },

  /**
   * Helper to get default credentials for display/guidance if permitted
   */
  getDefaultCredentialsHint(): { user: string; defaultPass: string } {
    return {
      user: 'admin',
      defaultPass: 'ecuadorianarch2026',
    };
  },
};
