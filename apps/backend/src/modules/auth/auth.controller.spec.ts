import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        message: 'Account registered successfully',
        token: 'mock_jwt_token',
        user: { id: 'u1', email: dto.email, roles: ['USER'], profile: { id: 'p1' } },
      }),
    ),
    login: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        message: 'Login successful',
        token: 'mock_jwt_token',
        user: { id: 'u1', email: dto.email, roles: ['USER'], profile: { id: 'p1' } },
      }),
    ),
    forgotPassword: jest.fn().mockResolvedValue({
      message: 'If an account exists with that email, password recovery instructions have been sent.',
    }),
    getMe: jest.fn().mockResolvedValue({
      id: 'u1',
      email: 'srikanth@vedasynk.local',
      roles: ['USER'],
      profile: { id: 'p1', displayName: 'Srikanth M' },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user and return token', async () => {
    const res = await controller.register({
      name: 'Srikanth M',
      email: 'srikanth@vedasynk.local',
      password: 'SecurePassword123!',
      agreeTerms: true,
    });
    expect(res.token).toBe('mock_jwt_token');
    expect(res.user.email).toBe('srikanth@vedasynk.local');
  });

  it('should login and return token', async () => {
    const res = await controller.login({
      email: 'srikanth@vedasynk.local',
      password: 'SecurePassword123!',
    });
    expect(res.token).toBe('mock_jwt_token');
  });
});
