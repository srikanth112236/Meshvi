# Project Setu — Complete MVP Implementation Specification

**Version:** 1.1  
**Prepared by:** Srikanth M — Vedasynk Technologies  
**Date:** October 2026  
**Purpose:** Master product and engineering specification for an AI coding agent.

> **Product UI theme:** light background, navy typography, sky-blue primary actions, and blue-toned highlights. Use clear contrast and restrained color.  
> **Implementation approach:** web-first, company-first, hybrid professional-data strategy, both direct connection requests and introduction requests, billing undecided.

---

## 0. How to use this specification

This document is the implementation source of truth for the Project Setu MVP. Read it before coding. Inspect the existing repository before changing it. Build in phases, run tests, and report evidence for completed work.

Every requirement is classified as:

- **Confirmed:** explicitly selected for this project.
- **Proposed:** recommended implementation choice that can be changed with approval.
- **Undecided:** requires a product/business decision; do not invent an answer.

### Confirmed planning choices

| Area | Decision |
|---|---|
| Product | Project Setu |
| Initial market focus | Company-first discovery and relevant decision-makers |
| Data strategy | Hybrid: first-party profiles, controlled CSV imports, and a licensed data provider when approved |
| Connection mode | Direct connection requests and introduction requests |
| Billing | Undecided; no payment enforcement in the MVP |
| Delivery | Web-first |
| Initial portals | Public website, authenticated consumer application, company workflows, superadmin |
| AI | Gemini API and OpenCode Zen through a server-side provider abstraction |
| Theme | Light background with navy and sky-blue actions/highlights |
| Search integrity | Search only real, permitted records; no fabricated professionals |
| Accuracy claims | No promise of 90–100% match accuracy |

### Proposed technical stack

- Frontend: React + TypeScript + Vite + React Router.
- Backend: Node.js + TypeScript + NestJS.
- Database: PostgreSQL.
- Search: PostgreSQL full-text search and structured filters first; pgvector only when evaluated.
- API documentation: OpenAPI.
- Validation: strict runtime schemas such as Zod or equivalent.
- Email: transactional-email adapter and outbox.
- Testing: unit, integration, authorization, end-to-end and security tests.

The agent may recommend a different choice after repository inspection, but must document the reason before implementing it.

---

# 1. Product vision and scope

## 1.1 What Project Setu is

Project Setu is an intent-driven professional and business connection platform. A user explains a business objective in plain language; Setu helps identify relevant companies, functions, roles and available professionals, explains why a record may be relevant, and provides a contextual way to request a connection or introduction.

**Positioning:** “Who do you need to connect with?”

Example request:

> I have an airport-lounge opportunity in Malaysia. Help me identify relevant commercial, partnerships or business-development contacts at beverage companies.

Setu translates the request into searchable criteria, retrieves actual records, ranks the results, and explains supported relevance signals. It must not claim that a person is the definitive decision-maker without evidence.

## 1.2 Core workflow

Business objective → intent interpretation → company/function discovery → permitted record retrieval → ranking → explanation → connection or introduction request → conversation → optional outcome feedback.

## 1.3 MVP portals

1. **Public website:** explain Setu, build trust and convert visitors to registrations.
2. **Consumer web application:** profiles, company/professional discovery, search, requests, connections, messaging and settings.
3. **Company workflows:** company creation/claim, authorized company administration and employee invitations.
4. **Superadmin portal:** user/company oversight, data imports, source configuration, moderation, usage and audit visibility.

Mobile applications, subscriptions, payment gateway, advanced opportunity tracking, automated outreach and machine-learned ranking are deferred unless separately approved.

## 1.4 Non-negotiable product rules

- Never invent people, companies, roles, employment or contact details.
- Never label an unverified record as verified.
- Never present an AI-generated guess as source data.
- Never expose restricted provider fields.
- Never scrape restricted platforms or bypass access controls.
- Never promise a fixed search accuracy percentage.
- Clearly label seed/demo records.
- Keep billing inactive until the business model is confirmed.

---

# 2. Design system — light, navy and sky blue

## 2.1 Visual direction

Create a polished, calm, premium B2B SaaS interface. The visual language should communicate clarity, trust and useful discovery—not a social-media feed or a cluttered CRM.

### Color tokens

Use CSS variables and semantic tokens; do not scatter raw hex values throughout components.

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#F8FAFC` | Main light page background |
| `--color-surface` | `#FFFFFF` | Cards, dialogs and navigation surfaces |
| `--color-surface-muted` | `#F1F5F9` | Secondary panels and input backgrounds |
| `--color-text` | `#0F172A` | Main text |
| `--color-text-muted` | `#64748B` | Secondary text |
| `--color-border` | `#E2E8F0` | Borders and dividers |
| `--color-navy` | `#102A43` | Brand headings, sidebar and strong text |
| `--color-navy-hover` | `#173B5E` | Navy interactive hover |
| `--color-primary` | `#0284C7` | Main sky-blue action |
| `--color-primary-hover` | `#0369A1` | Primary action hover |
| `--color-primary-soft` | `#E0F2FE` | Selected states and highlights |
| `--color-focus` | `#38BDF8` | Visible keyboard focus |
| `--color-success` | `#15803D` | Success state |
| `--color-warning` | `#B45309` | Warning state |
| `--color-danger` | `#B91C1C` | Destructive/error state |

Verify contrast for every foreground/background combination. Do not use color as the only signal for status.

