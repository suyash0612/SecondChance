import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, S, F, R } from "../lib/theme";

interface DeleteConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  visible,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={st.overlay}>
        <View style={st.modal}>
          <View style={st.header}>
            <Ionicons name="alert-circle-outline" size={28} color={C.err} />
            <Text style={st.title}>{title}</Text>
          </View>
          <Text style={st.message}>{message}</Text>
          {itemName && <Text style={st.itemName}>{itemName}</Text>}
          <View style={st.actions}>
            <TouchableOpacity style={st.cancelBtn} onPress={onCancel}>
              <Text style={st.cancelBtnT}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.confirmBtn} onPress={onConfirm}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={st.confirmBtnT}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    width: "85%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    marginBottom: S.md,
  },
  title: {
    fontSize: F.lg,
    fontWeight: "700",
    color: C.err,
    flex: 1,
  },
  message: {
    fontSize: F.sm,
    color: C.t2,
    marginBottom: S.sm,
    lineHeight: 20,
  },
  itemName: {
    fontSize: F.sm,
    fontWeight: "600",
    color: C.t1,
    backgroundColor: C.bgAlt,
    borderRadius: R.sm,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
    marginBottom: S.lg,
  },
  actions: {
    flexDirection: "row",
    gap: S.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: S.md,
    borderRadius: R.md,
    backgroundColor: C.bgAlt,
    alignItems: "center",
  },
  cancelBtnT: {
    fontSize: F.md,
    fontWeight: "600",
    color: C.t1,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: S.md,
    borderRadius: R.md,
    backgroundColor: C.err,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: S.xs,
  },
  confirmBtnT: {
    fontSize: F.md,
    fontWeight: "600",
    color: "#fff",
  },
});
