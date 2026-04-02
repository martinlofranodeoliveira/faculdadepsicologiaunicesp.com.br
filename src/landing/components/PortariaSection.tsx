const PORTARIA_TEXT = 'Portaria nº 172, de 25/02/2021, publicado no D.O.U em 26/02/2021.'

export function PortariaSection() {
  return (
    <section id="portaria-psicologia" className="lp-portaria" aria-label="Portaria do curso de psicologia">
      <div className="lp-portaria__inner">
        <img
          className="lp-portaria__brand"
          src="/landing/faculdade-unicesp-logo-portaria.webp"
          alt="Faculdade UNICESP"
          loading="lazy"
          decoding="async"
        />

        <div className="lp-portaria__divider" aria-hidden="true" />

        <div className="lp-portaria__content">
          <span className="lp-portaria__badge">Portaria Psicologia</span>
          <p className="lp-portaria__text">{PORTARIA_TEXT}</p>
        </div>
      </div>
    </section>
  )
}
