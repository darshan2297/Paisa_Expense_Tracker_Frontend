import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web-only document shell.
 *
 * Scrollbar CSS also lives in `src/theme/WebScrollbarStyles.tsx` because
 * `expo export` does not reliably serialize custom `<style>` tags from this
 * file into `dist/index.html` — only `ScrollViewStyleReset` survives. Keep
 * the rules here for Metro/`expo start --web` parity with the mockup.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; }
              * {
                scrollbar-width: thin;
                scrollbar-color: #E0DBD3 transparent;
              }
              *::-webkit-scrollbar {
                width: 10px !important;
                height: 6px !important;
              }
              *::-webkit-scrollbar-button {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
              *::-webkit-scrollbar-thumb {
                background: #E0DBD3;
                border-radius: 99px;
                border: 3px solid transparent;
                background-clip: content-box;
              }
              *::-webkit-scrollbar-track {
                background: transparent;
              }
              .paisa-thin-scroll {
                scrollbar-width: thin;
                scrollbar-color: #E0DBD3 transparent;
              }
              .paisa-thin-scroll::-webkit-scrollbar {
                width: 10px !important;
                height: 6px !important;
                display: block !important;
              }
              .paisa-thin-scroll::-webkit-scrollbar-thumb {
                background: #E0DBD3;
                border-radius: 99px;
                border: 3px solid transparent;
                background-clip: content-box;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
