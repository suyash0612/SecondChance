import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { SectionHeader, Empty, Disclaimer } from "../../components/UI";
import { DocCard } from "../../components/DocCard";
import { C, S, F, R } from "../../lib/theme";

export default function Records() {
  const router = useRouter();
  const docs = useStore((s) => s.docs);
  const [q, setQ] = useState("");
  const filtered = q ? docs.filter((d) => d.fileName.toLowerCase().includes(q.toLowerCase()) || d.classification.toLowerCase().includes(q.toLowerCase()) || (d.extractedProvider || "").toLowerCase().includes(q.toLowerCase())) : docs;

  return (
    <View style={st.wrap}>
      <View style={st.sW}><View style={st.sB}><Ionicons name="search-outline" size={18} color={C.t3} /><TextInput style={st.sI} placeholder="Search records…" placeholderTextColor={C.t3} value={q} onChangeText={setQ} />{q ? <Ionicons name="close-circle" size={18} color={C.t3} onPress={() => setQ("")} /> : null}</View></View>
      <ScrollView contentContainerStyle={st.scroll}>
        <TouchableOpacity style={st.uCTA} activeOpacity={0.8} onPress={() => router.push("/upload")}>
          <Ionicons name="cloud-upload-outline" size={24} color={C.pri} />
          <View style={{ flex: 1 }}><Text style={st.uT}>Upload New Record</Text><Text style={st.uS}>PDF, image, or photo of a medical document</Text></View>
          <Ionicons name="add-circle" size={24} color={C.pri} />
        </TouchableOpacity>
        <SectionHeader title="All Documents" sub={`${filtered.length} record${filtered.length !== 1 ? "s" : ""}`} />
        {filtered.length === 0 ? <Empty icon="document-outline" title="No Records" msg={q ? "Try a different search." : "Upload your first record."} /> :
          filtered.map((d) => <DocCard key={d.id} doc={d} onPress={() => Alert.alert(d.classification, [`File: ${d.fileName}`, d.extractedDate ? `Date: ${d.extractedDate}` : "", d.extractedProvider ? `Provider: ${d.extractedProvider}` : "", `Status: ${d.extractionStatus}`].filter(Boolean).join("\n"))} />)}
        <Disclaimer compact /><View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  sW: { paddingHorizontal: S.lg, paddingTop: S.md },
  sB: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: S.sm, borderWidth: 1, borderColor: C.brd, gap: S.sm },
  sI: { flex: 1, fontSize: F.md, color: C.t1, paddingVertical: 4 },
  scroll: { padding: S.lg },
  uCTA: { flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.priFaint, borderRadius: R.lg, padding: S.lg, marginBottom: S.xl, borderWidth: 1.5, borderColor: C.priMut + "60", borderStyle: "dashed" },
  uT: { fontSize: F.md, fontWeight: "600", color: C.pri },
  uS: { fontSize: F.sm, color: C.t3, marginTop: 1 },
});
