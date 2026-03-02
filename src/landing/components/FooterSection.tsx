const PROFILE_ITEMS = [
  'Escuta ativa e empatia',
  'Análise crítica de comportamentos',
  'Equilíbrio emocional',
  'Respeito à confidencialidade',
  'Comunicação clara e assertiva',
  'Interesse por aprofundamento na Psicologia',
]

export function FooterSection() {
  return (
    <section id="sobre" className="lp-about-course" aria-label="Sobre o curso de psicologia">
      <div className="lp-about-course__inner">
        <div className="lp-about-course__content">
          <h2 className="lp-about-course__title">SOBRE O CURSO DE PSICOLOGIA</h2>
          <p className="lp-about-course__description">
            Analise os processos mentais e o comportamento humano e desenvolva competências para
            identificar, prevenir e intervir em transtornos mentais, desequilíbrios emocionais e
            alterações de personalidade.
          </p>

          <h3 className="lp-about-course__profile-title">Perfil do profissional:</h3>
          <ul className="lp-about-course__profile-list">
            {PROFILE_ITEMS.map((item, index) => (
              <li key={`${item}-${index}`} className="lp-about-course__profile-item">
                <img src="/landing/sobre-curso-check.svg" alt="" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lp-about-course__media">
          <img
            src="/landing/sobre-curso-psicologia.png"
            alt="Estudante de psicologia em atendimento supervisionado"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
