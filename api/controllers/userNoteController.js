import UserNote from '../models/UserNote.js'
import jwt from 'jsonwebtoken'

const getUserId = (req) => {
  const auth = req.headers.authorization
  if (!auth) return null
  try {
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.userId
  } catch {
    return null
  }
}

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