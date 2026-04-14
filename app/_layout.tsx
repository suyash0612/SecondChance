import React, { useEffect, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useColorScheme } from "react-native";
import { useStore } from "../lib/store";
import { LIGHT_VALS, DARK_VALS, buildThemeCSS } from "../lib/theme";

export default function RootLayout() {
  const authUser = useStore((s) => s.authUser);
  const accounts = useStore((s) => s.accounts);
  const darkModePref = useStore((s) => s.darkMode);
  const router = useRouter();
  const segments = useSegments();
  const system = useColorScheme();
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  // ── Inject CSS custom properties so every StyleSheet reacts to theme changes ──
  useEffect(() => {
    if (typeof document === "undefined") return;
    const dark =
      darkModePref === "dark" ||
      (darkModePref === "system" && system === "dark");
    const css = buildThemeCSS(dark ? DARK_VALS : LIGHT_VALS);

    if (!styleTagRef.current) {
      const tag = document.createElement("style");
      tag.id = "so-theme";
      document.head.appendChild(tag);
      styleTagRef.current = tag;
    }
    styleTagRef.current.textContent = css;

    // Also set color-scheme on root so browser chrome (scrollbars etc) matches
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [darkModePref, system]);

  // ── Auth guard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const inTabs = segments[0] === "(tabs)";
    const inAuth = segments[0] === "login" || segments[0] === "signup";
    const inOnboarding = segments[0] === "onboarding";

    if (!authUser && inTabs) {
      router.replace("/login");
    } else if (authUser && inAuth) {
      const acc = accounts.find((a) => a.email === authUser.email);
      if (acc && acc.hasSeenOnboarding === false) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)");
      }
    } else if (authUser && inOnboarding) {
      const acc = accounts.find((a) => a.email === authUser.email);
      if (acc && acc.hasSeenOnboarding === true) {
        router.replace("/(tabs)");
      }
    }
  }, [authUser, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="upload" options={{ presentation: "modal" }} />
      <Stack.Screen name="summary" options={{ presentation: "modal" }} />
      <Stack.Screen name="vitals" options={{ presentation: "modal" }} />
      <Stack.Screen name="appointments" options={{ presentation: "modal" }} />
      <Stack.Screen name="emergency" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-data" options={{ presentation: "modal" }} />
      <Stack.Screen name="record/[id]" />
      <Stack.Screen name="event/[id]" />
    </Stack>
  );
}
