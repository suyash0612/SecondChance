import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { Card, SectionHeader, Disclaimer } from "../../components/UI";
import { C, S, F, R } from "../../lib/theme";

export default function Profile() {
  const p = useStore((s) => s.patient);
  const docs = useStore((s) => s.docs);
  const timeline = useStore((s) => s.timeline);
  const dob = new Date(p.dateOfBirth + "T12:00:00");
  const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const tap = (l: string) => Alert.alert(l, "Available in the full version of VitaLink.");
  const sets = [{ i: "notifications-outline", l: "Notifications", v: "On" }, { i: "finger-print-outline", l: "Biometric Lock", v: "Enabled" }, { i: "cloud-download-outline", l: "Offline Data", v: `${docs.length} cached` }, { i: "language-outline", l: "Language", v: "English" }];
  const priv = [{ i: "shield-checkmark-outline", l: "Data Encryption", v: "AES-256" }, { i: "eye-off-outline", l: "AI Processing", v: "Consented" }, { i: "share-outline", l: "Active Shares", v: "0" }, { i: "document-lock-outline", l: "Audit Log", v: `${timeline.length + 10} events` }, { i: "trash-outline", l: "Delete All Data", v: "", d: true }];

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      <Card style={{ marginBottom: S.xl }}>
        <View style={st.avRow}>
          <View style={st.av}><Text style={st.avT}>{p.firstName[0]}{p.lastName[0]}</Text></View>
          <View style={{ flex: 1 }}><Text style={st.name}>{p.firstName} {p.lastName}</Text><Text style={st.meta}>{p.sex} · Age {age} · DOB {dob.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text></View>
        </View>
        <IR i="call-outline" l="Phone" v={p.phone} /><IR i="mail-outline" l="Email" v={p.email} />
        {p.insurance && <IR i="card-outline" l="Insurance" v={p.insurance} />}
        {p.emergencyContact && <IR i="alert-circle-outline" l="Emergency" v={`${p.emergencyContact.name} (${p.emergencyContact.relationship})`} />}
      </Card>

      <SectionHeader title="Settings" />
      <Card>{sets.map((x, i) => <Row key={x.l} x={x} last={i === sets.length - 1} tap={tap} />)}</Card>

      <SectionHeader title="Privacy & Security" />
      <Card>{priv.map((x, i) => <Row key={x.l} x={x} last={i === priv.length - 1} tap={tap} />)}</Card>

      <SectionHeader title="About VitaLink" />
      <Card>
        <Text style={st.about}>VitaLink helps you organize your medical history and prepare for doctor visits.</Text>
        <View style={{ height: S.md }} /><Disclaimer /><View style={{ height: S.md }} />
        <Text style={st.ver}>Version 1.0.0 (Demo) · © 2026 VitaLink Health</Text>
      </Card>
      <View style={st.demo}><Ionicons name="flask-outline" size={12} color={C.t3} /><Text style={st.demoT}>Demo Mode — No real data stored</Text></View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function IR({ i, l, v }: { i: string; l: string; v: string }) {
  return (<View style={ir.r}><Ionicons name={i as any} size={16} color={C.t3} /><Text style={ir.l}>{l}</Text><Text style={ir.v} numberOfLines={1}>{v}</Text></View>);
}
const ir = StyleSheet.create({ r: { flexDirection: "row", alignItems: "center", gap: S.sm, paddingVertical: 5 }, l: { fontSize: F.sm, color: C.t3, width: 72 }, v: { flex: 1, fontSize: F.sm, fontWeight: "500", color: C.t1 } });

function Row({ x, last, tap }: { x: any; last: boolean; tap: (l: string) => void }) {
  return (
    <TouchableOpacity style={[st.sRow, last && { borderBottomWidth: 0 }]} onPress={() => tap(x.l)}>
      <Ionicons name={x.i} size={20} color={x.d ? C.err : C.t2} /><Text style={[st.sL, x.d && { color: C.err }]}>{x.l}</Text>
      {x.v ? <Text style={st.sV}>{x.v}</Text> : null}<Ionicons name="chevron-forward" size={16} color={C.t3} />
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg }, cnt: { padding: S.lg },
  avRow: { flexDirection: "row", alignItems: "center", gap: S.lg, marginBottom: S.lg, paddingBottom: S.lg, borderBottomWidth: 1, borderBottomColor: C.brdLt },
  av: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.pri, alignItems: "center", justifyContent: "center" },
  avT: { fontSize: F.xl, fontWeight: "700", color: "#fff" },
  name: { fontSize: F.xl, fontWeight: "700", color: C.t1 },
  meta: { fontSize: F.sm, color: C.t3, marginTop: 2 },
  sRow: { flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.brdLt },
  sL: { flex: 1, fontSize: F.md, color: C.t1 },
  sV: { fontSize: F.sm, color: C.t3 },
  about: { fontSize: F.sm, color: C.t2, lineHeight: 20 },
  ver: { fontSize: F.xs, color: C.t3, textAlign: "center" },
  demo: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.xs, paddingVertical: S.lg },
  demoT: { fontSize: F.xs, color: C.t3 },
});
