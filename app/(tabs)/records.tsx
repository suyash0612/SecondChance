import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { SectionHeader, Empty, Disclaimer, PillFilter } from "../../components/UI";
import { DocCard } from "../../components/DocCard";
import { C, S, F, R, colorOpacity } from "../../lib/theme";

export default function Records() {
  const router = useRouter();
  const docs = useStore((s) => s.docs);
  const deleteDoc = useStore((s) => s.deleteDoc);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const TYPE_OPTS = [
    { key: "all", label: "All" },
    { key: "lab", label: "Labs" },
    { key: "imaging", label: "Imaging" },
    { key: "note", label: "Notes" },
    { key: "discharge", label: "Discharge" },
    { key: "prescription", label: "Rx" },
  ];

  const TYPE_MAP: Record<string, string[]> = {
    lab: ["Lab Report"],
    imaging: ["Imaging Report"],
    note: ["Progress Note", "Consult Note"],
    discharge: ["Discharge Summary"],
    prescription: ["Prescription"],
  };
  const filtered = docs
    .filter((d) => typeFilter === "all" || (TYPE_MAP[typeFilter] || []).includes(d.classification))
    .filter((d) => !q || d.fileName.toLowerCase().includes(q.toLowerCase()) || d.classification.toLowerCase().includes(q.toLowerCase()) || (d.extractedProvider || "").toLowerCase().includes(q.toLowerCase()));

  const uCTAStyle = {
    ...st.uCTA,
    borderColor: colorOpacity('priMut', 38)
  };

  return (
    <View style={st.wrap}>
      <TouchableOpacity style={st.backBtn} onPress={() => router.push("/(tabs)" as any)}>
        <Ionicons name="arrow-back" size={20} color={C.pri} />
        <Text style={st.backBtnT}>Home</Text>
      </TouchableOpacity>
      <View style={st.sW}><View style={st.sB}><Ionicons name="search-outline" size={18} color={C.t3} /><TextInput style={st.sI} placeholder="Search records…" placeholderTextColor={C.t3} value={q} onChangeText={setQ} />{q ? <Ionicons name="close-circle" size={18} color={C.t3} onPress={() => setQ("")} /> : null}</View></View>
      <View style={st.filterW}><PillFilter options={TYPE_OPTS} selected={typeFilter} onSelect={setTypeFilter} /></View>
      <ScrollView contentContainerStyle={st.scroll}>
        <TouchableOpacity style={uCTAStyle} activeOpacity={0.8} onPress={() => router.push("/upload")}>
          <Ionicons name="cloud-upload-outline" size={24} color={C.pri} />
          <View style={{ flex: 1 }}><Text style={st.uT}>Upload New Record</Text><Text style={st.uS}>PDF, image, or photo of a medical document</Text></View>
          <Ionicons name="add-circle" size={24} color={C.pri} />
        </TouchableOpacity>
        <SectionHeader title="All Documents" sub={`${filtered.length} record${filtered.length !== 1 ? "s" : ""}`} />
        {filtered.length === 0 ? <Empty icon="document-outline" title="No Records" msg={q ? "Try a different search." : "Upload your first record."} /> :
          filtered.map((d) => <DocCard key={d.id} doc={d} onPress={() => router.push(`/record/${d.id}` as any)} onDelete={deleteDoc} />)}
        <Disclaimer compact /><View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  backBtn: { flexDirection: "row", alignItems: "center", gap: S.xs, paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm },
  backBtnT: { fontSize: F.md, color: C.pri, fontWeight: "500" },
  sW: { paddingHorizontal: S.lg, paddingTop: S.md },
  filterW: { paddingHorizontal: S.lg, paddingTop: S.sm },
  sB: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: S.sm, borderWidth: 1, borderColor: C.brd, gap: S.sm },
  sI: { flex: 1, fontSize: F.md, color: C.t1, paddingVertical: 4 },
  scroll: { padding: S.lg },
  uCTA: { flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.priFaint, borderRadius: R.lg, padding: S.lg, marginBottom: S.xl, borderWidth: 1.5, borderColor: C.priMut, borderStyle: "dashed" },
  uT: { fontSize: F.md, fontWeight: "600", color: C.pri },
  uS: { fontSize: F.sm, color: C.t3, marginTop: 1 },
});
