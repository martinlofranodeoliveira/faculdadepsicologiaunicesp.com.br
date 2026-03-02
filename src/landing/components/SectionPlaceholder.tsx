type SectionPlaceholderProps = {
  id: string
  title: string
}

export function SectionPlaceholder({ id, title }: SectionPlaceholderProps) {
  return (
    <section id={id} className="lp-section">
      <div className="lp-section__inner">
        <h2>{title}</h2>
      </div>
    </section>
  )
}
