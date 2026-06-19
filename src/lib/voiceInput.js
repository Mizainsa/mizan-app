// ===== الإدخال الصوتي (تحويل الكلام إلى نص) =====
// يعمل على الجهاز بلا خادم وبلا تخزين. يعتمد مكتبة @react-native-voice/voice
// التي تتطلب تضمينها في بناء التطبيق (dev build) لأنها وحدة أصلية.
// التصميم هنا متين: إن كانت المكتبة متاحة عمل الإدخال الصوتي فوراً،
// وإن لم تكن متاحة بعد، يرجع isAvailable=false برسالة واضحة دون أي تعطل.

let Voice = null;
let available = false;
try {
  // محاولة تحميل المكتبة الأصلية إن كانت مضمّنة في البناء
  Voice = require("@react-native-voice/voice").default;
  available = !!Voice;
} catch (_e) {
  available = false;
}

export function isVoiceAvailable() {
  return available;
}

// بدء الاستماع. ترجع true إن بدأ فعلاً.
// onResult(text): تُستدعى بالنص المتعرّف عليه. onError(msg): عند أي خطأ.
// onEnd(): عند انتهاء الاستماع.
export async function startListening({ onResult, onError, onEnd } = {}) {
  if (!available || !Voice) {
    if (onError) onError("الإدخال الصوتي يتطلب تفعيل حزمة التعرف على الكلام في بناء التطبيق. سيعمل تلقائياً بعد تضمينها.");
    return false;
  }
  try {
    Voice.onSpeechResults = (e) => {
      const text = e && e.value && e.value.length ? e.value[0] : "";
      if (text && onResult) onResult(text);
    };
    Voice.onSpeechError = (e) => {
      if (onError) onError("تعذّر التعرف على الصوت. حاول مجدداً في مكان أهدأ.");
    };
    Voice.onSpeechEnd = () => { if (onEnd) onEnd(); };
    await Voice.start("ar-SA");
    return true;
  } catch (_e) {
    if (onError) onError("تعذّر بدء الاستماع. تأكد من السماح للتطبيق باستخدام الميكروفون.");
    return false;
  }
}

// إيقاف الاستماع
export async function stopListening() {
  if (!available || !Voice) return;
  try { await Voice.stop(); } catch (_e) {}
}

// تنظيف المستمعين عند إغلاق الشاشة
export async function destroyVoice() {
  if (!available || !Voice) return;
  try {
    await Voice.destroy();
    Voice.removeAllListeners();
  } catch (_e) {}
}
