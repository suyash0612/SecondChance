import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../lib/store";
import { Card, SectionHeader, Disclaimer } from "../../components/UI";
import { C, S, F, R, shadow } from "../../lib/theme";
import type { DarkModePref } from "../../lib/types";

export default function Profile() {
  const router = useRouter();
  const p = useStore((s) => s.patient);
  const authUser = useStore((s) => s.authUser);
  const docs = useStore((s) => s.docs);
  const meds = useStore((s) => s.meds);
  const conditions = useStore((s) => s.conditions);
  const timeline = useStore((s) => s.timeline);
  const logout = useStore((s) => s.logout);

  const [notifOn, setNotifOn] = useState(true);
  const [bioOn, setBioOn] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const dob = p.dateOfBirth ? new Date(p.dateOfBirth + "T12:00:00") : null;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
  const initials = (p.firstName?.[0] ?? "") + (p.lastName?.[0] ?? "");

  const tap = (l: string) => Alert.alert(l, "This setting is available in the full version of Second Opinion.");

  const handleLogout = () => setConfirmingLogout(true);

  return (
    <ScrollView style={st.wrap} contentContainerStyle={st.cnt}>

      {/* ── Patient card ─────────────────────────────────────────── */}
      <View style={st.profileCard}>
        <View style={st.avatarWrap}>
          <View style={st.avatar}>
            <Text style={st.avatarT}>{initials || "?"}</Text>
          </View>
          <TouchableOpacity style={st.editBadge} onPress={() => tap("Edit Profile Photo")}>
            <Ionicons name="camera" size={12} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={st.name}>{p.firstName} {p.lastName}</Text>
        {authUser && <Text style={st.emailBadge}>{authUser.email}</Text>}
        {age !== null && dob && (
          <Text style={st.meta}>
            {p.sex} · Age {age} · DOB {dob.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        )}

        {/* Stats row */}
        <View style={st.statsRow}>
          <Stat value={docs.length} label="Records" />
          <View style={st.statDiv} />
          <Stat value={meds.filter((m) => m.status === "active").length} label="Active Meds" />
          <View style={st.statDiv} />
          <Stat value={conditions.filter((c) => c.status !== "resolved").length} label="Conditions" />
          <View style={st.statDiv} />
          <Stat value={timeline.length} label="Events" />
        </View>
      </View>

      {/* ── Contact info ─────────────────────────────────────────── */}
      {(p.phone || p.email || p.insurance || p.emergencyContact) && (
        <>
          <SectionHeader title="Contact & Coverage" />
          <Card>
            {p.phone ? <IR i="call-outline" l="Phone" v={p.phone} /> : null}
            {p.email ? <IR i="mail-outline" l="Email" v={p.email} /> : null}
            {p.insurance ? <IR i="card-outline" l="Insurance" v={p.insurance} /> : null}
            {p.memberId ? <IR i="barcode-outline" l="Member ID" v={p.memberId} /> : null}
            {p.emergencyContact ? (
              <IR i="alert-circle-outline" l="Emergency"
                v={`${p.emergencyContact.name} (${p.emergencyContact.relationship})`} />
            ) : null}
          </Card>
        </>
      )}

      {/* ── Health Tools ────────────────────────────────────────────── */}
      <SectionHeader title="Health Tools" />
      <Card style={st.settingsCard}>
        <SettingRow icon="pulse-outline" label="Vitals Tracker" value="BP, glucose, HR" onPress={() => router.push("/vitals" as any)} />
        <View style={st.rowDiv} />
        <SettingRow icon="calendar-outline" label="Appointments" value={`${docs.length > 0 ? "View all" : "None"}`} onPress={() => router.push("/appointments" as any)} />
        <View style={st.rowDiv} />
        <SettingRow icon="add-circle-outline" label="Add Health Data" value="Meds, conditions, allergies" onPress={() => router.push("/add-data" as any)} />
        <View style={st.rowDiv} />
        <SettingRow icon="shield-outline" label="Emergency Card" value="Critical info" onPress={() => router.push("/emergency" as any)} />
      </Card>

      {/* ── Settings ─────────────────────────────────────────────── */}
      <SectionHeader title="Settings" />
      <Card style={st.settingsCard}>
        <ToggleRow
          icon="notifications-outline" label="Notifications"
          value={notifOn} onToggle={setNotifOn}
        />
        <View style={st.rowDiv} />
        <DarkModeRow />
        <View style={st.rowDiv} />
        <SettingRow icon="cloud-download-outline" label="Offline Data" value={`${docs.length} cached`} onPress={() => tap("Offline Data")} />
        <View style={st.rowDiv} />
        <SettingRow icon="language-outline" label="Language" value="English" onPress={() => tap("Language")} />
      </Card>

      {/* ── Privacy & Security ────────────────────────────────────── */}
      <SectionHeader title="Privacy & Security" />
      <Card style={st.settingsCard}>
        <SettingRow icon="shield-checkmark-outline" label="Data Encryption" value="AES-256" onPress={() => tap("Data Encryption")} />
        <View style={st.rowDiv} />
        <SettingRow icon="eye-off-outline" label="AI Processing" value="Consented" onPress={() => tap("AI Processing")} />
        <View style={st.rowDiv} />
        <SettingRow icon="share-outline" label="Active Shares" value="0" onPress={() => tap("Active Shares")} />
        <View style={st.rowDiv} />
        <SettingRow icon="document-lock-outline" label="Audit Log" value={`${timeline.length + 10} events`} onPress={() => tap("Audit Log")} />
        <View style={st.rowDiv} />
        <SettingRow icon="trash-outline" label="Delete All Data" value="" onPress={() => tap("Delete All Data")} danger />
      </Card>

      {/* ── About ─────────────────────────────────────────────────── */}
      <SectionHeader title="About Second Opinion" />
      <Card>
        <Text style={st.about}>Second Opinion helps you organize your medical history, understand your records, and prepare for doctor visits — all on your device.</Text>
        <View style={{ height: S.md }} />
        <Disclaimer />
        <View style={{ height: S.md }} />
        <Text style={st.ver}>Version 1.0.0 · © 2026 Second Opinion Health</Text>
      </Card>

      {/* ── Sign Out ─────────────────────────────────────────────── */}
      {confirmingLogout ? (
        <View style={st.logoutConfirm}>
          <Text style={st.logoutConfirmT}>Are you sure you want to sign out?</Text>
          <View style={st.logoutBtns}>
            <TouchableOpacity style={st.cancelBtn} onPress={() => setConfirmingLogout(false)}>
              <Text style={st.cancelBtnT}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.confirmBtn} onPress={logout}>
              <Text style={st.confirmBtnT}>Yes, Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={st.signOutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={C.err} />
          <Text style={st.signOutT}>Sign Out</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={st.stat}>
      <Text style={st.statV}>{value}</Text>
      <Text style={st.statL}>{label}</Text>
    </View>
  );
}

function IR({ i, l, v }: { i: string; l: string; v: string }) {
  return (
    <View style={ir.r}>
      <Ionicons name={i as any} size={16} color={C.t3} />
      <Text style={ir.l}>{l}</Text>
      <Text style={ir.v} numberOfLines={1}>{v}</Text>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress, danger }: {
  icon: string; label: string; value: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={st.sRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[st.sIconWrap, { backgroundColor: (danger ? C.err : C.pri) + "12" }]}>
        <Ionicons name={icon as any} size={18} color={danger ? C.err : C.pri} />
      </View>
      <Text style={[st.sL, danger && { color: C.err }]}>{label}</Text>
      {value ? <Text style={st.sV}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={C.t3} />
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onToggle }: {
  icon: string; label: string; value: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <View style={st.sRow}>
      <View style={[st.sIconWrap, { backgroundColor: C.pri + "12" }]}>
        <Ionicons name={icon as any} size={18} color={C.pri} />
      </View>
      <Text style={st.sL}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.brd, true: C.priMut }}
        thumbColor={value ? C.pri : C.t3}
      />
    </View>
  );
}

function DarkModeRow() {
  const pref = useStore((s) => s.darkMode);
  const setDarkMode = useStore((s) => s.setDarkMode);
  const opts: { key: DarkModePref; label: string }[] = [
    { key: "system", label: "Auto" },
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
  ];
  return (
    <View style={st.sRow}>
      <View style={[st.sIconWrap, { backgroundColor: C.pri + "12" }]}>
        <Ionicons name="moon-outline" size={18} color={C.pri} />
      </View>
      <Text style={st.sL}>Dark Mode</Text>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {opts.map(o => (
          <TouchableOpacity key={o.key} onPress={() => setDarkMode(o.key)}
            style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
              backgroundColor: pref === o.key ? C.pri : C.priFaint }}>
            <Text style={{ fontSize: 12, color: pref === o.key ? "#fff" : C.t2, fontWeight: "600" }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const ir = StyleSheet.create({
  r: { flexDirection: "row", alignItems: "center", gap: S.sm, paddingVertical: 6 },
  l: { fontSize: F.sm, color: C.t3, width: 76 },
  v: { flex: 1, fontSize: F.sm, fontWeight: "500", color: C.t1 },
});

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  cnt: { padding: S.lg, paddingTop: S.md },

  profileCard: {
    alignItems: "center", backgroundColor: C.card, borderRadius: R.xl,
    padding: S.xl, marginBottom: S.xl, borderWidth: 1, borderColor: C.brdLt, ...shadow,
  },
  avatarWrap: { position: "relative", marginBottom: S.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: C.pri,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: C.priFaint,
  },
  avatarT: { fontSize: 28, fontWeight: "800", color: "#fff" },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.priLt, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: C.card,
  },
  name: { fontSize: F.xl, fontWeight: "700", color: C.t1, textAlign: "center" },
  emailBadge: { fontSize: F.sm, color: C.t3, marginTop: 4, marginBottom: 4 },
  meta: { fontSize: F.sm, color: C.t3, textAlign: "center", marginBottom: S.lg },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: S.md, paddingTop: S.lg,
    borderTopWidth: 1, borderTopColor: C.brdLt, width: "100%",
  },
  stat: { flex: 1, alignItems: "center" },
  statV: { fontSize: F.xl, fontWeight: "700", color: C.pri },
  statL: { fontSize: F.xs, color: C.t3, marginTop: 2, textAlign: "center" },
  statDiv: { width: 1, height: 32, backgroundColor: C.brdLt },

  settingsCard: { padding: 0, overflow: "hidden" },
  sRow: {
    flexDirection: "row", alignItems: "center", gap: S.md,
    paddingVertical: S.md, paddingHorizontal: S.lg,
  },
  sIconWrap: { width: 34, height: 34, borderRadius: R.md, alignItems: "center", justifyContent: "center" },
  sL: { flex: 1, fontSize: F.md, color: C.t1, fontWeight: "500" },
  sV: { fontSize: F.sm, color: C.t3, marginRight: S.xs },
  rowDiv: { height: 1, backgroundColor: C.brdLt, marginLeft: S.lg + 34 + S.md },

  about: { fontSize: F.sm, color: C.t2, lineHeight: 21 },
  ver: { fontSize: F.xs, color: C.t3, textAlign: "center" },

  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: S.sm, paddingVertical: S.lg, marginTop: S.sm,
    backgroundColor: C.errBg, borderRadius: R.lg,
    borderWidth: 1, borderColor: C.err + "30",
  },
  signOutT: { fontSize: F.md, fontWeight: "600", color: C.err },
  logoutConfirm: {
    marginTop: S.sm, backgroundColor: C.errBg, borderRadius: R.lg,
    borderWidth: 1, borderColor: C.err + "30", padding: S.lg, alignItems: "center", gap: S.md,
  },
  logoutConfirmT: { fontSize: F.md, color: C.t1, fontWeight: "500", textAlign: "center" },
  logoutBtns: { flexDirection: "row", gap: S.md, width: "100%" },
  cancelBtn: {
    flex: 1, paddingVertical: S.md, borderRadius: R.md,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.brd,
    alignItems: "center",
  },
  cancelBtnT: { fontSize: F.md, fontWeight: "600", color: C.t2 },
  confirmBtn: {
    flex: 1, paddingVertical: S.md, borderRadius: R.md,
    backgroundColor: C.err, alignItems: "center",
  },
  confirmBtnT: { fontSize: F.md, fontWeight: "600", color: "#fff" },
});
