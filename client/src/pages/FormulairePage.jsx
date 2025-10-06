// Page formulaire admin avec formulaires FR/EN synchronisés
import React, { useRef } from 'react'
import Formulaire from '../components/forms/Formulaire.jsx'

function FormulairePage({ token, formulaireRefs }) {
  const formulaireRef1 = formulaireRefs?.[0] || useRef()
  const formulaireRef2 = formulaireRefs?.[1] || useRef()

  return (
    <div className="formulaire-container">
      {/* Formulaire FR (gauche) */}
      <div className="form-block">
        <h2 className="form-block-title">formulaire fr</h2>
        <Formulaire
          ref={formulaireRef1}
          token={token}
          showNote={true}
          showTranslateButtons={false}
          showAddButtons={true}
          forcedLang="fr"
          onFormChange={(newForm) => {
            // push updates from left FR form to right EN form
            if (!formulaireRef2.current) return
            const target = formulaireRef2.current
            if (newForm && typeof newForm === 'object' && 'field' in newForm && 'value' in newForm) {
              // Array cell update when idx is provided
              if ('idx' in newForm && typeof newForm.idx === 'number' && target.setExternalArrayField) {
                target.setExternalArrayField(newForm.field, newForm.idx, newForm.key, newForm.value)
                return
              }
              // Simple field update
              if (target.setExternalField) {
                target.setExternalField(newForm.field, newForm.value)
                return
              }
            }
            // Fallback: whole-form replacement - Ne devrait plus être nécessaire
            // On ne fait rien pour éviter d'écraser le formulaire EN
            console.warn('FormulairePage: Received full form update without field specification, ignoring to prevent data loss')
          }}
        />
      </div>
      {/* Formulaire EN (droite) */}
      <div className="form-block">
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
