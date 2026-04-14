import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { C, S, F, R } from "../lib/theme";

export function DemoModeBanner() {
  const patient = useStore((s) => s.patient);
  const isDemoMode = patient.email === "demo@example.com";

  if (!isDemoMode) return null;

  return (
    <View style={st.banner}>
      <View style={st.iconWrapper}>
        <Ionicons name="beaker" size={16} color={C.pri} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.title}>Demo Mode</Text>
        <Text style={st.subtitle}>This is sample data for testing. Your actual medical records are not displayed.</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: S.md,
    backgroundColor: C.priFaint,
    borderBottomWidth: 1.5,
    borderBottomColor: C.pri,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: R.md,
    backgroundColor: C.pri,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  title: {
    fontSize: F.md,
    fontWeight: "700",
    color: C.pri,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: F.xs,
    color: C.t2,
    lineHeight: 16,
  },
});
