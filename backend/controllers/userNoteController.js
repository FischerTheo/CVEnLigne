import UserNote from '../models/UserNote.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Récupère le bloc note (req.userId est fourni par le middleware authenticate)
export const getNote = asyncHandler(async (req, res) => {
  const note = await UserNote.findOne({ user: req.userId })
  res.json(note)
})

// Sauvegarde ou met à jour le bloc note (req.userId est fourni par le middleware authenticate)
export const saveNote = asyncHandler(async (req, res) => {
  const { note } = req.body
  const updated = await UserNote.findOneAndUpdate(
    { user: req.userId },
    { note, user: req.userId },
    { upsert: true, new: true }
  )
  res.json(updated)
})