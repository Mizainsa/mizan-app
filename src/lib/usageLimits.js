// ===== نظام حصص الباقات (عدّاد محلي على الجهاز، بلا تخزين سحابي) =====
// النموذج قائم على الحصص لا المدة الزمنية:
//   المجانية: حصة محادثات للمرشد فقط، تنتهي بالاستهلاك.
//   الاحترافية والمتقدمة: حصة طلبات لكل الأقسام، تنتهي بالاستهلاك.
// الحصص والأسعار تُقرأ من الإعدادات اللحظية (لوحة التحكم على Supabase) إن وُجدت،
// وإلا تُستخدم القيم الافتراضية أدناه. هكذا يغيّرها المالك من اللوحة دون تحديث للتطبيق.

import AsyncStorage from "@react-native-async-storage/async-storage";

const COUNT_KEY = "mizan_usage_count";          // عدد الطلبات المستهلكة من الحصة الحالية
const PLAN_KEY = "mizan_plan";                  // "free" | "pro" | "advanced"
const SETTINGS_CACHE_KEY = "mizan_settings_cache";

// القيم الافتراضية للحصص والأسعار (تُستبدل بقيم لوحة التحكم إن وُجدت)
export const PLAN_DEFAULTS = {
  free:     { quota: 10,  price: null, scope: "guidance" }, // المرشد فقط
  pro:      { quota: 50,  price: 149,  scope: "all" },
  advanced: { quota: 100, price: 249,  scope: "all" },
};

// رسائل انتهاء الحصة لكل باقة (تظهر في الشات عند النفاد)
export const PLAN_EXPIRE_MSG = {
  free:     "اشترك للاستفادة من كافة الخدمات",
  pro:      "انتهى اشتراكك، جدد باقتك للاستمرار",
  advanced: "انتهى اشتراكك، جدد",
};

// تُستدعى من نقطة الدخول بعد جلب الإعدادات اللحظية لتخزينها محلياً
export async function cacheLiveSettings(settings) {
  try {
    if (settings && typeof settings === "object") {
      await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
    }
  } catch (_e) {}
}

// قراءة الإعدادات المخزّنة كاملة (للاستخدام في الواجهات)
export async function getCachedSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_e) {
    return {};
  }
}

// ===== حساب المسؤول (أدمن) ذو الوصول المفتوح =====
// بريد الأدمن يُخزّن في app_settings على الخادم (مفتاح admin_email)، قابل للتغيير
// من لوحة الإدارة دون تحديث للتطبيق. هنا نقارن بريد المستخدم الحالي به.
const ADMIN_FLAG_KEY = "mizan_is_admin";

// يقارن بريد المستخدم الممرّر ببريد الأدمن المخزّن (من الإعدادات اللحظية).
// المقارنة غير حسّاسة لحالة الأحرف ومع تجاهل الفراغات. ترجع true عند التطابق.
export async function isAdminUser(email) {
  try {
    if (!email) return false;
    const s = await getCachedSettings();
    const adminEmail = s && s.admin_email ? String(s.admin_email) : "";
    if (!adminEmail) return false;
    const match = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
    // نخزّن النتيجة محلياً ليستفيد منها فحص الحصة دون إعادة قراءة كل مرة
    await AsyncStorage.setItem(ADMIN_FLAG_KEY, match ? "1" : "0");
    return match;
  } catch (_e) {
    return false;
  }
}

// قراءة سريعة لحالة الأدمن المخزّنة محلياً (يستخدمها فحص الحصة)
async function isAdminCached() {
  try {
    return (await AsyncStorage.getItem(ADMIN_FLAG_KEY)) === "1";
  } catch (_e) {
    return false;
  }
}

// مسح حالة الأدمن (تُستدعى عند تسجيل الخروج، فلا تبقى الباقة مفتوحة لمستخدم آخر)
export async function clearAdminFlag() {
  try {
    await AsyncStorage.setItem(ADMIN_FLAG_KEY, "0");
  } catch (_e) {}
}

