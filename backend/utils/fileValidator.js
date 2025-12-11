import fs from 'fs'

/**
 * Valide qu'un fichier est bien un PDF en vérifiant les magic bytes
 * Les PDF commencent toujours par "%PDF-" (25 50 44 46 2D en hexa)
 * @param {string} filePath - Chemin absolu du fichier à vérifier
 * @returns {boolean} - true si le fichier est un PDF valide, false sinon
 */
export function isPdfFile(filePath) {
  try {
    // Lire les 5 premiers octets du fichier
    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(5)
    fs.readSync(fd, buffer, 0, 5, 0)
    fs.closeSync(fd)

    // Vérifier les magic bytes PDF: %PDF- (25 50 44 46 2D)
    const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D])
    
    return buffer.equals(pdfSignature)
  } catch (err) {
    // En cas d'erreur de lecture, considérer comme invalide
    return false
  }
}

/**
 * Middleware pour valider les magic bytes d'un fichier uploadé
 * Supprime automatiquement le fichier s'il n'est pas valide
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
export function validatePdfMagicBytes(req, res, next) {
  // Vérifier si un fichier a été uploadé
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier envoyé' })
  }

  const filePath = req.file.path

  // Vérifier les magic bytes
  if (!isPdfFile(filePath)) {
    // Supprimer le fichier invalide immédiatement
    try {
      fs.unlinkSync(filePath)
    } catch (err) {
      console.error('Erreur lors de la suppression du fichier invalide:', err)
    }
    
    return res.status(400).json({ 
      error: 'Fichier invalide : ce n\'est pas un PDF valide (magic bytes incorrects)' 
    })
  }

  // Fichier valide, continuer
  next()
}
