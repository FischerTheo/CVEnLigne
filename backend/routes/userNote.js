// Routes pour la note utilisateur
import express from 'express'
import { getNote, saveNote } from '../controllers/userNoteController.js'
import { validate } from '../middleware/validation.js'
import { userNoteSchema } from '../utils/validation.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Récupérer la note (protégé par authenticate)
router.get('/', authenticate, getNote)
// Sauvegarder la note (protégé par authenticate)
router.post('/', authenticate, validate(userNoteSchema), saveNote)

export default router