import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, TextInput } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { SECTIONS, RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { getCachedSettings } from "../lib/usageLimits";
import { t } from "../lib/i18n";
import { searchSite } from "../lib/searchIndex";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

// أيقونة نتيجة البحث حسب نوع الوجهة
const SEARCH_ICON = {
  section: "comments", screen: "th-large", platform: "landmark",
  doc: "file-alt", specialized: "th-list", calculator: "calculator", term: "book",
};

export default function HomeScreen({ navigation }) {
  const { colors, fontScale, lang, setLang, dir } = useTheme();
  const styles = makeStyles(colors, fontScale, dir);
  const [settings, setSettings] = useState({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => { setSettings(await getCachedSettings()); })();
  }, []);

  // إخفاء قسم إن أوقفته لوحة الإدارة (المفتاح feature_<id>). الافتراضي مفعّل.
  const visibleSections = SECTIONS.filter((item) => {
    const flag = settings["feature_" + item.id];
    return flag !== false;
  });

  // بحث ذكي ثنائي اللغة: مساعد عام يفهم كل خدمات الموقع وأقسامه عبر فهرس مرادفات
  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchSite(q).filter((r) => {
      // احترام إخفاء الأقسام من لوحة الإدارة
      if (r.type === "section" || r.type === "screen") {
        const flag = settings["feature_" + r.id];
        if (flag === false) return false;
      }
      return true;
    });
  }, [query, settings]);

  const goToResult = (r) => {
    setQuery("");
    if (r.route === "Section") {
      const sec = SECTIONS.find((s) => s.id === r.id);
      if (sec) navigation.navigate("Section", { section: sec });
    } else {
      navigation.navigate(r.route);
    }
  };

  const goToSection = (item) => {
    setQuery("");
    if (item.id === "platforms") navigation.navigate("Platforms");
    else if (item.id === "calculators") navigation.navigate("Calculators");
    else if (item.id === "specialized") navigation.navigate("Specialized");
    else if (item.id === "documents") navigation.navigate("Documents");
    else if (item.id === "knowledge") navigation.navigate("Knowledge");
    else if (item.id === "reminders") navigation.navigate("Reminders");
    else if (item.id === "templates") navigation.navigate("Templates");
    else if (item.id === "compare") navigation.navigate("Compare");
    else if (item.id === "signature") navigation.navigate("Signature");
    else navigation.navigate("Section", { section: item });
  };

  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* الهيدر النظيف: شعار واسم في صف، الوصف تحته، وزر لغة دائري */}
        <View style={styles.premiumHeader}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandInline}>
              <View style={styles.logoWrapper}>
                <FontAwesome5 name="balance-scale" size={20} color={colors.platinum} />
              </View>
              <Text style={styles.brandName}>{lang === "en" ? "Mizan" : "مِيزَان"}</Text>
            </View>
            <TouchableOpacity style={styles.langToggle} activeOpacity={0.85} onPress={toggleLang}>
              <FontAwesome5 name="balance-scale" size={11} color={colors.platinum} />
              <Text style={styles.langToggleText}>{lang === "ar" ? "En" : "ع"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.brandSubText}>
            {lang === "en"
              ? "Your smart, secure legal advisor — around the clock."
              : "مستشارك القانوني الذكي والآمن على مدار الساعة لتوجيهك وصياغة قراراتك."}
          </Text>
        </View>

        {/* مربع البحث المستقل أسفل الهدر مباشرة */}
        <View style={styles.searchBox}>
          <FontAwesome5 name="search" size={15} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={lang === "en" ? "Search services, sections, documents..." : "ابحث عن خدمة أو قسم أو مستند..."}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* نتائج البحث المنسدلة في نفس الشاشة */}
        {query.trim() !== "" && (
          <View style={styles.searchDropdown}>
            {searchResults.length === 0 ? (
              <Text style={styles.searchEmpty}>{lang === "en" ? "No matching results." : "لا توجد نتائج مطابقة."}</Text>
            ) : (
              searchResults.map((r) => (
                <TouchableOpacity key={r.id} style={styles.searchResultRow} activeOpacity={0.8} onPress={() => goToResult(r)}>
                  <FontAwesome5 name={dir.isRTL ? "chevron-left" : "chevron-right"} size={11} color={colors.textMuted} />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle}>{lang === "en" ? r.titleEn : r.titleAr}</Text>
                  </View>
                  <View style={styles.searchResultIcon}>
                    <FontAwesome5 name={SEARCH_ICON[r.type] || "search"} size={14} color={colors.platinum} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={styles.sectionTitleRow}>
          <View style={styles.miniDot} />
          <Text style={styles.sectionTitleText}>{t("services", lang)}</Text>
        </View>

        {/* شبكة الأقسام */}
        <View style={styles.gridContainer}>
          {visibleSections.map((item) => {
            const iconName = item.id === "sayigh" ? "pen-fancy" : item.icon;
            const cardTitle = lang === "en" ? t("title_" + item.id, lang) : item.title;
            const cardSub = lang === "en" ? t("sub_" + item.id, lang) : item.sub;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.cardTouch}
                activeOpacity={0.9}
                onPress={() => goToSection(item)}
              >
                <View style={styles.cardInner}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5 name={iconName} size={20} color={colors.platinum} />
                  </View>
                  <Text style={styles.cardTitle}>{cardTitle}</Text>
                  <Text style={styles.cardDesc}>{cardSub}</Text>
                  <View style={styles.arrowHint}>
                    <FontAwesome5 name={dir.isRTL ? "chevron-left" : "chevron-right"} size={10} color={colors.platinum} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 64 : 40 },
    premiumHeader: { width: "100%", marginBottom: 18 },
    headerTopRow: { flexDirection: dir.row, alignItems: "center", justifyContent: "space-between", width: "100%" },
    brandInline: { flexDirection: dir.row, alignItems: "center", gap: 12 },
    langToggle: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 12, height: 38, borderRadius: 19, backgroundColor: colors.royal,
      borderWidth: 1, borderColor: colors.glassBorder,
    },
    langToggleText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(12.5, fontScale), color: colors.platinum },
    brandName: { fontFamily: "Cairo_900Black", fontSize: scaled(26, fontScale), color: colors.onyx, letterSpacing: 0.3 },
    brandSubText: { fontFamily: "Tajawal_500Medium", fontSize: scaled(12.5, fontScale), color: colors.textDim, textAlign: dir.textAlign, lineHeight: scaled(20, fontScale), marginTop: 12 },
    searchBox: {
      flexDirection: dir.row, alignItems: "center", gap: 10,
      backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, height: 48,
      borderWidth: 1, borderColor: colors.glassBorder, marginBottom: 16,
    },
    searchInput: { flex: 1, fontFamily: "Tajawal_500Medium", fontSize: scaled(13.5, fontScale), color: colors.onyx, textAlign: dir.textAlign, padding: 0 },
    searchDropdown: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.glassBorder, paddingVertical: 6, marginBottom: 16 },
    searchEmpty: { fontFamily: "Tajawal_500Medium", fontSize: scaled(12.5, fontScale), color: colors.textMuted, textAlign: "center", padding: 16 },
    searchResultRow: { flexDirection: dir.row, alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
    searchResultInfo: { flex: 1, marginHorizontal: 12, alignItems: dir.colStart },
    searchResultTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(13.5, fontScale), color: colors.onyx, textAlign: dir.textAlign },
    searchResultSub: { fontFamily: "Tajawal_500Medium", fontSize: scaled(10.5, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginTop: 2 },
    searchResultIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    logoWrapper: {
      width: 46, height: 46, borderRadius: 15, backgroundColor: colors.royal,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.glassBorder,
      shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 6,
    },
    sectionTitleRow: { flexDirection: dir.row, alignItems: "center", justifyContent: dir.rowStart, marginBottom: 18 },
    sectionTitleText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(17, fontScale), color: colors.onyx },
    miniDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.platinum, marginHorizontal: 9 },
    gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", width: "100%" },
    cardTouch: { width: CARD_WIDTH, marginBottom: 16 },
    cardInner: {
      backgroundColor: colors.surface, borderRadius: RADIUS.xl, padding: 18,
      alignItems: dir.colStart, height: 158, justifyContent: "space-between",
      borderWidth: 1, borderColor: colors.glassBorder,
      shadowColor: "#000", shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.13, shadowRadius: 24, elevation: 9,
    },
    iconContainer: {
      width: 48, height: 48, borderRadius: 16, backgroundColor: colors.royal,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.glassBorder,
    },
    cardTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(15, fontScale), color: colors.onyx, marginTop: 10, textAlign: dir.textAlign, width: "100%" },
    cardDesc: { fontFamily: "Tajawal_500Medium", fontSize: scaled(11, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginTop: 3, width: "100%" },
    arrowHint: { width: "100%", alignItems: dir.isRTL ? "flex-start" : "flex-end" },
  });
}
