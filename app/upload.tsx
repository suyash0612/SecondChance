import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { extractDocument } from "../lib/extract";
import { Card, Btn, Disclaimer } from "../components/UI";
import { C, S, F, R, shadow, colorOpacity } from "../lib/theme";
import { useToast } from "../lib/useToast";
import type { MedDocument } from "../lib/types";

const STEPS = ["Reading document…", "Extracting structured data…", "Updating records & timeline…"];

// ocr field = seeded stub text simulating what an OCR pass would produce
const DEMOS = [
  { n: "lab_results_recent.pdf",    i: "flask-outline",     c: C.labResult,  sub: "Lab panel · Quest Diagnostics",
    ocr: "PATIENT LAB RESULTS - Quest Diagnostics\nPatient: Maria Santos DOB: 03/15/1978\nHemoglobin A1c: 7.2% HIGH\nLDL Cholesterol: 142 mg/dL HIGH\nFasting Glucose: 138 mg/dL HIGH\nOrdering Physician: Dr. Aisha Patel" },
  { n: "prescription_new_med.pdf",  i: "medkit-outline",    c: C.medication, sub: "New prescription · Dr. Patel" },
  { n: "mri_shoulder_report.pdf",   i: "scan-outline",      c: C.imaging,    sub: "Imaging report · Mercy Radiology" },
  { n: "office_visit_followup.pdf", i: "clipboard-outline", c: C.encounter,  sub: "Progress note · Family Medicine",
    ocr: "PROGRESS NOTE - Downtown Family Medicine\nPatient: Maria Santos DOB: 03/15/1978\nDate of Visit: 10/28/2025\nChief Complaint: Annual physical examination\nProvider: Dr. Sarah Chen MD\nBlood Pressure: 134/86 mmHg\nAssessment: Routine annual exam. Continue current medications." },
];

type SuccessState = { docId: string; name: string; classification: string; eventCount: number; extractionPath: "mock" | "ocr_stub" | "ai_extracted" };

