export interface Stakeholder {
  role: string;
  category: StakeholderCategory;
  responsibility: string;
  whenEngaged: string;
  typicalCost?: string;
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
}

export interface IndustryTemplate {
  id: string;
  name: string;
  keywords: string[];
  summary: string;
  phases: Phase[];
  regulators: Regulator[];
  risks: string[];
  paymentPoints: string[];
}
