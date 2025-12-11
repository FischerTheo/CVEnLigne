import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Schéma principal utilisateur
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Nom d'utilisateur
  password: { type: String, required: true },               // Mot de passe (hashé)
  email: { type: String, required: true, unique: true },    // Email
  isAdmin: { type: Boolean, default: false }                // Administrateur
})

// Avant sauvegarde : hash du mot de passe et vérification admin unique
userSchema.pre('save', async function (next) {
  if (this.isAdmin) {
    const User = mongoose.models.User || mongoose.model('User', userSchema)
    const adminExists = await User.findOne({ isAdmin: true, _id: { $ne: this._id } })
    if (adminExists) {
      const err = new Error('Un administrateur existe déjà.')
      err.status = 400
      return next(err)
    }
  }
  if (!this.isModified('password')) return next()
  // Utilise 12 rounds pour sécurité renforcée (recommandation 2025)
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Vérifie le mot de passe
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)