// قراءة حالة ميزة: ترجع true ما لم تُوقَف صراحة من لوحة الإدارة (الافتراضي مفعّل)
export async function isFeatureEnabled(featureKey) {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_CACHE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s[featureKey] === "boolean") return s[featureKey];
    }
  } catch (_e) {}
  return true;
}

// قراءة كل حالات الميزات دفعة واحدة من قيمة ممرّرة
export function readFeatureFlags(cachedSettings) {
  const flags = {};
  if (cachedSettings && typeof cachedSettings === "object") {
    Object.keys(cachedSettings).forEach((k) => {
      if (k.indexOf("feature_") === 0 && typeof cachedSettings[k] === "boolean") flags[k] = cachedSettings[k];
    });
  }
  return flags;
}

// حصة الباقة الفعّالة: من الإعداد اللحظي إن وُجد، وإلا الافتراضي.
// مفاتيح لوحة التحكم: free_quota / pro_quota / advanced_quota
async function effectiveQuota(plan) {
  const def = (PLAN_DEFAULTS[plan] || PLAN_DEFAULTS.free).quota;
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_CACHE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const v = s && s[plan + "_quota"];
      if (typeof v === "number" && v > 0) return v;
    }
  } catch (_e) {}
  return def;
}

// سعر الباقة الفعّال: من الإعداد اللحظي إن وُجد، وإلا الافتراضي.
// مفاتيح لوحة التحكم: pro_price / advanced_price
export async function effectivePrice(plan) {
  const def = (PLAN_DEFAULTS[plan] || {}).price;
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_CACHE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const v = s && s[plan + "_price"];
      if (typeof v === "number" && v > 0) return v;
    }
  } catch (_e) {}
  return def;
}

// قراءة الباقة الحالية المخزّنة محلياً
export async function getPlan() {
  try {
    const p = await AsyncStorage.getItem(PLAN_KEY);
    return (p === "pro" || p === "advanced") ? p : "free";
  } catch (_e) {
    return "free";
  }
}

// ضبط الباقة (يُستدعى بعد نجاح الاشتراك). يصفّر عدّاد الحصة لتبدأ الحصة الجديدة.
export async function setPlan(plan) {
  try {
    if (["free", "pro", "advanced"].includes(plan)) {
      await AsyncStorage.setItem(PLAN_KEY, plan);
      await AsyncStorage.setItem(COUNT_KEY, "0");
    }
  } catch (_e) {}
}

// قراءة عدد الطلبات المستهلكة من الحصة الحالية
async function readCount() {
  try {
    const c = await AsyncStorage.getItem(COUNT_KEY);
    const num = parseInt(c || "0", 10);
    return isNaN(num) ? 0 : num;
  } catch (_e) {
    return 0;
  }
}

// هل يمكن بدء طلب جديد؟ ترجع { allowed, used, quota, plan, remaining, expireMsg }
export async function checkCanChat() {
  const plan = await getPlan();
  // الأدمن: وصول مفتوح بلا حدود (تجاوز دائم للحصة)
  if (await isAdminCached()) {
    return { allowed: true, used: 0, quota: Infinity, plan: "advanced", remaining: Infinity, expireMsg: "" };
  }
  const quota = await effectiveQuota(plan);
  const used = await readCount();
  const allowed = used < quota;
  const remaining = Math.max(0, quota - used);
  return { allowed, used, quota, plan, remaining, expireMsg: PLAN_EXPIRE_MSG[plan] || PLAN_EXPIRE_MSG.free };
}

// تسجيل استهلاك طلب واحد من الحصة (يُستدعى عند إرسال سؤال فعلي)
export async function recordUsage() {
  try {
    const used = await readCount();
    await AsyncStorage.setItem(COUNT_KEY, String(used + 1));
  } catch (_e) {}
}
