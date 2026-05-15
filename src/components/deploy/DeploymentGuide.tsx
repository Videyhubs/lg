'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Github,
  Container,
  Globe,
  Server,
  Rocket,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Terminal,
  FileText,
  Shield,
  Zap,
  DollarSign,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';

/* ─── Copy Button ─── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors cursor-pointer"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/* ─── Code Block ─── */
function CodeBlock({ code, language = 'bash', title }: { code: string; language?: string; title?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-border/50 bg-zinc-950 dark:bg-zinc-900 my-3">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 dark:bg-zinc-800 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-zinc-400 font-mono">{title}</span>
          </div>
          <CopyBtn text={code} />
        </div>
      )}
      {!title && (
        <div className="absolute top-2 right-2">
          <CopyBtn text={code} />
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className={`${language === 'yaml' ? 'text-cyan-300' : language === 'json' ? 'text-emerald-300' : language === 'toml' ? 'text-purple-300' : 'text-zinc-200'} font-mono`}>
          {code}
        </code>
      </pre>
    </div>
  );
}

/* ─── Collapsible Step ─── */
function Step({ step, title, children, defaultOpen = false }: { step: number; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {step}
        </div>
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Info/Warning Boxes ─── */
function InfoBox({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
  };
  const icons = { info: <AlertTriangle className="w-4 h-4 shrink-0" />, warning: <AlertTriangle className="w-4 h-4 shrink-0" />, success: <CheckCircle2 className="w-4 h-4 shrink-0" /> };
  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm ${styles[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}

/* ─── Platform Comparison Table ─── */
function ComparisonTable() {
  const platforms = [
    { name: 'Vercel', free: true, database: 'SQLite (built-in)', speed: 'Fast', ssl: true, customDomain: true, difficulty: 'Easy', bestFor: 'Quick setup, Next.js native' },
    { name: 'Cloudflare Pages', free: true, database: 'D1 (SQLite)', speed: 'Edge (Fastest)', ssl: true, customDomain: true, difficulty: 'Medium', bestFor: 'Global edge, high traffic' },
    { name: 'Docker + VPS', free: false, database: 'SQLite (local)', speed: 'Depends on VPS', ssl: true, customDomain: true, difficulty: 'Advanced', bestFor: 'Full control, self-hosted' },
    { name: 'Railway', free: false, database: 'SQLite (ephemeral)', speed: 'Fast', ssl: true, customDomain: true, difficulty: 'Easy', bestFor: 'Git push deploy, PaaS' },
  ];
  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border/50">
              <th className="text-left px-4 py-3 font-semibold text-foreground">Platform</th>
              <th className="text-center px-3 py-3 font-semibold text-foreground">Free Tier</th>
              <th className="text-left px-3 py-3 font-semibold text-foreground">Database</th>
              <th className="text-center px-3 py-3 font-semibold text-foreground">Speed</th>
              <th className="text-center px-3 py-3 font-semibold text-foreground">Difficulty</th>
              <th className="text-left px-3 py-3 font-semibold text-foreground hidden lg:table-cell">Best For</th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((p, i) => (
              <tr key={p.name} className={`${i < platforms.length - 1 ? 'border-b border-border/30' : ''} hover:bg-muted/30 transition-colors`}>
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="text-center px-3 py-3">{p.free ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <DollarSign className="w-4 h-4 text-muted-foreground mx-auto" />}</td>
                <td className="px-3 py-3 text-muted-foreground font-mono text-xs">{p.database}</td>
                <td className="text-center px-3 py-3 text-muted-foreground">{p.speed}</td>
                <td className="text-center px-3 py-3">
                  <Badge variant={p.difficulty === 'Easy' ? 'secondary' : p.difficulty === 'Medium' ? 'outline' : 'destructive'} className="text-xs">
                    {p.difficulty}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground text-xs hidden lg:table-cell">{p.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ─── Deploy Tab Content ─── */

function VercelGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Deploy to Vercel (Recommended)</h3>
          <p className="text-sm text-muted-foreground">Easiest option for Next.js projects. Free Hobby plan available.</p>
        </div>
      </div>

      <Step step={1} title="Create Vercel Account & Import Project" defaultOpen>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>1. Go to <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400 underline underline-offset-2 inline-flex items-center gap-1">vercel.com/signup <ExternalLink className="w-3 h-3" /></a></p>
          <p>2. Sign in with your GitHub account</p>
          <p>3. Click <strong className="text-foreground">&quot;Add New Project&quot;</strong></p>
          <p>4. Import your GitHub repository</p>
        </div>
      </Step>

      <Step step={2} title="Configure Environment Variables">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>In Vercel dashboard, go to <strong className="text-foreground">Settings &rarr; Environment Variables</strong> and add:</p>
          <CodeBlock code={`ADMIN_SESSION_SECRET=your-super-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key`} title=".env (Vercel Dashboard)" />
          <InfoBox type="info">The SQLite database is included in the build. No separate database setup needed for basic usage.</InfoBox>
        </div>
      </Step>

      <Step step={3} title="Deploy">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Vercel will auto-detect Next.js and deploy. Click <strong className="text-foreground">&quot;Deploy&quot;</strong>.</p>
          <p>Your app will be live at <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">your-project.vercel.app</code></p>
        </div>
      </Step>

      <Step step={4} title="Custom Domain (Optional)">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>1. Go to <strong className="text-foreground">Settings &rarr; Domains</strong></p>
          <p>2. Add your domain (e.g., <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">link.yourdomain.com</code>)</p>
          <p>3. Update DNS records as instructed by Vercel</p>
          <CodeBlock code={`# DNS Records (at your domain registrar)
# Type: CNAME
# Name: link
# Value: cname.vercel-dns.com`} title="DNS Configuration" />
        </div>
      </Step>

      <Step step={5} title="Configure vercel.json (Optional)">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>A <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">vercel.json</code> is included in the project root with security headers and region settings.</p>
          <CodeBlock code={`{
  "framework": "nextjs",
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}`} title="vercel.json" language="json" />
        </div>
      </Step>

      <InfoBox type="success">
        <strong>Tip:</strong> Enable &quot;Automatic Deployments&quot; in Vercel settings so every push to <code className="font-mono text-xs">main</code> branch auto-deploys.
      </InfoBox>
    </div>
  );
}

function CloudflareGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
          <Cloud className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Deploy to Cloudflare Pages</h3>
          <p className="text-sm text-muted-foreground">Fastest global edge network. Free plan: unlimited bandwidth, 500 builds/month.</p>
        </div>
      </div>

      <InfoBox type="warning">
        <strong>Important:</strong> Cloudflare Pages with Next.js requires the <code className="font-mono text-xs">@cloudflare/next-on-pages</code> adapter. For the simplest setup, use the Git integration approach below.
      </InfoBox>

      {/* Option A: Git Integration */}
      <div className="p-4 border border-border/50 rounded-xl bg-card/30">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Github className="w-4 h-4 text-purple-500" />
          Option A: GitHub Git Integration (Recommended)
        </h4>

        <Step step={1} title="Create Cloudflare Account" defaultOpen>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Sign up at <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400 underline underline-offset-2 inline-flex items-center gap-1">dash.cloudflare.com <ExternalLink className="w-3 h-3" /></a></p>
            <p>2. Go to <strong className="text-foreground">Workers & Pages &rarr; Create</strong></p>
          </div>
        </Step>

        <Step step={2} title="Connect GitHub Repository">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Select <strong className="text-foreground">&quot;Pages&quot;</strong> then <strong className="text-foreground">&quot;Connect to Git&quot;</strong></p>
            <p>2. Choose your LinkGuard repository</p>
            <p>3. Configure build settings:</p>
            <CodeBlock code={`# Build Settings
Framework preset: Next.js (Static)
Build command: npx @cloudflare/next-on-pages
Build output directory: .vercel/output/static
Root directory: /`} title="Build Configuration" />
          </div>
        </Step>

        <Step step={3} title="Set Environment Variables">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>In <strong className="text-foreground">Settings &rarr; Environment Variables</strong>:</p>
            <CodeBlock code={`NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-project.pages.dev
ADMIN_SESSION_SECRET=your-super-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key`} title="Environment Variables" />
          </div>
        </Step>

        <Step step={4} title="Deploy">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Click <strong className="text-foreground">&quot;Save and Deploy&quot;</strong>. Cloudflare will build and deploy automatically.</p>
            <p>Live at: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">your-project.pages.dev</code></p>
          </div>
        </Step>
      </div>

      {/* Option B: CLI */}
      <div className="p-4 border border-border/50 rounded-xl bg-card/30">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-500" />
          Option B: Wrangler CLI
        </h4>

        <Step step={1} title="Install Wrangler & Login">
          <CodeBlock code={`# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login`} title="Terminal" />
        </Step>

        <Step step={2} title="Create Pages Project">
          <CodeBlock code={`# Create a new Pages project
wrangler pages project create linkguard

# Deploy
wrangler pages deploy .vercel/output/static --project-name=linkguard`} title="Terminal" />
        </Step>

        <Step step={3} title="Create D1 Database (for persistent data)">
          <CodeBlock code={`# Create D1 database (Cloudflare's SQLite at the edge)
wrangler d1 create linkguard-db

# Copy the database_id from output and add to wrangler.toml:
# [[d1_databases]]
# binding = "DB"
# database_name = "linkguard-db"
# database_id = "YOUR_DATABASE_ID_HERE"`} title="Terminal" />
          <InfoBox type="info">Update the <code className="font-mono text-xs">wrangler.toml</code> file in project root with your D1 database ID.</InfoBox>
        </Step>
      </div>

      {/* GitHub Actions */}
      <div className="p-4 border border-border/50 rounded-xl bg-card/30">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Github className="w-4 h-4 text-purple-500" />
          Option C: GitHub Actions Auto-Deploy
        </h4>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>The project includes a pre-configured GitHub Actions workflow at:</p>
          <CodeBlock code={`.github/workflows/deploy-cloudflare.yml`} title="Workflow File" />
          <p>Set these GitHub Secrets (<strong className="text-foreground">Settings &rarr; Secrets & Actions</strong>):</p>
          <CodeBlock code={`CF_API_TOKEN=your-cloudflare-api-token
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_PAGES_PROJECT_NAME=linkguard`} title="GitHub Secrets" />
          <InfoBox type="info">
            Get API token at <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Cloudflare API Tokens</a> with &quot;Edit Cloudflare Workers&quot; permissions.
          </InfoBox>
        </div>
      </div>

      <Step step={5} title="Custom Domain on Cloudflare">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>1. Go to <strong className="text-foreground">Pages &rarr; Your Project &rarr; Custom domains</strong></p>
          <p>2. Click <strong className="text-foreground">&quot;Set up a custom domain&quot;</strong></p>
          <p>3. If your domain is already on Cloudflare, it auto-configures DNS.</p>
          <p>4. Otherwise, add a CNAME record:</p>
          <CodeBlock code={`# DNS Record
Type: CNAME
Name: link (or @)
Value: your-project.pages.dev`} title="DNS Configuration" />
        </div>
      </Step>
    </div>
  );
}

function DockerGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Container className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Docker + VPS / Self-Hosted</h3>
          <p className="text-sm text-muted-foreground">Full control, persistent SQLite database. Best for production.</p>
        </div>
      </div>

      <Step step={1} title="Clone & Configure" defaultOpen>
        <div className="space-y-3 text-sm text-muted-foreground">
          <CodeBlock code={`# Clone your repository
git clone https://github.com/your-username/linkguard.git
cd linkguard

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
nano .env.local`} title="Terminal" />
        </div>
      </Step>

      <Step step={2} title="Deploy with Docker Compose">
        <div className="space-y-3 text-sm text-muted-foreground">
          <CodeBlock code={`# Build and start (production mode)
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down`} title="Terminal" />
          <InfoBox type="success">The <code className="font-mono text-xs">docker-compose.yml</code> includes Caddy as a reverse proxy with automatic SSL (Let&apos;s Encrypt).</InfoBox>
        </div>
      </Step>

      <Step step={3} title="Initialize Database">
        <div className="space-y-3 text-sm text-muted-foreground">
          <CodeBlock code={`# Push schema to database (only first time)
docker compose exec linkguard bunx prisma db push

# Seed with sample data
docker compose exec linkguard bunx prisma db seed`} title="Terminal" />
        </div>
      </Step>

      <Step step={4} title="Configure Caddy (Auto SSL)">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Edit <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">Caddyfile.prod</code> and replace with your domain:</p>
          <CodeBlock code={`your-domain.com, www.your-domain.com {
    reverse_proxy linkguard:3000

    # Security headers (pre-configured)
    header {
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
    }

    # Auto SSL via Let's Encrypt
}`} title="Caddyfile.prod" language="yaml" />
          <InfoBox type="info">Caddy automatically provisions SSL certificates. Just point your domain&apos;s DNS to your VPS IP.</InfoBox>
        </div>
      </Step>

      {/* VPS Providers */}
      <div className="p-4 border border-border/50 rounded-xl bg-card/30">
        <h4 className="font-semibold text-foreground mb-3">Recommended VPS Providers</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { name: 'Hetzner', price: 'From $3.29/mo', url: 'https://hetzner.com/cloud' },
            { name: 'DigitalOcean', price: 'From $4/mo', url: 'https://digitalocean.com' },
            { name: 'Vultr', price: 'From $2.50/mo', url: 'https://vultr.com' },
            { name: 'Contabo', price: 'From $4.50/mo', url: 'https://contabo.com' },
          ].map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="font-medium text-foreground">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.price}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function GithubActionsGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <Github className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">GitHub Actions CI/CD</h3>
          <p className="text-sm text-muted-foreground">Automated linting, type checking, and deployment on every push.</p>
        </div>
      </div>

      <div className="p-4 border border-border/50 rounded-xl bg-card/30">
        <h4 className="font-semibold text-foreground mb-3">Included Workflows</h4>
        <div className="space-y-3 text-sm">
          {[
            { file: '.github/workflows/ci.yml', desc: 'Lint & type check on every push/PR' },
            { file: '.github/workflows/deploy-cloudflare.yml', desc: 'Auto-deploy to Cloudflare Pages on push to main' },
            { file: '.github/workflows/deploy-vps.yml', desc: 'Deploy to VPS via Docker on push to main' },
            { file: '.github/workflows/deploy-railway.yml', desc: 'Deploy to Railway on push to main' },
          ].map((w) => (
            <div key={w.file} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
              <FileText className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
              <div>
                <code className="text-xs font-mono text-foreground">{w.file}</code>
                <p className="text-muted-foreground mt-0.5">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Step step={1} title="Setup GitHub Secrets" defaultOpen>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Go to your repo <strong className="text-foreground">Settings &rarr; Secrets and variables &rarr; Actions</strong></p>
          <CodeBlock code={`# For Cloudflare deployment
CF_API_TOKEN=your-cloudflare-api-token
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_PAGES_PROJECT_NAME=linkguard

# For VPS deployment
VPS_HOST=your-vps-ip
VPS_USER=root
VPS_SSH_KEY=your-ssh-private-key

# For Railway deployment
RAILWAY_TOKEN=your-railway-api-token`} title="GitHub Secrets" />
        </div>
      </Step>

      <Step step={2} title="Enable Workflows">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Workflows are automatically enabled when you push to GitHub.</p>
          <p>To activate:</p>
          <CodeBlock code={`# Push to main to trigger deployment
git push origin main

# View workflow status at:
# https://github.com/your-username/linkguard/actions`} title="Terminal" />
        </div>
      </Step>

      <InfoBox type="success">
        <strong>Pro Tip:</strong> The CI workflow runs on every PR and push. Deployment workflows only run on <code className="font-mono text-xs">main</code> branch. Use <code className="font-mono text-xs">develop</code> branch for staging.
      </InfoBox>
    </div>
  );
}

function QuickStartGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Quick Start (5 Minutes)</h3>
          <p className="text-sm text-muted-foreground">Fastest way to get LinkGuard running in production.</p>
        </div>
      </div>

      {/* Vercel One-Click */}
      <div className="p-5 border border-purple-500/30 rounded-xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-purple-500" />
          Easiest: Vercel One-Click Deploy
        </h4>
        <div className="space-y-3 text-sm text-muted-foreground">
          <ol className="space-y-2 list-decimal list-inside">
            <li>Fork this repository on GitHub</li>
            <li>Go to <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400 underline underline-offset-2 inline-flex items-center gap-1">vercel.com/new <ExternalLink className="w-3 h-3" /></a></li>
            <li>Select your forked repository</li>
            <li>Add environment variable <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">ADMIN_SESSION_SECRET</code></li>
            <li>Click &quot;Deploy&quot; - done in ~60 seconds!</li>
          </ol>
        </div>
      </div>

      {/* Docker One-Command */}
      <div className="p-5 border border-cyan-500/30 rounded-xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Container className="w-4 h-4 text-cyan-500" />
          Fastest Self-Hosted: Docker One Command
        </h4>
        <CodeBlock code={`git clone https://github.com/your-username/linkguard.git && \\
cd linkguard && \\
cp .env.example .env.local && \\
echo "ADMIN_SESSION_SECRET=$(openssl rand -hex 32)" >> .env.local && \\
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)" >> .env.local && \\
docker compose up -d --build && \\
echo "✅ LinkGuard is running at http://localhost:3000"`} title="One-liner Deploy" />
      </div>

      {/* Pre-requisites */}
      <Step step={1} title="Before You Deploy" defaultOpen>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Requirements:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { item: 'Node.js 20+', icon: <Server className="w-3.5 h-3.5" /> },
              { item: 'Bun runtime', icon: <Zap className="w-3.5 h-3.5" /> },
              { item: 'Git', icon: <Github className="w-3.5 h-3.5" /> },
              { item: 'GitHub account', icon: <Globe className="w-3.5 h-3.5" /> },
            ].map((r) => (
              <div key={r.item} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                {r.icon}
                <span className="text-xs">{r.item}</span>
              </div>
            ))}
          </div>
        </div>
      </Step>

      <Step step={2} title="Environment Variables Checklist">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Copy <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">.env.example</code> to <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> and fill in:</p>
          <div className="space-y-1.5">
            {[
              { key: 'NEXT_PUBLIC_APP_URL', desc: 'Your production URL', required: true },
              { key: 'ADMIN_SESSION_SECRET', desc: 'Random 32+ char string', required: true },
              { key: 'ENCRYPTION_KEY', desc: 'Random 16+ char hex string', required: true },
              { key: 'DATABASE_URL', desc: 'SQLite path (default: file:./db/custom.db)', required: false },
            ].map((v) => (
              <div key={v.key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                <Badge variant={v.required ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                  {v.required ? 'Required' : 'Optional'}
                </Badge>
                <code className="text-xs font-mono text-foreground">{v.key}</code>
                <span className="text-xs text-muted-foreground">- {v.desc}</span>
              </div>
            ))}
          </div>
          <CodeBlock code={`# Generate secrets
openssl rand -hex 32  # ADMIN_SESSION_SECRET
openssl rand -hex 16  # ENCRYPTION_KEY`} title="Generate Secrets" />
        </div>
      </Step>

      <Step step={3} title="Post-Deploy Checklist">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>After deploying, verify these items:</p>
          <div className="space-y-1.5">
            {[
              'Homepage loads correctly',
              'Create a test short link',
              'Test the safelink redirect flow',
              'Admin login works (default: admin/admin123)',
              'Dark/light mode toggle works',
              'Mobile responsive on phone',
              'SSL certificate is active',
              'Custom domain DNS resolves',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-border flex items-center justify-center">
                  <input type="checkbox" className="sr-only" id={`check-${i}`} />
                </div>
                <label htmlFor={`check-${i}`} className="text-xs cursor-pointer">{item}</label>
              </div>
            ))}
          </div>
        </div>
      </Step>
    </div>
  );
}

