import { create } from 'zustand';

export type SiteMode = 'production' | 'wedding';
export type SiteLanguage = 'th' | 'en';
interface SiteModeState {
  mode: SiteMode;
  language: SiteLanguage;
}

interface SiteModeAction {
  setMode: (mode: SiteMode) => void;
  setLanguage: (language: SiteLanguage) => void;
}

export const useSiteMode = create<SiteModeState & SiteModeAction>((set) => ({
  mode: 'production',
  language: 'th',
  setMode: (mode) => set({ mode }),
  setLanguage: (language) => set({ language }),
}));
