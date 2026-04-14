import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MedDocument } from "../lib/types";
import { Card, Badge } from "./UI";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { C, S, F, R, colorOpacity, colorWithOpacity } from "../lib/theme";

const IC: Record<string, string> = { "Lab Report": "flask-outline", "Progress Note": "clipboard-outline", "Discharge Summary": "exit-outline", "Imaging Report": "scan-outline", "Prescription": "medkit-outline", "Consult Note": "people-outline" };
const CC: Record<string, string> = { "Lab Report": C.labResult, "Progress Note": C.encounter, "Discharge Summary": C.erVisit, "Imaging Report": C.imaging, "Prescription": C.medication, "Consult Note": C.diagnosis };

export function DocCard({ doc, onPress, onDelete }: { doc: MedDocument; onPress?: () => void; onDelete?: (id: string) => void }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const ico = IC[doc.classification] || "document-outline";
  const col = CC[doc.classification] || C.t3;
  const sc = doc.extractionStatus === "completed" ? C.ok : doc.extractionStatus === "processing" ? C.warn : doc.extractionStatus === "failed" ? C.err : C.t3;
  const sl = doc.extractionStatus === "completed" ? "Extracted" : doc.extractionStatus === "processing" ? "Processing…" : doc.extractionStatus === "failed" ? "Failed" : "Pending";
  const d = new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Extraction method badge
  const extractionIcon = doc.extractionPath === "ai_extracted" ? "sparkles-outline" : doc.extractionPath === "ocr_stub" ? "scan-outline" : "flask-outline";
  const extractionLabel = doc.extractionPath === "ai_extracted" ? "AI Extracted" : doc.extractionPath === "ocr_stub" ? "OCR" : "Demo Data";
  const extractionColor = doc.extractionPath !== "mock" ? C.pri : C.t3;

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete?.(doc.id);
  };

  return (
    <>
      <Card onPress={onPress} style={s.c}>
      <View style={s.row}>
        <View style={[s.ico, { backgroundColor: colorWithOpacity(col, 8) }]}><Ionicons name={ico as any} size={22} color={col} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{doc.fileName}</Text>
          <Text style={s.cls}>{doc.classification}</Text>
          <View style={s.mr}><Badge label={sl} color={sc} small /><Text style={s.mt}>{d}</Text>{doc.pages ? <Text style={s.mt}>{doc.pages} pg</Text> : null}</View>
        </View>
        <View style={s.actions}>
          <Ionicons name="chevron-forward" size={18} color={C.t3} />
          {onDelete && <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Ionicons name="trash-outline" size={16} color={C.err} /></TouchableOpacity>}
        </View>
      </View>
      {(doc.extractedProvider || doc.extractedFacility) && (
        <View style={s.ext}>
          {doc.extractedProvider && <View style={s.ei}><Ionicons name="person-outline" size={12} color={C.t3} /><Text style={s.et}>{doc.extractedProvider}</Text></View>}
          {doc.extractedFacility && <View style={s.ei}><Ionicons name="business-outline" size={12} color={C.t3} /><Text style={s.et}>{doc.extractedFacility}</Text></View>}
        </View>
      )}
      {doc.extractionPath && (
        <View style={s.extractionBadgeRow}>
          <Ionicons name={extractionIcon as any} size={12} color={extractionColor} style={{ marginRight: 4 }} />
          <Text style={[s.extractionLabel, { color: extractionColor }]}>{extractionLabel}</Text>
        </View>
      )}
    </Card>
      <DeleteConfirmModal
        visible={showDeleteConfirm}
        title="Delete Record"
        message="Are you sure you want to delete this record? This cannot be undone."
        itemName={doc.fileName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

const s = StyleSheet.create({
  c: { padding: S.md },
  row: { flexDirection: "row", alignItems: "center", gap: S.md },
  ico: { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", alignItems: "center", gap: S.sm },
  name: { fontSize: F.md, fontWeight: "600", color: C.t1, marginBottom: 2 },
  cls: { fontSize: F.sm, color: C.t2, marginBottom: 6 },
  mr: { flexDirection: "row", alignItems: "center", gap: S.sm },
  mt: { fontSize: F.xs, color: C.t3 },
  ext: { flexDirection: "row", flexWrap: "wrap", gap: S.md, marginTop: S.sm, paddingTop: S.sm, borderTopWidth: 1, borderTopColor: C.brdLt },
  ei: { flexDirection: "row", alignItems: "center", gap: 4 },
  et: { fontSize: F.xs, color: C.t3 },
  extractionBadgeRow: { flexDirection: "row", alignItems: "center", marginTop: S.sm, paddingTop: S.sm, borderTopWidth: 1, borderTopColor: C.brdLt },
  extractionLabel: { fontSize: F.xs, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3 },
});
