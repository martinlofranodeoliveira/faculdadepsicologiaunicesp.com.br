const MARKET_AREAS = [
  {
    image: '/landing/areas-atuacao-1.png',
    title: 'Título',
    description: 'A cada disciplina, você contará com leituras digitais, slides, videoaulas e podcast.',
  },
  {
    image: '/landing/areas-atuacao-2.png',
    title: 'Título',
    description: 'A cada disciplina, você contará com leituras digitais, slides, videoaulas e podcast.',
  },
  {
    image: '/landing/areas-atuacao-3.png',
    title: 'Título',
    description: 'A cada disciplina, você contará com leituras digitais, slides, videoaulas e podcast.',
  },
]

export function MarketSection() {
  return (
    <section id="mercado" className="lp-market-areas" aria-label="Áreas de atuação">
      <div className="lp-market-areas__inner">
        <h2 className="lp-market-areas__title">ÁREAS DE ATUAÇÃO</h2>

        <div className="lp-market-areas__grid">
          {MARKET_AREAS.map((area, index) => (
            <article key={`${area.title}-${index}`} className="lp-market-areas__card">
              <img src={area.image} alt="" aria-hidden="true" />
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
