import User from '../models/User.js'
import FormFR from '../models/FormFR.js'
import FormEN from '../models/FormEN.js'
import { extractUserId } from '../utils/jwt.js'

const getUserId = extractUserId

export const getUserInfo = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const lang = (req.query.lang === 'en') ? 'en' : 'fr'
    const Model = lang === 'en' ? FormEN : FormFR
    const doc = await Model.findOne({ userId })
    res.json(doc || {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateUserInfo = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const lang = (req.query.lang === 'en') ? 'en' : 'fr'
    const Model = lang === 'en' ? FormEN : FormFR
    const payload = req.body || {}
    // Remove immutable/system fields to prevent errors like attempting to modify _id
    const { _id, userId: _ignoreUserId, lang: _ignoreLang, createdAt, updatedAt, __v, ...safePayload } = payload
    // sanitize arrays to strip any stray ids/extra props
    const sanitizeArray = (arr, mapper) => Array.isArray(arr) ? arr.map(mapper) : []
    const sanitized = {
      ...safePayload,
      languages: sanitizeArray(safePayload.languages, ({ language = '', level = '' }) => ({ language, level })),
      skills: sanitizeArray(safePayload.skills, ({ skill = '', level = '' }) => ({ skill, level })),
      softSkills: sanitizeArray(safePayload.softSkills, ({ skill = '' }) => ({ skill })),
      experiences: sanitizeArray(safePayload.experiences, ({ jobTitle = '', company = '', location = '', startDate = '', endDate = '', responsibilities = '' }) => ({ jobTitle, company, location, startDate, endDate, responsibilities })),
      certifications: sanitizeArray(safePayload.certifications, ({ certName = '', certOrg = '', certDate = '', certDesc = '', pdfUrl = '' }) => ({ certName, certOrg, certDate, certDesc, pdfUrl })),
      references: sanitizeArray(safePayload.references, (item) => (typeof item === 'object' && item !== null && 'text' in item) ? ({ text: item.text || '' }) : ({ text: String(item || '') })),
      hobbies: Array.isArray(safePayload.hobbies) ? safePayload.hobbies.map(h => String(h || '')) : [],
      cvPdfUrl: safePayload.cvPdfUrl || ''
    }
    const updated = await Model.findOneAndUpdate(
      { userId },
      { $set: { ...sanitized, userId } },
      { upsert: true, new: true }
    )
    return res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getAdminUserInfo = async (req, res) => {
  try {
    const adminUser = await User.findOne({ isAdmin: true })
    if (!adminUser) return res.status(404).json({ error: 'Admin user not found' })
    const lang = (req.query.lang === 'en') ? 'en' : 'fr'
    const Model = lang === 'en' ? FormEN : FormFR
    const doc = await Model.findOne({ userId: adminUser._id })
    res.json(doc || {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
