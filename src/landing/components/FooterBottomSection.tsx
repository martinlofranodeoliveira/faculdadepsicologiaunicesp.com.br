export function FooterBottomSection() {
  return (
    <footer id="rodape" className="lp-footer-bottom">
      <div className="lp-footer-bottom__inner">
        <div className="lp-footer-bottom__top">
          <section className="lp-footer-brand">
            <div className="lp-footer-brand__logo-wrap">
              <img
                className="lp-footer-brand__logo"
                src="/landing/faculdade-de-psicologia-logo.webp"
                alt="Faculdade de Psicologia"
              />
            </div>

            <p className="lp-footer-brand__description">
              ExcelÃªncia no ensino superior com foco na inovaÃ§Ã£o e na empregabilidade dos nossos alunos.
            </p>

            <div className="lp-footer-brand__social">
              <a href="#" aria-label="Facebook">
                <img src="/landing/footer-social-1.svg" alt="" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Instagram">
                <img src="/landing/footer-social-instagram.png" alt="" aria-hidden="true" />
              </a>
            </div>
          </section>

          <section className="lp-footer-contact-block">
            <h3>Contato</h3>

            <ul>
              <li>
                <img src="/landing/footer-icon-location.svg" alt="" aria-hidden="true" />
                <span>
                  R. Júlio de Castilhos, 777 - Metrô Belém
                  <br />
                  São Paulo - SP, 03059-005
                </span>
              </li>
              <li>
                <img src="/landing/footer-icon-phone.svg" alt="" aria-hidden="true" />
                <a href="tel:+551140028922">(11) 4002-8922</a>
              </li>
              <li>
                <img src="/landing/footer-icon-mail.svg" alt="" aria-hidden="true" />
                <a href="mailto:contato@faculdadepsicologiaunicesp.com.br">
                  contato@faculdadepsicologiaunicesp.com.br
                </a>
              </li>
            </ul>
          </section>

          <section className="lp-footer-map-block">
            <h3>LocalizaÃ§Ã£o</h3>

            <div className="lp-footer-map-block__card">
              <img src="/landing/footer-map.png" alt="Mapa de localizaÃ§Ã£o em SÃ£o Paulo" />
              <a
                href="https://maps.google.com/?q=R.+J%C3%BAlio+de+Castilhos,+777+-+Metr%C3%B4+Bel%C3%A9m,+S%C3%A3o+Paulo+-+SP,+03059-005"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/landing/footer-icon-maps.svg" alt="" aria-hidden="true" />
                Ver no Maps
              </a>
            </div>
          </section>
        </div>

        <div className="lp-footer-bottom__bar">
          <small>(c) 2026 Faculdade de Psicologia UNICESP. Todos os direitos reservados.</small>

          <div className="lp-footer-bottom__links">
            <a href="/politica-de-privacidade">PolÃ­tica de Privacidade</a>
            <a href="/termos-de-uso">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
