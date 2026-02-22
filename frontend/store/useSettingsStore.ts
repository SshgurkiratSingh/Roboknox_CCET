import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NavRailAppearance = 'icon-only' | 'icon-bar' | 'icons-text'

interface SettingsState {
    navRailAppearance: NavRailAppearance
    navRailFixed: boolean
    setNavRailAppearance: (appearance: NavRailAppearance) => void
    setNavRailFixed: (fixed: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            navRailAppearance: 'icon-bar',
            navRailFixed: true,
            setNavRailAppearance: (appearance) => set({ navRailAppearance: appearance }),
            setNavRailFixed: (fixed) => set({ navRailFixed: fixed }),
        }),
        {
            name: 'robonox-settings-storage', // name of item in the storage (must be unique)
        }
    )
)
