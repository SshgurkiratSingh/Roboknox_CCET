# Roboknox Dashboard

A modern, responsive, hacker/cyberpunk themed IoT Dashboard and community platform built for the Roboknox CCET club.

## Features

- **IoT Studio**: An integrated toolchain including an MQTT Dashboard, Serial LED Portal, and 3D LED Cube Studio.
- **Dynamic Dashboard**: Responsive layouts adapting to desktop, tablet, and mobile views.
- **Activity & Metrics**: Mock data integration simulating real-time user activity, forum discussions, and club metrics.
- **Settings Store**: Persisted local UI preferences (like the NavRail appearance) using `zustand`.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 
- **Icons**: Lucide React
- **State Management**: Zustand
- **Package Manager**: Bun

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```
2. **Run the development server:**
   ```bash
   bun run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `/app`: Next.js App Router pages and API routes (simulated backend).
- `/components`: Reusable React components (UI elements, IoT Studio components).
- `/store`: Zustand state management files.
- `/public`: Static assets.

## Theming & Layout

This project focuses on a distinct "neon dark" aesthetic. Variables like `--neon` (`#10b981`), `bg-void` (`#0a0a0a`), and sleek `border-[#1a1a1a]` components are heavily utilized. Always prefer custom Tailwind extensions configured in `tailwind.config.ts` over default grays or blues to maintain the aesthetic.
