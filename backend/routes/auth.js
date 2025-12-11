// Routes d'authentification (inscription et connexion)
import express from 'express'
import { register, login, changePassword, logout, transferAdmin, deleteAccount } from '../controllers/authController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validation.js'
import { registerSchema, loginSchema, changePasswordSchema } from '../utils/validation.js'

const router = express.Router()

// Inscription utilisateur (avec validation)
router.post('/register', validate(registerSchema), register)
// Connexion utilisateur (avec validation)
router.post('/login', validate(loginSchema), login)
// Changer le mot de passe (authentification requise + validation)
router.put('/change-password', authenticate, validate(changePasswordSchema), changePassword)
// Déconnexion (authentification requise)
router.post('/logout', authenticate, logout)
// Transférer les droits admin (authentification requise)
router.post('/transfer-admin', authenticate, transferAdmin)
// Supprimer le compte et toute la base de données (authentification requise)
router.delete('/delete-account', authenticate, deleteAccount)

export default router