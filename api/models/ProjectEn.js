import mongoose from 'mongoose'
import { translateText } from '../utils/translate.js'

// Correct schema fields to match usage in controllers
const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String
})

// Async function to translate user info
export async function translateUserInfo(formFr) {
  // Translate simple fields
  const summary = formFr.summary ? await translateText(formFr.summary, 'fr', 'en') : ''
  const objective = formFr.objective ? await translateText(formFr.objective, 'fr', 'en') : ''
  return { summary, objective }
}

export default mongoose.model('ProjectEn', projectSchema, 'projects_en')