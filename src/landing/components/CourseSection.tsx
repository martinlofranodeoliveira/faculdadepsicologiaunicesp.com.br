import { useCallback, useEffect, useMemo, useState, type FormEvent, type UIEventHandler } from 'react'

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
import { OverlaySelect } from './OverlaySelect'
import {
  PSYCHOLOGY_POST_COURSES,
  getDefaultWorkloadValue,
  getPsychologyPostCourseByValue,
  normalizeComparableCourseText,
  psychologyPostCourseMatches,
} from '../psychologyPostCourses'
import { POS_COURSES_ENDPOINT, parsePostGraduationCourses } from '../postCourses'

type FormStep = 1 | 2
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'
type PostCourseStatus = 'idle' | 'loading' | 'success' | 'error'
type StepTransitionPhase = 'idle' | 'exit' | 'enter'
type StepTransitionDirection = 'forward' | 'backward'

type CourseOption = {
  value: string
  label: string
  courseId?: number
}

type FieldName = 'courseType' | 'course' | 'workload' | 'fullName' | 'email' | 'phone'
type FieldErrors = Partial<Record<FieldName, string>>
type Touched = Record<FieldName, boolean>

const COURSE_TYPE_OPTIONS: Array<{ value: CourseType; label: string }> = [
  { value: 'graduacao', label: 'Graduação' },
  { value: 'pos', label: 'Pós-Graduação EAD' },
]

const DEFAULT_GRADUATION_OPTION: CourseOption = {
  value: 'graduacao-psicologia',
  label: 'Graduação em Psicologia Presencial',
}

const EMPTY_TOUCHED: Touched = {
  courseType: false,
  course: false,
  workload: false,
  fullName: false,
  email: false,
  phone: false,
}

const COURSE_SCROLL_PAGE_SIZE = 24
const STEP_TRANSITION_DURATION_MS = 240

function validateCourseType(value: string): string | undefined {
  if (!value) return 'Selecione para continuar'
  return undefined
}

function validateCourse(value: string): string | undefined {
  if (!value) return 'Informe o curso para continuar'
  return undefined
}

function validateWorkload(value: string, courseType: CourseType | ''): string | undefined {
  if (courseType !== 'pos') return undefined
  if (!value) return 'Selecione a carga horária para continuar'
  return undefined
}

