import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { C, S, F, R, shadow } from "../lib/theme";

export default function Login() {
  const router = useRouter();
  const login = useStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setLoading(true);
    // Small delay to show loading state
    await new Promise((r) => setTimeout(r, 400));
    const ok = login(email.trim(), password);
    setLoading(false);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      setError("Incorrect email or password. Please try again.");
    }
  };

  const fillDemo = () => {
    setEmail("maria.santos@email.com");
    setPassword("demo1234");
    setError("");
  };

  return (
    <KeyboardAvoidingView style={st.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={st.wrap} contentContainerStyle={st.cnt} keyboardShouldPersistTaps="handled">
        {/* Header / Brand */}
        <View style={st.header}>
          <View style={st.logoWrap}>
            <Ionicons name="medical" size={32} color="#fff" />
          </View>
          <Text style={st.brand}>Second Opinion</Text>
          <Text style={st.tagline}>Your health records, organized and ready</Text>
        </View>

        {/* Card */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Sign In</Text>
          <Text style={st.cardSub}>Access your medical records and timeline</Text>

          {/* Error */}
          {error ? (
            <View style={st.errorRow}>
              <Ionicons name="alert-circle-outline" size={16} color={C.err} />
              <Text style={st.errorT}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={st.fieldWrap}>
            <Text style={st.label}>Email Address</Text>
            <View style={[st.inputRow, error && email === "" && st.inputErr]}>
              <Ionicons name="mail-outline" size={18} color={C.t3} style={st.inputIcon} />
              <TextInput
                style={st.input}
                placeholder="you@example.com"
                placeholderTextColor={C.t3}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={st.fieldWrap}>
            <Text style={st.label}>Password</Text>
            <View style={st.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={C.t3} style={st.inputIcon} />
              <TextInput
                style={[st.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={C.t3}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
                secureTextEntry={!showPw}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={st.eyeBtn}>
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={18} color={C.t3} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={st.forgotRow} onPress={() => Alert.alert("Reset Password", "Password reset is available in the full version.")}>
            <Text style={st.forgotT}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity
            style={[st.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={st.signInT}>Sign In</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={st.divider}>
            <View style={st.divLine} />
            <Text style={st.divT}>or</Text>
            <View style={st.divLine} />
          </View>

          {/* Create Account */}
          <TouchableOpacity style={st.createBtn} onPress={() => router.push("/signup")} activeOpacity={0.85}>
            <Ionicons name="person-add-outline" size={18} color={C.pri} style={{ marginRight: S.sm }} />
            <Text style={st.createT}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <TouchableOpacity style={st.demoHint} onPress={fillDemo} activeOpacity={0.7}>
          <Ionicons name="flask-outline" size={13} color={C.t3} />
          <Text style={st.demoHintT}>Try demo account — tap to fill credentials</Text>
        </TouchableOpacity>
        <Text style={st.demoCredT}>maria.santos@email.com · demo1234</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, backgroundColor: C.bg },
  cnt: { padding: S.xl, paddingTop: 60 },

  header: { alignItems: "center", marginBottom: S.xxl + S.md },
  logoWrap: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: C.pri,
    alignItems: "center", justifyContent: "center", marginBottom: S.lg,
    ...shadow,
  },
  brand: { fontSize: 28, fontWeight: "800", color: C.t1, letterSpacing: -0.8 },
  tagline: { fontSize: F.sm, color: C.t3, marginTop: 6, textAlign: "center" },

  card: {
    backgroundColor: C.card, borderRadius: R.xl, padding: S.xl,
    borderWidth: 1, borderColor: C.brdLt, ...shadow, marginBottom: S.xl,
  },
  cardTitle: { fontSize: F.xl, fontWeight: "700", color: C.t1, marginBottom: 4 },
  cardSub: { fontSize: F.sm, color: C.t3, marginBottom: S.xl },

  errorRow: {
    flexDirection: "row", alignItems: "center", gap: S.sm,
    backgroundColor: C.errBg, borderRadius: R.md, padding: S.md, marginBottom: S.lg,
  },
  errorT: { flex: 1, fontSize: F.sm, color: C.err },

  fieldWrap: { marginBottom: S.lg },
  label: { fontSize: F.sm, fontWeight: "600", color: C.t2, marginBottom: S.sm },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.bgAlt, borderRadius: R.md,
    borderWidth: 1, borderColor: C.brd, paddingHorizontal: S.md, height: 50,
  },
  inputErr: { borderColor: C.err },
  inputIcon: { marginRight: S.sm },
  input: { flex: 1, fontSize: F.md, color: C.t1 },
  eyeBtn: { padding: S.xs },

  forgotRow: { alignItems: "flex-end", marginBottom: S.xl, marginTop: -S.sm },
  forgotT: { fontSize: F.sm, color: C.pri, fontWeight: "500" },

  signInBtn: {
    backgroundColor: C.pri, borderRadius: R.md, height: 52,
    alignItems: "center", justifyContent: "center", ...shadow,
  },
  signInT: { fontSize: F.md, fontWeight: "700", color: "#fff", letterSpacing: 0.3 },

  divider: { flexDirection: "row", alignItems: "center", gap: S.md, marginVertical: S.xl },
  divLine: { flex: 1, height: 1, backgroundColor: C.brd },
  divT: { fontSize: F.sm, color: C.t3 },

  createBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: C.pri, borderRadius: R.md, height: 52,
  },
  createT: { fontSize: F.md, fontWeight: "600", color: C.pri },

  demoHint: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.xs, marginBottom: 4 },
  demoHintT: { fontSize: F.xs, color: C.t3 },
  demoCredT: { fontSize: F.xs, color: C.t3, textAlign: "center" },
});
