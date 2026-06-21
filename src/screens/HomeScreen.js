import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { HUBS, TOOLS, EXPERTS_COUNT, COLORS, APP_SUB } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 44) / 2;

export default function HomeScreen({ navigation }) {
  const { theme: TH } = useTheme();
  const insets = useSafeAreaInsets();

  const openHub = (hub) => {
    try {
      if (navigation && typeof navigation.navigate === "function") {
        navigation.navigate("Section", { section: hub });
      }
    } catch (e) {
      // تجاهل أي خطأ في التنقّل بدل الانهيار
    }
  };

  const hubs = Array.isArray(HUBS) ? HUBS : [];
  const tools = Array.isArray(TOOLS) ? TOOLS : [];

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
      {/* الهيدر الثابت بتدرّج الثيم — يحترم حافة النوتش عبر insets */}
      <LinearGradient
        colors={[TH.g1, TH.g2, TH.g3, TH.g4]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <FontAwesome5 name="balance-scale" size={24} color={TH.accentLite} />
            </View>
            <Text style={styles.brandName}>
              مِيزَ<Text style={{ color: TH.accentLite }}>ان</Text>
            </Text>
          </View>
          <View style={styles.headActions}>
            <TouchableOpacity style={styles.hbtn} activeOpacity={0.8}>
              <FontAwesome5 name="bell" size={16} color="#fff" />
              <View style={[styles.badge, { backgroundColor: TH.accentLite, borderColor: TH.g1 }]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hbtn} activeOpacity={0.8}>
              <Text style={styles.langText}>En</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.brandSub} numberOfLines={1}>{APP_SUB}</Text>

        <View style={styles.search}>
          <FontAwesome5 name="search" size={15} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن خبير أو إجراء أو نظام..."
            placeholderTextColor={COLORS.textMuted}
            textAlign="right"
          />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.miniDot, { backgroundColor: TH.accent }]} />
          <Text style={styles.sectionTitleText}>المحاور الذكية</Text>
          <Text style={styles.sectionCount}>{"٨ محاور · " + EXPERTS_COUNT + " خبيراً"}</Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            <Text style={[styles.noteBold, { color: TH.primary }]}>إرشاد توعوي وإجرائي</Text>
            {" — كل محور يضم خبراء متخصصين بمنصات وجهات سعودية. ليس بديلاً عن محامٍ مرخص."}
          </Text>
        </View>

        <View style={styles.grid}>
          {(hubs || []).map((hub) => (
            <TouchableOpacity key={hub.id} style={styles.cardTouch} activeOpacity={0.9} onPress={() => openHub(hub)}>
              <View style={styles.cardInner}>
                <View style={[styles.iconContainer, { backgroundColor: TH.light }]}>
                  <FontAwesome5 name={hub.icon || "circle"} size={22} color={TH.primary} />
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{hub.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{hub.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.toolsLabelRow}>
          <View style={[styles.miniDot, { backgroundColor: TH.primary }]} />
          <Text style={styles.sectionTitleText}>المساعد التقديري</Text>
        </View>
        <View style={styles.grid}>
          {(tools || []).map((tool) => (
            <TouchableOpacity key={tool.id} style={styles.cardTouch} activeOpacity={0.9} onPress={() => openHub(tool)}>
              <View style={[styles.cardInner, styles.toolCard]}>
                <View style={[styles.iconContainer, { backgroundColor: TH.light }]}>
                  <FontAwesome5 name={tool.icon || "circle"} size={22} color={TH.primary} />
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{tool.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{tool.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 18, paddingBottom: 18,
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
    shadowColor: "#0F5132", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center" },
  logo: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center", marginLeft: 11,
  },
  brandName: { fontFamily: "Cairo_800ExtraBold", fontSize: 25, color: "#fff", letterSpacing: 0.4 },
  headActions: { flexDirection: "row", alignItems: "center" },
  hbtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center", marginLeft: 8,
  },
  langText: { fontFamily: "Cairo_700Bold", fontSize: 13, color: "#fff" },
  badge: { position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.5 },
  brandSub: { fontFamily: "Tajawal_500Medium", fontSize: 11.5, color: "rgba(255,255,255,0.85)", textAlign: "right", marginTop: 6 },
  search: {
    width: "90%", alignSelf: "center", marginTop: 15,
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 15,
    paddingHorizontal: 15, paddingVertical: Platform.OS === "ios" ? 14 : 4, gap: 11,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 12,
  },
  searchInput: { flex: 1, fontFamily: "Tajawal_500Medium", fontSize: 13.5, color: COLORS.onyx, textAlign: "right" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  sectionTitleText: { fontFamily: "Cairo_800ExtraBold", fontSize: 16, color: COLORS.onyx },
  miniDot: { width: 7, height: 7, borderRadius: 3.5, marginLeft: 9 },
  sectionCount: { fontFamily: "Tajawal_500Medium", fontSize: 11, color: COLORS.textMuted, marginRight: "auto" },
  note: { backgroundColor: COLORS.royalSoft, borderRadius: 14, padding: 13, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  noteText: { fontFamily: "Tajawal_400Regular", fontSize: 11.5, color: COLORS.textDim, textAlign: "right", lineHeight: 19 },
  noteBold: { fontFamily: "Tajawal_700Bold" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cardTouch: { width: CARD_WIDTH, marginBottom: 12 },
  cardInner: {
    backgroundColor: COLORS.surface, borderRadius: 22, padding: 16,
    height: 140, alignItems: "flex-end", justifyContent: "flex-start",
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: "#0F5132", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 4,
  },
  toolCard: { borderColor: COLORS.glassBorder },
  iconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  cardTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 13.5, color: COLORS.onyx, textAlign: "right", width: "100%" },
  cardDesc: { fontFamily: "Tajawal_500Medium", fontSize: 11, color: COLORS.textDim, textAlign: "right", width: "100%", marginTop: 3, lineHeight: 16 },
  toolsLabelRow: { flexDirection: "row", alignItems: "center", marginTop: 22, marginBottom: 14 },
});
