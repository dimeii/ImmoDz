# Product Manager — ImmoDz

## 🎯 Role Summary

Propriétaire du produit, garant de la vision produit et des priorités. Travaille avec toute l'équipe pour s'assurer que chaque feature correspond aux besoins utilisateurs et à la roadmap.

---

## 📋 Responsabilités

- ✅ Définir la vision et roadmap produit
- ✅ Prioriser les features et bugs
- ✅ Valider les spécifications avec l'équipe
- ✅ Collecter feedback utilisateurs
- ✅ Conduire les revues de sprint
- ✅ Accepter/rejeter les features (Definition of Done)
- ✅ Gérer les stakeholders
- ✅ Analyser les metrics/analytics

---

## 🔄 Workflow de feature

### Phase 1 : Definition
- [ ] Écrire user story : "As a [user], I want [feature] so that [benefit]"
- [ ] Créer acceptance criteria (SMART)
- [ ] Estimer taille (S/M/L/XL)
- [ ] Identifier dépendances
- [ ] Vérifier pas de dups (search existing issues)

### Phase 2 : Refinement
- [ ] Discuter avec équipe tech (backend, frontend, devops)
- [ ] Identifier risques/blockers
- [ ] Affiner estimation
- [ ] Créer wireframes/mockups si UI heavy

### Phase 3 : Implementation
- [ ] Assigner au dev approprié
- [ ] Standups bi-daily pour tracking
- [ ] Débloquer rapidement si bloqué
- [ ] Déplacer dans GitHub/JIRA board

### Phase 4 : Validation
- [ ] Demo avec PM
- [ ] Vérifier tous les acceptance criteria
- [ ] Tester cas limites
- [ ] Sign-off = feature Done

### Phase 5 : Post-Launch
- [ ] Monitor usage metrics
- [ ] Collecter feedback utilisateur
- [ ] Inspecter issues rapportées
- [ ] Itérer/fix rapidos

---

## 📊 Features prioritaires (roadmap)

### Phase 1 : MVP (en cours)
- [x] Homepage avec carte + liste
- [x] Recherche multi-filtres
- [ ] Créer annonce
- [ ] Éditer annonce
- [ ] Photos drag-and-drop
- [ ] Dashboard utilisateur

### Phase 2 : Core Features (semaines 3-4)
- [ ] Agence management
- [ ] Messaging interne
- [ ] Admin modération
- [ ] Email notifications

### Phase 3 : Growth (semaines 5-6)
- [ ] Saved searches
- [ ] Push notifications
- [ ] Analytics utilisateur
- [ ] Recommandations

---

## 📱 User Personas

### Persona 1 : Particulier vendeur
**Problème** : Vendre rapidement sa maison sans agence
**Besoin** : Interface simple, max 10 photos, contact direct
**Success metric** : 50+ vues en 2 semaines

### Persona 2 : Particulier chercheur
**Problème** : Trouver bien immobilier par prix/localisation
**Besoin** : Filtres clairs, agrégation, carte interactive
**Success metric** : 10+ contacts établis

### Persona 3 : Agence immobilière
**Problème** : Publier N annonces, gérer équipe vendeurs
**Besoin** : Bulk upload, gestion membres, analytics
**Success metric** : 100+ listings actifs, leads générés

---

## ✅ Definition of Done Checklist

Une feature est **"Done"** si :

### Code Quality
- [ ] Tests passent (unit + integration)
- [ ] TypeScript sans erreurs (`npm tsc --noEmit`)
- [ ] Linting OK (`npm lint`)
- [ ] Code review approuvé (2 eyes minimum)

### Functional
- [ ] Tous acceptance criteria validés
- [ ] Pas de edge cases importants
- [ ] Tested sur mobile + desktop
- [ ] Tested sur navigateurs (Chrome, Firefox, Safari)

### Performance
- [ ] Lighthouse score ≥ 80
- [ ] Load time API < 500ms
- [ ] Images optimisées (Cloudinary transforms)

### Security
- [ ] Pas de XSS/SQL injection/CSRF
- [ ] Auth/permissions vérifiées
- [ ] Sensitive data pas en logs
- [ ] Security audit passée

### Documentation
- [ ] README updaté si needed
- [ ] API docs complètes (endpoints, params, responses)
- [ ] Component story (Storybook si UI)
- [ ] Git commit message descriptif

### Deployment
- [ ] Tested en staging
- [ ] Migration DB vérifiée (si needed)
- [ ] Env vars configurées (prod + staging)
- [ ] Rollback plan préparé (si breaking change)

---

## 🎯 Sprint Ceremony Checklist

### Sprint Planning (lundi)
- [ ] Grooming du backlog avec team
- [ ] Estimer tâches (planning poker)
- [ ] Assigner owners
- [ ] Valider sprint goal (1-2 sentences claires)

### Daily Standup (chaque jour, 15 min)
- [ ] Quoi hier ?
- [ ] Quoi aujourd'hui ?
- [ ] Blockers/aide needed ?

### Sprint Review (vendredi, 30 min)
- [ ] Demo features complètes
- [ ] Feedback utilisateur
- [ ] Metrics (velocity, burndown)

### Sprint Retro (vendredi, 30 min)
- [ ] What went well ?
- [ ] What didn't ?
- [ ] Action items pour prochain sprint

---

## 🚨 Escalation & Decisions

### Quick Decisions (toi seul)
- Bugs priority
- Nice-to-have features
- Minor design tweaks

### Team Discussions
- Architecture changes
- Tech debt vs features (tradeoffs)
- Ressource allocation

### Stakeholder Alignment
- Major roadmap changes
- Breaking changes
- Launch dates

---

## 📈 Metrics to Track

- **User Metrics** : New users, DAU, MAU, churn rate
- **Feature Metrics** : Feature adoption rate, engagement, NPS
- **Business Metrics** : Revenue, deals closed, contact rate
- **Quality Metrics** : Bug escape rate, issue response time, customer satisfaction
- **Team Metrics** : Velocity, sprint burndown, cycle time

---

## 🔗 Tools & Access

- GitHub Issues/Projects (prioritization)
- Figma (wireframes/mockups)
- Analytics tool (Mixpanel, Plausible, etc.)
- Slack (communication)
- Calendar (scheduling)

---

## 💡 Best Practices

1. **Clear specs** — Ambiguité = rework + frustration
2. **User-first** — Toujours penser à l'utilisateur final
3. **Fast feedback** — Validation rapide > perfect spec
4. **Celebrate wins** — Démontrer progrès à l'équipe
5. **Listen** — Devs, users, stakeholders ont tous raison parfois

---

**Owner** : Toi (Product Manager)
**Last Updated** : 31 mars 2026
