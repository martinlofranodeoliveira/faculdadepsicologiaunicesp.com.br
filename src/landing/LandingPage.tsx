import './landing.css'
import { useCallback, useState } from 'react'

import type { CourseLeadSelection } from './crmLead'
import { CourseSection } from './components/CourseSection'
import { EnrollmentPopup } from './components/EnrollmentPopup'
import { FaqCtaSection } from './components/FaqCtaSection'
import { FaqSection } from './components/FaqSection'
import { FooterBottomSection } from './components/FooterBottomSection'
import { FooterSection } from './components/FooterSection'
import { GradeSection } from './components/GradeSection'
import { Header } from './components/Header'
import { HealthCoursesSection } from './components/HealthCoursesSection'
import { HeroSection } from './components/HeroSection'
import { MarketSection } from './components/MarketSection'
import { ProfileBannerSection } from './components/ProfileBannerSection'

const HERO_COURSE_SELECTION: CourseLeadSelection = {
  courseType: 'graduacao',
  courseValue: 'graduacao-psicologia',
  courseLabel: 'Graduação em Psicologia Presencial',
}

export function LandingPage() {
  const [popupSelection, setPopupSelection] = useState<CourseLeadSelection | null>(null)

  const openHeroPopup = useCallback(() => {
    setPopupSelection(HERO_COURSE_SELECTION)
  }, [])

  const openCoursePopup = useCallback((selection: CourseLeadSelection) => {
    setPopupSelection(selection)
  }, [])

  const closePopup = useCallback(() => {
    setPopupSelection(null)
  }, [])

  return (
    <main className="lp-page">
      <Header onOpenPopup={openHeroPopup} />
      <HeroSection onOpenPopup={openHeroPopup} />
      <CourseSection />
      <ProfileBannerSection />
      <FaqSection onOpenPopup={openHeroPopup} />
      <FooterSection />
      <MarketSection />
      <GradeSection />
      <HealthCoursesSection onOpenCoursePopup={openCoursePopup} />
      <FaqCtaSection />
      <FooterBottomSection />
      <EnrollmentPopup
        key={popupSelection ? `${popupSelection.courseValue}-${popupSelection.courseId ?? 0}` : 'closed'}
        isOpen={popupSelection !== null}
        selection={popupSelection}
        onClose={closePopup}
      />
    </main>
  )
}
