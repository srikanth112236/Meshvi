# Project Setu

Project Setu is an intent-driven B2B professional and business connection platform (*"Who do you need to connect with?"*).

## Network Ports & Topology
- **Frontend Web Application:** Port `3100` (`http://localhost:3100`)
- **Backend API & Swagger:** Port `3500` (`http://localhost:3500/api/v1` and `http://localhost:3500/api/docs`)
- **PostgreSQL Database:** Port `5432` (`postgresql://leadcrm:***@localhost:5432/leadcrm?schema=project_setu`)

## Structure
- `apps/backend`: NestJS + TypeScript + Prisma ORM + PostgreSQL 16
- `apps/frontend`: React 18 + TypeScript + Vite + TailwindCSS (Light, Navy, Sky Blue design system)
- `docs/`: Technical specifications and architectural records

## Getting Started
```bash
# Install dependencies
npm install

# Run backend (Port 3500)
npm run dev:backend

# Run frontend (Port 3100)
npm run dev:frontend
```

## Testing & Verification
For full automated test suites, quick scripts, and step-by-step role-by-role manual UI walkthroughs, see the comprehensive [Testing Guide](file:///c:/Users/USER/Documents/vedasynk-applications/PROJECT-SETU/docs/TESTING_GUIDE.md):

```bash
# Run all Backend Jest Unit & Integration test suites (11 suites, 68 tests)
npm test

# Run the live End-to-End Connection & Warm Introduction Flow verifier
npm run test:flow

# Windows one-click test runner (PowerShell)
.\scripts\test-all.ps1
```

