import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PORTAL_SCOPE_KEY, PortalScopeType } from '../decorators/portal-scope.decorator';

@Injectable()
export class PortalScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<PortalScopeType[]>(PORTAL_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PORTAL_ACCESS_VIOLATION',
        message: 'No authenticated user identity found for portal clearance verification.',
      });
    }

    const userScope = user.portalScope as PortalScopeType;
    const hasScope = requiredScopes.includes(userScope);

    if (!hasScope) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PORTAL_ACCESS_VIOLATION',
        message: `Security Isolation: Active token portal scope [${userScope}] is strictly prohibited from accessing [${requiredScopes.join(
          ', ',
        )}]. Session terminated.`,
      });
    }

    return true;
  }
}
