import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Your MyFestivo Account — Join the College Event Platform",
  description:
    "Sign up for MyFestivo to discover and register for college fests, cultural events, hackathons, and sports competitions. Link your college email to access intra-college events.",
  alternates: {
    canonical: "https://myfestivo.live/signup",
  },
  openGraph: {
    title: "Create Account — MyFestivo",
    description:
      "Join MyFestivo to discover and register for college fests, cultural events, hackathons, and sports competitions across India.",
    url: "https://myfestivo.live/signup",
    type: "website",
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
