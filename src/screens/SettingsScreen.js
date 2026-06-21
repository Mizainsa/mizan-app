import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../services/supabaseClient";
import { COLORS, RADIUS, THEMES } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

export default function SettingsScreen() {
  const [email, setEmail] = useState("");
  const { themeId, theme: TH, setTheme } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await supabase.auth.getUser();
        const user = res && res.data ? res.data.user : null;
        if (mounted && user && user.email) setEmail(user.email);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("خطأ", "حدث خطأ أثناء تسجيل الخروج.");
      } else {
        setEmail("");
        Alert.alert("تم", "تم تسجيل خروجك بنجاح.");
      }
    } catch (e) {
      Alert.alert("خطأ", "تعذّر تسجيل الخروج.");
    }
  };

  const themeList = THEMES ? Object.keys(THEMES).map((k) => THEMES[k]) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>إعدادات الحساب</Text>

      <View style={[styles.profileCard, { backgroundColor: TH.primary }]}>
        <View style={styles.avatarBox}>
          <FontAwesome5 name="user-circle" size={34} color={COLORS.white} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileLabel}>الحساب الحالي</Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {email ? email : "زائر (غير مسجّل الدخول)"}
          </Text>
        </View>
      </View>

      {/* مظهر التطبيق: مبدّل الثيمات الأربعة */}
      <View style={styles.sectionLabelRow}>
        <View style={[styles.miniDot, { backgroundColor: TH.accent }]} />
        <Text style={styles.sectionLabel}>مظهر التطبيق</Text>
      </View>
      <View style={styles.themeGrid}>
        {themeList.map((t) => {
          const selected = t.id === themeId;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.themeCard, selected && { borderColor: t.accent, borderWidth: 2 }]}
              activeOpacity={0.85}
              onPress={() => setTheme(t.id)}
            >
              <View style={[styles.swatch, { backgroundColor: t.primary }]}>
                <View style={[styles.swatchDot, { backgroundColor: t.accent }]} />
              </View>
              <View style={styles.themeInfo}>
                <Text style={styles.themeName}>{t.name}</Text>
                <Text style={styles.themeSub}>{t.label}</Text>
              </View>
              {selected ? <FontAwesome5 name="check-circle" size={16} color={t.accent} solid /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sectionLabelRow}>
        <View style={[styles.miniDot, { backgroundColor: TH.primary }]} />
        <Text style={styles.sectionLabel}>الحساب</Text>
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>تعديل البيانات الشخصية</Text>
          <FontAwesome5 name="user" size={17} color={TH.primary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>إدارة الاشتراك المالي</Text>
          <FontAwesome5 name="credit-card" size={17} color={TH.primary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <Text style={[styles.menuText, { color: COLORS.danger }]}>تسجيل الخروج</Text>
          <FontAwesome5 name="sign-out-alt" size={17} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 22, color: COLORS.onyx, textAlign: "right", marginBottom: 22 },
  profileCard: {
    flexDirection: "row-reverse", alignItems: "center",
    borderRadius: RADIUS.lg, padding: 18, marginBottom: 20,
    shadowColor: "#0F5132", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 6,
  },
  avatarBox: { width: 60, height: 60, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1, marginRight: 16, alignItems: "flex-end" },
  profileLabel: { fontFamily: "Tajawal_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" },
  profileEmail: { fontFamily: "Cairo_800ExtraBold", fontSize: 15, color: COLORS.white, marginTop: 4, textAlign: "right", width: "100%" },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 4 },
  miniDot: { width: 7, height: 7, borderRadius: 3.5, marginLeft: 9 },
  sectionLabel: { fontFamily: "Cairo_800ExtraBold", fontSize: 15, color: COLORS.onyx },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  themeCard: {
    width: "48.5%", flexDirection: "row-reverse", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 13, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: "#0F5132", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  swatch: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", marginLeft: 11 },
  swatchDot: { width: 12, height: 12, borderRadius: 6 },
  themeInfo: { flex: 1, alignItems: "flex-end" },
  themeName: { fontFamily: "Cairo_800ExtraBold", fontSize: 13, color: COLORS.onyx },
  themeSub: { fontFamily: "Tajawal_400Regular", fontSize: 9.5, color: COLORS.textMuted, marginTop: 1 },
  menuContainer: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 8,
    borderWidth: 1, borderColor: COLORS.borderSoft,
    shadowColor: "#0F5132", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  menuItem: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", padding: 17 },
  menuText: { fontFamily: "Tajawal_700Bold", fontSize: 15, color: COLORS.textBody, marginLeft: 15, textAlign: "right" },
  divider: { height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 10 },
});
