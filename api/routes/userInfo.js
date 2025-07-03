import express from 'express'
import { getUserInfo, updateUserInfo, getAdminUserInfo } from '../controllers/userInfoController.js'
const router = express.Router()

router.get('/', getUserInfo)
router.post('/', updateUserInfo)
router.get('/admin', getAdminUserInfo) 

export default router