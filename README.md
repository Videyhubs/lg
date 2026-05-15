# LinkGuard - Smart Shortlink & Safelink Platform

<p align="center">
  <strong>Professional link management with smart safelink protection, URL cloaking, analytics, and more.</strong><br/>
  Facebook-safe redirect system | Modern UI 2026 | PWA Ready
</p>

---

## Features

### Core
- **Short Link Generator** - Create short links with custom slugs, passwords, expiration, max clicks
- **Safelink Redirect** - Article-based redirect system with countdown timer
- **URL Cloaking** - Hide original URLs with encoded slugs, Facebook-safe
- **Random Article System** - Display random articles as intermediate pages
- **Analytics Dashboard** - Track clicks, devices, browsers, referrers, daily stats

### Security
- **Facebook Cloaking** - Dynamic OG meta tags show article preview, not redirect URL
- **Password Protection** - Optional password for individual links
- **Rate Limiting** - API protection against abuse
- **Brute Force Prevention** - Admin login lockout after 5 failed attempts
- **IP Blacklist** - Block malicious IPs

### Admin Dashboard (8 Tabs)
- Dashboard (stats, charts, top links/articles)
- Manage Links (CRUD, search, pagination)
- Manage Articles (CRUD, rich content)
- Ad Manager (multi-position, device targeting)
- Settings (general, features, SEO, scripts)
- Branding (logo, colors, domain, footer)
- Security (password, IP blacklist)
- Export/Import (JSON, CSV)

### UI/UX
- Glassmorphism design with neon gradient accents
- Dark/Light mode with system detection
- Mobile-first responsive design
- Skeleton loading states
- Framer Motion animations
- Multi-language (English / Indonesian)
- PWA ready with manifest

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite (Prisma ORM) |
| State | Zustand (client) + TanStack Query |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Quick Start

### Prerequisites
- Node.js 20+ or Bun runtime
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/linkguard.git
cd linkguard

# 2. Install dependencies
bun install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your settings (see below)

# 4. Setup database
bunx prisma generate
bunx prisma db push
bunx prisma db seed

# 5. Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Admin Login
- **Username:** `admin`
- **Password:** `admin123`

> **Important:** Change the admin password immediately after first login via Admin > Security tab.

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Set to `production` for deploy |
| `NEXT_PUBLIC_APP_URL` | Yes | - | Your production URL |
| `DATABASE_URL` | No | `file:./db/custom.db` | SQLite database path |
| `ADMIN_SESSION_SECRET` | Yes | - | Random 32+ char string |
| `ENCRYPTION_KEY` | Yes | - | Random 16+ char hex string |

Generate secrets:
```bash
openssl rand -hex 32  # ADMIN_SESSION_SECRET
openssl rand -hex 16  # ENCRYPTION_KEY
```

---

## Deployment

### Vercel (Recommended - Free)

1. Fork & push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add `ADMIN_SESSION_SECRET` and `ENCRYPTION_KEY` in Environment Variables
4. Deploy

Or use the built-in `vercel.json` config (auto-detected).

### Cloudflare Pages (Free)

**Option A: Git Integration**
1. Go to Cloudflare Dashboard > Workers & Pages > Create
2. Select "Pages" > "Connect to Git"
3. Build: `npx @cloudflare/next-on-pages`
4. Output: `.vercel/output/static`

**Option B: Wrangler CLI**
```bash
npm i -g wrangler
wrangler login
wrangler pages project create linkguard
wrangler pages deploy .vercel/output/static --project-name=linkguard
```

**Option C: GitHub Actions**
```bash
# Set GitHub Secrets:
CF_API_TOKEN, CF_ACCOUNT_ID, CF_PAGES_PROJECT_NAME
# Push to main -> auto-deploy
```

See `wrangler.toml` for D1 database and KV configuration.

### Docker + VPS (Self-Hosted)

```bash
# Clone and configure
git clone https://github.com/your-username/linkguard.git
cd linkguard
cp .env.example .env.local

# One-command deploy
docker compose up -d --build

# Initialize database
docker compose exec linkguard bunx prisma db push
docker compose exec linkguard bunx prisma db seed
```

