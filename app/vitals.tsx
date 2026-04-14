import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { Card, SectionHeader, Btn } from "../components/UI";
import { C, S, F, R, shadow } from "../lib/theme";
import type { VitalType, Vital } from "../lib/types";

// ── Constants ────────────────────────────────────────────────────────────────

const VITAL_TYPES: { key: VitalType; label: string }[] = [
  { key: "bp", label: "Blood Pressure" },
  { key: "hr", label: "Heart Rate" },
  { key: "weight", label: "Weight" },
  { key: "glucose", label: "Glucose" },
  { key: "temp", label: "Temp" },
  { key: "spo2", label: "SpO2" },
];

const UNIT_MAP: Record<VitalType, string> = {
  bp: "mmHg",
  hr: "bpm",
  weight: "lbs",
  glucose: "mg/dL",
  temp: "°F",
  spo2: "%",
};

const COLOR_MAP: Record<VitalType, string> = {
  bp: C.encounter,
  hr: C.err,
  weight: C.t2,
  glucose: C.warn,
  temp: C.labResult,
  spo2: C.ok,
};

const TYPE_LABEL: Record<VitalType, string> = {
  bp: "Blood Pressure",
  hr: "Heart Rate",
  weight: "Weight",
  glucose: "Glucose",
  temp: "Temperature",
  spo2: "SpO2",
};

