import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userInfoRoutes from './routes/userInfo.js'
import userNoteRoutes from './routes/userNote.js'
import servicesRoutes from './routes/services.js'
import projectsRoutes from './routes/projects.js'
import uploadRoutes from './routes/upload.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err))

app.use('/api/auth', authRoutes)
app.use('/api/userinfo', userInfoRoutes)
app.use('/api/usernote', userNoteRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/uploads', express.static('uploads')) // To serve uploaded files

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))