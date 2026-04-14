import { Alert } from "react-native";

export function confirmDelete(
  itemName: string,
  onConfirm: () => void,
  itemType: string = "item"
) {
  Alert.alert(
    `Delete ${itemType}?`,
    `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Delete",
        onPress: onConfirm,
        style: "destructive",
      },
    ]
  );
}

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = "Confirm",
  isDestructive: boolean = false
) {
  Alert.alert(title, message, [
    { text: "Cancel", onPress: () => {}, style: "cancel" },
    {
      text: confirmText,
      onPress: onConfirm,
      style: isDestructive ? "destructive" : "default",
    },
  ]);
}
