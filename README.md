# Kavya Labs Landing Page

A modern, high-performance landing page for Kavya Labs, a Bengaluru-based AI startup helping teams ship AI-powered products faster.

## Prerequisites

- **Node.js**: `20.x` (LTS recommended, see `.nvmrc`)
- **npm**: `10.x` or later

## Setup

1. Clone or extract the repository.
2. Install dependencies using pinned versions:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

To produce an optimized production build with TypeScript checking and linting:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

## Linting

To check for code quality and linting rules:

```bash
npm run lint
```

## Tech Stack & Architecture

- **Framework**: Next.js 15.x (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Architecture**:
  - `src/components/Navbar.tsx`: Semantic `<header>` with responsive navigation, accessible hamburger menu (`aria-expanded`, `aria-controls`), and keyboard controls.
  - `src/components/Hero.tsx`: Main hero section with abstract CSS gradient background, brand headline, and primary/secondary CTAs.
  - `src/components/Features.tsx`: Responsive 3-card grid highlighting Fast Integration, Secure by Default, and Built for Scale.
  - `src/components/Footer.tsx`: Semantic `<footer>` with tagline, copyright notice, and essential links.

## Accessibility (a11y)

- WCAG AA compliant contrast ratios across all text and UI elements.
- Semantic HTML tags (`header`, `nav`, `main`, `section`, `footer`).
- Visible focus rings (`focus-visible`) for keyboard navigation.
- Accessible mobile navigation with keyboard escape handling and focus-safe drawer.
- Skip to main content link for screen reader and keyboard users.

## Deployment Notes

- **Vercel**: Connect the repository to Vercel. Framework preset will automatically detect Next.js with Node 20. Zero extra configuration required.
- **Node.js Environment**: Standard Node 20 container/host (`npm run build` followed by `npm run start` or custom standalone output).
- **Environment Consistency**: Pinned versions in `package.json`, `.nvmrc`, and `.gitattributes` guarantee identical builds across Windows, Linux, and Vercel.
