import React, { useEffect, useRef } from 'react'

// Textarea qui s'ajuste automatiquement en hauteur et largeur
function AutoResizeTextarea({ value, placeholder, style = {}, autoWidth = false, noLimit = false, maxLength, ...props }) {
  const ref = useRef(null)

  // Met à jour la taille du textarea (hauteur et largeur)
  const updateSizes = (textarea) => {
    if (!textarea) return

    // Hauteur auto selon le contenu
    textarea.style.height = 'auto'
    if (!value && placeholder) {
      const prev = textarea.value
      textarea.value = placeholder
      textarea.style.height = textarea.scrollHeight + 'px'
      textarea.value = prev
    } else {
      textarea.style.height = textarea.scrollHeight + 'px'
    }

    // Largeur auto , limitée à la moitié du parent
    if (autoWidth) {
      const parent = textarea.parentElement
      const parentCS = parent ? window.getComputedStyle(parent) : null
      const gap = parentCS ? parseInt(parentCS.gap || parentCS.columnGap || '0', 10) : 0
      const parentWidth = parent ? parent.clientWidth : 800
      const maxEach = Math.max(120, Math.floor((parentWidth - gap) / 2))

      // Désactive temporairement le retour à la ligne pour avoir la largeur réelle
      const prevWrap = textarea.getAttribute('wrap')
      if (prevWrap !== 'off') textarea.setAttribute('wrap', 'off')
      const prevWidth = textarea.style.width
      textarea.style.width = 'auto'

      // scrollWidth donne la largeur du contenu sans retour à la ligne
      const contentWidth = textarea.scrollWidth

      const minW = 160
      const target = Math.max(minW, Math.min(contentWidth, maxEach))
      textarea.style.width = target + 'px'

      // Restaure le wrap si besoin
      if (prevWrap !== 'off') textarea.setAttribute('wrap', prevWrap || 'soft')
    }
  }

  useEffect(() => {
    const textarea = ref.current
    if (!textarea) return

    const run = () => updateSizes(textarea)
    run()

    // Récalcule sur resize pour garder le bon affichage
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
  }, [value, placeholder, autoWidth])

  return (
    <textarea
      ref={ref}
      value={value}
      placeholder={placeholder}
      style={{
        width: autoWidth ? 'auto' : '100%',
        minHeight: 40,
        overflow: 'hidden',
        resize: 'none',
        ...style
      }}
      // Empeche le retour a la ligne si autoWidth
      wrap={autoWidth ? 'off' : undefined}
      // Limite par défaut à 550 caractères sauf si désactivé
      maxLength={noLimit ? undefined : (typeof maxLength === 'number' ? maxLength : 550)}
      onInput={(e) => {
        updateSizes(e.target)
        if (props.onInput) props.onInput(e)
      }}
      {...props}
    />
  )
}

export default AutoResizeTextarea