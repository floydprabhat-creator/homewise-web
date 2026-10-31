type Theme = 'light' | 'dark';

const STORAGE_KEY = 'hw-theme';
const listeners = new Set<() => void>();

/** Runs in <head> before first paint so a saved dark theme doesn't flash light. */
export const themeInitScript = `try{if(localStorage.getItem('${STORAGE_KEY}')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode): the theme still applies for this page view.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
