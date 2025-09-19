import express from 'express'
import { getUserInfo, updateUserInfo, getAdminUserInfo } from '../controllers/userInfoController.js'

const router = express.Router()

// Authenticated user info for current user (per lang via ?lang=fr|en)
router.get('/', getUserInfo)
router.post('/', updateUserInfo)

// Public: get admin profile for landing page display
router.get('/admin', getAdminUserInfo)

export default router
