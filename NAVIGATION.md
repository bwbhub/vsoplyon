# Navigation Flow - The Social Architect

Ce document décrit le flow de navigation complet de l'application.

## Routes disponibles

- `/` - Page de connexion (Auth)
- `/dashboard` - Tableau de bord principal
- `/session/:id` - Détails d'une session
- `/leaderboard` - Classement général
- `/admin` - Panel d'administration

## Navigation par page

### Auth (`/`)
**Actions:**
- ✅ Formulaire de connexion → Navigue vers `/dashboard` au submit
- ✅ Lien "Apply for Membership" (placeholder)

### Dashboard (`/dashboard`)
**Navigation disponible:**
- ✅ Logo "VSOP-LYON" → Retour au `/dashboard`
- ✅ Navbar: Accueil (actif) | Classement | Sessions
- ✅ Bouton "Profil/Déconnexion"
- ✅ Bouton "Join Session" → Navigue vers `/session/upcoming`
- ✅ Bouton "View All" (sessions récentes) → Navigue vers `/leaderboard`
- ✅ Clic sur une session récente → Navigue vers `/session/:id`
- ✅ BottomNav mobile: Home (actif) | Rank | Players

### Session Result (`/session/:id`)
**Navigation disponible:**
- ✅ Logo "VSOP-LYON" → Retour au `/dashboard`
- ✅ Navbar: Dashboard | Leaderboard | Sessions (actif)
- ✅ Bouton "Profile" → Navigue vers `/admin`
- ✅ Bouton "Back to Sessions" → Retour au `/dashboard`
- ✅ BottomNav mobile: Home | Rank | Players (actif)

### Leaderboard (`/leaderboard`)
**Navigation disponible:**
- ✅ Logo "VSOP-LYON" → Retour au `/dashboard`
- ✅ Navbar: Dashboard | Leaderboard (actif) | Sessions
- ✅ Bouton "Profile" → Navigue vers `/admin`
- ✅ Recherche de joueurs (fonctionnelle)
- ✅ Filtres: Current Season / All Time
- ✅ Clic sur podium top 3 → Navigue vers `/session/1`
- ✅ Clic sur ligne du tableau → Navigue vers `/session/1`
- ✅ Bouton "View Complete Standings" (placeholder)
- ✅ BottomNav mobile: Home | Rank (actif) | Players

### Admin Panel (`/admin`)
**Navigation disponible:**
- ✅ Logo "VSOP-LYON" → Retour au `/dashboard`
- ✅ Navbar: Dashboard | Leaderboard | Sessions
- ✅ Bouton "Profile" → Reste sur `/admin` (actif)
- ✅ Formulaire "Onboard New Player" (submit handler)
- ✅ Formulaire "Log Session Results" (submit handler)
- ✅ Liste des joueurs avec actions Edit/Delete (handlers à implémenter)
- ✅ BottomNav mobile: Home | Rank | Players

## Composants de navigation

### Navbar
- Responsive (caché sur mobile < 768px)
- Logo cliquable → `/dashboard`
- 3 liens: Dashboard, Leaderboard, Sessions
- Bouton Profile → `/admin`
- Active state sur le lien correspondant à la page actuelle

### BottomNav
- Visible uniquement sur mobile (< 768px)
- 3 liens: Home (`/dashboard`), Rank (`/leaderboard`), Players (`/session/1`)
- Active state avec background et scale
- Icônes Material Symbols avec FILL sur actif

## Interactions cliquables

### Dashboard
- ✅ Sessions récentes (3 items) → `/session/:id`
- ✅ Bouton "Join Session" → `/session/upcoming`
- ✅ Bouton "View All" → `/leaderboard`

### Leaderboard
- ✅ Podium cards (top 3) → `/session/1`
- ✅ Lignes du tableau → `/session/1`
- ✅ Curseur pointer sur hover

### Session Result
- ✅ Bouton "Back to Sessions" → `/dashboard`
- ✅ Transition smooth avec icône animée

## États actifs

Chaque page met à jour automatiquement:
- L'état actif dans la Navbar (underline + couleur primary)
- L'état actif dans la BottomNav (background + scale + FILL icon)
- Le curseur pointer sur les éléments cliquables
- Les transitions hover sur tous les boutons et liens
