import React from "react";
import Link from "next/link";
import SerialLedPortal from "./SerialLedPortal";

export default function SerialLedPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14">
        <header className="flex flex-col gap-4">
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-emerald-300"
          >
            ← Back to home
          </Link>
          <h1 className="text-4xl font-semibold">Serial LED Update Portal</h1>
          <p className="max-w-3xl text-slate-300">
            Use this page to push LED frames directly from your PC over USB
            serial. Connect, paste your command payload, and watch the device
            respond in real time.
          </p>
        </header>

        <SerialLedPortal />
      </div>
    </div>
  );
}
