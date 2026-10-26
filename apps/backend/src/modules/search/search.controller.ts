import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { CreateSavedSearchDto } from './dto/saved-search.dto';
import { QualifyIntentDto } from './dto/qualify-intent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalScopeGuard } from '../auth/guards/portal-scope.guard';
import { PortalScope } from '../auth/decorators/portal-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RateLimitGuard, RateLimit } from '../../common/guards/rate-limit.guard';

@ApiTags('Intent Discovery & Search')
@Controller('search')
@UseGuards(RateLimitGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @RateLimit({ limit: 60, windowMs: 60000, actionName: 'INTENT_SEARCH' })
  @ApiOperation({ summary: 'Intent-driven discovery and structured search over permitted records' })
  @ApiResponse({ status: 200, description: 'Ranked search results with explainability signals' })
  async search(
    @CurrentUser() user: any,
    @Query() queryDto: SearchQueryDto,
  ) {
    return this.searchService.search(user.id, queryDto);
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Universal search autocomplete suggestions after 2 characters' })
  async suggest(@Query('q') q: string) {
    return this.searchService.suggest(q);
  }

  @Get('facets')
  @ApiOperation({ summary: 'Universal dynamic search facets (industries, territories, functions, seniorities)' })
  async getFacets() {
    return this.searchService.getSearchFacets();
  }

  @Get('opportunity-graph')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #1: Map commercial objective to organizations, buying committees, and warm routes' })
  async getOpportunityGraph(
    @CurrentUser() user: any,
    @Query('q') query: string,
  ) {
    return this.searchService.buildOpportunityGraph(user.id, query || 'airport lounge beverage partnerships in Malaysia');
  }

  @Get('two-sided-fit/:profileId')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Differentiator #2: Symmetrical two-sided fit between sender offering and recipient demand' })
  async getTwoSidedFit(
    @CurrentUser() user: any,
    @Param('profileId') profileId: string,
  ) {
    return this.searchService.getTwoSidedFit(user.id, profileId);
  }

  @Get('market-corridors')
  @ApiOperation({ summary: 'Differentiator #3 (Option B): Market-Corridor Opportunity Finder across trade routes' })
  async getMarketCorridors(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('category') category?: string,
    @Query('compliance') compliance?: string,
    @Query('q') q?: string,
  ) {
    return this.searchService.findMarketCorridors(origin, destination, category, compliance, q);
  }

  @Get('qualification-questions')
  @ApiOperation({ summary: 'Differentiator #10: Dynamic query-contextual interview step generator' })
  async getQualificationQuestions(
    @CurrentUser() user: any,
    @Query('q') query: string,
  ) {
    return this.searchService.generateQualificationQuestions(user?.id || 'guest-session', query || '');
  }

  @Post('qualify-intent')
  @ApiOperation({ summary: 'Differentiator #10: Interactive Opportunity Qualification Interview & Match Engine' })
  async qualifyIntent(
    @CurrentUser() user: any,
    @Body() dto: QualifyIntentDto,
  ) {
    return this.searchService.qualifyOpportunityIntent(user?.id || 'guest-session', dto);
  }

  @Get('lookalikes/:profileId')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #18: Discover lookalike organizations and executive profiles' })
  @ApiResponse({ status: 200, description: 'Ranked lookalike candidates with shared attribute breakdown' })
  async findLookalikes(
    @CurrentUser() user: any,
    @Param('profileId') profileId: string,
  ) {
    return this.searchService.findLookalikes(user.id, profileId);
  }

  @Post('saved')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #15: Save an intent search configuration with alerts' })
  async saveSearch(
    @CurrentUser() user: any,
    @Body() dto: CreateSavedSearchDto,
  ) {
    return this.searchService.saveSearch(user.id, dto.name, dto.query, dto.filters, dto.alertFrequency);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #15: List user saved searches' })
  async getSavedSearches(@CurrentUser() user: any) {
    return this.searchService.getSavedSearches(user.id);
  }

  @Delete('saved/:id')
  @UseGuards(JwtAuthGuard, PortalScopeGuard)
  @PortalScope('CONSUMER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature #15: Delete a saved search' })
  async deleteSavedSearch(
    @CurrentUser() user: any,
    @Param('id') savedSearchId: string,
  ) {
    return this.searchService.deleteSavedSearch(user.id, savedSearchId);
  }
}
