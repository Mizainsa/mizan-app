import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";
import {
  endOfService, annualLeave, alimony, inheritance,
  latePenalty, courtFees, zakatVat,
} from "../lib/calculators";

const { width } = Dimensions.get("window");

// تعريف الحاسبات السبع: المفتاح، العنوان، الأيقونة، الحقول، ودالة الحساب
const CALCULATORS = [
  {
    id: "eos", title: "مكافأة نهاية الخدمة", icon: "money-bill-wave",
    fields: [
      { key: "lastWage", label: "آخر أجر شهري (ريال)", type: "number" },
      { key: "years", label: "عدد سنوات الخدمة", type: "number" },
      { key: "reason", label: "سبب انتهاء العلاقة", type: "select",
        options: [{ value: "end", label: "انتهاء العقد أو الفصل" }, { value: "resign", label: "استقالة" }] },
    ],
    run: (v) => endOfService(v),
    result: (r) => `المبلغ المستحق التقديري: ${r.total} ريال`,
  },
  {
    id: "leave", title: "الإجازة السنوية وبدلها", icon: "umbrella-beach",
    fields: [
      { key: "monthlyWage", label: "الأجر الشهري (ريال)", type: "number" },
      { key: "serviceYears", label: "عدد سنوات الخدمة", type: "number" },
      { key: "usedDays", label: "أيام الإجازة المستخدمة", type: "number" },
    ],
    run: (v) => annualLeave(v),
    result: (r) => `الرصيد المتبقي ${r.remaining} يوماً، وبدله ${r.cashValue} ريال`,
  },
  {
    id: "alimony", title: "النفقة التقديرية", icon: "hand-holding-usd",
    fields: [
      { key: "payerIncome", label: "دخل المُنفِق الشهري (ريال)", type: "number" },
      { key: "dependentsCount", label: "عدد المستحقين", type: "number" },
      { key: "housingIncluded", label: "هل تشمل السكن؟", type: "select",
        options: [{ value: "", label: "بدون سكن" }, { value: "yes", label: "تشمل السكن" }] },
    ],
    run: (v) => alimony({ ...v, housingIncluded: v.housingIncluded === "yes" }),
    result: (r) => `النفقة الشهرية التقديرية ${r.monthly} ريال`,
  },
  {
    id: "inherit", title: "قسمة الميراث المبسّطة", icon: "users",
    fields: [
      { key: "estate", label: "صافي التركة (ريال)", type: "number" },
      { key: "spouse", label: "الزوجية", type: "select",
        options: [{ value: "none", label: "لا يوجد" }, { value: "husband", label: "زوج" }, { value: "wife", label: "زوجة" }] },
      { key: "sons", label: "عدد الأبناء الذكور", type: "number" },
      { key: "daughters", label: "عدد البنات", type: "number" },
    ],
    run: (v) => inheritance(v),
    result: (r) => r.shares.map((s) => `${s.heir}: ${s.amount} ريال`).join("  \u2022  "),
  },
  {
    id: "penalty", title: "غرامة التأخير", icon: "exclamation-triangle",
    fields: [
      { key: "principal", label: "أصل المبلغ (ريال)", type: "number" },
      { key: "dailyRate", label: "النسبة اليومية (بالمئة)", type: "number" },
      { key: "daysLate", label: "عدد أيام التأخير", type: "number" },
      { key: "capPercent", label: "سقف الغرامة (بالمئة، اختياري)", type: "number" },
    ],
    run: (v) => latePenalty(v),
    result: (r) => `الغرامة ${r.penalty} ريال، والإجمالي ${r.total} ريال`,
  },
  {
    id: "fees", title: "الرسوم القضائية", icon: "gavel",
    fields: [
      { key: "claimValue", label: "قيمة المطالبة (ريال)", type: "number" },
    ],
    run: (v) => courtFees(v),
    result: (r) => `الرسم القضائي التقديري ${r.fee} ريال`,
  },
  {
    id: "zakat", title: "الزكاة والضريبة", icon: "calculator",
    fields: [
      { key: "zakatBase", label: "الوعاء الزكوي (ريال)", type: "number" },
      { key: "goldGramPrice", label: "سعر جرام الذهب (اختياري)", type: "number" },
      { key: "vatAmount", label: "قيمة سلعة أو خدمة للضريبة (اختياري)", type: "number" },
      { key: "vatRate", label: "نسبة الضريبة (بالمئة)", type: "number", default: "15" },
    ],
    run: (v) => zakatVat(v),
    result: (r) => `الزكاة ${r.zakat} ريال، والضريبة ${r.vat} ريال`,
  },
];

const DISCLAIMER = "هذه النتيجة استرشادية لأغراض التوعية، ولا تُغني عن مراجعة محامٍ مرخص أو الجهة المختصة، والتقدير النهائي يخضع للنظام والقضاء.";

