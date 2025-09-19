import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Set storage destination and filename
const uploadFolder = path.resolve('uploads/pdfs')
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed!'))
  }
})

router.post('/pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ filename: req.file.filename, path: `/uploads/pdfs/${req.file.filename}` })
})

// Delete a PDF file by path query (?path=/uploads/pdfs/filename.pdf)
router.delete('/pdf', (req, res) => {
  const relPath = req.query.path
  if (!relPath || typeof relPath !== 'string') {
    return res.status(400).json({ error: 'Missing path query parameter' })
  }
  // Normalize and ensure it's within the uploads/pdfs directory
  try {
    const fullPath = path.resolve(relPath.startsWith('/') ? relPath.slice(1) : relPath)
    if (!fullPath.startsWith(path.resolve('uploads/pdfs'))) {
      return res.status(400).json({ error: 'Invalid path' })
    }
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

export default router