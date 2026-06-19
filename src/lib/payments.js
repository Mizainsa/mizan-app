// ===== الدفع داخل التطبيق عبر Google Play و Apple App Store =====
// يستخدم مكتبة react-native-iap للتعامل مع المتجرين.
// بعد نجاح الشراء، يُرسل الإيصال لخادم ميزان عبر recordPayment.

import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from "react-native-iap";
import { Platform } from "react-native";
import { recordPayment } from "./api";

// معرّفات منتجات الحصص في المتجرين (تُنشأ في Google Play Console و App Store Connect بنفس الأسماء)
// نظام حصص لا اشتراك زمني: حزمة طلبات تُشترى وتنتهي بالاستهلاك.
export const SUBSCRIPTION_SKUS = Platform.select({
  android: ["mizan_pro_quota", "mizan_advanced_quota"],
  ios: ["mizan_pro_quota", "mizan_advanced_quota"],
});

// ربط معرّف المنتج بالباقة والسعر الافتراضي (للتسجيل في الخادم)
// السعر المعروض في الواجهة يُقرأ من لوحة التحكم؛ هذا السعر للتسجيل فقط.
const SKU_INFO = {
  mizan_pro_quota: { plan_id: "pro", amount: 149 },
  mizan_advanced_quota: { plan_id: "advanced", amount: 249 },
};

let purchaseUpdateSub = null;
let purchaseErrorSub = null;

// تهيئة الاتصال بالمتجر
export async function initStore() {
  try {
    await initConnection();
    return true;
  } catch (e) {
    console.log("IAP init error", e);
    return false;
  }
}

// إنهاء الاتصال
export async function closeStore() {
  try {
    if (purchaseUpdateSub) purchaseUpdateSub.remove();
    if (purchaseErrorSub) purchaseErrorSub.remove();
    await endConnection();
  } catch (e) {}
}

// جلب باقات الاشتراك من المتجر
export async function fetchSubscriptions() {
  try {
    const subs = await getSubscriptions({ skus: SUBSCRIPTION_SKUS });
    return subs || [];
  } catch (e) {
    console.log("fetch subs error", e);
    return [];
  }
}

// إعداد مستمعي الشراء (يُستدعى مرة عند بدء التطبيق)
// deviceUuid: معرّف الجهاز لتسجيل الدفعة في الخادم
export function setupPurchaseListeners(deviceUuid, onSuccess, onError) {
  purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
    const receipt = purchase.transactionReceipt || purchase.purchaseToken;
    if (receipt) {
      try {
        // 1. نسجّل الدفعة في خادم ميزان (الإيصال الحقيقي)
        const sku = purchase.productId;
        const info = SKU_INFO[sku] || { plan_id: sku, amount: 0 };
        await recordPayment({
          platform: Platform.OS === "ios" ? "apple" : "google",
          amount: info.amount,
          currency: "SAR",
          plan_id: info.plan_id,
          device_uuid: deviceUuid,
          receipt_id: typeof receipt === "string" ? receipt.substring(0, 200) : "",
        });
        // 2. ننهي المعاملة مع المتجر (مهم جداً، وإلا تتكرر)
        await finishTransaction({ purchase, isConsumable: false });
        if (onSuccess) onSuccess(info.plan_id);
      } catch (e) {
        if (onError) onError(e);
      }
    }
  });

  purchaseErrorSub = purchaseErrorListener((error) => {
    if (onError) onError(error);
  });
}

// بدء عملية شراء اشتراك
export async function buySubscription(sku) {
  try {
    await requestSubscription({ sku });
    return true;
  } catch (e) {
    console.log("buy error", e);
    return false;
  }
}
