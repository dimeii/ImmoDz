# Security Checklist & Patterns

Quick reference pour la sécurité lors du code review et développement.

---

## 🔐 Pre-Commit Checklist

Before pushing code, verify:

### Authentication & Authorization
- [ ] Session/auth check present
- [ ] Role/permission validated
- [ ] 401 vs 403 status codes correct
- [ ] User can't access other user's data

### Input Validation
- [ ] Zod schema used
- [ ] Type safety (no `any`)
- [ ] String max length enforced
- [ ] No negative numbers where invalid

### Output Sanitization
- [ ] Response doesn't include passwords
- [ ] Response doesn't include PII unnecessarily
- [ ] HTML content escaped (if user input displayed)

### API Security
- [ ] HTTPS in production
- [ ] CORS configured properly
- [ ] Rate limiting on public endpoints
- [ ] Sensitive headers set (X-Frame-Options, etc.)

### Secrets & Config
- [ ] No hardcoded API keys
- [ ] Secrets from env vars only
- [ ] .env.local in .gitignore
- [ ] NEXTAUTH_SECRET set (not placeholder)

### Dependencies
- [ ] No known vulnerabilities (`npm audit`)
- [ ] Outdated packages reviewed
- [ ] No suspicious/unmaintained packages

---

## 🚨 Critical Patterns

### ✅ GOOD: Authorization Check
```typescript
const session = await auth();
if (!session?.user?.id) return 401;

const listing = await db.listing.findUnique({ where: { id } });
if (listing.userId !== session.user.id && session.user.role !== 'ADMIN') {
  return 403;
}

// Safe to modify
await db.listing.update({ where: { id }, data: {...} });
```

### ❌ BAD: Missing Authorization
```typescript
// Anyone can delete!
export async function DELETE(request: NextRequest) {
  const { id } = request.params;
  await db.listing.delete({ where: { id } }); // No auth check!
  return 200;
}
```

---

### ✅ GOOD: Password Hashing
```typescript
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);
await db.user.create({ email, password: hashedPassword });

// Verify
const isValid = await bcrypt.compare(inputPassword, user.password);
if (!isValid) return 401;
```

### ❌ BAD: Plaintext Password
```typescript
// NEVER do this!
await db.user.create({ email, password }); // Plaintext!
```

---

### ✅ GOOD: Parameterized Query
```typescript
// Prisma escapes automatically
const listings = await db.listing.findMany({
  where: { wilayaCode: parseInt(wilayaCode) }
});

// Raw query with placeholders
const result = await db.$queryRaw`
  SELECT * FROM listings WHERE wilaya_code = $1
`, [wilayaCode];
```

### ❌ BAD: String Concatenation
```typescript
// SQL INJECTION VULNERABLE!
const result = db.$executeRaw(`SELECT * FROM listings WHERE id = ${id}`);
```

---

### ✅ GOOD: Rate Limiting
```typescript
const allowed = await rateLimit(`contact:${ip}`, 3, 3600);
if (!allowed) return 429;
```

### ❌ BAD: No Rate Limiting
```typescript
// Spam attack possible
export async function POST(request: NextRequest) {
  // Process unlimited requests...
}
```

---

### ✅ GOOD: Session Security (NextAuth)
```typescript
// NextAuth handles secure cookies automatically
const { data: session } = useSession();

// Sessions are httpOnly, secure, sameSite
```

### ❌ BAD: Custom Token in localStorage
```typescript
// NEVER use localStorage for auth tokens!
localStorage.setItem('authToken', token); // XSS vulnerable
```

---

### ✅ GOOD: Input Validation
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().positive(),
});

