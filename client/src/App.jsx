// Composant racine de l'application CV en ligne
// Gère la navigation, l'authentification, le routage et la synchronisation des formulaires
import React, { useState, useRef } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Formulaire from './components/forms/Formulaire.jsx'
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
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              <div className="form-block" style={{ flex: 1, minWidth: 0 }}>
                <h2 className="form-block-title">formulaire fr</h2>
                <Formulaire
                  ref={formulaireRef1}
                  token={token}
                  showNote={true}
                  showTranslateButtons={false}
                  showAddButtons={true}
                  forcedLang="fr"
                  onFormChange={(newForm) => {
                    // push updates from left FR form to right EN form
                    if (!formulaireRef2.current) return
                    const target = formulaireRef2.current
                    if (newForm && typeof newForm === 'object' && 'field' in newForm && 'value' in newForm) {
                      // Array cell update when idx is provided
                      if ('idx' in newForm && typeof newForm.idx === 'number' && target.setExternalArrayField) {
                        target.setExternalArrayField(newForm.field, newForm.idx, newForm.key, newForm.value)
                        return
                      }
                      // Simple field update
                      if (target.setExternalField) {
                        target.setExternalField(newForm.field, newForm.value)
                        return
                      }
                    }
                    // Fallback: whole-form replacement
                    if (target.setExternalForm) {
                      target.setExternalForm(newForm)
                    }
                  }}
                />
              </div>
              <div className="form-block" style={{ flex: 1, minWidth: 0 }}>
                <h2 className="form-block-title">en form</h2>
                <Formulaire ref={formulaireRef2} token={token} showNote={false} showTranslateButtons={true} showAddButtons={false} forcedLang="en" />
              </div>
            </div>
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
      <ToastContainer position="top-right" newestOnTop />
    </Router>
  )
}

export default App
