# 🌳 Famille Maykas — Plateforme Généalogique Familiale

Application web complète : Next.js 15 (App Router) + TypeScript + Tailwind CSS +
Prisma ORM. Inclut arbre généalogique interactif, profils membres, authentification,
administration, et une base de données relationnelle prête à l'emploi.

---

## 1. Prérequis

- Node.js 18+
- Une base de données **PostgreSQL** (locale, Supabase, Neon, Railway...)

---

## 2. Installation

```bash
npm install
```

---

## 3. Créer la base de données

Vous avez plusieurs options simples — choisissez celle que vous préférez.

### Option A — Supabase (recommandé, gratuit, en ligne)

1. Créez un compte sur https://supabase.com
2. Créez un nouveau projet
3. Allez dans **Project Settings → Database → Connection String** (mode "URI")
4. Copiez l'URL, elle ressemble à :
   ```
   postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.xxxxxxxx.supabase.co:5432/postgres
   ```

### Option B — PostgreSQL en local

1. Installez PostgreSQL (https://www.postgresql.org/download/)
2. Créez une base :
   ```bash
   createdb famille_maykas
   ```
3. Votre URL sera :
   ```
   postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/famille_maykas?schema=public
   ```

### Option C — Railway / Neon (gratuit, en ligne)

1. Créez un projet PostgreSQL sur https://railway.app ou https://neon.tech
2. Copiez l'URL de connexion fournie ("Connection string")

---

## 4. Configurer les variables d'environnement

Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Puis éditez `.env` :

```env
DATABASE_URL="postgresql://utilisateur:motdepasse@hote:5432/famille_maykas?schema=public"
JWT_SECRET="une-chaine-aleatoire-tres-longue-et-secrete"
```

> Astuce : pour générer un `JWT_SECRET` sécurisé, exécutez :
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 5. Relier Prisma à la base de données

Le schéma de la base de données se trouve dans `prisma/schema.prisma`. Il définit
toutes les tables : `Membre`, `RelationFamiliale`, `Photo`, `Document`, `Evenement`,
`Notification`, `Signalement`, etc.

### Étape 1 — Générer le client Prisma

```bash
npx prisma generate
```

### Étape 2 — Créer les tables dans la base de données

```bash
npx prisma migrate dev --name init
```

Cette commande :
- Se connecte à la base via `DATABASE_URL`
- Crée toutes les tables et relations définies dans `schema.prisma`
- Génère un dossier `prisma/migrations/` (à conserver et versionner avec Git)

### Étape 3 — Insérer les ancêtres fondateurs

```bash
npx prisma db seed
```

Cela crée automatiquement dans la base :
- **Mayombo Mwilu Muke** (arrière-grand-père)
- **Kasongo Mbayo Bertha** (arrière-grand-mère)
- Leur relation de conjoints

Ils apparaîtront immédiatement au centre de l'arbre généalogique.

### (Optionnel) Visualiser la base de données

```bash
npx prisma studio
```

Ouvre une interface graphique sur `http://localhost:5555` pour voir et éditer
les données directement.

---

## 6. Lancer l'application

```bash
npm run dev
```

Ouvrez http://localhost:3000

---

## 7. Comment ça fonctionne

### Arbre généalogique
- `/arbre` charge tous les membres depuis la base via `GET /api/arbre`
- La fonction `construireArbreGenealogique()` (`src/lib/arbre.ts`) reconstruit
  l'arbre hiérarchique à partir des `RelationFamiliale` (PARENT_ENFANT, CONJOINT)
- L'arbre est zoomable, déplaçable (drag), et possède une recherche intégrée

### Ajouter un membre
- `POST /api/membres` crée un nouveau membre et, si `parentId` est fourni,
  crée automatiquement la relation `PARENT_ENFANT`
- L'arbre se met à jour automatiquement au prochain chargement

### Ajouter un conjoint / lien familial
- `POST /api/relations` avec `{ membreAId, membreBId, type }`
  où `type` ∈ `PARENT_ENFANT`, `CONJOINT`, `FRERE_SOEUR`

### Comptes & majorité
- Un parent peut créer un profil pour son enfant mineur (sans email/mot de passe,
  `statutCompte = EN_ATTENTE`)
- À sa majorité, l'enfant "réclame" son profil via `POST /api/auth/register`
  avec `profilExistantId`, ce qui ajoute son email/mot de passe et passe le
  statut à `ACTIF`

### Authentification
- `POST /api/auth/register` — inscription (nouveau membre ou réclamation de profil)
- `POST /api/auth/login` — connexion, retourne un token JWT
- Le token est stocké côté client dans `localStorage`

### Rôles
- `SUPER_ADMIN` — les ancêtres fondateurs par défaut
- `ADMIN` — modération, gestion des membres
- `MEMBRE_VERIFIE` — compte confirmé
- `MEMBRE_STANDARD` — compte standard

---

## 8. Déploiement en production

1. Déployez la base de données (Supabase/Neon/Railway recommandés)
2. Déployez l'application sur Vercel :
   ```bash
   npm install -g vercel
   vercel
   ```
3. Dans les paramètres du projet Vercel, ajoutez les variables d'environnement
   `DATABASE_URL` et `JWT_SECRET`
4. Lancez les migrations sur la base de production :
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## 9. Structure du projet

```
famille-maykas/
├── prisma/
│   ├── schema.prisma       # Modèle de données complet
│   └── seed.ts             # Création des ancêtres fondateurs
├── src/
│   ├── app/
│   │   ├── page.tsx              # Accueil
│   │   ├── arbre/page.tsx        # Arbre généalogique interactif
│   │   ├── profil/[id]/page.tsx  # Profil d'un membre
│   │   ├── login/page.tsx        # Connexion
│   │   ├── register/page.tsx     # Inscription
│   │   ├── admin/page.tsx        # Tableau de bord admin
│   │   └── api/
│   │       ├── arbre/route.ts        # GET arbre complet
│   │       ├── membres/route.ts      # GET/POST membres
│   │       ├── membres/[id]/route.ts # GET/PATCH profil
│   │       ├── relations/route.ts    # POST relation familiale
│   │       └── auth/
│   │           ├── login/route.ts
│   │           └── register/route.ts
│   ├── components/
│   │   ├── layout/EnTete.tsx
│   │   ├── profile/CarteMembre.tsx
│   │   └── tree/
│   │       ├── ArbreInteractif.tsx   # Zoom, pan, recherche
│   │       └── NoeudArbre.tsx        # Rendu récursif des nœuds
│   ├── lib/
│   │   ├── prisma.ts        # Client Prisma singleton
│   │   ├── auth.ts          # JWT + bcrypt
│   │   └── arbre.ts         # Construction de l'arbre depuis la DB
│   └── types/index.ts       # Types partagés
├── .env.example
└── package.json
```

---

## 10. Prochaines étapes suggérées

- Ajouter l'upload de photos vers un service (Cloudinary, S3, Supabase Storage)
- Ajouter la cartographie familiale (Leaflet / Mapbox avec les champs `latitude`/`longitude`)
- Ajouter l'export PDF/Excel de l'arbre (`pdf-lib`, `exceljs`)
- Ajouter un middleware d'authentification pour protéger les routes `/admin`
- Ajouter la pagination sur `/api/membres` pour les grandes familles
