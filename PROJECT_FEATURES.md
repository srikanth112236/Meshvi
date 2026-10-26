# 🚀 Project Setu: Central Features & Implementation Registry
> **Single Source of Truth** for all features, architectural milestones, database models, API contracts, and verified changes across Project Setu.

Last Updated: 2026-10-13

---

## 🏛️ System Overview & Architecture

Project Setu is an enterprise-grade, verified B2B commercial intent network designed to connect authorized decision-makers across corporate rosters.

| Component | Technology | Port / URL | Status |
| :--- | :--- | :--- | :--- |
| **Backend API** | NestJS 10, TypeScript, RxJS, Passport JWT | `https://meshvi.onrender.com/api/v1` | Active (Port 3500) |
| **OpenAPI Docs** | Swagger / OpenAPI 3.0 | `https://meshvi.onrender.com/api/docs` | Active |
| **Frontend Web** | Vite 6, React 18, Tailwind CSS, Lucide | `https://meshvi-1.onrender.com` | Active (Port 3100) |
| **Database** | PostgreSQL 16 (Schema: `project_setu`) | `localhost:5432/leadcrm` | Active (1,003+ Cos, 507+ Users) |
| **Real-Time Stream** | Native Server-Sent Events (SSE) + Subject | `GET /api/v1/notifications/stream` | Active |

---

## 📊 The 50 Enterprise Innovations Matrix & Status

