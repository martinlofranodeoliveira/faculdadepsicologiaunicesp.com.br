type FaqSectionProps = {
  onOpenPopup?: () => void
}

export function FaqSection({ onOpenPopup }: FaqSectionProps) {
  return (
    <section id="graduacao" className="lp-graduation" aria-label="Sobre o curso de graduação em psicologia">
      <div className="lp-graduation__inner">
        <h2 className="lp-graduation__title">GRADUAÇÃO PRESENCIAL EM PSICOLOGIA</h2>

        <div className="lp-graduation__content-wrap">
          <div className="lp-graduation__media">
            <picture>
              <source
                media="(max-width: 768px)"
                srcSet="/landing/graduacao-presencial-psicologia-sessao-com-estudante-mobile.webp"
              />
              <img
                src="/landing/graduacao-presencial-psicologia-sessao-com-estudante.webp"
                alt="Estudante de psicologia em sessão com paciente"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

          <div className="lp-graduation__content">
            <div className="lp-graduation__location">
              <img
                className="lp-graduation__location-icon"
                src="/landing/graduacao-location-on.svg"
                alt=""
                aria-hidden="true"
              />
              <span className="lp-graduation__location-text">
                <strong>Local:</strong> R. Júlio de Castilhos, 777 - Metrô Belém,
                <br />
                São Paulo - SP, 03059-005
              </span>
            </div>

            <p className="lp-graduation__subtitle">
              Prepare-se para o Mercado com vivências práticas e domínio das principais abordagens.
            </p>

            <div className="lp-graduation__meta">
              <div className="lp-graduation__meta-icon-wrap">
                <img
                  className="lp-graduation__meta-icon"
                  src="/landing/graduacao-calendar-month.svg"
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <div className="lp-graduation__meta-text">
                <strong>Data de início:</strong>
                <span>01/07/26</span>
              </div>
            </div>

            <button type="button" className="lp-graduation__cta" onClick={onOpenPopup}>
              SAIBA MAIS
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
