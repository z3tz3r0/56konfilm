import { SiteMode } from '@shared/config';
import { create } from 'zustand';

interface ModeState {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
}

export const useModeStore = create<ModeState>((set) => ({
  mode: 'production',
  setMode: (mode) => set({ mode }),
}));
