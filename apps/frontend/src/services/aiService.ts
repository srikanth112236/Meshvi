export interface MandateValidationAnalysis {
  isCompliant: boolean;
  score: number;
  classification:
    | 'COMMERCIAL_PARTNERSHIP'
    | 'PERSONAL_MILESTONE'
    | 'MOTIVATIONAL_FLUFF'
    | 'RETAIL_PROMOTION'
    | 'UNCLEAR_INTENT';
  flagReason: string | null;
  politeFeedback: string;
  suggestedRemedy: string | null;
  suggestedRewrite: {
    title: string;
    content: string;
    dealScope?: string;
  } | null;
  detectedThemes: string[];
}

export interface MandateValidationResponse {
  validation: MandateValidationAnalysis;
  provider: string;
  model: string;
  latencyMs: number;
}

export async function validatePartnershipMandateApi(data: {
  title: string;
  content: string;
  tags?: string[];
}): Promise<MandateValidationAnalysis | null> {
  try {
    const token = localStorage.getItem('setu_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/v1/ai/validate-mandate', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.warn('Mandate validation HTTP status:', res.status);
      return null;
    }

    const body = await res.json();
    if (body.data?.validation) {
      return body.data.validation;
    }
    return null;
  } catch (err) {
    console.error('Failed to validate partnership mandate with AI:', err);
    return null;
  }
}
