# ImmoDz — Journal de développement (branche dev)

---

## 1. Formulaire "Créer annonce" (`/annonces/nouvelle`)

**Fichiers** : `src/components/forms/ListingForm.tsx`, `src/app/(auth)/annonces/nouvelle/page.tsx`, `src/app/api/annonces/route.ts`

- Composant `ListingForm` reutilisable (mode create / edit)
- 4 sections : Infos principales, Localisation, Caracteristiques, Equipements
- Toggle Location/Vente, select wilayas (charge depuis API), checkboxes equipements
- Validation cote serveur via Zod, affichage erreurs par champ
- API POST modifiee : sauvegarde lat/lng dans colonnes Prisma, statut ACTIVE par defaut
- Redirect vers fiche annonce apres creation
- Protection auth : redirect vers /login si non connecte

---

