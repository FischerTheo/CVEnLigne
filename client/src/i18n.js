import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import mainFR from './locales/mainFR.json'
import mainEN from './locales/mainEN.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
  fr: { main: mainFR },
  en: { main: mainEN }
    },
    fallbackLng: 'fr',
  ns: ['main'],
    defaultNS: 'main',
    interpolation: { escapeValue: false }
  })

export default i18n