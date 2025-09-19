import jwt from 'jsonwebtoken'

export const isJwtConfigured = Boolean(process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || ''
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

export function signToken(payload, options = {}) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured')
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options })
}

export function verifyToken(token) {
  if (!JWT_SECRET) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

export function extractUserId(req) {
  const auth = req.headers.authorization
  if (!auth) return null
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  const decoded = verifyToken(parts[1])
  return decoded ? decoded.userId : null
}
