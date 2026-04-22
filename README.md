# The Social Architect - Poker Web App

Une application React moderne pour gérer des sessions de poker entre amis, avec un design system sophistiqué inspiré d'un club privé.

## 🎨 Design System

L'application suit la charte graphique "The Hearthside Lounge" définie dans `ressources/Design.md` :
- **Palette**: Soft Dark Mode avec primary (#88d4cc), tertiary (#e7b483)
- **Typographie**: Manrope pour un look éditorial premium
- **Principe**: Pas de bordures 1px, uniquement des changements de couleur de surface
- **Composants**: Gradients pour les CTAs, glassmorphisme pour la navigation

## 🚀 Installation

```bash
npm install
```

## 💻 Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Navbar/         # Navigation principale
│   ├── BottomNav/      # Navigation mobile
│   ├── Button/         # Boutons avec variants
│   └── Input/          # Champs de formulaire
├── pages/              # Pages de l'application
│   ├── Auth/           # Page de connexion
│   ├── Dashboard/      # Tableau de bord
│   ├── SessionResult/  # Résultats de session
│   ├── Leaderboard/    # Classement général
│   └── AdminPanel/     # Panel d'administration
├── App.jsx             # Configuration des routes
├── main.jsx            # Point d'entrée
└── index.css           # Styles globaux et tokens CSS
```

## 📱 Pages

### Auth (`/`)
Page de connexion avec design glassmorphisme et background pattern.

### Dashboard (`/dashboard`)
- Prochaine session à venir
- Progression saisonnière
- Historique des sessions récentes

### Session Result (`/session/:id`)
- Insights de la session (MVP, stats)
- Classement détaillé des joueurs
- Status de finalisation

### Leaderboard (`/leaderboard`)
- Podium top 3
- Classement complet
- Filtres saison courante / all-time
- Recherche de joueurs

### Admin Panel (`/admin`)
- Ajout de nouveaux membres
- Enregistrement des résultats de session
- Gestion des joueurs

## 🎯 Technologies

- **React 18** - Framework UI
- **React Router 6** - Navigation
- **Vite** - Build tool
- **CSS Modules** - Styling (pas de Tailwind, CSS classique)
- **Material Symbols** - Icônes

## 🎨 Design Tokens

Les tokens CSS sont définis dans `src/index.css` :
- Couleurs de surface (surface, surface-container, etc.)
- Couleurs primaires, secondaires, tertiaires
- Espacements (spacing-1 à spacing-16)
- Rayons de bordure (radius-sm à radius-full)

## 📦 Build

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## 🔗 Backend

Cette application est le frontend uniquement. Le backend doit être connecté séparément pour la gestion des données.

## 📝 Notes

- Architecture: `components > folder > file.jsx & file.css`
- Pas de Tailwind, uniquement du CSS classique
- Design system strict selon Design.md
- Navigation responsive avec BottomNav mobile
