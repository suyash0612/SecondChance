import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { Card, SectionHeader, StatCard, Disclaimer } from "../../components/UI";
import { TimelineCard } from "../../components/TimelineCard";
import { C, S, F, R, shadow, colorOpacity } from "../../lib/theme";

export default function Home() {
  const router = useRouter();
  const p = useStore((s) => s.patient);
  const authUser = useStore((s) => s.authUser);
  const docs = useStore((s) => s.docs);
  const meds = useStore((s) => s.meds);
  const conditions = useStore((s) => s.conditions);
  const allergies = useStore((s) => s.allergies);
  const labs = useStore((s) => s.labs);
  const appointments = useStore((s) => s.appointments);
  const timeline = useStore((s) => s.timeline);
  const actMeds = meds.filter((m) => m.status === "active");
  const actCond = conditions.filter((c) => c.status !== "resolved");
  const abnLabs = labs.filter((l) => l.flag !== "normal");
  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recent = timeline.slice(0, 3);
  const hr = new Date().getHours();
  const greet = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";
  const nextAppt = upcoming[0];

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      <View style={st.greetRow}>
        <View style={{ flex: 1 }}>
          <Text style={st.greet}>Good {greet}, {p.firstName}</Text>
          <Text style={st.greetS}>Your records are organized and ready</Text>
        </View>
        <TouchableOpacity style={st.av} onPress={() => router.push("/(tabs)/profile" as any)}>
          <Text style={st.avT}>{p.firstName[0]}{p.lastName[0]}</Text>
        </TouchableOpacity>
      </View>

      {/* Prepare for Visit CTA */}
      <TouchableOpacity style={st.cta} activeOpacity={0.85} onPress={() => router.push("/summary")}>
        <View style={st.ctaI}><Ionicons name="clipboard" size={24} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={st.ctaT}>Prepare for Your Visit</Text>
          <Text style={st.ctaS}>Generate a doctor-ready summary</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={C.priMut} />
      </TouchableOpacity>

      {/* Stats */}
      <View style={st.stats}>
        <StatCard label="Records" value={docs.length} icon="document-text-outline" color={C.pri} />
        <StatCard label="Meds" value={actMeds.length} icon="medkit-outline" color={C.medication} />
        <StatCard label="Conditions" value={actCond.length} icon="heart-outline" color={C.diagnosis} />
        <StatCard label="Allergies" value={allergies.length} icon="alert-circle-outline" color={C.err} />
      </View>

      {/* Quick Actions */}
      <View style={st.acts}>
        {[
          { l: "Upload", i: "cloud-upload-outline", p: "/upload" },
          { l: "Summary", i: "document-text-outline", p: "/summary" },
          { l: "Timeline", i: "git-branch-outline", p: "/(tabs)/timeline" },
        ].map((a) => (
          <TouchableOpacity key={a.l} style={st.actBtn} onPress={() => router.push(a.p as any)}>
            <Ionicons name={a.i as any} size={20} color={C.pri} />
            <Text style={st.actL}>{a.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feature shortcuts */}
      <View style={st.shortcuts}>
        <TouchableOpacity style={st.shortcut} onPress={() => router.push("/vitals" as any)}>
          <View style={[st.shortcutIcon, { backgroundColor: colorOpacity('encounter', 9) }]}>
            <Ionicons name="pulse-outline" size={22} color={C.encounter} />
          </View>
          <Text style={st.shortcutL}>Vitals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.shortcut} onPress={() => router.push("/appointments" as any)}>
          <View style={[st.shortcutIcon, { backgroundColor: C.pri + "18" }]}>
            <Ionicons name="calendar-outline" size={22} color={C.pri} />
          </View>
          <Text style={st.shortcutL}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.shortcut} onPress={() => router.push("/add-data" as any)}>
          <View style={[st.shortcutIcon, { backgroundColor: colorOpacity('medication', 9) }]}>
            <Ionicons name="add-circle-outline" size={22} color={C.medication} />
          </View>
          <Text style={st.shortcutL}>Add Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.shortcut} onPress={() => router.push("/emergency" as any)}>
          <View style={[st.shortcutIcon, { backgroundColor: colorOpacity('err', 9) }]}>
            <Ionicons name="shield-outline" size={22} color={C.err} />
          </View>
          <Text style={st.shortcutL}>Emergency</Text>
        </TouchableOpacity>
      </View>

      {/* Next Appointment banner */}
      {nextAppt && (
        <TouchableOpacity style={st.apptBanner} onPress={() => router.push("/appointments" as any)} activeOpacity={0.8}>
          <View style={st.apptIcon}>
            <Ionicons name="calendar" size={20} color={C.pri} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.apptLabel}>Next Appointment</Text>
            <Text style={st.apptDoc}>{nextAppt.provider}</Text>
            <Text style={st.apptDate}>
              {new Date(nextAppt.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              {nextAppt.time ? ` at ${nextAppt.time}` : ""}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={C.t3} />
        </TouchableOpacity>
      )}

      {/* Abnormal Labs alert */}
      {abnLabs.length > 0 && (
        <Card style={st.alert}>
          <View style={st.alertH}>
            <Ionicons name="warning-outline" size={18} color={C.warn} />
            <Text style={st.alertT}>{abnLabs.length} Abnormal Lab Result{abnLabs.length > 1 ? "s" : ""}</Text>
          </View>
          {abnLabs.slice(0, 3).map((l) => (
            <View key={l.id} style={st.alertR}>
              <Text style={st.alertN}>{l.testName}</Text>
              <Text style={[st.alertV, { color: C.err }]}>{l.value} {l.unit}</Text>
            </View>
          ))}
        </Card>
      )}

      <SectionHeader title="Recent Activity" action="See All" onAction={() => router.push("/(tabs)/timeline" as any)} />
      {recent.map((e, i) => (
        <TimelineCard key={e.id} event={e} first={i === 0} last={i === recent.length - 1} />
      ))}

      <Disclaimer />
      {authUser?.email === "maria.santos@email.com" && (
        <View style={st.demo}>
          <Ionicons name="flask-outline" size={12} color={C.t3} />
          <Text style={st.demoT}>Demo account — Sample patient data</Text>
        </View>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  cnt: { padding: S.lg, paddingTop: S.md },
  greetRow: { flexDirection: "row", alignItems: "center", marginBottom: S.lg },
  greet: { fontSize: F.xxl, fontWeight: "700", color: C.t1, letterSpacing: -0.5 },
  greetS: { fontSize: F.sm, color: C.t3, marginTop: 2 },
  av: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.pri, alignItems: "center", justifyContent: "center" },
  avT: { fontSize: F.lg, fontWeight: "700", color: "#fff" },
  cta: { flexDirection: "row", alignItems: "center", backgroundColor: C.bgDark, borderRadius: R.lg, padding: S.lg, marginBottom: S.xl, gap: S.md, ...shadow },
  ctaI: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.priLt, alignItems: "center", justifyContent: "center" },
  ctaT: { fontSize: F.lg, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 },
  ctaS: { fontSize: F.sm, color: "#FFFFFF", marginTop: 2 },
  stats: { flexDirection: "row", gap: S.sm, marginBottom: S.xl },
  acts: { flexDirection: "row", gap: S.sm, marginBottom: S.lg },
  actBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, paddingVertical: S.md, backgroundColor: C.priFaint, borderRadius: R.md, borderWidth: 1, borderColor: C.priMut },
  actL: { fontSize: F.sm, fontWeight: "600", color: C.pri },
  shortcuts: { flexDirection: "row", gap: S.sm, marginBottom: S.xl },
  shortcut: { flex: 1, alignItems: "center", gap: S.xs },
  shortcutIcon: { width: 52, height: 52, borderRadius: R.lg, alignItems: "center", justifyContent: "center" },
  shortcutL: { fontSize: F.xs, color: C.t2, fontWeight: "500", textAlign: "center" },
  apptBanner: { flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.card, borderRadius: R.lg, padding: S.lg, marginBottom: S.xl, borderWidth: 1, borderColor: C.brd, ...shadow },
  apptIcon: { width: 40, height: 40, borderRadius: R.md, backgroundColor: C.priFaint, alignItems: "center", justifyContent: "center" },
  apptLabel: { fontSize: F.xs, color: C.t3, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  apptDoc: { fontSize: F.md, fontWeight: "600", color: C.t1, marginTop: 2 },
  apptDate: { fontSize: F.sm, color: C.pri, marginTop: 1 },
  alert: { backgroundColor: C.warnBg, borderColor: C.warn, marginBottom: S.xl },
  alertH: { flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.sm },
  alertT: { fontSize: F.md, fontWeight: "600", color: C.warn },
  alertR: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  alertN: { fontSize: F.sm, color: C.t1 },
  alertV: { fontSize: F.sm, fontWeight: "700" },
  demo: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.xs, paddingVertical: S.lg },
  demoT: { fontSize: F.xs, color: C.t3 },
});