## 2.2 Typography

- Primary font: **Manrope**.
- Fallback: system sans-serif.
- Use consistent type scales for display, page title, section title, body, helper text, labels and buttons.
- Use readable line lengths and avoid overly small body text.

## 2.3 Layout and components

- Max-width public content container: approximately 1200–1280px.
- Use a consistent 4px/8px spacing system.
- Rounded corners: restrained, approximately 8–14px.
- Use subtle borders and light shadows, not heavy glassmorphism.
- Primary buttons: sky blue with accessible text contrast.
- Secondary buttons: white or muted surface with navy text and border.
- Destructive buttons: clear red treatment and confirmation when necessary.
- Use consistent skeletons, loading indicators, empty states and error recovery.
- Respect `prefers-reduced-motion`.
- Make forms keyboard accessible and label all fields.
- Keep public navigation distinct from authenticated application navigation.

## 2.4 Public website layout

- Public header: logo, How it works, For companies, For professionals, Use cases, Log in, Get started.
- Hero: clear headline, short explanation and prominent CTA.
- Show a product workflow or clearly labelled demo, not fake live results.
- Use use-case cards and trust/privacy section.
- Footer: product links, contact, privacy and terms.

## 2.5 Application layout

- Light background.
- White top bar and/or sidebar.
- Navy navigation labels and headings.
- Sky-blue primary actions and active navigation.
- White cards with subtle borders.
- Search input prominent on discovery pages.
- Filters visually secondary to the search objective.
- Result cards must explain relevance and show data freshness.
- Use accessible status badges for pending, verified, outdated and failed states.

## 2.6 Admin layout

Use a separate admin shell with clear “Admin” identity, left navigation, summary metrics, data tables, filters and confirmation dialogs for sensitive actions. Keep the same brand tokens and light theme. Never expose secrets in configuration screens.

---

# 3. Public website pages and exact copy

## 3.1 Home `/`

### Hero
**Headline:** Who do you need to connect with?

**Subheadline:** Describe your business objective. Discover relevant companies and professionals, understand why they may be a fit, and start a meaningful business connection.

**Primary CTA:** Start discovering  
**Secondary CTA:** See how Setu works

**Trust note:** Results depend on available professional information. Suggestions help identify potential connections; they do not guarantee decision-making authority.

### Problem
**Heading:** Finding the right person should not require knowing their exact job title.

You may know the company, industry, market and outcome you want. The challenge is identifying which team or professional is responsible. Similar responsibilities can have different titles across companies.

### Solution
**Heading:** Start with your objective, not a list of job titles.

- **Understand the need:** Describe your objective in plain language.
- **Discover relevant people:** Explore permitted records across relevant companies and functions.
- **Connect with context:** Explain why you are reaching out and request a connection or introduction.

### Company discovery
**Heading:** Find organizations that can move your objective forward.

Explore companies by industry, geography, business focus and available company information. Then discover relevant professional functions where records are available.

### Use cases
- Business partnerships
- Sales and business development
- Market entry and distribution
- Procurement and suppliers
- Corporate collaboration
- Professional networking

### Trust
**Heading:** Relevant discovery starts with trustworthy information.

Setu is designed to distinguish available information from verified information, explain why a result is suggested, and support correction requests.

### Final CTA
**Heading:** Start with the business outcome you want.  
**CTA:** Create your account

## 3.2 How it works `/how-it-works`

Explain:
1. Create a professional profile.
2. Describe the business objective.
3. Review relevant companies and roles.
4. Explore available professional records.
5. Review supported relevance and freshness signals.
6. Request a connection or introduction.
7. Continue the conversation if accepted.

Clarify that recommendations are based on the records currently available.

## 3.3 For companies `/for-companies`

**Headline:** Make your organization easier to discover for relevant business objectives.

Create a company profile with industry, markets, locations and business focus. Authorized representatives can request control of a company profile and invite employees.

**CTA:** Register as a company representative

Explain that company claims and employee affiliations may require verification. A company profile does not imply that every employee or department is represented.

## 3.4 For professionals `/for-professionals`

**Headline:** Help relevant business opportunities find their way to you.

Create a professional profile describing your role, expertise, company affiliation, geography and the professional connections you welcome.

**CTA:** Create a professional profile

Explain profile visibility and contact privacy in plain language.

## 3.5 Use cases `/use-cases`

Include sections for:
- Finding partnership leaders
- Discovering sales/commercial teams
- Finding distributors in a new market
- Discovering procurement contacts
- Finding business specialists
- Exploring corporate collaboration

Each section contains a problem, example request, matching attributes, expected workflow and limitations.

## 3.6 About `/about`

Explain the philosophy: business discovery should begin with the user's objective, rather than requiring the user to know the exact person or title in advance. Do not invent team biographies, customer counts, testimonials or traction.

## 3.7 Contact `/contact`

Fields:
- Name
- Business email
- Company (optional)
- Enquiry type
- Message
- Appropriate consent checkbox

Validate on both frontend and backend, rate-limit submissions and prevent spam.

## 3.8 FAQ `/faq`

Include:
- What is Project Setu?
- How does discovery work?
- Does Setu have every professional's details?
- Are all profiles verified?
- How are results ranked?
- Can I request a connection?
- What is an introduction request?
- How can I correct a profile?
- How does Setu handle data and privacy?
- Is a paid subscription required?

Answers must reflect the actual deployed features and approved policies. Do not claim a provider, feature or verification process exists until configured.

