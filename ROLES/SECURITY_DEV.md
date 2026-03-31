# Security Developer — ImmoDz

## 🎯 Role Summary

Responsable de la sécurité applicative, protéger contre les vulnérabilités OWASP, auditer le code, et gérer les incidents de sécurité. Travaille transversalement avec tous les rôles.

---

## 📋 Responsabilités

- ✅ Threat modeling et risk assessment
- ✅ Code review avec focus sécurité
- ✅ Tester vulnérabilités (OWASP Top 10, etc.)
- ✅ Secrets management et credentials
- ✅ Dependency scanning (npm audit)
- ✅ Penetration testing
- ✅ Security training team
- ✅ Incident response

---

## 🎯 OWASP Top 10 Checklist (2023)

### 1️⃣ Broken Access Control
**Risk** : User accède ressources pas autorisées

**Mitigations** :
- [ ] Vérifier auth sur CHAQUE endpoint protégé
- [ ] Vérifier authorization (rôle/ownership)
- [ ] Pas de hardcoded IDs dans URLs
- [ ] Tester : user A accède resource de user B → 403

**Code Pattern** :
```typescript
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({error: "Unauthorized"}, {status: 401});

  const listing = await db.listing.findUnique({ where: { id: params.id } });
  if (listing.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({error: "Forbidden"}, {status: 403});
  }

  // Safe to delete
}
```

---

### 2️⃣ Cryptographic Failures
**Risk** : Données sensibles exposées en transit ou au repos

**Mitigations** :
- [ ] HTTPS obligatoire (HSTS header)
- [ ] Secrets jamais en logs
- [ ] Passwords hashés (bcrypt, jamais plaintext)
- [ ] JWT signed (NEXTAUTH_SECRET fort)
- [ ] Sensitive data pas en localStorage (use httpOnly cookies)
- [ ] API responses pas de passwords

**Code Pattern** :
```typescript
// ✅ Bon : password hashé
const hashedPassword = await bcrypt.hash(password, 10);
await db.user.create({ email, password: hashedPassword });

// ❌ Mauvais : plaintext
await db.user.create({ email, password }); // NEVER

// ✅ Bon : verifier auth sans exposer
const valid = await bcrypt.compare(inputPassword, dbPassword);
if (!valid) return 401;

// ❌ Mauvais : return error spécifique
if (dbPassword !== inputPassword) return {error: "Password incorrect"}; // Expose existence
```

---

### 3️⃣ Injection (SQL, Command, Template)
**Risk** : Attacker injecte du code malveillant

**Mitigations** :
- [ ] Parameterized queries (Prisma fait ça auto)
- [ ] Input validation (Zod schemas)
- [ ] No string concatenation en SQL
- [ ] Sanitize output (XSS prevention)

**Code Pattern** :
```typescript
// ✅ Bon : Prisma avec paramètres typés
const listings = await db.listing.findMany({
  where: { wilayaCode: wilayaCode } // Prisma escapes
});

// ❌ Mauvais : string concatenation (NEVER)
const result = await db.$queryRaw`SELECT * FROM listings WHERE id = ${id}`; // Vulnerable

// ✅ Bon : $queryRaw avec placeholders
const result = await db.$queryRaw`SELECT * FROM listings WHERE id = $1`, [id];
```

---

### 4️⃣ Insecure Design
**Risk** : Architecture pas pensée pour la sécurité

**Mitigations** :
- [ ] Threat model early (STRIDE analysis)
- [ ] Rate limiting sur endpoints publics
- [ ] CAPTCHA sur register/login
- [ ] Timeout sessions
- [ ] Monitoring + alerting
- [ ] No hardcoded secrets

**Endpoints sensibles** :
- `/api/contact` → 3 par heure/IP
- `/api/auth/register` → 5 par heure/IP
- `/api/upload/signature` → AGENCY_MAX_PHOTOS par jour/user

---

### 5️⃣ Broken Authentication
**Risk** : Sessions/passwords compromises

**Mitigations** :
- [ ] Passwords forts (validation : 8+ char, mix)
- [ ] MFA (optional mais recommandé)
- [ ] Session timeout (30 min inactif)
- [ ] Secure cookies (httpOnly, secure, sameSite)
- [ ] No auth bypass (forgot password flow safe)
- [ ] Logout clears session

**Code Pattern** :
```typescript
// ✅ Bon : NextAuth sessions sécurisées (auto)
const { data: session } = useSession();

// ❌ Mauvais : custom auth sans CSRF
const handleLogin = async (email, password) => {
  const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({email, password}) });
  // CSRF vulnerable
};
```

