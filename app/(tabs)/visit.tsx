import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { Card, SectionHeader, Badge, Disclaimer } from "../../components/UI";
import { C, S, F, R, shadow } from "../../lib/theme";

export default function VisitPrep() {
  const router = useRouter();
  const meds = useStore((s) => s.meds);
  const conditions = useStore((s) => s.conditions);
  const allergies = useStore((s) => s.allergies);
  const labs = useStore((s) => s.labs);
  const actM = meds.filter((m) => m.status === "active");
  const actC = conditions.filter((c) => c.status !== "resolved");
  const abnL = labs.filter((l) => l.flag !== "normal");

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      <TouchableOpacity style={st.hero} activeOpacity={0.85} onPress={() => router.push("/summary")}>
        <View style={st.heroI}><Ionicons name="document-text" size={32} color="#fff" /></View>
        <Text style={st.heroT}>Generate Doctor Summary</Text>
        <Text style={st.heroS}>Create a shareable summary for your next appointment</Text>
        <View style={st.heroCTA}><Text style={st.heroCTAT}>Open Summary</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></View>
      </TouchableOpacity>

      <SectionHeader title="Active Conditions" sub={`${actC.length} conditions`} />
      <Card>{actC.length === 0 ? <Text style={st.none}>None recorded</Text> : actC.map((c, i) => (
        <View key={c.id} style={[st.row, i === actC.length - 1 && st.last]}><View style={[st.dot, { backgroundColor: C.diagnosis }]} /><View style={{ flex: 1 }}><Text style={st.rowT}>{c.name}</Text>{c.onsetDate ? <Text style={st.rowM}>Since {c.onsetDate}</Text> : null}</View><Badge label={c.status} color={c.status === "managed" ? C.ok : C.warn} small /></View>
      ))}</Card>

      <SectionHeader title="Current Medications" sub={`${actM.length} active`} />
      <Card>{actM.length === 0 ? <Text style={st.none}>None recorded</Text> : actM.map((m, i) => (
        <View key={m.id} style={[st.row, i === actM.length - 1 && st.last]}><View style={[st.dot, { backgroundColor: C.medication }]} /><View style={{ flex: 1 }}><Text style={st.rowT}>{m.name} {m.dosage}</Text><Text style={st.rowM}>{m.frequency}{m.reason ? ` · ${m.reason}` : ""}</Text></View></View>
      ))}</Card>

      <SectionHeader title="Allergies" sub={`${allergies.length} recorded`} />
      <Card>{allergies.length === 0 ? <Text style={st.none}>None recorded</Text> : allergies.map((a, i) => (
        <View key={a.id} style={[st.row, i === allergies.length - 1 && st.last]}><View style={[st.dot, { backgroundColor: C.err }]} /><View style={{ flex: 1 }}><Text style={st.rowT}>{a.substance}</Text><Text style={st.rowM}>{a.reaction}</Text></View><Badge label={a.severity} color={a.severity === "severe" ? C.err : C.warn} small /></View>
      ))}</Card>

      {abnL.length > 0 && (<><SectionHeader title="Recent Abnormal Results" sub={`${abnL.length} flagged`} />
        <Card style={{ backgroundColor: C.warnBg, borderColor: C.warn + "25" }}>{abnL.slice(0, 4).map((l, i) => (
          <View key={l.id} style={[st.row, i === Math.min(abnL.length, 4) - 1 && st.last]}><View style={[st.dot, { backgroundColor: C.labResult }]} /><View style={{ flex: 1 }}><Text style={st.rowT}>{l.testName}</Text><Text style={st.rowM}>{new Date(l.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text></View><Text style={{ fontSize: F.md, fontWeight: "700", color: C.err }}>{l.value} {l.unit}</Text></View>
        ))}</Card></>)}

      <Disclaimer /><View style={{ height: 30 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg }, cnt: { padding: S.lg },
  hero: { backgroundColor: C.bgDark, borderRadius: R.xl, padding: S.xxl, alignItems: "center", marginBottom: S.xxl, ...shadow },
  heroI: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.priLt, alignItems: "center", justifyContent: "center", marginBottom: S.lg },
  heroT: { fontSize: F.xl, fontWeight: "700", color: C.tInv, textAlign: "center" },
  heroS: { fontSize: F.sm, color: C.priMut, textAlign: "center", marginTop: S.sm, lineHeight: 20, maxWidth: 280 },
  heroCTA: { flexDirection: "row", alignItems: "center", gap: S.sm, backgroundColor: C.priLt, borderRadius: R.pill, paddingHorizontal: S.xl, paddingVertical: S.sm + 2, marginTop: S.xl },
  heroCTAT: { fontSize: F.md, fontWeight: "600", color: "#fff" },
  row: { flexDirection: "row", alignItems: "center", gap: S.sm, paddingVertical: S.sm + 2, borderBottomWidth: 1, borderBottomColor: C.brdLt },
  last: { borderBottomWidth: 0 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowT: { fontSize: F.md, fontWeight: "500", color: C.t1 },
  rowM: { fontSize: F.sm, color: C.t3, marginTop: 1 },
  none: { fontSize: F.sm, color: C.t3, textAlign: "center", paddingVertical: S.md, fontStyle: "italic" },
});
