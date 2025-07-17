import UnlabelledFrameSelector from '@axe-core/puppeteer';
// Possible values for impact in violations
export type ImpactValue = 'minor' | 'moderate' | 'serious' | 'critical';

// API Request/Response types
export interface AnalyzeRequest {
  url: string;
}

export interface analyzeWebsiteParams {
  url: string;
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
  violations: Array<{
    id: string;
    impact: ImpactValue | null | undefined; // Can be 'minor', 'moderate', 'serious', 'critical', null, or undefined
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
      target: UnlabelledFrameSelector; // Use the exact type from axe-core
      html: string;
      failureSummary: string | undefined; // Can be undefined
    }>;
  }>;
  passes: number;
  incomplete: number;
}