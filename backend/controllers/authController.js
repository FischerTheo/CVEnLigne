import userService from '../services/userService.js'
import { setAuthCookie, clearAuthCookie } from '../utils/cookieUtils.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import mongoose from 'mongoose'
import pino from 'pino'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })


// Inscription d'un nouvel utilisateur
export const register = asyncHandler(async (req, res) => {
    const { username, email, password, isAdmin } = req.body
    const clientIp = req.ip || req.connection.remoteAddress
    
    // Validation du mot de passe (double vérification après Zod)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      logger.warn({
        event: 'register_invalid_password',
        email: email,
        ip: clientIp
      }, 'Tentative d inscription invalide')
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre' 
      })
    }
    
    // Création de user via service
    const user = await userService.createUser({ username, email, password, isAdmin })

    // log nouvel inscrit
    logger.info({
      event: 'register_success',
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      ip: clientIp,
      timestamp: new Date().toISOString()
    }, 'Nouvel utilisateur inscrit')

    // Génère tokens via service
    const { token, refreshToken, expiresAt } = userService.generateAuthTokens(user._id)
    
    // Stocke le token dans un cookie HttpOnly
    setAuthCookie(res, token)
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token, // Gardé pour compatibilité localStorage
      refreshToken,
      isAdmin: user.isAdmin,
      expiresAt
    })
})


// Connexion user
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const clientIp = req.ip || req.connection.remoteAddress
    
    // Recherche user par email via service
    const user = await userService.findByEmail(email)
    
    // Vérifie le mot de passe via service
    if (!user || !(await userService.verifyPassword(user, password))) {
      // Log si connexion échouée
      logger.warn({
        event: 'login_failed',
        email: email,
        ip: clientIp,
        timestamp: new Date().toISOString()
      }, 'Tentative de connexion échouée')
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Log si connexion réussie
    logger.info({
      event: 'login_success',
      userId: user._id,
      email: user.email,
      ip: clientIp,
      timestamp: new Date().toISOString()
    }, 'Connexion réussie')
    
    // Génère tokens via service
    const { token, refreshToken, expiresAt } = userService.generateAuthTokens(user._id)
    
    // Stocke le token dans un cookie HttpOnly
    setAuthCookie(res, token)
    
    res.json({ 
      token, // Gardé pour compatibilité localStorage
      refreshToken, 
      isAdmin: user.isAdmin, 
      expiresAt 
    })
})

// Changer le mot de passe (admin uniquement)
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body
    const userId = req.userId
    const clientIp = req.ip || req.connection.remoteAddress
    
    logger.info({
      event: 'change_password_attempt',
      userId,
      clientIp,
      timestamp: new Date().toISOString(),
    }, 'Tentative de changement de mot de passe')

    if (!currentPassword || !newPassword) {
      logger.warn({
        event: 'change_password_missing_new_password',
        userId,
        clientIp,
      }, 'Mot de passe actuel ou nouveau manquant')
      return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis' })
    }

    if (newPassword.length < 8) {
      logger.warn({
        event: 'change_password_invalid_length',
        userId,
        clientIp,
      }, 'Le nouveau mot de passe ne respecte pas l exigence de longueur')
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 8 caractères' 
      })
    }

    const user = await userService.findById(userId)
    if (!user) {
      logger.error({
        event: 'change_password_user_not_found',
        userId,
        clientIp,
      }, 'Utilisateur non trouvé')
      return res.status(404).json({ message: 'Utilisateur non trouvé' })
    }

    const passwordMatches = await userService.verifyPassword(user, currentPassword)
    if (!passwordMatches) {
      logger.warn({
        event: 'change_password_invalid_current',
        userId,
        clientIp,
      }, 'Mot de passe actuel incorrect')
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' })
    }

    if (currentPassword === newPassword) {
      logger.warn({
        event: 'change_password_same_as_current',
        userId,
        clientIp,
      }, 'Le nouveau mot de passe est identique à l\'ancien')
      return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent de l\'ancien' })
    }

    await userService.updatePassword(user, newPassword)

    logger.info({
      event: 'password_changed',
      userId: user._id,
      email: user.email,
      ip: clientIp,
      timestamp: new Date().toISOString(),
    }, 'Mot de passe modifié avec succès')

    res.json({ message: 'Mot de passe modifié avec succès' })
})

// Logout - Supprime le cookie d'authentification
export const logout = asyncHandler(async (req, res) => {
    const userId = req.userId
    const clientIp = req.ip || req.connection.remoteAddress
    
    logger.info({
      event: 'logout_success',
      userId,
      ip: clientIp,
      timestamp: new Date().toISOString()
    }, 'Déconnexion réussie')
    
    // Supprime le cookie
    clearAuthCookie(res)
    
    res.json({ message: 'Logout successful' })
})

