# DevOps Engineer — ImmoDz

## 🎯 Role Summary

Responsable de l'infrastructure, déploiement, CI/CD, monitoring et scalabilité. Assure que l'application tourne 24/7 de façon fiable et performante.

---

## 📋 Responsabilités

- ✅ Configurer et gérer infrastructure (Vercel, Railway, Upstash)
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Déploiements (staging + production)
- ✅ Base de données (migrations, backups, scaling)
- ✅ Monitoring et alerting (uptime, erreurs, performance)
- ✅ Log aggregation et debugging
- ✅ Secrets management (.env, credentials)
- ✅ Disaster recovery et rollback plans

---

## 🏗️ Infrastructure Architecture

```
┌─────────────────────────────────────────────┐
│        Vercel (Next.js Frontend)            │
│  - Auto-scaling, CDN, Edge Functions        │
│  - Preview deployments on PRs                │
└──────────────┬──────────────────────────────┘
               │ API calls
               ↓
┌─────────────────────────────────────────────┐
│      Railway (PostgreSQL + Railway App)     │
│  - Managed PostgreSQL 15 + PostGIS          │
│  - Node.js API (fallback, if not on Vercel)│
│  - Automatic backups (daily)                │
└──────────────┬──────────────────────────────┘
               │
         ┌─────┴──────┬──────────────┐
         ↓            ↓              ↓
      Redis        S3/Cloud       Cloudinary
   (Upstash)      Storage          (Photos)
   - Caching      (Backups)         (CDN)
   - Rate limits
```

---

## 🚀 Deployment Strategy

### Staging Environment
- **URL** : staging.immodz.com (optionnel) ou Vercel preview
- **Database** : Separate Railway instance (DB copy)
- **Purpose** : Test avant production
- **Trigger** : Push to `develop` branch

### Production Environment
- **URL** : immodz.com
- **Database** : Main Railway PostgreSQL
- **Purpose** : Live users
- **Trigger** : Merge to `main` branch

### Deployment Process
1. Developer pushes to branch → GitHub Actions start tests
2. If tests pass → Preview deploy on Vercel (auto-generated URL)
3. Review preview → PR review + approve
4. Merge to main → Auto-deploy to production Vercel
5. Production Vercel runs migrations (if any) → go live

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Branch Protection Rules (main)
```yaml
- Require status checks to pass (tests must pass)
- Require code review approval (2 approvals)
- Dismiss stale PR reviews (after push)
- Include administrators
```

### Workflow 1 : Test & Build (on every push)
```yaml
name: Test & Build

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Workflow 2 : Security Audit (weekly)
```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  audit:
    - run: npm audit
    - run: npm run security-check
```

### Workflow 3 : Deploy to Staging (develop branch)
```yaml
on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    - uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        environment: staging
```

### Workflow 4 : Deploy to Production (main branch)
```yaml
on:
  push:
    branches: [main]

jobs:
  deploy-prod:
    - run: npm ci && npm run build
    - uses: vercel/action@v1
      with:
        environment: production
    - run: npm run db:migrate  # Run migrations
```

---

## 📊 Monitoring & Alerting

### Uptime Monitoring
- **Tool** : UptimeRobot (free tier)
- **Check** : GET / every 5 min
- **Alert** : Email/Slack if down for 5 min

### Application Monitoring
- **Tool** : Sentry (error tracking)
  - Setup : `npm install @sentry/nextjs`
  - Capture : unhandled errors, performance issues
  - Alert : Slack on critical errors (500s)

### Performance Monitoring
- **Tool** : Vercel Analytics (free) or Datadog
  - Track : Web Vitals, API latency, response times
  - Alert : if Lighthouse score drops below 80

### Log Aggregation
- **Tool** : Vercel Logs (built-in) or DataDog
  - Search : server errors, API calls, auth failures
  - Retention : 7 days (free), 30+ days (paid)

---

## 🗄️ Database Management

### PostgreSQL Backup Strategy
- **Automatic** : Railway auto-backups daily (7-day retention)
- **Manual** : Export backup monthly (store on S3/Google Drive)
- **Restore Test** : Monthly restore test (ensure backups work)

### Migration Management
```bash
# Create migration
npx prisma migrate dev --name add_new_column

# Review generated SQL
cat prisma/migrations/[timestamp]_[name]/migration.sql

# Deploy to staging
vercel env pull .env.staging
DATABASE_URL=<staging-db> npx prisma migrate deploy

