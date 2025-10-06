import './i18n'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.scss'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
	<ErrorBoundary>
		<App />
	</ErrorBoundary>
)
