import { translateText } from '../utils/translate.js'

export async function translateUserInfo(formFr) {
  // Translate simple fields
  const summary = formFr.summary ? await translateText(formFr.summary, 'fr', 'en') : ''
  const objective = formFr.objective ? await translateText(formFr.objective, 'fr', 'en') : ''

  // Translate arrays
  const references = await Promise.all(
    (formFr.references || []).map(ref =>
      ref && ref.trim() !== '' ? translateText(ref, 'fr', 'en') : ''
    )
  )

  const hobbies = await Promise.all(
    (formFr.hobbies || []).map(hobby =>
      hobby && hobby.trim() !== '' ? translateText(hobby, 'fr', 'en') : ''
    )
  )


  // J'ai rajouté une exception pour le français car l'API traduit Français par "English"...
  const languages = await Promise.all(
    (formFr.languages || []).map(async lang => ({
      language:
        lang.language === 'Français'
          ? 'French'
          : lang.language
          ? await translateText(lang.language, 'fr', 'en')
          : '',
      level: lang.level ? await translateText(lang.level, 'fr', 'en') : ''
    }))
  )

  const skills = await Promise.all(
    (formFr.skills || []).map(async sk => ({
      skill: sk.skill || '',
      level: sk.level ? await translateText(sk.level, 'fr', 'en') : ''
    }))
  )

  const softSkills = await Promise.all(
    (formFr.softSkills || []).map(async sk => ({
      skill: sk.skill ? await translateText(sk.skill, 'fr', 'en') : ''
    }))
  )

  const experiences = await Promise.all(
    (formFr.experiences || []).map(async exp => ({
      jobTitle: exp.jobTitle || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      responsibilities: exp.responsibilities ? await translateText(exp.responsibilities, 'fr', 'en') : ''
    }))
  )

  const certifications = await Promise.all(
    (formFr.certifications || []).map(async cert => ({
      certName: cert.certName || '',
      certOrg: cert.certOrg || '',
      certDate: cert.certDate || '',
      certDesc: cert.certDesc ? await translateText(cert.certDesc, 'fr', 'en') : ''
    }))
  )

  // Return translated object
  return {
    ...formFr,
    summary,
    objective,
    references,
    hobbies,
    languages,
    skills,
    softSkills,
    experiences,
    certifications
  }
}