// Modélisation du schéma du CV français avec Mongoose
import mongoose from 'mongoose'

// Niveau de langue
const LanguageLevelSchema = new mongoose.Schema({
  language: { type: String, default: '' },
  level: { type: String, default: '' }
}, { _id: false })

// Compétence technique
const SkillSchema = new mongoose.Schema({
  skill: { type: String, default: '' },
  level: { type: String, default: '' }
}, { _id: false })

// Compétence comportementale
const SoftSkillSchema = new mongoose.Schema({
  skill: { type: String, default: '' }
}, { _id: false })

// Expérience professionnelle
const ExperienceSchema = new mongoose.Schema({
  jobTitle: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  responsibilities: { type: String, default: '' }
}, { _id: false })

// Certification ou diplôme
const CertificationSchema = new mongoose.Schema({
  certName: { type: String, default: '' },
  certOrg: { type: String, default: '' },
  certDate: { type: String, default: '' },
  certDesc: { type: String, default: '' },
  pdfUrl: { type: String, default: '' }
}, { _id: false })

// Référence
const ReferenceSchema = new mongoose.Schema({
  text: { type: String, default: '' }
}, { _id: false })

// Projet réalisé
const ProjectItemSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false })

// Schéma principal du formulaire CV (FR)
const FormFRSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Utilisateur lié

  // Infos personnelles
  fullName: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  ville: { type: String, default: '' },

  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },

  summary: { type: String, default: '' },
  objective: { type: String, default: '' },

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

// Un seul CV FR par utilisateur
FormFRSchema.index({ userId: 1 }, { unique: true })

// Export du modèle
export default mongoose.model('FormFR', FormFRSchema)
