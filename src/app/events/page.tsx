"use client"

import { useAuth } from "@/lib/auth-context"
import { useEvents } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { motion } from "framer-motion"
import { pageItem } from "@/components/animation/PageTransition"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Search, Lock, Users, TrendingUp, Trophy, SlidersHorizontal, ArrowUpDown, Calendar } from "lucide-react"
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils"

type SortOption = "date" | "popularity" | "price-low" | "price-high"
type PriceFilter = "all" | "free" | "paid"
type TypeFilter = "all" | "inter" | "intra"

export default function EventsFeed() {
  const { user } = useAuth()
  const { events } = useEvents()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [showFilters, setShowFilters] = useState(false)

  const categories = ["All", "Technical", "Cultural", "Sports", "Workshop"]

  const filtered = useMemo(() => {
    let result = events.filter(evt => {
      // Hide pending-review events from the public feed.
      // Legacy events (no status field) are treated as published.
      // The organizer can still see their own pending event.
      const isPending = evt.status === "pending_review"
      if (isPending && evt.organizerEmail !== user?.email) return false

      // Hide expired events from Browse Events — hosts view past events via Dashboard → Hosted
      const eventDate = new Date(evt.date)
      const expired = eventDate.getTime() + 86400000 < Date.now()
      if (expired) return false

      const q = search.toLowerCase()
      const matchesSearch = !search || evt.title.toLowerCase().includes(q) ||
        evt.organizer.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.subEvents.some(se => se.name.toLowerCase().includes(q))
      const matchesCategory = categoryFilter === "All" || evt.category === categoryFilter
      const matchesPrice = priceFilter === "all" || (priceFilter === "free" ? evt.price === 0 : evt.price > 0)
      const matchesType = typeFilter === "all" || (typeFilter === "inter" ? evt.isInter : !evt.isInter)
      return matchesSearch && matchesCategory && matchesPrice && matchesType
    })

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date": return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "popularity": return b.registeredCount - a.registeredCount
        case "price-low": return a.price - b.price
        case "price-high": return b.price - a.price
        default: return 0
      }
    })
    return result
  }, [events, search, categoryFilter, priceFilter, typeFilter, sortBy])


  return (
    <>
      <motion.div variants={pageItem} className="mb-8">
        <MicroLabel>Event Discovery</MicroLabel>
        <h1 className="text-3xl font-light tracking-tight">Browse events.</h1>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={pageItem} className="pt-2 pb-4 mb-6 border-b dark:border-white/[0.08] border-[rgba(179,136,255,0.15)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3" suppressHydrationWarning>
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, venues, sub-events..."
              className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-10 rounded-full" />
          </div>
          {/* Sort — moved left of the Filters button */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-white/30" aria-hidden="true" />
            <label htmlFor="sort-select" className="sr-only">Sort events by</label>
            <select id="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
              aria-label="Sort events by"
              className="bg-black border border-white/10 text-white/50 text-xs rounded-full px-3 py-1.5 cursor-pointer">
              <option value="date">Date ↑</option>
              <option value="popularity">Most Popular</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border transition-colors ${
              showFilters
                ? 'border-[#B388FF] text-[#B388FF] bg-[rgba(179,136,255,0.10)]'
                : 'border-white/10 text-white/40 hover:border-[#B388FF] hover:text-[#B388FF]'
            }`}>
            <SlidersHorizontal className="w-3 h-3" /> Filters
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 border ${
                categoryFilter === cat
                  ? "border-[#B388FF] text-[#B388FF] bg-[rgba(179,136,255,0.12)] font-medium"
                  : "border-white/10 text-white/40 hover:border-[#B388FF] hover:text-[#B388FF]"
              }`}>{cat}</button>
          ))}
        </div>

        {/* Extra Filters */}
        {showFilters && (
          <div className="flex gap-3 mt-3 pt-3 border-t border-white/[0.06]">
            <div>
              <span className="text-[9px] font-mono text-white/30 mb-1 block tracking-widest">PRICE</span>
              <div className="flex gap-1">
                {([["all", "All"], ["free", "Free"], ["paid", "Paid"]] as [PriceFilter, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setPriceFilter(val)}
                    className={`px-3 py-1 rounded text-[10px] border transition-colors ${
                      priceFilter === val
                        ? 'border-[#B388FF] text-[#B388FF] bg-[rgba(179,136,255,0.12)]'
                        : 'border-white/10 text-white/40'
                    }`}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[9px] font-mono text-white/30 mb-1 block tracking-widest">TYPE</span>
              <div className="flex gap-1">
                {([["all", "All"], ["inter", "Inter-College"], ["intra", "Intra-College"]] as [TypeFilter, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setTypeFilter(val)}
                    className={`px-3 py-1 rounded text-[10px] border transition-colors ${
                      typeFilter === val
                        ? 'border-[#B388FF] text-[#B388FF] bg-[rgba(179,136,255,0.12)]'
                        : 'border-white/10 text-white/40'
                    }`}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Results count */}
      <motion.div variants={pageItem} className="mb-4 flex items-center justify-between">
        <p className="text-xs font-mono text-white/50">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
        {(search || categoryFilter !== "All" || priceFilter !== "all" || typeFilter !== "all") && (
          <button onClick={() => { setSearch(""); setCategoryFilter("All"); setPriceFilter("all"); setTypeFilter("all"); setSortBy("date") }}
            className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Clear all filters</button>
        )}
      </motion.div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center gap-4">
            <span className="font-mono tracking-widest text-white/20 text-xl">— NO EVENTS FOUND —</span>
            <p className="text-sm text-white/30">Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map(evt => (
            <motion.div key={evt.id} variants={pageItem}>
              <Link href={`/events/${evt.id}`}>
                <GlassCard className={`p-0 hover:scale-[1.01] transition-transform duration-150 ease-out cursor-pointer relative overflow-hidden group h-full flex flex-col ${evt.isInter ? '' : 'border-l-yellow-500/50 border-l-[3px]'}`}>
                  
                  {/* Poster section - 16:9 compact aspect ratio */}
                  <div className="w-full aspect-[16/9] overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center relative">
                    {evt.poster_base64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={evt.poster_base64} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-white/30 text-lg bg-[rgba(179,136,255,0.08)]">🎉</div>
                        <span className="text-[10px] text-white/20">No poster</span>
                      </div>
                    )}
                    {/* Pending review overlay — visible only to organizer */}
                    {evt.status === "pending_review" && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                        <div className="w-8 h-8 rounded-full border border-yellow-500/40 bg-yellow-500/10 flex items-center justify-center">
                          <span className="text-yellow-400 text-base">⏳</span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-yellow-400 uppercase">Pending Review</span>
                        <span className="text-[9px] text-white/30 px-4 text-center">Awaiting admin approval — not visible to others</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="border-white/20 text-white/50 font-normal uppercase tracking-widest text-[10px]">
                        {evt.category}
                      </Badge>
                      <div className="flex gap-2">
                        {evt.collegeDomain && (
                          <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 border border-yellow-500/30 text-yellow-400/80">
                            <Lock className="w-3 h-3" />@{evt.collegeDomain}
                          </span>
                        )}
                        {evt.isInter && (
                          <span className="font-mono text-[10px] px-2 py-0.5 border border-white text-white">INTER</span>
                        )}
                      </div>
                    </div>

                  <h3 className="font-semibold text-xl mb-1 flex-1 group-hover:text-white/90">{evt.title}</h3>
                  <p className="font-light text-white/60 text-sm mb-2">{evt.organizer}</p>
                  <p className="text-xs text-white/50 mb-4 line-clamp-2">{evt.description}</p>

                  {/* Prize pool highlight */}
                  {evt.prizePool && (
                    <div className="flex items-center gap-1.5 mb-3 text-yellow-400/70">
                      <Trophy className="w-3 h-3" />
                      <span className="text-[10px] font-mono">{evt.prizePool}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono text-[11px] text-white/70">
                       <span className="flex items-center gap-1">
                         <Calendar className="w-3 h-3" />
                         {formatDateDisplay(evt.date)}
                         {evt.hasTime && evt.time && <span className="text-white/40 ml-1">at {formatTimeDisplay(evt.time)}</span>}
                       </span>
                       <span className="flex items-center gap-1 text-[#B388FF]/80"><Users className="w-3 h-3" />{evt.registeredCount} registered</span>
                     </div>
                    <span className={`font-mono text-[11px] font-medium ${ evt.price > 0 ? 'text-[#B388FF]' : 'text-green-400'}`}>
                      {evt.price > 0 ? `₹${evt.price}` : "FREE"}
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${evt.registeredCount > evt.seats * 0.8 ? 'bg-red-500/60' : evt.registeredCount > evt.seats * 0.5 ? 'bg-yellow-500/40' : 'bg-white/20'}`}
                      style={{ width: `${Math.min(100, (evt.registeredCount / evt.seats) * 100)}%` }} />
                  </div>

                  {evt.subEvents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex gap-2 flex-wrap">
                      {evt.subEvents.map(se => (
                        <span key={se.id} className="text-[10px] bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded text-white/60">{se.name}</span>
                      ))}
                    </div>
                  )}
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </>
  )
}
