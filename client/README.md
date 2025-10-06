# Resume Client - Frontend

Frontend React/Vite pour l'application CV en ligne.

## Technologies
- React 19
- Vite
- React Router
- i18next (internationalisation FR/EN)
- SCSS/Tailwind
- React Toastify

## Installation locale

```bash
cd client
npm install
```

## Configuration

Créer un fichier `.env` (optionnel en local) :

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Lancer en développement

```bash
npm run dev
```

Le site sera accessible sur http://localhost:5173

## Build de production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`

## Déploiement sur Render (Static Site)

### Configuration
- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Variables d'environnement
- `VITE_API_BASE_URL` - URL du backend (ex: `https://resume-backend.onrender.com`)

## Structure

```
client/
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── forms/        # Formulaires
│   │   ├── Navbar.jsx
│   │   ├── ProfileSidebar.jsx
│   │   └── ErrorBoundary.jsx
│   ├── pages/            # Pages principales
│   │   ├── Login.jsx
│   │   ├── FormulairePage.jsx
│   │   ├── OnlineResume.jsx
│   │   └── MonParcour.jsx
│   ├── lib/              # API client
│   ├── styles/           # SCSS
│   ├── locales/          # Traductions FR/EN
│   └── App.jsx
├── public/               # Assets statiques
└── index.html
```

## Fonctionnalités
