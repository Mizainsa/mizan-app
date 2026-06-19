// ===== تصدير المخرجات كمستند منسّق قابل للطباعة والمشاركة =====
// يحوّل نص المساعد إلى ملف PDF عربي مهيكل (يمين لليسار) ثم يفتح قائمة المشاركة
// أو الطباعة. يعتمد على expo-print و expo-sharing المتوفرتين في Expo.

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// تحويل ميلادي إلى هجري تقريبي (خوارزمية قياسية دون مكتبات خارجية).
// النتيجة تقريبية بيوم في حالات نادرة، وتُعرض مع الميلادي لتوثيق المستند.
function toHijri(gDate) {
  const gy = gDate.getFullYear();
  const gm = gDate.getMonth() + 1;
  const gd = gDate.getDate();
  // عدد الأيام اليوليانية
  let jd = Math.floor((1461 * (gy + 4800 + Math.floor((gm - 14) / 12))) / 4) +
    Math.floor((367 * (gm - 2 - 12 * Math.floor((gm - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((gy + 4900 + Math.floor((gm - 14) / 12)) / 100)) / 4) +
    gd - 32075;
  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hm = Math.floor((24 * l) / 709);
  const hd = l - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;
  return { hy, hm, hd };
}

const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

function dualDateLine() {
  const d = new Date();
  const g = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} م`;
  const h = toHijri(d);
  const hStr = `${h.hd} ${HIJRI_MONTHS[h.hm - 1] || ""} ${h.hy} هـ`;
  return { gregorian: g, hijri: hStr };
}
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// بناء قالب HTML عربي فاخر للطباعة من عنوان ونص
function buildHtml(title, body) {
  const safeTitle = escapeHtml(title);
  // نحافظ على فقرات النص بتحويل الأسطر إلى عناصر فقرات
  const paragraphs = String(body || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("\n");

  const today = new Date();
  const dd = dualDateLine();

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${safeTitle}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { margin: 28mm 20mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Amiri", "Traditional Arabic", "Times New Roman", serif;
    direction: rtl; text-align: right; color: #111111;
    line-height: 2; font-size: 15px; margin: 0; padding: 0;
  }
  .header {
    border-bottom: 3px solid #0F172A; padding-bottom: 16px; margin-bottom: 24px;
    display: flex; justify-content: space-between; align-items: flex-end;
  }
  .brand { font-size: 26px; font-weight: bold; color: #0F172A; letter-spacing: 1px; }
  .brand .accent { color: #D4AF37; }
  .meta { font-size: 12px; color: #555555; text-align: left; line-height: 1.7; }
  h1 { font-size: 19px; color: #0F172A; margin: 0 0 18px 0; }
  p { margin: 0 0 12px 0; }
  .footer {
    margin-top: 36px; padding-top: 16px; border-top: 1px solid #E2E8F0;
    font-size: 11px; color: #888888; line-height: 1.8; font-style: italic;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">مِيزَان<span class="accent"> ·</span></div>
    <div class="meta">${dd.hijri}<br/>${dd.gregorian}<br/>مستند استرشادي</div>
  </div>
  <h1>${safeTitle}</h1>
  ${paragraphs}
  <div class="footer">
    هذا المستند استرشادي صادر عن مساعد ذكي لأغراض التوعية والتنظيم الأولي،
    ولا يُعد بديلاً عن استشارة محامٍ سعودي مرخص أو مراجعة الجهة المختصة،
    ويُنصح بمراجعته قبل اتخاذ أي إجراء نظامي أو توقيع أي مستند.
  </div>
</body>
</html>`;
}

// تصدير نص كمستند PDF ثم فتح المشاركة. ترجع { ok, error }.
export async function exportAsPdf(title, body) {
  try {
    const html = buildHtml(title || "مستند ميزان", body || "");
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "مشاركة المستند",
        UTI: "com.adobe.pdf",
      });
    }
    return { ok: true, uri };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// طباعة مباشرة (دون حفظ ملف وسيط) إن رغب المستخدم.
export async function printDocument(title, body) {
  try {
    const html = buildHtml(title || "مستند ميزان", body || "");
    await Print.printAsync({ html });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export { buildHtml };
