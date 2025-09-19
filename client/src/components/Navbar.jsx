import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch, API } from '../lib/api'

// Barre de navigation principale de l'application
function Navbar(props) {
  const { i18n, t } = useTranslation('main')
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const formulaireRefs = props.formulaireRefs || []

  // Déconnexion utilisateur
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('isAdmin')
    navigate('/')
    window.location.reload()
  }

  // Redirection vers la page de connexion
  const handleLogin = () => {
    navigate('/login')
  }

  // Changement de langue (fr/en)
  const handleLangSwitch = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')
  }

  const currentLang = i18n.language === 'fr' ? 'fr' : 'en'
  const nextLang = currentLang === 'fr' ? 'en' : 'fr'
  const flagSrc = nextLang === 'fr' ? '/fr.svg' : '/en.svg'

  // Récupère l'URL du CV admin pour le bouton de téléchargement
  const [cvUrl, setCvUrl] = useState('')
  useEffect(() => {
    let cancelled = false
    async function loadCv() {
      try {
        // Tente d'abord la langue courante
        const data = await apiFetch(`/api/userinfo/admin?lang=${i18n.language}`)
        let url = data?.cvPdfUrl || ''
        // Si pas de CV, tente la langue alternative
        if (!url) {
          const fallbackLang = i18n.language === 'fr' ? 'en' : 'fr'
          const fb = await apiFetch(`/api/userinfo/admin?lang=${fallbackLang}`)
          url = fb?.cvPdfUrl || ''
        }
        if (!cancelled) setCvUrl(url)
      } catch {
        if (!cancelled) setCvUrl('')
      }
    }
    loadCv()
    return () => { cancelled = true }
  }, [i18n.language])

  // Définit les boutons de navigation
  const navItems = [
    {
      path: '/formulaire',
      label: t('navbar.form'),
      show: token && isAdmin,
      style: { background: '#1976d2' }
    },
    {
      path: '/mon-parcour',
      label: t('navbar.monParcour'),
      show: true,
      style: { background: '#64748b' }
    }
  ]

  return (
    <nav className="navbar">
      <div className="navbar-left-section">
        <button
          onClick={handleLangSwitch}
          className="navbar-lang-btn"
        >
          <img src={flagSrc} alt={nextLang} className="navbar-lang-icon" />
        </button>
        {cvUrl && (
          <a
            href={`${API}${cvUrl}`}
            download
            className="navbar-cv-btn"
            title={currentLang === 'en' ? 'Download Resume (PDF)' : 'Télécharger le CV (PDF)'}
          >
            {currentLang === 'en' ? 'Download Resume' : 'Télécharger CV'}
          </a>
        )}
      </div>
      <div className="navbar-logo-section">
        <Link
          to="/"
          className="navbar-logo"
        >
          {t('navbar.title')}
        </Link>
        {token && location.pathname === '/formulaire' && (
          <button
            type="button"
            onClick={() => formulaireRefs.forEach(ref => ref && ref.current && ref.current.saveForm())}
            className="navbar-btn navbar-save-btn"
          >
            {t('navbar.save')}
          </button>
        )}
      </div>
      <div className="navbar-nav-section">
        {token ? (
          <>
            {navItems.map(
              item =>
                item.show && location.pathname !== item.path && (
                  <Link to={item.path} key={item.path}>
                    <button className="navbar-btn">
                      {item.label}
                    </button>
                  </Link>
                )
            )}
            <button
              onClick={handleLogout}
              className="navbar-btn"
            >
              {t('navbar.logout')}
            </button>
          </>
        ) : (
          location.pathname !== '/login' && (
            <button
              onClick={handleLogin}
              className="navbar-login-btn"
            >
              {t('navbar.login')}
            </button>
          )
        )}
      </div>
    </nav>
  )
}

export default Navbar