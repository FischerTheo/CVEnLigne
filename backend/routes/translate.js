// Route pour la traduction de texte
import express from 'express'
import { translateText } from '../utils/translate.js'

const router = express.Router()

// Traduire un texte (fr -> en)
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

