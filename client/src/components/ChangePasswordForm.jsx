// Composant pour changer le mot de passe admin
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { apiFetch } from '../lib/api'

function ChangePasswordForm({ token }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    // Validation du nouveau mot de passe (regex comme le backend)
    if (!/[a-z]/.test(newPassword)) {
      toast.error('Le mot de passe doit contenir au moins une minuscule')
      return
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Le mot de passe doit contenir au moins une majuscule')
      return
    }
    
    if (!/\d/.test(newPassword)) {
      toast.error('Le mot de passe doit contenir au moins un chiffre')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    setIsChangingPassword(true)
    
    try {
      const result = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      toast.success(result?.message || 'Mot de passe modifié avec succès', { autoClose: 2000 })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Change password error:', error)
      toast.error(error.message || 'Une erreur est survenue', { autoClose: 10000 })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <section className="password-change-section">
      <h3 className="password-change-title">Changer le mot de passe admin</h3>
      <form onSubmit={handlePasswordChange} className="password-change-form">
        <div className="form-group">
          <label htmlFor="current-password" className="form-label">
            Mot de passe actuel
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Mot de passe actuel"
            className="form-input"
            disabled={isChangingPassword}
            autoComplete="current-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-password" className="form-label">
            Nouveau mot de passe
          </label>
          <input
            id="new-password"
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 caractères"
            className="form-input"
            disabled={isChangingPassword}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password" className="form-label">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm-password"
            type="text"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Répétez le mot de passe"
            className="form-input"
            disabled={isChangingPassword}
          />
        </div>
        <button
          type="submit"
          disabled={isChangingPassword}
          className="btn btn-primary btn-password-submit"
        >
          {isChangingPassword ? 'Modification en cours...' : 'Modifier le mot de passe'}
        </button>
      </form>
    </section>
  )
}

export default ChangePasswordForm
