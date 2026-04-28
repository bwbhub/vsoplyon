# Déploiement — Supabase (BDD) + Vercel (front + API serverless)

Stack :
- **Front** : React + Vite (TS-friendly)
- **API** : Node.js TypeScript serverless dans `/api/`
- **BDD** : Postgres managé sur Supabase (free tier)
- **Hébergement** : Vercel (front + fonctions API ensemble)

## Arborescence

```
/
├── api/                       Endpoints serverless (auto-détectés par Vercel)
│   ├── _lib/
│   │   ├── db.ts              Client `postgres` (Supabase pooler)
│   │   ├── auth.ts            JWT + requireAuth / requireAdmin
│   │   ├── handler.ts         withApi() : CORS + erreurs JSON
│   │   └── password.ts        bcrypt
│   ├── index.ts               GET /api : liste endpoints
│   ├── auth.ts                POST /api/auth
│   ├── users.ts               CRUD /api/users
│   ├── tournois.ts            GET /api/tournois
│   ├── lieux.ts               GET /api/lieux
│   ├── evenements.ts          GET /api/evenements
│   ├── scores.ts              GET/POST /api/scores
│   └── leaderboard.ts         GET /api/leaderboard
├── src/                       Front React
├── supabase/
│   ├── schema.sql             Schema Postgres complet
│   └── seed.sql               Donnees de test (admin / admin123)
├── vercel.json                Config Vercel (region cdg1, rewrites SPA)
├── tsconfig.json
└── package.json
```

## 1. Création de la BDD Supabase

1. Compte gratuit sur [supabase.com](https://supabase.com)
2. **New project** → choisis la région **Frankfurt (eu-central-1)** ou **Paris** (proche de Vercel cdg1)
3. Définis un mot de passe DB solide (note-le)
4. Une fois le projet créé : **SQL Editor** → New query
5. Colle le contenu de `supabase/schema.sql` → Run
6. (Optionnel) Colle `supabase/seed.sql` → Run pour insérer un admin de test (`admin@vsop.local` / `admin123`)

### Récupérer la connection string

Project Settings → **Database** → **Connection string** :

- ⚠️ Choisir **« Transaction pooler »** (port 6543), pas le « Direct connection »
- Format : `postgresql://postgres.<ref>:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
- Remplace `[YOUR-PASSWORD]` par le mdp DB

C'est ta `DATABASE_URL`.

## 2. Variables d'environnement

### Local — `.env.local` à la racine

```ini
# Front
VITE_API_URL=http://localhost:3000/api

# API
DATABASE_URL=postgresql://postgres.xxxx:MDP@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
JWT_SECRET=remplace-par-au-moins-32-caracteres-aleatoires
CORS_ORIGINS=http://localhost:3000
DEBUG_API=1
```

Génère un `JWT_SECRET` :
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### Vercel — Project Settings → Environment Variables

Mêmes variables (sauf `VITE_API_URL` qui peut rester vide → relatif `/api`) :

| Clé | Production |
|---|---|
| `DATABASE_URL` | string Supabase (pooler 6543) |
| `JWT_SECRET` | string aléatoire 32+ chars |
| `CORS_ORIGINS` | `*` (ou restreint à ton domaine) |
| `DEBUG_API` | `0` |

## 3. Installation

```powershell
npm install
```

## 4. Dev local

```powershell
npm install -g vercel
vercel link               # premiere fois : associe au projet Vercel
vercel dev                # demarre Vite + endpoints /api/* sur localhost:3000
```

Tu peux aussi simplement faire `npm run dev` si tu veux pointer le front contre l'API déjà déployée — adapte `VITE_API_URL`.

## 5. Premier déploiement

```powershell
git add .
git commit -m "feat: stack Supabase + Vercel serverless"
git push
```

Sur [vercel.com](https://vercel.com) :
1. Import du repo GitHub
2. Framework : **Vite** (auto)
3. Ajoute les env vars (cf section 2)
4. Deploy

## 6. Tests rapides

```powershell
# Liste des endpoints
curl https://<ton-app>.vercel.app/api

# Login (avec le seed admin/admin123)
$body = '{"login":"admin@vsop.local","password":"admin123"}'
curl.exe -X POST https://<ton-app>.vercel.app/api/auth `
  -H "Content-Type: application/json" -d $body
```

Tu reçois `{ token, user }`. Toutes les autres routes protégées attendent ensuite :

```
Authorization: Bearer <token>
```

(Le front gère ça automatiquement via `src/services/api.js`.)

## 7. Schéma de la BDD

Tables principales (`supabase/schema.sql`) :

| Table | Rôle |
|---|---|
| `utilisateur` | Joueurs (`admin BOOLEAN`, password en bcrypt) |
| `lieu` | Lieux de session |
| `tournoi` | Saisons / championnats |
| `evenement` | Sessions datées (FK lieu_id, tournoi_id) |
| `score_evenement` | Score par joueur par session |
| `score_tournoi` | **Vue** agrégée auto (sum des points/bonus par tournoi) |

Conventions : `snake_case`, `bigserial` pour les ids, `timestamptz` pour les dates, booléens réels.

## 8. Particularités à connaître

- **Cold starts Vercel** : ~1-2 s à froid puis quasi instantané. La région `cdg1` (Paris) minimise la latence vers Supabase EU.
- **Pooler Supabase mode transaction** : `prepare: false` est obligatoire dans `db.ts` (déjà fait).
- **JWT** : 7 jours de validité. À ré-loguer après expiration.
- **Pas de migration legacy** : la BDD repart de zéro, tous les mots de passe sont en bcrypt. `password.ts` n'a plus de fallback md5/sha1.
- **Pas de migration tools** pour l'instant : `schema.sql` est ta source de vérité. Si tu modifies un jour le schema, ajoute un `migrations/<date>-<change>.sql` à exécuter manuellement.

## 9. Créer un user admin pour de bon

Le seed contient un admin de test (`admin@vsop.local` / `admin123`). Pour ton vrai compte :

```sql
-- Dans Supabase SQL Editor.
-- Le hash ci-dessous correspond a "MonMotDePasse" — generer le tien :
--   node -e "console.log(require('bcryptjs').hashSync('MonMotDePasse', 10))"
INSERT INTO utilisateur (nom, prenom, pseudo, mail, password, admin)
VALUES ('Bouhot', 'Brice', 'brice', 'brice@example.com',
        '$2a$10$...HASH_BCRYPT...', true);
```

Ou plus simplement : utilise le seed admin pour te logger, puis crée d'autres users via l'admin panel.
