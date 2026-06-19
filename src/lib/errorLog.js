// ===== مراقبة الأعطال محلياً (بلا خادم، بلا ربط خارجي) =====
// يسجّل آخر الأخطاء على الجهاز فقط في حلقة صغيرة، ويلتقط الأخطاء غير الممسوكة.
// لا يُرسل أي بيانات لأي جهة خارجية، حفاظاً على قاعدة عدم الربط والخصوصية.

import AsyncStorage from "@react-native-async-storage/async-storage";

const LOG_KEY = "mizan_error_log";
const MAX_ENTRIES = 20;

// تسجيل خطأ (يحتفظ بآخر MAX_ENTRIES فقط)
export async function logError(message, stack = "") {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const arr = Array.isArray(list) ? list : [];
    arr.push({
      time: new Date().toISOString(),
      message: String(message || "").slice(0, 500),
      stack: String(stack || "").slice(0, 1500),
    });
    const trimmed = arr.slice(-MAX_ENTRIES);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  } catch (_e) {}
}

// قراءة سجل الأخطاء (للعرض في لوحة الإدارة المحلية)
export async function getErrorLog() {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (_e) {
    return [];
  }
}

// مسح سجل الأخطاء
export async function clearErrorLog() {
  try { await AsyncStorage.removeItem(LOG_KEY); } catch (_e) {}
}

// تثبيت ملتقط الأخطاء العام (يُستدعى مرة عند الإقلاع)
export function installGlobalErrorHandler() {
  try {
    const g = global;
    if (g && g.ErrorUtils && typeof g.ErrorUtils.getGlobalHandler === "function") {
      const prev = g.ErrorUtils.getGlobalHandler();
      g.ErrorUtils.setGlobalHandler((error, isFatal) => {
        const msg = (error && error.message) || "خطأ غير معروف";
        const stk = (error && error.stack) || "";
        logError(msg, stk);
        // تبليغ اختياري للخادم لرصد المشاكل في لوحة الإدارة (بلا بيانات مستخدم)
        try {
          const { reportError } = require("./api");
          const { Platform } = require("react-native");
          reportError(msg, Platform.OS, "1.7.0");
        } catch (_e) {}
        if (prev) prev(error, isFatal);
      });
    }
  } catch (_e) {}
}
