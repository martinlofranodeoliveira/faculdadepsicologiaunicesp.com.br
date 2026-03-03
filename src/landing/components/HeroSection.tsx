type HeroSectionProps = {
  onOpenPopup: () => void
}

export function HeroSection({ onOpenPopup }: HeroSectionProps) {
  return (
    <section id="hero" className="lp-hero" aria-label="Graduação presencial em psicologia">
      <button
        type="button"
        className="lp-hero__trigger"
        onClick={onOpenPopup}
        aria-label="Abrir formulário de inscrição da Graduação em Psicologia Presencial"
      >
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/landing/graduacao-presencial-psicologia-mobile.webp"
          />
          <img
            className="lp-hero__image"
            src="/landing/graduacao-presencial-psicologia.webp"
            alt="Graduação presencial em Psicologia"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </button>
    </section>
  )
}
