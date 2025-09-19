// Routes pour les informations utilisateur
import express from 'express'
import { getUserInfo, updateUserInfo, getAdminUserInfo } from '../controllers/userInfoController.js'

const router = express.Router()

// Infos de l'utilisateur connecté (langue via ?lang=fr|en)
router.get('/', getUserInfo)
router.post('/', updateUserInfo)

// Profil admin public (pour affichage page d'accueil)
router.get('/admin', getAdminUserInfo)

export default router
