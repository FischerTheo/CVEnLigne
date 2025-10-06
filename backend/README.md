# Resume API - Backend

Backend Node.js/Express pour l'application CV en ligne.

## Technologies
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- DeepL API (traduction)

## Installation locale

```bash
cd backend
npm install
```

## Configuration

Créer un fichier `.env` basé sur `.env.example` :

```env
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
DEEPL_API_KEY=your_key
DEEPL_API_USE_PAID=false
DEEPL_TIMEOUT_MS=15000
```

## Lancer en développement

```bash
npm run dev
```

## Lancer en production

```bash
npm start
```

## Déploiement sur Render

### Configuration
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Copier depuis `.env`

### Variables d'environnement requises
- `DATABASE_URL` (MongoDB Atlas)
- `JWT_SECRET`
- `NODE_ENV=production`
- `CLIENT_URL` (URL du frontend)
- `DEEPL_API_KEY`
- `DEEPL_API_USE_PAID=false`
- `DEEPL_TIMEOUT_MS=15000`

## API Endpoints

### Auth
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

### User Info
- `GET /api/userinfo?lang=fr|en` - Récupérer infos utilisateur
- `POST /api/userinfo?lang=fr|en` - Sauvegarder infos utilisateur

### Projects
- `GET /api/projects?lang=fr|en` - Récupérer projets
- `POST /api/projects?lang=fr|en` - Sauvegarder projets

### Notes
- `GET /api/usernote` - Récupérer note utilisateur
- `POST /api/usernote` - Sauvegarder note

### Upload
- `POST /api/upload/pdf` - Uploader un PDF
- `DELETE /api/upload/pdf?path=...` - Supprimer un PDF

### Translate
- `POST /api/translate` - Traduire un texte

## Structure

```
backend/
├── app.js              # Point d'entrée
├── controllers/        # Logique métier
├── models/             # Schémas MongoDB
├── routes/             # Routes API
├── utils/              # Utilitaires (JWT, traduction)
└── uploads/            # Fichiers uploadés
```
