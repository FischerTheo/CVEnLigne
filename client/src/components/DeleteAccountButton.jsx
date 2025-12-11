// Composant pour supprimer le compte admin et toute la base de données
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { apiFetch } from '../lib/api'

function DeleteAccountButton({ onLogout }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDeleteAccount = async () => {
    if (confirmText !== 'SUPPRIMER') {
      toast.error('Veuillez taper "SUPPRIMER" pour confirmer', { autoClose: 10000 })
      return
    }

    setIsDeleting(true)

    try {
      await apiFetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      toast.success('Compte et base de données supprimés avec succès', { autoClose: 2000 })
      
      // Déconnexion après 1 seconde
      setTimeout(() => {
        onLogout()
        window.location.href = '/'
      }, 1000)
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error(error.message || 'Erreur lors de la suppression', { autoClose: 10000 })
      setIsDeleting(false)
    }
  }

  if (!showConfirmation) {
    return (
      <div className="delete-account-wrapper">
        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          className="btn btn-danger btn-delete-account"
        >
          Supprimer le compte
        </button>
      </div>
    )
  }

  return (
    <section className="delete-account-wrapper delete-account-wrapper--confirm" aria-labelledby="delete-account-title">
      <h3 id="delete-account-title" className="delete-account-title"> CONFIRMATION REQUISE</h3>
      <p className="delete-account-warning">
        Vous etes sur le point de supprimer définitivement :
      </p>
      <ul className="delete-account-list">
        <li> Toutes les informations utilisateur</li>
        <li> Tous les projets</li>
        <li> Toutes les expériences et certifications</li>
        <li> Tous les fichiers uploadés</li>
        <li> Le compte administrateur</li>
      </ul>
      <p className="delete-account-confirm-text">
        Pour confirmer, tapez <strong>SUPPRIMER</strong> ci-dessous :
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Tapez SUPPRIMER"
        className="delete-account-input"
        disabled={isDeleting}
      />
      <div className="delete-account-buttons">
        <button
          type="button"
          onClick={() => {
            setShowConfirmation(false)
            setConfirmText('')
          }}
          disabled={isDeleting}
          className="btn btn-secondary"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={isDeleting || confirmText !== 'SUPPRIMER'}
          className="btn btn-danger"
        >
          {isDeleting ? 'Suppression en cours...' : 'Confirmer la suppression'}
        </button>
      </div>
    </section>
  )
}

export default DeleteAccountButton
