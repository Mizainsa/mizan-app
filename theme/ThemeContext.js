import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'mizan_theme';

// أربع لوحات بنفس المفاتيح تماماً (حتى تعمل كل الشاشات دون تغيير أسماء).
export const THEMES = {
  emerald: {
    key: 'emerald',
    name: 'الزمردي',
    emerald: '#0F5132',
    emeraldDeep: '#0A3D26',
    gold: '#C9A227',
    goldLight: '#E3C766',
    bg: '#FBFCFA',
    card: '#FFFFFF',
    border: '#E3EFE8',
    textDark: '#0A2A1B',
    textBody: '#1F3D30',
    muted: '#9CA9A2',
    headerSub: '#CFE3D8',
  },
  night: {
    key: 'night',
    name: 'الليل',
    emerald: '#10B981',
    emeraldDeep: '#064E3B',
    gold: '#E3C766',
    goldLight: '#F0DC9A',
    bg: '#0B1411',
    card: '#13211B',
    border: '#1E3329',
    textDark: '#F1F7F4',
    textBody: '#C7D6CE',
    muted: '#7C8C84',
    headerSub: '#9FB6AA',
  },
  ocean: {
    key: 'ocean',
    name: 'المحيط',
    emerald: '#0E7490',
    emeraldDeep: '#0A4F63',
    gold: '#D4A841',
    goldLight: '#E8C870',
    bg: '#F8FBFC',
    card: '#FFFFFF',
    border: '#DCEAEF',
    textDark: '#0A2730',
    textBody: '#1C3B43',
    muted: '#94A6AC',
    headerSub: '#CDE3EA',
  },
  sand: {
    key: 'sand',
    name: 'الرمل',
    emerald: '#9A6B2F',
    emeraldDeep: '#6E4A1E',
    gold: '#C9A227',
    goldLight: '#E3C766',
    bg: '#FCFAF5',
    card: '#FFFFFF',
    border: '#EFE7D6',
    textDark: '#2E2412',
    textBody: '#4A3D27',
    muted: '#A99B82',
    headerSub: '#E6D7BC',
  },
};

export const THEME_LIST = [THEMES.emerald, THEMES.night, THEMES.ocean, THEMES.sand];

const ThemeContext = createContext({
  colors: THEMES.emerald,
  themeKey: 'emerald',
  setThemeKey: () => {},
  ready: false,
});

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKeyState] = useState('emerald');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (!active) return;
      if (v && THEMES[v]) setThemeKeyState(v);
      setReady(true);
    }).catch(() => setReady(true));
    return () => { active = false; };
  }, []);

  const setThemeKey = (key) => {
    if (!THEMES[key]) return;
    setThemeKeyState(key);
    AsyncStorage.setItem(THEME_KEY, key).catch(() => {});
  };

  const value = {
    colors: THEMES[themeKey] ?? THEMES.emerald,
    themeKey,
    setThemeKey,
    ready,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