function validateField(field: FieldName, value: string, courseType: CourseType | ''): string | undefined {
  if (field === 'courseType') return validateCourseType(value)
  if (field === 'workload') return validateWorkload(value, courseType)
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
  const [workload, setWorkload] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false)
  const [postCourseOptions, setPostCourseOptions] = useState<CourseOption[]>(
    () =>
      PSYCHOLOGY_POST_COURSES.map((targetCourse) => ({
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
  const [stepTransitionPhase, setStepTransitionPhase] = useState<StepTransitionPhase>('idle')
  const [stepTransitionDirection, setStepTransitionDirection] =
    useState<StepTransitionDirection>('forward')
  const [queuedStep, setQueuedStep] = useState<FormStep | null>(null)

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
      const parsedCourses = parsePostGraduationCourses(rawText)

      if (!parsedCourses.length) {
        throw new Error('No post-graduation courses were parsed from the API response')
      }

      const usedCourseValues = new Set<string>()
      const resolvedPsychologyPostCourses = PSYCHOLOGY_POST_COURSES.map((targetCourse) => {
        const matchedCourse = parsedCourses.find((courseItem) => {
          if (usedCourseValues.has(courseItem.value)) return false
          return psychologyPostCourseMatches(courseItem.label, targetCourse)
        })

        if (!matchedCourse) {
          return {
            value: targetCourse.fallbackValue,
            label: targetCourse.title,
            courseId: targetCourse.fallbackCourseId,
          }
        }

        usedCourseValues.add(matchedCourse.value)
        return {
          value: targetCourse.fallbackValue,
          label: matchedCourse.label,
          courseId: matchedCourse.courseId,
        }
      })

      setPostCourseOptions(resolvedPsychologyPostCourses)
      setPostCourseStatus('success')
    } catch (error) {
      console.error('Erro ao carregar cursos de pós-graduação da API:', error)
      setPostCourseStatus('error')
      setPostCourseErrorMessage('Não foi possível carregar os cursos de Pós-Graduação no momento.')
    }
  }, [])

  useEffect(() => {
    if (courseType !== 'pos') return
    if (postCourseStatus === 'loading' || postCourseStatus === 'success') return
    void loadPostCourses()
  }, [courseType, loadPostCourses, postCourseStatus])

  useEffect(() => {
    if (stepTransitionPhase !== 'exit' || queuedStep === null) {
      return
    }

    const timerId = window.setTimeout(() => {
      setStep(queuedStep)
      setStepTransitionPhase('enter')
    }, STEP_TRANSITION_DURATION_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [queuedStep, stepTransitionPhase])

  useEffect(() => {
    if (stepTransitionPhase !== 'enter') {
      return
    }

    const timerId = window.setTimeout(() => {
      setStepTransitionPhase('idle')
      setQueuedStep(null)
    }, STEP_TRANSITION_DURATION_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [stepTransitionPhase])

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
    const normalized = normalizeComparableCourseText(courseSearch)
    return availableCourses.filter((item) => {
      return normalizeComparableCourseText(item.label).includes(normalized)
    })
  }, [availableCourses, courseSearch])

  useEffect(() => {
    setVisibleCourseCount(COURSE_SCROLL_PAGE_SIZE)
  }, [courseType, courseSearch])

  useEffect(() => {
    if (courseType !== 'pos') {
      setWorkload('')
      return
    }

    const currentPostCourse = getPsychologyPostCourseByValue(course)
    const defaultWorkloadValue = getDefaultWorkloadValue(currentPostCourse?.workloads ?? [])

    setWorkload((current) => {
      if (!currentPostCourse) return ''
      if (currentPostCourse.workloads.some((item) => item.value === current)) return current
      return defaultWorkloadValue
    })
  }, [course, courseType])

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

  const selectedPostCourse = useMemo(() => {
    if (courseType !== 'pos') return undefined
    return getPsychologyPostCourseByValue(course)
  }, [course, courseType])

  const selectedPostCourseWorkloads = selectedPostCourse?.workloads ?? []
  const isWorkloadRequired = courseType === 'pos'
  const isWorkloadDisabled = !isWorkloadRequired || !course || !selectedPostCourseWorkloads.length
  const shouldShowWorkloadField = step === 1 && courseType === 'pos'

  const isPostCoursesLoading = courseType === 'pos' && postCourseStatus === 'loading'
  const isCourseSearchDisabled = !courseType || isPostCoursesLoading
  const isGraduationCourseLocked = courseType === 'graduacao'

  const courseTypeInvalid = Boolean(touched.courseType && fieldErrors.courseType)
  const courseInvalid = Boolean(touched.course && fieldErrors.course)
  const workloadInvalid = Boolean(touched.workload && fieldErrors.workload)
  const fullNameInvalid = Boolean(touched.fullName && fieldErrors.fullName)
  const emailInvalid = Boolean(touched.email && fieldErrors.email)
  const phoneInvalid = Boolean(touched.phone && fieldErrors.phone)

  const isStepTransitioning = stepTransitionPhase !== 'idle'
  const formLeadTitle = step === 1 ? 'Encontre seu Curso' : 'Informe os dados'
  const rowTransitionClass =
    stepTransitionPhase === 'idle'
      ? ''
      : `is-${stepTransitionPhase === 'exit' ? 'leaving' : 'entering'} ${
          stepTransitionDirection === 'forward' ? 'to-next' : 'to-prev'
        }`

  const applyFieldValidation = (field: FieldName, value: string) => {
    const error = validateField(field, value, courseType)
    setFieldErrors((previous) => ({ ...previous, [field]: error }))
  }

  const markTouched = (field: FieldName) => {
    setTouched((previous) => ({ ...previous, [field]: true }))
  }

  const getFieldValue = (field: FieldName): string => {
    if (field === 'courseType') return courseType
    if (field === 'course') return course
    if (field === 'workload') return workload
    if (field === 'fullName') return fullName
    if (field === 'email') return email
    return phone
  }

  const getStepFields = (targetStep: FormStep): FieldName[] => {
    if (targetStep === 1) {
      return ['courseType', 'course', ...(courseType === 'pos' ? (['workload'] as FieldName[]) : [])]
    }

    return ['fullName', 'email', 'phone']
  }

  const validateFields = (fields: FieldName[]): boolean => {
    const nextErrors: FieldErrors = {}

    fields.forEach((field) => {
      nextErrors[field] = validateField(field, getFieldValue(field), courseType)
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

  const startStepTransition = (targetStep: FormStep) => {
    if (targetStep === step || isStepTransitioning) return

    setStepTransitionDirection(targetStep > step ? 'forward' : 'backward')
    setQueuedStep(targetStep)
    setStepTransitionPhase('exit')
  }

  const handleStepAdvance = (from: FormStep) => {
    if (isStepTransitioning) return

    const isValid = validateFields(getStepFields(from))
    if (!isValid) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    if (from === 1) {
      setIsCourseSearchOpen(false)
    }

    startStepTransition(Math.min(from + 1, 2) as FormStep)
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  const handleStepBack = () => {
    if (isStepTransitioning) return

    startStepTransition(Math.max(step - 1, 1) as FormStep)
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  const validateAllFields = (): FieldErrors => {
    return {
      courseType: validateCourseType(courseType),
      course: validateCourse(course),
      workload: validateWorkload(workload, courseType),
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
    if (isStepTransitioning) return

    if (step === 1) {
      handleStepAdvance(1)
      return
    }

    const errors = validateAllFields()
    setFieldErrors(errors)
    setTouched({
      courseType: true,
      course: true,
      workload: true,
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
          workloadValue: resolvedCourseType === 'pos' ? workload : undefined,
          workloadLabel:
            resolvedCourseType === 'pos'
              ? selectedPostCourseWorkloads.find((item) => item.value === workload)?.label
              : undefined,
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
    <section
      id="contato"
      className={`lp-lead ${shouldShowWorkloadField ? 'lp-lead--post-active' : ''}`}
    >
      <div className="lp-lead__inner">
        <div className="lp-lead__title-wrap">
          <h2 className="lp-lead__title">{formLeadTitle}</h2>
        </div>

        <form
          className={`lp-lead__form lp-lead__form--step-${step} ${
            shouldShowWorkloadField ? 'lp-lead__form--step-1-post' : ''
          }`}
          onSubmit={handleSubmit}
          noValidate
        >
          {step === 1 ? (
            <div
              className={`lp-lead__row lp-lead__row--step-1 ${
                shouldShowWorkloadField ? 'is-post' : ''
              } ${rowTransitionClass}`}
            >
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
                    <OverlaySelect
                      value={courseType}
                      options={COURSE_TYPE_OPTIONS}
                      placeholder="Modalidade"
                      ariaLabel="Selecione o tipo de curso"
                      ariaInvalid={courseTypeInvalid}
                      ariaDescribedBy={courseTypeInvalid ? 'lead-course-type-error' : undefined}
                      triggerClassName="ui-select-trigger"
                      contentClassName="lp-lead__select-content"
                      itemClassName="ui-select-item"
                      showChevron={false}
                      onBlur={() => {
                        markTouched('courseType')
                        applyFieldValidation('courseType', courseType)
                      }}
                      onValueChange={(value) => {
                        const nextType = value as CourseType
                        const nextCourseValue =
                          nextType === 'graduacao' ? DEFAULT_GRADUATION_OPTION.value : ''
                        const nextCourseLabel =
                          nextType === 'graduacao' ? DEFAULT_GRADUATION_OPTION.label : ''

                        setCourseType(nextType)
                        setCourse(nextCourseValue)
                        setCourseSearch(nextCourseLabel)
                        setWorkload('')
                        setIsCourseSearchOpen(false)
                        setFieldErrors((previous) => ({ ...previous, workload: undefined }))
                        setTouched((previous) => ({
                          ...previous,
                          workload: false,
                        }))

                        if (touched.courseType) {
                          const error = validateField('courseType', nextType, nextType)
                          setFieldErrors((previous) => ({ ...previous, courseType: error }))
                        }

                        if (touched.course) {
                          const error = validateField('course', nextCourseValue, nextType)
                          setFieldErrors((previous) => ({ ...previous, course: error }))
                        }
                      }}
                    />
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
                          setWorkload('')
                          applyFieldValidation('course', DEFAULT_GRADUATION_OPTION.value)
                          return
                        }

                        const normalizedSearch = normalizeComparableCourseText(courseSearch)
                        if (!course && normalizedSearch) {
                          const exactMatch = availableCourses.find(
                            (item) => normalizeComparableCourseText(item.label) === normalizedSearch,
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

                      const normalizedValue = normalizeComparableCourseText(value)
                      const selectedCourseLabel = course ? (courseLookup.get(course) ?? '') : ''

                      if (!normalizedValue) {
                        if (course) {
                          setCourse('')
                        }
                        setWorkload('')
                        setFieldErrors((previous) => ({ ...previous, workload: undefined }))
                        setTouched((previous) => ({ ...previous, workload: false }))
                        if (touched.course) {
                          applyFieldValidation('course', '')
                        }
                        return
                      }

                      if (
                        course &&
                        selectedCourseLabel &&
                        normalizeComparableCourseText(selectedCourseLabel) !== normalizedValue
                      ) {
                        setCourse('')
                        setWorkload('')
                        setFieldErrors((previous) => ({ ...previous, workload: undefined }))
                        setTouched((previous) => ({ ...previous, workload: false }))
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
                            setWorkload(getDefaultWorkloadValue(getPsychologyPostCourseByValue(item.value)?.workloads ?? []))
                            setIsCourseSearchOpen(false)
                            markTouched('course')
                            setFieldErrors((previous) => ({ ...previous, workload: undefined }))
                            setTouched((previous) => ({ ...previous, workload: false }))
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

              {shouldShowWorkloadField ? (
                <div className="lp-lead__field-wrap lp-lead__field-wrap--workload">
                  <label
                    className={`lp-lead__field lp-lead__field--select ${
                      workloadInvalid ? 'is-invalid' : ''
                    } ${isWorkloadDisabled ? 'is-disabled' : ''}`}
                  >
                    <div className="lp-lead__select-wrapper">
                      <OverlaySelect
                        value={workload}
                        disabled={isWorkloadDisabled}
                        options={selectedPostCourseWorkloads}
                        placeholder={'Selecione a carga hor\u00E1ria'}
                        ariaLabel={'Selecione a carga hor\u00E1ria'}
                        ariaInvalid={workloadInvalid}
                        ariaDescribedBy={workloadInvalid ? 'lead-workload-error' : undefined}
                        triggerClassName="ui-select-trigger"
                        contentClassName="lp-lead__select-content"
                        itemClassName="ui-select-item"
                        onBlur={() => {
                          markTouched('workload')
                          applyFieldValidation('workload', workload)
                        }}
                        onValueChange={(value) => {
                          setWorkload(value)
                          if (touched.workload) {
                            applyFieldValidation('workload', value)
                          }
                        }}
                      />
                    </div>
                  </label>
                  {workloadInvalid ? (
                    <span className="lp-lead__error" id="lead-workload-error">
                      {fieldErrors.workload}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <button type="submit" className="lp-lead__button" disabled={isStepTransitioning}>
                CONTINUAR
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className={`lp-lead__row lp-lead__row--step-2 ${rowTransitionClass}`}>
              <button
                type="button"
                className="lp-lead__back"
                onClick={handleStepBack}
                disabled={isStepTransitioning}
              >
                <img
                  className="lp-lead__back-icon"
                  src="/landing/grade-chevron.svg"
                  alt=""
                  aria-hidden="true"
                />
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

              <button
                type="submit"
                className="lp-lead__button"
                disabled={submitStatus === 'submitting' || isStepTransitioning}
              >
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
