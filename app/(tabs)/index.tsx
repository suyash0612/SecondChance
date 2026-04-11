import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { Card, SectionHeader, StatCard, Disclaimer } from "../../components/UI";
import { TimelineCard } from "../../components/TimelineCard";
import { C, S, F, R, shadow } from "../../lib/theme";

export default function Home() {
  const router = useRouter();
  const p = useStore((s) => s.patient);
  const docs = useStore((s) => s.docs);
  const meds = useStore((s) => s.meds);
  const conditions = useStore((s) => s.conditions);
  const allergies = useStore((s) => s.allergies);
  const labs = useStore((s) => s.labs);
  const timeline = useStore((s) => s.timeline);
  const actMeds = meds.filter((m) => m.status === "active");
  const actCond = conditions.filter((c) => c.status !== "resolved");
  const abnLabs = labs.filter((l) => l.flag !== "normal");
  const recent = timeline.slice(0, 3);
  const hr = new Date().getHours();
  const greet = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      <View style={st.greetRow}>
        <View style={{ flex: 1 }}><Text style={st.greet}>Good {greet}, {p.firstName}</Text><Text style={st.greetS}>Your records are organized and ready</Text></View>
        <View style={st.av}><Text style={st.avT}>{p.firstName[0]}{p.lastName[0]}</Text></View>
      </View>

      <TouchableOpacity style={st.cta} activeOpacity={0.85} onPress={() => router.push("/summary")}>
        <View style={st.ctaI}><Ionicons name="clipboard" size={24} color="#fff" /></View>
        <View style={{ flex: 1 }}><Text style={st.ctaT}>Prepare for Your Visit</Text><Text style={st.ctaS}>Generate a doctor-ready summary</Text></View>
        <Ionicons name="chevron-forward" size={20} color={C.priMut} />
      </TouchableOpacity>

      <View style={st.stats}>
        <StatCard label="Records" value={docs.length} icon="document-text-outline" color={C.pri} />
        <StatCard label="Meds" value={actMeds.length} icon="medkit-outline" color={C.medication} />
        <StatCard label="Conditions" value={actCond.length} icon="heart-outline" color={C.diagnosis} />
        <StatCard label="Allergies" value={allergies.length} icon="alert-circle-outline" color={C.err} />
      </View>

      <View style={st.acts}>
        {[{ l: "Upload", i: "cloud-upload-outline", p: "/upload" }, { l: "Summary", i: "document-text-outline", p: "/summary" }, { l: "Timeline", i: "git-branch-outline", p: "/(tabs)/timeline" }].map((a) => (
          <TouchableOpacity key={a.l} style={st.actBtn} onPress={() => router.push(a.p as any)}>
            <Ionicons name={a.i as any} size={20} color={C.pri} /><Text style={st.actL}>{a.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {abnLabs.length > 0 && (
        <Card style={st.alert}>
          <View style={st.alertH}><Ionicons name="warning-outline" size={18} color={C.warn} /><Text style={st.alertT}>{abnLabs.length} Abnormal Lab Result{abnLabs.length > 1 ? "s" : ""}</Text></View>
          {abnLabs.slice(0, 3).map((l) => (<View key={l.id} style={st.alertR}><Text style={st.alertN}>{l.testName}</Text><Text style={[st.alertV, { color: C.err }]}>{l.value} {l.unit}</Text></View>))}
        </Card>
      )}

      <SectionHeader title="Recent Activity" action="See All" onAction={() => router.push("/(tabs)/timeline" as any)} />
      {recent.map((e, i) => <TimelineCard key={e.id} event={e} first={i === 0} last={i === recent.length - 1} />)}

      <Disclaimer />
      <View style={st.demo}><Ionicons name="flask-outline" size={12} color={C.t3} /><Text style={st.demoT}>Demo Mode — Sample patient data</Text></View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg }, cnt: { padding: S.lg, paddingTop: S.md },
  greetRow: { flexDirection: "row", alignItems: "center", marginBottom: S.lg },
  greet: { fontSize: F.xxl, fontWeight: "700", color: C.t1, letterSpacing: -0.5 },
  greetS: { fontSize: F.sm, color: C.t3, marginTop: 2 },
  av: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.pri, alignItems: "center", justifyContent: "center" },
  avT: { fontSize: F.lg, fontWeight: "700", color: "#fff" },
  cta: { flexDirection: "row", alignItems: "center", backgroundColor: C.bgDark, borderRadius: R.lg, padding: S.lg, marginBottom: S.xl, gap: S.md, ...shadow },
  ctaI: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.priLt, alignItems: "center", justifyContent: "center" },
  ctaT: { fontSize: F.lg, fontWeight: "700", color: C.tInv, letterSpacing: -0.2 },
  ctaS: { fontSize: F.sm, color: C.priMut, marginTop: 2 },
  stats: { flexDirection: "row", gap: S.sm, marginBottom: S.xl },
  acts: { flexDirection: "row", gap: S.sm, marginBottom: S.xxl },
  actBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, paddingVertical: S.md, backgroundColor: C.priFaint, borderRadius: R.md, borderWidth: 1, borderColor: C.priMut + "50" },
  actL: { fontSize: F.sm, fontWeight: "600", color: C.pri },
  alert: { backgroundColor: C.warnBg, borderColor: C.warn + "30", marginBottom: S.xl },
  alertH: { flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.sm },
  alertT: { fontSize: F.md, fontWeight: "600", color: C.warn },
  alertR: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  alertN: { fontSize: F.sm, color: C.t1 }, alertV: { fontSize: F.sm, fontWeight: "700" },
  demo: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.xs, paddingVertical: S.lg },
  demoT: { fontSize: F.xs, color: C.t3 },
});
