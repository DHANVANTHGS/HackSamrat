# Backend Execution Plan

## Objective

Build a production-ready backend for the HackSamrat project that replaces frontend hardcoded data with secure APIs, persistent storage, auditability, healthcare-style access control, claims workflows, AI grounding, and optional blockchain-backed integrity logging.

This plan is based on the scope defined in [REQUIREMENTS.md](/d:/Projects/HackSamrat/backend/REQUIREMENTS.md).

## Current Starting Point

- The repository currently contains a frontend-focused application.
- There is no backend service, database schema, queue worker, object storage integration, or deployment setup yet.
- Several frontend flows currently depend on hardcoded or browser-local data.

## Recommended Target Stack

- Runtime: `Node.js`
- Framework: `NestJS`
- API style: `REST` under `/api/v1`
- Database: `PostgreSQL`
- ORM: `Prisma`
- Cache and short-lived state: `Redis`
- Object storage: `S3-compatible storage`
- Background jobs: `BullMQ` or equivalent Redis-backed queue
- Auth:
  - Patients: `WebAuthn`
  - Doctors: password-based login initially, with future MFA support
- AI integration: provider-backed chat endpoint with retrieval grounding
- Blockchain integration: asynchronous audit hash anchoring only

## High-Level Architecture

The backend should be split into clear modules:

- `auth`
- `users`
- `patients`
- `doctors`
- `records`
- `files`
- `access-control`
- `insurance`
- `claims`
- `notifications`
- `emergency-access`
- `audit`
- `ai`
- `blockchain`
- `jobs`
- `admin`
- `common`

Supporting services:

- API server for synchronous client requests
- Worker process for background jobs
- PostgreSQL for relational data
- Redis for sessions, rate limiting, and queue state
- S3-compatible storage for uploaded documents

## Delivery Strategy

Build the backend in vertical slices, not as isolated technical layers. Each milestone should produce a usable outcome that the frontend can consume.

Recommended sequence:

1. Platform foundation
2. Data model and migrations
3. Authentication and authorization
4. Patient dashboard and records
5. Doctor portal and access control
6. Insurance and claims
7. Notifications
8. Emergency access
9. AI assistant
10. Blockchain anchoring
11. Production hardening

## Phase-by-Phase Plan

### Phase 1: Platform Foundation

Goal: create a clean, deployable backend skeleton.

Tasks:

- Initialize backend project structure in `backend/`
- Configure TypeScript, linting, formatting, and environment loading
- Add API versioning with `/api/v1`
- Add centralized error handling
- Add request validation and DTO patterns
- Add structured logging
- Add health and readiness endpoints
- Add Docker setup for app dependencies if desired
- Add local dev configuration for PostgreSQL, Redis, and object storage

Deliverables:

- Running backend app
- Base folder structure
- `.env.example`
- Health endpoints
- Shared config and logging utilities

### Phase 2: Database and Persistence Foundation

Goal: establish the persistent data model and migration workflow.

Tasks:

- Set up Prisma and PostgreSQL connection
- Design initial schema for:
  - users
  - patients
  - doctors
  - roles
  - permissions
  - sessions
  - webauthn_credentials
  - medical_records
  - record_files
  - access_grants
  - insurance_policies
  - insurance_benefits
  - claims
  - claim_documents
  - notifications
  - emergency_access_settings
  - audit_logs
  - ai_conversations
  - ai_messages
  - blockchain_anchors
  - organizations
  - hospitals
  - doctor_verifications
- Create migration pipeline
- Add seed data for local development
- Add repository or service patterns around key models

Deliverables:

- Initial Prisma schema
- First migration set
- Seed scripts
- Local development database bootstrapping

### Phase 3: Authentication and Authorization

Goal: secure access to all protected routes.

Tasks:

