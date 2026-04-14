import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { C, S, F, R, shadow } from "../lib/theme";

const { width: SCREEN_W } = Dimensions.get("window");

interface StepConfig {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
  cta: string;
}

const STEPS: StepConfig[] = [
  {
    icon: "medical",
    title: "Welcome to Second Opinion",
    body: "Your personal health record organizer. Keep all your medical documents, medications, and health history in one secure place.",
    cta: "Next",
  },
  {
    icon: "cloud-upload-outline",
    title: "Upload Your Medical Records",
    body: "Take a photo or upload a PDF of any medical document. Our AI extracts conditions, medications, and lab results automatically.",
    cta: "Next",
  },
  {
    icon: "clipboard-outline",
    title: "Prepare for Doctor Visits",
    body: "Generate a doctor-ready summary before any appointment. Share key info instantly — no more forgetting your medication list.",
    cta: "Get Started",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const markOnboardingSeen = useStore((s) => s.markOnboardingSeen);
  const [step, setStep] = useState(0);

  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      markOnboardingSeen();
      router.replace("/(tabs)");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <View style={st.root}>
      {/* Background accent blob */}
      <View style={st.blobTop} />

      {/* Step dots */}
      <View style={st.dotsRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              st.dot,
              i === step && st.dotActive,
              i < step && st.dotDone,
            ]}
          />
        ))}
      </View>

      {/* Back button */}
      {step > 0 && (
        <TouchableOpacity
          style={st.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color={C.pri} />
          <Text style={st.backText}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Main content */}
      <View style={st.content}>
        {/* Icon circle */}
        <View style={st.iconWrap}>
          <View style={st.iconCircle}>
            <Ionicons name={current.icon} size={56} color="#fff" />
          </View>
        </View>

        {/* Text */}
        <Text style={st.title}>{current.title}</Text>
        <Text style={st.body}>{current.body}</Text>
      </View>

      {/* CTA */}
      <View style={st.footer}>
        <TouchableOpacity style={st.ctaBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={st.ctaText}>{current.cta}</Text>
          <Ionicons
            name={step === STEPS.length - 1 ? "checkmark-circle-outline" : "arrow-forward"}
            size={20}
            color="#fff"
            style={{ marginLeft: S.sm }}
          />
        </TouchableOpacity>

        {/* Skip on first two steps */}
        {step < STEPS.length - 1 && (
          <TouchableOpacity
            style={st.skipBtn}
            onPress={() => {
              markOnboardingSeen();
              router.replace("/(tabs)");
            }}
          >
            <Text style={st.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const ICON_SIZE = Math.min(SCREEN_W * 0.42, 200);

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    paddingHorizontal: S.xl,
  },
  blobTop: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: C.pri + "12",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    marginBottom: S.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.brd,
  },
  dotActive: {
    width: 24,
    backgroundColor: C.pri,
    borderRadius: 4,
  },
  dotDone: {
    backgroundColor: C.priMut,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: S.lg,
    gap: S.xs,
  },
  backText: {
    fontSize: F.md,
    color: C.pri,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    marginBottom: S.xxxl,
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: C.pri,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: {
    fontSize: F.xxl,
    fontWeight: "800",
    color: C.t1,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: S.lg,
    lineHeight: 32,
  },
  body: {
    fontSize: F.md,
    color: C.t2,
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: S.md,
  },
  footer: {
    alignItems: "center",
    gap: S.md,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.pri,
    borderRadius: R.xl,
    paddingVertical: S.md + 2,
    paddingHorizontal: S.xxl + S.lg,
    minHeight: 54,
    width: "100%",
    ...shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaText: {
    fontSize: F.lg,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
  skipBtn: {
    paddingVertical: S.sm,
    paddingHorizontal: S.xl,
  },
  skipText: {
    fontSize: F.md,
    color: C.t3,
    fontWeight: "500",
  },
});
