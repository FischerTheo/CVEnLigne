// Page de connexion utilisateur
// Gère l'authentification et la récupération du token
import React, { useState } from 'react'
import { apiFetch } from '../lib/api'

// Composant Login : formulaire de connexion
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

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

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, background: '#fff', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Champ email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 16, padding: 8 }}
        />
        {/* Champ mot de passe */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 16, padding: 8 }}
        />
        {/* Bouton de connexion */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        {/* Affiche l'erreur si besoin */}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        
      </form>
    </div>
  )
}

export default Login