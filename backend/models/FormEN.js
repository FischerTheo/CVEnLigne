import mongoose from 'mongoose'


// Sous-schema pour les langues et leur niveau
const LanguageLevelSchema = new mongoose.Schema({
  language: { type: String, default: '' },
  level: { type: String, default: '' }
}, { _id: false })


// Sous-schema pour les compétences techniques
const SkillSchema = new mongoose.Schema({
  skill: { type: String, default: '' },
  level: { type: String, default: '' }
}, { _id: false })


// Sous-schema pour les soft skills
const SoftSkillSchema = new mongoose.Schema({
  skill: { type: String, default: '' }
}, { _id: false })


// Sous-schema pour les expériences professionnelles
const ExperienceSchema = new mongoose.Schema({
  jobTitle: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  responsibilities: { type: String, default: '' }
}, { _id: false })


// Sous-schema pour les certifications avec PDF associé
const CertificationSchema = new mongoose.Schema({
  certName: { type: String, default: '' },
  certOrg: { type: String, default: '' },
  certDate: { type: String, default: '' },
  certDesc: { type: String, default: '' },
  pdfUrl: { type: String, default: '' }
}, { _id: false })


// Sous-schema pour les références
const ReferenceSchema = new mongoose.Schema({
  text: { type: String, default: '' }
}, { _id: false })


// Sous-schema pour les projets
const ProjectItemSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false })


// Schéma principal du formulaire utilisateur 
const FormENSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Infos personnelles
  fullName: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  ville: { type: String, default: '' },

  // CCoordonnées
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },

  // Résumé et objectif
  summary: { type: String, default: '' },
  objective: { type: String, default: '' },

  // Tableaux de compétences, expériences, etc.
  languages: { type: [LanguageLevelSchema], default: [] },
  skills: { type: [SkillSchema], default: [] },
  softSkills: { type: [SoftSkillSchema], default: [] },
  experiences: { type: [ExperienceSchema], default: [] },
  certifications: { type: [CertificationSchema], default: [] },
  references: { type: [ReferenceSchema], default: [] },
  hobbies: { type: [String], default: [] },
  cvPdfUrl: { type: String, default: '' },

  // Projets
  projects: { type: [ProjectItemSchema], default: [] }
}, { timestamps: true })


// Un seul formulaire par utilisateur
FormENSchema.index({ userId: 1 }, { unique: true })

export default mongoose.model('FormEN', FormENSchema)
