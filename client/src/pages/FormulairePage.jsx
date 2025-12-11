// Page formulaire admin avec formulaires FR/EN synchronisés
import React, { useRef, useEffect } from 'react'
import Formulaire from '../components/forms/Formulaire.jsx'

function FormulairePage({ token, formulaireRefs, onCvPdfChange }) {
  const fallbackFormulaireRef1 = useRef()
  const fallbackFormulaireRef2 = useRef()
  const formulaireRef1 = (Array.isArray(formulaireRefs) && formulaireRefs[0]) || fallbackFormulaireRef1
  const formulaireRef2 = (Array.isArray(formulaireRefs) && formulaireRefs[1]) || fallbackFormulaireRef2

  // Met à jour le titre de la page 
  useEffect(() => {
    document.title = 'Formulaire - Admin'
  }, [])

  return (
    <main className="formulaire-page" id="main-content">
      <section className="formulaire-container">
        {/* Formulaire FR (gauche) */}
        <article className="form-block" lang="fr">
          <h2 className="form-block-title">formulaire fr</h2>
          <Formulaire
            ref={formulaireRef1}
            token={token}
            showNote={true}
            showTranslateButtons={false}
            showAddButtons={true}
            forcedLang="fr"
            idPrefix="form-fr"
            onCvPdfChange={onCvPdfChange}
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
        </article>
        {/* Formulaire EN (droite) */}
        <article className="form-block" lang="en">
          <h2 className="form-block-title">en form</h2>
          <Formulaire 
            ref={formulaireRef2} 
            token={token} 
            showNote={false} 
            showTranslateButtons={true} 
            showAddButtons={false} 
            forcedLang="en"
            idPrefix="form-en"
          />
        </article>
      </section>
    </main>
  )
}

export default FormulairePage
