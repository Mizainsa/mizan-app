import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../services/supabaseClient";
import { askAI } from "../lib/api";
import { COLORS } from "../lib/theme";

const { width } = Dimensions.get("window");

export default function DaawaWizard({ onClose, onSaveSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "حقوقية عامة",
    plaintiff: "",
    defendant: "",
    details: "",
  });

  const [generatedText, setGeneratedText] = useState("");

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      generateDaawa();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const generateDaawa = async () => {
    setLoading(true);
    setStep(4);

    // الدستور القانوني الصارم: يمنع نقل الألفاظ السوقية ويفرض الصياغة القضائية الرصينة
    const legalCharter =
      "انت مستشار قانوني سعودي محترف وكاتب صحف دعاوى. " +
      "يمنع منعا باتا نقل او استخدام الالفاظ العامية او الشتائم او العبارات السوقية التي يدخلها المستخدم في وصف وقائعه. " +
      "مهمتك الحصرية استخلاص الوقائع المجردة واعادة صياغتها بلغة قانونية رصينة وموضوعية تتوافق مع نظام المرافعات الشرعية السعودي، وتحويل اي اساءة او لفظ سوقي الى وصف قانوني مجرد ومحايد (مثال: تحويل عبارة مهين الى تعدى بالقول، وتحويل الشتيمة الى الفاظ ماسة بالكرامة). " +
      "اكتب صحيفة دعوى رسمية كاملة مرتبة: الديباجة ومخاطبة المحكمة المختصة، ثم اطراف الدعوى، ثم الوقائع المصاغة قانونيا، ثم قسم الاسانيد واللوائح النظامية، ثم الطلبات المرقمة، ثم خاتمة رسمية. " +
      "لا تخترع مواد نظامية غير مؤكدة، واكتب نصا نظيفا بلا رموز تنسيق.";

    const userData =
      "نوع المحكمة والاختصاص: " + formData.type + "\n" +
      "المدعي: " + formData.plaintiff + "\n" +
      "المدعى عليه: " + formData.defendant + "\n" +
      "وقائع القضية كما يصفها المستخدم (قد تحتوي الفاظا عامية يجب تهذيبها قانونيا): " + formData.details;

    try {
      const ans = await askAI(legalCharter + "\n\n" + userData, "sayigh_daawa", []);
      setGeneratedText(ans || "تعذّر توليد الصحيفة. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    } catch (e) {
      setGeneratedText("تعذّر توليد الصحيفة. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
    }
    setLoading(false);
  };

  const saveToLibrary = async () => {
    setSaveLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("تنبيه", "يلزم تسجيل الدخول لإتمام هذا الإجراء.");
        setSaveLoading(false);
        return;
      }

      const { error } = await supabase
        .from("user_library")
        .insert([
          {
            user_id: user.id,
            title: `صحيفة دعوى ${formData.type} - الخصم: ${formData.defendant}`,
            content: generatedText,
            document_type: "ناجز - صحيفة دعوى",
          },
        ]);

      if (error) throw error;

      Alert.alert("تم الحفظ", "تم حفظ الصحيفة في مكتبتك بنجاح.");
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error) {
      Alert.alert("خطأ في الحفظ", error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <View style={styles.wizardOverlay}>
      <View style={styles.wizardContainer}>

        <View style={styles.wizardHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={14} color={COLORS.royal} />
          </TouchableOpacity>
          <Text style={styles.wizardTitle}>أداة صياغة صحيفة الدعوى (خبير ناجز)</Text>
        </View>

        {step <= 3 && (
          <View style={styles.progressRow}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={styles.stepIndicatorWrapper}>
                <View style={[styles.stepDot, step >= s ? styles.stepDotActive : styles.stepDotInactive]} />
                {s < 3 && <View style={[styles.stepLine, step > s ? styles.stepLineActive : styles.stepLineInactive]} />}
              </View>
            ))}
          </View>
        )}

        <ScrollView contentContainerStyle={styles.wizardScroll} showsVerticalScrollIndicator={false}>

          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>1. اختر اختصاص المحكمة وتصنيف الدعوى:</Text>
              {["حقوقية عامة", "عمالية (منصة قوى)", "تجاري واستثماري", "أحوال شخصية"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.radioOption, formData.type === t && styles.radioOptionActive]}
                  onPress={() => setFormData({ ...formData, type: t })}
                >
                  <Text style={[styles.radioText, formData.type === t && styles.radioTextActive]}>{t}</Text>
                  <View style={[styles.radioCircle, formData.type === t && styles.radioCircleActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>2. أطراف النزاع القانوني المعنيين:</Text>
              <Text style={styles.inputTitle}>اسم المدعي الكامل (أنت أو من تمثله):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="أدخل الاسم الكامل أو اسم منشأتك..."
                placeholderTextColor={COLORS.textMuted}
                value={formData.plaintiff}
                onChangeText={(text) => setFormData({ ...formData, plaintiff: text })}
                textAlign="right"
              />
              <Text style={styles.inputTitle}>اسم المدعى عليه (الخصم أو الشركة المشكو ضدها):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="أدخل اسم الخصم أو الشركة المدعى عليها..."
                placeholderTextColor={COLORS.textMuted}
                value={formData.defendant}
                onChangeText={(text) => setFormData({ ...formData, defendant: text })}
                textAlign="right"
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>3. تفاصيل الواقعة والنزاع:</Text>
              <Text style={styles.inputTitle}>اسرد المشكلة باختصار وحرية (سيعاد صياغتها قضائيا):</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="اكتب هنا ما حدث معك بالتفصيل، وسيتكفل ميزان بإعادة هيكلتها قضائيا."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={6}
                value={formData.details}
                onChangeText={(text) => setFormData({ ...formData, details: text })}
                textAlign="right"
              />
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContent}>
              {loading ? (
                <View style={styles.loadingWrapper}>
                  <ActivityIndicator size="large" color={COLORS.royal} />
                  <Text style={styles.loadingText}>جاري استدعاء المحرك القضائي وصياغة الصحيفة...</Text>
                </View>
              ) : (
                <View style={styles.resultWrapper}>
                  <Text style={styles.stepLabel}>صياغة صحيفة الدعوى النهائية:</Text>
                  <View style={styles.docScrollBox}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text style={styles.docOutputText}>{generatedText}</Text>
                    </ScrollView>
                  </View>
                  <TouchableOpacity
                    style={styles.saveLibraryButton}
                    onPress={saveToLibrary}
                    disabled={saveLoading}
                  >
                    <View style={styles.saveGradient}>
                      {saveLoading ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <>
                          <Text style={styles.saveText}>حفظ المستند في مكتبتي</Text>
                          <FontAwesome5 name="cloud-upload-alt" size={14} color={COLORS.white} style={{ marginLeft: 8 }} />
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {(!loading && step <= 4) && (
          <View style={styles.wizardFooter}>
            {step < 4 ? (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>{step === 3 ? "توليد النص القضائي" : "التالي"}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.nextButton, { backgroundColor: COLORS.royalSoft }]} onPress={onClose}>
                <Text style={[styles.nextButtonText, { color: COLORS.royal }]}>إغلاق المعالج</Text>
              </TouchableOpacity>
            )}
            {step > 1 && step < 4 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>السابق</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  wizardOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, backgroundColor: "rgba(10,35,66,0.45)", justifyContent: "flex-end" },
  wizardContainer: { width: "100%", height: "88%", borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden", backgroundColor: COLORS.bgPure },
  wizardHeader: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: COLORS.borderSoft, justifyContent: "space-between" },
  closeButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.royalSoft, alignItems: "center", justifyContent: "center" },
  wizardTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 14.5, color: COLORS.royal },
  progressRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 18, width: "100%" },
  stepIndicatorWrapper: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepDotActive: { backgroundColor: COLORS.royal },
  stepDotInactive: { backgroundColor: COLORS.border },
  stepLine: { height: 2, width: 65, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: COLORS.royal },
  stepLineInactive: { backgroundColor: COLORS.border },
  wizardScroll: { padding: 20, paddingBottom: 40 },
  stepContent: { width: "100%", alignItems: "flex-end" },
  stepLabel: { fontFamily: "Cairo_800ExtraBold", fontSize: 15.5, color: COLORS.onyx, marginBottom: 16, textAlign: "right", width: "100%" },
  radioOption: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", width: "100%", height: 50, backgroundColor: COLORS.bg, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.borderSoft },
  radioOptionActive: { borderColor: COLORS.royal, backgroundColor: COLORS.royalSoft },
  radioText: { fontFamily: "Tajawal_500Medium", fontSize: 13.5, color: COLORS.textDim, marginRight: 12 },
  radioTextActive: { color: COLORS.royal, fontFamily: "Tajawal_700Bold" },
  radioCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.textMuted },
  radioCircleActive: { borderColor: COLORS.royal, backgroundColor: COLORS.royal },
  inputTitle: { fontFamily: "Tajawal_700Bold", fontSize: 12.5, color: COLORS.textDim, marginBottom: 6, marginTop: 12, textAlign: "right", width: "100%" },
  textInput: { width: "100%", height: 48, backgroundColor: COLORS.bg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderSoft, paddingHorizontal: 16, color: COLORS.onyx, fontFamily: "Tajawal_500Medium", fontSize: 13, textAlign: "right" },
  textArea: { height: 120, paddingTop: 12, textAlignVertical: "top" },
  loadingWrapper: { width: "100%", alignItems: "center", paddingVertical: 40 },
  loadingText: { fontFamily: "Tajawal_500Medium", fontSize: 13, color: COLORS.textDim, marginTop: 16, textAlign: "center" },
  resultWrapper: { width: "100%", alignItems: "flex-end" },
  docScrollBox: { width: "100%", height: 260, backgroundColor: COLORS.bg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSoft, padding: 16, marginBottom: 20 },
  docOutputText: { fontFamily: "Tajawal_500Medium", fontSize: 13.5, color: COLORS.textBody, lineHeight: 22, textAlign: "right" },
  saveLibraryButton: { width: "100%", height: 50, borderRadius: 14, overflow: "hidden" },
  saveGradient: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.royal },
  saveText: { fontFamily: "Cairo_800ExtraBold", fontSize: 14, color: COLORS.white },
  wizardFooter: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", padding: 20, borderTopWidth: 1, borderColor: COLORS.borderSoft, paddingBottom: Platform.OS === "ios" ? 34 : 20 },
  nextButton: { height: 46, paddingHorizontal: 28, backgroundColor: COLORS.royal, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nextButtonText: { fontFamily: "Cairo_800ExtraBold", fontSize: 13.5, color: COLORS.white },
  backButton: { height: 46, paddingHorizontal: 20, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" },
  backButtonText: { fontFamily: "Tajawal_700Bold", fontSize: 13.5, color: COLORS.textDim },
});
