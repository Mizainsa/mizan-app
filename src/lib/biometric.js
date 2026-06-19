// ===== القفل البيومتري (بصمة/وجه) على الجهاز فقط، بلا خادم =====
// يحمي فتح التطبيق ببصمة المستخدم أو وجهه. التفعيل اختياري ويُحفظ محلياً.

import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCK_KEY = "mizan_biometric_lock"; // "on" | غير ذلك

// هل الجهاز يدعم البصمة/الوجه وهل مسجّلة فعلاً؟
export async function isBiometricAvailable() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (_e) {
    return false;
  }
}

// هل فعّل المستخدم القفل البيومتري؟
export async function isLockEnabled() {
  try {
    return (await AsyncStorage.getItem(LOCK_KEY)) === "on";
  } catch (_e) {
    return false;
  }
}

// تفعيل/تعطيل القفل (يطلب توثيقاً قبل التفعيل لضمان أنه صاحب الجهاز)
export async function setLockEnabled(enabled) {
  try {
    if (enabled) {
      const available = await isBiometricAvailable();
      if (!available) {
        return { ok: false, error: "جهازك لا يدعم البصمة أو الوجه، أو لم تُسجّل بعد في إعدادات الجهاز." };
      }
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: "وثّق هويتك لتفعيل قفل التطبيق",
        cancelLabel: "إلغاء",
      });
      if (!auth.success) return { ok: false, error: "تعذّر التوثيق." };
      await AsyncStorage.setItem(LOCK_KEY, "on");
      return { ok: true };
    } else {
      await AsyncStorage.removeItem(LOCK_KEY);
      return { ok: true };
    }
  } catch (_e) {
    return { ok: false, error: "تعذّر تغيير إعداد القفل." };
  }
}

// طلب التوثيق عند فتح التطبيق. ترجع true عند النجاح.
export async function authenticate() {
  try {
    const auth = await LocalAuthentication.authenticateAsync({
      promptMessage: "وثّق هويتك للدخول إلى ميزان",
      cancelLabel: "إلغاء",
    });
    return !!auth.success;
  } catch (_e) {
    return false;
  }
}
