// Routes pour les informations utilisateur
import express from 'express'
import { getUserInfo, updateUserInfo, getAdminUserInfo } from '../controllers/userInfoController.js'
import { validate, validateQuery } from '../middleware/validation.js'
import { formSchema, languageQuerySchema } from '../utils/validation.js'

const router = express.Router()

// Infos de l'utilisateur connecté (langue via ?lang=fr|en)
router.get('/', validateQuery(languageQuerySchema), getUserInfo)
router.post('/', validate(formSchema), updateUserInfo)

// Profil admin public (pour affichage page d'accueil)
router.get('/admin', validateQuery(languageQuerySchema), getAdminUserInfo)

export default router
