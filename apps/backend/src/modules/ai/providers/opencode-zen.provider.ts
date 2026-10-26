import { Injectable, Logger } from '@nestjs/common';
import { AiProviderInterface, AiExecutionResult, InterpretedIntent } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenCodeZenProvider implements AiProviderInterface {
  readonly name = 'opencode-zen';
  private readonly logger = new Logger(OpenCodeZenProvider.name);

  async interpretIntent(query: string): Promise<AiExecutionResult> {
    const apiKey = process.env.OPENCODE_ZEN_API_KEY;
    const baseUrl = process.env.OPENCODE_ZEN_BASE_URL || 'https://api.opencodezen.local/v1';
    const model = process.env.OPENCODE_ZEN_MODEL || 'zen-v1';
    const start = Date.now();

    if (!apiKey || apiKey.trim() === '') {
      throw new Error('OPENCODE_ZEN_API_KEY is not configured in server environment.');
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Extract B2B query intent as JSON with keys: targetFunction, targetIndustry, targetCountry, targetSeniority, searchKeywords, reasoningSummary.',
          },
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenCode Zen API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed: InterpretedIntent = JSON.parse(content);

    return {
      intent: {
        targetFunction: parsed.targetFunction || null,
        targetIndustry: parsed.targetIndustry || null,
        targetCountry: parsed.targetCountry ? parsed.targetCountry.toUpperCase() : null,
        targetSeniority: parsed.targetSeniority || null,
        searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords : [],
        reasoningSummary: parsed.reasoningSummary || 'Parsed via OpenCode Zen model.',
      },
      provider: this.name,
      model,
      inputTokens: data.usage?.prompt_tokens || 50,
      outputTokens: data.usage?.completion_tokens || 40,
      latencyMs: Date.now() - start,
      estimatedCost: 0.0001,
    };
  }
}
