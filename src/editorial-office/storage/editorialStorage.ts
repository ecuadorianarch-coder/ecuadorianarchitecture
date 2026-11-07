/**
 * Ecuadorian Architecture (EA) — Persistencia de la Oficina Editorial
 * Gestiona el almacenamiento en src/data/editorialOffice.json y sincronización cloud.
 */

import { EditorialOfficeState, AgentId } from '../core/types';
import { EA_AGENTS_REGISTRY } from '../agents/eaAgentPrompts';

export const INITIAL_EDITORIAL_OFFICE_STATE: EditorialOfficeState = {
  version: '2026-11-04-ea-office-v1',
  lastUpdated: new Date().toISOString(),
  articles: {},
  instagramPackages: {},
  newsletters: [],
  healthReport: {
    lastChecked: new Date().toISOString(),
    uptimePercentage: 99.94,
    averageResponseTimeMs: 142,
    httpStatus: 200,
    brokenLinksFound: [],
    databaseStatus: 'healthy',
    cmsStatus: 'operational',
    formsStatus: 'operational',
    activeIncidents: [],
  },
  agents: EA_AGENTS_REGISTRY,
  activityLog: [
    {
      id: `act-${Date.now()}-init`,
      timestamp: new Date().toISOString(),
      agentId: 'ea-01-chief-editor',
      agentName: 'EA Chief Editor',
      action: 'OFICINA_INICIALIZADA',
      details: 'Constitución institucional de la EA AI Editorial Office con 13 agentes operativos.',
    },
  ],
};

export class EditorialStorage {
  private memoryState: EditorialOfficeState = INITIAL_EDITORIAL_OFFICE_STATE;
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    this.init();
  }

  private init() {
    if (this.isBrowser) {
      try {
        const raw = localStorage.getItem('ea_editorial_office_state');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.version) {
            this.memoryState = {
              ...INITIAL_EDITORIAL_OFFICE_STATE,
              ...parsed,
              agents: { ...EA_AGENTS_REGISTRY, ...(parsed.agents || {}) },
            };
          }
        }
      } catch (e) {
        console.warn('[EditorialStorage] Failed to read from local storage:', e);
      }
    }
  }

  public getState(): EditorialOfficeState {
    return this.memoryState;
  }

  public setState(newState: Partial<EditorialOfficeState>): EditorialOfficeState {
    this.memoryState = {
      ...this.memoryState,
      ...newState,
      lastUpdated: new Date().toISOString(),
    };

    if (this.isBrowser) {
      try {
        localStorage.setItem('ea_editorial_office_state', JSON.stringify(this.memoryState));
      } catch (e) {
        console.warn('[EditorialStorage] Failed to save state to localStorage:', e);
      }
    }

    return this.memoryState;
  }

  public logActivity(agentId: AgentId, action: string, details: string, articleId?: string) {
    const agent = EA_AGENTS_REGISTRY[agentId];
    const logItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      agentId,
      agentName: agent ? agent.name : agentId,
      action,
      details,
      articleId,
    };

    this.memoryState.activityLog.unshift(logItem);
    if (this.memoryState.activityLog.length > 200) {
      this.memoryState.activityLog.pop();
    }

    if (agent) {
      agent.completedTasksCount = (agent.completedTasksCount || 0) + 1;
      agent.lastActive = new Date().toISOString();
    }

    this.setState({ activityLog: this.memoryState.activityLog });
    return logItem;
  }
}

export const editorialStorage = new EditorialStorage();
