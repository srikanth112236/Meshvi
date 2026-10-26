import { SetMetadata } from '@nestjs/common';

export const PORTAL_SCOPE_KEY = 'portalScope';
export type PortalScopeType = 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN';

export const PortalScope = (...scopes: PortalScopeType[]) => SetMetadata(PORTAL_SCOPE_KEY, scopes);
