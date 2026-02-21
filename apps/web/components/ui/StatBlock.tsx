interface StatBlockProps {
    value: string | number
    label: string
    unit?: string
}

export function StatBlock({ value, label, unit = '' }: StatBlockProps) {
    return (
        <div className="flex flex-col gap-1">
            <span className="font-display text-[2.25rem] text-neon" style={{ textShadow: 'var(--neon-text-glow)' }}>
                {value}<span className="text-lg text-secondary ml-1">{unit}</span>
            </span>
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-secondary">
                {label}
            </span>
        </div>
    )
}
