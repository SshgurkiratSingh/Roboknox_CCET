'use client'

import { Badge } from '@/components/ui/Badge'
import { Calendar as CalendarIcon, Filter, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

function CalendarRow({ date, month, badgeText, badgeVariant, title, time, location }: {
    date: string,
    month: string,
    badgeText: string,
    badgeVariant?: "outline" | "filled" | "warn" | "error",
    title: string,
    time: string,
    location: string
}) {
    return (
        <div className="group grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-6 py-5 border-b border-[#1a1a1a] border-l-[3px] border-l-transparent hover:border-l-neon hover:bg-[#111111] transition-all cursor-pointer">
            {/* Date Column */}
            <div className="text-left sm:text-center md:text-left mt-1 sm:mt-0">
                <div className="font-display text-2xl sm:text-3xl font-bold text-white leading-none">{date}</div>
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#555] mt-1 font-bold group-hover:text-neon transition-colors">{month}</div>
            </div>

            {/* Content Column */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge variant={badgeVariant || "outline"}>{badgeText}</Badge>
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase text-secondary tracking-widest bg-black px-2 py-0.5 rounded border border-[#1a1a1a]">
                        {time}
                    </span>
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase text-secondary tracking-widest bg-black px-2 py-0.5 rounded border border-[#1a1a1a] truncate max-w-[120px] sm:max-w-none">
                        {location}
                    </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{title}</h3>
            </div>
        </div>
    )
}

interface Event {
    date: string
    badgeText: string
    badgeVariant: "outline" | "filled" | "warn" | "error"
    title: string
    time: string
    location: string
}

interface MonthGroup {
    month: string
    year: string
    short: string
    color: string
    bgLine: string
    events: Event[]
}

export default function AcademicCalendar() {
    const [months, setMonths] = useState<MonthGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetch('/api/calendar')
            .then(res => res.json())
            .then(data => {
                setMonths(data.months)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    return (
        <div className="p-4 sm:p-8 w-full max-w-[1400px] mx-auto min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1a1a1a] pb-6 mb-8 gap-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-white mb-2 flex items-center gap-2 sm:gap-3">
                        <CalendarIcon className="text-neon" size={24} />
                        {"// ACADEMIC_CALENDAR"}
                    </h1>
                    <p className="font-mono text-xs sm:text-sm text-secondary uppercase tracking-widest">
                        Semester Schedule & Deadlines
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="SEARCH EVENTS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-[#0a0a0a] border border-[#1a1a1a] rounded text-xs px-9 py-2.5 sm:py-2 font-mono text-white focus:outline-none focus:border-neon"
                        />
                    </div>
                    <button className="bg-[#0a0a0a] border border-[#1a1a1a] hover:bg-[#111111] hover:border-neon px-3 py-2.5 sm:py-2 rounded text-secondary hover:text-white transition-colors shrink-0">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-neon font-mono animate-pulse">LOADING CALENDAR DATA...</div>
            ) : (
                <div className="flex flex-col border border-[#1a1a1a] bg-[#050505] rounded-sm relative overflow-hidden">
                    {months.map((monthGroup, idx) => {
                        // Very simple local search filtering just for demonstration
                        const filteredEvents = monthGroup.events.filter((e: Event) =>
                            e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.location.toLowerCase().includes(searchTerm.toLowerCase())
                        )

                        if (filteredEvents.length === 0 && searchTerm !== '') return null

                        return (
                            <div key={idx}>
                                {/* Month Group Header */}
                                <div className={`bg-[#111] border-b border-[#1a1a1a] ${idx > 0 ? 'border-t mt-4' : ''} px-4 sm:px-6 py-2 font-mono text-[10px] sm:text-xs ${monthGroup.color} font-bold tracking-[0.2em] relative`}>
                                    <div className={`absolute left-0 top-0 h-full w-[2px] ${monthGroup.bgLine}`} />
                                    {monthGroup.month} {monthGroup.year}
                                </div>

                                {/* Events */}
                                {filteredEvents.map((event: Event, i: number) => (
                                    <CalendarRow
                                        key={i}
                                        date={event.date}
                                        month={monthGroup.short}
                                        badgeText={event.badgeText}
                                        badgeVariant={event.badgeVariant}
                                        title={event.title}
                                        time={event.time}
                                        location={event.location}
                                    />
                                ))}
                            </div>
                        )
                    })}
                    {months.every(m => m.events.filter((e: Event) => e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase())).length === 0) && searchTerm !== '' && (
                        <div className="p-8 text-center text-secondary font-mono text-sm">NO EVENTS FOUND</div>
                    )}
                </div>
            )}
        </div>
    )
}
