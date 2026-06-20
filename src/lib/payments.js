// ===== الدفع داخل التطبيق عبر Google Play و Apple App Store =====
// يستخدم مكتبة expo-iap (البديل الرسمي المصمّم لـ Expo من react-native-iap).
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from "expo-iap";
import { Platform } from "react-native";
import { recordPayment } from "./api";

export const SUBSCRIPTION_SKUS = Platform.select({
  android: ["mizan_pro_quota", "mizan_advanced_quota"],
  ios: ["mizan_pro_quota", "mizan_advanced_quota"],
});

const SKU_INFO = {
  mizan_pro_quota: { plan_id: "pro", amount: 149 },
  mizan_advanced_quota: { plan_id: "advanced", amount: 249 },
};

let purchaseUpdateSub = null;
let purchaseErrorSub = null;

export async function initStore() {
  try {
    await initConnection();
    return true;
  } catch (e) {
    console.log("IAP init error", e);
    return false;
  }
}

export async function closeStore() {
  try {
    if (purchaseUpdateSub) purchaseUpdateSub.remove();
    if (purchaseErrorSub) purchaseErrorSub.remove();
    await endConnection();
  } catch (e) {}
}

export async function fetchSubscriptions() {
  try {
    const subs = await fetchProducts({ skus: SUBSCRIPTION_SKUS, type: "subs" });
    return subs || [];
  } catch (e) {
    console.log("fetch subs error", e);
    return [];
  }
}

export function setupPurchaseListeners(deviceUuid, onSuccess, onError) {
  purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
    const receipt =
      purchase.purchaseToken ||
      purchase.transactionId ||
      purchase.jwsRepresentationIos ||
      "";
    if (receipt) {
      try {
        const sku =
          purchase.productId ||
          (purchase.ids && purchase.ids[0]) ||
          "";
        const info = SKU_INFO[sku] || { plan_id: sku, amount: 0 };
        await recordPayment({
          platform: Platform.OS === "ios" ? "apple" : "google",
          amount: info.amount,
          currency: "SAR",
          plan_id: info.plan_id,
          device_uuid: deviceUuid,
          receipt_id: typeof receipt === "string" ? receipt.substring(0, 200) : "",
        });
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

export async function buySubscription(sku) {
  try {
    await requestPurchase({
      request: {
        ios: { sku },
        android: { skus: [sku] },
      },
      type: "subs",
    });
    return true;
  } catch (e) {
    console.log("buy error", e);
    return false;
  }
}