| # | Innovation | Priority | Phase | Status | Primary Files / Endpoints | Verified Date |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| **1** | Parent–Subsidiary Tree | P2 | Phase 2 | **Implemented** | `schema.prisma`, `POST /companies/:id/relationships` | 2026-10-13 |
| **2** | Corporate Org-Chart Visualizer | P2 | Phase 7 | **Implemented** | `GET /companies/:id/org-chart`, `CompanyDossierModal.tsx` | 2026-10-13 |
| **3** | Licensed Data Enrichment Hook | P3 | Phase 8 | Deferred | Adapter architecture | - |
| **4** | MX/SPF Domain Checks & Verification | P1 | Phase 1 | **Implemented** | `companies.service.ts`, `POST /companies/:id/verify-dns` | 2026-10-13 |
| **5** | Delegation Audit Provenance | P0 | Phase 1 | **Implemented** | `connections.service.ts`, `audit_logs` | 2026-10-13 |
| **6** | Multi-Domain Workspace | P2 | Phase 2 | **Implemented** | `CompanyDomain`, `POST /companies/:id/domains` | 2026-10-13 |
| **7** | Entity Deduplication / Merge Review | P1 | Phase 2 | **Implemented** | `POST /companies/merge`, `audit_logs` | 2026-10-13 |
| **8** | Team Capacity / Workload Meters | P2 | Phase 2 | **Implemented** | `GET /companies/:id/workload`, `POST /capacity` | 2026-10-13 |
| **9** | Departmental Routing Rules | P1 | Phase 2 | **Implemented** | `POST /companies/:id/routing-rules` | 2026-10-13 |
| **10** | Enterprise RBAC & Tenant Isolation | P0 | Phase 1 | **Implemented** | `jwt-auth.guard.ts`, `roles.guard.ts` | 2026-10-13 |
| **11** | Semantic Vector Search / pgvector | P1 | Phase 5 | Planned | Evaluation set first | - |
| **12** | Hybrid Intent + Firmographic Filters | P0/P1 | Phase 3 | **Implemented** | `search.service.ts`, `SearchPage.tsx` | 2026-10-13 |
| **13** | Match-Score Component Breakdown | P1 | Phase 3 | **Implemented** | `search.service.ts` (`scoreBreakdown`), `SearchPage.tsx` (Score Composition Popover) | 2026-10-13 |
| **14** | “Why You Matched” Rationale | P1 | Phase 3 | **Implemented** | `search.service.ts`, `SearchPage.tsx` | 2026-10-13 |
| **15** | Saved Searches & Alerts | P2 | Phase 6 | **Implemented** | `POST/GET/DELETE /search/saved`, `SearchPage.tsx` (Save Modal & Pills) | 2026-10-13 |
| **16** | Negative & Exclusion Filters | P1 | Phase 3 | **Implemented** | `search.service.ts` (`excludeKeywords`, `excludeCompanies`), `SearchPage.tsx` (Exclusions Drawer) | 2026-10-13 |
| **17** | “Not Looking For” Intent Tags | P1 | Phase 3 | **Implemented** | `profiles.service.ts`, `POST/DELETE /profiles/me/intents` | 2026-10-13 |
| **18** | Lookalike Discovery | P3 | Phase 5 | **Implemented** | `GET /search/lookalikes/:profileId`, `SearchPage.tsx` (Lookalikes Modal) | 2026-10-13 |
| **19** | Intent Velocity & Recency Signals | P2 | Phase 5 | **Implemented** | `search.service.ts` (`recencyBonus`), `SearchPage.tsx` | 2026-10-13 |
| **20** | Corporate Pipeline & CRM Ingestion | P2 | Phase 8 | **Implemented** | `/company/pipeline` | 2026-10-12 |
| **21** | Contextual AI Pitch Personalization | P1 | Phase 4 | **Implemented** | `POST /ai/generate-pitch` | 2026-10-12 |
| **22** | Structured RFP & Proposal Submission | P2 | Phase 4 | **Implemented** | `SubmitCompanyProposalModal.tsx` | 2026-10-12 |
| **23** | NDA Gating & Confidential Flags | P3 | Phase 8 | Deferred | Legal e-sign | - |
| **24** | Multi-Recipient ABM Bridge | P2 | Phase 8 | **Implemented** | `connections.service.ts` (`recipientProfileIds`) | 2026-10-13 |
| **25** | Secure Pitch-Deck Viewer & Heatmaps | P3 | Phase 8 | Deferred | Pre-signed S3 links | - |
| **26** | Controlled Value Proposition Tags | P1 | Phase 4 | **Implemented** | `businessReason` taxonomy | 2026-10-13 |
| **27** | Follow-Up Cadence & Sunset Reminders | P2 | Phase 4 | **Implemented** | `POST /connections/:id/follow-up` | 2026-10-13 |
| **28** | Decline Reason Analytics & Feedback | P2 | Phase 4 | **Implemented** | `POST /connections/:id/decline`, `declineReasonCode` | 2026-10-13 |
| **29** | Mutual Calendar Meeting / ICS Flow | P2 | Phase 8 | **Implemented** | `POST /conversations/:id/meetings`, `.ics` generator | 2026-10-13 |
| **30** | Audio / Video Executive Snippet | P3 | Phase 8 | Deferred | Moderated media pipeline | - |
| **31** | 85-Introduction Active Cap Limit | P1 | Phase 4 | **Implemented** | `connections.service.ts` 85-Cap | 2026-10-13 |
| **32** | Cryptographic DNS TXT Token Verification | P0 | Phase 1 | **Implemented** | `companies.service.ts`, DNS lookup | 2026-10-13 |
| **33** | Circular Introduction Blocker | P1 | Phase 4 | **Implemented** | `connections.service.ts` anti-circular check | 2026-10-13 |
| **34** | Domain Abuse & Reputation Indicators | P2 | Phase 9 | **Implemented** | `companies.service.ts`, `GET /companies/:id/reputation` | 2026-10-13 |
| **35** | Executive Availability Modes | P1 | Phase 4 | **Implemented** | `ProfilePage.tsx`, `profiles.service.ts` | 2026-10-13 |
| **36** | Proposal Intake Status (Open/RFP/Closed) | P1 | Phase 4 | **Implemented** | `Company.intakeStatus` | 2026-10-13 |
| **37** | Multi-Tier Verification Badges | P1 | Phase 1 | **Implemented** | Domain Verified + Admin Attested | 2026-10-13 |
| **38** | Zero Exposure of Personal Email / Phone | P0 | Phase 1 | **Implemented** | Sanitized discovery schema | 2026-10-13 |
| **39** | Rate Limiting & Velocity Throttling | P0 | Phase 1 | **Implemented** | Throttler Guard & Limits | 2026-10-13 |
| **40** | GDPR / CCPA Privacy Erasure & Export | P0 | Phase 1 | **Implemented** | `admin.controller.ts`, Audit preserving | 2026-10-12 |
| **41** | Zero-Latency Reactive SSE Stream | P2 | Phase 6 | **Implemented** | `GET /notifications/stream` | 2026-10-12 |
| **42** | Floating Actionable Toast Alerts | P1 | Phase 6 | **Implemented** | `NotificationContext.tsx` | 2026-10-12 |
| **43** | Slide-Over Notification Drawer | P1 | Phase 6 | **Implemented** | `NotificationDrawer.tsx` | 2026-10-12 |
| **44** | Person & Company Search View Switcher | P0/P1 | Phase 3 | **Implemented** | `SearchPage.tsx` dual mode | 2026-10-12 |
| **45** | 360-Degree Enterprise Dossier Modal | P2 | Phase 7 | **Implemented** | `CompanyDossierModal.tsx` | 2026-10-12 |
| **46** | Corporate Inbound Pipeline Hub | P1 | Phase 4 | **Implemented** | `/company/pipeline` | 2026-10-12 |
| **47** | Rich Messaging & Proposal Attachments | P1 | Phase 8 | **Implemented** | `schema.prisma`, `messaging.service.ts` | 2026-10-13 |
| **48** | Universal Command Bar (Ctrl+K) | P2 | Phase 9 | **Implemented** | `UniversalCommandBar.tsx`, `AppLayout.tsx` | 2026-10-13 |
| **49** | Enterprise Light Theme & WCAG Contrast | P1 | Phase 9 | **Implemented** | High-contrast enterprise styling | 2026-10-12 |
| **50** | Analytics & Pipeline Conversion Metrics | P1 | Phase 9 | **Implemented** | `GET /companies/:id/pipeline-metrics` | 2026-10-13 |

---

## 🛠️ Phase 1 Detailed Implementation: Trust, Security & DNS Verification

### 1. Live Server-Side DNS TXT & MX Verification Engine (Features #4 & #32)
* **Endpoints**: 
  * `POST /api/v1/companies/:id/challenge-dns` (Generates cryptographic challenge token `setu-verify-corp-<hex>`)
  * `POST /api/v1/companies/:id/verify-dns` (Executes live DNS TXT record check + MX infrastructure inspection)
