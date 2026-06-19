// ===== التقاط المستندات بالكاميرا أو المعرض =====
// يلتقط صورة ويعيدها كـ data URL لإرسالها للتحليل البصري اللحظي.
// لا يُحفظ شيء على الخادم؛ الصورة تُرسل للنموذج وتُهمل بعد الرد.

import * as ImagePicker from "expo-image-picker";

// نضغط الصورة ونحدّها لتقليل الحجم المرسل (أداء وتكلفة)
const PICKER_OPTS = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.5,
  base64: true,
  allowsEditing: true,
};

function toDataUrl(asset) {
  if (!asset || !asset.base64) return null;
  // نوع الصورة من الامتداد إن توفّر، وإلا jpeg
  const uri = asset.uri || "";
  const isPng = uri.toLowerCase().endsWith(".png");
  const mime = isPng ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${asset.base64}`;
}

// التقاط من الكاميرا. ترجع { ok, dataUrl, error }.
export async function captureFromCamera() {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return { ok: false, error: "للتصوير، يلزم السماح للتطبيق باستخدام الكاميرا من إعدادات جهازك." };
    }
    const res = await ImagePicker.launchCameraAsync(PICKER_OPTS);
    if (res.canceled) return { ok: false, canceled: true };
    const dataUrl = toDataUrl(res.assets && res.assets[0]);
    if (!dataUrl) return { ok: false, error: "تعذّر قراءة الصورة الملتقطة." };
    return { ok: true, dataUrl };
  } catch (e) {
    return { ok: false, error: "تعذّر فتح الكاميرا." };
  }
}

// اختيار من المعرض. ترجع { ok, dataUrl, error }.
export async function pickFromGallery() {
  try {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return { ok: false, error: "لاختيار صورة، يلزم السماح للتطبيق بالوصول إلى الصور من إعدادات جهازك." };
    }
    const res = await ImagePicker.launchImageLibraryAsync(PICKER_OPTS);
    if (res.canceled) return { ok: false, canceled: true };
    const dataUrl = toDataUrl(res.assets && res.assets[0]);
    if (!dataUrl) return { ok: false, error: "تعذّر قراءة الصورة المختارة." };
    return { ok: true, dataUrl };
  } catch (e) {
    return { ok: false, error: "تعذّر فتح المعرض." };
  }
}
