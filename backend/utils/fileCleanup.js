// Utilitaires pour nettoyer les anciens fichiers PDF lors des mises à jour
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import pino from 'pino'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Logger dédié pour le nettoyage de fichiers
const logger = pino({ 
  level: process.env.LOG_LEVEL || 'info',
  name: 'fileCleanup'
})

/**
 * Supprime un fichier PDF du système de fichiers
 * @param {string} pdfUrl - URL relative du PDF (ex: "/uploads/pdfs/cv-123.pdf")
 * @returns {Promise<boolean>} - true si supprimé, false sinon
 */
export async function deletePdfFile(pdfUrl) {
  if (!pdfUrl || typeof pdfUrl !== 'string') return false
  
  try {
    // Extrait le chemin du fichier depuis l'URL
    const fileName = pdfUrl.split('/').pop()
    if (!fileName) return false
    
    const filePath = path.join(__dirname, '..', 'uploads', 'pdfs', fileName)
    
    // Vérifie si le fichier existe
    await fs.access(filePath)
    
    // Supprime le fichier
    await fs.unlink(filePath)
    logger.info({ fileName }, 'PDF deleted successfully')
    return true
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.error({ pdfUrl, error: error.message }, 'Failed to delete PDF')
    }
    return false
  }
}

/**
 * Compare deux tableaux de certifications et supprime les PDFs qui ne sont plus utilisés
 * @param {Array} oldCertifications - Anciennes certifications
 * @param {Array} newCertifications - Nouvelles certifications
 * @returns {Promise<number>} - Nombre de fichiers supprimés
 */
export async function cleanupCertificationPdfs(oldCertifications = [], newCertifications = []) {
  let deletedCount = 0
  
  // Liste des PDFs actuellement utilisés
  const newPdfUrls = new Set(
    newCertifications
      .filter(cert => cert?.pdfUrl)
      .map(cert => cert.pdfUrl)
  )
  
  // Supprime les PDFs qui ne sont plus dans la nouvelle liste
  for (const oldCert of oldCertifications) {
    if (oldCert?.pdfUrl && !newPdfUrls.has(oldCert.pdfUrl)) {
      const deleted = await deletePdfFile(oldCert.pdfUrl)
      if (deleted) deletedCount++
    }
  }
  
  return deletedCount
}

/**
 * Supprime l'ancien CV PDF si un nouveau est fourni
 * @param {string} oldCvUrl - Ancienne URL du CV
 * @param {string} newCvUrl - Nouvelle URL du CV
 * @returns {Promise<boolean>} - true si supprimé, false sinon
 */
export async function cleanupCvPdf(oldCvUrl, newCvUrl) {
  // Si pas d'ancien CV ou si l'URL n'a pas changé, ne rien faire
  if (!oldCvUrl || oldCvUrl === newCvUrl) return false
  
  return await deletePdfFile(oldCvUrl)
}

/**
 * Nettoie tous les PDFs orphelins d'un formulaire
 * @param {Object} oldForm - Ancien formulaire
 * @param {Object} newForm - Nouveau formulaire
 * @returns {Promise<Object>} - Statistiques de nettoyage
 */
export async function cleanupFormPdfs(oldForm, newForm) {
  const stats = {
    certificationsDeleted: 0,
    cvDeleted: false,
    totalDeleted: 0
  }
  
  if (!oldForm) return stats
  
  // Nettoie les PDFs de certification
  stats.certificationsDeleted = await cleanupCertificationPdfs(
    oldForm.certifications || [],
    newForm.certifications || []
  )
  
  // Nettoie le CV
  stats.cvDeleted = await cleanupCvPdf(
    oldForm.cvPdfUrl,
    newForm.cvPdfUrl
  )
  
  stats.totalDeleted = stats.certificationsDeleted + (stats.cvDeleted ? 1 : 0)
  
  if (stats.totalDeleted > 0) {
    logger.info({ 
      certificationsDeleted: stats.certificationsDeleted,
      cvDeleted: stats.cvDeleted,
      totalDeleted: stats.totalDeleted 
    }, 'PDFs cleaned up successfully')
  }
  
  return stats
}
