"use client"

import * as React from "react"
import Link from "next/link"
import { Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Certificate {
  id: string
  courseId: string
  certificateNo: string
  issuedAt: string
  course?: { title: string } | null
}

export default function CertificatesPage() {
  const [certs, setCerts] = React.useState<Certificate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Please login to view your certificates.")
      setLoading(false)
      return
    }
    setLoading(true)
    fetch("/api/certificates", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load")
        setCerts(Array.isArray(data.data) ? data.data : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const handleClaim = async (courseId: string) => {
    const token = localStorage.getItem("token")
    if (!token) return
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courseId }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Certificate generation failed")
      return
    }
    toast.success("Certificate earned! 🎓")
    load()
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Achievements</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">My Certificates</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Complete all lessons in a course to earn your certificate of completion.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-14 text-center">
          <Award className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">{error}</p>
          <Link href="/auth/login">
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">Login</Button>
          </Link>
        </div>
      ) : certs.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-14 text-center">
          <Award className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">
            You haven&apos;t earned any certificates yet. Complete a course to get one!
          </p>
          <Link href="/courses">
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <Card key={cert.id} className="premium-feature-card overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-center text-white">
                <Award className="mx-auto h-12 w-12" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-emerald-100">
                  Certificate of Completion
                </p>
              </div>
              <CardContent className="space-y-3 p-6 text-center">
                <p className="font-bold">{cert.course?.title ?? "Course"}</p>
                <p className="text-xs text-muted-foreground">Certificate No: {cert.certificateNo}</p>
                <p className="text-xs text-muted-foreground">
                  Issued {new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
