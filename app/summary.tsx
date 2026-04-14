import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { Card, Btn, Disclaimer } from "../components/UI";
import { Section, CondRow, MedRow, AllergyRow, LabRow, EncRow, QRow, GapRow } from "../components/SummaryParts";
import { C, S, F, R, shadow } from "../lib/theme";

export default function SummaryScreen() {
  const summary = useStore((s) => s.summary);
  const p = useStore((s) => s.patient);
  const docs = useStore((s) => s.docs);
  const genSummary = useStore((s) => s.genSummary);
  const [mode, setMode] = useState<"clin" | "patient">("clin");

  if (!summary) {
    return (
      <View style={st.empty}>
        <Ionicons name="document-text-outline" size={64} color={C.t3} />
        <Text style={st.emptyT}>No Summary Generated</Text>
        <Text style={st.emptyM}>Tap below to create a doctor-ready summary from your records.</Text>
        <Btn title="Generate Summary" onPress={genSummary} icon="sparkles-outline" />
      </View>
    );
  }

  const genDate = new Date(summary.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const doShare = async () => {
    const lines = [
      "SECOND OPINION VISIT SUMMARY", `Patient: ${p.firstName} ${p.lastName}`, "",
      "ALLERGIES:", ...summary.allergies.map((a) => `⚠ ${a.substance} — ${a.reaction} (${a.severity})`), "",
      "CONDITIONS:", ...summary.conditions.map((c) => `• ${c.name}${c.onset ? ` (since ${c.onset})` : ""}`), "",
      "MEDICATIONS:", ...summary.medications.map((m) => `• ${m.name} ${m.dosage} — ${m.freq}`), "",
      "ABNORMAL LABS:", ...summary.abnormalLabs.map((l) => `• ${l.test}: ${l.value} ${l.unit} (ref: ${l.range})`), "",
      "---", summary.disclaimer,
    ];
    try { await Share.share({ title: "Second Opinion Summary", message: lines.join("\n") }); } catch {}
  };

  const doPrint = () => {
    if (typeof window !== "undefined" && window.print) {
      window.print();
    }
  };

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      {/* Header */}
      <Card style={st.header}>
        <View style={st.hTop}>
          <View style={{ flex: 1 }}>
            <Text style={st.hName}>{p.firstName} {p.lastName}</Text>
            <Text style={st.hMeta}>DOB: {new Date(p.dateOfBirth + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {p.sex}</Text>
          </View>
          <View style={st.aiBadge}><Ionicons name="sparkles" size={14} color={C.generated} /><Text style={st.aiBadgeT}>AI Generated</Text></View>
        </View>
        {summary.visitProvider && (
          <View style={st.ctx}>
            <Text style={st.ctxT}>Visit Context</Text>
            <Text style={st.ctxM}>{summary.visitProvider} · {summary.visitSpecialty}</Text>
            {summary.visitReason && <Text style={st.ctxM}>Reason: {summary.visitReason}</Text>}
          </View>
        )}
        <View style={st.genRow}><Ionicons name="time-outline" size={13} color={C.t3} /><Text style={st.gen}>Last updated {genDate}</Text></View>
        {docs.length > 0 && <View style={st.genRow}><Ionicons name="document-text-outline" size={13} color={C.t3} /><Text style={st.gen}>Based on {docs.length} document{docs.length !== 1 ? "s" : ""}</Text></View>}
      </Card>

      {/* Toggle */}
      <View style={st.toggle}>
        {(["clin", "patient"] as const).map((m) => (
          <TouchableOpacity key={m} style={[st.togBtn, mode === m && st.togAct]} onPress={() => setMode(m)}>
            <Ionicons name={m === "clin" ? "medkit-outline" : "person-outline"} size={16} color={mode === m ? "#fff" : C.t2} />
            <Text style={[st.togT, mode === m && { color: "#fff" }]}>{m === "clin" ? "Clinician View" : "Patient View"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Body */}
      <Card style={st.body}>
        <Section title="Allergies" icon="alert-circle-outline" color={C.err}>
          {summary.allergies.length === 0 ? <Text style={st.none}>No known allergies</Text> :
            summary.allergies.map((a, i) => <AllergyRow key={i} substance={a.substance} reaction={a.reaction} severity={a.severity} />)}
        </Section>

        <Section title="Active Conditions" icon="heart-outline" color={C.diagnosis}>
          {summary.conditions.map((c, i) => <CondRow key={i} name={c.name} onset={c.onset} docId={c.docId} />)}
        </Section>

        <Section title="Current Medications" icon="medkit-outline" color={C.medication}>
          {summary.medications.map((m, i) => <MedRow key={i} name={m.name} dosage={m.dosage} freq={m.freq} reason={m.reason} />)}
        </Section>

        {summary.abnormalLabs.length > 0 && (
          <Section title={mode === "patient" ? "Results to Review" : "Recent Abnormal Results"} icon="flask-outline" color={C.labResult}>
            {summary.abnormalLabs.map((l, i) => <LabRow key={i} test={l.test} value={l.value} unit={l.unit} range={l.range} date={l.date} />)}
          </Section>
        )}

        <Section title={mode === "patient" ? "Recent Visits" : "Recent Encounters"} icon="clipboard-outline" color={C.encounter}>
          {summary.encounters.map((e, i) => <EncRow key={i} date={e.date} type={e.type} provider={e.provider} summary={e.summary} />)}
        </Section>

        {summary.procedures.length > 0 && (
          <Section title="Procedures" icon="medical-outline" color={C.procedure}>
            {summary.procedures.map((pr, i) => (
              <View key={i} style={st.procRow}><Text style={st.procN}>{pr.name}</Text><Text style={st.procD}>{pr.date}</Text></View>
            ))}
          </Section>
        )}

        <Section title="Patient Questions" icon="help-circle-outline" color={C.pri}>
          {summary.questions.map((q, i) => <QRow key={i} q={q} i={i} />)}
        </Section>

      </Card>

      {summary.gaps.length > 0 && (
        <Card style={st.gapsCard}>
          <View style={st.gapsH}>
            <Ionicons name="warning-outline" size={18} color={C.warn} />
            <Text style={st.gapsT}>Care Gaps & Missing Data</Text>
            <View style={st.gapsCt}><Text style={st.gapsCtT}>{summary.gaps.length}</Text></View>
          </View>
          {summary.gaps.map((g, i) => <GapRow key={i} text={g} />)}
        </Card>
      )}

      {/* Disclaimer */}
      <Card style={st.discCard}>
        <Ionicons name="shield-checkmark-outline" size={20} color={C.info} />
        <Text style={st.discText}>{summary.disclaimer}</Text>
      </Card>

      {/* Actions */}
      <View style={st.acts}>
        <Btn title="Share with Doctor" onPress={doShare} icon="share-outline" variant="primary" style={{ flex: 1 }} />
        <Btn title="Export PDF" onPress={() => {
          if (typeof window !== "undefined" && window.print) {
            window.print();
          }
        }} icon="download-outline" variant="outline" style={{ flex: 1 }} />
      </View>
      <Btn title="Regenerate Summary" onPress={() => { genSummary(); Alert.alert("Updated", "Summary regenerated."); }} icon="refresh-outline" variant="secondary" style={{ marginBottom: S.xl }} />

      <Disclaimer /><View style={{ height: 40 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg }, cnt: { padding: S.lg },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: S.lg, backgroundColor: C.bg },
  emptyT: { fontSize: F.xl, fontWeight: "700", color: C.t1 },
  emptyM: { fontSize: F.md, color: C.t3, textAlign: "center", lineHeight: 22 },
  header: { backgroundColor: C.bgDark, borderColor: C.bgDark, marginBottom: S.lg },
  hTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: S.md },
  hName: { fontSize: F.xxl, fontWeight: "700", color: C.tInv, letterSpacing: -0.5 },
  hMeta: { fontSize: F.sm, color: C.priMut, marginTop: 2 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.generated + "20", paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.pill },
  aiBadgeT: { fontSize: F.xs, fontWeight: "600", color: C.generated },
  ctx: { backgroundColor: C.priLt + "20", borderRadius: R.md, padding: S.md, marginBottom: S.md },
  ctxT: { fontSize: F.sm, fontWeight: "700", color: C.priMut, marginBottom: 4 },
  ctxM: { fontSize: F.sm, color: C.priMut, lineHeight: 19 },
  gen: { fontSize: F.xs, color: C.t3 },
  genRow: { flexDirection: "row", alignItems: "center", gap: S.xs, marginTop: 4 },
  gapsCard: { backgroundColor: C.warnBg, borderColor: C.warn + "40", borderWidth: 1, marginBottom: S.lg, padding: S.lg },
  gapsH: { flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.md },
  gapsT: { fontSize: F.md, fontWeight: "700", color: C.warn, flex: 1 },
  gapsCt: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.warn + "20", alignItems: "center", justifyContent: "center" },
  gapsCtT: { fontSize: F.xs, fontWeight: "700", color: C.warn },
  toggle: { flexDirection: "row", backgroundColor: C.bgAlt, borderRadius: R.md, padding: 3, marginBottom: S.lg, borderWidth: 1, borderColor: C.brd },
  togBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, paddingVertical: S.sm + 2, borderRadius: R.sm },
  togAct: { backgroundColor: C.pri, ...shadow },
  togT: { fontSize: F.sm, fontWeight: "600", color: C.t2 },
  body: { marginBottom: S.lg, padding: S.xl },
  none: { fontSize: F.sm, color: C.t3, fontStyle: "italic", paddingVertical: S.sm },
  procRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.brdLt },
  procN: { fontSize: F.md, fontWeight: "500", color: C.t1 },
  procD: { fontSize: F.sm, color: C.t3 },
  discCard: { flexDirection: "row", alignItems: "flex-start", gap: S.md, backgroundColor: C.infoBg, borderColor: C.info + "25", marginBottom: S.xl },
  discText: { flex: 1, fontSize: F.sm, color: C.info, lineHeight: 19 },
  acts: { flexDirection: "row", gap: S.md, marginBottom: S.md },
});
