import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { SECTIONS, RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";
import { searchSite } from "../lib/searchIndex";

// أيقونة نتيجة البحث حسب نوع الوجهة
const SEARCH_ICON = { section: "comments", screen: "th-large", platform: "landmark", doc: "file-alt", specialized: "th-list", calculator: "calculator", term: "book" };


// تطبيع عربي بسيط: إزالة التشكيل وتوحيد الألف والهاء/التاء المربوطة والياء

export default function SearchScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchSite(q);
  }, [query]);

  const go = (r) => {
    if (r.route === "Section") {
      const sec = SECTIONS.find((s) => s.id === r.id);
      if (sec) navigation.navigate("Section", { section: sec });
    } else {
      navigation.navigate(r.route);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("search_unified", lang)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBox}>
        <FontAwesome5 name="search" size={15} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_full_ph", lang)}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          textAlign={dir.textAlign}
          autoFocus
        />
      </View>

      <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {query.trim() === "" ? (
          <View style={styles.hintBox}>
            <FontAwesome5 name="search-location" size={34} color={colors.royal} />
            <Text style={styles.hintText}>{t("search_hint_full", lang)}</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.hintBox}>
            <FontAwesome5 name="info-circle" size={30} color={colors.textMuted} />
            <Text style={styles.hintText}>{t("no_results_try", lang)}</Text>
          </View>
        ) : (
          results.map((r) => (
            <TouchableOpacity key={r.id} style={styles.resultCard} activeOpacity={0.9} onPress={() => go(r)}>
              <View style={styles.resultIcon}>
                <FontAwesome5 name={SEARCH_ICON[r.type] || "search"} size={16} color={colors.platinum} />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{en ? r.titleEn : r.titleAr}</Text>
              </View>
            </TouchableOpacity>
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
    searchBox: {
      flexDirection: dir.row, alignItems: "center", margin: 18, paddingHorizontal: 16, height: 52,
      backgroundColor: colors.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.glassBorder,
      shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
    },
    searchInput: { flex: 1, fontFamily: "Tajawal_500Medium", fontSize: scaled(14.5, fontScale), color: colors.onyx, marginRight: 12 },
    results: { paddingHorizontal: 18 },
    hintBox: { alignItems: "center", marginTop: 70, paddingHorizontal: 30 },
    hintText: { fontFamily: "Tajawal_500Medium", fontSize: scaled(14, fontScale), color: colors.textDim, textAlign: "center", lineHeight: scaled(24, fontScale), marginTop: 18 },
    resultCard: {
      flexDirection: dir.row, alignItems: "center", backgroundColor: colors.surface,
      padding: 14, borderRadius: RADIUS.md, marginBottom: 12,
      borderWidth: 1, borderColor: colors.borderSoft,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
    },
    resultIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    resultInfo: { flex: 1, marginHorizontal: 12, alignItems: dir.colStart },
    resultTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14, fontScale), color: colors.onyx, textAlign: dir.textAlign, width: "100%" },
    resultSub: { fontFamily: "Tajawal_500Medium", fontSize: scaled(11, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginTop: 2, width: "100%" },
    resultTag: { backgroundColor: colors.royalSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    resultTagText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(9.5, fontScale), color: colors.royal },
  });
}