export default function Upload() {
  const toast = useToast();  const router = useRouter();
  const addDoc = useStore((s) => s.addDoc);
  const replaceDoc = useStore((s) => s.replaceDoc);
  const addEvents = useStore((s) => s.addEvents);
  const addMeds = useStore((s) => s.addMeds);
  const addConditions = useStore((s) => s.addConditions);
  const addAllergies = useStore((s) => s.addAllergies);
  const addLabs = useStore((s) => s.addLabs);
  const addEncounters = useStore((s) => s.addEncounters);

  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [busyName, setBusyName] = useState("");
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const process = async (
    name: string,
    ocrText?: string,
    fileAsset?: { uri: string; name: string; mimeType: string },
  ) => {
    setSuccess(null);
    const fileUri = fileAsset?.uri;
    const doc: MedDocument = {
      id: `doc-${Date.now()}`, fileName: name, mimeType: fileAsset?.mimeType ?? "application/pdf",
      uploadedAt: new Date().toISOString(), classification: "Pending…", extractionStatus: "processing",
      ...(fileUri ? { fileUri } : {}),
    };
    addDoc(doc);
    setBusy(true);
    setBusyName(name);
    setStep(0);

    const stepTimer1 = setTimeout(() => setStep(1), 500);
    const stepTimer2 = setTimeout(() => setStep(2), 1100);

    try {
      const result = await extractDocument(doc, ocrText, fileAsset);
      const { updated, events, medications, conditions, allergies, labs, encounters, extractionPath } = result;
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      replaceDoc(doc.id, updated);
      if (events.length > 0) addEvents(events);
      if (medications?.length) addMeds(medications);
      if (conditions?.length) addConditions(conditions);
      if (allergies?.length) addAllergies(allergies);
      if (labs?.length) addLabs(labs);
      if (encounters?.length) addEncounters(encounters);
      setBusy(false);
      setSuccess({ docId: doc.id, name, classification: updated.classification, eventCount: events.length, extractionPath });
      toast.success("Document processed successfully!");    } catch (error) {
      toast.error("Failed to process document. Please try again.");
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setBusy(false);
    }
  };

  const pickFile = async () => {
    // Web: use a hidden <input type="file">
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/pdf,image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const uri = URL.createObjectURL(file);
        process(file.name, undefined, { uri, name: file.name, mimeType: file.type || "application/pdf" });
      };
      input.click();
      return;
    }

    // Native (iOS / Android): use Expo document picker
    try {
      // eslint-disable-next-line global-require
      const DP = require("expo-document-picker");
      const res = await DP.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        process(asset.name, undefined, { uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? "application/pdf" });
        return;
      }
    } catch (e) {
      console.warn("[VitaLink] Document picker failed:", e);
    }
    process(`upload_${Date.now()}.pdf`);
  };

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      <TouchableOpacity style={st.backBtn} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="arrow-back" size={22} color={C.t1} />
      </TouchableOpacity>
      <Text style={st.h}>Add a Medical Record</Text>
      <Text style={st.sub}>Upload any document — Second Opinion extracts structured data and adds it to your records and timeline automatically.</Text>

      {/* Processing state */}
      {busy && (
        <Card style={st.proc}>
          <View style={st.procTop}>
            <ActivityIndicator size="small" color={C.pri} />
            <View style={{ flex: 1 }}>
              <Text style={st.procT}>Processing "{busyName}"</Text>
              <Text style={st.procS}>{STEPS[step]}</Text>
            </View>
          </View>
          <View style={st.stepRow}>
            {STEPS.map((_, i) => (
              <View key={i} style={[st.stepDot, { backgroundColor: i <= step ? C.pri : C.brd }]} />
            ))}
          </View>
        </Card>
      )}

      {/* Success state */}
      {!busy && success && (
        <Card style={st.success}>
          <View style={st.successTop}>
            <View style={st.successIcon}><Ionicons name="checkmark-circle" size={24} color={C.ok} /></View>
            <View style={{ flex: 1 }}>
              <Text style={st.successT}>Record Added Successfully</Text>
              <Text style={st.successS}>{success.classification} · {success.eventCount} timeline event{success.eventCount !== 1 ? "s" : ""} created</Text>
            </View>
          </View>
          <View style={st.provenanceRow}>
            <Ionicons name="shield-checkmark-outline" size={13} color={C.ok} />
            <Text style={st.provenanceT}>Added to Records &amp; Timeline · Patient-controlled · Not shared without consent</Text>
          </View>
          <View style={st.pathRow}>
            <Ionicons
              name={success.extractionPath === "ai_extracted" ? "sparkles-outline" : success.extractionPath === "ocr_stub" ? "scan-outline" : "flask-outline"}
              size={12}
              color={success.extractionPath !== "mock" ? C.pri : C.t3}
            />
            <Text style={[st.pathT, success.extractionPath !== "mock" && { color: C.pri, fontWeight: "600" }]}>
              {success.extractionPath === "ai_extracted"
                ? "AI extracted · Claude + OCR pipeline"
                : success.extractionPath === "ocr_stub"
                ? "OCR text path · structured extraction"
                : "Mock extraction path"}
            </Text>
          </View>
          <View style={st.successActs}>
            <Btn title="View Record" onPress={() => router.push(`/record/${success.docId}` as any)} icon="document-text-outline" variant="primary" style={{ flex: 1 }} />
            <Btn title="Timeline" onPress={() => router.replace("/(tabs)/timeline" as any)} icon="git-branch-outline" variant="outline" style={{ flex: 1 }} />
          </View>
        </Card>
      )}

      {/* Upload methods */}
      <View style={st.methods}>
        <TouchableOpacity style={[st.method, busy && st.methodDim]} activeOpacity={0.8} onPress={pickFile} disabled={busy}>
          <View style={[st.mI, { backgroundColor: C.priFaint }]}><Ionicons name="document-outline" size={28} color={C.pri} /></View>
          <Text style={st.mT}>Choose File</Text>
          <Text style={st.mS}>PDF or image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.method, busy && st.methodDim]} activeOpacity={0.8} onPress={() => process(`camera_scan_${Date.now()}.jpg`)} disabled={busy}>
          <View style={[st.mI, { backgroundColor: colorOpacity('imaging', 8) }]}><Ionicons name="camera-outline" size={28} color={C.imaging} /></View>
          <Text style={st.mT}>Scan Document</Text>
          <Text style={st.mS}>Take a photo</Text>
        </TouchableOpacity>
      </View>

      {/* Demo uploads */}
      <Text style={st.dL}>Quick Demo Uploads</Text>
      <Text style={st.dS}>Tap to simulate uploading and AI extraction:</Text>
      {DEMOS.map((d) => (
        <TouchableOpacity key={d.n} style={[st.dRow, busy && st.methodDim]} activeOpacity={0.7} onPress={() => process(d.n, (d as any).ocr)} disabled={busy}>
          <View style={[st.dI, { backgroundColor: d.c + "15" }]}><Ionicons name={d.i as any} size={18} color={d.c} /></View>
          <View style={{ flex: 1 }}>
            <Text style={st.dN}>{d.n}</Text>
            <View style={st.dSubRow}>
              <Text style={st.dSub}>{d.sub}</Text>
              {(d as any).ocr && <View style={st.ocrBadge}><Text style={st.ocrBadgeT}>OCR</Text></View>}
            </View>
          </View>
          <Ionicons name="add-circle-outline" size={20} color={busy ? C.t3 : C.pri} />
        </TouchableOpacity>
      ))}

      <View style={{ height: S.xl }} />
      <Disclaimer />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  cnt: { padding: S.xl },
  backBtn: { marginBottom: S.lg, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  h: { fontSize: F.xxl, fontWeight: "700", color: C.t1, letterSpacing: -0.5, marginBottom: S.sm },
  sub: { fontSize: F.md, color: C.t2, lineHeight: 22, marginBottom: S.xxl },

  proc: { backgroundColor: C.priFaint, borderColor: C.priMut, marginBottom: S.xl, padding: S.lg },
  procTop: { flexDirection: "row", alignItems: "center", gap: S.md, marginBottom: S.md },
  procT: { fontSize: F.md, fontWeight: "600", color: C.pri },
  procS: { fontSize: F.sm, color: C.t3, marginTop: 1 },
  stepRow: { flexDirection: "row", gap: S.sm },
  stepDot: { flex: 1, height: 3, borderRadius: 2 },

  success: { backgroundColor: C.okBg, borderColor: C.ok, borderWidth: 1, marginBottom: S.xl, padding: S.lg },
  successTop: { flexDirection: "row", alignItems: "flex-start", gap: S.md, marginBottom: S.sm },
  successIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.okBg, alignItems: "center", justifyContent: "center" },
  successT: { fontSize: F.md, fontWeight: "700", color: C.ok },
  successS: { fontSize: F.sm, color: C.t2, marginTop: 2 },
  provenanceRow: { flexDirection: "row", alignItems: "flex-start", gap: S.xs, marginBottom: S.md },
  provenanceT: { flex: 1, fontSize: F.xs, color: C.ok, lineHeight: 17 },
  successActs: { flexDirection: "row", gap: S.sm },

  methods: { flexDirection: "row", gap: S.md, marginBottom: S.xxl },
  method: { flex: 1, alignItems: "center", backgroundColor: C.card, borderRadius: R.lg, padding: S.xl, borderWidth: 1, borderColor: C.brd, ...shadow },
  methodDim: { opacity: 0.45 },
  mI: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: S.md },
  mT: { fontSize: F.md, fontWeight: "600", color: C.t1, textAlign: "center" },
  mS: { fontSize: F.xs, color: C.t3, textAlign: "center", marginTop: 4 },

  dL: { fontSize: F.lg, fontWeight: "700", color: C.t1, marginBottom: 4 },
  dS: { fontSize: F.sm, color: C.t3, marginBottom: S.lg },
  dRow: { flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.card, borderRadius: R.md, padding: S.md, marginBottom: S.sm, borderWidth: 1, borderColor: C.brdLt },
  dI: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dN: { fontSize: F.sm, fontWeight: "600", color: C.t1 },
  dSubRow: { flexDirection: "row", alignItems: "center", gap: S.xs, marginTop: 2 },
  dSub: { fontSize: F.xs, color: C.t3 },
  ocrBadge: { backgroundColor: C.priFaint, borderRadius: R.pill, paddingHorizontal: 5, paddingVertical: 1 },
  ocrBadgeT: { fontSize: 9, fontWeight: "700", color: C.pri, letterSpacing: 0.4 },
  pathRow: { flexDirection: "row", alignItems: "center", gap: S.xs, marginTop: S.xs },
  pathT: { fontSize: F.xs, color: C.t3 },
});
