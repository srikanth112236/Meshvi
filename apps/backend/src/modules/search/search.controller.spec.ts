import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;

  const mockSearchService = {
    search: jest.fn().mockImplementation((userId, dto) =>
      Promise.resolve({
        query: dto.q || '',
        totalMatches: 1,
        results: [
          {
            rank: 1,
            score: 85,
            scoreBreakdown: {
              functionScore: 35,
              geoScore: 25,
              industryScore: 20,
              seniorityScore: 0,
              intentScore: 10,
              penalties: 0,
            },
            reasonCodes: ['FUNCTION_ALIGNMENT', 'GEO_PROXIMITY'],
            explanation: 'Role matches functional domain "Commercial & Partnerships"; Located in target market (MY)',
            profile: {
              id: 'p1',
              displayName: 'Srikanth M',
              currentTitle: 'Head of Strategic Partnerships',
              function: 'Commercial & Partnerships',
              countryCode: 'MY',
            },
          },
        ],
      }),
    ),
    findLookalikes: jest.fn().mockResolvedValue({
      seedProfile: { id: 'p1', displayName: 'Srikanth M' },
      totalLookalikesFound: 1,
      lookalikes: [
        {
          profileId: 'p2',
          displayName: 'Marcus Chen',
          similarityScore: 80,
          sharedAttributes: ['Same Functional Domain: Commercial & Partnerships'],
        },
      ],
    }),
    saveSearch: jest.fn().mockResolvedValue({
      success: true,
      message: 'Search saved',
      savedSearch: { id: 'ss-1', name: 'Airport Beverage Leads', alertFrequency: 'DAILY' },
    }),
    getSavedSearches: jest.fn().mockResolvedValue([
      { id: 'ss-1', name: 'Airport Beverage Leads', alertFrequency: 'DAILY' },
    ]),
    deleteSavedSearch: jest.fn().mockResolvedValue({
      success: true,
      message: 'Saved search deleted successfully.',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should execute search and return ranked results with explanations', async () => {
    const res = await controller.search(
      { id: 'u1' },
      { q: 'airport lounge beverage partnerships in Malaysia' },
    );
    expect(res.totalMatches).toBe(1);
    expect(res.results[0].explanation).toContain('Commercial & Partnerships');
    expect(res.results[0].reasonCodes).toContain('FUNCTION_ALIGNMENT');
  });

  it('should return scoreBreakdown and support negative filters (Features #13 & #16)', async () => {
    const res = await controller.search(
      { id: 'u1' },
      {
        q: 'airport lounge beverage partnerships',
        excludeKeywords: 'staffing, recruiter',
        excludeIndustries: 'Recruitment',
      },
    );
    expect(res.results[0].scoreBreakdown).toBeDefined();
    expect(res.results[0].scoreBreakdown.functionScore).toBe(35);
    expect(res.results[0].scoreBreakdown.geoScore).toBe(25);
  });

  it('should discover lookalike profiles (Feature #18)', async () => {
    const res = await controller.findLookalikes({ id: 'u1' }, 'p1');
    expect(res.totalLookalikesFound).toBe(1);
    expect(res.lookalikes[0].displayName).toBe('Marcus Chen');
    expect(res.lookalikes[0].similarityScore).toBe(80);
  });

  it('should create, list, and delete saved searches with alerts (Feature #15)', async () => {
    const saveRes = await controller.saveSearch({ id: 'u1' }, {
      name: 'Airport Beverage Leads',
      query: 'beverage distribution',
      alertFrequency: 'DAILY',
    });
    expect(saveRes.success).toBe(true);
    expect(saveRes.savedSearch.name).toBe('Airport Beverage Leads');

    const listRes = await controller.getSavedSearches({ id: 'u1' });
    expect(listRes.length).toBe(1);

    const delRes = await controller.deleteSavedSearch({ id: 'u1' }, 'ss-1');
    expect(delRes.success).toBe(true);
  });
});
