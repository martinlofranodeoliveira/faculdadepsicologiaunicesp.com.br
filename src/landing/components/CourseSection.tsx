import { useCallback, useEffect, useMemo, useState, type FormEvent, type UIEventHandler } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import {
  formatPhoneMask,
  normalizeName,
  sendLeadToCrm,
  validateEmail,
  validateFullName,
  validatePhone,
  type CourseType,
} from '../crmLead'
import { formCourseGroups } from '../data'
import { POS_COURSES_ENDPOINT, parsePostGraduationCourses } from '../postCourses'

type FormStep = 1 | 2
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'
type PostCourseStatus = 'idle' | 'loading' | 'success' | 'error'

type CourseOption = {
  value: string
  label: string
  courseId?: number
}

type FieldName = 'courseType' | 'course' | 'fullName' | 'email' | 'phone'
type FieldErrors = Partial<Record<FieldName, string>>
type Touched = Record<FieldName, boolean>
type TargetPsychologyPostCourse = {
  title: string
  fallbackValue: string
  aliases: string[]
}

const COURSE_TYPE_OPTIONS: Array<{ value: CourseType; label: string }> = [
  { value: 'graduacao', label: 'Graduação' },
  { value: 'pos', label: 'Pós-graduação EAD' },
]

const DEFAULT_GRADUATION_OPTION: CourseOption = {
  value: 'graduacao-psicologia',
  label: 'Graduação em Psicologia Presencial',
}

const STEP_FIELDS: Record<FormStep, FieldName[]> = {
  1: ['courseType', 'course'],
  2: ['fullName', 'email', 'phone'],
}

const EMPTY_TOUCHED: Touched = {
  courseType: false,
  course: false,
  fullName: false,
  email: false,
  phone: false,
}

const COURSE_SCROLL_PAGE_SIZE = 24
const TARGET_PSYCHOLOGY_POST_COURSES: TargetPsychologyPostCourse[] = [
  {
    title: 'NEUROPSICOLOGIA',
    fallbackValue: 'pos-neuropsicologia',
    aliases: ['NEUROPSICOLOGIA'],
  },
  {
    title: 'PSICOLOGIA ESCOLAR E EDUCACIONAL',
    fallbackValue: 'pos-psicologia-escolar-e-educacional',
    aliases: ['PSICOLOGIA ESCOLAR E EDUCACIONAL'],
  },
  {
    title: 'PSICOLOGIA FORENSE E JURÍDICA',
    fallbackValue: 'pos-psicologia-forense-e-juridica',
    aliases: ['PSICOLOGIA FORENSE E JURIDICA', 'PSICOLOGIA FORENSE E JURÍDICA'],
  },
  {
    title: 'PSICOLOGIA INFANTIL',
    fallbackValue: 'pos-psicologia-infantil',
    aliases: ['PSICOLOGIA INFANTIL'],
  },
  {
    title: 'PSICOLOGIA PASTORAL',
    fallbackValue: 'pos-psicologia-pastoral',
    aliases: ['PSICOLOGIA PASTORAL'],
  },
  {
    title: 'PSICOLOGIA SOCIAL',
    fallbackValue: 'pos-psicologia-social',
    aliases: ['PSICOLOGIA SOCIAL', 'PSICOLOGIA SOCIAL E'],
  },
]

function normalizeComparableText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function normalizeCourseLookupText(value: string): string {
  return normalizeComparableText(value).replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function courseMatchesTarget(courseLabel: string, target: TargetPsychologyPostCourse): boolean {
  const normalizedLabel = normalizeCourseLookupText(courseLabel)

  return target.aliases.some((alias) => {
    const normalizedAlias = normalizeCourseLookupText(alias)
    return (
      normalizedLabel === normalizedAlias ||
      normalizedLabel.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedLabel)
    )
  })
}

function validateCourseType(value: string): string | undefined {
  if (!value) return 'Selecione para continuar'
  return undefined
}

