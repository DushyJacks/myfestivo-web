import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In to MyFestivo — Access Your College Event Dashboard",
  description:
    "Sign in to your MyFestivo account to manage your college event registrations, hosted events, QR passes, and team details. New to MyFestivo? Sign up for free.",
  alternates: {
    canonical: "https://myfestivo.live/login",
  },
  openGraph: {
    title: "Sign In — MyFestivo",
    description:
      "Sign in to your MyFestivo account to manage your college event registrations, hosted events, QR passes, and team details.",
    url: "https://myfestivo.live/login",
    type: "website",
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
