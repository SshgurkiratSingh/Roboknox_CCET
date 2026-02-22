'use client'

import { ContentRow } from '@/components/ui/ContentRow'
import { useEffect, useState } from 'react'

interface Workshop {
    date: string
    dateUnit: string
    title: string
    tags: string[]
}

export default function Workshops() {
    const [workshops, setWorkshops] = useState<Workshop[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/workshops')
            .then(res => res.json())
            .then(data => {
                setWorkshops(data.workshops)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    return (
        <div className="p-4 sm:p-8 pb-12 w-full max-w-5xl mx-auto min-h-[calc(100vh-100px)]">
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-widest text-white mb-6 sm:mb-8 mt-2 sm:mt-4">{"// WORKSHOPS"}</h1>

            {loading ? (
                <div className="text-center py-20 text-neon font-mono animate-pulse border border-[#1a1a1a] bg-[#050505] rounded-sm">LOADING WORKSHOP DATA...</div>
            ) : (
                <div className="flex flex-col border border-[#1a1a1a] bg-base rounded-sm mb-12 relative overflow-hidden">
                    {/* Glow accent */}
                    <div className="absolute top-0 left-0 w-[4px] h-full bg-neon z-10" />

                    {workshops.map((workshop, i) => (
                        <ContentRow
                            key={i}
                            date={workshop.date}
                            dateUnit={workshop.dateUnit}
                            title={workshop.title}
                            tags={workshop.tags}
                        />
                    ))}
                    {workshops.length === 0 && (
                        <div className="p-8 text-center text-secondary font-mono text-sm">NO WORKSHOPS FOUND</div>
                    )}
                </div>
            )}
        </div>
    )
}
