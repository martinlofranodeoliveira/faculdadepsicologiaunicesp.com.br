type MarketArea = {
  image: string
  title: string
  description: string
  salary: string
}

const DEFAULT_SALARY = 'MEDIA SALARIAL: R$ 4.000,00 A R$ 6.500,00'

const MARKET_AREAS: MarketArea[] = [
  {
    image: '/landing/areas-atuacao-1.png',
    title: 'Psicologo de saude',
    description:
      'Contribui para o cuidado com a saude integrando equipes formadas por diferentes profissionais.',
    salary: DEFAULT_SALARY,
  },
  {
    image: '/landing/areas-atuacao-2.png',
    title: 'Psicologo esportivo',
    description:
      'Oferece acompanhamento psicologico a esportistas, auxiliando na melhoria do rendimento em treinos e competicoes.',
    salary: DEFAULT_SALARY,
  },
  {
    image: '/landing/areas-atuacao-3.png',
    title: 'Psicologo social',
    description:
      'Exerce atividades em presidios, instituicoes de longa permanencia para idosos e unidades de atendimento voltadas a criancas e adolescentes.',
    salary: DEFAULT_SALARY,
  },
]

export function MarketSection() {
  return (
    <section id="mercado" className="lp-market-areas" aria-label="Areas de atuacao">
      <div className="lp-market-areas__inner">
        <h2 className="lp-market-areas__title">AREAS DE ATUACAO</h2>

        <div className="lp-market-areas__grid">
          {MARKET_AREAS.map((area, index) => (
            <article key={`${area.title}-${index}`} className="lp-market-areas__card">
              <img src={area.image} alt={`Atuacao profissional em ${area.title}`} loading="lazy" />

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
