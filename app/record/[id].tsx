import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { Card, Badge, SourceBadge, SectionHeader } from "../../components/UI";
import { C, S, F, R, shadow, sourceLabel } from "../../lib/theme";

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? C.ok : pct >= 75 ? C.warn : C.err;
  return (
    <View style={[st.conf, { backgroundColor: color + "18" }]}>
      <Ionicons name="shield-checkmark-outline" size={11} color={color} />
      <Text style={[st.confT, { color }]}>{pct}% confidence</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={st.row}>
      <Text style={st.rowL}>{label}</Text>
      <Text style={st.rowV}>{value}</Text>
    </View>
  );
}

export default function RecordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const doc = useStore((s) => s.docs.find((d) => d.id === id));
  const meds = useStore((s) => s.meds.filter((m) => m.sourceDocId === id));
  const conditions = useStore((s) => s.conditions.filter((c) => c.sourceDocId === id));
  const labs = useStore((s) => s.labs.filter((l) => l.sourceDocId === id));
  const encounters = useStore((s) => s.encounters.filter((e) => e.sourceDocId === id));

  if (!doc) {
    return (
      <View style={st.empty}>
        <Ionicons name="document-outline" size={48} color={C.t3} />
        <Text style={st.emptyT}>Record not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={st.back}>
          <Text style={st.backT}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const uploadDate = new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const hasExtracted = doc.extractionStatus === "completed";

  const noExtractedData = conditions.length === 0 && meds.length === 0 && labs.length === 0 && encounters.length === 0;
  const isMock = doc.extractedProvider === "Provider (extracted)" || doc.extractedProvider === "Unknown Provider";

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      {/* Back button */}
      <TouchableOpacity style={st.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/records" as any)}>
        <Ionicons name="arrow-back" size={22} color={C.t1} />
        <Text style={st.backBtnT}>Records</Text>
      </TouchableOpacity>

      {/* Header */}
      <Card style={st.header}>
        <View style={st.hRow}>
          <View style={st.hIcon}>
            <Ionicons name="document-text-outline" size={24} color={C.pri} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.hName} numberOfLines={2}>{doc.fileName}</Text>
            <View style={st.hBadges}>
              <Badge label={doc.classification} color={C.pri} />
              <SourceBadge source={doc.extractionStatus === "completed" ? "extracted" : "uploaded"} />
            </View>
          </View>
        </View>
      </Card>

      {/* Metadata */}
      <Card style={st.section}>
        <Text style={st.secTitle}>Document Info</Text>
        <Row label="Uploaded" value={uploadDate} />
        {doc.pages != null && <Row label="Pages" value={`${doc.pages}`} />}
        {doc.extractedDate && <Row label="Document Date" value={doc.extractedDate} />}
        {doc.extractedProvider && <Row label="Provider" value={doc.extractedProvider} />}
        {doc.extractedFacility && <Row label="Facility" value={doc.extractedFacility} />}
        <Row label="Extraction" value={hasExtracted ? "Completed" : doc.extractionStatus} />
      </Card>

      {/* Extracted Conditions */}
      {conditions.length > 0 && (
        <Card style={st.section}>
          <Text style={st.secTitle}>Conditions Found</Text>
          {conditions.map((c) => (
            <View key={c.id} style={st.item}>
              <View style={st.itemLeft}>
                <Ionicons name="heart-outline" size={16} color={C.diagnosis} />
                <View style={{ flex: 1 }}>
                  <Text style={st.itemName}>{c.name}</Text>
                  {c.icd10 && <Text style={st.itemSub}>{c.icd10} · {c.status}</Text>}
                </View>
              </View>
              <ConfidenceBadge value={c.confidence} />
            </View>
          ))}
        </Card>
      )}

      {/* Extracted Medications */}
      {meds.length > 0 && (
        <Card style={st.section}>
          <Text style={st.secTitle}>Medications Found</Text>
          {meds.map((m) => (
            <View key={m.id} style={st.item}>
              <View style={st.itemLeft}>
                <Ionicons name="medkit-outline" size={16} color={C.medication} />
                <View style={{ flex: 1 }}>
                  <Text style={st.itemName}>{m.name} {m.dosage}</Text>
                  <Text style={st.itemSub}>{m.frequency}{m.reason ? ` · ${m.reason}` : ""}</Text>
                </View>
              </View>
              <ConfidenceBadge value={m.confidence} />
            </View>
          ))}
        </Card>
      )}

      {/* Extracted Labs */}
      {labs.length > 0 && (
        <Card style={st.section}>
          <Text style={st.secTitle}>Lab Results Found</Text>
          {labs.map((l) => (
            <View key={l.id} style={st.item}>
              <View style={st.itemLeft}>
                <Ionicons name="flask-outline" size={16} color={C.labResult} />
                <View style={{ flex: 1 }}>
                  <Text style={st.itemName}>{l.testName}</Text>
                  <Text style={[st.itemSub, l.flag !== "normal" && { color: C.err }]}>
                    {l.value} {l.unit}{l.refLow != null ? ` · ref ${l.refLow}–${l.refHigh}` : ""}
                  </Text>
                </View>
              </View>
              <ConfidenceBadge value={l.confidence} />
            </View>
          ))}
        </Card>
      )}

      {/* Extracted Encounters */}
      {encounters.length > 0 && (
        <Card style={st.section}>
          <Text style={st.secTitle}>Encounters Found</Text>
          {encounters.map((e) => (
            <View key={e.id} style={st.item}>
              <View style={st.itemLeft}>
                <Ionicons name="clipboard-outline" size={16} color={C.encounter} />
                <View style={{ flex: 1 }}>
                  <Text style={st.itemName}>{e.complaint || e.type}</Text>
                  {e.summary && <Text style={st.itemSub} numberOfLines={2}>{e.summary}</Text>}
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Empty extraction state */}
      {hasExtracted && noExtractedData && (
        <Card style={st.noDataCard}>
          <View style={st.noDataRow}>
            <Ionicons name={isMock ? "cloud-offline-outline" : "information-circle-outline"} size={20} color={C.warn} />
            <View style={{ flex: 1 }}>
              <Text style={st.noDataT}>{isMock ? "Backend not reached — limited extraction" : "No structured data found"}</Text>
              <Text style={st.noDataS}>
                {isMock
                  ? "Start the Python backend (port 8000) and re-upload for AI-powered extraction of conditions, medications, and labs."
                  : "This document did not contain recognisable clinical entities."}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Provenance footer */}
      <View style={st.prov}>
        <Ionicons name="shield-checkmark-outline" size={13} color={C.t3} />
        <Text style={st.provT}>
          Source: {sourceLabel(doc.extractionStatus === "completed" ? "extracted" : "uploaded")} · Second Opinion
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  cnt: { padding: S.lg },
  backBtn: { flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: S.lg },
  backBtnT: { fontSize: F.md, color: C.pri, fontWeight: "500" },
  noDataCard: { backgroundColor: C.warnBg, borderColor: C.warn + "40", borderWidth: 1, marginBottom: S.md, padding: S.lg },
  noDataRow: { flexDirection: "row", alignItems: "flex-start", gap: S.md },
  noDataT: { fontSize: F.sm, fontWeight: "600", color: C.warn, marginBottom: 4 },
  noDataS: { fontSize: F.xs, color: C.warn, lineHeight: 18, opacity: 0.85 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: S.lg, backgroundColor: C.bg },
  emptyT: { fontSize: F.lg, color: C.t2 },
  back: { paddingVertical: S.sm, paddingHorizontal: S.lg, backgroundColor: C.priFaint, borderRadius: R.md },
  backT: { color: C.pri, fontWeight: "600" },
  header: { marginBottom: S.md, padding: S.lg },
  hRow: { flexDirection: "row", alignItems: "flex-start", gap: S.md },
  hIcon: { width: 44, height: 44, borderRadius: R.md, backgroundColor: C.priFaint, alignItems: "center", justifyContent: "center" },
  hName: { fontSize: F.md, fontWeight: "600", color: C.t1, marginBottom: S.xs },
  hBadges: { flexDirection: "row", gap: S.xs, flexWrap: "wrap" },
  section: { marginBottom: S.md, padding: S.lg },
  secTitle: { fontSize: F.sm, fontWeight: "700", color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: S.md },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: S.xs + 2, borderBottomWidth: 1, borderBottomColor: C.brdLt },
  rowL: { fontSize: F.sm, color: C.t3 },
  rowV: { fontSize: F.sm, color: C.t1, fontWeight: "500", flex: 1, textAlign: "right" },
  item: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.brdLt, gap: S.sm },
  itemLeft: { flexDirection: "row", alignItems: "flex-start", gap: S.sm, flex: 1 },
  itemName: { fontSize: F.sm, fontWeight: "600", color: C.t1 },
  itemSub: { fontSize: F.xs, color: C.t3, marginTop: 2 },
  conf: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: S.xs + 2, paddingVertical: 3, borderRadius: R.pill },
  confT: { fontSize: 10, fontWeight: "600" },
  prov: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.xs, marginTop: S.md },
  provT: { fontSize: F.xs, color: C.t3 },
});
