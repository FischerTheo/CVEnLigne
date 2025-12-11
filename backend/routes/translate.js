// Route pour la traduction de texte
import express from 'express'
import { translateText } from '../utils/translate.js'
import { validate } from '../middleware/validation.js'
import { translateSchema } from '../utils/validation.js'
import pino from 'pino'

const router = express.Router()
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

// Traduire un texte (fr -> en) (avec validation)
router.post('/text', validate(translateSchema), async (req, res) => {
	try {
		const { text, source, target } = req.body
		const translated = await translateText(text, source, target)
		res.json({ translatedText: translated })
	} catch (err) {
		logger.error({ err, event: 'translate_error' }, 'Erreur traduction')
		res.status(500).json({ error: err?.message || 'Translation failed' })
	}
})

export default router

