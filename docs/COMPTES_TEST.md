# Comptes de test ImmoDz

Mot de passe commun : `password123`

| Role             | Email                     | Nom              | Telephone       |
|------------------|---------------------------|------------------|-----------------|
| ADMIN            | admin@immodz.local        | Admin User       |                 |
| AGENCY_DIRECTOR  | director@immodz.local     | Karim Mansouri   | +213555123456   |
| AGENCY_EMPLOYEE  | employee@immodz.local     | Fatima Benali    | +213555654321   |
| USER             | user1@immodz.local        | Ahmed Sabet      | +213552111111   |
| USER             | user2@immodz.local        | Lina Cherif      | +213552222222   |

## Permissions par role

| Action                | ADMIN | DIRECTOR | EMPLOYEE | USER    |
|-----------------------|-------|----------|----------|---------|
| Consulter annonces    | oui   | oui      | oui      | oui     |
| Poster annonce        | oui   | oui      | oui      | max 3   |
| Photos par annonce    | infini| config   | config   | 10      |
| Gerer son agence      | oui   | oui      | non      | non     |
| Moderer               | oui   | non      | non      | non     |

## Agence de test

- **Nom** : Elite Immobilier
- **Email** : contact@elite.local
- **Directeur** : Karim Mansouri (director@immodz.local)
- **Employe** : Fatima Benali (employee@immodz.local)
