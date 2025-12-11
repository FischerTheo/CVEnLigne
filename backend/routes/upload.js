// Route pour l'upload et la suppression de fichiers PDF
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticate } from '../middleware/authMiddleware.js'
import { validateQuery } from '../middleware/validation.js'
import { uploadQuerySchema } from '../utils/validation.js'
import { validatePdfMagicBytes } from '../utils/fileValidator.js'

const router = express.Router()

// Dossier de stockage des PDF
const uploadFolder = path.resolve('uploads/pdfs')
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true })

// Configuration du stockage et du nom de fichier
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    // Sanitize filename pour éviter path traversal
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, Date.now() + '-' + safeName)
  }
})

// Autorise uniquement les fichiers PDF avec limite de taille
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Seuls les fichiers PDF sont acceptés !'))
  }
})

// Upload d'un fichier PDF (PROTÉGÉ PAR AUTH + VALIDATION MAGIC BYTES)
router.post('/pdf', authenticate, upload.single('pdf'), validatePdfMagicBytes, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoyé' })
  // Le path doit correspondre à la route statique /uploads qui sert le dossier uploads/
  res.json({ filename: req.file.filename, path: `/uploads/pdfs/${req.file.filename}` })
})

// Suppression d'un PDF via son chemin (?path=/uploads/pdfs/x.pdf) (PROTÉGÉ PAR AUTH + VALIDATION)
router.delete('/pdf', authenticate, validateQuery(uploadQuerySchema), (req, res) => {
  const relPath = req.query.path
  // Sécurise le chemin et vérifie le dossier
  try {
    // Protection path traversal renforcée
    const normalized = path.normalize(relPath).replace(/^(\.\.[/\\])+/, '')
    const fullPath = path.resolve(normalized.startsWith('/') ? normalized.slice(1) : normalized)
    const uploadDir = path.resolve('uploads/pdfs')
    
    // Vérifie que le chemin résolu est bien dans uploads/pdfs
    if (!fullPath.startsWith(uploadDir + path.sep) && fullPath !== uploadDir) {
      return res.status(400).json({ error: 'Chemin invalide' })
    }
    
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

export default router