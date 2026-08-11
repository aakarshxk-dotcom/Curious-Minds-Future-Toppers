"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

interface Slide {
  id: string
  badge: string
  title: string
  highlight: string
  subtitle: string
  features: string[]
  primaryLabel: string
  primaryLink: string
  secondaryLabel: string
  secondaryLink: string
  gradient: string
  accent: string
  cardBg: string
}

const slides: Slide[] = [
  {
    id: "neet",
    badge: "NEET 2027 • Medical Foundation",
    title: "Crack NEET with",
    highlight: "Expert Mentors & Smart Study Plans",
    subtitle:
      "Full NCERT coverage, weekly test series, doubt-clearing sessions and one-on-one mentoring — everything you need to top NEET.",
    features: ["Live classes daily", "Test series + analysis", "Doubt sessions 24/7"],
    primaryLabel: "Explore NEET Courses",
    primaryLink: "/courses?board=neet",
    secondaryLabel: "Book Free Demo",
    secondaryLink: "/contact",
    gradient:
      "from-emerald-600/30 via-teal-700/20 to-slate-950",
    accent: "#00C853",
    cardBg: "rgba(0, 200, 83, 0.12)",
  },
  {
    id: "jee",
    badge: "JEE Main & Advanced • Engineering",
    title: "IIT-JEE Preparation,",
    highlight: "Reimagined for Toppers",
    subtitle:
      "Concept-first teaching, problem-solving marathons and performance analytics that turn hard work into guaranteed results.",
    features: ["Chapter-wise mastery", "PYQ + Mock tests", "Personal mentorship"],
    primaryLabel: "Explore JEE Courses",
    primaryLink: "/courses?board=jee",
    secondaryLabel: "Talk to Mentor",
    secondaryLink: "/contact",
    gradient:
      "from-blue-700/30 via-indigo-800/20 to-slate-950",
    accent: "#1565C0",
    cardBg: "rgba(21, 101, 192, 0.15)",
  },
  {
    id: "excellence",
    badge: "CBSE • ICSE • Bihar Board",
    title: "School Excellence,",
    highlight: "Classes 6–12 & Foundation Years",
    subtitle:
      "Board-aligned live classes, recorded lectures, PDF notes and regular assessments for every board — CBSE, ICSE and Bihar Board.",
    features: ["Board-wise batches", "Recorded + live classes", "Certificate on completion"],
    primaryLabel: "Browse All Courses",
    primaryLink: "/courses",
    secondaryLabel: "View Batches",
    secondaryLink: "/live",
    gradient:
      "from-amber-600/30 via-orange-700/20 to-slate-950",
    accent: "#FFD700",
    cardBg: "rgba(255, 215, 0, 0.12)",
  },
]

const PARTICLES = Array.from({ length: 14 }, (_, i) => i)

export function HeroSlideshow() {
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="tech-grid-bg absolute inset-0 opacity-40" />

      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          } ${s.gradient}`}
        />
      ))}

      {PARTICLES.map((p) => (
        <span
          key={p}
          className="hero-particle absolute h-1.5 w-1.5 rounded-full"
          style={{
            left: `${(p * 7.3 + 4) % 96}%`,
            top: `${(p * 13.7 + 8) % 90}%`,
            background: slide.accent,
            boxShadow: `0 0 12px ${slide.accent}`,
            animation: `hero-particle-float ${6 + (p % 5)}s ease-in-out ${
              p * 0.4
            }s infinite`,
          }}
        />
      ))}

      <div className="container relative z-10 mx-auto grid min-h-[560px] items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <div key={slide.id} className="hero-slide-content">
          <span
            className="animate-hero-badge-glow inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide"
            style={{
              borderColor: `${slide.accent}55`,
              background: `${slide.accent}14`,
              color: slide.accent,
            }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: slide.accent }} />
            {slide.badge}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            {slide.title}
            <span
              className="neon-text-green mt-2 block bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
              style={{ textShadow: `0 0 30px ${slide.accent}66` }}
            >
              {slide.highlight}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {slide.subtitle}
          </p>

          <ul className="mt-6 space-y-2.5">
            {slide.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200 sm:text-base">
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: slide.accent }} />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={slide.primaryLink}>
              <span
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                style={{ background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)` }}
              >
                {slide.primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href={slide.secondaryLink}>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10">
                {slide.secondaryLabel}
              </span>
            </Link>
          </div>
        </div>

        <div key={`card-${slide.id}`} className="relative hidden lg:block">
          <div
            className="relative mx-auto max-w-md rounded-3xl border p-8 backdrop-blur-xl"
            style={{ borderColor: `${slide.accent}33`, background: slide.cardBg }}
          >
            <span className="animate-float-badge absolute -right-4 -top-4 rounded-2xl px-4 py-2 text-xs font-bold text-white shadow-xl" style={{ background: slide.accent }}>
              Top Rated
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: slide.accent }}>
              Why students choose us
            </p>
            <ul className="mt-5 space-y-4">
              {[
                "94% success rate in board exams",
                "Live + recorded classes for every topic",
                "Personal performance analytics",
                "Certificates & leaderboards to stay motivated",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-100">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: slide.accent }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 rounded-2xl bg-black/25 p-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Placement in Top Batches</span>
                <span style={{ color: slide.accent }}>92%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="animate-hero-progress h-full rounded-full" style={{ background: slide.accent }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2.5 pb-8">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 10,
              background: i === current ? slide.accent : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </section>
  )
}
