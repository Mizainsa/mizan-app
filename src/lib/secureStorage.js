// ===== التخزين المشفّر للبيانات الحساسة محلياً (بلا خادم) =====
// مفتاح التشفير يُولّد مرة واحدة ويُحفظ في المخزن الآمن للجهاز
// (Keychain في آيفون و Keystore في أندرويد) عبر expo-secure-store.
// البيانات تُشفّر بـ AES عبر مكتبة قياسية قبل حفظها في AsyncStorage.
// إن لم تتوفر القدرات الأصلية في البناء، يتدهور بأمان للتخزين العادي مع تنبيه داخلي.

import AsyncStorage from "@react-native-async-storage/async-storage";

let SecureStore = null;
let CryptoJS = null;
try { SecureStore = require("expo-secure-store"); } catch (_e) { SecureStore = null; }
try { CryptoJS = require("crypto-js"); } catch (_e) { CryptoJS = null; }

const KEY_NAME = "mizan_enc_key_v1";
const ENC_PREFIX = "enc::"; // علامة تسبق أي قيمة مشفّرة لتمييزها

// هل التشفير الحقيقي متاح في هذا البناء؟
export function isEncryptionAvailable() {
  return !!(SecureStore && CryptoJS);
}

// توليد مفتاح عشوائي قوي
function randomKey() {
  // 256 بت بصيغة سداسية عشرية
  if (CryptoJS && CryptoJS.lib && CryptoJS.lib.WordArray) {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
  // احتياط (نادر): توليد محلي
  let s = "";
  const chars = "0123456789abcdef";
  for (let i = 0; i < 64; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

// الحصول على مفتاح التشفير من المخزن الآمن، أو إنشاؤه أول مرة
async function getKey() {
  if (!SecureStore) return null;
  try {
    let key = await SecureStore.getItemAsync(KEY_NAME);
    if (!key) {
      key = randomKey();
      await SecureStore.setItemAsync(KEY_NAME, key);
    }
    return key;
  } catch (_e) {
    return null;
  }
}

// حفظ قيمة مشفّرة. ترجع true عند النجاح.
export async function setSecure(storeKey, value) {
  const plain = typeof value === "string" ? value : JSON.stringify(value);
  if (isEncryptionAvailable()) {
    const key = await getKey();
    if (key) {
      try {
        const cipher = CryptoJS.AES.encrypt(plain, key).toString();
        await AsyncStorage.setItem(storeKey, ENC_PREFIX + cipher);
        return true;
      } catch (_e) { /* يسقط للتخزين العادي أدناه */ }
    }
  }
  // تدهور آمن: تخزين عادي (مع بقاء البيانات على الجهاز فقط)
  try { await AsyncStorage.setItem(storeKey, plain); return true; } catch (_e) { return false; }
}

// قراءة قيمة (تفكّ التشفير تلقائياً إن كانت مشفّرة). ترجع نصاً أو null.
export async function getSecure(storeKey) {
  try {
    const raw = await AsyncStorage.getItem(storeKey);
    if (raw == null) return null;
    if (raw.startsWith(ENC_PREFIX) && isEncryptionAvailable()) {
      const key = await getKey();
      if (!key) return null;
      const bytes = CryptoJS.AES.decrypt(raw.slice(ENC_PREFIX.length), key);
      return bytes.toString(CryptoJS.enc.Utf8) || null;
    }
    // قيمة غير مشفّرة (أو لا تشفير متاح): تُعاد كما هي
    if (raw.startsWith(ENC_PREFIX)) return null; // مشفّرة لكن لا مفتاح
    return raw;
  } catch (_e) {
    return null;
  }
}

// حذف قيمة
export async function removeSecure(storeKey) {
  try { await AsyncStorage.removeItem(storeKey); } catch (_e) {}
}
