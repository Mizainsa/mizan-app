import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../services/supabaseClient";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day} / ${m} / ${y}`;
  } catch (e) {
    return "";
  }
}

export default function LibraryScreen() {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_library")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("خطأ في جلب المكتبة:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.docCard} activeOpacity={0.9}>
      <View style={styles.docIcon}>
        <FontAwesome5 name="file-alt" size={18} color={colors.royal} />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.docDate}>{formatDate(item.created_at)}</Text>
      </View>
      <FontAwesome5 name={dir.isRTL ? "chevron-left" : "chevron-right"} size={12} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{t("lib_title", lang)}</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.royal} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={documents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <FontAwesome5 name="folder-open" size={38} color={colors.royal} />
              </View>
              <Text style={styles.emptyText}>{t("lib_empty", lang)}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, paddingTop: 24 },
    headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(22, fontScale), color: colors.onyx, textAlign: dir.textAlign, paddingHorizontal: 20, marginBottom: 18 },
    listContent: { paddingHorizontal: 20, paddingBottom: 120 },
    docCard: {
      flexDirection: dir.row, alignItems: "center", backgroundColor: colors.surface, padding: 16, borderRadius: RADIUS.md, marginBottom: 12,
      borderWidth: 1, borderColor: colors.borderSoft,
      shadowColor: "#0A2342", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3,
    },
    docIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.royalSoft, alignItems: "center", justifyContent: "center" },
    docInfo: { flex: 1, marginRight: 16, alignItems: dir.colStart },
    docTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14, fontScale), color: colors.onyx, textAlign: dir.textAlign, width: "100%" },
    docDate: { fontFamily: "Tajawal_400Regular", fontSize: scaled(11, fontScale), color: colors.textDim, marginTop: 4 },
    emptyContainer: { alignItems: "center", marginTop: 90 },
    emptyIconCircle: { width: 90, height: 90, borderRadius: 30, backgroundColor: colors.royalSoft, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyText: { fontFamily: "Tajawal_500Medium", fontSize: scaled(14, fontScale), color: colors.textDim, textAlign: "center", paddingHorizontal: 40, lineHeight: scaled(23, fontScale) },
  });
}
