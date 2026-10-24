# Kavya Labs Landing Page & Web Platform

A modern, high-performance web application for Kavya Labs, a Bengaluru-based AI startup helping teams ship AI-powered products faster. Built with Next.js 15 (App Router), Auth.js v5 (NextAuth), Prisma ORM, and PostgreSQL via Neon.

---

## 🚀 Tech Stack

- **Framework**: Next.js 15.x (App Router, Server Components & Server Actions)
- **Authentication**: Auth.js v5 (`next-auth@5.0.0-beta.32`) with Google OAuth Provider & `@auth/prisma-adapter`
- **Database & ORM**: PostgreSQL (Neon Database) & Prisma 6 (`prisma@6.19.3`, `@prisma/client@6.19.3`)
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

## 🛠️ Setup Steps

### 1. Database Setup (Neon PostgreSQL)
1. Sign up or log into [Neon Console](https://console.neon.tech).
2. Create a Neon project (e.g. `kavya-labs-db`).
3. Copy the pooled PostgreSQL connection string from your dashboard.
4. Ensure it ends with `?sslmode=require`.

### 2. Google OAuth Credentials (Google Cloud Console)
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project or select an existing one.
3. Configure the **OAuth Consent Screen** (User type: External). Add scopes `userinfo.email` and `userinfo.profile`.
4. Go to **Credentials > Create Credentials > OAuth Client ID**.
5. Select Application Type: **Web application**.
6. Set Name: `Kavya Labs Auth`.
7. Add **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-vercel-domain>/api/auth/callback/google`
8. Copy the **Client ID** and **Client Secret**.

### 3. Environment Variables
Copy `.env.example` to `.env.local` (never commit `.env` or `.env.local` to Git):

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
DATABASE_URL=          # Neon connection string, must end with ?sslmode=require
DIRECT_URL=            # Direct Neon connection string (for migrations)
AUTH_SECRET=           # generate with: npx auth secret
AUTH_GOOGLE_ID=        # Google OAuth Client ID
AUTH_GOOGLE_SECRET=    # Google OAuth Client Secret
AUTH_URL=              # http://localhost:3000 locally, your Vercel URL in production
ADMIN_EMAILS=          # comma-separated list of admin emails (e.g. admin@kavyalabs.com)
AUTH_TRUST_HOST=true   # true for Vercel / serverless deployments
```

To generate a secure secret:
```bash
npx auth secret
```

### 4. Database Migrations
1. Run local migrations to apply the schema to your Neon development database:
   ```bash
   npm run db:migrate
   ```
   *The `prisma/migrations` folder is tracked in Git.*

2. Apply migrations in production:
   Run `npm run db:deploy` against the production `DATABASE_URL` once before testing sign-in:
   ```bash
   npm run db:deploy
   ```

3. Generate the Prisma Client at any time:
   ```bash
   npm run postinstall
   ```

### 5. Seeding Test Users (Development Only)
The seed script populates 15 test users with realistic mock data (emails `test+01@example.com` through `test+15@example.com`, staggered `createdAt` dates across the last 30 days, and varying `lastSignedInAt` values):

```bash
npm run db:seed
```

> **Safety Guard**: The script strictly refuses to run if `NODE_ENV === "production"` or if `DATABASE_URL` does not point to an approved local or Neon development database (`ep-raspy-river-b48o7gm2.c-6.us-east-2.aws.neon.tech` / `localhost` / `127.0.0.1`). It exits with code 1 immediately if an unauthorized target is detected.
> The script is idempotent using Prisma `upsert` by email.

### 6. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Administrative Portal & Access Control

### Admin Area Overview
- **Analytics Dashboard (`/admin`)**:
  - Displays four live platform summary metrics (total users, active admins, new users in last 7 days, sign-ins in last 24 hours).
  - Features an interactive 30-day daily signup chart built with Recharts, with missing days filled with 0s. Displays "No data yet" when the database has zero users.
- **User Management (`/admin/users`)**:
  - Displays a tabular directory of all registered accounts (Name, Email, Role, Joined Date, Last Sign-In).
  - Search: Filter by name or email with case-insensitive matching (`q` query parameter, capped at 100 characters).
  - Pagination: 10 users per page (`page` query parameter). Preserves URL state across page reloads.
  - Role Management: Interactive forms allowing administrators to promote or demote user roles (`USER` ⇄ `ADMIN`).
  - Mobile responsiveness: The user table scrolls horizontally in its own container while the surrounding layout stacks.

### How to Become an Admin
1. Add your email address to the `ADMIN_EMAILS` environment variable (e.g. `ADMIN_EMAILS="yourname@gmail.com"`).
2. If currently signed in, sign out.
3. Sign in again via Google OAuth. The `events.signIn` hook in `auth.ts` will verify your email against `ADMIN_EMAILS` (case-insensitive, trimmed) and promote your user record to `ADMIN` in the database.
4. An **Admin** navigation link will immediately appear in your `/dashboard` header.

> **Note on Demotion & Authority**:
> If an administrator changes an env-listed admin's role to `USER` inside `/admin/users`, that user will be promoted back to `ADMIN` automatically at their next sign-in. `ADMIN_EMAILS` is authoritative for automated promotion.
> Self-demotion is strictly blocked by the `changeRole` server action to prevent lockout.

### Access Control Architecture
- Protected strictly on the server: `lib/auth-guards.ts` provides `requireAdmin()`.
- `requireAdmin()` extracts the authenticated user ID from `auth()`, queries the current role directly from the database using `prisma.user.findUnique`, and does not trust cached session tokens.
- Unauthenticated requests are redirected to `/login`; authenticated non-admin users are redirected to `/dashboard`.
- Middleware runs on the Edge runtime and is intentionally decoupled from admin checks to maintain Prisma database compatibility. All admin checks execute in server code.

---

## 📊 Metric Definitions & Date Math

All date calculations and queries use **Coordinated Universal Time (UTC)** to prevent timezone shifts and server drift:

1. **Total Users**: `prisma.user.count()` across all registered accounts.
2. **Admins**: `prisma.user.count({ where: { role: 'ADMIN' } })`.
3. **New Users (7 Days)**: `prisma.user.count({ where: { createdAt: { gte: now - 7 days } } })`.
4. **Sign-Ins (24 Hours)**: `prisma.user.count({ where: { lastSignedInAt: { gte: now - 24 hours } } })`.
5. **Signups Chart (30 Days)**: Aggregated via single parameterized SQL query using `DATE_TRUNC('day', "createdAt") AT TIME ZONE 'UTC'` grouped by day, bound to the UTC start date 29 days ago. The JavaScript layer constructs an exact 30-day series, filling empty days with `0` signups.

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
