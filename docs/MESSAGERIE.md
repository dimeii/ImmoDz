# Messagerie interne — architecture

> Décision du 2026-04-25. Roadmap item #4 (engagement / rétention).

Remplace le formulaire de contact one-shot (un email, zéro continuité) par une vraie messagerie persistée. Permet aux clients et agents d'avoir une conversation continue autour d'une annonce.

---

## Décision : polling SWR + email + WhatsApp

Pas de WebSocket pour le MVP. Trois raisons :
- Vercel serverless ne tient pas une connexion ouverte longue (timeout 60s Hobby / 5min Pro), et la facturation à la durée rend les SSE inviables au-delà de quelques dizaines d'utilisateurs simultanés.
- Le marché DZ est largement asynchrone (les gens consultent par session, pas en permanence) et 90% des transactions immo finissent sur WhatsApp. La latence de 15s du polling n'est pas un frein.
- Aucun nouveau service à intégrer (Pusher, Ably, Supabase) → 0€ additionnel jusqu'à plusieurs milliers d'utilisateurs actifs.

### Phasage

| Phase | Volume | Techno temps réel | Coût additionnel |
|-------|--------|-------------------|------------------|
| **1 — MVP (actuel)** | 0–2k actifs | Polling SWR 15s + email Resend + lien WhatsApp | 0–20€/mois |
| **2 — Engagement** | 2k–10k actifs | Pusher Channels (Sandbox gratuit, Startup $49/mois) ou Ably | +25–49€/mois |
| **3 — Scale** | 10k+ actifs | Soketi self-hosted Railway ou Supabase Realtime | +10€/mois infra |

Pour passer de Phase 1 à 2 : ajouter un client Pusher dans `MessagesView`, garder le polling en fallback. Pas de migration de données.

---

## Modèle de données

```prisma
enum ThreadStatus {
  ACTIVE
  ARCHIVED
  BLOCKED
}

model Thread {
  id                  String   @id @default(cuid())
  listingId           String?  // contexte = annonce (nullable si supprimée)
  initiatorId         String   // user qui a contacté
  recipientId         String   // agent / owner de l'annonce
  lastMessageAt       DateTime @default(now())
  unreadByInitiator   Boolean  @default(false)
  unreadByRecipient   Boolean  @default(true)
  status              ThreadStatus @default(ACTIVE)
  createdAt           DateTime @default(now())

  listing   Listing?        @relation(fields: [listingId], references: [id], onDelete: SetNull)
  initiator User            @relation("ThreadInitiator", fields: [initiatorId], references: [id], onDelete: Cascade)
  recipient User            @relation("ThreadRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  messages  ThreadMessage[]

  @@unique([listingId, initiatorId, recipientId])  // un seul thread par (annonce, demandeur, agent)
  @@index([initiatorId, lastMessageAt])
  @@index([recipientId, lastMessageAt])
}

model ThreadMessage {
  id              String    @id @default(cuid())
  threadId        String
  senderId        String
  body            String    @db.Text
  readAt          DateTime?
  notifiedAt      DateTime? // pour le cron : message notifié par email, ne pas re-notifier
  createdAt       DateTime  @default(now())

  thread Thread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sender User   @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([threadId, createdAt])
  @@index([notifiedAt, readAt])  // pour le cron
}
```

Le modèle `ContactRequest` existant est laissé tel quel pour l'historique mais n'est plus créé par les nouveaux contacts. Il sera retiré dans une migration future une fois les données migrées (ou abandonnées).

---

## Endpoints API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/threads` | required | Crée ou réutilise un thread `(listingId, initiatorId, recipientId)`, ajoute le premier message. Remplace `/api/contact`. |
| `GET` | `/api/threads` | required | Liste paginée des threads de l'utilisateur (initiator OU recipient), tri `lastMessageAt desc`. |
| `GET` | `/api/threads/[id]` | required | Détail thread + messages (vérifie que l'user est initiator OU recipient). |
| `POST` | `/api/threads/[id]/messages` | required | Envoie un message dans le thread. Met à jour `lastMessageAt` + `unreadBy*`. |
| `POST` | `/api/threads/[id]/read` | required | Marque les messages reçus comme lus (`readAt`), reset `unreadBy*` côté de l'utilisateur. |
| `GET` | `/api/messages/unread-count` | required | Renvoie `{ count: number }` — utilisé par le badge navbar. |

Rate limit appliqué sur `POST /api/threads` (3 nouveaux threads / heure / IP, comme l'ancien `/api/contact`) et sur `POST /api/threads/[id]/messages` (30 messages / heure / user).

---

## UI

### `/dashboard/messages`

Layout deux colonnes :
- **Sidebar** : liste threads (snippet dernier message, badge non-lu, photo annonce, nom interlocuteur).
- **Vue conversation** : messages (bulles), input texte, bouton envoyer, lien WhatsApp si l'agent a un `phone`.

Polling SWR :
- Liste threads : `refreshInterval: 15000`, `refreshWhenHidden: false`.
- Conversation active : `refreshInterval: 10000`, `refreshWhenHidden: false`.
- À l'ouverture d'un thread, appel automatique à `/api/threads/[id]/read`.

### Badge non-lus dans la navbar

Composant client `<UnreadBadge />` qui poll `/api/messages/unread-count` toutes les 30s. Affiche un point rouge + nombre sur le lien `/dashboard`. Pas de polling si l'utilisateur n'est pas connecté.

### Bouton WhatsApp

Dans la conversation, un lien `https://wa.me/213XXXXXXXXX?text=...` (numéro de l'agent normalisé en E.164 sans le `+`). Pré-rempli avec une référence à l'annonce. Killer feature DZ : permet de basculer la conversation hors plateforme une fois le contact établi, sans qu'on ait à porter la charge temps réel.

---

## Notifications email

Cron `/api/cron/notify-unread` exécuté toutes les 5 min (config `vercel.json`). Pour chaque message :
- créé il y a >5min
- non lu (`readAt IS NULL`)
- non encore notifié (`notifiedAt IS NULL`)

→ envoi email Resend au destinataire avec un lien vers le thread, puis set `notifiedAt = now()`.

Cela évite le spam (un email par message non répondu, pas un email par minute). Si l'utilisateur lit le message dans Threadviewer, `readAt` est posé et le cron ne notifiera plus.

---

## Coûts détaillés (Phase 1, hypothèse 500 utilisateurs actifs)

| Poste | Volume estimé | Coût |
|-------|---------------|------|
| Vercel Pro (déjà payé) | ~150k invocations/jour, dans le quota 1M/jour | 0€ additionnel |
| Railway Postgres | 2 tables, négligeable | 0€ |
| Upstash Redis | rate limit + cache unread, ~50k commandes/jour | 0€ (free tier 10k/jour, sinon ~1€/mois) |
| Resend | 1 email par message non lu après 5 min, ~200/jour max | 0€ (free 100/jour) ou 20€/mois si dépassé |

**Total : 0 à 20€/mois**.

À 10k utilisateurs actifs, le polling devient le poste qui dépasse les invocations Vercel (~25€/jour). À ce moment-là, on bascule sur Phase 2.

---

## Sécurité

- Toute requête API vérifie que `session.user.id ∈ {thread.initiatorId, thread.recipientId}` avant d'accéder au thread.
- `body` Zod-validé (max 5000 chars), trim, anti-spam basique (pas plus de N URLs / message).
- Rate limit Redis sur `POST /api/threads` et `POST /api/threads/[id]/messages`.
- Pas d'image/pièce jointe en Phase 1 (à revoir avec stockage Cloudinary signé en Phase 2 — voir `kyc_documents_storage` pour la même problématique).