export default function CalculatorsScreen({ navigation }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [activeId, setActiveId] = useState(null);
  const [values, setValues] = useState({});
  const [output, setOutput] = useState(null);

  const active = CALCULATORS.find((c) => c.id === activeId) || null;

  function openCalc(c) {
    const init = {};
    c.fields.forEach((f) => { if (f.default) init[f.key] = f.default; if (f.type === "select") init[f.key] = init[f.key] ?? f.options[0].value; });
    setValues(init);
    setOutput(null);
    setActiveId(c.id);
  }

  function backToList() {
    setActiveId(null);
    setValues({});
    setOutput(null);
  }

  function setField(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function compute() {
    if (!active) return;
    const parsed = {};
    active.fields.forEach((f) => {
      if (f.type === "number") parsed[f.key] = values[f.key] === "" || values[f.key] == null ? 0 : Number(values[f.key]);
      else parsed[f.key] = values[f.key];
    });
    const r = active.run(parsed);
    setOutput({ summary: active.result(r), detail: r.breakdown });
  }

  // قائمة الحاسبات
  if (!active) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t("sec_calculators", lang)}</Text>
            <View style={styles.miniDot} />
          </View>
          <Text style={styles.headerHint}>{en ? "Choose a calculator to enter your numbers and see the result instantly" : "اختر حاسبة لإدخال أرقامك ومعرفة النتيجة فوراً"}</Text>
          {CALCULATORS.map((c) => (
            <TouchableOpacity key={c.id} style={styles.calcCard} activeOpacity={0.9} onPress={() => openCalc(c)}>
              <View style={styles.calcIcon}>
                <FontAwesome5 name={c.icon} size={18} color={colors.platinum} />
              </View>
              <Text style={styles.calcCardTitle}>{c.title}</Text>
              <FontAwesome5 name="chevron-left" size={12} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    );
  }

  // نموذج حاسبة مفردة
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={backToList} style={styles.backButton}>
            <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
          </TouchableOpacity>
          <Text style={styles.formHeaderTitle}>{active.title}</Text>
          <View style={styles.formHeaderIcon}>
            <FontAwesome5 name={active.icon} size={15} color={colors.platinum} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {active.fields.map((f) => (
            <View key={f.key} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              {f.type === "select" ? (
                <View style={styles.optionsRow}>
                  {f.options.map((opt) => {
                    const selected = values[f.key] === opt.value;
                    return (
                      <TouchableOpacity
                        key={String(opt.value)}
                        style={[styles.optionChip, selected && styles.optionChipActive]}
                        activeOpacity={0.85}
                        onPress={() => setField(f.key, opt.value)}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={values[f.key] != null ? String(values[f.key]) : ""}
                  onChangeText={(t) => setField(f.key, t.replace(/[^0-9.]/g, ""))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  textAlign={dir.textAlign}
                />
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.computeButton} activeOpacity={0.9} onPress={compute}>
            <FontAwesome5 name="equals" size={14} color={colors.white} />
            <Text style={styles.computeButtonText}>{en ? "Calculate" : "احسب النتيجة"}</Text>
          </TouchableOpacity>

          {output && (
            <View style={styles.resultCard}>
              <Text style={styles.resultSummary}>{output.summary}</Text>
              <View style={styles.resultDivider} />
              <Text style={styles.resultDetail}>{output.detail}</Text>
              <Text style={styles.resultDisclaimer}>{DISCLAIMER}</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listScroll: { paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 60 : 36 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginBottom: 6 },
  headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 22, color: colors.onyx },
  miniDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.platinum, marginLeft: 9 },
  headerHint: { fontFamily: "Tajawal_400Regular", fontSize: 13, color: colors.textDim, textAlign: dir.textAlign, marginBottom: 20 },
  calcCard: {
    flexDirection: dir.row, alignItems: "center", backgroundColor: colors.surface,
    padding: 16, borderRadius: RADIUS.lg, marginBottom: 12,
    borderWidth: 1, borderColor: colors.glassBorder,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  calcIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
  calcCardTitle: { flex: 1, fontFamily: "Cairo_800ExtraBold", fontSize: 15, color: colors.onyx, textAlign: dir.textAlign, marginHorizontal: 14 },
  formHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 54 : 24, paddingHorizontal: 18, paddingBottom: 16,
    backgroundColor: colors.royal, borderBottomWidth: 1, borderColor: colors.glassBorder,
  },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
  formHeaderTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 17, color: colors.white },
  formHeaderIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
  formScroll: { padding: 20 },
  fieldWrap: { marginBottom: 18, alignItems: dir.colStart },
  fieldLabel: { fontFamily: "Tajawal_700Bold", fontSize: 13, color: colors.royal, marginBottom: 8, textAlign: dir.textAlign, width: "100%" },
  input: {
    width: "100%", height: 52, backgroundColor: colors.surface, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16,
    fontFamily: "Tajawal_700Bold", fontSize: 15, color: colors.onyx,
  },
  optionsRow: { flexDirection: dir.row, flexWrap: "wrap", width: "100%", gap: 8 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: RADIUS.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginLeft: 8, marginBottom: 8 },
  optionChipActive: { backgroundColor: colors.royal, borderColor: colors.royal },
  optionText: { fontFamily: "Tajawal_700Bold", fontSize: 13, color: colors.textDim },
  optionTextActive: { color: colors.white },
  computeButton: {
    flexDirection: dir.row, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.royal, borderRadius: RADIUS.md, paddingVertical: 16, marginTop: 8,
    shadowColor: "#0A2342", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5,
  },
  computeButtonText: { fontFamily: "Cairo_800ExtraBold", fontSize: 15, color: colors.white, marginRight: 10 },
  resultCard: {
    backgroundColor: colors.royalSoft, borderRadius: RADIUS.lg, padding: 18, marginTop: 20,
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  resultSummary: { fontFamily: "Cairo_800ExtraBold", fontSize: 16, color: colors.royal, textAlign: dir.textAlign, lineHeight: 26 },
  resultDivider: { height: 1, backgroundColor: colors.glassBorder, marginVertical: 14 },
  resultDetail: { fontFamily: "Tajawal_500Medium", fontSize: 13.5, color: colors.textBody, textAlign: dir.textAlign, lineHeight: 24 },
  resultDisclaimer: { fontFamily: "Tajawal_400Regular", fontSize: 11.5, color: colors.textDim, textAlign: dir.textAlign, lineHeight: 20, marginTop: 14, fontStyle: "italic" },
  });
};