// Transfer admin - Transfère les droits admin à un autre utilisateur
export const transferAdmin = asyncHandler(async (req, res) => {
    const currentUserId = req.userId
    const currentIsAdmin = req.isAdmin
    const { targetUserId } = req.body
    const clientIp = req.ip || req.connection.remoteAddress
    
    logger.info({
      event: 'transfer_admin_attempt',
      currentUserId,
      targetUserId,
      ip: clientIp,
      timestamp: new Date().toISOString()
    }, 'Tentative de transfert admin')
    
    // Vérifier que l'utilisateur actuel est admin
    if (!currentIsAdmin) {
      logger.warn({
        event: 'transfer_admin_unauthorized',
        userId: currentUserId,
        ip: clientIp
      }, 'Tentative de transfert admin par un non-admin')
      return res.status(403).json({ message: 'Seul un admin peut transférer ses droits' })
    }
    
    // Vérifier que targetUserId est fourni
    if (!targetUserId) {
      return res.status(400).json({ message: 'targetUserId requis' })
    }
    
    // Vérifier que ce n'est pas le même utilisateur
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'Vous êtes déjà admin' })
    }
    
    // Récupérer l'utilisateur cible
    const targetUser = await userService.findById(targetUserId)
    if (!targetUser) {
      logger.warn({
        event: 'transfer_admin_target_not_found',
        currentUserId,
        targetUserId,
        ip: clientIp
      }, 'Utilisateur cible non trouvé')
      return res.status(404).json({ message: 'Utilisateur cible non trouvé' })
    }
    
    // Si l'utilisateur cible est déjà admin, erreur
    if (targetUser.isAdmin) {
      return res.status(400).json({ message: 'L\'utilisateur cible est déjà admin' })
    }
    
    // Transférer les droits : retirer admin au current, donner au target
    const currentUser = await userService.findById(currentUserId)
    currentUser.isAdmin = false
    targetUser.isAdmin = true
    
    await currentUser.save()
    await targetUser.save()
    
    logger.info({
      event: 'transfer_admin_success',
      oldAdminId: currentUserId,
      newAdminId: targetUserId,
      ip: clientIp,
      timestamp: new Date().toISOString()
    }, 'Droits admin transférés avec succès')
    
    res.json({ 
      message: 'Droits admin transférés avec succès',
      oldAdmin: currentUserId,
      newAdmin: targetUserId
    })
})

// Supprimer le compte et TOUTE la base de données (TRÈS DANGEREUX)
export const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.userId
    const clientIp = req.ip || req.connection.remoteAddress
    
    logger.warn({
      event: 'delete_account_database_attempt',
      userId,
      ip: clientIp,
      timestamp: new Date().toISOString()
    }, '⚠️ TENTATIVE DE SUPPRESSION TOTALE DE LA BASE DE DONNÉES')
    
    try {
      // 1. Supprimer tous les fichiers PDF uploadés
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'pdfs')
      try {
        const files = await fs.readdir(uploadsDir)
        let deletedFiles = 0
        
        for (const file of files) {
          if (file.endsWith('.pdf')) {
            await fs.unlink(path.join(uploadsDir, file))
            deletedFiles++
          }
        }
        
        logger.info({
          event: 'pdfs_cleanup',
          filesDeleted: deletedFiles
        }, `${deletedFiles} fichier(s) PDF supprimé(s)`)
      } catch (error) {
        logger.error({
          event: 'pdfs_cleanup_error',
          error: error.message
        }, 'Erreur lors du nettoyage des PDFs')
      }
      
      // 2. Récupérer toutes les collections de la base de données
      const collections = await mongoose.connection.db.collections()
      
      // 3. Supprimer toutes les collections
      for (const collection of collections) {
        await collection.drop()
        logger.info({
          event: 'collection_dropped',
          collectionName: collection.collectionName
        }, `Collection ${collection.collectionName} supprimée`)
      }
      
      logger.warn({
        event: 'delete_account_database_success',
        userId,
        ip: clientIp,
        timestamp: new Date().toISOString()
      }, '⚠️ BASE DE DONNÉES ENTIÈREMENT SUPPRIMÉE')
      
      // Supprimer le cookie
      clearAuthCookie(res)
      
      res.json({ message: 'Compte et base de données supprimés avec succès' })
    } catch (error) {
      logger.error({
        event: 'delete_account_database_error',
        userId,
        error: error.message,
        ip: clientIp
      }, 'Erreur lors de la suppression de la base de données')
      
      throw error
    }
})