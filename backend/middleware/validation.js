// Middleware de validation Zod pour les routes Express

export function validate(schema) {
  return async (req, res, next) => {
    try {
      // Valide le body de la requête
      const validated = await schema.parseAsync(req.body)
      req.body = validated
      next()
    } catch (err) {
      // Retourne les erreurs de validation au format JSON
      if (err.errors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        })
      }
      return res.status(400).json({ error: 'Validation failed' })
    }
  }
}

export function validateQuery(schema) {
  return async (req, res, next) => {
    try {
      // Valide les query params
      const validated = await schema.parseAsync(req.query)
      req.query = validated
      next()
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        })
      }
      return res.status(400).json({ error: 'Validation failed' })
    }
  }
}
