"use client"

import { BarChart3, BookOpenCheck, MessagesSquare, MonitorPlay } from "lucide-react"

const features = [
  {
    icon: MonitorPlay,
    title: "Live Interactive Classes",
    desc: "Real-time teaching with chat, polls and instant doubt-solving right inside the live classroom.",
  },
  {
    icon: BookOpenCheck,
    title: "Recorded Lectures & Notes",
    desc: "Revisit every lesson anytime with HD recordings and downloadable PDF study material.",
  },
  {
    icon: BarChart3,
    title: "Tests & Performance Analytics",
    desc: "Weekly quizzes, mock tests and detailed reports that show exactly where to improve.",
  },
  {
    icon: MessagesSquare,
    title: "24/7 Doubt Support",
    desc: "Never stay stuck — get your doubts resolved by expert faculty around the clock.",
  },
]

export function WhyUsSection() {
  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          Why Future Toppers?
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Learning That Actually Works
        </h2>
        <p className="mt-4 text-muted-foreground">
          We combine experienced teachers, structured curriculum and smart
          technology so every student gets personal attention.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="premium-feature-card rounded-2xl border bg-card p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <f.icon className="h-6 w-6 text-white" />
            </span>
            <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
