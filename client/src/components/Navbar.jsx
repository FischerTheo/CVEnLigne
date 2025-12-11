import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API } from '../lib/api'

// Barre de navigation
function Navbar(props) {
  const { formulaireRefs = [], cvUrl = '' } = props
  const { i18n, t } = useTranslation('main')
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  
  // State pour le menu hamburger
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Toggle hamburger menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Fermer le menu lors d'un changement de page
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Déconnexion utilisateur
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('isAdmin')
    setIsMenuOpen(false)
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

  // Définit les boutons de navigation
  const navItems = [
    {
      path: '/formulaire',
      label: t('navbar.form'),
      show: token && isAdmin,
      style: { background: '#1976d2' }
    }
  ]

  return (
    <nav className="navbar" role="navigation" aria-label={currentLang === 'en' ? 'Main navigation' : 'Navigation principale'}>
      <section className="navbar-left-section">
        {/* Bouton Hamburger*/}
        <button
          onClick={toggleMenu}
          className={`navbar-hamburger ${isMenuOpen ? 'navbar-hamburger--open' : ''}`}
          aria-label={isMenuOpen ? (currentLang === 'en' ? 'Close menu' : 'Fermer le menu') : (currentLang === 'en' ? 'Open menu' : 'Ouvrir le menu')}
          aria-expanded={isMenuOpen}
        >
          <span className="navbar-hamburger-line"></span>
          <span className="navbar-hamburger-line"></span>
          <span className="navbar-hamburger-line"></span>
        </button>

        <button
          onClick={handleLangSwitch}
          className="navbar-lang-btn"
          aria-label={currentLang === 'en' ? `Switch to French` : `Passer en anglais`}
          title={currentLang === 'en' ? `Switch to French` : `Passer en anglais`}
        >
          <img 
            src={flagSrc} 
            alt={nextLang === 'fr' ? 'Drapeau français' : 'English flag'} 
            className="navbar-lang-icon"
            aria-hidden="true"
            loading="lazy"
          />
        </button>
        {/* Boutons desktop*/}
        <nav className="navbar-desktop-btns" aria-label="Desktop navigation">
            {cvUrl && (
            <a
              href={`${API}${cvUrl}`}
              download
              className="navbar-cv-btn"
              aria-label={currentLang === 'en' ? 'Download Resume PDF' : 'Télécharger le CV PDF'}
            >
              {currentLang === 'en' ? 'Download Resume' : 'Télécharger CV'}
            </a>
          )}
          {location.pathname !== '/mon-parcour' && (
            <Link to="/mon-parcour" style={{ marginLeft: '16px' }}>
              <button className="navbar-btn" aria-label={t('navbar.monParcour')}>
                {t('navbar.monParcour')}
              </button>
            </Link>
          )}
        </nav>
      </section>
      <header className="navbar-logo-section">
        <Link
          to="/"
          className="navbar-logo"
          aria-label={currentLang === 'en' ? 'Go to homepage' : 'Aller à l\'accueil'}
        >
          {t('navbar.title')}
        </Link>
        {token && location.pathname === '/formulaire' && (
          <button
            type="button"
            onClick={() => formulaireRefs.forEach(ref => ref && ref.current && ref.current.saveForm())}
            className="navbar-btn navbar-save-btn"
            aria-label={currentLang === 'en' ? 'Save forms' : 'Sauvegarder les formulaires'}
          >
            {t('navbar.save')}
          </button>
        )}
      </header>
      <section className="navbar-nav-section" role="navigation" aria-label={currentLang === 'en' ? 'User navigation' : 'Navigation utilisateur'}>
        {token ? (
          <>
            {navItems.map(
              item =>
                item.show && location.pathname !== item.path && (
                  <Link to={item.path} key={item.path}>
                    <button className="navbar-btn" aria-label={item.label}>
                      {item.label}
                    </button>
                  </Link>
                )
            )}
            <button
              onClick={handleLogout}
              className="navbar-btn"
              aria-label={currentLang === 'en' ? 'Log out' : 'Se déconnecter'}
            >
              {t('navbar.logout')}
            </button>
          </>
        ) : (
          location.pathname !== '/login' && (
            <button
              onClick={handleLogin}
              className="navbar-login-btn"
              aria-label={currentLang === 'en' ? 'Log in' : 'Se connecter'}
            >
              {t('navbar.login')}
            </button>
          )
        )}
      </section>

      {/* Overlay pour fermer le menu mobile */}
      {isMenuOpen && (
        <div 
          className="navbar-mobile-overlay" 
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu Mobile hamburger */}
      <nav className={`navbar-mobile-menu ${isMenuOpen ? 'navbar-mobile-menu--open' : ''}`} aria-label="Mobile menu">
        {cvUrl && (
          <a
            href={`${API}${cvUrl}`}
            download
            className="navbar-mobile-menu-item"
            aria-label={currentLang === 'en' ? 'Download Resume PDF' : 'Télécharger le CV PDF'}
            onClick={() => setIsMenuOpen(false)}
          >
            {currentLang === 'en' ? 'Download Resume' : 'Télécharger CV'}
          </a>
        )}
        {location.pathname !== '/mon-parcour' && (
          <Link to="/mon-parcour" className="navbar-mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
            {t('navbar.monParcour')}
          </Link>
        )}
        {token && location.pathname === '/formulaire' && (
          <button
            type="button"
            onClick={() => {
              formulaireRefs.forEach(ref => ref && ref.current && ref.current.saveForm())
              setIsMenuOpen(false)
            }}
            className="navbar-mobile-menu-item"
            aria-label={currentLang === 'en' ? 'Save forms' : 'Sauvegarder les formulaires'}
          >
            {t('navbar.save')}
          </button>
        )}
        {token ? (
          <>
            {navItems.map(
              item =>
                item.show && location.pathname !== item.path && (
                  <Link to={item.path} key={item.path} className="navbar-mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                  </Link>
                )
            )}
            <button
              onClick={handleLogout}
              className="navbar-mobile-menu-item"
              aria-label={currentLang === 'en' ? 'Log out' : 'Se déconnecter'}
            >
              {t('navbar.logout')}
            </button>
          </>
        ) : (
          location.pathname !== '/login' && (
            <button
              onClick={() => {
                handleLogin()
                setIsMenuOpen(false)
              }}
              className="navbar-mobile-menu-item"
              aria-label={currentLang === 'en' ? 'Log in' : 'Se connecter'}
            >
              {t('navbar.login')}
            </button>
          )
        )}
      </nav>
    </nav>
  )
}

export default Navbar