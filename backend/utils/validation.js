import { z } from 'zod'

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  isAdmin: z.boolean().optional()
})

// Schéma de validation pour le login
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

// Schéma pour l'upload de fichier
export const uploadQuerySchema = z.object({
  path: z.string().min(1, 'Path is required')
})

// Schéma pour la traduction
export const translateSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  source: z.string().length(2).optional().default('fr'),
  target: z.string().length(2).optional().default('en')
})

// Schéma pour les langues
export const languageSchema = z.object({
  language: z.string().default(''),
  level: z.string().default('')
})

// Schéma pour les compétences techniques
export const skillSchema = z.object({
  skill: z.string().default(''),
  level: z.string().default('')
})

// Schéma pour les soft skills
export const softSkillSchema = z.object({
  skill: z.string().default('')
})

// Schéma pour les expériences
export const experienceSchema = z.object({
  jobTitle: z.string().default(''),
  company: z.string().default(''),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  responsibilities: z.string().default('')
})

// Schéma pour les certifications
export const certificationSchema = z.object({
  certName: z.string().default(''),
  certOrg: z.string().default(''),
  certDate: z.string().default(''),
  certDesc: z.string().default(''),
  pdfUrl: z.string().default('')
})

// Schéma pour les références
export const referenceSchema = z.object({
  text: z.string().default('')
})

// Schéma pour les projets
export const projectSchema = z.object({
  title: z.string().default(''),
  description: z.string().default('')
})

// Schéma pour le formulaire complet
export const formSchema = z.object({
  fullName: z.string().default(''),
  dateOfBirth: z.string().default(''),
  jobTitle: z.string().default(''),
  ville: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  linkedin: z.string().default(''),
  github: z.string().default(''),
  summary: z.string().default(''),
  objective: z.string().default(''),
  languages: z.array(languageSchema).default([]),
  skills: z.array(skillSchema).default([]),
  softSkills: z.array(softSkillSchema).default([]),
  experiences: z.array(experienceSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  references: z.array(referenceSchema).default([]),
  hobbies: z.array(z.string()).default([]),
  cvPdfUrl: z.string().default(''),
  projects: z.array(projectSchema).default([])
})

// Schéma pour sauvegarder les projets
export const saveProjectsSchema = z.object({
  projects: z.array(projectSchema)
})

// Schéma pour query language (userInfo)
export const languageQuerySchema = z.object({
  lang: z.enum(['fr', 'en']).optional().default('fr')
})

// Schéma pour la note utilisateur
export const userNoteSchema = z.object({
  note: z.string().max(10000, 'Note too long (max 10000 characters)').optional().default('')
})

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/\d/, 'New password must contain at least one number')
})

