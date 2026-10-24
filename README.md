# Kavya Labs Landing Page & Web Platform

A hardened, high-performance web application for Kavya Labs, a Bengaluru-based AI startup helping teams ship AI-powered products faster. Built with Next.js 15 (App Router), Auth.js v5 (NextAuth), Prisma ORM, and PostgreSQL via Neon.

---

## 🚀 Tech Stack

- **Framework**: Next.js 15.x (App Router, Server Components & Server Actions)
- **Authentication**: Auth.js v5 (`next-auth@5.0.0-beta.32`) with Google OAuth Provider & `@auth/prisma-adapter`
- **Session Strategy**: Database-backed sessions (`strategy: "database"`, maxAge: 7 days, updateAge: 1 day)
- **Database & ORM**: PostgreSQL (Neon Database) & Prisma 6 (`prisma@6.19.3`, `@prisma/client@6.19.3`)
- **Rate Limiting**: Atomic PostgreSQL-backed fixed-window rate limiter
- **Data Visualization**: Recharts (`recharts@3.10.1`)
- **Seeding & Tooling**: `tsx@4.23.15`
- **Styling**: Tailwind CSS & Lucide React
- **Language**: TypeScript 5.x

---

## 📋 Prerequisites

- **Node.js**: `20.x` (LTS recommended, see `.nvmrc`)
- **npm**: `10.x` or later
- **Neon Account**: Serverless PostgreSQL database from [neon.tech](https://neon.tech)
- **Google Cloud Console Account**: For OAuth 2.0 Web Application credentials

---

## 🛠️ Environment Configuration & Deployment

### 1. Environment Variables Setup
Copy `.env.example` to `.env.local` (never commit `.env` or `.env.local` to Git):

```bash
cp .env.example .env.local
```

Configure your environment:

```env
DATABASE_URL=          # Neon pooled PostgreSQL connection string (?sslmode=require)
DIRECT_URL=            # Direct Neon connection string (for migrations)
AUTH_SECRET=           # 32+ char secret. Generate with: npx auth secret

# Set separately per environment:
# Local development: http://localhost:3000
# Production: https://<your-vercel-domain>.vercel.app
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true   # required for Vercel and serverless deployments

AUTH_GOOGLE_ID=        # Google Cloud Console OAuth Client ID
AUTH_GOOGLE_SECRET=    # Google Cloud Console OAuth Client Secret
ADMIN_EMAILS=          # comma-separated list of admin emails (e.g. admin@kavyalabs.com)
```

> **Startup Validation**: `auth.ts` verifies required environment variables (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) on boot and throws an explicit error naming any missing variable. `ADMIN_EMAILS` is optional.

### 2. Database Migrations
1. Run local migrations to apply schema updates:
   ```bash
   npm run db:migrate
   ```
2. Apply migrations in production:
   ```bash
   npm run db:deploy
   ```

### 3. Production Deployment Checklist (Vercel)
1. Add environment variables in Vercel project settings:
   - `DATABASE_URL` (with `?sslmode=require`)
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_URL` set to your canonical Vercel production URL (e.g. `https://kavya-labs.vercel.app`)
   - `AUTH_TRUST_HOST=true`
   - `ADMIN_EMAILS`
2. Google Cloud Console Authorized Redirect URI:
   - Add `https://<your-vercel-domain>/api/auth/callback/google`
3. Deploy pending database migrations:
   - Run `npm run db:deploy` against production `DATABASE_URL` prior to enabling live traffic.

---

## 🛡️ Access Model & Security Principles

### Users Control Their Own Data
- **Personal Security Hub (`/dashboard/security`)**:
  - View real-time active sessions (start time, client user agent, and an indicator for current session). Session tokens are never exposed in UI or logs.
  - **Sign out other sessions**: Revokes all sessions except the current active session.
  - **Sign out everywhere**: Revokes all active sessions across all devices and redirects to login.
  - **Data Export (`/api/account/export`)**: Download an authentic JSON export of profile, connected account providers (no tokens), active session timestamps/user agents (no tokens), and personal security events.
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

---

## 🔒 Security Features & Rate Limits

### Fixed-Window Database Rate Limiting
Backed by the `RateLimit` table using atomic PostgreSQL `INSERT ... ON CONFLICT DO UPDATE RETURNING` queries with row-level locks. Concurrent requests cannot race or bypass limits.
- **Sign-in initiation (`POST /api/auth/*`)**: 20 requests per IP per 15 minutes (HTTP 429 with `Retry-After`).
- **changeRole**: 30 per admin per minute.
- **Suspend / Reactivate**: 30 per admin per minute.
- **Data Export**: 5 per user per hour.
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
  - `style-src 'self' 'unsafe-inline'` (required for Tailwind CSS & Recharts SVG styling)
  - `img-src 'self' data: https://lh3.googleusercontent.com` (allows Google user avatars)
  - `connect-src 'self' https://accounts.google.com`
  - `form-action 'self' https://accounts.google.com`
  - `frame-ancestors 'none'`

---

## ⚠️ Known Limits & Edge Behaviors

1. **IP Rate Limiting**: IP rate limits are computed from `x-forwarded-for` (hashed with SHA-256). In corporate NATs or shared Wi-Fi networks, users sharing an external egress IP will share the 20 requests / 15 min sign-in threshold.
2. **Session Revocation Timing**: Database session revocation takes effect immediately upon the target's next server request.
3. **UTC Dates**: All database aggregations, sign-in events, and analytics use Coordinated Universal Time (UTC) to eliminate daylight saving shifts and timezone discrepancies.

---

## 📜 Scripts Reference

- `npm run dev`: Start Next.js development server
- `npm run build`: Production build with type checking, linting, and static optimization
- `npm run start`: Launch production server locally
- `npm run lint`: Run ESLint checks
- `npm run db:migrate`: Run Prisma migrations in development mode (`prisma migrate dev`)
- `npm run db:deploy`: Apply pending migrations in production (`prisma migrate deploy`)
- `npm run db:seed`: Seed 15 test users into the development database (development only)
- `npm run postinstall`: Generate Prisma client (`prisma generate`)
