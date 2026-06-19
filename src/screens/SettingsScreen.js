import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../services/supabaseClient";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { isBiometricAvailable, isLockEnabled, setLockEnabled } from "../lib/biometric";
import { t } from "../lib/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FONT_OPTIONS = [
  { id: "font_small", value: 0.9 },
  { id: "font_normal", value: 1.0 },
  { id: "font_large", value: 1.25 },
  { id: "font_largest", value: 1.5 },
];

export default function SettingsScreen() {
  const { colors, isDark, fontScale, lang, toggleTheme, setFontScale, dir } = useTheme();
  const [email, setEmail] = useState("");
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const styles = makeStyles(colors, fontScale, dir);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) setEmail(user.email);
      setBioAvailable(await isBiometricAvailable());
      setBioEnabled(await isLockEnabled());
    })();
  }, []);

  const onToggleBio = async (val) => {
    const res = await setLockEnabled(val);
    if (res.ok) {
      setBioEnabled(val);
    } else {
      Alert.alert(t("biometric_lock", lang), res.error || t("biometric_fail", lang));
    }
  };

  const deleteAllData = () => {
    Alert.alert(
      t("delete_confirm_title", lang),
      t("delete_confirm_msg", lang),
      [
        { text: t("cancel", lang), style: "cancel" },
        {
          text: t("delete_all_btn", lang),
          style: "destructive",
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const mine = (keys || []).filter((k) => k && k.indexOf("mizan_") === 0);
              await AsyncStorage.multiRemove(mine);
              Alert.alert(t("alert_done", lang), t("delete_done", lang));
            } catch (_e) {
              Alert.alert(t("alert_failed", lang), t("delete_fail", lang));
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert(t("alert_error", lang), t("logout_err", lang));
    } else {
      setEmail("");
      Alert.alert(t("alert_done", lang), t("logout_done", lang));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>{t("settings", lang)}</Text>

      {/* بطاقة الملف التعريفي */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBox}>
          <FontAwesome5 name="user-circle" size={34} color={colors.white} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileLabel}>{t("account", lang)}</Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {email ? email : t("guest", lang)}
          </Text>
        </View>
      </View>

      {/* قسم المظهر: الوضع المظلم وحجم الخط */}
      <Text style={styles.sectionLabel}>{t("appearance", lang)}</Text>
      <View style={styles.menuContainer}>
        <View style={styles.menuItem}>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.platinum }}
            thumbColor={colors.white}
          />
          <View style={styles.menuLabelWrap}>
            <Text style={styles.menuText}>{t("dark_mode", lang)}</Text>
            <FontAwesome5 name={isDark ? "moon" : "sun"} size={16} color={colors.royal} style={styles.menuIcon} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.fontBlock}>
          <View style={styles.menuLabelWrap}>
            <View style={{ flex: 1 }} />
            <Text style={styles.menuText}>{t("font_size", lang)}</Text>
            <FontAwesome5 name="text-height" size={16} color={colors.royal} style={styles.menuIcon} />
          </View>
          <View style={styles.fontOptionsRow}>
            {FONT_OPTIONS.map((opt) => {
              const active = Math.abs(fontScale - opt.value) < 0.01;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.fontChip, active && styles.fontChipActive]}
                  activeOpacity={0.85}
                  onPress={() => setFontScale(opt.value)}
                >
                  <Text style={[styles.fontChipText, active && styles.fontChipTextActive]}>{t(opt.id, lang)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.menuItem}>
          <Switch
            value={bioEnabled}
            onValueChange={onToggleBio}
            disabled={!bioAvailable}
            trackColor={{ false: colors.border, true: colors.platinum }}
            thumbColor={colors.white}
          />
          <View style={styles.menuLabelWrap}>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>{t("biometric_lock", lang)}</Text>
              {!bioAvailable && <Text style={styles.menuSubText}>{lang==="en"?"Not available on this device":"غير متاح على هذا الجهاز"}</Text>}
            </View>
            <FontAwesome5 name="fingerprint" size={16} color={colors.royal} style={styles.menuIcon} />
          </View>
        </View>
      </View>

      {/* قسم إدارة البيانات */}
      <Text style={styles.sectionLabel}>{t("my_data", lang)}</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={deleteAllData}>
          <View style={{ width: 13 }} />
          <View style={styles.menuLabelWrap}>
            <Text style={[styles.menuText, { color: colors.danger }]}>{t("delete_all", lang)}</Text>
            <FontAwesome5 name="trash-alt" size={16} color={colors.danger} style={styles.menuIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* قسم الحساب */}
      <Text style={styles.sectionLabel}>{t("account", lang)}</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome5 name="chevron-left" size={13} color={colors.textMuted} />
          <View style={styles.menuLabelWrap}>
            <Text style={styles.menuText}>{t("edit_profile", lang)}</Text>
            <FontAwesome5 name="user" size={16} color={colors.royal} style={styles.menuIcon} />
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome5 name="chevron-left" size={13} color={colors.textMuted} />
          <View style={styles.menuLabelWrap}>
            <Text style={styles.menuText}>{t("manage_subscription", lang)}</Text>
            <FontAwesome5 name="credit-card" size={16} color={colors.royal} style={styles.menuIcon} />
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <View style={{ width: 13 }} />
          <View style={styles.menuLabelWrap}>
            <Text style={[styles.menuText, { color: colors.danger }]}>{t("sign_out", lang)}</Text>
            <FontAwesome5 name="sign-out-alt" size={16} color={colors.danger} style={styles.menuIcon} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scrollContent: { paddingTop: 24, paddingHorizontal: 20 },
    headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(22, fontScale), color: colors.onyx, textAlign: dir.textAlign, marginBottom: 22 },
    profileCard: {
      flexDirection: dir.row, alignItems: "center", backgroundColor: colors.royal,
      borderRadius: RADIUS.lg, padding: 18, marginBottom: 24,
      shadowColor: "#0A2342", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 6,
    },
    avatarBox: { width: 60, height: 60, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
    profileInfo: { flex: 1, marginRight: 16, alignItems: dir.colStart },
    profileLabel: { fontFamily: "Tajawal_400Regular", fontSize: scaled(12, fontScale), color: "rgba(255,255,255,0.7)" },
    profileEmail: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(15, fontScale), color: colors.white, marginTop: 4, textAlign: dir.textAlign, width: "100%" },
    sectionLabel: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginBottom: 10, marginRight: 4 },
    menuContainer: {
      backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: 8, marginBottom: 22,
      borderWidth: 1, borderColor: colors.borderSoft,
      shadowColor: "#0A2342", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
    },
    menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15 },
    menuLabelWrap: { flexDirection: dir.row, alignItems: "center", flex: 1 },
    menuText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(15, fontScale), color: colors.textBody, textAlign: dir.textAlign },
    menuSubText: { fontFamily: "Tajawal_400Regular", fontSize: scaled(11, fontScale), color: colors.textMuted, textAlign: dir.textAlign, marginTop: 2 },
    menuIcon: { marginLeft: 14, width: 22, textAlign: "center" },
    divider: { height: 1, backgroundColor: colors.borderSoft, marginHorizontal: 10 },
    fontBlock: { padding: 15 },
    fontOptionsRow: { flexDirection: dir.row, marginTop: 14, gap: 8 },
    fontChip: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: RADIUS.sm, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, marginLeft: 6 },
    fontChipActive: { backgroundColor: colors.royal, borderColor: colors.royal },
    fontChipText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(12.5, fontScale), color: colors.textDim },
    fontChipTextActive: { color: colors.white },
  });
}
