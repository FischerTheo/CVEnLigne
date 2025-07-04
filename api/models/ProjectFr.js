import mongoose from 'mongoose'
const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String
})
export default mongoose.model('ProjectFr', projectSchema, 'projects_fr')