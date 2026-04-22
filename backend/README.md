# Backend VSOP — API PHP

API REST minimaliste en PHP/PDO destinée à être hébergée chez **OVH mutualisé** (là où se trouve déjà la base MySQL `vsoplyondbase`). Le front React (Vercel) consomme cette API en HTTPS.

## Structure

```
backend/
└── api/
    ├── .htaccess             # Protection + charset
    ├── bootstrap.php         # Config, CORS, PDO, helpers (commun)
    ├── config.sample.php     # Modèle de config (à copier)
    ├── config.php            # Vraies creds (NE PAS COMMIT — voir .gitignore)
    ├── index.php             # Page d'accueil / liste endpoints
    ├── users.php             # CRUD utilisateurs
    ├── tournois.php          # Lecture tournois
    ├── lieux.php             # Lecture lieux
    ├── evenements.php        # Lecture sessions (filtres upcoming/recent/tournoi)
    ├── scores.php            # Scores par évènement / user / tournoi
    ├── leaderboard.php       # Classement agrégé
    └── auth.php              # Login (pseudo/mail + password)
```

## Déploiement sur OVH via FTP

### 1. Préparer la config

Dans `backend/api/`, copie `config.sample.php` → `config.php` et remplis les vraies valeurs :

```php
'host'     => 'vsoplyondbase.mysql.db',
'database' => 'vsoplyondbase',
'user'     => 'vsoplyondbase',
'password' => '...',
```

Ajoute aussi l'URL de ton front Vercel dans `cors_allowed_origins`.

> `config.php` est **gitignoré** (ne sera jamais poussé sur Git). Tu dois l'uploader manuellement via FTP.

### 2. Uploader via FileZilla

**Réglages FileZilla :**
- Hôte : `ftp.vsop-lyon.fr`
- Port : `21`
- Chiffrement : **FTP simple** (OVH mutualisé ne supporte pas FTPS sur port 21)
- Utilisateur + mot de passe : tes creds FTP OVH

**Chemin :**
- Dépose le contenu du dossier `backend/api/` dans `www/api/` sur le serveur OVH
- Résultat attendu : `https://vsop-lyon.fr/api/index.php` répond en JSON

### 3. Tester

```
GET https://vsop-lyon.fr/api/
GET https://vsop-lyon.fr/api/lieux.php
GET https://vsop-lyon.fr/api/tournois.php
GET https://vsop-lyon.fr/api/leaderboard.php?all=1&limit=10
```

Si erreur `Missing config.php` → c'est que `config.php` n'a pas été uploadé.
Si erreur `DB connection error` → vérifie les creds dans `config.php`.

## Endpoints

Voir `api/index.php` ou appeler `GET /api/` pour la liste complète.

## Sécurité

- ⚠️ Les mots de passe utilisateur sont stockés **en clair** dans la table `utilisateur` (historique). `auth.php` gère les 2 formats (legacy + bcrypt) pour faciliter une future migration.
- `config.php` protégé par `.htaccess` (interdiction d'accès direct).
- CORS strict : seules les origines listées dans `config.php` peuvent appeler l'API.
- Le token renvoyé par `/auth.php` est pour l'instant symbolique (à remplacer par JWT quand on aura une vraie gestion de session).

## Tester en local (optionnel)

Nécessite PHP 8+ et une base MySQL locale (ou SSH tunnel vers OVH).

```powershell
cd backend
php -S localhost:8000 -t .
```

Puis `http://localhost:8000/api/` dans ton navigateur.
