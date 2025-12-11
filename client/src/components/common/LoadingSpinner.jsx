import React from 'react'

// Composant Spinner de chargement
export function LoadingSpinner({ size = 'medium', message, lang = 'fr' }) {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }
  
  const defaultMessage = {
    fr: 'Chargement...',
    en: 'Loading...'
  }
  
  return (
    <div className="loading-spinner-container" role="status" aria-live="polite">
      <div 
        className={`loading-spinner loading-spinner--${size}`}
        style={{ width: sizes[size], height: sizes[size] }}
        aria-hidden="true"
      ></div>
      <p className="loading-message">
        {message || defaultMessage[lang]}
      </p>
      <span className="sr-only">{message || defaultMessage[lang]}</span>
    </div>
  )
}

// Composant LoadingOverlay pour bloquer l'interface
export function LoadingOverlay({ message, lang = 'fr' }) {
  return (
    <div className="loading-overlay" role="alertdialog" aria-busy="true">
      <LoadingSpinner size="large" message={message} lang={lang} />
    </div>
  )
}

// Hook personnalisé pour gérer l'état de chargement
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [error, setError] = React.useState(null)
  
  const startLoading = () => {
    setIsLoading(true)
    setError(null)
  }
  
  const stopLoading = () => {
    setIsLoading(false)
  }
  
  const setLoadingError = (err) => {
    setError(err)
    setIsLoading(false)
  }
  
  const withLoading = async (asyncFn) => {
    startLoading()
    try {
      const result = await asyncFn()
      stopLoading()
      return result
    } catch (err) {
      setLoadingError(err)
      throw err
    }
  }
  
  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    withLoading
  }
}

// Composant ProgressBar pour uploads
export function ProgressBar({ progress = 0, lang = 'fr' }) {
  const label = {
    fr: `Progression : ${progress}%`,
    en: `Progress: ${progress}%`
  }
  
  return (
    <div className="progress-bar-container" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      <span className="progress-bar-label">{label[lang]}</span>
    </div>
  )
}

export default LoadingSpinner
