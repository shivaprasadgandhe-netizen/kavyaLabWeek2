# Kavya Labs Platform

[![CI](https://github.com/shivaprasadgandhe-netizen/kavyaLabWeek2/actions/workflows/ci.yml/badge.svg)](https://github.com/shivaprasadgandhe-netizen/kavyaLabWeek2/actions/workflows/ci.yml)

A production-grade, hardened AI platform application built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Auth.js v5 (NextAuth), Prisma 6, Neon PostgreSQL, motion, recharts, and Vitest.

---

## ⚡ Verify in 2 Minutes

Run these commands locally to verify application health, security, and test suite:

1. **Clean Install & Production Build**:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```
   *Expected: Zero lint warnings, zero type errors, all routes statically and dynamically compiled.*

2. **Run Test Suite**:
   ```bash
   npm test
   ```
   *Expected: 4 test suites pass (21 unit and integration tests) in Vitest.*

3. **System Health Check**:
   ```bash
   npm run dev
   curl -i http://localhost:3000/api/health
   ```
   *Expected: HTTP 200 with body `{"ok":true}`.*

4. **Database Migration Status**:
   ```bash
   npx prisma migrate status
   ```
   *Expected: "Database schema is up to date!" with single migration `20261024160000_init_v4`.*

---

## 💻 Local Setup (Windows & Linux - Identical Commands)

The project uses cross-platform Node tooling and POSIX-compliant scripts that run with identical commands on Windows (cmd/PowerShell), Linux, macOS, and Vercel:

1. **Clone & Configure Environment**:
   ```bash
   git clone <repo-url>
   cd kavyalabweek3
   cp .env.example .env.local
   ```
   Fill in `.env.local`:
   - `DATABASE_URL`: Neon pooled PostgreSQL connection string (`?sslmode=require`)
   - `DIRECT_URL`: Neon direct PostgreSQL connection string
   - `AUTH_SECRET`: Generate using `npx auth secret`
   - `AUTH_GOOGLE_ID`: Google Cloud Console OAuth Client ID
   - `AUTH_GOOGLE_SECRET`: Google Cloud Console OAuth Client Secret
   - `ADMIN_EMAILS`: Comma-separated list of initial admin emails (e.g. `admin@kavyalabs.com`)
   - `AUTH_URL`: `http://localhost:3000`

2. **Install & Initialize Database**:
   ```bash
   npm ci
   npx prisma generate
   npm run db:deploy
   npm run db:seed
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Test Accounts Table

| Account | Role | How to Create | What It CAN Do | What It CANNOT Do |
| :--- | :--- | :--- | :--- | :--- |
| **Regular User**<br>`test+01@example.com` | `USER` | Auto-created via `npm run db:seed` or created upon Google sign-in. | • Access `/dashboard`<br>• View own avatar, name, email, role, and status<br>• Sign out<br>• Delete own account (cascades sessions/accounts) | • Cannot access `/admin` or `/admin/*` (redirects to `/dashboard`)<br>• Cannot change roles or suspend users<br>• Cannot view other users' data |
| **Admin User**<br>`admin@kavyalabs.com` | `ADMIN` | Add email to `ADMIN_EMAILS` or promote in `/admin/users`. | • Full access to `/dashboard` and `/admin`<br>• View 5 summary metric cards & 30-day signup chart<br>• Search, paginate (10/page), and sort users<br>• Change user roles (`USER` ⇄ `ADMIN`) with modal<br>• Suspend or reactivate users with required reason (3–200 chars)<br>• View paginated `/admin/audit` logs | • Cannot demote own account from `ADMIN` to `USER`<br>• Cannot suspend own account<br>• Cannot view or edit other users' profile fields, sessions, or sign-in history<br>• Cannot delete other users |
| **Suspended User**<br>`test+04@example.com` | `USER` | Set `status: SUSPENDED` via admin table with a reason. | • Can view `/login?error=suspended` friendly alert | • Blocked from signing in (`signIn` callback rejects)<br>• Cannot access `/dashboard` or `/admin`<br>• Sessions are purged immediately upon suspension |

---

## 🛡️ Access Control & Boundaries

1. **Server-Side Enforcement**:
   - `requireUser()`: Verifies session, queries database for status. Redirects unauthenticated users to `/login`, and suspended users to `/login?error=suspended`.
   - `requireAdmin()`: Calls `requireUser()` and validates that database role is `ADMIN`. Non-admins are redirected to `/dashboard`.
   - All server actions in `/dashboard` and `/admin` independently invoke these guards.

2. **Strict Admin Boundaries**:
   - Admins manage account-level privileges only (`role`, `status`, `suspendedReason`).
   - Admins cannot view or modify personal profile data, sessions, or credentials of any user.
   - Self-demotion is rejected both at the validation layer and in database transactions.

3. **User Self-Service Controls**:
   - `/dashboard` allows users to review their profile and delete their own account.
   - Account deletion requires typing the exact user email. Deleting cascades to accounts and sessions, while preserving `AuditLog` rows with `targetUserId: null` for compliance.

---

## 🔑 Environment Variables Reference

| Variable | Local (`.env.local`) | Vercel Preview | Vercel Production | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Pooled connection string | Pooled connection string | Pooled connection string | Runtime queries with Neon pooling |
| `DIRECT_URL` | Direct connection string | Direct connection string | Direct connection string | Migrations and schema deployment |
| `AUTH_SECRET` | 32+ character secret | Separate preview secret | Dedicated production secret | NextAuth encryption / session signing |
| `AUTH_GOOGLE_ID` | OAuth Client ID | OAuth Client ID | OAuth Client ID | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | OAuth Client Secret | OAuth Client Secret | OAuth Client Secret | Google OAuth Client Secret |
| `ADMIN_EMAILS` | Comma-separated emails | Comma-separated emails | Comma-separated emails | Automatic admin promotion on sign-in |
| `AUTH_URL` | `http://localhost:3000` | **UNSET** (Uses preview URL) | `https://<domain>.vercel.app` | Canonical site origin |
| `AUTH_TRUST_HOST` | `true` | `true` | `true` | Enables dynamic host detection |

---

## 🚀 Vercel Deployment Guide

1. **Google Cloud Console OAuth Configuration**:
   - Add authorized JavaScript origins:
     - Production: `https://<your-production-domain>.vercel.app`
     - Preview wildcard / specific preview domain: `https://<your-preview-domain>.vercel.app`
   - Add authorized redirect URIs:
     - `https://<your-production-domain>.vercel.app/api/auth/callback/google`
     - `https://<your-preview-domain>.vercel.app/api/auth/callback/google`

2. **Apply Database Migrations Before Deploying**:
   - Run `prisma migrate deploy` against the production `DIRECT_URL`:
     ```bash
     DIRECT_URL="<production-direct-url>" npm run db:deploy
     ```

3. **Configure Vercel Environment Variables**:
   - Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS` across Production and Preview.
   - For **Production**: Set `AUTH_URL` to your production URL (e.g. `https://kavya-labs.vercel.app`).
   - For **Preview**: Leave `AUTH_URL` **unset** so Auth.js automatically detects the preview URL with `trustHost: true`.

4. **Deploy**:
   - Push to `main` for production, or create a pull request for preview.
   - Verify deployment by visiting `/api/health` (returns `{ ok: true }`).

---

## ⚠️ Limitations

- **No Email Notifications**: User account suspensions, role promotions, and reactivation alerts are displayed in-app; external email dispatch is not integrated.
- **No Bulk Role Actions**: Role changes and suspensions are executed per-user with an explicit confirmation step to prevent accidental bulk modifications.
- **UTC-Only Dates**: All timestamps, sign-in dates, audit logs, and analytics bucketing are computed and rendered strictly in UTC.
- **Per-IP Limits Not Applied**: Request rate limiting is not enforced per IP address on Edge nodes; authorization security is maintained via session validation and database guards.

---

## 🧪 Testing Reference

Run the comprehensive test suite with:
```bash
npm test
```

Test coverage includes:
- **`tests/unit/date-buckets.test.ts`**: UTC midnight calculations, 30-day window completeness, zero-value filling.
- **`tests/unit/validation.test.ts`**: Input sanitization, role allowlists, page numbers, search query truncation, sort criteria.
- **`tests/unit/self-demotion.test.ts`**: Prevention of admin lockouts and self-demotion.
- **`tests/integration/change-role.test.ts`**: Mocked atomic transaction testing verifying role updates and audit log creation.
