"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { GraduationCap, Menu, Moon, Sun, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/live", label: "Live Classes" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/certificates", label: "Certificates" },
  { href: "/contact", label: "Contact" },
]

function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [token, setToken] = React.useState<string | null>(null)
  const [user, setUser] = React.useState<{
    name: string | null
    role: string
  } | null>(null)

  React.useEffect(() => {
    const stored = localStorage.getItem("token")
    if (!stored) return
    setToken(stored)
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user)
        else {
          localStorage.removeItem("token")
          setToken(null)
        }
      })
      .catch(() => setToken(null))
  }, [])

  const dashboardHref =
    user?.role === "admin" ? "/admin/dashboard" : "/dashboard"

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:block">
            Curious Minds
            <span className="text-emerald-600"> Future Toppers</span>
          </span>
          <span className="text-lg font-bold tracking-tight sm:hidden">
            CMFT
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {token ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:inline-flex"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="hidden bg-emerald-600 hover:bg-emerald-700 sm:inline-flex">
                  Register
                </Button>
              </Link>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                      pathname === link.href && "bg-muted text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />
                {token ? (
                  <>
                    <Link href={dashboardHref}>
                      <Button className="w-full">Dashboard</Button>
                    </Link>
                    <Button variant="ghost" className="w-full" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
