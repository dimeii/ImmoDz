# Messagerie — scénario de test

Plan de test E2E pour la nouvelle fonctionnalité messagerie (Phase 1 : polling + email + WhatsApp).
Voir `docs/MESSAGERIE.md` pour l'architecture.

---

## Comptes de test (mot de passe commun : `password123`)

| Rôle | Email | Nom | Usage |
|------|-------|-----|-------|
| ADMIN | `admin@immodz.local` | Admin User | accès admin |
| AGENCY_DIRECTOR | `director@immodz.local` | Karim Mansouri | **Agent recevant** les messages |
| AGENCY_EMPLOYEE | `employee@immodz.local` | Fatima Benali | autre agent |
| USER | `user1@immodz.local` | Ahmed Sabet | **Client demandeur** |
| USER | `user2@immodz.local` | Lina Cherif | second client (test isolation) |

Mot de passe gate (cookie `site-access`) : `immoDz` (cf. `src/app/api/gate/route.ts`).

---

## Préparation

1. `npm run dev` → `http://localhost:3000`
2. Saisir le mot de passe gate `immoDz` si demandé
3. Repérer une annonce `ACTIVE` publiée par Karim (`director@immodz.local`) → garder l'URL `/annonces/<id>`
4. Si pas d'annonce : login director → `/annonces/nouvelle` → si `PENDING`, valider depuis `/admin/moderation` en admin

---

## Test 1 — Création d'un thread depuis la fiche annonce

1. Se déconnecter, aller sur `/annonces/<id>` → le formulaire affiche **« Se connecter »**
2. Cliquer → login `user1@immodz.local` / `password123`
3. Retour sur l'annonce, écrire ≥ 10 caractères : *« Bonjour, possibilité de visite samedi ? »*
4. Soumettre → redirection `/dashboard/messages`
5. **Attendu** : 1 thread visible, ton message à droite (bulle verte), `✓` (envoyé non lu)

## Test 2 — Réception côté agent + badge navbar

1. Autre fenêtre privée, login `director@immodz.local`
2. **Badge rouge `1`** sur l'icône messages (navbar)
3. Cliquer → `/dashboard/messages`, 1 thread non lu (point bleu)
4. Cliquer le thread → conversation s'ouvre, badge disparaît
5. Côté Ahmed dans les ~10s : `✓` → `✓✓`

## Test 3 — Réponse + polling temps quasi-réel

1. Karim : *« Oui, samedi 10h ça vous va ? »* + Entrée
2. Ahmed (autre fenêtre, sans rien faire) : la réponse apparaît en max 10s, badge navbar à `1`
3. Ahmed clique le thread → lu, badge disparaît

## Test 4 — Lien WhatsApp

1. Conversation côté Ahmed : cliquer le bouton vert **WhatsApp**
2. **Attendu** : `https://wa.me/213555123456?text=Bonjour…` (numéro normalisé, titre annonce pré-rempli)

## Test 5 — Réutilisation du même thread

1. Ahmed retourne sur la même annonce, envoie un nouveau message
2. **Attendu** : **1 seul thread** (pas de doublon — unique `(listingId, initiatorId, recipientId)`)

## Test 6 — Isolation

1. Se déconnecter, login `user2@immodz.local` (Lina)
2. `/dashboard/messages` → **0 thread**
3. `curl -b cookie /api/threads/<id-Ahmed>` avec session Lina → `403`

## Test 7 — Rate limit

- 3 nouveaux threads en < 1h → OK
- 4e → `429 Trop de nouveaux contacts.`

## Test 8 — Self-contact bloqué

1. Login `director@immodz.local` (auteur), tenter d'envoyer sur sa propre annonce
2. **Attendu** : `400 Vous ne pouvez pas vous contacter vous-même`

## Test 9 — Cron notification email

1. `CRON_SECRET` doit être dans `.env.local` (`openssl rand -hex 32`)
2. Créer un thread, ne pas le lire côté destinataire
3. Pour tester sans attendre 5 min : éditer temporairement `5 * 60 * 1000` → `5 * 1000` dans `src/app/api/cron/notify-unread/route.ts`
4. `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/notify-unread`
5. **Attendu** : `{ processed: 1, emailsSent: 1, notified: 1 }`, email envoyé
6. Re-lancer → `notified: 0` (idempotent via `notifiedAt`)
7. Lire le message → le cron ne re-notifie pas (idempotent via `readAt`)

## Test 10 — Robustesse

- Validation Zod : `POST /api/threads` avec body invalide → 400
- Annonce supprimée : thread reste, sidebar affiche « Annonce supprimée »
- Reload conversation : scroll auto en bas

---

## Checklist visuelle rapide

- [ ] Badge navbar rouge avec compteur, disparaît à l'ouverture
- [ ] Bulles vertes (envoyées) à droite, blanches (reçues) à gauche
- [ ] Heure formatée `HH:MM`, `✓` envoyé / `✓✓` lu
- [ ] Bouton WhatsApp visible si `phone` destinataire présent
- [ ] `Enter` envoie, `Shift+Enter` saute une ligne
- [ ] `refreshWhenHidden: false` → pas de polling si onglet en arrière-plan (DevTools Network)
