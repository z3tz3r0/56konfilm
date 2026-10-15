'use client';

import { useSyncExternalStore, type ReactElement } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/ui';

const HOVER_QUERY = '(min-width: 48rem) and (hover: hover)';

/** Subscribes to changes in desktop hover capability and returns the listener cleanup. */
function subscribeToHover(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const media = window.matchMedia(HOVER_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** Checks whether the viewport is at least 48rem wide and supports hover. */
function canHover() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia(HOVER_QUERY).matches
  );
}

interface AppTooltipProps {
  children: ReactElement;
  content: string;
}

/** Uses hover/focus tooltips on desktop and tap popovers on touch or small screens. */
export default function AppTooltip({ children, content }: AppTooltipProps) {
  const useHover = useSyncExternalStore(
    subscribeToHover,
    canHover,
    () => false
  );
  if (!content.trim()) return children;

  // Each primitive owns its open state, so switching presentation closes the old overlay.
  if (useHover) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent className='max-w-xs whitespace-pre-wrap'>
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className='max-w-[calc(100vw-2rem)] whitespace-pre-wrap'>
        {content}
      </PopoverContent>
    </Popover>
  );
}
