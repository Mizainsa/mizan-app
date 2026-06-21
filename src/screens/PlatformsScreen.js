import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { PLATFORMS, COLORS, RADIUS, THEMES, DEFAULT_THEME } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

const PLAT_ICON = {
  najiz: "balance-scale", qiwa: "briefcase", ejar: "key", absher: "id-card",
  gosi: "shield-alt", etimad: "file-contract", balady: "store", moj: "landmark", zatca: "receipt",
};

export default function PlatformsScreen() {
  const themeCtx = useTheme();
  const TH = (themeCtx && themeCtx.theme) ? themeCtx.theme : THEMES[DEFAULT_THEME];
  const insets = useSafeAreaInsets();

  const openLink = (url) => {
    try { if (url) Linking.openURL(url); } catch (e) {}
  };

  const platforms = Array.isArray(PLATFORMS) ? PLATFORMS : [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: COLORS.bg }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>دليل المنصات الحكومية</Text>
      <Text style={styles.headerSub}>روابط مباشرة للمنصات الرسمية السعودية</Text>

      <View style={styles.grid}>
        {platforms.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => openLink(p.url)}
          >
            <View style={[styles.iconBox, { backgroundColor: TH.light }]}>
              <FontAwesome5 name={PLAT_ICON[p.id] || "building"} size={22} color={TH.primary} />
            </View>
            <Text style={styles.cardName} numberOfLines={2}>{p.name}</Text>
            <View style={styles.linkRow}>
              <Text style={[styles.linkText, { color: TH.primary }]}>فتح المنصة</Text>
              <FontAwesome5 name="external-link-alt" size={10} color={TH.primary} style={{ marginRight: 5 }} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.note}>
        هذه روابط رسمية للمنصات الحكومية. ميزان إرشاد توعوي إجرائي، وليس بديلاً عن محامٍ مرخص.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 22, color: COLORS.onyx, textAlign: "right", marginBottom: 6 },
  headerSub: { fontFamily: "Tajawal_500Medium", fontSize: 12.5, color: COLORS.textDim, textAlign: "right", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48.5%", backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 12,
    alignItems: "flex-end", borderWidth: 1, borderColor: COLORS.border,
    shadowColor: "#0F5132", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cardName: { fontFamily: "Cairo_800ExtraBold", fontSize: 14, color: COLORS.onyx, textAlign: "right", width: "100%" },
  linkRow: { flexDirection: "row-reverse", alignItems: "center", marginTop: 8 },
  linkText: { fontFamily: "Tajawal_700Bold", fontSize: 11.5 },
  note: { fontFamily: "Tajawal_400Regular", fontSize: 11, color: COLORS.textMuted, textAlign: "center", lineHeight: 18, marginTop: 14 },
});
