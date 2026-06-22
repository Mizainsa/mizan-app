import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES, DEFAULT_THEME } from "./theme";

const THEME_KEY = "mizan_theme_v1";

const FALLBACK = {
  themeId: DEFAULT_THEME,
  theme: THEMES[DEFAULT_THEME],
  setTheme: () => {},
  ready: true,
};

const ThemeContext = createContext(FALLBACK);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (mounted && saved && THEMES[saved]) setThemeId(saved);
      } catch (e) {}
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  const setTheme = useCallback(async (id) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    try { await AsyncStorage.setItem(THEME_KEY, id); } catch (e) {}
  }, []);

  const activeTheme = THEMES[themeId] || THEMES[DEFAULT_THEME];
  const value = { themeId, theme: activeTheme, setTheme, ready };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx || !ctx.theme) return FALLBACK;
  return ctx;
}
