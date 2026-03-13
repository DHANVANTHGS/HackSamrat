# Backend Requirements

## Current State

This repository currently contains only a React frontend. There is no backend server, database layer, authentication service, or API integration yet.

The frontend currently uses:

- Hardcoded doctor credentials
- Browser-local WebAuthn and `localStorage` for patient login
- Hardcoded patient, records, claims, notifications, insurance, and AI assistant data

## Backend Responsibilities

The backend for this project should be responsible for:

- Authentication and session management
- Role-based authorization
- Patient, doctor, and access-control data management
- Medical record metadata and file storage orchestration
- Claim and insurance workflow management
- Notification delivery and read-state tracking
- Emergency-access policy enforcement
- Audit logging for all sensitive actions
- AI assistant request handling and grounding
- Optional integration points for blockchain, hospital systems, and insurers

## Backend System Requirements

### 1. Architecture

The backend should:

- Expose a versioned REST API such as `/api/v1/...`
- Separate auth, patient, doctor, claims, insurance, notifications, and audit modules
- Keep business logic out of controllers
- Use background jobs for non-blocking work like notifications, file processing, and AI tasks
- Support environment-based configuration for development, staging, and production

### 2. Security

The backend must:

- Enforce authentication on all protected routes
- Enforce role-based and consent-based authorization
- Encrypt sensitive data in transit and at rest
- Hash passwords using a strong password hashing algorithm
- Protect against brute-force login attempts with rate limiting and lockout rules
- Validate uploaded file types and sizes
- Prevent insecure direct object reference issues on patient records and claims
- Maintain immutable audit logs for record access and emergency lookups

### 3. Compliance and Privacy

The backend should be designed with healthcare-style privacy expectations:

- Minimize exposure of patient data by role and scope
- Record who accessed what, when, and why
- Support consent-based sharing and emergency override policies
- Retain legal and operational audit history
- Mask or redact highly sensitive fields when not required by the requester

### 4. Storage Requirements

The backend needs:

- A relational database for users, patients, doctors, permissions, claims, and logs
- Object storage for uploaded medical files and claim attachments
- Short-lived storage or cache for sessions, OTPs, or WebAuthn challenges
- Backup and recovery support for critical healthcare and claim data

### 5. Integration Requirements

The backend should be able to integrate with:

- WebAuthn or passkey-compatible authenticators
- Email/SMS/push notification providers
- Insurance providers or third-party claim systems
- Hospital registry or doctor verification systems
- Blockchain logging service if that feature is kept in the product
- AI provider for assistant responses

### 6. Operational Requirements

The backend should include:

- Structured logging
- Health check endpoints
- Error monitoring support
- Basic metrics for request volume, failures, and latency
- Migration support for database schema changes
- Seed data support for local/demo environments

### 7. API Quality Requirements

All endpoints should follow consistent conventions:

- Standard request and response formats
- Pagination for list endpoints
- Filtering and search where the UI requires it
- Stable resource IDs
- Clear HTTP status code usage
- Useful validation and authorization error messages
- Timestamps in a standard format such as ISO 8601

## Recommended API Scope

### 1. Authentication

Patient authentication:

- `POST /auth/patient/webauthn/register/options`
- `POST /auth/patient/webauthn/register/verify`
- `POST /auth/patient/webauthn/login/options`
- `POST /auth/patient/webauthn/login/verify`
- `POST /auth/patient/pin/login`

Doctor authentication:

- `POST /auth/doctor/login`

Session management:

- `POST /auth/logout`
- `GET /auth/me`

Requirements:

- Support patient and doctor roles
- Store WebAuthn credentials and challenges securely
- Issue session or JWT tokens
- Enforce role-based authorization

### 2. Patient Dashboard

- `GET /patients/me/dashboard`

Should return:

- Patient profile summary
- Health score or summary metrics
- Recent activity
- Insurance summary snippet
- Counts for records, claims, and alerts

### 3. Medical Records

- `GET /patients/me/records`
- `GET /patients/me/records/:recordId`
- `POST /patients/me/records/upload`

Doctor-side access:

- `GET /doctor/patients/:patientId/records`
- `POST /doctor/patients/:patientId/records/upload`

Requirements:

- Support filtering by type
- Store file metadata and verification status
- Store actual files in object/file storage
- Support PDF/image/DICOM-style uploads
- Track uploader, timestamps, and audit status

### 4. Access Control

- `GET /patients/me/access-grants`
- `POST /patients/me/access-grants`
- `PATCH /patients/me/access-grants/:grantId`
- `DELETE /patients/me/access-grants/:grantId`

Requirements:

- Grant/revoke access to doctors, family, caregivers
- Support scopes such as full records, prescriptions, imaging, emergency only
- Support expiry dates
- Log every grant and revoke event

### 5. Insurance

- `GET /patients/me/insurance/summary`
- `GET /patients/me/insurance/policy`
- `GET /patients/me/insurance/benefits`

Should return:

- Policy details
- Total coverage and used amount
- Benefit utilization
- Renewal and premium information
- Unused benefit alerts

### 6. Claims

