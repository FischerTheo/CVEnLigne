import { verifyToken } from '../utils/jwt.js'
import { getTokenFromCookie } from '../utils/cookieUtils.js'
import User from '../models/User.js'

export async function authenticate(req, res, next) {
  try {
    // Priorité 1: Récupérer le token depuis le cookie HttpOnly
    let token = getTokenFromCookie(req)
    
    // Priorité 2: Fallback sur l'Authorization header (pour rétrocompatibilité)
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader) {
        const [scheme, headerToken] = authHeader.split(' ')
        if (scheme === 'Bearer' && headerToken) {
          token = headerToken
        }
      }
    }

    // Aucun token trouvé (ni cookie ni header)
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' })
    }

    // Vérifier la validité du token
    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // NOUVEAU: Vérifier que l'utilisateur existe toujours en base
    const user = await User.findById(decoded.userId).select('_id isAdmin')
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' })
    }

    req.userId = decoded.userId
    req.isAdmin = user.isAdmin // Bonus: disponible dans les routes
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' })
  }
}
