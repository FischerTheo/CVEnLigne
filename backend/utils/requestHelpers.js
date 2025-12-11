// Helpers pour réduire la duplication de code dans les contrôleurs

/**
 * Extrait et valide la langue depuis les query params
 * @param {Object} req - Express request object
 * @returns {string} 'fr' ou 'en'
 */
export function getLang(req) {
  return (req.query.lang === 'en') ? 'en' : 'fr'
}

/**
 * Vérifie que l'utilisateur est authentifié
 * Retourne l'userId ou envoie une réponse 401
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} getUserId - Fonction d'extraction de l'userId
 * @returns {string|null} userId ou null si non authentifié
 */
export function requireAuth(req, res, getUserId) {
  const userId = getUserId(req)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return userId
}

/**
 * Helper pour gérer les opérations CRUD avec gestion d'erreur commune
 * @param {Object} res - Express response object
 * @param {Function} operation - Fonction async à exécuter
 * @param {number} successStatus - Code HTTP de succès (default: 200)
 */
export async function handleOperation(res, operation, successStatus = 200) {
  try {
    const result = await operation()
    res.status(successStatus).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
