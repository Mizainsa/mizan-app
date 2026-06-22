import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, RADIUS } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

const PLANS = [
  {
    id: "free", name: "المجانية", price: "0", period: "مجاناً", free: true,
    features: ["المرشد فقط", "تجربة محدودة", "تصفّح كل المحاور"],
  },
  {
    id: "basic", name: "الأساسية", price: "35", period: "شهرياً",
    features: ["كل المختصّين الـ25", "50 محادثة شهرياً", "البحث الموحّد"],
  },
  {
    id: "pro", name: "المتقدمة", price: "65", period: "شهرياً", featured: true,
    features: ["كل المختصّين الـ25", "100 محادثة شهرياً", "البحث الموحّد", "أولوية في الردود", "الحاسبات التقديرية", "الإشعارات والتنبيهات على المهل"],
  },
];

export default function SubscriptionScreen() {
  const { theme: TH } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBox}>
        <View style={[styles.crownCircle, { backgroundColor: TH.primary }]}>
          <FontAwesome5 name="crown" size={28} color={TH.accentLite} />
        </View>
        <Text style={styles.headerTitle}>اختر باقتك</Text>
        <Text style={styles.headerSub}>مزايا أوسع بمبالغ بسيطة</Text>
      </View>
      {PLANS.map((plan) => (
        <View key={plan.id} style={[styles.planCard, plan.featured && { borderColor: TH.accent, borderWidth: 2 }]}>
          {plan.featured ? <View style={[styles.badge, { backgroundColor: TH.accent }]}><Text style={styles.badgeText}>الأكثر اختياراً</Text></View> : null}
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: TH.primary }]}>{plan.price}</Text>
            <Text style={styles.currency}>{plan.free ? plan.period : "ريال / " + plan.period}</Text>
          </View>
          <View style={styles.featuresList}>
            {plan.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureText}>{f}</Text>
                <FontAwesome5 name="check-circle" size={14} color={TH.accent} solid style={{ marginLeft: 8 }} />
              </View>
            ))}
          </View>
          {plan.free ? (
            <View style={[styles.currentBox, { borderColor: TH.border }]}>
              <Text style={[styles.currentText, { color: TH.textDim }]}>تنطلق تلقائياً بعد التسجيل</Text>
            </View>
          ) : (
            <TouchableOpacity style={[styles.buyButton, { backgroundColor: plan.featured ? TH.primary : COLORS.surface, borderColor: TH.primary, borderWidth: plan.featured ? 0 : 1.5 }]} activeOpacity={0.85}>
              <Text style={[styles.buyText, { color: plan.featured ? "#fff" : TH.primary }]}>اشترك الآن</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <Text style={styles.note}>ميزان مساعد استرشادي للتوعية، والمعلومات قد تتغيّر، ويُنصح بالتحقّق من مختصّ قبل الإجراء.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerBox: { alignItems: "center", marginBottom: 26 },
  crownCircle: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 23, color: COLORS.onyx },
  headerSub: { fontFamily: "Tajawal_500Medium", fontSize: 13, color: COLORS.textDim, marginTop: 6, textAlign: "center" },
  planCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 22, marginBottom: 18, borderWidth: 1, borderColor: COLORS.border },
  badge: { alignSelf: "flex-end", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 10 },
  badgeText: { fontFamily: "Cairo_700Bold", fontSize: 11, color: "#fff" },
  planName: { fontFamily: "Cairo_800ExtraBold", fontSize: 18, color: COLORS.onyx, textAlign: "right" },
  priceRow: { flexDirection: "row-reverse", alignItems: "flex-end", marginTop: 8, marginBottom: 16 },
  price: { fontFamily: "Cairo_900Black", fontSize: 38 },
  currency: { fontFamily: "Tajawal_500Medium", fontSize: 13, color: COLORS.textDim, marginRight: 6, marginBottom: 8 },
  featuresList: { marginBottom: 20 },
  featureRow: { flexDirection: "row-reverse", alignItems: "center", marginBottom: 10 },
  featureText: { fontFamily: "Tajawal_500Medium", fontSize: 13.5, color: COLORS.textBody, textAlign: "right" },
  buyButton: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  buyText: { fontFamily: "Cairo_800ExtraBold", fontSize: 15 },
  currentBox: { height: 52, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  currentText: { fontFamily: "Cairo_700Bold", fontSize: 13 },
  note: { fontFamily: "Tajawal_400Regular", fontSize: 11, color: COLORS.textMuted, textAlign: "center", lineHeight: 18, marginTop: 6 },
});
