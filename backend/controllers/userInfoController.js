import User from '../models/User.js'
import FormFR from '../models/FormFR.js'
import FormEN from '../models/FormEN.js'
import { extractUserId } from '../utils/jwt.js'

const getUserId = extractUserId


// Récupère les infos utilisateur (profil, compétences, etc.)
export const getUserInfo = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    // Choix du modèle selon la langue
    const lang = (req.query.lang === 'en') ? 'en' : 'fr'
    const Model = lang === 'en' ? FormEN : FormFR
    // Renvoie le document utilisateur ou un objet vide
    const doc = await Model.findOne({ userId })
    res.json(doc || {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


// Met à jour les infos utilisateur (profil, compétences, etc.)
export const updateUserInfo = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const lang = (req.query.lang === 'en') ? 'en' : 'fr'
    const Model = lang === 'en' ? FormEN : FormFR
    const payload = req.body || {}
    // ici on retire les champs système pour éviter les erreurs Mongodb
    const { _id, userId: _ignoreUserId, lang: _ignoreLang, createdAt, updatedAt, __v, ...safePayload } = payload
    // On nettoie les tableaux pour ne garder que les propriétés utiles
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
      projects: sanitizeArray(safePayload.projects, ({ title = '', description = '' }) => ({ title, description })),
      cvPdfUrl: safePayload.cvPdfUrl || ''
    }
    // Met à jour ou crée le document utilisateur
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


// Récupère les infos de l'utilisateur admin pour ujn affichage public
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
