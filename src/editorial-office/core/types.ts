/**
 * Ecuadorian Architecture (EA) — AI Editorial Office
 * Data models, workflow states, agent definitions and deliverable schemas.
 */

export type AgentId =
  | 'ea-01-chief-editor'
  | 'ea-02-managing-editor'
  | 'ea-03-architecture-editor'
  | 'ea-04-architecture-critic'
  | 'ea-05-research-editor'
  | 'ea-06-fact-checker'
  | 'ea-07-instagram-editor'
  | 'ea-08-newsletter-editor'
  | 'ea-09-webops-engineer'
  | 'ea-10-product-manager'
  | 'ea-11-data-analyst'
  | 'ea-12-community-manager'
  | 'ea-13-partnerships-lead';

export type DepartmentId =
  | 'direccion-general'
  | 'departamento-editorial'
  | 'publicaciones-multimedia'
  | 'operaciones-tecnologicas'
  | 'comunidad-negocios';

export type AgentStatus = 'idle' | 'working' | 'reviewing' | 'offline' | 'alert';

export interface AgentProfile {
  id: AgentId;
  name: string;
  role: string;
  department: DepartmentId;
  description: string;
  avatar: string;
  responsibilities: string[];
  systemPrompt: string;
  status: AgentStatus;
  currentTaskId?: string;
  completedTasksCount: number;
  lastActive: string;
}

export type ArticleWorkflowStage =
  | 'RECIBIDO'
  | 'EN_INVESTIGACION'
  | 'EN_EDICION'
  | 'EN_VERIFICACION'
  | 'EN_DISENO'
  | 'PENDIENTE_APROBACION'
  | 'APROBADO'
  | 'PUBLICADO';

export type FactCheckStatus = 'VERIFICADO' | 'PARCIALMENTE_VERIFICADO' | 'NO_VERIFICADO' | 'CONTRADICTORIO';

export interface FactCheckItem {
  id: string;
  claim: string;
  category: 'nombre' | 'fecha' | 'superficie' | 'ubicacion' | 'credito' | 'tecnica' | 'cita';
  status: FactCheckStatus;
  evidence: string;
  sourceRef?: string;
  recommendation?: string;
}

export interface FactCheckReport {
  summary: string;
  totalClaims: number;
  verifiedCount: number;
  partialCount: number;
  unverifiedCount: number;
  contradictoryCount: number;
  items: FactCheckItem[];
  approvedForPublication: boolean;
  timestamp: string;
}

export interface ArchitectureCritiqueReport {
  implantacion: string;
  contextoTerritorial: string;
  espacialidad: string;
  materialidadTecnica: string;
  dimensionSocialCultural: string;
  sostenibilidadClimatica: string;
  coherenciaDiscursoObra: string;
  puntosFuertes: string[];
  argumentosDebiles: string[];
  preguntasCriticas: string[];
  conclusiones: string;
  timestamp: string;
}

export interface ResearchDossier {
  arquitectoEstudio: string;
  antecedentesHistoricos: string;
  contextoLugar: string;
  sistemaConstructivoTradicional: string;
  referenciasBibliograficas: { titulo: string; autor: string; fuente: string; url?: string }[];
  obrasParalelas: string[];
  timestamp: string;
}

export interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  originalText?: string;
  editedText?: string;
  reason?: string;
  accepted?: boolean;
}

export interface EditorialRevision {
  version: number;
  editorId: AgentId;
  authorPreservedVoiceScore: number; // 0 - 100
  titleSuggestion?: string;
  subtitleSuggestion?: string;
  excerptSuggestion?: string;
  improvedNarrative: string;
  diffs: DiffSegment[];
  editorialObservations: string[];
  unnecessaryParagraphsIdentified: string[];
  syntaxCorrections: string[];
  timestamp: string;
}

export interface InstagramSlide {
  slideNumber: number; // 1 to 10
  stage:
    | '1_PORTADA'
    | '2_CONTEXTO'
    | '3_IDEA'
    | '4_DESARROLLO_1'
    | '5_DESARROLLO_2'
    | '6_MATERIALIDAD'
    | '7_LECTURA_CRITICA'
    | '8_CUESTIONAMIENTO'
    | '9_CONCLUSION'
    | '10_CIERRE';
  text: string; // 5-14 words, exactly one potent punchline
  wordCount: number;
  visualDirection: string;
  recommendedAssetUrl?: string;
  recommendedAssetDescription: string;
}

