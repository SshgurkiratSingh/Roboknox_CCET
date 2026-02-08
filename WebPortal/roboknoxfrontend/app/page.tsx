import Link from "next/link";
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

const icons: Record<Workshop["icon"], JSX.Element> = {
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

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-14">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                <svg
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                  className="h-10 w-10"
                >
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
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                  Roboknox
                </p>
                <h1 className="text-3xl font-semibold sm:text-4xl">
                  Workshop Asset Library
                </h1>
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Updated for 2026 sessions
            </span>
          </div>
          <p className="max-w-2xl text-lg text-slate-300">
            Explore curated workshop cards with step-by-step assets, wiring
            diagrams, and ready-to-run code packs.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
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
                Open workshop
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
