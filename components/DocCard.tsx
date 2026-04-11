import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MedDocument } from "../lib/types";
import { Card, Badge } from "./UI";
import { C, S, F, R } from "../lib/theme";

const IC: Record<string, string> = { "Lab Report": "flask-outline", "Progress Note": "clipboard-outline", "Discharge Summary": "exit-outline", "Imaging Report": "scan-outline", "Prescription": "medkit-outline", "Consult Note": "people-outline" };
const CC: Record<string, string> = { "Lab Report": C.labResult, "Progress Note": C.encounter, "Discharge Summary": C.erVisit, "Imaging Report": C.imaging, "Prescription": C.medication, "Consult Note": C.diagnosis };

export function DocCard({ doc, onPress }: { doc: MedDocument; onPress?: () => void }) {
  const ico = IC[doc.classification] || "document-outline";
  const col = CC[doc.classification] || C.t3;
  const sc = doc.extractionStatus === "completed" ? C.ok : doc.extractionStatus === "processing" ? C.warn : doc.extractionStatus === "failed" ? C.err : C.t3;
  const sl = doc.extractionStatus === "completed" ? "Extracted" : doc.extractionStatus === "processing" ? "Processing…" : doc.extractionStatus === "failed" ? "Failed" : "Pending";
  const d = new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Card onPress={onPress} style={s.c}>
      <View style={s.row}>
        <View style={[s.ico, { backgroundColor: col + "15" }]}><Ionicons name={ico as any} size={22} color={col} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{doc.fileName}</Text>
          <Text style={s.cls}>{doc.classification}</Text>
          <View style={s.mr}><Badge label={sl} color={sc} small /><Text style={s.mt}>{d}</Text>{doc.pages ? <Text style={s.mt}>{doc.pages} pg</Text> : null}</View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.t3} />
      </View>
      {(doc.extractedProvider || doc.extractedFacility) && (
        <View style={s.ext}>
          {doc.extractedProvider && <View style={s.ei}><Ionicons name="person-outline" size={12} color={C.t3} /><Text style={s.et}>{doc.extractedProvider}</Text></View>}
          {doc.extractedFacility && <View style={s.ei}><Ionicons name="business-outline" size={12} color={C.t3} /><Text style={s.et}>{doc.extractedFacility}</Text></View>}
        </View>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  c: { padding: S.md },
  row: { flexDirection: "row", alignItems: "center", gap: S.md },
  ico: { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center" },
  name: { fontSize: F.md, fontWeight: "600", color: C.t1, marginBottom: 2 },
  cls: { fontSize: F.sm, color: C.t2, marginBottom: 6 },
  mr: { flexDirection: "row", alignItems: "center", gap: S.sm },
  mt: { fontSize: F.xs, color: C.t3 },
  ext: { flexDirection: "row", flexWrap: "wrap", gap: S.md, marginTop: S.sm, paddingTop: S.sm, borderTopWidth: 1, borderTopColor: C.brdLt },
  ei: { flexDirection: "row", alignItems: "center", gap: 4 },
  et: { fontSize: F.xs, color: C.t3 },
});
