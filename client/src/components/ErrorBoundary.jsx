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
  // Log l'erreur (peut être envoyé à un service distant)
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Une erreur est survenue</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
