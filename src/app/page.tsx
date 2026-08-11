import { HeroSlideshow } from "@/components/home/HeroSlideshow"
import { StatsSection } from "@/components/home/StatsSection"
import { BoardsSection } from "@/components/home/BoardsSection"
import { FeaturedCourses } from "@/components/home/FeaturedCourses"
import { LiveClassesPreview } from "@/components/home/LiveClassesPreview"
import { WhyUsSection } from "@/components/home/WhyUsSection"
import { TestimonialsSection, CTASection } from "@/components/home/TestimonialsSection"

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />
      <StatsSection />
      <FeaturedCourses />
      <BoardsSection />
      <LiveClassesPreview />
      <WhyUsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
