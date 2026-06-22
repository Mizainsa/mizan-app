import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, RADIUS } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

export default function ExpertScreen({ route, navigation }) {
  const { theme: TH } = useTheme();
  const insets = useSafeAreaInsets();
  const params = (route && route.params) ? route.params : {};
  const hub = params.hub || null;
  const expert = params.expert || null;

  if (hub && hub.experts && hub.experts.length > 1) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={[styles.header, { backgroundColor: TH.primary, paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <FontAwesome5 name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{hub.title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <Text style={styles.pickLabel}>اختر المختصّ المناسب:</Text>
          {hub.experts.map((ex) => (
            <TouchableOpacity key={ex.id} style={styles.expertRow} activeOpacity={0.85} onPress={() => navigation.navigate("Expert", { expert: ex })}>
              <FontAwesome5 name="chevron-left" size={14} color={COLORS.textMuted} />
              <View style={styles.expertInfo}><Text style={styles.expertName}>{ex.name}</Text></View>
              <View style={[styles.expertIcon, { backgroundColor: TH.light }]}>
                <FontAwesome5 name={ex.icon} size={18} color={TH.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  const activeExpert = expert || { name: "المساعد", icon: "balance-scale" };
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={[styles.header, { backgroundColor: TH.primary, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeExpert.name}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View style={[styles.welcomeCard, { borderColor: TH.border }]}>
          <View style={[styles.welcomeIcon, { backgroundColor: TH.light }]}>
            <FontAwesome5 name={activeExpert.icon} size={26} color={TH.primary} />
          </View>
          <Text style={styles.welcomeTitle}>{activeExpert.name}</Text>
          <Text style={styles.welcomeText}>اطرح سؤالك وسيرشدك المختصّ خطوة بخطوة بما يناسب حالتك.</Text>
        </View>
        <Text style={styles.disclaimer}>ميزان مساعد استرشادي للتوعية، والمعلومات قد تتغيّر، ويُنصح بالتحقّق من مختصّ قبل الإجراء.</Text>
      </ScrollView>
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 80 }]}>
        <View style={[styles.inputBox, { borderColor: TH.border }]}>
          <Text style={styles.inputPlaceholder}>اكتب سؤالك هنا...</Text>
        </View>
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: TH.primary }]}>
          <FontAwesome5 name="paper-plane" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 18, color: "#fff", textAlign: "center", flex: 1 },
  pickLabel: { fontFamily: "Cairo_700Bold", fontSize: 14, color: COLORS.textDim, textAlign: "right", marginBottom: 14 },
  expertRow: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  expertInfo: { flex: 1, marginRight: 12 },
  expertName: { fontFamily: "Cairo_700Bold", fontSize: 14.5, color: COLORS.onyx, textAlign: "right" },
  expertIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  welcomeCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 24, alignItems: "center", borderWidth: 1, marginBottom: 16 },
  welcomeIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  welcomeTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 18, color: COLORS.onyx, marginBottom: 8 },
  welcomeText: { fontFamily: "Tajawal_500Medium", fontSize: 13.5, color: COLORS.textDim, textAlign: "center", lineHeight: 22 },
  disclaimer: { fontFamily: "Tajawal_400Regular", fontSize: 11, color: COLORS.textMuted, textAlign: "center", lineHeight: 18 },
  inputBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, backgroundColor: COLORS.bg },
  inputBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, marginLeft: 10 },
  inputPlaceholder: { fontFamily: "Tajawal_400Regular", fontSize: 13, color: COLORS.textMuted, textAlign: "right" },
  sendBtn: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
