import express from 'express'
import { getProjects, saveProjects, getAdminProjects } from '../controllers/projectsController.js'

const router = express.Router()

router.get('/', getProjects)
router.post('/', saveProjects)
router.get('/admin', getAdminProjects)

export default router
