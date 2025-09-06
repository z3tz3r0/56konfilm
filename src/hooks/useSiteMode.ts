import { create } from 'zustand';

export type SiteMode = 'production' | 'wedding';

interface SiteModeState {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
}

export const useSiteMode = create<SiteModeState>((set) => ({
  mode: 'production', // Default mode
  setMode: (mode) => set({ mode }),
}));
