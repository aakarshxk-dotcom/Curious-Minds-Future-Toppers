"use client"

import Link from "next/link"
import { ArrowRight, Quote, Star } from "lucide-react"

const testimonials = [
  {
    name: "Ananya Singh",
    detail: "NEET Aspirant",
    quote:
      "The test series and doubt-clearing sessions changed everything for me. My mock scores improved from 480 to 620 in four months!",
  },
  {
    name: "Rohit Kumar",
    detail: "Bihar Board, Class 12",
    quote:
      "Recorded lectures let me revise at my own pace, and the live classes feel just like school — but better. Scored 91% in boards.",
  },
  {
    name: "Priya Sharma",
    detail: "CBSE, Class 10",
    quote:
      "I joined for Maths and stayed for everything. Teachers actually care, and the leaderboard made learning fun for me.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          Student Stories
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Trusted by Students &amp; Parents
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="premium-feature-card flex flex-col rounded-2xl border bg-card p-6">
            <Quote className="h-8 w-8 text-emerald-600/40" />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              "{t.quote}"
            </p>
            <div className="mt-5 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                {t.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="container mx-auto px-4 pb-20 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 py-16 text-center text-white sm:px-12">
        <div className="tech-grid-bg absolute inset-0 opacity-20" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to Become a Future Topper?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-emerald-50">
            Join our live classes today. Book a free demo class and get a
            personalised study plan from our expert mentors.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/auth/register">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition-transform hover:scale-[1.03]">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/contact">
              <span className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10">
                Book Free Demo Class
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