## 3.9 Legal pages

Create structures for `/privacy` and `/terms`, plus data correction/deletion support. Legal copy requires appropriate review before production and must not be presented as final legal advice.

---

# 4. Route map and access policy

## 4.1 Public routes

| Route | Access |
|---|---|
| `/` | Public |
| `/how-it-works` | Public |
| `/for-companies` | Public |
| `/for-professionals` | Public |
| `/use-cases` | Public |
| `/about` | Public |
| `/contact` | Public |
| `/faq` | Public |
| `/privacy` | Public |
| `/terms` | Public |
| `/login` | Public |
| `/register` | Public |
| `/forgot-password` | Public |
| `/reset-password` | Valid reset token |
| `/verify-email` | Valid verification token |

## 4.2 Consumer routes

| Route | Requirement |
|---|---|
| `/app` | Authenticated user |
| `/app/onboarding` | Authenticated user; incomplete onboarding |
| `/app/home` | Authenticated user |
| `/app/search` | Authenticated user |
| `/app/search/:searchId` | Owner/authorized access |
| `/app/companies` | Authenticated user |
| `/app/companies/:companyId` | Authenticated user and permitted record |
| `/app/professionals/:profileId` | Authenticated user and permitted profile |
| `/app/connections` | Authenticated user |
| `/app/requests` | Authenticated user |
| `/app/introductions` | Authenticated user |
| `/app/messages` | Authenticated user |
| `/app/messages/:conversationId` | Conversation participant |
| `/app/notifications` | Authenticated user |
| `/app/profile` | Authenticated user |
| `/app/settings` | Authenticated user |
| `/app/privacy` | Authenticated user |

## 4.3 Company routes

- `/company`
- `/company/profile`
- `/company/team`
- `/company/invitations`
- `/company/verification`
- `/company/settings`

Require a verified/authorized company membership and enforce the relevant role on the backend.

## 4.4 Superadmin routes

- `/admin`
- `/admin/users`
- `/admin/users/:userId`
- `/admin/companies`
- `/admin/companies/:companyId`
- `/admin/professionals`
- `/admin/imports`
- `/admin/imports/:importId`
- `/admin/data-sources`
- `/admin/provider-usage`
- `/admin/ai-usage`
- `/admin/connections`
- `/admin/reports`
- `/admin/audit-logs`
- `/admin/settings`

Frontend guards are for navigation only. Every protected API must enforce authentication, role, resource scope and ownership. A client must never be able to assign itself `SUPER_ADMIN`.

---

# 5. Onboarding requirements

## 5.1 Professional onboarding

### Step 1 — Account
Name, email, password or approved authentication method, terms acceptance and relevant privacy acknowledgement.

### Step 2 — Professional identity
Display name, current title, summary, current company (optional), function, industry, city/country and optional image.

### Step 3 — Experience
Expertise, professional experience, previous roles (optional), industry experience and areas of responsibility.

### Step 4 — Business intent
What I am looking for, what I can help with, preferred industries/geographies and preferred connection types.

### Step 5 — Visibility
Explain which fields are public, signed-in-only or private. Contact details are not exposed by default.

### Step 6 — Review
Show a preview, allow draft saving and let the user complete optional fields later.

Acceptance criteria: resumable onboarding, persisted edits, duplicate-email prevention, correct field visibility and no cross-user profile editing.

## 5.2 Company onboarding

Collect company name, legal name (optional), website/domain, industry, description, headquarters, operating markets and company type. Search for an existing company and identify possible duplicates before creating a new one.

## 5.3 Company claim

1. Select an existing company or submit a new company.
2. Check duplicates.
3. Submit claim.
4. Verify via an approved method or send for manual review.
5. Admin approves, rejects or requests more evidence.
6. Authorized company administrators manage the profile and invitations.

Do not accept a claim solely because a person knows the company name or uploaded its logo.

## 5.4 Employee invitation

1. Company admin enters employee email.
2. Backend creates a time-limited, single-use invitation token.
3. Send the invitation email.
4. Employee authenticates or registers.
5. Employee explicitly accepts.
6. Link employee to company and invalidate token.
7. Log the action.

Store only a hash of the invitation token. Company admins do not automatically gain access to employees' private messages.

---

# 6. Hybrid data acquisition

Setu initially has incomplete professional data. The product must transparently handle that limitation.

## 6.1 Data sources

### A. First-party profiles
Professionals create and update their own profiles. Store ownership, visibility, verification and timestamps.

### B. Controlled CSV import
Superadmin imports company and professional records only when the source and intended use are permitted.

### C. Licensed professional-data provider
Integrate one initial provider behind an adapter. Evaluate coverage, geography, role quality, freshness, rights to display and store fields, deletion requirements, rate limits, pricing and API quality.

Do not assume an API plan grants customer-facing display rights or unlimited storage. Confirm the actual contract and terms before launch.

### D. Company data
Use company-submitted data, licensed datasets and public company information where permitted. Do not scrape restricted services or bypass access controls.

## 6.2 CSV import workflow

Upload → file/header validation → preview → row validation → duplicate detection → source/rights confirmation → admin confirmation → batch import → error report → audit log.

Requirements:
- CSV template download
- File size and encoding limits
- Dry-run preview
- Row-level errors
- Duplicate review
- Batch processing
- Import cancellation where safe
- Import status tracking
- Audit trail
- Formula-injection protection
- No search visibility until required validation is complete

