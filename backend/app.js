import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pino from 'pino'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import userNoteRoutes from './routes/userNote.js'
import uploadRoutes from './routes/upload.js'
import userInfoRoutes from './routes/userInfo.js'
import projectsRoutes from './routes/projects.js'
import translateRoutes from './routes/translate.js'

// Configuration pour ESM (équivalent de __dirname en CommonJS)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialisation du logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()

// Configuration pour faire confiance aux proxies (requis pour Render, Heroku, etc.)
// Permet à Express de récupérer la vraie IP du client depuis les headers X-Forwarded-*
app.set('trust proxy', true)

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

// CORS - Restreint aux origines autorisées (strict en dev ET prod)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://resume-frontend-it83.onrender.com',
      process.env.CLIENT_URL,
    ].filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

const corsOptions = {
  origin: (origin, callback) => {
    // Autorise les requêtes sans origin (health checks, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true)
    }
    
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

// Rate Limiting - Protection contre les attaques par force brute
// Limite globale stricte
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 1000, // Max 1000 requêtes par IP par heure
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false,
})

// Limite stricte pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 tentatives de connexion
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
})

// Limite pour les uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // Max 20 uploads par heure
  message: 'Trop d\'uploads, réessayez dans 1 heure',
  standardHeaders: true,
  legacyHeaders: false,
})

// 4. Protection contre les injections NoSQL
app.use(mongoSanitize())

// 5. Parse JSON et cookies
app.use(express.json())
app.use(cookieParser())

// 6. Applique le rate limiting
// Rate limiting global
app.use('/api/', limiter)

// Rate limiting spécifique auth
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Rate limiting upload
app.use('/api/upload', uploadLimiter)

logger.info('Rate limiting: 1000 req/h global, 5 auth/15min, 20 uploads/h')


// Sécurité : validation des variables d'environnement requises au démarrage
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']
const optionalEnvVars = ['DEEPL_API_KEY', 'CLIENT_URL', 'PORT']

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.fatal(`Missing required environment variable: ${envVar}`)
    process.exit(1)
  }
}

// Log des variables optionnelles manquantes (warning seulement)
for (const envVar of optionalEnvVars) {
  if (!process.env[envVar]) {
    logger.warn(`Optional environment variable not set: ${envVar}`)
  }
}

logger.info('Environment variables validated successfully')

// Force HTTPS en production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.status(403).json({ error: 'HTTPS required' })
    }
    next()
  })
  logger.info('HTTPS enforcement enabled in production')
}


// Connexion à la base MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => logger.info('Connexion a MongoDB reussie !'))
  .catch(err => logger.error(err))


// Healthcheck endpoint - Vérifie l'état de l'API et la connexion DB
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  const health = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  }
  
  const statusCode = dbStatus === 'connected' ? 200 : 503
  res.status(statusCode).json(health)
})


// Déclaration des routes principales de l'API
app.use('/api/auth', authRoutes)
app.use('/api/usernote', userNoteRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/userinfo', userInfoRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/translate', translateRoutes)

// Servir les fichiers uploadés (PDFs, images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


// Gestion globale des erreurs
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error')
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

// Démarrage du serveur sur le port défini
const PORT = process.env.PORT || 3000
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))