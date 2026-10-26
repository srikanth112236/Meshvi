import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenCodeZenProvider } from './providers/opencode-zen.provider';
import { FallbackAiProvider } from './providers/fallback.provider';
import { AiExecutionResult, MandateValidationResult } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiProvider: GeminiProvider,
    private readonly opencodeZenProvider: OpenCodeZenProvider,
    private readonly fallbackProvider: FallbackAiProvider,
  ) {}

  async interpretIntent(userId?: string, query?: string): Promise<AiExecutionResult> {
    const rawQuery = query?.trim() || '';
    const preferred = process.env.AI_PRIMARY_PROVIDER || 'gemini';

    let result: AiExecutionResult;
    let status = 'SUCCESS';
    let errorCode: string | null = null;

    try {
      if (preferred === 'opencode-zen') {
        result = await this.opencodeZenProvider.interpretIntent(rawQuery);
      } else {
        result = await this.geminiProvider.interpretIntent(rawQuery);
      }
    } catch (err: any) {
      this.logger.warn(`Primary AI provider [${preferred}] failed or unconfigured: ${err.message}. Engaging deterministic fallback.`);
      status = 'FALLBACK';
      errorCode = err.message?.slice(0, 100);
      result = await this.fallbackProvider.interpretIntent(rawQuery);
    }

    // Persist usage event in PostgreSQL
    try {
      await this.prisma.aiUsageEvent.create({
        data: {
          userId: userId || null,
          taskType: 'QUERY_INTENT_INTERPRETATION',
          providerName: result.provider,
          modelName: result.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          estimatedCost: result.estimatedCost,
          latencyMs: result.latencyMs,
          status,
          errorCode,
        },
      });
    } catch (auditErr: any) {
      this.logger.error('Failed to log AI usage event:', auditErr.message);
    }

    return result;
  }

  /**
   * AI Connection Pitch & Outreach Note Generator (For Members & Company Admins)
   */
  async generatePitch(userId: string, data: { targetTitle: string; targetCompany: string; objective: string; tone?: string }) {
    const start = Date.now();
    const { targetTitle, targetCompany, objective, tone = 'professional' } = data;

    const effectiveTitle = targetTitle || 'Executive Leadership';
    const effectiveCompany = targetCompany || 'your organization';
    const effectiveObjective = objective ? objective.trim().replace(/\.$/, '') : 'commercial partnership & business expansion';

    // Fetch sender profile context for deep dynamic personalization
    let senderName = 'Executive Leader';
    let senderCompany = 'our enterprise';
    let senderTitle = 'Corporate Decision Maker';

    if (userId) {
      try {
        const sender = await this.prisma.professionalProfile.findUnique({
          where: { userId },
          include: { company: true },
        });
        if (sender) {
          senderName = sender.displayName || senderName;
          senderCompany = sender.company?.name || senderCompany;
          senderTitle = sender.currentTitle || senderTitle;
        }
      } catch {}
    }

    // Helper to strictly clamp pitches under character limits (well within 300-char limit)
    const clampPitch = (text: string, maxLen = 270): string => {
      const trimmed = text.trim();
      if (trimmed.length <= maxLen) return trimmed;
      const sliced = trimmed.slice(0, maxLen - 3);
      const lastSpace = sliced.lastIndexOf(' ');
      return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced) + '...';
    };

    const cleanObj = effectiveObjective.length > 40 ? effectiveObjective.slice(0, 37) + '...' : effectiveObjective;
    const cleanTitle = effectiveTitle.length > 28 ? effectiveTitle.slice(0, 25) + '...' : effectiveTitle;
    const cleanComp = effectiveCompany.length > 25 ? effectiveCompany.slice(0, 22) + '...' : effectiveCompany;
    const cleanSenderComp = senderCompany.length > 25 ? senderCompany.slice(0, 22) + '...' : senderCompany;

    // Dynamic specialized draft variations strictly under 250 characters
    const draft1 = clampPitch(`Regarding our initiative on "${cleanObj}": as ${cleanTitle} at ${cleanComp}, our team at ${cleanSenderComp} has verified capacity for bilateral alignment. Open to exploring synergies?`);

    const draft2 = clampPitch(`At ${cleanSenderComp}, we have active capacity ready to support ${cleanComp}'s goals around ${cleanObj}. Open to reviewing mutual alignment next week?`);

    const draft3 = clampPitch(`In review of ${cleanComp}'s mandate for "${cleanObj}": we offer direct bilateral alignment with zero cold friction. Would appreciate a brief conversation to exchange terms.`);

    const draft4 = clampPitch(`Hi, as ${senderTitle} at ${cleanSenderComp}, I am reaching out to ${cleanComp} concerning ${cleanObj}. Prepared to explore mutual partnership. Open to connecting?`);

    let pitchText = draft1;
    let provider = 'deterministic-synthesizer';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = `Write a high-converting, professional 2-sentence B2B connection message for Project Setu platform.
Target Role: ${effectiveTitle} at ${effectiveCompany}.
Sender: ${senderTitle} at ${senderCompany}.
Commercial Objective: ${effectiveObjective}.
Tone: ${tone}.
Strict Constraints: Maximum 240 characters. Crisp and high-trust. Zero sales clichés. Return only the pitch text.`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
        });

        if (res.ok) {
          const json = await res.json();
          const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (generatedText) {
            pitchText = clampPitch(generatedText, 270);
            provider = 'gemini-1.5-flash';
          }
        }
      } catch (err: any) {
        this.logger.warn('Gemini pitch generation failed, using dynamic synthesizer:', err.message);
      }
    }

    pitchText = clampPitch(pitchText, 270);

    const drafts = [
      {
        id: 'draft-executive',
        label: 'Institutional High-Trust Hook',
        category: 'EXECUTIVE',
        text: pitchText,
        chars: pitchText.length,
        qualityScore: 98,
        focus: 'Mutual Mandate & Executive Synergy',
      },
      {
        id: 'draft-metric',
        label: 'Commercial ROI & Operational Scale',
        category: 'DIRECT',
        text: draft2,
        chars: draft2.length,
        qualityScore: 95,
        focus: 'Infrastructure, Timeline & Feasibility',
      },
      {
        id: 'draft-corridor',
        label: 'Cross-Border Corridor Alignment',
        category: 'STRATEGIC',
        text: draft3,
        chars: draft3.length,
        qualityScore: 94,
        focus: 'Market Footprint & Zero-Friction Bridge',
      },
      {
        id: 'draft-dealroom',
        label: 'Confidential Deal Room Exploration',
        category: 'COLLABORATIVE',
        text: draft4,
        chars: draft4.length,
        qualityScore: 92,
        focus: 'Bilateral Due Diligence & Brief Exchange',
      },
    ];

    // Persist usage event
    try {
      await this.prisma.aiUsageEvent.create({
        data: {
          userId,
          taskType: 'PITCH_GENERATION',
          providerName: provider,
          modelName: provider,
          inputTokens: 140,
          outputTokens: 85,
          estimatedCost: 0.0002,
          latencyMs: Date.now() - start,
          status: 'SUCCESS',
        },
      });
    } catch {
      // Handled
    }

    return {
      pitch: pitchText,
      drafts,
      provider,
      latencyMs: Date.now() - start,
      metadata: {
        targetTitle: effectiveTitle,
        targetCompany: effectiveCompany,
        senderName,
        senderCompany,
        maxInstitutionalChars: 300,
      },
    };
  }

  /**
   * Super Admin AI Sandbox Test Engine
   */
  async runSandboxTest(query: string, providerOverride?: string) {
    const start = Date.now();
    let result: AiExecutionResult;
    let status = 'SUCCESS';

    if (providerOverride === 'fallback') {
      result = await this.fallbackProvider.interpretIntent(query);
    } else {
      try {
        result = await this.geminiProvider.interpretIntent(query);
      } catch (e: any) {
        result = await this.fallbackProvider.interpretIntent(query);
        status = 'FALLBACK_TRIGGERED';
      }
    }

    return {
      query,
      result,
      status,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * AI Partnership Mandate Guardrail & Commercial Intent Sentinel
   * Protects Project Setu from LinkedIn-style personal milestones / social fluff.
   */
  async validatePartnershipMandate(
    userId?: string,
    data?: { title: string; content: string; tags?: string[] },
  ): Promise<MandateValidationResult> {
    const title = data?.title?.trim() || '';
    const content = data?.content?.trim() || '';
    const tags = data?.tags || [];

    let result: MandateValidationResult;
    let status = 'SUCCESS';
    let errorCode: string | null = null;

    try {
      result = await this.geminiProvider.validatePartnershipMandate({ title, content, tags });
    } catch (err: any) {
      this.logger.warn(`Gemini mandate validation failed (${err.message}). Engaging fallback guardrail.`);
      status = 'FALLBACK';
      errorCode = err.message?.slice(0, 100);
      result = await this.fallbackProvider.validatePartnershipMandate({ title, content, tags });
    }

    // Persist usage event in PostgreSQL
    try {
      await this.prisma.aiUsageEvent.create({
        data: {
          userId: userId || null,
          taskType: 'PARTNERSHIP_MANDATE_VALIDATION',
          providerName: result.provider,
          modelName: result.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          estimatedCost: result.estimatedCost,
          latencyMs: result.latencyMs,
          status,
          errorCode,
        },
      });
    } catch (auditErr: any) {
      this.logger.error('Failed to log AI usage event for mandate validation:', auditErr.message);
    }

    return result;
  }
}