- `GET /patients/me/claims`
- `POST /patients/me/claims`
- `GET /patients/me/claims/:claimId`
- `PATCH /patients/me/claims/:claimId`

Requirements:

- Track claim stages such as submitted, under review, docs verified, approved, disbursed
- Attach claim documents
- Store insurer decisions and payout details
- Trigger notifications on status changes

### 7. Notifications

- `GET /patients/me/notifications`
- `PATCH /patients/me/notifications/:id/read`
- `POST /patients/me/notifications/read-all`
- `DELETE /patients/me/notifications/:id`

Requirements:

- Support unread/read state
- Notify for claim updates, premium reminders, record access, and policy updates

### 8. Emergency Access

- `GET /patients/me/emergency-access`
- `PATCH /patients/me/emergency-access`
- `POST /doctor/emergency-biometric/lookup`

Requirements:

- Store consent toggles for emergency data sharing
- Support temporary emergency unlock windows
- Restrict emergency access to verified responders/clinicians
- Return critical medical summary only when policy allows
- Audit all emergency lookups

### 9. Doctor Portal

- `GET /doctor/dashboard`
- `GET /doctor/patients`
- `GET /doctor/patients/:patientId`
- `GET /doctor/audit-logs`

Should support:

- Patient search by name or patient ID
- Status filtering
- Patient profile view
- Emergency contact details
- Surgeries, conditions, allergies, medications
- Record viewing and upload flows

### 10. AI Assistant

- `POST /patients/me/ai/chat`

Requirements:

- Accept user messages and conversation context
- Return grounded insurance/claim/policy responses
- Prefer retrieval-backed answers over hardcoded prompts
- Log assistant conversations if needed for support/audit

## Data Model Requirements

The backend should at minimum support these entities:

- `users`
- `patients`
- `doctors`
- `webauthn_credentials`
- `sessions`
- `roles`
- `permissions`
- `medical_records`
- `record_files`
- `access_grants`
- `insurance_policies`
- `insurance_benefits`
- `claims`
- `claim_documents`
- `notifications`
- `emergency_access_settings`
- `audit_logs`
- `ai_conversations`
- `ai_messages`
- `organizations`
- `hospitals`
- `doctor_verifications`

## Business Rules Requirements

- Patients can only access their own data unless an admin/support role is introduced later.
- Doctors can only access patient data when they have a valid grant or an emergency-access flow permits it.
- Emergency access must be time-bound and fully audited.
- Claim status changes must be traceable and should preserve status history.
- Uploaded records should preserve uploader identity, source, verification state, and timestamps.
- Notifications should be generated for record access, claim changes, emergency access events, and policy reminders.
- WebAuthn registration and login challenges must expire quickly and be single-use.

## File and Media Requirements

- Support uploads for PDFs, images, and medical-report file types.
- Enforce maximum file size and content-type validation.
- Store metadata separately from binary file storage.
- Support secure download links or streamed downloads.
- Record which user uploaded and accessed each file.

## Audit Requirements

The audit system should log:

- Login attempts and successful sign-ins
- Failed authentication attempts
- Patient record views, downloads, and uploads
- Access grant creation, updates, and revocations
- Emergency-access unlocks and biometric lookups
- Claim creation and status updates
- AI assistant actions if they trigger downstream workflows

Each audit event should capture:

- Actor ID
- Actor role
- Action type
- Target resource type
- Target resource ID
- Timestamp
- Request metadata such as IP, user agent, or session ID where appropriate

## Non-Functional Requirements

- Role-based access control for patient and doctor flows
- Secure file upload and download
- Full audit trail for sensitive record access
- Encryption for sensitive data at rest and in transit
- Support for WebAuthn challenge verification
- Input validation and rate limiting on auth endpoints
- Pagination for records, notifications, claims, and audit logs
- Clear error responses for expired access, forbidden access, and missing consent
- Reasonable response times for interactive dashboard workflows
- Reliability for critical patient and claim data
- Idempotency support for sensitive write operations where needed
- Test coverage for auth, permissions, emergency access, and claims flows

## Recommended Supporting Endpoints

Platform and operations:

- `GET /health`
- `GET /ready`
- `GET /api/v1/meta/config`

Reference data:

- `GET /reference/document-types`
- `GET /reference/claim-statuses`
- `GET /reference/access-scopes`
- `GET /reference/hospitals`

Admin or internal support, if needed later:

- `GET /admin/audit-logs`
- `GET /admin/users/:id`
- `PATCH /admin/claims/:claimId/status`

## Suggested Build Order

1. Auth and session management
2. Patient profile and dashboard summary
3. Medical records and file upload
4. Doctor patient search and record access
5. Access control and audit logs
6. Claims and insurance modules
7. Notifications
8. Emergency access flows
9. AI assistant integration
10. External integrations and blockchain logging

## Suggested Tech Stack

A practical backend stack for this project:

- Node.js with Express or NestJS
- PostgreSQL for relational data
- Prisma or TypeORM for ORM
- S3-compatible storage for uploaded files
- Redis for sessions, caching, or short-lived WebAuthn challenges
