export function FaqSection() {
  return (
    <section id="graduacao" className="lp-graduation" aria-label="Sobre o curso de graduação em psicologia">
      <div className="lp-graduation__inner">
        <div className="lp-graduation__media">
          <img
            src="/landing/graduacao-presencial-psicologia-sessao-com-estudante.webp"
            alt="Estudante de psicologia em sessão com paciente"
            loading="lazy"
          />
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
              <strong>Presencial:</strong> Local: 200m do Metrô Belém | SP
            </span>
          </div>

          <div className="lp-graduation__heading">
            <h2 className="lp-graduation__title">GRADUAÇÃO PRESENCIAL EM PSICOLOGIA</h2>
            <p className="lp-graduation__subtitle">Cuidando de você com atenção e excelência.</p>
          </div>

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

          <div className="lp-graduation__knowledge">
            <strong>Área de conhecimento:</strong>
            <div className="lp-graduation__tags">
              <span className="lp-graduation__tag lp-graduation__tag--one">Destaque</span>
              <span className="lp-graduation__tag lp-graduation__tag--two">Destaque</span>
              <span className="lp-graduation__tag lp-graduation__tag--three">Destaque</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
