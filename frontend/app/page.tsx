"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import workshopsData from "../data/workshops.json";

type Workshop = {
  id: string;
  title: string;
  subtitle: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  highlights: string[];
  icon: "cube" | "bot" | "cloud";
  path: string;
};

const workshops = workshopsData as Workshop[];

const icons: Record<Workshop["icon"], React.ReactElement> = {
  cube: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
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
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
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
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
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

const iotIcon = (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
    <circle cx="24" cy="16" r="4" className="fill-emerald-300" />
    <circle cx="12" cy="34" r="4" className="fill-emerald-300" />
    <circle cx="36" cy="34" r="4" className="fill-emerald-300" />
    <path
      d="M24 20v8M18 28l-4 4M30 28l4 4"
      className="stroke-emerald-300"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-8xl flex-col gap-5 px-6 py-14">
        <header className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-emerald-400/30 bg-emerald-400/10">
              <Image
                src="/robo.png"
                alt="Roboknox Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300 font-semibold">
                Roboknox
              </p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Roboknox Robotics Club
              </h1>
              <p className="mt-1 text-sm text-emerald-300">
                Chandigarh College of Engineering & Technology
              </p>
            </div>
          </div>
          <p className="max-w-3xl text-lg text-slate-300">
            Welcome to the Roboknox Workshop Asset Library. Explore curated
            projects with step-by-step guides, wiring diagrams, code, and
            animations for hands-on learning.
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold">Workshop Projects</h2>
            <p className="mt-2 text-slate-400">
              Select a project to explore assets, guides, and code generation
              tools.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {workshops.map((workshop) => (
              <Link
                key={workshop.id}
                href={workshop.path}
                className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-400/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400">
                      {workshop.level}
                    </span>
                    <h2 className="mt-2 text-xl font-semibold">
                      {workshop.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {workshop.subtitle}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                    {icons[workshop.icon]}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
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
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  View Project
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
            <Link
              href="/serial-led"
              className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-400/60"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400">PC Portal</span>
                  <h2 className="mt-2 text-xl font-semibold">
                    Serial LED Update
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Connect over USB and push LED frames directly to your
                    controller.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                  <svg
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                    className="h-10 w-10"
                  >
                    <rect
                      x="10"
                      y="14"
                      width="28"
                      height="20"
                      rx="5"
                      className="fill-emerald-300"
                    />
                    <path
                      d="M16 20h16M16 26h10"
                      className="stroke-slate-950"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M24 6v8"
                      className="stroke-emerald-200"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-800/60 px-3 py-1">
                  Web Serial API
                </span>
                <span className="rounded-full bg-slate-800/60 px-3 py-1">
                  Live monitoring
                </span>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                Open Portal
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
            <Link
              href="/iot-dashboard"
              className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-400/60"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400">PC Portal</span>
                  <h2 className="mt-2 text-xl font-semibold">
                    IoT Dashboard
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Connect to MQTT brokers, monitor sensors, and control devices
                    with interactive widgets.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                  {iotIcon}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-800/60 px-3 py-1">
                  MQTT Protocol
                </span>
                <span className="rounded-full bg-slate-800/60 px-3 py-1">
                  Live Data
                </span>
                <span className="rounded-full bg-slate-800/60 px-3 py-1">
                  Widgets
                </span>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                Open Dashboard
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
