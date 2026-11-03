/**
 * Modelos de datos para Notas de la Comunidad en EcuadorianArchitecture (EA)
 */

export type ModerationStatus = 'aprobado' | 'pendiente' | 'rechazado';

export interface WorksiteVisit {
  id: string;
  projectId: string; // Asignado automáticamente desde el contexto del proyecto
  authorName: string; // Nombre o firma profesional ingresada por el autor
  authorEmail?: string; // Correo electrónico del autor (para verificación/contacto editorial)
  experience: string; // Obligatorio
  photos?: string[]; // Hasta 3 fotografías (URLs o Base64); opcional
  visitDate?: string; // Fecha de visita; opcional (YYYY-MM-DD o formato legible)
  createdAt: string; // ISO 8601 string
  status: ModerationStatus;
  likes?: number;
  hasLiked?: boolean;
}

export interface CriticalArgument {
  id: string;
  projectId: string; // Asignado automáticamente desde el contexto del proyecto
  authorName: string; // Nombre o firma profesional ingresada por el autor
  authorEmail?: string; // Correo electrónico del autor (para verificación/contacto editorial)
  argumentTitle?: string; // Título del argumento; opcional
  argument: string; // Obligatorio
  createdAt: string; // ISO 8601 string
  status: ModerationStatus;
  likes?: number;
  hasLiked?: boolean;
}

export interface CommunityStore {
  visits: WorksiteVisit[];
  arguments: CriticalArgument[];
}

export interface SessionUser {
  name: string;
  email?: string;
  role?: string;
  city?: string;
}
