export type Role = 'EXECUTIVE' | 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  mobile?: string;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  avatarUrl?: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  displayName: string;
  headline?: string;
  summary?: string;
  avatarUrl?: string;
  currentTitle?: string;
  currentCompanyName?: string;
  corporateLineage?: string;
  department?: string;
  function?: string;
  seniority?: string;
  industry?: string;
  subIndustry?: string;
  companyType?: string;
  domain?: string;
  city?: string;
  countryCode?: string;
  intents?: Intent[];
  firewallRules?: string[];
  receptionProtocols?: Array<'DEAL_ROOM' | 'SCHEDULED_CALL'>;
}

export interface Intent {
  id?: string;
  intentType: 'LOOKING_FOR' | 'OFFERING' | 'NOT_LOOKING_FOR';
  description: string;
}

export interface BilateralMatch {
  id: string;
  partnerName: string;
  partnerTitle: string;
  partnerCompany: string;
  partnerAvatar?: string;
  synergyScore: number;
  departmentOverlap: string[];
  seekingSummary: string;
  offeringSummary: string;
  countryCode: string;
  city: string;
  dealRoomStatus?: 'NOT_STARTED' | 'ACTIVE' | 'NDA_PENDING' | 'LOCKED';
}

export interface DealRoom {
  id: string;
  counterpartyName: string;
  counterpartyCompany: string;
  counterpartyAvatar?: string;
  ndaStatus: 'SIGNED' | 'MUTUAL_REVIEW' | 'PENDING';
  mutualSynergy: number;
  primaryAgenda: string;
  unlockedAt: string;
  lastActivity: string;
  calendarSlotBooked?: string;
  meetUrl?: string;
  googleCalendarUrl?: string;
}

export interface MessageThread {
  id: string;
  recipientName: string;
  recipientCompany: string;
  recipientAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  verifiedMatch: boolean;
}
