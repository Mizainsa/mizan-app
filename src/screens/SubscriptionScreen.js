import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { buySubscription } from "../lib/payments";
import { getCachedSettings, PLAN_DEFAULTS, getPlan } from "../lib/usageLimits";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

const { width } = Dimensions.get("window");

export default function SubscriptionScreen() {
  const { colors, fontScale , dir, lang } = useTheme();
  const styles = makeStyles(colors, fontScale, dir);
  const [buying, setBuying] = useState(false);
  const [proQuota, setProQuota] = useState(PLAN_DEFAULTS.pro.quota);
  const [advQuota, setAdvQuota] = useState(PLAN_DEFAULTS.advanced.quota);
  const [freeQuota, setFreeQuota] = useState(PLAN_DEFAULTS.free.quota);
  const [proPrice, setProPrice] = useState(PLAN_DEFAULTS.pro.price);
  const [advPrice, setAdvPrice] = useState(PLAN_DEFAULTS.advanced.price);
  const [currentPlan, setCurrentPlan] = useState("free");

  useEffect(() => {
    (async () => {
      // الحصص والأسعار تُقرأ من لوحة التحكم (Supabase) إن وُجدت، وإلا الافتراضي
      const s = await getCachedSettings();
      if (typeof s.free_quota === "number" && s.free_quota > 0) setFreeQuota(s.free_quota);
      if (typeof s.pro_quota === "number" && s.pro_quota > 0) setProQuota(s.pro_quota);
      if (typeof s.advanced_quota === "number" && s.advanced_quota > 0) setAdvQuota(s.advanced_quota);
      if (typeof s.pro_price === "number" && s.pro_price > 0) setProPrice(s.pro_price);
      if (typeof s.advanced_price === "number" && s.advanced_price > 0) setAdvPrice(s.advanced_price);
      setCurrentPlan(await getPlan());
    })();
  }, []);

  const subscribe = async (sku) => {
    if (buying) return;
    setBuying(true);
    await buySubscription(sku);
    setBuying(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerWrapper}>
          <View style={styles.crownCircle}>
            <FontAwesome5 name="crown" size={30} color={colors.white} />
          </View>
          <Text style={styles.mainTitle}>{t("subs_choose", lang)}</Text>
          <Text style={styles.subTitle}>{t("subs_sub_full", lang)}</Text>
        </View>

        {/* الباقة المجانية (بلا ذكر سعر) */}
        <View style={styles.freeCard}>
          <Text style={styles.badgeFree}>{t("start_free", lang)}</Text>
          <Text style={styles.freeTitle}>{t("plan_free", lang)}</Text>
          <Text style={styles.quotaBig}>{freeQuota} محادثات</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.freeFeatureText}>{t("free_feat_chats", lang)}</Text>
              <FontAwesome5 name="check" size={11} color={colors.textMuted} style={styles.checkIcon} />
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.freeFeatureText}>{t("free_feat_quota", lang)}</Text>
              <FontAwesome5 name="check" size={11} color={colors.textMuted} style={styles.checkIcon} />
            </View>
          </View>
          <View style={styles.currentPlanBox}>
            <Text style={styles.currentPlanText}>{currentPlan === "free" ? t("current_plan", lang) : t("plan_free", lang)}</Text>
          </View>
        </View>

        {/* الباقة الاحترافية */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>{t("plan_pro", lang)}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.planCurrency}>{t("riyal", lang)}</Text>
            <Text style={styles.planPriceNum}>{proPrice}</Text>
          </View>
          <Text style={styles.quotaMid}>{proQuota} طلب خدمة لكل الأقسام</Text>
          <View style={styles.divider} />
          <View style={styles.featuresList}>
            {[t("pro_feat_1", lang), t("pro_feat_2", lang), t("pro_feat_3", lang), t("pro_feat_4", lang)].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Text style={styles.planFeatureText}>{f}</Text>
                <View style={styles.checkWrapper}>
                  <FontAwesome5 name="check" size={9} color={colors.royal} />
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.basicButton} activeOpacity={0.9} onPress={() => subscribe("mizan_pro_quota")} disabled={buying}>
            {buying ? <ActivityIndicator color={colors.royal} /> : <Text style={styles.basicButtonText}>{t("sub_pro_btn", lang)}</Text>}
          </TouchableOpacity>
        </View>

        {/* الباقة المتقدمة (الأبرز) */}
        <View style={styles.premiumCard}>
          <View style={styles.premiumBadge}>
            <FontAwesome5 name="star" size={9} color={colors.white} solid style={{ marginLeft: 5 }} />
            <Text style={styles.premiumBadgeText}>{t("most_wanted", lang)}</Text>
          </View>
          <Text style={styles.premiumTitle}>{t("plan_advanced", lang)}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.premiumCurrency}>{t("riyal", lang)}</Text>
            <Text style={styles.premiumPriceNum}>{advPrice}</Text>
          </View>
          <Text style={styles.quotaMidLight}>{advQuota} طلب خدمة لكل المميزات</Text>
          <View style={styles.premiumDivider} />
          <View style={styles.featuresList}>
            {[t("adv_feat_1", lang), t("adv_feat_2", lang), t("adv_feat_3", lang), t("adv_feat_4", lang)].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Text style={styles.premiumFeatureText}>{f}</Text>
                <View style={styles.premiumCheckWrapper}>
                  <FontAwesome5 name="check" size={9} color={colors.white} />
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.premiumButton} activeOpacity={0.9} onPress={() => subscribe("mizan_advanced_quota")} disabled={buying}>
            {buying ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.premiumButtonText}>{t("sub_adv_btn", lang)}</Text>
                <FontAwesome5 name="bolt" size={13} color={colors.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.storeNote}>
          تتم معالجة الدفع بأمان عبر متجر التطبيقات. الباقات حصص تُستهلك بالطلبات، وتنتهي عند نفادها.
        </Text>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: 22, alignItems: "center", paddingTop: 28 },
  headerWrapper: { alignItems: "center", marginBottom: 28, width: "100%" },
  crownCircle: {
    width: 64, height: 64, borderRadius: 22, backgroundColor: colors.royal,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
    shadowColor: "#0A2342", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 6,
  },
  mainTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 23, color: colors.onyx, textAlign: "center" },
  subTitle: { fontFamily: "Tajawal_500Medium", fontSize: 13, color: colors.textDim, textAlign: "center", marginTop: 8, paddingHorizontal: 20, lineHeight: 20 },

  // مشترك
  priceRow: { flexDirection: dir.row, alignItems: dir.alignEnd, marginBottom: 8 },
  perMonth: { fontFamily: "Tajawal_400Regular", fontSize: 13, color: colors.textMuted, marginRight: 6, marginBottom: 5 },
  quotaBig: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(22, fontScale), color: colors.platinum, marginBottom: 14, textAlign: dir.textAlign, width: "100%" },
  quotaMid: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13.5, fontScale), color: colors.platinum, marginBottom: 14, textAlign: dir.textAlign, width: "100%" },
  quotaMidLight: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13.5, fontScale), color: colors.platinum, marginBottom: 14, textAlign: dir.textAlign, width: "100%" },
  featuresList: { width: "100%", marginBottom: 14 },
  featureItem: { flexDirection: "row", alignItems: "center", justifyContent: dir.rowStart, marginBottom: 13, width: "100%" },
  checkIcon: { marginTop: 1 },
  divider: { width: "100%", height: 1, backgroundColor: colors.border, marginBottom: 18 },

  // المجانية
  freeCard: { width: "100%", backgroundColor: colors.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: colors.borderSoft, padding: 22, marginBottom: 18, alignItems: dir.colStart },
  badgeFree: { fontFamily: "Tajawal_700Bold", fontSize: 11, color: colors.textDim, backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: "hidden", marginBottom: 12 },
  freeTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 17, color: colors.textBody, marginBottom: 12 },
  freeCurrency: { fontFamily: "Tajawal_700Bold", fontSize: 14, color: colors.textDim, marginRight: 4, marginBottom: 4 },
  freePriceNum: { fontFamily: "Cairo_800ExtraBold", fontSize: 34, color: colors.onyx, lineHeight: 38 },
  freeFeatureText: { fontFamily: "Tajawal_500Medium", fontSize: 13, color: colors.textDim, textAlign: dir.textAlign, marginRight: 10 },
  currentPlanBox: { width: "100%", height: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginTop: 6 },
  currentPlanText: { fontFamily: "Tajawal_700Bold", fontSize: 13.5, color: colors.textDim },

  // الأساسية
  planCard: { width: "100%", backgroundColor: colors.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: colors.border, padding: 22, marginBottom: 18, alignItems: dir.colStart, shadowColor: "#0A2342", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3 },
  planTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 19, color: colors.royal, marginBottom: 10 },
  planCurrency: { fontFamily: "Tajawal_700Bold", fontSize: 15, color: colors.royal, marginRight: 4, marginBottom: 5 },
  planPriceNum: { fontFamily: "Cairo_800ExtraBold", fontSize: 40, color: colors.onyx, lineHeight: 44 },
  planFeatureText: { fontFamily: "Tajawal_500Medium", fontSize: 13.5, color: colors.textBody, textAlign: dir.textAlign, marginRight: 11 },
  checkWrapper: { width: 19, height: 19, borderRadius: 6, backgroundColor: colors.royalSoft, alignItems: "center", justifyContent: "center", marginTop: 1 },
  basicButton: { width: "100%", height: 50, borderRadius: 15, backgroundColor: colors.royalSoft, alignItems: "center", justifyContent: "center", marginTop: 8 },
  basicButtonText: { fontFamily: "Cairo_800ExtraBold", fontSize: 14.5, color: colors.royal },

  // المتقدمة
  premiumCard: { width: "100%", backgroundColor: colors.royal, borderRadius: RADIUS.lg, padding: 22, alignItems: dir.colStart, shadowColor: "#0A2342", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 20, elevation: 10 },
  premiumBadge: { flexDirection: dir.row, alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 12 },
  premiumBadgeText: { fontFamily: "Cairo_700Bold", fontSize: 11, color: colors.white },
  premiumTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 21, color: colors.white, marginBottom: 10 },
  premiumCurrency: { fontFamily: "Tajawal_700Bold", fontSize: 15, color: "rgba(255,255,255,0.85)", marginRight: 4, marginBottom: 6 },
  premiumPriceNum: { fontFamily: "Cairo_800ExtraBold", fontSize: 44, color: colors.white, lineHeight: 48 },
  premiumPerMonth: { fontFamily: "Tajawal_500Medium", fontSize: 14, color: "rgba(255,255,255,0.7)", marginRight: 6, marginBottom: 6 },
  premiumDivider: { width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 18 },
  premiumFeatureText: { fontFamily: "Tajawal_700Bold", fontSize: 13.5, color: colors.white, textAlign: dir.textAlign, marginRight: 11, lineHeight: 20 },
  premiumCheckWrapper: { width: 19, height: 19, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginTop: 1 },
  premiumButton: { width: "100%", height: 52, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.15)", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  premiumButtonText: { fontFamily: "Cairo_800ExtraBold", fontSize: 14.5, color: colors.white },

  storeNote: { fontFamily: "Tajawal_400Regular", fontSize: 11.5, color: colors.textMuted, textAlign: "center", marginTop: 18, lineHeight: 19, paddingHorizontal: 10 },
  });
};
