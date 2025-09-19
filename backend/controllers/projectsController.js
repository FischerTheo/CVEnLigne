import { extractUserId } from '../utils/jwt.js'
import FormFR from '../models/FormFR.js'
import FormEN from '../models/FormEN.js'
import User from '../models/User.js'

const getUserId = extractUserId

export const getProjects = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const lang = (req.query.lang === 'en') ? 'en' : 'fr'
    const Model = lang === 'en' ? FormEN : FormFR
    const doc = await Model.findOne({ userId })
    res.json(doc ? (doc.projects || []) : [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const saveProjects = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const lang = (req.query.lang === 'en') ? 'en' : 'fr'
    const { projects: rawProjects = [] } = req.body || {}
    const projects = Array.isArray(rawProjects)
      ? rawProjects.map(({ title = '', description = '' }) => ({ title, description }))
      : []
    const Model = lang === 'en' ? FormEN : FormFR
    const updated = await Model.findOneAndUpdate(
      { userId },
      { $set: { projects, userId } },
      { upsert: true, new: true }
    )
    return res.json((updated && updated.projects) ? updated.projects : [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getAdminProjects = async (req, res) => {
  try {
    const adminUser = await User.findOne({ isAdmin: true })
    if (!adminUser) return res.status(404).json({ error: 'Admin user not found' })
    const lang = (req.query.lang === 'en') ? 'en' : 'fr'
    const Model = lang === 'en' ? FormEN : FormFR
    const doc = await Model.findOne({ userId: adminUser._id })
    return res.json(doc ? (doc.projects || []) : [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
