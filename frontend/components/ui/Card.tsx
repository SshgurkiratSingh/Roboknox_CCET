import { cn } from '@/lib/utils'
import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    glowing?: boolean
}

export function Card({ children, className, glowing = false }: CardProps) {
    return (
        <div
            className={cn(
                'relative rounded-sm border border-neon-25 bg-glass backdrop-blur-md',
                'before:absolute before:top-[-1px] before:left-[-1px]',
                'before:h-2 before:w-2 before:border-l-2 before:border-t-2 before:border-neon',
                'after:absolute before:pointer-events-none after:pointer-events-none',
                'after:bottom-[-1px] after:right-[-1px]',
                'after:h-2 after:w-2 after:border-r-2 after:border-b-2 after:border-neon',
                glowing && 'shadow-neon-sm',
                className
            )}
        >
            {children}
        </div>
    )
}
