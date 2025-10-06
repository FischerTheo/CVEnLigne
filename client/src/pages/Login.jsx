// Page de connexion utilisateur
// Gère l'authentification et la récupération du token
import React, { useState } from 'react'
import { apiFetch } from '../lib/api'

// Composant Login : formulaire de connexion
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  // États pour le formulaire d'inscription
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInError, setSignInError] = useState('')

  // Soumet le formulaire et gère la connexion
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await apiFetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
  // Stocke le token, l'admin et la date d'expiration
  localStorage.setItem('token', data.token)
  localStorage.setItem('isAdmin', data.isAdmin)
  localStorage.setItem('tokenExpiresAt', data.expiresAt)
  onLogin(data.token, data.isAdmin)
    } catch (e) {
      setError(e.message || 'Network error')
    }
  }

  // Gère l'inscription d'un nouvel utilisateur
  const handleSignIn = async () => {
    setSignInError('')
    
    if (!signInEmail || !signInPassword) {
      setSignInError('Veuillez remplir tous les champs')
      return
    }
    
    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(signInPassword)) {
      setSignInError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre')
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
      localStorage.setItem('token', data.token)
      localStorage.setItem('isAdmin', data.isAdmin)
      localStorage.setItem('tokenExpiresAt', data.expiresAt)
      onLogin(data.token, data.isAdmin)
    } catch (e) {
      setSignInError(e.message || 'Erreur lors de l\'inscription')
    }
  }

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Champ email */}
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
        <button type="submit" className="login-button">
          Login
        </button>
        {/* Affiche l'erreur si besoin */}
        {error && <div className="login-error">{error}</div>}
        
      </form>
      
      {/* Zone Sign In */}
      <div className="login-separator">
        <h3 className="signin-title">Sign In</h3>
        <p className="signin-description">Créer un nouveau compte</p>
        
        {/* Champ email inscription */}
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
        <button type="button" onClick={handleSignIn} className="signin-button">
          Create Account
        </button>
        
        {/* Affiche l'erreur d'inscription si besoin */}
        {signInError && <div className="signin-error">{signInError}</div>}
      </div>
    </div>
  )
}

export default Login