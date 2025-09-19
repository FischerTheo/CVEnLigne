import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false }
})

// Prevent more than one admin user
userSchema.pre('save', async function (next) {
  if (this.isAdmin) {
    // Use mongoose.models to avoid model overwrite error
    const User = mongoose.models.User || mongoose.model('User', userSchema)
    const adminExists = await User.findOne({ isAdmin: true, _id: { $ne: this._id } })
    if (adminExists) {
      const err = new Error('An admin user already exists.')
      err.status = 400
      return next(err)
    }
  }
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)