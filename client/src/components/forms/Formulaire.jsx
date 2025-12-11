// Composant principal du formulaire CV (multi-sections, traduction, upload PDF)
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import NonRepeatableForm from './sections/NonRepeatableForm'
import RepeatableForm from './sections/RepeatableForm'
import ChangePasswordForm from '../ChangePasswordForm'
import DeleteAccountButton from '../DeleteAccountButton.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AutoResizeTextarea from '../common/AutoResizeTextarea'
import { useTranslation } from 'react-i18next'
import { apiFetch, API } from '../../lib/api'

// Formulaire principal du CV : gère les sections, la traduction FR/EN, l upload PDF et la note utilisateur
const Formulaire = forwardRef(function Formulaire({ token, showNote = true, onFormChange, showTranslateButtons = false, showAddButtons = true, forcedLang, onCvPdfChange, idPrefix: idPrefixProp }, ref) {
  const { logout } = useAuth()
  
  // Bouton pour traduire un champ (FR <-> EN)
  const TranslateBtn = ({ show, onClick, disabled }) => (show ? (
    <button type="button" className="btn btn-translate" title="Traduire" onClick={onClick} disabled={disabled}>
      {disabled ? '...' : 'Tr'}
    </button>
  ) : null)
  
  // Table de correspondance des niveaux de compétences entre FR et EN (pour garder l'ordre)
  const skillLevelsMapping = {
    fr: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
    en: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  }
  
  // Traduit le niveau de compétence selon la langue
  const translateSkillLevel = (value, fromLang, toLang) => {
    if (!value || fromLang === toLang) return value
    const fromLevels = skillLevelsMapping[fromLang]
    const toLevels = skillLevelsMapping[toLang]
    const index = fromLevels.indexOf(value)
    return index !== -1 ? toLevels[index] : value
  }
  
  // Traduit automatiquement les niveaux de compétences quand synchronisation FR/EN
  const translateFormData = (formData, fromLang, toLang) => {
    if (fromLang === toLang) return formData
    
    return {
      ...formData,
      skills: formData.skills?.map(skill => ({
        ...skill,
        level: translateSkillLevel(skill.level, fromLang, toLang)
      })) || []
    }
  }
  // Structure par défaut du formulaire
  // Structure initiale du formulaire (tous les champs du CV)
  const defaultForm = {
    fullName: '',
    dateOfBirth: '',
    jobTitle: '', 
    ville: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    summary: '',
    objective: '',
    languages: [{ language: '', level: '' }],
    skills: [{ skill: '', level: '' }],
    softSkills: [{ skill: '' }],
    experiences: [{
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: ''
    }],
    certifications: [{
      certName: '',
      certOrg: '',
      certDate: '',
      certDesc: ''
    }],
    references: [{ text: '' }],
    hobbies: [''],
  
    projects: [{ title: '', description: '' }],
    cvPdfUrl: ''
  }
  // State principal du formulaire
  const [form, setForm] = useState(defaultForm)
  // Variables pour gérer la mise à jour du formulaire et la notification au parent
  const shouldBroadcastRef = useRef(false)
  const lastChangedFieldRef = useRef(null) // Pour les champs simples
  const lastChangedUpdateRef = useRef(null) // Pour les champs tableaux
  // Met à jour le formulaire et notifie le parent si besoin
  const setFormState = (updater, { silent = false } = {}) => {
    if (typeof updater === 'function') {
      setForm(prev => updater(prev))
    } else {
      setForm(updater)
    }
    // Déclenche la notification au parent après rendu via useEffect
    shouldBroadcastRef.current = !silent
  }
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')
  const [cvPdfUrl, setCvPdfUrl] = useState('')
  const [projectLoadingKey, setProjectLoadingKey] = useState(null)
  const { i18n } = useTranslation()
  const effectiveLang = forcedLang || i18n.language
  const idPrefix = idPrefixProp || `form-${effectiveLang}`
  const buildId = (...segments) => [idPrefix, ...segments]
    .filter(segment => segment !== null && segment !== undefined && segment !== '')
    .join('-')
  const canRemove = !showTranslateButtons 
  
  useEffect(() => {
    if (typeof onCvPdfChange === 'function') {
      onCvPdfChange(cvPdfUrl || '')
    }
  }, [cvPdfUrl, onCvPdfChange])


  // Notifie le parent APRES que le state ait été appliqué 
  // Notifie le parent à chaque modification du formulaire (pour la synchro)
  useEffect(() => {
    if (shouldBroadcastRef.current) {
      if (onFormChange) {
        const currentLang = effectiveLang
        const targetLang = currentLang === 'fr' ? 'en' : 'fr'
        const update = lastChangedUpdateRef.current
        if (update?.type === 'field') {
          const translatedForm = translateFormData(form, currentLang, targetLang)
          onFormChange({ field: update.field, value: translatedForm[update.field] })
        } else if (update?.type === 'array') {
          const translatedForm = translateFormData(form, currentLang, targetLang)
          const { field, idx, key } = update
          const valueOut = key != null ? translatedForm[field]?.[idx]?.[key] : translatedForm[field]?.[idx]
          onFormChange({ field, idx, key, value: valueOut })
        } else if (lastChangedFieldRef.current) {
          const translatedForm = translateFormData(form, currentLang, targetLang)
          onFormChange({ field: lastChangedFieldRef.current, value: translatedForm[lastChangedFieldRef.current] })
        } else {
          // fallbacck : envoie tout le formulaire traduit
          const translatedForm = translateFormData(form, currentLang, targetLang)
          onFormChange(translatedForm)
        }
      }
      shouldBroadcastRef.current = false
      lastChangedFieldRef.current = null
      lastChangedUpdateRef.current = null
    }
  }, [form, effectiveLang, onFormChange])

  // Récupère les données utilisateur et projets à l initialisation
  useEffect(() => {
    // Récupère la version dans la bonne langue 
    apiFetch(`/api/userinfo?lang=${effectiveLang}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(data => {
        if (data) {
          setFormState({
            ...defaultForm,
            ...data,
            languages: Array.isArray(data.languages) && data.languages.length > 0
              ? data.languages
              : [{ language: '', level: '' }],
            skills: Array.isArray(data.skills) && data.skills.length > 0
              ? data.skills
              : [{ skill: '', level: '' }],
            experiences: Array.isArray(data.experiences) && data.experiences.length > 0
              ? data.experiences
              : [{
                  jobTitle: '',
                  company: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  responsibilities: ''
                }],
            certifications: Array.isArray(data.certifications) && data.certifications.length > 0
              ? data.certifications
              : [{
                  certName: '',
                  certOrg: '',
                  certDate: '',
                  certDesc: '',
                  pdfUrl: ''
                }],
          references: Array.isArray(data.references) && data.references.length > 0
            ? data.references.map(ref => typeof ref === 'object' && ref !== null && 'text' in ref ? ref : { text: ref })
            : [{ text: '' }],
          //  services supprimés du formulaire 
          projects: Array.isArray(data.projects) && data.projects.length > 0
            ? data.projects
            : [{ title: '', description: '' }]
        }, { silent: true })
          
          // Définit l'URL du PDF du CV (ou vide si non renseigné)
          setCvPdfUrl(data.cvPdfUrl || '')
        } else {
          setFormState(defaultForm, { silent: true })
        }
      })
      .catch(err => {
        console.error('Error fetching user info:', err)
        setFormState(defaultForm, { silent: true })
      })

    // Récupère les projets séparément
    apiFetch(`/api/projects?lang=${effectiveLang}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(projects => {
        setFormState(f => ({
          ...f,
          projects: Array.isArray(projects) && projects.length > 0
            ? projects
            : [{ title: '', description: '' }]
        }), { silent: true })
      })
      .catch(err => {
        console.error('Error fetching projects:', err)
      })
  }, [token, effectiveLang])

  // Récupère la note utilisateur à l'initialisation
  useEffect(() => {
    if (!token) return // Ne charge pas si non connecté
    
    apiFetch(`/api/usernote`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(data => {
        if (data && data.note !== undefined) setNote(data.note)
      })
      .catch(err => {
        console.error('Failed to fetch user note:', err)
      })
  }, [token])

  // Gère le changement d'un champ simple du formulaire
  const handleChange = e => {
    const { name, value } = e.target
    // Mémorise quel champ a déclenché le changement pour synchroniser uniquement ce champ
    lastChangedFieldRef.current = name
    lastChangedUpdateRef.current = { type: 'field', field: name }
    setFormState(f => ({ ...f, [name]: value }))
  }

  // Gère le changement d'un champ dans un tableau (ex: langues, compétences)
  const handleArrayChange = (field, idx, key, value) => {
    lastChangedFieldRef.current = null
    lastChangedUpdateRef.current = { type: 'array', field, idx, key }
    setFormState(f => ({
      ...f,
      [field]: f[field].map((item, i) =>
        i === idx
          ? key
            ? { ...item, [key]: value }
            : value 
          : item
      )
    }))
  }

  const projectKey = (idx, field) => `projects-${idx}-${field}`
  const handleTranslateProject = async (idx, field) => {
    const item = form.projects?.[idx]
    if (!item || !item[field] || !String(item[field]).trim()) return
    const key = projectKey(idx, field)
    setProjectLoadingKey(key)
    try {
      const data = await apiFetch('/api/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: item[field], source: 'fr', target: 'en' })
      })
      const translatedText = data?.translatedText ?? item[field]
      handleArrayChange('projects', idx, field, translatedText)
      if (translatedText === item[field]) toast.info('Aucune modification (peut-être déjà traduit).', { autoClose: 2000 })
      else toast.success('Traduction appliquée.', { autoClose: 2000 })
    } catch (e) {
      console.error('Translation failed:', e)
      toast.error('Échec de la traduction', { autoClose: 10000 })
    } finally {
      setProjectLoadingKey(null)
    }
  }

  // Ajoute un élément à un tableau du formulaire
  const addArrayItem = field => {
    let empty
    if (field === 'languages') empty = { language: '', level: '' }
    if (field === 'skills') empty = { skill: '', level: '' }
    if (field === 'experiences') empty = { jobTitle: '', company: '', location: '', startDate: '', endDate: '', responsibilities: '' }
    if (field === 'certifications') empty = { certName: '', certOrg: '', certDate: '', certDesc: '', pdfUrl: '' }
  if (field === 'softSkills') empty = { skill: '' }
  if (field === 'references') empty = { text: '' }
  if (field === 'hobbies') empty = ''
    if (field === 'services' || field === 'projects') empty = { title: '', description: '' }
    lastChangedUpdateRef.current = { type: 'field', field }
    setFormState(f => ({ ...f, [field]: [...f[field], empty] }))
  }

  // Supprime un élément d'un tableau du formulaire
  const removeArrayItem = (field, idx) => {
    lastChangedUpdateRef.current = { type: 'field', field }
    setFormState(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }))
  }

  // Gère la modification de la note utilisateur
  const handleNoteChange = e => setNote(e.target.value)

  // Sauvegarde la note utilisateur en base
  const saveNote = async () => {
    if (!token) {
      toast.error('Vous devez être connecté pour sauvegarder la note', { autoClose: 10000 })
      return
    }
    
    try {
      await apiFetch(`/api/usernote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note })
      })
      toast.success('Note sauvegardée', { autoClose: 2000 })
    } catch (e) {
      console.error('Failed to save note', e)
      toast.error(e.message || 'Impossible de sauvegarder la note', { autoClose: 10000 })
    }
  }

  // Upload du CV PDF 
  const handleCvUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    await uploadCvFile(file)
  }

  // Fonction commune pour l'upload du fichier
  const uploadCvFile = async (file) => {
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés', { autoClose: 3000 })
      return
    }

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const fileName = file.name
      const response = await apiFetch('/api/upload/pdf', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })
      // L'endpoint d'upload retourne { filename, path }
      if (response && response.path) {
        setCvPdfUrl(response.path)
        // Conserve dans le state du formulaire pour que la sauvegarde persiste même sans autre changement
        setFormState(prev => ({ ...prev, cvPdfUrl: response.path }), { silent: true })
        toast.success(`CV PDF "${fileName}" uploadé avec succès`, { autoClose: 2000 })
      } else {
        toast.error('Réponse serveur invalide : URL du CV manquante', { autoClose: 10000 })
      }
    } catch (error) {
      console.error('Error uploading CV PDF:', error)
      toast.error(`Erreur lors de l'upload du CV PDF : ${error.message || 'opération interrompue'}`, { autoClose: 10000 })
    }
  }

  // Gestionnaire de drag over
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Gestionnaire de drop
  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await uploadCvFile(files[0])
    }
  }

  // Supprime le CV PDF uploadé
  const handleCvDelete = async () => {
    try {
      if (cvPdfUrl) {
        await apiFetch(`/api/upload/pdf?path=${encodeURIComponent(cvPdfUrl)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (e) {
      console.error('Failed to delete CV PDF file on server', e)
    } finally {
      const previousUrl = cvPdfUrl
      setCvPdfUrl('')
      setFormState(prev => ({ ...prev, cvPdfUrl: '' }), { silent: true })
      const fileName = previousUrl ? decodeURIComponent(previousUrl.split('/').pop() || '') : ''
      toast.success(fileName ? `CV PDF "${fileName}" supprimé` : 'CV PDF supprimé', { autoClose: 2000 })
    }
  }


  // Soumet le formulaire complet (infos + projets)
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setMessage('')
    // Sauvegarde les infos utilisateur
  try {
    const languageLabel = effectiveLang === 'fr' ? 'FR' : 'EN'
    await apiFetch(`/api/userinfo?lang=${effectiveLang}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, cvPdfUrl })
      })
      // Sauvegarde les projets
    await apiFetch(`/api/projects?lang=${effectiveLang}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projects: form.projects })
      })
    toast.success(`Formulaire ${languageLabel} enregistrés avec succès`, { autoClose: 2000 })
  } catch (e) {
    console.error('Failed to save form/projects', e)
    toast.error(e.message || 'Échec de l\'enregistrement du formulaire ou des projets', { autoClose: 10000 })
  }
  }

  useImperativeHandle(ref, () => ({
    saveForm: handleSubmit,
    setExternalForm: (externalForm) => {
      // Traduit le formulaire reçu vers la langue du formulaire actuel
      const sourceLang = effectiveLang === 'fr' ? 'en' : 'fr'
      const translatedForm = translateFormData(externalForm, sourceLang, effectiveLang)
      setFormState(translatedForm, { silent: true })
    },
    // Définit un champ unique provenant du formulaire partenaire (déjà traduit)
    setExternalField: (field, value) => {
      if (!field) return
      setFormState(f => ({ ...f, [field]: value }), { silent: true })
    },
    // Définit un élément de tableau provenant du formulaire partenaire (déjà traduit)
    setExternalArrayField: (field, idx, key, value) => {
      if (!field || typeof idx !== 'number') return
      setFormState(f => ({
        ...f,
        [field]: (f[field] || []).map((item, i) =>
          i === idx
            ? (key ? { ...item, [key]: value } : value)
            : item
        )
      }), { silent: true })
    }
  }))

  return (
    <section className="flex-center-start">
      {/* Note section */}
      {showNote && (
        <aside className="note-container">
          <AutoResizeTextarea
            id={buildId('note')}
            name="note"
            className="note-textarea"
            placeholder="Ajouter une note ou une description..."
            value={note}
            onChange={handleNoteChange}
            onBlur={saveNote}
            autoComplete="off"
            noLimit
          />
          {/* Upload CV PDF section - dans la section note */}
          <div className="cv-upload-container" onDragOver={handleDragOver} onDrop={handleDrop}>
            <label htmlFor={buildId('cv-pdf-upload')} className="cv-upload-label">Uploader le CV papier (PDF)</label>
            <input
              type="file"
              id={buildId('cv-pdf-upload')}
              accept="application/pdf"
              onChange={handleCvUpload}
              className="cv-pdf-file-input"
            />
            {cvPdfUrl && (
              <div className="cv-pdf-actions">
                <a
                  href={`${API}${cvPdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-pdf-link"
                >
                  Voir le PDF
                </a>
                <button
                  type="button"
                  onClick={handleCvDelete}
                  className="btn btn-remove btn-remove-pdf"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
          {/* Formulaire de changement de mot de passe */}
          <ChangePasswordForm token={token} />
          
          {/* Bouton de suppression du compte sous le changement de mot de passe */}
          <DeleteAccountButton onLogout={logout} />
        </aside>
      )}
      {/* Form section */}
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="form-container">
          {message && <div className={`form-message ${message === 'Saved!' ? 'form-message-success' : 'form-message-error'}`}>{message}</div>}
          <section className="form-section">
            <NonRepeatableForm
              form={form}
              handleChange={handleChange}
              showTranslateButtons={showTranslateButtons}
              idPrefix={idPrefix}
            />
          </section>
          <section className="form-section-alt">
            <RepeatableForm
              form={form}
              handleArrayChange={handleArrayChange}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              showTranslateButtons={showTranslateButtons}
              showAddButtons={showAddButtons}
              showRemoveButtons={showTranslateButtons ? false : true}
              effectiveLang={effectiveLang}
              idPrefix={idPrefix}
            />
          </section>

          {/* debut Projects */}
          <section className="form-section">
            <h3 className="form-section-title">Mes projets</h3>
            {form.projects.map((project, idx) => (
              <div key={idx} className="form-item-container">
                <input
                  id={buildId('project-title', idx)}
                  name={`projects[${idx}].title`}
                  placeholder="Titre du projet"
                  value={project.title}
                  onChange={e => handleArrayChange('projects', idx, 'title', e.target.value)}
                  autoComplete="off"
                  className="form-input"
                />
                <TranslateBtn
                  show={!!(showTranslateButtons && project.title && project.title.trim())}
                  onClick={() => handleTranslateProject(idx, 'title')}
                  disabled={projectLoadingKey === projectKey(idx, 'title')}
                />
                <AutoResizeTextarea
                  id={buildId('project-description', idx)}
                  name={`projects[${idx}].description`}
                  placeholder="Description du projet"
                  value={project.description}
                  onChange={e => handleArrayChange('projects', idx, 'description', e.target.value)}
                  autoComplete="off"
                  className="form-textarea"
                />
                <TranslateBtn
                  show={!!(showTranslateButtons && project.description && project.description.trim())}
                  onClick={() => handleTranslateProject(idx, 'description')}
                  disabled={projectLoadingKey === projectKey(idx, 'description')}
                />
                {canRemove && form.projects.length > 1 && (
                  <button type="button" className="btn btn-remove" onClick={() => removeArrayItem('projects', idx)}>-</button>
                )}
              </div>
            ))}
            {showAddButtons && (
              <button type="button" className="btn btn-add" onClick={() => addArrayItem('projects')}>Ajouter un projet</button>
            )}
          </section>
          {/* fin Projects */}
        </form>
        {/* ToastContainer global dans App.jsx */}
      </div>
    </section>
  )
})

export default Formulaire
