import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

describe('ProfilesController', () => {
  let controller: ProfilesController;

  const mockProfilesService = {
    getMyProfile: jest.fn().mockResolvedValue({
      id: 'p1',
      displayName: 'Srikanth M',
      headline: 'Commercial Lead',
    }),
    updateOnboarding: jest.fn().mockImplementation((userId, dto) =>
      Promise.resolve({
        id: 'p1',
        displayName: dto.displayName || 'Srikanth M',
        headline: dto.headline || 'Commercial Lead',
      }),
    ),
    getProfileById: jest.fn().mockResolvedValue({
      id: 'p1',
      displayName: 'Srikanth M',
      visibility: 'PUBLIC',
    }),
    addIntentTag: jest.fn().mockResolvedValue({
      success: true,
      intent: { id: 'intent-1', intentType: 'NOT_LOOKING_FOR', description: 'Staffing inquiries' },
    }),
    deleteIntentTag: jest.fn().mockResolvedValue({
      success: true,
      message: 'Intent tag removed successfully.',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get current user profile', async () => {
    const profile = await controller.getMyProfile({ id: 'u1' });
    expect(profile.id).toBe('p1');
    expect(profile.displayName).toBe('Srikanth M');
  });

  it('should update onboarding progression', async () => {
    const updated = await controller.updateOnboarding(
      { id: 'u1' },
      { displayName: 'Srikanth M Updated', headline: 'VP Alliances' },
    );
    expect(updated.displayName).toBe('Srikanth M Updated');
  });

  it('should add and delete commercial intent tags (Feature #17)', async () => {
    mockProfilesService.addIntentTag = jest.fn().mockResolvedValue({
      success: true,
      intent: { id: 'intent-1', intentType: 'NOT_LOOKING_FOR', description: 'Staffing inquiries' },
    });
    mockProfilesService.deleteIntentTag = jest.fn().mockResolvedValue({
      success: true,
      message: 'Intent tag removed successfully.',
    });

    const addRes = await controller.addIntentTag(
      { id: 'u1' },
      { intentType: 'NOT_LOOKING_FOR', description: 'Staffing inquiries' },
    );
    expect(addRes.intent.intentType).toBe('NOT_LOOKING_FOR');

    const delRes = await controller.deleteIntentTag({ id: 'u1' }, 'intent-1');
    expect(delRes.success).toBe(true);
  });
});
