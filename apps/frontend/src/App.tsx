import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationDrawer } from './components/ui/NotificationDrawer';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { ForCompaniesPage } from './pages/public/ForCompaniesPage';
import { ForProfessionalsPage } from './pages/public/ForProfessionalsPage';
import { UseCasesPage } from './pages/public/UseCasesPage';
import { AboutPage } from './pages/public/AboutPage';
import { WhyMeshviPage } from './pages/public/WhyMeshviPage';
import { SearchShowcasePage } from './pages/public/SearchShowcasePage';
import { ContactPage } from './pages/public/ContactPage';
import { FaqPage } from './pages/public/FaqPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { LegalNoticePage } from './pages/public/LegalNoticePage';
import { DataUsagePage } from './pages/public/DataUsagePage';
import { CookiePolicyPage } from './pages/public/CookiePolicyPage';
import { DeleteAccountPage } from './pages/public/DeleteAccountPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { CompanyLoginPage } from './pages/public/CompanyLoginPage';
import { AdminLoginPage } from './pages/public/AdminLoginPage';
import { LinkedInCallbackPage } from './pages/public/LinkedInCallbackPage';
import { GoogleCallbackPage } from './pages/public/GoogleCallbackPage';
import { AcceptInvitationPage } from './pages/public/AcceptInvitationPage';

// Authenticated Pages
import { OnboardingPage } from './pages/app/OnboardingPage';
import { AppHomePage } from './pages/app/AppHomePage';
import { SearchPage } from './pages/app/SearchPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { SettingsPage } from './pages/app/SettingsPage';
import { ConnectionsPage } from './pages/app/ConnectionsPage';
import { RequestsPage } from './pages/app/RequestsPage';
import { IntroductionsPage } from './pages/app/IntroductionsPage';
import { MessagesPage } from './pages/app/MessagesPage';
import { AiAssistantPage } from './pages/app/AiAssistantPage';
import { MemberGuidePage } from './pages/app/MemberGuidePage';
import { ReverseMarketplacePage } from './pages/app/ReverseMarketplacePage';
import { OpportunitiesPage } from './pages/app/OpportunitiesPage';
import { PartnershipsPage } from './pages/app/PartnershipsPage';
import { PartnershipRequestsPage } from './pages/app/PartnershipRequestsPage';
import { DealRoomsListPage } from './pages/app/DealRoomsListPage';
import { DealRoomPage } from './pages/app/DealRoomPage';

// Company Portal Pages
import { CompanyLayout } from './components/layout/CompanyLayout';
import { CompanyDashboardPage } from './pages/company/CompanyDashboardPage';
import { CompanyClaimPage } from './pages/company/CompanyClaimPage';
import { CompanyTeamPage } from './pages/company/CompanyTeamPage';
import { CompanyMandatesPage } from './pages/company/CompanyMandatesPage';
import { CompanyAiMatcherPage } from './pages/company/CompanyAiMatcherPage';
import { CompanyGuidePage } from './pages/company/CompanyGuidePage';

import { CompanyPipelinePage } from './pages/company/CompanyPipelinePage';
import { CompanyRoutingPage } from './pages/company/CompanyRoutingPage';
import { CompanyLineagePage } from './pages/company/CompanyLineagePage';
import { CompanyProposalsPage } from './pages/company/CompanyProposalsPage';
import { CompanyConnectionsPage } from './pages/company/CompanyConnectionsPage';

