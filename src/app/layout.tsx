import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: "Future Toppers | Online Coaching & Courses",
    template: "%s | Future Toppers",
  },
  description:
    "Future Toppers — CBSE, ICSE, Bihar Board, JEE, NEET and Coding coaching with live classes, recorded courses, quizzes and certificates.",
  keywords: [
    "coaching",
    "cbse",
    "icse",
    "bihar board",
    "jee",
    "neet",
    "coding",
    "live classes",
    "online courses",
  ],
  openGraph: {
    title: "Future Toppers",
    description:
      "CBSE, ICSE, Bihar Board, JEE, NEET & Coding coaching with live classes and recorded courses.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
