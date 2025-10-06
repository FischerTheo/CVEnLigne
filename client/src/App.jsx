// Composant racine de l'application CV en ligne
// Gère la navigation, l'authentification, le routage et la synchronisation des formulaires
import React, { useState, useRef } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import FormulairePage from './pages/FormulairePage.jsx'
import OnlineResume from './pages/OnlineResume.jsx'
import MonParcour from './pages/MonParcour.jsx'
import Navbar from './components/Navbar.jsx'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true')
  const formulaireRef1 = useRef()
  const formulaireRef2 = useRef()

  // Vérifie l'expiration du token à chaque rendu
  React.useEffect(() => {
    const expiresAt = parseInt(localStorage.getItem('tokenExpiresAt'), 10)
    if (token && expiresAt && Date.now() > expiresAt) {
      setToken('')
      setIsAdmin(false)
      localStorage.removeItem('token')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('tokenExpiresAt')
    }
  }, [token])

  // Gère la connexion utilisateur
  const handleLogin = (token, isAdmin) => {
    setToken(token)
    setIsAdmin(isAdmin)
    localStorage.setItem('token', token)
    localStorage.setItem('isAdmin', isAdmin)
  }

  // Gère la déconnexion utilisateur
  const handleLogout = () => {
    setToken('')
    setIsAdmin(false)
    localStorage.removeItem('token')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('tokenExpiresAt')
  }

  return (
    <Router>
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        {isAdmin ? 'Aller au contenu principal' : 'Skip to main content'}
      </a>
      {/* Barre de navigation principale */}
      <Navbar formulaireRefs={[formulaireRef1, formulaireRef2]} />
      <Routes>
        {/* Page de connexion */}
        <Route path="/login" element={
          !token ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Navigate to="/" />
          )
        } />
        {/* Page formulaire admin FR/EN synchronisés */}
        <Route path="/formulaire" element={
          token && isAdmin ? (
            <FormulairePage token={token} formulaireRefs={[formulaireRef1, formulaireRef2]} />
          ) : <Navigate to="/login" />
        } />
        {/* Page parcours professionnel */}
        <Route path="/mon-parcour" element={<MonParcour />} />
        {/* Page d'accueil : CV en ligne */}
        <Route path="/" element={
          <OnlineResume onLogout={handleLogout} />
        } />
        {/* Redirection pour toute route inconnue */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* ToastContainer global pour notifications */}
      <ToastContainer 
        position="top-right" 
        newestOnTop 
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      />
    </Router>
  )
}

export default App
