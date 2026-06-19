import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { SPECIALIZED_SECTIONS, RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

export default function SpecializedScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{t("sec_specialized", lang)}</Text>
            <Text style={styles.subtitle}>{en ? "An in-depth expert for each legal field" : "خبير متعمّق لكل مجال قانوني"}</Text>
          </View>
          <View style={styles.headerIcon}>
            <FontAwesome5 name="th-list" size={15} color={colors.platinum} />
          </View>
        </View>

        <View style={styles.grid}>
          {SPECIALIZED_SECTIONS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.cardTouch} activeOpacity={0.9} onPress={() => navigation.navigate("Section", { section: item })}>
              <View style={styles.cardInner}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name={item.icon} size={19} color={colors.platinum} />
                </View>
                <Text style={styles.cardTitle}>{en ? item.title_en : item.title}</Text>
                <Text style={styles.cardDesc}>{en ? item.sub_en : item.sub}</Text>
              </View>
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
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20 },
    cardTouch: { width: CARD_WIDTH, marginBottom: 14 },
    cardInner: {
      backgroundColor: colors.surface, borderRadius: RADIUS.xl, padding: 16, alignItems: dir.colStart, height: 150, justifyContent: "space-between",
      borderWidth: 1, borderColor: colors.glassBorder,
      shadowColor: "#000", shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.13, shadowRadius: 24, elevation: 9,
    },
    iconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
    cardTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14.5, fontScale), color: colors.onyx, marginTop: 10, textAlign: dir.textAlign, width: "100%" },
    cardDesc: { fontFamily: "Tajawal_500Medium", fontSize: scaled(10.5, fontScale), color: colors.textDim, textAlign: dir.textAlign, marginTop: 3, width: "100%" },
  });
}