const TYPE_ICON: Record<VitalType, string> = {
  bp: "pulse-outline",
  hr: "heart-outline",
  weight: "barbell-outline",
  glucose: "water-outline",
  temp: "thermometer-outline",
  spo2: "cloudy-outline",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function vitalDisplay(v: Vital): string {
  if (v.type === "bp" && v.value2) return `${v.value}/${v.value2} ${v.unit}`;
  return `${v.value} ${v.unit}`;
}

// ── Sparkline component (pure RN — no SVG dependency) ────────────────────────
// Renders up to 5 bars whose heights are proportional to the reading value.
// Each bar is a colored rectangle; a thin connector line sits between bars.

function Sparkline({ readings, color }: { readings: Vital[]; color: string }) {
  const last5 = readings.slice(0, 5).reverse();
  if (last5.length < 2) return null;

  const BAR_W = 6;
  const MAX_H = 24;
  const GAP = 5;

  const values = last5.map((v) => parseFloat(v.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const barHeights = values.map((val) => {
    const ratio = (val - min) / range;
    // clamp between 4 and MAX_H so even the minimum is visible
    return Math.max(4, Math.round(ratio * (MAX_H - 4) + 4));
  });

  const totalW = last5.length * BAR_W + (last5.length - 1) * GAP;

  return (
    <View style={{ width: totalW, height: MAX_H, flexDirection: "row", alignItems: "flex-end", gap: GAP }}>
      {barHeights.map((h, i) => (
        <View
          key={i}
          style={{
            width: BAR_W,
            height: h,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.55 + 0.45 * (i / (barHeights.length - 1)),
          }}
        />
      ))}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function VitalsScreen() {
  const router = useRouter();
  const vitals = useStore((s) => s.vitals);
  const addVital = useStore((s) => s.addVital);
  const deleteVital = useStore((s) => s.deleteVital);

  // Form state
  const [type, setType] = useState<VitalType>("bp");
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const color = COLOR_MAP[type];
  const unit = UNIT_MAP[type];

  // Group vitals by type, most recent 10 per type
  const grouped = useMemo(() => {
    const order: VitalType[] = ["bp", "hr", "weight", "glucose", "temp", "spo2"];
    return order
      .map((t) => ({
        type: t,
        items: vitals
          .filter((v) => v.type === t)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10),
      }))
      .filter((g) => g.items.length > 0);
  }, [vitals]);

  function handleLog() {
    if (!value.trim()) {
      Alert.alert("Required", "Please enter a value.");
      return;
    }
    if (type === "bp" && !value2.trim()) {
      Alert.alert("Required", "Please enter diastolic (bottom) value for blood pressure.");
      return;
    }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert("Invalid date", "Use YYYY-MM-DD format.");
      return;
    }
    setSaving(true);
    const payload: Omit<Vital, "id"> = {
      type,
      value: value.trim(),
      ...(type === "bp" ? { value2: value2.trim() } : {}),
      unit,
      date,
      ...(note.trim() ? { note: note.trim() } : {}),
    };
    addVital(payload);
    setValue("");
    setValue2("");
    setNote("");
    setDate(todayStr());
    setSaving(false);
  }

  function handleDelete(id: string) {
    Alert.alert("Delete reading", "Remove this vital reading?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteVital(id) },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={st.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={st.wrap} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={st.header}>
          <TouchableOpacity onPress={() => router.back()} style={st.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color={C.t1} />
          </TouchableOpacity>
          <Text style={st.headerTitle}>Vitals Tracker</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Add Vital Form */}
        <Card style={st.formCard}>
          <Text style={st.formTitle}>Log a Reading</Text>

          {/* Type selector */}
          <Text style={st.label}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.typeRow}>
            {VITAL_TYPES.map((vt) => (
              <TouchableOpacity
                key={vt.key}
                onPress={() => { setType(vt.key); setValue(""); setValue2(""); }}
                style={[st.typePill, type === vt.key && { backgroundColor: COLOR_MAP[vt.key], borderColor: COLOR_MAP[vt.key] }]}
              >
                <Text style={[st.typePillT, type === vt.key && { color: "#fff" }]}>{vt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Value inputs */}
          <Text style={st.label}>{type === "bp" ? "Systolic (top)" : "Value"}</Text>
          <View style={st.inputRow}>
            <TextInput
              style={[st.input, { flex: 1 }, { borderColor: color + "60" }]}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              placeholder={type === "bp" ? "120" : type === "temp" ? "98.6" : "—"}
              placeholderTextColor={C.t3}
            />
            <View style={[st.unitBadge, { backgroundColor: color + "18" }]}>
              <Text style={[st.unitText, { color }]}>{unit}</Text>
            </View>
          </View>

          {type === "bp" && (
            <>
              <Text style={st.label}>Diastolic (bottom)</Text>
              <View style={st.inputRow}>
                <TextInput
                  style={[st.input, { flex: 1 }, { borderColor: color + "60" }]}
                  value={value2}
                  onChangeText={setValue2}
                  keyboardType="number-pad"
                  placeholder="80"
                  placeholderTextColor={C.t3}
                />
                <View style={[st.unitBadge, { backgroundColor: color + "18" }]}>
                  <Text style={[st.unitText, { color }]}>{unit}</Text>
                </View>
              </View>
            </>
          )}

          {/* Date */}
          <Text style={st.label}>Date</Text>
          <TextInput
            style={[st.input, { borderColor: C.brd }]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={C.t3}
            keyboardType="numbers-and-punctuation"
          />

          {/* Note */}
          <Text style={st.label}>Note (optional)</Text>
          <TextInput
            style={[st.input, st.noteInput, { borderColor: C.brd }]}
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Fasting, after exercise..."
            placeholderTextColor={C.t3}
            multiline
            numberOfLines={2}
          />

          <Btn
            title="Log Vital"
            onPress={handleLog}
            loading={saving}
            icon="add-circle-outline"
            style={{ marginTop: S.sm }}
          />
        </Card>

        {/* History */}
        {grouped.length === 0 ? (
          <View style={st.emptyWrap}>
            <Ionicons name="pulse-outline" size={44} color={C.t3} />
            <Text style={st.emptyT}>No readings yet</Text>
            <Text style={st.emptyS}>Log your first vital above</Text>
          </View>
        ) : (
          grouped.map((group) => {
            const gc = COLOR_MAP[group.type];
            const hasSparkline = group.items.length >= 2;
            return (
              <View key={group.type} style={st.section}>
                <View style={st.secHeaderRow}>
                  <View style={[st.typeIconBg, { backgroundColor: gc + "18" }]}>
                    <Ionicons name={TYPE_ICON[group.type] as any} size={16} color={gc} />
                  </View>
                  <Text style={[st.secTitle, { color: gc }]}>{TYPE_LABEL[group.type]}</Text>
                  {hasSparkline && (
                    <View style={st.sparkWrap}>
                      <Sparkline readings={group.items} color={gc} />
                    </View>
                  )}
                </View>

                {group.items.map((v) => (
                  <Card key={v.id} style={st.vitalRow}>
                    <View style={st.vitalMain}>
                      <View style={[st.vitalDot, { backgroundColor: gc }]} />
                      <View style={st.vitalInfo}>
                        <Text style={st.vitalValue}>{vitalDisplay(v)}</Text>
                        <Text style={st.vitalDate}>{fmtDate(v.date)}</Text>
                        {v.note ? <Text style={st.vitalNote}>{v.note}</Text> : null}
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(v.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="trash-outline" size={18} color={C.t3} />
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.lg, paddingTop: S.xl },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: S.xl,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.brdLt,
    ...shadow,
  },
  headerTitle: { fontSize: F.xl, fontWeight: "700", color: C.t1, letterSpacing: -0.3 },

  formCard: { marginBottom: S.xl },
  formTitle: { fontSize: F.lg, fontWeight: "700", color: C.t1, marginBottom: S.lg },

  label: { fontSize: F.sm, fontWeight: "600", color: C.t2, marginBottom: S.xs, marginTop: S.sm },

  typeRow: { flexDirection: "row", gap: S.sm, paddingBottom: S.sm, marginBottom: S.xs },
  typePill: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm - 1,
    borderRadius: R.pill,
    borderWidth: 1.5,
    borderColor: C.brd,
    backgroundColor: C.bgAlt,
  },
  typePillT: { fontSize: F.sm, fontWeight: "600", color: C.t2 },

  inputRow: { flexDirection: "row", alignItems: "center", gap: S.sm },
  input: {
    borderWidth: 1.5,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: Platform.OS === "ios" ? S.md : S.sm,
    fontSize: F.md,
    color: C.t1,
    backgroundColor: C.card,
    marginBottom: S.xs,
  },
  noteInput: { minHeight: 60, textAlignVertical: "top" },

  unitBadge: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  unitText: { fontSize: F.sm, fontWeight: "700" },

  emptyWrap: { alignItems: "center", paddingVertical: 48 },
  emptyT: { fontSize: F.lg, fontWeight: "600", color: C.t1, marginTop: S.lg },
  emptyS: { fontSize: F.sm, color: C.t3, marginTop: S.xs },

  section: { marginBottom: S.lg },
  secHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    marginBottom: S.sm,
    paddingHorizontal: S.xs,
  },
  typeIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secTitle: { fontSize: F.md, fontWeight: "700", flex: 1 },
  sparkWrap: { alignItems: "center", justifyContent: "center" },

  vitalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: S.sm + 2,
    paddingHorizontal: S.md,
    marginBottom: S.xs,
  },
  vitalMain: { flexDirection: "row", alignItems: "center", gap: S.md, flex: 1 },
  vitalDot: { width: 8, height: 8, borderRadius: 4 },
  vitalInfo: { flex: 1 },
  vitalValue: { fontSize: F.md, fontWeight: "700", color: C.t1 },
  vitalDate: { fontSize: F.sm, color: C.t3, marginTop: 1 },
  vitalNote: { fontSize: F.xs, color: C.t2, marginTop: 2, fontStyle: "italic" },
});
