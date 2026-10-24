# Deployment Guide for Kavya Labs

This guide provides step-by-step instructions for deploying the Kavya Labs Next.js application both **locally (production mode)** and to **Vercel**.

---

## 1. Prerequisites

Ensure your environment meets the pinned requirements:
- **Node.js**: `20.x` (LTS, matching `.nvmrc` and `engines` field in `package.json`)
- **npm**: `10.x` or higher
- **Git**: Installed and configured

Check versions:
```bash
node -v
npm -v
```

---

## 2. Local Production Deployment

To build and run the production-optimized application on your local machine or an internal virtual machine/container:

### Step 1: Install Dependencies
Ensure exact pinned dependencies are installed:
```bash
npm install
```

### Step 2: Build the Application
Run the Next.js production build. This compiles TypeScript, runs ESLint, generates static pages, and compiles CSS:
```bash
npm run build
```

Expected output:
- `✓ Compiled successfully`
- `✓ Linting and checking validity of types`
- `✓ Generating static pages (5/5)`
- `Route (app): / (Static)`

### Step 3: Start the Production Server
Launch the Node.js production server:
```bash
npm run start
```

By default, the server listens on `http://localhost:3000`.

### Optional: Run on a Custom Port
To run on a specific port (e.g., port `8080`):
```bash
npx next start -p 8080
```

---

## 3. Vercel Deployment

Next.js is maintained by Vercel and is optimized for zero-configuration deployments on Vercel's global edge network.

### Method A: Deploy via GitHub / GitLab / Bitbucket (Recommended)

1. **Push your code to a remote Git repository**:
   ```bash
   git remote add origin https://github.com/<your-username>/kavya-labs.git
   git branch -M main
   git push -u origin main
   ```

2. **Import project into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Log in and select **Import Project** from your Git provider.
   - Choose the `kavya-labs` repository.

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: `./` (default)
   - **Node.js Version**: In **Settings > General > Node.js Version**, ensure `20.x` is selected (Vercel automatically honors `.nvmrc`).
   - **Build Command**: `next build` (or `npm run build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Deploy**:
   - Click **Deploy**.
   - Vercel builds the project and provisions a production URL (e.g., `https://kavya-labs.vercel.app`).
   - Subsequent pushes to the `main` branch will automatically trigger production deployments, while feature branches generate preview deployments.

---

### Method B: Deploy via Vercel CLI

1. **Authenticate with Vercel**:
   ```bash
   npx vercel login
   ```

2. **Deploy Preview**:
   From the project root directory, run:
   ```bash
   npx vercel
   ```
   Follow the interactive prompts:
   - *Set up and deploy?* **Y**
   - *Which scope?* Select your account/team
   - *Link to existing project?* **N**
   - *What's your project's name?* `kavya-labs`
   - *In which directory is your code located?* `./`
   - *Want to modify settings?* **N**

3. **Deploy to Production**:
   Once you have verified the preview build, deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## 4. Pre-Deployment Verification Checklist

Before pushing any changes to production, run the following verification checks:

1. **Lint Check**:
   ```bash
   npm run lint
   ```
   *Must report zero errors and zero warnings.*

2. **Type Check & Build**:
   ```bash
   npm run build
   ```
   *Must compile with exit code 0.*

3. **Check File Path Casing**:
   Verify that all component imports match the exact file names on disk:
   - `@/components/Navbar` -> `src/components/Navbar.tsx`
   - `@/components/Hero` -> `src/components/Hero.tsx`
   - `@/components/Features` -> `src/components/Features.tsx`
   - `@/components/Footer` -> `src/components/Footer.tsx`

4. **Line Endings & Git Attributes**:
   Confirm `.gitattributes` has `* text=auto eol=lf` to prevent line ending discrepancies between Windows, Linux, and Vercel build runners.

---

## 5. Custom Domain Configuration (Vercel)

1. Open your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings > Domains**.
3. Enter your custom domain (e.g. `kavyalabs.ai` or `www.kavyalabs.ai`).
4. Configure DNS records at your domain registrar:
   - For Apex domain (`kavyalabs.ai`): A record pointing to `76.76.21.21`
   - For Subdomain / `www` (`www.kavyalabs.ai`): CNAME record pointing to `cname.vercel-dns.com`
5. Vercel will automatically issue and renew free SSL certificates via Let's Encrypt.

---

## 6. Resolving Vercel Security Block (CVE-2025-66478)

If your build on Vercel finishes compiling but fails at output deployment with:
```text
Build cache cleared after a dependency security block. Redeploy to build with a clean cache.
Vulnerable version of Next.js detected, please update immediately.
```

### Cause:
Older Next.js releases (such as `next@15.1.7`) contain a critical vulnerability in React Server Components (CVE-2025-66478). Vercel blocks deployments containing vulnerable Next.js binaries.

### Solution Applied:
1. Upgraded `next` to `15.5.28` and `eslint-config-next` to `15.5.28`.
2. Upgraded `react` and `react-dom` to `19.0.3` (patched for CVE-2025-55182).
3. Upgraded `eslint` to `9.39.5` (removes deprecated 9.20.1 warning).
4. Configured `outputFileTracingRoot: path.join(__dirname)` in `next.config.ts`.
5. When redeploying on Vercel: go to your deployment, click **Redeploy**, and ensure **Use existing build cache** is unchecked to build with a fresh clean cache.

---

## 7. Database Configuration (Local MySQL vs Production PostgreSQL)

The project supports both local MySQL testing and cloud PostgreSQL (Neon):

### Local Testing with MySQL:
1. Ensure your local MySQL server is running (port `3306`).
2. In `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
3. In `.env.local` or `.env`:
   ```env
   DATABASE_URL="mysql://root:Shiva%40123%24@localhost:3306/kavya_labs"
   ```
4. Push the schema to your local MySQL database:
   ```bash
   npx prisma db push
   ```

### Deploying to Production (Vercel + Neon PostgreSQL):
1. In `prisma/schema.prisma`, ensure provider is set to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In Vercel Environment Variables, supply your Neon PostgreSQL connection string ending with `?sslmode=require`.
3. Run `npm run db:deploy` or `npx prisma db push` to synchronize your Neon database.

---

## 8. User-Friendly Error Handling

The application includes end-to-end user-friendly error handlers:
- **`src/app/not-found.tsx`**: Custom 404 page styled with Kavya Labs dark theme, clear messaging, and quick navigation buttons back to Home or Login.
- **`src/app/error.tsx`**: React Error Boundary with user-friendly error guidance, error reference ID support, and an interactive **Try Again** retry button.
- **`src/app/global-error.tsx`**: Root layout exception handler providing graceful recovery UI.
- **`src/app/login/page.tsx`**: Intelligent NextAuth error handling that displays friendly alerts for common OAuth errors (AccessDenied, Configuration, Verification, Callback errors) instead of blank or broken redirects.

