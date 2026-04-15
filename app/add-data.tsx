import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../lib/store";
import { Card, Badge } from "../components/UI";
import { C, S, F, R, shadow, colorOpacity } from "../lib/theme";
import type { Medication, Condition, Allergy } from "../lib/types";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "medications" | "conditions" | "allergies";

// ─────────────────────────────────────────────────────────────────────────────
//  Small helpers
// ─────────────────────────────────────────────────────────────────────────────

function PillSelector<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={ps.row}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[ps.pill, selected === o.value && ps.pillSel]}
          onPress={() => onSelect(o.value)}
          activeOpacity={0.75}
        >
          <Text style={[ps.label, selected === o.value && ps.labelSel]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const ps = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: S.sm,
    marginBottom: S.md,
  },
  pill: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm - 2,
    borderRadius: R.pill,
    backgroundColor: C.bgAlt,
    borderWidth: 1,
    borderColor: C.brd,
  },
  pillSel: { backgroundColor: C.pri, borderColor: C.pri },
  label: { fontSize: F.sm, fontWeight: "500", color: C.t2 },
  labelSel: { color: "#fff" },
});

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={fl.label}>
      {label}
      {required && <Text style={fl.req}> *</Text>}
    </Text>
  );
}

const fl = StyleSheet.create({
  label: { fontSize: F.sm, fontWeight: "600", color: C.t2, marginBottom: S.xs, marginTop: S.md },
  req: { color: C.err },
});

function FieldInput({
  value,
  onChangeText,
  placeholder,
  error,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.t3}
        style={[inp.base, !!error && inp.errBorder]}
      />
      {!!error && <Text style={inp.errText}>{error}</Text>}
    </>
  );
}

const inp = StyleSheet.create({
  base: {
    backgroundColor: C.card,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.brd,
    paddingHorizontal: S.md,
    paddingVertical: Platform.OS === "ios" ? S.md : S.sm,
    fontSize: F.md,
    color: C.t1,
    minHeight: 44,
  },
  errBorder: { borderColor: C.err },
  errText: { fontSize: F.xs, color: C.err, marginTop: S.xs },
});

function SuccessBanner() {
  return (
    <View style={sb.wrap}>
      <Ionicons name="checkmark-circle" size={18} color={C.ok} />
      <Text style={sb.text}>Added successfully!</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.okBg,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    marginBottom: S.md,
    gap: S.sm,
    borderWidth: 1,
    borderColor: C.ok,
  },
  text: { fontSize: F.md, color: C.ok, fontWeight: "600" },
});

function DeleteBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={db.btn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="trash-outline" size={18} color={C.err} />
    </TouchableOpacity>
  );
}