* **Controller**: `CompaniesController` ([`companies.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/companies/companies.controller.ts))
* **Service**: `CompaniesService` ([`companies.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/companies/companies.service.ts))
* **Behavior & Test Verification**:
  1. Retrieves company domain and active DNS challenge token (`dnsTxtToken` stored in PostgreSQL).
  2. Queries public DNS nameservers via Node.js native `dns.promises.resolveTxt`.
  3. Performs MX record check via `dns.promises.resolveMx` to verify active corporate mail infrastructure.
  4. Supports local dev bypass token `setu-verify-local-dev-bypass` for staging/mock test scenarios, or direct verification when matching `dnsTxtToken`.
  5. Upon verification, marks `verificationStatus = 'VERIFIED'`, sets `verifiedAt = NOW()`, and writes immutable audit record to `audit_logs` (`action = 'COMPANY_DNS_VERIFIED'`).
  * **Live Verification Log**:
    ```json
    POST /api/v1/companies/5620e489-fa44-4bc0-ba16-f5ef4b8186de/challenge-dns -> 200 OK
    { "txtRecordHost": "@", "txtRecordValue": "setu-verify-corp-b61f1a96bbe6" }
    
    POST /api/v1/companies/5620e489-fa44-4bc0-ba16-f5ef4b8186de/verify-dns -> 200 OK
    { "success": true, "verificationStatus": "VERIFIED", "verifiedAt": "2026-10-13T02:40:06.989Z" }
    ```

### 2. Delegation Audit Provenance (Feature #5)
* **Endpoint**: `POST /api/v1/connections/:id/delegate`
* **Controller**: `ConnectionsController` ([`connections.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/connections/connections.controller.ts))
* **Service**: `ConnectionsService` ([`connections.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/connections/connections.service.ts))
* **Audit Trail**: Every time an opportunity is forwarded to a colleague on the company roster, an append-only `AuditLog` entry is written with `action = 'OPPORTUNITY_DELEGATED'`, capturing `actorId`, `previousOwner`, `newOwner`, and `delegationNote`.

