// Utilitaires pour gérer les cookies d'authentification

const COOKIE_NAME = 'authToken'

// Configure et envoie le cookie JWT
export function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, // Protection XSS - JS ne peut pas accéder
    secure: isProduction, // HTTPS uniquement en production
    sameSite: 'strict', // Protection CSRF
    maxAge: 60 * 60 * 1000, // 1 heure (comme le JWT)
    path: '/'
  })
}

// Supprime le cookie JWT
export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })
}

// Extrait le token depuis le cookie
export function getTokenFromCookie(req) {
  return req.cookies?.[COOKIE_NAME] || null
}
