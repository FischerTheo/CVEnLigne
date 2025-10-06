import React from 'react'

// Composant de gestion d'erreur global (React)
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  // Détecte une erreur dans un composant enfant
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  // Log l'erreur 
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h2>Une erreur est survenue</h2>
          <pre className="error-boundary-message">{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
