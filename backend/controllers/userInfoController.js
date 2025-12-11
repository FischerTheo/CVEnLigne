import userService from '../services/userService.js'
import formService from '../services/formService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { extractUserId } from '../utils/jwt.js'
import { getLang, requireAuth } from '../utils/requestHelpers.js'

const getUserId = extractUserId


// Récupère les infos utilisateur 
export const getUserInfo = asyncHandler(async (req, res) => {
    const userId = requireAuth(req, res, getUserId)
    if (!userId) return
    
    const lang = getLang(req)
    const doc = await formService.getForm(userId, lang)
    res.json(doc || {})
})


// Met à jour les infos utilisateur 
export const updateUserInfo = asyncHandler(async (req, res) => {
    const userId = requireAuth(req, res, getUserId)
    if (!userId) return
    
    const lang = getLang(req)
    const sanitized = formService.sanitizeFormData(req.body || {})
    const updated = await formService.updateForm(userId, sanitized, lang)
    return res.json(updated)
})


// Récupère les infos de l'utilisateur admin pour un affichage public
export const getAdminUserInfo = asyncHandler(async (req, res) => {
    const adminUser = await userService.findAdmin()
    if (!adminUser) return res.status(404).json({ error: 'Admin user not found' })
    
    const lang = getLang(req)
    const doc = await formService.getForm(adminUser._id, lang)
    res.json(doc || {})
})
