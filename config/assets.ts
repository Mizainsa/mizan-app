// config/assets.ts
// معمارية الأصول المرنة (Resilient Assets Pattern).
// لا يستورد أي ملفّ صورة ثابت عبر require — لأن require لملفّ غير موجود
// يكسر بناء Metro. بدلًا من ذلك: نخزّن مسارات الأصول كنصّ فقط، ويقرّر
// كل مكوّن بصريّ كيف يعرض البديل المتدرّج عند غياب الأصل.
//
// عند توفّر الأصول لاحقًا: نضيف خريطة require هنا (داخل try/catch)
// ونعيد بناء التطبيق — دون أي تغيير في المكوّنات.

import type { ImageSourcePropType } from 'react-native';

// هل يوجد أصل فعلي مسجّل لهذا المسار؟ حاليًّا لا أصول مسجّلة،
// فكل الطلبات تعود null ويعرض المكوّن البديل المتدرّج.
//
// مستقبلًا (عند جاهزية الصور) تُملأ هذه الخريطة هكذا:
//   const REGISTERED: Record<string, ImageSourcePropType> = {
//     'assets/pets/owl_3d.png': require('../assets/pets/owl_3d.png'),
//   };
const REGISTERED: Record<string, ImageSourcePropType> = {};

/**
 * يُرجع مصدر الصورة الفعلي إن كان الأصل مسجّلًا، وإلّا null.
 * المكوّنات تتعامل مع null بعرض بديل متدرّج (لا انهيار).
 */
export function resolveAsset(assetUrl: string | null | undefined): ImageSourcePropType | null {
  if (!assetUrl) return null;

  // أصل مُسجّل محليًّا (require) — حين تُضاف الصور لاحقًا.
  if (REGISTERED[assetUrl]) return REGISTERED[assetUrl];

  // رابط شبكي (http/https) — يُعرض مباشرة عبر {uri}.
  if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
    return { uri: assetUrl };
  }

  // لا أصل متاح — المكوّن سيعرض البديل المتدرّج.
  return null;
}

/**
 * هل يملك هذا الأصل مصدرًا فعليًّا للعرض؟
 * يستخدمه المكوّن ليقرّر: صورة حقيقية أم بديل متدرّج.
 */
export function hasAsset(assetUrl: string | null | undefined): boolean {
  return resolveAsset(assetUrl) !== null;
}

/**
 * لون بديل ثابت مشتقّ من اسم الأصل (ليبدو كل عنصر مميّزًا حتّى دون صورة).
 * يولّد لونًا من هوية التطبيق بناءً على نصّ الاسم.
 */
const PLACEHOLDER_PALETTE = [
  ['#FF9F1C', '#F57C00'],
  ['#FFB627', '#FF9F1C'],
  ['#FFCA3A', '#FFB627'],
  ['#FF7B00', '#F57C00'],
  ['#FFD56B', '#FFCA3A'],
];

export function placeholderColors(seed: string | null | undefined): [string, string] {
  const s = seed ?? '';
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const pair = PLACEHOLDER_PALETTE[hash % PLACEHOLDER_PALETTE.length];
  return [pair[0], pair[1]];
}

/**
 * تسمية مختصرة للبديل (أوّل كلمة من اسم الأصل، أو نصّ افتراضي).
 */
export function placeholderLabel(assetUrl: string | null | undefined): string {
  if (!assetUrl) return '◆';
  const file = assetUrl.split('/').pop() ?? '';
  const name = file.replace(/\.[^.]+$/, '').replace(/_3d$/, '').replace(/_/g, ' ');
  return name || '◆';
}
