export function GraduationVestibularHero() {
  return (
    <section className="vestibular-hero" aria-label="Vestibular Graduação 2026">
      <div className="vestibular-hero__inner">
        <picture className="vestibular-hero__banner">
          <source
            media="(max-width: 768px)"
            srcSet="/vestibular/vestibular-2026-graduacao-mobile.webp"
          />
          <img
            src="/vestibular/vestibular-2026-graduacao.webp"
            alt="Banner do Vestibular Graduação 2026 da Faculdade de Psicologia"
            width={1240}
            height={420}
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>
    </section>
  )
}
