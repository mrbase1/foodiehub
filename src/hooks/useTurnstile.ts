import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = '0x4AAAAAAA0fbVsOfC7H3YsM'; // Replace with your Cloudflare Turnstile site key

export const useTurnstile = () => {
  useEffect(() => {
    // Load the Turnstile script if it hasn't been loaded yet
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const renderTurnstile = useCallback((containerId: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!window.turnstile) {
        setTimeout(() => renderTurnstile(containerId).then(resolve), 100);
        return;
      }

      window.turnstile.render(`#${containerId}`, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          resolve(token);
        },
      });
    });
  }, []);

  return { renderTurnstile };
};