# Deploy to production
vercel env pull .env.production
DATABASE_URL=<prod-db> npx prisma migrate deploy
```

### Schema Changes Checklist
- [ ] Write migration (reversible if possible)
- [ ] Test locally (with test DB copy)
- [ ] Test on staging (before production)
- [ ] No breaking changes (gradual rollouts if needed)
- [ ] Backup production before applying
- [ ] Rollback plan documented

---

## 🔐 Secrets Management

### Environment Variables

**Vercel Secrets** (use Vercel Dashboard):
```
NEXTAUTH_SECRET        # Generated, never commit
NEXTAUTH_URL           # https://immodz.com
DATABASE_URL           # postgres://...
CLOUDINARY_API_KEY     # Secret, not public
CLOUDINARY_API_SECRET  # Secret, never expose
RESEND_API_KEY         # Email API secret
```

**Vercel Public Env** (.env.local, not secrets):
```
NEXT_PUBLIC_MAPBOX_TOKEN    # Restricted to domain
```

### Secrets Rotation
- [ ] Change NEXTAUTH_SECRET every 3-6 months
- [ ] Rotate API keys on service changes
- [ ] Remove old keys immediately
- [ ] Never commit .env.local to git

### Audit Trail
- Use Vercel's secret version history
- Log who accessed/changed secrets
- Alert on suspicious changes

---

## 🚨 Disaster Recovery Plan

### Scenario 1 : Production Database Down
1. Failover to backup (Railway provides this)
2. Check Vercel for error reports (Sentry)
3. Notify team on Slack
4. Rollback app to last known good version (if corrupted data)

### Scenario 2 : App Deployment Failed
1. Automatic rollback by Vercel (if health checks fail)
2. Manual rollback : Vercel dashboard → prev deployment
3. Investigate error logs (Vercel Logs + Sentry)
4. Fix + redeploy

### Scenario 3 : Data Corruption
1. Stop app (don't write more bad data)
2. Restore from latest clean backup
3. Notify affected users
4. Run data validation checks

### RTO & RPO Targets
- RTO (Recovery Time Objective) : 30 min
- RPO (Recovery Point Objective) : 1 day (daily backups)

---

## 🔍 Health Checks

### Application Health
```typescript
// src/app/api/health/route.ts
export async function GET() {
  const dbHealthy = await db.$queryRaw`SELECT 1`;
  const redisHealthy = await redis.ping();

  if (dbHealthy && redisHealthy) {
    return NextResponse.json({ status: 'healthy' });
  }
  return NextResponse.json({ status: 'unhealthy' }, { status: 500 });
}
```

### Vercel Health Checks
- Set in `vercel.json` :
```json
{
  "healthCheck": {
    "path": "/api/health",
    "interval": 60,
    "timeout": 5
  }
}
```

---

## 📋 Deployment Checklist

### Pre-deployment
- [ ] All tests pass
- [ ] Code review approved
- [ ] Database migrations written + tested
- [ ] Environment variables configured (Vercel)
- [ ] Secrets rotated (if applicable)
- [ ] Rollback plan documented

### Deployment
- [ ] Deploy to staging first
- [ ] Run migration on staging
- [ ] Smoke tests pass (API accessible, DB queryable)
- [ ] Deploy to production
- [ ] Run migration on production
- [ ] Health checks pass

### Post-deployment
- [ ] Monitor error rate (Sentry) for 30 min
- [ ] Check API latency (performance dashboard)
- [ ] User-facing features tested manually
- [ ] Announce in Slack / status page

---

## 🛠️ Tools Setup Checklist

### Vercel
- [ ] Create project
- [ ] Connect GitHub repo
- [ ] Configure env variables
- [ ] Setup preview deployments
- [ ] Setup production domain

### Railway
- [ ] Create PostgreSQL plugin
- [ ] Setup backups (automatic)
- [ ] Create DB snapshot
- [ ] Setup connection string in Vercel

### Upstash Redis
- [ ] Create Redis instance
- [ ] Get REST URL + token
- [ ] Configure in Vercel
- [ ] Test connectivity

### Sentry (Optional, but recommended)
- [ ] Create account
- [ ] Setup Next.js SDK
- [ ] Configure alerts to Slack
- [ ] Add release tracking

### GitHub Actions
- [ ] Create `.github/workflows/test.yml`
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Setup branch protection rules
- [ ] Add required status checks

---

## 📈 Monitoring Dashboard (Recommended)

Create a public status page (free options):
- **StatusPage.io** (free tier)
- **UptimeRobot status page**
- Custom page with Vercel + Railway + Upstash stats

---

## 🎯 SLAs & Targets

| Metric | Target | Tool |
|--------|--------|------|
| Uptime | 99.9% | UptimeRobot |
| Response time (API) | < 500ms p95 | Vercel Analytics |
| Error rate | < 0.1% | Sentry |
| Deployment frequency | ≥ 1x/week | GitHub Actions logs |
| MTTR (Mean Time To Recovery) | < 30 min | Incident tracking |

---

## 📚 Useful Commands

```bash
# Local dev
npm run dev

# Build & test locally
npm run build
npm run test

# Database
npx prisma migrate status      # Check migrations status
npx prisma migrate deploy      # Run pending migrations
npx prisma db push             # Push schema to DB (dev only)
npx prisma db seed             # Run seed script

# Vercel CLI
vercel                          # Deploy
vercel --prod                   # Deploy to production
vercel env pull                 # Pull env variables
vercel logs                     # View logs

# Docker (if using Railway Docker)
docker build -t immodz .
docker run -p 3000:3000 immodz
```

---

## 🔗 Links

- Vercel Dashboard : https://vercel.com/dashboard
- Railway Dashboard : https://railway.app/dashboard
- Upstash Console : https://console.upstash.com
- Sentry Dashboard : https://sentry.io
- GitHub Actions : https://github.com/dimeii/ImmoDz/actions

---

**Owner** : DevOps Engineer
**Last Updated** : 31 mars 2026
