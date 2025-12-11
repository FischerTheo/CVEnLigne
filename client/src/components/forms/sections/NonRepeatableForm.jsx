// Formulaire des champs non répétables (infos utilisateur, résumé, objectif...)
import React, { useState } from 'react'
import AutoResizeTextarea from '../../common/AutoResizeTextarea'
import { apiFetch } from '../../../lib/api'
import { toast } from 'react-toastify'

function NonRepeatableForm({ form, handleChange, showTranslateButtons, idPrefix = 'form' }) {
  const [loadingField, setLoadingField] = useState(null)

  const buildId = (...segments) => [idPrefix, ...segments]
    .filter(segment => segment !== null && segment !== undefined && segment !== '')
    .join('-')

  const fieldLabelMap = {
    fullName: 'Nom complet',
    dateOfBirth: 'Date de naissance',
    jobTitle: 'Intitulé du poste',
    ville: 'Ville',
    email: 'Email',
    phone: 'Téléphone',
    linkedin: 'Profil LinkedIn',
    github: 'Profil GitHub',
    summary: 'Résumé professionnel',
    objective: 'Objectif professionnel',
    note: 'Bloc-notes'
  }

  // Fonction pour traduire un champ simple (FR <-> EN)
  async function handleTranslate(fieldName) {
    try {
      const text = form[fieldName] || ''
      if (!text.trim()) return
      setLoadingField(fieldName)
      const data = await apiFetch('/api/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source: 'fr', target: 'en' })
      })
      const translatedText = data?.translatedText ?? text
      const label = fieldLabelMap[fieldName] || `Champ ${fieldName}`
      if (translatedText === text) {
        toast.info(`${label} : aucune modification (déjà traduit ?)`, { autoClose: 2000 })
      } else {
        // propage le changement au parent
        handleChange({ target: { name: fieldName, value: translatedText } })
        toast.success(`${label} : traduction appliquée`, { autoClose: 2000 })
      }
    } catch (e) {
      console.error('Translation failed:', e)
      const label = fieldLabelMap[fieldName] || `Champ ${fieldName}`
      toast.error(`${label} : échec de la traduction`, { autoClose: 10000 })
    } finally {
      setLoadingField(null)
    }
  }

  // Bouton de traduction pour chaque champ
  const TranslateBtn = ({ show, field, size = 'default' }) => {
    const sizeClass = size === 'sm' ? 'btn-translate-sm' : size === 'lg' ? 'btn-translate-lg' : '';
    return show ? (
      <button
        type="button"
        className={`btn btn-translate ${sizeClass}`}
        onClick={() => handleTranslate(field)}
        title="Traduire"
        disabled={loadingField === field}
        aria-label={`Traduire le champ ${field}`}
      >{loadingField === field ? '...' : size === 'lg' ? 'Traduire' : 'Tr'}</button>
    ) : null
  }
  return (
    <>
      {/* User Info */}
      <h2 className="form-section-title">User Info</h2>
      <div className="form-row">
        <div className="form-item-container">
          <label htmlFor={buildId('fullName')} className="sr-only">Full Name</label>
          <input 
            id={buildId('fullName')}
            name="fullName" 
            placeholder="Full Name" 
            value={form.fullName} 
            onChange={handleChange} 
            autoComplete="name"
            className="form-input"
            aria-label="Full Name"
          />
        </div>
        <div className="form-item-container">
          <label htmlFor={buildId('dateOfBirth')} className="sr-only">Date of Birth</label>
          <input
            id={buildId('dateOfBirth')}
            name="dateOfBirth"
            type="text"
            placeholder="Date of Birth (e.g. 27/06/2000)"
            value={form.dateOfBirth}
            onChange={handleChange}
            autoComplete="off"
            className="form-input"
            aria-label="Date of Birth"
          />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor={buildId('jobTitle')} className="sr-only">Job Title</label>
        <input
          id={buildId('jobTitle')}
          name="jobTitle"
          placeholder="Job Title"
          value={form.jobTitle}
          onChange={handleChange}
          autoComplete="off"
          className="form-input"
          aria-label="Job Title"
        />
        <TranslateBtn field="jobTitle" size="sm" show={!!(showTranslateButtons && form.jobTitle && form.jobTitle.trim())} />
      </div>
      <div className="form-row">
        <div className="form-item-container">
          <label htmlFor={buildId('ville')} className="sr-only">Ville</label>
          <input 
            id={buildId('ville')}
            name="ville" 
            placeholder="Ville" 
            value={form.ville} 
            onChange={handleChange} 
            autoComplete="address-level2"
            className="form-input"
            aria-label="Ville"
          />
        </div>
      </div>
      {/* Contact info */}
      <h3 className="form-section-title">Contact Info</h3>
      <div className="form-row">
        <div className="form-item-container">
          <label htmlFor={buildId('email')} className="sr-only">Email Address</label>
          <input 
            id={buildId('email')}
            name="email" 
            type="email" 
            placeholder="Email Address" 
            value={form.email} 
            onChange={handleChange} 
            autoComplete="email"
            className="form-input"
            aria-label="Email Address"
            aria-required="true"
          />
        </div>
        <div className="form-item-container">
          <label htmlFor={buildId('phone')} className="sr-only">Phone Number</label>
          <input 
            id={buildId('phone')}
            name="phone" 
            placeholder="Phone Number" 
            value={form.phone} 
            onChange={handleChange} 
            autoComplete="tel"
            className="form-input"
            aria-label="Phone Number"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-item-container">
          <label htmlFor={buildId('linkedin')} className="sr-only">LinkedIn Profile</label>
          <input
            id={buildId('linkedin')}
            name="linkedin"
            type="url"
            placeholder="LinkedIn"
            value={form.linkedin}
            onChange={handleChange}
            autoComplete="url"
            className="form-input"
            aria-label="LinkedIn Profile URL"
          />
        </div>
        <div className="form-item-container">
          <label htmlFor={buildId('github')} className="sr-only">GitHub Profile</label>
          <input
            id={buildId('github')}
            name="github"
            type="url"
            placeholder="GitHub"
            value={form.github}
            onChange={handleChange}
            autoComplete="url"
            className="form-input"
            aria-label="GitHub Profile URL"
          />
        </div>
      </div>
      {/* Professional Summary */}
      <h3 className="form-section-title">Professional Summary</h3>
      <div className="professional-summary-row">
        <div className="professional-summary-col">
          <label htmlFor={buildId('summary')} className="sr-only">Professional Summary</label>
          <AutoResizeTextarea
            id={buildId('summary')}
            name="summary"
            placeholder="Short bio/about me"
            value={form.summary}
            onChange={handleChange}
            autoComplete="off"
            className="form-textarea professional-summary-textarea"
            aria-label="Professional Summary"
          />
          <TranslateBtn field="summary" size="lg" show={!!(showTranslateButtons && form.summary && form.summary.trim())} />
        </div>
        <div className="professional-summary-col">
          <label htmlFor={buildId('objective')} className="sr-only">Career Objective</label>
          <AutoResizeTextarea
            id={buildId('objective')}
            name="objective"
            placeholder="Career objective"
            value={form.objective}
            onChange={handleChange}
            autoComplete="off"
            className="form-textarea professional-summary-textarea"
            aria-label="Career Objective"
          />
          <TranslateBtn field="objective" size="lg" show={!!(showTranslateButtons && form.objective && form.objective.trim())} />
        </div>
      </div>
    </>
  )
}

export default NonRepeatableForm