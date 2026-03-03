import { create } from 'zustand';

interface TransitionState {
  isTransitioning: boolean;
  isCovered: boolean;
  pendingPath: string | null;
  setIsTransitioning: (value: boolean) => void;
  setIsCovered: (value: boolean) => void;
  setPendingPath: (value: string | null) => void;
  resetTransition: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isTransitioning: false,
  isCovered: false,
  pendingPath: null,
  setIsTransitioning: (value) => set({ isTransitioning: value }),
  setIsCovered: (value) => set({ isCovered: value }),
  setPendingPath: (value) => set({ pendingPath: value }),
  resetTransition: () =>
    set({ isTransitioning: false, isCovered: false, pendingPath: null }),
}));