Statuses: `UPLOADED`, `VALIDATING`, `PREVIEW_READY`, `IMPORTING`, `COMPLETED`, `COMPLETED_WITH_ERRORS`, `FAILED`, `CANCELLED`.

## 6.3 Data provenance

Where provider terms permit, track source type, provider, external ID, retrieval time, last verification, confidence, permitted use, expiry/retention and deletion status. Do not retain raw provider payloads beyond the permitted period.

## 6.4 Duplicate handling

Use normalized company domain/name, provider IDs and permitted identity signals. Uncertain person matches go to review; do not silently merge identities.

---

# 7. Database schema

Use PostgreSQL, UUID keys, UTC timestamps, foreign keys, migrations and indexes based on actual query patterns.

## 7.1 Core tables

### `users`
`id`, `email`, `email_normalized`, `password_hash` (nullable for external auth), `account_status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`.

### `user_roles`
`id`, `user_id`, `role`, `scope_type`, `scope_id`, `created_at`.

### `professional_profiles`
`id`, `user_id` (nullable for permitted external records), `display_name`, `headline`, `summary`, `current_company_id`, `current_title`, `function_id`, `seniority_id`, `industry_id`, `city`, `country_code`, `visibility`, `profile_status`, `verification_status`, `last_verified_at`, timestamps.

Externally sourced people without a Setu account must never be represented as registered members.

### `professional_experiences`
`id`, `professional_profile_id`, `company_id`, `title`, `function_id`, `start_date`, `end_date`, `is_current`, `source_record_id`, timestamps.

### `professional_expertise`
`id`, `professional_profile_id`, `expertise_term`, `normalized_term`, `source_type`, `created_at`.

### `professional_intents`
`id`, `professional_profile_id`, `intent_type`, `description`, `visibility`, timestamps.

### `profile_visibility_settings`
`id`, `professional_profile_id`, `field_name`, `visibility_level`, `updated_at`.

## 7.2 Company tables

### `companies`
`id`, `name`, `normalized_name`, `legal_name`, `domain`, `website_url`, `description`, `company_type`, `industry_id`, `sub_industry_id`, `headquarters_city`, `headquarters_country`, `verification_status`, `source_type`, `last_verified_at`, timestamps.

### `company_locations`
`id`, `company_id`, `city`, `region`, `country_code`, `location_type`, `source_record_id`.

### `company_memberships`
`id`, `company_id`, `user_id`, `company_role`, `membership_status`, `invited_by_user_id`, `joined_at`, timestamps.

### `company_claim_requests`
`id`, `company_id`, `requested_by_user_id`, `verification_method`, `evidence_reference`, `status`, `reviewed_by_user_id`, `reviewed_at`, `review_notes`, `created_at`.

### `company_invitations`
`id`, `company_id`, `invited_email`, `invited_by_user_id`, `token_hash`, `status`, `expires_at`, `accepted_by_user_id`, `created_at`.

## 7.3 Classification tables

- `industries`
- `functions`
- `seniority_levels`
- `expertise_terms`
- `normalized_job_titles`
- `job_title_aliases`

Normalize role aliases so equivalent responsibilities can match despite different titles.

## 7.4 Data source tables

### `data_sources`
`id`, `name`, `source_type`, `provider_key`, `status`, `permitted_usage`, `retention_policy_reference`, `configuration_reference`, timestamps.

Never store API secrets directly here.

### `source_records`
`id`, `data_source_id`, `entity_type`, `entity_id`, `external_record_id`, `retrieved_at`, `last_verified_at`, `source_confidence`, `freshness_status`, `permitted_usage`, `expires_at`, `deletion_status`, timestamps.

### `data_import_jobs`
`id`, `data_source_id`, `initiated_by_user_id`, `import_type`, `file_reference`, `status`, `total_rows`, `valid_rows`, `invalid_rows`, `imported_rows`, `failed_rows`, `started_at`, `completed_at`, `created_at`.

### `data_import_errors`
`id`, `import_job_id`, `row_number`, `field_name`, `error_code`, `safe_error_message`, `created_at`.

## 7.5 Search and AI tables

### `search_intents`
`id`, `user_id`, `raw_query`, `normalized_intent_json`, `selected_provider`, `model_name`, `status`, `created_at`.

Define retention/access rules for raw queries.

### `search_runs`
`id`, `search_intent_id`, `filters_json`, `candidate_count`, `returned_count`, `ranking_version`, `duration_ms`, `provider_usage_json`, `created_at`.

### `search_matches`
`id`, `search_run_id`, `professional_profile_id`, `rank_position`, `score`, `reason_codes`, `explanation`, `freshness_status`, `created_at`.

A match must reference a real, permitted record.

### `ai_usage_events`
`id`, `user_id`, `task_type`, `provider_name`, `model_name`, `input_tokens`, `output_tokens`, `estimated_cost`, `latency_ms`, `status`, `error_code`, `created_at`.

Mark costs as estimates unless reconciled with actual billing.

## 7.6 Connection and messaging tables

### `connections`
`id`, `requester_user_id`, `recipient_profile_id`, `status`, `business_reason`, `created_at`, `responded_at`, `updated_at`.

Statuses: `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED`, `WITHDRAWN`, `BLOCKED`.

### `introduction_requests`
`id`, `requester_user_id`, `target_profile_id`, `intermediary_user_id`, `company_id`, `business_reason`, `status`, timestamps.

