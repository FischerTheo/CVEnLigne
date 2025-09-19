import React from 'react'

// Composant barre latérale du profil (infos, langues, compétences, hobbies, contact)
function ProfileSidebar({ userInfo, t, getAge, thStyle, tdStyle, skillLevels }) {
  if (!userInfo) return null

  // Transforme les liens sociaux en URLs absolues
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
    <div className="profile-sidebar">
      {/* Photo de profil */}
      <img 
        src="/profile.png" 
        alt="Profile"
        className="profile-img-sidebar"
      />
      {/* Nom */}
      <div className="profile-name">
        {userInfo.fullName || ''}
      </div>
      {/* Métier */}
      <div className="profile-job">
        {userInfo.jobTitle || ''}
      </div>
      {/* Ville et âge */}
      <div className="profile-info">
        {userInfo.ville && <div style={{ marginBottom: 4 }}>{t('resume.city')}: {userInfo.ville}</div>}
        {userInfo.dateOfBirth && <div>{t('resume.age')}: {getAge(userInfo.dateOfBirth)}</div>}
      </div>
      <hr className="hr-style" />
      {/* Langues */}
      {userInfo.languages?.length > 0 && (
        <>
          <div className="section-title">
            {t('resume.languages')}
          </div>
          <div className="profile-languages">
            {userInfo.languages.map((lang, idx) => (
              <div key={idx} className="profile-language-item">
                <span className="profile-language-name">{lang.language}</span>
                {lang.level && <span className="profile-language-level">{lang.level}</span>}
              </div>
            ))}
          </div>
          <hr className="hr-style" />
        </>
      )}
      {/* Skills */}
      {userInfo.skills?.length > 0 && (
        <>
          <div className="section-title">
            {t('resume.skills')}
          </div>
          <table className="table-transparent">
            <thead>
              <tr>
                {skillLevels.map(level => (
                  <th key={level} className="th-style">{level}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {skillLevels.map(level => (
                  <td key={level} className="td-style">
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {userInfo.skills.filter(sk => sk.level === level).map((sk, idx) => (
                        <li key={idx}>{sk.skill}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <hr className="hr-style" />
        </>
      )}
      {/* Soft Skills */}
      {userInfo.softSkills?.length > 0 && (
        <>
          <div className="section-title">
            {t('resume.softSkills')}
          </div>
          <div className="profile-skills-section">
            {userInfo.softSkills.map(sk => sk.skill).filter(Boolean).join(' • ')}
          </div>
          <hr className="hr-style" />
        </>
      )}
      {/* Hobbies */}
      {userInfo.hobbies?.length > 0 && (
        <>
          <div className="section-title">
            {t('resume.hobbies')}
          </div>
          <div className="profile-skills-section">
            {userInfo.hobbies.filter(Boolean).join(' • ')}
          </div>
          <hr className="hr-style" />
        </>
      )}
      {/* Contact info */}
      {(userInfo.linkedin || userInfo.github || userInfo.email || userInfo.phone) && (
        <div className="profile-contact-section">
          <div className="profile-contact-title">
            {t('resume.contact')}
          </div>
          <div className="profile-contact-info">
            {userInfo.email && (
              <div className="profile-contact-item">
                <span role="img" aria-label="email" className="profile-contact-icon">📧</span>
                <a
                  href={`mailto:${userInfo.email}`}
                  className="profile-contact-link"
                >
                  {userInfo.email}
                </a>
              </div>
            )}
            {userInfo.phone && (
              <div className="profile-contact-item">
                <span role="img" aria-label="phone" className="profile-contact-icon">📞</span>
                <a
                  href={`tel:${userInfo.phone}`}
                  className="profile-contact-link"
                >
                  {userInfo.phone}
                </a>
              </div>
            )}
          </div>
          <div className="profile-social-links">
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <img
                  src="/link.svg"
                  alt="LinkedIn"
                  className="profile-social-icon"
                />
              </a>
            )}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub">
                <img
                  src="/git.svg"
                  alt="GitHub"
                  className="profile-social-icon"
                />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileSidebar
