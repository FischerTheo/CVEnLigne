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

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()
app.use(cors())
app.use(express.json())

// Startup guard for critical env vars
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined. Set it in backend/.env')
  process.exit(1)
}

mongoose.connect(process.env.DATABASE_URL)
  .then(() => logger.info('Connexion a MongoDB reussie !'))
  .catch(err => logger.error(err))

app.use('/api/auth', authRoutes)
app.use('/api/usernote', userNoteRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/userinfo', userInfoRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/translate', translateRoutes)
app.use('/uploads', express.static('uploads')) // To serve uploaded files

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error')
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))