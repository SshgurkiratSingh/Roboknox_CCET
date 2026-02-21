import { MetricCard } from '@/components/ui/MetricCard'
import { Activity, Users, MessageSquare, Terminal, ArrowRight, Rss } from 'lucide-react'

export default function Home() {
  return (
    <div className="p-8 w-full max-w-[1400px] mx-auto min-h-screen bg-[#050505] text-white selection:bg-neon/30">
      {/* Header Section */}
      <div className="border-b border-[#1a1a1a] pb-6 mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-widest text-white mb-2">
            {"// ROBOKONX_OPS"}
          </h1>
          <p className="font-mono text-sm text-secondary uppercase tracking-widest">
            Community Forum & Club Activity Dashboard
          </p>
        </div>
        <div className="flex gap-4 font-mono text-xs">
          <span className="text-secondary">SYSTEM LEVEL: <span className="text-neon ml-2">[ACTIVE]</span></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard
          title="Active Members"
          value="108"
          icon={<Users size={24} />}
          trend="12 new this month"
          colorClass="border-neon text-neon"
        />
        <MetricCard
          title="Ongoing Projects"
          value="04"
          icon={<Terminal size={24} />}
          trend="2 nearing completion"
          colorClass="border-[#3A8BFF] text-[#3A8BFF]"
        />
        <MetricCard
          title="Forum Topics"
          value="42"
          icon={<MessageSquare size={24} />}
          trend="5 active discussions today"
          colorClass="border-[#FFC83A] text-[#FFC83A]"
        />
        <MetricCard
          title="Recent Commits"
          value="26"
          icon={<Activity size={24} />}
          trend="Across 3 repositories"
          colorClass="border-[#FF3A5C] text-[#FF3A5C]"
        />
      </div>

      {/* Bottom Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left column: Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Quick Links</h3>

          {[
            { title: "Join Discussion", desc: "Participate in the latest forum topics", color: "border-[#FFC83A]" },
            { title: "Project Wiki", desc: "Documentation for ongoing builds", color: "border-[#3A8BFF]" },
            { title: "Submit Proposal", desc: "Pitch a new hardware/software project", color: "border-neon" },
          ].map((action, i) => (
            <div key={i} className={`flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#1a1a1a] border-l-4 ${action.color} rounded hover:bg-[#111111] transition-colors cursor-pointer group`}>
              <div>
                <h4 className="font-bold text-sm text-white">{action.title}</h4>
                <p className="text-xs text-secondary mt-1">{action.desc}</p>
              </div>
              <ArrowRight size={16} className="text-secondary group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>

        {/* Right column: Recent Activity (Community Focused) */}
        <div className="lg:col-span-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Recent Activity</h3>
          <div className="h-full min-h-[300px] border border-[#1a1a1a] rounded-sm flex flex-col p-6 bg-[#0a0a0a]">
            <div className="space-y-4">
              {[
                { user: "@admin", action: "posted a new guide on PID tuning", time: "2 hours ago" },
                { user: "@hardware_lead", action: "updated the Rover project repository", time: "5 hours ago" },
                { user: "@member_jane", action: "asked a question in the Electronics forum", time: "Yesterday" },
                { user: "@admin", action: "scheduled the next weekend workshop", time: "2 days ago" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 items-start pb-4 border-b border-[#111111] last:border-0">
                  <div className="p-2 rounded bg-[#111] text-secondary">
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

    </div>
  )
}
