"use client"

import * as React from "react"
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", subject: "", message: "" })
  const [loading, setLoading] = React.useState(false)

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to send message")
        return
      }
      toast.success("Message sent! We'll get back to you soon.")
      setForm({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[1fr_380px] lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Contact Us</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Get in Touch</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Have a question about courses, batches or admissions? Send us a message and our team will
          reach out within 24 hours.
        </p>

        <Card className="mt-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" value={form.name} onChange={setField("name")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={setField("phone")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={setField("email")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g. NEET batch admission" value={form.subject} onChange={setField("subject")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} placeholder="Tell us how we can help..." value={form.message} onChange={setField("message")} required />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Call Us</p>
                <p className="text-sm text-muted-foreground">+91 90000 00000</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Email Us</p>
                <p className="text-sm text-muted-foreground">hello@futuretoppers.co.in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Visit Us</p>
                <p className="text-sm text-muted-foreground">
                  Bihar, India
                  <br />
                  Mon–Sat: 8 AM – 8 PM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
