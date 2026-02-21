'use client'

import { ContentRow } from '@/components/ui/ContentRow'

export default function Forum() {
    return (
        <div className="p-8 w-full max-w-5xl mx-auto">
            <h1 className="font-display text-4xl font-bold tracking-widest text-[#FFFFFF] mb-8 mt-4">{"// COMM_LINK"}</h1>
            <div className="flex flex-col border border-[#1a1a1a] bg-base rounded-sm">
                <ContentRow date="02" dateUnit="HR" title="Anyone have the footprint for DRV8833?" tags={['QUESTION', 'PCB']} />
                <ContentRow date="14" dateUnit="HR" title="Meeting moved to Room 402" tags={['ANNOUNCEMENT', 'HEAD']} />
                <ContentRow date="1" dateUnit="DAY" title="Recommend batteries for the drone build?" tags={['SOLVED', 'POWER']} />
            </div>
        </div>
    )
}
