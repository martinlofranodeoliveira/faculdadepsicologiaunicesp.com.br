type MarketArea = {
  image: string
  title: string
  description: string
  salary: string
}

const MARKET_AREAS: MarketArea[] = [
  {
    image: '/landing/areas-atuacao-1.png',
    title: 'Psicólogo de Saúde',
    description:
      'Contribui para o cuidado com a saúde integrando equipes formadas por diferentes profissionais.',
    salary: 'MÉDIA SALARIAL: R$ 3.800,00 A R$ 5.200,00',
  },
  {
    image: '/landing/areas-atuacao-2.png',
    title: 'Psicólogo Esportivo',
    description:
      'Oferece acompanhamento psicológico a esportistas, auxiliando na melhoria do rendimento em treinos e competições.',
    salary: 'MÉDIA SALARIAL: R$ 4.500,00 A R$ 8.500,00',
  },
  {
    image: '/landing/areas-atuacao-3.png',
    title: 'Psicólogo Social',
    description:
      'Exerce atividades em presídios, instituições de longa permanência para idosos e unidades de atendimento voltadas a crianças e adolescentes.',
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
              <img src={area.image} alt={`Atuação profissional em ${area.title}`} loading="lazy" />

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
