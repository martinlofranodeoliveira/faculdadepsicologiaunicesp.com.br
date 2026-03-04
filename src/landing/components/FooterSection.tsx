const PROFILE_ITEMS = [
  'Dominar a prática através da vivência em nossa Clínica-Escola',
  'Desenvolver raciocínio técnico para tomar decisões em casos de alta complexidade',
  'Ser referência no Mercado unindo Ciência à Prática ética e humana',
  'Conquistar versatilidade para atuar em escolas, hospitais, empresas e órgãos públicos',
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
