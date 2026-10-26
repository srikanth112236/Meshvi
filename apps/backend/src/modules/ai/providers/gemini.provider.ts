import { Injectable, Logger } from '@nestjs/common';
import {
  AiProviderInterface,
  AiExecutionResult,
  InterpretedIntent,
  MandateValidationResult,
  MandateValidationAnalysis,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProviderInterface {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);

  async interpretIntent(query: string): Promise<AiExecutionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const start = Date.now();

    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is not configured in server environment.');
    }

    const systemPrompt = `You are the intent parsing engine for Project Setu (a B2B professional discovery platform).
Analyze the user's business query and extract structured criteria as valid JSON only with keys:
"targetFunction" (string or null),
"targetIndustry" (string or null),
"targetCountry" (2-letter ISO country code or null),
"targetSeniority" (string or null),
"searchKeywords" (array of strings),
"reasoningSummary" (brief explanation).
Do not enclose in markdown blocks. Return pure JSON.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Query: "${query}"` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const jsonRes = await response.json();
    const candidateText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Gemini API returned empty response candidate.');
    }

    const parsed: InterpretedIntent = JSON.parse(candidateText);
    const usage = jsonRes.usageMetadata || {};

    return {
      intent: {
        targetFunction: parsed.targetFunction || null,
        targetIndustry: parsed.targetIndustry || null,
        targetCountry: parsed.targetCountry ? parsed.targetCountry.toUpperCase() : null,
        targetSeniority: parsed.targetSeniority || null,
        searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords : [],
        reasoningSummary: parsed.reasoningSummary || 'Extracted via Google Gemini intent model.',
      },
      provider: this.name,
      model,
      inputTokens: usage.promptTokenCount || query.split(/\s+/).length * 4,
      outputTokens: usage.candidatesTokenCount || 60,
      latencyMs: Date.now() - start,
      estimatedCost: 0.0001,
    };
  }

  async validatePartnershipMandate(data: {
    title: string;
    content: string;
    tags?: string[];
  }): Promise<MandateValidationResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const start = Date.now();

    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is not configured in server environment.');
    }

    const systemPrompt = `You are the Corporate Mandate Sentinel for Project Setu (a high-trust B2B intent-driven partnership platform).
Project Setu is NOT LinkedIn. Content celebrating personal career milestones (e.g. 'Started a new position', 'Proud to share my promotion', 'Work anniversary', 'Motivational hustle quotes', generic self-help, or vague startup announcements lacking bilateral requirements) is STRICTLY FLAGGED.
Project Setu Partnerships is reserved exclusively for bilateral commercial partnerships, joint ventures, co-investments, supplier alliances, OEM integration, distribution agreements, or concrete corporate business interests.

Analyze the given partnership title and requirements. Return pure JSON with:
{
  "isCompliant": boolean, // true only if commercial bilateral partnership or corporate connection intent
  "score": number, // 0 to 100
  "classification": "COMMERCIAL_PARTNERSHIP" | "PERSONAL_MILESTONE" | "MOTIVATIONAL_FLUFF" | "RETAIL_PROMOTION" | "UNCLEAR_INTENT",
  "flagReason": string | null,
  "politeFeedback": string, // courteous, professional explanation. If flagged, explain why Project Setu is exclusively for bilateral corporate partnerships and what is needed.
  "suggestedRemedy": string | null, // concrete guidance on how to reframe
  "suggestedRewrite": {
    "title": string,
    "content": string,
    "dealScope": string
  } | null,
  "detectedThemes": string[]
}
Return pure JSON with no markdown wrapping.`;

    const candidateModels = Array.from(
      new Set([model === 'gemini-2.5-flash' ? 'gemini-1.5-flash' : model, 'gemini-1.5-flash', 'gemini-2.0-flash'])
    );

    const promptPayload = `Partnership Title: "${data.title}"
Partnership Mandate & Requirements: "${data.content}"
Tags: ${(data.tags || []).join(', ')}`;

    let activeModel = candidateModels[0];
    let response: any = null;
    let lastError: any = null;

    for (const m of candidateModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2200);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${promptPayload}` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          activeModel = m;
          break;
        }

        const errText = await response.text();
        lastError = new Error(`Gemini API [${m}] returned status ${response.status}: ${errText}`);
        if (response.status === 503 || response.status === 429) {
          this.logger.warn(`Model ${m} busy (${response.status}). Trying alternative Gemini model...`);
          continue;
        }
        throw lastError;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        break; // Drop immediately to ultra-fast fallback provider
      }
    }

    if (!response || !response.ok) {
      throw lastError || new Error('All candidate Gemini models failed.');
    }

    const jsonRes = await response.json();
    const candidateText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Gemini API returned empty response candidate.');
    }

    const parsed: MandateValidationAnalysis = JSON.parse(candidateText);
    const usage = jsonRes.usageMetadata || {};

    return {
      validation: {
        isCompliant: Boolean(parsed.isCompliant),
        score: typeof parsed.score === 'number' ? parsed.score : parsed.isCompliant ? 90 : 20,
        classification: parsed.classification || (parsed.isCompliant ? 'COMMERCIAL_PARTNERSHIP' : 'PERSONAL_MILESTONE'),
        flagReason: parsed.flagReason || null,
        politeFeedback: parsed.politeFeedback || 'Please ensure your post specifies a commercial partnership mandate.',
        suggestedRemedy: parsed.suggestedRemedy || null,
        suggestedRewrite: parsed.suggestedRewrite || null,
        detectedThemes: Array.isArray(parsed.detectedThemes) ? parsed.detectedThemes : [],
      },
      provider: this.name,
      model: activeModel,
      inputTokens: usage.promptTokenCount || (data.title + ' ' + data.content).split(/\s+/).length * 4,
      outputTokens: usage.candidatesTokenCount || 100,
      latencyMs: Date.now() - start,
      estimatedCost: 0.0001,
    };
  }
}
