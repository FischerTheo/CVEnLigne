import express from 'express'
import { getProjects, saveProjects } from '../controllers/projectsController.js'
const router = express.Router()

router.get('/', getProjects)
router.post('/', saveProjects)

export default router