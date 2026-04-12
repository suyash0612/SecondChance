import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { Card, Badge, SourceBadge } from "../../components/UI";
import { C, S, F, R, eventColor, eventLabel, sourceLabel } from "../../lib/theme";

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={st.metaRow}>
      <Ionicons name={icon as any} size={15} color={C.t3} style={{ marginTop: 1 }} />
      <Text style={st.metaL}>{label}</Text>
      <Text style={st.metaV}>{value}</Text>
    </View>
  );
}

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const event = useStore((s) => s.timeline.find((e) => e.id === id));
  const doc = useStore((s) => s.docs.find((d) => d.id === event?.sourceDocId));

  if (!event) {
    return (
      <View style={st.empty}>
        <Ionicons name="calendar-outline" size={48} color={C.t3} />
        <Text style={st.emptyT}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Text style={st.backT}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tc = eventColor(event.type);
  const ic = event.importance === "critical" ? C.err : event.importance === "significant" ? C.warn : undefined;
  const dateStr = new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>
      {/* Header */}
      <Card style={st.header}>
        <View style={st.tags}>
          <Badge label={eventLabel(event.type)} color={tc} />
          {ic && <Badge label={event.importance === "critical" ? "Critical" : "Important"} color={ic} />}
          {event.isMilestone && <Badge label="Milestone" color={C.err} />}
          <SourceBadge source={event.source} />
        </View>
        <Text style={st.title}>{event.title}</Text>
        {event.description ? <Text style={st.desc}>{event.description}</Text> : null}
      </Card>

      {/* Details */}
      <Card style={st.section}>
        <Text style={st.secTitle}>Details</Text>
        <MetaRow icon="calendar-outline" label="Date" value={dateStr} />
        {event.provider && <MetaRow icon="person-outline" label="Provider" value={event.provider} />}
        {event.facility && <MetaRow icon="business-outline" label="Facility" value={event.facility} />}
        {event.bodySystem && <MetaRow icon="body-outline" label="System" value={event.bodySystem.charAt(0).toUpperCase() + event.bodySystem.slice(1)} />}
      </Card>

      {/* Provenance */}
      <Card style={st.section}>
        <Text style={st.secTitle}>Provenance</Text>
        <MetaRow icon="shield-checkmark-outline" label="Source" value={sourceLabel(event.source)} />
        <MetaRow icon="information-circle-outline" label="Importance" value={event.importance.charAt(0).toUpperCase() + event.importance.slice(1)} />
      </Card>

      {/* Linked document */}
      {doc && (
        <TouchableOpacity style={st.docLink} activeOpacity={0.75} onPress={() => router.push(`/record/${doc.id}` as any)}>
          <View style={st.docIcon}>
            <Ionicons name="document-text-outline" size={20} color={C.pri} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.docLabel}>Source Document</Text>
            <Text style={st.docName} numberOfLines={1}>{doc.fileName}</Text>
            <Text style={st.docMeta}>{doc.classification} · {doc.extractedProvider || "Unknown provider"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.t3} />
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  cnt: { padding: S.lg },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: S.lg, backgroundColor: C.bg },
  emptyT: { fontSize: F.lg, color: C.t2 },
  backBtn: { paddingVertical: S.sm, paddingHorizontal: S.lg, backgroundColor: C.priFaint, borderRadius: R.md },
  backT: { color: C.pri, fontWeight: "600" },
  header: { marginBottom: S.md, padding: S.lg },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: S.xs, marginBottom: S.md },
  title: { fontSize: F.xl, fontWeight: "700", color: C.t1, lineHeight: 26, marginBottom: S.sm },
  desc: { fontSize: F.md, color: C.t2, lineHeight: 22 },
  section: { marginBottom: S.md, padding: S.lg },
  secTitle: { fontSize: F.sm, fontWeight: "700", color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: S.md },
  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: S.sm, paddingVertical: S.xs + 2, borderBottomWidth: 1, borderBottomColor: C.brdLt },
  metaL: { fontSize: F.sm, color: C.t3, width: 80 },
  metaV: { fontSize: F.sm, color: C.t1, fontWeight: "500", flex: 1 },
  docLink: { flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: C.card, borderRadius: R.lg, padding: S.lg, borderWidth: 1, borderColor: C.brd, marginBottom: S.md },
  docIcon: { width: 40, height: 40, borderRadius: R.md, backgroundColor: C.priFaint, alignItems: "center", justifyContent: "center" },
  docLabel: { fontSize: F.xs, color: C.t3, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 },
  docName: { fontSize: F.sm, fontWeight: "600", color: C.t1 },
  docMeta: { fontSize: F.xs, color: C.t3, marginTop: 2 },
});
