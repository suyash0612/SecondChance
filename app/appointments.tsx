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
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { Card, SectionHeader, Btn, Badge } from "../components/UI";
import { C, S, F, R, shadow, colorOpacity } from "../lib/theme";
import type { Appointment } from "../lib/types";
import { useToast } from "../lib/useToast";

// Enable layout animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(t?: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

const STATUS_COLOR: Record<Appointment["status"], string> = {
  upcoming: C.ok,
  completed: C.t2,
  cancelled: C.err,
};

const STATUS_LABEL: Record<Appointment["status"], string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ── Empty form factory ─────────────────────────────────────────────────────────

function emptyForm() {
  return {
    provider: "",
    specialty: "",
    facility: "",
    reason: "",
    date: todayStr(),
    time: "",
    status: "upcoming" as Appointment["status"],
    notes: "",
  };
}

// ── Appointment card ─────────────────────────────────────────────────────────

function ApptCard({
  appt,
  onDelete,
  onMarkComplete,
}: {
  appt: Appointment;
  onDelete: () => void;
  onMarkComplete?: () => void;
}) {
  const statusColor = STATUS_COLOR[appt.status];

  return (
    <Card style={st.apptCard}>
      {/* Top row: date + status badge */}
      <View style={st.apptTopRow}>
        <View style={st.apptDateBlock}>
          <Ionicons name="calendar-outline" size={14} color={C.t3} style={{ marginRight: 4 }} />
          <Text style={st.apptDate}>{fmtDate(appt.date)}</Text>
          {appt.time ? <Text style={st.apptTime}>{" · "}{fmtTime(appt.time)}</Text> : null}
        </View>
        <Badge label={STATUS_LABEL[appt.status]} color={statusColor} />
      </View>

      {/* Provider row */}
      <View style={st.apptProviderRow}>
        <View style={[st.apptProviderIcon, { backgroundColor: colorOpacity('encounter', 9) }]}>
          <Ionicons name="person-outline" size={16} color={C.encounter} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.apptProvider}>{appt.provider}</Text>
          {appt.specialty ? (
            <Text style={st.apptSpecialty}>{appt.specialty}</Text>
          ) : null}
        </View>
      </View>

      {/* Facility */}
      {appt.facility ? (
        <View style={st.apptMetaRow}>
          <Ionicons name="location-outline" size={13} color={C.t3} />
          <Text style={st.apptMeta}>{appt.facility}</Text>
        </View>
      ) : null}

      {/* Reason */}
      <View style={st.apptMetaRow}>
        <Ionicons name="document-text-outline" size={13} color={C.t3} />
        <Text style={st.apptReason}>{appt.reason}</Text>
      </View>

      {/* Notes */}
      {appt.notes ? (
        <Text style={st.apptNotes}>{appt.notes}</Text>
      ) : null}

      {/* Action row */}
      <View style={st.apptActions}>
        {onMarkComplete && appt.status === "upcoming" ? (
          <TouchableOpacity onPress={onMarkComplete} style={st.completeBtn}>
            <Ionicons name="checkmark-circle-outline" size={15} color={C.ok} />
            <Text style={st.completeBtnT}>Mark Complete</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={st.deleteBtn}
        >
          <Ionicons name="trash-outline" size={17} color={C.t3} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ── Add form ──────────────────────────────────────────────────────────────────

function AddForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const addAppointment = useStore((s) => s.addAppointment);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  function patch(key: keyof ReturnType<typeof emptyForm>, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSave() {
    if (!form.provider.trim()) {
      Alert.alert("Required", "Provider name is required.");
      return;
    }
    if (!form.reason.trim()) {
      Alert.alert("Required", "Reason for visit is required.");
      return;
    }
    if (!form.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert("Invalid date", "Use YYYY-MM-DD format.");
      return;
    }
    if (form.time && !form.time.match(/^\d{2}:\d{2}$/)) {
      Alert.alert("Invalid time", "Use HH:MM format, e.g. 14:30");
      return;
    }
    setSaving(true);
    addAppointment({
      provider: form.provider.trim(),
      ...(form.specialty.trim() ? { specialty: form.specialty.trim() } : {}),
      ...(form.facility.trim() ? { facility: form.facility.trim() } : {}),
      reason: form.reason.trim(),
      date: form.date,
      ...(form.time.trim() ? { time: form.time.trim() } : {}),
      status: form.status,
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    });
    setSaving(false);
    onSave();
  }

  const statusOptions: Appointment["status"][] = ["upcoming", "completed", "cancelled"];

  return (
    <Card style={st.addFormCard}>
      <View style={st.addFormHeader}>
        <Text style={st.addFormTitle}>New Appointment</Text>
        <TouchableOpacity onPress={onCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={22} color={C.t3} />
        </TouchableOpacity>
      </View>

      <Text style={st.label}>Provider *</Text>
      <TextInput
        style={st.input}
        value={form.provider}
        onChangeText={(v) => patch("provider", v)}
        placeholder="Dr. Jane Smith"
        placeholderTextColor={C.t3}
      />

      <Text style={st.label}>Specialty</Text>
      <TextInput
        style={st.input}
        value={form.specialty}
        onChangeText={(v) => patch("specialty", v)}
        placeholder="Cardiology, Primary Care..."
        placeholderTextColor={C.t3}
      />

      <Text style={st.label}>Facility</Text>
      <TextInput
        style={st.input}
        value={form.facility}
        onChangeText={(v) => patch("facility", v)}
        placeholder="Hospital or clinic name"
        placeholderTextColor={C.t3}
      />

      <Text style={st.label}>Reason *</Text>
      <TextInput
        style={[st.input, st.textArea]}
        value={form.reason}
        onChangeText={(v) => patch("reason", v)}
        placeholder="Reason for visit"
        placeholderTextColor={C.t3}
        multiline
        numberOfLines={2}
      />

      <View style={st.row}>
        <View style={{ flex: 1 }}>
          <Text style={st.label}>Date *</Text>
          {typeof window !== "undefined" ? (
            <input
              type="date"
              value={form.date}
              onChange={(e) => patch("date", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: C.brd,
                fontSize: 16,
                fontFamily: "system-ui, -apple-system, sans-serif",
                backgroundColor: C.card,
                color: C.t1,
              } as any}
            />
          ) : (
            <TextInput
              style={st.input}
              value={form.date}
              onChangeText={(v) => patch("date", v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.t3}
              keyboardType="numbers-and-punctuation"
            />
          )}
        </View>
        <View style={{ width: S.md }} />
        <View style={{ flex: 1 }}>
          <Text style={st.label}>Time</Text>
          {typeof window !== "undefined" ? (
            <input
              type="time"
              value={form.time}
              onChange={(e) => patch("time", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: C.brd,
                fontSize: 16,
                fontFamily: "system-ui, -apple-system, sans-serif",
                backgroundColor: C.card,
                color: C.t1,
              } as any}
            />
          ) : (
            <TextInput
              style={st.input}
              value={form.time}
              onChangeText={(v) => patch("time", v)}
              placeholder="HH:MM"
              placeholderTextColor={C.t3}
              keyboardType="numbers-and-punctuation"
            />
          )}
        </View>
      </View>

      <Text style={st.label}>Status</Text>
      <View style={st.statusRow}>
        {statusOptions.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => patch("status", s)}
            style={[
              st.statusPill,
              form.status === s && { backgroundColor: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] },
            ]}
          >
            <Text style={[st.statusPillT, form.status === s && { color: "#fff" }]}>
              {STATUS_LABEL[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={st.label}>Notes</Text>
      <TextInput
        style={[st.input, st.textArea]}
        value={form.notes}
        onChangeText={(v) => patch("notes", v)}
        placeholder="Additional notes..."
        placeholderTextColor={C.t3}
        multiline
        numberOfLines={2}
      />

      <Btn
        title="Save Appointment"
        onPress={handleSave}
        loading={saving}
        icon="calendar-outline"
        style={{ marginTop: S.sm }}
      />
    </Card>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AppointmentsScreen() {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const appointments = useStore((s) => s.appointments);
  const updateAppointment = useStore((s) => s.updateAppointment);
  const deleteAppointment = useStore((s) => s.deleteAppointment);

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [appointments],
  );

  const past = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== "upcoming")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [appointments],
  );

  function handleDelete(id: string) {
    Alert.alert("Delete appointment", "Remove this appointment?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteAppointment(id); toast.success("Appointment deleted"); } },
    ]);
  }

  function handleMarkComplete(id: string) {
    Alert.alert("Mark as completed", "Mark this appointment as completed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Complete",
        onPress: () => { updateAppointment(id, { status: "completed" }); toast.success("Marked as completed"); },
      },
    ]);
  }

  function toggleForm() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowForm((v) => !v);
  }

  return (
    <KeyboardAvoidingView
      style={st.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={st.wrap} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={st.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={st.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={C.t1} />
          </TouchableOpacity>
          <Text style={st.headerTitle}>Appointments</Text>
          <TouchableOpacity onPress={toggleForm} style={[st.addIconBtn, showForm && st.addIconBtnActive]}>
            <Ionicons name={showForm ? "close" : "add"} size={22} color={showForm ? C.err : C.pri} />
          </TouchableOpacity>
        </View>

        {/* Summary stats */}
        <View style={st.statsRow}>
          <View style={[st.statBox, { backgroundColor: colorOpacity('ok', 8) }]}>
            <Text style={[st.statNum, { color: C.ok }]}>{upcoming.length}</Text>
            <Text style={st.statLbl}>Upcoming</Text>
          </View>
          <View style={[st.statBox, { backgroundColor: colorOpacity('t2', 8) }]}>
            <Text style={[st.statNum, { color: C.t2 }]}>{past.filter((a) => a.status === "completed").length}</Text>
            <Text style={st.statLbl}>Completed</Text>
          </View>
          <View style={[st.statBox, { backgroundColor: colorOpacity('err', 8) }]}>
            <Text style={[st.statNum, { color: C.err }]}>{past.filter((a) => a.status === "cancelled").length}</Text>
            <Text style={st.statLbl}>Cancelled</Text>
          </View>
        </View>

        {/* Add form (inline, toggle) */}
        {showForm && (
          <AddForm
            onSave={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowForm(false);
              toast.success("Appointment added");
            }}
            onCancel={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowForm(false);
            }}
          />
        )}

        {/* Upcoming section */}
        <SectionHeader
          title="Upcoming"
          sub={upcoming.length === 0 ? "No upcoming appointments" : undefined}
        />
        {upcoming.length === 0 ? (
          <View style={st.emptySection}>
            <Ionicons name="calendar-outline" size={36} color={C.t3} />
            <Text style={st.emptyMsg}>Schedule your next appointment</Text>
          </View>
        ) : (
          upcoming.map((a) => (
            <ApptCard
              key={a.id}
              appt={a}
              onDelete={() => handleDelete(a.id)}
              onMarkComplete={() => handleMarkComplete(a.id)}
            />
          ))
        )}

        {/* Past section */}
        {past.length > 0 && (
          <>
            <SectionHeader title="Past" sub={`${past.length} appointment${past.length !== 1 ? "s" : ""}`} />
            {past.map((a) => (
              <ApptCard key={a.id} appt={a} onDelete={() => handleDelete(a.id)} />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
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
  addIconBtn: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    backgroundColor: C.priFaint,
    borderWidth: 1,
    borderColor: C.priMut,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  addIconBtnActive: { backgroundColor: C.errBg, borderColor: colorOpacity('err', 25) },

  statsRow: { flexDirection: "row", gap: S.sm, marginBottom: S.xl },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: S.md,
    borderRadius: R.lg,
  },
  statNum: { fontSize: F.xxl, fontWeight: "800" },
  statLbl: { fontSize: F.xs, color: C.t3, marginTop: 2, fontWeight: "500" },

  addFormCard: { marginBottom: S.lg },
  addFormHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: S.md,
  },
  addFormTitle: { fontSize: F.lg, fontWeight: "700", color: C.t1 },

  label: { fontSize: F.sm, fontWeight: "600", color: C.t2, marginBottom: S.xs, marginTop: S.sm },
  input: {
    borderWidth: 1.5,
    borderColor: C.brd,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: Platform.OS === "ios" ? S.md : S.sm,
    fontSize: F.md,
    color: C.t1,
    backgroundColor: C.card,
    marginBottom: S.xs,
  },
  textArea: { minHeight: 56, textAlignVertical: "top" },
  row: { flexDirection: "row", alignItems: "flex-start" },
  statusRow: { flexDirection: "row", gap: S.sm, marginBottom: S.xs, flexWrap: "wrap" },
  statusPill: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm - 1,
    borderRadius: R.pill,
    borderWidth: 1.5,
    borderColor: C.brd,
    backgroundColor: C.bgAlt,
  },
  statusPillT: { fontSize: F.sm, fontWeight: "600", color: C.t2 },

  emptySection: { alignItems: "center", paddingVertical: S.xxl },
  emptyMsg: { fontSize: F.sm, color: C.t3, marginTop: S.sm },

  apptCard: { marginBottom: S.md, paddingVertical: S.md },
  apptTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: S.sm,
  },
  apptDateBlock: { flexDirection: "row", alignItems: "center", flex: 1 },
  apptDate: { fontSize: F.sm, fontWeight: "600", color: C.t1 },
  apptTime: { fontSize: F.sm, color: C.t2 },

  apptProviderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    marginBottom: S.xs,
  },
  apptProviderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  apptProvider: { fontSize: F.md, fontWeight: "700", color: C.t1 },
  apptSpecialty: { fontSize: F.sm, color: C.t2 },

  apptMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
    paddingLeft: 2,
  },
  apptMeta: { fontSize: F.sm, color: C.t3 },
  apptReason: { fontSize: F.sm, color: C.t2, flex: 1 },
  apptNotes: {
    fontSize: F.sm,
    color: C.t2,
    fontStyle: "italic",
    marginTop: S.xs,
    paddingLeft: 2,
    lineHeight: 18,
  },

  apptActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: S.sm,
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: C.brdLt,
  },
  completeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  completeBtnT: { fontSize: F.sm, fontWeight: "600", color: C.ok },
  deleteBtn: {
    padding: S.xs,
  },
});
