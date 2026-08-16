"use client"

import Link from "next/link"
import { Atom, Code2, FlaskConical, Laptop, School, Stethoscope } from "lucide-react"

const boards = [
  {
    name: "CBSE",
    desc: "Classes 6–12, NCERT-based, board exam ready",
    icon: School,
    href: "/courses?board=cbse",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "ICSE",
    desc: "Complete ICSE syllabus with focused preparation",
    icon: School,
    href: "/courses?board=icse",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "Bihar Board",
    desc: "BSEB pattern, chapter-wise notes & test series",
    icon: School,
    href: "/courses?board=bihar-board",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    name: "JEE",
    desc: "Main & Advanced — IIT level problem solving",
    icon: Atom,
    href: "/courses?board=jee",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    name: "NEET",
    desc: "Medical entrance with NCERT + mock tests",
    icon: Stethoscope,
    href: "/courses?board=neet",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    name: "Coding",
    desc: "Python, Web, App & Competitive programming",
    icon: Code2,
    href: "/courses?board=coding",
    gradient: "from-rose-500 to-orange-600",
  },
]

export function BoardsSection() {
  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            One Platform, Every Goal
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Batches for Every Board &amp; Exam
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.name} href={board.href}>
              <div className="premium-feature-card flex items-start gap-4 rounded-2xl border bg-card p-6">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${board.gradient}`}
                >
                  <board.icon className="h-6 w-6 text-white" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{board.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{board.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
