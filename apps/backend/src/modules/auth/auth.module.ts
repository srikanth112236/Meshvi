import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailSenderService } from './mail-sender.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PortalScopeGuard } from './guards/portal-scope.guard';
import { PrismaService } from '../../database/prisma.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { getJwtSecret } from '../../common/config/jwt.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailSenderService,
    JwtStrategy,
    PortalScopeGuard,
    RateLimitGuard,
    PrismaService,
  ],
  exports: [AuthService, MailSenderService, JwtModule, PassportModule, PortalScopeGuard, PrismaService],
})
export class AuthModule {}
