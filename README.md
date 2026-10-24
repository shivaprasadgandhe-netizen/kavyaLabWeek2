# Kavya Labs Landing Page & Web Platform

[![CI](https://github.com/shivaprasadgandhe-netizen/kavyaLabWeek2/actions/workflows/ci.yml/badge.svg)](https://github.com/shivaprasadgandhe-netizen/kavyaLabWeek2/actions/workflows/ci.yml)

A hardened, high-performance web application for Kavya Labs, a Bengaluru-based AI startup helping teams ship AI-powered products faster. Built with Next.js 15 (App Router), Auth.js v5 (NextAuth), Prisma ORM, Neon PostgreSQL, and Vitest.

---

## ⚡ Verify in 2 Minutes

Quick checklist to verify the full health, security, and integrity of the application:

1. **Install & Build Validation**:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```
   *Expected: Zero lint warnings, zero type errors, all 13 routes compiled successfully.*

2. **Automated Test Suite**:
   ```bash
   npm test
   ```
   *Expected: 4 test suites pass (21 unit and integration tests).*

3. **System Health Endpoint**:
   ```bash
   curl -i http://localhost:3000/api/health
   ```
   *Expected: HTTP 200 with body `{"ok":true}`.*

4. **Seed Script Safety Refusal**:
   ```bash
   npx tsx scripts/seed-users.ts
   ```
   *Expected: Exits with code 1 and writes nothing unless `DATABASE_URL` contains the dev marker.*

---

## 👥 Test Accounts Table

| Account Email | Role | How to Create | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **`admin@kavyalabs.com`** | `ADMIN` | Add email to `ADMIN_EMAILS` in `.env.local` or set via `npm run db:seed`. | Access `/admin` overview, view 30-day analytics, search/sort users in `/admin/users`, update roles with confirmation modal, suspend/reactivate users, export user list to CSV, view `/admin/audit` trail. |
| **`test+01@example.com`** | `USER` | Auto-created via `npm run db:seed` or created on Google sign-in. | Access `/dashboard`, view personal profile, view active sessions, revoke other sessions, export personal data (`/api/account/export`), delete own account with email confirmation. Blocked from `/admin/*`. |
| **`test+03@example.com`** | `ADMIN` | Auto-created via `npm run db:seed` as an admin account. | Full administrative privileges. Cannot be suspended if it is the sole active admin. Cannot self-demote or self-suspend. |
| **`suspended@example.com`** | `USER` | Suspend any test user via the Admin User Management table with a 3–200 character reason. | Banned from signing in (`/login?error=suspended`). Existing sessions are immediately purged and blocked on their next guarded request. |

---

## 📸 Screenshots

Capture screenshots and place them in the [docs/screenshots/](file:///c:/Users/shiva/OneDrive/kavyalabweek3/docs/screenshots/) folder:

1. **User Security Dashboard** (`docs/screenshots/dashboard.png`):
   - Location: `/dashboard/security`
   - Highlights: Active sessions with current-session badge, "Sign out other sessions" button, personal security event history table, data export button, and typed-email account deletion form.
2. **Admin Analytics Dashboard** (`docs/screenshots/admin-analytics.png`):
   - Location: `/admin`
   - Highlights: 5 metric cards (Total Users, Admins, New Users 7d, Sign-ins 24h, Suspended), server "Last updated" UTC timestamp, and 30-day daily signups chart with the date range indicator (e.g., "Jan 01 to Jan 30, UTC").
3. **Admin User Management** (`docs/screenshots/admin-users.png`):
   - Location: `/admin/users`
   - Highlights: Search bar, "Export CSV" button, column sorting toggles (User, Joined Date, Last Sign-In), "You" badge on signed-in admin row, role change action with accessible confirmation modal, and suspension controls.

---

## 🛡️ Access Model & Security Principles

### Users Control Their Own Data
- **Personal Security Hub (`/dashboard/security`)**:
  - View real-time active sessions (start time, client user agent, and an indicator for current session). Session tokens are never exposed in UI or logs.
  - **Sign out other sessions**: Revokes all sessions except the current active session (rate limited to 10/hour).
  - **Sign out everywhere**: Revokes all active sessions across all devices and redirects to `/login`.
  - **Data Export (`/api/account/export`)**: Download an authentic JSON export of profile, connected account providers (no tokens), active session timestamps/user agents (no tokens), and personal security events. Rate limited to 5/hour.
  - **Account Deletion**: Self-service account deletion requiring exact email verification. Deletion cascades to erase accounts, sessions, and personal security events while preserving administrative audit trails (`onDelete: SetNull`).

### Admins Manage State Only (Strict Separation of Privileges)
- Admins can manage account-level permissions: change roles (`USER` ⇄ `ADMIN`), suspend accounts, and reactivate accounts.
- **Admin Boundaries by Design**:
  - Admins **cannot** read or edit a user's profile fields, active sessions, sign-in history, or data exports.
  - Admins **cannot** delete other users' accounts.
  - Admins **cannot** suspend their own accounts or demote themselves (lockout prevention).
  - Admins **cannot** suspend the last active administrator.
  - An env-listed admin demoted in the UI will be re-promoted at their next sign-in because `ADMIN_EMAILS` is authoritative.
- **Audit Trail (`/admin/audit`)**:
  - Dedicated administrative log displaying actor name, target user name, old role, new role, and UTC timestamp. User sign-in events and session details are never shown here.
- **Users Table Management (`/admin/users`)**:
  - Sorting: Name, Joined Date, and Last Sign-In with allowlisted sorting keys.
  - Role Change Confirmation: Accessible modal with focus trap and Escape key dismissal; updates handled with React 19 `useActionState`.
  - CSV Export: Streamed CSV export protected by rate limiting (10/hour) with formula injection sanitization (cells starting with `=`, `+`, `-`, `@` are prefixed with `'`).

---

## 🔒 Security Features & Rate Limits

### Fixed-Window Database Rate Limiting
Backed by the `RateLimit` table using atomic PostgreSQL `INSERT ... ON CONFLICT DO UPDATE RETURNING` queries with row-level locks. Concurrent requests cannot race or bypass limits.
- **Sign-in initiation (`POST /api/auth/*`)**: 20 requests per IP per 15 minutes (HTTP 429 with `Retry-After`).
- **changeRole**: 30 per admin per minute.
- **Suspend / Reactivate**: 30 per admin per minute.
- **Admin CSV Export**: 10 per admin per hour.
- **User Data Export**: 5 per user per hour.
- **Account Deletion attempts**: 5 per user per hour.
- **Session Revocation**: 10 per user per hour.
- **Cleanup**: Probabilistic inline cleanup (5% sample of requests) purges expired rate limit rows without background daemons.

### Session Management & Suspension
- Database-backed sessions with 7-day lifetime (`maxAge: 604800s`) and daily sliding window updates (`updateAge: 86400s`).
- On account suspension: all active sessions are immediately deleted from the database.
- Every protected route verifies status via `requireUser()` / `requireAdmin()`. Suspended users are immediately blocked and redirected to `/login?error=suspended`.

### Security Headers (`next.config.ts`)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy`:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: https://lh3.googleusercontent.com`
  - `connect-src 'self' https://accounts.google.com`
  - `form-action 'self' https://accounts.google.com`
  - `frame-ancestors 'none'`

---

## 🧪 Testing Suite & CI Matrix

### Running Tests Locally
Run the test suite via Vitest:
```bash
npm test
```
The test suite includes:
- **`tests/unit/date-buckets.test.ts`**: Verifies exact 30-day window, zero-signup filling, chronological ordering (oldest to newest), and UTC midnight boundaries.
- **`tests/unit/validation.test.ts`**: Verifies rejection of invalid roles ("SUPERADMIN", empty string), invalid page numbers, search query lengths > 100 chars, and unapproved sort keys.
- **`tests/unit/self-demotion.test.ts`**: Verifies blocking of admin-to-user self-demotions, self-promotions, and changing other users.
- **`tests/integration/change-role.test.ts`**: Integration test verifying atomic Prisma transaction, `AuditLog` creation, rollback on transaction failure, and no-op on unchanged role.

### Optional Live Database Test Suite (`TEST_DATABASE_URL`)
To run extra integration tests against a live PostgreSQL test database:
```bash
export TEST_DATABASE_URL="postgresql://user:password@localhost:5432/test_db?sslmode=require"
npm test
```
When `TEST_DATABASE_URL` is omitted, the live database suite is skipped automatically.

### GitHub Actions CI Matrix
The CI pipeline (`.github/workflows/ci.yml`) runs on every `push` and `pull_request` to `main`:
- **Operating Systems**: Matrix testing on `ubuntu-latest` and `windows-latest`.
- **Node.js**: Pinned to Node.js `20.x` using `actions/setup-node@v4` with automatic npm caching.
- **Execution Steps**:
  1. `npm ci`: Strict clean package installation.
  2. `npx prisma generate`: Generates Prisma client bindings.
  3. `npm run build`: Production compilation and TypeScript/ESLint checks.
  4. `npm test`: Runs Vitest test suite.
- Placeholder non-secret environment variables (`DATABASE_URL`, `AUTH_SECRET`, etc.) are injected into the CI runner for static page builds.

---

## ⚠️ Limitations

1. **No Email Notifications**: Password resets or suspension notifications are not sent via email. Account statuses are communicated via in-app alerts on sign-in and in the dashboard.
2. **No Bulk Role Changes**: Role updates, suspensions, and reactivations must be performed on individual user accounts with an explicit confirmation step.
3. **Per-IP Rate Limits on Shared Networks**: Rate limits are tracked by hashed IP addresses from `x-forwarded-for`. Users behind shared network egress gateways or corporate NATs share the sign-in limit pool.
4. **No Real-Time Analytics**: Analytics are computed on request via grouped PostgreSQL queries. Changes reflect on page reload rather than live WebSocket subscriptions.
5. **UTC-Only Dates**: All timestamps, sign-ins, audit trails, and signup charts are stored, calculated, and displayed in Coordinated Universal Time (UTC) to maintain cross-timezone consistency.

---

## 📜 Scripts Reference

- `npm run dev`: Start Next.js development server
- `npm run build`: Production build with type checking, linting, and static optimization
- `npm run start`: Launch production server locally
- `npm run lint`: Run ESLint checks
- `npm test`: Run Vitest test suite (`vitest run`)
- `npm run db:migrate`: Run Prisma migrations in development mode (`prisma migrate dev`)
- `npm run db:deploy`: Apply pending migrations in production (`prisma migrate deploy`)
- `npm run db:seed`: Seed 15 test users into development database (requires `SEED_DEV_MARKER`)
- `npm run postinstall`: Generate Prisma client (`prisma generate`)
