// Formulaire des champs non répétables (infos utilisateur, résumé, objectif...)
import React, { useState } from 'react'
import AutoResizeTextarea from '../../common/AutoResizeTextarea'
import { apiFetch } from '../../../lib/api'
import { toast } from 'react-toastify'

function NonRepeatableForm({ form, handleChange, showTranslateButtons }) {
  const [loadingField, setLoadingField] = useState(null)

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
      if (translatedText === text) {
        toast.info('Aucune modification (peut-être déjà traduit).')
      } else {
        // propage le changement au parent
        handleChange({ target: { name: fieldName, value: translatedText } })
        toast.success('Traduction appliquée.')
      }
    } catch (e) {
      console.error('Translation failed:', e)
      toast.error('Échec de la traduction')
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
          <label htmlFor="fullName" className="sr-only">Full Name</label>
          <input 
            id="fullName"
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
          <label htmlFor="dateOfBirth" className="sr-only">Date of Birth</label>
          <input
            id="dateOfBirth"
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
        <label htmlFor="jobTitle" className="sr-only">Job Title</label>
        <input
          id="jobTitle"
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
          <label htmlFor="ville" className="sr-only">Ville</label>
          <input 
            id="ville"
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
          <label htmlFor="email" className="sr-only">Email Address</label>
          <input 
            id="email"
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
          <label htmlFor="phone" className="sr-only">Phone Number</label>
          <input 
            id="phone"
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
          <label htmlFor="linkedin" className="sr-only">LinkedIn Profile</label>
          <input
            id="linkedin"
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
          <label htmlFor="github" className="sr-only">GitHub Profile</label>
          <input
            id="github"
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
          <label htmlFor="summary" className="sr-only">Professional Summary</label>
          <AutoResizeTextarea
            id="summary"
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
          <label htmlFor="objective" className="sr-only">Career Objective</label>
          <AutoResizeTextarea
            id="objective"
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