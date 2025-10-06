// Formulaire des champs répétables (langues, compétences, expériences, projets...)
import React, { useState } from 'react'
import AutoResizeTextarea from '../../common/AutoResizeTextarea'
import { API, apiFetch } from '../../../lib/api'
import { toast } from 'react-toastify'

function RepeatableForm({
  form,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  showTranslateButtons,
  showAddButtons = true,
  showRemoveButtons = true,
  effectiveLang = 'fr'
}) {
  const [loadingField, setLoadingField] = useState(null)
  const makeLoadKey = (field, idx, key) => key ? `${field}-${idx}-${key}` : `${field}-${idx}`

  // Bouton de traduction pour chaque champ d'un tableau
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

  // Fonction pour traduire un champ d'un tableau (FR <-> EN)
  async function handleTranslate(field, idx, key = null) {
    const loadKey = makeLoadKey(field, idx, key)
    const item = form[field] && form[field][idx]
    if (!item) return
    const value = key === null ? item : item[key]
    if (!value || !String(value).trim()) return
    setLoadingField(loadKey)
    try {
      const data = await apiFetch('/api/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, source: 'fr', target: 'en' })
      })
      const translatedText = data?.translatedText ?? value
      // update the array value (key may be null for primitive arrays)
      handleArrayChange(field, idx, key, translatedText)
      if (translatedText === value) toast.info("Aucune modification (peut-être déjà traduit).")
      else toast.success('Traduction appliquée.')
    } catch (e) {
      console.error('Translation failed:', e)
      toast.error('Échec de la traduction')
    } finally {
      setLoadingField(null)
    }
  }
  
  // Liste des niveaux de compétences selon la langue
  const skillLevels = effectiveLang === 'en' 
    ? ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    : ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
  // pour optimiser les champs tableaux
  const champTab = (label, field, placeholder, key = 'skill') => (
    <>
      <h3 className="form-section-title">{label}</h3>
      {form[field].map((item, idx) => {
        const val = key !== null ? item[key] : item
        const itemLabel = `${label.slice(0, -1)} ${idx + 1}`
        return (
          <div key={idx} className="form-row">
            <label htmlFor={`${field}-${idx}-${key || 'value'}`} className="sr-only">{itemLabel}</label>
            <input
              id={`${field}-${idx}-${key || 'value'}`}
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
          </div>
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
        <div key={idx} className="form-row">
          <label htmlFor={`language-${idx}`} className="sr-only">Language {idx + 1} Name</label>
          <input
            id={`language-${idx}`}
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
          <label htmlFor={`language-level-${idx}`} className="sr-only">Language {idx + 1} Level</label>
          <select
            id={`language-level-${idx}`}
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
        </div>
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
          <label htmlFor={`skill-${idx}`} className="sr-only">Skill {idx + 1} Name</label>
          <input
            id={`skill-${idx}`}
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
          <label htmlFor={`skill-level-${idx}`} className="sr-only">Skill {idx + 1} Level</label>
          <select
            id={`skill-level-${idx}`}
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
          {/* Level translate button removed as requested */}
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
          <label htmlFor={`exp-jobTitle-${idx}`} className="sr-only">Experience {idx + 1} Job Title</label>
          <input 
            id={`exp-jobTitle-${idx}`} 
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
          <label htmlFor={`exp-company-${idx}`} className="sr-only">Experience {idx + 1} Company Name</label>
          <input 
            id={`exp-company-${idx}`} 
            name={`experiences[${idx}].company`} 
            placeholder="Company Name" 
            value={exp.company} 
            onChange={e => handleArrayChange('experiences', idx, 'company', e.target.value)} 
            autoComplete="organization" 
            className="form-input"
            aria-label={`Experience ${idx + 1} company name`}
          />
          <label htmlFor={`exp-location-${idx}`} className="sr-only">Experience {idx + 1} Location</label>
          <input 
            id={`exp-location-${idx}`} 
            name={`experiences[${idx}].location`} 
            placeholder="Location" 
            value={exp.location} 
            onChange={e => handleArrayChange('experiences', idx, 'location', e.target.value)} 
            autoComplete="address-level2" 
            className="form-input"
            aria-label={`Experience ${idx + 1} location`}
          />
          <div className="form-row">
            <label htmlFor={`exp-startDate-${idx}`} className="sr-only">Experience {idx + 1} Start Date</label>
            <input 
              id={`exp-startDate-${idx}`} 
              name={`experiences[${idx}].startDate`} 
              placeholder="Start Date" 
              value={exp.startDate} 
              onChange={e => handleArrayChange('experiences', idx, 'startDate', e.target.value)} 
              autoComplete="off" 
              className="form-input"
              aria-label={`Experience ${idx + 1} start date`}
            />
            <label htmlFor={`exp-endDate-${idx}`} className="sr-only">Experience {idx + 1} End Date</label>
            <input 
              id={`exp-endDate-${idx}`} 
              name={`experiences[${idx}].endDate`} 
              placeholder="End Date" 
              value={exp.endDate} 
              onChange={e => handleArrayChange('experiences', idx, 'endDate', e.target.value)} 
              autoComplete="off" 
              className="form-input"
              aria-label={`Experience ${idx + 1} end date`}
            />
          </div>
          <label htmlFor={`exp-responsibilities-${idx}`} className="sr-only">Experience {idx + 1} Responsibilities</label>
          <AutoResizeTextarea
            id={`exp-responsibilities-${idx}`}
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
            <label htmlFor={`cert-name-${idx}`} className="sr-only">Certification {idx + 1} Name</label>
            <input
              id={`cert-name-${idx}`}
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
            <label htmlFor={`cert-org-${idx}`} className="sr-only">Certification {idx + 1} Organization</label>
            <input
              id={`cert-org-${idx}`}
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
            <label htmlFor={`cert-date-${idx}`} className="sr-only">Certification {idx + 1} Date</label>
            <input
              id={`cert-date-${idx}`}
              name={`certifications[${idx}].certDate`}
              placeholder="Date Obtained"
              value={cert.certDate}
              onChange={e => handleArrayChange('certifications', idx, 'certDate', e.target.value)}
              autoComplete="off"
              className="form-input form-flex-1"
              aria-label={`Certification ${idx + 1} date obtained`}
            />
          </div>
          
          {/* Section upload PDF certification */}
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label htmlFor={`cert-pdf-${idx}`} className="cert-pdf-label">
              Certificat PDF {idx + 1}
            </label>
            <div className="cert-pdf-upload-row">
              <input
                type="file"
                id={`cert-pdf-${idx}`}
                accept="application/pdf"
                aria-label={`Upload PDF certificate ${idx + 1}`}
                onChange={async e => {
                  const file = e.target.files[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('pdf', file)
                  try {
                    const data = await apiFetch(`/api/upload/pdf`, {
                      method: 'POST',
                      body: formData
                    })
                    if (data?.path) {
                      handleArrayChange('certifications', idx, 'pdfUrl', data.path)
                      toast.success('Certificat PDF uploadé avec succès!')
                    } else {
                      toast.error('Réponse upload invalide')
                    }
                  } catch (e) {
                    toast.error(e.message || 'Erreur lors de l\'upload du PDF')
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
                        toast.success('Certificat PDF supprimé!')
                      } catch (e) {
                        toast.error('Erreur lors de la suppression du PDF')
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
          <label htmlFor={`cert-desc-${idx}`} className="sr-only">Certification {idx + 1} Description</label>
          <AutoResizeTextarea
            id={`cert-desc-${idx}`}
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
          <label htmlFor={`reference-${idx}`} className="sr-only">Reference {idx + 1}</label>
          <AutoResizeTextarea
            id={`reference-${idx}`}
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
          {/* Remove PDF Upload for References */}
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