// Admin Pages & Layout
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminImportsPage } from './pages/admin/AdminImportsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAiConsolePage } from './pages/admin/AdminAiConsolePage';
import { AdminGuidePage } from './pages/admin/AdminGuidePage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminVerificationQueuePage } from './pages/admin/AdminVerificationQueuePage';
import { AdminModerationPage } from './pages/admin/AdminModerationPage';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <NotificationDrawer />
          <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/search-showcase" element={<SearchShowcasePage />} />
            <Route path="/why-meshvi" element={<WhyMeshviPage />} />
            <Route path="/for-companies" element={<ForCompaniesPage />} />
            <Route path="/for-professionals" element={<ForProfessionalsPage />} />
            <Route path="/use-cases" element={<UseCasesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/legal" element={<LegalNoticePage />} />
            <Route path="/data-usage" element={<DataUsagePage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/delete-account" element={<DeleteAccountPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/invite" element={<AcceptInvitationPage />} />
            <Route path="/invite/:token" element={<AcceptInvitationPage />} />
          </Route>

          {/* Standalone OAuth Clearance Handover Gateways (Clean Executive Full-Screen Experience) */}
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/auth/linkedin/callback" element={<LinkedInCallbackPage />} />

          {/* Dedicated Isolated Portal Logins */}
          <Route path="/company/login" element={<CompanyLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* 1. Consumer Hub (CONSUMER only - Strictly excludes COMPANY_ADMIN & SUPER_ADMIN) */}
          <Route
            element={
              <ProtectedRoute
                allowedPortal="CONSUMER"
                allowedRoles={['USER', 'COMPANY_ADMIN']}
                disallowedRoles={['SUPER_ADMIN']}
                loginUrl="/login"
                portalName="Consumer Hub"
              />
            }
          >
            <Route path="/app/onboarding" element={<OnboardingPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/home" replace />} />
              <Route path="home" element={<AppHomePage />} />
              <Route path="partnerships" element={<PartnershipsPage />} />
              <Route path="partnerships/requests" element={<PartnershipRequestsPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="reverse-marketplace" element={<ReverseMarketplacePage />} />
              <Route path="ai-assistant" element={<AiAssistantPage />} />
              <Route path="connections" element={<ConnectionsPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="introductions" element={<IntroductionsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="guide" element={<MemberGuidePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="deal-rooms" element={<DealRoomsListPage />} />
              <Route path="deal-rooms/:id" element={<DealRoomPage />} />
            </Route>
          </Route>

          {/* 2. Company Portal (COMPANY_ADMIN only - Strictly excludes SUPER_ADMIN and non-company accounts) */}
          <Route
            element={
              <ProtectedRoute
                allowedPortal="COMPANY_ADMIN"
                allowedRoles={['COMPANY_ADMIN']}
                disallowedRoles={['SUPER_ADMIN']}
                loginUrl="/company/login"
                portalName="Company Portal"
              />
            }
          >
            <Route path="/company/onboarding" element={<Navigate to="/company" replace />} />
            <Route path="/company" element={<CompanyLayout />}>
              <Route index element={<CompanyDashboardPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="connections" element={<CompanyConnectionsPage />} />
              <Route path="pipeline" element={<CompanyPipelinePage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="deal-rooms" element={<DealRoomsListPage />} />
              <Route path="deal-rooms/:id" element={<DealRoomPage />} />
              <Route path="proposals" element={<CompanyProposalsPage />} />
              <Route path="routing" element={<CompanyRoutingPage />} />
              <Route path="lineage" element={<CompanyLineagePage />} />
              <Route path="mandates" element={<CompanyMandatesPage />} />
              <Route path="ai-matcher" element={<CompanyAiMatcherPage />} />
              <Route path="claim" element={<CompanyClaimPage />} />
              <Route path="team" element={<CompanyTeamPage />} />
              <Route path="guide" element={<CompanyGuidePage />} />
            </Route>
          </Route>

          {/* 3. Admin Ops Portal (SUPER_ADMIN only - Strictly isolated) */}
          <Route
            element={
              <ProtectedRoute
                allowedPortal="SUPER_ADMIN"
                allowedRoles={['SUPER_ADMIN']}
                loginUrl="/admin/login"
                portalName="Admin Ops Portal"
              />
            }
          >
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="verification" element={<AdminVerificationQueuePage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route path="ai-console" element={<AdminAiConsolePage />} />
              <Route path="imports" element={<AdminImportsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="moderation" element={<AdminModerationPage />} />
              <Route path="guide" element={<AdminGuidePage />} />
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-bg text-navy text-center px-4">
                <div>
                  <h1 className="text-5xl font-black text-navy mb-2">404</h1>
                  <p className="text-sm text-text-muted mb-4">The page you requested could not be found.</p>
                  <a href="/" className="text-xs font-semibold text-primary hover:underline">
                    &larr; Return to MESHVI Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
