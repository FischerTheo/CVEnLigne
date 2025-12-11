import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ProfileSidebar from '../components/ProfileSidebar'
import Carousel from '../components/Carousel' // Import Carousel component
import { apiFetch } from '../lib/api'
import '../styles/desktopResize.scss' // Import des styles de redimensionnement desktop

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
        // Normaliser la langue (fr-FR -> fr, en-US -> en)
        const lang = i18n.language.split('-')[0]
        const data = await apiFetch(`/api/userinfo/admin?lang=${lang}`)
        setUserInfo(data)
      } catch (e) {
        console.error('Failed to fetch user info:', e)
        setUserInfo(null)
      }
    })()
  }, [i18n.language])

  // Met à jour le titre de la page dynamiquement
  useEffect(() => {
    const pageTitle = userInfo?.fullName 
      ? `${userInfo.fullName} - ${i18n.language === 'fr' ? 'CV en ligne' : 'Online Resume'}`
      : i18n.language === 'fr' ? 'CV en ligne' : 'Online Resume'
    document.title = pageTitle
  }, [userInfo, i18n.language])

  // Fetch projects pour admin quand langue change
  useEffect(() => {
    (async () => {
      try {
        // Normaliser la langue (fr-FR -> fr, en-US -> en)
        const lang = i18n.language.split('-')[0]
        const data = await apiFetch(`/api/projects/admin?lang=${lang}`)
        setProjects(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to fetch projects:', e)
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
    <section className="main-flex">
      {/* Sidebar (gauche) */}
      <ProfileSidebar
        userInfo={userInfo}
        t={t}
        getAge={getAge}
        skillLevels={skillLevels}
      />
      {/* Main content */}
      <main className="main-content" role="main" id="main-content">
        {/* Titre principal pour accessibilité */}
        <h1 className="sr-only">{t('resume.title') || 'Online Resume'}</h1>
        
        {/* summary/objective et image */}
        <section className="summary-row" aria-label={t('resume.about') || 'About and objective'}>
          <section className="summary-container">
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
          </section>
          {/* image */}
          <img
            src="/profile.png"
            alt={`${userInfo?.fullName || 'photo placeholder pour le moment'}`}
            className="profile-img"
            loading="lazy"
          />
        </section>
        {/* Carousel section */}
        <section className="carousel-section" aria-label={t('resume.projects') || 'Projects'}>
          {projects.length > 0 && (
            <figure className="carousel-container">
              {/* Carousel titre */}
              <h2 className="carousel-title">
                {t('resume.projects')}
              </h2>
              {/* Carousel composant */}
              <Carousel
                items={projects.map(p => ({
                  title: p.title,
                  content: p.description
                }))}
              />
            </figure>
          )}
        </section>
      </main>
    </section>
  )
}

export default OnlineResume