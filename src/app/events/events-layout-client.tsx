"use client"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { PageTransition } from "@/components/animation/PageTransition"

export default function EventsLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 md:ml-[72px] lg:ml-[260px] min-h-full pb-20 md:pb-0">
        <PageTransition className="p-6 lg:p-8">
          {children}
        </PageTransition>
      </main>
    </div>
  )
}
