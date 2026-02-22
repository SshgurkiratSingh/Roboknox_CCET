"use client";

import { useSettingsStore, NavRailAppearance } from "@/store/useSettingsStore";
import { Monitor, Sidebar, AlignLeft, ToggleLeft, ToggleRight } from "lucide-react";

export default function SettingsPage() {
    const { navRailAppearance, navRailFixed, setNavRailAppearance, setNavRailFixed } = useSettingsStore();

    const appearanceOptions: { value: NavRailAppearance; label: string; icon: React.ReactNode; desc: string }[] = [
        {
            value: "icon-only",
            label: "Icon Only",
            icon: <Monitor className="w-5 h-5" />,
            desc: "Floating icons without a background."
        },
        {
            value: "icon-bar",
            label: "Icon Bar",
            icon: <Sidebar className="w-5 h-5" />,
            desc: "Standard thin sidebar."
        },
        {
            value: "icons-text",
            label: "Icons & Text",
            icon: <AlignLeft className="w-5 h-5" />,
            desc: "Expanded sidebar with text labels."
        }
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-2">Settings</h1>
                <p className="text-secondary">Customize your Roboknox Dashboard experience.</p>
            </div>

            <div className="space-y-8">
                <section className="rounded-2xl border border-[#1a1a1a] bg-void p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Sidebar className="w-5 h-5 text-neon" />
                        Navigation Appearance
                    </h2>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-300 mb-3">Layout Style</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {appearanceOptions.map((opt) => {
                                    const isActive = navRailAppearance === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setNavRailAppearance(opt.value)}
                                            className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-fast text-left ${isActive
                                                    ? "border-neon bg-neon/10 text-neon shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                                                    : "border-[#1a1a1a] bg-[#0a0a0a] text-secondary hover:border-slate-600 hover:text-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                {opt.icon}
                                                <span className="font-semibold">{opt.label}</span>
                                            </div>
                                            <span className="text-xs opacity-80">{opt.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#1a1a1a]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-300">Toggleable Mode</p>
                                    <p className="text-xs text-secondary mt-1 max-w-md">
                                        When enabled, the sidebar can expand on hover (if unsupported by layout style, this acts dynamically).
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNavRailFixed(!navRailFixed)}
                                    className={`p-2 rounded-full transition-colors ${navRailFixed ? "text-secondary hover:text-white" : "text-neon"}`}
                                >
                                    {navRailFixed ? (
                                        <ToggleLeft className="w-8 h-8 opacity-50" />
                                    ) : (
                                        <ToggleRight className="w-8 h-8" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
