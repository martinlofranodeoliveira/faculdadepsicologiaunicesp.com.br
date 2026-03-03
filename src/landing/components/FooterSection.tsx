const PROFILE_ITEMS = [
  'Clínica-Escola própria para atendimentos supervisionados à comunidade',
  'Práticas supervisionadas e estágios em diversos contextos',
  'Interesse por aprofundamento na Psicologia',
  'Desenvolvimento de competências em avaliação e intervenção',
  'Atuação em saúde, educação, organizações e políticas públicas',
  'Formação ética alinhada às diretrizes profissionais',
]

export function FooterSection() {
  return (
    <section id="sobre" className="lp-about-course" aria-label="Sobre o curso de psicologia">
      <div className="lp-about-course__inner">
        <div className="lp-about-course__content">
          <h2 className="lp-about-course__title">SOBRE O CURSO DE PSICOLOGIA</h2>
          <p className="lp-about-course__description">
            A matriz curricular articula fundamentos teóricos, práticas supervisionadas e estágios
            obrigatórios, possibilitando ao estudante vivenciar experiências na clínica, na área
            organizacional, escolar, hospitalar e comunitária. A formação também contempla pesquisa
            científica e atividades de extensão, fortalecendo o compromisso ético e social do futuro
            psicólogo.
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
