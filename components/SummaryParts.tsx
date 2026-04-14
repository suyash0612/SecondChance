import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SourceBadge } from "./UI";
import { C, S, F, R, colorOpacity, colorWithOpacity } from "../lib/theme";

export function Section({ title, icon, color, children }: { title: string; icon: string; color: string; children: React.ReactNode }) {
  return (
    <View style={s.sec}>
      <View style={s.secH}><View style={[s.secI, { backgroundColor: colorWithOpacity(color, 8) }]}><Ionicons name={icon as any} size={16} color={color} /></View><Text style={s.secT}>{title}</Text></View>
      {children}
    </View>
  );
}

export function CondRow({ name, onset, docId }: { name: string; onset?: string; docId?: string }) {
  return (
    <View style={s.ir}>
      <View style={[s.dot, { backgroundColor: C.warn }]} />
      <View style={{ flex: 1 }}><Text style={s.it}>{name}</Text>{onset ? <Text style={s.im}>Since {onset}</Text> : null}</View>
      {docId ? <SourceBadge source="extracted" /> : <SourceBadge source="manual" />}
    </View>
  );
}

export function MedRow({ name, dosage, freq, reason }: { name: string; dosage: string; freq: string; reason?: string }) {
  return (
    <View style={s.ir}>
      <View style={[s.dot, { backgroundColor: C.medication }]} />
      <View style={{ flex: 1 }}><Text style={s.it}>{name} {dosage}</Text><Text style={s.im}>{freq}{reason ? ` · ${reason}` : ""}</Text></View>
    </View>
  );
}

export function AllergyRow({ substance, reaction, severity }: { substance: string; reaction: string; severity: string }) {
  const sc = /severe/i.test(severity) ? C.err : /moderate/i.test(severity) ? C.warn : C.t3;
  return (
    <View style={s.ir}>
      <View style={[s.dot, { backgroundColor: C.err }]} />
      <View style={{ flex: 1 }}><Text style={s.it}>{substance}</Text><Text style={s.im}>{reaction}</Text></View>
      <View style={[s.sev, { backgroundColor: colorWithOpacity(sc, 9) }]}><Text style={[s.sevT, { color: sc }]}>{severity}</Text></View>
    </View>
  );
}

export function LabRow({ test, value, unit, range, date }: { test: string; value: string; unit: string; range: string; date: string }) {
  return (
    <View style={s.ir}>
      <View style={[s.dot, { backgroundColor: C.labResult }]} />
      <View style={{ flex: 1 }}><Text style={s.it}>{test}: <Text style={{ fontWeight: "700", color: C.err }}>{value} {unit}</Text></Text><Text style={s.im}>Ref: {range} · {date}</Text></View>
      <View style={[s.sev, { backgroundColor: colorOpacity('err', 9) }]}><Text style={[s.sevT, { color: C.err }]}>Abnormal</Text></View>
    </View>
  );
}

export function EncRow({ date, type, provider, summary }: { date: string; type: string; provider?: string; summary?: string }) {
  return (
    <View style={s.er}><View style={{ width: 80 }}><Text style={s.ed}>{date}</Text><Text style={s.et}>{type}</Text></View>
      <View style={{ flex: 1 }}>{provider ? <Text style={s.ep}>{provider}</Text> : null}{summary ? <Text style={s.im} numberOfLines={2}>{summary}</Text> : null}</View>
    </View>
  );
}

export function QRow({ q, i }: { q: string; i: number }) {
  return (
    <View style={s.qr}><View style={s.qn}><Text style={s.qnt}>{i + 1}</Text></View><Text style={s.qt}>{q}</Text></View>
  );
}

export function GapRow({ text }: { text: string }) {
  return (
    <View style={s.gr}><Ionicons name="alert-circle-outline" size={14} color={C.warn} /><Text style={s.gt}>{text}</Text></View>
  );
}

const s = StyleSheet.create({
  sec: { marginBottom: S.xl },
  secH: { flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.md },
  secI: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  secT: { fontSize: F.md, fontWeight: "700", color: C.t1 },
  ir: { flexDirection: "row", alignItems: "flex-start", paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.brdLt, gap: S.sm },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  it: { fontSize: F.md, fontWeight: "500", color: C.t1, lineHeight: 21 },
  im: { fontSize: F.sm, color: C.t3, marginTop: 1, lineHeight: 18 },
  sev: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.pill, alignSelf: "flex-start", marginTop: 2 },
  sevT: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  er: { flexDirection: "row", paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.brdLt, gap: S.md },
  ed: { fontSize: F.sm, fontWeight: "600", color: C.t1 },
  et: { fontSize: F.xs, color: C.t3, marginTop: 1 },
  ep: { fontSize: F.sm, fontWeight: "500", color: C.t1, marginBottom: 2 },
  qr: { flexDirection: "row", alignItems: "flex-start", gap: S.sm, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.brdLt },
  qn: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.priFaint, alignItems: "center", justifyContent: "center" },
  qnt: { fontSize: F.xs, fontWeight: "700", color: C.pri },
  qt: { flex: 1, fontSize: F.md, color: C.t1, lineHeight: 21 },
  gr: { flexDirection: "row", alignItems: "flex-start", gap: S.sm, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.brdLt },
  gt: { flex: 1, fontSize: F.sm, color: C.t2, lineHeight: 19 },
});
