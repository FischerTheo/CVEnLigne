// Route pour l'upload et la suppression de fichiers PDF
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Dossier de stockage des PDF
const uploadFolder = path.resolve('uploads/pdfs')
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true })

// Configuration du stockage et du nom de fichier
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})

// Autorise uniquement les fichiers PDF
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Seuls les fichiers PDF sont acceptés !'))
  }
})

// Upload d'un fichier PDF
router.post('/pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoyé' })
  // Le path doit correspondre à la route statique /uploads qui sert le dossier uploads/
  res.json({ filename: req.file.filename, path: `/uploads/pdfs/${req.file.filename}` })
})

// Suppression d'un PDF via son chemin (?path=/uploads/pdfs/nom.pdf)
router.delete('/pdf', (req, res) => {
  const relPath = req.query.path
  if (!relPath || typeof relPath !== 'string') {
    return res.status(400).json({ error: 'Paramètre path manquant' })
  }
  // Sécurise le chemin et vérifie le dossier
  try {
    const fullPath = path.resolve(relPath.startsWith('/') ? relPath.slice(1) : relPath)
    if (!fullPath.startsWith(path.resolve('uploads/pdfs'))) {
      return res.status(400).json({ error: 'Chemin invalide' })
    }
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

export default router