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

const mandateCache = new Map<string, MandateValidationAnalysis>();

export async function validatePartnershipMandateApi(data: {
  title: string;
  content: string;
  tags?: string[];
}): Promise<MandateValidationAnalysis | null> {
  const cacheKey = `${data.title.trim().toLowerCase()}_${data.content.trim().toLowerCase()}`;
  if (mandateCache.has(cacheKey)) {
    return mandateCache.get(cacheKey)!;
  }

  // Instant client-side check for obvious personal announcement fluff
  const combinedText = `${data.title} ${data.content}`.toLowerCase();
  if (
    combinedText.includes('happy to share') ||
    combinedText.includes('excited to announce') ||
    combinedText.includes('started my new startup') ||
    combinedText.includes('work anniversary') ||
    combinedText.includes('proud to announce')
  ) {
    const instantResult: MandateValidationAnalysis = {
      isCompliant: false,
      score: 25,
      classification: 'PERSONAL_MILESTONE',
      flagReason: 'Personal announcement detected. MESHVI is strictly for bilateral commercial partnerships.',
      politeFeedback: 'Project Setu is dedicated to corporate partnerships, procurement, and joint ventures rather than personal updates.',
      suggestedRemedy: 'Reframe with your commercial partnership scope, target counterparty industry, or supplier requirements.',
      suggestedRewrite: {
        title: `Strategic Joint Venture & B2B Growth: ${data.title.replace(/happy to share|started my new startup/gi, '').trim() || 'Commercial Expansion'}`,
        content: `Seeking commercial distribution, technology co-development, or strategic partners for enterprise scaling. Target counterparties: Series A+ enterprise leaders and industrial suppliers.`,
        dealScope: 'Bilateral Joint Venture',
      },
      detectedThemes: ['Startup Expansion', 'Commercial Alliance'],
    };
    mandateCache.set(cacheKey, instantResult);
    return instantResult;
  }

  try {
    const token = localStorage.getItem('setu_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/v1/ai/validate-mandate', {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify(data),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('Mandate validation HTTP status:', res.status);
      return null;
    }

    const body = await res.json();
    if (body.data?.validation) {
      mandateCache.set(cacheKey, body.data.validation);
      return body.data.validation;
    }
    return null;
  } catch (err) {
    console.warn('Fast mandate validation fallback:', err);
    return null;
  }
}