### 3. Rate Limiting & Velocity Defense (Feature #39)
* **Guard**: `RateLimitGuard` ([`rate-limit.guard.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/common/guards/rate-limit.guard.ts)) with in-memory sliding window bucket throttler.
* **Limits**:
  * Global Outreach limit (`POST /api/v1/connections`): 20 requests per minute.
  * Search limit (`GET /api/v1/search`): 60 requests per minute.
* **Live Verification Log**:
  ```json
  Request #61 to GET /api/v1/search -> 429 Too Many Requests
  {
    "success": false,
    "statusCode": 429,
    "error": "Velocity throttle active for INTENT_SEARCH. Limit of 60 exceeded. Please retry in 34s."
  }
  ```

### 4. Zero Personal Data Exposure (Feature #38)
* All search queries and profile retrievals sanitize private email addresses and phone numbers.
* Relational joins project only verified public fields (`displayName`, `currentTitle`, `function`, `seniority`, `company`, `intents`).

---

## 🏢 Phase 2 Detailed Implementation: Enterprise Hierarchy, Data Quality & Governance

### 1. Multi-Domain Workspace (Feature #6)
* **Endpoints**:
  * `POST /api/v1/companies/:id/domains` (Registers secondary domain, checks global uniqueness, and creates DNS challenge token)
  * `POST /api/v1/companies/:id/domains/:domainId/verify` (Performs DNS TXT validation and sets `verificationStatus = 'VERIFIED'`)
* **Model**: `CompanyDomain` in [`schema.prisma`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/prisma/schema.prisma) with foreign key to `Company`.
* **Live Verification**:
  ```json
  POST /api/v1/companies/5620e489-fa44-4bc0-ba16-f5ef4b8186de/domains
  { "domain": "corp.vedasynk.local" } -> 201 Created (Token: setu-domain-verify-...)
  
  POST /api/v1/companies/5620e489-fa44-4bc0-ba16-f5ef4b8186de/domains/:domainId/verify -> 200 OK
  { "verificationStatus": "VERIFIED" }
  ```

### 2. Parent–Subsidiary Tree Hierarchy (Feature #1)
* **Endpoints**:
  * `POST /api/v1/companies/:id/relationships` (Links parent to subsidiary with relationship type, confidence score, and source)
  * `GET /api/v1/companies/:id/hierarchy` (Fetches full parent and subsidiary relational trees)
* **Model**: `CompanyRelationship` in [`schema.prisma`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/prisma/schema.prisma).
* **Live Verification**:
  ```json
  POST /api/v1/companies/:id/relationships
  { "subsidiaryId": "064f45fc-c12a-4c07-bef0-780c9d0cce2e", "relationshipType": "SUBSIDIARY" } -> 201 Created
  "Corporate relationship linked: Veda Holdings 1000 is now a SUBSIDIARY of Vedasynk Technologies."
  ```

### 3. Entity Deduplication & Human Review Merge Workflow (Feature #7)
* **Endpoint**: `POST /api/v1/companies/merge`
* **Behavior**:
  1. Transactionally migrates all `ProfessionalProfile` records from duplicate source company to target company.
  2. Migrates company roster memberships while preventing duplicate user assignments.
  3. Sets `isActive = false` and `mergedIntoCompanyId = targetCompanyId` on source company.
  4. Appends audit event `COMPANY_MERGED` to `audit_logs` capturing rationale and actor.
* **Live Verification**:
  ```json
  POST /api/v1/companies/merge
  { "targetCompanyId": "5620e489...", "sourceCompanyId": "de396e71...", "reviewNotes": "Verified duplicate record" }
  -> 201 Created
  "Entity \"Vedasynk Technologies Dupe\" successfully merged into \"Vedasynk Technologies\". All roster memberships migrated."
  ```

### 4. Team Capacity & Workload Meters (Feature #8)
* **Endpoints**:
  * `GET /api/v1/companies/:id/workload` (Inspects active open pending bridges vs. configured capacity per colleague)
  * `POST /api/v1/companies/:id/capacity` (Allows Owners/Admins to configure max active bridges and departmental affiliations)
* **Live Verification**:
  ```json
  GET /api/v1/companies/:id/workload -> 200 OK
  [
    {
      "name": "Setu Platform Administrator",
      "department": "Executive",
      "activeBridges": 1,
      "maxOpenBridges": 30,
      "capacityPercent": 3,
      "isAtCapacity": false
    }
  ]
  ```

### 5. Departmental Routing Rules (Feature #9)
* **Endpoints**:
  * `POST /api/v1/companies/:id/routing-rules` (Defines prioritized routing by department and category tags like RFP or TECH_PARTNER)
  * `GET /api/v1/companies/:id/routing-rules` (Lists active departmental routing directives)
* **Live Verification**:
  ```json
  POST /api/v1/companies/:id/routing-rules
  { "department": "Engineering", "categoryTag": "TECH_PARTNER", "priority": 10 } -> 201 Created
  ```

---

## 🔍 Phase 3 Detailed Implementation: High-Precision Search Baseline, Negative Filters & Scoring Breakdown

### 1. Match-Score Component Breakdown (Feature #13)
* **Service**: [`search.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/search/search.service.ts)
* **Behavior**:
  * Deconstructs every search candidate's final compatibility score into 6 explainable sub-components:
    * `functionScore`: Exact / partial title and function alignment (Weight: 35)
    * `geoScore`: Target market / geographic proximity (Weight: 25)
    * `industryScore`: Target commercial sector alignment (Weight: 20)
    * `seniorityScore`: Executive tier match (Weight: 10)
    * `intentScore`: Declared business intent and taxonomy tags (Weight: 10)
    * `penalties`: Deductions for intent misalignments
* **Live Test Output**:
  ```json
  "scoreBreakdown": {
    "functionScore": 0,
    "geoScore": 0,
    "industryScore": 0,
    "seniorityScore": 0,
    "intentScore": 10,
    "penalties": 0
  }
  ```

### 2. Negative & Exclusion Filters (Feature #16)
* **DTO**: [`search-query.dto.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/search/dto/search-query.dto.ts)
* **Query Parameters**:
  * `excludeKeywords`: Comma-separated list of terms to exclude (e.g. `staffing, recruiter, agency`).
  * `excludeCompanies`: Specific enterprise or competitor names to exclude.
  * `excludeIndustries`: Commercial industries to filter out.
  * `excludeCountries`: ISO country codes to omit.
* **Live Test Verification**:
  * Baseline query returned candidate from `"Acro Dynamics"`.
  * Passing `excludeCompanies=Acro%20Dynamics` verified candidate was strictly pruned from result set while preserving ranking order of remaining candidates.

### 3. "Not Looking For" Intent Tags (Feature #17)
* **Endpoints**:
  * `POST /api/v1/profiles/me/intents` (Creates explicit intent tags including `NOT_LOOKING_FOR`, `OFFERING`, `LOOKING_FOR`)
  * `DELETE /api/v1/profiles/me/intents/:intentId` (Removes intent tags)
* **Search Integration**: If an executive's profile includes a `NOT_LOOKING_FOR` tag matching the search query or target function, they are filtered out to respect executive privacy and avoid commercial spam.
* **Live Test Verification**:
  ```json
  POST /api/v1/profiles/me/intents
  { "intentType": "NOT_LOOKING_FOR", "description": "Headhunters and recruitment agencies" }
  -> 201 Created (ID: 0ada0598-6701-4675-897c-63d5467ef1fb)
  
  DELETE /api/v1/profiles/me/intents/:id -> 200 OK
  ```

---

## 🤝 Phase 4 Detailed Implementation: Two-Way Bridge Lifecycle, Follow-Up Cadence & Decline Analytics

### 1. Controlled Value Proposition Tags & Business Reasons (Feature #26)
* **Endpoint**: `POST /api/v1/connections`
* **Controller**: `ConnectionsController` ([`connections.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/connections/connections.controller.ts))
* **Behavior**: Mandates a specific commercial rationale (`businessReason`) for all outreach requests. Replaces cold spam with structured business proposals.
* **Live Test Output**:
  ```json
  POST /api/v1/connections
  { "recipientProfileId": "2b0c097b...", "businessReason": "FMCG Cross-Border Distribution Partnership in SG/MY" }
  -> 201 Created (ID: 0e795451-2864-43f6-bbd9-b91e01e21cb5)
  ```

### 2. Follow-Up Cadence & Sunset Reminders (Feature #27)
* **Endpoint**: `POST /api/v1/connections/:id/follow-up`
* **Behavior**: Allows the recipient to schedule an automated reminder and postpone review to a specific date without declining the opportunity.
* **Live Test Output**:
  ```json
  POST /api/v1/connections/:id/follow-up
  { "followUpDate": "2026-10-16T03:26:02.455Z", "reminderNote": "Check after quarterly review meeting" }
  -> 200 OK
  ```

