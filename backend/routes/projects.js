import express from 'express'
import { getProjects, saveProjects, getAdminProjects } from '../controllers/projectsController.js'
import { validate } from '../middleware/validation.js'
import { saveProjectsSchema } from '../utils/validation.js'

const router = express.Router()

router.get('/', getProjects)
router.post('/', validate(saveProjectsSchema), saveProjects)
router.get('/admin', getAdminProjects)

export default router
