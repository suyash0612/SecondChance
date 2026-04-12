import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TimelineEvent } from "../lib/types";
import { Card, Badge, SourceBadge } from "./UI";
import { C, S, F, eventColor, eventLabel } from "../lib/theme";

export function TimelineCard({ event, first, last, onPress }: { event: TimelineEvent; first?: boolean; last?: boolean; onPress?: () => void }) {
  const tc = eventColor(event.type);
  const d = new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const ic = event.importance === "critical" ? C.err : event.importance === "significant" ? C.warn : undefined;

  return (
    <View style={s.row}>
      <View style={s.rail}>
        {!first && <View style={s.lineT} />}
        <View style={[s.dot, { backgroundColor: tc }]}>{event.isMilestone && <View style={s.pulse} />}</View>
        {!last && <View style={s.lineB} />}
      </View>
      <Card style={[s.eCard, event.isMilestone && { borderColor: C.err + "30", borderWidth: 1.5 }]} onPress={onPress}>
        <View style={s.tags}>
          <Badge label={eventLabel(event.type)} color={tc} small />
          {ic && <Badge label={event.importance === "critical" ? "Critical" : "Important"} color={ic} small />}
          <SourceBadge source={event.source} />
        </View>
        <Text style={s.title}>{event.title}</Text>
        {event.description ? <Text style={s.desc} numberOfLines={3}>{event.description}</Text> : null}
        <View style={s.foot}>
          <View style={s.meta}><Ionicons name="calendar-outline" size={13} color={C.t3} /><Text style={s.metaT}>{d}</Text></View>
          {event.provider ? <View style={s.meta}><Ionicons name="person-outline" size={13} color={C.t3} /><Text style={s.metaT} numberOfLines={1}>{event.provider}</Text></View> : null}
        </View>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", paddingRight: S.lg },
  rail: { width: 40, alignItems: "center" },
  lineT: { width: 2, flex: 1, backgroundColor: C.brd },
  lineB: { width: 2, flex: 1, backgroundColor: C.brd },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  pulse: { position: "absolute", top: -4, left: -4, width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.err + "40" },
  eCard: { flex: 1, marginLeft: S.sm, marginBottom: S.sm, padding: S.md },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: S.sm },
  title: { fontSize: F.md, fontWeight: "600", color: C.t1, lineHeight: 21, marginBottom: 4 },
  desc: { fontSize: F.sm, color: C.t2, lineHeight: 19, marginBottom: S.sm },
  foot: { flexDirection: "row", flexWrap: "wrap", gap: S.md },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaT: { fontSize: F.xs, color: C.t3 },
});
