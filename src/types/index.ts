export type Risk = "low" | "medium" | "high";

export interface Clause {
  title: string;
  summary: string;
  risk: Risk;
  detail: string;
  action?: string;
}

export interface AnalysisResult {
  title: string;
  pages: number;
  wordCount: number;
  riskScore: Risk;
  summary: string;
  actions: string[];
  clauses: Clause[];
}
