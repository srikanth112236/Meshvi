import { Injectable, Logger } from '@nestjs/common';
import {
  AiProviderInterface,
  AiExecutionResult,
  InterpretedIntent,
  MandateValidationResult,
  MandateValidationAnalysis,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class FallbackAiProvider implements AiProviderInterface {
  readonly name = 'deterministic-fallback';
  private readonly logger = new Logger(FallbackAiProvider.name);

  async interpretIntent(query: string): Promise<AiExecutionResult> {
    const start = Date.now();
    const text = query.toLowerCase();

    let targetFunction: string | null = null;
    let targetIndustry: string | null = null;
    let targetCountry: string | null = null;
    let targetSeniority: string | null = null;

    // Normalize common B2B search typos before classification
    let normalized = text
      .replace(/\bloking\b/g, 'looking')
      .replace(/\bprocurmenet\b|\bprocurment\b|\bprocur\b|\bpurchesing\b/g, 'procurement')
      .replace(/\bpatnership\b|\bpatner\b|\bpartenr\b|\bpatners\b/g, 'partnership')
      .replace(/\bdistributer\b|\bdistributon\b/g, 'distribution')
      .replace(/\bmanufacuter\b|\bmanfacturing\b/g, 'manufacturing');

    if (normalized.includes('partner') || normalized.includes('alliance') || normalized.includes('commercial')) {
      targetFunction = 'Commercial & BD';
    } else if (normalized.includes('procure') || normalized.includes('sourcing') || normalized.includes('supply chain') || normalized.includes('purchasing')) {
      targetFunction = 'Procurement';
    } else if (normalized.includes('sales') || normalized.includes('business development') || normalized.includes('bd')) {
      targetFunction = 'Business Development';
    } else if (normalized.includes('tech') || normalized.includes('software') || normalized.includes('engineer') || normalized.includes('developer')) {
      targetFunction = 'Engineering & AI';
    }

    if (normalized.includes('logistic') || normalized.includes('supply chain') || normalized.includes('cold-chain') || normalized.includes('storage') || normalized.includes('warehouse')) {
      targetIndustry = 'Supply Chain & Logistics';
    } else if (normalized.includes('beverage') || normalized.includes('food') || normalized.includes('fmcg') || normalized.includes('organic') || normalized.includes('agro') || normalized.includes('dairy')) {
      targetIndustry = 'FMCG & Consumer Goods';
    } else if (normalized.includes('cloud') || normalized.includes('saas') || normalized.includes('software') || /\bai\b/i.test(normalized) || normalized.includes('artificial intelligence')) {
      targetIndustry = 'Enterprise Software & AI';
    } else if (normalized.includes('solar') || normalized.includes('renewable') || normalized.includes('energy') || normalized.includes('cleantech')) {
      targetIndustry = 'Renewable Energy & CleanTech';
    }

    if (normalized.includes('director') || normalized.includes('head')) targetSeniority = 'Director / Head';
    else if (normalized.includes('vp') || normalized.includes('president') || normalized.includes('exec') || normalized.includes('ceo') || normalized.includes('chief')) targetSeniority = 'C-Level';
    else if (normalized.includes('manager') || normalized.includes('lead')) targetSeniority = 'Manager / Lead';

    const matchedCountries: string[] = [];
    if (/\b(india|indian|bangalore|bengaluru|somandapalli|anantapur|mumbai|delhi|hyderabad|chennai|pune|kolkata|vadodara)\b/i.test(normalized)) {
      matchedCountries.push('IN');
    }
    if (/\b(malaysia|malaysian|kuala lumpur|penang)\b/i.test(normalized)) {
      matchedCountries.push('MY');
    }
    if (/\b(singapore)\b/i.test(normalized)) {
      matchedCountries.push('SG');
    }
    if (/\b(japan|japanese|tokyo|osaka)\b/i.test(normalized)) {
      matchedCountries.push('JP');
    }
    if (/\b(germany|german|deutschland|berlin|munich|frankfurt)\b/i.test(normalized)) {
      matchedCountries.push('DE');
    }
    if (/\b(uk|united kingdom|britain|london)\b/i.test(normalized)) {
      matchedCountries.push('GB');
    }
    if (/\b(us|united states|america|usa)\b/i.test(normalized)) {
      matchedCountries.push('US');
    }
    if (/\b(uae|dubai|abu dhabi)\b/i.test(normalized)) {
      matchedCountries.push('AE');
    }
    if (matchedCountries.length > 0) {
      targetCountry = matchedCountries.join(',');
    }

    const tokens = query.split(/\s+/).filter((t) => t.length > 3);

    const intent: InterpretedIntent = {
      targetFunction,
      targetIndustry,
      targetCountry,
      targetSeniority,
      searchKeywords: tokens,
      reasoningSummary: `Deterministic normalization identified: Function=${targetFunction || 'General'}, Industry=${targetIndustry || 'Cross-Industry'}, Country=${targetCountry || 'Global'}`,
    };

    return {
      intent,
      provider: this.name,
      model: 'rule-based-nlp-v1',
      inputTokens: query.split(/\s+/).length,
      outputTokens: 45,
      latencyMs: Date.now() - start,
      estimatedCost: 0,
    };
  }

  async validatePartnershipMandate(data: {
    title: string;
    content: string;
    tags?: string[];
  }): Promise<MandateValidationResult> {
    const start = Date.now();
    const text = `${data.title} ${data.content}`.toLowerCase();

    // Check for personal milestone patterns
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
    ];

    // Check for commercial partnership keywords
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
    ];

    const isPersonal = personalPatterns.some((p) => p.test(text));
    const commercialCount = commercialKeywords.filter((k) => k.test(text)).length;

    let isCompliant = false;
    let score = 25;
    let classification: MandateValidationAnalysis['classification'] = 'PERSONAL_MILESTONE';
    let flagReason: string | null = null;
    let politeFeedback =
      'Project Setu Partnerships is reserved exclusively for bilateral commercial partnerships, joint ventures, co-investments, supplier alliances, or corporate business interests.';
    let suggestedRemedy: string | null = null;
    let suggestedRewrite = null;

    if (isPersonal && commercialCount === 0) {
      isCompliant = false;
      score = 15;
      classification = 'PERSONAL_MILESTONE';
      flagReason =
        'This post appears to celebrate a personal career update or motivational milestone without actionable commercial partnership criteria.';
      suggestedRemedy =
        'Please define a specific corporate requirement: target counterparty profile, geographical corridor, or bilateral commercial scope.';
      suggestedRewrite = {
        title: `Strategic Partnership Mandate: Commercial Collaboration for ${data.title.slice(0, 30)}`,
        content: `Seeking commercial partners to collaborate on strategic initiatives. Requirements: verified business entities with operational capacity in target sectors.`,
        dealScope: 'Bilateral Commercial Agreement',
      };
    } else if (commercialCount >= 2) {
      isCompliant = true;
      score = 88;
      classification = 'COMMERCIAL_PARTNERSHIP';
      flagReason = null;
      politeFeedback =
        'Your mandate meets Project Setu corporate requirements for bilateral commercial alignment.';
    } else {
      isCompliant = commercialCount > 0;
      score = isCompliant ? 65 : 35;
      classification = isCompliant ? 'COMMERCIAL_PARTNERSHIP' : 'UNCLEAR_INTENT';
      if (!isCompliant) {
        flagReason = 'Vague intent. Please specify bilateral requirements or target counterparty credentials.';
        suggestedRemedy = 'Add specific partner requirements, deal volume thresholds, or distribution scope.';
      }
    }

    return {
      validation: {
        isCompliant,
        score,
        classification,
        flagReason,
        politeFeedback,
        suggestedRemedy,
        suggestedRewrite,
        detectedThemes: isCompliant ? ['Commercial Alliance', 'B2B Sourcing'] : ['Milestone', 'Personal'],
      },
      provider: this.name,
      model: 'rule-based-guardrail-v1',
      inputTokens: (data.title + ' ' + data.content).split(/\s+/).length,
      outputTokens: 50,
      latencyMs: Date.now() - start,
      estimatedCost: 0,
    };
  }
}
