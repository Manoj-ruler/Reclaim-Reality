import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientLayout } from "./client-layout"

export const metadata: Metadata = {
  title: "Reclaim Reality - AI Content Detection",
  description: "Detect AI-generated, fake, and manipulated content in real-time while browsing the web.",
  generator: "Reclaim Reality",
  keywords: ["AI detection", "fake news", "content verification", "deepfake detection", "fact checking"],
  authors: [{ name: "Reclaim Reality Team" }],
  creator: "Reclaim Reality",
  publisher: "Reclaim Reality",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Reclaim Reality - AI Content Detection",
    description: "Detect AI-generated, fake, and manipulated content in real-time while browsing the web.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reclaim Reality - AI Content Detection",
    description: "Detect AI-generated, fake, and manipulated content in real-time while browsing the web.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
