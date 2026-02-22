import { ReactNode } from 'react'

interface MetricCardProps {
    title: string
    value: string | number
    icon?: ReactNode
    trend?: string
    colorClass: string
}

export function MetricCard({ title, value, icon, trend, colorClass }: MetricCardProps) {
    return (
        <div className={`relative flex flex-col justify-between p-5 rounded-sm border-2 ${colorClass} bg-[#0a0a0a] overflow-hidden`}>
            {/* Subtle glow background */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.03] blur-2xl bg-current ${colorClass}`} />

            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                        {title}
                    </h4>
                    <div className={`font-display text-4xl font-bold ${colorClass.replace('border-', 'text-')}`}>
                        {value}
                    </div>
                </div>
                {icon && (
                    <div className={`p-2 rounded bg-white/5 ${colorClass.replace('border-', 'text-')}`}>
                        {icon}
                    </div>
                )}
            </div>

            {trend && (
                <div className="mt-4 font-mono text-[0.65rem] text-secondary tracking-wide">
                    {trend}
                </div>
            )}

            {/* Corner accent */}
            <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${colorClass}`} />
        </div>
    )
}
