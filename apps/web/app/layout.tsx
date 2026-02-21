import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from 'next/font/google'
import "./globals.css";
import { TopBar } from "../components/ui/TopBar";
import { NavRail } from "../components/ui/NavRail";

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: "Roboknox Dashboard",
  description: "Phase 1 Showcase Site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased terminal-cursor">
        {/* Layout Shell */}
        <div className="flex flex-col h-screen overflow-hidden">
          <TopBar />
          <div className="flex flex-1 overflow-hidden relative">
            <NavRail />
            <main className="flex-1 overflow-y-auto relative z-0">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
