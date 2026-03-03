import type { MouseEvent } from 'react'

export function ProfileBannerSection() {
  const handleNavigateToPostCourses = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById('pos-graduacao')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="pos-graduacao-banner" className="lp-post-banner" aria-label="Banner pós-graduação EAD">
      <div className="lp-post-banner__inner">
        <a
          className="lp-post-banner__link"
          href="#pos-graduacao"
          onClick={handleNavigateToPostCourses}
          aria-label="Ir para cursos de pós-graduação"
        >
          <picture className="lp-post-banner__picture">
            <source media="(max-width: 768px)" srcSet="/landing/posgraduacao-banner-mobile.webp" />
            <img
              className="lp-post-banner__image"
              src="/landing/posgraduacao-banner.webp"
              alt="Pós-graduação EAD - Agilidade e assertividade faltam por aí?"
            />
          </picture>
        </a>
      </div>
    </section>
  )
}
