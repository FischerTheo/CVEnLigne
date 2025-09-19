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
        // propagate change to parent
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
  const TranslateBtn = ({ show, field }) => (
    show ? (
      <button
        type="button"
        className="btn btn-translate"
        onClick={() => handleTranslate(field)}
        title="Traduire"
        disabled={loadingField === field}
      >{loadingField === field ? '...' : 'Tr'}</button>
    ) : null
  )
  return (
    <>
      {/* User Info */}
      <h2 className="form-section-title">User Info</h2>
      <div className="form-row">
        <input 
          name="fullName" 
          placeholder="Full Name" 
          value={form.fullName} 
          onChange={handleChange} 
          className="form-input" 
        />
        <input
          name="dateOfBirth"
          type="text"
          placeholder="Date of Birth (e.g. 27/06/2000)"
          value={form.dateOfBirth}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      <div className="form-row">
        <input
          name="jobTitle"
          placeholder="Job Title"
          value={form.jobTitle}
          onChange={handleChange}
          className="form-input"
        />
  <TranslateBtn field="jobTitle" show={!!(showTranslateButtons && form.jobTitle && form.jobTitle.trim())} />
      </div>
      <div className="form-row">
        <input 
          name="ville" 
          placeholder="Ville" 
          value={form.ville} 
          onChange={handleChange} 
          className="form-input" 
        />
      </div>
      {/* Contact info */}
      <h3 className="form-section-title">Contact Info</h3>
      <div className="form-row">
        <input 
          name="email" 
          type="email" 
          placeholder="Email Address" 
          value={form.email} 
          onChange={handleChange} 
          className="form-input" 
        />
        <input 
          name="phone" 
          placeholder="Phone Number" 
          value={form.phone} 
          onChange={handleChange} 
          className="form-input" 
        />
      </div>
      <div className="form-row">
        <input
          name="linkedin"
          placeholder="LinkedIn"
          value={form.linkedin}
          onChange={handleChange}
          className="form-input"
        />
        <input
          name="github"
          placeholder="GitHub"
          value={form.github}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      {/* Professional Summary */}
      <h3 className="form-section-title">Professional Summary</h3>
      <div className="professional-summary-row">
        <div className="professional-summary-col">
          <AutoResizeTextarea
            name="summary"
            placeholder="Short bio/about me"
            value={form.summary}
            onChange={handleChange}
            className="form-textarea professional-summary-textarea"
          />
          <TranslateBtn field="summary" show={!!(showTranslateButtons && form.summary && form.summary.trim())} />
        </div>
        <div className="professional-summary-col">
          <AutoResizeTextarea
            name="objective"
            placeholder="Career objective"
            value={form.objective}
            onChange={handleChange}
            className="form-textarea professional-summary-textarea"
          />
          <TranslateBtn field="objective" show={!!(showTranslateButtons && form.objective && form.objective.trim())} />
        </div>
      </div>
    </>
  )
}

export default NonRepeatableForm