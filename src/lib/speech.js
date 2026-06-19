// ===== النطق الصوتي للردود (إخراج صوتي عربي) =====
// يعتمد expo-speech الذي ينطق على الجهاز مباشرة، بلا خادم وبلا تخزين.
// يدعم البدء والإيقاف، ويزيل وسوم الواجهة قبل النطق.

import * as Speech from "expo-speech";

// تنظيف النص من وسوم ميزان ومن رموز قد تربك النطق
function cleanForSpeech(text) {
  let t = String(text || "");
  t = t.replace(/\[\[ثقة:[^\]]*\]\]/g, "");
  t = t.replace(/\[\[مهلة:[^\]]*\]\]/g, "");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

let speaking = false;

// نطق نص بالعربية. onDone تُستدعى عند الانتهاء أو الإيقاف.
export function speak(text, { onStart, onDone } = {}) {
  const content = cleanForSpeech(text);
  if (!content) return;
  // إن كان هناك نطق جارٍ، أوقفه أولاً
  Speech.stop();
  speaking = true;
  Speech.speak(content, {
    language: "ar",
    rate: 1.0,
    pitch: 1.0,
    onStart: () => { if (onStart) onStart(); },
    onDone: () => { speaking = false; if (onDone) onDone(); },
    onStopped: () => { speaking = false; if (onDone) onDone(); },
    onError: () => { speaking = false; if (onDone) onDone(); },
  });
}

// إيقاف النطق الحالي
export function stopSpeaking() {
  speaking = false;
  Speech.stop();
}

// هل يوجد نطق جارٍ الآن؟ (فحص فوري)
export function isSpeaking() {
  return speaking;
}

// فحص غير متزامن من النظام (أدق)
export async function checkSpeaking() {
  try { return await Speech.isSpeakingAsync(); } catch (_e) { return false; }
}
