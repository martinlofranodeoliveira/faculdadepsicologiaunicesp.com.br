type MarketArea = {
  image: string
  title: string
  description: string
  salary: string
}

const MARKET_AREAS: MarketArea[] = [
  {
    image: '/landing/areas-atuacao-1.webp',
    title: 'Psicólogo de Saúde',
    description:
      'Integre equipes multidisciplinares em hospitais e Unidades de Saúde, focando no cuidado integral do paciente através da psicologia.',
    salary: 'MÉDIA SALARIAL: R$ 3.800,00 A R$ 5.200,00',
  },
  {
    image: '/landing/areas-atuacao-2.webp',
    title: 'Psicólogo Esportivo',
    description:
      'Potencialize o rendimento de atletas e equipes através do acompanhamento psicológico e controle emocional em treinos e competições.',
    salary: 'MÉDIA SALARIAL: R$ 4.500,00 A R$ 8.500,00',
  },
  {
    image: '/landing/areas-atuacao-3.webp',
    title: 'Psicólogo Social',
    description:
      'Atue em Instituições de longa permanência, Unidades de acolhimento voltadas a crianças e adolescentes, e no Sistema prisional.',
    salary: 'MÉDIA SALARIAL: R$ 3.200,00 A R$ 4.800,00',
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
              <img
                src={area.image}
                alt={`Atuacao profissional em ${area.title}`}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />

              <div className="lp-market-areas__salary">
                <img src="/landing/areas-paid.svg" alt="" aria-hidden="true" />
                <span>{area.salary}</span>
              </div>

              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
