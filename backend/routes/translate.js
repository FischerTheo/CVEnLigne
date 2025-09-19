import express from 'express'
import { translateText } from '../utils/translate.js'

// Safe translate route that avoids any external 'node-fetch' dependency.
// If not used by the app, it remains harmless but prevents stale imports
// from causing crashes under nodemon.
const router = express.Router()

// POST /api/translate/text
// Body: { text: string, source?: 'fr'|'en', target?: 'fr'|'en' }
router.post('/text', async (req, res) => {
	try {
		const { text, source = 'fr', target = 'en' } = req.body || {}
		const translated = await translateText(text || '', source, target)
		res.json({ translatedText: translated })
	} catch (err) {
		console.error('Translate route error:', err)
		res.status(500).json({ error: err?.message || 'Translation failed' })
	}
})

export default router

