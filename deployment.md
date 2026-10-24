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
