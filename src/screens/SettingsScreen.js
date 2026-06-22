import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { THEMES, COLORS, RADIUS } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

export default function SettingsScreen() {
  const { theme: TH, themeId, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const themeList = Object.values(THEMES);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>حسابي</Text>
      <Text style={styles.sectionLabel}>المظهر</Text>
      <View style={styles.themeGrid}>
        {themeList.map((t) => (
          <TouchableOpacity key={t.id} style={[styles.themeChip, { borderColor: themeId === t.id ? t.primary : COLORS.border, borderWidth: themeId === t.id ? 2.5 : 1 }]} activeOpacity={0.85} onPress={() => setTheme(t.id)}>
            <View style={[styles.themeSwatch, { backgroundColor: t.primary }]}>
              <View style={[styles.themeAccent, { backgroundColor: t.accent }]} />
            </View>
            <Text style={styles.themeName}>{t.name}</Text>
            {themeId === t.id ? <FontAwesome5 name="check-circle" size={14} color={t.primary} solid /> : null}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionLabel}>الحساب</Text>
      <View style={styles.menuCard}>
        {[
          { icon: "user-edit", label: "تعديل البيانات" },
          { icon: "crown", label: "إدارة الاشتراك" },
          { icon: "bell", label: "الإشعارات" },
          { icon: "shield-alt", label: "الخصوصية والأمان" },
          { icon: "info-circle", label: "عن ميزان" },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuRow, i > 0 && styles.menuBorder]} activeOpacity={0.7}>
            <FontAwesome5 name="chevron-left" size={13} color={COLORS.textMuted} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <View style={[styles.menuIcon, { backgroundColor: TH.light }]}>
              <FontAwesome5 name={item.icon} size={15} color={TH.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
        <FontAwesome5 name="sign-out-alt" size={15} color={COLORS.danger} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontFamily: "Cairo_900Black", fontSize: 26, color: COLORS.onyx, textAlign: "right", marginBottom: 24 },
  sectionLabel: { fontFamily: "Cairo_800ExtraBold", fontSize: 15, color: COLORS.textDim, textAlign: "right", marginBottom: 14, marginTop: 8 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 },
  themeChip: { width: "48.5%", flexDirection: "row-reverse", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 12, marginBottom: 12 },
  themeSwatch: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", marginLeft: 10 },
  themeAccent: { width: 14, height: 14, borderRadius: 5 },
  themeName: { fontFamily: "Cairo_700Bold", fontSize: 13.5, color: COLORS.onyx, flex: 1, textAlign: "right" },
  menuCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20, overflow: "hidden" },
  menuRow: { flexDirection: "row-reverse", alignItems: "center", paddingVertical: 15, paddingHorizontal: 16 },
  menuBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  menuLabel: { fontFamily: "Tajawal_700Bold", fontSize: 14, color: COLORS.textBody, flex: 1, textAlign: "right", marginRight: 12 },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoutBtn: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", backgroundColor: "#FEF2F2", borderRadius: RADIUS.md, paddingVertical: 15, borderWidth: 1, borderColor: "#FECACA" },
  logoutText: { fontFamily: "Cairo_800ExtraBold", fontSize: 14.5, color: COLORS.danger },
});
