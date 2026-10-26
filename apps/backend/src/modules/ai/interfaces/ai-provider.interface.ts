export interface InterpretedIntent {
  targetFunction: string | null;
  targetIndustry: string | null;
  targetCountry: string | null;
  targetSeniority: string | null;
  searchKeywords: string[];
  reasoningSummary: string;
}

export interface AiExecutionResult {
  intent: InterpretedIntent;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCost: number;
}

export interface MandateValidationAnalysis {
  isCompliant: boolean;
  score: number;
  classification: 'COMMERCIAL_PARTNERSHIP' | 'PERSONAL_MILESTONE' | 'MOTIVATIONAL_FLUFF' | 'RETAIL_PROMOTION' | 'UNCLEAR_INTENT';
  flagReason: string | null;
  politeFeedback: string;
  suggestedRemedy: string | null;
  suggestedRewrite: {
    title: string;
    content: string;
    dealScope: string;
  } | null;
  detectedThemes: string[];
}

export interface MandateValidationResult {
  validation: MandateValidationAnalysis;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCost: number;
}

export interface AiProviderInterface {
  readonly name: string;
  interpretIntent(query: string): Promise<AiExecutionResult>;
}
