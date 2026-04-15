import { useRef } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

// Global ref to toast manager
let globalToastRef: any = null;

export function setGlobalToastRef(ref: any) {
  globalToastRef = ref;
}

export function useToast() {
  return {
    show: (options: ToastOptions) => {
      if (globalToastRef) {
        globalToastRef.show({
          message: options.message,
          type: options.type || "info",
          duration: options.duration,
          action: options.action,
        });
      }
    },
    success: (message: string, duration?: number) => {
      if (globalToastRef) {
        globalToastRef.show({ message, type: "success", duration });
      }
    },
    error: (message: string, duration?: number) => {
      if (globalToastRef) {
        globalToastRef.show({ message, type: "error", duration });
      }
    },
    warning: (message: string, duration?: number) => {
      if (globalToastRef) {
        globalToastRef.show({ message, type: "warning", duration });
      }
    },
    info: (message: string, duration?: number) => {
      if (globalToastRef) {
        globalToastRef.show({ message, type: "info", duration });
      }
    },
  };
}
