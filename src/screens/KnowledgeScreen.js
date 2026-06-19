import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { GLOSSARY, FAQ } from "../lib/knowledge";
import { SECTIONS, SPECIALIZED_SECTIONS, DOCUMENT_GENERATORS, RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

// إيجاد تعريف القسم من معرّفه عبر كل المجموعات
function findSection(id) {
  return (
    SECTIONS.find((s) => s.id === id) ||
    SPECIALIZED_SECTIONS.find((s) => s.id === id) ||
    DOCUMENT_GENERATORS.find((s) => s.id === id) ||
    null
  );
}

export default function KnowledgeScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [tab, setTab] = useState("faq");
  const [openTerm, setOpenTerm] = useState(null);

  const openFaq = (item) => {
    if (item.sectionId === "calculators") {
      navigation.navigate("Calculators");
      return;
    }
    const section = findSection(item.sectionId);
    if (section) navigation.navigate("Section", { section, seed: item.seed });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("sec_knowledge", lang)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabBtn, tab === "faq" && styles.tabBtnActive]} onPress={() => setTab("faq")}>
          <Text style={[styles.tabText, tab === "faq" && styles.tabTextActive]}>{t("faq", lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "glossary" && styles.tabBtnActive]} onPress={() => setTab("glossary")}>
          <Text style={[styles.tabText, tab === "glossary" && styles.tabTextActive]}>{t("glossary", lang)}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === "faq" ? (
          FAQ.map((item, i) => (
            <TouchableOpacity key={i} style={styles.faqCard} activeOpacity={0.9} onPress={() => openFaq(item)}>
              <FontAwesome5 name="chevron-left" size={12} color={colors.textMuted} />
              <Text style={styles.faqText}>{item.q}</Text>
              <View style={styles.faqIcon}>
                <FontAwesome5 name="question" size={13} color={colors.platinum} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          GLOSSARY.map((item, i) => {
            const open = openTerm === i;
            return (
              <TouchableOpacity key={i} style={styles.termCard} activeOpacity={0.9} onPress={() => setOpenTerm(open ? null : i)}>
                <View style={styles.termHeader}>
                  <FontAwesome5 name={open ? "minus" : "plus"} size={12} color={colors.royal} />
                  <Text style={styles.termTitle}>{item.term}</Text>
                </View>
                {open && <Text style={styles.termDef}>{item.def}</Text>}
              </TouchableOpacity>
            );
          })
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
    tabBar: { flexDirection: dir.row, margin: 18, height: 48, backgroundColor: colors.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border, padding: 4 },
    tabBtn: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 11 },
    tabBtnActive: { backgroundColor: colors.royal },
    tabText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13.5, fontScale), color: colors.textDim },
    tabTextActive: { fontFamily: "Cairo_800ExtraBold", color: colors.white },
    content: { paddingHorizontal: 18 },
    faqCard: {
      flexDirection: dir.row, alignItems: "center", justifyContent: "space-between",
      backgroundColor: colors.surface, padding: 15, borderRadius: RADIUS.md, marginBottom: 11,
      borderWidth: 1, borderColor: colors.borderSoft,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    faqIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center" },
    faqText: { flex: 1, fontFamily: "Tajawal_700Bold", fontSize: scaled(13.5, fontScale), color: colors.textBody, textAlign: dir.textAlign, marginHorizontal: 12 },
    termCard: {
      backgroundColor: colors.surface, padding: 16, borderRadius: RADIUS.md, marginBottom: 11,
      borderWidth: 1, borderColor: colors.borderSoft,
    },
    termHeader: { flexDirection: dir.row, alignItems: "center", justifyContent: "space-between" },
    termTitle: { flex: 1, fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14.5, fontScale), color: colors.onyx, textAlign: dir.textAlign, marginRight: 12 },
    termDef: { fontFamily: "Tajawal_500Medium", fontSize: scaled(13, fontScale), color: colors.textDim, textAlign: dir.textAlign, lineHeight: scaled(23, fontScale), marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  });
}
