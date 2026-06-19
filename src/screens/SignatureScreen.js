import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Platform, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";
import { exportAsPdf } from "../lib/exporter";

// لوحة توقيع مبدئية: يرسم المستخدم توقيعه بإصبعه، فيُلتقط كمسارات SVG.
// لا يُحفظ شيء على الخادم؛ التوقيع للعرض والتصدير على الجهاز فقط.
export default function SignatureScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [paths, setPaths] = useState([]);   // مسارات مكتملة
  const [current, setCurrent] = useState(""); // المسار الجاري
  const currentRef = useRef("");

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentRef.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setCurrent(currentRef.current);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentRef.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setCurrent(currentRef.current);
      },
      onPanResponderRelease: () => {
        const done = currentRef.current;
        if (done) setPaths((prev) => [...prev, done]);
        currentRef.current = "";
        setCurrent("");
      },
    })
  ).current;

  const clear = () => { setPaths([]); setCurrent(""); currentRef.current = ""; };

  const hasSignature = paths.length > 0 || current.length > 0;

  // تصدير مستند يحوي التوقيع المرسوم كصورة SVG مضمّنة
  const exportSigned = async () => {
    if (!hasSignature) { Alert.alert(t("alert_note", lang), t("sig_err", lang)); return; }
    const all = [...paths, current].filter(Boolean);
    const svgPaths = all.map((d) => `<path d="${d}" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150" style="border:1px solid #ccc;background:#fff;">${svgPaths}</svg>`;
    // نمرر التوقيع داخل نص يُصدّر؛ المُصدِّر يحوّل النص لمستند، والتوقيع يظهر كرسم
    const body = `إقرار بالتوقيع المبدئي\n\nأقرّ بصحة ما ورد في هذا المستند، وقد وقّعت عليه إلكترونياً أدناه.\n\nالتوقيع:\n${svg}`;
    const res = await exportAsPdf("مستند موقّع مبدئياً", body);
    if (!res.ok) Alert.alert(t("export_fail_title", lang), t("export_fail_short", lang));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("sec_signature", lang)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.hint}>{t("sig_hint", lang)}</Text>

        <View style={styles.pad} {...panResponder.panHandlers}>
          <Svg width="100%" height="100%">
            {paths.map((d, i) => (
              <Path key={i} d={d} stroke={colors.onyx} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {current ? <Path d={current} stroke={colors.onyx} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          </Svg>
          {!hasSignature && <Text style={styles.padPlaceholder}>{t("sign_here", lang)}</Text>}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.clearBtn} activeOpacity={0.9} onPress={clear}>
            <FontAwesome5 name="eraser" size={14} color={colors.royal} />
            <Text style={styles.clearText}>{t("sig_clear", lang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} activeOpacity={0.9} onPress={exportSigned}>
            <FontAwesome5 name="file-download" size={14} color={colors.white} />
            <Text style={styles.exportText}>{t("sig_export", lang)}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    body: { flex: 1, padding: 18 },
    hint: { fontFamily: "Tajawal_500Medium", fontSize: scaled(13, fontScale), color: colors.textDim, textAlign: dir.textAlign, lineHeight: scaled(22, fontScale), marginBottom: 18 },
    pad: { height: 240, backgroundColor: colors.surface, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: colors.glassBorder, overflow: "hidden", alignItems: "center", justifyContent: "center" },
    padPlaceholder: { position: "absolute", fontFamily: "Tajawal_500Medium", fontSize: scaled(15, fontScale), color: colors.textMuted },
    actions: { flexDirection: dir.row, marginTop: 18, gap: 12 },
    clearBtn: { flexDirection: dir.row, alignItems: "center", justifyContent: "center", backgroundColor: colors.royalSoft, borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 22, borderWidth: 1, borderColor: colors.glassBorder },
    clearText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13.5, fontScale), color: colors.royal, marginRight: 8 },
    exportBtn: { flex: 1, flexDirection: dir.row, alignItems: "center", justifyContent: "center", backgroundColor: colors.royal, borderRadius: RADIUS.md, paddingVertical: 14 },
    exportText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(13.5, fontScale), color: colors.white, marginRight: 9 },
  });
}
