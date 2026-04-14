import { useColorScheme } from "react-native";
import { useStore } from "./store";
import { C, CD } from "./theme";

export function useTheme() {
  const pref = useStore((s) => s.darkMode);
  const system = useColorScheme();
  const dark = pref === "dark" || (pref === "system" && system === "dark");
  return { colors: dark ? CD : C, dark };
}