- Implement doctor login flow
- Implement patient WebAuthn registration and login challenge flow
- Persist WebAuthn credentials securely
- Add session management or JWT strategy
- Add role-based authorization guards
- Add consent-based access evaluation for patient-doctor data access
- Add rate limiting and lockout protection
- Add password hashing for doctor credentials
- Add `/auth/me` and `/auth/logout`
- Audit login and failed authentication events

Deliverables:

- Working auth module
- Role-aware guards
- Session or token issuance
- WebAuthn challenge lifecycle

### Phase 4: Patient Dashboard and Medical Records

Goal: replace frontend hardcoded patient data with real APIs.

Tasks:

- Build `GET /patients/me/dashboard`
- Build records list and detail APIs
- Build file upload API for medical records
- Store binary files in object storage
- Store metadata in relational tables
- Add filtering by record type
- Add secure file access rules
- Audit record upload, view, and download actions

Deliverables:

- Patient dashboard endpoint
- Working upload flow
- Record listing and detail APIs
- Audit coverage for sensitive actions

### Phase 5: Doctor Portal and Access Control

Goal: allow doctors to discover and access patient data safely.

Tasks:

- Build doctor dashboard endpoint
- Build patient search endpoint
- Build patient profile endpoint for doctor workflows
- Build doctor record-view and record-upload flows
- Build access-grant CRUD APIs for patients
- Enforce scope, expiration, and consent checks
- Add audit logs for grant create, update, and revoke

Deliverables:

- Doctor portal APIs
- Access-grant workflows
- Consent-aware authorization engine

### Phase 6: Insurance and Claims

Goal: implement policy visibility and claims workflows.

Tasks:

- Build insurance summary, policy, and benefits endpoints
- Build claim creation, list, detail, and update endpoints
- Add claim document uploads
- Store claim timeline or status-history records
- Add insurer decision fields and payout details
- Trigger notifications on claim state changes
- Audit claim creation and updates

Deliverables:

- Insurance APIs
- Claims APIs
- Claims document flow
- Claim status history

### Phase 7: Notifications

Goal: provide a central event-driven notification system.

Tasks:

- Build notification data model and APIs
- Add unread and read-state support
- Add mark-one and mark-all endpoints
- Add delete endpoint
- Create event triggers for:
  - claim updates
  - premium reminders
  - record access
  - access-grant changes
  - emergency access events

Deliverables:

- Notification center APIs
- Event-triggered notification creation

### Phase 8: Emergency Access

Goal: support controlled, auditable emergency access flows.

Tasks:

- Build patient emergency-access settings endpoints
- Build emergency lookup endpoint for clinicians
- Restrict access to verified personnel only
- Return only policy-allowed critical data
- Add time-bound emergency unlock rules
- Log reason, requester, and timing for every emergency action

Deliverables:

- Emergency settings API
- Emergency access workflow
- Strong audit enforcement

### Phase 9: AI Assistant Backend

Goal: support grounded assistant answers using backend-owned data.

Tasks:

- Build `/patients/me/ai/chat`
- Persist conversations and messages
- Retrieve relevant insurance, claims, and policy context
- Ground answers in approved data only
- Add prompt and retrieval safeguards
- Log assistant activity when it affects workflows or support visibility

Deliverables:

- AI chat API
- Conversation persistence
- Grounded retrieval path

### Phase 10: Blockchain Integration

Goal: add blockchain where it is useful without exposing sensitive data.

Recommended scope:

- Anchor hashes of audit events or record metadata on-chain
- Do not store raw patient data or PHI on-chain
- Keep blockchain writes asynchronous

Tasks:

- Define blockchain anchoring policy:
  - which events are anchor-worthy
  - how often anchors are written
  - which network or chain is used
- Create `blockchain_anchors` table for:
  - local event ID
  - source entity type
  - source entity ID
  - hash
  - chain name
  - transaction hash
  - status
  - anchored timestamp
- Add hashing service for immutable payload digests
- Queue blockchain anchoring jobs
- Build retry and failure handling for anchoring jobs
- Add verification endpoint or internal admin verification tool

Deliverables:

