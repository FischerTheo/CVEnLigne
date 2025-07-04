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

export default router