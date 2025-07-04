import ServiceFr from '../models/ServiceFr.js'
import ServiceEn from '../models/ServiceEn.js'
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

export const getServices = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const lang = req.query.lang
  let services
  if (lang === 'en') {
    services = await ServiceEn.find({ user: userId })
  } else {
    services = await ServiceFr.find({ user: userId })
  }
  res.json(services)
}

export const saveServices = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const { services } = req.body
  const lang = req.query.lang

  if (lang === 'en') {
    // Save directly to English
    await ServiceEn.deleteMany({ user: userId })
    await ServiceEn.insertMany(services.map(s => ({ ...s, user: userId })))
    return res.json({ message: 'Saved in English collection only' })
  } else {
    // Save French and translate to English
    await ServiceFr.deleteMany({ user: userId })
    await ServiceFr.insertMany(services.map(s => ({ ...s, user: userId })))
    // Translate and save to English
    const translated = await Promise.all(services.map(async s => ({
      user: userId,
      title: await translateText(s.title, 'fr', 'en'),
      description: await translateText(s.description, 'fr', 'en')
    })))
    await ServiceEn.deleteMany({ user: userId })
    await ServiceEn.insertMany(translated)
    return res.json({ message: 'Saved in both collections' })
  }
}