import UserNote from '../models/UserNote.js'
import { extractUserId } from '../utils/jwt.js'

const getUserId = extractUserId

export const getNote = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const note = await UserNote.findOne({ user: userId })
  res.json(note)
}

export const saveNote = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const { note } = req.body
  const updated = await UserNote.findOneAndUpdate(
    { user: userId },
    { note, user: userId },
    { upsert: true, new: true }
  )
  res.json(updated)
}