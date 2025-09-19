import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import pino from 'pino'
import authRoutes from './routes/auth.js'
import userNoteRoutes from './routes/userNote.js'
import uploadRoutes from './routes/upload.js'
import userInfoRoutes from './routes/userInfo.js'
import projectsRoutes from './routes/projects.js'
import translateRoutes from './routes/translate.js'


// Initialisation du logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()
app.use(cors())
app.use(express.json())


// Sécurité : vérifie la présence de la clé JWT
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined. Set it in backend/.env')
  process.exit(1)
}


// Connexion à la base MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => logger.info('Connexion à MongoDB réussie !'))
  .catch(err => logger.error(err))


// Déclaration des routes principales de l'API
app.use('/api/auth', authRoutes)
app.use('/api/usernote', userNoteRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/userinfo', userInfoRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/translate', translateRoutes)
app.use('/uploads', express.static('uploads'))


// Gestion globale des erreurs (log + réponse JSON)
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error')
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

// Démarrage du serveur sur le port défini
const PORT = process.env.PORT || 3000
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))