export interface InstagramCarouselPackage {
  id: string;
  articleId: string;
  articleTitle: string;
  carouselTitle: string;
  slides: InstagramSlide[]; // Exactly 10 items
  copy: string;
  closingQuestion: string;
  hashtags: string[];
  curatedAssetUrls: string[];
  status: 'draft' | 'approved' | 'ready_for_design' | 'published';
  createdAt: string;
  approvedAt?: string;
}

export interface NewsletterSection {
  index: number;
  title: string;
  content: string;
  featuredArticleSlug?: string;
  linkUrl?: string;
}

export interface NewsletterEdition {
  id: string;
  month: string; // e.g. "Noviembre 2026"
  editionName: string;
  subjectLine: string;
  preheader: string;
  editorialOpening: string;
  mainReflection: string;
  featuredArticles: { id: string; title: string; excerpt: string; studio: string; url: string }[];
  architecturalHighlights: string[];
  relevantNews: string[];
  communityVoices: string[];
  culturalAgenda: string[];
  recommendedReading: { title: string; author: string; note: string };
  editorialClosing: string;
  htmlContent: string;
  status: 'draft' | 'review' | 'approved' | 'sent';
  preparedAt: string;
  approvedAt?: string;
  sentAt?: string;
}

export type IncidentSeverity = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';

export interface WebOpsIncident {
  id: string;
  timestamp: string;
  severity: IncidentSeverity;
  endpointOrComponent: string;
  description: string;
  diagnosis: string;
  proposedFix: string;
  status: 'investigating' | 'fix_in_progress' | 'resolved';
  resolvedAt?: string;
}

export interface WebOpsHealthReport {
  lastChecked: string;
  uptimePercentage: number;
  averageResponseTimeMs: number;
  httpStatus: number;
  brokenLinksFound: string[];
  databaseStatus: 'healthy' | 'degraded' | 'offline';
  cmsStatus: 'operational' | 'impaired' | 'down';
  formsStatus: 'operational' | 'impaired';
  activeIncidents: WebOpsIncident[];
}

export interface EditorialArticleWorkspace {
  articleId: string;
  originalSlug: string;
  articleType: 'proyectos' | 'territorios' | 'academia';
  stage: ArticleWorkflowStage;
  priority: 'ALTA' | 'MEDIA' | 'NORMAL';
  assignedAgents: AgentId[];
  createdAt: string;
  updatedAt: string;
  
  // Versions
  originalSnapshot: {
    title: string;
    subtitle?: string;
    excerpt: string;
    author: string;
    studio?: string;
    location: string;
    year: string;
    rawText: string;
    datos: Record<string, any>;
    modules: any[];
  };
  
  researchDossier?: ResearchDossier;
  critiqueReport?: ArchitectureCritiqueReport;
  factCheckReport?: FactCheckReport;
  latestRevision?: EditorialRevision;
  historyRevisions: EditorialRevision[];
  instagramPackage?: InstagramCarouselPackage;
  
  humanApproval: {
    approved: boolean;
    approvedBy?: string;
    notes?: string;
    approvedAt?: string;
  };
}

export interface EditorialOfficeState {
  version: string;
  lastUpdated: string;
  articles: Record<string, EditorialArticleWorkspace>;
  instagramPackages: Record<string, InstagramCarouselPackage>;
  newsletters: NewsletterEdition[];
  healthReport: WebOpsHealthReport;
  agents: Record<AgentId, AgentProfile>;
  activityLog: {
    id: string;
    timestamp: string;
    agentId: AgentId;
    agentName: string;
    action: string;
    details: string;
    articleId?: string;
  }[];
}

// ---------------------------------------------------------------------------
// EA OPPORTUNITIES & PARTNERSHIPS OFFICE TYPES
// ---------------------------------------------------------------------------

export type OpportunitiesAgentId =
  | 'ea-opp-01-director'
  | 'ea-opp-02-competitions'
  | 'ea-opp-03-grants'
  | 'ea-opp-04-sponsorships'
  | 'ea-opp-05-institutional'
  | 'ea-opp-06-proposals'
  | 'ea-opp-07-analyst';