An introduction is not “warm” unless a real intermediary exists and agrees.

### `conversations`
`id`, `conversation_type`, `created_by_user_id`, timestamps.

### `conversation_participants`
`id`, `conversation_id`, `user_id`, `joined_at`, `left_at`, `last_read_at`.

### `messages`
`id`, `conversation_id`, `sender_user_id`, `body`, `message_type`, `created_at`, `edited_at`, `deleted_at`.

Check participant authorization before reading or writing messages.

## 7.7 Notifications, privacy and audit

Create:
- `notifications`
- `notification_preferences`
- `email_outbox`
- `user_reports`
- `profile_correction_requests`
- `block_relationships`
- `audit_logs`
- `consent_records`
- `data_deletion_requests`
- `provider_usage_events`

Use explicit retention policies and avoid logging secrets or unnecessary personal data.

## 7.8 Indexes

Index normalized email, company name/domain, current company/title, professional function/industry/geography, external record identifiers, freshness/expiry, connection state, conversation participant/timestamp, notification state and import status. Use full-text indexes for relevant descriptive fields. Add indexes based on query plans, not guesswork.

---

# 8. Backend architecture and folder structure

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── validators/
│   │   └── errors/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── professionals/
│   │   ├── companies/
│   │   ├── onboarding/
│   │   ├── search/
│   │   ├── ai/
│   │   ├── data-sources/
│   │   ├── imports/
│   │   ├── connections/
│   │   ├── introductions/
│   │   ├── messaging/
│   │   ├── notifications/
│   │   ├── email/
│   │   ├── privacy/
│   │   ├── admin/
│   │   └── audit/
│   ├── jobs/
│   └── health/
├── test/
├── package.json
└── tsconfig.json
```

Each module should separate controllers, services, schemas/DTOs, data access and tests. Controllers should not contain business logic.

---

# 9. Frontend architecture and folder structure

```text
frontend/
├── public/
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router/
│   │   ├── providers/
│   │   ├── layouts/
│   │   └── guards/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── navigation/
│   │   ├── feedback/
│   │   └── data-display/
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── professionals/
│   │   ├── companies/
│   │   ├── search/
│   │   ├── connections/
│   │   ├── introductions/
│   │   ├── messaging/
│   │   ├── notifications/
│   │   ├── settings/
│   │   └── admin/
│   ├── pages/
│   │   ├── public/
│   │   ├── app/
│   │   ├── company/
│   │   └── admin/
│   ├── services/
│   │   ├── api-client.ts
│   │   ├── auth.service.ts
│   │   └── error-handler.ts
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── styles/
├── tests/
├── package.json
└── tsconfig.json
```

Use strict TypeScript, centralized API handling, shared validation contracts where practical, consistent server-state caching and accessible UI components. Do not place provider secrets or authorization decisions in the browser. Do not trust local storage as proof of authorization.

---

# 10. API contracts

Use `/api/v1`, consistent JSON errors, pagination, request IDs, input validation, rate limits and OpenAPI documentation.

## 10.1 Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/resend-verification`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`

Password-reset responses must not disclose whether an email is registered.

## 10.2 Professionals

- `GET /api/v1/professionals/me`
- `PATCH /api/v1/professionals/me`
- `GET /api/v1/professionals/:id`
- `GET /api/v1/professionals/me/experiences`
- `POST /api/v1/professionals/me/experiences`
- `PATCH /api/v1/professionals/me/experiences/:id`
- `DELETE /api/v1/professionals/me/experiences/:id`
- `PATCH /api/v1/professionals/me/visibility`

## 10.3 Companies

- `GET /api/v1/companies`
- `POST /api/v1/companies`
- `GET /api/v1/companies/:id`
- `PATCH /api/v1/companies/:id`
- `POST /api/v1/companies/:id/claim`
- `GET /api/v1/companies/:id/members`
- `POST /api/v1/companies/:id/invitations`
- `POST /api/v1/company-invitations/:token/accept`
- `POST /api/v1/companies/:id/verification`

## 10.4 Search

- `POST /api/v1/search/intent`
- `POST /api/v1/search/companies`
- `POST /api/v1/search/professionals`
- `GET /api/v1/search/:searchId`
- `POST /api/v1/search/:searchId/feedback`

Example request:

```json
{
  "query": "Find a commercial partnerships lead at a beverage company in Malaysia",
  "filters": {
    "companyIds": [],
    "countryCodes": ["MY"],
    "functions": ["partnerships", "commercial", "business_development"],
    "seniority": ["head", "director", "regional_lead"]
  },
  "page": 1,
  "pageSize": 10
}
```

Example intent output:

```json
{
  "objective": "Find a potential commercial partnership contact",
  "industries": ["beverages"],
  "geographies": ["MY"],
  "functions": ["partnerships", "commercial", "business_development"],
  "seniority": ["head", "director", "regional_lead"],
  "clarifyingQuestions": [],
  "warnings": []
}
```

These are contract examples, not hard-coded production responses.

## 10.5 Connections and introductions

- `POST /api/v1/connections`
- `GET /api/v1/connections`
- `GET /api/v1/connections/requests`
- `POST /api/v1/connections/:id/accept`
- `POST /api/v1/connections/:id/decline`
- `POST /api/v1/connections/:id/cancel`
- `POST /api/v1/introductions`
- `GET /api/v1/introductions`
- `PATCH /api/v1/introductions/:id`

Validate state transitions, permissions, block status, duplicates and rate limits.

## 10.6 Messaging and notifications

- `GET /api/v1/conversations`
- `POST /api/v1/conversations`
- `GET /api/v1/conversations/:id/messages`
- `POST /api/v1/conversations/:id/messages`
- `POST /api/v1/conversations/:id/read`
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/:id/read`
- `PATCH /api/v1/notification-preferences`