- Blockchain service module
- Background job integration
- Anchor persistence model
- Integrity verification path

### Phase 11: Observability, Security, and Production Hardening

Goal: make the backend reliable and production-ready.

Tasks:

- Add request metrics and latency tracking
- Add error monitoring
- Add audit log query support for admin/internal use
- Add backup and restore procedures
- Add object storage lifecycle rules if needed
- Add idempotency for sensitive write operations
- Add stricter CORS, secure headers, and secret handling
- Review encryption at rest and in transit
- Add deployment config for staging and production

Deliverables:

- Monitoring-ready backend
- Operational runbook inputs
- Production configuration baseline

### Phase 12: Testing and Frontend Integration

Goal: verify business correctness and connect the frontend to live APIs.

Tasks:

- Unit test core services and guards
- Integration test all critical modules
- Add end-to-end test flows for:
  - patient login
  - doctor login
  - record upload
  - access grant lifecycle
  - claim creation and update
  - emergency access
- Replace hardcoded frontend data with real API calls
- Add local seed data for demo scenarios

Deliverables:

- Test suite
- Frontend-backend integration
- Demo-ready environment

## Suggested Sprint Breakdown

### Sprint 1

- Backend scaffold
- Config system
- PostgreSQL and Prisma setup
- Redis setup
- Health endpoints
- Initial schema and migrations

### Sprint 2

- Doctor auth
- Patient WebAuthn auth
- Sessions or JWT
- RBAC guards
- Audit logging foundation

### Sprint 3

- Patient dashboard
- Medical records module
- File upload and object storage integration
- Record audit events

### Sprint 4

- Doctor portal APIs
- Patient search
- Access grants
- Consent and scope enforcement

### Sprint 5

- Insurance module
- Claims module
- Claim documents
- Claim status history

### Sprint 6

- Notifications
- Emergency access module
- Emergency audit flow

### Sprint 7

- AI assistant backend
- Retrieval grounding
- Conversation persistence

### Sprint 8

- Blockchain anchor jobs
- Monitoring and hardening
- Test expansion
- Frontend integration cleanup

## Recommended Folder Structure

```text
backend/
  src/
    app.module.ts
    main.ts
    common/
    config/
    auth/
    users/
    patients/
    doctors/
    records/
    files/
    access-control/
    insurance/
    claims/
    notifications/
    emergency-access/
    audit/
    ai/
    blockchain/
    jobs/
    admin/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  test/
  docker/
  .env.example
  package.json
```

## Key Technical Decisions to Lock Early

- `NestJS` vs `Express`
- `Session cookies` vs `JWT`
- `Prisma` naming conventions and migration ownership
- `S3` provider choice
- `Redis` usage boundaries
- Blockchain network choice and exact anchoring policy
- AI provider and retrieval architecture

These decisions should be finalized before Phase 3, otherwise auth and persistence work may need rework.

## Core Non-Functional Targets

- Strong access control for patient and doctor roles
- Auditability for every sensitive action
- No raw PHI stored on-chain
- Secure file handling and download authorization
- Clear API contracts for frontend integration
- Reliable migration and seed workflow
- Test coverage for critical business rules

## First Milestone Recommendation

The best first usable milestone is:

- backend scaffold
- database and migrations
- doctor auth
- patient auth
- patient dashboard
- records list and upload
- audit logging

This milestone gives the project a real backend foundation and removes the most important hardcoded frontend dependencies first.

## Definition of Done for Full Backend Setup

The backend setup should be considered complete when:

- All major modules in the requirements document have live APIs
- PostgreSQL, Redis, queue workers, and object storage are integrated
- Auth and authorization are enforced consistently
- Audit logging is complete for sensitive events
- Claims, notifications, and emergency access flows work end to end
- AI responses are grounded through backend-owned data retrieval
- Blockchain anchoring is implemented for the selected event classes
- Test coverage exists for critical flows
- Frontend screens can operate without hardcoded mock data
- Staging deployment is available with seeded demo data
