import { cn } from "@/lib/utils"
import React from "react"

export type BadgeVariant = 'outline' | 'filled' | 'warn' | 'error'

interface BadgeProps {
    children: React.ReactNode
    variant?: BadgeVariant
    className?: string
}

export function Badge({ children, variant = 'outline', className }: BadgeProps) {
    return (
        <span className={cn(
            'inline-block font-mono text-[0.625rem] uppercase tracking-[0.12em] px-2 py-[2px]',
            variant === 'outline' && 'border border-neon text-neon bg-neon-08',
            variant === 'filled' && 'bg-neon text-black font-medium',
            variant === 'warn' && 'border border-[#FFB800] text-[#FFB800]',
            variant === 'error' && 'border border-[#FF3B3B] text-[#FF3B3B]',
            className
        )}>
            {children}
        </span>
    )
}
