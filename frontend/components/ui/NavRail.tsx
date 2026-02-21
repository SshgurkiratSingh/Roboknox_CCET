'use client'

import { Home, BookOpen, MessageSquare, Settings, LogOut, Radio, Activity, Calendar } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
    { icon: Home, href: '/' },
    { icon: Calendar, href: '/calendar' },
    { icon: Radio, href: '/iot-dashboard' },
    { icon: BookOpen, href: '/workshops' },
    { icon: MessageSquare, href: '/forum' },
]

export function NavRail() {
    const pathname = usePathname()

    return (
        <nav className="w-14 shrink-0 border-r border-[#1a1a1a] bg-void flex flex-col items-center py-6 gap-6 relative z-40">
            <div className="flex flex-col gap-6 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative p-2 text-secondary hover:text-neon transition-colors duration-fast group",
                                isActive && "text-neon"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-[-16px] top-0 bottom-0 w-[3px] bg-neon shadow-neon-sm" />
                            )}
                            <item.icon className="w-5 h-5" style={{ filter: isActive ? 'drop-shadow(var(--neon-text-glow))' : 'none' }} />

                            {/* Hover background */}
                            <div className="absolute inset-0 bg-neon-08 opacity-0 group-hover:opacity-100 rounded-sm pointer-events-none transition-opacity duration-fast" />
                        </Link>
                    )
                })}
            </div>

            <div className="flex flex-col gap-6 items-center">
                <button className="p-2 text-secondary hover:text-neon transition-colors duration-fast group relative">
                    <Settings className="w-5 h-5" />
                    <div className="absolute inset-0 bg-neon-08 opacity-0 group-hover:opacity-100 rounded-sm pointer-events-none transition-opacity duration-fast" />
                </button>
                <div className="w-6 h-[1px] bg-[#1a1a1a]" />
                <button className="p-2 text-secondary hover:text-[#FF3B3B] transition-colors duration-fast">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </nav>
    )
}
