import React, { useState } from 'react'

// Composant Carousel : affiche 3 éléments à la fois avec navigation
function Carousel({ items }) {
  const [index, setIndex] = useState(0)
  const total = items.length
  // Calcule les 3 éléments visibles (boucle sur le tableau)
  const visible = [0, 1, 2].map(i => items[(index + i) % total])
  // Flèche gauche
  const prev = () => setIndex(i => (i - 1 + total) % total)
  // Flèche droite
  const next = () => setIndex(i => (i + 1) % total)

  return (
    <div className="carousel-wrapper">
      {/* Flèche gauche */}
      <button onClick={prev} className="carousel-arrow carousel-arrow-left" aria-label="Previous"></button>
      {/* Affichage des éléments */}
      <div className="carousel-items">
        {visible.map((item, i) => (
          <div key={i} className="carousel-item">
            {/* Titre de l'élément */}
            <div className="carousel-item-title">{item.title}</div>
            {/* Contenu de l'élément */}
            <div className="carousel-item-content">{item.content}</div>
          </div>
        ))}
      </div>
      {/* Flèche droite */}
      <button onClick={next} className="carousel-arrow carousel-arrow-right" aria-label="Next"></button>
    </div>
  )
}

export default Carousel