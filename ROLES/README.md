# ImmoDz — Team Roles & Responsibilities

Bienvenue dans la documentation des rôles. Chaque fichier définit les responsabilités, checklists et best practices pour un rôle spécifique.

---

## 👥 Équipe

### 🎯 [Product Manager (PM)](./PM.md)
**Garant de la vision et des priorités produit**

Responsabilités clés :
- Vision produit et roadmap
- Priorisation features
- Validation des spécifications
- Feedback utilisateurs
- Sprint ceremonies

**Fichier** : `PM.md`

---

### 🛠️ [Backend Developer](./BACKEND_DEV.md)
**API REST, base de données, logique métier**

Responsabilités clés :
- Design API routes
- Schéma Prisma + migrations
- Intégrations (Cloudinary, Resend, etc.)
- Optimisation DB + caching
- Tests backend

**Fichier** : `BACKEND_DEV.md`

---

### 🎨 [Frontend Developer](./FRONTEND_DEV.md)
**Composants React, UI/UX, interactivité**

Responsabilités clés :
- Composants React/TypeScript
- Design system Tailwind
- Responsive design
- Accessibilité (a11y)
- Performance frontend

**Fichier** : `FRONTEND_DEV.md`

---

### 🚀 [DevOps Engineer](./DEVOPS.md)
**Infrastructure, déploiement, monitoring**

Responsabilités clés :
- CI/CD pipelines
- Déploiements (Vercel, Railway)
- Base de données + backups
- Monitoring + alerting
- Secrets management

**Fichier** : `DEVOPS.md`

---

### 🔒 [Security Developer](./SECURITY_DEV.md)
**Sécurité applicative, audits, incidents**

Responsabilités clés :
- OWASP Top 10
- Code review sécurité
- Penetration testing
- Secrets + credentials
- Incident response

**Fichier** : `SECURITY_DEV.md`

---

## 📋 Checklists par rôle

### Daily/Weekly Tasks
- **Tous** : Daily standup (15 min)
- **PM** : Monitor feedback, priorité backlog
- **Devs** : Code review, tests
- **DevOps** : Monitor logs + uptime
- **Security** : Audit critical PRs

### Sprint Tasks
- **PM** : Sprint planning + review
- **Devs** : Development + testing
- **DevOps** : Staging deployment + validation
- **Security** : Security review

### Quarterly Tasks
- **All** : Retrospective, planning
- **DevOps** : Infrastructure audit
- **Security** : Threat modeling, pentesting

---

## 🔄 Communication Flow

```
PM (priorités)
    ↓
Devs (backend + frontend)
    ↓
DevOps (déployer)
    ↓
Security (auditer)
    ↓
Monitoring + feedback utilisateur → back à PM
```

---

## 🎯 Definition of Done (All Roles)

Une feature est **"Done"** si elle passe TOUTES ces vérifications :

### Code Quality (Backend + Frontend)
- [ ] Tests passent (unit + integration)
- [ ] TypeScript sans erreurs
- [ ] Linting OK
- [ ] Code review approuvé (2 eyes)

### Functionality
- [ ] Acceptance criteria validés
- [ ] Edge cases testés
- [ ] Responsive (mobile + desktop)
- [ ] Performance OK

### Security
- [ ] Auth/permissions vérifiées
- [ ] Input validation en place
- [ ] Pas de XSS/SQL injection/CSRF
- [ ] Security audit passée

### DevOps
- [ ] Testée en staging
- [ ] Migrations DB vérifiées
- [ ] Env vars configurées
- [ ] Rollback plan préparé

### Documentation
- [ ] README/API docs updatés
- [ ] Code commenté (why, not what)
- [ ] Git message descriptif
- [ ] User guide (si applicable)

---

## 🚨 Escalation Rules

### PR Approval Matrix
```
Code Review:
  - Backend: 1 backend dev approval required
  - Frontend: 1 frontend dev approval required
  - DevOps: 1 devops approval required

Security:
  - Critical changes: Security dev approval REQUIRED
  - Auth changes: Security dev approval REQUIRED
  - Data schema: Backend + DevOps approval

Merge:
  - Only on main branch: Requires PM sign-off
  - All tests passing: Non-negotiable
```

### Decision Authority
| Decision | Owner | Consultation |
|----------|-------|--------------|
| Feature scope | PM | Team |
| Tech stack | Backend/Frontend | PM, DevOps |
| Architecture | Backend | Frontend, DevOps, Security |
| Deployment strategy | DevOps | Backend, Security |
| Security policy | Security | All |
| Deadline/timeline | PM | DevOps |

---

## 🔗 Tools & Access

### Development
- GitHub : Code repository
- VS Code : IDE
- Figma : Design mockups
- Postman : API testing

### Collaboration
- Slack : Team communication
- Notion/Jira : Task tracking
- Google Drive : Documentation

### Deployment & Monitoring
- Vercel : Frontend deployment
- Railway : Backend + database
- Upstash : Redis caching
- Sentry : Error tracking
- UptimeRobot : Uptime monitoring

### Security & Secrets
- GitHub Secrets : CI/CD credentials
- Vercel Environment Variables : App secrets
- 1Password/LastPass : Shared credentials
- AWS/GCP Secrets Manager : Infrastructure secrets

---

## 📈 Metrics per Role

### PM
- Sprint velocity (story points / sprint)
- Feature adoption rate
- User satisfaction (NPS)
- Cycle time (idea → shipped)

### Backend Dev
- API response time (p95 < 500ms)
- Test coverage (≥ 80%)
- Bug escape rate
- Code review time to merge

### Frontend Dev
- Lighthouse score (≥ 80)
- Page load time (< 3s)
- Component test coverage (≥ 80%)
- Accessibility score (≥ 90)

### DevOps
- Deployment frequency (≥ 1x/week)
- Lead time for changes (< 1 day)
- Mean time to recovery (< 30 min)
- Change failure rate (< 15%)

### Security
- Vulnerabilities found/fixed
- Time to patch (critical < 24h)
- Penetration test findings
- Security training completion rate

---

## 🎓 Onboarding Checklist

Nouveau membre ? Complète :

- [ ] Read CLAUDE.md (project architecture)
- [ ] Read PROJECT_STATUS.md (current state)
- [ ] Read ton rôle file (responsabilités)
- [ ] Get access (GitHub, Figma, Slack, etc.)
- [ ] Setup local dev (npm install, .env.local, etc.)
- [ ] Run app locally (`npm run dev`)
- [ ] Run tests locally (`npm run test`)
- [ ] Get PR review access (GitHub permissions)
- [ ] Slack intro to team
- [ ] Pair programming session (1h) with experienced dev

---

## 📞 Support & Questions

Besoin d'aide ?

- **Code questions** : Open PR, ask in comments
- **Architecture questions** : Slack #architecture (or @backend lead)
- **Design questions** : Figma comments or @frontend lead
- **Deployment questions** : @devops-lead
- **Security concerns** : @security-dev (private message)

---

## 📚 External Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Patterns](https://react-patterns.com/)

---

**Last Updated** : 31 mars 2026
**Owner** : Team Lead / Product Manager
