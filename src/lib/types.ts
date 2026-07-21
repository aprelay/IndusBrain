export interface Stakeholder {
  role: string;
  category: StakeholderCategory;
  responsibility: string;
  whenEngaged: string;
  typicalCost?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  costCurrency?: string;
}

export type StakeholderCategory =
  | "Legal"
  | "Finance"
  | "Insurance"
  | "Engineering"
  | "Regulatory"
  | "Procurement"
  | "Logistics"
  | "Construction"
  | "Operations"
  | "Advisory"
  | "Government";

export interface Phase {
  name: string;
  description: string;
  stakeholders: Stakeholder[];
  deliverables: string[];
  typicalDuration: string;
}

export interface Regulator {
  name: string;
  jurisdiction: string;
  purpose: string;
  legalBasis?: string;
  officialUrl?: string;
  lastVerified?: string;
}

export interface Blueprint {
  title: string;
  request: string;
  industry: string;
  summary: string;
  phases: Phase[];
  regulators: Regulator[];
  risks: string[];
  paymentPoints: string[];
  source: "curated" | "ai" | "hybrid";
  generatedAt: string;
  isicCode?: string;
  country?: string;
  budget?: BudgetLine[];
}

export interface BudgetLine {
  item: string;
  phase: string;
  costNote: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  currency?: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  isicCode?: string;
  country?: string;
  keywords: string[];
  summary: string;
  phases: Phase[];
  regulators: Regulator[];
  risks: string[];
  paymentPoints: string[];
}

export interface AuditEntry {
  id: number;
  request: string;
  industry: string;
  source: string;
  ip: string;
  createdAt: string;
}
