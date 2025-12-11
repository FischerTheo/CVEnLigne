import React, { createContext, useContext, useState, useEffect } from 'react'

// Contexte d'authentification
const AuthContext = createContext(null)

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Provider d'authentification
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true')
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  // Vérifie l'expiration du token
  useEffect(() => {
    const expiresAt = parseInt(localStorage.getItem('tokenExpiresAt'), 10)
    if (token && expiresAt && Date.now() > expiresAt) {
      logout()
    }
  }, [token])

  // Fonction de login
  const login = (newToken, adminStatus, expiresAt) => {
    setToken(newToken)
    setIsAdmin(adminStatus)
    setIsAuthenticated(true)
    localStorage.setItem('token', newToken)
    localStorage.setItem('isAdmin', adminStatus)
    localStorage.setItem('tokenExpiresAt', expiresAt)
  }

  // Fonction de logout
  const logout = () => {
    setToken('')
    setIsAdmin(false)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('tokenExpiresAt')
  }

  const value = {
    token,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    setToken,
    setIsAdmin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
