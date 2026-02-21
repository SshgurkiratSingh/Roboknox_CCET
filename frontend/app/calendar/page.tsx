import { Badge } from '@/components/ui/Badge'
import { Calendar as CalendarIcon, Filter, Search } from 'lucide-react'

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
        <div className="group grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] items-center gap-6 px-6 py-5 border-b border-[#1a1a1a] border-l-[3px] border-l-transparent hover:border-l-neon hover:bg-[#111111] transition-all cursor-pointer">
            {/* Date Column */}
            <div className="text-center md:text-left">
                <div className="font-display text-3xl font-bold text-white leading-none">{date}</div>
                <div className="font-mono text-xs uppercase tracking-widest text-[#555] mt-1 font-bold group-hover:text-neon transition-colors">{month}</div>
            </div>

            {/* Content Column */}
            <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge variant={badgeVariant || "outline"}>{badgeText}</Badge>
                    <span className="font-mono text-[10px] uppercase text-secondary tracking-widest bg-black px-2 py-0.5 rounded border border-[#1a1a1a]">
                        {time}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-secondary tracking-widest bg-black px-2 py-0.5 rounded border border-[#1a1a1a]">
                        {location}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{title}</h3>
            </div>
        </div>
    )
}

export default function AcademicCalendar() {
    return (
        <div className="p-8 w-full max-w-[1400px] mx-auto min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1a1a1a] pb-6 mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-widest text-white mb-2 flex items-center gap-3">
                        <CalendarIcon className="text-neon" />
                        {"// ACADEMIC_CALENDAR"}
                    </h1>
                    <p className="font-mono text-sm text-secondary uppercase tracking-widest">
                        Semester Schedule & Deadlines
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="SEARCH EVENTS..."
                            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded text-xs px-9 py-2 font-mono text-white focus:outline-none focus:border-neon w-64"
                        />
                    </div>
                    <button className="bg-[#0a0a0a] border border-[#1a1a1a] hover:bg-[#111111] hover:border-neon px-3 py-2 rounded text-secondary hover:text-white transition-colors">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {/* Calendar List */}
            <div className="flex flex-col border border-[#1a1a1a] bg-[#050505] rounded-sm relative overflow-hidden">
                {/* Month Group */}
                <div className="bg-[#111] border-b border-[#1a1a1a] px-6 py-2 font-mono text-xs text-neon font-bold tracking-[0.2em] relative">
                    <div className="absolute left-0 top-0 h-full w-[2px] bg-neon" />
                    MARCH 2026
                </div>

                <CalendarRow
                    date="10" month="MAR"
                    badgeText="HOLIDAY" badgeVariant="error"
                    title="Mid-Semester Break begins"
                    time="00:00 - 23:59" location="CAMPUS WIDE"
                />
                <CalendarRow
                    date="14" month="MAR"
                    badgeText="ACADEMIC" badgeVariant="warn"
                    title="Last day to drop courses without W grade"
                    time="17:00 DEADLINE" location="REGISTRAR PORTAL"
                />
                <CalendarRow
                    date="22" month="MAR"
                    badgeText="ASSESSMENT" badgeVariant="outline"
                    title="Midterm Exams Week"
                    time="09:00 - 18:00" location="MULTIPLE VENUES"
                />

                {/* Month Group */}
                <div className="bg-[#111] border-b border-[#1a1a1a] border-t px-6 py-2 font-mono text-xs text-[#3A8BFF] font-bold tracking-[0.2em] relative mt-4">
                    <div className="absolute left-0 top-0 h-full w-[2px] bg-[#3A8BFF]" />
                    APRIL 2026
                </div>

                <CalendarRow
                    date="05" month="APR"
                    badgeText="EVENT" badgeVariant="filled"
                    title="Annual Tech Symposium (RoboKnox)"
                    time="10:00 - 20:00" location="MAIN AUDITORIUM"
                />
                <CalendarRow
                    date="18" month="APR"
                    badgeText="ACADEMIC" badgeVariant="warn"
                    title="Registration for Summer Semester opens"
                    time="08:00 START" location="STUDENT PORTAL"
                />
            </div>
        </div>
    )
}
