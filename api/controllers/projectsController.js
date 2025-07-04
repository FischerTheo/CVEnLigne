import ProjectFr from '../models/ProjectFr.js'
import ProjectEn from '../models/ProjectEn.js'
import { translateText } from '../utils/translate.js'
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

export const getProjects = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const lang = req.query.lang
  let projects
  if (lang === 'en') {
    projects = await ProjectEn.find({ user: userId })
  } else {
    projects = await ProjectFr.find({ user: userId })
  }
  res.json(projects)
}

export const saveProjects = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const { projects } = req.body
  const lang = req.query.lang

  if (lang === 'en') {
    // Save directly to English
    await ProjectEn.deleteMany({ user: userId })
    await ProjectEn.insertMany(projects.map(p => ({ ...p, user: userId })))
    return res.json({ message: 'Saved in English collection only' })
  } else {
    // Save French and translate to English
    await ProjectFr.deleteMany({ user: userId })
    await ProjectFr.insertMany(projects.map(p => ({ ...p, user: userId })))
    // Translate and save to English
    const translated = await Promise.all(projects.map(async p => ({
      user: userId,
      title: await translateText(p.title, 'fr', 'en'),
      description: await translateText(p.description, 'fr', 'en')
    })))
    await ProjectEn.deleteMany({ user: userId })
    await ProjectEn.insertMany(translated)
    return res.json({ message: 'Saved in both collections' })
  }
}