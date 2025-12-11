// Utilitaire JWT pour l'authentification
import jwt from 'jsonwebtoken'

// Vérifie si la clé secrète JWT est présente
export const isJwtConfigured = Boolean(process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || '' // Clé secrète
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h' // Durée de validité access token
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d' // Durée refresh token

// Génère un access token JWT à partir d'un payload
export function signToken(payload, options = {}) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured')
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options })
}

// Génère un refresh token JWT
export function signRefreshToken(payload, options = {}) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured')
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN, ...options })
}

// Vérifie et décode un token JWT
export function verifyToken(token) {
  if (!JWT_SECRET) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

// Extrait l'ID utilisateur depuis le header Authorization
export function extractUserId(req) {
  const auth = req.headers.authorization
  if (!auth) return null
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  const decoded = verifyToken(parts[1])
  return decoded ? decoded.userId : null
}

// Extrait l'ID utilisateur depuis le cookie HttpOnly
export function extractUserIdFromCookie(req) {
  const token = req.cookies?.authToken
  if (!token) return null
  const decoded = verifyToken(token)
  return decoded ? decoded.userId : null
}
