// Page de connexion utilisateur
// Gère l'authentification et la récupération du token
import React, { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { getUserFriendlyError } from '../utils/errorMessages'
import { useTranslation } from 'react-i18next'

// Composant Login : formulaire de connexion
function Login({ onLogin }) {
  const { i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // États pour le formulaire d'inscription
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInError, setSignInError] = useState('')
  const [isSignInLoading, setIsSignInLoading] = useState(false)

  // Met à jour le titre de la page 
  useEffect(() => {
    document.title = 'Login - Online Resume'
  }, [])

  // Soumet le formulaire et gère la connexion
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const data = await apiFetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      // Stocker le token et les infos utilisateur
      // Token dans localStorage pour compatibilité Render (cookies cross-domain)
      localStorage.setItem('token', data.token)
      localStorage.setItem('isAdmin', data.isAdmin)
      localStorage.setItem('tokenExpiresAt', data.expiresAt)
      
      onLogin(data.token, data.isAdmin, data.expiresAt)
    } catch (e) {
      console.error('Login failed:', e)
      setError(e.userMessage || getUserFriendlyError(e, i18n.language))
    } finally {
      setIsLoading(false)
    }
  }

  // Gère l'inscription d'un nouvel utilisateur
  const handleSignIn = async () => {
    setSignInError('')
    setIsSignInLoading(true)
    
    if (!signInEmail || !signInPassword) {
      setSignInError('Veuillez remplir tous les champs')
      setIsSignInLoading(false)
      return
    }
    
    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(signInPassword)) {
      setSignInError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre')
      setIsSignInLoading(false)
      return
    }
    
    try {
      const data = await apiFetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: signInEmail, 
          username: signInEmail,
          password: signInPassword,
          isAdmin: true  // Tous les nouveaux comptes sont admin (un seul compte possible)
        })
      })
      
      // Auto-login après inscription réussie
      // Stocker le token et les infos utilisateur
      localStorage.setItem('token', data.token)
      localStorage.setItem('isAdmin', data.isAdmin)
      localStorage.setItem('tokenExpiresAt', data.expiresAt)
      
      onLogin(data.token, data.isAdmin, data.expiresAt)
    } catch (e) {
      console.error('Registration failed:', e)
      setSignInError(e.userMessage || getUserFriendlyError(e, i18n.language))
    } finally {
      setIsSignInLoading(false)
    }
  }

  return (
    <main className="login-container" id="main-content">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Champ email */}
        <label htmlFor="login-email" className="sr-only">Email</label>
        <input
          type="email"
          id="login-email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="login-input"
        />
        {/* Champ mot de passe */}
        <label htmlFor="login-password" className="sr-only">Password</label>
        <input
          type="password"
          id="login-password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="login-input"
        />
        {/* Bouton de connexion */}
        <button 
          type="submit" 
          className={`login-button ${isLoading ? 'btn-loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? '' : 'Login'}
        </button>
        {/* Affiche l'erreur si besoin */}
        {error && <p className="login-error" role="alert">{error}</p>}
        
      </form>
      
      {/* Zone SignIn */}
      <section className="login-separator">
        <h2 className="signin-title">Sign In</h2>
        <p className="signin-description">Créer un nouveau compte</p>
        
        {/* Champ email inscription */}
        <label htmlFor="signin-email" className="sr-only">Email for new account</label>
        <input
          type="email"
          id="signin-email"
          name="signInEmail"
          placeholder="Email"
          value={signInEmail}
          onChange={e => setSignInEmail(e.target.value)}
          autoComplete="email"
          className="signin-input"
        />
        
        {/* Champ mot de passe inscription */}
        <label htmlFor="signin-password" className="sr-only">Password for new account</label>
        <input
          type="password"
          id="signin-password"
          name="signInPassword"
          placeholder="Password"
          value={signInPassword}
          onChange={e => setSignInPassword(e.target.value)}
          autoComplete="new-password"
          className="signin-input"
        />
        
        {/* Bouton inscription */}
        <button 
          type="button" 
          onClick={handleSignIn} 
          className={`signin-button ${isSignInLoading ? 'btn-loading' : ''}`}
          disabled={isSignInLoading}
        >
          {isSignInLoading ? '' : 'Create Account'}
        </button>
        
        {/* Affiche l'erreur d'inscription si besoin */}
        {signInError && <p className="signin-error" role="alert">{signInError}</p>}
      </section>
    </main>
  )
}

export default Login