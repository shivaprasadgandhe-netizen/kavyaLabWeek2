# Kavya Labs Landing Page & Web Platform

A modern, high-performance web application for Kavya Labs, a Bengaluru-based AI startup helping teams ship AI-powered products faster. Built with Next.js 15, Auth.js v5 (NextAuth), Prisma ORM, and PostgreSQL via Neon.

---

## 🚀 Tech Stack

- **Framework**: Next.js 15.x (App Router)
- **Authentication**: Auth.js v5 (`next-auth@5.0.0-beta.32`) with Google OAuth Provider & `@auth/prisma-adapter`
- **Database & ORM**: PostgreSQL (Neon Database) & Prisma 6 (`prisma@6.19.3`, `@prisma/client@6.19.3`)
- **Styling**: Tailwind CSS & Lucide React
- **Language**: TypeScript 5.x

---

## 📋 Prerequisites

- **Node.js**: `20.x` (LTS recommended, see `.nvmrc`)
- **npm**: `10.x` or later
- **Neon Account**: Free serverless PostgreSQL database from [neon.tech](https://neon.tech)
- **Google Cloud Console Account**: For OAuth 2.0 Web Application credentials

---

## 🛠️ Setup Steps

### 1. Database Setup (Neon PostgreSQL)
1. Sign up or log into [Neon Console](https://console.neon.tech).
2. Create a new Neon project (e.g. `kavya-labs-db`).
3. Copy the pooled PostgreSQL connection string from your dashboard.
4. Ensure it ends with `?sslmode=require`.

### 2. Google OAuth Credentials (Google Cloud Console)
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
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
AUTH_SECRET=           # generate with: npx auth secret
AUTH_GOOGLE_ID=        # Google OAuth Client ID
AUTH_GOOGLE_SECRET=    # Google OAuth Client Secret
AUTH_URL=              # http://localhost:3000 locally, your Vercel URL in production
ADMIN_EMAILS=          # comma-separated list of admin email addresses (e.g. admin@kavyalabs.com)
AUTH_TRUST_HOST=true   # true for Vercel / serverless deployments
```

To generate a secure secret:
```bash
npx auth secret
```

### 4. Database Migrations
1. Run local migrations to apply the schema to your Neon database:
   ```bash
   npm run db:migrate
   ```
   *The `prisma/migrations` folder is tracked in Git.*

2. To generate the Prisma Client at any time:
   ```bash
   npm run postinstall
   ```

3. When deploying to Vercel or production:
   Run `npm run db:deploy` against the production `DATABASE_URL` once (or from your machine with the production URL set temporarily) before testing sign-in:
   ```bash
   npm run db:deploy
   ```

### 5. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Authentication & Role-Based Access Flow

1. **Landing Page (`/`)**:
   - Fully server-rendered with responsive layout.
   - When signed out, the Navbar displays a **Sign in** button linking to `/login`.
   - When signed in, the Navbar dynamically displays a **Dashboard** button linking to `/dashboard`.
2. **Login Page (`/login`)**:
   - Clean sign-in interface with Google OAuth branding.
   - Submits server-side `signIn("google", { redirectTo: "/dashboard" })`.
   - If user is already authenticated, redirects directly to `/dashboard`.
3. **Protected Dashboard (`/dashboard`)**:
   - Protected via Edge `src/middleware.ts` AND server-side `auth()` check.
   - Displays user name, email, Google avatar (`next/image` with `remotePatterns` for `lh3.googleusercontent.com`), and assigned role.
   - Server-side Sign Out button calling `signOut({ redirectTo: "/login" })`.
4. **Admin Role Promotion**:
   - Configured with `ADMIN_EMAILS` (comma-separated).
   - In the `signIn` callback, if the user's email matches `ADMIN_EMAILS` (case-insensitively trimmed), their role in the database is automatically set to `ADMIN`.
   - Existing admins are never downgraded.

---

## 🚢 Deployment (Vercel)

1. Connect your repository to Vercel.
2. In **Settings → Environment Variables**, add the following variables for both **Production** and **Preview**:
   - `DATABASE_URL` (Neon connection string with `?sslmode=require`)
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_URL` (`https://<your-vercel-domain>`)
   - `ADMIN_EMAILS`
   - `AUTH_TRUST_HOST=true`
3. Vercel will run `postinstall: prisma generate` automatically and `next build` cleanly.
4. Run `npm run db:deploy` once to apply migrations to production before user sign-in.

---

## 📜 Scripts Reference

- `npm run dev`: Start Next.js development server
- `npm run build`: Production build with type checking, linting, and static optimization
- `npm run start`: Launch production server locally
- `npm run lint`: Run ESLint checks
- `npm run db:migrate`: Run Prisma migrations in development mode (`prisma migrate dev`)
- `npm run db:deploy`: Apply pending migrations in production (`prisma migrate deploy`)
- `npm run postinstall`: Generate Prisma client (`prisma generate`)
