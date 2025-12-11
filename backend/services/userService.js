// Service layer pour la gestion des utilisateurs
import User from '../models/User.js'
import { signToken, signRefreshToken } from '../utils/jwt.js'

export class UserService {
  // Crée un nouvel utilisateur
  async createUser({ username, email, password, isAdmin = false }) {
    const user = new User({
      username,
      email: email || username,
      password,
      isAdmin
    })
    await user.save()
    return user
  }

  // Trouve un utilisateur par email
  async findByEmail(email) {
    return await User.findOne({ email })
  }

  // Trouve un utilisateur par ID
  async findById(userId) {
    return await User.findById(userId)
  }

  // Trouve l'utilisateur admin
  async findAdmin() {
    return await User.findOne({ isAdmin: true })
  }

  // Vérifie le mot de passe
  async verifyPassword(user, password) {
    return await user.comparePassword(password)
  }

  // Met à jour le mot de passe
  async updatePassword(user, newPassword) {
    user.password = newPassword
    await user.save()
    return user
  }

  // Génère les tokens d'authentification
  generateAuthTokens(userId) {
    const token = signToken({ userId })
    const refreshToken = signRefreshToken({ userId })
    const expiresAt = Date.now() + 3600 * 1000
    return { token, refreshToken, expiresAt }
  }
}

export default new UserService()
