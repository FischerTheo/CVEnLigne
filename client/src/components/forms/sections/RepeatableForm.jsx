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
  const TranslateBtn = ({ show, onClick, disabled }) => (
    show ? (
      <button
        type="button"
        className="btn btn-translate"
        title="Traduire"
        onClick={onClick}
        disabled={disabled}
      >{disabled ? '...' : 'Tr'}</button>
    ) : null
  )

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
        return (
          <div key={idx} className="form-row">
            <input
              placeholder={placeholder}
              value={val}
              onChange={e => handleArrayChange(field, idx, key !== null ? key : null, e.target.value)}
              className="form-input"
            />
            <TranslateBtn
              show={!!(showTranslateButtons && val && String(val).trim())}
              onClick={() => handleTranslate(field, idx, key !== null ? key : null)}
              disabled={loadingField === makeLoadKey(field, idx, key !== null ? key : null)}
            />
            {showRemoveButtons && form[field].length > 1 && (
              <button type="button" onClick={() => removeArrayItem(field, idx)} className="btn">-</button>
            )}
          </div>
        )
      })}
      {showAddButtons && (
        <button type="button" onClick={() => addArrayItem(field)} className="btn">Add {label.slice(0, -1)}</button>
      )}
    </>
  )

  return (
    <>
      {/* Languages */}
      <h3 className="form-section-title">Languages</h3>
      {form.languages.map((lang, idx) => (
        <div key={idx} className="form-row">
          <input
            placeholder="Language"
            value={lang.language}
            onChange={e => handleArrayChange('languages', idx, 'language', e.target.value)}
            className="form-input"
          />
          <TranslateBtn
            show={!!(showTranslateButtons && lang.language && String(lang.language).trim())}
            onClick={() => handleTranslate('languages', idx, 'language')}
            disabled={loadingField === makeLoadKey('languages', idx, 'language')}
          />
          <select
            value={lang.level}
            onChange={e => handleArrayChange('languages', idx, 'level', e.target.value)}
            className="form-input"
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
          />
          {showRemoveButtons && form.languages.length > 1 && (
            <button type="button" onClick={() => removeArrayItem('languages', idx)} className="btn">-</button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button type="button" onClick={() => addArrayItem('languages')} className="btn">Add Language</button>
      )}

      {/* Skills */}
      <h3 className="form-section-title">Skills</h3>
      {form.skills.map((sk, idx) => (
        <div key={idx} className="form-row">
          <input
            placeholder="Skill"
            value={sk.skill}
            onChange={e => handleArrayChange('skills', idx, 'skill', e.target.value)}
            className="form-input"
          />
          <TranslateBtn
            show={!!(showTranslateButtons && sk.skill && sk.skill.trim())}
            onClick={() => handleTranslate('skills', idx, 'skill')}
            disabled={loadingField === makeLoadKey('skills', idx, 'skill')}
          />
          <select
            value={sk.level}
            onChange={e => handleArrayChange('skills', idx, 'level', e.target.value)}
            className="form-input"
          >
            <option value="">Level</option>
            {skillLevels.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          {/* Bouton Traduire pour le select niveau uniquement si ce n'est pas le formulaire anglais */}
          {/* Level translate button removed as requested */}
          {showRemoveButtons && form.skills.length > 1 && (
            <button type="button" onClick={() => removeArrayItem('skills', idx)} className="btn">-</button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button type="button" onClick={() => addArrayItem('skills')} className="btn">Add Skill</button>
      )}

      {/* Soft Skills */}
      {champTab('Soft Skills', 'softSkills', 'e.g., teamwork, communication, problem-solving')}

      {/* Work Experiences */}
      <h3 className="form-section-title">Work Experiences</h3>
      {form.experiences.map((exp, idx) => (
        <div key={idx} className="form-item-container">
          <input placeholder="Job Title" value={exp.jobTitle} onChange={e => handleArrayChange('experiences', idx, 'jobTitle', e.target.value)} className="form-input" />
          <TranslateBtn
            show={!!(showTranslateButtons && exp.jobTitle && exp.jobTitle.trim())}
            onClick={() => handleTranslate('experiences', idx, 'jobTitle')}
            disabled={loadingField === makeLoadKey('experiences', idx, 'jobTitle')}
          />
          <input placeholder="Company Name" value={exp.company} onChange={e => handleArrayChange('experiences', idx, 'company', e.target.value)} className="form-input" />
          <input placeholder="Location" value={exp.location} onChange={e => handleArrayChange('experiences', idx, 'location', e.target.value)} className="form-input" />
          <div className="form-row">
            <input placeholder="Start Date" value={exp.startDate} onChange={e => handleArrayChange('experiences', idx, 'startDate', e.target.value)} className="form-input" />
            <input placeholder="End Date" value={exp.endDate} onChange={e => handleArrayChange('experiences', idx, 'endDate', e.target.value)} className="form-input" />
          </div>
          <AutoResizeTextarea
            placeholder="Responsibilities/Achievements"
            value={exp.responsibilities}
            onChange={e => handleArrayChange('experiences', idx, 'responsibilities', e.target.value)}
            className="form-textarea"
          />
          <TranslateBtn
            show={!!(showTranslateButtons && exp.responsibilities && exp.responsibilities.trim())}
            onClick={() => handleTranslate('experiences', idx, 'responsibilities')}
            disabled={loadingField === makeLoadKey('experiences', idx, 'responsibilities')}
          />
          {showRemoveButtons && form.experiences.length > 1 && (
            <button type="button" onClick={() => removeArrayItem('experiences', idx)} className="btn">-</button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button type="button" onClick={() => addArrayItem('experiences')} className="btn">Add Experience</button>
      )}

      {/* Certifications */}
      <h3 className="form-section-title">Certifications</h3>
      {form.certifications.map((cert, idx) => (
        <div key={idx} className="form-certification-container">
          <div className="form-row">
            <input
              placeholder="Certification Name"
              value={cert.certName}
              onChange={e => handleArrayChange('certifications', idx, 'certName', e.target.value)}
              className="form-input form-flex-2"
            />
            <TranslateBtn
              show={!!(showTranslateButtons && cert.certName && cert.certName.trim())}
              onClick={() => handleTranslate('certifications', idx, 'certName')}
              disabled={loadingField === makeLoadKey('certifications', idx, 'certName')}
            />
            <input
              placeholder="Issuing Organization"
              value={cert.certOrg}
              onChange={e => handleArrayChange('certifications', idx, 'certOrg', e.target.value)}
              className="form-input form-flex-2"
            />
          </div>
          <div className="form-row">
            <input
              placeholder="Date Obtained"
              value={cert.certDate}
              onChange={e => handleArrayChange('certifications', idx, 'certDate', e.target.value)}
              className="form-input form-flex-1"
            />
            <input
              type="file"
              accept="application/pdf"
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
                  } else {
                    alert('Upload failed: invalid response')
                  }
                } catch (e) {
                  alert(e.message || 'Upload failed')
                }
              }}
              className="form-input form-flex-1"
            />
            {cert.pdfUrl && (
              <a
                href={`${API}${cert.pdfUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-pdf-link"
              >
                View PDF
              </a>
            )}
          </div>
          <AutoResizeTextarea
            placeholder="Description (optional)"
            value={cert.certDesc}
            onChange={e => handleArrayChange('certifications', idx, 'certDesc', e.target.value)}
            className="form-textarea form-cert-desc"
          />
          <TranslateBtn
            show={!!(showTranslateButtons && cert.certDesc && cert.certDesc.trim())}
            onClick={() => handleTranslate('certifications', idx, 'certDesc')}
            disabled={loadingField === makeLoadKey('certifications', idx, 'certDesc')}
          />
          {showRemoveButtons && form.certifications.length > 1 && (
            <button type="button" onClick={async () => {
              try {
                const url = form.certifications[idx]?.pdfUrl
                if (url) {
                  await apiFetch(`/api/upload/pdf?path=${encodeURIComponent(url)}`, { method: 'DELETE' })
                }
              } catch {}
              removeArrayItem('certifications', idx)
            }} className="btn btn-remove">
              Remove Certification
            </button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button type="button" onClick={() => addArrayItem('certifications')} className="btn btn-add-cert">
          Add Certification
        </button>
      )}

      {/* References */}
      <h3 className="form-section-title">References</h3>
      {form.references.map((ref, idx) => (
        <div key={idx} className="form-row">
          <AutoResizeTextarea
            placeholder="Reference"
            value={ref.text}
            onChange={e => handleArrayChange('references', idx, 'text', e.target.value)}
            className="form-textarea"
          />
          <TranslateBtn
            show={!!(showTranslateButtons && ref.text && ref.text.trim())}
            onClick={() => handleTranslate('references', idx, 'text')}
            disabled={loadingField === makeLoadKey('references', idx, 'text')}
          />
          {/* Remove PDF Upload for References */}
          {showRemoveButtons && form.references.length > 1 && (
            <button type="button" onClick={() => removeArrayItem('references', idx)} className="btn">-</button>
          )}
        </div>
      ))}
      {showAddButtons && (
        <button type="button" onClick={() => addArrayItem('references')} className="btn">Add Reference</button>
      )}

      {/* Hobbies */}
      {champTab('Hobbies', 'hobbies', 'Hobby', null)}
    </>
  )
}

export default RepeatableForm