import mongoose from 'mongoose'

// Schéma : un blocc note liée à un utilisateur
const userNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  note: { type: String, default: '' }
})

// Export du modèle note utilisateur
export default mongoose.model('UserNote', userNoteSchema, 'usernotes')