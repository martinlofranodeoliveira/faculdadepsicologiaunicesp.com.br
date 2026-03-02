import './thank-you.css'

export function ThankYouPage() {
  return (
    <main className="ty-page">
      <section className="ty-container" aria-label="Confirmacao de envio">
        <img
          className="ty-logo"
          src="/landing/faculdade-de-psicologia-logo.webp"
          alt="Faculdade de Psicologia UNICESP"
        />

        <div className="ty-card">
          <h1 className="ty-card__title">Obrigado</h1>
          <p className="ty-card__text">Nossos consultores entrarao em contato em breve!</p>
        </div>

        <a className="ty-button-frame" href="/">
          <span className="ty-button">
            <img src="/landing/lead-arrow-forward.svg" alt="" aria-hidden="true" />
            Continuar Navegando
          </span>
        </a>
      </section>
    </main>
  )
}
