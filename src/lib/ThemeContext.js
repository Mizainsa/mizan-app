// ===== سياق التفضيلات المرئية: الوضع المظلم وتكبير الخط =====
// يوفّر ألوان السمة الحالية (فاتح/داكن) ومُضاعِف حجم الخط لكل الشاشات.
// يُحفظ الاختيار محلياً على الجهاز فقط عبر AsyncStorage (لا تخزين سحابي إطلاقاً).

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LIGHT_COLORS, DARK_COLORS } from "./theme";
import { getLanguage, setLanguage as persistLanguage } from "./i18n";

const PREF_THEME_KEY = "mizan_pref_theme";   // "light" | "dark"
const PREF_FONT_KEY = "mizan_pref_font";     // مُضاعِف: 0.9 .. 1.6

const ThemeContext = createContext({
  colors: LIGHT_COLORS,
  isDark: false,
  fontScale: 1,
  lang: "ar",
  ready: false,
  toggleTheme: () => {},
  setFontScale: () => {},
  setLang: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [fontScale, setFontScaleState] = useState(1);
  const [lang, setLangState] = useState("ar");
  const [ready, setReady] = useState(false);

  // قراءة التفضيلات المحفوظة على الجهاز عند الإقلاع
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tval = await AsyncStorage.getItem(PREF_THEME_KEY);
        const f = await AsyncStorage.getItem(PREF_FONT_KEY);
        const l = await getLanguage();
        if (mounted) {
          if (tval === "dark") setIsDark(true);
          if (f) {
            const num = parseFloat(f);
            if (!isNaN(num) && num >= 0.8 && num <= 1.8) setFontScaleState(num);
          }
          setLangState(l);
        }
      } catch (_e) {}
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  const toggleTheme = useCallback(async () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(PREF_THEME_KEY, next ? "dark" : "light").catch(() => {});
      return next;
    });
  }, []);

  const setFontScale = useCallback(async (value) => {
    const clamped = Math.max(0.8, Math.min(1.8, value));
    setFontScaleState(clamped);
    AsyncStorage.setItem(PREF_FONT_KEY, String(clamped)).catch(() => {});
  }, []);

  const setLang = useCallback(async (code) => {
    setLangState(code);
    await persistLanguage(code);
    // ضبط اتجاه الواجهة حسب اللغة. ملاحظة: قلب الاتجاه الكامل (RTL/LTR) على مستوى
    // النظام يحتاج إعادة تشغيل التطبيق ليكتمل؛ نصوص الواجهة تتبدّل فوراً، والاتجاه
    // الكامل يُطبَّق عند الإقلاع التالي. هذا سلوك React Native المعروف لا خلل.
    try {
      const wantRTL = code !== "en";
      if (I18nManager.isRTL !== wantRTL) {
        I18nManager.allowRTL(wantRTL);
        I18nManager.forceRTL(wantRTL);
      }
    } catch (_e) {}
  }, []);

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // نظام الاتجاه الديناميكي: يقلب المحاذاة والصفوف حسب اللغة لحظياً (بلا إعادة تشغيل).
  // العربية والأردية من اليمين لليسار، الإنجليزية من اليسار لليمين.
  const isRTL = lang !== "en";
  const dir = {
    isRTL,
    // محاذاة النص: العربية يمين، الإنجليزية يسار (تعمل صحيحاً دائماً بصرف النظر عن الحاوية)
    textAlign: isRTL ? "right" : "left",
    textAlignReverse: isRTL ? "left" : "right",
    // ===== محاذاة منطقية لحاويات flexDirection: dir.row (المعكوسة في RTL) =====
    // في حاوية row-reverse: flex-start = يمين بصرياً. تُستخدم مع dir.row فقط.
    alignStart: isRTL ? "flex-end" : "flex-start",
    alignEnd: isRTL ? "flex-start" : "flex-end",
    // ===== محاذاة أفقية مطلقة لحاويات flexDirection: "row" الثابتة (غير المعكوسة) =====
    // هذه تعطي النتيجة البصرية الصحيحة دائماً: rowStart = جهة البداية، rowEnd = جهة النهاية.
    rowStart: isRTL ? "flex-end" : "flex-start",   // يمين في العربي، يسار في الإنجليزي
    rowEnd: isRTL ? "flex-start" : "flex-end",     // يسار في العربي، يمين في الإنجليزي
    // محاذاة العمود (alignItems في عمود): start = جهة البداية حسب اللغة
    colStart: isRTL ? "flex-end" : "flex-start",   // يمين في العربي
    colEnd: isRTL ? "flex-start" : "flex-end",     // يسار في العربي
    // اتجاه الصفوف
    row: isRTL ? "row-reverse" : "row",
    rowReverse: isRTL ? "row" : "row-reverse",
    // اتجاه الكتابة للنصوص الطويلة
    writingDirection: isRTL ? "rtl" : "ltr",
  };

  return (
    <ThemeContext.Provider value={{ colors, isDark, fontScale, lang, ready, dir, isRTL, toggleTheme, setFontScale, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// دالة مساعدة: تطبّق مُضاعِف الخط على حجم أساسي
export function scaled(size, fontScale) {
  return Math.round(size * (fontScale || 1) * 10) / 10;
}