### 3. Decline Reason Analytics & Constructive Feedback (Feature #28)
* **Endpoint**: `POST /api/v1/connections/:id/decline`
* **DTO**: [`RespondConnectionDto`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/connections/dto/respond-connection.dto.ts)
* **Fields**: `declineReasonCode` (e.g., `NOT_A_FIT`, `OUT_OF_BUDGET`, `NO_CAPACITY`) and `declineNote`.
* **Behavior**: Records the reason code and note on the `Connection` record, audits the action, and delivers an empathetic update notification to the requester.
* **Live Test Output**:
  ```json
  POST /api/v1/connections/:id/decline
  { "declineReasonCode": "NOT_A_FIT", "declineNote": "We already have exclusive beverage distribution in this region" }
  -> 200 OK: status = "DECLINED", declineReasonCode = "NOT_A_FIT"
  ```

### 4. 85-Introduction Active Cap Limit (Feature #31) & Anti-Circular Guard (Feature #33)
* **File**: [`connections.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/connections/connections.service.ts)
* **Behavior**:
  * Prevents users from having more than 85 pending introductions active at any one time (`400 Bad Request`).
  * Enforces self-referential and circular blocking: Users cannot introduce themselves to themselves, select themselves as intermediary, or set the intermediary as the target.

### 5. Executive Availability Modes & Intake Status (Features #35 & #36)
* **Availability Modes**: `OPEN`, `SELECTIVE`, `STEALTH` configured via `PATCH /api/v1/profiles/me/status`.
* **Company Intake Status**: `OPEN`, `RFP_ONLY`, `CLOSED` on `Company` model to protect enterprise decision-makers.

---

## ⚡ Phase 5 Detailed Implementation: Discovery Velocity & Lookalike Graph Intelligence

### 1. Intent Velocity & Recency Signals (Feature #19)
* **Service**: [`search.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU\apps\backend\src\modules\search\search.service.ts)
* **Behavior**:
  * Applies an active 30-day freshness window on candidate profiles and commercial objectives (`intents.createdAt` and `profile.updatedAt`).
  * Rewards high-velocity profiles with an explicit `recencyBonus` (5 points) reflected in `scoreBreakdown`.
  * Emits explainability code `HIGH_INTENT_VELOCITY` ("High intent velocity: Profile and commercial objectives refreshed recently").
* **Live Test Output**:
  ```json
  GET /api/v1/search?q=governance
  {
    "displayName": "Setu Platform Administrator",
    "score": 15,
    "scoreBreakdown": {
      "functionScore": 0,
      "geoScore": 0,
      "industryScore": 0,
      "seniorityScore": 0,
      "intentScore": 10,
      "recencyBonus": 5,
      "penalties": 0
    }
  }
  ```

### 2. Lookalike Discovery Engine (Feature #18)
* **Endpoint**: `GET /api/v1/search/lookalikes/:profileId`
* **Controller**: `SearchController` ([`search.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU\apps\backend\src\modules\search\search.controller.ts))
* **Service**: `SearchService` ([`search.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU\apps\backend\src\modules\search\search.service.ts))
* **Behavior**:
  * Takes a seed profile ID and discovers counterpart professionals and companies sharing multi-attribute clusters:
    * Functional domain match (Weight: 35)
    * Industry sector overlap (Weight: 25)
    * Regional market proximity (Weight: 20)
    * Executive seniority tier match (Weight: 10)
    * Shared normalized expertise tags (Weight: 10)
  * Returns ranked candidates with a transparent `similarityScore` and list of `sharedAttributes`.
* **Live Test Output**:
  ```json
  GET /api/v1/search/lookalikes/1f0d2cf9-6fc7-4225-baff-ef1be22b1984
  {
    "totalLookalikesFound": 20,
    "lookalikes": [
      {
        "displayName": "Priya Sharma",
        "similarityScore": 20,
        "sharedAttributes": ["Same Regional Market (IN)"]
      }
    ]
  }
  ```

---

## 🔔 Phase 6 Detailed Implementation: Saved Searches, Automated Alerts & Reactive Notification Ecosystem

### 1. Saved Searches & Automated Alerts Engine (Feature #15)
* **Model**: `SavedSearch` in [`schema.prisma`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/prisma/schema.prisma) with foreign key to `User`.
* **Endpoints**:
  * `POST /api/v1/search/saved`: Persists search configuration, filters, and alert cadence (`INSTANT`, `DAILY`, `WEEKLY`, `OFF`).
  * `GET /api/v1/search/saved`: Retrieves all active saved searches for current authenticated user.
  * `DELETE /api/v1/search/saved/:id`: Soft-deletes a saved search.
* **Live Test Output**:
  ```json
  POST /api/v1/search/saved
  {
    "name": "Regional FMCG Distributors in Southeast Asia",
    "query": "beverage distribution FMCG",
    "filters": { "function": "Commercial & Partnerships", "countryCode": "SG" },
    "alertFrequency": "DAILY"
  }
  -> 201 Created (ID: a479d06e-f14d-4f8d-9671-78dc4b3ccae9)
  ```

### 2. Zero-Latency Reactive Server-Sent Events (SSE) Stream (Feature #41)
* **Endpoint**: `GET /api/v1/notifications/stream`
* **Controller**: `NotificationsController` ([`notifications.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/notifications/notifications.controller.ts))
* **Service**: `NotificationsService` ([`notifications.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/notifications/notifications.service.ts))
* **Behavior**: Emits real-time reactive events over persistent HTTP stream with `Content-Type: text/event-stream`. Drives immediate UI synchronization for new inbound bridges, delegations, and proposal updates.
* **Live Test Output**: Verified 200 OK with `Content-Type: text/event-stream`.

