import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import pino from 'pino'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import authRoutes from './routes/auth.js'
import userNoteRoutes from './routes/userNote.js'
import uploadRoutes from './routes/upload.js'
import userInfoRoutes from './routes/userInfo.js'
import projectsRoutes from './routes/projects.js'
import translateRoutes from './routes/translate.js'


// Initialisation du logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()

//  middlewares pour la sécurité

// Helmet -pour sécuriser les headers HTTP
// En développement,CSP désactivé pour éviter les blocages
// En production, CSP stricte
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false, // Désactivé en dev
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS - Restreint aux origines autorisées
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://resume-frontend-it83.onrender.com',
      process.env.CLIENT_URL,
    ].filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

const corsOptions = {
  origin: (origin, callback) => {
    // Autorise les requêtes sans origin (comme les apps mobiles ou curl)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.warn({ origin, allowedOrigins }, 'CORS: Origine non autorisée')
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Rate Limiting - Protecction contre les attaques par force brute
// Limite globale pour la production uniquement
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requêtes par IP en production
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
})

// Limite stricte pour l'authentification (TOUJOURS active, dev + prod)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 5 tentatives de connexion (strict pour sécurité)
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
})

// 4. Protection contre les injections NoSQL
app.use(mongoSanitize())

// 5. Parse JSON
app.use(express.json())

// 6. Applique le rate limiting
// Rate limiting UNIQUEMENT sur les routes d'authentification (toujours actif)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Rate limiting global désactivé même en production pour ne pas limiter l'admin
// Les routes sensibles (auth) restent protégées par authLimiter ci-dessus
logger.info('Rate limiting: Auth routes protégées, routes admin sans limite')


// Sécurité : vérifie la présence de la clé JWT
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined.')
  process.exit(1)
}


// Connexion à la base MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => logger.info('Connexion a MongoDB reussie !'))
  .catch(err => logger.error(err))


// Déclaration des routes principales de l'API
app.use('/api/auth', authRoutes)
app.use('/api/usernote', userNoteRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/userinfo', userInfoRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/translate', translateRoutes)
// Servir les fichiers uploadés path.resolve pour les chemins relatif
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


// Gestion globale des erreurs
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error')
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

// Démarrage du serveur sur le port défini
const PORT = process.env.PORT || 3000
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))