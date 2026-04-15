import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { C, S, F, R, shadow } from "../lib/theme";

const SEX_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say"];

export default function Signup() {
  const router = useRouter();
  const signup = useStore((s) => s.signup);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
    dateOfBirth: "", sex: "", phone: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "At least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.dateOfBirth) e.dateOfBirth = "Required (YYYY-MM-DD)";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) e.dateOfBirth = "Format: YYYY-MM-DD";
    if (!form.sex) e.sex = "Please select one";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const ok = signup({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      dateOfBirth: form.dateOfBirth,
      sex: form.sex,
      phone: form.phone.trim(),
    });
    setLoading(false);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      setErrors({ email: "An account with this email already exists." });
    }
  };

  return (
    <KeyboardAvoidingView style={st.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={st.wrap} contentContainerStyle={st.cnt} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity style={st.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.t1} />
        </TouchableOpacity>

        {/* Header */}
        <View style={st.header}>
          <View style={st.logoWrap}>
            <Ionicons name="person-add" size={28} color="#fff" />
          </View>
          <Text style={st.title}>Create Account</Text>
          <Text style={st.sub}>Join Second Opinion to manage your health records</Text>
        </View>

        {/* Form */}
        <View style={st.card}>
          <Text style={st.sectionLabel}>Personal Information</Text>

          {/* First + Last Name */}
          <View style={st.row2}>
            <View style={[st.fieldWrap, { flex: 1 }]}>
              <Field label="First Name" value={form.firstName} onChange={(v) => set("firstName", v)}
                placeholder="Maria" error={errors.firstName} icon="person-outline" />
            </View>
            <View style={[st.fieldWrap, { flex: 1 }]}>
              <Field label="Last Name" value={form.lastName} onChange={(v) => set("lastName", v)}
                placeholder="Santos" error={errors.lastName} icon="person-outline" />
            </View>
          </View>

          {/* Date of Birth */}
          <Field label="Date of Birth" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)}
            placeholder="1990-06-15" error={errors.dateOfBirth} icon="calendar-outline"
            hint="Format: YYYY-MM-DD" keyboardType="numeric" />

          {/* Sex */}
          <View style={st.fieldWrap}>
            <Text style={st.label}>Biological Sex</Text>
            <View style={st.pillGroup}>
              {SEX_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[st.sexPill, form.sex === opt && st.sexPillSel]}
                  onPress={() => set("sex", opt)}
                >
                  <Text style={[st.sexPillT, form.sex === opt && st.sexPillTSel]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.sex ? <Text style={st.errT}>{errors.sex}</Text> : null}
          </View>

          {/* Phone (optional) */}
          <Field label="Phone (optional)" value={form.phone} onChange={(v) => set("phone", v)}
            placeholder="(555) 000-0000" icon="call-outline" keyboardType="phone-pad" />

          <View style={st.sectionDivider} />
          <Text style={st.sectionLabel}>Account Credentials</Text>

          {/* Email */}
          <Field label="Email Address" value={form.email} onChange={(v) => set("email", v)}
            placeholder="you@example.com" error={errors.email} icon="mail-outline"
            keyboardType="email-address" autoCapitalize="none" />

          {/* Password */}
          <View style={st.fieldWrap}>
            <Text style={st.label}>Password</Text>
            <View style={[st.inputRow, errors.password && st.inputErr]}>
              <Ionicons name="lock-closed-outline" size={18} color={C.t3} style={st.inputIcon} />
              <TextInput style={[st.input, { flex: 1 }]} placeholder="At least 6 characters"
                placeholderTextColor={C.t3} value={form.password}
                onChangeText={(v) => set("password", v)}
                secureTextEntry={!showPw} autoComplete="new-password" />
              <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={st.eyeBtn}>
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={18} color={C.t3} />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={st.errT}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={st.fieldWrap}>
            <Text style={st.label}>Confirm Password</Text>
            <View style={[st.inputRow, errors.confirmPassword && st.inputErr]}>
              <Ionicons name="lock-closed-outline" size={18} color={C.t3} style={st.inputIcon} />
              <TextInput style={[st.input, { flex: 1 }]} placeholder="Re-enter password"
                placeholderTextColor={C.t3} value={form.confirmPassword}
                onChangeText={(v) => set("confirmPassword", v)}
                secureTextEntry={!showPw} returnKeyType="done" onSubmitEditing={handleSignup} />
            </View>
            {errors.confirmPassword ? <Text style={st.errT}>{errors.confirmPassword}</Text> : null}
          </View>
        </View>

        {/* Notice */}
        <View style={st.notice}>
          <Ionicons name="shield-checkmark-outline" size={14} color={C.ok} />
          <Text style={st.noticeT}>Your data is stored locally on this device and never shared without your consent.</Text>
        </View>

        {/* Create Account button */}
        <TouchableOpacity style={[st.createBtn, loading && { opacity: 0.7 }]}
          onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: S.sm }} />
                <Text style={st.createT}>Create My Account</Text>
              </>}
        </TouchableOpacity>

        {/* Sign in link */}
        <View style={st.signinRow}>
          <Text style={st.signinT}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={st.signinLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Reusable field component ──────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, error, icon, hint, keyboardType, autoCapitalize }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; icon?: string;
  hint?: string; keyboardType?: any; autoCapitalize?: any;
}) {
  return (
    <View style={st.fieldWrap}>
      <Text style={st.label}>{label}</Text>
      <View style={[st.inputRow, error && st.inputErr]}>
        {icon ? <Ionicons name={icon as any} size={18} color={C.t3} style={st.inputIcon} /> : null}
        <TextInput style={st.input} placeholder={placeholder} placeholderTextColor={C.t3}
          value={value} onChangeText={onChange} keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "words"} />
      </View>
      {hint && !error ? <Text style={st.hintT}>{hint}</Text> : null}
      {error ? <Text style={st.errT}>{error}</Text> : null}
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, backgroundColor: C.bg },
  cnt: { padding: S.xl, paddingTop: S.xl },

  back: { marginBottom: S.lg, width: 40, height: 40, alignItems: "center", justifyContent: "center" },

  header: { alignItems: "center", marginBottom: S.xxl },
  logoWrap: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: C.pri,
    alignItems: "center", justifyContent: "center", marginBottom: S.md, ...shadow,
  },
  title: { fontSize: F.xxl, fontWeight: "800", color: C.t1, letterSpacing: -0.5 },
  sub: { fontSize: F.sm, color: C.t3, marginTop: 6, textAlign: "center" },

  card: {
    backgroundColor: C.card, borderRadius: R.xl, padding: S.xl,
    borderWidth: 1, borderColor: C.brdLt, ...shadow, marginBottom: S.lg,
  },
  sectionLabel: { fontSize: F.sm, fontWeight: "700", color: C.t3, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: S.lg },
  sectionDivider: { height: 1, backgroundColor: C.brdLt, marginVertical: S.xl },

  row2: { flexDirection: "row", gap: S.md },

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
  errT: { fontSize: F.xs, color: C.err, marginTop: 4 },
  hintT: { fontSize: F.xs, color: C.t3, marginTop: 4 },

  pillGroup: { flexDirection: "row", flexWrap: "wrap", gap: S.sm },
  sexPill: {
    paddingHorizontal: S.md, paddingVertical: S.sm,
    borderRadius: R.pill, borderWidth: 1.5, borderColor: C.brd, backgroundColor: C.bgAlt,
  },
  sexPillSel: { backgroundColor: C.pri, borderColor: C.pri },
  sexPillT: { fontSize: F.sm, fontWeight: "500", color: C.t2 },
  sexPillTSel: { color: "#fff", fontWeight: "600" },

  notice: {
    flexDirection: "row", alignItems: "flex-start", gap: S.sm,
    backgroundColor: C.okBg, borderRadius: R.md, padding: S.md, marginBottom: S.xl,
  },
  noticeT: { flex: 1, fontSize: F.xs, color: C.ok, lineHeight: 17 },

  createBtn: {
    backgroundColor: C.pri, borderRadius: R.md, height: 54,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginBottom: S.xl, ...shadow,
  },
  createT: { fontSize: F.md, fontWeight: "700", color: "#fff", letterSpacing: 0.3 },

  signinRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: S.sm },
  signinT: { fontSize: F.sm, color: C.t3 },
  signinLink: { fontSize: F.sm, fontWeight: "600", color: C.pri },
});
