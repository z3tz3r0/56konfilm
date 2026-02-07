import { create } from 'zustand';

interface TransitionState {
  isTransitioning: boolean;
  pendingPath: string | null;
  setIsTransitioning: (value: boolean) => void;
  setPendingPath: (value: string | null) => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isTransitioning: false,
  pendingPath: null,
  setIsTransitioning: (value) => set({ isTransitioning: value }),
  setPendingPath: (value) => set({ pendingPath: value }),
}));
