import mongoose from 'mongoose'

const userNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  note: { type: String, default: '' }
})

export default mongoose.model('UserNote', userNoteSchema, 'usernotes')