# Documentation Technique - CV en Ligne

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du projet](#architecture-du-projet)
3. [Stack technique](#stack-technique)
4. [Installation et démarrage](#installation-et-démarrage)
5. [Structure des dossiers](#structure-des-dossiers)
6. [Backend - API](#backend---api)
7. [Frontend - React](#frontend---react)
8. [Gestion des fichiers](#gestion-des-fichiers)
9. [Internationalisation](#internationalisation)
10. [Accessibilité](#accessibilité)
11. [Responsive Design](#responsive-design)
12. [Sécurité](#sécurité)
13. [Maintenance](#maintenance)
14. [Dépannage](#dépannage)

---

## Vue d'ensemble

Application web full-stack permettant de créer, gérer et afficher un CV en ligne interactif avec support multilingue (français/anglais).

### Fonctionnalités principales

- **CV en ligne dynamique** : Affichage professionnel et responsive
- **Interface d'administration** : Gestion complète du contenu via formulaires
- **Multilingue** : Support FR/EN avec traduction automatique
- **Upload de fichiers** : CV PDF et certifications
- **Authentification** : Système de connexion sécurisé avec JWT
- **Accessibilité WCAG 2.1 AAA** : Contraste optimal, navigation clavier
- **Responsive Mobile-First** : Desktop, tablette, mobile

---

## Stack technique

### Frontend

- **React 18** : Bibliothèque UI
- **React Router 6** : Navigation SPA
- **Vite** : Build tool et dev server
- **SCSS** : Préprocesseur CSS avec architecture modulaire
- **i18next** : Internationalisation FR/EN
- **Axios** : Requêtes HTTP

### Backend

- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **JWT** : Authentification par tokens
- **Multer** : Upload de fichiers
- **bcrypt** : Hachage de mots de passe

### DevOps

- **Vite Dev Server** : HMR pour développement rapide
- **ESLint** : Linter JavaScript
- **Git** : Contrôle de version

---

## Installation et démarrage

### Prérequis

```bash
Node.js >= 18.x
MongoDB >= 5.x
npm >= 9.x
```

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd Resume

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../client
npm install
```

### Configuration

**Backend** : Créer `/backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-db
JWT_SECRET=votre_secret_jwt_super_securise
NODE_ENV=development
```

**Frontend** : Vérifier `/client/src/lib/api.js`

```javascript
export const API = 'http://localhost:5000'
```

### Démarrage

**Terminal 1 - Backend**

```bash
cd backend
npm run dev
# Serveur sur http://localhost:5000
```

**Terminal 2 - Frontend**

```bash
cd client
npm run dev
# Application sur http://localhost:5173
```

### Création du compte admin

```bash
# Dans le backend, utiliser MongoDB directement ou créer via l'API
# Exemple avec curl :
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "VotreMotDePasse123!",
    "isAdmin": true
  }'
```

---

## Structure des dossiers

### Backend (/backend)

```
backend/
├── app.js                    # Point d'entrée principal
├── package.json              # Dépendances
├── .env                      # Variables d'environnement (à créer)
│
├── controllers/              # Logique métier
│   ├── authController.js     # Authentification (login, register, delete)
│   ├── projectsController.js # CRUD projets
│   ├── userInfoController.js # Récupération infos utilisateur
│   └── userNoteController.js # Gestion notes admin
│
├── middleware/               # Middlewares Express
│   ├── authMiddleware.js     # Vérification JWT
│   └── validation.js         # Validation des données
│
├── models/                   # Schémas Mongoose
│   ├── User.js               # Utilisateur + auth
│   ├── FormFR.js             # Données CV en français
│   ├── FormEN.js             # Données CV en anglais
│   └── UserNote.js           # Notes privées admin
│
├── routes/                   # Routes API
│   ├── auth.js               # /api/auth/*
│   ├── projects.js           # /api/projects/*
│   ├── userInfo.js           # /api/userinfo/*
│   ├── userNote.js           # /api/usernote/*
│   ├── upload.js             # /api/upload/*
│   └── translate.js          # /api/translate/*
│
├── services/                 # Services métier
│   ├── formService.js        # Gestion formulaires CV
│   └── userService.js        # Gestion utilisateurs
│
├── utils/                    # Utilitaires
│   ├── asyncHandler.js       # Wrapper async/await
│   ├── cookieUtils.js        # Gestion cookies JWT
│   ├── fileCleanup.js        # [IMPORTANT] Nettoyage PDFs obsolètes
│   ├── fileValidator.js      # Validation fichiers uploadés
│   ├── jwt.js                # Génération/vérification tokens
│   ├── requestHelpers.js     # Helpers requêtes
│   ├── translate.js          # Traduction FR↔EN
│   └── validation.js         # Schémas de validation
│
└── uploads/pdfs/             # Stockage fichiers uploadés
```

### Frontend (/client)

```
client/
├── index.html                # Point d'entrée HTML
├── package.json              # Dépendances
├── vite.config.js            # Configuration Vite
│
├── public/                   # Assets statiques
│   ├── en.svg                # Drapeau anglais
│   ├── fr.svg                # Drapeau français
│   ├── git.svg               # Icône GitHub
│   ├── link.svg              # Icône lien externe
│   └── profile.png           # Photo de profil par défaut
│
└── src/
    ├── main.jsx              # Point d'entrée React
    ├── App.jsx               # Composant racine + routing
    ├── i18n.js               # Configuration i18next
    │
    ├── components/           # Composants réutilisables
    │   ├── Navbar.jsx        # Barre de navigation
    │   ├── ProfileSidebar.jsx # Sidebar profil (CV)
    │   ├── Carousel.jsx      # Carrousel de projets
    │   ├── ChangePasswordForm.jsx
    │   ├── DeleteAccountButton.jsx
    │   ├── DeleteDatabaseButton.jsx
    │   ├── ErrorBoundary.jsx
    │   ├── common/
    │   │   ├── AutoResizeTextarea.jsx
    │   │   └── LoadingSpinner.jsx
    │   └── forms/
    │       ├── Formulaire.jsx
    │       └── sections/
    │           ├── NonRepeatableForm.jsx
    │           └── RepeatableForm.jsx
    │
    ├── contexts/             # Context API React
    │   └── AuthContext.jsx   # État global authentification
    │
    ├── lib/                  # Bibliothèques
    │   └── api.js            # [IMPORTANT] Client API centralisé
    │
    ├── locales/              # Traductions i18n
    │   ├── mainFR.json       # Français
    │   └── mainEN.json       # Anglais
    │
    ├── pages/                # Pages principales
    │   ├── OnlineResume.jsx  # CV en ligne (public)
    │   ├── Login.jsx         # Connexion admin
    │   ├── FormulairePage.jsx# Gestion contenu (admin)
    │   └── MonParcour.jsx    # Page parcours détaillé
    │
    ├── styles/               # Styles SCSS
    │   ├── index.scss        # Point d'entrée
    │   ├── desktopResize.scss# Styles desktop dynamiques
    │   └── scss/
    │       ├── abstracts/    # Variables + Mixins
    │       │   ├── _variables.scss
    │       │   └── _mixins.scss
    │       ├── base/         # Styles de base
    │       │   ├── _reset.scss
    │       │   └── _accessibility.scss
    │       ├── components/   # Styles composants
    │       │   ├── _navbar.scss
    │       │   ├── _sidebar.scss
    │       │   ├── _carousel.scss
    │       │   ├── _buttons.scss
    │       │   ├── _loading.scss
    │       │   ├── _password-change.scss
    │       │   ├── _delete-account.scss
    │       │   └── _error-boundary.scss
    │       ├── layout/       # Layouts
    │       │   ├── _main.scss
    │       │   └── _responsive.scss (850+ lignes)
    │       └── pages/        # Styles pages
    │           ├── _resume.scss
    │           ├── _login.scss
    │           ├── _forms.scss
    │           └── _parcour.scss
    │
    └── utils/
        └── errorMessages.js  # Messages d'erreur
```

---

## Backend - API

### Routes principales

#### Authentification (/api/auth)

| Méthode | Endpoint          | Description                       | Auth |
| ------- | ----------------- | --------------------------------- | ---- |
| POST    | `/register`       | Créer un compte                   | Non  |
| POST    | `/login`          | Connexion                         | Non  |
| POST    | `/logout`         | Déconnexion                       | Oui  |
| DELETE  | `/delete-account` | Supprimer compte + toutes données | Oui  |

**Exemple - Login**

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "MotDePasse123!"
}

// Réponse
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isAdmin": true
}
```

#### Informations utilisateur (/api/userinfo)

| Méthode | Endpoint           | Description            | Auth |
| ------- | ------------------ | ---------------------- | ---- |
| GET     | `/:userId?lang=fr` | Récupérer CV complet   | Non  |
| GET     | `/admin?lang=fr`   | CV de l'admin (public) | Non  |

**Exemple**

```javascript
GET /api/userinfo/admin?lang=fr

// Réponse
{
  "fullName": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "0612345678",
  "summary": "Développeur Full Stack...",
  "skills": [...],
  "experience": [...],
  "education": [...],
  "certifications": [...]
}
```

#### Projets (/api/projects)

| Méthode | Endpoint         | Description         | Auth |
| ------- | ---------------- | ------------------- | ---- |
| POST    | `/`              | Créer un projet     | Oui  |
| PUT     | `/:id`           | Modifier un projet  | Oui  |
| DELETE  | `/:id`           | Supprimer un projet | Oui  |
| GET     | `/admin?lang=fr` | Projets de l'admin  | Non  |

#### Upload de fichiers (/api/upload)

| Méthode | Endpoint         | Description           | Auth |
| ------- | ---------------- | --------------------- | ---- |
| POST    | `/pdf`           | Upload CV PDF         | Oui  |
| POST    | `/certification` | Upload certificat PDF | Oui  |

**Validation**

- Types acceptés : `.pdf` uniquement
- Taille max : 5 MB
- Nettoyage automatique des anciens fichiers

#### Notes admin (/api/usernote)

| Méthode | Endpoint | Description              | Auth |
| ------- | -------- | ------------------------ | ---- |
| GET     | `/`      | Récupérer note           | Oui  |
| POST    | `/`      | Créer/Mettre à jour note | Oui  |

#### Traduction (/api/translate)

| Méthode | Endpoint | Description          | Auth |
| ------- | -------- | -------------------- | ---- |
| POST    | `/`      | Traduire texte FR↔EN | Oui  |

---

## Frontend - React

### Pages principales

#### **OnlineResume.jsx** - CV en ligne

- **Route** : `/`
- **Public** : Oui
- **Description** : Affichage du CV avec sidebar, about, expériences, projets
- **Features** :
  - Chargement dynamique selon langue (FR/EN)
  - Sidebar fixe avec photo, contacts, compétences
  - Carousel de 3 projets
  - Responsive complet

#### **Login.jsx** - Connexion admin

- **Route** : `/login`
- **Public** : Oui
- **Description** : Formulaire de connexion
- **Features** :
  - Validation côté client
  - Gestion erreurs
  - Redirection auto si déjà connecté

#### **FormulairePage.jsx** - Administration

- **Route** : `/formulaire`
- **Public** : Non (admin uniquement)
- **Description** : 3 blocs de formulaires pour gérer tout le contenu
- **Blocs** :
  1. **Infos personnelles** : Nom, email, téléphone, résumé, compétences
  2. **Parcours** : Expériences, formations, certifications, projets
  3. **Admin** : Notes, upload CV, changement mot de passe, suppression compte

#### **MonParcour.jsx** - Parcours détaillé

- **Route** : `/mon-parcour`
- **Public** : Oui
- **Description** : Vue détaillée des expériences, formations, certifications

### Composants clés

#### **Navbar.jsx**

- Barre de navigation fixe
- Changement de langue (FR/EN)
- Boutons conditionnels selon authentification
- Menu hamburger pour mobile/tablette
- Bouton "Télécharger CV" si disponible

#### **ProfileSidebar.jsx**

- Sidebar fixe à gauche (desktop uniquement)
- Photo de profil
- Informations de contact (email, téléphone, localisation)
- Liste des compétences groupées par niveau
- Responsive : disparaît sur mobile/tablette

#### **Carousel.jsx**

- Affiche 3 projets avec navigation
- Flèches gauche/droite
- Responsive :
  - Desktop : 3 projets en ligne
  - Tablette : 2 projets
  - Mobile : 1 projet en colonne

#### **Formulaire.jsx**

- Composant générique pour formulaires répétables
- Sections : Expériences, Formations, Certifications, Projets
- Features :
  - Ajout/Suppression d'items
  - Upload de PDFs pour certifications
  - Auto-sauvegarde
  - Traduction automatique FR↔EN

### Hooks personnalisés

**useAuth** (via AuthContext)

```javascript
const { user, login, logout, isAuthenticated } = useAuth()
```

### API Client (`lib/api.js`)

**Fonction principale : `apiFetch`**

```javascript
import { apiFetch } from '../lib/api'

// GET
const data = await apiFetch('/api/userinfo/admin?lang=fr')

// POST
const result = await apiFetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})

// Avec authentification automatique
// Le token JWT est automatiquement ajouté aux headers
```

**Features**

- Ajout automatique du token JWT
- Gestion centralisée des erreurs
- Support cookies
- Base URL configurable

---

## Gestion des fichiers

### Upload de CV PDF

**Endpoint** : `POST /api/upload/pdf`

**Frontend**

```javascript
const formData = new FormData()
formData.append('pdf', file)

const response = await apiFetch('/api/upload/pdf', {
  method: 'POST',
  body: formData
})
// { pdfUrl: '/uploads/pdfs/1234567890-cv.pdf' }
```

**Backend**

- Validation : Type PDF, max 5MB
- Stockage : `/backend/uploads/pdfs/`
- Nommage : `timestamp-filename.pdf`
- **Nettoyage automatique** : Ancien CV supprimé lors de l'upload d'un nouveau

### Upload de certificats PDF

**Endpoint** : `POST /api/upload/certification`

**Process identique au CV**

- Support de multiples certificats
- Chaque certification peut avoir son propre PDF
- Nettoyage automatique des PDFs orphelins

### Nettoyage automatique des fichiers

**Fichier** : `/backend/utils/fileCleanup.js`

**Fonctions principales**

```javascript
// Supprimer un fichier PDF
await deletePdfFile(pdfUrl)

// Nettoyer les PDFs de certifications obsolètes
await cleanupCertificationPdfs(oldFormData, newFormData)

// Nettoyer l'ancien CV
await cleanupCvPdf(oldPdfUrl, newPdfUrl)

// Nettoyer tous les PDFs d'un formulaire
await cleanupFormPdfs(oldForm, newForm)
```

**Déclenchement automatique**

1. **Mise à jour du formulaire** (`formService.js`)

   ```javascript
   async updateForm(userId, data, lang) {
     const oldForm = await Model.findOne({ userId })
     const updatedForm = await Model.findOneAndUpdate(...)

     // Nettoyage automatique
     if (oldForm) {
       await cleanupFormPdfs(oldForm, updatedForm)
     }
   }
   ```

2. **Suppression de compte** (`authController.js`)
   ```javascript
   // Supprime TOUS les PDFs avant de supprimer le compte
   const files = await fs.readdir(uploadsDir)
   for (const file of files) {
     if (file.endsWith('.pdf')) {
       await fs.unlink(path.join(uploadsDir, file))
     }
   }
   ```

**Avantages**

- Pas d'accumulation de fichiers inutiles
- Économie d'espace disque
- Transparence totale (aucune action manuelle)

---

## Internationalisation

### Configuration i18next

**Fichier** : `/client/src/i18n.js`

```javascript
i18n.use(initReactI18next).init({
  resources: {
    fr: { main: mainFR },
    en: { main: mainEN }
  },
  lng: 'fr', // Langue par défaut
  fallbackLng: 'fr',
  interpolation: { escapeValue: false }
})
```

### Fichiers de traduction

**Structure** : `/client/src/locales/`

```json
// mainFR.json
{
  "navbar": {
    "title": "CV en ligne",
    "login": "Se connecter",
    "logout": "Se déconnecter",
    "save": "Sauvegarder"
  },
  "resume": {
    "about": "À propos",
    "experience": "Expériences",
    "skills": "Compétences"
  }
}
```

### Utilisation dans les composants

```javascript
import { useTranslation } from 'react-i18next'

function MonComposant() {
  const { t, i18n } = useTranslation('main')

  // Traduction simple
  return <h1>{t('navbar.title')}</h1>

  // Changer de langue
  const switchLang = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')
  }
}
```

### Traduction automatique FR↔EN

**Endpoint** : `POST /api/translate`

**Utilisation**

```javascript
const response = await apiFetch('/api/translate', {
  method: 'POST',
  body: JSON.stringify({
    text: 'Développeur Full Stack',
    targetLang: 'en' // 'fr' ou 'en'
  })
})
// { translatedText: 'Full Stack Developer' }
```

**Features**

- Détection automatique de la langue source
- Traduction via service externe (configurable)
- Utilisé dans les formulaires pour dupliquer le contenu

### Doubles modèles (FormFR / FormEN)

Chaque formulaire est stocké en **2 versions** :

- **FormFR** : Données en français
- **FormEN** : Données en anglais

**Avantages**

- Chargement instantané (pas de traduction à la volée)
- SEO optimisé
- Possibilité de personnaliser le contenu par langue

---

## Accessibilité

### Niveau de conformité : WCAG 2.1 AAA

#### Contraste des couleurs

**Fichier** : `/client/src/styles/scss/abstracts/_variables.scss`

```scss
// Texte principal sur fond clair : Ratio 13:1 (AAA)
$text-color: #1a202c;
$primary-bg: #f7fafc;

// Texte secondaire : Ratio 7-8:1 (AAA)
$secondary-accent: #475569;

// Boutons : Ratio 8:1 (AAA)
$button-bg: #2563eb;
```

#### Navigation clavier

**Fichier** : `/client/src/styles/scss/base/_accessibility.scss`

**Focus visible**

```scss
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.2);
}
```

**Skip link** (navigation rapide)

```scss
.skip-link {
  position: fixed;
  top: -100px;

  &:focus {
    top: 16px; // Apparaît au focus
  }
}
```

#### Attributs ARIA

**Navbar.jsx**

```jsx
<nav
  className="navbar"
  role="navigation"
  aria-label="Navigation principale"
>
  <button
    aria-label="Ouvrir le menu"
    aria-expanded={isMenuOpen}
  >
```

**OnlineResume.jsx**

```jsx
<main role="main" id="main-content">
  <h1 className="sr-only">CV en ligne</h1>
  <section aria-label="À propos et objectif">
```

#### Classes utilitaires

```scss
// Texte visible uniquement pour les lecteurs d'écran
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
```

#### Support des préférences utilisateur

```scss
// Réduction des animations
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

// Mode contraste élevé
@media (prefers-contrast: high) {
  * {
    border-color: currentColor;
  }
}
```

### Checklist accessibilité

- Contraste AAA (> 7:1)
- Navigation clavier complète
- Focus visible sur tous les éléments interactifs
- Attributs ARIA appropriés (40+ usages)
- Hiérarchie de titres logique (h1 → h6)
- Textes alternatifs pour images
- Skip link pour navigation rapide
- Support des préférences (reduced-motion, high-contrast)
- Formulaires avec labels associés

---

## Responsive Design

### Approche : Mobile-First

**Fichier principal** : `/client/src/styles/scss/layout/_responsive.scss` (850+ lignes)

### Breakpoints

```scss
$breakpoint-mobile-small: 480px; // < 480px
$breakpoint-mobile-large: 768px; // 481px - 768px
$breakpoint-tablet: 1024px; // 769px - 1024px
$breakpoint-desktop: 1600px; // > 1600px
```

### Adaptation par composant

#### **Navbar**

| Écran    | Hauteur | Affichage              |
| -------- | ------- | ---------------------- |
| Desktop  | 64px    | Tous boutons visibles  |
| Tablette | 56px    | Menu hamburger         |
| Mobile   | 52px    | Logo réduit, hamburger |

**Code**

```scss
// Desktop (par défaut)
.navbar {
  height: 64px;
}

// Tablette
@media (max-width: 1024px) {
  .navbar {
    height: 56px;

    .navbar-desktop-btns {
      display: none;
    }
    .navbar-hamburger {
      display: flex;
    }
  }
}

// Mobile
@media (max-width: 768px) {
  .navbar {
    height: 52px;

    .navbar-logo {
      font-size: 11px;
      max-width: 80px;
    }
  }
}
```

#### **Sidebar**

| Écran    | Affichage                         |
| -------- | --------------------------------- |
| Desktop  | Fixed gauche, 280-425px dynamique |
| Tablette | Static, pleine largeur, au-dessus |
| Mobile   | Static, pleine largeur, au-dessus |

#### **Carousel**

| Écran    | Layout                            |
| -------- | --------------------------------- |
| Desktop  | 3 projets en ligne, flèches côtés |
| Tablette | 2 projets côte à côte             |
| Mobile   | 1 projet empilé, flèches boutons  |

**Code**

```scss
// Desktop
.carousel-items {
  display: flex;
  flex-direction: row;
  gap: 24px;
}

.carousel-item {
  flex: 1;
  min-width: 300px;
}

// Mobile
@media (max-width: 768px) {
  .carousel-items {
    flex-direction: column;
  }

  .carousel-item {
    width: 100%;
    min-width: 100%;
  }
}
```

#### **Formulaires**

| Écran    | Colonnes                |
| -------- | ----------------------- |
| Desktop  | 3 colonnes              |
| Tablette | 2 colonnes (50% chaque) |
| Mobile   | 1 colonne (100%)        |

**Code**

```scss
// Desktop
.formulaire-container {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.form-block {
  flex: 1 1 calc(33.333% - 32px);
}

// Tablette
@media (max-width: 1024px) {
  .form-block {
    flex: 0 0 calc(50% - 16px);
  }
}

// Mobile
@media (max-width: 768px) {
  .form-block {
    width: 100%;
    flex: none;
  }

  .form-row {
    flex-direction: column;
  }

  input,
  textarea,
  select {
    width: 100%;
  }
}
```

#### **Page Mon Parcours**

| Écran    | Layout                     |
| -------- | -------------------------- |
| Desktop  | 3 colonnes alignées gauche |
| Tablette | 2 colonnes centrées        |
| Mobile   | 1 colonne, pleine largeur  |

### Typographie responsive

```scss
// Variables adaptatives
$font-xl: 24px; // Desktop
$font-xl-tablet: 20px; // Tablette
$font-xl-mobile: 18px; // Mobile

$font-md: 16px; // Desktop
$font-md-tablet: 13px; // Tablette
$font-md-mobile: 12px; // Mobile
```

### Mixins responsive

```scss
// Utilisation
.mon-element {
  font-size: $font-md;

  @media (max-width: $breakpoint-tablet) {
    font-size: $font-md-tablet;
  }

  @media (max-width: $breakpoint-mobile-large) {
    font-size: $font-md-mobile;
  }
}
```

### Tests responsive

**Breakpoints à tester**

- Mobile Small : 360px (Samsung Galaxy)
- Mobile Large : 414px (iPhone Pro Max)
- Tablette : 768px (iPad)
- Desktop Standard : 1920px
- Desktop Large : 2560px

---

## Sécurité

### Authentification JWT

**Flux**

1. Login : `POST /api/auth/login`
2. Backend génère token JWT + stocke dans cookie httpOnly
3. Frontend reçoit `{ token, isAdmin }` et stocke dans localStorage
4. Requêtes suivantes : Token envoyé via header `Authorization: Bearer <token>`

**Fichier** : `/backend/utils/jwt.js`

```javascript
const jwt = require('jsonwebtoken')

// Générer token (expire en 7 jours)
const token = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' })

// Vérifier token
const decoded = jwt.verify(token, process.env.JWT_SECRET)
```

### Middleware d'authentification

**Fichier** : `/backend/middleware/authMiddleware.js`

```javascript
// Protège les routes admin
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Non authentifié' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.isAdmin = decoded.isAdmin
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' })
  }
}
```

### Hachage des mots de passe

**Fichier** : `/backend/models/User.js`

```javascript
const bcrypt = require('bcrypt')

// Avant sauvegarde
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

// Vérification
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}
```

### Validation des données

**Fichier** : `/backend/utils/validation.js`

```javascript
const Joi = require('joi')

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

// Utilisation
const { error } = loginSchema.validate(req.body)
if (error) {
  return res.status(400).json({ message: error.details[0].message })
}
```

### Validation des fichiers uploadés

**Fichier** : `/backend/utils/fileValidator.js`

```javascript
const validatePdf = file => {
  // Type MIME
  if (file.mimetype !== 'application/pdf') {
    throw new Error('Seuls les fichiers PDF sont acceptés')
  }

  // Taille max 5 MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Fichier trop volumineux (max 5 MB)')
  }

  return true
}
```

### Cookies sécurisés

**Fichier** : `/backend/utils/cookieUtils.js`

```javascript
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true, // Pas accessible via JS
    secure: true, // HTTPS uniquement (production)
    sameSite: 'strict', // Protection CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
  })
}
```

### Protection CORS

**Fichier** : `/backend/app.js`

```javascript
const cors = require('cors')

app.use(
  cors({
    origin: 'http://localhost:5173', // Domaine autorisé
    credentials: true // Support cookies
  })
)
```

### Checklist sécurité

- JWT avec expiration (7 jours)
- Cookies httpOnly + secure + sameSite
- Hachage bcrypt (10 rounds)
- Validation Joi des données entrantes
- Validation stricte des fichiers uploadés
- Protection CORS
- Variables d'environnement (.env)
- Pas de données sensibles dans le code
- Middleware d'authentification sur routes protégées

---

## Maintenance

### Ajout d'un nouveau champ au CV

**1. Backend - Modifier les modèles**

`/backend/models/FormFR.js` et `/backend/models/FormEN.js`

```javascript
const formSchema = new mongoose.Schema({
  // ... champs existants

  nouveauChamp: {
    type: String,
    default: ''
  }
})
```

**2. Frontend - Modifier le formulaire**

`/client/src/components/forms/sections/NonRepeatableForm.jsx`

```jsx
<input
  type="text"
  value={formData.nouveauChamp || ''}
  onChange={e => handleChange('nouveauChamp', e.target.value)}
  placeholder="Nouveau champ"
/>
```

**3. Affichage - Modifier la page CV**

`/client/src/pages/OnlineResume.jsx`

```jsx
{
  userInfo?.nouveauChamp && <p>{userInfo.nouveauChamp}</p>
}
```

**4. i18n - Ajouter traductions**

`/client/src/locales/mainFR.json` et `mainEN.json`

```json
{
  "form": {
    "nouveauChamp": "Nouveau champ"
  }
}
```

### Ajout d'une nouvelle route API

**1. Créer le controller**

`/backend/controllers/monController.js`

```javascript
exports.maFonction = async (req, res) => {
  try {
    // Logique
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
```

**2. Créer la route**

`/backend/routes/maRoute.js`

```javascript
const express = require('express')
const router = express.Router()
const { maFonction } = require('../controllers/monController')
const auth = require('../middleware/authMiddleware')

router.get('/', auth, maFonction)

module.exports = router
```

**3. Enregistrer dans app.js**

```javascript
const maRoute = require('./routes/maRoute')
app.use('/api/ma-route', maRoute)
```

**4. Utiliser dans le frontend**

```javascript
const data = await apiFetch('/api/ma-route')
```

### Ajout d'un nouveau composant

**1. Créer le composant**

`/client/src/components/MonComposant.jsx`

```jsx
import React from 'react'

function MonComposant({ prop1, prop2 }) {
  return <div className="mon-composant">{/* Contenu */}</div>
}

export default MonComposant
```

**2. Créer les styles**

`/client/src/styles/scss/components/_mon-composant.scss`

```scss
.mon-composant {
  padding: $spacing-lg;
  background: $section-bg;
}
```

**3. Importer dans index.scss**

```scss
@use 'components/mon-composant';
```

**4. Utiliser le composant**

```jsx
import MonComposant from '../components/MonComposant'
;<MonComposant prop1="valeur" prop2={data} />
```

### Migration de base de données

**Exemple : Renommer un champ**

```javascript
// Script de migration (à exécuter une fois)
const mongoose = require('mongoose')
const FormFR = require('./models/FormFR')

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI)

  // Renommer ancien_champ → nouveau_champ
  await FormFR.updateMany({}, { $rename: { ancien_champ: 'nouveau_champ' } })

  console.log('Migration terminée')
  process.exit(0)
}

migrate()
```

### Backup de la base de données

```bash
# Export MongoDB
mongodump --uri="mongodb://localhost:27017/resume-db" --out=./backup

# Import MongoDB
mongorestore --uri="mongodb://localhost:27017/resume-db" ./backup/resume-db
```

### Mise à jour des dépendances

```bash
# Backend
cd backend
npm outdated           # Voir les packages obsolètes
npm update             # Mise à jour mineure
npm install <package>@latest  # Mise à jour majeure

# Frontend
cd client
npm outdated
npm update
npm install <package>@latest
```

### Logs et monitoring

**Backend - Ajouter des logs**

```javascript
// En développement
console.log('[INFO]', 'Message de debug')
console.error('[ERROR]', error.message)

// En production (utiliser un logger comme Winston)
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

---

## Dépannage

### Problèmes courants

#### Erreur : "Cannot connect to MongoDB"

**Symptômes**

```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions**

1. Vérifier que MongoDB est démarré

   ```bash
   sudo systemctl status mongodb
   sudo systemctl start mongodb
   ```

2. Vérifier la chaîne de connexion dans `.env`

   ```env
   MONGODB_URI=mongodb://localhost:27017/resume-db
   ```

3. Tester la connexion
   ```bash
   mongosh
   ```

#### Erreur : "JWT secret not defined"

**Symptômes**

```
Error: JWT_SECRET is not defined
```

**Solutions**

1. Créer le fichier `.env` dans `/backend`
2. Ajouter la variable

   ```env
   JWT_SECRET=votre_secret_super_long_et_securise_ici
   ```

3. Redémarrer le serveur backend

#### Erreur : "Token invalide" après login

**Symptômes**

- Login réussi mais toutes les requêtes protégées échouent
- Message "Token invalide" ou "Non authentifié"

**Solutions**

1. Vérifier que le token est stocké

   ```javascript
   console.log(localStorage.getItem('token'))
   ```

2. Vérifier les headers de la requête

   ```javascript
   // Dans api.js, vérifier que le token est bien ajouté
   headers: {
     'Authorization': `Bearer ${localStorage.getItem('token')}`
   }
   ```

3. Vérifier la validité du token (JWT.io)
4. Vérifier que JWT_SECRET est le même que lors de la génération

#### Erreur : "PDF upload failed"

**Symptômes**

```
Error: File too large / Invalid file type
```

**Solutions**

1. Vérifier la taille du fichier (max 5 MB)
2. Vérifier le type MIME (doit être `application/pdf`)
3. Vérifier les permissions du dossier `uploads/pdfs/`
   ```bash
   chmod 755 backend/uploads/pdfs/
   ```

#### Erreur : CORS bloqué

**Symptômes**

```
Access to fetch at 'http://localhost:5000/api/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solutions**

1. Vérifier la configuration CORS dans `/backend/app.js`

   ```javascript
   app.use(
     cors({
       origin: 'http://localhost:5173',
       credentials: true
     })
   )
   ```

2. S'assurer que `credentials: true` est présent

#### Erreur : Styles SCSS non chargés

**Symptômes**

- Site sans style
- Console : "Failed to resolve import"

**Solutions**

1. Vérifier que le fichier est importé dans `index.scss`
2. Vérifier les chemins `@use`

   ```scss
   @use '../abstracts/variables' as *;
   ```

3. Redémarrer Vite
   ```bash
   npm run dev
   ```

#### Erreur : i18n traductions manquantes

**Symptômes**

```
i18next::translator: missingKey fr main navbar.title
```

**Solutions**

1. Vérifier que la clé existe dans `/client/src/locales/mainFR.json`
2. Vérifier la syntaxe JSON (pas de virgule en fin de tableau)
3. Redémarrer le serveur

#### Erreur : "Port already in use"

**Symptômes**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions**

1. Trouver le processus utilisant le port

   ```bash
   lsof -i :5000
   ```

2. Tuer le processus

   ```bash
   kill -9 <PID>
   ```

3. Ou changer le port dans `.env` / `vite.config.js`

### Debugging

#### Backend

**Activer les logs détaillés**

```javascript
// app.js
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`)
  next()
})
```

**Utiliser Node.js Inspector**

```bash
cd backend
node --inspect app.js

# Ouvrir chrome://inspect dans Chrome
```

#### Frontend

**React DevTools**

- Installer l'extension Chrome/Firefox
- Inspecter les composants et leurs props/state

**Console logs stratégiques**

```javascript
useEffect(() => {
  console.log('[OnlineResume] userInfo:', userInfo)
  console.log('[OnlineResume] projects:', projects)
}, [userInfo, projects])
```

**Network tab**

- Vérifier les requêtes API
- Vérifier les headers (Authorization)
- Vérifier les réponses

### Réinitialisation complète

**Si tout est cassé**

```bash
# 1. Supprimer node_modules et package-lock
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install

# 2. Nettoyer la base de données
mongosh
use resume-db
db.dropDatabase()

# 3. Redémarrer les serveurs
cd backend
npm run dev

cd client
npm run dev
```

---

## Contact et support

### Documentation supplémentaire

- **RESPONSIVE.md** : Guide complet du responsive design
- **README.md** (backend) : Instructions backend
- **README.md** (client) : Instructions frontend

### Ressources utiles

**Technologies principales**

- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/)
- [Vite](https://vitejs.dev/)
- [i18next](https://www.i18next.com/)

**Accessibilité**

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Outils de test**

- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Audit performance/accessibilité)
- [axe DevTools](https://www.deque.com/axe/devtools/) (Audit accessibilité)

---

**Dernière mise à jour** : 10 décembre 2025
**Version** : 1.0.0
**Auteur** : DWFS
