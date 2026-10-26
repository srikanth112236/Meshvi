# Project Setu — Architecture Decision Records (ADR)

## ADR-001: Port Allocation
- **Decision:** Frontend is assigned port **3100** (`http://localhost:3100`), Backend is assigned port **3500** (`http://localhost:3500`).
- **Rationale:** Strict user instruction to avoid collisions with standard dev servers (3000, 5173, 5000, 8080).

## ADR-002: Monorepo Architecture
- **Decision:** NPM workspaces with `apps/backend` (NestJS) and `apps/frontend` (React + Vite).
- **Rationale:** Allows shared types while keeping clean operational separation.

## ADR-003: Database Isolation
- **Decision:** Dedicated PostgreSQL schema `project_setu` within the local PostgreSQL 16 instance.
- **Rationale:** Isolates all Setu tables and indexes without requiring superuser CREATEDB rights.

## ADR-004: Design System Tokens
- **Decision:** Light theme with `--color-bg: #F8FAFC`, `--color-surface: #FFFFFF`, `--color-navy: #102A43`, and `--color-primary: #0284C7` (Sky Blue).
- **Rationale:** Aligns with section 2 of PROJECT-SETU-MVP-SPEC.md.