export type OpportunityCategory =
  | 'concurso'
  | 'premio'
  | 'convocatoria'
  | 'beca'
  | 'fondo'
  | 'subvencion'
  | 'cooperacion_internacional'
  | 'auspicio'
  | 'alianza_institucional'
  | 'evento_colaboracion';

export type OpportunityStatus =
  | 'detectada'
  | 'pendiente_evaluacion'
  | 'verificada'
  | 'recomendada'
  | 'en_preparacion'
  | 'postulada'
  | 'en_negociacion'
  | 'aprobada'
  | 'rechazada'
  | 'cerrada';

export interface OpportunityItem {
  id: string;
  title: string;
  officialName: string;
  organizer: string;
  category: OpportunityCategory;
  country: string;
  officialUrl: string;
  openingDate: string;
  closingDate: string;
  daysRemaining?: number;
  requirements: string[];
  eaEligibility: string;
  cost: string;
  requiredDocs: string[];
  verificationStatus: 'verificada' | 'parcialmente_verificada' | 'no_verificada';
  lastCheckedDate: string;
  strategicFitScore: number; // 0 - 100
  economicBenefit: string;
  visibilityScore: number; // 0 - 100
  estimatedEffortHours: number;
  recommendedAction: string;
  status: OpportunityStatus;
  assignedAgentId: OpportunitiesAgentId;
  notes?: string;
}

export type SponsorStage =
  | 'contacto_inicial'
  | 'conversacion'
  | 'propuesta_enviada'
  | 'reunion_agendada'
  | 'negociacion'
  | 'acuerdo_firmado'
  | 'renovacion';

export interface SponsorInteraction {
  id: string;
  date: string;
  type: 'email' | 'reunion' | 'llamada' | 'presentacion' | 'seguimiento';
  summary: string;
  nextFollowUp?: string;
}

export interface SponsorLead {
  id: string;
  companyName: string;
  sector: string;
  country: string;
  website: string;
  contactEmail: string;
  contactPerson?: string;
  role?: string;
  affinityScore: number; // 0 - 100
  possibleInterests: string[];
  recommendedPackageId: string;
  currentStage: SponsorStage;
  interactionsLog: SponsorInteraction[];
  customProposalSummary?: string;
  estimatedBudgetRange?: string;
}

export interface SponsorshipPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  deliverables: string[];
  estimatedMonthlyOrAnnualRange: string;
  isEditorialIndependent: boolean;
}

export interface OpportunityAlert {
  id: string;
  type: 'deadline_warning' | 'new_match' | 'sponsor_followup' | 'institutional_milestone';
  title: string;
  summary: string;
  recommendedAction: string;
  priority: 'URGENTE' | 'ALTA' | 'NORMAL';
  targetId: string;
  createdAt: string;
  daysRemaining?: number;
}

export interface OpportunityPitch {
  id: string;
  opportunityOrSponsorId: string;
  targetName: string;
  title: string;
  summary: string;
  whyEaIsRelevant: string;
  whatWeOffer: string[];
  whatWeNeed: string[];
  preliminaryBudget: string;
  mutualBenefits: string[];
  timeline: string;
  pitchDeckOutline: string[];
  draftEmailSubject: string;
  draftEmailBody: string;
  createdAt: string;
  approvedByHuman: boolean;
}

export interface OpportunitiesMonthlyReport {
  id: string;
  month: string;
  totalIdentified: number;
  totalRecommended: number;
  totalApplied: number;
  grantsValuePotential: string;
  activeSponsorNegotiations: number;
  upcomingCriticalDeadlines: { title: string; closingDate: string; daysRemaining: number }[];
  strategicRecommendations: string[];
  preparedByAgent: string;
  timestamp: string;
}

export interface OpportunitiesHubState {
  version: string;
  lastUpdated: string;
  opportunities: Record<string, OpportunityItem>;
  sponsors: Record<string, SponsorLead>;
  packages: SponsorshipPackage[];
  pitches: Record<string, OpportunityPitch>;
  alerts: OpportunityAlert[];
  monthlyReports: OpportunitiesMonthlyReport[];
  agents: Record<OpportunitiesAgentId, AgentProfile>;
  activityLog: {
    id: string;
    timestamp: string;
    agentId: OpportunitiesAgentId;
    agentName: string;
    action: string;
    details: string;
    targetId?: string;
  }[];
}
