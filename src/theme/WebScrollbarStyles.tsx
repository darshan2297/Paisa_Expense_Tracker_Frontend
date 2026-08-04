import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Injects the mockup scrollbar CSS on web.
 *
 * Expo's static `+html.tsx` shell is not fully serialized into `expo export`
 * output (only `ScrollViewStyleReset` survives), so scrollbar rules declared
 * there never reach the Docker/production bundle. Mounting a `<style>` tag
 * from the root layout guarantees the styles ship with the JS bundle.
 *
 * Matches `docs/design/Expense Tracker v2.dc.html`:
 *   width 10px + 3px transparent border + background-clip → ~4px hairline thumb.
 */
const SCROLLBAR_CSS = `
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
  /* Native browser date picker affordance inside DateField */
  .paisa-date-input {
    cursor: pointer;
  }
  .paisa-date-input::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.7;
    padding: 4px;
    margin-right: 2px;
  }
  .paisa-date-input::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
  /* Tabular nums for money — do NOT use RN fontVariant (paints amount boxes) */
  input, textarea {
    outline: none;
  }
  input[inputmode="decimal"],
  input[inputmode="numeric"] {
    border: none;
    outline: none;
    box-shadow: none;
    -moz-appearance: textfield;
  }
`;

const STYLE_ID = 'paisa-scrollbar-styles';

export function WebScrollbarStyles() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = SCROLLBAR_CSS;
    document.head.appendChild(style);
  }, []);

  return null;
}

export default WebScrollbarStyles;
