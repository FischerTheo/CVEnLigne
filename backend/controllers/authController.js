import User from '../models/User.js'
import { signToken } from '../utils/jwt.js'


// Inscription d'un nouvel utilisateur
export const register = async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body
    // Création de l'utilisateur avec les infos reçues
    const user = new User({ 
      username, 
      email: email || username, // Si email non fourni, utilise le username
      password,
      isAdmin: isAdmin || false
    })
    await user.save()

    // Génère un token JWT pour auto-login après inscription
    const token = signToken({ userId: user._id })
    // Expiration du token dans 1h
    const expiresAt = Date.now() + 3600 * 1000
    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      isAdmin: user.isAdmin,
      expiresAt
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}


// Connexion utilisateur
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    // Recherche l'utilisateur par email
    const user = await User.findOne({ email })
    // Vérifie le mot de passe
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    // Génère le token JWT et calcule l'expiration
    const token = signToken({ userId: user._id })
    const expiresAt = Date.now() + 3600 * 1000
    res.json({ token, isAdmin: user.isAdmin, expiresAt })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}