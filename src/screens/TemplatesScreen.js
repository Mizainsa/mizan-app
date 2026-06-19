import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { TEMPLATES } from "../lib/templates";
import { exportAsPdf } from "../lib/exporter";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

export default function TemplatesScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [activeId, setActiveId] = useState(null);
  const [values, setValues] = useState({});
  const [preview, setPreview] = useState("");

  const active = TEMPLATES.find((t) => t.id === activeId) || null;

  const open = (t) => { setActiveId(t.id); setValues({}); setPreview(""); };
  const back = () => { setActiveId(null); setValues({}); setPreview(""); };
  const setField = (k, val) => setValues((p) => ({ ...p, [k]: val }));

  const generate = () => { if (active) setPreview(active.build(values)); };

  const exportDoc = async () => {
    if (!preview) return;
    const res = await exportAsPdf(active.title, preview);
    if (!res.ok) Alert.alert(t("export_fail_title", lang), t("export_fail_short", lang));
  };

  if (!active) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("sec_templates", lang)}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.hint}>{en ? "Choose a template, fill it with taps, then export it as a ready document." : "اختر نموذجاً، املأ بياناته بنقرات، ثم صدّره مستنداً جاهزاً."}</Text>
          {TEMPLATES.map((t) => (
            <TouchableOpacity key={t.id} style={styles.tplCard} activeOpacity={0.9} onPress={() => open(t)}>
              <FontAwesome5 name="chevron-left" size={12} color={colors.textMuted} />
              <Text style={styles.tplTitle}>{t.title}</Text>
              <View style={styles.tplIcon}><FontAwesome5 name={t.icon} size={16} color={colors.platinum} /></View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={back} style={styles.backButton}>
            <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{active.title}</Text>
          <View style={styles.headerIcon}><FontAwesome5 name={active.icon} size={15} color={colors.platinum} /></View>
        </View>
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {active.fields.map((f) => (
            <View key={f.key} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={values[f.key] || ""}
                onChangeText={(t) => setField(f.key, t)}
                placeholder={f.label}
                placeholderTextColor={colors.textMuted}
                textAlign={dir.textAlign}
                multiline={f.key === "content" || f.key === "task" || f.key === "demand"}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.genBtn} activeOpacity={0.9} onPress={generate}>
            <FontAwesome5 name="file-alt" size={14} color={colors.white} />
            <Text style={styles.genBtnText}>{t("tpl_generate", lang)}</Text>
          </TouchableOpacity>

          {preview ? (
            <View style={styles.previewCard}>
              <Text style={styles.previewText}>{preview}</Text>
              <TouchableOpacity style={styles.exportBtn} activeOpacity={0.9} onPress={exportDoc}>
                <FontAwesome5 name="file-download" size={13} color={colors.white} />
                <Text style={styles.exportText}>{t("tpl_export", lang)}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    headerIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    list: { padding: 18 },
    hint: { fontFamily: "Tajawal_400Regular", fontSize: scaled(13, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginBottom: 18 },
    tplCard: {
      flexDirection: dir.row, alignItems: "center", justifyContent: "space-between",
      backgroundColor: colors.surface, padding: 16, borderRadius: RADIUS.md, marginBottom: 12,
      borderWidth: 1, borderColor: colors.glassBorder,
      shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
    },
    tplIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    tplTitle: { flex: 1, fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14.5, fontScale), color: colors.onyx, textAlign: dir.textAlign, marginHorizontal: 12 },
    form: { padding: 18 },
    fieldWrap: { marginBottom: 16, alignItems: dir.colStart },
    fieldLabel: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13, fontScale), color: colors.royal, marginBottom: 8, textAlign: dir.textAlign, width: "100%" },
    input: { width: "100%", minHeight: 50, backgroundColor: colors.surface, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontFamily: "Tajawal_500Medium", fontSize: scaled(14, fontScale), color: colors.onyx },
    genBtn: { flexDirection: dir.row, alignItems: "center", justifyContent: "center", backgroundColor: colors.royal, borderRadius: RADIUS.md, paddingVertical: 15, marginTop: 6 },
    genBtnText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14.5, fontScale), color: colors.white, marginRight: 9 },
    previewCard: { backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: 18, marginTop: 20, borderWidth: 1, borderColor: colors.glassBorder },
    previewText: { fontFamily: "Tajawal_500Medium", fontSize: scaled(13.5, fontScale), color: colors.textBody, textAlign: dir.textAlign, lineHeight: scaled(25, fontScale) },
    exportBtn: { flexDirection: dir.row, alignItems: "center", justifyContent: "center", backgroundColor: colors.green, borderRadius: RADIUS.md, paddingVertical: 13, marginTop: 18 },
    exportText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(13.5, fontScale), color: colors.white, marginRight: 9 },
  });
}
