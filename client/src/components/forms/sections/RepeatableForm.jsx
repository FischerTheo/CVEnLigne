// Formulaire des champs répétables (langues, compétences, expériences, projets...)
// Gère les listes dynamiques avec possibilité d'ajouter/supprimer des éléments
// et de traduire chaque champ individuellement via l'API
import React, { useState } from 'react'
import AutoResizeTextarea from '../../common/AutoResizeTextarea'
import { API, apiFetch } from '../../../lib/api'
import { toast } from 'react-toastify'

function RepeatableForm({
  form,                    // Données du formulaire 
  handleArrayChange,       // Fonction pour modifier un élément d'un tableau
  addArrayItem,            // Fonction pour ajouter un élément à un tableau
  removeArrayItem,         // Fonction pour supprimer un élément d'un tableau
  showTranslateButtons,    // true = affiche les boutons de traduction (formulaire FR uniquement)
  showAddButtons = true,   // false = masque les boutons "Add" (formulaire EN en lecture seule)
  showRemoveButtons = true,// false = masque les boutons "Remove" (formulaire EN en lecture seule)
  effectiveLang = 'fr',    // Langue active pour adapter les textes des niveaux ('fr' ou 'en')
  idPrefix = 'form'
}) {
  // État pour tracker quel champ est en cours de traduction
  const [loadingField, setLoadingField] = useState(null)

  const buildId = (...segments) => [idPrefix, ...segments]
    .filter(segment => segment !== null && segment !== undefined && segment !== '')
    .join('-')

  const fieldLabelMap = {
    languages: 'Langue',
    skills: 'Compétence',
    softSkills: 'Soft skill',
    experiences: 'Expérience',
    certifications: 'Certification',
    references: 'Référence',
    hobbies: 'Loisir',
    projects: 'Projet'
  }

  const fieldKeyLabelMap = {
    languages: { language: 'nom', level: 'niveau' },
    skills: { skill: 'nom', level: 'niveau' },
    experiences: {
      jobTitle: 'intitulé du poste',
      company: 'entreprise',
      location: 'lieu',
      startDate: 'date de début',
      endDate: 'date de fin',
      responsibilities: 'responsabilités'
    },
    certifications: {
      certName: 'nom',
      certOrg: 'organisme',
      certDate: 'date',
      certDesc: 'description',
      pdfUrl: 'fichier'
    },
    projects: { title: 'titre', description: 'description' },
    references: { text: 'texte' },
    softSkills: { skill: 'intitulé' },
    hobbies: { value: 'valeur' }
  }

  // Génère une clé unique pour identifier un champ (ex: "experiences-0-jobTitle")
  const makeLoadKey = (field, idx, key) => key ? `${field}-${idx}-${key}` : `${field}-${idx}`

  // Bouton de traduction réutilisable pour chaque champ
  // Affiche "Tr" par défaut, "Traduire" en taille large, "..." pendant le chargement
  const TranslateBtn = ({ show, onClick, disabled, fieldName, size = 'default' }) => {
    const sizeClass = size === 'sm' ? 'btn-translate-sm' : size === 'lg' ? 'btn-translate-lg' : '';
    return show ? (
      <button
        type="button"
        className={`btn btn-translate ${sizeClass}`}
        title="Traduire"
        onClick={onClick}
        disabled={disabled}
        aria-label={`Traduire ${fieldName || 'ce champ'}`}
      >{disabled ? '...' : size === 'lg' ? 'Traduire' : 'Tr'}</button>
    ) : null
  }

  // Traduit un champ spécifique via l'API 
  // Paramètres: field = nom du tableau, idx = index de l'élément, key = propriété à traduire
  async function handleTranslate(field, idx, key = null) {
    const loadKey = makeLoadKey(field, idx, key)
    
    // Récupère l'élément ciblé dans le tableau
    const item = form[field] && form[field][idx]
    if (!item) return
    
    // Récupère la valeur à traduire (item ou item[key])
    const value = key === null ? item : item[key]
    if (!value || !String(value).trim()) return
    
    // Active le loader pour ce champ spécifique
    setLoadingField(loadKey)
    try {
      // Appel l'API de traduction
      const data = await apiFetch('/api/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, source: 'fr', target: 'en' })
      })
      const translatedText = data?.translatedText ?? value
      
      // Met à jour le formulaire avec le texte traduit
      handleArrayChange(field, idx, key, translatedText)
      
      // Notification utilisateur
      const fieldBase = fieldLabelMap[field] || 'Champ'
      const itemIndexLabel = `${fieldBase} ${idx + 1}`
      const detail = key ? fieldKeyLabelMap[field]?.[key] || key : null
      const label = detail ? `${itemIndexLabel} (${detail})` : itemIndexLabel
      if (translatedText === value) {
        toast.info(`${label} : aucune modification (déjà traduit ?)`, { autoClose: 2000 })
      } else {
        toast.success(`${label} : traduction appliquée`, { autoClose: 2000 })
      }
    } catch (e) {
      console.error('Translation failed:', e)
      const fieldBase = fieldLabelMap[field] || 'Champ'
      toast.error(`${fieldBase} ${idx + 1} : échec de la traduction`, { autoClose: 10000 })
    } finally {
      // Désactive le loader
      setLoadingField(null)
    }
  }
  
  // Liste des niveaux de compétences selon la langue active
  const skillLevels = effectiveLang === 'en' 
    ? ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    : ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
  
  // Fonction utilitaire pour générer rapidement un champ répétable simple
  // Utilisée pour les Soft Skills et Hobbies (listes de strings simples)
  const champTab = (label, field, placeholder, key = 'skill') => (
    <>
      <h3 className="form-section-title">{label}</h3>
      {form[field].map((item, idx) => {
        const val = key !== null ? item[key] : item
        const itemLabel = `${label.slice(0, -1)} ${idx + 1}`
        return (
          <fieldset key={idx} className="form-row">
            <legend className="sr-only">{itemLabel}</legend>
            <label htmlFor={buildId(field, idx, key || 'value')} className="sr-only">{itemLabel}</label>
            <input
              id={buildId(field, idx, key || 'value')}
              name={`${field}[${idx}]${key ? '.' + key : ''}`}
              placeholder={placeholder}
              value={val}
              onChange={e => handleArrayChange(field, idx, key !== null ? key : null, e.target.value)}
              autoComplete="off"
              className="form-input"
              aria-label={itemLabel}
            />
            <TranslateBtn
              show={!!(showTranslateButtons && val && String(val).trim())}
              onClick={() => handleTranslate(field, idx, key !== null ? key : null)}
              disabled={loadingField === makeLoadKey(field, idx, key !== null ? key : null)}
              fieldName={itemLabel.toLowerCase()}
            />
            {showRemoveButtons && form[field].length > 1 && (
              <button 
                type="button" 
                onClick={() => removeArrayItem(field, idx)} 
                className="btn btn-remove"
                aria-label={`Remove ${itemLabel.toLowerCase()}`}
              >-</button>
            )}
          </fieldset>
        )
      })}
      {showAddButtons && (
        <button 
          type="button" 
          onClick={() => addArrayItem(field)} 
          className="btn btn-add"
          aria-label={`Add a new ${label.slice(0, -1).toLowerCase()}`}
        >Add {label.slice(0, -1)}</button>
      )}
    </>
  )

  return (
    <>
      {/* Languages */}
      <h3 className="form-section-title">Languages</h3>
      {form.languages.map((lang, idx) => (
        <fieldset key={idx} className="form-row">
          <legend className="sr-only">Language {idx + 1}</legend>
          <label htmlFor={buildId('language', idx)} className="sr-only">Language {idx + 1} Name</label>
          <input
            id={buildId('language', idx)}
            name={`languages[${idx}].language`}
            placeholder="Language"
            value={lang.language}
            onChange={e => handleArrayChange('languages', idx, 'language', e.target.value)}
            autoComplete="off"
            className="form-input"
            aria-label={`Language ${idx + 1} name`}
          />
          <TranslateBtn
            show={!!(showTranslateButtons && lang.language && String(lang.language).trim())}
            onClick={() => handleTranslate('languages', idx, 'language')}
            disabled={loadingField === makeLoadKey('languages', idx, 'language')}
            fieldName={`language ${idx + 1} name`}
          />
          <label htmlFor={buildId('language-level', idx)} className="sr-only">Language {idx + 1} Level</label>
          <select
            id={buildId('language-level', idx)}
            name={`languages[${idx}].level`}
            value={lang.level}
            onChange={e => handleArrayChange('languages', idx, 'level', e.target.value)}
            autoComplete="off"
            className="form-input"
            aria-label={`Language ${idx + 1} proficiency level`}
          >
            <option value="">Level</option>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'].map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          <TranslateBtn
            show={!!(showTranslateButtons && lang.level && String(lang.level).trim() && effectiveLang !== 'en')}
            onClick={() => handleTranslate('languages', idx, 'level')}
            disabled={loadingField === makeLoadKey('languages', idx, 'level')}
            fieldName={`language ${idx + 1} level`}
          />
          {showRemoveButtons && form.languages.length > 1 && (
            <button 
              type="button" 
              onClick={() => removeArrayItem('languages', idx)} 
              className="btn btn-remove"
              aria-label={`Remove language ${idx + 1}`}
            >-</button>
          )}
        </fieldset>
      ))}
      {showAddButtons && (
        <button 
          type="button" 
          onClick={() => addArrayItem('languages')} 
          className="btn btn-add"
          aria-label="Add a new language"
        >Add Language</button>
      )}

      {/* Skills */}
      <h3 className="form-section-title">Skills</h3>
      {form.skills.map((sk, idx) => (
        <div key={idx} className="form-row">
          <label htmlFor={buildId('skill', idx)} className="sr-only">Skill {idx + 1} Name</label>
          <input
            id={buildId('skill', idx)}
            name={`skills[${idx}].skill`}
            placeholder="Skill"
            value={sk.skill}
            onChange={e => handleArrayChange('skills', idx, 'skill', e.target.value)}
            autoComplete="off"
            className="form-input"
            aria-label={`Skill ${idx + 1} name`}
          />
          <TranslateBtn
            show={!!(showTranslateButtons && sk.skill && sk.skill.trim())}
            onClick={() => handleTranslate('skills', idx, 'skill')}
            disabled={loadingField === makeLoadKey('skills', idx, 'skill')}
            fieldName={`skill ${idx + 1} name`}
          />
          <label htmlFor={buildId('skill-level', idx)} className="sr-only">Skill {idx + 1} Level</label>
          <select
            id={buildId('skill-level', idx)}
            name={`skills[${idx}].level`}
            value={sk.level}
            onChange={e => handleArrayChange('skills', idx, 'level', e.target.value)}
            autoComplete="off"
            className="form-input"
            aria-label={`Skill ${idx + 1} proficiency level`}
          >
            <option value="">Level</option>
            {skillLevels.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          {/* Bouton Traduire pour le select niveau uniquement si ce n'est pas le formulaire anglais */}
          {showRemoveButtons && form.skills.length > 1 && (
            <button 
              type="button" 
              onClick={() => removeArrayItem('skills', idx)} 
              className="btn btn-remove"
              aria-label={`Remove skill ${idx + 1}`}
            >-</button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button 
          type="button" 
          onClick={() => addArrayItem('skills')} 
          className="btn btn-add"
          aria-label="Add a new skill"
        >Add Skill</button>
      )}

      {/* Soft Skills */}
      {champTab('Soft Skills', 'softSkills', 'e.g., teamwork, communication, problem-solving')}

      {/* Work Experiences */}
      <h3 className="form-section-title">Work Experiences</h3>
      {form.experiences.map((exp, idx) => (
        <div key={idx} className="form-item-container">
          <label htmlFor={buildId('exp-jobTitle', idx)} className="sr-only">Experience {idx + 1} Job Title</label>
          <input 
            id={buildId('exp-jobTitle', idx)} 
            name={`experiences[${idx}].jobTitle`} 
            placeholder="Job Title" 
            value={exp.jobTitle} 
            onChange={e => handleArrayChange('experiences', idx, 'jobTitle', e.target.value)} 
            autoComplete="organization-title" 
            className="form-input"
            aria-label={`Experience ${idx + 1} job title`}
          />
          <TranslateBtn
            show={!!(showTranslateButtons && exp.jobTitle && exp.jobTitle.trim())}
            onClick={() => handleTranslate('experiences', idx, 'jobTitle')}
            disabled={loadingField === makeLoadKey('experiences', idx, 'jobTitle')}
            fieldName={`experience ${idx + 1} job title`}
            size="sm"
          />
          <label htmlFor={buildId('exp-company', idx)} className="sr-only">Experience {idx + 1} Company Name</label>
          <input 
            id={buildId('exp-company', idx)} 
            name={`experiences[${idx}].company`} 
            placeholder="Company Name" 
            value={exp.company} 
            onChange={e => handleArrayChange('experiences', idx, 'company', e.target.value)} 
            autoComplete="organization" 
            className="form-input"
            aria-label={`Experience ${idx + 1} company name`}
          />
          <label htmlFor={buildId('exp-location', idx)} className="sr-only">Experience {idx + 1} Location</label>
          <input 
            id={buildId('exp-location', idx)} 
            name={`experiences[${idx}].location`} 
            placeholder="Location" 
            value={exp.location} 
            onChange={e => handleArrayChange('experiences', idx, 'location', e.target.value)} 
            autoComplete="address-level2" 
            className="form-input"
            aria-label={`Experience ${idx + 1} location`}
          />
          <div className="form-row">
            <label htmlFor={buildId('exp-startDate', idx)} className="sr-only">Experience {idx + 1} Start Date</label>
            <input 
              id={buildId('exp-startDate', idx)} 
              name={`experiences[${idx}].startDate`} 
              placeholder="Start Date" 
              value={exp.startDate} 
              onChange={e => handleArrayChange('experiences', idx, 'startDate', e.target.value)} 
              autoComplete="off" 
              className="form-input"
              aria-label={`Experience ${idx + 1} start date`}
            />
            <label htmlFor={buildId('exp-endDate', idx)} className="sr-only">Experience {idx + 1} End Date</label>
            <input 
              id={buildId('exp-endDate', idx)} 
              name={`experiences[${idx}].endDate`} 
              placeholder="End Date" 
              value={exp.endDate} 
              onChange={e => handleArrayChange('experiences', idx, 'endDate', e.target.value)} 
              autoComplete="off" 
              className="form-input"
              aria-label={`Experience ${idx + 1} end date`}
            />
          </div>
          <label htmlFor={buildId('exp-responsibilities', idx)} className="sr-only">Experience {idx + 1} Responsibilities</label>
          <AutoResizeTextarea
            id={buildId('exp-responsibilities', idx)}
            name={`experiences[${idx}].responsibilities`}
            placeholder="Responsibilities/Achievements"
            value={exp.responsibilities}
            onChange={e => handleArrayChange('experiences', idx, 'responsibilities', e.target.value)}
            autoComplete="off"
            className="form-textarea"
            aria-label={`Experience ${idx + 1} responsibilities and achievements`}
          />
          <TranslateBtn
            show={!!(showTranslateButtons && exp.responsibilities && exp.responsibilities.trim())}
            onClick={() => handleTranslate('experiences', idx, 'responsibilities')}
            disabled={loadingField === makeLoadKey('experiences', idx, 'responsibilities')}
            fieldName={`experience ${idx + 1} responsibilities`}
            size="lg"
          />
          {showRemoveButtons && form.experiences.length > 1 && (
            <button 
              type="button" 
              onClick={() => removeArrayItem('experiences', idx)} 
              className="btn btn-remove"
              aria-label={`Remove experience ${idx + 1}`}
            >-</button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button 
          type="button" 
          onClick={() => addArrayItem('experiences')} 
          className="btn btn-add"
          aria-label="Add a new work experience"
        >Add Experience</button>
      )}

      {/* Certifications */}
      <h3 className="form-section-title">Certifications</h3>
      {form.certifications.map((cert, idx) => (
        <div key={idx} className="form-certification-container">
          <div className="form-row">
            <label htmlFor={buildId('cert-name', idx)} className="sr-only">Certification {idx + 1} Name</label>
            <input
              id={buildId('cert-name', idx)}
              name={`certifications[${idx}].certName`}
              placeholder="Certification Name"
              value={cert.certName}
              onChange={e => handleArrayChange('certifications', idx, 'certName', e.target.value)}
              autoComplete="off"
              className="form-input form-flex-2"
              aria-label={`Certification ${idx + 1} name`}
            />
            <TranslateBtn
              show={!!(showTranslateButtons && cert.certName && cert.certName.trim())}
              onClick={() => handleTranslate('certifications', idx, 'certName')}
              disabled={loadingField === makeLoadKey('certifications', idx, 'certName')}
              fieldName={`certification ${idx + 1} name`}
              size="sm"
            />
            <label htmlFor={buildId('cert-org', idx)} className="sr-only">Certification {idx + 1} Organization</label>
            <input
              id={buildId('cert-org', idx)}
              name={`certifications[${idx}].certOrg`}
              placeholder="Issuing Organization"
              value={cert.certOrg}
              onChange={e => handleArrayChange('certifications', idx, 'certOrg', e.target.value)}
              autoComplete="organization"
              className="form-input form-flex-2"
              aria-label={`Certification ${idx + 1} issuing organization`}
            />
          </div>
          <div className="form-row">
            <label htmlFor={buildId('cert-date', idx)} className="sr-only">Certification {idx + 1} Date</label>
            <input
              id={buildId('cert-date', idx)}
              name={`certifications[${idx}].certDate`}
              placeholder="Date Obtained"
              value={cert.certDate}
              onChange={e => handleArrayChange('certifications', idx, 'certDate', e.target.value)}
              autoComplete="off"
              className="form-input form-flex-1"
              aria-label={`Certification ${idx + 1} date obtained`}
            />
          </div>
          
          {/* Section upload PDF certif */}
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label htmlFor={buildId('cert-pdf', idx)} className="cert-pdf-label">
              Certificat PDF {idx + 1}
            </label>
            <div className="cert-pdf-upload-row">
              <input
                type="file"
                id={buildId('cert-pdf', idx)}
                accept="application/pdf"
                aria-label={`Upload PDF certificate ${idx + 1}`}
                onChange={async e => {
                  const file = e.target.files[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('pdf', file)
                  try {
                    const fileName = file.name
                    const data = await apiFetch(`/api/upload/pdf`, {
                      method: 'POST',
                      body: formData
                    })
                    if (data?.path) {
                      handleArrayChange('certifications', idx, 'pdfUrl', data.path)
                      toast.success(`Certificat PDF "${fileName}" uploadé avec succès`, { autoClose: 2000 })
                    } else {
                      toast.error('Réponse serveur invalide : URL du certificat manquante', { autoClose: 10000 })
                    }
                  } catch (e) {
                    toast.error(e.message || 'Erreur lors de l\'upload du certificat PDF', { autoClose: 10000 })
                  }
                }}
                className="cert-pdf-input"
              />
              {cert.pdfUrl && (
                <>
                  <a
                    href={`${API}${cert.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-pdf-link"
                    aria-label={`View PDF certificate ${idx + 1}`}
                  >
                    Voir le PDF
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await apiFetch(`/api/upload/pdf?path=${encodeURIComponent(cert.pdfUrl)}`, {
                          method: 'DELETE'
                        })
                        handleArrayChange('certifications', idx, 'pdfUrl', '')
                        const fileName = cert.pdfUrl ? decodeURIComponent(cert.pdfUrl.split('/').pop() || '') : ''
                        toast.success(fileName ? `Certificat PDF "${fileName}" supprimé` : 'Certificat PDF supprimé', { autoClose: 2000 })
                      } catch (e) {
                        toast.error(e.message || 'Erreur lors de la suppression du certificat PDF', { autoClose: 10000 })
                      }
                    }}
                    className="btn btn-remove btn-remove-pdf"
                    aria-label={`Delete PDF certificate ${idx + 1}`}
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
          <label htmlFor={buildId('cert-desc', idx)} className="sr-only">Certification {idx + 1} Description</label>
          <AutoResizeTextarea
            id={buildId('cert-desc', idx)}
            name={`certifications[${idx}].certDesc`}
            placeholder="Description (optional)"
            value={cert.certDesc}
            onChange={e => handleArrayChange('certifications', idx, 'certDesc', e.target.value)}
            autoComplete="off"
            className="form-textarea form-cert-desc"
            aria-label={`Certification ${idx + 1} description`}
          />
          <TranslateBtn
            show={!!(showTranslateButtons && cert.certDesc && cert.certDesc.trim())}
            onClick={() => handleTranslate('certifications', idx, 'certDesc')}
            disabled={loadingField === makeLoadKey('certifications', idx, 'certDesc')}
            fieldName={`certification ${idx + 1} description`}
            size="lg"
          />
          {showRemoveButtons && form.certifications.length > 1 && (
            <button 
              type="button" 
              onClick={async () => {
                try {
                  const url = form.certifications[idx]?.pdfUrl
                  if (url) {
                    await apiFetch(`/api/upload/pdf?path=${encodeURIComponent(url)}`, { method: 'DELETE' })
                  }
                } catch {}
                removeArrayItem('certifications', idx)
              }} 
              className="btn btn-remove"
              aria-label={`Remove certification ${idx + 1}`}
            >
              Remove Certification
            </button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button 
          type="button" 
          onClick={() => addArrayItem('certifications')} 
          className="btn btn-add btn-add-cert"
          aria-label="Add a new certification"
        >
          Add Certification
        </button>
      )}

      {/* References */}
      <h3 className="form-section-title">References</h3>
      {form.references.map((ref, idx) => (
        <div key={idx} className="form-item-container">
          <label htmlFor={buildId('reference', idx)} className="sr-only">Reference {idx + 1}</label>
          <AutoResizeTextarea
            id={buildId('reference', idx)}
            name={`references[${idx}].text`}
            placeholder="Reference"
            value={ref.text}
            onChange={e => handleArrayChange('references', idx, 'text', e.target.value)}
            autoComplete="off"
            className="form-textarea"
            aria-label={`Reference ${idx + 1} text`}
          />
          <TranslateBtn
            show={!!(showTranslateButtons && ref.text && ref.text.trim())}
            onClick={() => handleTranslate('references', idx, 'text')}
            disabled={loadingField === makeLoadKey('references', idx, 'text')}
            fieldName={`reference ${idx + 1}`}
            size="lg"
          />
          {/* ajoute ou supp des references */}
          {showRemoveButtons && form.references.length > 1 && (
            <button 
              type="button" 
              onClick={() => removeArrayItem('references', idx)} 
              className="btn btn-remove"
              aria-label={`Remove reference ${idx + 1}`}
            >-</button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button 
          type="button" 
          onClick={() => addArrayItem('references')} 
          className="btn btn-add"
          aria-label="Add a new reference"
        >Add Reference</button>
      )}

      {/* Hobbies */}
      {champTab('Hobbies', 'hobbies', 'Hobby', null)}
    </>
  )
}

export default RepeatableForm