import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import type { FilterCategory } from "../../lib/types";
import { PillFilter, Empty, Disclaimer } from "../../components/UI";
import { TimelineCard } from "../../components/TimelineCard";
import { C, S, F, R } from "../../lib/theme";

const OPTS: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "All" }, { key: "visits", label: "Visits" }, { key: "diagnoses", label: "Diagnoses" },
  { key: "medications", label: "Meds" }, { key: "labs", label: "Labs" }, { key: "procedures", label: "Procedures" }, { key: "imaging", label: "Imaging" },
];

export default function Timeline() {
  const router = useRouter();
  const filter = useStore((s) => s.filter);
  const search = useStore((s) => s.search);
  const setFilter = useStore((s) => s.setFilter);
  const setSearch = useStore((s) => s.setSearch);
  const filtered = useStore((s) => s.filtered);
  const events = useMemo(() => filtered(), [filter, search, useStore.getState().timeline]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof events> = {};
    events.forEach((e) => { const y = new Date(e.date + "T12:00:00").getFullYear().toString(); (g[y] ??= []).push(e); });
    return Object.entries(g).sort(([a], [b]) => +b - +a);
  }, [events]);

  return (
    <View style={st.wrap}>
      <TouchableOpacity style={st.backBtn} onPress={() => router.push("/(tabs)" as any)}>
        <Ionicons name="arrow-back" size={20} color={C.pri} />
        <Text style={st.backBtnT}>Home</Text>
      </TouchableOpacity>
      <View style={st.sW}><View style={st.sB}>
        <Ionicons name="search-outline" size={18} color={C.t3} />
        <TextInput style={st.sI} placeholder="Search timeline…" placeholderTextColor={C.t3} value={search} onChangeText={setSearch} />
        {search ? <Ionicons name="close-circle" size={18} color={C.t3} onPress={() => setSearch("")} /> : null}
      </View></View>
      <View style={{ paddingHorizontal: S.lg, paddingTop: S.md }}><PillFilter options={OPTS} selected={filter} onSelect={(k) => setFilter(k as FilterCategory)} /></View>
      <ScrollView contentContainerStyle={st.scroll}>
        <Text style={st.count}>{events.length} event{events.length !== 1 ? "s" : ""}</Text>
        {events.length === 0 ? <Empty icon="calendar-outline" title="No Events" msg="Try changing filters or uploading records." /> :
          grouped.map(([year, evs]) => (
            <View key={year}>
              <View style={st.yH}><View style={st.yL} /><Text style={st.yT}>{year}</Text><View style={st.yL} /></View>
              {evs.map((e, i) => <TimelineCard key={e.id} event={e} first={i === 0} last={i === evs.length - 1} onPress={() => router.push(`/event/${e.id}` as any)} />)}
            </View>
          ))}
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
  sB: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: S.sm, borderWidth: 1, borderColor: C.brd, gap: S.sm },
  sI: { flex: 1, fontSize: F.md, color: C.t1, paddingVertical: 4 },
  scroll: { paddingHorizontal: S.md, paddingBottom: S.xxxl },
  count: { fontSize: F.sm, color: C.t3, paddingHorizontal: S.sm, marginBottom: S.md },
  yH: { flexDirection: "row", alignItems: "center", gap: S.md, marginVertical: S.lg, paddingHorizontal: S.sm },
  yL: { flex: 1, height: 1, backgroundColor: C.brd },
  yT: { fontSize: F.lg, fontWeight: "700", color: C.t2, letterSpacing: 1 },
});