function validateCourse(value: string): string | undefined {
  if (!value) return 'Informe o curso para continuar'
  return undefined
}

function validateField(field: FieldName, value: string): string | undefined {
  if (field === 'courseType') return validateCourseType(value)
  if (field === 'fullName') return validateFullName(value)
  if (field === 'email') return validateEmail(value)
  if (field === 'phone') return validatePhone(value)
  return validateCourse(value)
}

function inferCourseTypeFromValue(value: string): CourseType {
  return value.toLowerCase().startsWith('pos-') ? 'pos' : 'graduacao'
}

export function CourseSection() {
  const [step, setStep] = useState<FormStep>(1)
  const [courseType, setCourseType] = useState<CourseType | ''>('graduacao')
  const [course, setCourse] = useState(DEFAULT_GRADUATION_OPTION.value)
  const [courseSearch, setCourseSearch] = useState(DEFAULT_GRADUATION_OPTION.label)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false)
  const [postCourseOptions, setPostCourseOptions] = useState<CourseOption[]>(
    () =>
      TARGET_PSYCHOLOGY_POST_COURSES.map((targetCourse) => ({
        value: targetCourse.fallbackValue,
        label: targetCourse.title,
      })),
  )
  const [postCourseStatus, setPostCourseStatus] = useState<PostCourseStatus>('idle')
  const [postCourseErrorMessage, setPostCourseErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Touched>(EMPTY_TOUCHED)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [visibleCourseCount, setVisibleCourseCount] = useState(COURSE_SCROLL_PAGE_SIZE)

  const loadPostCourses = useCallback(async () => {
    setPostCourseStatus('loading')
    setPostCourseErrorMessage('')

    try {
      const response = await fetch(POS_COURSES_ENDPOINT, {
        method: 'GET',
        headers: {
          Accept: 'text/plain, */*',
        },
      })

      if (!response.ok) {
        throw new Error(`Post courses request failed with status ${response.status}`)
      }

      const rawText = await response.text()
      const parsedCourses = parsePostGraduationCourses(rawText).map((courseItem) => ({
        value: courseItem.value,
        label: courseItem.label,
        courseId: courseItem.courseId,
      }))

      if (!parsedCourses.length) {
        throw new Error('No post-graduation courses were parsed from the API response')
      }

      const usedCourseValues = new Set<string>()
      const resolvedPsychologyPostCourses = TARGET_PSYCHOLOGY_POST_COURSES.map((targetCourse) => {
        const matchedCourse = parsedCourses.find((courseOption) => {
          if (usedCourseValues.has(courseOption.value)) return false
          return courseMatchesTarget(courseOption.label, targetCourse)
        })

        if (!matchedCourse) {
          return {
            value: targetCourse.fallbackValue,
            label: targetCourse.title,
          }
        }

        usedCourseValues.add(matchedCourse.value)
        return matchedCourse
      })

      setPostCourseOptions(resolvedPsychologyPostCourses)
      setPostCourseStatus('success')
    } catch (error) {
      console.error('Erro ao carregar cursos de pós-graduação da API:', error)
      setPostCourseStatus('error')
      setPostCourseErrorMessage('Não foi possível carregar os cursos de Pós-graduação no momento.')
    }
  }, [])

  useEffect(() => {
    void loadPostCourses()
  }, [loadPostCourses])

  const allCourseOptions = useMemo<CourseOption[]>(() => {
    return formCourseGroups.flatMap((group) => group.options)
  }, [])

  const courseOptionsByType = useMemo<Record<CourseType, CourseOption[]>>(() => {
    return {
      graduacao: allCourseOptions,
      pos: postCourseOptions,
    }
  }, [allCourseOptions, postCourseOptions])

  const availableCourses = useMemo(() => {
    if (!courseType) return []
    return courseOptionsByType[courseType]
  }, [courseType, courseOptionsByType])

  const filteredCourses = useMemo(() => {
    const normalized = normalizeComparableText(courseSearch)
    return availableCourses.filter((item) => {
      return normalizeComparableText(item.label).includes(normalized)
    })
  }, [availableCourses, courseSearch])

  useEffect(() => {
    setVisibleCourseCount(COURSE_SCROLL_PAGE_SIZE)
  }, [courseType, courseSearch])

  const visibleCourses = useMemo(() => {
    return filteredCourses.slice(0, visibleCourseCount)
  }, [filteredCourses, visibleCourseCount])

  const canLoadMoreVisibleCourses = visibleCourses.length < filteredCourses.length

  const courseOptionsLookup = useMemo(() => {
    const lookup = new Map<string, CourseOption>()

    allCourseOptions.forEach((option) => {
      lookup.set(option.value, option)
    })

    postCourseOptions.forEach((option) => {
      lookup.set(option.value, option)
    })

    return lookup
  }, [allCourseOptions, postCourseOptions])

  const courseLookup = useMemo(() => {
    const lookup = new Map<string, string>()

    courseOptionsLookup.forEach((option, key) => {
      lookup.set(key, option.label)
    })

    return lookup
  }, [courseOptionsLookup])

  const isPostCoursesLoading = courseType === 'pos' && postCourseStatus === 'loading'
  const isCourseSearchDisabled = !courseType || isPostCoursesLoading
  const isGraduationCourseLocked = courseType === 'graduacao'

  const courseTypeInvalid = Boolean(touched.courseType && fieldErrors.courseType)
  const courseInvalid = Boolean(touched.course && fieldErrors.course)
  const fullNameInvalid = Boolean(touched.fullName && fieldErrors.fullName)
  const emailInvalid = Boolean(touched.email && fieldErrors.email)
  const phoneInvalid = Boolean(touched.phone && fieldErrors.phone)

  const formLeadTitle = step === 1 ? 'Encontre seu Curso' : 'Informe os dados'

  const applyFieldValidation = (field: FieldName, value: string) => {
    const error = validateField(field, value)
    setFieldErrors((previous) => ({ ...previous, [field]: error }))
  }

  const markTouched = (field: FieldName) => {
    setTouched((previous) => ({ ...previous, [field]: true }))
  }

  const getFieldValue = (field: FieldName): string => {
    if (field === 'courseType') return courseType
    if (field === 'course') return course
    if (field === 'fullName') return fullName
    if (field === 'email') return email
    return phone
  }

  const validateFields = (fields: FieldName[]): boolean => {
    const nextErrors: FieldErrors = {}

    fields.forEach((field) => {
      nextErrors[field] = validateField(field, getFieldValue(field))
    })

    setFieldErrors((previous) => ({ ...previous, ...nextErrors }))
    setTouched((previous) => {
      const merged = { ...previous }
      fields.forEach((field) => {
        merged[field] = true
      })
      return merged
    })

    return fields.every((field) => !nextErrors[field])
  }

  const handleStepAdvance = (from: FormStep) => {
    const isValid = validateFields(STEP_FIELDS[from])
    if (!isValid) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    if (from === 1) {
      setIsCourseSearchOpen(false)
    }

    setStep(Math.min(from + 1, 2) as FormStep)
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  const handleStepBack = () => {
    setStep(Math.max(step - 1, 1) as FormStep)
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  const validateAllFields = (): FieldErrors => {
    return {
      courseType: validateCourseType(courseType),
      course: validateCourse(course),
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    }
  }

  const handleCourseSearchMenuScroll: UIEventHandler<HTMLDivElement> = (event) => {
    if (courseType !== 'pos') return
    if (!canLoadMoreVisibleCourses) return

    const target = event.currentTarget
    const remaining = target.scrollHeight - (target.scrollTop + target.clientHeight)
    if (remaining > 24) return

    setVisibleCourseCount((current) =>
      Math.min(current + COURSE_SCROLL_PAGE_SIZE, filteredCourses.length),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (step === 1) {
      handleStepAdvance(1)
      return
    }

    const errors = validateAllFields()
    setFieldErrors(errors)
    setTouched({
      courseType: true,
      course: true,
      fullName: true,
      email: true,
      phone: true,
    })

    const hasErrors = Object.values(errors).some(Boolean)
    if (hasErrors) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    setSubmitStatus('submitting')
    setSubmitMessage('Enviando seus dados...')

    try {
      const selectedCourseOption = courseOptionsLookup.get(course)
      const courseLabel = (courseLookup.get(course) ?? courseSearch.trim()) || course
      const resolvedCourseType = (courseType || inferCourseTypeFromValue(course)) as CourseType

      await sendLeadToCrm({
        fullName,
        email,
        phone,
        selection: {
          courseType: resolvedCourseType,
          courseValue: course,
          courseLabel,
          courseId: selectedCourseOption?.courseId,
        },
      })

      setSubmitStatus('success')
      setSubmitMessage('Cadastro enviado com sucesso.')
      window.location.assign('/obrigado')
    } catch (error) {
      console.error('Erro ao enviar lead para o CRM:', error)
      setSubmitStatus('error')
      setSubmitMessage('Não foi possível enviar agora. Tente novamente em instantes.')
    }
  }

  return (
    <section id="contato" className="lp-lead">
      <div className="lp-lead__inner">
        <div className="lp-lead__title-wrap">
          <h2 className="lp-lead__title">{formLeadTitle}</h2>
          <img
            className="lp-lead__title-icon"
            src="/landing/lead-arrow-forward.svg"
            alt=""
            aria-hidden="true"
          />
        </div>

        <form className="lp-lead__form" onSubmit={handleSubmit} noValidate>
          {step === 1 ? (
            <div className="lp-lead__row lp-lead__row--step-1">
              <div className="lp-lead__field-wrap lp-lead__field-wrap--modality">
                <label
                  className={`lp-lead__field lp-lead__field--select ${
                    courseTypeInvalid ? 'is-invalid' : ''
                  }`}
                >
                  <img
                    className="lp-lead__icon lp-lead__icon--chevron"
                    src="/landing/lead-chevron-down.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="lp-lead__select-wrapper">
                    <Select
                      value={courseType}
                      onValueChange={(value) => {
                        const nextType = value as CourseType
                        const nextCourseValue =
                          nextType === 'graduacao' ? DEFAULT_GRADUATION_OPTION.value : ''
                        const nextCourseLabel =
                          nextType === 'graduacao' ? DEFAULT_GRADUATION_OPTION.label : ''

                        setCourseType(nextType)
                        setCourse(nextCourseValue)
                        setCourseSearch(nextCourseLabel)
                        setIsCourseSearchOpen(false)

                        if (touched.courseType) {
                          applyFieldValidation('courseType', nextType)
                        }

                        if (touched.course) {
                          applyFieldValidation('course', nextCourseValue)
                        }
                      }}
                    >
                      <SelectTrigger
                        className="lp-lead__select-trigger"
                        aria-label="Selecione o tipo de curso"
                        aria-invalid={courseTypeInvalid}
                        aria-describedby={courseTypeInvalid ? 'lead-course-type-error' : undefined}
                        onBlur={() => {
                          markTouched('courseType')
                          applyFieldValidation('courseType', courseType)
                        }}
                      >
                        <SelectValue placeholder="Modalidade" />
                      </SelectTrigger>
                      <SelectContent className="lp-lead__select-content" position="popper" sideOffset={6}>
                        {COURSE_TYPE_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </label>
                {courseTypeInvalid ? (
                  <span className="lp-lead__error" id="lead-course-type-error">
                    {fieldErrors.courseType}
                  </span>
                ) : null}
              </div>

              <div className="lp-lead__field-wrap lp-lead__course-search-wrap">
                <label
                  className={`lp-lead__field lp-lead__field--search ${
                    courseInvalid ? 'is-invalid' : ''
                  } ${isCourseSearchDisabled ? 'is-disabled' : ''}`}
                >
                  <img
                    className="lp-lead__icon lp-lead__icon--search"
                    src="/landing/lead-search.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Busque o curso"
                    value={courseSearch}
                    disabled={isCourseSearchDisabled}
                    readOnly={isGraduationCourseLocked}
                    autoComplete="off"
                    aria-invalid={courseInvalid}
                    aria-describedby={courseInvalid ? 'lead-course-error' : undefined}
                    aria-readonly={isGraduationCourseLocked}
                    onFocus={() => {
                      if (courseType && !isGraduationCourseLocked) {
                        setIsCourseSearchOpen(true)
                      }
                    }}
                    onBlur={() => {
                      markTouched('course')
                      window.setTimeout(() => {
                        setIsCourseSearchOpen(false)

                        if (isGraduationCourseLocked) {
                          setCourse(DEFAULT_GRADUATION_OPTION.value)
                          setCourseSearch(DEFAULT_GRADUATION_OPTION.label)
                          applyFieldValidation('course', DEFAULT_GRADUATION_OPTION.value)
                          return
                        }

                        const normalizedSearch = normalizeComparableText(courseSearch)
                        if (!course && normalizedSearch) {
                          const exactMatch = availableCourses.find(
                            (item) => normalizeComparableText(item.label) === normalizedSearch,
                          )
                          if (exactMatch) {
                            setCourse(exactMatch.value)
                            setCourseSearch(exactMatch.label)
                            applyFieldValidation('course', exactMatch.value)
                            return
                          }
                        }

                        applyFieldValidation('course', course)
                      }, 110)
                    }}
                    onChange={(event) => {
                      if (isGraduationCourseLocked) {
                        return
                      }

                      const value = event.target.value
                      setCourseSearch(value)
                      setIsCourseSearchOpen(Boolean(courseType))

                      const normalizedValue = normalizeComparableText(value)
                      const selectedCourseLabel = course ? (courseLookup.get(course) ?? '') : ''

                      if (!normalizedValue) {
                        if (course) {
                          setCourse('')
                        }
                        if (touched.course) {
                          applyFieldValidation('course', '')
                        }
                        return
                      }

                      if (
                        course &&
                        selectedCourseLabel &&
                        normalizeComparableText(selectedCourseLabel) !== normalizedValue
                      ) {
                        setCourse('')
                        if (touched.course) {
                          applyFieldValidation('course', '')
                        }
                      }
                    }}
                  />
                </label>

                {isCourseSearchOpen && courseType && !isGraduationCourseLocked ? (
                  <div
                    className="lp-lead__course-search-menu"
                    role="listbox"
                    aria-label="Cursos disponíveis"
                    onScroll={handleCourseSearchMenuScroll}
                  >
                    {postCourseStatus === 'loading' ? (
                      <span className="lp-lead__course-search-empty">
                        Carregando cursos de Pós-graduação...
                      </span>
                    ) : postCourseStatus === 'error' ? (
                      <div className="lp-lead__course-search-error">
                        <span className="lp-lead__course-search-empty">{postCourseErrorMessage}</span>
                        <button
                          type="button"
                          className="lp-lead__course-search-retry"
                          onMouseDown={(mouseEvent) => {
                            mouseEvent.preventDefault()
                          }}
                          onClick={() => {
                            void loadPostCourses()
                          }}
                        >
                          Tentar novamente
                        </button>
                      </div>
                    ) : visibleCourses.length > 0 ? (
                      visibleCourses.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={`lp-lead__course-search-item ${
                            course === item.value ? 'is-active' : ''
                          }`}
                          onMouseDown={(mouseEvent) => {
                            mouseEvent.preventDefault()
                          }}
                          onClick={() => {
                            setCourse(item.value)
                            setCourseSearch(item.label)
                            setIsCourseSearchOpen(false)
                            markTouched('course')
                            applyFieldValidation('course', item.value)
                          }}
                        >
                          {item.label}
                        </button>
                      ))
                    ) : (
                      <span className="lp-lead__course-search-empty">Nenhum curso encontrado.</span>
                    )}

                    {canLoadMoreVisibleCourses ? (
                      <span className="lp-lead__course-search-empty lp-lead__course-search-more">
                        Role para carregar mais cursos...
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {courseInvalid ? (
                  <span className="lp-lead__error" id="lead-course-error">
                    {fieldErrors.course}
                  </span>
                ) : null}
              </div>

              <button type="submit" className="lp-lead__button">
                CONTINUAR
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="lp-lead__row lp-lead__row--step-2">
              <button type="button" className="lp-lead__back" onClick={handleStepBack}>
                Voltar
              </button>

              <div className="lp-lead__field-wrap">
                <label className={`lp-lead__field lp-lead__field--plain ${fullNameInvalid ? 'is-invalid' : ''}`}>
                  <input
                    type="text"
                    placeholder="Digite seu nome"
                    value={fullName}
                    autoComplete="name"
                    maxLength={120}
                    aria-invalid={fullNameInvalid}
                    aria-describedby={fullNameInvalid ? 'lead-full-name-error' : undefined}
                    onBlur={() => {
                      markTouched('fullName')
                      applyFieldValidation('fullName', fullName)
                    }}
                    onChange={(event) => {
                      const value = normalizeName(event.target.value)
                      setFullName(value)
                      if (touched.fullName) {
                        applyFieldValidation('fullName', value)
                      }
                    }}
                  />
                </label>
                {fullNameInvalid ? (
                  <span className="lp-lead__error" id="lead-full-name-error">
                    {fieldErrors.fullName}
                  </span>
                ) : null}
              </div>

              <div className="lp-lead__field-wrap">
                <label className={`lp-lead__field lp-lead__field--plain ${emailInvalid ? 'is-invalid' : ''}`}>
                  <input
                    type="email"
                    placeholder="Seu melhor email"
                    value={email}
                    autoComplete="email"
                    maxLength={120}
                    aria-invalid={emailInvalid}
                    aria-describedby={emailInvalid ? 'lead-email-error' : undefined}
                    onBlur={() => {
                      markTouched('email')
                      applyFieldValidation('email', email)
                    }}
                    onChange={(event) => {
                      const value = event.target.value
                      setEmail(value)
                      if (touched.email) {
                        applyFieldValidation('email', value)
                      }
                    }}
                  />
                </label>
                {emailInvalid ? (
                  <span className="lp-lead__error" id="lead-email-error">
                    {fieldErrors.email}
                  </span>
                ) : null}
              </div>

              <div className="lp-lead__field-wrap">
                <label className={`lp-lead__field lp-lead__field--plain ${phoneInvalid ? 'is-invalid' : ''}`}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Telefone"
                    value={phone}
                    autoComplete="tel-national"
                    maxLength={15}
                    aria-invalid={phoneInvalid}
                    aria-describedby={phoneInvalid ? 'lead-phone-error' : undefined}
                    onBlur={() => {
                      markTouched('phone')
                      applyFieldValidation('phone', phone)
                    }}
                    onChange={(event) => {
                      const masked = formatPhoneMask(event.target.value)
                      setPhone(masked)
                      if (touched.phone) {
                        applyFieldValidation('phone', masked)
                      }
                    }}
                  />
                </label>
                {phoneInvalid ? (
                  <span className="lp-lead__error" id="lead-phone-error">
                    {fieldErrors.phone}
                  </span>
                ) : null}
              </div>

              <button type="submit" className="lp-lead__button" disabled={submitStatus === 'submitting'}>
                {submitStatus === 'submitting' ? 'ENVIANDO...' : 'ENVIAR'}
              </button>
            </div>
          ) : null}
        </form>

        {submitMessage ? (
          <small className={`lp-lead__status ${submitStatus === 'error' ? 'lp-lead__status--error' : ''}`}>
            {submitMessage}
          </small>
        ) : null}
      </div>
    </section>
  )
}
