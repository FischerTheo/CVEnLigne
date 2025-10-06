import User from '../models/User.js'
import { signToken } from '../utils/jwt.js'
import pino from 'pino'

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })


// Inscription d'un nouvel utilisateur
export const register = async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body
    const clientIp = req.ip || req.connection.remoteAddress
    
    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      logger.warn({
        event: 'register_invalid_password',
        email: email,
        ip: clientIp
      }, 'Tentative d\'inscription avec mot de passe invalide')
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre' 
      })
    }
    
    // Création de l'utilisateur avec les infos reçues
    const user = new User({ 
      username, 
      email: email || username, // Si email non fourni, utilise le username
      password,
      isAdmin: isAdmin || false
    })
    await user.save()

    // Log de sécurité : inscription réussie
    logger.info({
      event: 'register_success',
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      ip: clientIp,
      timestamp: new Date().toISOString()
    }, 'Nouvel utilisateur inscrit')

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
    logger.error({ 
      err, 
      event: 'register_error',
      email: req.body.email 
    }, 'Erreur lors de l\'inscription')
    res.status(400).json({ message: err.message })
  }
}


// Connexion utilisateur
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const clientIp = req.ip || req.connection.remoteAddress
    
    // Recherche l'utilisateur par email
    const user = await User.findOne({ email })
    
    // Vérifie le mot de passe
    if (!user || !(await user.comparePassword(password))) {
      // Log de sécurité : tentative de connexion échouée
      logger.warn({
        event: 'login_failed',
        email: email,
        ip: clientIp,
        timestamp: new Date().toISOString()
      }, 'Tentative de connexion échouée')
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Log de sécurité : connexion réussie
    logger.info({
      event: 'login_success',
      userId: user._id,
      email: user.email,
      ip: clientIp,
      timestamp: new Date().toISOString()
    }, 'Connexion réussie')
    
    // Génère le token JWT et calcule l'expiration
    const token = signToken({ userId: user._id })
    const expiresAt = Date.now() + 3600 * 1000
    res.json({ token, isAdmin: user.isAdmin, expiresAt })
  } catch (err) {
    logger.error({ err, event: 'login_error' }, 'Erreur lors de la connexion')
    res.status(400).json({ error: err.message })
  }
}