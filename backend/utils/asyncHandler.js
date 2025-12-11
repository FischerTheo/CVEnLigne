/**
 * Wrapper pour gérer automatiquement les erreurs asynchrones dans Express
 * Élimine le besoin de try/catch dans chaque contrôleur
 * @param {Function} fn - Fonction async du contrôleur
 * @returns {Function} Middleware Express avec gestion d'erreur automatique
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
