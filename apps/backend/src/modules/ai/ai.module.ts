import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenCodeZenProvider } from './providers/opencode-zen.provider';
import { FallbackAiProvider } from './providers/fallback.provider';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    GeminiProvider,
    OpenCodeZenProvider,
    FallbackAiProvider,
    PrismaService,
  ],
  exports: [AiService],
})
export class AiModule {}
