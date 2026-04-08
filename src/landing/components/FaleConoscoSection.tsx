export function FaleConoscoSection() {
  const enrollmentPhoneHref = 'tel:+5511947966982'
  const enrollmentPhoneLabel = '+55 (11) 9 4796-6982'
  const supportPhoneHref = 'tel:+553520380560'
  const supportPhoneLabel = '+55 (35) 2038-0560'
  const dreamWhatsappHref =
    'https://wa.me/5511947966982?text=Ol%C3%A1,%20estou%20no%20site%20da%20Faculdade%20de%20Psicologia%20e%20quero%20realizar%20meu%20sonho%20com%20voc%C3%AAs.'
  const enrollmentDocumentsWhatsappHref =
    'https://wa.me/5521991586516?text=Ol%C3%A1,%20estou%20no%20site%20da%20Faculdade%20de%20Psicologia%20e%20preciso%20de%20ajuda%20com%20matr%C3%ADcula%20e%20documentos.'
  const tutoringWhatsappHref =
    'https://wa.me/5511991401940?text=Ol%C3%A1,%20estou%20no%20site%20da%20Faculdade%20de%20Psicologia%20e%20preciso%20de%20suporte%20acad%C3%AAmico.'
  const billingWhatsappHref =
    'https://wa.me/5531984088941?text=Ol%C3%A1,%20estou%20no%20site%20da%20Faculdade%20de%20Psicologia%20e%20preciso%20falar%20sobre%20boletos%20e%20acordos.'

  return (
    <section id="fale-conosco" className="lp-fale-conosco">
      <div className="lp-fale-conosco__bg">
        <picture>
          <source srcSet="/landing/background-fale-conosco-mobile.webp" media="(max-width: 768px)" />
          <img src="/landing/background-fale-conosco.webp" alt="Fundo" loading="lazy" decoding="async" />
        </picture>
      </div>

      <div className="lp-fale-conosco__inner">
        <div className="lp-fale-conosco__header-col">
          <h2 className="lp-fale-conosco__title">FALE CONOSCO</h2>
          <p className="lp-fale-conosco__subtitle">QUAL CANAL GOSTARIA DE FALAR?</p>
        </div>

        <div className="lp-fale-conosco__cards">
          
          {/* Card Ligação */}
          <div className="lp-fale-conosco__card">
            <div className="lp-fale-conosco__card-header">
              <div className="lp-fale-conosco__badge">
                <img src="/landing/icone-ligacao.webp" alt="Ligação" loading="lazy" decoding="async" />
              </div>
            </div>

            <div className="lp-fale-conosco__card-body">
              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content">
                  <h4>1. DÊ O START NO SEU SONHO</h4>
                  <p>
                    Tire suas dúvidas sobre Cursos de Graduação e Pós-graduação e{' '}
                    <a
                      href={dreamWhatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <strong className="text-blue">Realize seu Sonho com a Fasul.</strong>
                    </a>
                  </p>
                  <a href={enrollmentPhoneHref} className="lp-fale-conosco__item-action">
                    <img src="/landing/icone-phone-green.webp" alt="Telefone" />
                    <span>{enrollmentPhoneLabel}</span>
                  </a>
                </div>
              </div>

              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content">
                  <h4>2. CONVERSE CONOSCO</h4>
                  <p>Estamos prontos para tirar suas dúvidas e te dar o Suporte certo para qualquer necessidade sua.</p>
                  <a href={supportPhoneHref} className="lp-fale-conosco__item-action">
                    <img src="/landing/icone-phone-green.webp" alt="Telefone" />
                    <span>{supportPhoneLabel}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card WhatsApp */}
          <div className="lp-fale-conosco__card">
            <div className="lp-fale-conosco__card-header">
              <div className="lp-fale-conosco__badge">
                <img src="/landing/icone-whatsapp.webp" alt="WhatsApp" loading="lazy" decoding="async" />
              </div>
            </div>

            <div className="lp-fale-conosco__card-body">
              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content lp-fale-conosco__item-content--row">
                  <div className="lp-fale-conosco__item-text">
                    <h4>3. MATRÍCULA E DOCUMENTOS</h4>
                    <p>Pendências de Matrícula, Solicitação de Histórico, Declarações e Documentos.</p>
                  </div>
                  <a
                    href={enrollmentDocumentsWhatsappHref}
                    className="lp-fale-conosco__btn-whatsapp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/landing/icone-box-whatsapp.webp" alt="WhatsApp" />
                  </a>
                </div>
              </div>

              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content lp-fale-conosco__item-content--row">
                  <div className="lp-fale-conosco__item-text">
                    <h4>4. TUTORIA (APOIO AO ALUNO)</h4>
                    <p>Dúvidas sobre o Conteúdo das Aulas e Suporte para seu Sucesso Acadêmico.</p>
                  </div>
                  <a
                    href={tutoringWhatsappHref}
                    className="lp-fale-conosco__btn-whatsapp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/landing/icone-box-whatsapp.webp" alt="WhatsApp" />
                  </a>
                </div>
              </div>

              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content lp-fale-conosco__item-content--row">
                  <div className="lp-fale-conosco__item-text">
                    <h4>5. BOLETOS E ACORDOS FÁCIL</h4>
                    <p>Pague sem dor de cabeça! 2ª via de Boletos, Mensalidades, Negociação.</p>
                  </div>
                  <a
                    href={billingWhatsappHref}
                    className="lp-fale-conosco__btn-whatsapp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/landing/icone-box-whatsapp.webp" alt="WhatsApp" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
