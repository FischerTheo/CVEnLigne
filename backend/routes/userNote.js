// Routes pour la note utilisateur
import express from 'express'
import { getNote, saveNote } from '../controllers/userNoteController.js'
const router = express.Router()

// Récupérer la note
router.get('/', getNote)
// Sauvegarder la note
router.post('/', saveNote)

export default router