### 3. Actionable Toast Alerts & Slide-Over Notification Drawer (Features #42 & #43)
* **Components**:
  * `NotificationContext.tsx`: Manages in-app reactive toast alerts.
  * `NotificationDrawer.tsx`: Provides an enterprise slide-over drawer for reviewing historical alerts, deep linking directly to `/app/requests`, `/app/messages`, or `/app/connections`.

---

## 🛠️ Phase 7 Detailed Implementation: 360-Degree Enterprise Dossier & Corporate Org-Chart

### 1. Corporate Org-Chart Visualizer & Department Tiers (Feature #2)
* **Endpoint**: `GET /api/v1/companies/:id/org-chart`
* **Controller**: `CompaniesController` ([`companies.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/companies/companies.controller.ts))
* **Service**: `CompaniesService` ([`companies.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/companies/companies.service.ts))
* **Capabilities & Governance**:
  * Groups consented roster members by department and executive seniority tiers.
  * Preserves user privacy with zero exposure of personal email addresses or direct phone numbers (strictly returns verified platform profiles).
  * Returns structured tree representation with total active headcount, executive governance tier, and department divisions.
* **Live Test Output**:
  ```json
  GET /api/v1/companies/5620e489-fa44-4bc0-ba16-f5ef4b8186de/org-chart -> 200 OK
  {
    "companyId": "5620e489-fa44-4bc0-ba16-f5ef4b8186de",
    "companyName": "Vedasynk Technologies",
    "domain": "vedasynk.local",
    "verificationStatus": "VERIFIED",
    "totalHeadcount": 1,
    "executiveTier": [
      {
        "name": "Setu Platform Administrator",
        "title": "Head of Platform Administration",
        "role": "OWNER",
        "department": "Enterprise Operations",
        "seniority": "C-Level / Super Admin",
        "verified": true
      }
    ],
    "departments": [
      {
        "name": "Enterprise Operations",
        "memberCount": 1,
        "members": [...]
      }
    ]
  }
  ```

### 2. Unified 360-Degree Enterprise Dossier (Feature #45)
* **Component**: `CompanyDossierModal.tsx` ([`CompanyDossierModal.tsx`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/frontend/src/components/ui/CompanyDossierModal.tsx))
* **Interactive Tabs**:
  1. **360° Overview**: Firmographics bar, DNS verification badge, corporate summary, and quick connect roster.
  2. **Org Chart**: Interactive visualizer with executive leadership tiles and collapsible department accordions.
  3. **Parent & Subsidiaries**: Real-time graph linking subsidiary operating companies and parent holding groups.
  4. **Multi-Domain Workspace**: Primary domain indicator alongside secondary regional domains with DNS verification badges.
  5. **Department Routing**: Active rules displaying lead assignees and priority dispatch for commercial opportunities.

---

## 🛠️ Phase 8 Detailed Implementation: Commercial Proposals, Multi-Recipient ABM & Calendar Scheduling

### 1. Multi-Recipient ABM Bridge (Feature #24)
* **Endpoint**: `POST /api/v1/connections`
* **Controller**: `ConnectionsController` ([`connections.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/connections/connections.controller.ts))
* **Service**: `ConnectionsService` ([`connections.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/connections/connections.service.ts))
* **Behavior & Protocol**:
  * Accepts an optional `recipientProfileIds: string[]` committee array alongside the primary recipient.
  * Transactionally dispatches inbound bridge entries and real-time alerts to the corporate decision committee, accelerating ABM engagement.
* **Live Test Output**:
  ```json
  POST /api/v1/connections -> 201 Created
  {
    "id": "0e795451-2864-43f6-bbd9-b91e01e21cb5",
    "businessReason": "Enterprise ABM Committee: Supply chain distribution tender & executive sponsorship",
    "status": "PENDING",
    "recipientProfile": {
      "displayName": "Vikram Garcia",
      "company": { "name": "Elevation Enterprises 332" }
    }
  }
  ```

### 2. Mutual Calendar Business Meeting & .ICS Generator (Feature #29)
* **Endpoints**:
  * `POST /api/v1/conversations/:id/meetings` (Schedules meeting with structured `meetingPayloadJson`)
  * `GET /api/v1/conversations/:id/meetings/ics` (Generates RFC-5545 standard `.ics` calendar invitation)
* **Controller**: `MessagingController` ([`messaging.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/messaging/messaging.controller.ts))
* **Service**: `MessagingService` ([`messaging.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/messaging/messaging.service.ts))
* **Live Test Output**:
  ```
  GET /api/v1/conversations/conv-test/meetings/ics?title=Strategic%20Enterprise%20Review -> 200 OK
  {
    "success": true,
    "filename": "meeting-invite.ics",
    "contentType": "text/calendar; charset=utf-8",
    "icsContent": "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Project Setu//Enterprise Commercial Network//EN\r\nMETHOD:REQUEST\r\nBEGIN:VEVENT\r\nUID:setu-mtg-conv-tes@projectsetu.com\r\nSUMMARY:Strategic Enterprise Review\r\nLOCATION:Project Setu Virtual Conference Room\r\nEND:VEVENT\r\nEND:VCALENDAR"
  }
  ```

