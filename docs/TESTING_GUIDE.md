# Project Setu - Comprehensive Testing Guide & Verification Manual

Welcome to the definitive testing guide for **Project Setu**'s intent-driven B2B connection platform. This guide covers both **Automated Testing** (Jest unit/integration tests and CLI flow scripts) and **Manual Role-by-Role UI Testing** (screen-by-screen testing across multiple personas in modern browsers).

---

## Table of Contents
1. [Test Personas & Credentials](#1-test-personas--credentials)
2. [Automated Testing](#2-automated-testing)
   - [2.1 Backend Unit & Integration Tests (Jest)](#21-backend-unit--integration-tests-jest)
   - [2.2 Quick Automated End-to-End Flow Script](#22-quick-automated-end-to-end-flow-script)
   - [2.3 Windows PowerShell One-Click Runner](#23-windows-powershell-one-click-runner)
3. [Manual Role-by-Role UI Testing Walkthrough](#3-manual-role-by-role-ui-testing-walkthrough)
   - [Setup: Dual-Window Browser Configuration](#setup-dual-window-browser-configuration)
   - [Scenario 1: Direct Connection Bridge & Upgrade Innovations](#scenario-1-direct-connection-bridge--upgrade-innovations)
     - [1.1 Reciprocity Radar (Double-Blind Mutual Intent)](#11-reciprocity-radar-double-blind-mutual-intent)
     - [1.2 60-Second Authenticated Voice Memo & Waveform](#12-60-second-authenticated-voice-memo--waveform)
     - [1.3 Pre-Meeting Mutual Agenda Contract](#13-pre-meeting-mutual-agenda-contract)
     - [1.4 Sales Pitch Buzzword Linter & 300-Char Guardrail](#14-sales-pitch-buzzword-linter--300-char-guardrail)
     - [1.5 Recipient Triage & Decision Branches](#15-recipient-triage--decision-branches)
     - [1.6 Targeted Clarification Loop](#16-targeted-clarification-loop)
     - [1.7 Deferred Cadence Queue ("Follow-Up Later")](#17-deferred-cadence-queue-follow-up-later)
     - [1.8 Smart Wrong-Contact Handover ("Re-Route to Colleague")](#18-smart-wrong-contact-handover-re-route-to-colleague)
     - [1.9 Bridge Acceptance & Auto Deal Room Trigger](#19-bridge-acceptance--auto-deal-room-trigger)
   - [Scenario 2: Real-Time Live Messaging & Calendar Scheduling](#scenario-2-real-time-live-messaging--calendar-scheduling)
     - [2.1 Live Channel SSE Connection](#21-live-channel-sse-connection)
     - [2.2 Zero-Refresh Message Transmission](#22-zero-refresh-message-transmission)
     - [2.3 Calendar Scheduling & RFC-5545 (.ics) Export](#23-calendar-scheduling--rfc-5545-ics-export)
   - [Scenario 3: Three-Way Warm Introduction & Step-Aside Handover](#scenario-3-three-way-warm-introduction--step-aside-handover)
     - [3.1 Requesting Warm Introduction](#31-requesting-warm-introduction)
     - [3.2 Intermediary Attested Endorsement](#32-intermediary-attested-endorsement)
     - [3.3 Target Executive Acceptance](#33-target-executive-acceptance)
     - [3.4 Step-Aside Handover & +5 Reputation Bonus](#34-step-aside-handover--5-reputation-bonus)
   - [Scenario 4: Cadence & Anti-Spam Guardrails](#scenario-4-cadence--anti-spam-guardrails)
     - [4.1 24-Hour Withdrawal & Quota Refund (+1 Quota)](#41-24-hour-withdrawal--quota-refund-1-quota)
     - [4.2 1-Reminder Limit Cooldown](#42-1-reminder-limit-cooldown)
     - [4.3 60-Day Cooling-Off Lockout](#43-60-day-cooling-off-lockout)

---

## 1. Test Personas & Credentials

All test accounts are pre-seeded in the local database. The universal default password across all seeded accounts is **`Password123!`**.

| Persona | Role | Name | Email | Company | Key Testing Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User A** | Requester / Consumer | Priya Sharma | `priya.sharma@borneoagro.com` | Borneo Agro | Direct bridge outreach, voice memos, agenda contracts, 3-way intro requests |
| **User B** | Facilitator / Intermediary | Mei Ling Ooi | `mei.ling@borneoagro.com` | Borneo Agro | Vouching, attested endorsements, step-aside handovers (+5 Rep) |
| **User C** | Target Executive | Marcus Sterling | `marcus.sterling@apexlogistics.com` | Apex Logistics | Recipient triage, clarifying, accepting bridges, live chat, deal rooms |
| **User D** | Super Admin | System Admin | `admin@projectsetu.com` | Project Setu | System logs, audit records, health checks, platform moderation |

---

## 2. Automated Testing

### 2.1 Backend Unit & Integration Tests (Jest)

The backend test suite covers all controllers and services, validating anti-spam quotas, state transitions, reputation rewards, SSE message streaming, and calendar generation:

```bash
# Navigate to backend and run all test suites
cd apps/backend
npm test
```

Expected result:
```text
PASS src/modules/admin/admin.controller.spec.ts
PASS src/modules/health/health.controller.spec.ts
PASS src/modules/imports/imports.controller.spec.ts
PASS src/modules/connections/connections.controller.spec.ts
PASS src/modules/connections/connections.service.spec.ts
PASS src/modules/profiles/profiles.controller.spec.ts
PASS src/modules/search/search.controller.spec.ts
PASS src/modules/messaging/messaging.controller.spec.ts
PASS src/modules/contact/contact.controller.spec.ts
PASS src/modules/auth/auth.controller.spec.ts
PASS src/modules/companies/companies.controller.spec.ts

Test Suites: 11 passed, 11 total
Tests:       68 passed, 68 total
Snapshots:   0 total
Time:        ~14s
```

### 2.2 Quick Automated End-to-End Flow Script

A standalone flow test script (`scripts/test-connections-flow.ts`) tests the live HTTP and SSE API endpoints:

1. **Ensure the backend is running:**
   ```bash
   npm run dev:backend
   ```
2. **In a second terminal, execute the flow script:**
   ```bash
   npm run test:flow
   ```

**What the script executes automatically:**
- Authenticates User A (Priya), User B (Mei Ling), and User C (Marcus).
- Evaluates 7-day rolling quota and tests the Sales Buzzword Linter.
- Submits a connection bridge with Voice Memo payload and Pre-Meeting Agenda deliverables.
- Triggers a targeted clarification question from User C.
- Submits a clarification reply from User A.
- Accepts the connection from User C and verifies Deal Room auto-creation.
- Dispatches a live message and validates RFC-5545 `.ics` meeting invite generation.
- Executes the 3-Way Warm Introduction pipeline (Request $\to$ Intermediary Endorsement $\to$ Target Acceptance).

### 2.3 Windows PowerShell One-Click Runner

Windows users can run both Jest suites and the live flow script with one command:
```powershell
.\scripts\test-all.ps1
```

---

## 3. Manual Role-by-Role UI Testing Walkthrough

### Setup: Dual-Window Browser Configuration

To test real-time interactions, open two browser windows side-by-side:
- **Window 1 (Standard Browser Window)**: Log in as **User A (Priya Sharma)** (`priya.sharma@borneoagro.com` / `Password123!`).
- **Window 2 (Incognito / Private Window)**: Log in as **User C (Marcus Sterling)** (`marcus.sterling@apexlogistics.com` / `Password123!`).

---

### Scenario 1: Direct Connection Bridge & Upgrade Innovations

#### 1.1 Reciprocity Radar (Double-Blind Mutual Intent)
1. In **Window 1 (Priya)**, navigate to `http://localhost:3100/app/search`.
2. Find **Marcus Sterling** in the directory and click his card to open the **Person Dossier Drawer**.
3. In the drawer footer, click the **"Signal Mutual Intent"** button (radar icon).
4. **Observe the UI reaction**:
   - The radar pulses with an active scanning animation for 0.7s.
   - A verified synergy card appears: **"⚡ Reciprocity Radar: Double-Blind Match Verified!"**.
   - Displays Marcus's active commercial mandates and a **"🎯 100% Pre-Approved Synergy"** badge.
   - Click **"Open Pre-Approved Bridge →"** to launch the connection modal.

#### 1.2 60-Second Authenticated Voice Memo & Waveform
1. Inside the **Connect Opportunity Modal**:
   - Click **"Click to Record 60-Second Spoken Pitch Memo"** (accept browser microphone permission).
   - Speak for 5 to 10 seconds. Observe the live timer counting up.
   - Click **"Stop Recording"**.
   - **Observe**: The audio preview card appears displaying duration, file size, and an embedded play/pause preview.

#### 1.3 Pre-Meeting Mutual Agenda Contract
1. Below the voice memo section, click **"Customize Agenda"**.
2. Select 2 predefined checklist items (e.g., *"Align on commercial SLA & pricing schedule"*, *"Review APAC customs clearance turnarounds"*).
3. Type a custom deliverable (e.g., *"Confirm Q4 refrigerated container allocation"*) and click **Add**.
4. **Observe**: The agenda checklist dynamically reflects the mutually binding pre-meeting deliverables.

#### 1.4 Sales Pitch Buzzword Linter & 300-Char Guardrail
1. In the **Connection Note** field, type:
   > *"We guarantee massive ROI and want to schedule a quick chat to disrupt your sales process."*
2. **Observe**: The real-time buzzword linter immediately flags prohibited sales phrases (`"guarantee"`, `"massive ROI"`, `"quick chat"`), displays replacement suggestions, and tracks character count towards the 300-character maximum.
3. Replace with a professional note:
   > *"Exploring regional freight handling partnership for perishable agriculture. Voice memo and agenda deliverables attached."*
4. Click **"Dispatch Connection Bridge"**.
5. **Observe**: The 7-day quota counter decrements by 1 and a success notification toast is displayed.

#### 1.5 Recipient Triage & Decision Branches
1. Switch to **Window 2 (Marcus)** and open `http://localhost:3100/app/requests`.
2. Locate the incoming bridge card from Priya Sharma.
3. **Test Voice Memo Playback**: Click the **Play** button on the voice memo card. Verify the frequency wave bars animate while audio plays.
4. **Test Agenda Deliverables Card**: Verify the *"Pre-Meeting Agenda Deliverables Agreed"* section displays the checklist Priya configured.

#### 1.6 Targeted Clarification Loop
1. On Marcus's card, click **"Ask Clarify"**.
2. Modal opens: Type *"What is your required temperature tolerance during transshipment?"* $\to$ Click **"Dispatch Inquiry"**.
3. In **Window 1 (Priya)**, navigate to `/app/requests` $\to$ **"Outgoing Sent"** tab.
4. Locate the card: It now displays status `CLARIFICATION_REQUESTED` with Marcus's question and a **"Reply to Clarification →"** button.
5. Priya clicks the button, types *"Strict 2°C to 8°C reefer fleet required."*, and clicks **Submit**.
6. In **Window 2 (Marcus)**, the card updates to `CLARIFICATION_RESPONDED` with Priya's answer rendered directly above the action buttons.

#### 1.7 Deferred Cadence Queue ("Follow-Up Later")
1. On Marcus's card, click **"Follow-Up Later"**.
2. Select a target reminder date (e.g., 3 days ahead) and type an optional note $\to$ Click **"Stage in Deferred Queue"**.
3. **Observe**: The card moves out of the active inbox into the **"Deferred Cadence Queue"** tab.
4. Click the **"Deferred Cadence Queue"** tab, locate the card, and click **"Accept Now"**.

#### 1.8 Smart Wrong-Contact Handover ("Re-Route to Colleague")
*(Optional alternative branch)*:
1. Click **"Re-Route to Colleague"**.
2. Pick an organizational peer from the dropdown (e.g., procurement or regional lead) with an internal memo.
3. Click **"Confirm Handover"** $\to$ Card is delegated to the designated colleague without burning the requester's quota.

#### 1.9 Bridge Acceptance & Auto Deal Room Trigger
1. Marcus clicks **"Accept Bridge"**.
2. **Observe the system reactions**:
   - Status transitions to `ACCEPTED`.
   - Real-time notification dispatched to Priya.
   - Navigate to `http://localhost:3100/app/deal-rooms`: A dedicated Deal Room is automatically created for Marcus & Priya!
   - Navigate to `http://localhost:3100/app/connections`: Priya and Marcus now appear in each other's active business network with **"Chat"** and **"Deal Room"** action buttons.

---

### Scenario 2: Real-Time Live Messaging & Calendar Scheduling

#### 2.1 Live Channel SSE Connection
1. In **Window 1 (Priya)**, navigate to `http://localhost:3100/app/messages` and select the conversation with Marcus Sterling.
2. In **Window 2 (Marcus)**, navigate to `http://localhost:3100/app/messages` and select the conversation with Priya Sharma.
3. In both chat headers, verify the pulsing indicator: **"● Live Channel"**.

#### 2.2 Zero-Refresh Message Transmission
1. In **Window 1 (Priya)**, type:
   > *"Hello Marcus, I have uploaded our cold-chain specifications to the Deal Room."*
2. Click **Send** (or press Enter).
3. **Verify**: Without refreshing Window 2, Marcus's screen displays Priya's message via the SSE stream.
4. In **Window 2 (Marcus)**, reply:
   > *"Received. Reviewing with our warehouse team now."*
5. **Verify**: Priya's screen instantly displays Marcus's reply.

#### 2.3 Calendar Scheduling & RFC-5545 (.ics) Export
1. In either chat header, click **"Schedule Meeting"**.
2. Set title to *"APAC Distribution Kickoff"*, pick date/time, and click **"Insert Meeting"**.
3. In the chat feed, a structured meeting invitation card appears.
4. Click **"Download RFC-5545 .ics Invite"**.
5. **Verify**: A `.ics` file downloads. Opening it launches your native calendar app (Outlook, Apple Calendar, Google Calendar) with the event details.

---

### Scenario 3: Three-Way Warm Introduction & Step-Aside Handover

#### 3.1 Requesting Warm Introduction
1. In **Window 1 (Priya)**, navigate to `http://localhost:3100/app/search`.
2. Locate Marcus Sterling $\to$ Click **"Request Introduction"**.
3. Select **Mei Ling Ooi** as the mutual intermediary connector.
4. Enter business rationale and click **"Dispatch Introduction Request"**.

#### 3.2 Intermediary Attested Endorsement
1. Open a browser window logged in as **Mei Ling Ooi** (`mei.ling@borneoagro.com` / `Password123!`).
2. Navigate to `http://localhost:3100/app/introductions`.
3. Locate Priya's introduction request:
   - Visual connector path: `Priya Sharma → Mei Ling Ooi (Bridge) → Marcus Sterling`.
4. Click **"Forward with Endorsement"**.
5. Type an attested endorsement note:
   > *"I have partnered with Priya on agricultural exports for 4 years. Uncompromising quality and SLA adherence."*
6. Click **"Attest & Forward Bridge"**.

#### 3.3 Target Executive Acceptance
1. In **Window 2 (Marcus)**, navigate to `http://localhost:3100/app/introductions`.
2. Locate the incoming introduction:
   - Notice the green badge: **"Attested Intermediary Endorsement"** displaying Mei Ling's note.
3. Marcus clicks **"Accept Introduction"**.

#### 3.4 Step-Aside Handover & +5 Reputation Bonus
1. Switch back to **Mei Ling's window** on `/app/introductions`.
2. The card updates to **"🤝 3-Party Warm Bridge Completed Successfully"**.
3. A prominent button appears: **"Step Aside & Hand Over (+5 Rep)"**.
4. Mei Ling clicks it.
5. **Observe**:
   - A success toast confirms: *"Connector Step-Aside Completed: +5 Facilitator Reputation points credited!"*
   - Mei Ling gracefully steps aside from the private discussion.
   - A direct connection between Priya and Marcus is established.

---

### Scenario 4: Cadence & Anti-Spam Guardrails

#### 4.1 24-Hour Withdrawal & Quota Refund (+1 Quota)
1. Send a new connection request from `/app/search`.
2. Immediately navigate to `/app/requests` $\to$ **"Outgoing Sent"** tab.
3. Locate the pending request and click **"Withdraw"** (labeled with `+1 Quota`).
4. Confirm withdrawal.
5. **Verify**: The weekly quota counter increments by +1.

#### 4.2 1-Reminder Limit Cooldown
1. On an outgoing pending connection request, click **"Gentle Reminder"**.
2. Enter an optional follow-up note and submit.
3. **Verify**: The button changes to disabled with text *"Reminder Sent"*. The system enforces exactly one gentle reminder per bridge to prevent executive inbox fatigue.

#### 4.3 60-Day Cooling-Off Lockout
1. If an executive declines a connection request with a reason code (e.g. `NOT_A_FIT`), attempting to send another connection request to that same executive triggers the cooling-off lock:
   > *"60-day cooling-off window is active before new outreach can be initiated."*

---

## 4. Troubleshooting & FAQ

- **Backend health status**: Visit `http://localhost:3500/health` to confirm the PostgreSQL database is connected and status is `READY`.
- **Database reset & re-seeding**: If you want to reset all test state back to a clean slate:
  ```bash
  cd apps/backend
  npm run prisma:push
  npm run seed
  ```
- **SSE connection drops**: The frontend includes an automatic reconnect fallback with exponential backoff and a 12-second sync poll if the browser loses network connectivity.
