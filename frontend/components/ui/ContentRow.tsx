import { cn } from '@/lib/utils'
import { Badge } from './Badge'

interface ContentRowProps {
    date: string | number
    dateUnit: string
    title: string
    tags: string[]
    onClick?: () => void
}

export function ContentRow({ date, dateUnit, title, tags, onClick }: ContentRowProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'group grid items-center gap-6 px-6 py-5 cursor-pointer',
                'border-b border-[#1a1a1a] border-l-[3px] border-l-transparent',
                'transition-all duration-100',
                'hover:border-l-neon hover:bg-neon-08',
            )}
            style={{ gridTemplateColumns: '64px 1fr auto' }}
        >
            <div>
                <div className="font-display text-2xl font-bold text-white leading-none">{date}</div>
                <div className="font-mono text-[0.6rem] uppercase tracking-wider text-secondary mt-1">{dateUnit}</div>
            </div>
            <div>
                <div className="flex gap-2 mb-1">
                    {tags.map(t => <Badge key={t} variant={t === "SOLVED" ? "filled" : "outline"}>{t}</Badge>)}
                </div>
                <div className="font-mono text-sm text-primary group-hover:text-neon transition-colors duration-fast">{title}</div>
            </div>
            <div className="text-secondary opacity-50 font-mono group-hover:opacity-100 group-hover:text-neon transition-colors">
                →
            </div>
        </div>
    )
}