## 10.7 Admin and imports

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/status`
- `GET /api/v1/admin/companies`
- `PATCH /api/v1/admin/companies/:id`
- `POST /api/v1/admin/imports`
- `POST /api/v1/admin/imports/:id/preview`
- `POST /api/v1/admin/imports/:id/confirm`
- `GET /api/v1/admin/imports/:id`
- `GET /api/v1/admin/data-sources`
- `POST /api/v1/admin/data-sources`
- `GET /api/v1/admin/provider-usage`
- `GET /api/v1/admin/ai-usage`
- `GET /api/v1/admin/audit-logs`

Every admin endpoint must independently enforce permissions.

Use a consistent error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please review the submitted fields.",
    "requestId": "request-id",
    "fieldErrors": {}
  }
}
```

Never return raw SQL errors, secrets or unfiltered provider payloads.

---

# 11. Gemini and OpenCode Zen abstraction

## 11.1 Provider design

Create a typed provider interface for structured generation and text generation. Implement separate Gemini and OpenCode Zen adapters. Verify the current OpenCode Zen API endpoint, authentication format, supported models, structured-output capabilities and usage terms before implementation. Do not assume it is identical to Gemini.

Suggested tasks:
- `INTENT_EXTRACTION`
- `ROLE_EXPANSION`
- `MATCH_EXPLANATION`
- `MESSAGE_DRAFTING`

Prefer deterministic explanations from actual database fields. Do not call multiple models for every search by default.

## 11.2 Environment variables

```text
AI_PRIMARY_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=
OPENCODE_ZEN_API_KEY=
OPENCODE_ZEN_BASE_URL=
OPENCODE_ZEN_MODEL=
AI_REQUEST_TIMEOUT_MS=
AI_MAX_RETRIES=
AI_MAX_OUTPUT_TOKENS=
```

These are configuration names, not confirmation that a specific endpoint or model is available. Keep secrets on the backend and out of Git.

## 11.3 Intent extraction schema

The model should return a validated object with:
- Objective
- Target companies
- Industry
- Geography
- Functions
- Role aliases
- Seniority
- Expertise
- Optional constraints
- Missing information
- Clarifying questions
- Ambiguity warnings

Reject malformed output and unsupported values. Map model-generated role aliases to approved internal taxonomies. Never allow the model to generate arbitrary SQL.

## 11.4 Search execution

1. Validate the query and enforce quotas.
2. Call the configured AI provider when appropriate.
3. Validate structured output.
4. Normalize titles, companies, functions and geography.
5. Retrieve real candidates.
6. Enforce visibility, data rights and freshness filters.
7. Rank candidates.
8. Explain only supported matches.
9. Return paginated results and coverage limitations.
10. Record privacy-safe metrics.
11. Offer clarifying questions or broader filters when needed.

## 11.5 Provider failure

Use bounded retries and timeouts. If AI fails, fall back to ordinary structured/full-text search where possible. Do not fabricate a result to hide a provider outage. Log error codes and latency, not secrets or unnecessary personal data.

---

# 12. Ranking and evaluation

## 12.1 Retrieval stages

1. Enforce visibility, data-use rights and explicit hard constraints.
2. Retrieve candidates using company, geography, title/function, industry and full-text matching.
3. Rank candidates using a versioned function.
4. Explain the result using source attributes.
5. Return source/freshness metadata.

## 12.2 Initial ranking weights

These are starting hypotheses to evaluate, not validated performance claims.

| Signal | Initial weight |
|---|---:|
| Company match | 25 |
| Business objective relevance | 20 |
| Function/title relevance | 20 |
| Geography | 15 |
| Seniority | 10 |
| Expertise/industry | 5 |
| Freshness/verification | 5 |
| Total | 100 |

Handle missing values consistently. Do not treat missing data as a perfect match. A score is a ranking signal, not a probability.

## 12.3 Match explanations

Example:
- The current title maps to a commercial/partnership function.
- The record is associated with the requested company.
- The recorded geography matches the target market.
- The profile lists relevant industry experience.

Only show reasons supported by stored data. If a fact is unknown, say so.

## 12.4 Evaluation

Create 30–50 human-reviewed test queries, including company-specific, geography-specific, title-alias, ambiguous and no-result searches. Keep a held-out evaluation set.

Measure:
- Coverage rate
- Precision at 5 and 10
- Recall where known relevant sets exist
- NDCG when appropriate
- Freshness coverage
- Duplicate/invalid record rate
- No-result rate
- Latency and provider failures
- AI usage and cost per search
- User feedback and accepted-connection rate

Do not advertise a match-accuracy percentage without a documented metric, sample and evaluation process.

---

# 13. Connections, introductions and messaging

## 13.1 Direct connection request

The requester selects a profile and gives a contextual reason. The backend verifies permissions, visibility, block status, duplicates and limits; stores the request; creates an in-app notification; and queues an email when enabled.

## 13.2 Introduction request

Track requester, target, optional real intermediary, company context, business reason and status. Do not claim a warm introduction is available unless a real intermediary agrees.

