import { useModeStore } from '@/hooks/useMode';

export const useTransitionStore = () => {
  const {
    isTransitioning,
    isCovered,
    pendingPath,
    setIsTransitioning,
    setIsCovered,
    setPendingPath,
  } = useModeStore();

  return {
    isTransitioning,
    isCovered,
    pendingPath,
    setIsTransitioning,
    setIsCovered,
    setPendingPath,
  };
};
