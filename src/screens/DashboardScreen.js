import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { getStats, lastSixMonths } from "../lib/localStats";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

const MONTH_LABELS = ["", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export default function DashboardScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [stats, setStats] = useState({ questions: 0, documents: 0 });
  const [series, setSeries] = useState([]);

  useEffect(() => {
    (async () => {
      setStats(await getStats());
      setSeries(await lastSixMonths());
    })();
  }, []);

  const maxVal = Math.max(1, ...series.map((s) => s.questions));
  const chartW = 320, chartH = 160, padB = 28, padL = 8;
  const barGap = 12;
  const barW = series.length ? (chartW - padL * 2 - barGap * (series.length - 1)) / series.length : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("dash_title", lang)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>{en ? "A summary of your Mizan activity, computed on your device only and never sent anywhere." : "ملخّص نشاطك في ميزان، محسوب على جهازك فقط ولا يُرسل لأي جهة."}</Text>

        <View style={styles.cardsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}><FontAwesome5 name="comments" size={18} color={colors.platinum} /></View>
            <Text style={styles.statNum}>{stats.questions}</Text>
            <Text style={styles.statLabel}>{t("dash_consultations", lang)}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}><FontAwesome5 name="file-alt" size={18} color={colors.platinum} /></View>
            <Text style={styles.statNum}>{stats.documents}</Text>
            <Text style={styles.statLabel}>{t("dash_documents", lang)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t("dash_last_six", lang)}</Text>
        <View style={styles.chartCard}>
          <Svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
            {series.map((s, i) => {
              const h = ((chartH - padB) * s.questions) / maxVal;
              const x = padL + i * (barW + barGap);
              const y = chartH - padB - h;
              const mNum = parseInt(s.month.split("-")[1], 10);
              return (
                <React.Fragment key={s.month}>
                  <Rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={5} fill={colors.royal} />
                  <SvgText x={x + barW / 2} y={y - 5} fontSize="11" fill={colors.textDim} textAnchor="middle">{s.questions}</SvgText>
                  <SvgText x={x + barW / 2} y={chartH - 9} fontSize="10" fill={colors.textMuted} textAnchor="middle">{MONTH_LABELS[mNum] || ""}</SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>

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
    hint: { fontFamily: "Tajawal_400Regular", fontSize: scaled(12.5, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginBottom: 18, lineHeight: scaled(21, fontScale) },
    cardsRow: { flexDirection: dir.row, gap: 12, marginBottom: 24 },
    statCard: {
      flex: 1, backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: 18, alignItems: "center",
      borderWidth: 1, borderColor: colors.glassBorder,
      shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    statIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", marginBottom: 12, borderWidth: 1, borderColor: colors.glassBorder },
    statNum: { fontFamily: "Cairo_900Black", fontSize: scaled(26, fontScale), color: colors.onyx },
    statLabel: { fontFamily: "Tajawal_500Medium", fontSize: scaled(12, fontScale), color: colors.textDim, marginTop: 4 },
    sectionLabel: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginBottom: 12, marginRight: 4 },
    chartCard: { backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: colors.glassBorder },
  });
}
