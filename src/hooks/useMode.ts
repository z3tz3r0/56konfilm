import { SiteMode } from '@/lib/preferences';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { create } from 'zustand';

/**
 * Interface definition for Mode State
 */
interface ModeState {
  mode: SiteMode;
  targetMode: SiteMode | null;
  isTransitioning: boolean;
  isCovered: boolean;
  setMode: (mode: SiteMode) => void;
  setTargetMode: (mode: SiteMode | null) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  setIsCovered: (isCovered: boolean) => void;
  // toggleMode removed from store interface as logic is complex (side-effects) 
  // and handled better in the hook or component layer
}

/**
 * useModeStore: Zustand store for client-side mode state
 */
export const useModeStore = create<ModeState>((set) => ({
  mode: 'production', // Default fallback
  targetMode: null,
  isTransitioning: false,
  isCovered: false,
  setMode: (mode) => set({ mode }),
  setTargetMode: (targetMode) => set({ targetMode }),
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
  setIsCovered: (isCovered) => set({ isCovered }),
}));


/**
 * useMode Hook
 * Encapsulates mode logic including side-effects (Cookie, Theme, Attribute)
 */
export const useMode = () => {
  const { 
    mode, 
    targetMode,
    isTransitioning,
    isCovered,
    setMode, 
    setTargetMode,
    setIsTransitioning,
    setIsCovered,
  } = useModeStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    // AC1: Ensure first-load sets mode=production cookie when missing
    // Check if cookie exists; if not, set it to current default (production)
    if (typeof document !== 'undefined' && !document.cookie.split('; ').find(row => row.startsWith('mode='))) {
      const defaultMode = 'production';
      const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
      document.cookie = `mode=${defaultMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secureFlag}`;
    }
  }, []);

  const MODE_TO_THEME: Record<SiteMode, 'dark' | 'light'> = {
    production: 'dark',
    wedding: 'light',
  };

  const handleSetMode = (newMode: SiteMode) => {
    // 1. Update Zustand State
    setMode(newMode);

    // 2. Update next-themes
    setTheme(MODE_TO_THEME[newMode]);

    // 3. Update Cookie (One year expiry, Secure, SameSite=Lax)
    // Secure flag added to ensure transmission only over HTTPS in production
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    document.cookie = `mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secureFlag}`;

    // 4. Update HTML Attribute
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-mode', newMode);
    }
  };

  const handleToggleMode = () => {
    const nextMode = mode === 'production' ? 'wedding' : 'production';
    handleSetMode(nextMode);
  };

  return {
    mode,
    targetMode,
    isTransitioning,
    isCovered,
    setMode: handleSetMode,
    setTargetMode,
    setIsTransitioning,
    setIsCovered,
    toggleMode: handleToggleMode,
  };
};
