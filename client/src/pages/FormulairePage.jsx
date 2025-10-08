// Page formulaire admin avec formulaires FR/EN synchronisés
import React, { useRef, useEffect } from 'react'
import Formulaire from '../components/forms/Formulaire.jsx'

function FormulairePage({ token, formulaireRefs }) {
  const formulaireRef1 = formulaireRefs?.[0] || useRef()
  const formulaireRef2 = formulaireRefs?.[1] || useRef()

  // Met à jour le titre de la page 
  useEffect(() => {
    document.title = 'Formulaire - Admin'
  }, [])

  return (
    <div className="formulaire-container" id="main-content">
      {/* Formulaire FR (gauche) */}
      <div className="form-block" lang="fr">
        <h2 className="form-block-title">formulaire fr</h2>
        <Formulaire
          ref={formulaireRef1}
          token={token}
          showNote={true}
          showTranslateButtons={false}
          showAddButtons={true}
          forcedLang="fr"
          onFormChange={(newForm) => {
            // Propage les mises à jour du formulaire FR (gauche) vers le formulaire EN (droite)
            if (!formulaireRef2.current) return
            const target = formulaireRef2.current
            if (newForm && typeof newForm === 'object' && 'field' in newForm && 'value' in newForm) {
              // Mise à jour d'un élément de tableau quand idx est fourni
              if ('idx' in newForm && typeof newForm.idx === 'number' && target.setExternalArrayField) {
                target.setExternalArrayField(newForm.field, newForm.idx, newForm.key, newForm.value)
                return
              }
              if (target.setExternalField) {
                target.setExternalField(newForm.field, newForm.value)
                return
              }
            }
          }}
        />
      </div>
      {/* Formulaire EN (droite) */}
      <div className="form-block" lang="en">
        <h2 className="form-block-title">en form</h2>
        <Formulaire 
          ref={formulaireRef2} 
          token={token} 
          showNote={false} 
          showTranslateButtons={true} 
          showAddButtons={false} 
          forcedLang="en" 
        />
      </div>
    </div>
  )
}

export default FormulairePage
