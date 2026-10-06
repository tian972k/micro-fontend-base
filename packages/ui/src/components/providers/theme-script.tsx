import * as React from "react";

export function ThemeScript({ nonce }: { nonce?: string } = {}) {
  return (
    <script
      nonce={nonce}
      // The browser hides the nonce attribute after load, so the client
      // value never matches the server-rendered one.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const stored = JSON.parse(localStorage.getItem('mfe-theme') || '{}');
              const theme = stored.state?.theme || 'system';
              const resolved = theme === 'system' 
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : theme;
              document.documentElement.classList.add(resolved);
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
