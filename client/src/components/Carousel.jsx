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
    <figure className="carousel-wrapper" role="region" aria-label="Projects carousel" aria-roledescription="carousel">
      {/* Flèche gauche */}
        <button 
          onClick={prev} 
          className="carousel-arrow carousel-arrow-left" 
          aria-label="Previous projects"
          type="button"
        >
          ←
        </button>
      {/* Affichage des éléments */}
      <section className="carousel-items" role="group" aria-live="polite">
        {visible.map((item, i) => (
          <article key={i} className="carousel-item" aria-label={`Project: ${item.title}`}>
            {/* Titre de l'élément */}
            <h3 className="carousel-item-title">{item.title}</h3>
            {/* Contenu de l'élément */}
            <p className="carousel-item-content">{item.content}</p>
          </article>
        ))}
      </section>
      {/* Flèche droite */}
        <button 
          onClick={next} 
          className="carousel-arrow carousel-arrow-right" 
          aria-label="Next projects"
          type="button"
        >
          →
        </button>
    </figure>
  )
}

export default Carousel