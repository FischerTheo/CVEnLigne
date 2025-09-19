// Simple in-memory store keyed by `${userId}:${lang}`
export const store = {
  // cleaned: previously had userInfo/services/projects
}

export const makeKey = (userId, lang) => `${userId}:${lang || 'fr'}`
