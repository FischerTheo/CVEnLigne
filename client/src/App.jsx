// Composant racine de l'application CV en ligne
// Gère la navigation, l'authentification, le routage et la synchronisation des formulaires
import React, { useRef, useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Login from './pages/Login.jsx'
import FormulairePage from './pages/FormulairePage.jsx'
import OnlineResume from './pages/OnlineResume.jsx'
import MonParcour from './pages/MonParcour.jsx'
import Navbar from './components/Navbar.jsx'
import { apiFetch } from './lib/api'

function AppContent() {
  const { i18n } = useTranslation()
  const { token, isAdmin, login, logout } = useAuth()
  const [cvUrl, setCvUrl] = useState('')
  const formulaireRef1 = useRef()
  const formulaireRef2 = useRef()

  // Met à jour l'attribut lang du document HTML selon la langue active (fr ou en)
  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  // Charge l'URL du CV admin et se met à jour quand la langue ou le statut admin change
  useEffect(() => {
    let cancelled = false

    async function loadCvUrl() {
      try {
        // Normaliser la langue (fr-FR -> fr, en-US -> en)
        const lang = i18n.language.split('-')[0]
        const primary = await apiFetch(`/api/userinfo/admin?lang=${lang}`)
        let url = primary?.cvPdfUrl || ''
        if (!url) {
          const fallbackLang = lang === 'fr' ? 'en' : 'fr'
          const fallback = await apiFetch(`/api/userinfo/admin?lang=${fallbackLang}`)
          url = fallback?.cvPdfUrl || ''
        }
        if (!cancelled) setCvUrl(url || '')
      } catch (err) {
        console.error('Failed to load CV URL:', err)
        if (!cancelled) setCvUrl('')
      }
    }

    loadCvUrl()

    return () => {
      cancelled = true
    }
  }, [i18n.language, isAdmin])

  return (
    <>
      {/* Barre de navigation principale */}
      <Navbar formulaireRefs={[formulaireRef1, formulaireRef2]} cvUrl={cvUrl} />
      <Routes>
        {/* Page de connexion */}
        <Route path="/login" element={
          !token ? (
            <Login onLogin={login} />
          ) : (
            <Navigate to="/" />
          )
        } />
        {/* Page formulaire admin FR/EN synchronisés */}
        <Route path="/formulaire" element={
          token && isAdmin ? (
            <FormulairePage
              token={token}
              formulaireRefs={[formulaireRef1, formulaireRef2]}
              onCvPdfChange={setCvUrl}
            />
          ) : <Navigate to="/login" />
        } />
        {/* Page parcours professionnel */}
        <Route path="/mon-parcour" element={<MonParcour />} />
        {/* Page d'accueil : CV en ligne */}
        <Route path="/" element={
          <OnlineResume onLogout={logout} />
        } />
        {/* Redirection pour toute route inacessible */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* ToastContainer global pour notifications */}
      <ToastContainer 
        position="bottom-left" 
        newestOnTop 
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        pauseOnFocusLoss={false}
      />
    </>
  )
}

// Wrapper avec AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
