import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";
import { loadReminders, scheduleReminder, cancelReminder, scheduleWeeklySummary } from "../lib/notifications";

const KIND_OPTIONS = [
  { value: "renewal", label: "تجديد (رخصة/إقامة/عقد)" },
  { value: "hearing", label: "جلسة قضائية" },
  { value: "custom", label: "تذكير عام" },
];

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(iso) {
  try { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`; }
  catch (_e) { return ""; }
}

export default function RemindersScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);

  const [kind, setKind] = useState("renewal");
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => { refresh(); }, []);
  const refresh = async () => setList(await loadReminders());

  const add = async () => {
    if (!title.trim()) { Alert.alert(t("alert_note", lang), t("rem_err_text", lang)); return; }
    const d = Number(day), mo = Number(month), y = Number(year), h = Number(hour || 9), mi = Number(minute || 0);
    if (!d || !mo || !y) { Alert.alert(t("alert_note", lang), t("rem_err_date", lang)); return; }
    const date = new Date(y, mo - 1, d, h, mi, 0);
    const res = await scheduleReminder({ kind, title: title.trim(), date });
    if (res.ok) {
      setTitle(""); setDay(""); setMonth(""); setYear(""); setHour(""); setMinute("");
      await refresh();
      Alert.alert(t("alert_done", lang), t("rem_set_done", lang));
    } else {
      Alert.alert(t("alert_failed", lang), res.error || t("rem_set_fail", lang));
    }
  };

  const enableWeekly = async () => {
    const res = await scheduleWeeklySummary(7, 20);
    if (res.ok) { await refresh(); Alert.alert(t("alert_done", lang), t("rem_weekly_on", lang)); }
    else Alert.alert(t("alert_failed", lang), res.error || t("rem_weekly_fail", lang));
  };

  const remove = async (id) => { await cancelReminder(id); await refresh(); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("sec_reminders", lang)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>{t("rem_new", lang)}</Text>
        <View style={styles.card}>
          <View style={styles.kindRow}>
            {KIND_OPTIONS.map((o) => {
              const active = kind === o.value;
              return (
                <TouchableOpacity key={o.value} style={[styles.kindChip, active && styles.kindChipActive]} onPress={() => setKind(o.value)} activeOpacity={0.85}>
                  <Text style={[styles.kindText, active && styles.kindTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput style={styles.input} placeholder={t("rem_text_ph", lang)} placeholderTextColor={colors.textMuted} value={title} onChangeText={setTitle} textAlign={dir.textAlign} />

          <Text style={styles.fieldHint}>{t("rem_date_hint", lang)}</Text>
          <View style={styles.dateRow}>
            <TextInput style={styles.dateInput} placeholder={t("rem_day", lang)} placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={2} value={day} onChangeText={(t) => setDay(t.replace(/[^0-9]/g, ""))} textAlign="center" />
            <TextInput style={styles.dateInput} placeholder={t("rem_month", lang)} placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={2} value={month} onChangeText={(t) => setMonth(t.replace(/[^0-9]/g, ""))} textAlign="center" />
            <TextInput style={styles.dateInput} placeholder={t("rem_year", lang)} placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={4} value={year} onChangeText={(t) => setYear(t.replace(/[^0-9]/g, ""))} textAlign="center" />
          </View>

          <Text style={styles.fieldHint}>{t("rem_time_hint", lang)}</Text>
          <View style={styles.dateRow}>
            <TextInput style={styles.dateInput} placeholder={t("rem_hour", lang)} placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={2} value={hour} onChangeText={(t) => setHour(t.replace(/[^0-9]/g, ""))} textAlign="center" />
            <TextInput style={styles.dateInput} placeholder={t("rem_minute", lang)} placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={2} value={minute} onChangeText={(t) => setMinute(t.replace(/[^0-9]/g, ""))} textAlign="center" />
            <View style={{ flex: 1 }} />
          </View>

          <TouchableOpacity style={styles.addBtn} activeOpacity={0.9} onPress={add}>
            <FontAwesome5 name="bell" size={14} color={colors.white} />
            <Text style={styles.addBtnText}>{t("rem_set", lang)}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.weeklyBtn} activeOpacity={0.9} onPress={enableWeekly}>
          <FontAwesome5 name="calendar-week" size={14} color={colors.royal} />
          <Text style={styles.weeklyText}>{t("rem_weekly", lang)}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>{t("rem_mine", lang)}</Text>
        {list.length === 0 ? (
          <Text style={styles.empty}>{t("rem_none", lang)}</Text>
        ) : (
          list.map((r) => (
            <View key={r.id} style={styles.reminderCard}>
              <TouchableOpacity onPress={() => remove(r.id)} style={styles.delBtn} activeOpacity={0.8}>
                <FontAwesome5 name="trash-alt" size={13} color={colors.danger} />
              </TouchableOpacity>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>{r.title}</Text>
                <Text style={styles.reminderDate}>{r.weekly ? "أسبوعي - مساء كل سبت" : fmt(r.date)}</Text>
              </View>
              <View style={styles.reminderIcon}>
                <FontAwesome5 name={r.weekly ? "calendar-week" : r.kind === "hearing" ? "gavel" : "bell"} size={14} color={colors.platinum} />
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingTop: Platform.OS === "ios" ? 54 : 24, paddingHorizontal: 18, paddingBottom: 16,
      backgroundColor: colors.royal, borderBottomWidth: 1, borderColor: colors.glassBorder,
    },
    backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(18, fontScale), color: colors.white },
    content: { padding: 18 },
    sectionLabel: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginBottom: 10, marginRight: 4, marginTop: 6 },
    card: { backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: colors.glassBorder, marginBottom: 16 },
    kindRow: { flexDirection: dir.row, flexWrap: "wrap", gap: 8, marginBottom: 14 },
    kindChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: RADIUS.sm, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, marginLeft: 8, marginBottom: 8 },
    kindChipActive: { backgroundColor: colors.royal, borderColor: colors.royal },
    kindText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(11.5, fontScale), color: colors.textDim },
    kindTextActive: { color: colors.white },
    input: { height: 50, backgroundColor: colors.bg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, fontFamily: "Tajawal_500Medium", fontSize: scaled(14, fontScale), color: colors.onyx, marginBottom: 14 },
    fieldHint: { fontFamily: "Tajawal_500Medium", fontSize: scaled(11.5, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginBottom: 8 },
    dateRow: { flexDirection: dir.row, gap: 8, marginBottom: 14 },
    dateInput: { flex: 1, height: 48, backgroundColor: colors.bg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: colors.border, fontFamily: "Tajawal_700Bold", fontSize: scaled(14, fontScale), color: colors.onyx, marginLeft: 8 },
    addBtn: { flexDirection: dir.row, alignItems: "center", justifyContent: "center", backgroundColor: colors.royal, borderRadius: RADIUS.md, paddingVertical: 14, marginTop: 4 },
    addBtnText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14, fontScale), color: colors.white, marginRight: 9 },
    weeklyBtn: { flexDirection: dir.row, alignItems: "center", justifyContent: "center", backgroundColor: colors.royalSoft, borderRadius: RADIUS.md, paddingVertical: 13, borderWidth: 1, borderColor: colors.glassBorder, marginBottom: 20 },
    weeklyText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13.5, fontScale), color: colors.royal, marginRight: 9 },
    empty: { fontFamily: "Tajawal_500Medium", fontSize: scaled(13, fontScale), color: colors.textMuted, textAlign: "center", marginTop: 20 },
    reminderCard: {
      flexDirection: dir.row, alignItems: "center", backgroundColor: colors.surface,
      padding: 14, borderRadius: RADIUS.md, marginBottom: 11, borderWidth: 1, borderColor: colors.borderSoft,
    },
    reminderIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    reminderInfo: { flex: 1, marginHorizontal: 12, alignItems: dir.colStart },
    reminderTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(13.5, fontScale), color: colors.onyx, textAlign: dir.textAlign, width: "100%" },
    reminderDate: { fontFamily: "Tajawal_500Medium", fontSize: scaled(11, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginTop: 3, width: "100%" },
    delBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderSoft },
  });
}
