import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'

import type { PostCategoryCourse } from './postCategoryData'

type Props = {
  courses: PostCategoryCourse[]
}

const AREA_PRIORITY = [
  'gestao-e-negocios',
  'tecnologia-e-marketing',
  'educacao-e-carreira-publica',
  'psicologia',
] as const

const AREA_LABEL_OVERRIDES: Record<string, string> = {
  'gestao-e-negocios': 'Gestão e Negócios',
  'tecnologia-e-marketing': 'Tecnologia e Marketing',
  'educacao-e-carreira-publica': 'Educação e Carreira Pública',
  psicologia: 'Psicologia',
}

const COURSE_TYPES = [
  { value: 'ead', label: 'EAD' },
  { value: 'semipresencial', label: 'Semipresencial' },
  { value: 'presencial', label: 'Presencial' },
] as const

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function resolveAreaLabel(value: string, label: string) {
  return AREA_LABEL_OVERRIDES[value] || label
}

function resolveCourseImage(image: string) {
  return image && !image.includes('posgraduacao-banner') ? image : '/course/image_fx_19_1.webp'
}

export function PostCategoryExplorer({ courses }: Props) {
  const [query, setQuery] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const deferredQuery = useDeferredValue(query)
  const ITEMS_PER_PAGE = 4

  const areas = useMemo(() => {
    const uniqueAreas = new Map<string, string>()

    courses.forEach((course) => {
      const areaValue = course.area?.trim()
      if (!areaValue) return
      uniqueAreas.set(areaValue, course.areaLabel || AREA_LABEL_OVERRIDES[areaValue] || areaValue)
    })

    const orderedAreas = [...uniqueAreas.entries()].sort(([leftValue, leftLabel], [rightValue, rightLabel]) => {
      const leftPriority = AREA_PRIORITY.indexOf(leftValue as (typeof AREA_PRIORITY)[number])
      const rightPriority = AREA_PRIORITY.indexOf(rightValue as (typeof AREA_PRIORITY)[number])

      if (leftPriority !== -1 || rightPriority !== -1) {
        if (leftPriority === -1) return 1
        if (rightPriority === -1) return -1
        return leftPriority - rightPriority
      }

      return leftLabel.localeCompare(rightLabel, 'pt-BR')
    })

    return orderedAreas.map(([value, label]) => ({
      value,
      label: resolveAreaLabel(value, label),
    }))
  }, [courses])

  function toggleSelection(value: string, currentValues: string[], setter: (values: string[]) => void) {
    startTransition(() => {
      setter(
        currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      )
      setCurrentPage(1)
    })
  }

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalizeText(deferredQuery)

    return courses.filter((course) => {
      const courseArea = course.area?.trim() ?? ''
      const courseType = course.modality?.toLowerCase() ?? ''
      const matchesArea = !selectedAreas.length || selectedAreas.includes(courseArea)
      const matchesType = !selectedTypes.length || selectedTypes.includes(courseType)
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(course.title).includes(normalizedQuery) ||
        normalizeText(course.courseLabel).includes(normalizedQuery)

      return matchesArea && matchesType && matchesQuery
    })
  }, [courses, deferredQuery, selectedAreas, selectedTypes])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE
  const pageCourses = filteredCourses.slice(pageStart, pageStart + ITEMS_PER_PAGE)
  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      startTransition(() => setCurrentPage(safeCurrentPage))
    }
  }, [currentPage, safeCurrentPage])

  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-[1240px] flex flex-col">
      <div className="mb-[30px] text-[16px] lg:text-[20px] text-[#070707] font-['Liberation_Sans'] flex flex-wrap items-center">
        <a href="/" className="underline hover:opacity-80 transition-opacity">
          Home
        </a>
        <span className="mx-2">/</span>
        <span className="text-black/50 truncate max-w-full inline-block">Pós-graduação</span>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 lg:mb-[70px]">
        <h1 className="text-[#040404] text-[24px] lg:text-[28px] xl:text-[35px] font-extrabold uppercase font-['Kumbh_Sans'] leading-tight m-0 whitespace-nowrap">
          Todas as pós-graduações
        </h1>

        <div className="flex items-center gap-[15px] w-full lg:w-[500px] xl:w-[630px]">
          <div className="bg-white border border-black/50 rounded-[300px] flex items-center px-[17px] lg:px-[25px] py-[8px] lg:py-[15px] flex-1 overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mr-[10px] w-[20px] lg:w-[24px]">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="black" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(event) => startTransition(() => setQuery(event.target.value))}
              placeholder="Busque aqui seu curso"
              className="w-full bg-transparent outline-none text-[14px] lg:text-[18px] text-black font-['Kumbh_Sans'] font-semibold lg:font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFiltersOpen((current) => !current)}
            className="lg:hidden w-[40px] h-[40px] shrink-0 transition-opacity hover:opacity-80"
            aria-label="Abrir filtros"
          >
            <img src="/landing/Frame%201000008853.svg" alt="Filtros" className="w-full h-full object-contain" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-[18px] lg:gap-[40px] w-full">
        <aside className={`${isFiltersOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-[271px] flex-col gap-[18px] shrink-0`}>
          <div className="bg-white rounded-[12px] p-[18px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] flex flex-col gap-3">
            <h3 className="font-['Kumbh_Sans'] font-bold text-[16px] text-[#1b63de] leading-[1.2] m-0">
              Tipo de Curso
            </h3>
            <div className="flex flex-col gap-[10px]">
              {COURSE_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-[7px] cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      value={type.value}
                      checked={selectedTypes.includes(type.value)}
                      onChange={() => toggleSelection(type.value, selectedTypes, setSelectedTypes)}
                      className="peer appearance-none w-[24px] h-[24px] border border-gray-400 rounded-[4px] checked:bg-[#1b63de] checked:border-[#1b63de] transition-colors shrink-0"
                    />
                    <svg className="absolute w-[14px] h-[14px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="font-['Kumbh_Sans'] font-normal text-[15px] lg:text-[16px] text-[rgba(1,1,1,0.75)] leading-[1.2] group-hover:text-black transition-colors">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[12px] p-[18px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] flex flex-col gap-3">
            <h3 className="font-['Kumbh_Sans'] font-bold text-[16px] text-[#1b63de] leading-[1.2] m-0">
              Área do Conhecimento
            </h3>
            <div className="flex flex-col gap-[10px]">
              {areas.map((area) => (
                <label key={area.value} className="flex items-center gap-[7px] cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      value={area.value}
                      checked={selectedAreas.includes(area.value)}
                      onChange={() => toggleSelection(area.value, selectedAreas, setSelectedAreas)}
                      className="peer appearance-none w-[24px] h-[24px] border border-gray-400 rounded-[4px] checked:bg-[#1b63de] checked:border-[#1b63de] transition-colors shrink-0"
                    />
                    <svg className="absolute w-[14px] h-[14px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="font-['Kumbh_Sans'] font-normal text-[15px] lg:text-[16px] text-[rgba(1,1,1,0.75)] leading-[1.2] group-hover:text-black transition-colors">
                    {area.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex flex-col w-full relative">
          <div className="flex items-center justify-end mb-[20px] gap-[41px]">
            <div className="flex flex-col font-['Kumbh_Sans'] font-medium justify-center relative shrink-0 text-[16px] text-[rgba(0,0,0,0.5)] whitespace-nowrap">
              <p className="leading-[24px]">
                {filteredCourses.length ? `${pageStart + 1}-${Math.min(pageStart + ITEMS_PER_PAGE, filteredCourses.length)}` : '0-0'} de {filteredCourses.length}
              </p>
            </div>
            <div className="flex items-center gap-[12px]">
              <button
                type="button"
                className={safeCurrentPage === 1 ? 'opacity-25 cursor-not-allowed' : 'opacity-100 hover:opacity-70 transition-opacity'}
                aria-label="Página anterior"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <img src="/landing/arrow_back_ios.svg" alt="Anterior" className="w-[18px] h-[18px] object-contain" />
              </button>
              <button
                type="button"
                className={safeCurrentPage >= totalPages ? 'opacity-25 cursor-not-allowed' : 'opacity-100 hover:opacity-70 transition-opacity'}
                aria-label="Próxima página"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                <img src="/landing/arrow_back_ios.svg" alt="Próximo" className="w-[18px] h-[18px] object-contain rotate-180" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-[20px] w-full pb-8">
            {pageCourses.map((course) => (
              <article key={course.path} className="bg-white rounded-[22px] p-[14px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row items-center gap-5 w-full transition-transform hover:-translate-y-1">
                <div className="bg-black h-[180px] sm:h-[137px] w-full sm:w-[217px] rounded-[16px] overflow-hidden shrink-0 relative">
                  <img
                    src={resolveCourseImage(course.image)}
                    alt={course.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-6">
                  <div className="flex flex-col gap-3 lg:gap-[16px] w-full lg:max-w-[467px]">
                    <div className="inline-flex">
                      <div className="bg-[#1b63de] rounded-[42px] px-[14px] py-[4px] flex items-center justify-center gap-2">
                        <span className="font-['Kumbh_Sans'] font-semibold text-[12px] lg:text-[14px] text-white leading-[1.45] uppercase">
                          GANHE +3 PÓS PARA VOCÊ OU UM AMIGO!
                        </span>
                      </div>
                    </div>

                    <h3 className="font-['Kumbh_Sans'] font-bold text-[16px] lg:text-[18px] text-black uppercase leading-[1.14] m-0">
                      {course.title}
                    </h3>

                    <div className="flex flex-wrap items-baseline gap-x-[10px] text-black leading-none font-['Kumbh_Sans']">
                      <span className="font-bold text-[18px] uppercase">{course.currentInstallmentPrice}</span>
                      {course.oldInstallmentPrice && (
                        <span className="text-[18px] text-[rgba(43,33,33,0.25)] line-through font-bold uppercase">
                          {course.oldInstallmentPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-[192px]">
                    <a
                      href={course.path}
                      className="bg-gradient-to-r from-[#073588] to-[#041c46] hover:opacity-90 transition-opacity text-white font-extrabold font-['Kumbh_Sans'] text-[16px] uppercase rounded-[12px] h-[49px] w-full flex items-center justify-center"
                    >
                      inscreva-se
                    </a>
                  </div>
                </div>
              </article>
            ))}
            {!pageCourses.length ? (
              <div className="rounded-[22px] bg-white p-8 text-center shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)]">
                <p className="font-['Kumbh_Sans'] text-[18px] font-bold text-[#0b111f]">Nenhum curso encontrado</p>
                <p className="mt-2 text-[15px] text-[rgba(0,0,0,0.65)]">Ajuste os filtros para ver outras opções de pós-graduação.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}