## 13.3 State transitions

Allow only explicit transitions, such as `PENDING → ACCEPTED`, `PENDING → DECLINED` and `PENDING → CANCELLED`. Reject invalid transitions and record actor/time.

## 13.4 Anti-abuse

Implement per-user request limits, duplicate detection, blocking/reporting, message limits, suspicious activity monitoring and moderation. Do not implement mass outreach in the MVP.

## 13.5 Messaging

MVP: one-to-one conversations, history, sending, unread state and participant access controls. Only authorized participants may read or send messages.

## 13.6 Email

Transactional templates:
- Email verification
- Password reset
- Company invitation
- Company claim status
- Connection request
- Connection accepted
- Introduction status
- Essential security events

Use an email adapter and outbox queue. Retry failures with bounded exponential backoff. Do not claim delivery merely because a message was queued. Respect preferences and applicable law.

---

# 14. Superadmin portal

## 14.1 Dashboard

Display actual data for:
- Users and verified users
- Professional profiles
- Companies and pending claims
- Pending imports
- Search activity
- Connection requests
- Reports and correction requests
- AI/provider usage
- Failed jobs
- Recent admin actions

Never show invented production metrics. Demo data must be clearly labelled.

## 14.2 Management screens

**Users:** search, status, permitted profile view, suspend/reactivate, reports and deletion requests.

**Companies:** search, duplicate review, claims, verification, membership and correction requests.

**Data:** CSV upload, preview, invalid rows, duplicate review, source/freshness, import status and correction/deletion operations.

**AI and providers:** provider status, requests, errors, latency, quota failures, fallback rate, usage estimates and ranking version. Show masked configuration only, never API keys.

**Audit:** role changes, suspensions, company verification, import confirmation, provider changes, deletion and moderation actions.

---

# 15. Billing is undecided

Do not enforce subscriptions or payments in the MVP. Do not create fake plans, payment screens or invented limits. Track usage metrics and keep business rules configurable.

Before monetization, confirm:
- Who pays: individuals, teams or companies?
- Monthly, annual, usage-based or another model?
- What is free?
- Are searches, matches or messages limited?
- Is a trial required?
- What cancellation/refund rules apply?
- Which payment provider and tax rules apply?

No payment gateway is in initial scope.

---

# 16. Security and privacy

- Hash passwords using a modern password-hashing algorithm.
- Use secure sessions/tokens and protect CSRF where relevant.
- Rate-limit authentication, search, messages and uploads.
- Enforce authorization on every backend endpoint.
- Check resource ownership and company scope.
- Use HTTPS in production.
- Keep secrets in environment/secret management.
- Validate uploads and imported data.
- Prevent SQL injection, XSS and CSV formula injection.
- Minimize personal data collection and logging.
- Define retention, correction and deletion workflows.
- Maintain backups and test restoration.
- Review provider licence restrictions and applicable privacy laws before launch.
- Support profile reporting, blocking and moderation.

Legal review is required for relevant Indian privacy obligations, international markets, provider terms, profile display/retention and electronic communication practices. Public availability alone does not imply unrestricted use.

---

# 17. Error handling and observability

Handle invalid input, access denial, missing records, duplicate requests, database errors, AI timeouts, quota failures, provider failures, email failures and import errors consistently.

Use request IDs, structured logs and health checks. Never expose secrets or sensitive data through health endpoints.

Track latency and errors by module while minimizing personal data in logs.

---

# 18. Testing and definition of done

## Unit tests
Validation, role normalization, ranking, connection transitions, provider parsing, CSV validation, email templates and AI output validation.

## Integration tests
Registration, verification, profile persistence, company claims, invitations, CSV imports, search, provider fallback, connections, messaging authorization, email retries, correction and deletion.

## End-to-end scenarios
1. Professional registers and completes onboarding.
2. Company is created/claimed through approved flow.
3. Employee accepts an invitation.
4. Admin previews and imports valid CSV.
5. Invalid rows are reported.
6. User searches and sees real available records.
7. No-result search shows an honest empty state.
8. Connection request is sent and accepted.
9. Authorized conversation works.
10. Unauthorized conversation access fails.
11. Non-admin cannot call admin endpoints.
12. Company admin cannot manage another company's members.
13. AI timeout falls back safely.
14. Deletion request is tracked and processed.

## Definition of done

A feature is complete only when UI, API, database, authorization, validation, loading/error/empty states, tests and documentation are complete. A screen alone is not a completed feature.

---

# 19. Phased development and acceptance

## Phase 0 — Repository audit
Inspect current code, identify stack and conventions, record risks, create `.env.example`, README, lint/type-check/test setup and implementation plan.

**Accept when:** current repository is documented; no credentials are committed; changes do not overwrite useful existing work.

## Phase 1 — Backend and database
Set up application, configuration, PostgreSQL, migrations, validation, error handling, logging, health checks and OpenAPI.

**Accept when:** clean migrations run; API starts; errors are consistent; constraints are tested.

## Phase 2 — Public website
Implement public layouts, pages, responsive styles, contact form and registration links.

**Accept when:** navigation works; mobile/desktop layouts pass; forms validate; no fake testimonials/traction appear.

## Phase 3 — Authentication and professional onboarding
Implement registration, verification, login, recovery, roles, profile CRUD, visibility and settings.

**Accept when:** end-to-end auth works; privilege escalation is prevented; profile permissions pass tests.

