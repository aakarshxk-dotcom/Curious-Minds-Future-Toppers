"use client"

import Link from "next/link"
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react"

const quickLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/live", label: "Live Classes" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/certificates", label: "Certificates" },
  { href: "/contact", label: "Contact Us" },
]

const boardLinks = [
  { href: "/courses?board=cbse", label: "CBSE" },
  { href: "/courses?board=icse", label: "ICSE" },
  { href: "/courses?board=bihar-board", label: "Bihar Board" },
  { href: "/courses?board=jee", label: "JEE" },
  { href: "/courses?board=neet", label: "NEET" },
  { href: "/courses?board=coding", label: "Coding" },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold">
              Curious Minds{" "}
              <span className="text-emerald-600">Future Toppers</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Empowering students from CBSE, ICSE, Bihar Board, JEE, NEET and
            Coding with expert coaching, live classes and smart learning tools.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Links
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Boards & Exams
          </h3>
          <ul className="space-y-2.5">
            {boardLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Contact
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              +91 90000 00000
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              hello@curiousminds.co.in
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Bihar, India
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-muted-foreground sm:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} Curious Minds Future Toppers. All
            rights reserved.
          </p>
          <p>Learning today, leading tomorrow.</p>
        </div>
      </div>
    </footer>
  )
}
