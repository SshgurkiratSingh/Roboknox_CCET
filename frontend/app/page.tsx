'use client'

import { MetricCard } from '@/components/ui/MetricCard'
import { Activity, Users, MessageSquare, Terminal, ArrowRight, Rss } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Metric {
  title: string
  value: string
  trend: string
  colorClass: string
}

interface ActivityType {
  user: string
  action: string
  time: string
}

export default function Home() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/metrics').then(res => res.json()),
      fetch('/api/activity').then(res => res.json())
    ]).then(([metricsData, activityData]) => {
      setMetrics(metricsData.metrics)
      setActivities(activityData.activity)
      setLoading(false)
    }).catch(err => {
      console.error("Failed to fetch dashboard data:", err)
      setLoading(false)
    })
  }, [])

  const getMetricIcon = (title: string) => {
    if (title.includes('Members')) return <Users size={24} />
    if (title.includes('Projects')) return <Terminal size={24} />
    if (title.includes('Forum')) return <MessageSquare size={24} />
    return <Activity size={24} />
  }

  return (
    <div className="p-4 sm:p-8 w-full max-w-[1400px] mx-auto min-h-screen bg-[#050505] text-white selection:bg-neon/30">
      {/* Header Section */}
      <div className="border-b border-[#1a1a1a] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-white mb-2">
            {"// ROBOKONX_OPS"}
          </h1>
          <p className="font-mono text-xs sm:text-sm text-secondary uppercase tracking-widest">
            Community Forum & Club Activity Dashboard
          </p>
        </div>
        <div className="flex gap-4 font-mono text-xs">
          <span className="text-secondary">SYSTEM LEVEL: <span className="text-neon ml-2">[ACTIVE]</span></span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neon font-mono animate-pulse">LOADING DASHBOARD DATA...</div>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {metrics.map((m, i) => (
              <MetricCard
                key={i}
                title={m.title}
                value={m.value}
                icon={getMetricIcon(m.title)}
                trend={m.trend}
                colorClass={m.colorClass}
              />
            ))}
          </div>

          {/* Bottom Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left column: Quick Actions */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Quick Links</h3>

              {[
                { title: "Join Discussion", desc: "Participate in the latest forum topics", color: "border-[#FFC83A]", href: "/forum" },
                { title: "Project Wiki", desc: "Documentation for ongoing builds", color: "border-[#3A8BFF]", href: "/workshops" },
                { title: "Submit Proposal", desc: "Pitch a new hardware/software project", color: "border-neon", href: "#" },
              ].map((action, i) => (
                <Link href={action.href} key={i}>
                  <div className={`flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#1a1a1a] border-l-4 ${action.color} rounded hover:bg-[#111111] transition-colors cursor-pointer group mt-4 first:mt-0`}>
                    <div>
                      <h4 className="font-bold text-sm text-white">{action.title}</h4>
                      <p className="text-xs text-secondary mt-1">{action.desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-secondary group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Right column: Recent Activity (Community Focused) */}
            <div className="lg:col-span-2">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Recent Activity</h3>
              <div className="h-full min-h-[300px] border border-[#1a1a1a] rounded-sm flex flex-col p-4 sm:p-6 bg-[#0a0a0a] overflow-x-auto">
                <div className="space-y-4 min-w-[280px]">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex gap-4 items-start pb-4 border-b border-[#111111] last:border-0">
                      <div className="p-2 rounded bg-[#111] text-secondary shrink-0">
                        <Rss size={16} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">
                          <span className="font-bold text-neon">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-secondary mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
