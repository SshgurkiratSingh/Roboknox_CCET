'use client'

import { ContentRow } from '@/components/ui/ContentRow'
import { useEffect, useState } from 'react'

interface Topic {
    date: string
    dateUnit: string
    title: string
    tags: string[]
}

export default function Forum() {
    const [topics, setTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/forum')
            .then(res => res.json())
            .then(data => {
                setTopics(data.topics)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    return (
        <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto min-h-[calc(100vh-100px)]">
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-widest text-[#FFFFFF] mb-6 sm:mb-8 mt-2 sm:mt-4">{"// COMM_LINK"}</h1>

            {loading ? (
                <div className="text-center py-20 text-neon font-mono animate-pulse border border-[#1a1a1a] bg-[#050505] rounded-sm">LOADING COMM_LINK LOGS...</div>
            ) : (
                <div className="flex flex-col border border-[#1a1a1a] bg-base rounded-sm">
                    {topics.map((topic, i) => (
                        <ContentRow
                            key={i}
                            date={topic.date}
                            dateUnit={topic.dateUnit}
                            title={topic.title}
                            tags={topic.tags}
                        />
                    ))}
                    {topics.length === 0 && (
                        <div className="p-8 text-center text-secondary font-mono text-sm">NO TOPICS FOUND</div>
                    )}
                </div>
            )}
        </div>
    )
}
