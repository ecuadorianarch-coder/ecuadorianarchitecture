import initialMasterBuildersJson from './masterBuilders.json';
import { ConstructionTeamMember } from './constructionTeams';

export interface MasterBuilderProfile {
  id: string;
  name: string;
  slug: string;
  rol: string;
  oficio: string;
  location: string;
  experienceYears?: string;
  avatarUrl?: string;
  coverImage?: string;
  trayectoria: string;
  reconocimiento: string;
  specialties: string[];
  defaultMembers?: ConstructionTeamMember[];
}

export function normalizeMasterBuilderToSlug(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const MASTER_BUILDERS_REGISTRY: Record<string, MasterBuilderProfile> = {};

(initialMasterBuildersJson as MasterBuilderProfile[]).forEach((builder) => {
  MASTER_BUILDERS_REGISTRY[builder.id] = builder;
  MASTER_BUILDERS_REGISTRY[builder.slug] = builder;
  MASTER_BUILDERS_REGISTRY[normalizeMasterBuilderToSlug(builder.name)] = builder;
});

export function getMasterBuilderByName(name: string): MasterBuilderProfile | null {
  if (!name) return null;
  const slug = normalizeMasterBuilderToSlug(name);
  if (MASTER_BUILDERS_REGISTRY[slug]) return MASTER_BUILDERS_REGISTRY[slug];
  
  // Case-insensitive substring fallback
  const normalizedSearch = name.trim().toLowerCase();
  for (const b of initialMasterBuildersJson as MasterBuilderProfile[]) {
    if (b.name.toLowerCase() === normalizedSearch || b.slug === normalizedSearch) {
      return b;
    }
  }
  return null;
}
