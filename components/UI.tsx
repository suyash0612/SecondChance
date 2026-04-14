import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, S, F, R, shadow, sourceColor, sourceLabel, colorWithOpacity } from "../lib/theme";

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }) {
  const W = onPress ? TouchableOpacity : View;
  return <W onPress={onPress} activeOpacity={0.7} style={[st.card, style]}>{children}</W>;
}

export function SectionHeader({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={st.secH}>
      <View style={{ flex: 1 }}>
        <Text style={st.secT}>{title}</Text>
        {sub ? <Text style={st.secS}>{sub}</Text> : null}
      </View>
      {action && onAction ? <TouchableOpacity onPress={onAction}><Text style={st.secA}>{action}</Text></TouchableOpacity> : null}
    </View>
  );
}

export function Badge({ label, color, small }: { label: string; color: string; small?: boolean }) {
  return (
    <View style={[st.badge, { backgroundColor: colorWithOpacity(color, 18) }, small && st.badgeSm]}>
      <Text style={[st.badgeT, { color: "#FFFFFF" }, small && { fontSize: 9 }]}>{label}</Text>
    </View>
  );
}

export function SourceBadge({ source }: { source: string }) {
  return <Badge label={sourceLabel(source)} color={sourceColor(source)} small />;
}

export function PillFilter({ options, selected, onSelect }: { options: { key: string; label: string }[]; selected: string; onSelect: (k: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.pillRow}>
      {options.map((o) => (
        <TouchableOpacity key={o.key} onPress={() => onSelect(o.key)} style={[st.pill, selected === o.key && st.pillSel]}>
          <Text style={[st.pillT, selected === o.key && st.pillTSel]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export function Btn({ title, onPress, variant = "primary", icon, loading, disabled, style }: {
  title: string; onPress: () => void; variant?: "primary" | "secondary" | "outline";
  icon?: string; loading?: boolean; disabled?: boolean; style?: ViewStyle;
}) {
  const p = variant === "primary"; const o = variant === "outline";
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}
      style={[st.btn, p && st.btnP, o && st.btnO, !p && !o && st.btnS, (disabled || loading) && { opacity: 0.5 }, style]}>
      {loading ? <ActivityIndicator color={p ? "#fff" : C.pri} size="small" /> : <>
        {icon ? <Ionicons name={icon as any} size={18} color={p ? "#fff" : C.pri} style={{ marginRight: S.sm }} /> : null}
        <Text style={[st.btnT, p && { color: "#fff" }]}>{title}</Text>
      </>}
    </TouchableOpacity>
  );
}

export function Disclaimer({ compact }: { compact?: boolean }) {
  return (
    <View style={[st.disc, compact && { paddingVertical: S.sm }]}>
      <Ionicons name="information-circle" size={compact ? 14 : 16} color={C.info} />
      <Text style={[st.discT, compact && { fontSize: F.xs }]}>For visit preparation only. Not medical advice. Review with your clinician.</Text>
    </View>
  );
}

export function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View style={st.stat}>
      <View style={[st.statI, { backgroundColor: colorWithOpacity(color, 8) }]}><Ionicons name={icon as any} size={20} color={color} /></View>
      <Text style={st.statV}>{value}</Text>
      <Text style={st.statL}>{label}</Text>
    </View>
  );
}

export function Empty({ icon, title, msg }: { icon: string; title: string; msg: string }) {
  return (
    <View style={st.empty}>
      <Ionicons name={icon as any} size={48} color={C.t3} />
      <Text style={st.emptyT}>{title}</Text>
      <Text style={st.emptyM}>{msg}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: R.lg, padding: S.lg, marginBottom: S.md, borderWidth: 1, borderColor: C.brdLt, ...shadow },
  secH: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: S.md, paddingHorizontal: S.xs },
  secT: { fontSize: F.lg, fontWeight: "700", color: C.t1, letterSpacing: -0.3 },
  secS: { fontSize: F.sm, color: C.t3, marginTop: 2 },
  secA: { fontSize: F.sm, fontWeight: "600", color: C.pri },
  badge: { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.pill, alignSelf: "flex-start" },
  badgeSm: { paddingHorizontal: 6, paddingVertical: 2 },
  badgeT: { fontSize: F.xs, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: S.sm, marginBottom: S.lg },
  pill: { paddingHorizontal: S.md, paddingVertical: S.sm, borderRadius: R.pill, backgroundColor: C.bgAlt, borderWidth: 1, borderColor: C.brd },
  pillSel: { backgroundColor: C.pri, borderColor: C.pri },
  pillT: { fontSize: F.sm, fontWeight: "500", color: C.t2 },
  pillTSel: { color: "#fff" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: S.md, paddingHorizontal: S.xl, borderRadius: R.md, minHeight: 48 },
  btnP: { backgroundColor: C.pri },
  btnS: { backgroundColor: C.priFaint },
  btnO: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: C.pri },
  btnT: { fontSize: F.md, fontWeight: "600", color: C.pri },
  disc: { flexDirection: "row", alignItems: "center", backgroundColor: C.infoBg, paddingHorizontal: S.md, paddingVertical: S.sm + 2, borderRadius: R.sm, gap: S.sm },
  discT: { flex: 1, fontSize: F.xs, color: C.info, lineHeight: 16 },
  stat: { flex: 1, alignItems: "center", backgroundColor: C.card, borderRadius: R.lg, paddingVertical: S.lg, paddingHorizontal: S.sm, borderWidth: 1, borderColor: C.brdLt, ...shadow },
  statI: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: S.sm },
  statV: { fontSize: F.xl, fontWeight: "700", color: C.t1 },
  statL: { fontSize: F.xs, color: C.t3, marginTop: 2, textAlign: "center" },
  empty: { alignItems: "center", paddingVertical: 40, paddingHorizontal: S.xxl },
  emptyT: { fontSize: F.lg, fontWeight: "600", color: C.t1, marginTop: S.lg, textAlign: "center" },
  emptyM: { fontSize: F.md, color: C.t3, marginTop: S.sm, textAlign: "center", lineHeight: 22 },
});
