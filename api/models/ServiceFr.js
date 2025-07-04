import mongoose from 'mongoose'
const serviceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String
})
export default mongoose.model('ServiceFr', serviceSchema, 'services_fr')