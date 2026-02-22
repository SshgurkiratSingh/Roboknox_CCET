import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import workshopsData from "../../../data/workshops.json";
import LedCubeStudio from "../../../components/iot/LedCubeStudio";

type WorkshopPageProps = {
    params: {
        id: string;
    };
};

export default function WorkshopPage({ params }: WorkshopPageProps) {
    const workshop = workshopsData.find((w) => w.id === params.id);

    if (!workshop) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14">
                <header className="flex flex-col gap-4">
                    <Link
                        href="/workshops"
                        className="text-sm text-slate-400 transition hover:text-emerald-300"
                    >
                        ← Back to workshops
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-semibold">{workshop.title}</h1>
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
                            {workshop.level}
                        </span>
                    </div>
                    <p className="max-w-3xl text-lg text-slate-300">
                        {workshop.subtitle}
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:col-span-2">
                        <h3 className="text-xl font-semibold mb-4">Workshop Overview</h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            In this hands-on workshop, you will assemble the hardware and write the firmware for a 3x3x3 LED cube. We will start with soldering the LEDs into layers, construct the column frame, and wire it to a microcontroller. In the second half, we will focus on programming the matrix multiplexing logic to create stunning volumetric animations.
                        </p>

                        <h4 className="font-semibold text-slate-200 mb-3">Highlights</h4>
                        <ul className="grid gap-2 text-slate-400 sm:grid-cols-2">
                            {workshop.highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <span className="text-emerald-400">✓</span> {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                            <h3 className="font-semibold mb-4">Details</h3>
                            <div className="space-y-3 text-sm text-slate-400">
                                <div className="flex justify-between">
                                    <span>Duration</span>
                                    <span className="font-medium text-slate-200">{workshop.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Format</span>
                                    <span className="font-medium text-slate-200">In-person</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Prerequisites</span>
                                    <span className="font-medium text-slate-200">None</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/10 p-6">
                            <h3 className="font-semibold text-emerald-300 mb-4">Resources</h3>
                            <div className="space-y-2">
                                {workshop.resources.map((res, idx) => (
                                    <a
                                        key={idx}
                                        href={res.href}
                                        className="flex items-center gap-2 text-sm text-emerald-400/80 transition hover:text-emerald-300"
                                    >
                                        📄 {res.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conditionally render LedCubeStudio if frames exist in the data (or specific workshop ID) */}
                {workshop.id === "led-cube-3x3x3" && (
                    <div className="mt-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold">Interactive Studio</h2>
                                <p className="mt-2 text-slate-400">
                                    Design your own animations before the workshop using our interactive 3D studio. Generate the C++ code to bring your pattern to life.
                                </p>
                            </div>
                        </div>

                        <LedCubeStudio initialFrames={(workshop as { initialFrames?: number[][][][] }).initialFrames || []} />
                    </div>
                )}
            </div>
        </div>
    );
}