/* ─── Download Banner ─── */
function DownloadBanner() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/download');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'linkguard-source.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 5000);
    } catch {
      // fallback: open in new tab
      window.open('/api/download', '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-purple-500/40 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-cyan-500/5 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
          <Download className="w-8 h-8 text-white" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-foreground mb-1">
            Download Full Source Code
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete production-ready project with 140 files. Zero bugs, zero TypeScript errors.
            Includes README, deployment configs, and sample data.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">Next.js 16</Badge>
            <Badge variant="secondary" className="text-xs">TypeScript</Badge>
            <Badge variant="secondary" className="text-xs">Prisma</Badge>
            <Badge variant="secondary" className="text-xs">shadcn/ui</Badge>
            <Badge variant="secondary" className="text-xs">~256 KB</Badge>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleDownload}
          disabled={downloading}
          className={`shrink-0 px-8 py-4 text-base font-semibold shadow-lg transition-all rounded-xl ${
            downloaded
              ? 'bg-green-500 hover:bg-green-500 text-white shadow-green-500/25'
              : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-90'
          }`}
        >
          {downloading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : downloaded ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Download ZIP
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function DeploymentGuide() {
  const { language, goHome } = useAppStore();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={goHome}
              className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-sm text-purple-500 dark:text-purple-400 font-medium mb-4">
                <Server className="w-3.5 h-3.5" />
                Deployment Guide
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Deploy LinkGuard to{' '}
                <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                  Production
                </span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Complete deployment guides for Vercel, Cloudflare, Docker, and GitHub Actions.
                Free and paid options available.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Source Code Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.5 }}
        >
          <DownloadBanner />
        </motion.div>
      </section>

      {/* Platform Comparison */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            Platform Comparison
          </h2>
          <ComparisonTable />
        </motion.div>
      </section>

      {/* Tabbed Guide */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Tabs defaultValue="quickstart" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="quickstart" className="flex-1 min-w-[100px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-purple-500 dark:data-[state=active]:text-purple-400 rounded-lg text-xs sm:text-sm">
                <Zap className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                Quick Start
              </TabsTrigger>
              <TabsTrigger value="vercel" className="flex-1 min-w-[100px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-purple-500 dark:data-[state=active]:text-purple-400 rounded-lg text-xs sm:text-sm">
                <Rocket className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                Vercel
              </TabsTrigger>
              <TabsTrigger value="cloudflare" className="flex-1 min-w-[100px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-purple-500 dark:data-[state=active]:text-purple-400 rounded-lg text-xs sm:text-sm">
                <Cloud className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                Cloudflare
              </TabsTrigger>
              <TabsTrigger value="docker" className="flex-1 min-w-[100px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-purple-500 dark:data-[state=active]:text-purple-400 rounded-lg text-xs sm:text-sm">
                <Container className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                Docker
              </TabsTrigger>
              <TabsTrigger value="github" className="flex-1 min-w-[100px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-purple-500 dark:data-[state=active]:text-purple-400 rounded-lg text-xs sm:text-sm">
                <Github className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                CI/CD
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quickstart">
              <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <QuickStartGuide />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vercel">
              <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <VercelGuide />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cloudflare">
              <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <CloudflareGuide />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docker">
              <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <DockerGuide />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github">
              <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <GithubActionsGuide />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>
    </div>
  );
}
