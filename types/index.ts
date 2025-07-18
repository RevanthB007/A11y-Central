// types/index.ts
// Possible values for impact in violations
export type ImpactValue = 'minor' | 'moderate' | 'serious' | 'critical';

// API Request/Response types
export interface AnalyzeRequest {
  url: string;
}

export interface analyzeWebsiteParams {
  url: string;
}

// Custom violation interface (simplified from axe-core Result)
export interface ViolationResult {
  id: string;
  impact: ImpactValue | null | undefined;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: any;
    html: string;
    failureSummary: string | undefined;
  }>;
}

// Analysis result structure
export interface AnalysisResult {
  url: string;
  timestamp: string;
  summary: {
    violations: number;
    passes: number;
    incomplete: number;
    inapplicable: number;
  };
  violations: ViolationResult[]; 
  passes: number;
  incomplete: number;
}
