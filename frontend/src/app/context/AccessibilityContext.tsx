import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

export interface AccessibilitySettings {
  theme: Theme;
  fontScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  underlineLinks: boolean;
  largeCursor: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  toggleTheme: () => void;
  setFontScale: (value: number) => void;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleUnderlineLinks: () => void;
  toggleLargeCursor: () => void;
  reset: () => void;
}

const STORAGE_KEY = 'jrtech.accessibility';

const DEFAULTS: AccessibilitySettings = {
  theme: 'light',
  fontScale: 1,
  highContrast: false,
  reducedMotion: false,
  underlineLinks: false,
  largeCursor: false,
};

const FONT_SCALE_MIN = 0.85;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_STEP = 0.05;

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

function readInitial(): AccessibilitySettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      return {
        ...DEFAULTS,
        theme: prefersDark ? 'dark' : 'light',
        reducedMotion: !!prefersReducedMotion,
      };
    }
    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function clampScale(value: number) {
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Math.round(value * 100) / 100));
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(readInitial);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.toggle('dark', settings.theme === 'dark');
    root.classList.toggle('a11y-high-contrast', settings.highContrast);
    root.classList.toggle('a11y-reduced-motion', settings.reducedMotion);
    root.classList.toggle('a11y-underline-links', settings.underlineLinks);
    body.classList.toggle('a11y-large-cursor', settings.largeCursor);

    root.style.setProperty('--a11y-font-scale', String(settings.fontScale));
    root.style.fontSize = `${settings.fontScale * 100}%`;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }
  }, [settings]);

  const toggleTheme = useCallback(() => {
    setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const setFontScale = useCallback((value: number) => {
    setSettings((s) => ({ ...s, fontScale: clampScale(value) }));
  }, []);

  const increaseFontScale = useCallback(() => {
    setSettings((s) => ({ ...s, fontScale: clampScale(s.fontScale + FONT_SCALE_STEP) }));
  }, []);

  const decreaseFontScale = useCallback(() => {
    setSettings((s) => ({ ...s, fontScale: clampScale(s.fontScale - FONT_SCALE_STEP) }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((s) => ({ ...s, highContrast: !s.highContrast }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }));
  }, []);

  const toggleUnderlineLinks = useCallback(() => {
    setSettings((s) => ({ ...s, underlineLinks: !s.underlineLinks }));
  }, []);

  const toggleLargeCursor = useCallback(() => {
    setSettings((s) => ({ ...s, largeCursor: !s.largeCursor }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULTS);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        toggleTheme,
        setFontScale,
        increaseFontScale,
        decreaseFontScale,
        toggleHighContrast,
        toggleReducedMotion,
        toggleUnderlineLinks,
        toggleLargeCursor,
        reset,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return ctx;
}
