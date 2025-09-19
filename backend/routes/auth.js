// Routes d'authentification (inscription et connexion)
import express from 'express'
import { register, login } from '../controllers/authController.js'
const router = express.Router()

// Inscription utilisateur
router.post('/register', register)
// Connexion utilisateur
router.post('/login', login)

export default router