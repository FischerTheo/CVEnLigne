import React, { useState, useEffect, useRef } from 'react'

// Composant barre latérale du profil (infos, langues, compétences, hobbies, contact)
function ProfileSidebar({ userInfo, t, getAge, skillLevels }) {
  // État pour la largeur du sidebar (uniquement sur PC)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth')
    return saved ? parseInt(saved) : 425
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)
  const sidebarRef = useRef(null)

  // Détecte si on est sur pc
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialise la variable CSS au chargement pour pc
  useEffect(() => {
    if (isDesktop) {
      document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`)
    }
    
    // Cleanup : retire la variable CSS quand le composant est démonté
    return () => {
      if (isDesktop) {
        document.documentElement.style.removeProperty('--sidebar-width')
      }
    }
  }, [sidebarWidth, isDesktop])

  // Gestion du redimensionnement pour pc
  useEffect(() => {
    if (!isDesktop) return

    const handleMouseMove = (e) => {
      if (!isResizing) return
      const newWidth = Math.min(Math.max(e.clientX, 250), 650)
      setSidebarWidth(newWidth)
      localStorage.setItem('sidebarWidth', newWidth.toString())
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, isDesktop])

  const handleMouseDown = (e) => {
    if (!isDesktop) return
    e.preventDefault()
    setIsResizing(true)
  }

  // Early return APRES tous les hooks
  if (!userInfo) return null

  // Transforme les liens git et link en URL absolues
  const toAbsoluteUrl = (value, kind) => {
    if (!value) return ''
    let v = String(value).trim()
    if (!/^https?:\/\//i.test(v)) {
      if (kind === 'github') {
        // Si c'est juste un pseudo
        if (/^[A-Za-z0-9-]+$/.test(v)) return `https://github.com/${v}`
        // Si le domaine est présent sans protocole
        if (/^(www\.)?github\.com/i.test(v)) return `https://${v.replace(/^https?:\/\//i, '')}`
        return `https://${v}`
      }
      if (kind === 'linkedin') {
        if (/^[A-Za-z0-9-]+$/.test(v)) return `https://www.linkedin.com/in/${v}`
        if (/^(www\.)?linkedin\.com/i.test(v)) return `https://${v.replace(/^https?:\/\//i, '')}`
        return `https://${v}`
      }
      return `https://${v}`
    }
    return v
  }

  const linkedinUrl = toAbsoluteUrl(userInfo.linkedin, 'linkedin')
  const githubUrl = toAbsoluteUrl(userInfo.github, 'github')

  return (
    <aside 
      ref={sidebarRef}
      className="profile-sidebar" 
      style={isDesktop ? { width: `${sidebarWidth}px` } : {}}
      role="complementary" 
      aria-label={t('resume.profile') || 'Profile information'}
    >
      {/* profilesidebar redimensionable sur pcc*/}
      {isDesktop && (
        <button 
          className="sidebar-resize-handle"
          onMouseDown={handleMouseDown}
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
        >
          <span className="sidebar-resize-indicator"></span>
        </button>
      )}
      
      {/* Photo de profil */}
      <img 
        src="/profile.png" 
        alt={`${userInfo.fullName || 'photo de Profile'}`}
        className="profile-img-sidebar"
        loading="lazy"
      />
      {/* Nom */}
      <h1 className="profile-name">
        {userInfo.fullName || ''}
      </h1>
      {/* Métier */}
      <p className="profile-job">
        {userInfo.jobTitle || ''}
      </p>
      {/* Ville et âge */}
      <address className="profile-info">
        {userInfo.ville && <p className="profile-info-item">{t('resume.city')}: {userInfo.ville}</p>}
        {userInfo.dateOfBirth && <p>{t('resume.age')}: {getAge(userInfo.dateOfBirth)}</p>}
      </address>
      <hr className="hr-style" aria-hidden="true" />
      {/* Langues */}
      {userInfo.languages?.length > 0 && (
        <>
          <h2 className="section-title">
            {t('resume.languages')}
          </h2>
          <section className="profile-languages">
            {userInfo.languages.map((lang, idx) => (
              <p key={idx} className="profile-language-item">
                <span className="profile-language-name">{lang.language}</span>
                {lang.level && <span className="profile-language-level">{lang.level}</span>}
              </p>
            ))}
          </section>
          <hr className="hr-style" />
        </>
      )}
      {/* Skills */}
      {userInfo.skills?.length > 0 && (
        <>
          <h2 className="section-title">
            {t('resume.skills')}
          </h2>
          <table className="table-transparent">
            <thead>
              <tr>
                <th className="th-style">{skillLevels[0]}</th>
                <th className="th-style">{skillLevels[1]}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="td-style">
                  <ul className="profile-skills-list">
                    {userInfo.skills.filter(sk => sk.level === skillLevels[0]).map((sk, idx) => (
                      <li key={idx}>{sk.skill}</li>
                    ))}
                  </ul>
                </td>
                <td className="td-style">
                  <ul className="profile-skills-list">
                    {userInfo.skills.filter(sk => sk.level === skillLevels[1]).map((sk, idx) => (
                      <li key={idx}>{sk.skill}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="table-transparent">
            <thead>
              <tr>
                <th className="th-style">{skillLevels[2]}</th>
                <th className="th-style">{skillLevels[3]}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="td-style">
                  <ul className="profile-skills-list">
                    {userInfo.skills.filter(sk => sk.level === skillLevels[2]).map((sk, idx) => (
                      <li key={idx}>{sk.skill}</li>
                    ))}
                  </ul>
                </td>
                <td className="td-style">
                  <ul className="profile-skills-list">
                    {userInfo.skills.filter(sk => sk.level === skillLevels[3]).map((sk, idx) => (
                      <li key={idx}>{sk.skill}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
          <hr className="hr-style" />
        </>
      )}
      {/* Soft Skills */}
      {userInfo.softSkills?.length > 0 && (
        <>
          <h2 className="section-title">
            {t('resume.softSkills')}
          </h2>
          <section className="profile-skills-section">
            {userInfo.softSkills.map(sk => sk.skill).filter(Boolean).join(' • ')}
          </section>
          <hr className="hr-style" />
        </>
      )}
      {/* Hobbies */}
      {userInfo.hobbies?.length > 0 && (
        <>
          <h2 className="section-title">
            {t('resume.hobbies')}
          </h2>
          <section className="profile-skills-section">
            {userInfo.hobbies.filter(Boolean).join(' • ')}
          </section>
          <hr className="hr-style" />
        </>
      )}
      {/* Contact info */}
      {(userInfo.linkedin || userInfo.github || userInfo.email || userInfo.phone) && (
        <section className="profile-contact-section">
          <h2 className="profile-contact-title">
            {t('resume.contact')}
          </h2>
          <address className="profile-contact-info">
            {userInfo.email && (
              <p className="profile-contact-item">
                <span role="img" aria-label="email" className="profile-contact-icon">📧</span>
                <a
                  href={`mailto:${userInfo.email}`}
                  className="profile-contact-link"
                >
                  {userInfo.email}
                </a>
              </p>
            )}
            {userInfo.phone && (
              <p className="profile-contact-item">
                <span role="img" aria-label="phone" className="profile-contact-icon">📞</span>
                <a
                  href={`tel:${userInfo.phone}`}
                  className="profile-contact-link"
                >
                  {userInfo.phone}
                </a>
              </p>
            )}
          </address>
          <nav className="profile-social-links" lang="en" aria-label="Social media links">
            {linkedinUrl && (
              <a 
                href={linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={`Visit ${userInfo.fullName || 'my'} LinkedIn profile`}
              >
                <img
                  src="/link.svg"
                  alt="Lien vers le profil LinkedIn"
                  className="profile-social-icon"
                  aria-hidden="true"
                  loading="lazy"
                />
              </a>
            )}
            {githubUrl && (
              <a 
                href={githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={`Visit ${userInfo.fullName || 'my'} GitHub profile`}
              >
                <img
                  src="/git.svg"
                  alt="Lien vers le profil GitHub"
                  className="profile-social-icon"
                  aria-hidden="true"
                  loading="lazy"
                />
              </a>
            )}
          </nav>
        </section>
      )}
    </aside>
  )
}

export default ProfileSidebar