const db = StyleSheet.create({
  btn: {
    padding: S.xs,
    borderRadius: R.md,
    backgroundColor: C.errBg,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
//  Medications Tab
// ─────────────────────────────────────────────────────────────────────────────

function MedicationsTab() {
  const meds = useStore((s) => s.meds);
  const addMedManual = useStore((s) => s.addMedManual);
  const deleteMed = useStore((s) => s.deleteMed);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [status, setStatus] = useState<"active" | "discontinued">("active");
  const [startDate, setStartDate] = useState("");
  const [prescriber, setPrescriber] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setName(""); setDosage(""); setFrequency(""); setStatus("active");
    setStartDate(""); setPrescriber(""); setReason("");
    setErrors({});
  };

  const handleAdd = () => {
    const errs: { name?: string } = {};
    if (!name.trim()) errs.name = "Medication name is required.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    addMedManual({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      status,
      startDate: startDate.trim() || new Date().toISOString().split("T")[0],
      prescriber: prescriber.trim() || undefined,
      reason: reason.trim() || undefined,
    });

    reset();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <>
      {success && <SuccessBanner />}
      <Card>
        <Text style={st.formTitle}>Add Medication</Text>

        <FieldLabel label="Medication Name" required />
        <FieldInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Metformin"
          error={errors.name}
        />

        <FieldLabel label="Dosage" />
        <FieldInput value={dosage} onChangeText={setDosage} placeholder="e.g. 500mg" />

        <FieldLabel label="Frequency" />
        <FieldInput value={frequency} onChangeText={setFrequency} placeholder="e.g. Once daily" />

        <FieldLabel label="Status" required />
        <PillSelector
          options={[
            { label: "Active", value: "active" },
            { label: "Discontinued", value: "discontinued" },
          ]}
          selected={status}
          onSelect={setStatus}
        />

        <FieldLabel label="Start Date (YYYY-MM-DD)" />
        <FieldInput value={startDate} onChangeText={setStartDate} placeholder="e.g. 2024-01-15" />

        <FieldLabel label="Prescriber" />
        <FieldInput value={prescriber} onChangeText={setPrescriber} placeholder="e.g. Dr. Sarah Chen" />

        <FieldLabel label="Reason" />
        <FieldInput value={reason} onChangeText={setReason} placeholder="e.g. Type 2 Diabetes" />

        <TouchableOpacity style={st.addBtn} onPress={handleAdd} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: S.sm }} />
          <Text style={st.addBtnText}>Add Medication</Text>
        </TouchableOpacity>
      </Card>

      {meds.length > 0 && (
        <>
          <Text style={st.listHeading}>Current Medications ({meds.length})</Text>
          {meds.map((m) => (
            <Card key={m.id} style={st.itemCard}>
              <View style={st.itemRow}>
                <View style={st.itemInfo}>
                  <Text style={st.itemName}>{m.name}</Text>
                  <Text style={st.itemSub}>
                    {[m.dosage, m.frequency].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <View style={st.itemRight}>
                  <Badge
                    label={m.status}
                    color={m.status === "active" ? C.ok : C.t3}
                    small
                  />
                  <DeleteBtn onPress={() => deleteMed(m.id)} />
                </View>
              </View>
            </Card>
          ))}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Conditions Tab
// ─────────────────────────────────────────────────────────────────────────────

function ConditionsTab() {
  const conditions = useStore((s) => s.conditions);
  const addConditionManual = useStore((s) => s.addConditionManual);
  const deleteCondition = useStore((s) => s.deleteCondition);

  const [name, setName] = useState("");
  const [icd10, setIcd10] = useState("");
  const [status, setStatus] = useState<"active" | "managed" | "resolved">("active");
  const [onsetDate, setOnsetDate] = useState("");
  const [diagnosedBy, setDiagnosedBy] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setName(""); setIcd10(""); setStatus("active"); setOnsetDate(""); setDiagnosedBy("");
    setErrors({});
  };

  const handleAdd = () => {
    const errs: { name?: string } = {};
    if (!name.trim()) errs.name = "Condition name is required.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    addConditionManual({
      name: name.trim(),
      icd10: icd10.trim() || undefined,
      status,
      onsetDate: onsetDate.trim() || undefined,
      diagnosedBy: diagnosedBy.trim() || undefined,
    });

    reset();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const statusColor = (s: Condition["status"]) => {
    if (s === "active") return C.err;
    if (s === "managed") return C.warn;
    return C.ok;
  };

  return (
    <>
      {success && <SuccessBanner />}
      <Card>
        <Text style={st.formTitle}>Add Condition</Text>

        <FieldLabel label="Condition Name" required />
        <FieldInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Type 2 Diabetes"
          error={errors.name}
        />

        <FieldLabel label="ICD-10 Code (optional)" />
        <FieldInput value={icd10} onChangeText={setIcd10} placeholder="e.g. E11.9" />

        <FieldLabel label="Status" required />
        <PillSelector
          options={[
            { label: "Active", value: "active" },
            { label: "Managed", value: "managed" },
            { label: "Resolved", value: "resolved" },
          ]}
          selected={status}
          onSelect={setStatus}
        />

        <FieldLabel label="Onset Date (YYYY-MM-DD)" />
        <FieldInput value={onsetDate} onChangeText={setOnsetDate} placeholder="e.g. 2021-06" />

        <FieldLabel label="Diagnosed By" />
        <FieldInput value={diagnosedBy} onChangeText={setDiagnosedBy} placeholder="e.g. Dr. Aisha Patel" />

        <TouchableOpacity style={st.addBtn} onPress={handleAdd} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: S.sm }} />
          <Text style={st.addBtnText}>Add Condition</Text>
        </TouchableOpacity>
      </Card>

      {conditions.length > 0 && (
        <>
          <Text style={st.listHeading}>Current Conditions ({conditions.length})</Text>
          {conditions.map((c) => (
            <Card key={c.id} style={st.itemCard}>
              <View style={st.itemRow}>
                <View style={st.itemInfo}>
                  <Text style={st.itemName}>{c.name}</Text>
                  {c.icd10 ? <Text style={st.itemSub}>ICD-10: {c.icd10}</Text> : null}
                </View>
                <View style={st.itemRight}>
                  <Badge label={c.status} color={statusColor(c.status)} small />
                  <DeleteBtn onPress={() => deleteCondition(c.id)} />
                </View>
              </View>
            </Card>
          ))}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Allergies Tab
// ─────────────────────────────────────────────────────────────────────────────

function AllergiesTab() {
  const allergies = useStore((s) => s.allergies);
  const addAllergyManual = useStore((s) => s.addAllergyManual);
  const deleteAllergy = useStore((s) => s.deleteAllergy);

  const [substance, setSubstance] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [errors, setErrors] = useState<{ substance?: string; reaction?: string }>({});
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setSubstance(""); setReaction(""); setSeverity("mild"); setErrors({});
  };

  const handleAdd = () => {
    const errs: { substance?: string; reaction?: string } = {};
    if (!substance.trim()) errs.substance = "Substance is required.";
    if (!reaction.trim()) errs.reaction = "Reaction is required.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    addAllergyManual({
      substance: substance.trim(),
      reaction: reaction.trim(),
      severity,
    });

    reset();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const severityColor = (s: Allergy["severity"]) => {
    if (s === "severe") return C.err;
    if (s === "moderate") return C.warn;
    return C.ok;
  };

  return (
    <>
      {success && <SuccessBanner />}
      <Card>
        <Text style={st.formTitle}>Add Allergy</Text>

        <FieldLabel label="Substance" required />
        <FieldInput
          value={substance}
          onChangeText={setSubstance}
          placeholder="e.g. Penicillin"
          error={errors.substance}
        />

        <FieldLabel label="Reaction" required />
        <FieldInput
          value={reaction}
          onChangeText={setReaction}
          placeholder="e.g. Hives, throat swelling"
          error={errors.reaction}
        />

        <FieldLabel label="Severity" required />
        <PillSelector
          options={[
            { label: "Mild", value: "mild" },
            { label: "Moderate", value: "moderate" },
            { label: "Severe", value: "severe" },
          ]}
          selected={severity}
          onSelect={setSeverity}
        />

        <TouchableOpacity style={st.addBtn} onPress={handleAdd} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: S.sm }} />
          <Text style={st.addBtnText}>Add Allergy</Text>
        </TouchableOpacity>
      </Card>

      {allergies.length > 0 && (
        <>
          <Text style={st.listHeading}>Current Allergies ({allergies.length})</Text>
          {allergies.map((a) => (
            <Card key={a.id} style={st.itemCard}>
              <View style={st.itemRow}>
                <View style={st.itemInfo}>
                  <Text style={st.itemName}>{a.substance}</Text>
                  <Text style={st.itemSub}>{a.reaction}</Text>
                </View>
                <View style={st.itemRight}>
                  <Badge label={a.severity} color={severityColor(a.severity)} small />
                  <DeleteBtn onPress={() => deleteAllergy(a.id)} />
                </View>
              </View>
            </Card>
          ))}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Screen
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { key: "medications", label: "Medications", icon: "flask-outline" },
  { key: "conditions", label: "Conditions", icon: "medical-outline" },
  { key: "allergies", label: "Allergies", icon: "warning-outline" },
];

export default function AddData() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("medications");

  const renderTab = useCallback(() => {
    if (activeTab === "medications") return <MedicationsTab />;
    if (activeTab === "conditions") return <ConditionsTab />;
    return <AllergiesTab />;
  }, [activeTab]);

  return (
    <KeyboardAvoidingView
      style={st.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={st.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={C.tInv} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Add Health Data</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab selector */}
      <View style={st.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[st.tabItem, activeTab === tab.key && st.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? C.pri : C.t3}
              style={{ marginBottom: 2 }}
            />
            <Text style={[st.tabLabel, activeTab === tab.key && st.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderTab()}
        <View style={{ height: S.xxxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.pri,
    paddingTop: Platform.OS === "ios" ? 54 : 36,
    paddingBottom: S.lg,
    paddingHorizontal: S.lg,
    ...shadow,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    fontSize: F.lg,
    fontWeight: "700",
    color: C.tInv,
    letterSpacing: -0.3,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.brd,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: S.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: C.pri,
  },
  tabLabel: {
    fontSize: F.xs,
    fontWeight: "600",
    color: C.t3,
  },
  tabLabelActive: {
    color: C.pri,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: S.lg,
    paddingTop: S.xl,
  },
  formTitle: {
    fontSize: F.lg,
    fontWeight: "700",
    color: C.t1,
    letterSpacing: -0.3,
    marginBottom: S.sm,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.pri,
    borderRadius: R.md,
    paddingVertical: S.md,
    marginTop: S.lg,
    minHeight: 48,
    ...shadow,
  },
  addBtnText: {
    fontSize: F.md,
    fontWeight: "700",
    color: "#fff",
  },
  listHeading: {
    fontSize: F.md,
    fontWeight: "700",
    color: C.t1,
    marginBottom: S.md,
    marginTop: S.sm,
  },
  itemCard: {
    marginBottom: S.sm,
    paddingVertical: S.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemInfo: {
    flex: 1,
    marginRight: S.md,
  },
  itemName: {
    fontSize: F.md,
    fontWeight: "600",
    color: C.t1,
    marginBottom: 2,
  },
  itemSub: {
    fontSize: F.sm,
    color: C.t2,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
  },
});
