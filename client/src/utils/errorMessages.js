// Messages d'erreur user-friendly avec traduction FR/EN

export function getUserFriendlyError(error, lang = 'fr') {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  
  const messages = {
    offline: {
      fr: '🔌 Vous êtes hors ligne. Vérifiez votre connexion internet.',
      en: '🔌 You are offline. Check your internet connection.'
    },
    timeout: {
      fr: '⏱️ La requête a pris trop de temps. Réessayez plus tard.',
      en: '⏱️ Request timed out. Please try again later.'
    },
    network: {
      fr: '🌐 Impossible de contacter le serveur. Vérifiez votre connexion.',
      en: '🌐 Cannot reach the server. Check your connection.'
    },
    unauthorized: {
      fr: 'mot de passe ou nom/adresse non valide.',
      en: 'Incorrect password or username/address.',
    },
    forbidden: {
      fr: '⛔ Accès refusé. Vous n\'avez pas les permissions nécessaires.',
      en: '⛔ Access denied. You don\'t have the necessary permissions.'
    },
    notFound: {
      fr: '🔍 Ressource non trouvée.',
      en: '🔍 Resource not found.'
    },
    rateLimit: {
      fr: '⚠️ Trop de requêtes. Veuillez patienter quelques instants.',
      en: '⚠️ Too many requests. Please wait a few moments.'
    },
    serverError: {
      fr: '🔧 Erreur serveur. Réessayez dans quelques instants.',
      en: '🔧 Server error. Please try again in a few moments.'
    },
    badRequest: {
      fr: '❌ Données invalides. Vérifiez votre saisie.',
      en: '❌ Invalid data. Check your input.'
    },
    conflict: {
      fr: '⚠️ Conflit détecté. Cette ressource existe déjà.',
      en: '⚠️ Conflict detected. This resource already exists.'
    },
    validation: {
      fr: '📝 Erreur de validation. Vérifiez les champs du formulaire.',
      en: '📝 Validation error. Check the form fields.'
    },
    uploadFailed: {
      fr: '📎 Échec de l\'upload. Fichier trop volumineux ou format invalide.',
      en: '📎 Upload failed. File too large or invalid format.'
    }
  }
  
  // Détection hors-ligne
  if (!isOnline || error.offline) {
    return messages.offline[lang]
  }
  
  // Timeout
  if (error.name === 'AbortError') {
    return messages.timeout[lang]
  }
  
  // Erreur réseau
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return messages.network[lang]
  }
  
  // Par code HTTP
  if (error.status === 400) {
    return messages.badRequest[lang]
  }
  
  if (error.status === 401) {
    return messages.unauthorized[lang]
  }
  
  if (error.status === 403) {
    return messages.forbidden[lang]
  }
  
  if (error.status === 404) {
    return messages.notFound[lang]
  }
  
  if (error.status === 409) {
    return messages.conflict[lang]
  }
  
  if (error.status === 422) {
    return messages.validation[lang]
  }
  
  if (error.status === 429) {
    return messages.rateLimit[lang]
  }
  
  if (error.status === 413) {
    return messages.uploadFailed[lang]
  }
  
  if (error.status >= 500) {
    return messages.serverError[lang]
  }
  
  // Message par défaut
  const defaultMsg = {
    fr: `❌ Une erreur est survenue${error.message ? ' : ' + error.message : ''}`,
    en: `❌ An error occurred${error.message ? ': ' + error.message : ''}`
  }
  
  return defaultMsg[lang]
}
