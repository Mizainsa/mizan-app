import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { HUBS, EXPERTS_COUNT, COLORS, RADIUS } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

export default function HomeScreen({ navigation }) {
  const { theme: TH } = useTheme();
  const insets = useSafeAreaInsets();
  const hubs = Array.isArray(HUBS) ? HUBS : [];

  const openHub = (hub) => {
    try {
      if (hub.experts && hub.experts.length === 1) {
        navigation.navigate("Expert", { expert: hub.experts[0] });
      } else {
        navigation.navigate("Expert", { hub });
      }
    } catch (e) {}
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[TH.g1, TH.g2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}><FontAwesome5 name="balance-scale" size={20} color={TH.accentLite} /></View>
            <Text style={styles.brandName}>مِيزان</Text>
          </View>
          <TouchableOpacity style={styles.hbtn}><FontAwesome5 name="bell" size={16} color="#fff" /></TouchableOpacity>
        </View>
        <Text style={styles.headerTagline}>مرشدك الذكي — {EXPERTS_COUNT} مختصّاً في خدمتك</Text>
        <View style={styles.searchBox}>
          <FontAwesome5 name="search" size={14} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>ابحث عن خدمة أو سؤال...</Text>
        </View>
      </LinearGradient>
      <View style={styles.body}>
        <Text style={styles.sectionLabel}>المحاور</Text>
        <View style={styles.grid}>
          {hubs.map((hub) => (
            <TouchableOpacity key={hub.id} style={styles.hubCard} activeOpacity={0.85} onPress={() => openHub(hub)}>
              <View style={[styles.hubIcon, { backgroundColor: TH.light }]}>
                <FontAwesome5 name={hub.icon} size={22} color={TH.primary} />
              </View>
              <Text style={styles.hubTitle} numberOfLines={2}>{hub.title}</Text>
              <Text style={styles.hubCount}>{hub.experts.length} مختصّين</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandRow: { flexDirection: "row-reverse", alignItems: "center" },
  brandIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", marginLeft: 10 },
  brandName: { fontFamily: "Cairo_900Black", fontSize: 22, color: "#fff" },
  hbtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  headerTagline: { fontFamily: "Tajawal_500Medium", fontSize: 13, color: "rgba(255,255,255,0.8)", textAlign: "right", marginTop: 14 },
  searchBox: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, marginTop: 16 },
  searchPlaceholder: { fontFamily: "Tajawal_400Regular", fontSize: 13, color: COLORS.textMuted, marginRight: 10 },
  body: { padding: 20 },
  sectionLabel: { fontFamily: "Cairo_800ExtraBold", fontSize: 17, color: COLORS.onyx, textAlign: "right", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  hubCard: { width: "48.5%", backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 18, marginBottom: 13, alignItems: "flex-end", borderWidth: 1, borderColor: COLORS.border, height: 140, justifyContent: "space-between" },
  hubIcon: { width: 50, height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  hubTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 14.5, color: COLORS.onyx, textAlign: "right", width: "100%" },
  hubCount: { fontFamily: "Tajawal_500Medium", fontSize: 11.5, color: COLORS.textMuted, textAlign: "right", width: "100%" },
});