Includes Caddy reverse proxy with auto-SSL (Let's Encrypt).

### GitHub Actions CI/CD

4 pre-configured workflows:
- `ci.yml` - Lint & type check on every push/PR
- `deploy-cloudflare.yml` - Deploy to Cloudflare Pages
- `deploy-vps.yml` - Deploy to VPS via Docker + SSH
- `deploy-railway.yml` - Deploy to Railway

---

## Project Structure

```
linkguard/
├── prisma/
│   ├── schema.prisma          # Database schema (8 models)
│   └── seed.ts                # Sample data seeder
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── robots.txt             # SEO robots
│   └── logo.svg               # App logo
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with ThemeProvider
│   │   ├── page.tsx           # Main page with dynamic OG meta
│   │   ├── globals.css        # Global styles + dark mode
│   │   └── api/
│   │       ├── route.ts       # Health check
│   │       ├── links/         # Link CRUD API
│   │       ├── articles/      # Article CRUD API
│   │       ├── safelink/      # Safelink redirect + password verify
│   │       ├── stats/         # Dashboard statistics
│   │       ├── settings/      # Site settings
│   │       ├── admin/         # Admin login/auth
│   │       ├── ads/           # Ad slot management
│   │       └── visitor/       # Visitor tracking
│   ├── components/
│   │   ├── AppClient.tsx      # Client-side app router
│   │   ├── layout/            # Header, Footer
│   │   ├── home/              # HomePage with hero, features, stats
│   │   ├── safelink/          # SafelinkPage with article + countdown
│   │   ├── shortlink/         # ShortlinkCreator with QR code
│   │   ├── admin/             # AdminLogin, AdminDashboard (8 tabs)
│   │   ├── deploy/            # DeploymentGuide (5 tabs)
│   │   ├── ads/               # AdSlot component
│   │   ├── shared/            # Notification (toast)
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── db.ts              # Prisma database client
│   │   ├── crypto.ts          # Password hashing, encryption, slug gen
│   │   ├── i18n.ts            # English/Indonesian translations
│   │   ├── rate-limiter.ts    # API rate limiting
│   │   └── utils.ts           # Utility functions
│   ├── store/
│   │   └── app-store.ts       # Zustand global state
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── .github/workflows/         # CI/CD pipelines
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker Compose (app + Caddy)
├── vercel.json                # Vercel deployment config
├── wrangler.toml              # Cloudflare Pages config
├── .env.example               # Environment variables template
└── package.json               # Dependencies & scripts
```

---

## Database Schema

| Model | Description |
|-------|-------------|
| `Link` | Short links with slug, URL, password, expiration, geo targeting |
| `Article` | Blog articles for safelink intermediate pages |
| `Click` | Click tracking with device, browser, OS, referrer, country |
| `SiteSetting` | Key-value site configuration |
| `AdSlot` | Ad placement configuration with device targeting |
| `AdminAccount` | Admin users with login tracking and lockout |
| `BlacklistIp` | Blocked IP addresses |
| `VisitorSession` | Visitor session tracking |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/links` | List links (search, pagination) |
| POST | `/api/links` | Create short link |
| DELETE | `/api/links?id=` | Delete link |
| GET | `/api/articles` | List articles (filter, trending) |
| POST | `/api/articles` | Create article |
| PUT | `/api/articles/[id]` | Update article |
| DELETE | `/api/articles/[id]` | Delete article |
| GET | `/api/safelink?slug=` | Process safelink redirect |
| POST | `/api/safelink` | Verify password for protected link |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/settings` | Get all settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/admin` | Admin login |
| GET | `/api/admin?token=` | Verify admin token |
| GET | `/api/ads` | List ad slots |
| POST | `/api/ads` | Create ad slot |
| PUT | `/api/ads/[id]` | Update ad slot |
| DELETE | `/api/ads/[id]` | Delete ad slot |
| POST | `/api/visitor` | Track visitor session |

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (port 3000) |
| `bun run build` | Build for production |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:seed` | Seed sample data |

---

## Custom Domain Setup

### Vercel
1. Dashboard > Settings > Domains > Add your domain
2. Update DNS: `CNAME link cname.vercel-dns.com`

### Cloudflare Pages
1. Pages > Your Project > Custom domains
2. Add domain (auto-configures if domain is on CF)
3. Otherwise: `CNAME @ your-project.pages.dev`

### Docker + Caddy
Edit `Caddyfile.prod`, replace `your-domain.com` with your domain.
Caddy auto-provisions SSL via Let's Encrypt.

---

## License

MIT License - Free to use, modify, and distribute.

---

## Support

For deployment help, use the built-in **Deploy** guide in the app navigation.
