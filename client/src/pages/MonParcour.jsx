
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch, API } from '../lib/api';

function MonParcour() {
  const { t, i18n } = useTranslation('main');
  const [experiences, setExperiences] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [references, setReferences] = useState([]);

  useEffect(() => {
    // Normaliser la langue (fr-FR -> fr, en-US -> en)
    const lang = i18n.language.split('-')[0]
    // Fetch user info pour experiences, certifications, references
    apiFetch(`/api/userinfo/admin?lang=${lang}`)
      .then(data => {
        setExperiences(Array.isArray(data?.experiences) ? data.experiences : []);
        setCertifications(Array.isArray(data?.certifications) ? data.certifications : []);
        setReferences(Array.isArray(data?.references) ? data.references : []);
      })
      .catch(err => {
        console.error('Failed to fetch parcour data:', err)
        setExperiences([])
        setCertifications([])
        setReferences([])
      })
  }, [i18n.language]);

  // Met à jour le titre de la page 
  useEffect(() => {
    document.title = i18n.language === 'fr' ? 'Mon Parcours - CV en ligne' : 'My Career - Online Resume'
  }, [i18n.language]);

  return (
    <main className="parcour-container" id="main-content">
      <h1 className="parcour-title">{t('resume.monParcour')}</h1>
      <section className="parcour-content">
        <article className="parcour-column">
          <h2 className="parcour-section-title">Références</h2>
          <ul className="parcour-list">
            {references.length === 0 && <li className="parcour-empty">Aucune référence</li>}
            {references.map((ref, idx) => (
              <li key={idx} className="parcour-item">
                <p className="parcour-item-content">{(ref && typeof ref === 'object') ? (ref.text || '') : String(ref || '')}</p>
              </li>
            ))}
          </ul>
        </article>
        {/* Experiences ccolonne */}
        <article className="parcour-column">
          <h2 className="parcour-section-title">Expériences professionnelles</h2>
          <ul className="parcour-list">
            {experiences.length === 0 && <li className="parcour-empty">Aucune expérience</li>}
            {experiences.map((exp, idx) => (
              <li key={idx} className="parcour-item">
                <h3 className="parcour-item-title">{exp.jobTitle}</h3>
                <p className="parcour-item-company">{exp.company}</p>
                <p className="parcour-item-meta">{exp.location} | {exp.startDate} - {exp.endDate}</p>
                <p className="parcour-item-content">{exp.responsibilities}</p>
              </li>
            ))}
          </ul>
        </article>
        {/* Certifications colonne */}
        <article className="parcour-column">
          <h2 className="parcour-section-title">Certifications</h2>
          <ul className="parcour-list">
            {certifications.length === 0 && <li className="parcour-empty">Aucune certification</li>}
            {certifications.map((cert, idx) => (
              <li key={idx} className="parcour-item">
                <h3 className="parcour-item-title">{cert.certName}</h3>
                <p className="parcour-item-company">{cert.certOrg}</p>
                <p className="parcour-item-meta">{cert.certDate}</p>
                <p className="parcour-item-content">{cert.certDesc}</p>
                {cert.pdfUrl && (
                  <a
                    href={`${API}${cert.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="parcour-pdf-link"
                  >Voir PDF</a>
                )}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default MonParcour;
