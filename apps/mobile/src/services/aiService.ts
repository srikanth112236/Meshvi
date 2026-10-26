import { apiRequest } from './api';

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

export async function validatePartnershipMandateApi(data: {
  title: string;
  content: string;
  tags?: string[];
}): Promise<MandateValidationAnalysis | null> {
  const cleanTitle = (data.title || '').trim();
  const cleanContent = (data.content || '').trim();
  const cleanTags = data.tags || [];

  if (cleanTitle.length < 3 && cleanContent.length < 8) {
    return null;
  }

  // 1. Primary: Direct Gemini AI Call via Backend API
  try {
    const res = await apiRequest<{ validation: MandateValidationAnalysis }>('/ai/validate-mandate', {
      method: 'POST',
      body: {
        title: cleanTitle,
        content: cleanContent,
        tags: cleanTags,
      },
      timeoutMs: 12000,
    });

    if (res && res.data && res.data.validation) {
      return res.data.validation;
    }
    if ((res as any)?.validation) {
      return (res as any).validation;
    }
  } catch (err) {
    console.warn('AI validation endpoint unavailable, engaging strict fallback sentinel:', err);
  }

  // 2. Strict Offline Fallback Sentinel (Identical to backend fallback.provider.ts)
  const fullText = `${cleanTitle} ${cleanContent}`.toLowerCase();

  const personalPatterns = [
    /\bproud to announce\b/,
    /\bexcited to announce\b/,
    /\bthrilled to share\b/,
    /\bstarted my journey\b/,
    /\bstarting my venture\b/,
    /\bstepping down\b/,
    /\bjoined .* as\b/,
    /\bhappy to share\b/,
    /\bmy new role\b/,
    /\bwork anniversary\b/,
    /\bgraduation\b/,
    /\bhustle\b/,
    /\bnever give up\b/,
    /\bdream big\b/,
    /\bmotivational\b/,
    /\blife update\b/,
    /\bgrateful for\b/,
    /\bpromoted to\b/,
    /\bpromotion\b/,
    /\bcongratulate me\b/,
    /\blooking for a job\b/,
    /\bhiring me\b/,
    /\bresume\b/,
  ];

  const commercialKeywords = [
    /\bjoint venture\b/,
    /\bjv\b/,
    /\bdistribution\b/,
    /\bdistributor\b/,
    /\bpartner\b/,
    /\bpartnership\b/,
    /\balliance\b/,
    /\bsupplier\b/,
    /\bsourcing\b/,
    /\bprocurement\b/,
    /\boem\b/,
    /\blicensing\b/,
    /\bco-investment\b/,
    /\bconsortium\b/,
    /\brfp\b/,
    /\brfi\b/,
    /\bofftake\b/,
    /\bcounterparty\b/,
    /\bcorridor\b/,
    /\bmerchandise\b/,
    /\bchannel\b/,
  ];

  const isPersonal = personalPatterns.some((p) => p.test(fullText));
  const commercialCount = commercialKeywords.filter((k) => k.test(fullText)).length;

  if (isPersonal && commercialCount === 0) {
    return {
      isCompliant: false,
      score: 10,
      classification: 'PERSONAL_MILESTONE',
      flagReason: 'This post appears to celebrate a personal career update or motivational milestone without actionable commercial partnership criteria.',
      politeFeedback: 'Project Setu Partnerships is reserved exclusively for bilateral commercial partnerships, joint ventures, co-investments, supplier alliances, or corporate business interests.',
      suggestedRemedy: 'Please define a specific corporate requirement: target counterparty profile, geographical corridor, or bilateral commercial scope.',
      suggestedRewrite: {
        title: `Strategic Bilateral Partnership: ${cleanTitle.replace(/^(excited|proud|happy|thrilled).*?:?/i, '').trim() || 'Corporate Alliance'}`,
        content: `Seeking accredited corporate counterparties to collaborate on strategic market distribution. Target entities must possess verified trade credentials and bilateral fulfillment capacity.`,
        dealScope: 'Bilateral Commercial Agreement',
      },
      detectedThemes: ['Personal Milestone', 'Career Update'],
    };
  }

  if (commercialCount >= 2 && cleanTitle.length >= 8 && cleanContent.length >= 20) {
    return {
      isCompliant: true,
      score: Math.min(96, 85 + commercialCount * 3),
      classification: 'COMMERCIAL_PARTNERSHIP',
      flagReason: null,
      politeFeedback: 'Your mandate meets Project Setu corporate requirements for bilateral commercial alignment and reciprocal enterprise value.',
      suggestedRemedy: null,
      suggestedRewrite: null,
      detectedThemes: ['B2B Partnership', 'Commercial Mandate', 'Corporate Sourcing'],
    };
  }

  if (commercialCount === 1 && cleanTitle.length >= 10 && cleanContent.length >= 30) {
    return {
      isCompliant: true,
      score: 72,
      classification: 'COMMERCIAL_PARTNERSHIP',
      flagReason: null,
      politeFeedback: 'Commercial intent detected. Consider detailing deal volume thresholds or target jurisdictional corridors to maximize institutional counterparty fit.',
      suggestedRemedy: null,
      suggestedRewrite: null,
      detectedThemes: ['Commercial Intent', 'Bilateral Alliance'],
    };
  }

  // Strict Unclear Intent Flag
  return {
    isCompliant: false,
    score: 30,
    classification: 'UNCLEAR_INTENT',
    flagReason: 'Mandate lacks clear bilateral commercial scope, counterparty qualifications, or defined trade requirements.',
    politeFeedback: 'Project Setu Deal Exchange requires clear business terms, bilateral requirements, or target counterparty credentials.',
    suggestedRemedy: 'Specify target partner credentials, trade volume expectations, delivery corridors, or co-investment scope.',
    suggestedRewrite: {
      title: cleanTitle ? `Seeking Commercial Partner for ${cleanTitle}` : 'Seeking Tier-1 Regional Distribution Partner',
      content: `${cleanContent || 'Seeking verified enterprise partners with established industry footprint'}. Counterparties must have accredited operational licenses and proven bilateral track record.`,
      dealScope: 'Bilateral Commercial Mandate',
    },
    detectedThemes: ['Incomplete Intent', 'Review Needed'],
  };
}
