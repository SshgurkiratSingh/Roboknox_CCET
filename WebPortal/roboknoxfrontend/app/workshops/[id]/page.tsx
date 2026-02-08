import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import workshopsData from "../../../data/workshops.json";
import LedCubeStudio from "./LedCubeStudio";

type Workshop = {
  id: string;
  title: string;
  subtitle: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  highlights: string[];
  icon: "cube" | "bot" | "cloud";
  resources: { label: string; href: string }[];
  frames: number[][][];
};

const workshops = workshopsData as Workshop[];

const icons: Record<Workshop["icon"], React.ReactElement> = {
  cube: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-14 w-14">
      <path
        d="M8 14 24 6l16 8-16 8-16-8Zm0 6 16 8v12L8 32V20Zm32 0L24 28v12l16-8V20Z"
        className="fill-emerald-300"
      />
      <path
        d="M24 22 8 14m16 8 16-8"
        className="stroke-emerald-200"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),
  bot: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-14 w-14">
      <rect
        x="8"
        y="14"
        width="32"
        height="22"
        rx="6"
        className="fill-emerald-300"
      />
      <circle cx="18" cy="25" r="3" className="fill-slate-950" />
      <circle cx="30" cy="25" r="3" className="fill-slate-950" />
      <path
        d="M24 6v6"
        className="stroke-emerald-200"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-14 w-14">
      <path
        d="M18 36h15a9 9 0 0 0 0-18 11 11 0 0 0-21-2 8 8 0 0 0 6 20Z"
        className="fill-emerald-300"
      />
      <path
        d="M14 32h21"
        className="stroke-emerald-200"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export default async function WorkshopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workshop = workshops.find((item) => item.id === id);

  if (!workshop) {
    notFound();
  }

  const isLedCubeWorkshop =
    workshop.icon === "cube" && workshop.frames.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white min-w-full">
      <div className="mx-auto flex w-full min-w-8xl flex-col gap-10 px-6 py-14">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="text-sm text-slate-400 transition hover:text-emerald-300"
              >
                ← Back to projects
              </Link>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Roboknox Project
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              {workshop.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-300">
              {workshop.subtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full bg-slate-800/60 px-3 py-1">
                {workshop.level}
              </span>
              <span className="rounded-full bg-slate-800/60 px-3 py-1">
                {workshop.duration}
              </span>
              {workshop.highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-800/60 px-3 py-1"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6">
            {icons[workshop.icon]}
          </div>
        </div>

        {isLedCubeWorkshop ? (
          <LedCubeStudio initialFrames={workshop.frames} />
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="text-xl font-semibold">Project Resources</h2>
                <p className="mt-2 text-sm text-slate-400">
                  All resources below are pulled from JSON for this project.
                </p>
                <div className="mt-5 grid gap-3">
                  {workshop.resources.map((resource) => (
                    <a
                      key={resource.label}
                      href={resource.href}
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm transition hover:border-emerald-400/60"
                    >
                      {resource.label}
                      <span className="text-emerald-300">→</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900/70 via-slate-950/60 to-emerald-950/30 p-6">
                <h2 className="text-xl font-semibold">Quick plan</h2>
                <ul className="mt-4 space-y-4 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    Review the assets and set up your workstation.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    Follow the build guide and test each subsystem.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    Upload sample code and iterate on improvements.
                  </li>
                </ul>
              </div>
            </section>

            {workshop.frames.length > 0 ? (
              <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">LED Cube frames</h3>
                    <p className="text-sm text-slate-400">
                      Frame previews for your animation sequence.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {workshop.frames.length} frames
                  </span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {workshop.frames.map((frame, index) => (
                    <div
                      key={`frame-${index}`}
                      className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4"
                    >
                      <p className="text-xs text-slate-400">
                        Frame {index + 1}
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {frame.map((row, rowIndex) =>
                          row.map((cell, colIndex) => (
                            <span
                              key={`${rowIndex}-${colIndex}`}
                              className={`h-8 w-8 rounded-lg border border-slate-700 ${
                                cell
                                  ? "bg-emerald-400/90 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                                  : "bg-slate-900"
                              }`}
                            />
                          )),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