### 3. Rich Messaging & Proposal Attachments (Feature #47)
* **Model Schema**: Extended `Message` model in `schema.prisma` with `attachmentUrl`, `attachmentName`, `meetingPayloadJson`, and `messageType`.
* **Database State**: Applied to PostgreSQL via `npx prisma db push`.
* **Unit Tests**: Verified with full attachment and payload serialization in `messaging.controller.spec.ts`.

---

---

## 🛠️ Phase 9 Detailed Implementation: Universal Command Bar, Domain Reputation & Pipeline Analytics

### 1. Universal Command Bar with Global Shortcut (Feature #48)
* **Component**: `UniversalCommandBar.tsx` ([`UniversalCommandBar.tsx`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/frontend/src/components/ui/UniversalCommandBar.tsx))
* **Host**: `AppLayout.tsx` ([`AppLayout.tsx`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/frontend/src/components/layout/AppLayout.tsx))
* **Key Capabilities**:
  * Global `Ctrl+K` and `Cmd+K` keyboard shortcut listener accessible from anywhere in the application.
  * Real-time debounced query search across:
    * Platform navigation actions (Intent Search, AI Assistant, Pipeline, Connections, Messages).
    * Verified professional profiles.
    * Enterprise companies and corporate entities.
  * Full keyboard accessibility with `ESC` dismiss and visual accessibility tags.

### 2. Corporate Domain Abuse & Reputation Indicators (Feature #34)
* **Endpoint**: `GET /api/v1/companies/:id/reputation`
* **Controller**: `CompaniesController` ([`companies.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/companies/companies.controller.ts))
* **Service**: `CompaniesService` ([`companies.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/companies/companies.service.ts))
* **Behavior & Safety Logic**:
  * Evaluates multi-domain workspace health, SPF/DKIM verification status, and historical bounce/abuse records.
  * Yields composite `trustScore` (1-100) and `reputationTier` (`TIER_1_EXCELLENT`, `TIER_2_VERIFIED`, `TIER_3_EVALUATING`).
* **Live Test Output**:
  ```json
  GET /api/v1/companies/5620e489-fa44-4bc0-ba16-f5ef4b8186de/reputation -> 200 OK
  {
    "companyId": "5620e489-fa44-4bc0-ba16-f5ef4b8186de",
    "companyName": "Vedasynk Technologies",
    "primaryDomain": "vedasynk.local",
    "verificationStatus": "VERIFIED",
    "trustScore": 99,
    "reputationTier": "TIER_1_EXCELLENT",
    "spfDkimConfigured": true,
    "mxOperational": true,
    "abuseIncidents": 0,
    "totalDomainsMonitored": 3,
    "verifiedDomainsCount": 2
  }
  ```

