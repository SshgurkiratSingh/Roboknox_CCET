import { ContentRow } from '@/components/ui/ContentRow'

export default function Workshops() {
    return (
        <div className="p-8 pb-12 w-full max-w-5xl mx-auto">
            <h1 className="font-display text-4xl font-bold tracking-widest text-white mb-8 mt-4">{"// WORKSHOPS"}</h1>

            <div className="flex flex-col border border-[#1a1a1a] bg-base rounded-sm mb-12 relative overflow-hidden">
                {/* Glow accent */}
                <div className="absolute top-0 left-0 w-[4px] h-full bg-neon" />
                <ContentRow date="15" dateUnit="FEB" title="LED Multiplexing: 3x3x3 Cube" tags={['BEGINNER', 'ARDUINO']} />
                <ContentRow date="22" dateUnit="MAR" title="Servo Kinematics" tags={['INTERMEDIATE', 'MATH']} />
                <ContentRow date="10" dateUnit="APR" title="PID Line Follower Calibration" tags={['ADVANCED', 'CONTROL']} />
            </div>
        </div>
    )
}
