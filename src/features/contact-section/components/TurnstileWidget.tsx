'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@shared/config/preferences';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      language: Locale;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

function getTurnstile() {
  return (window as Window & { turnstile?: TurnstileApi }).turnstile;
}

interface TurnstileWidgetProps {
  siteKey: string;
  lang: Locale;
  resetKey: number;
  onTokenChange: (token: string | null) => void;
  errorMessage: string;
}

export function TurnstileWidget({
  siteKey,
  lang,
  resetKey,
  onTokenChange,
  errorMessage,
}: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const previousResetKey = useRef(resetKey);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    return () => {
      if (widgetId.current) getTurnstile()?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  useEffect(() => {
    if (previousResetKey.current === resetKey) return;
    previousResetKey.current = resetKey;
    onTokenChange(null);
    if (widgetId.current) getTurnstile()?.reset(widgetId.current);
  }, [resetKey, onTokenChange]);

  const renderWidget = () => {
    const turnstile = getTurnstile();
    if (!container.current || !turnstile || widgetId.current) return;
    try {
      widgetId.current = turnstile.render(container.current, {
        sitekey: siteKey,
        language: lang,
        callback: (token) => {
          setScriptFailed(false);
          onTokenChange(token);
        },
        'expired-callback': () => onTokenChange(null),
        'error-callback': () => {
          onTokenChange(null);
          setScriptFailed(true);
        },
      });
    } catch {
      setScriptFailed(true);
      onTokenChange(null);
    }
  };

  return (
    <div>
      <Script
        src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        strategy='afterInteractive'
        onReady={renderWidget}
        onError={() => setScriptFailed(true)}
      />
      <div ref={container} data-testid='contact-turnstile' />
      {scriptFailed && <p role='alert'>{errorMessage}</p>}
    </div>
  );
}