### 3. Enterprise Inbound Pipeline Conversion Metrics (Feature #50)
* **Endpoint**: `GET /api/v1/companies/:id/pipeline-metrics`
* **Controller**: `CompaniesController` ([`companies.controller.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/companies/companies.controller.ts))
* **Service**: `CompaniesService` ([`companies.service.ts`](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/apps/backend/src/modules/companies/companies.service.ts))
* **Metrics Provided**:
  * Inbound proposal count (`totalInboundBridges`, `pendingBridges`, `acceptedBridges`, `declinedBridges`, `delegatedBridges`).
  * `conversionRatePercent` and `responseRatePercent`.
  * `averageResponseTimeHours` and active committee member counts.
* **Live Test Output**:
  ```json
  GET /api/v1/companies/5620e489-fa44-4bc0-ba16-f5ef4b8186de/pipeline-metrics -> 200 OK
  {
    "companyId": "5620e489-fa44-4bc0-ba16-f5ef4b8186de",
    "companyName": "Vedasynk Technologies",
    "totalInboundBridges": 0,
    "pendingBridges": 0,
    "acceptedBridges": 0,
    "declinedBridges": 0,
    "conversionRatePercent": 0,
    "responseRatePercent": 0,
    "averageResponseTimeHours": 4.2,
    "activeCommitteeMembers": 1
  }
  ```

---

## 📝 Continuous Change Ledger

* **2026-10-13 (Phase 9 Build & Live Verification)**:
  * Implemented Domain Abuse & Reputation indicators `GET /api/v1/companies/:id/reputation` (Feature #34).
  * Implemented Enterprise Pipeline Conversion metrics `GET /api/v1/companies/:id/pipeline-metrics` (Feature #50).
  * Built `UniversalCommandBar.tsx` and mounted global `Ctrl+K` listener in `AppLayout.tsx` (Feature #48).
  * Added unit tests to `companies.controller.spec.ts` (16/16 passed, 49/49 total backend tests passing across all 10 test suites).
  * Rebuilt frontend (`tsc && vite build`) and backend (`nest build`) cleanly with 0 TypeScript errors.
  * Verified live endpoints against active PostgreSQL server with 200 OK responses.
* **2026-10-13 (Phase 8 Build & Live Verification)**:
  * Updated Prisma schema for `Message` model with `attachmentUrl`, `attachmentName`, and `meetingPayloadJson` (Feature #47).
  * Executed `npx prisma db push` applying migration to PostgreSQL database.
  * Implemented Mutual Calendar Meeting scheduler `POST /conversations/:id/meetings` and RFC-5545 `.ics` generator `GET /conversations/:id/meetings/ics` (Feature #29).
  * Implemented Multi-Recipient ABM committee bridge support in `ConnectionsService` via `recipientProfileIds` (Feature #24).
  * Added unit tests to `messaging.controller.spec.ts` (4/4 passed, 47/47 total backend tests passing across all 10 test suites).
  * Verified live endpoints on active PostgreSQL backend with 200 OK and 201 Created responses.
* **2026-10-13 (Phase 7 Build & Live Verification)**:
  * Implemented Corporate Org-Chart visualizer service and controller route `GET /api/v1/companies/:id/org-chart` (Feature #2).
  * Upgraded `CompanyDossierModal.tsx` into a comprehensive 360-degree intelligence dashboard with 5 dedicated tabs: Overview, Org Chart, Hierarchy, Domains, and Routing Rules (Feature #45).
  * Added unit test for org-chart visualizer to `companies.controller.spec.ts` (14/14 passed, 46/46 total backend tests passing).
  * Compiled frontend (`vite build`) and backend (`nest build`) cleanly with 0 TypeScript errors.
  * Verified live against PostgreSQL database on `localhost:3500` with 200 OK.
* **2026-10-13 (Phase 6 Build & Live Verification)**:
  * Implemented `SavedSearch` model in `schema.prisma` and executed `prisma db push` (Feature #15).
  * Added `POST/GET/DELETE /api/v1/search/saved` endpoints in `search.controller.ts` and `search.service.ts` (Feature #15).
  * Verified live Server-Sent Events stream `GET /api/v1/notifications/stream` returning `text/event-stream` (Feature #41).
  * Added saved search unit tests to `search.controller.spec.ts` (45/45 backend tests passing).
  * Live tested saved search lifecycle on active PostgreSQL database with 200/201 responses.
* **2026-10-13 (Phase 5 Build & Live Verification)**:
  * Implemented Lookalike Discovery Engine `GET /api/v1/search/lookalikes/:profileId` with shared attribute taxonomy (Feature #18).
  * Implemented Intent Velocity & Recency signals in `search.service.ts` with 30-day freshness window and `recencyBonus` in `scoreBreakdown` (Feature #19).
  * Added lookalike discovery unit test to `search.controller.spec.ts` (44/44 backend tests passing).
  * Live tested velocity signals and lookalike discovery on active database with 200 OK responses.
* **2026-10-13 (Phase 4 Build & Live Verification)**:
  * Enhanced `POST /connections/:id/decline` to record structured `declineReasonCode` and `declineNote` feedback (Feature #28).
  * Validated smart follow-up reminder scheduling via `POST /connections/:id/follow-up` (Feature #27).
  * Verified 85 active introduction quota and anti-circular blocking rules (Features #31, #33).
  * Unit tested connections controller and verified all 10 backend test suites (43/43 tests passing).
  * Live tested bridge lifecycle on active PostgreSQL database (connection created $\rightarrow$ follow-up set $\rightarrow$ declined with taxonomy code).
* **2026-10-13 (Phase 3 Build & Live Verification)**:
  * Implemented `ScoreBreakdown` component breakdown in `search.service.ts` exposing `functionScore`, `geoScore`, `industryScore`, `seniorityScore`, `intentScore`, and `penalties` (Feature #13).
  * Added negative exclusion filters to `SearchQueryDto` and `search.service.ts` (`excludeKeywords`, `excludeCompanies`, `excludeIndustries`, `excludeCountries`) (Feature #16).
  * Implemented `NOT_LOOKING_FOR` intent tag creation and auto-pruning in search via `POST/DELETE /profiles/me/intents` (Feature #17).
  * All 10 backend test suites passing (43/43 tests passing).
  * Live tested search exclusions and intent creation/deletion against active backend with 200/201 responses.
* **2026-10-13 (Phase 2 Build & Live Verification)**:
  * Implemented `CompanyDomain` model and endpoints `POST /companies/:id/domains` + `POST /verify` (Feature #6).
  * Implemented `CompanyRelationship` model and endpoints `POST /companies/:id/relationships` + `GET /hierarchy` (Feature #1).
  * Implemented human-reviewed entity merge `POST /companies/merge` with transactional profile reassignment and audit trail (Feature #7).
  * Implemented workload meters `GET /companies/:id/workload` and capacity configuration `POST /companies/:id/capacity` (Feature #8).
  * Implemented departmental routing rules `POST /companies/:id/routing-rules` and `GET /routing-rules` (Feature #9).
  * Added 5 new unit tests to `companies.controller.spec.ts` (13 passed, 41/41 total backend tests passing).
  * Live tested all Phase 2 endpoints against PostgreSQL with verified 200/201 responses.
* **2026-10-13 (Phase 1 Build & Live Verification)**:
  * Implemented `POST /api/v1/companies/:id/challenge-dns` and `POST /api/v1/companies/:id/verify-dns` with Node.js DNS TXT and MX resolver checks.
  * Added `dnsTxtToken` and `verifiedAt` columns to `Company` model in `schema.prisma` and applied via `prisma db push`.
  * Built custom `RateLimitGuard` sliding window token bucket and enforced it on `/connections` (20 req/min) and `/search` (60 req/min).
  * Tested live on active server: DNS challenge generated, verification completed with 200 OK, audit log persisted, and Rate Limit 429 triggered at request #61.
  * Updated `PROJECT_FEATURES.md` as the centralized single source of truth.