## Phase 4 — Company and employee workflows
Implement company creation, duplicate review, claims, membership roles, invitations and verification.

**Accept when:** company scope is enforced; invitations expire and are single-use; employees accept explicitly.

## Phase 5 — CSV and provenance
Implement templates, preview, dry-run, validation, duplicate review, batch import, errors and audit.

**Accept when:** invalid files are safe; import results are traceable; restricted data is not made searchable.

## Phase 6 — Structured search
Implement company/professional search, title/function normalization, filters, full-text search, pagination and baseline evaluation.

**Accept when:** only real permitted records are returned; no-result states are honest; baseline metrics exist.

## Phase 7 — AI providers
Implement adapter interface, Gemini, verified OpenCode Zen adapter, structured output validation, fallback, usage tracking and admin monitoring.

**Accept when:** malformed AI output is rejected; keys remain server-side; provider failure does not break basic search.

## Phase 8 — Ranking and explanations
Implement versioned rules, reason codes, freshness display, feedback and evaluation.

**Accept when:** scores are not probabilities; explanations are grounded; regression results are documented.

## Phase 9 — Connections and introductions
Implement state machine, duplicate prevention, requests, accept/decline, introductions, notifications, blocking and reporting.

**Accept when:** transitions and authorization are tested; duplicates are prevented.

## Phase 10 — Messaging and email
Implement conversations, participants, messages, read state, outbox, templates and delivery error handling.

**Accept when:** participant permissions hold; retries are bounded; preferences are respected.

## Phase 11 — Admin and operational readiness
Complete management views, audit logs, provider usage, deletion/correction workflows, security tests, backups and deployment instructions.

**Accept when:** admin access is enforced server-side; operations are auditable; critical security tests pass.

## Phase 12 — Pilot
Use only permitted seed records, invite a small group, evaluate relevance, monitor coverage/costs, fix critical issues and decide whether another data provider is justified.

**Accept when:** search limitations and costs are documented, privacy operations work, and provider rights are confirmed.

---

# 20. AI coding-agent operating rules

1. Read the full specification.
2. Inspect the repository before coding.
3. Report the existing stack and conflicts.
4. Implement one phase at a time.
5. List files to be changed before each phase.
6. Do not overwrite files without inspecting them.
7. Use strict TypeScript and migrations.
8. Keep secrets outside source control.
9. Label all seed/demo data.
10. Never fabricate professionals or provider coverage.
11. Verify actual provider API contracts before claiming integration success.
12. Do not hard-code provider pricing, quotas or model availability.
13. Use deterministic fallbacks for essential flows.
14. Add tests with business logic.
15. Test API authorization, not just frontend guards.
16. Do not add billing until confirmed.
17. Do not build mobile apps in the web-first scope.
18. Keep files focused and preferably under 500 lines where practical.
19. Run type checks, linting and relevant tests before closing a phase.
20. Update docs when decisions change.
21. Report incomplete work honestly.

### Required phase report

- Completed features
- Files added/changed
- Migrations
- API endpoints
- Tests and results
- Authorization/security checks
- Known limitations
- Required credentials and environment variables
- Remaining work
- Recommended next phase

Do not advance past a phase with unresolved critical defects.

---

# 21. Environment configuration

Example `.env.example`:

```text
NODE_ENV=development
DATABASE_URL=

FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000/api/v1

AUTH_SECRET=
SESSION_SECRET=

AI_PRIMARY_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=

OPENCODE_ZEN_API_KEY=
OPENCODE_ZEN_BASE_URL=
OPENCODE_ZEN_MODEL=

EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM_ADDRESS=

DATA_PROVIDER=
DATA_PROVIDER_API_KEY=

UPLOAD_MAX_BYTES=
AI_REQUEST_TIMEOUT_MS=
AI_MAX_RETRIES=
```

These are placeholder names, not confirmation that endpoints/models are available. Validate configuration at startup and document environment-specific requirements.

---

# 22. Required documentation files

Maintain:
- `README.md`
- `docs/PRODUCT-REQUIREMENTS.md`
- `docs/ROUTE-MAP.md`
- `docs/DATABASE-SCHEMA.md`
- `docs/API-CONTRACTS.md`
- `docs/AI-SEARCH-STRATEGY.md`
- `docs/DATA-SOURCE-POLICY.md`
- `docs/SECURITY-PRIVACY.md`
- `docs/TESTING-PLAN.md`
- `docs/DEPLOYMENT.md`
- `docs/DECISIONS.md`

Keep unresolved business decisions visible rather than silently filling them in.

---

# 23. MVP success criteria

The MVP is ready for a controlled pilot when:

1. Visitors understand Setu through the public website.
2. Professionals can register and manage profiles.
3. Company representatives can create/claim companies through an approved flow.
4. Employees can join by invitation.
5. Admins can import permitted data with validation and provenance.
6. Users can describe a business objective.
7. Setu interprets intent and searches available real records.
8. Results have explainable ranking and freshness indicators.
9. Users can request direct connections or introductions.
10. Recipients can respond and accepted connections can message.
11. Notifications and emails are handled reliably.
12. Admins can supervise users, companies, imports and provider usage.
13. Correction and deletion requests can be processed.
14. Search quality, errors and provider costs can be measured.
15. No subscription or payment is enforced until billing is decided.

**Final principle:** Build the foundation first. Prove the search. Earn trust. Expand the network.
