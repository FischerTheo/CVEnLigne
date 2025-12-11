// Service layer pour la gestion des formulaires (FR/EN)
import FormFR from '../models/FormFR.js'
import FormEN from '../models/FormEN.js'
import { cleanupFormPdfs } from '../utils/fileCleanup.js'

export class FormService {
  // Récupère le bon modèle selon la langue
  getModel(lang) {
    return lang === 'en' ? FormEN : FormFR
  }

  // Récupère le formulaire d'un utilisateur
  async getForm(userId, lang = 'fr') {
    const Model = this.getModel(lang)
    return await Model.findOne({ userId })
  }

  // Met à jour ou crée un formulaire
  async updateForm(userId, data, lang = 'fr') {
    const Model = this.getModel(lang)
    
    // Récupère l'ancien formulaire pour nettoyer les PDFs obsolètes
    const oldForm = await Model.findOne({ userId })
    
    // Met à jour le formulaire
    const updatedForm = await Model.findOneAndUpdate(
      { userId },
      { $set: { ...data, userId } },
      { upsert: true, new: true }
    )
    
    // Nettoie les anciens PDFs qui ne sont plus utilisés
    if (oldForm) {
      await cleanupFormPdfs(oldForm, updatedForm)
    }
    
    return updatedForm
  }

  // Sanitize les données du formulaire
  sanitizeFormData(payload) {
    const { _id, userId: _ignoreUserId, lang: _ignoreLang, createdAt, updatedAt, __v, ...safePayload } = payload

    const sanitizeArray = (arr, mapper) => Array.isArray(arr) ? arr.map(mapper) : []

    return {
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
  }

  // Récupère les projets d'un utilisateur
  async getProjects(userId, lang = 'fr') {
    const doc = await this.getForm(userId, lang)
    return doc ? (doc.projects || []) : []
  }

  // Met à jour les projets d'un utilisateur
  async updateProjects(userId, projects, lang = 'fr') {
    const sanitizedProjects = Array.isArray(projects)
      ? projects.map(({ title = '', description = '' }) => ({ title, description }))
      : []

    const Model = this.getModel(lang)
    const updated = await Model.findOneAndUpdate(
      { userId },
      { $set: { projects: sanitizedProjects, userId } },
      { upsert: true, new: true }
    )
    return updated ? (updated.projects || []) : []
  }
}

export default new FormService()
