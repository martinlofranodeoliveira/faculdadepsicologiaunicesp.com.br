import { useEffect, useMemo, useRef, useState } from 'react'

type Testimonial = {
  id: number
  name: string
  course: string
  text: string
  rating: string
  stars: number
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Mariana Siqueira',
    course: 'Pós-graduação em Neuropsicologia',
    text: 'A estrutura das aulas me ajudou a organizar a rotina de estudo sem perder qualidade. O conteúdo é objetivo, atualizado e realmente conversa com a prática clínica.',
    rating: '5.0',
    stars: 5,
  },
  {
    id: 2,
    name: 'Larissa Menezes',
    course: 'Pós-graduação em Psicologia Clínica',
    text: 'Entrei buscando aprofundamento técnico e encontrei uma formação consistente. Os materiais complementares e a organização da plataforma fizeram diferença no meu rendimento.',
    rating: '4.9',
    stars: 5,
  },
  {
    id: 3,
    name: 'Rafael Costa',
    course: 'Pós-graduação em Psicologia Forense e Jurídica',
    text: 'Gostei porque o curso traz aplicações reais da atuação profissional. A trilha é clara, o suporte responde rápido e o cronograma funciona bem para quem trabalha.',
    rating: '4.8',
    stars: 5,
  },
  {
    id: 4,
    name: 'Beatriz Tavares',
    course: 'Pós-graduação em Psicologia Escolar e Educacional',
    text: 'A formação me ajudou a revisar fundamentos e também a enxergar estratégias novas para intervenção. O conteúdo é direto e sem enrolação.',
    rating: '4.7',
    stars: 5,
  },
  {
    id: 5,
    name: 'Patrícia Nogueira',
    course: 'Pós-graduação em Psicologia Infantil',
    text: 'O que mais me chamou atenção foi a clareza das explicações e a sequência dos módulos. É um curso que passa segurança para aplicar o conhecimento com responsabilidade.',
    rating: '5.0',
    stars: 5,
  },
  {
    id: 6,
    name: 'Thiago Martins',
    course: 'Pós-graduação em Psicologia Social',
    text: 'A proposta pedagógica é muito bem amarrada. Consegui evoluir no entendimento teórico e ao mesmo tempo relacionar o conteúdo com minha atuação profissional.',
    rating: '4.8',
    stars: 5,
  },
  {
    id: 7,
    name: 'Camila Freitas',
    course: 'Pós-graduação em Psicologia Pastoral',
    text: 'O curso entrega profundidade sem ficar pesado demais. Para mim, foi uma formação equilibrada entre base conceitual, orientação prática e flexibilidade.',
    rating: '4.9',
    stars: 5,
  },
  {
    id: 8,
    name: 'Eduardo Vasconcelos',
    course: 'Graduação em Psicologia',
    text: 'A experiência com a instituição foi muito positiva. Desde o atendimento até a organização das informações, tudo foi claro e transmitiu bastante confiança.',
    rating: '4.7',
    stars: 5,
  },
]

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activePage, setActivePage] = useState(0)
  const [pageCount, setPageCount] = useState(1)

  const checkScrollState = useMemo(
    () => () => {
      const container = scrollRef.current
      if (!container) return

      const { scrollLeft, scrollWidth, clientWidth } = container
      setCanScrollLeft(scrollLeft > 8)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8)

      const pageWidth = Math.max(clientWidth, 1)
      const nextPageCount = Math.max(1, Math.ceil(scrollWidth / pageWidth))
      setPageCount(nextPageCount)
      setActivePage(Math.min(nextPageCount - 1, Math.round(scrollLeft / pageWidth)))
    },
    [],
  )

  useEffect(() => {
    checkScrollState()
    window.addEventListener('resize', checkScrollState)
    return () => window.removeEventListener('resize', checkScrollState)
  }, [checkScrollState])

  const scrollByPage = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return

    container.scrollBy({
      left: direction === 'left' ? -container.clientWidth : container.clientWidth,
      behavior: 'smooth',
    })

    window.setTimeout(checkScrollState, 350)
  }

  return (
    <section className="w-full flex flex-col items-center py-12 lg:py-[60px] bg-[#09419f] mt-12 lg:mt-[60px] overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="w-full max-w-[1240px] flex flex-col items-start px-4 lg:px-8">
        <div className="w-full flex items-start justify-between gap-6 mb-8 lg:mb-12">
          <h2 className="text-white text-[28px] lg:text-[35px] font-extrabold uppercase font-['Kumbh_Sans'] leading-tight m-0 max-w-[520px]">
            O QUE NOSSOS ALUNOS DIZEM...
          </h2>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => scrollByPage('left')}
              disabled={!canScrollLeft}
              className={`h-12 w-12 rounded-full border border-white/25 bg-white/10 flex items-center justify-center transition ${canScrollLeft ? 'opacity-100 hover:bg-white/20' : 'opacity-35 cursor-not-allowed'}`}
              aria-label="Depoimentos anteriores"
            >
              <span className="text-white text-[22px] leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={() => scrollByPage('right')}
              disabled={!canScrollRight}
              className={`h-12 w-12 rounded-full border border-white/25 bg-white/10 flex items-center justify-center transition ${canScrollRight ? 'opacity-100 hover:bg-white/20' : 'opacity-35 cursor-not-allowed'}`}
              aria-label="Próximos depoimentos"
            >
              <span className="text-white text-[22px] leading-none">›</span>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={checkScrollState}
          className="flex w-full gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
        >
          {TESTIMONIALS.map((item) => (
            <article
              key={item.id}
              className="bg-[#f4f4f4] rounded-[16px] p-6 flex flex-col gap-4 shrink-0 snap-start w-[296px] lg:w-[306px] min-h-[356px]"
              style={{ scrollSnapAlign: 'start', scrollMarginLeft: '16px' }}
            >
              <img src="/course/mask_group.webp" alt="Aspas" className="mb-2 w-[47px] h-[30px] object-contain" />

              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[20px] text-black font-['Kumbh_Sans'] leading-tight m-0">{item.name}</h3>
                <p className="font-normal text-[14px] text-black font-['Kumbh_Sans'] leading-snug min-h-[42px] m-0">{item.course}</p>
              </div>

              <div className="h-px bg-[#d9d9d9] w-full"></div>

              <p className="font-normal text-[12px] text-[#0b111f] font-['Liberation_Sans'] leading-relaxed tracking-[-0.24px] min-h-[118px] m-0">
                {item.text}
              </p>

              <div className="flex items-center gap-3 mt-auto pt-2">
                <span className="font-semibold text-[14px] text-black font-['Kumbh_Sans']">{item.rating}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <img
                      key={star}
                      src="/course/star.webp"
                      alt="Estrela"
                      className={`w-[19px] h-[19px] object-contain ${star <= item.stars ? '' : 'grayscale opacity-30 brightness-150'}`}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="w-full flex items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const container = scrollRef.current
                  if (!container) return
                  container.scrollTo({ left: container.clientWidth * index, behavior: 'smooth' })
                  window.setTimeout(checkScrollState, 350)
                }}
                className={`h-3 w-3 rounded-full transition ${index === activePage ? 'bg-white' : 'bg-white/35 hover:bg-white/55'}`}
                aria-label={`Ir para página ${index + 1} dos depoimentos`}
              />
            ))}
          </div>

          <div className="flex lg:hidden items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollByPage('left')}
              disabled={!canScrollLeft}
              className={`h-10 w-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center transition ${canScrollLeft ? 'opacity-100' : 'opacity-35 cursor-not-allowed'}`}
              aria-label="Depoimentos anteriores"
            >
              <span className="text-white text-[20px] leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={() => scrollByPage('right')}
              disabled={!canScrollRight}
              className={`h-10 w-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center transition ${canScrollRight ? 'opacity-100' : 'opacity-35 cursor-not-allowed'}`}
              aria-label="Próximos depoimentos"
            >
              <span className="text-white text-[20px] leading-none">›</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
