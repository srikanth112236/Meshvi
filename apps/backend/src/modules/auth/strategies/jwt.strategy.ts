import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'setu_super_secret_jwt_key_dev_2026_min_32_chars!',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    portalScope?: 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN';
    roles?: string[];
    tokenType?: string;
  }) {
    if (payload.tokenType && payload.tokenType !== 'ACCESS') {
      throw new UnauthorizedException('Invalid token type. Only access tokens are permitted for resource authorization.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: true,
        profile: true,
        memberships: {
          where: { membershipStatus: 'ACTIVE' },
          include: { company: true },
        },
      },
    });

    if (!user || user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('User account is invalid or suspended');
    }

    const userRoles: string[] = (user.roles || []).map((r) => r.role);

    // Validate that portalScope on the token is legitimately held by the user
    const portalScope =
      payload.portalScope ||
      (userRoles.includes('SUPER_ADMIN')
        ? 'SUPER_ADMIN'
        : userRoles.includes('COMPANY_ADMIN')
        ? 'COMPANY_ADMIN'
        : 'CONSUMER');

    return {
      id: user.id,
      email: user.email,
      roles: userRoles,
      portalScope,
      profile: user.profile,
      memberships: user.memberships,
    };
  }
}
