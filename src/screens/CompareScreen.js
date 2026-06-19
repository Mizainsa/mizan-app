import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { diffLines, diffStats } from "../lib/textDiff";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

export default function CompareScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [diff, setDiff] = useState(null);

  const compare = () => {
    const d = diffLines(oldText, newText);
    setDiff(d);
  };

  const stats = diff ? diffStats(diff) : null;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("sec_compare", lang)}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>{t("cmp_a_label", lang)}</Text>
          <TextInput style={styles.input} value={oldText} onChangeText={setOldText} placeholder={en ? "Paste the first text here..." : "الصق النص الأول هنا..."} placeholderTextColor={colors.textMuted} textAlign={dir.textAlign} multiline />

          <Text style={styles.label}>{t("cmp_b_label", lang)}</Text>
          <TextInput style={styles.input} value={newText} onChangeText={setNewText} placeholder={en ? "Paste the second text here..." : "الصق النص الثاني هنا..."} placeholderTextColor={colors.textMuted} textAlign={dir.textAlign} multiline />

          <TouchableOpacity style={styles.cmpBtn} activeOpacity={0.9} onPress={compare}>
            <FontAwesome5 name="exchange-alt" size={14} color={colors.white} />
            <Text style={styles.cmpBtnText}>{t("cmp_compare", lang)}</Text>
          </TouchableOpacity>

          {diff && (
            <View style={styles.resultWrap}>
              <View style={styles.statsRow}>
                <View style={[styles.statChip, { backgroundColor: "#DCFCE7" }]}>
                  <Text style={[styles.statText, { color: "#166534" }]}>{t("cmp_added", lang)}: {stats.added}</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: "#FEE2E2" }]}>
                  <Text style={[styles.statText, { color: "#991B1B" }]}>{t("cmp_removed", lang)}: {stats.removed}</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: colors.borderSoft }]}>
                  <Text style={[styles.statText, { color: colors.textDim }]}>{t("cmp_unchanged", lang)}: {stats.same}</Text>
                </View>
              </View>

              {diff.map((d, i) => (
                <View key={i} style={[
                  styles.diffLine,
                  d.type === "added" && styles.diffAdded,
                  d.type === "removed" && styles.diffRemoved,
                ]}>
                  <Text style={styles.diffSign}>{d.type === "added" ? "+" : d.type === "removed" ? "−" : ""}</Text>
                  <Text style={[
                    styles.diffText,
                    d.type === "added" && { color: "#166534" },
                    d.type === "removed" && { color: "#991B1B", textDecorationLine: "line-through" },
                  ]}>{d.text}</Text>
                </View>
              ))}
            </View>
          )}
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
    content: { padding: 18 },
    label: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13, fontScale), color: colors.royal, marginBottom: 8, textAlign: dir.textAlign },
    input: { minHeight: 110, backgroundColor: colors.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontFamily: "Tajawal_500Medium", fontSize: scaled(13.5, fontScale), color: colors.onyx, marginBottom: 16, textAlignVertical: "top" },
    cmpBtn: { flexDirection: dir.row, alignItems: "center", justifyContent: "center", backgroundColor: colors.royal, borderRadius: RADIUS.md, paddingVertical: 15, marginTop: 4 },
    cmpBtnText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14.5, fontScale), color: colors.white, marginRight: 9 },
    resultWrap: { marginTop: 22 },
    statsRow: { flexDirection: dir.row, gap: 8, marginBottom: 16 },
    statChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginLeft: 8 },
    statText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(11.5, fontScale) },
    diffLine: { flexDirection: dir.row, alignItems: "flex-start", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 5, backgroundColor: colors.surface },
    diffAdded: { backgroundColor: "#F0FDF4" },
    diffRemoved: { backgroundColor: "#FEF2F2" },
    diffSign: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14, fontScale), color: colors.textDim, width: 18, textAlign: "center" },
    diffText: { flex: 1, fontFamily: "Tajawal_500Medium", fontSize: scaled(13, fontScale), color: colors.textBody, textAlign: dir.textAlign, lineHeight: scaled(22, fontScale), marginRight: 6 },
  });
}
