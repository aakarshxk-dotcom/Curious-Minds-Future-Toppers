"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  price: number
  discountPrice: number | null
}

export function EnrollButton({ course }: { course: Course }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [state, setState] = React.useState<"idle" | "checking" | "enrolled">("idle")

  const effectivePrice =
    course.discountPrice != null && course.discountPrice < course.price
      ? course.discountPrice
      : course.price

  React.useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    setState("checking")
    fetch("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data?.data) ? data.data : []
        if (list.some((e: { courseId: string }) => e.courseId === course.id)) {
          setState("enrolled")
        }
      })
      .catch(() => {})
      .finally(() => setState("idle"))
  }, [course.id])

  const handleEnroll = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Please login to enroll")
      router.push("/auth/login")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: course.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Enrollment failed")
        return
      }
      toast.success("Enrolled successfully! 🎉")
      setState("enrolled")
      router.push("/dashboard")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (state === "enrolled") {
    return (
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        onClick={() => router.push("/dashboard")}
      >
        Go to My Courses
      </Button>
    )
  }

  if (effectivePrice > 0) {
    return (
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        onClick={() => toast.info("Payment gateway coming soon — contact us to enroll.")}
      >
        Enroll — ₹{effectivePrice}
      </Button>
    )
  }

  return (
    <Button
      className="w-full bg-emerald-600 hover:bg-emerald-700"
      onClick={handleEnroll}
      disabled={loading || state === "checking"}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {state === "checking" ? "Checking..." : "Enroll for Free"}
    </Button>
  )
}
