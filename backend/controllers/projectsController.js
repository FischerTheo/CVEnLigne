import userService from '../services/userService.js'
import formService from '../services/formService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { extractUserId } from '../utils/jwt.js'
import { getLang, requireAuth } from '../utils/requestHelpers.js'

const getUserId = extractUserId


// Récupère les projets de l'utilisateur connecté (FR ou EN)
export const getProjects = asyncHandler(async (req, res) => {
    const userId = requireAuth(req, res, getUserId)
    if (!userId) return
    
    const lang = getLang(req)
    const projects = await formService.getProjects(userId, lang)
    res.json(projects)
})


// Sauvegarde les projets de l'utilisateur connecté
export const saveProjects = asyncHandler(async (req, res) => {
    const userId = requireAuth(req, res, getUserId)
    if (!userId) return
    
    const lang = getLang(req)
    const { projects = [] } = req.body || {}
    const updated = await formService.updateProjects(userId, projects, lang)
    return res.json(updated)
})


// Récupère les projets de l'utilisateur admin pour l'affichage public
export const getAdminProjects = asyncHandler(async (req, res) => {
    const adminUser = await userService.findAdmin()
    if (!adminUser) return res.status(404).json({ error: 'Admin not found' })
    
    const lang = getLang(req)
    const projects = await formService.getProjects(adminUser._id, lang)
    return res.json(projects)
})
