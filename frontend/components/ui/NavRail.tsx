'use client'

import { Home, BookOpen, MessageSquare, Settings, LogOut, Radio, Calendar } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/useSettingsStore'

const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Radio, label: 'IoT Studio', href: '/iot-dashboard' },
    { icon: BookOpen, label: 'Workshops', href: '/workshops' },
    { icon: MessageSquare, label: 'Forum', href: '/forum' },
]

export function NavRail() {
    const pathname = usePathname()
    const { navRailAppearance, navRailFixed } = useSettingsStore()

    // Base width configurations
    const isIconOnly = navRailAppearance === 'icon-only'
    const isExpanded = navRailAppearance === 'icons-text'
    const isFloating = isIconOnly

    return (
        <nav
            className={cn(
                "shrink-0 flex flex-col relative z-50 transition-all duration-300 group/nav",
                isFloating
                    ? "absolute left-4 top-1/2 -translate-y-1/2 h-auto py-4 bg-[#0a0a0a]/80 backdrop-blur-md border border-[#1a1a1a] rounded-[2rem] items-center shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                    : "bg-void border-r border-[#1a1a1a] py-6 h-full",
                isExpanded && !isFloating ? "w-48 items-start px-3" : (!isFloating ? "w-14 items-center" : "w-[3.25rem]"),
                !navRailFixed && !isExpanded && !isIconOnly && "hover:w-48 hover:items-start hover:px-3 bg-void"
            )}
        >
            <div className={cn(
                "flex flex-col gap-3 flex-1 w-full",
                isFloating && "items-center"
            )}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-fast",
                                isActive ? "bg-neon/10 text-neon shadow-[0_0_10px_rgba(52,211,153,0.1)]" : "text-secondary hover:text-white hover:bg-[#1a1a1a]",
                                isFloating && isActive && "bg-neon/20 shadow-[0_0_15px_rgba(52,211,153,0.2)] text-neon",
                                isFloating && "p-2.5 rounded-full"
                            )}
                            title={(!isExpanded && navRailFixed) || isFloating ? item.label : undefined}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 shrink-0 transition-transform duration-fast scale-100 group-hover:scale-110",
                                isActive && "drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                            )} />

                            <span className={cn(
                                "font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                                isExpanded ? "w-24 opacity-100 ml-1" : "w-0 opacity-0",
                                !navRailFixed && !isExpanded && !isIconOnly && "group-hover/nav:w-24 group-hover/nav:opacity-100 group-hover/nav:ml-1"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>

            <div className={cn(
                "flex flex-col gap-3 w-full mt-auto",
                (!isExpanded && navRailFixed) || isIconOnly ? "items-center" : "items-start group-hover/nav:items-start group-hover/nav:px-4"
            )}>
                <Link
                    href="/settings"
                    className={cn(
                        "group relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-fast w-full focus:outline-none",
                        pathname === '/settings' ? "bg-neon/10 text-neon shadow-[0_0_10px_rgba(52,211,153,0.1)]" : "text-secondary hover:text-white hover:bg-[#1a1a1a]",
                        isFloating && "p-2.5 rounded-full",
                        isFloating && pathname === '/settings' && "bg-neon/20 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                    )}
                    title={(!isExpanded && navRailFixed) || isFloating ? "Settings" : undefined}
                >
                    <Settings className={cn(
                        "w-5 h-5 shrink-0 transition-transform duration-500 hover:rotate-90",
                        pathname === '/settings' && "drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    )} />
                    <span className={cn(
                        "font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                        isExpanded ? "w-24 opacity-100 ml-1" : "w-0 opacity-0",
                        !navRailFixed && !isExpanded && !isIconOnly && "group-hover/nav:w-24 group-hover/nav:opacity-100 group-hover/nav:ml-1"
                    )}>
                        Settings
                    </span>
                </Link>

                <div className={cn(
                    "h-[1px] bg-[#1a1a1a] transition-all duration-300",
                    isExpanded ? "w-full my-1" : "w-6 my-1",
                    !navRailFixed && !isExpanded && !isIconOnly && "group-hover/nav:w-full",
                    isFloating && "w-6"
                )} />

                <button
                    className={cn(
                        "group relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-fast w-full text-left focus:outline-none text-secondary hover:text-[#FF3B3B] hover:bg-red-500/10",
                        isFloating && "p-2.5 rounded-full"
                    )}
                    title={(!isExpanded && navRailFixed) || isFloating ? "Log Out" : undefined}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className={cn(
                        "font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                        isExpanded ? "w-24 opacity-100 ml-1" : "w-0 opacity-0",
                        !navRailFixed && !isExpanded && !isIconOnly && "group-hover/nav:w-24 group-hover/nav:opacity-100 group-hover/nav:ml-1"
                    )}>
                        Log Out
                    </span>
                </button>
            </div>
        </nav>
    )
}