const data = schema.parse(userInput);
```

### ❌ BAD: No Validation
```typescript
// Anyone can inject anything
const user = userInput; // No validation!
await db.user.create({ data: user });
```

---

## 🔍 Code Review Checklist

When reviewing PRs, check:

### Critical Security Issues
- [ ] Auth bypass possible?
- [ ] SQL injection possible?
- [ ] XSS possible (user input in HTML)?
- [ ] CSRF attack possible?
- [ ] Secrets exposed in code?
- [ ] Authorization bypass (BOLA)?

### Medium Security Issues
- [ ] Input not validated?
- [ ] Error messages reveal system info?
- [ ] Hardcoded credentials?
- [ ] Missing rate limits?
- [ ] Sensitive data in logs?

### Low Security Issues
- [ ] Weak password requirements?
- [ ] No HTTPS headers?
- [ ] Missing security headers?
- [ ] Outdated dependencies?

---

## 🧪 Security Testing

### Manual Testing Checklist
```
1. Try SQL injection:
   Input: ' OR '1'='1
   Input: '; DROP TABLE users; --
   Expected: Errors only, no data modified

2. Try XSS:
   Input: <script>alert(1)</script>
   Expected: Displayed as text, not executed

3. Try CSRF:
   Make request from different site
   Expected: Request rejected

4. Try unauthorized access:
   Change user ID in URL: /users/123 → /users/456
   Expected: 403 Forbidden (not 200 or 404 leak)

5. Try rate limiting:
   Send 100 requests in 1 minute to /api/contact
   Expected: 429 after N requests

6. Try privilege escalation:
   Regular user accessing /admin
   Expected: 403 Forbidden
```

---

## 🚨 OWASP Top 10 Reminders

| Risk | Mitigation | Code |
|------|-----------|------|
| Broken Auth | Hash passwords, secure sessions | `bcrypt.hash()` + NextAuth |
| Injection | Parameterized queries, Zod validation | Prisma queries + `z.parse()` |
| XSS | Sanitize output, CSP headers | React auto-escapes + headers |
| BOLA | Check ownership | `if (item.userId !== userId)` |
| CORS | Restrict origins | `vercel.json` config |
| Secrets | Use env vars, never commit | `.env.local` in `.gitignore` |
| Logging | No sensitive data | Never log passwords, tokens |
| Rate Limit | Implement on public endpoints | Redis counter with TTL |

---

## 🔑 Secrets Management

### ✅ GOOD
```
DATABASE_URL=postgresql://user:pass@localhost:5432/db  # In .env.local (gitignored)
NEXTAUTH_SECRET=<random-64-char-string>               # In Vercel
CLOUDINARY_API_SECRET=<secret>                         # In Vercel, never logged
```

### ❌ BAD
```
const API_KEY = "sk_live_abc123xyz...";  // Hardcoded!
console.log(process.env.NEXTAUTH_SECRET);  // Logged!
git commit .env.local                      // Secrets in repo!
```

---

## 🎯 Environment-Specific Security

### Development
- [ ] Use .env.local (not .env)
- [ ] Test with dummy data only
- [ ] Enable verbose logging
- [ ] Disable some security headers for testing

### Staging
- [ ] Use staging credentials (separate from prod)
- [ ] Test security features
- [ ] Monitor error logs
- [ ] Simulated load testing

### Production
- [ ] All security headers enabled
- [ ] HTTPS enforced
- [ ] Secrets rotated
- [ ] Monitoring + alerting active
- [ ] Backups automated
- [ ] No verbose logging

---

## 🔔 Alert Rules

Setup alerts for:

```
- 10+ 401 errors from same IP in 5 min
- 50+ requests to /api/auth/register from same IP in 1 hour
- Database connection errors
- Cloudinary upload failures
- High error rate (> 1% of requests)
- Memory usage > 80%
- Response time > 1 second (p95)
```

---

## 📚 Security Testing Tools

- **npm audit** : Dependency vulnerabilities
- **OWASP ZAP** : Automated security scanning
- **Burp Suite** : Manual penetration testing
- **Snyk** : Continuous vulnerability monitoring
- **GitHub Security** : Dependency checking + code scanning

---

## 🔗 Quick Links

- OWASP Top 10 : https://owasp.org/Top10/
- OWASP Cheat Sheets : https://cheatsheetseries.owasp.org/
- Next.js Security : https://nextjs.org/docs/advanced-features/security-headers
- Prisma Security : https://www.prisma.io/docs/orm/more/security

---

**Last Updated** : 31 mars 2026
