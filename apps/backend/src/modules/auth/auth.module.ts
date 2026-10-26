import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailSenderService } from './mail-sender.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PortalScopeGuard } from './guards/portal-scope.guard';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'setu_super_secret_jwt_key_dev_2026_min_32_chars!',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailSenderService, JwtStrategy, PortalScopeGuard, PrismaService],
  exports: [AuthService, MailSenderService, JwtModule, PassportModule, PortalScopeGuard],
})
export class AuthModule {}