---

### 6️⃣ Sensitive Data Exposure
**Risk** : Données sensibles exposées (PII, payment, etc.)

**Mitigations** :
- [ ] Minimal data collection (GDPR)
- [ ] Data classification (PII, payment, etc.)
- [ ] Sensitive fields never in logs
- [ ] API responses hide PII
- [ ] Backups encrypted
- [ ] Remove test data with PII before deploy

**Sensitive Data in ImmoDz** :
- User passwords (hashed, never log)
- Contact phone numbers (logged but not on UI)
- Email addresses (logged)
- Payment info (if future feature — use Stripe, don't store)

---

### 7️⃣ XML/XXE (Not Applicable for JSON API)
**Risk** : Malformed XML DOS

**Mitigation** : N/A (we use JSON)

---

### 8️⃣ Broken Object Level Authorization (BOLA)
**Risk** : User accesses object belonging to another user by guessing ID

**Mitigations** :
- [ ] Check ownership on GET /api/resource/[id]
- [ ] Use UUIDs (not sequential IDs)
- [ ] Check user can list only their resources

**Code Pattern** :
```typescript
// ✅ Bon : check ownership
const listing = await db.listing.findUnique({ where: { id } });
if (listing.userId !== session.user.id) return 403;

// ❌ Mauvais : return 404 (reveals existence of resource)
const listing = await db.listing.findUnique({ where: { id } });
if (!listing) return 404; // Attacker knows if ID exists

// ✅ Mieux : return 404 for both missing + unauthorized
if (!listing || listing.userId !== session.user.id) return 404;
```

---

### 9️⃣ Security Logging & Monitoring Failures
**Risk** : Attacks not detected

**Mitigations** :
- [ ] Log auth attempts (success + failures)
- [ ] Log API errors (500s)
- [ ] Log admin actions (user creation, role change)
- [ ] Monitor suspicious patterns (multiple 401s, rate limit hits)
- [ ] Alert on critical errors (Sentry + Slack)
- [ ] Retention : 30 days min

**Logging Pattern** :
```typescript
// Log auth failure
console.warn(`Auth failed for ${email}`, { timestamp, ip });

// Log admin action
console.info(`Admin ${adminId} changed user ${userId} role to ${newRole}`);

// Log error
console.error(`API error on GET /api/listings`, { error, userId, timestamp });
```

---

### 🔟 SSRF (Server-Side Request Forgery)
**Risk** : Attacker makes server request to internal resources

**Mitigations** :
- [ ] Validate URLs (only allow certain domains)
- [ ] No user-controlled URLs pour fetch()
- [ ] Cloudinary signatures signed (attacker can't fake)
- [ ] No internal IP addresses in responses

**Code Pattern** :
```typescript
// ❌ Mauvais : user-controlled URL
const imageUrl = req.query.url; // "http://internal-service/"
const data = await fetch(imageUrl);

// ✅ Bon : whitelist ou signed URLs
const allowedDomains = ['cloudinary.com', 'maps.googleapis.com'];
if (!new URL(imageUrl).hostname.includes(allowedDomains)) {
  return 400;
}
```

---

## 🔄 Code Review Security Checklist

Avant merger une PR, checker :

### Authentication & Authorization
- [ ] Auth check présent (session/token)
- [ ] Rôle/permission vérifiés
- [ ] Ownership check (si modifie resource)
- [ ] 401/403 status codes corrects

### Input Validation
- [ ] Zod schema utilisé
- [ ] Types strict (no `any`)
- [ ] String sanitization (si HTML input)
- [ ] Max lengths (prevent DOS)

### Database Security
- [ ] Prisma queries (no string concat)
- [ ] Raw queries use placeholders
- [ ] No SELECT * (only needed columns)
- [ ] Proper indexes (prevent DOS)

### API Security
- [ ] Rate limiting checked (if public)
- [ ] Response doesn't leak PII
- [ ] CORS properly configured
- [ ] HTTPS enforced (in prod)

### Secrets & Config
- [ ] No hardcoded API keys
- [ ] Secrets from env vars
- [ ] .env.local in .gitignore
- [ ] No secrets in logs

### Dependencies
- [ ] `npm audit` clean (or approved)
- [ ] No outdated packages
- [ ] Pinned versions for critical deps

---

## 🧪 Testing Security

### Unit Tests
```typescript
describe('Authorization', () => {
  it('returns 401 if not authenticated', async () => {
    const res = await DELETE('/api/annonces/123', { headers: {} });
    expect(res.status).toBe(401);
  });

  it('returns 403 if user not owner', async () => {
    const res = await DELETE('/api/annonces/user-b-listing', {
      headers: { Authorization: 'Bearer user-a-token' }
    });
    expect(res.status).toBe(403);
  });

  it('allows owner to delete own listing', async () => {
    const res = await DELETE('/api/annonces/user-a-listing', {
      headers: { Authorization: 'Bearer user-a-token' }
    });
    expect(res.status).toBe(200);
  });
});
```

### Manual Penetration Testing
- [ ] Test SQL injection (try `' OR '1'='1`)
- [ ] Test XSS (inject `<script>alert(1)</script>`)
- [ ] Test CSRF (forge cross-site requests)
- [ ] Test BOLA (try other user IDs)
- [ ] Test rate limiting (spam requests)
- [ ] Test session timeout (test expired token)
- [ ] Test authorization (try admin endpoints as user)

---

## 🚨 Incident Response Plan

### If security incident detected :

1. **Isolate** (immediately)
   - [ ] Stop affected service (don't expose more data)
   - [ ] Notify team on Slack/emergency channel

2. **Contain** (within 1 hour)
   - [ ] Backup current state (for forensics)
   - [ ] Kill any active attacker sessions
   - [ ] Rotate compromised credentials
   - [ ] Enable enhanced logging

3. **Investigate** (within 2 hours)
   - [ ] Check logs (when, how, what accessed)
   - [ ] Identify root cause (code bug, config, etc.)
   - [ ] Assess blast radius (how much data exposed)
   - [ ] Document findings

4. **Fix** (within 4 hours)
   - [ ] Patch vulnerable code
   - [ ] Deploy fix to production
   - [ ] Test fix thoroughly
   - [ ] Monitor for re-occurrence

5. **Communicate** (transparent)
   - [ ] Notify affected users (if data compromised)
   - [ ] Update status page
   - [ ] Post-mortem (what, why, how to prevent)
   - [ ] Remediation steps for users (if needed)

---

## 📋 Security Configuration Checklist

### Next.js Security Headers
```typescript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }, // HSTS
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'geolocation=()' },
      ],
    },
  ],
};
```

### Environment Checklist
- [ ] HTTPS enforced (production)
- [ ] Secure cookies (httpOnly, secure, sameSite)
- [ ] CORS configured (only trusted origins)
- [ ] CSP headers set (prevent XSS)
- [ ] Rate limiting on sensitive endpoints
- [ ] Sentry/error tracking enabled
- [ ] Secrets rotation scheduled

---

## 📚 Security Resources

- OWASP Top 10 : https://owasp.org/Top10/
- OWASP Cheat Sheets : https://cheatsheetseries.owasp.org/
- CWE/SANS Top 25 : https://cwe.mitre.org/top25/
- PortSwigger Web Security Academy : https://portswigger.net/web-security
- Next.js Security : https://nextjs.org/docs/advanced-features/security-headers

---

## 🔗 Tools Setup

### npm audit (built-in)
```bash
npm audit                 # Find vulnerabilities
npm audit --fix           # Auto-fix some
npm audit fix --force     # Force-fix (may break compatibility)
```

### Snyk (optional, free tier)
```bash
npm install -g snyk
snyk test                 # Test for vulns
snyk monitor              # Monitor on GitHub
```

### OWASP ZAP (penetration testing)
- Download : https://www.zaproxy.org/
- Scan app locally : `zap -cmd -quickurl http://localhost:3000 -quickout report.html`

### Burp Suite (professional pentesting)
- Free Community Edition available
- Manual testing tool for APIs

---

## 📊 Security Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Vulnerability scanner | 0 critical | npm audit |
| Code review coverage | 100% | GitHub |
| Penetration test | Annually | Manual / Burp |
| Incident response time | < 1 hour | Tracking |
| Password strength | Enforced | Validation |
| Secrets rotation | 6 months | Scheduled |

---

## 🎯 Quarterly Security Tasks

- **Q1** : Threat modeling, update OWASP checklist
- **Q2** : Dependency audit, penetration testing
- **Q3** : Security training, code review audit
- **Q4** : Incident post-mortems, roadmap for next year

---

**Owner** : Security Developer
**Last Updated** : 31 mars 2026
