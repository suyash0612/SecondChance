import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, S, F, R } from "../lib/theme";
import { colorOpacity } from "../lib/theme";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

interface ToastRef {
  show: (toast: Omit<Toast, "id">) => void;
}

const TOAST_CONFIG: Record<ToastType, { bg: string; border: string; icon: string; color: string }> = {
  success: { bg: C.okBg, border: colorOpacity("ok", 40), icon: "checkmark-circle", color: C.ok },
  error: { bg: C.errBg, border: colorOpacity("err", 40), icon: "close-circle", color: C.err },
  warning: { bg: C.warnBg, border: colorOpacity("warn", 40), icon: "warning", color: C.warn },
  info: { bg: C.infoBg, border: colorOpacity("info", 40), icon: "information-circle", color: C.info },
};

export const ToastManager = React.forwardRef<ToastRef>((_, ref) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  React.useImperativeHandle(ref, () => ({
    show: (toast: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random()}`;
      const duration = toast.duration ?? 4000;
      setToasts((prev) => [...prev, { ...toast, id, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
  }));

  return (
    <View style={st.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
      ))}
    </View>
  );
});

ToastManager.displayName = "ToastManager";

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = TOAST_CONFIG[toast.type];
  const anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <Animated.View style={[st.toast, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }] as any}>
      <View style={[st.toastContent, { backgroundColor: config.bg, borderColor: config.border }]}>
        <Ionicons name={config.icon as any} size={20} color={config.color} style={{ marginRight: S.sm }} />
        <View style={{ flex: 1 }}>
          <Text style={[st.toastText, { color: C.t1 }]} numberOfLines={2}>
            {toast.message}
          </Text>
        </View>
        {toast.action ? (
          <TouchableOpacity onPress={toast.action.onPress} style={{ marginLeft: S.sm }}>
            <Text style={[st.toastAction, { color: config.color }]}>{toast.action.label}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={18} color={C.t3} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  container: { position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "box-none", zIndex: 999 },
  toast: { paddingHorizontal: S.lg, paddingTop: S.lg, pointerEvents: "auto" },
  toastContent: { flexDirection: "row", alignItems: "center", paddingHorizontal: S.lg, paddingVertical: S.md, borderRadius: R.md, borderWidth: 1, marginBottom: S.md, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  toastText: { fontSize: F.sm, fontWeight: "500", flex: 1 },
  toastAction: { fontSize: F.sm, fontWeight: "600" },
});

export default ToastManager;
