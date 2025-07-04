import mongoose from 'mongoose'

const userInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Non-repeatable fields
  fullName: String,
  dateOfBirth: String,
  jobTitle: String,
  ville: String,
  email: String,
  phone: String,
  linkedin: String,
  github: String, // <-- ADD THIS LINE
  summary: String,
  objective: String,

  // Repeatable fields
  languages: [
    {
      language: String,
      level: String
    }
  ],
  skills: [
    {
      skill: String,
      level: String
    }
  ],
  softSkills: [
    {
      skill: String
    }
  ],
  experiences: [
    {
      jobTitle: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      responsibilities: String
    }
  ],
  certifications: [
    {
      certName: String,
      certOrg: String,
      certDate: String,
      certDesc: String,
      pdfUrl: String // Only one PDF per certification
    }
  ],
  references: [
    {
      text: String
    }
  ],
  hobbies: [String]
})

export default userInfoSchema