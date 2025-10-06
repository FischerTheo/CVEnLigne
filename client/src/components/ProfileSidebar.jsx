import React from 'react'

// Composant barre latérale du profil (infos, langues, compétences, hobbies, contact)
function ProfileSidebar({ userInfo, t, getAge, skillLevels }) {
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
    <aside className="profile-sidebar" role="complementary" aria-label={t('resume.profile') || 'Profile information'}>
      {/* Photo de profil */}
      <img 
        src="/profile.png" 
        alt={`${userInfo.fullName || 'Profile'} photo`}
        className="profile-img-sidebar"
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
        {userInfo.ville && <div className="profile-info-item">{t('resume.city')}: {userInfo.ville}</div>}
        {userInfo.dateOfBirth && <div>{t('resume.age')}: {getAge(userInfo.dateOfBirth)}</div>}
      </address>
      <hr className="hr-style" aria-hidden="true" />
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
              <a 
                href={linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={`Visit ${userInfo.fullName || 'my'} LinkedIn profile`}
              >
                <img
                  src="/link.svg"
                  alt=""
                  className="profile-social-icon"
                  aria-hidden="true"
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
                  alt=""
                  className="profile-social-icon"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

export default ProfileSidebar
