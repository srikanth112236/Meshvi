import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

describe('ContactController', () => {
  let controller: ContactController;

  const mockContactService = {
    submitContact: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        message: 'Thank you for getting in touch. Your message has been received.',
        enquiryType: dto.enquiryType,
        receivedAt: new Date().toISOString(),
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: mockContactService,
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should accept a valid contact submission', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      enquiryType: 'Business Partnerships',
      message: 'Looking to explore collaboration.',
      consent: true,
    };
    const response = await controller.submit(dto);
    expect(response.message).toContain('received');
    expect(response.enquiryType).toBe('Business Partnerships');
  });
});
