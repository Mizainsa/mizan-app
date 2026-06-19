import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DOCUMENT_GENERATORS, RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

export default function DocumentsScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const styles = makeStyles(colors, fontScale, dir);
  const en = lang === "en";
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{t("sec_documents", lang)}</Text>
            <Text style={styles.subtitle}>{en ? "Ready advanced document drafting" : "صياغة مستندات متقدمة جاهزة"}</Text>
          </View>
          <View style={styles.headerIcon}>
            <FontAwesome5 name="file-alt" size={15} color={colors.platinum} />
          </View>
        </View>

        <View style={styles.list}>
          {DOCUMENT_GENERATORS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.docCard} activeOpacity={0.9} onPress={() => navigation.navigate("Section", { section: item })}>
              <View style={styles.docIcon}>
                <FontAwesome5 name={item.icon} size={17} color={colors.platinum} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>{en ? item.title_en : item.title}</Text>
                <Text style={styles.docDesc}>{en ? item.sub_en : item.sub}</Text>
              </View>
              <FontAwesome5 name={dir.isRTL ? "chevron-left" : "chevron-right"} size={12} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { paddingBottom: 24 },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingTop: Platform.OS === "ios" ? 54 : 24, paddingHorizontal: 18, paddingBottom: 18,
      backgroundColor: colors.royal, borderBottomWidth: 1, borderColor: colors.glassBorder,
    },
    backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    titleWrap: { alignItems: "center" },
    title: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(18, fontScale), color: colors.white },
    subtitle: { fontFamily: "Tajawal_500Medium", fontSize: scaled(11.5, fontScale), color: "rgba(255,255,255,0.7)", marginTop: 2 },
    headerIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    list: { paddingHorizontal: 20, paddingTop: 20 },
    docCard: {
      flexDirection: dir.row, alignItems: "center", backgroundColor: colors.surface,
      padding: 16, borderRadius: RADIUS.lg, marginBottom: 12,
      borderWidth: 1, borderColor: colors.glassBorder,
      shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    docIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    docInfo: { flex: 1, marginHorizontal: 14, alignItems: dir.colStart },
    docTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14.5, fontScale), color: colors.onyx, textAlign: dir.textAlign, width: "100%" },
    docDesc: { fontFamily: "Tajawal_500Medium", fontSize: scaled(11, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginTop: 3, width: "100%" },
  });
}
