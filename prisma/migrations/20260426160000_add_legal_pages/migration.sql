-- CreateTable
CREATE TABLE "legal_pages" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "legal_pages_pkey" PRIMARY KEY ("slug")
);

-- Seed initial : 3 pages avec un brouillon. À éditer depuis /admin/legal.
INSERT INTO "legal_pages" ("slug", "title", "content", "version", "updatedAt") VALUES
('mentions-legales',
 'Mentions légales',
 '## Éditeur du site

ImmoDz — Plateforme de petites annonces immobilières.

**Adresse** : à compléter
**Email** : contact@immodz.com
**Directeur de la publication** : à compléter

## Hébergement

Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA.

## Propriété intellectuelle

L''ensemble des contenus (textes, images, logo) est protégé par le droit d''auteur. Toute reproduction sans autorisation est interdite.

## Contact

Pour toute question : contact@immodz.com',
 1,
 NOW()),

('cgu',
 'Conditions générales d''utilisation',
 '## 1. Objet

Les présentes CGU régissent l''utilisation de la plateforme ImmoDz, qui met en relation des particuliers, agences immobilières et internautes intéressés par la location ou l''achat de biens immobiliers en Algérie.

## 2. Inscription

L''inscription est gratuite. L''utilisateur s''engage à fournir des informations exactes et à les tenir à jour.

## 3. Publication d''annonces

- Les particuliers peuvent publier jusqu''à 3 annonces.
- Les annonces sont soumises à modération avant publication.
- Toute annonce frauduleuse, trompeuse ou inappropriée sera rejetée.
- L''utilisateur garantit détenir les droits sur les photos et descriptions publiées.

## 4. Comportement

L''utilisateur s''engage à un usage respectueux : pas de spam, pas de contenu illégal, pas d''escroquerie. Tout manquement peut entraîner la suppression du compte sans préavis.

## 5. Responsabilité

ImmoDz est un intermédiaire technique et ne peut être tenu responsable du contenu publié par les utilisateurs ni des transactions conclues entre eux.

## 6. Modification des CGU

ImmoDz se réserve le droit de modifier les présentes CGU. Les utilisateurs en seront informés.

## 7. Loi applicable

Les présentes CGU sont régies par le droit algérien.',
 1,
 NOW()),

('confidentialite',
 'Politique de confidentialité',
 '## Données collectées

Conformément à la loi 18-07 sur la protection des personnes physiques dans le traitement des données à caractère personnel, ImmoDz collecte :

- Données d''identification : nom, email, téléphone
- Données de connexion : IP, date de connexion
- Contenu publié : annonces, photos, messages

## Finalités

- Fournir le service (création de compte, publication d''annonces, messagerie)
- Modération
- Statistiques internes anonymisées
- Communication transactionnelle (emails de notification)

## Durée de conservation

Les données sont conservées tant que le compte est actif, et jusqu''à 3 ans après suppression du compte (obligations légales).

## Droits

Vous disposez d''un droit d''accès, de rectification, d''effacement et de portabilité de vos données. Pour exercer ces droits : contact@immodz.com.

## Cookies

Le site utilise des cookies strictement nécessaires (session d''authentification) et un cookie de confirmation d''accès. Aucun cookie publicitaire ou de tracking tiers n''est déposé.

## Sécurité

Mots de passe hashés (bcrypt), connexions HTTPS, base de données chiffrée au repos.',
 1,
 NOW());
