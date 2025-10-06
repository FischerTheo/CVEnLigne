import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ProfileSidebar from '../components/ProfileSidebar'
import Carousel from '../components/Carousel' // Import Carousel component
import { apiFetch } from '../lib/api'

// calcul l'age à partir de la date de naissance
const getAge = dob => {
  if (!dob || !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return '';
  const [day, month, year] = dob.split('/').map(Number);
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return '';
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  if (
    t.getMonth() < d.getMonth() ||
    (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())
  ) {
    age--;
  }
  return age >= 0 ? age : '';
};

// ajuste l'ordre des niveaux de compétence en fonction de la langue
const getOrderedLevels = lang =>
  lang === 'fr'
    ? ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
    : ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

// Composant principal pour afficher le CV en ligne
function OnlineResume() {
  const [userInfo, setUserInfo] = useState(null)
  const [projects, setProjects] = useState([])
  const { i18n, t } = useTranslation('main')

  // Fetch les informations de l'utilisateur quand la langue change
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/api/userinfo/admin?lang=${i18n.language}`)
        setUserInfo(data)
      } catch (e) {
        // Optional: could log or show toast
        setUserInfo(null)
      }
    })()
  }, [i18n.language])

  // Fetch projects for admin (public) when language changes
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/api/projects/admin?lang=${i18n.language}`)
        setProjects(Array.isArray(data) ? data : [])
      } catch (e) {
        setProjects([])
      }
    })()
  }, [i18n.language])

  // affiche les niveaux de compétence de l'utilisateur dans l'ordre approprié
  const skillLevels = useMemo(() => {
    if (!userInfo?.skills?.length) return [];
    const orderedLevels = getOrderedLevels(i18n.language);
    const userLevels = Array.from(new Set(userInfo.skills.map(sk => sk.level)));
    return [
      ...orderedLevels.filter(lvl => userLevels.includes(lvl)),
      ...userLevels.filter(lvl => !orderedLevels.includes(lvl))
    ];
  }, [userInfo, i18n.language]);

  return (
    <div className="main-flex">
      {/* Sidebar (gauche) */}
      <ProfileSidebar
        userInfo={userInfo}
        t={t}
        getAge={getAge}
        skillLevels={skillLevels}
      />
      {/* Main content */}
      <main className="main-content" role="main" id="main-content">
        {/* summary/objective et profile image */}
        <section className="summary-row" aria-label={t('resume.about') || 'About and objective'}>
          <div className="summary-box">
            {/* Summary */}
            {userInfo?.summary && (
              <article className="summary-section">
                <h2 className="summary-title">
                  {t('resume.about')}
                </h2>
                <p className="summary-text">
                  {userInfo.summary}
                </p>
              </article>
            )}
            {/* Objective */}
            {userInfo?.objective && (
              <article className="summary-section">
                <h2 className="summary-title">
                  {t('resume.objective')}
                </h2>
                <p className="summary-text">
                  {userInfo.objective}
                </p>
              </article>
            )}
          </div>
          {/* image de profile  */}
          <img
            src="/profile.png"
            alt={`${userInfo?.fullName || 'Profile'} - Professional photo`}
            className="profile-img"
          />
        </section>
        {/* Carousel partie */}
        <section className="carousel-section" aria-label={t('resume.projects') || 'Projects'}>
          {projects.length > 0 && (
            <div className="carousel-container">
              {/* Carousel titre */}
              <h2 className="carousel-title">
                {t('resume.projects')}
              </h2>
              {/* Carousel composent */}
              <Carousel
                items={projects.map(p => ({
                  title: p.title,
                  content: p.description
                }))}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default OnlineResume