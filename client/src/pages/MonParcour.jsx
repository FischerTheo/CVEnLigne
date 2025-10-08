
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch, API } from '../lib/api';

function MonParcour() {
  const { t, i18n } = useTranslation('main');
  const [experiences, setExperiences] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [references, setReferences] = useState([]);

  useEffect(() => {
    // Fetch user info pour experiences, certifications, references
    apiFetch(`/api/userinfo/admin?lang=${i18n.language}`)
      .then(data => {
        setExperiences(Array.isArray(data?.experiences) ? data.experiences : []);
        setCertifications(Array.isArray(data?.certifications) ? data.certifications : []);
        setReferences(Array.isArray(data?.references) ? data.references : []);
      })
      .catch(() => {
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
    <div className="parcour-container" id="main-content">
      <h1 className="parcour-title">{t('resume.monParcour')}</h1>
      <div className="parcour-content">
        <div className="parcour-column">
          <div className="parcour-section-title">Références</div>
          <ul className="parcour-list">
            {references.length === 0 && <li className="parcour-empty">Aucune référence</li>}
            {references.map((ref, idx) => (
              <li key={idx} className="parcour-item">
                <div className="parcour-item-content">{(ref && typeof ref === 'object') ? (ref.text || '') : String(ref || '')}</div>
              </li>
            ))}
          </ul>
        </div>
        {/* Experiences ccolonne */}
        <div className="parcour-column">
          <div className="parcour-section-title">Expériences professionnelles</div>
          <ul className="parcour-list">
            {experiences.length === 0 && <li className="parcour-empty">Aucune expérience</li>}
            {experiences.map((exp, idx) => (
              <li key={idx} className="parcour-item">
                <div className="parcour-item-title">{exp.jobTitle}</div>
                <div className="parcour-item-company">{exp.company}</div>
                <div className="parcour-item-meta">{exp.location} | {exp.startDate} - {exp.endDate}</div>
                <div className="parcour-item-content">{exp.responsibilities}</div>
              </li>
            ))}
          </ul>
        </div>
        {/* Certifications colonne */}
        <div className="parcour-column">
          <div className="parcour-section-title">Certifications</div>
          <ul className="parcour-list">
            {certifications.length === 0 && <li className="parcour-empty">Aucune certification</li>}
            {certifications.map((cert, idx) => (
              <li key={idx} className="parcour-item">
                <div className="parcour-item-title">{cert.certName}</div>
                <div className="parcour-item-company">{cert.certOrg}</div>
                <div className="parcour-item-meta">{cert.certDate}</div>
                <div className="parcour-item-content">{cert.certDesc}</div>
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
        </div>
      </div>
    </div>
  );
}

export default MonParcour;
