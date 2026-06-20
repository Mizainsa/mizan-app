import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Dimensions, Linking, ActivityIndicator, Modal,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { PLATFORMS, RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";
import { streamAI, logActivity, loadChat, saveChat, toHistory, parseTags } from "../lib/api";
import DaawaWizard from "../components/DaawaWizard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

const PLAT_ICON = { najz: "gavel", qiwa: "briefcase", ejar: "home", absher: "user-shield", gosi: "shield-alt", etimad: "file-contract", balady: "building" };

const CONF_STYLE = {
  "مؤكد": { bg: "#DCFCE7", fg: "#166534", icon: "check-circle", label: "مستند نظامي مؤكد" },
  "استرشادي": { bg: "#FEF9C3", fg: "#854D0E", icon: "info-circle", label: "إرشاد استرشادي" },
  "تحقق": { bg: "#FEE2E2", fg: "#991B1B", icon: "exclamation-circle", label: "يُنصح بالتحقق من المصدر" },
};

export default function PlatformsScreen({ navigation }) {
  const { colors, fontScale, dir, lang } = useTheme();
  const en = lang === "en";
  const pname = (p) => en ? (p.name_en || p.name) : p.name;
  const styles = makeStyles(colors, fontScale, dir);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const scrollViewRef = useRef();
  const stopRef = useRef(null);

  // نوع القسم في الخادم والذاكرة لكل منصة مستقل
  function platformType(p) { return "platform_" + p.id; }

  async function openPlatform(p) {
    setActive(p);
    logActivity("open_section", "platforms");
    const welcome = { id: "welcome", text: en ? `Welcome. I am your specialist expert for the ${pname(p)} platform. Ask me about any service or procedure, within this platform only.` : `أهلاً بك. أنا خبيرك المختص بمنصة ${p.name}. اسألني عن أي خدمة أو إجراء وسأرشدك خطوة بخطوة، في حدود هذه المنصة فقط.`, isBot: true };
    const saved = await loadChat(platformType(p));
    if (saved && saved.length) {
      setMessages([welcome, ...saved]);
    } else {
      setMessages([welcome]);
    }
  }

  function back() {
    if (stopRef.current) { stopRef.current(); stopRef.current = null; }
    setStreaming(false);
    setActive(null);
    setMessages([]);
    setInputText("");
  }

  // حفظ محادثة المنصة عند كل تغيّر مستقر (لا أثناء التدفق)
  useEffect(() => {
    if (!active || streaming) return;
    const toPersist = messages.filter((m) => m.id !== "welcome");
    if (toPersist.length) saveChat(platformType(active), toPersist);
  }, [messages, active, streaming]);

  const handleSend = () => {
    const q = inputText.trim();
    if (!q || loading || streaming || !active) return;

    const type = platformType(active);
    const history = toHistory(messages);
    const botId = (Date.now() + 1).toString();

    setMessages((prev) => [...prev, { id: Date.now().toString(), text: q, isBot: false }]);
    setInputText("");
    setLoading(true);
    logActivity("question", "platforms");
    setMessages((prev) => [...prev, { id: botId, text: "", isBot: true }]);

    stopRef.current = streamAI(q, type, history, {
      onDelta: (_piece, fullSoFar) => {
        setLoading(false);
        setStreaming(true);
        setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: fullSoFar } : m)));
      },
      onDone: () => { setLoading(false); setStreaming(false); stopRef.current = null; },
      onError: (msg) => {
        setLoading(false); setStreaming(false); stopRef.current = null;
        setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: msg || "تعذّر الحصول على رد. حاول مرة أخرى." } : m)));
      },
    });
  };

  const stopStreaming = () => {
    if (stopRef.current) { stopRef.current(); stopRef.current = null; }
    setStreaming(false); setLoading(false);
  };

  // شبكة المنصات
  if (!active) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.gridScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.miniDot} />
            <Text style={styles.sectionTitleText}>{t("sec_platforms", lang)}</Text>
          </View>
          <Text style={styles.gridHint}>{en ? "Choose a platform to chat with its expert" : "اختر منصة لتتحدث مع خبيرها المختص"}</Text>
          <View style={styles.gridContainer}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity key={p.id} style={styles.cardTouch} activeOpacity={0.9} onPress={() => openPlatform(p)}>
                <View style={styles.cardInner}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5 name={PLAT_ICON[p.id] || "building"} size={22} color={colors.platinum} />
                  </View>
                  <Text style={styles.cardTitle}>{pname(p)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    );
  }

  // محادثة الخبير
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0} style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.webLinkButton} onPress={() => Linking.openURL(active.url)} activeOpacity={0.85}>
            <FontAwesome5 name="external-link-alt" size={11} color={colors.platinum} style={{ marginRight: 6 }} />
            <Text style={styles.webLinkText}>{en ? "Official site" : "الموقع الرسمي"}</Text>
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={styles.headerTitle}>{en ? `Expert ${pname(active)}` : `خبير ${active.name}`}</Text>
            <Text style={styles.headerSubTitle}>{en ? "Specialized in this platform only" : "متخصص بهذه المنصة فقط"}</Text>
          </View>
          <TouchableOpacity onPress={back} style={styles.backButton}>
            <FontAwesome5 name={dir.isRTL ? "arrow-right" : "arrow-left"} size={16} color={colors.platinum} />
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
          {messages.map((msg) => {
            const parsed = msg.isBot && msg.id !== "welcome" ? parseTags(msg.text) : null;
            const displayText = parsed ? parsed.clean : msg.text;
            const conf = parsed && parsed.confidence ? CONF_STYLE[parsed.confidence] : null;
            const showMeta = msg.isBot && msg.id !== "welcome" && msg.text !== "" && !streaming;
            return (
              <View key={msg.id} style={[styles.messageRow, msg.isBot ? styles.botRow : styles.userRow]}>
                <View style={[styles.avatarBox, msg.isBot ? styles.botAvatar : styles.userAvatar]}>
                  <FontAwesome5 name={msg.isBot ? "robot" : "user"} size={11} color={msg.isBot ? colors.platinum : colors.white} />
                </View>
                <View style={styles.bubbleColumn}>
                  {conf && showMeta && (
                    <View style={[styles.confBadge, { backgroundColor: conf.bg }]}>
                      <FontAwesome5 name={conf.icon} size={10} color={conf.fg} />
                      <Text style={[styles.confText, { color: conf.fg }]}>{conf.label}</Text>
                    </View>
                  )}
                  {parsed && parsed.deadline && showMeta && (
                    <View style={styles.deadlineAlert}>
                      <FontAwesome5 name="clock" size={12} color={colors.white} />
                      <Text style={styles.deadlineText}>{parsed.deadline}</Text>
                    </View>
                  )}
                  <View style={[styles.messageBubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
                    {msg.isBot && msg.text === "" ? (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <ActivityIndicator size="small" color={colors.platinum} />
                        <Text style={[styles.messageText, styles.botText, { marginRight: 8 }]}>{t("thinking", lang)}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.messageText, msg.isBot ? styles.botText : styles.userText]}>{displayText}</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {active.id === "najz" && (
          <TouchableOpacity style={styles.daawaButton} activeOpacity={0.9} onPress={() => setShowWizard(true)}>
            <FontAwesome5 name="file-signature" size={15} color={colors.white} />
            <Text style={styles.daawaButtonText}>{t("daawa_btn", lang)}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputWrapper}>
          {streaming ? (
            <TouchableOpacity style={styles.stopButton} activeOpacity={0.85} onPress={stopStreaming}>
              <FontAwesome5 name="stop" size={13} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendButton} activeOpacity={0.85} onPress={handleSend}>
              <FontAwesome5 name="paper-plane" size={15} color={colors.platinum} style={styles.sendIconStyle} />
            </TouchableOpacity>
          )}
          <TextInput style={styles.textInput} placeholder={en ? `Ask Expert ${pname(active)}...` : `اسأل خبير ${active.name}...`} placeholderTextColor={colors.textMuted} value={inputText} onChangeText={setInputText} textAlign={dir.textAlign} multiline editable={!streaming} />
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showWizard} animationType="slide" transparent={true} onRequestClose={() => setShowWizard(false)}>
        <DaawaWizard onClose={() => setShowWizard(false)} onSaveSuccess={() => setShowWizard(false)} />
      </Modal>
    </View>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  innerContainer: { flex: 1 },
  gridScroll: { paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 60 : 36 },
  sectionTitleRow: { flexDirection: dir.row, alignItems: "center", justifyContent: dir.rowStart, marginBottom: 6 },
  sectionTitleText: { fontFamily: "Cairo_800ExtraBold", fontSize: 22, color: colors.onyx },
  miniDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.royal, marginHorizontal: 9 },
  gridHint: { fontFamily: "Tajawal_400Regular", fontSize: 13, color: colors.textDim, textAlign: dir.textAlign, marginBottom: 20 },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", width: "100%" },
  cardTouch: { width: CARD_WIDTH, marginBottom: 14 },
  cardInner: {
    backgroundColor: colors.surface, borderRadius: RADIUS.xl, padding: 16, alignItems: "center", justifyContent: "center", height: 128,
    borderWidth: 1, borderColor: colors.glassBorder,
    shadowColor: "#000", shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.13, shadowRadius: 24, elevation: 9,
  },
  iconContainer: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", marginBottom: 10, borderWidth: 1, borderColor: colors.glassBorder },
  cardTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 15, color: colors.onyx, textAlign: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 54 : 24, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: colors.bgPure, borderBottomWidth: 1, borderColor: colors.borderSoft,
  },
  backButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.royalSoft, alignItems: "center", justifyContent: "center" },
  titleWrapper: { alignItems: dir.colStart, flex: 1, marginRight: 12 },
  headerTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: 17, color: colors.onyx },
  headerSubTitle: { fontFamily: "Tajawal_500Medium", fontSize: 11, color: colors.textDim, marginTop: 2 },
  webLinkButton: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: colors.royalSoft },
  webLinkText: { fontFamily: "Tajawal_700Bold", fontSize: 11, color: colors.royal },
  chatContent: { padding: 18, paddingTop: 16 },
  messageRow: { flexDirection: dir.row, alignItems: dir.alignEnd, marginBottom: 18, width: "100%" },
  botRow: { justifyContent: "flex-start" },
  userRow: { justifyContent: dir.rowStart },
  avatarBox: { width: 26, height: 26, borderRadius: 9, alignItems: "center", justifyContent: "center", marginLeft: 8, marginBottom: 2 },
  botAvatar: { backgroundColor: colors.royal },
  userAvatar: { backgroundColor: colors.royal },
  messageBubble: {
    maxWidth: width * 0.76, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: "#0A2342", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  bubbleColumn: { maxWidth: width * 0.76, alignItems: dir.colStart },
  confBadge: { flexDirection: dir.row, alignItems: "center", alignSelf: "flex-end", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 6 },
  confText: { fontFamily: "Tajawal_700Bold", fontSize: 10.5, marginRight: 6 },
  deadlineAlert: { flexDirection: dir.row, alignItems: "center", alignSelf: "stretch", backgroundColor: colors.danger, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  deadlineText: { fontFamily: "Cairo_800ExtraBold", fontSize: 12.5, color: colors.white, marginRight: 8, flex: 1, textAlign: dir.textAlign, lineHeight: 20 },
  botBubble: { backgroundColor: colors.surface, borderBottomRightRadius: 5, borderWidth: 1, borderColor: colors.borderSoft },
  userBubble: { backgroundColor: colors.royal, borderBottomLeftRadius: 5 },
  messageText: { fontFamily: "Tajawal_500Medium", fontSize: 14.5, lineHeight: 23, textAlign: dir.textAlign },
  botText: { color: colors.textBody },
  userText: { color: colors.white },
  daawaButton: { flexDirection: dir.row, alignItems: "center", justifyContent: "center", backgroundColor: colors.royal, marginHorizontal: 16, marginBottom: 10, borderRadius: 16, paddingVertical: 14, shadowColor: "#0A2342", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  daawaButtonText: { fontFamily: "Cairo_800ExtraBold", fontSize: 14.5, color: colors.white, marginRight: 10 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8,
    marginHorizontal: 16, marginBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: colors.bgPure, borderRadius: 28, borderWidth: 1, borderColor: colors.glassBorder,
    shadowColor: "#0A2342", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 6,
  },
  textInput: { flex: 1, fontFamily: "Tajawal_500Medium", fontSize: 14.5, color: colors.onyx, paddingHorizontal: 14, maxHeight: 100, minHeight: 44 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.glassBorder },
  stopButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.danger, alignItems: "center", justifyContent: "center" },
  sendIconStyle: { marginRight: 2, transform: [{ scaleX: -1 }] },
  });
}
