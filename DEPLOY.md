# Déploiement — VSOP-LYON (tout sur OVH)

Le front React et l'API PHP sont servis depuis le même hébergement OVH mutualisé, sur `vsop-lyon.fr`. Pas de Vercel, pas de DNS custom, pas de sous-domaine.

## Structure cible sur le serveur OVH

```
/www/                      ← racine du site vsop-lyon.fr
├── index.html             ← build React (remplace l'ancien index.php)
├── assets/                ← JS, CSS, images hashés (généré par Vite)
├── .htaccess              ← SPA routing + HTTPS + cache
└── api/                   ← backend PHP
    ├── index.php
    ├── bootstrap.php
    ├── config.php         ← creds BDD (NON versionné)
    ├── auth.php
    ├── users.php
    └── ... (autres endpoints)
```

## Étapes de déploiement

### Préparation (une seule fois)

1. **`.env.local`** à la racine du projet avec :
   ```
   VITE_API_URL=/api
   ```

2. **`backend/api/config.php`** (copie de `config.sample.php`) avec les vraies creds MySQL.

### À chaque déploiement

#### 1. Builder le front

```powershell
npm install       # si jamais les deps ont bougé
npm run build
```

Cela génère `dist/` contenant :
- `index.html`
- `assets/`
- `.htaccess` (copié automatiquement depuis `public/`)

#### 2. Uploader via FileZilla

**Réglages FileZilla :**
- Hôte : `ftp.vsop-lyon.fr`
- Chiffrement : **FTP simple** (pas FTPS)
- Port : 21

**Upload front :**
- Locale : `dist/` (tout le contenu, pas le dossier lui-même)
- Distant : `/www/` 
- **Remplacer** les fichiers existants (notamment l'ancien `index.php`)
- ⚠️ Supprimer l'ancien `index.php` après upload s'il reste

**Upload backend API :**
- Locale : `backend/api/`
- Distant : `/www/api/`
- Inclure `config.php` et `.htaccess`
- À faire uniquement si le backend PHP a été modifié

### 3. Vérifications

Ouvrir dans le navigateur :

```
https://vsop-lyon.fr/api/          → JSON liste endpoints
https://vsop-lyon.fr/api/lieux.php → JSON liste lieux
https://vsop-lyon.fr/             → l'app React
```

Puis tester une connexion complète (login, dashboard, etc.).

## Notes importantes

- **Même origine** : comme tout est sur `vsop-lyon.fr`, il n'y a aucun problème CORS. La config `cors_allowed_origins` dans `config.php` sert juste au dev local.
- **Routing SPA** : le `.htaccess` intercepte toutes les routes inconnues (sauf `/api/`) et renvoie `index.html` pour que React Router prenne le relais.
- **Cache** : les assets Vite ont un hash dans le nom (`index-abc123.js`), donc on peut les cacher 1 an. Seul `index.html` doit rester non caché.
- **HTTPS forcé** : le `.htaccess` redirige tout HTTP vers HTTPS.

## Dev local

```powershell
# Terminal 1 : serveur PHP pour l'API
cd backend
php -S localhost:8000 -t .

# Terminal 2 : Vite
npm run dev
```

Avec en local un `.env.local` temporaire :
```
VITE_API_URL=http://localhost:8000/api
```

Ou, plus simple, utiliser directement l'API prod depuis le dev local :
```
VITE_API_URL=https://vsop-lyon.fr/api
```
(il faudra alors que `https://localhost:3000` soit listé dans `cors_allowed_origins` côté prod)
