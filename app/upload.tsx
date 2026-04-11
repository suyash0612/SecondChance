import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore, mockExtract } from "../lib/store";
import { Card, Disclaimer } from "../components/UI";
import { C, S, F, R, shadow } from "../lib/theme";
import type { MedDocument } from "../lib/types";

export default function Upload() {
  const router = useRouter();
  const patient = useStore((s) => s.patient);
  const addDoc = useStore((s) => s.addDoc);
  const replaceDoc = useStore((s) => s.replaceDoc);
  const addEvents = useStore((s) => s.addEvents);
  const [busy, setBusy] = useState(false);
  const [busyName, setBusyName] = useState("");

  const process = async (name: string) => {
    const doc: MedDocument = {
      id: `doc-${Date.now()}`, fileName: name, mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(), classification: "Pending…", extractionStatus: "processing",
    };
    addDoc(doc);
    setBusy(true);
    setBusyName(name);
    try {
      const { updated, events } = await mockExtract(doc);
      replaceDoc(doc.id, updated);
      if (events.length > 0) addEvents(events);
      setBusy(false);
      Alert.alert("Record Processed",
        `"${name}" analyzed.\n\nType: ${updated.classification}\n${events.length} timeline event${events.length !== 1 ? "s" : ""} created.`,
        [{ text: "View Timeline", onPress: () => router.replace("/(tabs)/timeline") }, { text: "Upload Another", style: "cancel" }]);
    } catch {
      setBusy(false);
      Alert.alert("Error", "Could not process document.");
    }
  };

  const pickFile = async () => {
    try {
      const DP = await import("expo-document-picker");
      const res = await DP.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) { process(res.assets[0].name); return; }
    } catch { /* picker unavailable on web */ }
    process(`upload_${Date.now()}.pdf`);
  };

  const demos = [
    { n: "lab_results_recent.pdf", i: "flask-outline", c: C.labResult },
    { n: "prescription_new_med.pdf", i: "medkit-outline", c: C.medication },
    { n: "mri_shoulder_report.pdf", i: "scan-outline", c: C.imaging },
    { n: "office_visit_followup.pdf", i: "clipboard-outline", c: C.encounter },
  ];

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      <Text style={st.h}>Add a Medical Record</Text>
      <Text style={st.sub}>Upload a document or use a quick demo file. VitaLink will extract key data and update your timeline.</Text>

      {busy && (
        <Card style={st.proc}>
          <ActivityIndicator size="small" color={C.pri} />
          <View style={{ flex: 1 }}>
            <Text style={st.procT}>Processing "{busyName}"</Text>
            <Text style={st.procS}>Analyzing and extracting data…</Text>
          </View>
        </Card>
      )}

      <View style={st.methods}>
        <TouchableOpacity style={st.method} activeOpacity={0.8} onPress={pickFile} disabled={busy}>
          <View style={[st.mI, { backgroundColor: C.pri + "15" }]}><Ionicons name="document-outline" size={28} color={C.pri} /></View>
          <Text style={st.mT}>Choose File</Text><Text style={st.mS}>PDF or image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.method} activeOpacity={0.8} onPress={() => process(`camera_scan_${Date.now()}.jpg`)} disabled={busy}>
          <View style={[st.mI, { backgroundColor: C.imaging + "15" }]}><Ionicons name="camera-outline" size={28} color={C.imaging} /></View>
          <Text style={st.mT}>Scan Document</Text><Text style={st.mS}>Take a photo</Text>
        </TouchableOpacity>
      </View>

      <Text style={st.dL}>Quick Demo Uploads</Text>
      <Text style={st.dS}>Tap to simulate uploading and processing:</Text>
      {demos.map((d) => (
        <TouchableOpacity key={d.n} style={st.dRow} activeOpacity={0.7} onPress={() => process(d.n)} disabled={busy}>
          <View style={[st.dI, { backgroundColor: d.c + "15" }]}><Ionicons name={d.i as any} size={18} color={d.c} /></View>
          <Text style={st.dN}>{d.n}</Text>
          <Ionicons name="add-circle-outline" size={20} color={C.pri} />
        </TouchableOpacity>
      ))}

      <View style={{ height: S.xl }} />
      <Disclaimer />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg }, cnt: { padding: S.xl },
  h: { fontSize: F.xxl, fontWeight: "700", color: C.t1, letterSpacing: -0.5, marginBottom: S.sm },
  sub: { fontSize: F.md, color: C.t2, lineHeight: 22, marginBottom: S.xxl },
  proc: { flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.priFaint, borderColor: C.priMut, marginBottom: S.xl },
  procT: { fontSize: F.md, fontWeight: "600", color: C.pri },
  procS: { fontSize: F.sm, color: C.t3, marginTop: 1 },
  methods: { flexDirection: "row", gap: S.md, marginBottom: S.xxl },
  method: { flex: 1, alignItems: "center", backgroundColor: C.card, borderRadius: R.lg, padding: S.xl, borderWidth: 1, borderColor: C.brd, ...shadow },
  mI: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: S.md },
  mT: { fontSize: F.md, fontWeight: "600", color: C.t1, textAlign: "center" },
  mS: { fontSize: F.xs, color: C.t3, textAlign: "center", marginTop: 4 },
  dL: { fontSize: F.lg, fontWeight: "700", color: C.t1, marginBottom: 4 },
  dS: { fontSize: F.sm, color: C.t3, marginBottom: S.lg },
  dRow: { flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.card, borderRadius: R.md, padding: S.md, marginBottom: S.sm, borderWidth: 1, borderColor: C.brdLt },
  dI: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dN: { flex: 1, fontSize: F.sm, fontWeight: "500", color: C.t1 },
});
